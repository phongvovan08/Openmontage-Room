"""Synthesize a 100% copyright-safe Documentary Sub-Bass Pulse bed + Multi-Layer Cinematic SFX,
mixed with a 3-Bus FFmpeg graph (Narration + Sidechain-Ducked Pulse Bed + Un-ducked Crisp SFX).

Usage:
    python .agents/skills/vietnam-map-explainer/scripts/synth_documentary_audio_bed.py \
        --narration projects/<project-id>/assets/audio/narration_full.mp3 \
        --events-json projects/<project-id>/assets/audio/sfx_events.json \
        --sfx-out projects/<project-id>/assets/audio/sfx_hydrographic.mp3 \
        --master-out projects/<project-id>/assets/audio/master_audio.mp3 \
        --duration 590.44
"""

from __future__ import annotations

import argparse
import json
import subprocess
import tempfile
import wave
from pathlib import Path

import numpy as np
from scipy import signal

SR = 44100


def _butter_band(low: float | None, high: float | None, order: int = 3) -> np.ndarray:
    nyq = 0.5 * SR
    if low is not None and high is not None:
        wn = [max(0.001, min(0.98, low / nyq)), max(0.002, min(0.99, high / nyq))]
        return signal.butter(order, wn, btype="band", output="sos")
    if high is not None:
        return signal.butter(order, max(0.002, min(0.98, high / nyq)), btype="low", output="sos")
    return signal.butter(order, max(0.001, min(0.98, low / nyq)), btype="high", output="sos")


def _stereo_tail(sig: np.ndarray, tail_ms: float = 180.0, wet: float = 0.28) -> np.ndarray:
    pad = int(SR * tail_ms / 1000.0)
    mono = np.concatenate([sig.astype(np.float32), np.zeros(pad, dtype=np.float32)])
    out = np.column_stack([mono, mono])
    taps = [
        (int(SR * 0.029), 0.34, 0.16),
        (int(SR * 0.053), 0.14, 0.30),
        (int(SR * 0.089), 0.22, 0.10),
        (int(SR * 0.131), 0.08, 0.18),
    ]
    damp = _butter_band(120.0, 2600.0, order=2)
    filtered = signal.sosfilt(damp, mono)
    for d, gl, gr in taps:
        if d < out.shape[0]:
            out[d:, 0] += filtered[:-d] * gl * wet
            out[d:, 1] += filtered[:-d] * gr * wet
    return out


def _mix_at(buf: np.ndarray, t_sec: float, sig: np.ndarray, pan: float = 0.0) -> None:
    idx = max(0, int(round(t_sec * SR)))
    if idx >= buf.shape[0]:
        return
    if sig.ndim == 1:
        end = min(buf.shape[0], idx + sig.shape[0])
        seg = sig[: end - idx]
        l_gain = float(np.cos((pan + 1.0) * np.pi / 4.0))
        r_gain = float(np.sin((pan + 1.0) * np.pi / 4.0))
        buf[idx:end, 0] += seg * l_gain
        buf[idx:end, 1] += seg * r_gain
    else:
        end = min(buf.shape[0], idx + sig.shape[0])
        seg = sig[: end - idx]
        l_w = float(np.clip(1.0 - max(0.0, pan) * 0.45, 0.3, 1.0))
        r_w = float(np.clip(1.0 - max(0.0, -pan) * 0.45, 0.3, 1.0))
        buf[idx:end, 0] += seg[:, 0] * l_w
        buf[idx:end, 1] += seg[:, 1] * r_w


