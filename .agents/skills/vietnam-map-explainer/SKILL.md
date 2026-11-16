---
name: vietnam-map-explainer
description: >-
  End-to-end production runbook and visual/technical standard for the Vietnamese
  economic geography & civil infrastructure map-explainer YouTube channel
  ("Giải mã địa lý kinh tế và hạ tầng dân dụng Việt Nam bằng bản đồ"). Use this
  skill whenever creating, planning, scripting, designing, rendering, or revising
  any map-based explainer video (10–15 min 16:9 main episodes or 45–58s 9:16
  Shorts) about Vietnamese ports, airports (e.g. Long Thành), expressways (e.g.
  cao tốc miền Tây), railways, power grids, rivers, or logistics corridors in
  Remotion Atelier.
---

# Vietnam Map Explainer — Chuẩn Sản Xuất Bản Đồ 3D Johnny Harris / Vox (v5)

Skill này đóng gói toàn bộ tiêu chuẩn kịch bản, đóng gói tiêu đề/thumbnail, kiến trúc bản đồ 3D nghiêng sâu `52°–56°` kiểu Johnny Harris / Vox, Supersampling `4K` chống mờ, vệ tinh EOX `2024` mức `z14`, phụ đề đứng yên `0px jitter`, giọng đọc Vibi TTS (`Haitrieu`) và âm thanh sạch bản quyền đã kiểm chứng thực tế trên dự án mẫu [demo-giai-ma-ban-do-90s](../../../projects/demo-giai-ma-ban-do-90s/).

> [!IMPORTANT]
> Luôn tuân thủ song song [AGENTS.md](../../../AGENTS.md), [AGENT_GUIDE.md](../../../AGENT_GUIDE.md) và quyết định kênh tại [21_QUYET_DINH_NGACH_VA_GIAI_DOAN_0.md](../../../Chu-De/21_QUYET_DINH_NGACH_VA_GIAI_DOAN_0.md). Không tạo media trước khi qua cổng duyệt `proposal`, không tự ý đổi runtime/provider, và **chỉ tải lên Google Drive khi người dùng yêu cầu rõ ràng**.

---

## 1. Chiến Lược Định Dạng & Bộ Skill Viết Bài Đầu Vào

1. **Định dạng phát hành chuẩn:**
   - **Trụ cột chính (80% nguồn lực):** **1 Video dài `10–14 phút` (`16:9` ngang)** mỗi tuần giải mã trọn vẹn 1 đại công trình qua 4–5 chương nhân quả (*Lịch sử → Địa lý/Thủy văn → Địa chất/Chi phí → Lời giải công trình → Quy hoạch 2030*). Tuyệt đối không bôi chữ câu giờ; tránh đăng video ngang lửng lơ `1,5–3 phút` làm nội dung chính thức.
   - **Phễu kéo khán giả (20% nguồn lực):** **1–2 Shorts vệ tinh `45–58 giây` (`9:16` dọc)** mỗi tuần, tách đúng **1 nghịch lý gây sốc nhất** từ cùng kho dữ liệu (bố cục lại cho khung dọc, chữ lớn đọc được khi tắt tiếng, gắn **Related Video** trỏ về bản dài).
2. **Chuỗi Skill bắt buộc khi lên đề tài & viết kịch bản mới:**
   - **Bước Đóng gói trước khi viết (`Write Packaging First`):** Đọc và chạy `yt-package` (`title.py`) + `thumbnail-design` chốt 3 cặp Tiêu đề (`<= 60` ký tự, có địa danh + con số + đối trọng quen tên như *Singapore / Tân Sơn Nhất / miền Đông*) và concept Thumbnail tối đa 3–4 từ cỡ đại.
   - **Bước Viết Hook & Kịch bản giữ chân:** Đọc `yt-script` (chấm 5 câu mở màn qua `hookscore.py` dựa trên `hooks.json` để chọn 2 câu mạnh nhất cho `15 giây` đầu) + `storytelling-and-narrative` (`BEATS`) + [script-director.md](../../../skills/pipelines/explainer/script-director.md) + [voice-performance-director.md](../../../skills/meta/voice-performance-director.md).
   - **Bước Mô tả & Chương mục:** Dùng `yt-chapters` và `yt-seo` khi đóng gói `exports/metadata/`.

