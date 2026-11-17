# Bộ Thông Tin Chuẩn Bị Kênh YouTube Giải Mã Địa Lý Kinh Tế & Hạ Tầng Việt Nam

> **Ngày lập:** `17/11/2026`  
> **Giai đoạn áp dụng:** Chuẩn bị hoàn thiện trước Giai đoạn 1 (`23/11 – 20/12/2026`)  
> **Tài liệu liên quan:** [README.md](./README.md) · [21_QUYET_DINH_NGACH_VA_GIAI_DOAN_0.md](./21_QUYET_DINH_NGACH_VA_GIAI_DOAN_0.md) · [22_GOI_Y_20_CHU_DE_XU_HUONG_TIM_KIEM_2026-11-17.md](./22_GOI_Y_20_CHU_DE_XU_HUONG_TIM_KIEM_2026-11-17.md) · [23_PHAN_TICH_3_VIDEO_MAU_REA_VIDEO_2026-11-17.md](./23_PHAN_TICH_3_VIDEO_MAU_REA_VIDEO_2026-11-17.md)

Tài liệu này gom toàn bộ thông số vận hành, văn bản hồ sơ YouTube Studio, cấu hình kỹ thuật – pháp lý, bộ nhận diện thị giác, trụ cột nội dung, danh sách phát, lịch phát sóng 4 tuần đầu và checklist xuất bản để bạn chỉ cần copy-paste thiết lập kênh hoàn chỉnh.

---

## Phần 1 — Định Vị Cốt Lõi & 5 Phương Án Tên Kênh + `@Handle` (Đã Quét Chống Trùng 17/11/2026)

### 1.1. Tóm tắt định vị đã khóa
- **Ngách chính thức:** Giải mã địa lý kinh tế và hạ tầng dân dụng Việt Nam bằng bản đồ và sơ đồ tự dựng.
- **Lời hứa một câu:** *"Mỗi tuần một địa điểm, một câu hỏi vì sao, trả lời bằng bản đồ."*
- **Thị trường & ngôn ngữ:** Việt Nam, tiếng Việt (chưa mở kênh tiếng Anh trong Giai đoạn 0).
- **Cấu trúc nội dung:** Video dài `10–16 phút` (`16:9`, 1 tập/tuần) + `1–2 Shorts` (`45–58 giây`, `9:16`) tách từ cùng kho dữ liệu để kéo người xem về bản dài.
- **Quy chuẩn hình & tiếng:** 100% bản đồ vệ tinh `EOxCloudless Sentinel-2 2024`, sa bàn 3D nghiêng sâu `48°–56°`, đồ họa vector/OSM tự dựng, tư liệu Wikimedia tự do bản quyền (hiện đủ Hoàng Sa – Trường Sa tự nhiên, không vẽ vòng khoanh đứt nét); giọng đọc AI `Vibi TTS (Haitrieu)` kết hợp âm thanh Foley bản đồ tiết chế.

### 1.2. Cảnh báo các tên kênh & `@handle` đã có người dùng (CẦN TRÁNH)
Kết quả kiểm tra trực tiếp trên YouTube và đối chiếu bộ dữ liệu 37 kênh `vn_ha_tang_dia_ly` trong `_tools/niche_scan.json` ngày `17/11/2026`:

| Tên / `@Handle` | Trạng thái kiểm tra (`17/11/2026`) | Ghi chú tránh trùng lặp |
|---|---|---|
| `@GiaiMaBanDo` | `HTTP 200` — **Đã có chủ** | Đang gắn với kênh *Truyện Ma Làng Sậy* (khác ngách nhưng trùng URL handle) |
| `@BanDoHaTang` | `HTTP 200` — **Đã có chủ** | Kênh *Bản Đồ Hạ Tầng* đã tồn tại trực tiếp |
| `@SaBanVietNam` | `HTTP 200` — **Đã có chủ** | Kênh *Sa Bàn Việt Nam* đã tồn tại trực tiếp |
| `@toancanhhatang` | **Đã có chủ** | Kênh *Toàn Cảnh Hạ Tầng* |
| Tên trùng trong nhóm `vn_ha_tang_dia_ly` | **Đã tồn tại** | *Ghiền Địa Lý*, *Dòng Chảy Địa Lý*, *Dương Địa Lý*, *Tọa Độ Xưa*, *Tọa Độ Quyền Lực*, *Giải Mã Việt Nam*, *Giải Mã Sử Việt*, *Địa Thế Sử Việt*, *Land Connect*, *DienkhanhGIS* |