def make_documentary_pulse(duration_s: float, root_hz: float = 55.0, pulse_bpm: float = 56.0) -> np.ndarray:
    """Warm, understated Vox/RealLifeLore-style sub-bass drone + soft heartbeat pulse."""
    n = int(round(duration_s * SR))
    t = np.arange(n, dtype=np.float32) / SR

    lfo = 0.72 + 0.28 * np.sin(2.0 * np.pi * 0.08 * t)
    drone_l = (
        0.58 * np.sin(2.0 * np.pi * root_hz * t)
        + 0.24 * np.sin(2.0 * np.pi * (root_hz * 1.498) * t + 0.3)
        + 0.14 * np.sin(2.0 * np.pi * (root_hz * 2.002) * t)
    ) * lfo
    drone_r = (
        0.58 * np.sin(2.0 * np.pi * root_hz * t)
        + 0.24 * np.sin(2.0 * np.pi * (root_hz * 1.502) * t + 1.1)
        + 0.14 * np.sin(2.0 * np.pi * (root_hz * 1.998) * t + 0.6)
    ) * lfo

    beat_period = 60.0 / pulse_bpm
    beat_phase = (t % beat_period) / beat_period
    pulse_env = np.exp(-beat_phase * 9.5) * (1.0 - np.exp(-beat_phase * 65.0))
    pulse = np.sin(2.0 * np.pi * root_hz * t) * pulse_env * 0.42

    fade = np.ones(n, dtype=np.float32)
    fi = min(n, int(1.2 * SR))
    fo = min(n, int(1.8 * SR))
    fade[:fi] = np.linspace(0.0, 1.0, fi, dtype=np.float32)
    fade[-fo:] = np.linspace(1.0, 0.0, fo, dtype=np.float32)

    stereo = np.zeros((n, 2), dtype=np.float32)
    stereo[:, 0] = (drone_l + pulse) * fade * 0.042
    stereo[:, 1] = (drone_r + pulse) * fade * 0.042
    return stereo


def make_chapter_braam(gain: float = 0.21) -> np.ndarray:
    """Deep cinematic sub-drop + warm muted brass fifth for major chapter openings."""
    dur = 1.25
    n = int(SR * dur)
    t = np.arange(n, dtype=np.float32) / SR
    f_sub = 55.0 - 22.0 * (t / dur)
    sub = np.sin(2.0 * np.pi * f_sub * t)
    brass_raw = (
        0.55 * signal.sawtooth(2.0 * np.pi * 65.41 * t, width=0.5)
        + 0.35 * signal.sawtooth(2.0 * np.pi * 98.00 * t + 0.2, width=0.5)
        + 0.25 * np.sin(2.0 * np.pi * 130.81 * t)
    )
    brass = signal.sosfilt(_butter_band(45.0, 310.0, order=3), brass_raw)
    env = np.minimum(1.0, t / 0.075) * np.exp(-t * 2.1)
    sig = (0.55 * sub + 0.65 * brass) * env * gain
    return _stereo_tail(sig.astype(np.float32), tail_ms=280.0, wet=0.38)


def make_whoosh(rng: np.random.Generator, duration_s: float = 0.50, pitch_up: bool = True, gain: float = 0.19) -> np.ndarray:
    """Organic twin-band air sweep for camera dives, map pans & zoom cards."""
    n = int(SR * duration_s)
    t = np.linspace(0.0, duration_s, n, dtype=np.float32)
    white = rng.standard_normal(n).astype(np.float32)
    low_band = signal.sosfilt(_butter_band(85.0, 440.0, order=3), white)
    hi_band = signal.sosfilt(_butter_band(480.0, 1450.0, order=3), white)

    norm_t = t / duration_s
    blend = norm_t if pitch_up else (1.0 - norm_t)
    air = low_band * (1.15 - 0.55 * blend) + hi_band * (0.25 + 0.85 * blend)

    f0, f1 = (95.0, 290.0) if pitch_up else (275.0, 90.0)
    phase = 2.0 * np.pi * (f0 * t + 0.5 * (f1 - f0) * (t**2) / duration_s)
    body = np.sin(phase) * 0.22

    # Asymmetric natural crest peaking around 40% of duration
    env = np.maximum(0.0, np.sin(np.pi * (np.clip(norm_t, 0.0, 1.0) ** 0.82))) ** 1.5
    sig = (air * 1.45 + body) * env * gain
    return _stereo_tail(sig.astype(np.float32), tail_ms=140.0, wet=0.22)


