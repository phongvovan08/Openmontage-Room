# So Sánh Chi Tiết: `calesthio/openmontage` vs. `krillinai/OpenCreator`

Tài liệu này phân tích sự khác biệt toàn diện giữa hai hệ thống sản xuất nội dung/video bằng AI đang có trên máy của bạn:
- **OpenMontage** (`https://github.com/calesthio/openmontage` — thư mục `C:\Users\ACER\Desktop\Openmontage-Room`)
- **OpenCreator** (`https://github.com/krillinai/OpenCreator` — thư mục `C:\Users\ACER\Desktop\OpenCreator-Phong`)

---

## 1. Khác Biệt Cốt Lõi Về Triết Lý Thiết Kế (Core Philosophy)

| Tiêu chí | `calesthio/openmontage` (OpenMontage) | `krillinai/OpenCreator` (OpenCreator) |
| --- | --- | --- |
| **Định vị sản phẩm** | **Instruction-Driven Agentic Video Production System** — Biến chính trợ lý lập trình AI (Claude Code, Cursor, Antigravity, Windsurf, Codex) thành một hãng phim/đạo diễn. | **All-in-One AI Creator Studio App (Web + Desktop Electron)** — Ứng dụng hoàn chỉnh có giao diện người dùng (GUI) cho nhà sáng tạo nội dung kèm AI Agent cộng tác. |
| **Cách người dùng tương tác** | **Chat-first (Trong IDE/Terminal) + Backlot Board**: Người dùng ra lệnh bằng ngôn ngữ tự nhiên trong IDE; Agent tự đọc YAML/Markdown skills và gọi Python tools. Giao diện `Backlot` đóng vai trò bảng theo dõi (Living Storyboard) & duyệt cổng (Approval Gate). | **GUI Workspace-first + Shared Collaboration Panel**: Người dùng thao tác trực tiếp trên giao diện Web/Desktop (chọn Template, bấm nút, sửa phụ đề trực quan trên timeline, chọn nhân vật) kết hợp chat với Agent ở khung bên phải (`CreatorCollaborationPanel`). |
| **Nơi chứa "Trí thông minh" (Orchestration)** | **Nằm trong Markdown Skills & YAML Pipelines** (`AGENT_GUIDE.md`, `pipeline_defs/*.yaml`, `skills/pipelines/*-director.md`). Code Python chỉ là công cụ (`tools/`) và lưu trạng thái (`lib/checkpoint.py`), không chứa logic quyết định sáng tạo. | **Nằm trong TypeScript Daemon & State Machine** (`apps/daemon/src/creator/`). Mỗi Template có workflow, state schema (Zod), stage runner, command dispatcher và SQLite persistence chặt chẽ. |
| **Giấy phép (License)** | `AGPLv3` | Mã nguồn đóng gói theo kiến trúc Monorepo (`@opencreator/*` + `vendor/KrillinAI`). |

---

## 2. So Sánh Kiến Trúc Kỹ Thuật (Tech Stack)

| Thành phần | `calesthio/openmontage` | `krillinai/OpenCreator` |
| --- | --- | --- |
| **Ngôn ngữ chính** | **Python 3.10+** (Tools, Registry, Checkpoints, Backlot server) + **TypeScript/React** (cho `remotion-composer/`). | **TypeScript (Node.js 24, Fastify, React, Electron)** + **Go** (`vendor/KrillinAI`) + **Python 3.13 nhúng** (cho spaCy NLP). |
| **Cơ sở dữ liệu / Lưu trữ** | Lưu trực tiếp thành các file JSON trên ổ cứng trong `projects/<project-id>/` (`project.json`, `artifacts/*.json`, `decision_log`, `checkpoint`). | **SQLite (`node:sqlite`)** quản lý Projects, Sessions, Creator Jobs, Revisions, Issues, kết hợp thư mục `creator/jobs/<jobId>/`. |
| **Render & Composition Engine** | Hỗ trợ **3 Runtimes song song** (cùng chế độ *Templated* và *Atelier* viết code thủ công):<br>1. **Remotion** (React/Spring physics)<br>2. **HyperFrames** (HTML/CSS/GSAP/SVG rigs/Three.js)<br>3. **FFmpeg** + **Blender** (3D Eevee/Cycles). | Tích hợp chuyên sâu:<br>1. **KrillinAI CLI + FFmpeg** (biên dịch ASS subtitle, ghép phụ đề ngang 16:9 & dọc 9:16)<br>2. **Remotion** (dựng hoạt hình 2D Stickman có sẵn thư viện nhân vật/bối cảnh). |
| **Giao diện trực quan** | **Backlot** (`python -m backlot open`) — Bảng theo dõi trực tiếp tiến độ từng stage, kịch bản, chi phí (Cost tracker), chấm điểm chất lượng và nút Replay Run. | **Ứng dụng Web/Desktop hoàn chỉnh** (`apps/web`, `apps/desktop`) — Có trình sửa phụ đề từng câu, xem trước font chữ trực tiếp, quản lý phiên bản (`resultSnapshots`), quản lý đa dự án. |

