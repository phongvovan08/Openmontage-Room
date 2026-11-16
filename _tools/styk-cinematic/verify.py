"""Verify the final StykAnimate film and prepare frames for visual review.

Run from the workspace after both MP4 exports are complete:
    python _tools/styk-cinematic/verify.py
"""
from __future__ import annotations

import hashlib
import json
import math
import os
from fractions import Fraction
from pathlib import Path
import subprocess
import sys

import numpy as np
from PIL import Image, ImageDraw, ImageFont


ROOT = Path(__file__).resolve().parents[2]
OUTPUT = ROOT / "Chu-De/Be-Mochi-Mam-Xanh/demo-stykanimate-cau-chuyen"
FINAL_NAME = "stykanimate-cau-chuyen-40s.mp4"
PICTURE_NAME = "stykanimate-hinh-40s.mp4"
SCENE_TIMES = [1.5, 3.5, 7.8, 12.5, 17, 21.5, 25, 30, 35]
WALK_TIMES = [3, 3.2, 3.4, 12, 12.2, 12.4]
EXPECTED = {"durationSeconds": 40, "width": 1920, "height": 1080, "fps": 30, "frames": 1200}


def command(arguments: list[str], timeout: int = 600) -> subprocess.CompletedProcess:
    return subprocess.run(
        arguments,
        stdin=subprocess.DEVNULL,
        stdout=subprocess.PIPE,
        stderr=subprocess.PIPE,
        timeout=timeout,
        creationflags=getattr(subprocess, "CREATE_NO_WINDOW", 0) if os.name == "nt" else 0,
    )


def require_success(result: subprocess.CompletedProcess, description: str) -> bytes:
    if result.returncode:
        error = result.stderr.decode("utf-8", errors="replace").strip()
        raise RuntimeError(f"{description}: {error or 'process exited ' + str(result.returncode)}")
    return result.stdout


def sha256(file: Path) -> str:
    digest = hashlib.sha256()
    with file.open("rb") as source:
        for chunk in iter(lambda: source.read(1024 * 1024), b""):
            digest.update(chunk)
    return digest.hexdigest()


def number(value, default: float = 0.0) -> float:
    try:
        parsed = float(value)
        return parsed if math.isfinite(parsed) else default
    except (TypeError, ValueError):
        return default


def rate(value) -> float:
    try:
        return float(Fraction(str(value)))
    except (ValueError, ZeroDivisionError):
        return 0.0


def decibels(amplitude: float) -> float | None:
    return round(20 * math.log10(amplitude), 3) if amplitude > 0 and math.isfinite(amplitude) else None


def inspect_video(file: Path, *, audio_required: bool) -> dict:
    record = {"file": file.name, "checks": {}, "errors": []}
    checks = record["checks"]
    checks["exists"] = file.is_file()
    if not file.is_file():
        record["errors"].append("Expected MP4 does not exist.")
        record["allPassed"] = False
        return record

    record["bytes"] = file.stat().st_size
    record["sha256"] = sha256(file)
    checks["nonemptyFile"] = file.stat().st_size > 1024
    try:
        metadata = json.loads(require_success(command([
            "ffprobe", "-v", "error", "-show_format", "-show_streams", "-of", "json", str(file)
        ]), "ffprobe"))
        record["metadata"] = metadata
        streams = metadata.get("streams", [])
        videos = [stream for stream in streams if stream.get("codec_type") == "video"]
        audios = [stream for stream in streams if stream.get("codec_type") == "audio"]
        checks["oneVideoStream"] = len(videos) == 1
        video = videos[0] if videos else {}
        duration = number(metadata.get("format", {}).get("duration"))
        record["durationSeconds"] = duration
        record["fps"] = rate(video.get("avg_frame_rate") or video.get("r_frame_rate"))
        record["frameCount"] = int(number(video.get("nb_frames")))
        checks.update({
            "duration40Seconds": abs(duration - EXPECTED["durationSeconds"]) <= .05,
            "resolution1920x1080": (video.get("width"), video.get("height")) == (1920, 1080),
            "fps30": abs(record["fps"] - 30) < .0001,
            "frames1200": record["frameCount"] == 1200,
            "codecH264": video.get("codec_name") == "h264",
        })
        if audio_required:
            checks["oneAudioStream"] = len(audios) == 1
            checks["codecAAC"] = bool(audios) and audios[0].get("codec_name") == "aac"
        else:
            checks["pictureOnlyNoAudio"] = len(audios) == 0

        decoded = command(["ffmpeg", "-nostdin", "-v", "error", "-xerror", "-i", str(file), "-f", "null", "-"])
        checks["fullDecode"] = decoded.returncode == 0 and not decoded.stderr.strip()
        if not checks["fullDecode"]:
            record["errors"].append("Full decode: " + decoded.stderr.decode("utf-8", errors="replace").strip())

        if audio_required and audios:
            pcm = require_success(command([
                "ffmpeg", "-nostdin", "-v", "error", "-i", str(file), "-map", "0:a:0",
                "-ac", "2", "-ar", "48000", "-f", "f32le", "-"
            ]), "audio decode")
            samples = np.frombuffer(pcm, dtype="<f4")
            if samples.size % 2:
                raise RuntimeError("Decoded stereo PCM has an odd sample count.")
            samples = samples.reshape(-1, 2)
            finite = bool(np.isfinite(samples).all())
            checks["audioSamplesFinite"] = finite and samples.size > 0
            if finite and samples.size:
                absolute = np.abs(samples)
                peaks = np.max(absolute, axis=0).astype(float)
                rms = np.sqrt(np.mean(samples.astype(np.float64) ** 2, axis=0))
                peak = float(np.max(peaks))
                decoded_duration = len(samples) / 48000
                record["audio"] = {
                    "measurement": "Decoded PCM sample peak; not an oversampled true-peak measurement.",
                    "measurementSampleRate": 48000,
                    "measurementChannels": 2,
                    "decodedDurationSeconds": decoded_duration,
                    "samplePeakLinear": peak,
                    "samplePeakDbFS": decibels(peak),
                    "channelSamplePeaksDbFS": [decibels(float(v)) for v in peaks],
                    "channelRmsDbFS": [decibels(float(v)) for v in rms],
                    "samplesAtOrAboveFullScale": int(np.count_nonzero(absolute >= 1.0)),
                    "samplesNearFullScale": int(np.count_nonzero(absolute >= .999)),
                }
                checks["noAudioSampleClipping"] = peak < 1.0
                checks["audioNotSilent"] = bool(float(np.max(rms)) > .00001)
                checks["audioCoversFilm"] = abs(decoded_duration - 40) < .1
            else:
                checks["noAudioSampleClipping"] = False
                checks["audioNotSilent"] = False
    except Exception as error:
        record["errors"].append(str(error))

    record["allPassed"] = bool(checks) and all(checks.values()) and not record["errors"]
    return record


