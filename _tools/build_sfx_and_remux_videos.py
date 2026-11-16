"""
Generate:
1. A clearly audible, emotional Melodic Felt-Piano + Warm Cello/String Pad BGM (ambient_music.wav, 70s)
   tuned for laptop & mobile speakers (220 Hz - 1600 Hz melodic midrange).
2. A 10-piece studio SFX pack (48kHz stereo WAV) + synchronized 69.0s SFX stems.
3. Clean 3-Layer Master Audio Mix (Narration + Sidechain-Ducked Melodic Piano BGM + Synchronized Transition SFX)
   remuxed losslessly (-c:v copy) into all rendered MP4 videos in
   Chu-De/Tam-Ly-Hanh-Vi-Giao-Tiep/video-phan-ung-cam-xuc/.
"""

from __future__ import annotations

import subprocess
import wave
from pathlib import Path
import numpy as np

SR = 48000
ROOT = Path(__file__).resolve().parent.parent
EP_DIR = ROOT / "remotion-composer" / "public" / "episodes" / "reactive-mind"
EP_LIGHT_DIR = ROOT / "remotion-composer" / "public-audio-only" / "episodes" / "reactive-mind"
SFX_DIR = EP_DIR / "sfx"
SFX_LIGHT_DIR = EP_LIGHT_DIR / "sfx"
VIDEO_DIR = ROOT / "Chu-De" / "Tam-Ly-Hanh-Vi-Giao-Tiep" / "video-phan-ung-cam-xuc"


def save_wav(path: Path, samples_stereo: np.ndarray) -> None:
    path.parent.mkdir(parents=True, exist_ok=True)
    clipped = np.clip(samples_stereo, -0.98, 0.98)
    pcm = (clipped * 32767.0).astype(np.int16)
    with wave.open(str(path), "wb") as wf:
        wf.setnchannels(2)
        wf.setsampwidth(2)
        wf.setframerate(SR)
        wf.writeframes(pcm.tobytes())


def synth_piano_note(freq: float, duration: float = 2.6, velocity: float = 1.0) -> np.ndarray:
    """Warm felt-piano tone with soft hammer transient and rich midrange harmonics."""
    n = int(SR * duration)
    t = np.linspace(0.0, duration, n, endpoint=False)
    attack = 1.0 - np.exp(-t * 110.0)
    # Felt piano harmonic profile (audible on phone/laptop speakers)
    partials = [
        (1.0, 1.00, 1.9),
        (2.0, 0.62, 2.5),
        (3.0, 0.34, 3.2),
        (4.0, 0.16, 4.1),
        (5.0, 0.07, 5.2),
    ]
    sig = np.zeros(n)
    for mult, amp, decay in partials:
        # Slight detune for warm acoustic chorus
        f1 = freq * mult
        f2 = freq * mult * 1.0012
        sig += amp * 0.5 * (np.sin(2.0 * np.pi * f1 * t) + np.sin(2.0 * np.pi * f2 * t)) * np.exp(-t * decay)

    # Soft felt hammer thump around 450 Hz
    hammer = np.sin(2.0 * np.pi * 460.0 * t) * np.exp(-t * 65.0) * 0.18
    mono = (sig + hammer) * attack * velocity * 0.42
    # Stereo spread
    left = mono * (1.0 + 0.08 * np.sin(2.0 * np.pi * 1.8 * t))
    right = mono * (1.0 - 0.08 * np.sin(2.0 * np.pi * 1.8 * t))
    return np.column_stack([left, right])