---

## 2. Bộ Module Đồ Họa Mẫu (`projects/demo-giai-ma-ban-do-90s/`)

Khi khởi tạo tập mới tại `projects/<project-id>/` (`animated-explainer`, `render_runtime: "remotion"`, `composition_mode: "atelier"`, **tuyệt đối không import từ `remotion-composer/src/*`**), kế thừa và tùy biến từ các module chuẩn sau:

- **Bộ chiếu Bản đồ Chiến thuật 3D (`48°–52°`) & Full-Bleed Horizon:** [Tactical3DKit.tsx](../../../projects/demo-giai-ma-ban-do-90s/scenes/Tactical3DKit.tsx)
  - `createProjector3D(spec)`: Phép chiếu ma trận CSS 3D chính xác tuyệt đối từ tọa độ mặt đất & độ cao `(gx, gy, gz)` sang pixel màn hình `[sx, sy, k]`.
  - `Tactical3DStage` & `GROUND_BLEED = { x: 880, top: 1250, bottom: 300 }`: Mở rộng mặt phẳng địa hình 3D cả 4 phía ở độ phân giải supersampling `SUPER = 1.5` kết hợp vòm trời chân trời cao (`height: 186px`) để cảnh nghiêng sâu lẫn góc xoay `yaw` luôn phủ kín lên tận đường chân trời, không bao giờ mất khúc bản đồ phía trên.
  - `Pin3DStalk`: Vòng radar mặt đất + trụ laser 3D dựng đứng (`z = 85–180 px`) nâng thẻ thông tin phẳng 2D tách khỏi địa hình.
  - `Arc3DRoute`: Quỹ đạo hàng hải / đường bay vòng cung parabol 3D vọt lên không trung kèm bóng đổ mặt biển.
  - `Bridge3DExtrusion` & `Extruded3DPolygon`: Cầu vượt biển dựng nổi 3D trên hàng trụ bê tông có bóng đổ dưới nước; khối bến cảng / khu quy hoạch đùn nổi 3D (`solid` cho hiện hữu, `dashed` cho quy hoạch 2030).
- **Toán học phép chiếu Mercator 16:9 & Haversine:** [mapMath.ts](../../../projects/demo-giai-ma-ban-do-90s/mapMath.ts).
- **Bảng màu Hải đồ / Địa hình & Safe Zone (`SAFE_X = 64..80`, `SAFE_Y = 64`):** [theme.ts](../../../projects/demo-giai-ma-ban-do-90s/theme.ts).
- **Nền vệ tinh EOX `2024` đa tầng (`z6–z14`) + Chủ quyền Hoàng Sa – Trường Sa:** [HydroBaseLayers.tsx](../../../projects/demo-giai-ma-ban-do-90s/scenes/HydroBaseLayers.tsx).
- **Thẻ ảnh thực địa sạch gọn (chỉ phóng to ảnh đinh):** [EvidencePhotoCard.tsx](../../../projects/demo-giai-ma-ban-do-90s/scenes/EvidencePhotoCard.tsx).
- **Phương tiện di chuyển trên tuyến:** [MovingVessel.tsx](../../../projects/demo-giai-ma-ban-do-90s/scenes/MovingVessel.tsx).
- **Thanh phụ đề đứng yên tuyệt đối (`0px layout shift`):** [KeywordCaptionBar.tsx](../../../projects/demo-giai-ma-ban-do-90s/scenes/KeywordCaptionBar.tsx).

---

