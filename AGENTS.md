# Quy Chuẩn Dự Án Sản Xuất & Tùy Biến Video (`OpenMontage Custom Workspace`)

Tài liệu này là **Quy tắc cố định (Workspace Rules)** được nạp tự động cho mọi tác vụ trong thư mục `C:\Users\ACER\Desktop\Openmontage-Room`.

---

## 1. Kiến Trúc Cốt Lõi (`OpenMontage React/Remotion Studio`)
1. **Engine Kết Xuất Mặc Định Ưu Tiên Số 1 (`./remotion-composer/`):**
   - Toàn bộ mã nguồn giao diện, chuyển động vật lý lò xo (`spring()`) và bố cục video nằm tại [`./remotion-composer/src/`](./remotion-composer/src/Explainer.tsx).
   - Các Composition chính trong [`./remotion-composer/src/Root.tsx`](./remotion-composer/src/Root.tsx):
     - **`Explainer`** ([`Explainer.tsx`](./remotion-composer/src/Explainer.tsx)): Hỗ trợ đầy đủ `hero_title`, `stat_card`, `comparison`, `callout`, `kpi_grid`, `bar_chart`, `pie_chart`, `line_chart`, `progress_bar`, `anime_scene` (Ken Burns + hạt `fireflies`, `mist`, `light-rays`, `sparkles`), lớp nền `backgroundVideo` / `backgroundImage` và phụ đề nhảy từng từ `<CaptionOverlay>`.
     - **`CinematicRenderer`** ([`CinematicRenderer.tsx`](./remotion-composer/src/CinematicRenderer.tsx)): Dựng trailer/phim tài liệu điện ảnh.
     - **`CollageBurst`** ([`CollageBurst.tsx`](./remotion-composer/src/CollageBurst.tsx)), **`TalkingHead`**, **`TitledVideo`**, **`ProductReveal`**.
2. **Quy Tắc Tư Liệu & Hình Ảnh (Bắt Buộc):**
   - **100% Không Dùng Chung Tư Liệu Giữa Các Chủ Đề:** Mỗi chủ đề lưu tư liệu riêng tại `<Chủ-Đề>/assets/` kết hợp 3 nguồn: Video quay thật HD + Tư liệu khoa học/lịch sử Wikimedia + AI Keyframe 16:9.

---

## 2. Quy Tắc Âm Thanh & Giọng Đọc (Vibi TTS + SFX)
1. **Giọng đọc tiếng Việt (TTS):**
   - Luôn tạo qua API Vibi (`https://api.vibi.pro`) bằng công cụ [`./_tools/vibi_tts.py`](./_tools/vibi_tts.py) và cấu hình [`./_tools/vibi_tts.json`](./_tools/vibi_tts.json).
   - API Key được lưu tại `.vibi_api_key` (nằm trong `.gitignore`, tuyệt đối không ghi cứng vào code).
   - Luôn bật `export_transcript: True` để tải đồng thời cả file âm thanh `.mp3` và phụ đề `.srt` khớp từng mili-giây, sau đó chuyển thành `WordCaption[]` cho `<CaptionOverlay>`.
2. **Thiết kế âm thanh (Sound Design):**
   - Kết hợp `audio.narration` (`volume: 1.0`) và `audio.music` (`volume: 0.25–0.35`, có `fadeInSeconds` & `fadeOutSeconds`) trực tiếp trong JSON Props của `OpenMontage`.

---

## 3. Cấu Trúc Thư Mục `Chu-De/` (Lưu Trữ Toàn Bộ Thông Tin & 6 Chủ Đề)
Toàn bộ tài liệu nghiên cứu, kế hoạch sản xuất, hướng dẫn tùy biến và 6 chủ đề video được gom gọn trong thư mục [`./Chu-De/`](./Chu-De/README.md):
- **Mục lục trung tâm:** [`./Chu-De/README.md`](./Chu-De/README.md)
- **Hồ sơ định vị thương hiệu tổng:** [`./Chu-De/brand-profile.md`](./Chu-De/brand-profile.md)
- **Bản nghiên cứu chọn chủ đề:** [`./Chu-De/NGHIEN_CUU_CHU_DE.md`](./Chu-De/NGHIEN_CUU_CHU_DE.md)
- **Tổng hợp kịch bản 2 cột (AV Script) & Props JSON 6 chủ đề:** [`./Chu-De/TONG_HOP_KICH_BAN_VA_VIDEO_DEMO_6_CHU_DE.md`](./Chu-De/TONG_HOP_KICH_BAN_VA_VIDEO_DEMO_6_CHU_DE.md)
- **Hướng dẫn tùy biến (Custom) OpenMontage:** [`./Chu-De/HUONG_DAN_CUSTOM_OPENMONTAGE.md`](./Chu-De/HUONG_DAN_CUSTOM_OPENMONTAGE.md)
- **Hướng dẫn cấu hình `.env` & API Keys tối ưu:** [`./Chu-De/CAU_HINH_ENV_VA_API_KEYS.md`](./Chu-De/CAU_HINH_ENV_VA_API_KEYS.md)
- **Danh sách 28 Skills & Kho Repo làm video:** [`./Chu-De/DANH_SACH_28_SKILLS_LAM_VIDEO.md`](./Chu-De/DANH_SACH_28_SKILLS_LAM_VIDEO.md) • [`./Chu-De/TONG_HOP_REPO_SKILLS.md`](./Chu-De/TONG_HOP_REPO_SKILLS.md)
- **6 thư mục kịch bản & hồ sơ kênh:**
  1. [`./Chu-De/Tam-Ly-Hoc-Tu-Duy/`](./Chu-De/Tam-Ly-Hoc-Tu-Duy/KICH_BAN_VA_PHAN_CANH_DEMO.md) *(Props: [`om_t1_behavior.json`](./remotion-composer/public/demo-props/om_t1_behavior.json))*
  2. [`./Chu-De/Better-Version-Tam-Ly/`](./Chu-De/Better-Version-Tam-Ly/KICH_BAN_VA_PHAN_CANH_DEMO.md) *(Props: [`om_t2_healing.json`](./remotion-composer/public/demo-props/om_t2_healing.json))*
  3. [`./Chu-De/Ke-Chuyen-Dem-Khuya/`](./Chu-De/Ke-Chuyen-Dem-Khuya/KICH_BAN_VA_PHAN_CANH_DEMO.md) *(Props: [`om_t3_night_story.json`](./remotion-composer/public/demo-props/om_t3_night_story.json))*
  4. [`./Chu-De/Bi-An-Lich-Su/`](./Chu-De/Bi-An-Lich-Su/KICH_BAN_VA_PHAN_CANH_DEMO.md) *(Props: [`om_t4_history.json`](./remotion-composer/public/demo-props/om_t4_history.json))*
  5. [`./Chu-De/The-Gioi-Dong-Vat/`](./Chu-De/The-Gioi-Dong-Vat/KICH_BAN_VA_PHAN_CANH_DEMO.md) *(Props: [`om_t5_wildlife.json`](./remotion-composer/public/demo-props/om_t5_wildlife.json))*
  6. [`./Chu-De/Meo-Vat-Cuoc-Song/`](./Chu-De/Meo-Vat-Cuoc-Song/KICH_BAN_VA_PHAN_CANH_DEMO.md) *(Props: [`om_t6_lifehack.json`](./remotion-composer/public/demo-props/om_t6_lifehack.json))*
