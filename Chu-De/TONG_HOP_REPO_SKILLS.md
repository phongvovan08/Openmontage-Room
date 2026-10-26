# Tổng hợp các Repository AI Video & YouTube Agent Skills

Ngày cập nhật: 25/10/2026  
Mục đích: Lưu trữ thông tin, chức năng cốt lõi và cách ứng dụng các bộ công cụ/skills mã nguồn mở vào quy trình sản xuất kênh YouTube trong dự án `video-v2`.

---

## 1. `yihui-dev/awesome-opus5-5-videos` — Tạo Video & Hoạt hình bằng Code
- **Link GitHub:** https://github.com/yihui-dev/awesome-opus5-5-videos
- **Chức năng chính:**
  - Kho tổng hợp (curated list) các video viral, đồ họa chuyển động (Motion Graphics), hoạt hình giải thích (Explainer Animations), sơ đồ tư duy (Mindmap) và cảnh 3D được tạo hoàn toàn bằng cách yêu cầu AI viết code (HTML5 Canvas, SVG, CSS/JS, Three.js).
  - Lưu trữ **Prompt gốc** của người tạo và liên kết xem bản chạy thử trực tiếp (*Live Remakes*).
- **Danh mục nổi bật:**
  - *Kinetic Typography:* Chữ chuyển động theo nhịp giọng đọc.
  - *Explainer / Data Flows / Mindmap:* Sơ đồ tư duy, biểu đồ, vòng lặp hành vi tự vẽ nhánh theo từng giây.
  - *2D Vector / Stick Figure:* Nhân vật người que/vector cử động mượt 30–60 FPS.
- **Ứng dụng vào `video-v2`:**
  - Dùng code Python (Pillow + FFmpeg) hoặc HTML5 Canvas để tự động kết xuất video hoạt hình Người que + Sơ đồ tư duy (như bản mẫu trong [`Better-Version-Tam-Ly/demo-45s/`](./Better-Version-Tam-Ly/demo-45s/render_demo_mp4.py)), hiển thị tiếng Việt sắc nét 100% mà không tốn công tạo từng ảnh tĩnh thủ công.

---

## 2. `Jakeschincariol/youtube-agent-skill` — Bộ 11 Skills vận hành kênh YouTube
- **Link GitHub:** https://github.com/Jakeschincariol/youtube-agent-skill
- **Chức năng chính:**
  - Bộ 11 kỹ năng (`SKILL.md`) chuyên biệt cho việc lập kế hoạch, viết kịch bản, tối ưu CTR và giữ chân khán giả trên YouTube.
- **Các mô-đun quan trọng nhất:**
  1. **Scripting Engine:** Viết kịch bản dựa trên **21 công thức mở đầu (21 Hook Formulas)** và tự động chấm điểm đoạn mở đầu 30 giây đầu tiên.
  2. **Title & Thumbnail Linter:** Chấm điểm độ ăn khớp giữa **Tiêu đề** và **Chữ trên Thumbnail** để tối đa hóa tỷ lệ nhấp (CTR), tránh lỗi lặp chữ.
  3. **Voice Profile (`templates/voice.md`):** Định hình giọng văn riêng của kênh (nhịp câu, cách xưng hô, danh sách từ sáo rỗng cấm dùng).
  4. **Retention Reader:** Rà soát kịch bản để phát hiện những đoạn dài dòng dễ làm người xem thoát video.
  5. **EDL Generator (Edit Decision List):** Chuyển kịch bản thành bảng phân cảnh chi tiết theo mốc thời gian (giây nào hiện cảnh gì, hiệu ứng gì).
  6. **Shorts Cutter:** Tự động trích xuất các đoạn đắt giá nhất từ kịch bản video dài (10–30 phút) thành kịch bản YouTube Shorts (45–60 giây).
  7. **Virality Engine:** Đánh giá độ thu hút của ý tưởng trước khi bắt tay vào sản xuất.
- **Cách cài đặt tham khảo:**
  ```bash
  git clone https://github.com/Jakeschincariol/youtube-agent-skill.git
  ```

---

## 3. `JuneYaooo/awesome-ai-media-skills` — Thư viện Skills cho AI Video & Xây kênh
- **Link GitHub:** https://github.com/JuneYaooo/awesome-ai-media-skills/blob/main/README.md
- **Chức năng chính:**
  - Danh sách tổng hợp các Agent Skills, MCP Servers và công cụ tự động hóa phục vụ sáng tạo nội dung đa phương tiện và vận hành kênh ẩn danh (Faceless/Self-media channels).
