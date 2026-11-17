"""Synthesize a copyright-safe Documentary Harmonic Pulse bed + 4-Layer Tactile Cartographic SFX,
mixed with a 3-Bus FFmpeg speech-priority graph (Narration + Sidechain-Ducked Pulse Bed + Pocketed/Ducked SFX)
and a built-in active-window 5-band Acoustic QA gate.

Usage:
    python .agents/skills/vietnam-map-explainer/scripts/synth_documentary_audio_bed.py \
        --narration projects/<project-id>/assets/audio/narration_full.mp3 \
        --events-json projects/<project-id>/assets/audio/sfx_events.json \
        --scene-plan projects/<project-id>/artifacts/scene_plan.json \
        --sfx-out projects/<project-id>/assets/audio/sfx_bed.mp3 \
        --master-out projects/<project-id>/assets/audio/master_audio.mp3 \
        --duration 668.27
"""

from __future__ import annotations

import argparse
import json
import re
import subprocess
import tempfile
import wave
from pathlib import Path
from typing import Any

import numpy as np
from scipy import signal

SR = 44100


def _butter_band(low: float | None, high: float | None, order: int = 3) -> np.ndarray:
    """Design a numerically stable Butterworth SOS bandpass, lowpass, or highpass filter."""
    nyq = 0.5 * SR
    if low is not None and high is not None:
        wn = [max(0.001, min(0.98, low / nyq)), max(0.002, min(0.99, high / nyq))]
        return signal.butter(order, wn, btype="band", output="sos")
    if high is not None:
        return signal.butter(order, max(0.002, min(0.98, high / nyq)), btype="low", output="sos")
    return signal.butter(order, max(0.001, min(0.98, low / nyq)), btype="high", output="sos")


def _peak_db(sig: np.ndarray, target_db: float) -> np.ndarray:
    """Peak-normalize a mono or stereo buffer after filtering so narrow bands never mute transients."""
    clean = np.nan_to_num(sig, nan=0.0, posinf=0.0, neginf=0.0)
    pk = float(np.max(np.abs(clean)))
    if pk <= 1e-7:
        return np.zeros_like(clean, dtype=np.float32)
    scale = (10.0 ** (target_db / 20.0)) / pk
    return (clean * scale).astype(np.float32)


def _stereo_tail(sig: np.ndarray, tail_ms: float = 180.0, wet: float = 0.28) -> np.ndarray:
    """Apply stereo early reflections preserving 2.5–6.2 kHz transient crispness."""
    pad = int(SR * tail_ms / 1000.0)
    mono = np.concatenate([sig.astype(np.float32), np.zeros(pad, dtype=np.float32)])
    out = np.column_stack([mono, mono])
    taps = [
        (int(SR * 0.023), 0.34, 0.16),
        (int(SR * 0.047), 0.14, 0.30),
        (int(SR * 0.083), 0.22, 0.10),
        (int(SR * 0.127), 0.08, 0.18),
    ]
    damp = _butter_band(120.0, 6200.0, order=2)
    filtered = signal.sosfilt(damp, mono)
    for d, gl, gr in taps:
        if d < out.shape[0]:
            out[d:, 0] += filtered[:-d] * gl * wet
            out[d:, 1] += filtered[:-d] * gr * wet
    return out


def _mix_at(buf: np.ndarray, t_sec: float, sig: np.ndarray, pan: float = 0.0) -> None:
    """Mix a mono or stereo SFX clip into `buf` at `t_sec` using equal-power stereo panning."""
    idx = max(0, int(round(t_sec * SR)))
    if idx >= buf.shape[0]:
        return
    end = min(buf.shape[0], idx + sig.shape[0])
    length = end - idx
    if length <= 0:
        return
    if sig.ndim == 1:
        seg = sig[:length]
        l_gain = float(np.cos((pan + 1.0) * np.pi / 4.0))
        r_gain = float(np.sin((pan + 1.0) * np.pi / 4.0))
        buf[idx:end, 0] += seg * l_gain
        buf[idx:end, 1] += seg * r_gain
    else:
        seg = sig[:length]
        l_w = float(np.clip(1.0 - max(0.0, pan) * 0.45, 0.3, 1.0))
        r_w = float(np.clip(1.0 - max(0.0, -pan) * 0.45, 0.3, 1.0))
        buf[idx:end, 0] += seg[:, 0] * l_w
        buf[idx:end, 1] += seg[:, 1] * r_w


def _active_band_rms_db(arr: np.ndarray) -> dict[str, float]:
    """Measure 5-band RMS energy (dBFS) over active SFX samples so sparse mixes are not diluted by silence."""
    mono = np.mean(arr, axis=1).astype(np.float32) if arr.ndim == 2 else arr.astype(np.float32)
    mask = np.abs(mono) > 1e-4
    use_mask = int(np.count_nonzero(mask)) >= 512
    bands = [
        ("sub<120", 20.0, 120.0),
        ("low120-450", 120.0, 450.0),
        ("mid450-2.5k", 450.0, 2500.0),
        ("pres2.5k-7k", 2500.0, 7000.0),
        ("air7k-16k", 7000.0, 16000.0),
    ]
    out: dict[str, float] = {}
    for name, lo, hi in bands:
        y = signal.sosfilt(_butter_band(lo, hi, order=3), mono)
        seg = y[mask] if use_mask else y
        rms = float(np.sqrt(np.mean(seg**2) + 1e-12))
        out[name] = round(20.0 * np.log10(rms), 1)
    return out


