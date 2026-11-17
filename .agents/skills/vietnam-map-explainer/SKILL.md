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

# Vietnam Map Explainer — Chuẩn Sản Xuất Bản Đồ 3D Tham Chiếu + Foley 4 Tầng (v6)

Skill này đóng gói toàn bộ tiêu chuẩn kịch bản, đóng gói tiêu đề/thumbnail, **3 Khuôn Dựng Video Bản Đồ Tham Chiếu** ([reference_mold_and_sfx_cookbook.md](./references/reference_mold_and_sfx_cookbook.md)), kiến trúc bản đồ 3D nghiêng sâu `52°–56°` kiểu Johnny Harris / Vox, Supersampling `4K` chống mờ, vệ tinh EOX `2024` mức `z14`, phụ đề đứng yên `0px jitter`, giọng đọc Vibi TTS (`Haitrieu`) và **hệ thống âm thanh 4 tầng chuẩn hóa phổ tần `synth_documentary_audio_bed.py`** đã kiểm chứng thực tế trên kênh pilot (`Lạch Huyện` & `Long Thành 40 km`).

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
- **Bảng màu & Hệ thống Theme Vox + Flexoki Archival Atlas (`SAFE_X = 64`, `SAFE_Y = 64`):** [theme.ts](../../../projects/demo-giai-ma-ban-do-90s/theme.ts) & [EditorialThemeKit.tsx](../../../projects/san-bay-long-thanh-40km/scenes/EditorialThemeKit.tsx).
  - *Cảnh Bản đồ 3D vệ tinh:* Nền than chì ấm Obsidian (`#100F0F` / `#1C1B1A`), 4 mực bản đồ điều tiết (Vàng đất `#E5AF28`, Đỏ son `#D94E41`, Ngọc bích `#3AA99F`, Xanh thép `#5695C9`), thẻ kính xám khói viền mảnh `1px` `rgba(242,240,229,0.14)` (tuyệt đối bỏ viền neon dày).
  - *Cảnh Biểu đồ, So sánh & Mặt cắt (`EditorialPaperStage`):* Nền Giấy kem cổ điển 5 lớp (`#F7F3E8 -> #E6DFCE` + hạt giấy + lưới trắc địa), bảng biểu `#FFFCF0` rule trên `3px solid #100F0F`, cột nền đá ấm `#D4CFC0` và **chỉ đúng 1 màu nhấn chủ đạo (`#1E7870` Ngọc hoặc `#C93B2B` Đỏ son)** trên đối tượng đinh.
- **Nền vệ tinh EOX `2024` đa tầng (`z6–z14`) + Chủ quyền Hoàng Sa – Trường Sa:** [HydroBaseLayers.tsx](../../../projects/demo-giai-ma-ban-do-90s/scenes/HydroBaseLayers.tsx).
- **Thẻ ảnh Polaroid thực địa (`#FFFCF0`, chỉ phóng to 1–2 ảnh đinh):** [EvidencePhotoCard.tsx](../../../projects/san-bay-long-thanh-40km/scenes/EvidencePhotoCard.tsx).
- **Biểu đồ & Cắt dán Báo chí Trực Tiếp Trên Bản Đồ:** [OpenMotionPrimitives.tsx](../../../projects/san-bay-long-thanh-40km/scenes/OpenMotionPrimitives.tsx) (`OnMap3DGaugePillar` vẽ biểu đồ cột 3D mọc thẳng từ tọa độ địa lý kèm thanh khóa trần `ceilingZ`/`capLabel`; `OnMapPressClippingCard` dán cắt báo thật nghiêng nhẹ có bút dạ vàng highlight và dây leader cắm thẳng vào tọa độ công trình) kết hợp [scripts/capture_press_clipping.py](./scripts/capture_press_clipping.py).
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
   - **Tư liệu Báo chí & Ảnh Hiện trường Từ Bài Báo (`OnMapPressClippingCard`):** Khi trích dẫn dẫn chứng thực tế hoặc công trình đang thi công, ưu tiên chụp trực tiếp bài báo chính thống (`VnExpress`, `Báo Chính phủ`, `Tuổi Trẻ`...), cắt sạch banner quảng cáo và giữ nguyên vẹn **măng-sét/chuyên mục + ngày giờ + tiêu đề H1 + ảnh hiện trường**; gắn thẻ nghiêng nhẹ kèm **bút dạ highlight** và **dây leader cắm thẳng vào tọa độ công trình trên bản đồ 3D**. Phải ghi rõ URL, tên cơ quan báo chí, ngày đăng vào `asset_manifest.json` & `description.txt` (phạm vi trích dẫn bình luận/minh họa báo chí, tránh trang có tường phí/CAPTCHA).
   - Với mọi ảnh tải từ Wikimedia Commons hoặc cắt từ bài báo, bắt buộc mở kiểm tra 100% bằng `read_file` để loại bỏ quảng cáo hoặc ảnh bị che/mờ.