---

## 3. So Sánh Các Quy Trình / Mẫu Sản Xuất (Pipelines vs. Templates)

### 3.1. `calesthio/openmontage` — 11 Pipelines chuyên sâu về Sản Xuất Phim & Motion Graphics
OpenMontage chia quy trình thành 7 bước chuẩn (`research -> proposal -> script -> scene_plan -> assets -> edit -> compose`):
1. **`animated-explainer`**: Tạo video giải thích từ chủ đề bất kỳ (Infographic, biểu đồ `bar_chart`, `stat_card`, hoạt họa).
2. **`cinematic`**: Làm trailer điện ảnh, teaser, phim ngắn AI (kết hợp Veo, Kling, Seedance, nhạc nền, SFX).
3. **`animation` & `character-animation`**: Đồ họa chuyển động (Motion Graphics) và nhân vật hoạt hình gắn xương SVG (`SVG rigs`, pose libraries).
4. **`3d_world_generation` / `blender_world`**: Tạo thế giới 3D bằng Three.js hoặc Blender (địa hình, vật thể GLB/PBR, đường bay camera).
5. **`talking-head` & `avatar-spokesperson`**: Video người nói kết hợp B-roll hoặc Avatar nhép môi (Lip-sync).
6. **`screen-demo`**: Quay màn hình hoặc dựng `TerminalScene` giả lập thao tác dòng lệnh.
7. **`clip-factory` & `podcast-repurpose`**: Cắt nhiều clip ngắn từ video dài / podcast.
8. **`hybrid`**: Kết hợp video quay thật/stock footage miễn phí (Pexels, Pixabay) với đồ họa AI.
9. **`localization-dub`**: Dịch phụ đề và lồng tiếng đa ngôn ngữ.
10. **Phân tích Video Tham Chiếu (`video-reference-analyst`)**: Đưa 1 link YouTube/TikTok mẫu vào, hệ thống mổ xẻ nhịp cắt, cấu trúc hook, phong cách để đề xuất 2–3 concept tương tự.

### 3.2. `krillinai/OpenCreator` — 11 Templates chuyên sâu về Tái Sử Dụng Video, Dịch Thuật & Vận Hành Kênh
OpenCreator tập trung vào tốc độ xử lý thực chiến cho Creator cá nhân và đội ngũ vận hành kênh:
1. **`video-translation` (Thế mạnh số 1)**: Tải video từ YouTube/TikTok/Bilibili/Douyin → Whisper nhận diện giọng nói → Dịch thuật thông minh → Tách dòng bằng NLP → Lồng tiếng TTS → Xuất đồng thời video ngang `16:9` và dọc `9:16` có phụ đề song ngữ đẹp mắt.
2. **`auto-clip`**: Tự động chấm điểm và cắt các đoạn highlight từ video dài thành nhiều video ngắn độc lập.
3. **`stickman-video`**: Quy trình khép kín tạo video hoạt hình người que 2D giải thích kiến thức (Storyboard → Narration → Remotion Render → Phụ đề song ngữ).
4. **`video-download`**: Tải video đa nền tảng chất lượng gốc bằng `yt-dlp` tự cập nhật.
5. **`smart-dubbing`**: Chuyển văn bản thành giọng đọc AI nhanh chóng.
6. **`cover`**: Phân tích video YouTube hoặc ảnh mẫu để thiết kế Thumbnail A/B Testing (`16:9`, `9:16`, `1:1`).
7. **`image-generation` & `video-generation`**: Giao diện tạo ảnh (Gemini, OpenAI, Kling, Jimeng) và tạo video AI (Veo, Kling, Seedance).
8. **`short-video-script`, `xiaohongshu-post`, `wechat-article`**: Bộ công cụ viết kịch bản video ngắn, tạo bài đăng thẻ ảnh (carousel) và viết bài blog dài.

---

