# Phân Tích & Giải Phẫu Kỹ Thuật 3 Video Bản Đồ Mẫu Bằng `rea-video`

> **Ngày thực hiện:** 17/11/2026  
> **Phạm vi dữ liệu:** 3 video Reels `1080×1920` tải về mới nhất lúc `09:14–09:15` ngày `17/11/2026` trong `C:\Users\ACER\Downloads\`  
> **Thư mục phân tích trung gian (đã đưa vào `.gitignore`):** `scratch/rea_video_3_reels/`  
> **Tài liệu liên quan:** [README.md](./README.md) · [21_QUYET_DINH_NGACH_VA_GIAI_DOAN_0.md](./21_QUYET_DINH_NGACH_VA_GIAI_DOAN_0.md) · [22_GOI_Y_20_CHU_DE_XU_HUONG_TIM_KIEM_2026-11-17.md](./22_GOI_Y_20_CHU_DE_XU_HUONG_TIM_KIEM_2026-11-17.md) · [SKILL.md (vietnam-map-explainer)](../.agents/skills/vietnam-map-explainer/SKILL.md)

> [!IMPORTANT]
> **Ranh giới bản quyền (`AGENTS.md` Mục 2):** Tài liệu này chỉ phân tích **cơ chế dựng hình, nhịp biên tập, bố cục chữ và cấu trúc âm thanh** để tham khảo nâng cấp năng lực tự dựng của OpenMontage. **Tuyệt đối không** sao chép lời bình, kịch bản, cảnh quay, nền bản đồ cắt sẵn, icon, nhạc nền hoặc thumbnail từ 3 video tham khảo.

---

## 1. Tổng Quan & Bảng Đối Chiếu Định Lượng 3 Video Mẫu

Toàn bộ 3 video đều được chạy qua quy trình 3 bước:
1. `rea-video decompose` + `rea-video review` (tách stem giọng/nhạc/SFX, đo chữ/phụ đề, dò cắt cảnh).
2. Đo giọng tiếng Việt chuyên sâu bằng `faster-whisper` (`language="vi"`, file [`measure_vi_voice_3_reels.py`](../scratch/measure_vi_voice_3_reels.py)) và đo chuẩn âm lượng `EBU R128 LUFS` trên từng stem (`original.wav`, `vocals.wav`, `music.wav`, `effects.wav`, lưu tại [`audio_stems_lufs.json`](../scratch/rea_video_3_reels/audio_stems_lufs.json)).
3. **Soi mắt thường đa phương thức** qua `storyboard.jpg`, `dense_tiles_4s_*.jpg` (`3.5–4.5s/khung`), `hook_0_4s_*.jpg` (`0.5s/khung`), `shots/shot_*.jpg`, và chạy `rea-video apply-review --by Antigravity --lang en` để hiệu chỉnh nhận diện pixel của công cụ tự động.

| Chỉ số đo được | `01_bien_dong` (*Tập 2/7 Hải trình Biển Đông*) | `02_viet_nam_chu_s` (*Vì sao VN hình chữ S*) | `03_vinh_cam_ranh` (*Vịnh Cam Ranh yết hầu*) |
|---|---|---|---|
| **File gốc** | `FSave.com_Reels_Tap-2-7-Hai-trinh-vong-quanh-Bien-Dong-T_Media_1227440079629110_001_1080p.mp4` | `FSave.com_Reels_Vi-sao-Viet-Nam-co-hinh-chu-S-700-nam-mo_Media_1154788983793440_001_1080p.mp4` | `FSave.com_Reels_Vinh-Cam-Ranh-Yet-hau-chien-luoc-khien-c_Media_1799674987750717_001_1080p.mp4` |
| **Kích thước / FPS / Thời lượng** | `1080×1920` · `24.0 fps` · **`85.46s`** (`27.43 MB`) | `1080×1920` · `30.0 fps` · **`67.57s`** (`23.57 MB`) | `1080×1920` · `30.0 fps` · **`104.57s`** (`32.72 MB`) |
| **Chủ đề chính** | So sánh 2 cửa ngõ phía Bắc Biển Đông (Eo Đài Loan vs Eo Luzon) | Tiến trình mở mang bờ cõi tạo hình chữ S qua >700 năm | Vị thế địa chiến lược & lịch sử Vịnh Cam Ranh (1935–nay) |
| **Cấu trúc thực tế (sau soi ảnh)** | **100% `code_render`** (NASA Blue Marble + đồ họa 2D/2.5D; `confidence: 0.891`) | **`cg_3d` (`0.0–2.3s`) + `code_render` (`2.3–67.6s`)** _(công cụ `rea-video` giữ bảo thủ `ai_video 0.655`¹)_ | **`static_hold` cover (`0.0–0.3s`) + `code_render` MapTiler/OSM 3D (`0.3–104.6s`)** (`confidence: 0.79`) |
| **Số cú cắt gốc / Nhịp mắt thực** | `3` đoạn (`25.33s` & `30.08s` do màng nâu cổ địa lý) | `2` đoạn máy dò + cắt ẩn `2.3s` (~12 mốc năm đổi cảnh) | `1` cú lia camera liền mạch + flash cover ở `0.3s` |
| **Tổng số từ đọc / WPM toàn bài** | `317` từ · **`222.6 WPM`** (vùng nói `227.3 WPM`) | `236` từ · **`209.6 WPM`** (vùng nói `211.6 WPM`) | `419` từ · **`240.3 WPM`** (vùng nói `240.4 WPM`) |
| **Giây cất tiếng đầu tiên** | **`0.00s`** (vào thẳng câu dẫn) | **`0.00s`** (chữ đầu tiên bung khung ngay `0.0s`) | **`0.00s`** (vào ngay câu hỏi dồn dập) |
| **Nhịp nghỉ `> 0.25s`** | `34` lần · TB `0.414s` · tối đa `0.64s` | `35` lần · TB `0.523s` · tối đa `1.22s` | `35` lần · TB `0.635s` · tối đa `3.24s` (outro cuối) |
| **Âm lượng tổng (`original.wav`)** | **`-14.2 LUFS`** (`mean -17.4 dB`, `peak -3.5 dB`) | **`-14.1 LUFS`** (`mean -16.9 dB`, `peak -1.3 dB`) | **`-14.1 LUFS`** (`mean -16.3 dB`, `peak -2.0 dB`) |
| **Giọng đọc (`vocals.wav`)** | **`-14.2 LUFS`** (`LRA 1.2 LU`, cao độ `~179 Hz`) | **`-14.5 LUFS`** (`LRA 1.8 LU`, `~159 Hz`) | **`-14.4 LUFS`** (`LRA 2.4 LU`, nam trầm `~95 Hz`) |
| **Nhạc nền (`music.wav`)** | **`-30.8 LUFS`** (`89.1 BPM A minor`, nền rất êm) | **`-22.1 LUFS`** (`184.6 BPM F major`, nhịp dồn rõ) | **`-27.6 LUFS`** (`136.0 BPM F major`, kịch tính) |
| **SFX (`effects.wav`)** | **`22` tiếng** (`-30.1 LUFS`, `peak -11.5 dB`) · **`17` tiếng khớp chữ** + `1` cắt | **`10` tiếng dọn sạch** (`-30.5 LUFS`, `peak -6.2 dB`) · **`8` tiếng khớp chữ/nhãn** | **`24` tiếng** (`22` tiếng chính, `-25.1 LUFS`, `peak -1.7 dB`) · **`7` khớp nhãn/chữ** |
| **Phụ đề & Nhãn đồ họa** | **`110` dòng phụ đề** (giữa, vàng đổi từng từ) + `5` huy hiệu icon tròn | **`88` dòng phụ đề** (vàng đổi từng từ) + `17` tiêu đề năm + `16` nhãn + `2` bộ đếm | **`71` dòng phụ đề** (ALL-CAPS nhỏ) + `5` nhóm ghim cờ/tàu/CTA + nhãn địa danh bám chuyển động |
| **Báo cáo `rea-video`** | [report.html](../scratch/rea_video_3_reels/01_bien_dong/report.html) · [VIDEO.md](../scratch/rea_video_3_reels/01_bien_dong/VIDEO.md) · [storyboard.jpg](../scratch/rea_video_3_reels/01_bien_dong/storyboard.jpg) | [report.html](../scratch/rea_video_3_reels/02_viet_nam_chu_s/report.html) · [VIDEO.md](../scratch/rea_video_3_reels/02_viet_nam_chu_s/VIDEO.md) · [storyboard.jpg](../scratch/rea_video_3_reels/02_viet_nam_chu_s/storyboard.jpg) | [report.html](../scratch/rea_video_3_reels/03_vinh_cam_ranh/report.html) · [VIDEO.md](../scratch/rea_video_3_reels/03_vinh_cam_ranh/VIDEO.md) · [storyboard.jpg](../scratch/rea_video_3_reels/03_vinh_cam_ranh/storyboard.jpg) |

> **¹ Ghi chú kỹ thuật minh bạch về `02_viet_nam_chu_s`:** Khi chạy `apply-review`, bộ lọc bảo thủ trong `rea-video/pipeline.py` (`_vlm_gate` dòng `555–558` và `_agent_review_dispute` dòng `605–615`) cố tình giữ phán quyết công cụ trên trục `AI / Real` vì nền vệ tinh xanh mượt không có khung lặp `24→30` cho điểm pixel `ai_video = 0.676` (`>= 0.65`). Tuy nhiên, đối chiếu trực tiếp bằng mắt qua [hook_0_4s_1.jpg](../scratch/rea_video_3_reels/02_viet_nam_chu_s/hook_0_4s_1.jpg) và [dense_tiles_4s_1.jpg](../scratch/rea_video_3_reels/02_viet_nam_chu_s/dense_tiles_4s_1.jpg) xác nhận `100%` đây là **quả cầu 3D (`0.0–2.3s`) nối tiếp bản đồ vệ tinh đồ họa vector (`2.3–67.6s`)** (có thẻ disclaimer *"Bản đồ minh họa · ranh giới gần đúng"* và đường nét vector sắc tuyệt đối, không có biến dạng AI).

---

## 2. Giải Phẫu Kỹ Thuật Từng Video Mẫu

### 2.1. Video 1 (`01_bien_dong` — *Tập 2/7 Hải trình Biển Đông*, `85.46s`, `222.6 WPM`)

#### A. Công thức Hook `0–5s` & `5–15s`
- **`0.0–2.7s`:** Mở ngay với tiêu đề 2 dòng căn giữa vùng an toàn giữa-trên **VÀO BIỂN ĐÔNG / TỪ PHÍA BẮC BẰNG CỬA NÀO?** (chữ cam nổi + trắng), ngay phía trên eo biển Đài Loan nơi **các sprite tàu hàng trắng đang chạy dọc tuyến đường nét đứt**. Giọng đọc cất tiếng ngay `0.00s` đặt ràng buộc tò mò (*"...tàu thuyền chỉ có 2 cánh cửa"*) kèm tiếng `ding` ở `0.2s` và `3.2s`.
- **`4.5–8.0s`:** Xưng danh chuỗi bài (**"Đây là tập 2, hải trình vòng quanh Biển Đông"**) rồi lập tức thu tiêu đề mở màn thành **thẻ viên thuốc tối bán trong suốt ghim cố định ở đỉnh trên (`y ~ 15%`)**: `Tập 2 · Hải trình Biển Đông / Vào từ phía bắc bằng cửa nào?` — vừa không che bản đồ, vừa khóa nhận diện series suốt cả video dài `85s`.

#### B. Kỹ thuật bản đồ & đồ họa thông tin
- **Nền bản đồ & xử lý tương phản:** Dùng ảnh vệ tinh **NASA Blue Marble** (ghi nhỏ `Bản đồ nền: NASA Blue Marble` ở góc dưới phải) phủ lớp tối màu lên mặt biển xanh thẫm, rồi vẽ **viền phát sáng màu vàng hổ phách** quanh bờ biển lục địa, đảo Đài Loan và chuỗi đảo Philippines để tách hình thể tức thì.
- **Động hóa bằng tuyến đường + icon tròn tối giản:** Thay vì chỉ vẽ mũi tên tĩnh, tuyến hàng hải là nét đứt trắng kèm các sprite tàu trắng li ti di chuyển liên tục; tại mỗi thông số bất ngờ lại bật **huy hiệu tròn nền trắng viền nét đen** đúng lúc giọng đọc chạm từ khóa:
  - `16.4–18.3s`: huy hiệu **thước đo độ sâu `70 m`** ngay trên eo biển Đài Loan ([sticker_01.jpg](../scratch/rea_video_3_reels/01_bien_dong/packaging/sticker_01.jpg)).
  - `31.5–52.5s`: huy hiệu **tàu container nhìn chính diện** trên eo Luzon.
  - `54.5–57.2s`: huy hiệu **quả cầu dây nối mạng** khi nói về cáp quang biển.
  - `58.5–63.0s`: huy hiệu **mực sóng ngầm `170 m`** (kèm tag đỏ `CHẠY DƯỚI MẶT NƯỚC`).
- **Thủ pháp chuyển ý `25.33–30.08s` (Shot 2):** Khi nói *"khoảng 20.000 năm trước, khi mực nước biển hạ thấp, đáy eo từng lộ ra thành đất liền"*, một **hình tròn màu nâu cát phồng tỏa từ tâm eo biển** nối liền lục địa và Đài Loan kèm thẻ giải thích đỏ `ĐÁY EO LỘ RA THÀNH ĐẤT LIỀN (VÙNG NÂU, MINH HỌA)`. Đây là thủ pháp chứng minh bằng hình khối trực quan cực mạnh mà không cần 3D phức tạp.
- **Tổng kết vĩ mô + giữ chân xem tập sau (`64–85s`):** Kéo zoom rộng toàn Biển Đông nối `Eo Luzon -> Đà Nẵng ≈ 1.400 km`, hiển thị rõ nhãn **`Biển Đông`**, **`QĐ. Hoàng Sa (Việt Nam)`**, **`QĐ. Trường Sa (Việt Nam)`**, đối chiếu hai cửa **`NÔNG · HẸP`** vs **`RỘNG · SÂU`**, sau đó lia sang **Vịnh Bắc Bộ**, bật **bản đồ nhỏ hình chữ S góc trên phải** kèm thẻ đỏ `XEM TẬP 3 / Theo dõi Chuyện Trên Bản Đồ`.

#### C. Đóng gói chữ & Âm thanh
- Phụ đề trắng viền đen nằm giữa-dưới (`y ~ 68–73%`), cao chữ `~3.2%`, **đổi màu vàng đúng từng chữ đang phát âm**.
- Nhạc nền rất nhẹ (`-30.8 LUFS`, kém thoại `-16.6 dB`) nên giọng nói `-14.2 LUFS` cực kỳ rõ ràng; `17` trong `22` tiếng `ding/pop` đặt chính xác vào lúc bật chữ thông số (`180 km`, `70 m`, `20.000 năm trước`, `400 km`, `4.000 m`, `Batanes và Babuyan`).

---

### 2.2. Video 2 (`02_viet_nam_chu_s` — *Vì sao Việt Nam có hình chữ S*, `67.57s`, `209.6 WPM`)

#### A. Công thức Hook `0–5s` & `5–15s`
- **`0.0–2.3s`:** Mở bằng **quả địa cầu 3D xoay giữa nền đen vũ trụ tuyệt đối** ([hook_0_4s_1.jpg](../scratch/rea_video_3_reels/02_viet_nam_chu_s/hook_0_4s_1.jpg)) tạo độ tương phản thị giác mạnh giữa bảng tin toàn cảnh sáng. Câu mở khẳng định phản trực giác ngay `0.00s` (*"Một nghìn năm trước, Việt Nam không hề có hình chữ S..."*) kéo camera lao thẳng xuống Đông Nam Á lúc `2.3s`.
- **`2.5–4.6s`:** Toàn bộ viền chữ S phát sáng trắng rực kèm khung nét đứt quanh Hoàng Sa – Trường Sa, đồng thời tiêu đề trắng khổng lồ **`HÌNH CHỮ S?`** + viên thuốc đỏ **`TỪ ĐÂU MÀ CÓ`** nổ bật phía trên.

#### B. Kỹ thuật bản đồ & đồ họa thông tin
- **Bộ khung chữ Thời gian 2 tầng thống nhất suốt `50s` lịch sử:** Mỗi mốc lịch sử là **con số/chữ trắng viền đen cỡ rất lớn (`7–8.6%` chiều cao, `~135–164 px`)** đặt ngay dưới là **viên thuốc đỏ bo tròn chứa tên triều đại/nhân vật**: `THẾ KỶ 11 / TRIỀU LÝ` → `1069 / VUA LÝ THÁNH TÔNG` → `1306 / CÔNG CHÚA HUYỀN TRÂN` → `1471 / VUA LÊ THÀNH TÔNG` → `CÁC CHÚA NGUYỄN` → `1611 / PHÚ YÊN` → `CUỐI TK 17 / NINH THUẬN · BÌNH THUẬN` → `1698 / NGUYỄN HỮU CẢNH` → `1757 / TRỌN VÙNG MIỀN TÂY` → `TÂY NGUYÊN / HỢP NHẤT DẦN · THẾ KỶ 19–20`.
- **Tô vùng lãnh thổ tiến dần:** Phần lãnh thổ mở rộng theo từng thế kỷ tô màu **đỏ sậm bán trong suốt có viền vàng phát sáng**, camera trượt mượt từ Bắc chí Nam theo từng bước mở đất (~`3–5s`/mốc), giữ mạch mắt không hề bị cắt giật.
- **Điểm nhấn nhân văn (`22.0–25.6s`):** Giữa chuỗi mốc mở cõi đặt một huy hiệu **trái tim hồng `SÍNH LỄ`** tại Huế (`Châu Ô`, `Châu Lý`), phá tan cảm giác khô khan của bản đồ lịch sử.
- **Khóa quy mô + Chủ quyền + CTA bình luận (`56–67.6s`):** Tô toàn bộ dải chữ S thành màu cờ Tổ quốc (đỏ sao vàng), zoom nhanh vào Quảng Bình đặt pill `41 km` với tiêu đề `HẸP NHẤT / QUẢNG BÌNH`, rồi kéo lùi toàn cảnh cắm **2 lá cờ đỏ sao vàng** phía trên **`QĐ. HOÀNG SA · TP. ĐÀ NẴNG`** và **`QĐ. TRƯỜNG SA · KHÁNH HÒA`**, kết thúc bằng câu mời tương tác địa phương **`TỈNH BẠN NẰM NÀO? / 👇 BÌNH LUẬN NHÉ`**. *(Lưu ý kỹ thuật từ dữ liệu thật: màn hình hiển thị thẻ `41 km` lúc `59.5s` trong khi lời thoại đọc `chừng 50 km`, và kênh này dùng khung nét đứt quanh quần đảo — điểm mà chuẩn kênh mình cần làm chặt chẽ hơn).*

#### C. Đóng gói chữ & Âm thanh
- Nhịp đọc chậm nhất trong 3 mẫu (`209.6 WPM`), ngắt nhịp dài hơn (`TB 0.523s`), kết hợp nhạc nền **`-22.1 LUFS`** (`184.6 BPM`) có tiết tấu rõ hơn 2 video kia (`chênh vocal-music chỉ ~7.6 LU`), tạo cảm giác hào hùng truyền cảm hứng.

---

### 2.3. Video 3 (`03_vinh_cam_ranh` — *Vịnh Cam Ranh yết hầu chiến lược*, `104.57s`, `240.3 WPM`)

#### A. Công thức Hook `0–5s` & `5–15s`
- **`0.0–0.3s`:** Chèn **1 khung bìa poster (`static_hold` ~`0.3s`)** ở đúng frame đầu tiên (`00:00.000` trong [hook_0_4s_1.jpg](../scratch/rea_video_3_reels/03_vinh_cam_ranh/hook_0_4s_1.jpg)): nền đỏ rực kịch tính, mũi tên cong vàng tỏa ra từ Cảng Cam Ranh, tiêu đề giật gân **`Vịnh Cam Ranh - "Yết hầu" chiến lược khiến cả thế giới thèm khát!`**. Mục đích là để ảnh bìa trên feed Reels/Shorts nhìn như poster chuyên nghiệp, nhưng tới `0.5s` đã lập tức chuyển sang bản đồ thật chạy nét!
- **`0.5–7.0s`:** Khi giọng nam trầm (`95 Hz`, `240.3 WPM`) liệt kê liền mạch 4 cường quốc (*"Tại sao từ Pháp, Nhật, Mỹ cho tới Liên Xô..."*), đường viền Việt Nam tự vẽ nét phát sáng xanh-vàng quanh chữ S, vòng **radar xanh lam đồng tâm xoay tốc độ cao** ngay tại Cam Ranh kèm nhãn **`QĐ. Hoàng Sa (Việt Nam)`** và **`QĐ. Trường Sa (Việt Nam)`** bật sẵn ngoài biển.

#### B. Kỹ thuật bản đồ & đồ họa thông tin
- **Dựng trên MapTiler + OpenStreetMap có Xoay & Nghiêng Camera Thật (`Pitch + Bearing`):** Góc dưới trái lộ rõ `© MapTiler © OpenStreetMap contributors`. Khác hẳn 2 video trên chỉ pan/zoom hướng Bắc, từ **`13.5s` đến `27.5s`**, camera **xoay trục gần `90°` theo chiều kim đồng hồ và nghiêng góc phối cảnh (`pitch`)** ôm trọn bán đảo Cam Ranh từ trên xuống, khiến người xem cảm nhận rõ địa hình "cánh tay núi ôm trọn vịnh, chỉ mở 2 cửa hẹp", đi kèm thông số lớn nằm nghiêng theo lòng vịnh (`~ 60 Km²` → `Độ sâu trung bình 18–20m`).
- **Đặt mô hình minh họa trực tiếp vào lòng bản đồ (`27.0s`):** Thả thẳng hình cắt **tàu sân bay và tàu ngầm** bơi bên trong đường viền phát sáng của vịnh Cam Ranh để quy đổi trực giác cụm từ *"dư sức cho các tàu sân bay hàng trăm nghìn tấn lẫn tàu ngầm đồn trú"*.
- **Chuỗi ghim cờ tròn 3D theo dòng thời gian (`43.0–71.0s`):** Giữ nguyên **1 vị trí ghim 3D đỏ tại Vịnh Cam Ranh**, lần lượt thả vòng tròn quốc kỳ từng thời kỳ nối đuôi nhau: **Pháp (`1935`) → Đế quốc Nhật (`1940`) → Mỹ + chồng tiền USD 3D (`1965`) → Liên Xô (`1979–2002`) → Quốc kỳ Việt Nam + huy hiệu mỏ neo `CẢNG CAM RANH` → 5 quốc kỳ tàu hải quân các nước ghé thăm (`79–90s`)**. Thay đổi nội dung 70 năm lịch sử chỉ trong ~28 giây mà khán giả không hề bị rối mắt nhờ neo đúng 1 tọa độ ghim.
- **Bảo vệ chống re-up + Bảo toàn chủ quyền:** Con dấu tròn `BÍ ẨN BẢN ĐỒ` trôi chậm dọc các cạnh màn hình suốt `104s` cùng chữ mờ cỡ lớn dưới chân, và mọi khung zoom Biển Đông đều giữ nhãn `QĐ. Hoàng Sa (Việt Nam)` & `QĐ. Trường Sa (Việt Nam)` không bị che.

#### C. Đóng gói chữ & Âm thanh
- Phụ đề màu trắng, **in hoa toàn bộ (`ALL CAPS`)**, cỡ nhỏ (`2.5%` chiều cao `~48 px`) đặt hơi thấp (`y ~ 78–82%`, ngay trên chữ watermark `BÍ ẨN BẢN ĐỒ`) — ít nổi bật trên màn hình điện thoại bằng kiểu chữ vàng-trắng của `01_bien_dong` và `02_viet_nam_chu_s`.
- Tốc độ đọc nhanh nhất (`240.3 WPM`), `22` SFX (gồm `ding`, `pop`, `click`, `whoosh`) có đỉnh biên độ vọt tới `-1.7 dB`, gắn chặt mỗi lần bật số (`1935`, `1965`, `1979–2002`, `18–20m`).

---

## 3. So Sánh Trực Diện Với Chuẩn `vietnam-map-explainer` Hiện Hành

Từ 2 tập dài đã hoàn thiện (`pass` kiểm toán trong workspace) — **Tập 1 Cảng Lạch Huyện** ([final_review.json](../projects/cang-lach-huyen-ban-dai/artifacts/final_review.json): `590.49s`, `2.356` từ ≈ `239.4 WPM`, `1920×1080`) và **Tập 2 Sân bay Long Thành** ([final_review.json](../projects/san-bay-long-thanh-40km/artifacts/final_review.json): `668.31s`, `2.713` từ ≈ `243.6 WPM`, `1920×1080`) — đặt cạnh 3 Reels mẫu `9:16` cho thấy rõ vị thế kỹ thuật của kênh chúng ta:

### 3.1. Những điểm OpenMontage (`vietnam-map-explainer`) đang vượt trội — Phải giữ vững
1. **Độ chính xác hình học & tọa độ thực tế (`100%` OSM Overpass + `verify_polylines.py`):** Từng nhịp cầu (Cầu Tân Vũ – Lạch Huyện, Cầu Long Thành, Cầu Nhơn Trạch), đường băng, tuyến đường và hành lang biển của chúng ta khớp pixel vệ tinh `EOxCloudless Sentinel-2 2024` (`z14`), không có sai số ranh giới ước lượng hay lệch số liệu chữ-thoại (như lỗi nhãn `41 km` vs lời đọc `50 km` trong `02_viet_nam_chu_s`).
2. **Màn hình sạch chuẩn truyền hình & Hồ sơ pháp lý / Fact Ledger:** Chúng ta không để dòng credit MapTiler/OSM hay chữ watermark lớn chồng lên vùng phụ đề như `03_vinh_cam_ranh`, đồng thời lưu đầy đủ attribution vào `exports/metadata/description.txt` và `asset_manifest.json`.
3. **Chiều sâu giải mã vật lý & Sa bàn mặt cắt `1:1`:** Các Reels `67–104s` dừng ở mức kể lịch sử hoặc nêu thông số bề mặt (`70 m`, `4.000 m`, `18–20 m`), còn Tập 1 & Tập 2 của chúng ta giải mã *bài toán kỹ thuật* (độ sa bồi bãi bùn, phễu bay tĩnh không, đường găng tiến độ) với `word_accuracy = 1.0`.
4. **Chuẩn chủ quyền không vẽ khung nét đứt nhân tạo:** `vietnam-map-explainer` §3.1 yêu cầu đặt nhãn **`QUẦN ĐẢO HOÀNG SA (VIỆT NAM)`** và **`QUẦN ĐẢO TRƯỜNG SA (VIỆT NAM)`** đĩnh đạc tự nhiên trên Biển Đông, tránh khung vuông nét đứt nhân tạo như `02_viet_nam_chu_s`.

### 3.2. Những kỹ thuật từ 3 Reels mà OpenMontage nên hấp thụ có chọn lọc
1. **Nhịp vào đề `0.0–0.4s` cho Shorts `9:16`:** Cả 3 Reels đều cất lời ở đúng **`0.00s`**. Với `03_vinh_cam_ranh` là khung bìa poster `~0.3s` rồi cắt thẳng vào bản đồ đang chạy nét; với `02_viet_nam_chu_s` là quả cầu 3D zoom từ nền đen vào chữ S sau `2.3s`; với `01_bien_dong` là tiêu đề câu hỏi đặt trực tiếp lên tàu đang chuyển động ở `0.0s`. Hiện tại các video dài của chúng ta mở êm kiểu phim tài liệu — khi cắt Shorts `45–58s` từ Lạch Huyện / Long Thành, **bắt buộc vào hook ngay `0.0s`**.
2. **Thẻ định danh Series cố định dạng viên thuốc (`01_bien_dong`):** Khi làm chuỗi nhiều tập ngắn cùng tuyến hạ tầng (ví dụ: *Tập 1: Đảo Bạch Long Vĩ / Lạch Huyện*, *Tập 2: Cầu Phước Khánh / Cái Mép*), đặt 1 pill bán trong suốt gọn ở trên giúp người xem nhận diện chuỗi ngay từ frame đầu.
3. **Xoay phương & nghiêng góc (`Bearing Rotation + Oblique Pitch`) quanh địa hình ven biển (`03_vinh_cam_ranh` `13.5–27.5s`):** Ở các cảnh zoom cận vịnh/cửa sông trên `Tactical3DStage`, ngoài `pitch 52°–56°`, xoay `yaw`/`bearing` mượt theo trục bán đảo/kênh đào (thay vì luôn nhìn thẳng hướng Bắc) giúp lộ ngay thế *"núi chắn – cửa hẹp"* bằng trực giác.
4. **Lớp cắt đổi nhịp giữa chừng bằng hình khối / icon minh họa nổi (`01_bien_dong` & `03_vinh_cam_ranh`):**
   - Thủ pháp phủ vòng tròn màu cát minh họa đáy biển `20.000 năm trước` (`25.3–30.1s` trong `01_bien_dong`) và thả mô hình tàu/mỏ neo tỷ lệ vào đúng lòng cảng (`27.0s` trong `03_vinh_cam_ranh`) rất hợp để nâng cấp mặt cắt địa chất ĐBSCL, vũng quay tàu `-15,5 m`, hay vùng trũng đường băng Long Thành.
   - Đổi mới bộ phụ đề Shorts `9:16`: vị trí **`y ~ 68–73%`** (cao hơn đáy UI TikTok/Reels/Shorts), cỡ `~3.2–3.5%`, giữ nguyên quy chuẩn **đứng yên `0 px` layout shift** từ `KeywordCaptionBar.tsx` nhưng dùng **tô vàng từng từ đang phát âm** (`#FACC15`) giống `01_bien_dong` và `02_viet_nam_chu_s` (với Lạch Huyện/Long Thành WPM `~240` giống `03_vinh_cam_ranh`, chữ to viền đậm sẽ dễ đọc hơn hẳn chữ ALL-CAPS nhỏ `2.5%` của `03_vinh_cam_ranh`).
