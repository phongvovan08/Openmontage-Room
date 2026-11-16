import json
import shutil
import subprocess
from pathlib import Path
import numpy as np
import wave

ROOT = Path(__file__).resolve().parent.parent
EP_DIR = ROOT / "remotion-composer" / "public" / "episodes" / "reactive-mind"
EP_LIGHT_DIR = ROOT / "remotion-composer" / "public-audio-only" / "episodes" / "reactive-mind"
PROJ_AUDIO = ROOT / "projects" / "tiktok_thaylacthien" / "audio"

SR = 48000


def load_wav_mono_or_stereo(path: Path) -> np.ndarray:
    with wave.open(str(path), "rb") as wf:
        ch = wf.getnchannels()
        frames = wf.readframes(wf.getnframes())
        arr = np.frombuffer(frames, dtype=np.int16).astype(np.float64) / 32767.0
        if ch == 2:
            return arr.reshape(-1, 2)
        return np.column_stack([arr, arr])


def save_wav(path: Path, samples: np.ndarray) -> None:
    path.parent.mkdir(parents=True, exist_ok=True)
    clipped = np.clip(samples, -1.0, 1.0)
    pcm = (clipped * 32767.0).astype(np.int16)
    with wave.open(str(path), "wb") as wf:
        wf.setnchannels(2)
        wf.setsampwidth(2)
        wf.setframerate(SR)
        wf.writeframes(pcm.tobytes())


def overlay_at(master: np.ndarray, clip: np.ndarray, time_sec: float, gain: float = 1.0) -> None:
    start = max(0, int(time_sec * SR))
    end = min(len(master), start + len(clip))
    if end > start:
        master[start:end] += clip[: end - start] * gain


def main() -> None:
    src_mp3 = PROJ_AUDIO / "narration.mp3"
    tts_json = PROJ_AUDIO / "tts_result.json"

    EP_DIR.mkdir(parents=True, exist_ok=True)
    EP_LIGHT_DIR.mkdir(parents=True, exist_ok=True)

    shutil.copy2(src_mp3, EP_DIR / "narration_haitrieu.mp3")
    shutil.copy2(src_mp3, EP_LIGHT_DIR / "narration_haitrieu.mp3")

    # Export TypeScript word captions for Remotion
    data = json.loads(tts_json.read_text(encoding="utf-8"))
    words = data.get("word_timestamps", [])
    ts_lines = [
        "export interface MochiWordTimestamp { word: string; start: number; end: number; }",
        "export const HAITRIEU_WORDS: MochiWordTimestamp[] = " + json.dumps(words, ensure_ascii=False, indent=2) + ";",
    ]
    (ROOT / "remotion-composer" / "src" / "haitrieuCaptions.ts").write_text(
        "\n".join(ts_lines), encoding="utf-8"
    )
    print(f"Exported {len(words)} words to remotion-composer/src/haitrieuCaptions.ts")

    # Build 90.0s SFX stem from existing SFX files
    sfx_dir = EP_DIR / "sfx"
    whoosh_deep = load_wav_mono_or_stereo(sfx_dir / "whoosh_deep.wav")
    whoosh_fast = load_wav_mono_or_stereo(sfx_dir / "whoosh_fast.wav")
    pop_card = load_wav_mono_or_stereo(sfx_dir / "pop_card.wav")
    sub_boom = load_wav_mono_or_stereo(sfx_dir / "sub_boom.wav")
    clang = load_wav_mono_or_stereo(sfx_dir / "shield_clang.wav")
    crack = load_wav_mono_or_stereo(sfx_dir / "glass_crack.wav")
    chime = load_wav_mono_or_stereo(sfx_dir / "tibetan_chime.wav")
    riser = load_wav_mono_or_stereo(sfx_dir / "riser_swell.wav")

    total_sec = 90.0
    master = np.zeros((int(total_sec * SR), 2), dtype=np.float64)

    cut_times = [
        0.05, 5.1, 7.6, 10.2, 12.8, 17.5, 23.0, 29.4, 32.0,
        35.8, 42.1, 46.6, 51.0, 59.2, 64.6, 70.1, 76.8, 82.3,
    ]
    for idx, ct in enumerate(cut_times):
        overlay_at(master, whoosh_deep if idx % 2 == 0 else whoosh_fast, ct, gain=0.75)
        overlay_at(master, pop_card, ct + 0.06, gain=0.65)

    overlay_at(master, sub_boom, 0.05, gain=0.8)
    overlay_at(master, clang, 29.5, gain=0.75)
    overlay_at(master, crack, 52.0, gain=0.75)
    overlay_at(master, riser, 58.1, gain=0.65)
    overlay_at(master, chime, 59.3, gain=0.7)
    overlay_at(master, chime, 70.2, gain=0.7)
    overlay_at(master, chime, 82.4, gain=0.75)

    sfx_90_path = EP_DIR / "sfx_stem_haitrieu_90s.wav"
    save_wav(sfx_90_path, master)
    save_wav(EP_LIGHT_DIR / "sfx_stem_haitrieu_90s.wav", master)

    # Mix 3-layer master audio (90.0s): Haitrieu VO + TikTok BGM (@newpulseharmony) + subtle 0.20 SFX
    bgm_wav = EP_DIR / "tiktok_newpulse_bgm.wav"
    out_mix = EP_DIR / "master_mix_haitrieu_90s.wav"
    filter_complex = (
        "[0:a]aformat=sample_rates=48000:channel_layouts=stereo,highpass=f=85,volume=1.35,asplit=2[vo_main][vo_key];"
        "[1:a]aformat=sample_rates=48000:channel_layouts=stereo,"
        "afade=t=in:st=0:d=1.0,afade=t=out:st=87.0:d=3.0,volume=0.28[bgm_pre];"
        "[bgm_pre][vo_key]sidechaincompress=threshold=0.03:ratio=4.5:attack=80:release=420:makeup=1.05[bgm_ducked];"
        "[2:a]aformat=sample_rates=48000:channel_layouts=stereo,lowpass=f=3000,volume=0.20[sfx_in];"
        "[vo_main][bgm_ducked][sfx_in]amix=inputs=3:duration=first:dropout_transition=0:normalize=0,"
        "alimiter=limit=0.96:level=0[aout]"
    )
    cmd = [
        "ffmpeg", "-y", "-v", "error",
        "-i", str(src_mp3),
        "-stream_loop", "-1", "-i", str(bgm_wav),
        "-i", str(sfx_90_path),
        "-filter_complex", filter_complex,
        "-map", "[aout]", "-t", "90.0",
        str(out_mix),
    ]
    subprocess.run(cmd, check=True)
    shutil.copy2(out_mix, EP_LIGHT_DIR / "master_mix_haitrieu_90s.wav")
    print("Built 90.0s 3-layer master audio:", out_mix)


if __name__ == "__main__":
    main()

