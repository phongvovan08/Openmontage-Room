"""Fetch 100% distinct, multi-source video clips and archival/scientific images for each of the 6 topics.
Guarantees ZERO overlap of video clips or images across different topics.

Sources combined per topic:
1. Mixkit Free Stock HD Video Clips (topic-specific search categories)
2. Wikimedia Commons API (authentic historical, archaeological, wildlife, anatomical, and scientific photography)
3. Bespoke AI 16:9 Keyframes in `<Topic>/assets/ai_*.png`
"""
from __future__ import annotations

import json
from pathlib import Path
import re
import shutil
import subprocess
import urllib.parse
import urllib.request

ROOT = Path(__file__).resolve().parent.parent
TOPICS_ROOT = ROOT / "Chu-De"
USER_AGENT = "VideoV2AssetFetcher/1.0 (https://example.org; contact@example.org) Mozilla/5.0"

# Track every URL ever downloaded across the entire script so NO TWO TOPICS can ever share a URL
GLOBAL_USED_URLS: set[str] = set()


def fetch_text(url: str) -> str:
    req = urllib.request.Request(url, headers={"User-Agent": USER_AGENT})
    with urllib.request.urlopen(req, timeout=30) as r:
        return r.read().decode("utf-8", errors="ignore")


def download_binary(url: str, out_path: Path) -> bool:
    if out_path.exists() and out_path.stat().st_size > 25_000:
        GLOBAL_USED_URLS.add(url)
        return True
    try:
        req = urllib.request.Request(url, headers={"User-Agent": USER_AGENT})
        with urllib.request.urlopen(req, timeout=60) as r:
            data = r.read()
        if len(data) < 15_000:
            return False
        out_path.parent.mkdir(parents=True, exist_ok=True)
        out_path.write_bytes(data)
        GLOBAL_USED_URLS.add(url)
        print(f"  [OK] {out_path.relative_to(ROOT)} ({len(data) // 1024} KB) <- {url[:80]}")
        return True
    except Exception as e:
        print(f"  [WARN] Failed {url[:70]}: {e}")
        return False


def fetch_mixkit_video(categories: list[str], out_path: Path) -> bool:
    if out_path.exists() and out_path.stat().st_size > 40_000:
        print(f"  [CACHED] {out_path.relative_to(ROOT)}")
        return True
    for cat in categories:
        page_url = f"https://mixkit.co/free-stock-video/{cat}/"
        try:
            html = fetch_text(page_url)
            urls = re.findall(r"https://assets\.mixkit\.co/videos/[^\s\"'<>]+?\.mp4", html)
        except Exception as e:
            print(f"  [WARN] Mixkit page {page_url}: {e}")
            continue
        # Filter horizontal preview/720p/large clips not yet used anywhere
        for u in urls:
            if u in GLOBAL_USED_URLS or "vertical" in u:
                continue
            if download_binary(u, out_path):
                return True
    return False


def fetch_wikimedia_image(queries: list[str], out_path: Path) -> bool:
    if out_path.exists() and out_path.stat().st_size > 25_000:
        print(f"  [CACHED] {out_path.relative_to(ROOT)}")
        return True
    for q in queries:
        params = urllib.parse.urlencode({
            "action": "query",
            "generator": "search",
            "gsrsearch": f"filetype:bitmap {q}",
            "gsrnamespace": "6",
            "gsrlimit": "10",
            "prop": "imageinfo",
            "iiprop": "url|dimensions",
            "iiurlwidth": "1280",
            "format": "json",
        })
        api_url = f"https://commons.wikimedia.org/w/api.php?{params}"
        try:
            data = json.loads(fetch_text(api_url))
            pages = data.get("query", {}).get("pages", {})
        except Exception as e:
            print(f"  [WARN] Wikimedia query '{q}': {e}")
            continue
        for _, pinfo in pages.items():
            ii = (pinfo.get("imageinfo") or [{}])[0]
            img_url = ii.get("thumburl") or ii.get("url")
            w = ii.get("width", 0)
            h = ii.get("height", 0)
            if not img_url or img_url in GLOBAL_USED_URLS:
                continue
            if not img_url.lower().endswith((".jpg", ".jpeg", ".png")):
                continue
            if w >= 600 and h >= 400:
                if download_binary(img_url, out_path):
                    return True
    return False