def build_melodic_piano_bgm(total_sec: float = 70.0) -> np.ndarray:
    """Compose a 70s emotional felt-piano & warm string pad soundtrack (Am9 -> Fmaj7 -> Cmaj7 -> G6)."""
    total_samples = int(total_sec * SR)
    bgm = np.zeros((total_samples, 2), dtype=np.float64)
    t_full = np.linspace(0.0, total_sec, total_samples, endpoint=False)

    # Chord progression every 4.0 seconds (bar = 4.0s, 8th note = 0.5s)
    # Frequencies chosen in 220 Hz - 1050 Hz so laptop & phone speakers reproduce them clearly
    chords = [
        # Am9: A3(220), E4(329.6), G4(392), B4(493.9), C5(523.3), E5(659.3)
        [220.00, 329.63, 392.00, 523.25, 493.88, 392.00, 659.25, 523.25],
        # Fmaj7: F3(174.6), C4(261.6), E4(329.6), A4(440.0), C5(523.3), E5(659.3)
        [174.61, 261.63, 329.63, 440.00, 523.25, 440.00, 659.25, 523.25],
        # Cmaj7: C4(261.6), E4(329.6), G4(392.0), B4(493.9), D5(587.3), G5(784.0)
        [261.63, 329.63, 392.00, 493.88, 587.33, 493.88, 784.00, 587.33],
        # G6 / Em7: G3(196.0), B3(246.9), D4(293.7), G4(392.0), B4(493.9), D5(587.3)
        [196.00, 246.94, 293.66, 392.00, 493.88, 392.00, 587.33, 493.88],
    ]

    bar_len = 4.0
    step_len = 0.5
    num_bars = int(np.ceil(total_sec / bar_len))

    for bar in range(num_bars):
        chord = chords[bar % len(chords)]
        bar_start = bar * bar_len

        # Warm sustained string/pad chord in the background of each bar
        pad_dur = min(bar_len + 0.8, total_sec - bar_start)
        if pad_dur > 0.2:
            pn = int(SR * pad_dur)
            pt = np.linspace(0.0, pad_dur, pn, endpoint=False)
            pad_env = np.sin(np.pi * (pt / pad_dur)) ** 1.3
            f_root, f_third, f_fifth = chord[0], chord[2], chord[3]
            pad_l = (
                np.sin(2.0 * np.pi * f_root * pt) * 0.35
                + np.sin(2.0 * np.pi * (f_root * 2.0) * pt) * 0.25
                + np.sin(2.0 * np.pi * f_third * pt) * 0.25
                + np.sin(2.0 * np.pi * f_fifth * pt) * 0.20
            ) * pad_env * 0.24
            pad_r = (
                np.sin(2.0 * np.pi * (f_root * 1.002) * pt) * 0.35
                + np.sin(2.0 * np.pi * (f_root * 2.002) * pt) * 0.25
                + np.sin(2.0 * np.pi * (f_third * 0.999) * pt) * 0.25
                + np.sin(2.0 * np.pi * (f_fifth * 1.001) * pt) * 0.20
            ) * pad_env * 0.24
            overlay_at(bgm, np.column_stack([pad_l, pad_r]), bar_start, gain=1.0)

        # Arpeggiated felt piano notes every 0.5s
        for step_idx, note_freq in enumerate(chord):
            note_time = bar_start + step_idx * step_len
            if note_time >= total_sec - 0.2:
                break
            vel = 0.95 if step_idx in (0, 3, 6) else 0.72
            note_audio = synth_piano_note(note_freq, duration=2.4, velocity=vel)
            # Alternate slight stereo pan per arpeggio note
            pan = 0.35 + 0.3 * ((step_idx % 3) / 2.0)
            note_stereo = np.column_stack([note_audio[:, 0] * (1.2 - pan), note_audio[:, 1] * (0.6 + pan)])
            overlay_at(bgm, note_stereo, note_time, gain=0.85)

    # Smooth fade-in (1.2s) and fade-out (2.5s)
    fade_in = np.minimum(1.0, t_full / 1.2)
    fade_out = np.minimum(1.0, (total_sec - t_full) / 2.5)
    env = np.minimum(fade_in, fade_out)[:, None]
    bgm = bgm * env

    # Normalize BGM peak to ~0.78 (-2.1 dB) so it has plenty of body before mixing
    peak = np.max(np.abs(bgm)) + 1e-8
    bgm = (bgm / peak) * 0.78
    return bgm


def make_whoosh(duration: float = 0.44, pitch_start: float = 180.0, pitch_peak: float = 1650.0) -> np.ndarray:
    """Doppler filtered air whoosh with stereo pan (left -> right)."""
    n = int(SR * duration)
    t = np.linspace(0.0, duration, n, endpoint=False)
    rng = np.random.default_rng(42)
    noise = rng.standard_normal(n)

    env = np.sin(np.pi * (t / duration)) ** 1.8
    freq = pitch_start + (pitch_peak - pitch_start) * np.sin(np.pi * (t / duration))
    phase = 2.0 * np.pi * np.cumsum(freq) / SR
    tonal_air = np.sin(phase) * 0.42 + np.sin(phase * 0.5) * 0.30

    filtered = np.convolve(noise, np.ones(10) / 10.0, mode="same")
    mono = (filtered * 0.65 + tonal_air) * env * 0.85

    pan = np.linspace(0.20, 0.85, n)
    left = mono * np.cos(pan * np.pi * 0.5)
    right = mono * np.sin(pan * np.pi * 0.5)
    return np.column_stack([left, right])


