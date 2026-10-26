"""Vibi API Speech-to-Text tool powered by ElevenLabs Scribe v2 (https://api.vibi.pro/v1/speech-to-text)."""

from __future__ import annotations

import json
import os
import time
from pathlib import Path
from typing import Any

import requests

from tools.audio._speech_api import SpeechAPI
from tools.base_tool import ToolResult, ToolStatus, ToolTier


class VibiSTT(SpeechAPI):
    """Asynchronous Speech-to-Text via Vibi API (ElevenLabs Scribe v2) with word timestamps, speaker diarization, and SRT export."""

    name = "vibi_stt"
    tier = ToolTier.CORE
    capability = "analysis"
    capabilities = [
        "speech_to_text",
        "speaker_diarization",
        "word_timestamps",
        "srt_export",
    ]
    provider = "vibi"
    hosting_provider = "vibi.pro"
    credential = "VIBI_API_KEY"
    dependencies = ["env:VIBI_API_KEY"]
    install_instructions = "Configure VIBI_API_KEY in .env (or .vibi_api_key) from https://vibi.pro."

    API_BASE = "https://api.vibi.pro"
    USER_AGENT = "Mozilla/5.0 (Windows NT 10.0; Win64; x64) OpenMontage-VibiSTT/1.0"

    input_schema = {
        "type": "object",
        "required": ["audio_path"],
        "properties": {
            "audio_path": {
                "type": "string",
                "description": "Path to audio/video file to transcribe (max 90MB).",
            },
            "output_path": {
                "type": "string",
                "description": "Path to save the transcript JSON output.",
            },
            "language_code": {
                "type": "string",
                "default": "vi",
                "description": "ISO-639-1 or ISO-639-3 language code (e.g. 'vi', 'en'). Required by Vibi API.",
            },
            "timestamps_granularity": {
                "type": "string",
                "default": "word",
                "enum": ["none", "word", "character"],
            },
            "diarize": {
                "type": "boolean",
                "default": False,
                "description": "Enable speaker diarization (speaker_0, speaker_1, ...).",
            },
            "num_speakers": {
                "type": "integer",
                "minimum": 1,
                "maximum": 32,
            },
            "tag_audio_events": {
                "type": "boolean",
                "default": True,
            },
            "no_verbatim": {
                "type": "boolean",
                "default": False,
                "description": "Remove filler words and false starts on scribe_v2.",
            },
            "keyterms": {
                "type": "array",
                "items": {"type": "string"},
                "description": "Terms to bias recognition toward (proper nouns, jargon).",
            },
            "additional_formats": {
                "type": "array",
                "items": {
                    "type": "string",
                    "enum": ["srt", "txt", "docx", "html", "pdf", "segmented_json"],
                },
                "default": ["srt"],
            },
        },
    }

    @classmethod
    def _resolve_key(cls) -> str | None:
        key = os.getenv("VIBI_API_KEY")
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
        return ToolStatus.AVAILABLE if self._resolve_key() else ToolStatus.UNAVAILABLE

    def execute(self, inputs: dict[str, Any]) -> ToolResult:
        from jsonschema import validate

        try:
            validate(inputs, self.input_schema)
            key = self._resolve_key()
            if not key:
                raise ValueError(self.install_instructions)
            return self.generate(inputs, key)
        except Exception as exc:
            return ToolResult(
                success=False, error=f"{self.name}: {type(exc).__name__}: {exc}"
            )

    def generate(self, inputs: dict[str, Any], key: str) -> ToolResult:
        audio_file = Path(inputs["audio_path"])
        if not audio_file.is_file():
            raise FileNotFoundError(f"Audio file not found: {audio_file}")

        lang = inputs.get("language_code") or inputs.get("language") or "vi"
        granularity = inputs.get("timestamps_granularity", "word")
        form_fields: list[tuple[str, str]] = [
            ("language_code", str(lang)),
            ("timestamps_granularity", str(granularity)),
            ("tag_audio_events", "true" if inputs.get("tag_audio_events", True) else "false"),
            ("no_verbatim", "true" if inputs.get("no_verbatim", False) else "false"),
        ]
        if inputs.get("diarize"):
            form_fields.append(("diarize", "true"))
            if inputs.get("num_speakers") is not None:
                form_fields.append(("num_speakers", str(int(inputs["num_speakers"]))))
        for term in inputs.get("keyterms") or []:
            form_fields.append(("keyterms", str(term)))
        for fmt in inputs.get("additional_formats", ["srt"]):
            form_fields.append(("additional_formats", str(fmt)))

        headers = {"xi-api-key": key, "User-Agent": self.USER_AGENT}
        with audio_file.open("rb") as fh:
            submit_resp = requests.post(
                f"{self.API_BASE}/v1/speech-to-text",
                headers=headers,
                data=form_fields,
                files={"file": (audio_file.name, fh)},
                timeout=300,
            )
        submit_resp.raise_for_status()
        submitted = submit_resp.json()
        task_id = submitted.get("task_id") or submitted.get("id")
        if not task_id:
            raise ValueError(f"Vibi STT did not return task_id: {submitted}")

        deadline = time.monotonic() + 600.0
        task_data: dict[str, Any] = {}
        while True:
            if time.monotonic() >= deadline:
                raise TimeoutError(f"Vibi STT task {task_id} timed out after 600s")
            time.sleep(2.0)
            poll_resp = requests.get(
                f"{self.API_BASE}/v1/speech-to-text/{task_id}",
                headers=headers,
                timeout=60,
            )
            poll_resp.raise_for_status()
            task_data = poll_resp.json()
            status = task_data.get("status")
            if status == "completed":
                break
            if status == "failed":
                raise RuntimeError(
                    f"Vibi STT task {task_id} failed: {task_data.get('detail_error') or task_data.get('error')}"
                )

        body = task_data.get("result") or task_data
        if "text" not in body:
            raise ValueError("Vibi STT response has no text")

        out = Path(inputs.get("output_path") or "vibi_transcript.json")
        out.parent.mkdir(parents=True, exist_ok=True)
        out.write_text(json.dumps(body, ensure_ascii=False, indent=2), encoding="utf-8")
        artifacts = [str(out)]

        srt_path_str = None
        for fmt_item in body.get("additional_formats") or []:
            if isinstance(fmt_item, dict) and fmt_item.get("file_extension") == "srt" and fmt_item.get("content"):
                srt_out = out.with_suffix(".srt")
                srt_out.write_text(fmt_item["content"], encoding="utf-8")
                artifacts.append(str(srt_out))
                srt_path_str = str(srt_out)

        return ToolResult(
            success=True,
            data={
                **body,
                "provider": self.provider,
                "hosting_provider": self.hosting_provider,
                "model": "scribe_v2",
                "task_id": task_id,
                "output": str(out),
                "srt_path": srt_path_str,
                "cost_status": "unquoted",
            },
            artifacts=artifacts,
            model="scribe_v2",
            cost_usd=None,
        )