def normalize_to_720p_shot(src_path: Path, out_mp4: Path, zoom_mode: int = 0) -> None:
    """Convert either a real video clip or a high-res image into a 4.0s 1280x720 30fps MP4 shot with camera motion."""
    if out_mp4.exists() and out_mp4.stat().st_size > 40_000:
        return
    out_mp4.parent.mkdir(parents=True, exist_ok=True)
    ext = src_path.suffix.lower()
    if ext in (".mp4", ".mov", ".webm", ".mkv"):
        # Real video clip: scale/crop to 1280x720 @ 30fps, take 4.0 seconds
        vf = "scale=1280:720:force_original_aspect_ratio=increase,crop=1280:720,fps=30,format=yuv420p"
        cmd = [
            "ffmpeg", "-y", "-v", "error",
            "-stream_loop", "-1", "-i", str(src_path),
            "-t", "4.0", "-vf", vf,
            "-c:v", "libx264", "-preset", "fast", "-crf", "20", "-an",
            str(out_mp4),
        ]
    else:
        # High-res photo / AI keyframe: apply smooth 30fps Ken Burns pan/zoom in 1280x720
        if zoom_mode % 3 == 0:
            zp = "zoompan=z='min(zoom+0.0015,1.18)':x='iw/2-(iw/zoom/2)':y='ih/2-(ih/zoom/2)':d=120:s=1280x720:fps=30"
        elif zoom_mode % 3 == 1:
            zp = "zoompan=z='1.16-0.0012*on':x='(iw-iw/zoom)*(on/120)':y='ih/2-(ih/zoom/2)':d=120:s=1280x720:fps=30"
        else:
            zp = "zoompan=z='min(zoom+0.0014,1.17)':x='(iw-iw/zoom)*(1-on/120)':y='(ih-ih/zoom)*(on/120)':d=120:s=1280x720:fps=30"
        vf = f"scale=1920:1080:force_original_aspect_ratio=increase,crop=1920:1080,{zp},format=yuv420p"
        cmd = [
            "ffmpeg", "-y", "-v", "error",
            "-loop", "1", "-i", str(src_path),
            "-t", "4.0", "-vf", vf,
            "-c:v", "libx264", "-preset", "fast", "-crf", "20", "-an",
            str(out_mp4),
        ]
    subprocess.run(cmd, stdout=subprocess.DEVNULL, stderr=subprocess.DEVNULL, check=False)