### 1.3. Năm phương án Tên kênh & `@Handle` đang trống (`HTTP 404` ngày 17/11/2026)

| Hạng | Tên kênh đề xuất | `@Handle` (`HTTP 404`) | Lợi thế định vị & SEO |
|---|---|---|---|
| **1 (Khuyên dùng)** | **Giải Mã Bản Đồ VN** | `@GiaiMaBanDoVN` | Khớp trực diện từ khóa tìm kiếm `"giải mã bản đồ"` và đồng bộ sẵn hashtag `#GiaiMaBanDo` đang dùng trong Tập 1 & Tập 2 |
| **2 (Khuyên dùng)** | **Bản Đồ Kinh Tế VN** | `@BanDoKinhTeVN` | Khóa thẳng vào tệp khán giả trưởng thành quan tâm địa lý kinh tế, logistics, quy hoạch công nghiệp & hạ tầng |
| **3** | **La Bàn Hạ Tầng** | `@LaBanHaTang` | Tên thương hiệu ngắn, giàu hình tượng logo, tách biệt hẳn các kênh tin tức tiến độ/flycam thông thường |
| **4** | **Đọc Vị Bản Đồ** | `@DocViBanDo` | Sắc thái điều tra không gian kiểu Johnny Harris / Vox, ăn khớp với chuỗi tiêu đề câu hỏi *"Vì sao?"* |
| **5** | **Thấu Kính Bản Đồ** | `@ThauKinhBanDo` | Nhấn mạnh góc nhìn soi cận cảnh vệ tinh `z14` & giải phẫu mặt cắt địa chất – kỹ thuật |

> [!IMPORTANT]
> Cả `@BanDoHaTangVN`, `@BanDoThucDia` cũng trả `HTTP 404` khi quét ngày `17/11/2026`, nhưng nên ưu tiên **Phương án 1 hoặc 2** (tránh nhầm với kênh *Bản Đồ Hạ Tầng* đang hoạt động). Ngay lúc tạo kênh trên YouTube Studio (`Customization -> Basic info -> Handle`), hãy nhập kiểm tra lại lần cuối và khóa handle ngay để giữ chỗ.

---

## Phần 2 — Bộ Văn Bản Hồ Sơ Kênh Copy-Paste Ngay (`YouTube Studio -> Customization -> Basic info`)

### 2.1. Mô tả kênh chuẩn SEO (`About / Channel Description` — ~790 / 1.000 ký tự)
*(2 dòng đầu dưới `140 ký tự` chứa trọn từ khóa chính & giá trị kênh để không bị cắt trên điện thoại và kết quả tìm kiếm)*:

```text
Mỗi tuần một địa điểm tại Việt Nam, một câu hỏi "Vì sao?", giải mã trọn vẹn bằng bản đồ 3D, ảnh vệ tinh và số liệu kỹ thuật.

Giải Mã Bản Đồ VN bóc tách bài toán địa lý kinh tế và hạ tầng dân dụng đằng sau những đại công trình của Việt Nam theo ngôn ngữ trực quan:
• Cảng biển & Hàng hải: vì sao tàu mẹ cần cảng nước sâu ngoài khơi thay vì sông nội địa?
• Hàng không & Không lưu: bài toán cự ly đường băng, phễu bay và siêu sân bay quốc gia.
• Cao tốc & Đường sắt: bẫy địa chất nền bùn yếu, đường cong 350 km/h và trục kết nối vùng.
• Đô thị & Năng lượng: tái cấu trúc không gian kinh tế, hành lang logistics và quy hoạch 2030–2050.

Lịch phát sóng dự kiến: 1 tập phân tích chuyên sâu (10–16 phút) + 1–2 Shorts tóm tắt mỗi tuần.
Mọi số liệu quy hoạch đều đối chiếu văn bản gốc; video sử dụng bản đồ số tự dựng (EOxCloudless Sentinel-2, OpenStreetMap) kết hợp giọng đọc AI tổng hợp.

Liên hệ hợp tác / góp ý dữ liệu: <nhap-email-kenh-cua-ban@gmail.com>
```