def make_sub_impact(duration: float = 0.72) -> np.ndarray:
    """Deep cinematic sub-bass drop + warm transient punch for chapter transitions."""
    n = int(SR * duration)
    t = np.linspace(0.0, duration, n, endpoint=False)
    freq = 42.0 + 95.0 * np.exp(-t * 14.0)
    phase = 2.0 * np.pi * np.cumsum(freq) / SR
    sub = np.sin(phase) * np.exp(-t * 4.2)

    punch_freq = 220.0 * np.exp(-t * 32.0)
    punch = np.sin(2.0 * np.pi * np.cumsum(punch_freq) / SR) * np.exp(-t * 24.0) * 0.65

    mono = (sub * 0.80 + punch) * 0.88
    return np.column_stack([mono, mono])


def make_pop_pluck(duration: float = 0.14, base_freq: float = 420.0) -> np.ndarray:
    """Clean UI card pop / pluck sound."""
    n = int(SR * duration)
    t = np.linspace(0.0, duration, n, endpoint=False)
    freq = base_freq + 360.0 * np.exp(-t * 48.0)
    phase = 2.0 * np.pi * np.cumsum(freq) / SR
    env = np.exp(-t * 26.0) * (1.0 - np.exp(-t * 450.0))
    mono = (np.sin(phase) + 0.4 * np.sin(phase * 2.0)) * env * 0.75
    return np.column_stack([mono, mono])


def make_camera_shutter(duration: float = 0.18) -> np.ndarray:
    """Mechanical SLR mirror slap + shutter curtain click for Polaroids/notes."""
    n = int(SR * duration)
    t = np.linspace(0.0, duration, n, endpoint=False)
    rng = np.random.default_rng(108)
    burst1 = rng.standard_normal(n) * np.exp(-t * 95.0)
    burst2_t = np.maximum(0.0, t - 0.055)
    mask2 = (t >= 0.055).astype(float)
    burst2 = rng.standard_normal(n) * np.exp(-burst2_t * 110.0) * mask2 * 0.85
    click_tone = np.sin(2.0 * np.pi * 1850.0 * t) * np.exp(-t * 120.0) * 0.45
    mono = (burst1 * 0.55 + burst2 * 0.5 + click_tone) * 0.80
    return np.column_stack([mono, mono])


def make_typing_burst(duration: float = 0.85) -> np.ndarray:
    """Mechanical key clicks for UI chat / phone message scenes."""
    n = int(SR * duration)
    out = np.zeros(n)
    rng = np.random.default_rng(77)
    click_times = [0.02, 0.09, 0.16, 0.22, 0.31, 0.38, 0.46, 0.54, 0.63, 0.71]
    for ct in click_times:
        idx = int(ct * SR)
        clen = int(0.025 * SR)
        if idx + clen < n:
            tt = np.linspace(0.0, 0.025, clen, endpoint=False)
            pitch = 1400.0 + rng.uniform(-220.0, 260.0)
            click = (
                rng.standard_normal(clen) * 0.45
                + np.sin(2.0 * np.pi * pitch * tt) * 0.55
            ) * np.exp(-tt * 180.0)
            out[idx : idx + clen] += click * 0.62
    return np.column_stack([out, out * 0.92])


def make_shield_clang(duration: float = 0.52) -> np.ndarray:
    """Metallic shield deflection impact + ricochet zing."""
    n = int(SR * duration)
    t = np.linspace(0.0, duration, n, endpoint=False)
    freqs = [540.0, 815.0, 1290.0, 2140.0]
    metal = sum(np.sin(2.0 * np.pi * f * t) * np.exp(-t * (10.0 + i * 4.0)) for i, f in enumerate(freqs)) * 0.25
    ricochet_f = 900.0 + 1800.0 * (t / duration)
    ricochet = np.sin(2.0 * np.pi * np.cumsum(ricochet_f) / SR) * np.exp(-t * 9.5) * 0.32
    mono = (metal + ricochet) * 0.82
    return np.column_stack([mono, mono])