3. **Phân tách trạng thái công trình & Kỷ luật Fact Ledger:**
   - Công trình **đang vận hành**: khối/tuyến nét liền (`solid`), màu xanh ngọc/lam sáng. Công trình **quy hoạch tương lai (2030–2050)**: khối/tuyến nét đứt (`dashed`) màu vàng hổ phách kèm số hiệu Quyết định.
   - Mọi số liệu kỹ thuật lưu vào `artifacts/candidate_facts_sources.json` ở trạng thái `"unverified"` để người duyệt kiểm tra văn bản gốc lần cuối trước khi chuyển sang `"verified"`.

---

## 4. Kiến Trúc Thị Giác Johnny Harris / Vox & Trải Nghiệm Đọc Mượt

1. **Biên đạo Hiệu ứng Camera trên Bản đồ 3D (`Map Camera Choreography` & `Camera vs Subject`):**
   - **Bản đồ 3D nghiêng sâu `52°–56°` (Không nghiêng nửa vời `20°–25°`):** Dùng `Tactical3DStage` ở góc `pitchDeg = 52°–56°` lộ rõ đường chân trời sao phía trên, kết hợp `Pin3DStalk` dựng đứng và công trình nổi 3D.
   - **Quy tắc `Camera vs Subject` (`Hold-Then-Move`):** Khi tàu bay/tàu thủy đang chạy, thước đo `GeoCaliperRule` đang đóng hoặc cột biểu đồ 3D `OnMap3DGaugePillar` đang mọc lên thì **khóa tĩnh khung camera** để mắt tập trung 100%; chỉ khi đối tượng trên bản đồ diễn xong mới kéo lùi hoặc chuyển vùng camera (tuyệt đối không vừa zoom nhanh vừa nhồi thêm nhiều thẻ chữ/biểu đồ).
   - **4 Cú máy Chuẩn Kênh trên `Tactical3DStage`:**
     - *Orbital Wide-to-Macro Zoom (Câu đầu zoom từ bản đồ xa nhất từ từ vào gần):* Mở màn một cú máy liền mạch (`one-take`) xuất phát từ tầng vệ tinh rộng nhất (`asia_pacific_z4` qua `NationalWorldLayer` trọn Việt Nam & Biển Đông kèm Hoàng Sa – Trường Sa, `pitchDeg: 32° → 52°`), dùng `interpolateCameraBox` log-scale đi từ từ xuyên qua `z4 → z6 → z7 → z9 → z12 → z14` trong `~7,5–8,5s` rồi khóa tĩnh camera (`Hold-Then-Move`) ở cận cảnh `z14` đúng nhịp con số trọng tâm.
     - *Macro Hold → Pull-Back:* Giữ cận `z14` giải phẫu chi tiết công trình rồi dùng `interpolateCameraBox(..., EASE.inOutQuint)` kéo lùi êm ra `z12` để lộ bối cảnh đô thị/vành đai vây quanh.
     - *Corridor Pan + Subtle Yaw Orbit:* Trượt camera nối 2 vùng địa lý hoặc xoay góc `yawDeg` nhẹ `-5° → +4°` tạo cảm giác chiều sâu không gian 3D mà không gây chóng mặt.
     - *Spotlight Dimming trên mặt đất:* Làm tối dịu lớp nền phụ (`dim: 0.04 → 0.28` bằng div/lớp phủ nền `RealSatelliteBasemap`, **cấm** đặt `filter`/`maskImage` lên thẻ CSS 3D) để ép mắt tập trung vào nút giao hoặc dải đường băng đang phân tích.