5. **Mật độ SFX gắn trực tiếp vào từng lần pop nhãn/con số (`17–22` tiếng/phút):** Đặt tiếng `ding` / `pop` ngắn ở mức `-14 dB` đến `-11 dB` mỗi khi số liệu (`165.000 DWT`, `5.000 ha`, `40 km`, `-18 m`) bật sáng trên bản đồ giúp giữ nhịp chú ý khi người xem lướt tốc độ nhanh.
6. **Chốt CTA bình luận cá nhân hóa (`02_viet_nam_chu_s`):** Kết thúc Shorts bằng 1 câu hỏi gắn trực tiếp địa phương người xem (*"Tỉnh bạn đi sân bay nào nhiều nhất?"* / *"Bạn nghĩ tuyến cao tốc nào ở miền Tây cần ưu tiên trước?"*) hiệu quả hơn lời kêu gọi *"Like & Subscribe"* chung chung kiểu `03_vinh_cam_ranh`.

---

## 4. Kế Hoạch Nâng Cấp Thực Chiến Cho OpenMontage (Shorts & Tập Dài Số 3)

### 4.1. Checklist nâng cấp ngay cho Shorts `9:16` (`45–58s`, trích từ Lạch Huyện & Long Thành)
- [ ] **Vùng an toàn dọc `9:16` (`1080×1920`):** Tiêu đề/pill đặt ở `y = 12%–22%`; vùng phụ đề `KeywordCaptionBar` căn giữa ở `y = 69%–73%` (`~3.3%` chiều cao khung, ~`62–68 px`), tối đa 1–2 dòng ngắn, đổi màu vàng `#FACC15` mượt không nhảy kích thước chữ (`0 px jitter`).
- [ ] **Hook `0.0–3.0s`:** Cất lời Vibi TTS ngay `0.00s` (tốc độ `220–240 WPM` khớp tốc độ đã đạt ở Tập 1 & 2, chuẩn hóa mix tổng `-14.2 LUFS` cho Shorts thay vì quá nhẹ, giữ nhạc nền kém thoại `~12–15 dB`). Kèm **thẻ câu hỏi lớn + chuyển động bản đồ (zoom quả cầu hoặc vệt tuyến phát sáng) trong 2,5 giây đầu**.
- [ ] **Mỗi `4–6 giây` có ít nhất 1 biến cố thị giác + âm thanh:** Đổi góc `bearing/pitch`, bật `GeoCaliperRule`, thả icon tàu/máy bay hoặc vùng tô địa chất/lấn biển kèm `ding`/`pop`/`whoosh`.
- [ ] **Khóa chủ quyền chuẩn:** Trên mọi khung rộng Biển Đông hiển thị rõ `QUẦN ĐẢO HOÀNG SA (VIỆT NAM)` và `QUẦN ĐẢO TRƯỜNG SA (VIỆT NAM)` (không kẻ hộp nét đứt nhân tạo).
- [ ] **Kết thúc `4s` cuối:** 1 câu hỏi mở gắn với trải nghiệm/tỉnh thành của khán giả để kéo bình luận tự nhiên.