def make_ship_horn(gain: float = 0.16) -> np.ndarray:
    """Distant maritime vessel horn with ocean hall tail."""
    dur = 1.25
    n = int(SR * dur)
    t = np.arange(n, dtype=np.float32) / SR
    vib = 1.0 + 0.004 * np.sin(2.0 * np.pi * 5.2 * t)
    raw = (
        0.65 * signal.sawtooth(2.0 * np.pi * 65.41 * vib * t)
        + 0.45 * signal.sawtooth(2.0 * np.pi * 82.41 * vib * t + 0.3)
        + 0.35 * np.sin(2.0 * np.pi * 130.81 * t)
    )
    warm = signal.sosfilt(_butter_band(50.0, 430.0, order=3), raw)
    env = np.minimum(1.0, t / 0.16) * np.minimum(1.0, np.maximum(0.0, (dur - t) / 0.34))
    sig = warm * env * gain
    return _stereo_tail(sig.astype(np.float32), tail_ms=340.0, wet=0.42)


def make_sonar_ping(freq: float = 1140.0, gain: float = 0.15) -> np.ndarray:
    """Hydrographic naval radar/depth ping with soft secondary echo."""
    dur = 0.46
    n = int(SR * dur)
    t = np.arange(n, dtype=np.float32) / SR
    p1 = (0.78 * np.sin(2.0 * np.pi * freq * t) + 0.22 * np.sin(2.0 * np.pi * (freq * 1.5) * t)) * np.exp(-t * 14.0)
    p1 *= np.minimum(1.0, t / 0.014)
    d = int(SR * 0.145)
    sig = p1.copy()
    sig[d:] += p1[:-d] * 0.30
    return _stereo_tail((sig * gain).astype(np.float32), tail_ms=200.0, wet=0.35)


def make_lock_pip(freq_a: float = 920.0, freq_b: float = 1380.0, gain: float = 0.14) -> np.ndarray:
    """Clean double UI/pin telemetry lock."""
    n1 = int(SR * 0.065)
    n2 = int(SR * 0.115)
    gap = int(SR * 0.038)
    t1 = np.arange(n1, dtype=np.float32) / SR
    t2 = np.arange(n2, dtype=np.float32) / SR
    p1 = np.sin(2.0 * np.pi * freq_a * t1) * np.minimum(1.0, t1 / 0.006) * np.exp(-t1 * 36.0)
    p2 = np.sin(2.0 * np.pi * freq_b * t2) * np.minimum(1.0, t2 / 0.006) * np.exp(-t2 * 24.0)
    out = np.zeros(gap + n2, dtype=np.float32)
    out[:n1] += p1
    out[gap : gap + n2] += p2
    return _stereo_tail((out * gain).astype(np.float32), tail_ms=110.0, wet=0.22)


def make_dossier_snap(rng: np.random.Generator, gain: float = 0.18) -> np.ndarray:
    """Crisp archival paper decree snap + soft desk thud."""
    dur = 0.28
    n = int(SR * dur)
    t = np.arange(n, dtype=np.float32) / SR
    white = rng.standard_normal(n).astype(np.float32)
    paper = signal.sosfilt(_butter_band(650.0, 2600.0, order=3), white)
    snap_env = np.minimum(1.0, t / 0.004) * np.exp(-t * 28.0)
    thud = np.sin(2.0 * np.pi * 92.0 * t) * np.exp(-t * 42.0) * 0.55
    sig = (paper * 1.45 * snap_env + thud) * gain
    return _stereo_tail(sig.astype(np.float32), tail_ms=120.0, wet=0.20)