### 2.2. Bio ngắn (`<= 150` ký tự — dùng khi đồng bộ Shorts / TikTok / Reels / ghim mô tả ngắn)

```text
Mỗi tuần một địa điểm Việt Nam, một câu hỏi "Vì sao?", trả lời bằng bản đồ 3D & số liệu quy hoạch gốc.
```

---

## Phần 3 — Cấu Hình Kỹ Thuật & Pháp Lý Trong `YouTube Studio -> Settings`

### 3.1. Từ khóa cấp kênh (`Settings -> Channel -> Basic info -> Keywords`, `< 500` ký tự)
Copy nguyên dòng bên dưới (dán vào ô `Keywords` trong YouTube Studio):

```text
"giải mã bản đồ", "địa lý kinh tế Việt Nam", "hạ tầng Việt Nam", "quy hoạch hạ tầng", "bản đồ 3D Việt Nam", "cảng nước sâu", "sân bay Long Thành", "cảng Lạch Huyện", "cao tốc Việt Nam", "đường sắt tốc độ cao", "logistics Việt Nam", "phân tích địa lý"
```

### 3.2. Cấu hình `Audience (COPPA)` & Mở khóa tính năng (`Settings -> Channel -> Advanced settings & Feature eligibility`)
- **Made for kids (bắt buộc tuân thủ COPPA/FTC):** Chọn cố định **"No, set this channel as not made for kids"** (*"Không, đặt kênh này là không dành cho trẻ em"*). Không bao giờ bật nhầm cờ trẻ em vì sẽ khóa bình luận, đề xuất và kiếm tiền cá nhân hóa.
- **Mở khóa đủ 3 bậc tính năng trước khi đăng Tập 1:**
  - *Standard features (Bậc 1):* Mặc định khi tạo kênh.
  - *Intermediate features (Bậc 2 — Xác minh số điện thoại):* Bắt buộc bật để đăng **video dài > 15 phút** và tải **Custom Thumbnail** tự thiết kế.
  - *Advanced features (Bậc 3 — Xác minh khuôn mặt 30s / CCCD hoặc lịch sử kênh):* Bắt buộc bật để đặt **liên kết ngoài mô tả** (link văn bản `vanban.chinhphu.vn`), **ghim bình luận chứa link** và mở tính năng **Test & Compare** (chạy thử A/B/C đồng thời 3 Tiêu đề + 3 Thumbnail).

### 3.3. Cấu hình `Upload defaults` (Thiết lập mặc định cho mọi video tải lên)

| Mục trong `YouTube Studio` | Giá trị khóa chuẩn | Ghi chú vận hành |
|---|---|---|
| `Visibility` | **Private** (*Riêng tư*) | Chỉ chuyển sang `Scheduled` / `Public` sau khi rà xong phụ đề `.srt`, chất lượng 1080p/4K, End Screen & cờ AI |
| `Category` | **Education** (*Giáo dục*) | Định vị thuật toán tệp khán giả tri thức, phân tích, tài chính/vĩ mô (tránh lẫn sang Tin tức thời sự) |
| `Video language` | **Vietnamese** | Khớp giọng Vibi TTS `Haitrieu` |
| `Title and description language` | **Vietnamese** | Đồng bộ tìm kiếm tiếng Việt |
| `Altered or synthetic content` | **Yes** (*Có*) | Bắt buộc tích vì sử dụng giọng đọc AI tổng hợp + bản đồ 3D mô phỏng từ dữ liệu vệ tinh |
| `Comments` | **On — Hold potentially inappropriate comments / Hold links** | Bật `Increase strictness` hoặc chặn link rác để giữ phần thảo luận địa lý sạch sẽ |
| `License` | **Standard YouTube License** | Không chọn Creative Commons nếu muốn bảo toàn quyền sở hữu cụm đồ họa & kịch bản |