def make_glass_crack(duration: float = 0.45) -> np.ndarray:
    """Crystalline mirror fracture crackle."""
    n = int(SR * duration)
    rng = np.random.default_rng(99)
    out = np.zeros(n)
    snaps = [0.0, 0.045, 0.11, 0.19, 0.27]
    for i, st in enumerate(snaps):
        idx = int(st * SR)
        slen = int(0.08 * SR)
        if idx + slen < n:
            tt = np.linspace(0.0, 0.08, slen, endpoint=False)
            crystal = (
                rng.standard_normal(slen) * 0.5
                + np.sin(2.0 * np.pi * (2800.0 + i * 350.0) * tt) * 0.5
            ) * np.exp(-tt * 65.0)
            out[idx : idx + slen] += crystal * (0.75 - i * 0.08)
    return np.column_stack([out, out])


def make_tibetan_chime(duration: float = 2.2) -> np.ndarray:
    """Warm 528Hz harmonic singing bowl chime for mindful awakening beats."""
    n = int(SR * duration)
    t = np.linspace(0.0, duration, n, endpoint=False)
    attack = 1.0 - np.exp(-t * 140.0)
    f0 = 528.0
    chime = (
        0.55 * np.sin(2.0 * np.pi * f0 * t) * np.exp(-t * 1.6)
        + 0.28 * np.sin(2.0 * np.pi * (f0 * 2.0) * t) * np.exp(-t * 2.4)
        + 0.14 * np.sin(2.0 * np.pi * (f0 * 2.756) * t) * np.exp(-t * 3.5)
    ) * attack * 0.65
    left = chime * (1.0 + 0.08 * np.sin(2.0 * np.pi * 3.5 * t))
    right = chime * (1.0 + 0.08 * np.cos(2.0 * np.pi * 3.5 * t))
    return np.column_stack([left, right])


def make_riser_swell(duration: float = 1.1) -> np.ndarray:
    """Atmospheric shimmer riser leading into a major chapter cut."""
    n = int(SR * duration)
    t = np.linspace(0.0, duration, n, endpoint=False)
    env = (t / duration) ** 2.4 * np.sin(np.pi * np.minimum(1.0, (duration - t) * 14.0 + 0.15))
    f_sweep = 160.0 + 980.0 * ((t / duration) ** 2.0)
    phase = 2.0 * np.pi * np.cumsum(f_sweep) / SR
    rng = np.random.default_rng(19)
    air = np.convolve(rng.standard_normal(n), np.ones(8) / 8.0, mode="same") * 0.35
    mono = (np.sin(phase) * 0.45 + air) * env * 0.62
    return np.column_stack([mono * 0.9, mono])


def overlay_at(master: np.ndarray, clip: np.ndarray, time_sec: float, gain: float = 1.0) -> None:
    start = max(0, int(time_sec * SR))
    end = min(len(master), start + len(clip))
    if end > start:
        master[start:end] += clip[: end - start] * gain