## 4. So Sánh Hệ Sinh Thái Nhà Cung Cấp AI (Providers & Cost Governance)

| Khía cạnh | `calesthio/openmontage` | `krillinai/OpenCreator` |
| --- | --- | --- |
| **Số lượng Providers** | **Rất rộng (>40 tools)**: FAL.ai, AtlasCloud, Kling, Volcengine Ark, HeyGen, Runway, Veo, Grok, ElevenLabs, Suno, Google Chirp3-HD, OpenAI, Piper-TTS (local miễn phí), Pexels/Pixabay/Unsplash (stock miễn phí), Blender/Three.js. | **Tập trung & Gọn nhẹ**: Tích hợp sâu với **Codex/ChatGPT Sign-in**, OpenCreator Gateway, OpenAI, Gemini/Veo, Kling, Seedance/Volcengine, MiniMax, Aliyun, Edge-TTS và Whisper local (`faster-whisper`, `whisper.cpp`). |
| **Quản lý Chi phí (Cost Tracking)** | Có **`cost_tracker.py` & báo giá trước khi chạy**: Luôn tính toán số tiền dự kiến (USD), chạy thử 1 mẫu (`sample mode`) cho người dùng duyệt trước khi chạy hàng loạt (`batch mode`). | Không tính bảng giá từng bước phức tạp; ưu tiên cấu hình 1 lần trong phần **Settings → AI Services** rồi bấm chạy xuyên suốt. |
| **Kiểm soát chất lượng (QA)** | Tự động chạy `reviewer.md` kiểm tra `ffprobe`, lấy mẫu khung hình, đo âm lượng LUFS, kiểm tra phụ đề và lưu nhật ký quyết định (`decision_log`). | Có bộ `validators/` (kiểm tra tính hợp lệ của file SRT, không chồng lấp thời gian, kiểm tra media stream bằng `ffprobe`) và hệ thống báo lỗi `OpenCreatorIssue`. |

---

## 5. Khi Nào Nên Dùng Project Nào?

### Chọn **`krillinai/OpenCreator`** khi bạn cần:
- **Dịch video, làm phụ đề song ngữ Anh–Việt (16:9 & 9:16)** từ video có sẵn (như các tập phim *Friends* hoặc video YouTube nước ngoài) với tốc độ nhanh, có giao diện chỉnh sửa từng câu phụ đề trực quan.
- **Cắt highlight tự động (`auto-clip`)**, tải video đa nền tảng, tạo Thumbnail nhanh hoặc làm hoạt hình **Stickman 2D** theo mẫu cố định.
- Muốn làm việc trên một **giao diện ứng dụng Web/Desktop rõ ràng**, có nút bấm từng bước thay vì phải điều khiển qua câu lệnh trong IDE.

### Chọn **`calesthio/openmontage`** khi bạn cần:
- **Sản xuất một video mới hoàn toàn từ con số 0 (From Scratch)** chỉ bằng lời mô tả hoặc từ một video mẫu (*"Hãy làm cho tôi một video 60 giây giống phong cách này"*).
- Làm các thể loại đòi hỏi **đạo diễn hình ảnh và đồ họa phức tạp**: Video giải thích có biểu đồ động (Chart/Infographic), Kinetic Typography bằng GSAP (`HyperFrames`), hoạt hình tùy biến riêng (`Atelier mode`), phim 3D (`Blender` / `Three.js`), hoặc ghép phim tài liệu từ kho video stock miễn phí (Pexels/Pixabay).
- Cần quy trình kiểm duyệt chặt chẽ từng khâu (Duyệt kịch bản → Duyệt phân cảnh → Duyệt chi phí → Duyệt hình mẫu trên bảng **Backlot** rồi mới xuất bản).

### Kết hợp cả hai trên máy của bạn:
Bạn hoàn toàn có thể **phối hợp cả hai**:
1. Dùng **OpenMontage** (`Openmontage-Room`) khi muốn AI đạo diễn, viết kịch bản sâu, tạo các phân cảnh Motion Graphics / Explainer / Cinematic mới từ ý tưởng (như dự án `Tam-Ly-Noi-Tam` của bạn).
2. Đưa video thành phẩm (hoặc các trích đoạn phim như `English-Channel`) sang **OpenCreator** (`OpenCreator-Phong`) để xử lý hậu kỳ phụ đề song ngữ Anh–Việt, tách bản dọc 9:16 Shorts/TikTok, hoặc cắt highlight hàng loạt.