### 3.4. Khung Mô Tả Mặc Định (`Upload Defaults -> Description Template`) & Bình Luận Ghim Mẫu

```text
[Đoạn 1 — 1–2 câu mở khóa: nêu thẳng câu hỏi "Vì sao?" & từ khóa chính của địa điểm]
[Đoạn 2 — Tóm tắt ngắn 3–4 chương phân tích bản đồ, thủy văn / địa chất / không lưu / quy hoạch của tập]

⏱️ NỘI DUNG CHÍNH:
00:00 Mở đầu & Nghịch lý vị trí
...

📌 NGUỒN PHÁP LÝ & DỮ LIỆU THAM CHIẾU (Đã kiểm chứng văn bản gốc trước khi công khai):
1. [Tên Quyết định / Nghị quyết] — [Link vanban.chinhphu.vn / vbpl.vn / Cảng vụ / Bộ ngành]

🛰️ BẢN QUYỀN HÌNH ẢNH, BẢN ĐỒ & ÂM THANH:
• Ảnh vệ tinh nền: EOxCloudless Sentinel-2 cloudless mosaic 2024 by EOX IT Services GmbH / Copernicus — CC BY 4.0 (https://cloudless.eox.at).
• Đường bờ, sông ngòi & hạ tầng: Natural Earth (Public Domain) & © OpenStreetMap contributors — ODbL (https://www.openstreetmap.org/copyright).
• Ảnh tư liệu thực địa (Wikimedia Commons): [Liệt kê đầy đủ tác giả + tên file + giấy phép CC của từng tập].
• Công bố nội dung tổng hợp (Altered/Synthetic Content Disclosure): Lời bình sử dụng giọng đọc AI tổng hợp (Vibi TTS — Haitrieu) kết hợp đồ họa bản đồ 3D mô phỏng từ ảnh vệ tinh và dữ liệu địa lý thực tế.

#GiaiMaBanDo #[TuKhoaDiaDiem] #DiaLyKinhTe #HaTangVietNam
```

**Mẫu bình luận ghim đặt ngay khi video lên sóng (tạo tương tác địa phương hóa):**
```text
Ở góc nhìn của bạn hoặc tại địa phương bạn đang sống, nút thắt giao thông / quy hoạch nào ở Việt Nam đáng được dựng bản đồ giải mã nhất trong các tập tiếp theo? Hãy bình luận địa danh cụ thể bên dưới — chúng mình sẽ tra cứu quy hoạch gốc để đưa vào danh sách dựng tập kế tiếp!
```

---

## Phần 4 — Quy Chuẩn Nhận Diện Thị Giác Kênh (`Branding` & Thumbnail System)

Bộ màu và typography áp dụng chuẩn **Vox / Johnny Harris + `kepano/flexoki` Hybrid Archival Atlas** ([projects/san-bay-long-thanh-40km/theme.ts](../projects/san-bay-long-thanh-40km/theme.ts) & [projects/demo-giai-ma-ban-do-90s/theme.ts](../projects/demo-giai-ma-ban-do-90s/theme.ts)):

| Vai trò màu | Mã Hex chuẩn biên tập | Ứng dụng trên Avatar / Banner / Video / Thumbnail |
|---|---|---|
| Nền bản đồ than chì ấm | `#100F0F` · `#161514` · `#1C1B1A` | Nền bản đồ 3D vệ tinh ấm chuẩn rạp (thay thế nền xanh neon) |
| Nền giấy kem cổ điển | `#F7F3E8` · `#FFFCF0` · `#F2F0E5` | Cảnh biểu đồ so sánh, mặt cắt địa chất, khung ảnh Polaroid & hồ sơ QĐ |
| Mực nhấn hiện hữu / Lời giải | `#3AA99F` (Ngọc tối) · `#1E7870` (Ngọc trên giấy) | Cột/tuyến nhấn chính (tuân thủ **1 màu nhấn duy nhất trên mỗi biểu đồ**) |
| Vàng đất & Xanh thép | `#E5AF28` (Vàng đất) · `#5695C9` (Thép) | Quỹ đạo vòng cung, thước đo `40 KM` / `365 M`, tuyến tương lai |
| Đỏ son cảnh báo | `#D94E41` (trên tối) · `#C93B2B` (trên giấy) | Điểm nghẽn, dấu `✕`, cột bội chi / trần đường băng |
| Chữ mực & Chữ trắng ngà | `#FFFCF0` / `#CECDC3` (nền tối) · `#100F0F` / `#575653` (nền giấy) | Font chính: **`Be Vietnam Pro`** (`700/800`), font số đo: **`IBM Plex Mono`** |

