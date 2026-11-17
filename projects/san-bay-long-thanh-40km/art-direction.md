# Art Direction — Tập Dài Số 2: Sân Bay Long Thành 40 km (`san-bay-long-thanh-40km`)

## Design Read
Phim tài liệu bản đồ chiến thuật & báo chí trực quan phong cách **Vox / Johnny Harris + Flexoki Editorial Archival Atlas** (`1920×1080`, `Be Vietnam Pro` + `IBM Plex Mono`): kết hợp luân phiên **16 cảnh bản đồ vệ tinh 3D Obsidian Ink** (đường chân trời hoàng hôn ấm `#0B0A09 -> #161513`, ảnh vệ tinh EOX Sentinel-2 `2024 z4–z14` grade ấm, nón tĩnh không 3D, thước đo `GeoCaliperRule`, đối chiếu tỷ lệ `1:1` `365 m` Tân Sơn Nhất vs `5.000 ha` Long Thành và `Bridge3DExtrusion` ăn chắc hai bờ sông Đồng Nai) với **4 cảnh Giấy Lưu Trữ 5 lớp (`EditorialPaperStage`: `Scene 03, 09, 16, 18`)** mô phỏng mặt giấy kem `#F7F3E8 -> #E6DFCE` có hạt cellulose + lưới trắc địa, tờ biểu đồ `#FFFCF0` thước kẻ `#100F0F 3px`, kỷ luật 1 màu nhấn Ngọc bích `#1E7870` (hoặc Đỏ chu sa `#C93B2B` cho nút thắt/cảnh báo) và ảnh thực địa đóng khung **Polaroid `#FFFCF0`**.

## Palette Discipline
- **Nền 3D Obsidian Ink (16 cảnh vệ tinh):** `#100F0F` / `#1C1B1A`, đường chân trời ấm `#0B0A09 -> #161513`, viền mảnh `1px` `rgba(230, 223, 206, 0.20)` + thanh nhấn trái `4px`.
- **Nền Giấy Lưu Trữ 5 lớp (4 cảnh phân tích `03, 09, 16, 18`):** `#F7F3E8 -> #E6DFCE` + hạt giấy + lưới trắc địa `36px`, tờ biểu đồ `#FFFCF0`, mực in `#100F0F`, thanh đối chiếu trung tính `#D4CFC0`.
- **Màu dữ liệu ngữ nghĩa:** Ngọc bích `#3AA99F` / `#1E7870` (Long Thành 4F / Chuẩn ICAO / Đường sắt `120 km/h`), Đỏ chu sa `#D94E41` / `#C93B2B` (Tân Sơn Nhất `365 m` / Điểm nghẽn / Gạch đỏ), Hổ phách `#E5AF28` / `#A67512` (Quy hoạch / Đê-cáp-vòng cung / Bút dạ quang), Xanh thép `#5695C9` (Không phận / Hàng hải).
- **Hồ sơ quy hoạch chính thức (`QĐ 648`, `NQ 94/2015/QH13`, `NQ 174/2024/QH15`):** Tờ hồ sơ `#FFFCF0` kiểu báo chí, viền mảnh, nét bút dạ `rgba(229, 175, 40, 0.44)`.
- **Phụ đề phát sóng (`KeywordCaptionBar`):** Viên thuốc than khói `rgba(18, 17, 16, 0.93)` cố định kích thước (`0.00 px` dịch chuyển), **đơn sắc hoàn toàn & không gạch chân** — từ chưa đọc giữ màu xám đá mờ `rgba(206, 205, 195, 0.52)`, từ đang/đã đọc chuyển êm sang một màu trắng ngà `#FFFCF0` duy nhất (`boxShadow: "none"`).

## Signature Visual Devices (6 Thủ Pháp Bản Đồ Độc Bản)
1. **Luminous 2-Layer Perimeter & Surface Metrics:** Viền ranh giới 2 lớp phát sáng + nhãn thông số đặt ngay trên mặt thực địa (`~791 HA`, `5.000 HA • CẤP 4F`).
2. **Geodesic Caliper Rulers (`GeoCaliperRule`):** Thước đo mũi tên trực tiếp trên bản đồ (`|◄—— 365 M ——►|`, `|◄—— ~40 KM ——►|`, `|◄—— > 2.000 M ——►|`).
3. **Corner Vietnam Mini-Map Locator (`VietnamMiniLocator`):** Bản đồ chữ S + Hoàng Sa – Trường Sa trên nền Obsidian góc trống các cảnh zoom `z12–z14` (`0%` đè chữ).
4. **True-Scale Moving Silhouettes (`MovingAircraft`):** Tàu bay Code F, tàu hẹp nội địa và đoàn tàu điện `120 km/h` di chuyển dọc đúng quỹ đạo thực.
5. **Geotechnical Soil Cutaway & Concentric Radar (`RadarRangeFan`, `HubMedallion`):** Lát cắt địa chất bùn yếu Cần Giờ trên giấy lưu trữ + quạt quét radar `15–25–40 km`.
6. **3D Shore-Anchored River Bridges (`Bridge3DExtrusion`):** Cầu Long Thành (CT.01) & Cầu Nhơn Trạch (Vành đai 3) có mố dẫn ăn chắc hai bờ sông Đồng Nai và trụ đứng trên mặt nước.

## Hard Rules (Channel Governance)
- Hiển thị đầy đủ, tự nhiên nhãn **`QUẦN ĐẢO HOÀNG SA (VIỆT NAM)`** và **`QUẦN ĐẢO TRƯỜNG SA (VIỆT NAM)`** trên mọi cảnh toàn quốc/Biển Đông; **không khoanh vòng tròn**.
- Mọi tuyến đường bay, hành lang cao tốc, đường sắt, sông Đồng Nai và đa giác `5.000 ha / 791 ha` **bắt buộc** lấy từ OpenStreetMap / vệ tinh EOX `z14` và vượt qua `verify_polylines.py` (`0` sai lệch địa hình trước khi render).
- **0%** text nguồn/tác giả/license/ghi chú nội bộ đè lên khung hình video; ghi công đầy đủ Wikimedia Commons & EOX Sentinel-2 2024 trong `asset_manifest.json` và `exports/metadata/description.txt`.
- Phụ đề đứng yên **0.00 px layout shift**, đơn sắc `#FFFCF0` không tô màu từ khóa và không gạch chân (`KeywordCaptionBar`); giọng Vibi TTS `Haitrieu` (`-16 LUFS`) kết hợp hệ thống âm thanh **3-Bus / 75 sự kiện (`83` tiếng động Foley chọn lọc) + nhịp nền `96 BPM`**.