def make_documentary_pulse(duration_s: float, root_hz: float = 55.0, pulse_bpm: float = 96.0) -> np.ndarray:
    """Audible Vox-style documentary tension bed: warm sub foundation, 96 BPM cello/triangle pulse, and crisp beat tick."""
    n = int(round(duration_s * SR))
    t = np.arange(n, dtype=np.float32) / SR
    lfo = 0.78 + 0.22 * np.sin(2.0 * np.pi * 0.08 * t)

    drone_l = (
        0.55 * np.sin(2.0 * np.pi * root_hz * t)
        + 0.32 * np.sin(2.0 * np.pi * (root_hz * 1.498) * t + 0.3)
        + 0.24 * np.sin(2.0 * np.pi * (root_hz * 2.0) * t)
    ) * lfo
    drone_r = (
        0.55 * np.sin(2.0 * np.pi * root_hz * t)
        + 0.32 * np.sin(2.0 * np.pi * (root_hz * 1.502) * t + 1.1)
        + 0.24 * np.sin(2.0 * np.pi * (root_hz * 2.0) * t + 0.6)
    ) * lfo

    beat_period = 60.0 / pulse_bpm
    beat_phase = (t % beat_period) / beat_period
    sub_env = np.exp(-beat_phase * 8.5) * (1.0 - np.exp(-beat_phase * 55.0))
    eighth_phase = ((t * 2.0) % beat_period) / beat_period
    harm_env = np.exp(-eighth_phase * 11.0) * (1.0 - np.exp(-eighth_phase * 70.0))

    # Audible upper-bass/low-mid triangle-like harmonics (110/165/220 Hz) for laptop & phone speakers
    harm_osc = (
        0.55 * np.sin(2.0 * np.pi * (root_hz * 2.0) * t)
        + 0.30 * np.sin(2.0 * np.pi * (root_hz * 3.0) * t)
        + 0.18 * np.sin(2.0 * np.pi * (root_hz * 4.0) * t)
    )
    harm_pulse = signal.sosfilt(_butter_band(95.0, 650.0, order=2), harm_osc) * harm_env * 0.85
    sub_pulse = np.sin(2.0 * np.pi * root_hz * t) * sub_env * 0.55

    # Gentle high-frequency clockwork shaker subdivision (2.4-5.8 kHz, ~ -31 dBFS)
    rng = np.random.default_rng(7711)
    shaker_noise = signal.sosfilt(_butter_band(2400.0, 5800.0, order=3), rng.standard_normal(n).astype(np.float32))
    shaker_noise = _peak_db(shaker_noise, -14.0)
    shaker_env = np.exp(-eighth_phase * 28.0) * (1.0 - np.exp(-eighth_phase * 120.0))
    shaker = shaker_noise * shaker_env * 0.045

    fade = np.ones(n, dtype=np.float32)
    fi = min(n, int(1.2 * SR))
    fo = min(n, int(1.8 * SR))
    if fi > 0:
        fade[:fi] = np.linspace(0.0, 1.0, fi, dtype=np.float32)
    if fo > 0:
        fade[-fo:] = np.linspace(1.0, 0.0, fo, dtype=np.float32)

    stereo = np.zeros((n, 2), dtype=np.float32)
    stereo[:, 0] = (drone_l * 0.42 + sub_pulse + harm_pulse + shaker * 0.85) * fade
    stereo[:, 1] = (drone_r * 0.42 + sub_pulse + harm_pulse + shaker * 1.15) * fade
    return _peak_db(stereo, -19.5)


def make_chapter_braam(gain: float = 0.21) -> np.ndarray:
    """Deep cinematic sub-drop + warm brass fifth with crisp 1.1–2.8 kHz chapter transient."""
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
    brass = signal.sosfilt(_butter_band(50.0, 380.0, order=3), brass_raw)
    attack = signal.sosfilt(_butter_band(1100.0, 2800.0, order=2), brass_raw) * np.exp(-t * 14.0)
    env = np.minimum(1.0, t / 0.045) * np.exp(-t * 2.1)
    sig = _peak_db((0.50 * sub + 0.72 * brass) * env + 0.40 * _peak_db(attack, 0.0) * env, -13.5)
    sig = (sig * (gain / 0.21)).astype(np.float32)
    return _stereo_tail(sig, tail_ms=280.0, wet=0.38)