### 4.1. Bộ thông số & Prompt chuẩn bị thiết kế cho 3 tài sản thương hiệu (chỉ xuất ảnh sau khi chốt 1 tên kênh)

1. **Ảnh đại diện (`Profile Picture / Avatar`) — `800 × 800 px`, PNG, khung cắt tròn:**
   - **Quy tắc:** Tuyệt đối **không nhồi câu chữ dài** vì hiển thị ở kích thước `32–40 px` cạnh tên kênh sẽ bị nát chữ. Giữ 1 biểu tượng trung tâm dễ nhận từ xa.
   - **Bố cục:** Dải chữ S Việt Nam nổi bật bằng vàng đất `#E5AF28` & ngọc bích `#3AA99F` trong vòng tròn kinh tuyến trên nền `#100F0F`, thể hiện rõ cụm chấm đảo **Hoàng Sa & Trường Sa** tự nhiên (không vẽ vòng tròn đứt nét).
   - **Prompt gợi ý (`image-generator`):** `Minimalist luxury editorial emblem icon for a Vietnamese economic geography YouTube channel, warm archival obsidian background #100F0F, stylized S-shaped Vietnam map silhouette in muted verdigris jade #3AA99F and warm ochre gold #E5AF28 including natural Spratly and Paracel archipelago dots with zero dashed circle around islands, delicate antique brass #E5AF28 compass degree ring centered inside circle margins, zero text, crisp Vox/Economist editorial aesthetic.`

2. **Ảnh bìa kênh (`Banner Image`) — `2560 × 1440 px`, `< 6 MB`:**
   - **Vùng an toàn chữ bắt buộc (`Safe Area`):** Mọi chữ, logo và slogan phải nằm trọn trong hộp **`1546 × 423 px` chính giữa ảnh** (hiển thị đủ trên mọi điện thoại); phần còn lại là nền vệ tinh Việt Nam tối ấm góc nghiêng `52°`.
   - **Câu chữ đặt trong hộp `1546 × 423 px`:**
     - Dòng chính: **`[TÊN KÊNH ĐÃ CHỌN]`** (cỡ lớn `Be Vietnam Pro ExtraBold`, `#FFFCF0`)
     - Dòng phụ: **`GIẢI MÃ ĐỊA LÝ KINH TẾ & HẠ TẦNG VIỆT NAM BẰNG BẢN ĐỒ 3D`** (`#3AA99F` / `#E5AF28`)
     - 4 nhãn nhỏ chân dòng: `Cảng Biển • Hàng Không • Cao Tốc & Đường Sắt • Đô Thị & Năng Lượng`
   - **Prompt gợi ý (làm nền không chữ để ghép typography chuẩn tiếng Việt bằng HTML/Remotion `renderStill`):** `Warm editorial 3D oblique satellite topographic map view of Vietnam and the East Sea from 52-degree tilt, deep obsidian charcoal lighting #100F0F to #1C1B1A, subtle muted cerulean #5695C9 coastline and warm ochre #E5AF28 logistics route arcs, soft paper vignette, wide uncluttered dark center band reserved for typography, zero text, zero labels, 16:9 widescreen 2560x1440 resolution.`

3. **Video Watermark (Góc dưới phải trình phát) — `150 × 150 px`, PNG nền trong suốt:**
   - Chọn chế độ **Entire video** (*Toàn bộ video*) nhưng dùng icon tối giản (la bàn chữ S / ghim bản đồ nét mảnh màu `#FFFCF0` / `#E5AF28` độ mờ `70–75%`) để không che phụ đề hay thẻ `VietnamMiniLocator`.

