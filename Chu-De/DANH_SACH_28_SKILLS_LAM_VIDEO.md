# Tổng Hợp 28 Skills Tốt Nhất Để Sản Xuất Video YouTube & Phối Hợp Theo Từng Chủ Đề

Ngày cập nhật: 26/10/2026  
Tài liệu này liệt kê **toàn bộ 28 Skills / Modules tốt nhất** (từ hệ sinh thái GitHub Open-Source, Agent Skills, Remotion/Motion Canvas, FFmpeg/CapCut Pipeline và Antigravity Built-in) được chia theo **6 tầng sản xuất video**, kèm công thức phối hợp Skill tối ưu cho từng chủ đề trong [`NGHIEN_CUU_CHU_DE.md`](./NGHIEN_CUU_CHU_DE.md).

---

## Phần 1: Danh Sách Đầy Đủ 28 Skills Làm Video (Chia Theo 6 Khâu Sản Xuất)

### Tầng 1: Nghiên Cứu Ngách, Chấm Điểm Ý Tưởng & Định Hình Giọng Văn (4 Skills)
| STT | Tên Skill | Nguồn / Repo | Công dụng cốt lõi |
|---:|---|---|---|
| **1** | **`virality-engine`** | `Jakeschincariol/youtube-agent-skill` | Chấm điểm độ thu hút (Outlier Score) và khoảng trống nội dung của ý tưởng trước khi sản xuất. |
| **2** | **`niche-researcher`** | `social-media-skills/skills` | Phân tích bộ từ khóa ngách (lượt tìm kiếm cao, cạnh tranh thấp < 40, xu hướng tăng trưởng dương). |
| **3** | **`voice-builder` & `voice-profile`** | `social-media-skills` + `social-content-engine` | Giải phẫu kịch bản kênh mẫu (như `@betterversionvn`) thành hồ sơ giọng văn `voice.md`, khử hoàn toàn văn phong sáo rỗng của AI. |
| **4** | **`social-content-engine`** | `anthropics/knowledge-work-plugins` | Quản lý lịch xuất bản cuốn chiếu (`calendar.md`), đảm bảo tính nhất quán giữa các tập trong chuỗi Series. |

---

### Tầng 2: Viết Kịch Bản, Tối Ưu Hook 30s Đầu & Giữ Chân Người Xem (5 Skills)
| STT | Tên Skill | Nguồn / Repo | Công dụng cốt lõi |
|---:|---|---|---|
| **5** | **`scripting-engine`** | `Jakeschincariol/youtube-agent-skill` | Viết kịch bản áp dụng **21 công thức mở đầu (21 Hook Formulas)** để khóa sự chú ý trong 30 giây đầu tiên. |
| **6** | **`retention-reader`** | `Jakeschincariol/youtube-agent-skill` | Đọc rà soát kịch bản để cắt bỏ câu chữ lan man và tự động chèn **Pattern Interrupt** (điểm bẻ lái thị giác/thính giác) mỗi 15–25 giây. |
| **7** | **`edl-generator`** *(Edit Decision List)* | `Jakeschincariol/youtube-agent-skill` | Chuyển kịch bản chữ thành bảng phân cảnh kỹ thuật theo từng mốc giây: `[Giây] + [Cảnh B-Roll/3D] + [Chữ trên màn hình] + [Hiệu ứng SFX]`. |
| **8** | **`shorts-cutter`** | `Jakeschincariol/youtube-agent-skill` | Tự động trích xuất 2–3 kịch bản YouTube Shorts (45–60 giây) đắt giá nhất từ mỗi tập video dài (10–30 phút). |
| **9** | **`self-media-compliance-review`** | `JuneYaooo/awesome-ai-media-skills` | Kiểm duyệt từ khóa nhạy cảm (y tế, bạo lực, chính trị, bản quyền sách) với báo cáo 5 cấp độ rủi ro để tránh bị "vàng tiền" YouTube. |

---