def make_whoosh(rng: np.random.Generator, duration_s: float = 0.42, pitch_up: bool = True, gain: float = 0.19) -> np.ndarray:
    """Organic twin-band air sweep (140–900 Hz body + 900–4800 Hz air sheen) for camera dives & zooms."""
    dur = max(0.24, min(0.60, duration_s))
    n = int(SR * dur)
    t = np.linspace(0.0, dur, n, dtype=np.float32)
    white = rng.standard_normal(n).astype(np.float32)
    low_band = _peak_db(signal.sosfilt(_butter_band(140.0, 900.0, order=3), white), -2.0)
    hi_band = _peak_db(signal.sosfilt(_butter_band(900.0, 4800.0, order=3), white), 0.0)

    norm_t = t / dur
    blend = norm_t if pitch_up else (1.0 - norm_t)
    air = low_band * (0.95 - 0.35 * blend) + hi_band * (0.45 + 0.75 * blend)

    f0, f1 = (115.0, 320.0) if pitch_up else (305.0, 105.0)
    phase = 2.0 * np.pi * (f0 * t + 0.5 * (f1 - f0) * (t**2) / dur)
    body = np.sin(phase) * 0.28

    env = np.maximum(0.0, np.sin(np.pi * (np.clip(norm_t, 0.0, 1.0) ** 0.78))) ** 1.35
    sig = _peak_db((air + body) * env, -16.5)
    sig = (sig * (gain / 0.19)).astype(np.float32)
    return _stereo_tail(sig, tail_ms=140.0, wet=0.22)


def make_pin_pop(freq_scale: float = 1.0, gain: float = 1.0) -> np.ndarray:
    """Clean tactile map-pin/medallion pop: pitch-drop thump + wood/glass chirp + 3.2 kHz click."""
    dur = 0.095
    n = int(SR * dur)
    t = np.arange(n, dtype=np.float32) / SR
    f_body = (520.0 - 330.0 * np.minimum(1.0, t / 0.035)) * freq_scale
    body = np.sin(2.0 * np.pi * np.cumsum(f_body) / SR) * np.exp(-t * 48.0)

    f_chirp = (980.0 + 580.0 * np.minimum(1.0, t / 0.030)) * freq_scale
    chirp = np.sin(2.0 * np.pi * np.cumsum(f_chirp) / SR) * np.exp(-t * 36.0)

    click = np.sin(2.0 * np.pi * 3200.0 * freq_scale * t) * np.exp(-t * 140.0)
    env = np.minimum(1.0, t / 0.0025)
    raw = (0.58 * body + 0.62 * chirp + 0.42 * click) * env
    sig = (_peak_db(raw, -17.0) * gain).astype(np.float32)
    return _stereo_tail(sig, tail_ms=95.0, wet=0.20)


def make_line_draw(rng: np.random.Generator, duration_s: float = 0.42, gain: float = 1.0) -> np.ndarray:
    """Cartographic luminous perimeter / route pen-zip with swept 800–3600 Hz friction."""
    dur = max(0.20, min(1.0, duration_s))
    n = int(SR * dur)
    t = np.linspace(0.0, dur, n, dtype=np.float32)
    norm_t = t / dur
    white = rng.standard_normal(n).astype(np.float32)
    lo = _peak_db(signal.sosfilt(_butter_band(800.0, 1900.0, order=3), white), 0.0)
    hi = _peak_db(signal.sosfilt(_butter_band(1900.0, 3600.0, order=3), white), 0.0)
    sweep = lo * (1.0 - 0.6 * norm_t) + hi * (0.35 + 0.85 * norm_t)
    shimmer = np.sin(2.0 * np.pi * (1200.0 + 1200.0 * norm_t) * t) * 0.22
    env = np.minimum(1.0, t / 0.025) * np.minimum(1.0, (dur - t) / 0.05) * (0.65 + 0.35 * np.sin(np.pi * norm_t))
    sig = (_peak_db((sweep + shimmer) * env, -18.5) * gain).astype(np.float32)
    return _stereo_tail(sig, tail_ms=110.0, wet=0.18)


def make_caliper_snap(rng: np.random.Generator, duration_s: float = 0.34, gain: float = 1.0) -> np.ndarray:
    """3-stage GeoCaliperRule foley: start tick (2.4 kHz) + ruler zip (1.1–3.2 kHz) + end lock snap (1.7/3.4 kHz)."""
    dur = max(0.24, min(0.75, duration_s))
    n = int(SR * dur)
    out = np.zeros(n, dtype=np.float32)
    t = np.arange(n, dtype=np.float32) / SR

    # Stage 1: Start anchor tick
    tick1 = np.sin(2.0 * np.pi * 2400.0 * t) * np.exp(-t * 95.0) * np.minimum(1.0, t / 0.002)
    out += _peak_db(tick1, 0.0) * 0.85

    # Stage 2: Ruler zip
    z0, z1 = int(0.03 * SR), min(n, int((dur - 0.04) * SR))
    if z1 > z0:
        zw = _peak_db(signal.sosfilt(_butter_band(1100.0, 3200.0, order=3), rng.standard_normal(z1 - z0).astype(np.float32)), 0.0)
        zn = z1 - z0
        z_env = np.maximum(0.0, np.sin(np.pi * np.linspace(0.0, 1.0, zn, dtype=np.float32))) ** 0.7
        out[z0:z1] += zw * z_env * 0.52

    # Stage 3: End lock snap
    s_idx = min(n - 1, int(max(0.18, dur - 0.045) * SR))
    ts = np.arange(n - s_idx, dtype=np.float32) / SR
    snap = (
        0.65 * np.sin(2.0 * np.pi * 1700.0 * ts)
        + 0.45 * np.sin(2.0 * np.pi * 3400.0 * ts)
    ) * np.exp(-ts * 75.0) * np.minimum(1.0, ts / 0.002)
    out[s_idx:] += _peak_db(snap, 0.0)

    sig = (_peak_db(out, -16.5) * gain).astype(np.float32)
    return _stereo_tail(sig, tail_ms=110.0, wet=0.20)