2. **Vẽ Biểu Đồ Trực Tiếp Trên Bản Đồ (`Direct On-Map Charting >= 85–100%`):**
   - **Ưu tiên tuyệt đối việc vẽ và neo biểu đồ thẳng lên bản đồ vệ tinh 3D thay vì ngắt sang các trang biểu đồ phẳng tách rời:**
     - *Biểu đồ cột công suất / chi phí 3D (`OnMap3DGaugePillar`):* Cho cột số liệu mọc thẳng đứng từ đúng tọa độ `[lon, lat]` trên bản đồ (`projectGeoPoint(..., 0)` → `heightZ`), có thể đặt thêm thanh chắn khóa trần (`ceilingZ` + `capLabel`, ví dụ cột `50 triệu` mọc từ Nhà ga T3 vs thanh khóa trần `~38–40 triệu` chặn trên cặp đường băng `25R/25L`) để mắt người xem thấy ngay mâu thuẫn nằm ở đâu ngoài thực địa.
     - *Đối chiếu quy mô 1:1 & Thước đo trực tiếp:* Bê nguyên đa giác công trình đặt lồng trực tiếp vào vùng so sánh ở đúng tỷ lệ `1:1` trên vệ tinh (`791 ha` lọt thỏm trong `5.000 ha`) kết hợp `GeoCaliperRule`.
     - *Giới hạn `EditorialPaperStage` (`<= 10–15%` thời lượng):* Chỉ dùng trang giấy phẳng tách rời khi cần trình bày bảng đối chiếu đa chiều dài kỳ bất khả thi để neo lên tọa độ địa lý; luôn giữ phần lớn mặt bản đồ vệ tinh `>= 65–75%` khung hình thông thoáng.
3. **Quy Trình Search & Chụp Cắt Dán Bài Báo Thật (`Search & Press Clipping Workflow`):**
   - **Tìm & Xác minh nguồn mở:** Dùng `search_web` tìm bài báo chính thống Việt Nam khớp từng mốc số liệu/quyết định (`VnExpress`, `Báo Chính phủ`, `Tuổi Trẻ`, `Báo Đầu tư`...), giải mã URL đích thực tế bằng `curl.exe -sIL`, chỉ lấy các trang công khai tải trực tiếp (tuyệt đối không vượt CAPTCHA hoặc tường phí).
   - **Chụp & Cắt sạch quảng cáo bằng [scripts/capture_press_clipping.py](./scripts/capture_press_clipping.py):**
     1. Chạy lệnh `capture` chụp raw screenshot trang báo gốc rồi mở kiểm tra 100% qua `read_file`.
     2. Chạy lệnh `crop` bỏ sạch banner quảng cáo trên đỉnh và cột tin bên phải, giữ nguyên khối chân thực gồm `Chuyên mục + Ngày giờ đăng + Tiêu đề H1 + Sapo` (và ảnh/sơ đồ hiện trường trong cùng bài báo), lưu PNG vào `projects/<project-id>/public/press/clip_*.png` và soi lại bằng `read_file`.
   - **Gắn lên bản đồ qua `OnMapPressClippingCard`:** Đặt thẻ nghiêng nhẹ (`-1.3°..+1.3°`) ở góc thoáng, quét vệt bút dạ vàng đúng dòng số liệu trọng tâm, kéo dây leader gãy góc cắm thẳng vào tọa độ công trình trên bản đồ và tự thu hồi mượt khi chuyển ý; ghi đủ URL gốc, tên báo, ngày đăng vào `asset_manifest.json` và `exports/metadata/description.txt`.
   - *Ảnh tư liệu thực địa thuần (`EvidencePhotoCard`):* Với ảnh chụp không kèm trang báo, giữ khung in Polaroid `#FFFCF0` gọn và chỉ bật `focusWindow` phóng to tối đa `1–2` ảnh đinh quan trọng nhất (nhớ đồng bộ `sfx_events.json`, giữ ảnh phụ neo gọn góc).
4. **Phụ đề đứng yên 100% — Đơn sắc, Không gạch chân, Không thụt ra thụt vào (`Stationary Subtitle`):**
   - Trong `KeywordCaptionBar`, **cấm tuyệt đối** việc đổi `fontWeight`, `padding`, `border`, `letterSpacing` hoặc `transform: translateY/scale` theo từ đang đọc (`isSpoken` / `isCurrent`), vì chỉ lệch `2–4 px` mỗi từ sẽ làm cả câu chữ co giãn qua lại gây mỏi mắt; đồng thời **không tô nhiều màu từ khóa và không gạch chân (`boxShadow: "none"`)** để chữ phụ đề luôn sạch, đồng nhất kiểu báo chí.
   - Cố định cứng kích thước hộp chữ ngay từ frame đầu của câu; từ chưa đọc giữ màu xám đá mờ `rgba(206, 205, 195, 0.52)` và khi đọc đến đâu chỉ chuyển êm sang một màu trắng ngà `#FFFCF0` duy nhất (`boxShadow: "none"`, `0.00 px` dịch chuyển bố cục).