### Tầng 3: Đạo Diễn Hình Ảnh, Phân Cảnh Điện Ảnh & Thu Thập Tư Liệu (5 Skills)
| STT | Tên Skill | Nguồn / Repo | Công dụng cốt lõi |
|---:|---|---|---|
| **10** | **`ai-storyboard-director-v5.2`** | `62656456/ai-storyboard-director-v5.2` | Thiết kế chuỗi cú máy điện ảnh (*Shot Chains*): góc máy (Close-up, Wide, POV, Dutch Angle), tiêu cự ống kính và ánh sáng. |
| **11** | **`dramai-film-skills`** | `62656456/ai-film-skills` | Đạo diễn nhịp dựng phim (Montage Pacing), bảng màu cảm xúc (Color Grading LUTs: Teal & Orange, Vintage Warm, Moody Blue). |
| **12** | **`visual-skills`** | `smixs/visual-skills` | Viết Prompt hình ảnh/video điện ảnh chuẩn xác, giữ đồng nhất nhân vật và bối cảnh xuyên suốt tập phim. |
| **13** | **`image-generator`** *(Subagent)* | Tích hợp sẵn trong Antigravity | Tự động sinh ảnh minh họa điện ảnh 16:9 độ phân giải cao (Cinematic Stills, Concept Art, Collage Assets) ngay trong dự án. |
| **14** | **`emotional-broll-fetcher`** | `MoneyPrinterTurbo` + `_tools/fetch_emotional_clips.py` | Tự động tìm và tải các đoạn video cảnh thật HD miễn phí bản quyền khớp với cảm xúc từng câu thoại. |

---

### Tầng 4: Đồ Họa Chuyển Động (Motion Graphics), 3D & Hoạt Hình Bằng Code (6 Skills)
| STT | Tên Skill | Nguồn / Repo | Công dụng cốt lõi |
|---:|---|---|---|
| **15** | **`remotion-3d-spatial-glass`** | `remotion-dev/skills` + `claude-remotion-skill` | Dựng giao diện kính mờ **Apple VisionOS 3D** (`perspective`, `backdrop-filter: blur`), thẻ thông tin nghiêng 3 chiều và thanh tiến trình chương trên nền video cảnh thật. |
| **16** | **`motion-canvas-kurzgesagt`** | `VideoZero/skills` + `motion-canvas` | Đồ họa Vector SVG chuyển động đàn hồi (*Spring Physics*) kiểu kênh **Kurzgesagt / 3Blue1Brown**: đồng hồ năng lượng, thanh pin nội lực, biểu đồ trực quan. |
| **17** | **`opus-webgl-3d-neural-cosmos`** | `yihui-dev/awesome-opus5-5-videos` | Mô phỏng mạng lưới thần kinh não bộ 3D xoay trong không gian, xung điện synap phát sáng và hạt năng lượng bằng HTML5 Canvas/WebGL. |
| **18** | **`obsidian-second-brain-graph`** | `yihui-dev/awesome-opus5-5-videos` | Sơ đồ nút tư duy (Knowledge Graph) tự động nối dây phát sáng kiểu **Obsidian / Notion**, cực hợp cho video đúc kết sách & giải mã tâm lý. |
| **19** | **`infinite-investigation-board` & `vox-collage`** | Phong cách *Vox / Johnny Harris / MagnatesMedia* | Bảng điều tra phóng đại camera (*Infinite Canvas Zoom*) nối dây đỏ giữa các manh mối + Cắt dán báo cổ điển (*Halftone Paper Cutout*). |
| **20** | **`generative-ui` (Headless Chrome CDP)** | Tích hợp sẵn trong Antigravity | Kết xuất trực tiếp HTML5/CSS3 3D/SVG/Canvas qua trình duyệt Google Chrome thật ở 30–60 FPS để chữ tiếng Việt và hiệu ứng sáng 3D sắc nét tuyệt đối. |

---

### Tầng 5: Biên Tập Dựng Phim, Kỹ Xảo FFmpeg & Tự Động Hóa CapCut (5 Skills)
| STT | Tên Skill | Nguồn / Repo | Công dụng cốt lõi |
|---:|---|---|---|
| **21** | **`video-editor-ai-agent`** | `joshcirre/editing-videos` + `Don-Uwe/video-editor-ai-agent` | Tư duy biên tập viên chuyên nghiệp: nhịp cắt cảnh nhanh 1.5–2.5s, kỹ thuật J-cut/L-cut, rung máy nhẹ (*Handheld Camera Shake*) và điểm rơi âm thanh. |
| **22** | **`ffmpeg-xfade-libass-pipeline`** | `JuneYaooo/awesome-ai-media-skills` | Dựng đa luồng bằng FFmpeg với 40+ hiệu ứng chuyển cảnh (`circleopen`, `diagtl`, `hlslice`, `squeezeh`, `zoomin`) và phụ đề Vector `.ass` (`libass`). |
| **23** | **`pycapcut-draft-generator`** | `GuanYixuan/pyCapCut` + `VectCutAPI` | Xuất thẳng thư mục Project nháp (`draft_content.json`) cho phần mềm **CapCut PC**, gắn sẵn hiệu ứng chuyển cảnh, bộ lọc màu và chữ động để mở bằng CapCut chỉnh sửa ngay. |
| **24** | **`split-screen-retention-hud`** | `youtube-agent-skill` + `render_pro_film_edits.py` | Dựng đa khung hình đối lập (2–3 khung song song, *Diagonal Wipe*), khung chat tin nhắn & Radar phân tích tâm lý. |
| **25** | **`title-thumbnail-linter`** | `Jakeschincariol/youtube-agent-skill` | Chấm điểm độ ăn khớp giữa Tiêu đề và Chữ trên Thumbnail để tối đa hóa tỷ lệ nhấp (CTR), tránh lỗi lặp từ. |

