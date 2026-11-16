# 5 Loại Video Có Thể Làm Trong OpenMontage (`remotion-composer`)

Tài liệu này tổng hợp chi tiết **5 loại video (Compositions / Pipelines)** có thể dựng trực tiếp trong hệ thống [`remotion-composer`](../remotion-composer/src/Root.tsx) đối với các nội dung phân tích tâm lý, hành vi, nội tâm, triết học và kể chuyện (ví dụ: chủ đề *“Phản ứng theo cảm xúc bản năng, cơ chế phòng vệ cái tôi & sự trưởng thành tỉnh thức”*).

---

## Bảng So Sánh Nhanh 5 Loại Video

| STT | Loại Video | Composition ID | Mã nguồn chính | Khung hình | Tỷ lệ Cảnh thật / Đồ họa | Điểm mạnh nổi bật |
| :---: | :--- | :--- | :--- | :---: | :---: | :--- |
| **1** | **Kể Chuyện Tâm Lý Đời Thường & Điện Ảnh** | `InnerThoughtsEpisode` | [`InnerThoughtsEpisode.tsx`](../remotion-composer/src/InnerThoughtsEpisode.tsx) | `1920x1080` (16:9) | **80% Cảnh thật / 20% Đạo cụ đời thường** | Chân thật, giàu cảm xúc nhất; có hiệu ứng màn hình điện thoại (`phone`), giấy ghi chú (`note`), đối chiếu 2 cột tinh tế (`comparison`). |
| **2** | **Phim Tài Liệu Điện Ảnh Thuần Cảnh Quay Thật** | `CinematicRenderer` | [`CinematicRenderer.tsx`](../remotion-composer/src/CinematicRenderer.tsx) | `1920x1080` (16:9) | **100% Cảnh quay thật + Chữ điện ảnh** | Sống động như phim tài liệu Netflix/BBC; chỉnh màu tự động (`steel`, `cold`, `neutral`), chuyển cảnh mờ chồng mượt mà. |
| **3** | **Video Giải Thích Pha Trộn Cảnh Thật + Đồ Họa Nhịp Nhàng** | `Explainer` | [`Explainer.tsx`](../remotion-composer/src/Explainer.tsx) | `1920x1080` (16:9) | **50% Cảnh thật / 50% Motion Graphics** | Trực quan, dễ nắm bắt cấu trúc 3 nhánh (`kpi_grid`), bàn cân đối lập (`comparison`), biểu đồ (`bar_chart`, `pie_chart`), hộp nhấn (`callout`). |
| **4** | **Video Ngắn Dọc 9:16 Tốc Độ Cao (TikTok / Reels / Shorts)** | `TalkingHead` / `CollageBurst` / `LyricOverlay` | [`TalkingHead.tsx`](../remotion-composer/src/TalkingHead.tsx) • [`CollageBurst.tsx`](../remotion-composer/src/CollageBurst.tsx) | `1080x1920` (9:16) | **90% Cảnh thật dọc + Phụ đề Karaoke lớn** | Tối ưu lướt trên điện thoại; giữ chân 3 giây đầu, phụ đề nhảy từng từ kích thước lớn giữa màn hình. |
| **5** | **Video Kể Chuyện Nghệ Thuật Ánh Sáng & Hạt Chuyển Động** | `Explainer` (`type: "anime_scene"`) | [`AnimeScene.tsx`](../remotion-composer/src/components/AnimeScene.tsx) | `1920x1080` (16:9) | **100% Nhiếp ảnh / Tranh + Hạt hiệu ứng** | Sâu lắng, chữa lành; có chuyển động máy `ken-burns` kèm hạt đom đóm (`fireflies`), tia nắng (`light-rays`), sương mờ (`mist`). |

---

## Chi Tiết Từng Loại Video & Cách Cấu Hình