5. **Giọng đọc Vibi TTS (`Haitrieu`) + Documentary Pulse `96 BPM` + Hệ thống Foley 4 Tầng:**
   - Mặc định dùng giọng **`Haitrieu`** (`voice_id: 1ad2682d-1c78-4bb2-8061-b7cc216362c9`, `MiniMax speech-2.8-hd`, `speed: 1.1`, chuẩn hóa `-16 LUFS`) qua [\_tools/vibi\_tts.py](../../../_tools/vibi_tts.py).
   - Giữ nguyên bản phiên âm đọc (`"công ten nơ"`, `"Xin ga po"`, `"âm bảy mét"`) trong `narration_transcript.json` để đạt `word_accuracy = 1.0`, đồng thời ánh xạ sang tiếng Việt chuẩn chính tả trong `captionCues.ts` & `narration_full.srt`.
   - Trộn âm **3-Bus / 4 tầng** bằng [scripts/synth_documentary_audio_bed.py](./scripts/synth_documentary_audio_bed.py) (chi tiết ở **Mục 8** bên dưới): luôn chuẩn hóa đỉnh mọi SFX **sau khi lọc dải hẹp**, có xung `96 BPM` nghe rõ trên loa di động, truyền kèm `--scene-plan` để phủ kín nhịp chuyển cảnh và buộc vượt qua cổng **[ACOUSTIC QA]** trước khi vào render video.
6. **Thủ pháp Đồ họa Bản đồ Tham chiếu Đã Chuẩn hóa (`Tactical Cartographic Grammar`):**
   - Áp dụng đồng bộ 6 thủ pháp đồ họa bản đồ nguyên bản (tuyệt đối không sao chép footage, âm thanh hay watermark bên ngoài):
     - **Viền phát sáng 2 lớp (`Luminous Perimeter Rim`):** Kết hợp lớp quầng ngoài mờ nhẹ (`outer glow`, `#F59E0B`/`#38BDF8`/`#2DD4BF`) + nét lõi sắc và nhãn **thông số ngay trên mặt thực địa** (`~791 HA`, `5.000 HA • 4F`) giúp nổi bật đường bờ, đảo và ranh giới quy hoạch trên nền biển tối.
     - **Thước đo địa lý trực tiếp (`GeoCaliperRule`):** Kẻ đoạn nối kèm hai vạch chặn vuông góc ở hai đầu và viên thuốc thông số giữa đoạn (`|◄—— 365 M ——►|`, `|◄—— ~40 KM ——►|`) ngay trên bản đồ thực.
     - **Bản đồ nhỏ định vị hình chữ S (`VietnamMiniLocator`):** Góc bản đồ phụ nhỏ trên các cảnh zoom cận `z12–z14` hiển thị trọn vẹn chữ S Việt Nam cùng Hoàng Sa – Trường Sa và ô nháy định vị vùng công trình (giữ `0%` đè thẻ/chữ).
     - **Phương tiện tỷ lệ thực (`MovingAircraft` / `MovingVessel`):** Mô hình tàu bay, tàu container hoặc đoàn tàu điện chạy dọc đúng đường ray/đường băng/luồng tàu để chứng minh quy mô không gian.
     - **Quạt radar & Huy hiệu tròn (`RadarRangeFan`, `HubMedallion`):** Vòng quét đồng tâm có cung định hướng và huy hiệu điểm nút (`✈`, `⚓`, `✕`, `✓`).
     - **Ghim địa danh gọn (`CompactGeoPin`):** Chấm neo viền trắng + nhánh chỉ ngắn giữ `>= 80%` diện tích vệ tinh thông thoáng.

---

## 5. Quy Chuẩn Chống Mờ & Chống Tràn VRAM: Vệ Tinh EOX 2024 `z4–z14` + `<svg viewBox><image>` + `CRF 14`

Bắt buộc tuân thủ đủ 4 quy tắc kỹ thuật sau để bản đồ nghiêng 3D vừa trong vắt ở góc toàn quốc vừa zoom cận cảnh macro `z14` mượt mà tới từng cầu cảng:

1. **Tải tháp ảnh vệ tinh EOX `2024` 6 tầng (`asia_pacific_z4` → `z14`, `~5376×3840 px`) kèm lọc nét `UnsharpMask`:**
   - Dùng [scripts/fetch_eox2024_mosaics.py](./scripts/fetch_eox2024_mosaics.py) lấy từ `s2cloudless-2024_3857` (`CC BY 4.0`), bổ sung tầng nền xa `asia_pacific_z4` làm đáy (`z4..z14`) để các cảnh liên vùng và đường chân trời xa không bao giờ hở viền, kết hợp `UnsharpMask(radius=1.25, percent=145, threshold=2)` + `Contrast(1.18)` + `Color(1.20)` xuất ra `*_ready.webp` (`quality=95`).
