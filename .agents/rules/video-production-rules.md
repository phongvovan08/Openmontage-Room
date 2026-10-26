# Quy Chuẩn Kỹ Thuật & Phối Hợp Skills Trong Dự Án `OpenMontage`

1. **Thứ tự kích hoạt Skills cho mỗi tập phim mới:**
   - **Bước 1 (Giọng văn & Định vị):** Đọc `brand-profile.md` và `voice.md` của chủ đề/kênh tương ứng.
   - **Bước 2 (Kịch bản & Hook 30s đầu):** Kích hoạt `yt-script` (21 công thức Hook) + `storytelling-and-narrative` + `yt-retention`.
   - **Bước 3 (Bảng phân cảnh & Tư liệu đa nguồn):** Kích hoạt `scripting-and-storyboarding` + `openmontage-broll-planning` + `openmontage-explainer-director` để thiết kế kịch bản 2 cột (AV Script) và chuẩn bị tư liệu đa nguồn riêng biệt (Stock Video thật + Tư liệu Wikimedia + AI Keyframe 16:9).
   - **Bước 4 (Giọng đọc & Kết xuất Video bằng `OpenMontage Remotion`):** Tạo giọng đọc Vibi TTS (`.mp3` + `.srt`) qua `_tools/vibi_tts.py`, sau đó kích hoạt `openmontage-remotion` + `openmontage-data-viz` + `openmontage-subtitle-sync` để xuất video qua `./remotion-composer` (`npx remotion render src/index.tsx Explainer`).
   - **Bước 5 (Đóng gói xuất bản):** Kích hoạt `yt-package` (kiểm tra Tiêu đề + Thumbnail), `yt-seo` (mô tả + từ khóa) và `yt-chapters` (chia chương tự động).