def make_era_stamp(rng: np.random.Generator, gain: float = 1.0) -> np.ndarray:
    """Punchy drum thud (82 -> 42 Hz) + crisp parchment/wood slap (1.4–5.0 kHz) for era badges & X stamps."""
    dur = 0.34
    n = int(SR * dur)
    t = np.arange(n, dtype=np.float32) / SR
    f_thud = 82.0 - 40.0 * np.minimum(1.0, t / 0.08)
    thud = np.sin(2.0 * np.pi * np.cumsum(f_thud) / SR) * np.exp(-t * 18.0) * np.minimum(1.0, t / 0.004)
    slap_noise = signal.sosfilt(_butter_band(1400.0, 5000.0, order=3), rng.standard_normal(n).astype(np.float32))
    slap = _peak_db(slap_noise, 0.0) * np.exp(-t * 36.0) * np.minimum(1.0, t / 0.0025)
    sig = (_peak_db(0.85 * thud + 0.70 * slap, -14.0) * gain).astype(np.float32)
    return _stereo_tail(sig, tail_ms=150.0, wet=0.26)


def make_zone_fill(rng: np.random.Generator, duration_s: float = 0.62, gain: float = 1.0) -> np.ndarray:
    """Rising warm chordal sweep (160 -> 920 Hz) + airy 2.2 kHz breath for polygon/territory glow."""
    dur = max(0.30, min(1.2, duration_s))
    n = int(SR * dur)
    t = np.linspace(0.0, dur, n, dtype=np.float32)
    norm_t = t / dur
    f_sw = 160.0 + 760.0 * (norm_t**1.2)
    chord = (
        0.55 * np.sin(2.0 * np.pi * np.cumsum(f_sw) / SR)
        + 0.35 * np.sin(2.0 * np.pi * np.cumsum(f_sw * 1.498) / SR)
    )
    breath = _peak_db(signal.sosfilt(_butter_band(1700.0, 3200.0, order=3), rng.standard_normal(n).astype(np.float32)), 0.0) * 0.45
    env = (np.maximum(0.0, np.sin(np.pi * norm_t)) ** 1.1) * np.minimum(1.0, t / 0.04)
    sig = (_peak_db((chord + breath) * env, -18.5) * gain).astype(np.float32)
    return _stereo_tail(sig, tail_ms=200.0, wet=0.30)


def make_jet_pass(rng: np.random.Generator, duration_s: float = 0.85, left_to_right: bool = True, gain: float = 1.0) -> np.ndarray:
    """Stereo-panned widebody turbine Doppler flyby (240 -> 1850 -> 360 Hz)."""
    dur = max(0.45, min(1.4, duration_s))
    n = int(SR * dur)
    t = np.linspace(0.0, dur, n, dtype=np.float32)
    norm_t = t / dur
    doppler_f = 240.0 + 1610.0 * np.exp(-((norm_t - 0.38) / 0.20) ** 2)
    turbine = (
        0.55 * np.sin(2.0 * np.pi * np.cumsum(doppler_f) / SR)
        + 0.25 * np.sin(2.0 * np.pi * np.cumsum(doppler_f * 2.0) / SR)
    )
    jet_air = _peak_db(signal.sosfilt(_butter_band(420.0, 4600.0, order=3), rng.standard_normal(n).astype(np.float32)), 0.0)
    env = np.exp(-((norm_t - 0.42) / 0.28) ** 2) * np.minimum(1.0, t / 0.04)
    mono = _peak_db((0.45 * turbine + 0.85 * jet_air) * env, -17.0) * gain
    pan_curve = np.linspace(-0.75, 0.75, n, dtype=np.float32) if left_to_right else np.linspace(0.75, -0.75, n, dtype=np.float32)
    stereo = np.column_stack([
        mono * np.cos((pan_curve + 1.0) * np.pi / 4.0),
        mono * np.sin((pan_curve + 1.0) * np.pi / 4.0),
    ]).astype(np.float32)
    return stereo


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
    warm = signal.sosfilt(_butter_band(50.0, 480.0, order=3), raw)
    env = np.minimum(1.0, t / 0.14) * np.minimum(1.0, np.maximum(0.0, (dur - t) / 0.34))
    sig = (_peak_db(warm * env, -16.5) * (gain / 0.16)).astype(np.float32)
    return _stereo_tail(sig, tail_ms=340.0, wet=0.42)


def make_sonar_ping(freq: float = 1220.0, gain: float = 0.15) -> np.ndarray:
    """Hydrographic / ATC radar ping (harmonic + secondary echo)."""
    dur = 0.46
    n = int(SR * dur)
    t = np.arange(n, dtype=np.float32) / SR
    p1 = (0.76 * np.sin(2.0 * np.pi * freq * t) + 0.24 * np.sin(2.0 * np.pi * (freq * 2.0) * t)) * np.exp(-t * 14.0)
    p1 *= np.minimum(1.0, t / 0.010)
    d = int(SR * 0.145)
    sig = p1.copy()
    sig[d:] += p1[:-d] * 0.30
    sig = (_peak_db(sig, -17.0) * (gain / 0.15)).astype(np.float32)
    return _stereo_tail(sig, tail_ms=200.0, wet=0.35)


