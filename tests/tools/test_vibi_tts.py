"""Unit tests for VibiTTS (tools/audio/vibi_tts.py) and VibiSTT (tools/analysis/vibi_stt.py)."""

from __future__ import annotations

import json
from unittest.mock import Mock

from tools.analysis.vibi_stt import VibiSTT
from tools.audio.elevenlabs_tts import ElevenLabsTTS
from tools.audio.tts_selector import TTSSelector
from tools.audio.vibi_tts import VibiTTS


def test_vibi_tts_is_separate_from_elevenlabs_and_discovered_by_selector(monkeypatch):
    monkeypatch.setenv("VIBI_API_KEY", "sk_vibi_test")
    monkeypatch.setenv("ELEVENLABS_API_KEY", "el_test")

    vibi = VibiTTS()
    el = ElevenLabsTTS()
    assert vibi.name == "vibi_tts"
    assert el.name == "elevenlabs_tts"
    assert vibi.provider == "vibi"
    assert el.provider == "elevenlabs"

    selector = TTSSelector()
    provider_names = {t.name for t in selector._providers()}
    assert "vibi_tts" in provider_names
    assert "elevenlabs_tts" in provider_names


def test_vibi_tts_generates_audio_and_srt_word_timestamps(monkeypatch, tmp_path):
    monkeypatch.setenv("VIBI_API_KEY", "sk_vibi_test")
    monkeypatch.setattr("time.sleep", lambda _s: None)

    post_resp = Mock(
        raise_for_status=Mock(),
        json=Mock(return_value={"id": "task_123", "status": "pending"}),
    )
    post = Mock(return_value=post_resp)
    monkeypatch.setattr("requests.post", post)

    srt_text = "1\n00:00:00,000 --> 00:00:01,000\nXin chào bạn\n"

    def fake_get(url, **_kwargs):
        if "/v1/history/task_123" in url:
            return Mock(
                raise_for_status=Mock(),
                json=Mock(
                    return_value={
                        "id": "task_123",
                        "status": "completed",
                        "credits_deducted": 12,
                        "characters_used": 12,
                        "result": {
                            "audio_url": "https://api.vibi.pro/audio/task_123.mp3",
                            "srt_url": "https://api.vibi.pro/audio/task_123.srt",
                        },
                    }
                ),
            )
        if url.endswith(".mp3"):
            return Mock(raise_for_status=Mock(), content=b"ID3vibi-mp3")
        if url.endswith(".srt"):
            return Mock(raise_for_status=Mock(), content=srt_text.encode("utf-8"))
        raise AssertionError(f"Unexpected GET {url}")

    monkeypatch.setattr("requests.get", fake_get)
    out = tmp_path / "vibi_out.mp3"

    result = VibiTTS().execute(
        {
            "text": "Xin chào bạn",
            "vibi_provider": "minimax",
            "model_id": "speech-2.8-hd",
            "output_path": str(out),
        }
    )

    assert result.success, result.error
    assert post.call_args.args[0].startswith("https://api.vibi.pro/v1/text-to-speech/")
    assert post.call_args.kwargs["json"]["provider"] == "minimax"
    assert post.call_args.kwargs["json"]["export_transcript"] is True
    assert out.read_bytes() == b"ID3vibi-mp3"
    assert (tmp_path / "vibi_out.srt").read_text(encoding="utf-8") == srt_text
    assert [w["word"] for w in result.data["word_timestamps"]] == ["Xin", "chào", "bạn"]
    assert result.data["hosting_provider"] == "vibi.pro"


def test_vibi_tts_dialogue_endpoint(monkeypatch, tmp_path):
    monkeypatch.setenv("VIBI_API_KEY", "sk_vibi_test")
    monkeypatch.setattr("time.sleep", lambda _s: None)

    post = Mock(
        return_value=Mock(
            raise_for_status=Mock(),
            json=Mock(return_value={"id": "dlg_99", "status": "pending"}),
        )
    )
    monkeypatch.setattr("requests.post", post)

    def fake_get(url, **_kwargs):
        if "/v1/history/dlg_99" in url:
            return Mock(
                raise_for_status=Mock(),
                json=Mock(
                    return_value={
                        "id": "dlg_99",
                        "status": "completed",
                        "result": {"audio_url": "https://api.vibi.pro/audio/dlg_99.mp3"},
                    }
                ),
            )
        return Mock(raise_for_status=Mock(), content=b"ID3dialogue")

    monkeypatch.setattr("requests.get", fake_get)
    out = tmp_path / "dialogue.mp3"

    result = VibiTTS().execute(
        {
            "text": "Alice: Xin chào!\nBob: Chào Alice!",
            "speakers": {
                "Alice": {
                    "provider": "elevenlabs",
                    "voice_id": "rv30Fd6w5bnbL0kHzWlr",
                    "model_id": "eleven_multilingual_v2",
                },
                "Bob": {
                    "provider": "minimax",
                    "voice_id": "1ad2682d-1c78-4bb2-8061-b7cc216362c9",
                    "model_id": "speech-2.8-hd",
                },
            },
            "pause_between_turns": 0.4,
            "output_path": str(out),
        }
    )

    assert result.success, result.error
    assert post.call_args.args[0] == "https://api.vibi.pro/v1/dialogue"
    assert out.read_bytes() == b"ID3dialogue"


def test_vibi_stt_transcribes_and_exports_srt(monkeypatch, tmp_path):
    monkeypatch.setenv("VIBI_API_KEY", "sk_vibi_test")
    monkeypatch.setattr("time.sleep", lambda _s: None)

    audio_in = tmp_path / "sample.mp3"
    audio_in.write_bytes(b"ID3audio")
    out_json = tmp_path / "transcript.json"

    post = Mock(
        return_value=Mock(
            raise_for_status=Mock(),
            json=Mock(return_value={"task_id": "stt_456", "status": "pending"}),
        )
    )
    monkeypatch.setattr("requests.post", post)

    get = Mock(
        return_value=Mock(
            raise_for_status=Mock(),
            json=Mock(
                return_value={
                    "status": "completed",
                    "result": {
                        "language_code": "vie",
                        "text": "Xin chào mọi người.",
                        "words": [
                            {"text": "Xin", "start": 0.0, "end": 0.2, "type": "word"},
                            {"text": "chào", "start": 0.25, "end": 0.5, "type": "word"},
                        ],
                        "additional_formats": [
                            {
                                "file_extension": "srt",
                                "content": "1\n00:00:00,000 --> 00:00:00,500\nXin chào mọi người.\n",
                            }
                        ],
                    },
                }
            ),
        )
    )
    monkeypatch.setattr("requests.get", get)

    result = VibiSTT().execute(
        {
            "audio_path": str(audio_in),
            "language_code": "vi",
            "diarize": True,
            "output_path": str(out_json),
        }
    )

    assert result.success, result.error
    assert post.call_args.args[0] == "https://api.vibi.pro/v1/speech-to-text"
    assert json.loads(out_json.read_text(encoding="utf-8"))["text"] == "Xin chào mọi người."
    assert (tmp_path / "transcript.srt").is_file()