## 3. Quy Tắc Bắt Buộc Về Chủ Quyền, Màn Hình Sạch & Pháp Lý

1. **Chủ quyền lãnh thổ Việt Nam (Không khoanh vòng tròn nhân tạo):**
   - Mọi cảnh bản đồ cấp quốc gia, liên vùng hoặc Biển Đông **bắt buộc** hiển thị rõ ràng các chấm đảo/đá và nhãn tiếng Việt **`QUẦN ĐẢO HOÀNG SA (VIỆT NAM)`** và **`QUẦN ĐẢO TRƯỜNG SA (VIỆT NAM)`** không bị bất kỳ thẻ chữ, ảnh hay đường tuyến nào đè lên.
   - **Tuyệt đối không vẽ vòng tròn/elip nét đứt khoanh vùng** quanh hai quần đảo; trình bày tự nhiên, đĩnh đạc chuẩn bản đồ địa lý.
2. **Khung hình sạch chuẩn truyền hình — Bỏ toàn bộ chữ nguồn/tìm kiếm vụn trên video:**
   - **Không hiển thị** dòng credit Wikimedia, dòng `Ảnh vệ tinh: EOxCloudless... © OpenStreetMap`, dòng `Nguồn số liệu:...`, con dấu kiểm duyệt nội bộ hay nhãn kỹ thuật (`CÚ MÁY`, `PIN-LABEL`, `PITCH 56°`) lên mặt video hoặc chân ảnh tư liệu.
   - Toàn bộ thông tin bản quyền (`EOxCloudless Sentinel-2 2024 CC BY 4.0`, `© OpenStreetMap contributors ODbL`, tên tác giả & giấy phép từng ảnh Wikimedia Commons) và danh mục văn bản gốc phải được ghi **đầy đủ, chính xác trong `exports/metadata/description.txt` và `artifacts/asset_manifest.json`**.
   - Với mọi ảnh tải từ Wikimedia Commons, bắt buộc mở kiểm tra 100% bằng `read_file` để loại bỏ ảnh dính watermark báo chí/logo bên thứ ba.
3. **Phân tách trạng thái công trình & Kỷ luật Fact Ledger:**
   - Công trình **đang vận hành**: khối/tuyến nét liền (`solid`), màu xanh ngọc/lam sáng. Công trình **quy hoạch tương lai (2030–2050)**: khối/tuyến nét đứt (`dashed`) màu vàng hổ phách kèm số hiệu Quyết định.
   - Mọi số liệu kỹ thuật lưu vào `artifacts/candidate_facts_sources.json` ở trạng thái `"unverified"` để người duyệt kiểm tra văn bản gốc lần cuối trước khi chuyển sang `"verified"`.

---

## 4. Kiến Trúc Thị Giác Johnny Harris / Vox & Trải Nghiệm Đọc Mượt

1. **Bản đồ 3D nghiêng sâu `52°–56°` (Không nghiêng nửa vời `20°–25°`):**
   - Nghiêng nhẹ `20°–25°` nhìn bằng mắt thường không khác gì bản đồ phẳng `0°`. Khi dựng cảnh bản đồ không gian, dùng `Tactical3DStage` ở góc `pitchDeg = 52°–56°` lộ rõ đường chân trời sao phía trên, kết hợp `Pin3DStalk` dựng đứng và công trình nổi 3D.