2. **Cắt khung bằng `<svg viewBox><image>` + `DECODED_CACHE` + Ẩn biên giới thô khi zoom sát:**
   - Trong `RealSatelliteBasemap`, không render `<img style={{ width: sx1 - sx0 }}>` (khi zoom macro `0.11°`, tầng `z4` sẽ phình thành hộp DOM `> 2.000.000 px` gây tràn VRAM / `Target closed`). Bắt buộc gom các tầng đang hiển thị vào **1 thẻ `<svg viewBox={extViewBox}><image .../></svg>`**, lọc bỏ tầng thô phóng quá `16×` dưới vùng phủ `>= 98%`, và dùng `DECODED_CACHE` giải mã đúng 1 lần mỗi tab.
   - Trong `NationalWorldLayer`, làm mờ dần nét biên giới Natural Earth `1:10m` qua `borderOpacity = smoothstep(320, 920, box[2])` (theo hệ tọa độ `WORLD = 65536`, `~182.04 px/độ`) để tắt hoàn toàn vector thô trước khi zoom vào vùng hành lang `z12–z14`.
3. **Full-Bleed `GROUND_BLEED` (`SUPER = 1.5`) & CẤM đặt `maskImage`/`filter` lên thẻ CSS 3D:**
   - Đặt `WebkitMaskImage` hoặc `filter` trực tiếp lên `<div>` có `perspective() rotateX() scale()` làm Chromium chụp phẳng xuống bitmap rồi phóng đại gây nhòe toàn bộ bản đồ.
   - Dùng `GROUND_BLEED = { x: 880, top: 1250, bottom: 300 }` ở `SUPER = 1.5`, che mép chân trời cao bằng vòm trời 2D độc lập phía trên (`height: 186px`), và giữ `dim <= 0.03`.
4. **Nén H.264 chất lượng gốc (`crf: 14`), Soi PNG Still Theo Lô & Chrome DevTools MCP:**
   - Đặt `"concurrency": 4` và `"crf": 14` trong `edit_decisions.json["bespoke"]`.
   - Luôn chụp `renderStill` cả khung rộng lẫn khung zoom cận cảnh (`CHUNK = 8` mỗi browser session) và mở kiểm tra 100% bằng `read_file` trước khi chạy `VideoCompose` và sau khi xuất `final.mp4`.
   - Với các tập dài nhiều cảnh hoặc khi mở văn bản gốc trên cổng Chính phủ nặng JavaScript (`vanban.chinhphu.vn`, `vbpl.vn`) / kiểm tra va chạm khung chữ trên `Remotion Studio`, kết hợp plugin `chrome-devtools` (`take_snapshot`, `get_css_styles`, `evaluate_script` đo `getBoundingClientRect()`).

---

## 6. Quy Chuẩn Kiểm Chứng Tọa Độ & Chống Cắt Đất Liền Khi Kẻ Tuyến (`Cartographic Polyline & Land-Collision QA`)

Cấm tuyệt đối việc tự ước lượng `3–4` điểm nối thẳng cho tuyến hàng hải, đường sông, kênh đào, cầu, đường sắt, đê hay bến cảng. Mọi tập bản đồ bắt buộc phải vượt qua cổng kiểm chứng hình học sau trước khi render:

1. **Lấy Tọa Độ Gốc Từ OpenStreetMap & Soi Pixel Vệ Tinh `z14`:**
   - Truy vấn tọa độ hình học thực tế qua `https://api.openstreetmap.org/api/0.6/map.json?bbox=...` hoặc Nominatim (`polygon_geojson=1`) cho mọi con sông, kênh đào, tuyến cao tốc/đường sắt, đê chắn cát và ranh giới bến cảng.
   - Luôn đối chiếu đường bờ trên **ảnh vệ tinh `2024 z14` mới nhất** để tách riêng đoạn cầu cạn/đường dẫn trên đất lấn biển sau xây dựng (như KCN Nam Đình Vũ `2018–2024`) với nhịp `Bridge3DExtrusion` thực sự bắc qua mặt nước mở.
   - Luôn xuất ảnh kiểm tra `debug_z14_local_polylines.png` phủ thẳng nét kẻ lên mảnh ghép `*_z14_ready.webp` và soi `100%` qua `read_file` để bảo đảm rãnh kênh, mặt cầu và cầu cảng nằm khít từng mét lên địa hình thật.
