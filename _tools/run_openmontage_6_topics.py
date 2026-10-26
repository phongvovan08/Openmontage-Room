"""Stage assets and render 6 Vietnamese Topic Videos using OpenMontage's native
React/Remotion Composer (`GitHub-Skills-Va-Repos/3-AI-Film-Storyboarding-Va-GenVideo/OpenMontage/remotion-composer`).

Uses OpenMontage's full React component library (`Explainer.tsx`):
- `hero_title`, `stat_card`, `comparison`, `callout`, `kpi_grid`, `bar_chart`, `pie_chart`, `progress_bar`
- `anime_scene` (multi-image Ken Burns crossfade + ParticleOverlay: `fireflies`, `mist`, `light-rays`, `sparkles`)
- `backgroundVideo` & `backgroundImage` from each topic's EXCLUSIVE `<Topic>/assets/` folder (zero overlap!)
- `overlays` (`section_title`, `stat_reveal`)
- `captions` (word-by-word animated `<CaptionOverlay>` parsed from Vibi TTS `.srt`)
- `audio` (`narration` Vibi TTS `.mp3` + `music` ambient/SFX `.wav`)
"""
from __future__ import annotations

import json
from pathlib import Path
import re
import shutil
import subprocess
import sys

sys.stdout.reconfigure(encoding="utf-8", errors="replace")

ROOT = Path(__file__).resolve().parent.parent
OM_ROOT = ROOT
COMPOSER_DIR = OM_ROOT / "remotion-composer"
PUBLIC_DIR = COMPOSER_DIR / "public"
PROPS_DIR = PUBLIC_DIR / "demo-props"


def srt_time_to_ms(t_str: str) -> int:
    # 00:00:03,450 -> ms
    t_str = t_str.strip().replace(",", ".")
    parts = t_str.split(":")
    h, m, s = int(parts[0]), int(parts[1]), float(parts[2])
    return int(round((h * 3600 + m * 60 + s) * 1000))


def parse_srt_to_word_captions(srt_path: Path) -> list[dict]:
    """Convert an SRT file into OpenMontage WordCaption[] with interpolated word timings."""
    if not srt_path.exists():
        return []
    raw = srt_path.read_text(encoding="utf-8", errors="ignore")
    blocks = re.split(r"\n\s*\n", raw.strip())
    words_out: list[dict] = []
    for blk in blocks:
        lines = [ln.strip() for ln in blk.strip().splitlines() if ln.strip()]
        if len(lines) < 2:
            continue
        time_line = next((ln for ln in lines if "-->" in ln), None)
        if not time_line:
            continue
        t_idx = lines.index(time_line)
        txt = " ".join(lines[t_idx + 1 :]).strip()
        if not txt:
            continue
        st_str, en_str = [p.strip() for p in time_line.split("-->")]
        st_ms = srt_time_to_ms(st_str)
        en_ms = max(st_ms + 200, srt_time_to_ms(en_str))
        w_list = txt.split()
        if not w_list:
            continue
        dur_per_w = (en_ms - st_ms) / len(w_list)
        for i, w in enumerate(w_list):
            w_st = int(round(st_ms + i * dur_per_w))
            w_en = int(round(st_ms + (i + 1) * dur_per_w))
            words_out.append({
                "word": w,
                "startMs": w_st,
                "endMs": w_en,
                "pageBreakAfter": (i == len(w_list) - 1),
            })
    return words_out