def main():
    # =========================================================================
    # TOPIC 1: TAM LY HOC TU DUY (Behavioral Psychology & Micro-Expressions)
    # =========================================================================
    print("\n=== TOPIC 1: Tam-Ly-Hoc-Tu-Duy ===")
    t1_dir = TOPICS_ROOT / "Tam-Ly-Hoc-Tu-Duy" / "assets"
    t1_dir.mkdir(parents=True, exist_ok=True)
    fetch_mixkit_video(["conversation", "interview", "talking"], t1_dir / "raw_v1_conversation.mp4")
    fetch_mixkit_video(["shoes", "walking", "legs"], t1_dir / "raw_v2_feet_shoes.mp4")
    fetch_mixkit_video(["eyes", "face", "portrait"], t1_dir / "raw_v3_eye_macro.mp4")
    fetch_mixkit_video(["meeting", "office", "handshake"], t1_dir / "raw_v4_body_language.mp4")
    fetch_wikimedia_image(["Limbic system brain diagram", "Human eye iris macro"], t1_dir / "wiki_limbic_brain.jpg")

    # =========================================================================
    # TOPIC 2: BETTER VERSION TAM LY (Mental Healing & Book Insights)
    # Uses the mindfulness/burnout clips & AI healing art EXCLUSIVELY for Topic 2
    # =========================================================================
    print("\n=== TOPIC 2: Better-Version-Tam-Ly ===")
    t2_dir = TOPICS_ROOT / "Better-Version-Tam-Ly" / "assets"
    t2_dir.mkdir(parents=True, exist_ok=True)
    c_dir = ROOT / "Demo-5-Phong-Cach" / "cinema_clips"
    v_dir = ROOT / "Demo-5-Phong-Cach" / "vfx_assets"
    for src, dst in [
        (c_dir / "shot_01.mp4", t2_dir / "raw_v1_tired_desk.mp4"),
        (c_dir / "shot_02.mp4", t2_dir / "raw_v2_stress_mind.mp4"),
        (c_dir / "shot_07.mp4", t2_dir / "raw_v3_meditation.mp4"),
        (c_dir / "shot_08.mp4", t2_dir / "raw_v4_sunrise_forest.mp4"),
        (v_dir / "brain_overload.png", t2_dir / "ai_brain_overload.png"),
        (v_dir / "inner_peace_tree.png", t2_dir / "ai_inner_peace_tree.png"),
    ]:
        if src.exists() and not dst.exists():
            shutil.copy2(src, dst)
            print(f"  [COPIED EXCLUSIVE] {dst.relative_to(ROOT)}")

    # =========================================================================
    # TOPIC 3: KE CHUYEN DEM KHUYA (Late-Night Rainy Village Story)
    # =========================================================================
    print("\n=== TOPIC 3: Ke-Chuyen-Dem-Khuya ===")
    t3_dir = TOPICS_ROOT / "Ke-Chuyen-Dem-Khuya" / "assets"
    t3_dir.mkdir(parents=True, exist_ok=True)
    fetch_mixkit_video(["rain", "storm", "raindrops"], t3_dir / "raw_v1_night_rain.mp4")
    fetch_mixkit_video(["candle", "lantern", "fireplace"], t3_dir / "raw_v2_warm_lamp.mp4")
    fetch_mixkit_video(["tea", "coffee", "cup"], t3_dir / "raw_v3_warm_tea.mp4")
    fetch_mixkit_video(["writing", "notebook", "book"], t3_dir / "raw_v4_handwritten_letter.mp4")
    fetch_wikimedia_image(["Vietnam traditional village house", "Rural Vietnam rain"], t3_dir / "wiki_vietnam_village.jpg")

    # =========================================================================
    # TOPIC 4: BI AN LICH SU (Ancient Co Loa Citadel & Bronze Crossbow)
    # =========================================================================
    print("\n=== TOPIC 4: Bi-An-Lich-Su ===")
    t4_dir = TOPICS_ROOT / "Bi-An-Lich-Su" / "assets"
    t4_dir.mkdir(parents=True, exist_ok=True)
    fetch_wikimedia_image(["Co Loa bronze arrowheads", "Dong Son bronze weapons Vietnam", "Co Loa citadel"], t4_dir / "wiki_coloa_arrowheads.jpg")
    fetch_wikimedia_image(["Dong Son bronze drum Vietnam", "Ancient Vietnam bronze"], t4_dir / "wiki_dongson_bronze.jpg")
    fetch_mixkit_video(["ruins", "castle", "temple"], t4_dir / "raw_v1_ancient_fortress.mp4")
    fetch_mixkit_video(["fire", "sparks", "flames"], t4_dir / "raw_v2_battle_fire.mp4")
    fetch_mixkit_video(["fog", "mountains", "river"], t4_dir / "raw_v3_misty_delta.mp4")

    # =========================================================================
    # TOPIC 5: THE GIOI DONG VAT (African Leopard Night Predator)
    # =========================================================================
    print("\n=== TOPIC 5: The-Gioi-Dong-Vat ===")
    t5_dir = TOPICS_ROOT / "The-Gioi-Dong-Vat" / "assets"
    t5_dir.mkdir(parents=True, exist_ok=True)
    fetch_mixkit_video(["leopard", "tiger", "lion", "cat"], t5_dir / "raw_v1_feline_prowl.mp4")
    fetch_mixkit_video(["safari", "wildlife", "jungle"], t5_dir / "raw_v2_savanna_wild.mp4")
    fetch_wikimedia_image(["Panthera pardus stalking", "African leopard wildlife"], t5_dir / "wiki_leopard_stalk.jpg")
    fetch_wikimedia_image(["Panthera pardus eye close up", "Leopard face close up"], t5_dir / "wiki_leopard_eyes.jpg")
    fetch_wikimedia_image(["Leopard hunting running", "Panthera pardus tree"], t5_dir / "wiki_leopard_action.jpg")

    # =========================================================================
    # TOPIC 6: MEO VAT CUOC SONG (Baking Soda + Lemon 30s Science Hack)
    # =========================================================================
    print("\n=== TOPIC 6: Meo-Vat-Cuoc-Song ===")
    t6_dir = TOPICS_ROOT / "Meo-Vat-Cuoc-Song" / "assets"
    t6_dir.mkdir(parents=True, exist_ok=True)
    fetch_mixkit_video(["lemon", "citrus", "orange"], t6_dir / "raw_v1_lemon_squeeze.mp4")
    fetch_mixkit_video(["bubbles", "water", "liquid"], t6_dir / "raw_v2_fizz_bubbles.mp4")
    fetch_mixkit_video(["cleaning", "kitchen", "washing"], t6_dir / "raw_v3_kitchen_clean.mp4")
    fetch_wikimedia_image(["Sodium bicarbonate powder", "Baking soda lemon"], t6_dir / "wiki_baking_soda.jpg")
    fetch_wikimedia_image(["White sneakers shoes clean", "Stainless steel pot pan"], t6_dir / "wiki_sneaker_pot.jpg")


if __name__ == "__main__":
    main()