### 4.2. Áp dụng cho Tập dài số 3 & Lưu ý riêng cho Chủ đề #14 (*Vịnh Cam Ranh & Vịnh Vân Phong*)
1. **Cho Tập dài số 3 (*Cao tốc Cần Thơ – Cà Mau* hoặc chủ đề hạ tầng tiếp theo):**
   - Giữ kiến trúc `Tactical3DStage` `16:9` + `CRS`/tọa độ OSM thật, bổ sung **thủ pháp xoay `bearing` camera ở đoạn mô tả nút thắt địa hình** và **hiệu ứng vùng phủ minh họa địa tầng** (học cơ chế vòng/lớp tô vùng `20.000 năm trước` của `01_bien_dong`, áp dụng bằng dữ liệu địa chất thực có nguồn).
2. **Riêng đối với Chủ đề #14 trong [22_GOI_Y_20_CHU_DE_XU_HUONG_TIM_KIEM_2026-11-17.md](./22_GOI_Y_20_CHU_DE_XU_HUONG_TIM_KIEM_2026-11-17.md) (*Vịnh Cam Ranh & Vịnh Vân Phong — Khánh Hòa*):**
   - `03_vinh_cam_ranh` đi theo hướng **địa chính trị quân sự 1935–2002**. Khi chúng ta triển khai Chủ đề #14, **tuyệt đối không trùng lặp kịch bản, góc quân sự giật gân hay tài nguyên hình ảnh** với video đó.
   - Đứng vững trên định vị kênh **Địa lý kinh tế & Hạ tầng dân dụng**: đối chiếu cặp đôi **Vịnh Cam Ranh** (đã có cảng quốc tế & sân bay) và **Vịnh Vân Phong** (tiềm năng nước sâu `-18 m` đến `-25 m` ít phù sa bồi lắng vs rào cản vách **Trường Sơn Nam** chia cắt hậu phương Tây Nguyên trước khi mở trục cao tốc Khánh Hòa – Buôn Ma Thuột), sử dụng hoàn toàn số liệu quy hoạch Khánh Hòa / Hàng hải Việt Nam và bản đồ vệ tinh `EOxCloudless 2024` tự dựng.