def make_lock_pip(freq_a: float = 980.0, freq_b: float = 1480.0, gain: float = 0.14) -> np.ndarray:
    """Clean double UI/pin telemetry lock."""
    n1 = int(SR * 0.065)
    n2 = int(SR * 0.115)
    gap = int(SR * 0.038)
    t1 = np.arange(n1, dtype=np.float32) / SR
    t2 = np.arange(n2, dtype=np.float32) / SR
    p1 = np.sin(2.0 * np.pi * freq_a * t1) * np.minimum(1.0, t1 / 0.005) * np.exp(-t1 * 36.0)
    p2 = (0.78 * np.sin(2.0 * np.pi * freq_b * t2) + 0.22 * np.sin(2.0 * np.pi * (freq_b * 2.0) * t2)) * np.minimum(1.0, t2 / 0.005) * np.exp(-t2 * 24.0)
    out = np.zeros(gap + n2, dtype=np.float32)
    out[:n1] += p1
    out[gap : gap + n2] += p2
    sig = (_peak_db(out, -17.5) * (gain / 0.14)).astype(np.float32)
    return _stereo_tail(sig, tail_ms=110.0, wet=0.22)


def make_dossier_snap(rng: np.random.Generator, gain: float = 0.18) -> np.ndarray:
    """Crisp archival paper decree snap (700–5200 Hz) + soft desk thud (95 Hz)."""
    dur = 0.28
    n = int(SR * dur)
    t = np.arange(n, dtype=np.float32) / SR
    white = rng.standard_normal(n).astype(np.float32)
    paper = _peak_db(signal.sosfilt(_butter_band(700.0, 5200.0, order=3), white), 0.0)
    snap_env = np.minimum(1.0, t / 0.003) * np.exp(-t * 26.0)
    thud = np.sin(2.0 * np.pi * 95.0 * t) * np.exp(-t * 42.0) * 0.65
    sig = (_peak_db(paper * snap_env + thud, -15.5) * (gain / 0.18)).astype(np.float32)
    return _stereo_tail(sig, tail_ms=120.0, wet=0.20)


def make_marker_swipe(rng: np.random.Generator, gain: float = 0.16) -> np.ndarray:
    """Felt-tip highlighter brush swipe (1.2–6.0 kHz) across paper dossier."""
    dur = 0.44
    n = int(SR * dur)
    t = np.arange(n, dtype=np.float32) / SR
    white = rng.standard_normal(n).astype(np.float32)
    brush = _peak_db(signal.sosfilt(_butter_band(1200.0, 6000.0, order=3), white), 0.0)
    env = np.maximum(0.0, np.sin(np.pi * np.clip(t / dur, 0.0, 1.0))) ** 1.1
    sig = (_peak_db(brush * env, -17.5) * (gain / 0.16)).astype(np.float32)
    return _stereo_tail(sig, tail_ms=90.0, wet=0.16)


def make_warning_sonar(gain: float = 0.21) -> np.ndarray:
    """Urgent hull impact thud + twin low marine/ATC caution pulse."""
    dur = 0.62
    n = int(SR * dur)
    t = np.arange(n, dtype=np.float32) / SR
    thud = np.sin(2.0 * np.pi * (88.0 - 44.0 * np.minimum(1.0, t / 0.18)) * t) * np.exp(-t * 14.0) * 0.85
    pulse1 = (0.75 * np.sin(2.0 * np.pi * (290.0 - 50.0 * (t / dur)) * t) + 0.25 * np.sin(2.0 * np.pi * 870.0 * t)) * np.exp(-t * 7.5)
    delay = int(SR * 0.18)
    pulse2 = np.zeros(n, dtype=np.float32)
    pulse2[delay:] = pulse1[:-delay] * 0.65
    sig = (_peak_db((thud + 0.55 * (pulse1 + pulse2)) * np.minimum(1.0, t / 0.008), -15.5) * (gain / 0.21)).astype(np.float32)
    return _stereo_tail(sig, tail_ms=220.0, wet=0.30)


def make_data_burst(gain: float = 0.14) -> np.ndarray:
    """Vox-style 6-tick fast numerical counter ratchet (2.4–4.8 kHz) + 1.44 kHz lock chime."""
    dur = 0.42
    n = int(SR * dur)
    out = np.zeros(n, dtype=np.float32)
    offsets = [0.00, 0.06, 0.115, 0.168, 0.218, 0.265]
    n_tick = int(SR * 0.024)
    tt = np.arange(n_tick, dtype=np.float32) / SR
    for k, off in enumerate(offsets):
        f_tk = 2400.0 + k * 420.0
        tick_k = np.sin(2.0 * np.pi * f_tk * tt) * np.exp(-tt * 145.0) * np.minimum(1.0, tt / 0.0015)
        i0 = int(off * SR)
        end = min(n, i0 + n_tick)
        out[i0:end] += tick_k[: end - i0] * (0.70 + 0.06 * k)
    c0 = int(0.31 * SR)
    tc = np.arange(n - c0, dtype=np.float32) / SR
    out[c0:] += np.sin(2.0 * np.pi * 1440.0 * tc) * np.exp(-tc * 34.0) * 0.85
    sig = (_peak_db(out, -17.5) * (gain / 0.14)).astype(np.float32)
    return _stereo_tail(sig, tail_ms=90.0, wet=0.18)