### 1. Video Kể Chuyện Tâm Lý Đời Thường & Điện Ảnh (`InnerThoughtsEpisode`)
- **Mã nguồn Engine:** [`remotion-composer/src/InnerThoughtsEpisode.tsx`](../remotion-composer/src/InnerThoughtsEpisode.tsx)
- **File Props mẫu:** [`reactive-mind-inner-thoughts.json`](../remotion-composer/public/demo-props/reactive-mind-inner-thoughts.json) • [`inner-01-haitrieu.json`](../remotion-composer/public/demo-props/inner-01-haitrieu.json)
- **Đặc điểm thị giác:**
  - Nền phim phủ lớp hạt điện ảnh (`film grain`) và dải màu xanh đêm sâu (`#0b132b`), chữ màu kem ấm (`#f5efe4`), từ đang đọc sáng màu ngọc lục bảo (`#34d399`).
  - Hỗ trợ **7 loại nhịp thị giác (`beat.kind`)**:
    1. **`footage`:** Phát cảnh quay người thật HD toàn màn hình kèm dòng chữ đề mục tinh tế phía dưới.
    2. **`image`:** Hiển thị nhiếp ảnh thực tế với chuyển động zoom/pan nhẹ nhàng.
    3. **`phone`:** Mô phỏng chiếc điện thoại lúc đêm khuya (`02:07`), hiển thị câu nói gây tổn thương và dòng tin nhắn nháp đang gõ dở (`Chưa gửi`).
    4. **`note`:** Hiển thị tờ giấy ghi chú màu kem đặt nghiêng nhẹ trên nền cảnh thật (ví dụ: *3 phản xạ tự động khi thiếu tỉnh thức*).
    5. **`comparison`:** Đặt 2 cột chữ đối lập cạnh nhau ngay trên nền cảnh quay mờ (`32%` opacity) mà không đóng khung hộp nặng nề.
    6. **`question`:** Hiện câu hỏi tự vấn cỡ chữ lớn giữa màn hình.
    7. **`chapter` / `source`:** Hiện tiêu đề chương hoặc trích dẫn nghiên cứu tâm lý.
- **Lệnh kết xuất (Render CLI):**
  ```powershell
  cd remotion-composer
  npx remotion render InnerThoughtsEpisode ../projects/tiktok_thaylacthien/video_loai1_inner_thoughts.mp4 --props=./public/demo-props/reactive-mind-inner-thoughts.json
  ```

---

### 2. Video Phim Tài Liệu Điện Ảnh Thuần Cảnh Quay Thật (`CinematicRenderer`)
- **Mã nguồn Engine:** [`remotion-composer/src/CinematicRenderer.tsx`](../remotion-composer/src/CinematicRenderer.tsx)
- **Đặc điểm thị giác:**
  - **100% cảnh quay video thực tế toàn màn hình (`Full-bleed Real Footage`)**, tự động áp bộ lọc màu điện ảnh (`contrast(1.06) saturate(0.88) brightness(0.92)`) và vignette viền tối.
  - Không dùng biểu đồ hay hộp thẻ; chữ chỉ xuất hiện dưới dạng **Typography điện ảnh tối giản** (`title`, `subtitle`, `kicker`) ở các khoảnh khắc chuyển ý quan trọng.
- **Khi nào nên dùng:** Khi bạn muốn khán giả đắm chìm hoàn toàn vào biểu cảm con người, ánh mắt, cơn mưa, thiên nhiên mà không bị phân tâm bởi đồ họa số liệu.
- **Lệnh kết xuất (Render CLI):**
  ```powershell
  cd remotion-composer
  npx remotion render CinematicRenderer ../output_cinematic.mp4 --props=./public/demo-props/your-cinematic-props.json
  ```

---