2. **Cổng Toán Học Chống Cắt Đất Liền ([scripts/verify_polylines.py](./scripts/verify_polylines.py)):**
   - Chạy bắt buộc `python .agents/skills/vietnam-map-explainer/scripts/verify_polylines.py projects/<project-id> --debug-dir ...` và yêu cầu thoát mã `0` (`0` vi phạm):
     - **Tuyến hàng hải `0` va chạm đất liền:** Khi nội suy `N = 400` điểm dọc tuyến, **0 điểm** được cắt ngang đất liền hay bán đảo (bán đảo Lôi Châu, đảo Hải Nam, eo biển Đài Loan / Kênh Bashi – eo Luzon, mũi Đôi miền Trung `109.47°E`, bán đảo Malaysia – eo biển Malacca, đảo Sumatra, Okinawa/Kyushu).
     - **Khoảng cách chủ quyền đảo:** Mọi tuyến tàu biển phải giữ khoảng cách an toàn `>= 0.30°` khỏi các chấm đảo thuộc `HOANG_SA_ISLANDS` và `TRUONG_SA_ISLANDS`.
     - **Luồng thủy/đường sắt cục bộ:** Kênh đào và luồng tàu không được cắt ngang đa giác đảo OSM; nhánh đường sắt ven biển phải dừng sạch trên ranh giới bến/đất liền, tuyệt đối không lao thẳng ra biển hở.
3. **Kỷ Luật Độ Cao Vòng Cung 3D & Ghim Cửa Ngõ Đại Dương:**
   - Với `Arc3DRoute` uốn lượn qua nhiều eo biển (Malacca, Luzon, quanh Hải Nam), giới hạn `maxAltitudeZ <= 72` để phép nâng trục `Z` 3D không bẻ cong nét bay trên màn hình tràn sang đất liền phía Bắc.
   - Không đặt ghim chỉ hướng đại lục (như *Đi Mỹ*, *Đi châu Âu*) đè lên lãnh thổ một quốc gia/đảo khác trên bản đồ (ví dụ đặt ghim đi Mỹ lên đảo Nhật Bản); phải đặt ghim cửa ngõ ngay trên vùng biển mở kèm nhãn hướng tuyến rõ ràng.
4. **Soi 100% PNG Still Các Góc Rộng, Zoom Đỉnh & Mốc Thời Gian Trọng Điểm:**
   - Chụp đủ ảnh `renderStill` mọi cảnh bản đồ trước khi chạy `VideoCompose` và đọc kiểm tra `100%` bằng `read_file` để xác nhận cả đường nét chính xác lẫn `0%` đè chữ/thẻ nổi.

---

## 7. Khuôn Vàng Dựng Video Giải Mã Bản Đồ (`The Reference Map-Explainer Mold`)

Chi tiết kịch bản khung và ví dụ từng loại xem tại [references/reference_mold_and_sfx_cookbook.md](./references/reference_mold_and_sfx_cookbook.md). Mọi tập mới phải chọn và khóa **1 trong 3 Khuôn cấu trúc** ngay từ bước `proposal` / `script`:

1. **Khuôn A — So sánh Cửa ngõ / Nút cổ chai Địa lý** (*Hải trình Biển Đông*, *Lạch Huyện*, *Tân Sơn Nhất 365 m*): Hook câu hỏi phân nhánh → Mổ xẻ từng cửa ngõ (thông số hình học + mặt cắt tròn) → Đặt đối chiếu trực diện 1:1 → Chốt mở mồi tập sau.
2. **Khuôn B — Biên niên sử Mở rộng Không gian / Hạ tầng** (*700 năm Hình chữ S*, lộ trình quy hoạch `2015–2050`): Bổ nhào toàn quốc → Vòng lặp *Mốc năm đóng dấu → Camera trượt → Loang vùng sáng → Huy hiệu nổ pop* → Tổng kết kỷ lục (đếm số + thước kẹp) → Câu hỏi địa phương hóa.
3. **Khuôn C — Điểm Nút Chiến lược Đa Tầng** (*Vịnh Cam Ranh*, *Long Thành – Cái Mép*): Hook nghịch lý tọa độ → Zoom sát đo vật lý + thả thực thể tỷ lệ thực → Kéo rộng bật Quạt Radar & tuyến huyết mạch → Lật trang thời kỳ trên cùng 1 ghim 3D → Chốt chùm tia đa hướng.

**Chu trình Nhịp Vi Mô `3–5s` & Kỷ luật Sân khấu Sạch (`Clean-Slate Anti-Clutter`):**
- Vận hành liên tục 4 nhịp cho mỗi ý: **`1. Camera Re-frame (whoosh -18ms)` → `2. Cartographic Trace (line_draw / zone_fill / caliper_snap)` → `3. Proof & Stamp (pin_pop / era_stamp / data_burst / MovingAircraft)` → `4. Clean-Slate Wipe`** (làm mờ/thu hồi ghim phụ cũ trước khi bật ghim mới).
- Giữ đồng thời **tối đa `<= 3` nhãn/ghim phụ** trên bản đồ, đặt `1` thanh HUD ngữ cảnh ở đỉnh khung hình tự đổi số liệu/mốc năm theo nhịp, bổ sung **mặt cắt tròn cỡ nhỏ (`Circular Cross-Section Badge`)** và **phương tiện tỷ lệ thực** thay cho thẻ chữ dài.