---

### Tầng 6: Giọng Đọc AI (TTS) & Thiết Kế Âm Thanh Điện Ảnh (3 Skills)
| STT | Tên Skill | Nguồn / Repo | Công dụng cốt lõi |
|---:|---|---|---|
| **26** | **`vibi-tts-engine`** | `_tools/vibi_tts.py` (`https://api.vibi.pro`) | Tạo giọng đọc tiếng Việt tự nhiên, giàu cảm xúc kèm file phụ đề `.srt` chuẩn từng mili-giây. |
| **27** | **`cinematic-sfx-synthesizer`** | Tích hợp trong bộ Render VFX | Tự động tạo & chèn đúng mốc chuyển cảnh các hiệu ứng âm thanh điện ảnh: *Sub-bass Braam, Whoosh, Riser căng thẳng, Tiếng mưa rơi, Đồng hồ tích tắc*. |
| **28** | **`ambient-binaural-generator`** | Tích hợp trong bộ Render Audio | Tự động tổng hợp nhạc nền tần số chữa lành (*432Hz/528Hz Healing Pad, Lofi ấm áp, Drone đêm khuya*) sạch bản quyền 100%. |

*(Ngoài ra trên **Agent Marketplace** còn có Plugin chính thức **Gemini API** `antigravity-plugins-official/plugin/gemini-api` hỗ trợ mở rộng các tác vụ sinh văn bản, hình ảnh, video và âm thanh đa phương thức).*

---

## Phần 2: Phối Hợp Bộ Skills Tốt Nhất Cho Từng Chủ Đề Trong `NGHIEN_CUU_CHU_DE.md`

Dựa trên số liệu vidIQ/NexLev trong [`NGHIEN_CUU_CHU_DE.md`](./NGHIEN_CUU_CHU_DE.md) và việc **loại bỏ hoàn toàn hình người que đơn điệu**, dưới đây là **Công thức phối hợp Skills tối ưu nhất** cho từng chủ đề:

### 1. Chủ đề 1: Tâm Lý Học Hành Vi & Đọc Vị Con Người (`Tam-Ly-Hoc-Tu-Duy/`)
- **Đặc điểm chủ đề:** Nhịp nhanh (8–12 phút), phân tích ngôn ngữ cơ thể, tâm lý đàn ông/phụ nữ, thao túng tâm lý, đọc vị hành vi.
- **Tổ hợp 7 Skills mạnh nhất:**
  1. `scripting-engine` (Hook câu hỏi đánh trúng tâm lý tò mò 30s đầu)
  2. `edl-generator` + `retention-reader` (Đổi cảnh/hiệu ứng mỗi 2–3 giây)
  3. `emotional-broll-fetcher` + `ffmpeg-xfade-libass-pipeline` (Cảnh thật cảm xúc con người chuyển cảnh nhanh)
  4. `remotion-3d-spatial-glass` + `split-screen-retention-hud` (Phủ kính mờ 3D Apple VisionOS + Radar phân tích hành vi + So sánh 2 nửa màn hình)
  5. `vibi-tts-engine` + `cinematic-sfx-synthesizer` (Giọng đọc sắc sảo + tiếng *Whoosh / Heartbeat / Sub-bass*)
- **Video mẫu áp dụng bộ Skill này:** [`Chu-De/Tam-Ly-Hoc-Tu-Duy/demo_tap1_doc_vi_hanh_vi.mp4`](./Chu-De/Tam-Ly-Hoc-Tu-Duy/demo_tap1_doc_vi_hanh_vi.mp4)