- **Các nhóm công cụ nổi bật:**
  - **Sản xuất & Dựng video:** Các skill kết nối với FFmpeg, tự động tạo bản nháp CapCut/Jianying, tạo giọng đọc TTS và đồng bộ phụ đề `.srt`.
  - **Kiểm duyệt nội dung trước khi đăng (`self-media-compliance-review`):** Tự động kiểm tra kịch bản, tiêu đề, hình ảnh xem có vi phạm chính sách nền tảng hoặc chứa từ khóa nhạy cảm dễ bị hạn chế quảng cáo (vàng tiền) hay không (xuất báo cáo 5 cấp độ rủi ro).
  - **Thiết kế Visual & Infographic:** Biến văn bản/kịch bản thành thẻ thông tin, slide hoặc sơ đồ trực quan.

---

## 4. `anthropics/knowledge-work-plugins` (`social-content-engine`) — Quản lý Lịch & Nội dung Tự động
- **Link GitHub:** https://github.com/anthropics/knowledge-work-plugins/blob/main/small-business/skills/social-content-engine/SKILL.md
- **Chức năng chính:**
  - Skill chính chủ từ Anthropic đóng vai trò như một **Quản lý nội dung (Content Manager)** vận hành liên tục thay vì chỉ viết bài rời rạc.
- **Cơ chế hoạt động:**
  - **Lịch nội dung cuốn chiếu (`reference/calendar.md`):** Lên kế hoạch chủ đề theo tuần/tháng để kênh luôn có sẵn danh sách tập tiếp theo.
  - **Bắt buộc tuân thủ `shared/voice-profile.md`:** Luôn đọc hồ sơ giọng văn của thương hiệu/kênh trước khi viết bất kỳ nội dung nào để tránh giọng văn máy móc của AI.
  - **Human-in-the-loop:** Lên bản nháp hoàn chỉnh và chờ người dùng duyệt trước khi xuất bản.

---

## 5. `social-media-skills/skills` — Bộ Skills Nghiên cứu Ngách & Xây dựng Giọng văn
- **Link GitHub:** https://github.com/social-media-skills/skills
- **Chức năng chính:**
  - Bộ kỹ năng dạng mô-đun (`SKILL.md`) chuẩn hóa cho nghiên cứu ngách (Niche Research), phân tích kênh đối thủ, viết kịch bản ngắn (Shorts/Reels) và tái sử dụng nội dung đa nền tảng.
- **Điểm mạnh cốt lõi:**
  - **Mô-đun `voice-builder`:** Cho phép nạp kịch bản mẫu (ví dụ từ các kênh lớn như `@betterversionvn`) để AI phân tích cấu trúc câu, cách dẫn dắt, từ vựng đặc trưng và xuất ra file `voice.md`.
  - **Quy tắc chống văn phong AI (Anti-AI-cliché rules):** Loại bỏ các câu mở đầu/kết thúc rập khuôn giúp kịch bản tự nhiên, giàu cảm xúc hơn.

---

## Bảng tổng hợp ứng dụng vào dự án `video-v2`

| Khâu sản xuất | Áp dụng từ Repo nào | Giải pháp thực tế cho 3 kênh trong `video-v2` |
|---|---|---|
| **1. Định hình giọng văn kênh** | `social-content-engine` + `social-media-skills` | Tạo file `voice-profile.md` riêng cho từng kênh ([`Tam-Ly-Hoc-Tu-Duy`](./Tam-Ly-Hoc-Tu-Duy/README.md), [`Better-Version-Tam-Ly`](./Better-Version-Tam-Ly/README.md), [`Ke-Chuyen-Dem-Khuya`](./Ke-Chuyen-Dem-Khuya/README.md)). |
| **2. Viết Hook 30s đầu & Kịch bản** | `youtube-agent-skill` | Áp dụng 21 công thức Hook + dùng *Retention Reader* lọc bỏ đoạn lan man trước khi tạo TTS. |
| **3. Kiểm duyệt an toàn kiếm tiền** | `awesome-ai-media-skills` | Rà soát từ khóa nhạy cảm (y tế, bạo lực, bản quyền sách) để tránh vàng tiền YouTube. |
| **4. Tạo hình ảnh & Video MP4** | `awesome-opus5-5-videos` | Dùng code tự động vẽ hoạt hình Người que + Mindmap + Phụ đề khớp với file âm thanh Vibi TTS. |
| **5. Tối ưu Tiêu đề, Thumbnail & Shorts** | `youtube-agent-skill` | Dùng *Title & Thumbnail Linter* kiểm tra độ thu hút (CTR) và *Shorts Cutter* tách 2–3 video ngắn từ mỗi tập dài. |

---

## Phần 2: Các Repo "Đạo Diễn Video AI", Remotion Motion Graphics & Tự Động Dựng CapCut (Cập nhật bổ sung)