def stage_topic_assets() -> None:
    """Copy each topic's exclusive assets into `remotion-composer/public/topics/<tkey>/`."""
    topics = [
        ("t1", ROOT / "Chu-De" / "Tam-Ly-Hoc-Tu-Duy", ROOT / "Chu-De" / "Tam-Ly-Hoc-Tu-Duy" / "tts_tap1.mp3", ROOT / "Chu-De" / "Tam-Ly-Hoc-Tu-Duy" / "sfx_behavior_pro.wav"),
        ("t2", ROOT / "Chu-De" / "Better-Version-Tam-Ly", ROOT / "Chu-De" / "Better-Version-Tam-Ly" / "tts_tap1.mp3", ROOT / "Chu-De" / "Better-Version-Tam-Ly" / "sfx_healing_pro.wav"),
        ("t3", ROOT / "Chu-De" / "Ke-Chuyen-Dem-Khuya", ROOT / "Chu-De" / "Ke-Chuyen-Dem-Khuya" / "tts_tap1.mp3", ROOT / "Chu-De" / "Ke-Chuyen-Dem-Khuya" / "sfx_night_rain_pro.wav"),
        ("t4", ROOT / "Chu-De" / "Bi-An-Lich-Su", ROOT / "Chu-De" / "Bi-An-Lich-Su" / "tts_tap1.mp3", ROOT / "Chu-De" / "Bi-An-Lich-Su" / "sfx_history_pro.wav"),
        ("t5", ROOT / "Chu-De" / "The-Gioi-Dong-Vat", ROOT / "Chu-De" / "The-Gioi-Dong-Vat" / "tts_tap1.mp3", ROOT / "Chu-De" / "The-Gioi-Dong-Vat" / "sfx_wildlife_pro.wav"),
        ("t6", ROOT / "Chu-De" / "Meo-Vat-Cuoc-Song", ROOT / "Chu-De" / "Meo-Vat-Cuoc-Song" / "tts_tap1.mp3", ROOT / "Chu-De" / "Meo-Vat-Cuoc-Song" / "sfx_lifehack_pro.wav"),
    ]
    for tkey, tdir, tts_path, sfx_path in topics:
        dst_dir = PUBLIC_DIR / "topics" / tkey
        dst_dir.mkdir(parents=True, exist_ok=True)
        adir = tdir / "assets"
        for f in adir.iterdir():
            if not f.is_file():
                continue
            target = dst_dir / f.name
            if f.name.startswith("shot_") and f.suffix.lower() == ".mp4":
                if not target.exists():
                    # Ensure every backgroundVideo is at least 8.5s long so Remotion <OffthreadVideo> never hits EOF
                    subprocess.run(
                        [
                            "ffmpeg", "-y", "-v", "error",
                            "-stream_loop", "-1", "-i", str(f),
                            "-t", "8.5", "-c:v", "libx264", "-preset", "ultrafast", "-crf", "20", "-pix_fmt", "yuv420p", "-an",
                            str(target),
                        ],
                        stdout=subprocess.DEVNULL, stderr=subprocess.DEVNULL, check=False,
                    )
            elif f.name.startswith("ai_") or f.name.startswith("wiki_"):
                shutil.copy2(f, target)
        if tts_path.exists():
            shutil.copy2(tts_path, dst_dir / "narration.mp3")
        if sfx_path.exists():
            shutil.copy2(sfx_path, dst_dir / "music.wav")
        print(f"[STAGED TO OPENMONTAGE] topics/{tkey} <- {tdir.name}")