4. **Hệ thống Thumbnail đồng bộ (`1280 × 720 px`, `< 2 MB`, tối đa 3–4 từ chữ đại):**
   - Mỗi tập dài xuất đủ **3 phương án A/B/C** cho **Test & Compare** (ví dụ Tập 1: `KẸT 150 NĂM!`, Tập 2: `KẸT BẦU TRỜI!`). Phối ảnh/vệ tinh đóng khung kiểu báo chí trên nền `#100F0F` hoặc `#F7F3E8`, chữ to `Be Vietnam Pro ExtraBold` + 1 con số nghịch lý màu `#E5AF28` / `#D94E41`.

---

## Phần 5 — 4 Trụ Cột Nội Dung (`Content Pillars`) & 5 Danh Sách Phát (`Playlists`) Khởi Tạo

### 5.1. Bốn trụ cột nội dung sở hữu riêng (không lẫn với kênh tin tức tiến độ)

| Trụ cột | Vai trò chiến lược | Câu hỏi cốt lõi & Cách kể | Tập tiêu biểu |
|---|---|---|---|
| **1. Giải phẫu Nút thắt Vật lý & Hình học** *(Signature Pillar)* | Định danh thương hiệu kênh | Vì sao chỉ lệch vài trăm mét / vài mét độ sâu (`-7 m`, `365 m`) lại khóa cả vùng kinh tế? | Tập 1 (*Lạch Huyện*), Tập 2 (*Long Thành 40 km*) |
| **2. Cửa ngõ Biển lớn & Chuỗi Cảng nước sâu** | Tệp logistics, thương mại & lịch sử cảng | Chiều sâu thủy văn, bồi lắng phù sa, cạnh tranh tàu mẹ `165.000+ DWT` vs trung chuyển Singapore | *Lạch Huyện*, *Cái Mép – Thị Vải*, *Trần Đề*, *Cần Giờ* |
| **3. Mạng lưới Tốc độ cao: Sân bay, Cao tốc & Đường sắt** | Sức tìm kiếm rộng nhất trên toàn quốc | Bán kính đường cong `350 km/h`, cầu cạn xuyên bùn ĐBSCL, đường sắt khổ `1.435 mm` | *Long Thành*, *Cao tốc miền Tây*, *ĐS tốc độ cao Bắc – Nam* |
| **4. Tái cấu trúc Không gian Đô thị & Năng lượng** | Chủ đề thảo luận vĩ mô 2025–2026 | Không gian hướng biển, sáp nhập vùng kinh tế, cực truyền tải điện `500 kV` & điện hạt nhân | *Siêu đô thị TP.HCM – BD – BRVT*, *Ninh Thuận*, *Hải Phòng – Hải Dương* |

### 5.2. Năm Danh Sách Phát (`Playlists`) khởi tạo sẵn trên YouTube Studio

