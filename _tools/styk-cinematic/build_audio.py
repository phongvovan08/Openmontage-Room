"""Original 40-second night-office score, effects and cached Vietnamese narration.

Usage: python _tools/styk-cinematic/build_audio.py
An optional output-folder motion-events.json supplies exact footstep contacts.
No network, downloaded music, or changes to the original narration are required.
"""
from __future__ import annotations

from pathlib import Path
import hashlib
import json
import math
import subprocess
import wave

import numpy as np


ROOT = Path(__file__).resolve().parents[2]
OUT = ROOT / 'Chu-De/Be-Mochi-Mam-Xanh/demo-stykanimate-cau-chuyen'
AUDIO = OUT / 'audio'
VOICE = ROOT / 'Chu-De/Be-Mochi-Mam-Xanh/demo-3-phong-cach-tham-khao/audio/narration.mp3'
SR = 48_000
DURATION = 40.0
N = int(SR * DURATION)
SEED = 20261107


def smooth(x: np.ndarray) -> np.ndarray:
    x = np.clip(x, 0.0, 1.0)
    return x * x * (3.0 - 2.0 * x)


def gate(t: np.ndarray, start: float, end: float, fade: float = 0.4) -> np.ndarray:
    return smooth((t - start) / fade) * smooth((end - t) / fade)


def db(value: float) -> float:
    return round(20.0 * math.log10(max(value, 1e-12)), 3)


def rms(a: np.ndarray) -> float:
    return float(np.sqrt(np.mean(np.square(a, dtype=np.float64))))


def write_wave(file: Path, data: np.ndarray) -> None:
    assert data.shape == (N, 2), data.shape
    with wave.open(str(file), 'wb') as f:
        f.setnchannels(2)
        f.setsampwidth(2)
        f.setframerate(SR)
        f.writeframes((np.clip(data, -1, 1) * 32767).astype('<i2').tobytes())


def decode_voice() -> np.ndarray:
    raw = subprocess.check_output([
        'ffmpeg', '-nostdin', '-v', 'error', '-i', str(VOICE),
        '-af', 'atempo=0.86', '-ar', str(SR), '-ac', '2', '-f', 'f32le', '-'
    ])
    samples = np.frombuffer(raw, dtype='<f4').reshape(-1, 2).astype(np.float64)
    result = np.zeros((N, 2), dtype=np.float64)
    length = min(len(samples), N - SR)
    result[SR:SR + length] = samples[:length]
    return result


def load_events() -> tuple[list[dict], Path]:
    file = OUT / 'motion-events.json'
    if not file.exists():
        return [], file
    data = json.loads(file.read_text(encoding='utf-8'))
    if isinstance(data, dict):
        data = data.get('events', data.get('contacts', []))
    events = []
    for event in data:
        at = float(event.get('time', event.get('at', -1)))
        if 0 <= at < DURATION:
            events.append({**event, 'time': at})
    return sorted(events, key=lambda e: e['time']), file