def make_marker_swipe(rng: np.random.Generator, gain: float = 0.16) -> np.ndarray:
    """Felt-tip highlighter brush swipe across cream paper document."""
    dur = 0.44
    n = int(SR * dur)
    t = np.arange(n, dtype=np.float32) / SR
    white = rng.standard_normal(n).astype(np.float32)
    brush = signal.sosfilt(_butter_band(1050.0, 2350.0, order=3), white)
    env = np.maximum(0.0, np.sin(np.pi * np.clip(t / dur, 0.0, 1.0))) ** 1.15
    sig = brush * 1.55 * env * gain
    return _stereo_tail(sig.astype(np.float32), tail_ms=90.0, wet=0.16)


def make_warning_sonar(gain: float = 0.21) -> np.ndarray:
    """Urgent hull impact thud + twin low marine caution pulse."""
    dur = 0.62
    n = int(SR * dur)
    t = np.arange(n, dtype=np.float32) / SR
    thud = np.sin(2.0 * np.pi * (88.0 - 44.0 * np.minimum(1.0, t / 0.18)) * t) * np.exp(-t * 14.0) * 0.85
    pulse1 = np.sin(2.0 * np.pi * (280.0 - 50.0 * (t / dur)) * t) * np.exp(-t * 7.5)
    delay = int(SR * 0.18)
    pulse2 = np.zeros(n, dtype=np.float32)
    pulse2[delay:] = pulse1[:-delay] * 0.65
    sig = (thud + 0.55 * (pulse1 + pulse2)) * np.minimum(1.0, t / 0.010) * gain
    return _stereo_tail(sig.astype(np.float32), tail_ms=220.0, wet=0.30)


def make_data_burst(gain: float = 0.14) -> np.ndarray:
    """Vox-style 6-tick fast numerical counter ratchet."""
    dur = 0.42
    n = int(SR * dur)
    out = np.zeros(n, dtype=np.float32)
    offsets = [0.00, 0.065, 0.125, 0.18, 0.23, 0.275]
    n_tick = int(SR * 0.022)
    tt = np.arange(n_tick, dtype=np.float32) / SR
    tick_base = np.sin(2.0 * np.pi * 1950.0 * tt) * np.exp(-tt * 145.0)
    for k, off in enumerate(offsets):
        i0 = int(off * SR)
        end = min(n, i0 + n_tick)
        out[i0:end] += tick_base[: end - i0] * (0.72 + 0.06 * k)
    return _stereo_tail((out * gain).astype(np.float32), tail_ms=90.0, wet=0.18)


def make_rail_glide(rng: np.random.Generator, gain: float = 0.16) -> np.ndarray:
    """Signature rhythmic railway track click-clack (du-dum ... du-dum)."""
    dur = 0.62
    n = int(SR * dur)
    out = np.zeros(n, dtype=np.float32)
    clack_n = int(SR * 0.055)
    tc = np.arange(clack_n, dtype=np.float32) / SR
    white = rng.standard_normal(clack_n).astype(np.float32)
    steel = signal.sosfilt(_butter_band(680.0, 1950.0, order=3), white)
    tie = np.sin(2.0 * np.pi * 138.0 * tc) * 0.55
    clack = (steel * 1.4 + tie) * np.exp(-tc * 48.0) * np.minimum(1.0, tc / 0.004)
    for off, amp in [(0.0, 0.9), (0.14, 1.0), (0.33, 0.85), (0.47, 0.95)]:
        i0 = int(off * SR)
        end = min(n, i0 + clack_n)
        out[i0:end] += clack[: end - i0] * amp
    return _stereo_tail((out * gain).astype(np.float32), tail_ms=140.0, wet=0.24)