| # | Tên Playlist (Copy-Paste) | Mô tả SEO gắn cho Playlist |
|---|---|---|
| 1 | **Giải Mã Bản Đồ Hạ Tầng Việt Nam (Full Tập Dài)** | Chuỗi video phân tích chuyên sâu 10–16 phút: vì sao mỗi cảng biển, siêu sân bay, tuyến cao tốc và đường sắt lại được đặt tại tọa độ đó bằng bản đồ 3D & số liệu gốc. |
| 2 | **Bài Toán Bầu Trời & Hàng Không Việt Nam** | Giải phẫu quy hoạch đường băng, phễu tiếp cận, không lưu và các đại dự án sân bay Long Thành, Tân Sơn Nhất, Gia Bình, Phú Quốc. |
| 3 | **Cửa Ngõ Biển Lớn: Cảng Nước Sâu & Hàng Hải** | Phân tích luồng tàu, thủy văn phù sa, hải trình quốc tế từ Bến Sáu Kho – Lạch Huyện miền Bắc tới Cái Mép – Cần Giờ – Trần Đề phía Nam. |
| 4 | **Cao Tốc, Cầu Vượt & Đường Sắt 350 km/h** | Giải mã địa chất đất yếu ĐBSCL, hình học đường sắt tốc độ cao Bắc – Nam, Bến Thành – Cần Giờ và mạng cao tốc kết nối vùng. |
| 5 | **Giải Mã Nhanh Trong 60 Giây (#Shorts)** | Các lát cắt nghịch lý bản đồ ngắn 45–58 giây đi thẳng vào 1 con số đinh, kèm liên kết về tập phân tích đầy đủ. |

---

## Phần 6 — Kiểm Kê Tài Sản Sẵn Có & Lịch Đăng 4 Tuần Đầu Giai Đoạn 1 (`23/11 – 20/12/2026`)

### 6.1. Tài sản đã hoàn thiện sẵn trong workspace (`awaiting_human`)

| Tập | Đường dẫn gói xuất bản | Trạng thái & Thông số đã xác minh | Việc còn lại của người duyệt trước khi hẹn giờ đăng |
|---|---|---|---|
| **Tập 1 (Cảng Lạch Huyện)** | [exports/](../projects/cang-lach-huyen-ban-dai/exports/) | `output.mp4` (`590.49s`, `2.024.017.435 bytes`, `1920x1080 @ 30fps`), `subtitles.srt`, `thumbnail.jpg`, `metadata.json` (`awaiting_human`) | Mở kiểm tra URL gốc trong [candidate_facts_sources.json](../projects/cang-lach-huyen-ban-dai/artifacts/candidate_facts_sources.json) -> xác nhận thủ công |
| **Tập 2 (Sân bay Long Thành 40 km)** | [exports/](../projects/san-bay-long-thanh-40km/exports/) | `output.mp4` (`668.27s`, `3.560.474.673 bytes`, `-15.0 LUFS`, 45 cue SFX tiết chế), `subtitles.srt`, `thumbnail.jpg`, `metadata.json` (`awaiting_human`) | Mở kiểm tra URL văn bản gốc trong [candidate_facts_sources.json](../projects/san-bay-long-thanh-40km/artifacts/candidate_facts_sources.json) -> xác nhận thủ công |
| **Kho 20 đề tài kế tiếp** | [22_GOI_Y_20_CHU_DE...md](./22_GOI_Y_20_CHU_DE_XU_HUONG_TIM_KIEM_2026-11-17.md) | 20 đề tài chia 5 nhóm, đã lọc theo dữ liệu quét `4.585` video YouTube | Chốt đề tài Tập 3 (*Cao tốc miền Tây* theo danh sách Giai đoạn 0 hoặc *Siêu đô thị / ĐS tốc độ cao 350 km/h*) |

### 6.2. Lịch phát hành 4 tuần đầu Giai đoạn 1 (`8–10 giờ/tuần`, giữ đệm 1–2 tập)

Vì bạn đã có sẵn **Tập 1** và **Tập 2** gần hoàn tất khâu hậu kỳ, lịch 4 tuần đầu Giai đoạn 1 giữ vững nhịp `1 Video dài + 2 Shorts/tuần` mà không bị quá tải sản xuất:

| Tuần | Mốc ngày | Video dài trụ cột (`16:9`) | Shorts vệ tinh (`9:16`, gắn `Related Video` về bản dài) | Việc sản xuất song song (trong quỹ `8–10 giờ`) |
|---|---|---|---|---|
| **Tuần 1** | `23/11 – 29/11` | **Tập 1:** *150 năm kẹt ở sông Cấm: Hải Phòng vượt biển 48km thế nào?* | • Short 1A: *Vì sao tàu mẹ vào sông Cấm phải đợi con nước?*<br>• Short 1B: *Cầu vượt biển Tân Vũ 5,44 km giải bài toán gì cho Lạch Huyện?* | Duyệt fact & lên lịch sẵn **Tập 2**; mở fact ledger **Tập 3 (*Cao tốc miền Tây*)** |
| **Tuần 2** | `30/11 – 06/12` | **Tập 2:** *Vì sao sân bay Long Thành phải lùi xa TP.HCM 40km?* | • Short 2A: *365 mét — Con số khóa bầu trời Tân Sơn Nhất*<br>• Short 2B: *Đặt trọn Tân Sơn Nhất (791 ha) vào trong 5.000 ha Long Thành* | Dựng & render **Tập 3** (*Cao tốc Cần Thơ – Cà Mau & cái bẫy bùn yếu ĐBSCL*) |
| **Tuần 3** | `07/12 – 13/12` | **Tập 3:** *Vì sao làm cao tốc ở miền Tây đắt và chậm hơn nơi khác?* | • Short 3A: *Túi bùn yếu 20–30 m ở ĐBSCL nuốt thời gian thế nào?*<br>• Short 3B: *Bài toán thiếu cát san lấp vs cầu cạn bê tông* | Rà retention Tập 1 & 2 qua `yt-retention`; mở fact ledger **Tập 4** (*ĐS 350 km/h* hoặc *Siêu đô thị TP.HCM*) |
| **Tuần 4** | `14/12 – 20/12` | **Tập 4:** *Đề tài ưu tiên Top 20 (Đường sắt 350 km/h Bắc – Nam hoặc Siêu đô thị TP.HCM)* | • Short 4A & 4B tách từ điểm nghịch lý vật lý của Tập 4 | **Cổng đánh giá Cổng 1 (20/12):** tổng kết giờ làm, retention, returning viewers & tỷ lệ chuyển đổi từ Shorts |

> **Nguyên tắc giảm tải an toàn (khi tuần bận < 8 giờ):** Cắt bớt 1 video Short (còn 1 Long + 1 Short) nhưng **tuyệt đối không bỏ kiểm chứng nguồn Fact Ledger** và **không đăng video dài thiếu phụ đề/nguồn**.

---

## Phần 7 — Checklist 8 Bước Bắt Buộc Trước Mỗi Lần Bấm `Schedule / Publish` Trên YouTube Studio

1. **[ ] Kiểm chứng Fact Ledger (`unverified -> verified`):** Mở từng URL trong `artifacts/candidate_facts_sources.json` của tập đó, đối chiếu đúng số liệu trên `vanban.chinhphu.vn` / `vbpl.vn` / trang cơ quan chủ quản rồi mới đổi sang công khai.
2. **[ ] Kiểm tra khung hình & chủ quyền:** Xác nhận mọi cảnh bản đồ quốc gia/Biển Đông hiển thị đầy đủ, rõ ràng **Quần đảo Hoàng Sa (Việt Nam)** & **Quần đảo Trường Sa (Việt Nam)** không bị thẻ hay vòng khoanh đứt nét che phủ; không còn chữ tìm kiếm/watermark thừa.
3. **[ ] Kiểm tra bản quyền tư liệu & mô tả:** Đối chiếu danh mục tác giả Wikimedia Commons, `EOxCloudless Sentinel-2 (CC BY 4.0)` và `OpenStreetMap (ODbL)` trong `description.txt`.
4. **[ ] Kiểm tra âm thanh & khớp thoại:** Xác nhận track hoàn chỉnh nằm khoảng `-14.5 .. -15.0 LUFS`, không vỡ tiếng, giọng Vibi TTS `Haitrieu` không sai phát âm địa danh, và hiệu ứng Foley chỉ vang ở các điểm nhấn chính.
5. **[ ] Tải video + phụ đề + ảnh bìa lên YouTube Studio ở chế độ `Private`:** Đính kèm file `exports/video/subtitles.srt` (tiếng Việt chuẩn chính tả) và file `exports/thumbnails/thumbnail.jpg`.
6. **[ ] Bật đúng các cờ pháp lý bắt buộc:** `Audience = No, not made for kids`; `Altered or synthetic content = Yes` (giọng đọc AI + bản đồ mô phỏng).
7. **[ ] Thiết lập giữ chân trước giờ công chiếu:** Nạp 3 phương án tiêu đề A/B/C vào **Test & Compare**, gắn vào đúng Playlist ở Phần 5, cấu hình `End Screen` (20 giây cuối trỏ sang tập dài tiếp theo), và hẹn giờ phát cố định.
8. **[ ] Sau xuất bản 48 giờ – 7 ngày:** Ghim bình luận đặt câu hỏi địa phương hóa (ở Mục 3.4), kiểm tra thẻ retention từ YouTube Studio CSV qua skill `yt-retention` và ghi lại bài học vào nhật ký kênh trước khi sản xuất tập kế tiếp.