def build_openmontage_props() -> list[tuple[str, Path, Path]]:
    """Build 6 OpenMontage Remotion composition JSON files using each topic's exclusive assets."""
    PROPS_DIR.mkdir(parents=True, exist_ok=True)

    configs = [
        # 1. TAM LY HOC TU DUY
        (
            "om_t1_behavior",
            ROOT / "Chu-De" / "Tam-Ly-Hoc-Tu-Duy" / "openmontage_remotion.mp4",
            ROOT / "Chu-De" / "Tam-Ly-Hoc-Tu-Duy" / "tts_tap1.srt",
            {
                "theme": "flat-motion-graphics",
                "themeConfig": {
                    "primaryColor": "#06B6D4",
                    "accentColor": "#F43F5E",
                    "backgroundColor": "#070B14",
                    "surfaceColor": "#0F172A",
                    "textColor": "#F8FAFC",
                    "mutedTextColor": "#94A3B8",
                    "chartColors": ["#06B6D4", "#F43F5E", "#F59E0B", "#10B981"],
                    "captionHighlightColor": "#22D3EE",
                    "captionBackgroundColor": "rgba(7, 11, 20, 0.85)",
                },
                "cuts": [
                    {
                        "id": "t1-hook",
                        "source": "",
                        "type": "hero_title",
                        "in_seconds": 0.0,
                        "out_seconds": 3.8,
                        "text": "Đừng Nhìn Vào Gương Mặt Họ",
                        "heroSubtitle": "Hồ Sơ Đọc Vị Hành Vi Cựu Đặc Vụ FBI Joe Navarro",
                        "backgroundVideo": "topics/t1/shot_01.mp4",
                        "backgroundOverlay": 0.45,
                        "accentColor": "#22D3EE",
                    },
                    {
                        "id": "t1-feet",
                        "source": "",
                        "type": "stat_card",
                        "in_seconds": 3.8,
                        "out_seconds": 7.9,
                        "stat": "45°",
                        "subtitle": "Góc xoay mũi bàn chân tố cáo ý định muốn rời khỏi cuộc trò chuyện",
                        "backgroundVideo": "topics/t1/shot_02.mp4",
                        "backgroundOverlay": 0.48,
                        "accentColor": "#F43F5E",
                    },
                    {
                        "id": "t1-limbic-chart",
                        "source": "",
                        "type": "bar_chart",
                        "in_seconds": 7.9,
                        "out_seconds": 14.2,
                        "title": "Độ Trung Thực Của Các Bộ Phận Cơ Thể (%)",
                        "chartData": [
                            {"label": "Đôi Bàn Chân (Hệ Limbic)", "value": 94},
                            {"label": "Ánh Mắt & Đồng Tử", "value": 78},
                            {"label": "Cử Chỉ Đôi Tay", "value": 64},
                            {"label": "Lời Nói & Nụ Cười", "value": 38},
                        ],
                        "chartColors": ["#22D3EE", "#38BDF8", "#F59E0B", "#F43F5E"],
                        "showGrid": True,
                        "showValues": True,
                        "backgroundVideo": "topics/t1/shot_04.mp4",
                        "backgroundOverlay": 0.58,
                    },
                    {
                        "id": "t1-compare",
                        "source": "",
                        "type": "comparison",
                        "in_seconds": 14.2,
                        "out_seconds": 18.5,
                        "title": "Đối Chiếu Ngôn Ngữ Cơ Thể Khi Giao Tiếp",
                        "leftLabel": "Thân Trên (Vỏ Não Trước)",
                        "leftValue": "Mỉm cười lịch sự • Gật đầu xã giao",
                        "rightLabel": "Mũi Bàn Chân (Não Limbic)",
                        "rightValue": "Xoay 45° về phía cửa thoát hiểm",
                        "backgroundVideo": "topics/t1/shot_05.mp4",
                        "backgroundOverlay": 0.52,
                    },
                    {
                        "id": "t1-close",
                        "source": "",
                        "type": "anime_scene",
                        "in_seconds": 18.5,
                        "out_seconds": 23.6,
                        "images": ["topics/t1/ai_feet_exit.jpg", "topics/t1/ai_pupil_micro.jpg"],
                        "animation": "ken-burns",
                        "particles": "sparkles",
                        "particleColor": "#22D3EE",
                        "particleCount": 26,
                    },
                ],
                "overlays": [
                    {
                        "type": "section_title",
                        "in_seconds": 4.0,
                        "out_seconds": 7.5,
                        "text": "QUY LUẬT ĐỌC VỊ SỐ 01",
                        "subtitle": "Quan sát hướng mũi giày trong 3 giây đầu",
                        "accentColor": "#22D3EE",
                        "position": "top-left",
                    },
                    {
                        "type": "stat_reveal",
                        "in_seconds": 18.8,
                        "out_seconds": 23.2,
                        "text": "94%",
                        "subtitle": "Độ chính xác phản xạ bàn chân",
                        "accentColor": "#F43F5E",
                        "position": "bottom-right",
                    },
                ],
            },
        ),
        # 2. BETTER VERSION TAM LY
        (
            "om_t2_healing",
            ROOT / "Chu-De" / "Better-Version-Tam-Ly" / "openmontage_remotion.mp4",
            ROOT / "Chu-De" / "Better-Version-Tam-Ly" / "tts_tap1.srt",
            {
                "theme": "anime-ghibli",
                "themeConfig": {
                    "primaryColor": "#F59E0B",
                    "accentColor": "#10B981",
                    "backgroundColor": "#090D16",
                    "surfaceColor": "#131C2E",
                    "textColor": "#FEF3C7",
                    "mutedTextColor": "#D1D5DB",
                    "chartColors": ["#F59E0B", "#10B981", "#38BDF8", "#A78BFA"],
                    "captionHighlightColor": "#FBBF24",
                    "captionBackgroundColor": "rgba(9, 13, 22, 0.85)",
                },
                "cuts": [
                    {
                        "id": "t2-hook",
                        "source": "",
                        "type": "hero_title",
                        "in_seconds": 0.0,
                        "out_seconds": 4.8,
                        "text": "Tại Sao Nghỉ Ngơi Vẫn Mệt Mỏi?",
                        "heroSubtitle": "Giải Mã Sự Rò Rỉ Năng Lượng Tâm Trí Ngầm",
                        "backgroundVideo": "topics/t2/shot_01.mp4",
                        "backgroundOverlay": 0.45,
                        "accentColor": "#FBBF24",
                    },
                    {
                        "id": "t2-pie",
                        "source": "",
                        "type": "pie_chart",
                        "in_seconds": 4.8,
                        "out_seconds": 10.2,
                        "title": "Cấu Trúc Tiêu Hao Năng Lượng Mỗi Ngày (%)",
                        "chartData": [
                            {"label": "Suy Nghĩ Quá Tải & Tự Trách", "value": 62},
                            {"label": "Lo Âu Tương Lai Chưa Tới", "value": 23},
                            {"label": "Vận Động Thể Chất Thực Tế", "value": 15},
                        ],
                        "chartColors": ["#F43F5E", "#F59E0B", "#10B981"],
                        "donut": True,
                        "centerLabel": "Rò Rỉ Ngầm",
                        "centerValue": "85%",
                        "showLegend": True,
                        "backgroundVideo": "topics/t2/shot_02.mp4",
                        "backgroundOverlay": 0.58,
                    },
                    {
                        "id": "t2-callout",
                        "source": "",
                        "type": "callout",
                        "in_seconds": 10.2,
                        "out_seconds": 14.5,
                        "callout_type": "quote",
                        "title": "Phương Pháp Chữa Lành Nhịp Thở 4-7-8",
                        "text": "Hãy dừng lại một nhịp, hít vào thật sâu và đóng lại hàng ngàn tab suy nghĩ đang chạy ngầm.",
                        "backgroundVideo": "topics/t2/shot_04.mp4",
                        "backgroundOverlay": 0.46,
                        "accentColor": "#10B981",
                    },
                    {
                        "id": "t2-anime-peace",
                        "source": "",
                        "type": "anime_scene",
                        "in_seconds": 14.5,
                        "out_seconds": 20.0,
                        "images": ["topics/t2/ai_brain_overload.png", "topics/t2/ai_inner_peace_tree.png"],
                        "animation": "ken-burns",
                        "particles": "fireflies",
                        "particleColor": "#FBBF24",
                        "particleCount": 32,
                    },
                ],
                "overlays": [
                    {
                        "type": "stat_reveal",
                        "in_seconds": 14.8,
                        "out_seconds": 19.6,
                        "text": "100%",
                        "subtitle": "Phục hồi Pin Nội Lực",
                        "accentColor": "#10B981",
                        "position": "bottom-right",
                    },
                ],
            },
        ),
        # 3. KE CHUYEN DEM KHUYA
        (
            "om_t3_night_story",
            ROOT / "Chu-De" / "Ke-Chuyen-Dem-Khuya" / "openmontage_remotion.mp4",
            ROOT / "Chu-De" / "Ke-Chuyen-Dem-Khuya" / "tts_tap1.srt",
            {
                "theme": "anime-ghibli",
                "themeConfig": {
                    "primaryColor": "#F59E0B",
                    "accentColor": "#FBBF24",
                    "backgroundColor": "#090705",
                    "surfaceColor": "#18130E",
                    "textColor": "#FEF3C7",
                    "mutedTextColor": "#D6D3D1",
                    "chartColors": ["#F59E0B", "#D97706", "#B45309", "#78350F"],
                    "captionHighlightColor": "#FDE047",
                    "captionBackgroundColor": "rgba(12, 9, 6, 0.86)",
                },
                "cuts": [
                    {
                        "id": "t3-rain-open",
                        "source": "",
                        "type": "hero_title",
                        "in_seconds": 0.0,
                        "out_seconds": 6.2,
                        "text": "Bữa Cơm Chiều Mưa 30 Tết",
                        "heroSubtitle": "Kể Chuyện Đêm Khuya • Ký Ức Hiên Nhà Ngoại Ô",
                        "backgroundVideo": "topics/t3/shot_01.mp4",
                        "backgroundOverlay": 0.42,
                        "accentColor": "#FBBF24",
                    },
                    {
                        "id": "t3-father-house",
                        "source": "",
                        "type": "anime_scene",
                        "in_seconds": 6.2,
                        "out_seconds": 13.8,
                        "images": ["topics/t3/ai_tet_rain_house.jpg", "topics/t3/wiki_vietnam_village.jpg"],
                        "animation": "ken-burns",
                        "particles": "mist",
                        "particleColor": "#FEF3C7",
                        "particleCount": 24,
                    },
                    {
                        "id": "t3-quote",
                        "source": "",
                        "type": "callout",
                        "in_seconds": 13.8,
                        "out_seconds": 18.2,
                        "callout_type": "quote",
                        "title": "Tình Thương Thầm Lặng Của Cha",
                        "text": "Cả cuộc đời ông chưa từng nói một lời yêu thương, nhưng chiếc áo khoác bạc màu vẫn giữ trọn ký ức gia đình.",
                        "backgroundVideo": "topics/t3/shot_05.mp4",
                        "backgroundOverlay": 0.48,
                        "accentColor": "#F59E0B",
                    },
                    {
                        "id": "t3-letter-close",
                        "source": "",
                        "type": "anime_scene",
                        "in_seconds": 18.2,
                        "out_seconds": 24.5,
                        "images": ["topics/t3/ai_father_letter.jpg"],
                        "animation": "zoom-in",
                        "particles": "fireflies",
                        "particleColor": "#FDE047",
                        "particleCount": 28,
                    },
                ],
                "overlays": [
                    {
                        "type": "section_title",
                        "in_seconds": 6.5,
                        "out_seconds": 13.0,
                        "text": "ĐÊM 30 TẾT",
                        "subtitle": "Người cha già lặng lẽ đợi bên mâm cơm chiều mưa",
                        "accentColor": "#FBBF24",
                        "position": "top-left",
                    },
                ],
            },
        ),
        # 4. BI AN LICH SU
        (
            "om_t4_history",
            ROOT / "Chu-De" / "Bi-An-Lich-Su" / "openmontage_remotion.mp4",
            ROOT / "Chu-De" / "Bi-An-Lich-Su" / "tts_tap1.srt",
            {
                "theme": "flat-motion-graphics",
                "themeConfig": {
                    "primaryColor": "#F59E0B",
                    "accentColor": "#EF4444",
                    "backgroundColor": "#0C0906",
                    "surfaceColor": "#1C140D",
                    "textColor": "#FEF3C7",
                    "mutedTextColor": "#D6D3D1",
                    "chartColors": ["#F59E0B", "#EF4444", "#10B981", "#38BDF8"],
                    "captionHighlightColor": "#FBBF24",
                    "captionBackgroundColor": "rgba(12, 9, 6, 0.86)",
                },
                "cuts": [
                    {
                        "id": "t4-coloa-open",
                        "source": "",
                        "type": "hero_title",
                        "in_seconds": 0.0,
                        "out_seconds": 5.2,
                        "text": "Bí Ẩn Quân Sự Thành Cổ Loa",
                        "heroSubtitle": "Kiệt Tác 3 Vòng Thành Xoắn Ốc Thế Kỷ III TCN",
                        "backgroundVideo": "topics/t4/shot_01.mp4",
                        "backgroundOverlay": 0.40,
                        "accentColor": "#F59E0B",
                    },
                    {
                        "id": "t4-walls-chart",
                        "source": "",
                        "type": "bar_chart",
                        "in_seconds": 5.2,
                        "out_seconds": 10.2,
                        "title": "Quy Mô Chu Vi 3 Vòng Thành Cổ Loa (Mét)",
                        "chartData": [
                            {"label": "Thành Ngoại (Vòng Ngoài)", "value": 8000},
                            {"label": "Thành Trung (Vòng Giữa)", "value": 6500},
                            {"label": "Thành Nội (Trung Tâm)", "value": 1650},
                        ],
                        "chartColors": ["#F59E0B", "#EF4444", "#38BDF8"],
                        "showGrid": True,
                        "showValues": True,
                        "backgroundVideo": "topics/t4/shot_03.mp4",
                        "backgroundOverlay": 0.58,
                    },
                    {
                        "id": "t4-kpi-arrows",
                        "source": "",
                        "type": "kpi_grid",
                        "in_seconds": 10.2,
                        "out_seconds": 16.6,
                        "title": "Hồ Sơ Khảo Cổ Kho Mũi Tên Đồng Cầu Vực",
                        "columns": 3,
                        "chartData": [
                            {"label": "Mũi Tên Đồng Khai Quật", "value": 10, "suffix": " Vạn+", "change": 100},
                            {"label": "Thiết Kế Khí Động Học", "value": 3, "suffix": " Cạnh Sắc", "change": 95},
                            {"label": "Sai Số Khuôn Đúc Đá", "value": 0.1, "suffix": " mm", "change": 99},
                        ],
                        "backgroundVideo": "topics/t4/shot_04.mp4",
                        "backgroundOverlay": 0.56,
                    },
                    {
                        "id": "t4-no-than-close",
                        "source": "",
                        "type": "anime_scene",
                        "in_seconds": 16.6,
                        "out_seconds": 22.7,
                        "images": ["topics/t4/ai_no_than_arrow.jpg", "topics/t4/ai_coloa_citadel.jpg"],
                        "animation": "ken-burns",
                        "particles": "light-rays",
                        "particleColor": "#F59E0B",
                        "particleCount": 24,
                    },
                ],
                "overlays": [
                    {
                        "type": "stat_reveal",
                        "in_seconds": 17.0,
                        "out_seconds": 22.2,
                        "text": "257 TCN",
                        "subtitle": "Kỹ thuật quân sự Âu Lạc có thật",
                        "accentColor": "#F59E0B",
                        "position": "bottom-right",
                    },
                ],
            },
        ),
        # 5. THE GIOI DONG VAT
        (
            "om_t5_wildlife",
            ROOT / "Chu-De" / "The-Gioi-Dong-Vat" / "openmontage_remotion.mp4",
            ROOT / "Chu-De" / "The-Gioi-Dong-Vat" / "tts_tap1.srt",
            {
                "theme": "flat-motion-graphics",
                "themeConfig": {
                    "primaryColor": "#10B981",
                    "accentColor": "#F59E0B",
                    "backgroundColor": "#040D08",
                    "surfaceColor": "#0A1F14",
                    "textColor": "#ECFDF5",
                    "mutedTextColor": "#A7F3D0",
                    "chartColors": ["#10B981", "#F59E0B", "#38BDF8", "#EF4444"],
                    "captionHighlightColor": "#34D399",
                    "captionBackgroundColor": "rgba(4, 13, 8, 0.86)",
                },
                "cuts": [
                    {
                        "id": "t5-hook",
                        "source": "",
                        "type": "hero_title",
                        "in_seconds": 0.0,
                        "out_seconds": 5.0,
                        "text": "Bóng Ma Săn Đêm Thảo Nguyên",
                        "heroSubtitle": "Giải Phẫu Sinh Tồn Báo Hoa Mai Châu Phi (Panthera pardus)",
                        "backgroundVideo": "topics/t5/shot_01.mp4",
                        "backgroundOverlay": 0.38,
                        "accentColor": "#10B981",
                    },
                    {
                        "id": "t5-vision-compare",
                        "source": "",
                        "type": "comparison",
                        "in_seconds": 5.0,
                        "out_seconds": 9.5,
                        "title": "Khả Năng Nhìn Xuyên Bóng Tối (Màng Tapetum Lucidum)",
                        "leftLabel": "Thị Giác Báo Hoa Mai",
                        "leftValue": "Nhân ×7 lần ánh sáng • Khóa mục tiêu trong đêm đen",
                        "rightLabel": "Thị Giác Con Người",
                        "rightValue": "1× Cơ bản • Mất phương hướng khi thiếu sáng",
                        "backgroundVideo": "topics/t5/shot_03.mp4",
                        "backgroundOverlay": 0.54,
                    },
                    {
                        "id": "t5-speed-kpi",
                        "source": "",
                        "type": "kpi_grid",
                        "in_seconds": 9.5,
                        "out_seconds": 17.0,
                        "title": "Thông Số Vũ Khí Sinh Học Khi Bứt Tốc",
                        "columns": 3,
                        "chartData": [
                            {"label": "Vận Tốc Nước Rút", "value": 60, "suffix": " km/h", "change": 98},
                            {"label": "Cự Ly Kích Hoạt Vồ", "value": 5, "suffix": " Mét", "change": 95},
                            {"label": "Độ Ồn Bước Chân", "value": 0, "suffix": " dB", "change": 100},
                        ],
                        "backgroundVideo": "topics/t5/shot_04.mp4",
                        "backgroundOverlay": 0.54,
                    },
                    {
                        "id": "t5-leopard-close",
                        "source": "",
                        "type": "anime_scene",
                        "in_seconds": 17.0,
                        "out_seconds": 21.5,
                        "images": ["topics/t5/ai_leopard_night.jpg", "topics/t5/wiki_leopard_action.jpg"],
                        "animation": "zoom-in",
                        "particles": "sparkles",
                        "particleColor": "#10B981",
                        "particleCount": 25,
                    },
                ],
                "overlays": [
                    {
                        "type": "stat_reveal",
                        "in_seconds": 17.2,
                        "out_seconds": 21.0,
                        "text": "60 km/h",
                        "subtitle": "Cỗ máy săn đêm hoàn hảo",
                        "accentColor": "#10B981",
                        "position": "bottom-right",
                    },
                ],
            },
        ),
        # 6. MEO VAT CUOC SONG
        (
            "om_t6_lifehack",
            ROOT / "Chu-De" / "Meo-Vat-Cuoc-Song" / "openmontage_remotion.mp4",
            ROOT / "Chu-De" / "Meo-Vat-Cuoc-Song" / "tts_tap1.srt",
            {
                "theme": "flat-motion-graphics",
                "themeConfig": {
                    "primaryColor": "#38BDF8",
                    "accentColor": "#34D399",
                    "backgroundColor": "#06101E",
                    "surfaceColor": "#0F1E36",
                    "textColor": "#F8FAFC",
                    "mutedTextColor": "#94A3B8",
                    "chartColors": ["#38BDF8", "#34D399", "#FBBF24", "#F43F5E"],
                    "captionHighlightColor": "#38BDF8",
                    "captionBackgroundColor": "rgba(6, 16, 30, 0.85)",
                },
                "cuts": [
                    {
                        "id": "t6-hook",
                        "source": "",
                        "type": "hero_title",
                        "in_seconds": 0.0,
                        "out_seconds": 6.6,
                        "text": "Đừng Vứt Giày Ố Vàng & Nồi Cháy Đen",
                        "heroSubtitle": "Mẹo Khoa Học Đời Thường • Xử Lý Sạch Bóng Trong 30 Giây",
                        "backgroundVideo": "topics/t6/shot_01.mp4",
                        "backgroundOverlay": 0.46,
                        "accentColor": "#38BDF8",
                    },
                    {
                        "id": "t6-formula",
                        "source": "",
                        "type": "comparison",
                        "in_seconds": 6.6,
                        "out_seconds": 11.2,
                        "title": "Công Thức Phản Ứng Trung Hòa Tự Nhiên",
                        "leftLabel": "2 Thìa Baking Soda (NaHCO₃)",
                        "leftValue": "Chất kiềm nhẹ làm mềm cặn cháy & vết ố",
                        "rightLabel": "1 Lát Chanh Tươi (Axit Citric)",
                        "rightValue": "Kích hoạt hàng triệu vi bọt khí CO₂ bóc tách",
                        "backgroundVideo": "topics/t6/shot_02.mp4",
                        "backgroundOverlay": 0.52,
                    },
                    {
                        "id": "t6-timer-stat",
                        "source": "",
                        "type": "stat_card",
                        "in_seconds": 11.2,
                        "out_seconds": 15.2,
                        "stat": "30 Giây",
                        "subtitle": "Thời gian vi bọt khí CO₂ tự động bóc tách mảng bám cứng đầu nhất",
                        "backgroundVideo": "topics/t6/shot_04.mp4",
                        "backgroundOverlay": 0.44,
                        "accentColor": "#34D399",
                    },
                    {
                        "id": "t6-kpi-save",
                        "source": "",
                        "type": "kpi_grid",
                        "in_seconds": 15.2,
                        "out_seconds": 20.0,
                        "title": "Hiệu Quả Thực Tế Cho Gian Bếp Gia Đình",
                        "columns": 3,
                        "chartData": [
                            {"label": "Thời Gian Chờ", "value": 30, "suffix": " Giây", "change": 95},
                            {"label": "Độ Sáng Bóng Bề Mặt", "value": 100, "suffix": "%", "change": 100},
                            {"label": "Tiết Kiệm Mỗi Tuần", "value": 3, "suffix": " Giờ", "change": 90},
                        ],
                        "backgroundVideo": "topics/t6/shot_06.mp4",
                        "backgroundOverlay": 0.54,
                    },
                ],
                "overlays": [
                    {
                        "type": "section_title",
                        "in_seconds": 11.4,
                        "out_seconds": 15.0,
                        "text": "PHẢN ỨNG SỦI BỌT CO₂",
                        "subtitle": "Không cần dùng bùi nhùi thép gây trầy xước",
                        "accentColor": "#34D399",
                        "position": "top-left",
                    },
                ],
            },
        ),
    ]

    jobs: list[tuple[str, Path, Path]] = []
    for idx, (name, out_mp4, srt_path, payload) in enumerate(configs, 1):
        tkey = f"t{idx}"
        payload["captions"] = parse_srt_to_word_captions(srt_path)
        payload["audio"] = {
            "narration": {"src": f"topics/{tkey}/narration.mp3", "volume": 1.0},
            "music": {"src": f"topics/{tkey}/music.wav", "volume": 0.30, "fadeInSeconds": 0.8, "fadeOutSeconds": 1.5, "loop": True},
        }
        prop_file = PROPS_DIR / f"{name}.json"
        prop_file.write_text(json.dumps(payload, ensure_ascii=False, indent=2), encoding="utf-8")
        jobs.append((name, prop_file, out_mp4))
        print(f"[OPENMONTAGE PROPS READY] {prop_file.name} ({len(payload['captions'])} word captions)")
    return jobs