### 2. Chủ đề 2: Tâm Lý Chữa Lành & Đúc Kết Sách — Phong cách `@betterversionvn` (`Better-Version-Tam-Ly/`)
- **Đặc điểm chủ đề:** Nhịp sâu lắng (15–30 phút), giải mã nội tâm, thoát khỏi *overthinking*, quản trị năng lượng, đúc kết sách tâm lý (Adler, Jung, Chánh niệm).
- **Tổ hợp 7 Skills mạnh nhất:**
  1. `voice-builder` (Giọng văn chữa lành, sâu sắc chuẩn `@betterversionvn`)
  2. `motion-canvas-kurzgesagt` (Đồ họa Vector SVG đàn hồi: đồng hồ năng lượng, thanh pin nội lực, mũi tên thứ hai)
  3. `obsidian-second-brain-graph` + `opus-webgl-3d-neural-cosmos` (Sơ đồ nút tư duy phát sáng + Mạng lưới thần kinh 3D)
  4. `dramai-film-skills` (Cảnh thật điện ảnh chiều mưa/rừng cây kết hợp thẻ kính mờ 3D)
  5. `vibi-tts-engine` + `ambient-binaural-generator` (Giọng đọc trầm tĩnh + Nhạc nền tần số chữa lành 432Hz)
- **Video mẫu áp dụng bộ Skill này:** [`Chu-De/Better-Version-Tam-Ly/demo_tap1_chua_lanh_overthinking.mp4`](./Chu-De/Better-Version-Tam-Ly/demo_tap1_chua_lanh_overthinking.mp4)

### 3. Chủ đề 3: Kể Chuyện Đêm Khuya — Truyện Audio Làng Quê & Nhân Sinh (`Ke-Chuyen-Dem-Khuya/`)
- **Đặc điểm chủ đề:** Video dài (20–40 phút), lượt tìm cực lớn (`truyện audio` 1.066.700/tháng, `truyện làng quê` +81%), khán giả vừa nhìn màn hình ấm áp vừa nghe trước khi ngủ.
- **Tổ hợp 6 Skills mạnh nhất:**
  1. `voice-profile` (Văn phong kể chuyện văn học Việt Nam mộc mạc, giàu hình ảnh quê hương, 100% tự sáng tác)
  2. `ai-storyboard-director-v5.2` + `image-generator` (Tranh điện ảnh hoài niệm: mái ngói chiều mưa, ánh đèn dầu, bến sông quê)
  3. `generative-ui` (Hiệu ứng hạt mưa rơi đa lớp, ánh đèn vàng đung đưa, sóng âm thanh dịu nhẹ và chữ thư pháp hiện từng câu)
  4. `vibi-tts-engine` (Tốc độ đọc chậm rãi `0.95x–1.0x`) + Tiếng mưa đêm rả rích & nhạc đàn tranh/piano nhẹ.
- **Video mẫu áp dụng bộ Skill này:** [`Chu-De/Ke-Chuyen-Dem-Khuya/demo_tap1_ke_chuyen_dem_khuya.mp4`](./Chu-De/Ke-Chuyen-Dem-Khuya/demo_tap1_ke_chuyen_dem_khuya.mp4)

### 4. Chủ đề 4: Bí Ẩn Lịch Sử & Kể Chuyện Lịch Sử (`bí ẩn lịch sử` 131.087/tháng, +114%)
- **Tổ hợp Skills mạnh nhất:**
  - `infinite-investigation-board` (Bảng điều tra phóng đại camera nối dây đỏ giữa các nhân vật/triều đại)
  - `vox-collage` (Cắt dán tư liệu cổ điển kiểu kênh *Vox / Johnny Harris* kết hợp bản đồ cổ và trang sách lật 3D)
  - `cinematic-sfx-synthesizer` (Âm thanh trống trận / tiếng lật trang giấy cổ / Sub-bass).

### 5. Chủ đề 5: Thế Giới Động Vật Hoang Dã (`động vật kỳ lạ` +462%, `phim tài liệu động vật` +160%)
- **Tổ hợp Skills mạnh nhất:**
  - `emotional-broll-fetcher` + `dramai-film-skills` (Dựng phim tài liệu 4K phong cách *Netflix / National Geographic*)
  - `remotion-3d-spatial-glass` (Thẻ thông số sinh tồn, bản đồ phân bố địa lý, Radar chỉ số săn mồi 3D phủ trên cảnh thật)
  - `self-media-compliance-review` (Đảm bảo sử dụng nguồn footage Creative Commons/Public Domain hợp lệ).