2. **Đa dạng hóa bố cục giữa các cảnh (Cấm lặp lại cùng 1 nền bản đồ đứng yên):**
   - Xem kẽ nhịp nhàng giữa:
     - *Không ảnh 3D đại cảnh & quỹ đạo vòng cung 3D* (như Cảnh 01, 03).
     - *Cú bổ nhào 3D + Hồ sơ Quyết định giấy kem (`#FFFBEB -> #FEF3C7`) nghiêng góc phóng lớn giữa màn hình, quét bút dạ vàng lên đúng dòng số liệu đinh* (như Cảnh 04 `QĐ 1995`, Cảnh 09 `QĐ 1579`).
     - *Sa bàn 3D Isometric cắt khối địa chất & đô thị hai bờ* (như Cảnh 05).
     - *Trường đua tách đôi màn hình tỷ lệ thực `1:1`* so sánh trực diện luồng cũ vs luồng mới kèm sân bóng đá quy chiếu (như Cảnh 07).
     - *Hero Moment Mặt cắt vật lý động*: phương tiện va chạm/mắc cạn ở ngưỡng cũ phát sóng xung kích đỏ đối đầu siêu phương tiện vận hành an toàn cạnh **tòa nhà 4–5 tầng sáng đèn** quy đổi chiều sâu/chiều cao thực tế (như Cảnh 08).
3. **Chỉ phóng to 1–2 bức ảnh thực địa quan trọng nhất (`Selective Photo Zoom`):**
   - Không phóng to tràn lan mọi ảnh tư liệu (gây ngắt mạch xem bản đồ). Mỗi tập 90s chỉ bật `focusWindow` phóng to **tối đa 1–2 bức ảnh đinh mang tính bước ngoặt/đích đến** (ví dụ: Cầu vượt biển Tân Vũ – Lạch Huyện và Toàn cảnh siêu tàu cập cảng Lạch Huyện); các ảnh phụ giữ neo tĩnh gọn gàng ở góc và đồng bộ `sfx_events.json` tương ứng.
4. **Phụ đề đứng yên 100% — Không thụt ra thụt vào (`Stationary Subtitle`):**
   - Trong `KeywordCaptionBar`, **cấm tuyệt đối** việc đổi `fontWeight`, `padding`, `border`, `letterSpacing` hoặc `transform: translateY/scale` theo từ đang đọc (`isSpoken` / `isCurrent`), vì chỉ lệch `2–4 px` mỗi từ sẽ làm cả câu chữ co giãn qua lại gây mỏi mắt.
   - Cố định cứng kích thước hộp chữ ngay từ frame đầu của câu; khi đọc đến đâu chỉ đổi `color` (`#94A3B8` -> `#FFFFFF` / `#2DD4BF` / `#FACC15` / `#FB7185`) và gạch chân bằng `boxShadow: "inset 0 -2px 0 ..."` (`0.00 px` dịch chuyển bố cục).
5. **Giọng đọc Vibi TTS (`Haitrieu`) + Documentary Pulse + Hệ thống SFX 3-Bus:**
   - Mặc định dùng giọng **`Haitrieu`** (`voice_id: 1ad2682d-1c78-4bb2-8061-b7cc216362c9`, `MiniMax speech-2.8-hd`, `speed: 1.1`, chuẩn hóa `-16 LUFS`) qua [\_tools/vibi\_tts.py](../../../_tools/vibi_tts.py).
   - Giữ nguyên bản phiên âm đọc (`"công ten nơ"`, `"Xin ga po"`, `"âm bảy mét"`) trong `narration_transcript.json` để đạt `word_accuracy = 1.0`, đồng thời ánh xạ sang tiếng Việt chuẩn chính tả trong `captionCues.ts` & `narration_full.srt`.
   - Trộn âm **3-Bus** trong [scripts/synth_documentary_audio_bed.py](./scripts/synth_documentary_audio_bed.py): tách riêng luồng nhạc nền `Documentary Pulse` (đi qua `sidechaincompress` theo lời bình) và luồng `SFX` (không bị sidechain đè theo thoại, chỉ cắt nhẹ dải `3.1 kHz`) để các tiếng `chapter_braams`, `whooshes`, `ship_horns`, `sonar_pings`, `dossier_snaps`, `marker_swipes`, `rail_glides`, `data_bursts`, `warnings`, `clearances` nổi rõ tự nhiên ở `-16 dB` đến `-11 dB` (`max_volume <= -1.5 dB`).