def make_deepwater_chord(gain: float = 0.17) -> np.ndarray:
    """Warm major-9 optimistic chord for breakthroughs & engineering victories."""
    dur = 1.15
    n = int(SR * dur)
    t = np.arange(n, dtype=np.float32) / SR
    freqs = [261.63, 329.63, 392.00, 523.25, 587.33]
    sig = sum(np.sin(2.0 * np.pi * f * t + idx * 0.4) for idx, f in enumerate(freqs)) / len(freqs)
    env = np.minimum(1.0, t / 0.065) * np.exp(-t * 2.4)
    return _stereo_tail((sig * env * gain).astype(np.float32), tail_ms=340.0, wet=0.45)


def make_caliper_tick(rng: np.random.Generator, gain: float = 0.12) -> np.ndarray:
    """Subtle organic air-brush + precision caliper tick for clean scene transitions."""
    dur = 0.24
    n = int(SR * dur)
    t = np.arange(n, dtype=np.float32) / SR
    white = rng.standard_normal(n).astype(np.float32)
    brush = signal.sosfilt(_butter_band(200.0, 620.0, order=2), white) * np.sin(np.pi * (t / dur)) ** 1.4
    click = np.sin(2.0 * np.pi * 1420.0 * t) * np.exp(-t * 78.0) * np.minimum(1.0, t / 0.003)
    sig = (brush * 0.95 + click * 0.55) * gain
    return _stereo_tail(sig.astype(np.float32), tail_ms=100.0, wet=0.18)


def _write_stereo_wav(path: Path, arr: np.ndarray) -> None:
    clean = np.nan_to_num(arr, nan=0.0, posinf=0.94, neginf=-0.94)
    pcm16 = (np.clip(clean, -0.94, 0.94) * 32767.0).astype(np.int16)
    with wave.open(str(path), "wb") as wf:
        wf.setnchannels(2)
        wf.setsampwidth(2)
        wf.setframerate(SR)
        wf.writeframes(pcm16.tobytes())