def label_font(size: int):
    for candidate in ["C:/Windows/Fonts/segoeuib.ttf", "C:/Windows/Fonts/segoeui.ttf", "/usr/share/fonts/truetype/dejavu/DejaVuSans.ttf"]:
        if Path(candidate).is_file():
            return ImageFont.truetype(candidate, size)
    return ImageFont.load_default()


def frame_sheet(file: Path, folder: Path, times: list[float], *, prefix: str, destination: str) -> dict:
    columns, width, height, label_height = 3, 640, 360, 36
    rows = math.ceil(len(times) / columns)
    sheet = Image.new("RGB", (columns * width, rows * (height + label_height)), "#E8DFD2")
    draw = ImageDraw.Draw(sheet)
    font = label_font(21)
    entries = []
    for index, second in enumerate(times):
        target = folder / f"{prefix}-{second:04.1f}s.jpg"
        require_success(command([
            "ffmpeg", "-nostdin", "-v", "error", "-y", "-ss", str(second), "-i", str(file),
            "-frames:v", "1", "-q:v", "2", str(target)
        ]), f"extract frame at {second}s")
        with Image.open(target) as source:
            image = source.convert("RGB")
            pixel_values = np.asarray(image, dtype=np.float32)
            mean = float(pixel_values.mean())
            deviation = float(pixel_values.std())
            x = (index % columns) * width
            y = (index // columns) * (height + label_height)
            sheet.paste(image.resize((width, height), Image.Resampling.LANCZOS), (x, y + label_height))
            draw.text((x + 12, y + 5), f"{second:g} s", font=font, fill="#20343E")
            entries.append({"second": second, "file": f"qa/{target.name}", "meanByteValue": round(mean, 3), "standardDeviation": round(deviation, 3)})
    sheet.save(folder / destination, quality=95, subsampling=0)
    return {
        "sheet": f"qa/{destination}",
        "frames": entries,
        "checks": {"sampleFramesNotBlack": all(item["meanByteValue"] > 2 for item in entries),
                   "sampleFramesHaveDetail": all(item["standardDeviation"] > 2 for item in entries)},
    }


def main() -> int:
    final = OUTPUT / FINAL_NAME
    if not final.is_file():
        print(f"Final export not found; finish rendering first: {final}", file=sys.stderr)
        return 1
    qa = OUTPUT / "qa"
    qa.mkdir(parents=True, exist_ok=True)
    report = {
        "expected": EXPECTED,
        "videos": [inspect_video(final, audio_required=True), inspect_video(OUTPUT / PICTURE_NAME, audio_required=False)],
        "visualReviewRequired": True,
        "errors": [],
    }
    try:
        report["contactSheet"] = frame_sheet(final, qa, SCENE_TIMES, prefix="frame", destination="contact-sheet.jpg")
        report["walkingStrip"] = frame_sheet(final, qa, WALK_TIMES, prefix="walk", destination="walking-strip.jpg")
    except Exception as error:
        report["errors"].append(str(error))
    report["allPassed"] = (
        all(video["allPassed"] for video in report["videos"])
        and all(report.get("contactSheet", {}).get("checks", {"missing": False}).values())
        and all(report.get("walkingStrip", {}).get("checks", {"missing": False}).values())
        and not report["errors"]
    )
    (qa / "verification.json").write_text(json.dumps(report, ensure_ascii=False, indent=2, allow_nan=False), encoding="utf-8")
    summary = {
        "allPassed": report["allPassed"],
        "videos": [{"file": v["file"], "checks": v["checks"], "errors": v["errors"],
                    "audioPeakDbFS": v.get("audio", {}).get("samplePeakDbFS")} for v in report["videos"]],
        "contactSheet": report.get("contactSheet", {}).get("sheet"),
        "walkingStrip": report.get("walkingStrip", {}).get("sheet"),
        "errors": report["errors"],
    }
    print(json.dumps(summary, ensure_ascii=False, allow_nan=False))
    return 0 if report["allPassed"] else 1


if __name__ == "__main__":
    raise SystemExit(main())