---

## 5. Quy Chuẩn Chống Mờ & Chống Tràn VRAM: Vệ Tinh EOX 2024 `z4–z14` + `<svg viewBox><image>` + `CRF 14`

Bắt buộc tuân thủ đủ 4 quy tắc kỹ thuật sau để bản đồ nghiêng 3D vừa trong vắt ở góc toàn quốc vừa zoom cận cảnh macro `z14` mượt mà tới từng cầu cảng:

1. **Tải tháp ảnh vệ tinh EOX `2024` 6 tầng (`asia_pacific_z4` → `z14`, `~5376×3840 px`) kèm lọc nét `UnsharpMask`:**
   - Dùng [scripts/fetch_eox2024_mosaics.py](./scripts/fetch_eox2024_mosaics.py) lấy từ `s2cloudless-2024_3857` (`CC BY 4.0`), bổ sung tầng nền xa `asia_pacific_z4` làm đáy (`z4..z14`) để các cảnh liên vùng và đường chân trời xa không bao giờ hở viền, kết hợp `UnsharpMask(radius=1.25, percent=145, threshold=2)` + `Contrast(1.18)` + `Color(1.20)` xuất ra `*_ready.webp` (`quality=95`).
2. **Cắt khung bằng `<svg viewBox><image>` + `DECODED_CACHE` + Ẩn biên giới thô khi zoom sát:**
   - Trong `RealSatelliteBasemap`, không render `<img style={{ width: sx1 - sx0 }}>` (khi zoom macro `0.11°`, tầng `z4` sẽ phình thành hộp DOM `> 2.000.000 px` gây tràn VRAM / `Target closed`). Bắt buộc gom các tầng đang hiển thị vào **1 thẻ `<svg viewBox={extViewBox}><image .../></svg>`**, lọc bỏ tầng thô phóng quá `16×` dưới vùng phủ `>= 98%`, và dùng `DECODED_CACHE` giải mã đúng 1 lần mỗi tab.
   - Trong `NationalWorldLayer`, làm mờ dần nét biên giới Natural Earth `1:10m` qua `borderOpacity = smoothstep(75, 220, box[2])` để không lộ đường gấp khúc thô khi zoom sát cấp phường/cảng.
3. **Full-Bleed `GROUND_BLEED` (`SUPER = 1.5`) & CẤM đặt `maskImage`/`filter` lên thẻ CSS 3D:**
   - Đặt `WebkitMaskImage` hoặc `filter` trực tiếp lên `<div>` có `perspective() rotateX() scale()` làm Chromium chụp phẳng xuống bitmap rồi phóng đại gây nhòe toàn bộ bản đồ.
   - Dùng `GROUND_BLEED = { x: 880, top: 1250, bottom: 300 }` ở `SUPER = 1.5`, che mép chân trời cao bằng vòm trời 2D độc lập phía trên (`height: 186px`), và giữ `dim <= 0.03`.
4. **Nén H.264 chất lượng gốc (`crf: 14`), Soi PNG Still Theo Lô & Chrome DevTools MCP:**
   - Đặt `"concurrency": 4` và `"crf": 14` trong `edit_decisions.json["bespoke"]`.
   - Luôn chụp `renderStill` cả khung rộng lẫn khung zoom cận cảnh (`CHUNK = 8` mỗi browser session) và mở kiểm tra 100% bằng `read_file` trước khi chạy `VideoCompose` và sau khi xuất `final.mp4`.
   - Với các tập dài nhiều cảnh hoặc khi mở văn bản gốc trên cổng Chính phủ nặng JavaScript (`vanban.chinhphu.vn`, `vbpl.vn`) / kiểm tra va chạm khung chữ trên `Remotion Studio`, kết hợp plugin `chrome-devtools` (`take_snapshot`, `get_css_styles`, `evaluate_script` đo `getBoundingClientRect()`).