---

## 8. Kiến Trúc Âm Thanh & Foley Bản Đồ Tiết Chế (`Selective Cartographic Sound Design`)

Dùng [scripts/synth_documentary_audio_bed.py](./scripts/synth_documentary_audio_bed.py) làm bộ tổng hợp + trộn âm **3-Bus / 4 tầng** mặc định, ưu tiên tuyệt đối độ rõ lời bình tiếng Việt và giữ hiệu ứng ở mức tinh tế trên cả tai nghe lẫn loa điện thoại:

- **Tầng 1 — Lời bình chủ đạo (`Narration`):** Vibi TTS `Haitrieu`, chuẩn hóa `-16 LUFS`, đẩy rõ vùng hiện diện tiếng nói.
- **Tầng 2 — Nhịp nền căng thẳng (`Documentary Pulse 96 BPM`):** Kết hợp nền trầm `55 Hz`, xung hài âm `110/165/220 Hz` (`-19.5 dBFS`) và nhịp đồng hồ `2.4–5.8 kHz` rất mảnh (`0.045`); đi qua `sidechaincompress` theo thoại (`threshold=0.022`, cắt `2.6 kHz -3.5 dB`) để tự nhích lên êm trong khoảng nghỉ câu `0.3s`.
- **Tầng 3 & Tầng 4 — Không gian & Foley Trọng Điểm (`SFX có chọn lọc`):** Mọi hiệu ứng được **chuẩn hóa đỉnh (`_peak_db`) SAU khi lọc dải hẹp** vào dải `-18.5 .. -13.5 dBFS` (thấp hơn lời thoại tối thiểu `>= 6 dB`) và qua nén phụ nhẹ (`2.2:1`, cắt `2.8 kHz -3.0 dB`) để không bao giờ giật cục hay át giọng đọc:

| Hành động thị giác đinh trên bản đồ | Khóa `sfx_events.json` | Đỉnh chuẩn hóa (`dBFS`) | Độ lệch thời gian (`offset`) |
|---|---|---|---|
| Mở đầu chương lớn (`Hero / Chapter`) | `chapter_braams` | `-13.5 dB` | `0 ms` |
| Camera lao sâu / Vào-thoát `focusWindow` ảnh đinh | `whooshes` (`up: true/false`, `dur`) | `-16.5 dB` | **`-18 ms`** (đi sớm) |
| Bật ghim / Biểu đồ so sánh chính | `pin_pops` (`t`, `count=1`) | `-17.0 dB` | `0 ms` |
| Vẽ ranh giới công trình / Tuyến huyết mạch chính | `line_draws` (`t`, `dur`) | `-18.5 dB` | `0 ms` |
| Kéo thước đo `GeoCaliperRule` (`365 m`, `40 km`, `2.000 m`) | `caliper_snaps` (`t`, `dur`) | `-16.5 dB` | `0 ms` (`scene_ticks` `-15 ms`) |
| Đóng dấu bác bỏ / Rơi đa giác Hero (`dropSpring`, dấu `✕`) | `era_stamps` | `-14.0 dB` | `0 ms` |
| Loang vùng chuẩn đối chiếu (`zone_fill`) | `zone_fills` (`t`, `dur`) | `-18.5 dB` | `0 ms` |
| Đường sắt `120 km/h` / Hồ sơ giấy & bút dạ / Radar / Khóa mục tiêu | `rail_glides` / `dossier_snaps` / `marker_swipes` / `sonar_pings` / `locks` / `clearances` | `-17.5 .. -15.5 dB` | `0 ms` |