def main() -> None:
    AUDIO.mkdir(parents=True, exist_ok=True)
    rng = np.random.default_rng(SEED)
    t = np.arange(N, dtype=np.float64) / SR
    voice = decode_voice()
    # The ducking follower is measured in 20-ms blocks. It affects the bed only.
    block = 960
    blocks = np.sqrt(np.mean(voice.reshape(-1, block, 2) ** 2, axis=(1, 2)))
    follower = np.convolve(blocks, np.ones(13) / 13, mode='same')
    activity = smooth((np.repeat(follower, block) - .009) / .035)
    duck = 1.0 - .50 * activity
    global_fade = smooth(t / 1.25) * smooth((DURATION - t) / 2.3)
    ambience = np.zeros_like(voice)
    music = np.zeros_like(voice)
    fx = np.zeros_like(voice)
    ledger: list[dict] = []

    def add(at: float, mono: np.ndarray, level: float = 1.0, pan: float = 0.5,
            kind: str = 'effect', label: str = '') -> None:
        start = int(round(at * SR))
        source_start = max(0, -start)
        start = max(0, start)
        length = min(len(mono) - source_start, N - start)
        if length <= 0:
            return
        pan = float(np.clip(pan, 0.05, 0.95))
        stereo_gain = np.array([math.cos(pan * math.pi / 2), math.sin(pan * math.pi / 2)])
        fx[start:start + length] += mono[source_start:source_start + length, None] * level * stereo_gain
        ledger.append({'time': round(at, 4), 'kind': kind, 'label': label, 'seconds': round(len(mono) / SR, 4)})

    # Soft rain on the glass, separate stereo fields, a barely audible room hum.
    for ch in range(2):
        white = rng.normal(size=N)
        near = np.convolve(white, np.ones(13) / 13, mode='same')
        far = np.convolve(white, np.ones(161) / 161, mode='same')
        rain = near * .0045 + far * .008 + white * .00035
        sway = .83 + .17 * np.sin(t * .21 + ch * 1.7)
        ambience[:, ch] = rain * sway + np.sin(2 * math.pi * (58.1 + ch * .08) * t) * .00055
    ambience *= (global_fade * (1.0 - .14 * smooth((t - 28.5) / 3)))[:, None]

    # Long warm partials: original deterministic synthesis, with a harmonic release.
    sections = [
        (0.0, 10.8, [146.8324, 174.6141, 220.0], .0037),
        (10.0, 20.8, [146.8324, 164.8138, 233.0819], .0030),
        (20.0, 29.2, [130.8128, 164.8138, 195.9977], .0035),
        (28.5, 40.0, [174.6141, 220.0, 261.6256], .0042),
    ]
    for start, end, notes, gain in sections:
        env = gate(t, start, end, 1.4)
        for i, freq in enumerate(notes):
            for ch in range(2):
                f = freq * (1 + (.0007 if ch else -.0007))
                sig = np.sin(2 * math.pi * f * t + i * .71)
                sig += .12 * np.sin(2 * math.pi * f * 2 * t + i)
                music[:, ch] += sig * env * gain * (0.92 + .08 * np.sin(t * .4 + i))

    # Sparse felt/plucked notes, kept behind the narrator rather than a busy beat.
    for at, freq in [(0.25, 293.665), (4.5, 349.228), (8.8, 440), (20.2, 261.626),
                     (22.2, 329.628), (28.7, 349.228), (31.0, 440), (33.4, 523.251),
                     (36.2, 440), (37.8, 349.228)]:
        x = np.arange(int(SR * 2.1)) / SR
        attack = smooth(x / .009)
        sig = (np.sin(2 * math.pi * freq * x) + .18 * np.sin(2 * math.pi * freq * 2.003 * x))
        sig *= attack * np.exp(-x * 3.4) * .011
        n = int(at * SR)
        length = min(len(sig), N - n)
        for ch, gain in enumerate([.86, .72]):
            music[n:n + length, ch] += sig[:length] * gain

    # The anxiety grows in texture, then drops away at the breathing beat.
    tension = gate(t, 5.7, 20.05, .8) * (.25 + .75 * smooth((t - 5.7) / 13.8))
    pulse = np.maximum(0, np.sin(2 * math.pi * (1.22 * t + .009 * t * t))) ** 7
    for ch in range(2):
        low = np.sin(2 * math.pi * 73.416 * t + ch * .05) * .006
        whisper = np.convolve(rng.normal(size=N), np.ones(35) / 35, mode='same') * .006
        music[:, ch] += tension * (low * (.3 + .7 * pulse) + whisper)
    music *= (global_fade * duck * 3.1)[:, None]
    ambience *= 2.3

    def bell(at: float, base: float, strength: float, warmth: bool = False) -> None:
        for i, ratio in enumerate([1.0, 1.25 if warmth else 1.4983]):
            x = np.arange(int(.85 * SR)) / SR
            freq = base * ratio
            sig = (np.sin(2 * math.pi * freq * x) + .17 * np.sin(2 * math.pi * freq * 2.002 * x))
            sig *= smooth(x / .004) * np.exp(-x * 7.2)
            add(at + i * .105, sig, strength, .48 + i * .12, 'message', 'warm reply' if warmth else 'incoming')

    bell(2.35, 1046.502, .058)
    bell(28.50, 783.991, .053, warmth=True)
    # A small, tactile desk-phone buzz before the first ping.
    x = np.arange(int(.22 * SR)) / SR
    sig = (np.sin(2 * math.pi * 125 * x) + .35 * np.sin(2 * math.pi * 250 * x)) * np.sin(math.pi * x / .22) ** 2
    add(2.05, sig, .023, .58, 'phone-buzz')

    for i, at in enumerate([2.4, 5.7, 10.4, 20.0, 23.3, 28.5, 32.3]):
        length = .24 if at != 20 else .50
        x = np.arange(int(length * SR)) / SR
        noise = np.convolve(rng.normal(size=len(x)), np.ones(19) / 19, mode='same')
        env = np.sin(math.pi * x / length) ** 2
        sig = noise * env
        add(at - .10, sig, .032 if at != 20 else .018, .35 + (i % 3) * .15, 'transition')

    # Cloth exhale / room air widens as the scene settles.
    x = np.arange(int(1.55 * SR)) / SR
    sig = np.convolve(rng.normal(size=len(x)), np.ones(53) / 53, mode='same')
    sig *= np.sin(math.pi * x / 1.55) ** 2
    add(20.45, sig, .025, .5, 'settle', 'gentle room-air release')

    for i, at in enumerate([23.52, 23.68, 23.87, 24.13, 24.31, 24.58, 24.71, 25.04, 25.27, 25.48]):
        x = np.arange(int(.042 * SR)) / SR
        noise = rng.normal(size=len(x))
        sig = (noise * .35 + np.sin(2 * math.pi * (720 + i % 3 * 120) * x)) * np.exp(-x * 160)
        sig *= smooth(x / .0015)
        add(at, sig, .012, .52 + .05 * math.sin(i), 'typing')
    x = np.arange(int(.12 * SR)) / SR
    add(25.58, np.sin(2 * math.pi * (660 + 700 * x) * x) * np.exp(-x * 35), .021, .65, 'send')

    events, event_file = load_events()
    for index, event in enumerate(events):
        if event.get('kind', 'footstep') != 'footstep':
            continue
        x = np.arange(int(.16 * SR)) / SR
        noise = rng.normal(size=len(x))
        noise = np.convolve(noise, np.ones(9) / 9, mode='same')
        freq = 83 + index % 4 * 6
        heel = np.sin(2 * math.pi * freq * x) * np.exp(-x * 48)
        scuff = noise * np.exp(-x * 31)
        sig = (heel * .8 + scuff * .8) * smooth(x / .002)
        position = float(event.get('x', 960))
        pan = .25 + .5 * np.clip(position / 1920, 0, 1)
        add(float(event['time']), sig, .060, pan, 'footstep', str(event.get('foot', index % 2)))

    # A quiet ending cadence, with one short bright point at the reveal.
    for i, freq in enumerate([349.228, 440.0, 523.251, 698.456]):
        x = np.arange(int(1.2 * SR)) / SR
        sig = np.sin(2 * math.pi * freq * x) * smooth(x / .009) * np.exp(-x * 4.8)
        add(28.62 + i * .09, sig, .022, .32 + i * .13, 'resolution')

    fx *= (1.0 - .16 * activity)[:, None]
    master = voice + ambience + music + fx
    peak_before = float(np.max(np.abs(master)))
    normalization = min(1.0, .84 / max(peak_before, 1e-12))
    master *= normalization
    assert master.shape == (N, 2) and np.isfinite(master).all()
    assert float(np.max(np.abs(master))) <= .840001
    write_wave(AUDIO / 'master.wav', master)
    write_wave(AUDIO / 'narration.wav', voice)
    write_wave(AUDIO / 'music-and-room.wav', ambience + music)
    report = {
        'durationSeconds': DURATION,
        'sampleRate': SR,
        'channels': 2,
        'narration': {'source': str(VOICE.relative_to(ROOT)), 'sourceSha256': hashlib.sha256(VOICE.read_bytes()).hexdigest(),
                      'atempo': .86, 'leadInSeconds': 1.0, 'gainBeforeMaster': 1.0},
        'scoreAndEffects': 'Original deterministic synthesis; no music download or reused music track.',
        'seed': SEED,
        'ducking': 'Music bed reduced up to 6 dB from a measured narration envelope; effects reduced up to 1.5 dB.',
        'masterGain': round(normalization, 6),
        'masterPeakDbFS': db(float(np.max(np.abs(master)))),
        'masterRmsDbFS': db(rms(master)),
        'stemRmsDbFS': {'narration': db(rms(voice)), 'ambience': db(rms(ambience)), 'music': db(rms(music)), 'effects': db(rms(fx))},
        'motionEventsFile': str(event_file.relative_to(ROOT)),
        'motionEventsPresent': event_file.exists(),
        'footsteps': sum(e['kind'] == 'footstep' for e in ledger),
        'effects': ledger,
        'outputSha256': hashlib.sha256((AUDIO / 'master.wav').read_bytes()).hexdigest(),
    }
    (AUDIO / 'audio-report.json').write_text(json.dumps(report, ensure_ascii=False, indent=2), encoding='utf-8')
    print(json.dumps({k: report[k] for k in ['durationSeconds', 'masterPeakDbFS', 'masterRmsDbFS', 'footsteps', 'motionEventsPresent']}))


if __name__ == '__main__':
    main()
