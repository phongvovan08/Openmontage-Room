---
name: vibi-tts-chrome-pipeline
description: >-
  End-to-end Vietnamese YouTube video production pipeline for the video-v2 workspace.
  Use whenever generating Vietnamese TTS voiceovers via Vibi API (_tools/vibi_tts.py),
  rendering 3D HTML5/CSS3/SVG/Canvas motion graphics via Headless Google Chrome CDP,
  compositing real B-roll footage with FFmpeg xfade transitions and libass (.ass) subtitles,
  or synthesizing cinematic SFX and binaural ambient soundtracks.
---

# Vibi TTS & Headless Chrome 3D Video Production Pipeline

This skill defines the native production pipeline for `c:\Users\ACER\Desktop\video-v2`. Always combine this skill with the script/storyboard skills (`yt-script`, `yt-retention`, `ai-storyboard-director`, `remotion-motion-graphics`) when producing videos in this workspace.

---

## 1. Environment & Installed Binaries
- **Python:** `3.12.10` (`websockets`, `pillow`, `numpy`, `scipy`, `pydub`, `yt-dlp`)
- **FFmpeg:** `8.1.1-full_build` (supports `xfade`, `zoompan`, `rgbashift`, `subtitles` / `ass` via `libass`)
- **Google Chrome:** `C:\Program Files\Google\Chrome\Application\chrome.exe` (used via `--headless=new --remote-debugging-port=<port>`)
- **Vibi TTS API:** `https://api.vibi.pro`
  - API key file: `c:\Users\ACER\Desktop\video-v2\.vibi_api_key`
  - Voice config: `c:\Users\ACER\Desktop\video-v2\_tools\vibi_tts.json`
  - Helper scripts: `c:\Users\ACER\Desktop\video-v2\_tools\vibi_tts.py` and `c:\Users\ACER\Desktop\video-v2\_tools\fetch_demo_tts.py`

---

## 2. Step-by-Step Production Workflow

### Step 1: Read Channel `brand-profile.md` & `voice.md`
Before writing any script, read the target channel's `brand-profile.md` and `voice.md`:
- `Tam-Ly-Hoc-Tu-Duy/brand-profile.md` & `Tam-Ly-Hoc-Tu-Duy/voice.md`
- `Better-Version-Tam-Ly/brand-profile.md` & `Better-Version-Tam-Ly/voice.md`
- `Ke-Chuyen-Dem-Khuya/brand-profile.md` & `Ke-Chuyen-Dem-Khuya/voice.md`

### Step 2: Script & EDL Storyboard Design
1. Use `youtube-agent-skill__yt-script` to craft the opening hook (first 30 seconds) using the 21 Hook Formulas.
2. Use `youtube-agent-skill__yt-edit` & `ai-film-skills__ai-storyboard-director` to break the script into 2–4 second visual beats (never hold a static visual for more than 4 seconds).

### Step 3: Generate Vibi TTS Audio (`.mp3`) & Subtitles (`.srt`)
Submit the Vietnamese script to `https://api.vibi.pro/v1/text-to-speech/{voice_id}` with `"export_transcript": True`:
- Poll `/v1/history?page_size=20&page=0` until `status == "completed"`.
- Download both `audio_url` (`.mp3`) and `srt_url` (`.srt`).

### Step 4: Render Visuals via Headless Chrome CDP + FFmpeg `xfade`
- **NEVER use Stick Figures (`Người que`) or flat 2D `PIL.ImageDraw` boxes.**
- Use the reference implementations in:
  - `Demo-5-Phong-Cach/render_5_github_repos_21_to_25.py` (Modes 21–25: 3D Neural Cosmos, Motion Canvas Kurzgesagt SVG, EDL Retention HUD over Real Video, Dramai 8-Shot Film Montage, Apple VisionOS 3D Spatial Glass over Real Video)
  - `Demo-5-Phong-Cach/render_storyboard_xfade.py` (Native FFmpeg `xfade` + `libass` `.ass` vector subtitles)
- **Critical FFmpeg Rule:** Always pass `stderr=subprocess.DEVNULL` when streaming frames via `stdin=subprocess.PIPE` to prevent pipe buffer deadlocks on Windows.