**Kỷ luật Tiết Chế ("Chỉ dùng các chỗ thực sự cần thiết") & Cổng Kiểm định Phổ tần `[ACOUSTIC QA]`:**
- **Tập dài `10–14 phút` (`16:9`):** Mục tiêu **`3–5 cues/phút` (`1–3` cue/cảnh)** — **chỉ đặt SFX tại các điểm nhấn thị giác thực sự đắt giá** (chuyển chương, zoom cận đường băng/ảnh đinh, thước kẹp `GeoCaliperRule`, hồ sơ Quyết định + bút dạ, cú rơi đa giác Hero, mở màn/chốt hạ). **Tuyệt đối không rải tick chuyển mọi cảnh, tiếng máy bay/cảnh báo/pop liên thanh chen vào các đoạn phân tích bình tĩnh.**
- **Shorts `45–58 giây` (`9:16`):** **`10–16 cues/phút`** bám sát các cú chuyển khung hình nhanh.
- Tạo `sfx_events.json` từ cùng hằng số `SCENE_BEATS` với `SceneXX.tsx` ([cookbook](./references/reference_mold_and_sfx_cookbook.md)). Mặc định `--scene-plan` **không tự chèn thêm cue** vào các cảnh bạn chủ động để tĩnh (chỉ chèn fallback khi chưa có bất kỳ cue nào hoặc bật `--auto-scaffold`).
- Ngưỡng pass `[ACOUSTIC QA]` đo trên **cửa sổ các cue đang phát (`active samples`)**: `cue_count > 0`, `sfx_peak >= -24.0 dB`, năng lượng phổ hiện diện **`active pres2.5k-7k >= -52.0 dB`**, đỉnh tổng hợp **`master max_volume <= -1.2 dB`** (mục tiêu phát hành YouTube `-14.5 .. -14.0 LUFS`).

---

## 9. Tự Chấm Điểm Chất Lượng (`Self-Evaluation Rubric`) & Lỗi Cần Tránh

Trước khi chốt stage `compose`, tự chấm mọi tập theo thang **`1–5`** (bất kỳ mục nào `< 4` đều phải sửa trước khi đóng gói `exports/`):

| Tiêu chí | Đạt chuẩn `5/5` | Cảnh báo cần sửa (`<= 3/5`) |
|---|---|---|
| **Bám Khuôn & Nhịp Vi Mô (`3–5s`)** | Chọn rõ Khuôn A/B/C; mỗi `3–5s` có 1 hành động bản đồ + thu gọn nhãn cũ (`<= 3` ghim đang bật) | Nhìn 1 tấm bản đồ tĩnh đứng chữ quá `6–8s`, nhồi `5–6` thẻ chữ cùng lúc |
| **Foley Tiết Chế & Ưu Tiên Giọng Đọc** | Tập dài `3–5 cues/phút` (`1–3` cue trọng điểm/cảnh), giữ sạch đoạn phân tích; `[ACOUSTIC QA]` pass `active pres2.5k-7k >= -52 dB` | Rải `15–20+ cues/phút` liên hồi gây rối tai, hoặc filter dải hẹp không chuẩn hóa làm câm tiếng |
| **Hình Học Chính Xác & Chủ Quyền** | `verify_polylines.py` đạt `0 violations`; cầu neo hai bờ; Hoàng Sa & Trường Sa thông thoáng | Kẻ tay thiếu điểm khiến đường cắt đất liền, che nhãn hai quần đảo |
| **Sạch Khung Hình & Tỷ Lệ Vệ Tinh** | `0%` chữ nguồn/watermark; `borderOpacity = smoothstep(320, 920, box[2])`; ảnh thật sạch 100% | Lộ nét vector thô ở zoom `z12–z14`, đè phụ đề hoặc kẹp chữ |
| **Minh Bạch Nguồn & Chính Sách Kênh** | Đầy đủ attribution EOX/OSM/Wikimedia & công bố AI `Haitrieu` trong `description.txt` | Quên đánh dấu `unverified` trong `candidate_facts_sources.json` |

### Các Lỗi Kinh Điển Cần Tránh (`Common Pitfalls`)
- **Bẫy lạm dụng SFX cho video dài ("Shorts hóa âm thanh"):** Đặt `3–4s` một tiếng động liên tục suốt 11–14 phút làm người xem mệt tai và rẻ tiền hóa chất phim tài liệu — chỉ đánh dấu ở mở chương, thước đo chính, hồ sơ quyết định, polygon drop và zoom ảnh đinh.
- **Bẫy lọc dải hẹp làm tắt SFX:** Bất kỳ nhiễu trắng nào đi qua Butterworth `85–440 Hz` hay `1.0–2.4 kHz` đều tụt `18–25 dB` — luôn gọi `_peak_db()` **sau khi lọc**.
- **Bẫy nền sub-bass câm trên loa di động:** Chỉ để sóng sin `55 Hz` sẽ hoàn toàn biến mất trên điện thoại/laptop — giữ tầng hài âm `110–350 Hz` (`-19.5 dB`) đi kèm sidechain dưới lời bình.
- **Viết rời hai bảng thời gian:** Dùng chung `SCENE_BEATS` giữa `SceneXX.tsx` và `sfx_events.json` để các cú nhấn đắt giá khớp đúng từng khung hình.