def build_sfx_timeline(total_sec: float = 69.0, mode: str = "general") -> np.ndarray:
    total_samples = int(total_sec * SR)
    master = np.zeros((total_samples, 2), dtype=np.float64)

    whoosh_deep = make_whoosh(0.45, 160.0, 1450.0)
    whoosh_fast = make_whoosh(0.32, 240.0, 1950.0)
    sub_boom = make_sub_impact(0.72)
    pop_low = make_pop_pluck(0.14, 380.0)
    pop_mid = make_pop_pluck(0.14, 520.0)
    pop_high = make_pop_pluck(0.14, 660.0)
    shutter = make_camera_shutter(0.18)
    typing = make_typing_burst(0.85)
    clang = make_shield_clang(0.52)
    crack = make_glass_crack(0.45)
    chime = make_tibetan_chime(2.2)
    riser = make_riser_swell(1.1)

    for sfx_folder in [SFX_DIR, SFX_LIGHT_DIR]:
        save_wav(sfx_folder / "whoosh_deep.wav", whoosh_deep)
        save_wav(sfx_folder / "whoosh_fast.wav", whoosh_fast)
        save_wav(sfx_folder / "sub_boom.wav", sub_boom)
        save_wav(sfx_folder / "pop_card.wav", pop_mid)
        save_wav(sfx_folder / "camera_shutter.wav", shutter)
        save_wav(sfx_folder / "typing_burst.wav", typing)
        save_wav(sfx_folder / "shield_clang.wav", clang)
        save_wav(sfx_folder / "glass_crack.wav", crack)
        save_wav(sfx_folder / "tibetan_chime.wav", chime)
        save_wav(sfx_folder / "riser_swell.wav", riser)

    # 10 Main Scene Transitions
    cut_times = [0.02, 4.06, 10.06, 13.46, 17.96, 24.66, 32.06, 39.46, 45.66, 53.96]
    for idx, ct in enumerate(cut_times):
        overlay_at(master, whoosh_deep if idx % 2 == 0 else whoosh_fast, ct, gain=0.80)
        if mode == "collage":
            overlay_at(master, shutter, ct + 0.05, gain=0.85)
        elif mode == "ui":
            overlay_at(master, pop_high, ct + 0.04, gain=0.72)
            overlay_at(master, typing, ct + 0.35, gain=0.65)
        else:
            overlay_at(master, pop_mid, ct + 0.06, gain=0.62)

    # Major Chapter Risers & Sub-Booms
    overlay_at(master, sub_boom, 0.02, gain=0.82)
    for ch_t in [18.0, 45.7, 54.0]:
        overlay_at(master, riser, ch_t - 1.08, gain=0.65)
        overlay_at(master, sub_boom, ch_t - 0.02, gain=0.82)

    # Sub-beat pops inside Scene 2 (4.1s, 6.0s, 7.8s)
    overlay_at(master, pop_low, 4.15, gain=0.74)
    overlay_at(master, whoosh_fast, 5.95, gain=0.65)
    overlay_at(master, pop_mid, 6.02, gain=0.74)
    overlay_at(master, whoosh_fast, 7.75, gain=0.65)
    overlay_at(master, pop_high, 7.82, gain=0.74)

    # Scene 3 (10.1s): Mindful Self-Inquiry Chime
    overlay_at(master, chime, 10.12, gain=0.62)

    # Scene 5 (20.8s): Ego Shield Clang
    overlay_at(master, clang, 20.8, gain=0.70)

    # Scene 8 (40.2s): Mirror cracking
    overlay_at(master, crack, 40.2, gain=0.72)

    # Scene 9 & 10 Chimes & Pillars
    overlay_at(master, chime, 45.75, gain=0.65)
    overlay_at(master, chime, 54.05, gain=0.74)
    overlay_at(master, pop_low, 55.3, gain=0.72)
    overlay_at(master, pop_mid, 57.5, gain=0.72)
    overlay_at(master, pop_high, 59.8, gain=0.76)
    overlay_at(master, chime, 60.0, gain=0.55)

    return np.clip(master, -0.95, 0.95)


def build_clean_master_mix(narration_mp3: Path, bgm_wav: Path, sfx_wav: Path, out_wav: Path) -> None:
    """Build a pristine 3-layer mix from pure stems:
    [0:a] Narration (boosted 1.35x for clarity over TikTok beat)
    [1:a] TikTok BGM (@newpulseharmony looped to 69s, volume 0.28 + sidechain ducking under speech)
    [2:a] Synchronized Transition SFX (lowered to 0.20 + lowpass 3000Hz so it is subtle & never harsh)
    """
    filter_complex = (
        "[0:a]aformat=sample_rates=48000:channel_layouts=stereo,highpass=f=85,volume=1.35,asplit=2[vo_main][vo_key];"
        "[1:a]aformat=sample_rates=48000:channel_layouts=stereo,"
        "afade=t=in:st=0:d=1.0,afade=t=out:st=66.5:d=2.5,volume=0.28[bgm_pre];"
        "[bgm_pre][vo_key]sidechaincompress=threshold=0.03:ratio=4.5:attack=80:release=420:makeup=1.05[bgm_ducked];"
        "[2:a]aformat=sample_rates=48000:channel_layouts=stereo,lowpass=f=3000,volume=0.20[sfx_in];"
        "[vo_main][bgm_ducked][sfx_in]amix=inputs=3:duration=first:dropout_transition=0:normalize=0,"
        "alimiter=limit=0.96:level=0[aout]"
    )
    cmd = [
        "ffmpeg",
        "-y",
        "-v",
        "error",
        "-i",
        str(narration_mp3),
        "-stream_loop",
        "-1",
        "-i",
        str(bgm_wav),
        "-i",
        str(sfx_wav),
        "-filter_complex",
        filter_complex,
        "-map",
        "[aout]",
        "-t",
        "69.0",
        str(out_wav),
    ]
    subprocess.run(cmd, check=True)