### 3. Video Giải Thích Pha Trộn Cảnh Thật + Đồ Họa Nhịp Nhàng (`Explainer` Hybrid)
- **Mã nguồn Engine:** [`remotion-composer/src/Explainer.tsx`](../remotion-composer/src/Explainer.tsx)
- **File Props mẫu:** [`reactive-mind-explainer.json`](../remotion-composer/public/demo-props/reactive-mind-explainer.json)
- **Đặc điểm thị giác:**
  - Kết hợp **cảnh quay người thật toàn màn hình** (`source: "episodes/reactive-mind/real_03_fear_avoid.mp4"`) xen kẽ với **các thẻ đồ họa chuyển động lò xo (`spring()`)** có lớp nền video thực tế phía sau (`backgroundVideo` với `backgroundOverlay: 0.35 - 0.45`):
    - `hero_title`: Tiêu đề mở đầu ấn tượng.
    - `kpi_grid`: Liệt kê 3 phản xạ tự động (*01 • Công kích*, *02 • Trốn tránh*, *03 • Đổ lỗi*).
    - `comparison`: Bàn cân đối chiếu 2 mặt (*Phản xạ bảo vệ cái tôi* vs. *Dũng khí trưởng thành*).
    - `bar_chart` / `pie_chart` / `line_chart`: Biểu đồ trực quan hóa nguyên nhân tâm lý.
    - `callout`: Hộp ghi nhớ công thức thực hành (*Dừng lại • Quan sát • Chủ động đáp trả*).
    - `overlays` (`section_title`, `stat_reveal`): Nhãn tiêu đề góc trên bên trái hiện trên các cảnh quay người thật toàn màn hình.
- **Lệnh kết xuất (Render CLI):**
  ```powershell
  cd remotion-composer
  npx remotion render Explainer ../projects/tiktok_thaylacthien/reactive_mind_realistic.mp4 --props=./public/demo-props/reactive-mind-explainer.json
  ```

---

### 4. Video Ngắn Dọc 9:16 Tốc Độ Cao (`TalkingHead` / `CollageBurst` / Vertical Shorts)
- **Mã nguồn Engine:** [`remotion-composer/src/TalkingHead.tsx`](../remotion-composer/src/TalkingHead.tsx) • [`remotion-composer/src/CollageBurst.tsx`](../remotion-composer/src/CollageBurst.tsx)
- **Đặc điểm thị giác:**
  - Khung hình dọc chuẩn điện thoại (`1080x1920`, 30fps).
  - Cắt cảnh nhanh mỗi `3–5 giây` bằng các thước phim quay cận cảnh biểu cảm kết hợp phụ đề nhảy từng từ (`wordsPerPage: 4`, `fontSize: 52`) nằm ở vùng an toàn trung tâm.
- **Khi nào nên dùng:** Khi xuất bản trực tiếp lên **TikTok, YouTube Shorts, Facebook/Instagram Reels**.

---

### 5. Video Kể Chuyện Nghệ Thuật Ánh Sáng & Hạt Chuyển Động (`AnimeScene` / `Ink Theater`)
- **Mã nguồn Engine:** [`remotion-composer/src/components/AnimeScene.tsx`](../remotion-composer/src/components/AnimeScene.tsx) (gọi qua `type: "anime_scene"` trong `Explainer`)
- **Đặc điểm thị giác:**
  - Trình chiếu chuỗi nhiếp ảnh nghệ thuật độ phân giải cao (Unsplash / AI Keyframe 16:9) với chuyển động camera `ken-burns`, `pan-left`, `zoom-in` mượt mà.
  - Phủ lớp hạt chuyển động thời gian thực (`particles`: `"fireflies"`, `"sparkles"`, `"mist"`, `"light-rays"`) và ánh sáng chuyển sắc (`lightingFrom` → `lightingTo`).
- **Khi nào nên dùng:** Dùng cho đoạn kết lắng đọng ở cuối video tâm lý, hoặc làm toàn bộ video cho chủ đề **Kể Chuyện Đêm Khuya**, **Thiền & Chữa Lành**, **Triết Học**.

