"""Vibi API text-to-speech & multi-speaker dialogue provider tool (https://api.vibi.pro).

Supports ElevenLabs, MiniMax (speech-2.8-hd / speech-2.8-turbo + cloned voices),
and CapCut system voices through a single VIBI_API_KEY, with native SRT transcript
export and word-level timestamp alignment for Remotion <CaptionOverlay>.
"""

from __future__ import annotations

import json
import os
import re
import time
import wave
from pathlib import Path
from typing import Any

from tools.base_tool import (
    BaseTool,
    Determinism,
    ExecutionMode,
    ResourceProfile,
    RetryPolicy,
    ToolResult,
    ToolRuntime,
    ToolStability,
    ToolStatus,
    ToolTier,
)


class VibiTTS(BaseTool):
    """Unified Vibi API TTS & Dialogue tool (ElevenLabs, MiniMax, CapCut)."""

    name = "vibi_tts"
    version = "0.1.0"
    tier = ToolTier.VOICE
    capability = "tts"
    provider = "vibi"
    hosting_provider = "vibi.pro"
    stability = ToolStability.BETA
    execution_mode = ExecutionMode.ASYNC
    determinism = Determinism.STOCHASTIC
    runtime = ToolRuntime.API

    dependencies = ["env:VIBI_API_KEY"]
    install_instructions = (
        "Set the VIBI_API_KEY environment variable in .env (or .vibi_api_key):\n"
        "  VIBI_API_KEY=sk_your_vibi_key\n"
        "Get a key at https://vibi.pro"
    )
    fallback = "elevenlabs_tts"
    fallback_tools = ["elevenlabs_tts", "openai_tts", "piper_tts"]
    agent_skills = ["vibi-tts-chrome-pipeline", "text-to-speech", "elevenlabs"]

    capabilities = [
        "text_to_speech",
        "voice_selection",
        "voice_cloning",
        "multilingual",
        "word_timestamps",
        "dialogue_synthesis",
    ]
    supports = {
        "voice_cloning": True,
        "multilingual": True,
        "offline": False,
        "native_audio": True,
        "word_timestamps": True,
        "multi_speaker_dialogue": True,
    }
    best_for = [
        "Vietnamese and multilingual narration with exact SRT subtitle sync",
        "cloned MiniMax Speech 2.8 HD voices and ElevenLabs Multilingual v2 voices",
        "multi-speaker dialogue scripts and CapCut voice library narration",
    ]
    not_good_for = [
        "fully offline production",
    ]

    API_BASE = "https://api.vibi.pro"
    USER_AGENT = "Mozilla/5.0 (Windows NT 10.0; Win64; x64) OpenMontage-VibiTTS/1.0"
    DEFAULT_ELEVENLABS_VOICE_ID = "rv30Fd6w5bnbL0kHzWlr"  # Aria
    DEFAULT_MINIMAX_VOICE_ID = "1ad2682d-1c78-4bb2-8061-b7cc216362c9"
    DEFAULT_CAPCUT_VOICE_ID = "7036989371643923969"

    input_schema = {
        "type": "object",
        "required": ["text"],
        "properties": {
            "text": {
                "type": "string",
                "description": (
                    "Text to convert to speech. For multi-speaker dialogue (/v1/dialogue), "
                    "format each turn as 'SpeakerName: text...'."
                ),
            },
            "voice_id": {
                "type": "string",
                "description": (
                    "Voice ID for the selected engine (ElevenLabs voice_id, MiniMax numeric/uniq_id/cloned UUID, "
                    "or CapCut voice_id). Defaults to _tools/vibi_tts.json if present."
                ),
            },
            "vibi_provider": {
                "type": "string",
                "enum": ["elevenlabs", "minimax", "capcut"],
                "description": (
                    "Underlying TTS engine on Vibi API: 'elevenlabs', 'minimax', or 'capcut'. "
                    "Auto-detected from model_id or _tools/vibi_tts.json when omitted."
                ),
            },
            "model_id": {
                "type": "string",
                "default": "speech-2.8-hd",
                "enum": [
                    "speech-2.8-hd",
                    "speech-2.8-turbo",
                    "eleven_multilingual_v2",
                    "eleven_v3",
                    "eleven_turbo_v2_5",
                    "eleven_flash_v2_5",
                    "capcut",
                ],
                "description": "TTS model ID (MiniMax, ElevenLabs, or 'capcut').",
            },
            "language_code": {
                "type": "string",
                "description": (
                    "Language code ('vi', 'en' for ElevenLabs/CapCut) or full name "
                    "('Vietnamese', 'English' for MiniMax). Normalized automatically."
                ),
            },
            "stability": {
                "type": "number",
                "default": 0.5,
                "minimum": 0,
                "maximum": 1,
                "description": "[ElevenLabs] Stability (0.0 - 1.0)",
            },
            "similarity_boost": {
                "type": "number",
                "default": 0.75,
                "minimum": 0,
                "maximum": 1,
                "description": "[ElevenLabs] Similarity boost (0.0 - 1.0)",
            },
            "style": {
                "type": "number",
                "default": 0.0,
                "minimum": 0,
                "maximum": 1,
                "description": "[ElevenLabs] Style exaggeration (0.0 - 1.0)",
            },
            "use_speaker_boost": {
                "type": "boolean",
                "default": True,
                "description": "[ElevenLabs] Enable speaker boost",
            },
            "speed": {
                "type": "number",
                "default": 1.0,
                "minimum": 0.5,
                "maximum": 2.0,
                "description": "Speaking speed (ElevenLabs: 0.7-1.2; MiniMax & CapCut: 0.5-2.0)",
            },
            "pitch": {
                "type": "integer",
                "default": 0,
                "minimum": -12,
                "maximum": 12,
                "description": "[MiniMax & CapCut] Pitch adjustment (-12 to 12, default 0)",
            },
            "vol": {
                "type": "number",
                "default": 1.0,
                "minimum": 0.01,
                "maximum": 10.0,
                "description": "[MiniMax] Volume (0.01 - 10, default 1.0)",
            },
            "export_transcript": {
                "type": "boolean",
                "default": True,
                "description": "Generate .srt transcript alongside audio (default True for OpenMontage caption sync).",
            },
            "with_timestamps": {
                "type": "boolean",
                "default": False,
                "description": "Alias for export_transcript; returns word_timestamps and writes <output>.alignment.json.",
            },
            "timestamps": {
                "type": "boolean",
                "default": False,
                "description": "Selector-level alias for word timestamps.",
            },
            "speakers": {
                "type": "object",
                "description": (
                    "Map of speaker_name -> {provider, voice_id, model_id, language_code, voice_settings} "
                    "for multi-speaker synthesis via POST /v1/dialogue."
                ),
            },
            "pause_between_turns": {
                "type": "number",
                "default": 0.0,
                "minimum": 0,
                "maximum": 3,
                "description": "Silence duration between dialogue turns in seconds (0-3).",
            },
            "output_path": {"type": "string"},
            "output_format": {
                "type": "string",
                "default": "mp3_44100_128",
                "enum": ["mp3", "mp3_44100_128", "mp3_44100_192", "pcm_16000", "pcm_24000"],
            },
        },
    }

    resource_profile = ResourceProfile(
        cpu_cores=1, ram_mb=256, vram_mb=0, disk_mb=50, network_required=True
    )
    retry_policy = RetryPolicy(max_retries=1, retryable_errors=["rate_limit", "timeout"])
    idempotency_key_fields = [
        "text",
        "voice_id",
        "vibi_provider",
        "model_id",
        "language_code",
        "stability",
        "similarity_boost",
        "style",
        "use_speaker_boost",
        "speed",
        "pitch",
        "vol",
        "export_transcript",
        "with_timestamps",
        "speakers",
        "pause_between_turns",
        "output_format",
    ]
    side_effects = [
        "writes audio file (and .srt / .alignment.json) to output_path",
        "calls Vibi API (https://api.vibi.pro)",
    ]
    user_visible_verification = [
        "Listen to generated audio and check .srt synchronization",
    ]

    @classmethod
    def _get_api_key(cls) -> str | None:
        key = os.environ.get("VIBI_API_KEY")
        if key and key.strip():
            return key.strip()
        root = Path(__file__).resolve().parent.parent.parent
        for candidate in (root / ".vibi_api_key", root / "_tools" / ".vibi_api_key"):
            if candidate.is_file():
                content = candidate.read_text(encoding="utf-8", errors="ignore").strip()
                if content:
                    return content
        return None

    def get_status(self) -> ToolStatus:
        return ToolStatus.AVAILABLE if self._get_api_key() else ToolStatus.UNAVAILABLE

    def estimate_cost(self, inputs: dict[str, Any]) -> float:
        base = len(inputs.get("text", "")) * 0.0001
        if inputs.get("export_transcript", True) or inputs.get("with_timestamps") or inputs.get("timestamps"):
            base *= 1.15
        return round(base, 4)

    def _load_default_voice_config(self) -> dict[str, Any]:
        root = Path(__file__).resolve().parent.parent.parent
        cfg_path = root / "_tools" / "vibi_tts.json"
        if cfg_path.is_file():
            try:
                return json.loads(cfg_path.read_text(encoding="utf-8"))
            except Exception:
                pass
        return {}

    @staticmethod
    def parse_srt_to_words(srt_text: str) -> list[dict[str, Any]]:
        """Convert Vibi SRT transcript cues into word-level timestamp dicts."""
        words: list[dict[str, Any]] = []
        pattern = re.compile(
            r"(\d{2}):(\d{2}):(\d{2})[,.](\d{3})\s*-->\s*(\d{2}):(\d{2}):(\d{2})[,.](\d{3})\s*\n([\s\S]*?)(?=\n\s*\n|\Z)"
        )
        for match in pattern.finditer(srt_text.strip()):
            h1, m1, s1, ms1, h2, m2, s2, ms2, cue = match.groups()
            start_s = int(h1) * 3600 + int(m1) * 60 + int(s1) + int(ms1) / 1000.0
            end_s = int(h2) * 3600 + int(m2) * 60 + int(s2) + int(ms2) / 1000.0
            tokens = [tok for tok in cue.replace("\n", " ").split() if tok]
            if not tokens:
                continue
            span = max(0.01, end_s - start_s)
            total_chars = sum(len(t) for t in tokens) or len(tokens)
            cursor = start_s
            for idx, tok in enumerate(tokens):
                weight = len(tok) / total_chars
                w_end = end_s if idx == len(tokens) - 1 else cursor + span * weight
                words.append(
                    {
                        "word": tok,
                        "start": round(cursor, 3),
                        "end": round(w_end, 3),
                    }
                )
                cursor = w_end
        return words

    def execute(self, inputs: dict[str, Any]) -> ToolResult:
        api_key = self._get_api_key()
        if not api_key:
            return ToolResult(
                success=False,
                error="No Vibi API key found. " + self.install_instructions,
            )

        start = time.time()
        try:
            result = self._generate(inputs, api_key)
        except Exception as exc:
            return ToolResult(
                success=False,
                error=f"Vibi TTS generation failed: {str(exc).replace(api_key, '[REDACTED]')}",
            )

        result.duration_seconds = round(time.time() - start, 2)
        result.cost_usd = self.estimate_cost(inputs)
        result.data["cost_status"] = "estimated"
        return result

    def _generate(self, inputs: dict[str, Any], api_key: str) -> ToolResult:
        import requests
        from jsonschema import validate

        validate(inputs, self.input_schema)
        text = inputs["text"]
        if not text.strip():
            raise ValueError("Text must not be empty")

        headers = {
            "xi-api-key": api_key,
            "Content-Type": "application/json",
            "User-Agent": self.USER_AGENT,
        }
        want_transcript = bool(
            inputs.get("export_transcript", True)
            or inputs.get("with_timestamps", False)
            or inputs.get("timestamps", False)
        )
        default_cfg = self._load_default_voice_config()

        if inputs.get("speakers"):
            endpoint = f"{self.API_BASE}/v1/dialogue"
            payload: dict[str, Any] = {
                "text": text,
                "speakers": inputs["speakers"],
                "pause_between_turns": float(inputs.get("pause_between_turns", 0.0)),
            }
            vibi_provider = "dialogue"
            voice_id = "multi-speaker"
            model_id = inputs.get("model_id", "speech-2.8-hd")
            voice_settings: dict[str, Any] = {}
        else:
            requested_model = inputs.get("model_id")
            vibi_provider = inputs.get("vibi_provider")
            if not vibi_provider:
                if requested_model and requested_model.startswith("eleven_"):
                    vibi_provider = "elevenlabs"
                elif requested_model == "capcut":
                    vibi_provider = "capcut"
                elif requested_model and requested_model.startswith("speech-"):
                    vibi_provider = "minimax"
                else:
                    vibi_provider = default_cfg.get("provider", "minimax")

            if vibi_provider == "elevenlabs":
                voice_id = inputs.get("voice_id") or self.DEFAULT_ELEVENLABS_VOICE_ID
                model_id = (
                    requested_model
                    if (requested_model and requested_model.startswith("eleven_"))
                    else "eleven_multilingual_v2"
                )
                lang = inputs.get("language_code") or "vi"
                if lang.lower() == "vietnamese":
                    lang = "vi"
                elif lang.lower() == "english":
                    lang = "en"
                voice_settings = {
                    "stability": float(inputs.get("stability", 0.5)),
                    "similarity_boost": float(inputs.get("similarity_boost", 0.75)),
                    "style": float(inputs.get("style", 0.0)),
                    "speed": max(0.7, min(1.2, float(inputs.get("speed", 1.0)))),
                    "use_speaker_boost": bool(inputs.get("use_speaker_boost", True)),
                }
            elif vibi_provider == "capcut":
                voice_id = inputs.get("voice_id") or self.DEFAULT_CAPCUT_VOICE_ID
                model_id = "capcut"
                lang = inputs.get("language_code") or "vi"
                if lang.lower() == "vietnamese":
                    lang = "vi"
                elif lang.lower() == "english":
                    lang = "en"
                voice_settings = {
                    "speed": float(inputs.get("speed", 1.0)),
                    "pitch": int(inputs.get("pitch", 0)),
                }
            else:
                voice_id = (
                    inputs.get("voice_id")
                    or default_cfg.get("voice_id")
                    or self.DEFAULT_MINIMAX_VOICE_ID
                )
                model_id = (
                    requested_model
                    if (requested_model and requested_model.startswith("speech-"))
                    else default_cfg.get("model_id", "speech-2.8-hd")
                )
                lang = inputs.get("language_code") or default_cfg.get("language_code", "Vietnamese")
                if lang == "vi":
                    lang = "Vietnamese"
                elif lang == "en":
                    lang = "English"
                def_vs = default_cfg.get("voice_settings", {})
                voice_settings = {
                    "speed": float(inputs.get("speed", def_vs.get("speed", 1.2))),
                    "pitch": int(inputs.get("pitch", def_vs.get("pitch", 0))),
                    "vol": float(inputs.get("vol", def_vs.get("vol", 1.0))),
                }

            endpoint = f"{self.API_BASE}/v1/text-to-speech/{voice_id}"
            payload = {
                "text": text,
                "model_id": model_id,
                "provider": vibi_provider,
                "language_code": lang,
                "voice_settings": voice_settings,
                "export_transcript": want_transcript,
            }

        submit_resp = requests.post(endpoint, headers=headers, json=payload, timeout=60)
        submit_resp.raise_for_status()
        submitted = submit_resp.json()
        task_id = submitted.get("id") or submitted.get("task_id")
        if not task_id:
            raise ValueError(f"Vibi API did not return a task id: {submitted}")

        deadline = time.monotonic() + 300.0
        task_data: dict[str, Any] = {}
        while True:
            if time.monotonic() >= deadline:
                raise TimeoutError(f"Vibi TTS task {task_id} timed out after 300s")
            time.sleep(2.0)
            poll_resp = requests.get(
                f"{self.API_BASE}/v1/history/{task_id}",
                headers={"xi-api-key": api_key, "User-Agent": self.USER_AGENT},
                timeout=30,
            )
            poll_resp.raise_for_status()
            task_data = poll_resp.json()
            status = task_data.get("status")
            if status == "completed":
                break
            if status == "failed":
                raise RuntimeError(f"Vibi TTS task {task_id} failed: {task_data.get('error')}")

        result_obj = task_data.get("result") or {}
        audio_url = result_obj.get("audio_url") or task_data.get("audio_url")
        if not audio_url:
            raise ValueError(f"Vibi TTS task {task_id} completed without audio_url")

        dl_headers = {"xi-api-key": api_key, "User-Agent": self.USER_AGENT}
        audio_resp = requests.get(audio_url, headers=dl_headers, timeout=120)
        audio_resp.raise_for_status()
        audio_bytes = audio_resp.content
        if not audio_bytes:
            raise ValueError("Vibi API returned empty audio")

        output_format = inputs.get("output_format", "mp3_44100_128")
        ext = "mp3" if "mp3" in output_format else "wav"
        output_path = Path(inputs.get("output_path", f"vibi_tts_output.{ext}"))
        output_path.parent.mkdir(parents=True, exist_ok=True)
        if output_format.startswith("pcm_"):
            with wave.open(str(output_path), "wb") as wav:
                wav.setnchannels(1)
                wav.setsampwidth(2)
                wav.setframerate(int(output_format.split("_")[1]))
                wav.writeframes(audio_bytes)
        else:
            output_path.write_bytes(audio_bytes)

        artifacts = [str(output_path)]
        extra: dict[str, Any] = {
            "vibi_task_id": task_id,
            "vibi_provider": vibi_provider,
            "credits_deducted": task_data.get("credits_deducted"),
            "characters_used": task_data.get("characters_used"),
        }

        srt_link = result_obj.get("srt_url") or next(
            (v for v in result_obj.values() if isinstance(v, str) and v.endswith(".srt")),
            None,
        )
        if srt_link:
            srt_resp = requests.get(srt_link, headers=dl_headers, timeout=60)
            srt_resp.raise_for_status()
            srt_content = srt_resp.content.decode("utf-8-sig", errors="replace")
            srt_path = output_path.with_suffix(".srt")
            srt_path.write_text(srt_content, encoding="utf-8")
            artifacts.append(str(srt_path))
            words = self.parse_srt_to_words(srt_content)
            alignment_path = output_path.with_name(output_path.name + ".alignment.json")
            alignment_path.write_text(
                json.dumps(
                    {"text": text, "srt_path": str(srt_path), "words": words},
                    ensure_ascii=False,
                ),
                encoding="utf-8",
            )
            artifacts.append(str(alignment_path))
            extra.update(
                {
                    "srt_path": str(srt_path),
                    "word_timestamps": words,
                    "alignment_path": str(alignment_path),
                    "alignment_matches_text": True,
                }
            )

        return ToolResult(
            success=True,
            data={
                "provider": self.provider,
                "hosting_provider": self.hosting_provider,
                "model": model_id,
                "voice_id": voice_id,
                "voice_settings": voice_settings,
                "text_length": len(text),
                "output": str(output_path),
                "format": output_format,
                "request_id": task_id,
                **extra,
            },
            artifacts=artifacts,
            model=model_id,
        )