### Nhóm A: Skills Đạo Diễn Hình Ảnh & Phân Cảnh Điện Ảnh (AI Video Director & Storyboard)
1. **`BayramAnnakov/remotion-video-director`**
   - **Link:** https://github.com/BayramAnnakov/remotion-video-director
   - **Công dụng:** Skill đóng vai **Đạo diễn Video**, dẫn dắt từ ý tưởng kịch bản → thiết kế phân cảnh (Scenario Design) → chọn nhịp điệu chuyển động → xuất ra video `.mp4` bằng Remotion.
2. **`62656456/ai-storyboard-director-v5.2`** & **`62656456/ai-film-skills` (Dramai)**
   - **Link:** https://github.com/62656456/ai-storyboard-director-v5.2 | https://github.com/62656456/ai-film-skills
   - **Công dụng:** Hệ thống 21 mô-đun tiền kỳ của Đạo diễn: biến kịch bản chữ thành **chuỗi cú máy điện ảnh (Shot Chains)** với đầy đủ thông số góc máy (Close-up, Wide, POV, Dutch angle), ánh sáng, tiêu cự ống kính và neo giữ đồng nhất nhân vật/bối cảnh.
3. **`smixs/visual-skills`**
   - **Link:** https://github.com/smixs/visual-skills
   - **Công dụng:** Hoạt động như một "Đoàn làm phim ảo" — thiết kế nhịp dựng phim (Montage, Pacing, Blocking) và viết prompt chuẩn xác cho các mô hình tạo ảnh/video (Veo, Kling, Seedance, GPT Image).
4. **`joshcirre/editing-videos`** & **`Don-Uwe/video-editor-ai-agent`**
   - **Link:** https://github.com/joshcirre/editing-videos | https://github.com/Don-Uwe/video-editor-ai-agent
   - **Công dụng:** Bộ tư duy của Biên tập viên dựng phim (Editor's Judgment): quyết định nhịp cắt cảnh, thời điểm chèn B-roll, cắt khoảng lặng và kiểm duyệt chất lượng bản dựng.

### Nhóm B: Engine Đồ Họa Chuyển Động Đỉnh Cao Bằng React/TypeScript (Đẹp như After Effects)
5. **`remotion-dev/skills`** (Official) & **`haidrrrry/claude-remotion-skill`**
   - **Link:** https://github.com/remotion-dev/skills | https://github.com/haidrrrry/claude-remotion-skill
   - **Công dụng:** Dạy AI dựng video bằng **Remotion (React + Tailwind CSS + Spring Physics)** thay vì vẽ bằng Python PIL. Nhờ render bằng trình duyệt Chromium thật nên có đầy đủ hiệu ứng CSS3/WebGL, mờ kính (backdrop-blur), chuyển động vật lý lò xo (Spring), 3D transform và Kinetic Typography mượt như After Effects.
6. **`midrender/revideo`** & **`VideoZero/skills` (Motion Canvas)**
   - **Link:** https://github.com/midrender/revideo | https://github.com/VideoZero/skills
   - **Công dụng:** Framework lập trình video giải thích (Explainer Video kiểu *Kurzgesagt* / *3Blue1Brown*) và đồng bộ phụ đề/음 thanh tự động.

### Nhóm C: Tự Động Sinh Project CapCut PC Có Sẵn Hiệu Ứng Thật (`pyCapCut`)
7. **`GuanYixuan/pyCapCut`** & **`sun-guannan/VectCutAPI`**
   - **Link:** https://github.com/GuanYixuan/pyCapCut | https://github.com/sun-guannan/VectCutAPI
   - **Công dụng:** Thư viện Python tự động tạo thẳng **thư mục Project nháp của phần mềm CapCut trên máy tính (`draft_content.json`)**!
   - Tự động đặt từng clip/ảnh vào timeline, ghép giọng đọc TTS, và **gắn trực tiếp các Hiệu ứng Chuyển cảnh (Transitions), Hiệu ứng Video (Effects), Bộ lọc màu (Filters) và Hiệu ứng Chữ (Text Animations) có sẵn của CapCut**. Mở CapCut lên là bấm Export ngay.

### Nhóm D: Dây Chuyền Tạo Video Không Lộ Mặt Tự Động (Faceless Video Pipelines)
8. **`harry0703/MoneyPrinterTurbo`** & **`RayVentura/ShortGPT`**
   - **Link:** https://github.com/harry0703/MoneyPrinterTurbo | https://github.com/RayVentura/ShortGPT
   - **Công dụng:** Tự động hóa từ kịch bản → tách từ khóa từng câu → tải video B-roll từ Pexels/Pixabay → lồng tiếng TTS & phụ đề.
9. **`zhuyansen/awesome-claude-video-skills`**
   - **Link:** https://github.com/zhuyansen/awesome-claude-video-skills
   - **Công dụng:** Danh mục tổng hợp các Claude Skills chuyên về dựng phim, Motion Design và xử lý đa phương tiện.


