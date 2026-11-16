# Trung Tâm Điều Khiển AI Agent (`.agents/`) — Dự Án `video-v2`

Thư mục `.agents/` này đã được hệ thống **Antigravity tự động nhận diện và nạp 100%**.

---

## 1. Cấu Trúc Hiện Tại Trong `.agents/`

| Thành phần | Đường dẫn | Trạng thái | Chức năng |
|---|---|---|---|
| **1. Quy tắc bắt buộc (Rules)** | [`../AGENTS.md`](../AGENTS.md) & [`./rules/video-production-rules.md`](./rules/video-production-rules.md) | ✅ Đang bật tự động (`always_on`) | Khóa cứng quy chuẩn hình ảnh (không dùng người que, ưu tiên 5 Style 3D/B-Roll/Motion Canvas), chuẩn âm thanh 3 lớp Vibi TTS + SFX và quy tắc FFmpeg/Chrome CDP. |
| **2. Kỹ năng nội bộ (Core Pipeline Skill)** | [`./skills/vibi-tts-chrome-pipeline/SKILL.md`](./skills/vibi-tts-chrome-pipeline/SKILL.md) | ✅ Đã nạp | Quy trình khép kín gọi API Vibi TTS (`.mp3` + `.srt`), kết xuất đồ họa 3D qua Headless Chrome CDP và ghép cảnh thật bằng FFmpeg `xfade`. |
| **3. Bộ 11 Skills YouTube (`youtube-agent-skill`)** | `./skills/youtube-agent-skill__yt-*` | ✅ Đã nạp | Viết kịch bản 21 công thức Hook (`yt-script`), giữ chân người xem (`yt-retention`), bảng phân cảnh EDL (`yt-edit`), chấm điểm Tiêu đề/Thumbnail (`yt-package`), cắt Shorts (`yt-shorts`), SEO (`yt-seo`). |
| **4. Bộ Đạo diễn Điện ảnh & Storyboard** | `./skills/ai-film-skills__*` & `./skills/visual-skills__video` | ✅ Đã nạp | Đạo diễn kịch bản (`director-agent`), thiết kế góc máy/ánh sáng (`ai-storyboard-director`), thiết kế bối cảnh (`scene-asset`) và nhịp dựng phim. |
| **5. Bộ Đồ họa 3D & Remotion** | `./skills/remotion-*` & `./skills/claude-remotion-skill__*` | ✅ Đã nạp | Thiết kế Motion Graphics, giao diện kính mờ 3D Apple VisionOS, hiệu ứng chữ động và vật lý lò xo (*Spring Physics*). |
| **6. Bộ Dựng Phim & CapCut Tự Động** | `./skills/VectCutAPI__*` & `./skills/editing-videos` | ✅ Đã nạp | Tư duy biên tập viên dựng phim và xuất file Project nháp cho CapCut PC (`capcut-director`). |
| **7. Bộ Giọng Văn & Kể Chuyện** | `./skills/social-media-skills__*` & `./skills/knowledge-work-plugins__*` | ✅ Đã nạp | Định hình giọng văn (`voice-builder`), nghệ thuật kể chuyện (`storytelling-and-narrative`), quản lý lịch nội dung (`social-content-engine`). |
| **8. Bộ 12 Skills OpenMontage Studio (`calesthio/OpenMontage`)** | `./skills/openmontage-*` | ✅ Đã nạp | Dựng phim bằng React/Remotion (`openmontage-remotion`), biểu đồ động (`openmontage-data-viz`), đồng bộ phụ đề từng từ (`openmontage-subtitle-sync`), đạo diễn Explainer (`openmontage-explainer-director`), Documentary Montage (`openmontage-documentary-montage`), thiết kế âm thanh (`openmontage-sound-design`) và chỉnh màu LUT (`openmontage-color-grading`). |
| **9. Skill Kênh Giải Mã Bản Đồ Việt Nam** | [`./skills/vietnam-map-explainer/SKILL.md`](./skills/vietnam-map-explainer/SKILL.md) | ✅ Đã nạp | Quy chuẩn sản xuất trọn gói cho kênh bản đồ hạ tầng Việt Nam: vệ tinh Sentinel-2 đa tầng + OSM, chủ quyền Hoàng Sa – Trường Sa, ảnh thực địa phóng to/khoanh vùng Spotlight, phương tiện chạy trên tuyến, phụ đề từ khóa chuẩn chính tả, Micro-SFX `15 ms` và tối ưu render nhanh gấp 14 lần. |

---

## 2. Chủ đề YouTube hiện hành

- Chủ đề: giải mã địa lý kinh tế và hạ tầng dân dụng Việt Nam bằng bản đồ.
- [README chủ đề](../Chu-De/README.md)
- [Quyết định ngách và Giai đoạn 0](../Chu-De/21_QUYET_DINH_NGACH_VA_GIAI_DOAN_0.md)
- [Tư liệu nghiên cứu GitHub/thị trường](../Chu-De/16_PHAN_TICH_DOC_LAP_GITHUB_THI_TRUONG_NGACH_2026-11-14.md)