def main():
    npm_cmd = shutil.which("npm.cmd") or shutil.which("npm")
    npx_cmd = shutil.which("npx.cmd") or shutil.which("npx")
    remotion_bin = COMPOSER_DIR / "node_modules" / ".bin" / "remotion.cmd"
    if not remotion_bin.exists():
        print("Installing OpenMontage remotion-composer dependencies...", flush=True)
        subprocess.run([npm_cmd, "install", "--no-audit", "--no-fund"], cwd=COMPOSER_DIR, check=True)

    stage_topic_assets()
    jobs = build_openmontage_props()

    for idx, (name, prop_file, out_mp4) in enumerate(jobs, 1):
        out_mp4.parent.mkdir(parents=True, exist_ok=True)
        if out_mp4.exists() and out_mp4.stat().st_size > 100_000:
            print(f"[SKIP {idx}/6 ALREADY RENDERED] {out_mp4.relative_to(ROOT)} ({out_mp4.stat().st_size // 1024} KB)", flush=True)
            continue
        print(f"\n[{idx}/6 OPENMONTAGE RENDER] {name} -> {out_mp4.relative_to(ROOT)}...", flush=True)
        subprocess.run(
            [
                npx_cmd,
                "remotion",
                "render",
                "src/index.tsx",
                "Explainer",
                str(out_mp4),
                "--props",
                str(prop_file),
                "--scale",
                "0.75",
                "--codec",
                "h264",
            ],
            cwd=COMPOSER_DIR,
            check=True,
        )
        print(f"[DONE {idx}/6] {out_mp4.relative_to(ROOT)} ({out_mp4.stat().st_size // 1024} KB)", flush=True)


if __name__ == "__main__":
    main()