def make_rail_glide(rng: np.random.Generator, gain: float = 0.16) -> np.ndarray:
    """Signature rhythmic railway track click-clack (800–4200 Hz steel + 140 Hz tie thud)."""
    dur = 0.62
    n = int(SR * dur)
    out = np.zeros(n, dtype=np.float32)
    clack_n = int(SR * 0.055)
    tc = np.arange(clack_n, dtype=np.float32) / SR
    white = rng.standard_normal(clack_n).astype(np.float32)
    steel = _peak_db(signal.sosfilt(_butter_band(800.0, 4200.0, order=3), white), 0.0)
    tie = np.sin(2.0 * np.pi * 140.0 * tc) * 0.60
    clack = (steel * 0.90 + tie) * np.exp(-tc * 46.0) * np.minimum(1.0, tc / 0.003)
    for off, amp in [(0.0, 0.90), (0.14, 1.0), (0.33, 0.85), (0.47, 0.95)]:
        i0 = int(off * SR)
        end = min(n, i0 + clack_n)
        out[i0:end] += clack[: end - i0] * amp
    sig = (_peak_db(out, -17.0) * (gain / 0.16)).astype(np.float32)
    return _stereo_tail(sig, tail_ms=140.0, wet=0.24)


def make_deepwater_chord(gain: float = 0.17) -> np.ndarray:
    """Warm major-9 optimistic chord for breakthroughs & engineering victories."""
    dur = 1.15
    n = int(SR * dur)
    t = np.arange(n, dtype=np.float32) / SR
    freqs = [261.63, 329.63, 392.00, 523.25, 587.33]
    sig = sum(np.sin(2.0 * np.pi * f * t + idx * 0.4) for idx, f in enumerate(freqs)) / len(freqs)
    env = np.minimum(1.0, t / 0.055) * np.exp(-t * 2.4)
    out = (_peak_db(sig * env, -16.5) * (gain / 0.17)).astype(np.float32)
    return _stereo_tail(out, tail_ms=340.0, wet=0.45)


def make_caliper_tick(rng: np.random.Generator, gain: float = 0.12) -> np.ndarray:
    """Precision caliper tick/zip alias backed by normalized `make_caliper_snap`."""
    return make_caliper_snap(rng, duration_s=0.30, gain=0.85 * (gain / 0.12))


def _write_stereo_wav(path: Path, arr: np.ndarray) -> None:
    clean = np.nan_to_num(arr, nan=0.0, posinf=0.94, neginf=-0.94)
    pcm16 = (np.clip(clean, -0.94, 0.94) * 32767.0).astype(np.int16)
    with wave.open(str(path), "wb") as wf:
        wf.setnchannels(2)
        wf.setsampwidth(2)
        wf.setframerate(SR)
        wf.writeframes(pcm16.tobytes())


def _ev_time(item: Any) -> float:
    return float(item["t"]) if isinstance(item, dict) else float(item)


def _ev_dict(item: Any) -> dict[str, Any]:
    return item if isinstance(item, dict) else {"t": float(item)}


def _scaffold_baseline_cues(events: dict[str, Any], scene_plan_path: Path | None, duration_s: float) -> dict[str, Any]:
    """Ensure no silent scene gaps > 6s exist when --scene-plan is supplied."""
    if not scene_plan_path or not scene_plan_path.is_file():
        return events
    sp = json.loads(scene_plan_path.read_text(encoding="utf-8"))
    scenes = [sc for sc in sp.get("scenes", []) if float(sc.get("start_seconds", 0.0)) < duration_s]
    if not scenes:
        return events

    out = {k: list(v) if isinstance(v, list) else v for k, v in events.items()}
    whooshes = list(out.get("whooshes", []))
    braams = list(out.get("chapter_braams", []))
    pops = list(out.get("pin_pops", []))
    calipers = list(out.get("caliper_snaps", []))
    draws = list(out.get("line_draws", []))

    all_non_tick: list[float] = []
    for k, items in out.items():
        if k == "scene_ticks" or not isinstance(items, list):
            continue
        for it in items:
            all_non_tick.append(_ev_time(it))

    for idx, sc in enumerate(scenes):
        s0 = float(sc["start_seconds"])
        s1 = min(duration_s, float(sc.get("end_seconds", duration_s)))
        span = max(0.5, s1 - s0)
        count_in_scene = sum(1 for ts in all_non_tick if (s0 - 0.15) <= ts <= (s1 - 0.10))
        if count_in_scene >= 2:
            continue
        if idx == 0 and not any(abs(ts - s0) < 0.8 for ts in all_non_tick):
            braams.append(round(s0, 3))
        elif not any(abs(ts - s0) < 0.8 for ts in all_non_tick):
            whooshes.append({"t": round(s0, 3), "up": bool(idx % 2 == 1), "dur": 0.36})
        if span >= 2.2:
            pops.append({"t": round(s0 + 0.35, 3), "count": 1})
        if span >= 6.0:
            calipers.append({"t": round(s0 + span * 0.45, 3), "dur": 0.34})
        elif span >= 4.0:
            draws.append({"t": round(s0 + span * 0.45, 3), "dur": 0.40})

    out["whooshes"] = whooshes
    out["chapter_braams"] = braams
    out["pin_pops"] = pops
    out["caliper_snaps"] = calipers
    out["line_draws"] = draws
    return out