def main() -> None:
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("--narration", required=True, type=Path, help="Input narration_full.mp3 path")
    parser.add_argument("--events-json", type=Path, default=None, help="Optional JSON file of SFX timestamps")
    parser.add_argument("--sfx-out", required=True, type=Path, help="Output procedural bed + SFX MP3 path")
    parser.add_argument("--master-out", required=True, type=Path, help="Output master_audio.mp3 path")
    parser.add_argument("--duration", required=True, type=float, help="Exact composition duration in seconds")
    args = parser.parse_args()

    events = json.loads(args.events_json.read_text(encoding="utf-8")) if args.events_json and args.events_json.is_file() else {}
    rng = np.random.default_rng(20261116)

    bed = make_documentary_pulse(args.duration)
    sfx = np.zeros_like(bed)

    for idx, ts in enumerate(events.get("chapter_braams", [])):
        _mix_at(sfx, float(ts), make_chapter_braam(), pan=0.0)
    for idx, w in enumerate(events.get("whooshes", [])):
        pan = -0.18 if idx % 2 == 0 else 0.18
        _mix_at(sfx, max(0.0, float(w["t"]) - 0.020), make_whoosh(rng, pitch_up=bool(w.get("up", True))), pan=pan)
    for idx, ts in enumerate(events.get("ship_horns", [])):
        _mix_at(sfx, float(ts), make_ship_horn(), pan=-0.22 if idx % 2 == 0 else 0.22)
    for idx, ts in enumerate(events.get("sonar_pings", [])):
        _mix_at(sfx, float(ts), make_sonar_ping(freq=1140.0 + (idx % 3) * 80.0), pan=0.14 if idx % 2 == 0 else -0.14)
    for ts in events.get("locks", []):
        _mix_at(sfx, float(ts), make_lock_pip(), pan=0.08)
    for ts in events.get("dossier_snaps", []):
        _mix_at(sfx, float(ts), make_dossier_snap(rng), pan=0.12)
    for ts in events.get("marker_swipes", []):
        _mix_at(sfx, float(ts), make_marker_swipe(rng), pan=0.15)
    for ts in events.get("warnings", []):
        _mix_at(sfx, float(ts), make_warning_sonar(), pan=0.0)
    for ts in events.get("data_bursts", []):
        _mix_at(sfx, float(ts), make_data_burst(), pan=0.10)
    for ts in events.get("rail_glides", []):
        _mix_at(sfx, float(ts), make_rail_glide(rng), pan=-0.08)
    for ts in events.get("clearances", []):
        _mix_at(sfx, float(ts), make_deepwater_chord(), pan=0.0)
    for ts in events.get("scene_ticks", []):
        _mix_at(sfx, max(0.0, float(ts) - 0.015), make_caliper_tick(rng), pan=0.0)

    combined_sfx_bed = np.clip(bed + sfx, -0.94, 0.94)
    args.sfx_out.parent.mkdir(parents=True, exist_ok=True)
    args.master_out.parent.mkdir(parents=True, exist_ok=True)

    with tempfile.NamedTemporaryFile(suffix=".wav", delete=False) as bf:
        bed_wav = Path(bf.name)
    with tempfile.NamedTemporaryFile(suffix=".wav", delete=False) as sf:
        sfx_wav = Path(sf.name)
    with tempfile.NamedTemporaryFile(suffix=".wav", delete=False) as cf:
        combo_wav = Path(cf.name)

    try:
        _write_stereo_wav(bed_wav, bed)
        _write_stereo_wav(sfx_wav, sfx)
        _write_stereo_wav(combo_wav, combined_sfx_bed)

        subprocess.run(
            ["ffmpeg", "-y", "-i", str(combo_wav), "-c:a", "libmp3lame", "-b:a", "192k", str(args.sfx_out)],
            check=True,
            capture_output=True,
        )

        # 3-Bus Mix: Narration primary, Pulse Bed sidechain-ducked, SFX UN-DUCKED (kept crisp & audible!)
        subprocess.run(
            [
                "ffmpeg",
                "-y",
                "-i",
                str(args.narration),
                "-i",
                str(bed_wav),
                "-i",
                str(sfx_wav),
                "-filter_complex",
                "[0:a]asplit=2[vo][sc];"
                "[1:a]equalizer=f=2800:width_type=o:w=1.4:g=-4[bed_eq];"
                "[bed_eq][sc]sidechaincompress=threshold=0.025:ratio=4.2:attack=18:release=260[ducked_bed];"
                "[2:a]equalizer=f=3100:width_type=o:w=1.1:g=-3.0[sfx_clean];"
                "[vo][ducked_bed][sfx_clean]amix=inputs=3:duration=first:dropout_transition=0:normalize=0,"
                "alimiter=limit=0.83:attack=4:release=45[out]",
                "-map",
                "[out]",
                "-t",
                f"{args.duration:.3f}",
                "-c:a",
                "libmp3lame",
                "-b:a",
                "192k",
                str(args.master_out),
            ],
            check=True,
            capture_output=True,
        )

        sfx_probe = subprocess.run(
            ["ffmpeg", "-i", str(sfx_wav), "-af", "volumedetect", "-f", "null", "-"],
            capture_output=True,
            text=True,
        )
        print("[SFX BUS]", " | ".join(
            l.strip().split("] ")[-1]
            for l in sfx_probe.stderr.splitlines()
            if "mean_volume" in l or "max_volume" in l
        ))
    finally:
        bed_wav.unlink(missing_ok=True)
        sfx_wav.unlink(missing_ok=True)
        combo_wav.unlink(missing_ok=True)

    probe = subprocess.run(
        ["ffmpeg", "-i", str(args.master_out), "-af", "volumedetect", "-f", "null", "-"],
        capture_output=True,
        text=True,
    )
    print(f"[OK] Wrote {args.sfx_out.name} and {args.master_out.name}")
    for line in probe.stderr.splitlines():
        if "mean_volume" in line or "max_volume" in line:
            print("    ", line.strip())


if __name__ == "__main__":
    main()