def main() -> None:
    tiktok_bgm = EP_DIR / "tiktok_newpulse_bgm.wav"
    if tiktok_bgm.exists():
        print("1. Using TikTok BGM (@newpulseharmony - BUILDINGS 20 Remix) as background music...")
        bgm_path = tiktok_bgm
        EP_LIGHT_DIR.mkdir(parents=True, exist_ok=True)
        import shutil
        shutil.copy2(tiktok_bgm, EP_LIGHT_DIR / "tiktok_newpulse_bgm.wav")
        shutil.copy2(tiktok_bgm, EP_DIR / "ambient_music.wav")
        shutil.copy2(tiktok_bgm, EP_LIGHT_DIR / "ambient_music.wav")
    else:
        print("1. Composing 70.0s Melodic Felt-Piano & Warm Strings BGM...")
        bgm_stereo = build_melodic_piano_bgm(70.0)
        bgm_path = EP_DIR / "ambient_music.wav"
        save_wav(bgm_path, bgm_stereo)
        save_wav(EP_LIGHT_DIR / "ambient_music.wav", bgm_stereo)

    print("2. Synthesizing studio SFX pack & 69.0s synchronized SFX stems...")
    stem_general = build_sfx_timeline(69.0, mode="general")
    stem_collage = build_sfx_timeline(69.0, mode="collage")
    stem_ui = build_sfx_timeline(69.0, mode="ui")

    stem_general_path = EP_DIR / "sfx_stem_master.wav"
    stem_collage_path = EP_DIR / "sfx_stem_collage.wav"
    stem_ui_path = EP_DIR / "sfx_stem_ui.wav"

    save_wav(stem_general_path, stem_general)
    save_wav(stem_collage_path, stem_collage)
    save_wav(stem_ui_path, stem_ui)
    save_wav(EP_LIGHT_DIR / "sfx_stem_master.wav", stem_general)
    save_wav(EP_LIGHT_DIR / "sfx_stem_collage.wav", stem_collage)
    save_wav(EP_LIGHT_DIR / "sfx_stem_ui.wav", stem_ui)

    print("3. Building clean 3-Layer Master Audio Mixes (Voiceover + Melodic Piano BGM + Transition SFX)...")
    narration_mp3 = EP_DIR / "narration.mp3"
    mix_general = EP_DIR / "master_mix_general.wav"
    mix_collage = EP_DIR / "master_mix_collage.wav"
    mix_ui = EP_DIR / "master_mix_ui.wav"

    build_clean_master_mix(narration_mp3, bgm_path, stem_general_path, mix_general)
    build_clean_master_mix(narration_mp3, bgm_path, stem_collage_path, mix_collage)
    build_clean_master_mix(narration_mp3, bgm_path, stem_ui_path, mix_ui)

    videos = sorted(VIDEO_DIR.glob("reactive_mind_*.mp4"))
    print(f"4. Remuxing clean 3-Layer Master Audio into {len(videos)} rendered MP4 videos (-c:v copy)...")

    for vpath in videos:
        if "loai7_collage" in vpath.name:
            mix_file = mix_collage
        elif "loai8_ui" in vpath.name or "loai1_inner" in vpath.name:
            mix_file = mix_ui
        else:
            mix_file = mix_general

        tmp_out = vpath.with_suffix(".mix_tmp.mp4")
        cmd = [
            "ffmpeg",
            "-y",
            "-v",
            "error",
            "-i",
            str(vpath),
            "-i",
            str(mix_file),
            "-map",
            "0:v",
            "-map",
            "1:a",
            "-c:v",
            "copy",
            "-c:a",
            "aac",
            "-b:a",
            "192k",
            "-shortest",
            str(tmp_out),
        ]
        subprocess.run(cmd, check=True)
        tmp_out.replace(vpath)
        print(f"   + Updated 3-layer audio (Voice + Piano BGM + SFX) -> {vpath.name}")

    print("Done! All 14 videos now have crystal-clear Voiceover + Melodic Piano BGM + Transition SFX.")


if __name__ == "__main__":
    main()