def _render_sfx_bus(events: dict[str, Any], sfx: np.ndarray, rng: np.random.Generator) -> int:
    """Render all cue categories onto the stereo SFX buffer and return total synthesized cue count."""
    count = 0
    intervals = [1.0, 1.122, 1.26, 1.335, 1.498, 1.682]

    def _pan(item: dict[str, Any], idx: int, default: float = 0.0) -> float:
        if "pan" in item:
            return float(item["pan"])
        return (-0.18 if idx % 2 == 0 else 0.18) if default == 0.0 else default

    for idx, item in enumerate(events.get("chapter_braams", [])):
        _mix_at(sfx, _ev_time(item), make_chapter_braam(), pan=_ev_dict(item).get("pan", 0.0))
        count += 1
    for idx, item in enumerate(events.get("whooshes", [])):
        w = _ev_dict(item)
        _mix_at(
            sfx,
            max(0.0, float(w["t"]) - 0.018),
            make_whoosh(rng, duration_s=float(w.get("dur", 0.42)), pitch_up=bool(w.get("up", True))),
            pan=_pan(w, idx),
        )
        count += 1
    for idx, item in enumerate(events.get("pin_pops", [])):
        p = _ev_dict(item)
        t0 = float(p["t"])
        burst_n = max(1, min(6, int(p.get("count", 1))))
        stagger = float(p.get("stagger", 0.11))
        for k in range(burst_n):
            pitch_k = float(p.get("pitch", intervals[k % len(intervals)]))
            _mix_at(sfx, t0 + k * stagger, make_pin_pop(freq_scale=pitch_k), pan=float(p.get("pan", -0.10 + 0.06 * k)))
            count += 1
    for idx, item in enumerate(events.get("line_draws", [])):
        d = _ev_dict(item)
        _mix_at(sfx, float(d["t"]), make_line_draw(rng, duration_s=float(d.get("dur", 0.42))), pan=_pan(d, idx))
        count += 1
    for idx, item in enumerate(events.get("caliper_snaps", [])):
        c = _ev_dict(item)
        _mix_at(sfx, float(c["t"]), make_caliper_snap(rng, duration_s=float(c.get("dur", 0.34))), pan=_pan(c, idx, 0.08))
        count += 1
    for idx, item in enumerate(events.get("era_stamps", [])):
        e = _ev_dict(item)
        _mix_at(sfx, float(e["t"]), make_era_stamp(rng), pan=float(e.get("pan", 0.0)))
        count += 1
    for idx, item in enumerate(events.get("zone_fills", [])):
        z = _ev_dict(item)
        _mix_at(sfx, float(z["t"]), make_zone_fill(rng, duration_s=float(z.get("dur", 0.62))), pan=float(z.get("pan", 0.0)))
        count += 1
    for idx, item in enumerate(events.get("jet_passes", [])):
        j = _ev_dict(item)
        _mix_at(sfx, float(j["t"]), make_jet_pass(rng, duration_s=float(j.get("dur", 0.85)), left_to_right=bool(j.get("ltr", idx % 2 == 0))), pan=0.0)
        count += 1

    simple_map = [
        ("ship_horns", lambda _it, _i: make_ship_horn(), lambda i: -0.22 if i % 2 == 0 else 0.22, 0.0),
        ("sonar_pings", lambda _it, i: make_sonar_ping(freq=1220.0 + (i % 3) * 90.0), lambda i: 0.14 if i % 2 == 0 else -0.14, 0.0),
        ("locks", lambda _it, _i: make_lock_pip(), lambda _i: 0.08, 0.0),
        ("dossier_snaps", lambda _it, _i: make_dossier_snap(rng), lambda _i: 0.12, 0.0),
        ("marker_swipes", lambda _it, _i: make_marker_swipe(rng), lambda _i: 0.15, 0.0),
        ("warnings", lambda _it, _i: make_warning_sonar(), lambda _i: 0.0, 0.0),
        ("data_bursts", lambda _it, _i: make_data_burst(), lambda _i: 0.10, 0.0),
        ("rail_glides", lambda _it, _i: make_rail_glide(rng), lambda _i: -0.08, 0.0),
        ("clearances", lambda _it, _i: make_deepwater_chord(), lambda _i: 0.0, 0.0),
        ("scene_ticks", lambda _it, _i: make_caliper_tick(rng), lambda _i: 0.0, -0.015),
    ]
    for key, builder, pan_fn, offset in simple_map:
        for idx, item in enumerate(events.get(key, [])):
            d = _ev_dict(item)
            _mix_at(sfx, max(0.0, float(d["t"]) + offset), builder(d, idx), pan=float(d.get("pan", pan_fn(idx))))
            count += 1

    return count


def main() -> None:
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("--narration", required=True, type=Path, help="Input narration_full.mp3 path")
    parser.add_argument("--events-json", type=Path, default=None, help="Optional JSON file of SFX timestamps")
    parser.add_argument("--scene-plan", type=Path, default=None, help="Optional scene_plan.json (used for fallback scaffolding only when --auto-scaffold is set or 0 authored cues exist)")
    parser.add_argument("--auto-scaffold", action="store_true", help="Auto-inject baseline cues into scenes with <2 cues")
    parser.add_argument("--sfx-out", required=True, type=Path, help="Output procedural bed + SFX MP3 path")
    parser.add_argument("--master-out", required=True, type=Path, help="Output master_audio.mp3 path")
    parser.add_argument("--duration", required=True, type=float, help="Exact composition duration in seconds")
    parser.add_argument("--no-verify", action="store_true", help="Skip built-in spectral & loudness QA checks")
    args = parser.parse_args()

    events = json.loads(args.events_json.read_text(encoding="utf-8")) if args.events_json and args.events_json.is_file() else {}
    total_loaded_cues = sum(len(v) for v in events.values() if isinstance(v, list))
    if args.auto_scaffold or total_loaded_cues == 0:
        events = _scaffold_baseline_cues(events, args.scene_plan, args.duration)
    rng = np.random.default_rng(20261116)

    bed = make_documentary_pulse(args.duration)
    sfx = np.zeros_like(bed)
    cue_count = _render_sfx_bus(events, sfx, rng)
    sfx = np.clip(sfx, -0.92, 0.92).astype(np.float32)

    sfx_bands = _active_band_rms_db(sfx)
    sfx_peak_db = round(20.0 * np.log10(float(np.max(np.abs(sfx))) + 1e-12), 1)
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

        # 3-Bus Speech-Priority Mix: Narration primary, 96 BPM Pulse Bed sidechain-ducked, Restrained SFX gently pocketed & ducked
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
                "[0:a]asplit=3[vo][sc_bed][sc_sfx];"
                "[1:a]equalizer=f=2600:width_type=o:w=1.4:g=-3.5[bed_eq];"
                "[bed_eq][sc_bed]sidechaincompress=threshold=0.022:ratio=4.5:attack=15:release=240[ducked_bed];"
                "[2:a]equalizer=f=2800:width_type=o:w=1.2:g=-3.0[sfx_eq];"
                "[sfx_eq][sc_sfx]sidechaincompress=threshold=0.035:ratio=2.2:attack=10:release=160[sfx_clean];"
                "[vo][ducked_bed][sfx_clean]amix=inputs=3:duration=first:dropout_transition=0:normalize=0,"
                "volume=1.6dB,alimiter=limit=0.84:level=0:attack=3:release=40[out]",
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
    finally:
        bed_wav.unlink(missing_ok=True)
        sfx_wav.unlink(missing_ok=True)
        combo_wav.unlink(missing_ok=True)

    probe = subprocess.run(
        ["ffmpeg", "-hide_banner", "-i", str(args.master_out), "-af", "ebur128=peak=true,volumedetect", "-f", "null", "-"],
        capture_output=True,
        text=True,
    )
    max_m = re.search(r"max_volume:\s*(-?[\d.]+)\s*dB", probe.stderr)
    mean_m = re.search(r"mean_volume:\s*(-?[\d.]+)\s*dB", probe.stderr)
    lufs_m = re.findall(r"I:\s*(-?[\d.]+)\s*LUFS", probe.stderr)
    master_max_db = float(max_m.group(1)) if max_m else 0.0
    master_mean_db = float(mean_m.group(1)) if mean_m else -99.0
    master_lufs = float(lufs_m[-1]) if lufs_m else -99.0

    band_str = " ".join(f"{k}={v}dB" for k, v in sfx_bands.items())
    print(
        f"[ACOUSTIC QA] cues={cue_count} | sfx_peak={sfx_peak_db} dB | active {band_str} | "
        f"master max={master_max_db} dB mean={master_mean_db} dB I={master_lufs} LUFS"
    )
    if not args.no_verify:
        if cue_count == 0:
            raise RuntimeError("Acoustic QA FAILED: 0 SFX cues synthesized (pass --events-json or --scene-plan).")
        if not np.isfinite(sfx_peak_db) or sfx_peak_db < -24.0:
            raise RuntimeError(f"Acoustic QA FAILED: sfx_peak={sfx_peak_db} dB < -24.0 dB threshold.")
        if not np.isfinite(sfx_bands["pres2.5k-7k"]) or sfx_bands["pres2.5k-7k"] < -52.0:
            raise RuntimeError(f"Acoustic QA FAILED: active pres2.5k-7k={sfx_bands['pres2.5k-7k']} dB < -52.0 dB threshold.")
        if not np.isfinite(master_max_db) or master_max_db > -1.2:
            raise RuntimeError(f"Acoustic QA FAILED: master max_volume={master_max_db} dB exceeds -1.2 dB ceiling.")
    print(f"[OK] Wrote {args.sfx_out.name} and {args.master_out.name}")


if __name__ == "__main__":
    main()
