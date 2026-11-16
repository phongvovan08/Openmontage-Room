# Đánh giá chi tiết 19 repo từ `Github-tool.txt`

Cập nhật: 14/11/2026

## Cách đọc

Báo cáo này là phần đánh giá repo chi tiết, dùng cùng tài liệu điều hành [file 16](./16_PHAN_TICH_DOC_LAP_GITHUB_THI_TRUONG_NGACH_2026-11-14.md). Mỗi mục dựa trên README và trang repo thực tế đã đọc trong phiên này, không dựa vào mô tả bề mặt. File `Github-tool.txt` có 20 dòng với `sonlovinbot-team/Muse-animated-short-film` lặp, nên có 19 repo duy nhất.

Một số kết luận đảo ngược so với bảng cũ, và tôi ghi rõ lý do.

## Đảo ngược quan trọng nhất

Bảng cũ ghi `morluto/rea` và `JuneYaooo/rea-video` là công cụ phân tích video theo shot và lập kế hoạch remake. Đọc README thật cho thấy:

- `morluto/rea` là **reverse-engineering toolkit cho phần mềm**, không phải video. Nó phân tích binary, app JavaScript/Electron, APK, firmware, HAR. Đầu ra là pseudocode, strings, symbols, dependency graph. Nó **không** làm shot detection, không phân tích nhịp dựng, không phân tích caption, không xuất báo cáo video.
- `JuneYaooo/rea-video` mới là công cụ phân tích video thật: bóc từng shot, phân loại live footage / AI-generated / 3D-animation / code, xuất `VIDEO.md` phân tầng cùng báo cáo HTML/PDF kèm hướng dẫn remake. 121 commit, 7.9k sao, Apache-2.0, cần Python 3.10+ và ffmpeg, model là tuỳ chọn.

Hai repo này là hai dự án khác nhau, không phải bản đổi tên. Chỉ nên dùng `rea-video`.

## Đánh giá từng repo

### 1. bangtutorial/bang-motion

Agent skill dựng motion graphic bằng HTML/CSS/JS, dùng GSAP và Three.js. Đầu ra chính là một file `index.html` tự phát; MP4 là tuỳ chọn, cần Node.js, Puppeteer và ffmpeg.

Điểm đáng chú ý: không có model, provider, API key hay biến môi trường nào được nêu. Toàn bộ chuyển động viết bằng code.

Nhận định: MIT. Giao diện dễ xem trước nhanh, nhưng chất lượng phụ thuộc hoàn toàn vào khả năng viết GSAP của agent. OpenMontage đã có HyperFrames đúng lĩnh vực này, nên repo này không bổ sung năng lực mới.

### 2. kaomei/stickman-video-director

Có hai chế độ thật sự khác nhau:

- **Director Mode**: viết treatment, narration, storyboard, prompt từng cảnh, sound design. Người dùng tự sinh clip ở công cụ ngoài (Google Flow, Runway, Luma, Kling) rồi tự dựng.
- **Autopilot Mode**: lập kế hoạch cảnh minh họa, tạo hình ảnh và voiceover, thêm caption và SFX, dựng video và xuất file.

Điểm cần lưu ý về chi phí: README **không** nêu tên biến môi trường hay tên model cụ thể. Nó cần một AI coding agent (Codex hoặc Claude Code) và công cụ sinh ảnh/voice khả dụng. Director Mode cần thêm một trình tạo video bên ngoài và trình biên tập như CapCut hoặc Premiere.

MIT. Tự do.

Nhận định: skill này chính là nguồn gốc của `stickman-video-director` đã cài sẵn trong `.agents/skills/`. Không cài thêm. Giá trị nằm ở kịch bản Autopilot, nhưng phần dựng hình đã bị OpenMontage phủ.

### 3. CopilotKit/openbot

Workspace self-host cho AI coworkers: React/Vite, Hono API, PostgreSQL, container do supervisor quản lý, kết nối qua AG-UI. Agent dùng được browser, files, shell, MCP, có policy check và audit log.

Yêu cầu: Bun, Docker, PostgreSQL, CopilotKit Intelligence (giấy phép riêng), model API key. **Không có tích hợp YouTube nào.**

Nhận định: MIT cho phần template. Đây là hạ tầng agent tổng quát, không phải công cụ làm video. Bạn đã có một agent thành thạo hơn nhiều trong chính repo này.

### 4. filippocalippo/StykAnimate-App

Ứng dụng desktop và web để dựng hoạt hình stick figure. Mở được project Pivot (`.piv`) và Stick Nodes (`.stk`). Có IK, layer, folder, easing, motion path, onion skin, camera, particle, xuất MP4/WebM có nền trong suốt, GIF, APNG.

Quan trọng: **không cần API key, xử lý hoàn toàn cục bộ.** Khoảng 1.602 commit, 1.6k sao, 251 fork, 12 issue mở, 11 PR mở. GPL-3.0-or-later.

Nhận định: đây là **công cụ dựng tay theo keyframe**, không phải công cụ tự động hóa. Không có API nhúng được để gọi từ OpenMontage. Phù hợp khi bạn muốn kiểm soát từng khung hình của một nhân vật, nhưng tốn thời gian người làm hơn pipeline Remotion. Thư mục `Chu-De/Be-Mochi-Mam-Xanh/demo-stykanimate-cau-chuyen/` cho thấy đã thử nghiệm.

### 5. krillinai/OpenCreator

Desktop app (Electron) và web app dùng chung một React frontend và Runtime. Tính năng đánh dấu **Available**: Video Translation, Video Downloader, Thumbnail Generator, Image Generation, Article Writer, Xiaohongshu Posts, Short Video Script, Stick Figure Animation, Text to Speech, Video Generation. Đánh dấu **In development**: Auto Clips, Digital Avatar.

Đáng chú ý: repo đã có sẵn template **`stickman-video`** với giao diện chỉnh sửa trực quan cho câu thoại và nhân vật. Đây chính là nơi dùng `OpenCreator` rất hợp lý: cắt highlight, dịch, lồng tiếng, thumbnail.

Về key: Edge TTS **không cần key**. Whisper cục bộ qua faster-whisper, WhisperKit hoặc whisper.cpp. Nhưng các tác vụ model thật vẫn cần ChatGPT sign-in hoặc API key, và hosted image/video generation cần provider riêng.

Apache-2.0. Đã cài tại `C:\Users\ACER\Desktop\OpenCreator-Phong`.

Nhận định: đây là ứng viên hậu kỳ tốt nhất, và nó đã có sẵn trên máy. Không cần cài thêm gì.

### 6. mromidev/claude-animated-shorts

Skill làm video dọc 55–70 giây với nhân vật 2D trong nền 3D màu. **Thủ tục, không dùng AI video generator.** Stack: Remotion + `@remotion/three` + three.js + Node + Python + ffmpeg.

Quy trình 8 bước: nghiên cứu, kịch bản, tạo voice, kế hoạch shot trong `story.ts`, sinh still, render, QA từng khung, render 2K cuối cùng và mix audio.

Có `templates/bridge/` với world, nhân vật, ink outline, lens blur, color grade, camera work. Có `STYLE_BIBLE.md` xây trên 20 video tham khảu. 7 báo cáo đo, 38 khung đầy đủ, 20 contact sheet gồm 1.200 khung.

Key: **chỉ `REMOTION_TMP`**. Cảnh báo quan trọng: mỗi lần bundle Remotion copy khoảng 1,3 GB từ `public/` sang thư mục tạm.

MIT. Nhưng chỉ 2 commit, không có phát hành, không có CI test.

Nhận định: đây là workflow chuyên biệt rất tốt cho một định dạng hẹp (short dọc cố định). Giá trị thật là `STYLE_BIBLE.md` và cấu trúc QA. Rủi ro là phụ thuộc cấu trúc thư mục template cụ thể, không phải thư viện dùng chung.

### 7. howznguyen/shorts-kit

Bộ production Remotion cho short có narration và promo. 10 skill trong `.claude/skills/`: `sk-pipeline`, `sk-promo`, `sk-brief`, `sk-facts`, `sk-narration`, `sk-style`, `sk-scene`, `sk-render`, `sk-handoff`, `sk-improve`. Thêm 20 storytelling flow trong `docs/flows/` và **160+ motion recipe** trong `docs/shots/`.

Thư viện hình ảnh trong `src/shared/`: caption theo từ, kinetic typography, safe-zone overlay, music bed, SFX, camera move, bầu trời và biển và mặt trăng và mây và mưa và chim và người và cá minh họa, hiệu ứng strike-replace, slot-word, word-slam, typewriter, circles, arrows, stamp, compare bar, progress ring, odometer, bản đồ, coastline, quốc gia, sông, route, pin, globe 3D với đường great-circle, Three.js scene, isometric CSS-3D.

Có CLI: `bun run new <id> --flow <A..T>`, `tts`, `lint`, `storyboard`, `still`, `render`, `cover`, `normalize`, `encode`, `preview`. Skill `sk-improve` hỏi về niche, ngôn ngữ, giọng, tone và cập nhật `SOUL.md` cùng `docs/soul/thresholds.json`.

Key: **chỉ `ELEVENLABS_API_KEY`** là biến duy nhất được nêu tường minh. Ba lựa chọn voice khác: Edge TTS (online, **miễn phí, không cần key**), VieNeu-TTS (offline tiếng Việt, **miễn phí**, model khoảng 600 MB, cần Python 3.10+ và `uv`), macOS `say` (offline, chỉ để test). Whisper cần `large-v3-turbo` khoảng 1,6 GB.

MIT cho kit. SFX CC0. Natural Earth public domain. NASA Blue Marble public domain. EOX Sentinel-2 CC BY 4.0 (cần ghi nguồn). Font SIL OFL. Knowns UI MIT.

Nhận định: đây là repo **không cần paid API key** và có hệ thống motion recipe cùng storytelling flow được thiết kế có hệ thống nhất trong danh sách. Rủi ro vận hành là phải có Bun, và repo này đòi Node/Bun stack riêng.

### 8. sonlovinbot-team/Muse-animated-short-film

Skill Muse AI đưa từ ý tưởng tới MP4 qua 8 giai đoạn: thu thập duration, language, aspect; character sheet; duyệt story bible; keyframe; mega prompt từng cảnh; sinh video clip; voice-over; lắp ghép ffmpeg. Có ví dụ "The Last Lantern" với 8 cảnh.

Điểm cần nói rõ: README **không nêu tên model, provider, hay API key**. Không thể xác định workflow này chạy được với zero key hay không.

MIT. Có yêu cầu ghi công khi chia sẻ.

Nhận định: quy trình kiểu Muse, cần môi trường Muse. Không phải nền tảng xây kênh.

### 9. useapi/muse-api

Ví dụ tích hợp REST và MCP server (37 tool) cho dịch vụ **bên thứ ba useapi.net**, không phải API chính thức của Meta. README nói rõ useapi.net độc lập và không liên kết với Meta.

Auth: bearer token của useapi.net, cộng với tài khoản Muse được link qua email và mật khẩu. Sinh video khoảng 10 giây có sound và dialogue, dùng allowance hằng tuần của tài khoản Muse đã link. Có workflow Shorts có narration.

Chi phí: **$15/tháng** cho API và tối đa 3 tài khoản Muse, không tính phí theo ảnh hay video. Hỗ trợ tài khoản Muse miễn phí.

MIT cho code ví dụ, nhưng license không phủ dịch vụ useapi.net.

Nhận định: đây là đường tạo cảnh AI rẻ nhất nếu bạn có tài khoản Muse. Nhưng nó là bên thứ ba, không phải API chính thức, và điều khoản dịch vụ của useapi.net không phải điều khoản của Meta. Chưa nên đưa vào pipeline lõi khi chưa kiểm tra.

### 10. CopilotKit/openmuse

Agent cá nhân tự host, alpha. Client Expo/React Native, API Hono, PGlite mặc định, browser worker Playwright/Chromium, computer Docker tuỳ chọn, task bền vững với plan, approval, pause/resume. Adapter Gmail/Calendar qua Google OAuth.

Key: `CPK_INTELLIGENCE_API_KEY`, `CPK_TELEMETRY_ID`, `AGENT_BACKEND=model`, `MODEL`, provider key (`OPENAI_API_KEY` hoặc Anthropic), `BROWSER_WORKER_URL`, `WORKER_TOKEN` tối thiểu 32 ký tự, `OPENMUS_ACCESS_KEY` tối thiểu 24 ký tự, `TOKEN_ENCRYPTION_KEY` 32 byte base64.

MIT. Nhưng README tự nói là alpha, thiết kế một-owner với shared access key, chưa multi-tenant.

Nhận định: trùng chức năng với OpenBot. Không có YouTube connector. Không cần.

### 11. d4ncboz/museai

Gateway FastAPI tương thích OpenAI, điều khiển headless Chromium qua Chrome DevTools Protocol. Nói chuyện với Muse qua `hatch_sess`, `hatch_gw`, `datr`.

Auth: cookie phiên trình duyệt đã export (`hatch_sess` bắt buộc, `hatch_gw` bắt buộc, `hatch_native_auth_device` bắt buộc, `hatch_vml` tuỳ chọn, `datr` nên dùng), bearer key cục bộ mặc định `sk-museai-local-key`, admin key mặc định `sk-museai-admin-key`.

Có chat completions, image generation, video dispatch và polling, account pool, session renewal. 175 sao, 14 fork, **3 commit**.

Nhận định: cookie phiên cấp quyền truy cập tài khoản Muse, key mặc định có thể đoán. Với 3 commit thì đây là bản thử nghiệm, không phải production. Rủi ro bảo mật và điều khoản dịch vụ cao hơn lợi ích.

### 12. sarpstar/cinecode

Toolkit local cho coding agent làm short film, video dài, quảng cáo, explainer, music video. Agent phát triển concept và script, dựng hình bằng code, thiết kế âm thanh, render, kiểm tra kết quả.

Stack: Node.js, Python, Chrome/Chromium, ffmpeg. Hình ảnh dùng Canvas 2D hoặc three.js/WebGL. Âm thanh dùng Web Audio.

Có film mode (nhiều cổng duyệt) và fast mode (video tới khoảng 3 phút). Đầu ra MP4 trong thư mục film project.

Key: **không cần paid API key cho workflow lõi.** `GEMINI_API_KEY` chỉ cho TTS Gemini, tuỳ chọn. Có giọng Thổ Nhĩ Kỳ miễn phí cài được.

MIT. Cảnh báo trong README: chưa test end-to-end trên Windows, và một số safeguard chỉ hoạt động với Claude Code.

Nhận định: giao thoa trực tiếp với OpenMontage/Remotion. Không cần chạy song song.

### 13. OpenMontageInc/OpenMontage

Nền tảng agent-first: agent chọn pipeline, đọc YAML stage manifest và Markdown director skill, gọi tool qua registry, ghi checkpoint và decision log, xin duyệt ở các cổng sáng tạo. Stage: research, proposal, script, scene_plan, assets, edit, compose, pre-render check, post-render review.

Đã hỗ trợ animation gồm motion graphics và character-animation bằng SVG rig, pose library, GSAP, HyperFrames. Runtime: Remotion cho React scene, HyperFrames cho HTML/CSS/GSAP, FFmpeg cho lắp ghép.

Key không bắt buộc. Không có key vẫn có Piper offline, open-archive footage và local composition.

**AGPL-3.0.** Đây là điểm cần lưu ý khi phân phối sản phẩm phái sinh.

Nhận định: chính là nền tảng của workspace. README ghi rõ một extension bổ sung thật sự phải mang lại **năng lực khác**, chứ không phải thêm một đường tạo video hay animation nữa.

### 14. d4vinci/Scrapling

Framework scraping Python: HTTP fetch có browser TLS và header impersonation, HTTP/3, session, retry, proxy rotation. Browser automation qua Playwright Chromium/Chrome, kể cả remote browser qua CDP. Parser CSS/XPath/regex, tracking, similar-element matching, Markdown. Concurrent spider với throttle, pause/resume, cache, robots.txt, export JSON/JSONL/CSV/XML. Có CLI, interactive shell, MCP server, Agent Skill.

Key: **không cần** cho phần lõi. Các dịch vụ proxy, CAPTCHA và bot-protection quảng cáo cần tài khoản riêng nhưng không bắt buộc.

BSD-3-Clause.

Nhận định: không có tính năng publish, quản lý video hay analytics YouTube. Chỉ hữu ích để nghiên cứu trang công khai. Không cần cho giai đoạn hiện tại.

### 15. jakeschincariol/youtube-agent-skill

11 skill Claude chuẩn bị nội dung YouTube: `yt-script`, `yt-package`, `yt-edit`, `yt-retention`, `yt-shorts`, `yt-viral`, `yt-comment`, `yt-plan`, `yt-seo`, `yt-chapters`, `yt-audit`. Sáu tool Python cục bộ: `hookscore.py`, `title.py`, `deadair.py`, `chapters.py`, `retention.py`, `swipe.py`.

Điểm mạnh đáng chú ý: `yt-viral` xếp hạng video theo **mức vượt median của chính kênh đó**, không theo quy mô tuyệt đối. `yt-package` đánh giá title và thumbnail như một cặp. `yt-retention` đọc CSV retention và tìm điểm rơi.

Key: **không cần API key, không cần đăng nhập YouTube, không publish.** Chủ đích dừng trước bước upload.

MIT. Điểm số hook là heuristic, hiệu chuẩn trên 74 hook thật từ 5 kênh, không phải bảo đảm.

Nhận định: repo này **đã được cài đầy đủ** trong `.agents/skills/youtube-agent-skill__*` với 11 skill khớp từng tên. Không cài thêm.

### 16. harry0703/MoneyPrinterTurbo

Ứng dụng Python tự động hoá short-form: script đa ngôn ngữ, voice-over, lấy visual từ Pexels/Pixabay/Coverr hoặc provider AI, sinh ảnh, phụ đề theo từ, nhạc nền, edit với transition, render 9:16 / 16:9 / 1:1, chạy batch tới 100 task, và **publish tự động lên TikTok, Instagram, YouTube Shorts**.

Key: Edge TTS không cần key. Cần key cho cloud LLM, TTS, image, video và publish. `faster-whisper` tải `large-v3` khoảng 3 GB hoặc `large-v3-turbo` khoảng 1,6 GB.

MIT. 1.263 commit, 143.2k sao.

Rủi ro bản quyền được chính README nêu: **nhạc nền bundle đến từ video YouTube và có thể vi phạm bản quyền, nên nên gỡ bỏ.** Đây là điểm làm tool này không phù hợp với kênh kiếm tiền.

Nhận định: output mặc định là stock-like, dễ rơi vào inauthentic content. Trùng lặp phần pipeline. Không dùng.

### 17. Cuongyd196/cit-voice-studio

Desktop TTS, có local API để phần mềm khác gọi khi app đang chạy.

**VieNeu-TTS** cho tiếng Việt, **bundle sẵn trong installer**, 25 giọng tiếng Việt, có voice cloning. Supertonic 3 và Kokoro là tải tuỳ chọn cho ngôn ngữ khác. Kokoro **không** hỗ trợ tiếng Việt. Supertonic có tiếng Việt nhưng README khuyên dùng VieNeu cho chất lượng tốt hơn.

Key: **không cần** cho local use, chạy offline sau khi cài. Internet chỉ để tải model tuỳ chọn. Key chỉ dùng khi cho máy khác trong mạng truy cập.

Apache-2.0. README nói miễn phí cho cả cá nhân và thương mại. VieNeu thuộc về tác giả; Supertonic 3 dùng OpenRAIL-M (cho phép thương mại kèm hạn chế); Kokoro-82M Apache-2.0. Voice cloning chỉ dành cho giọng của bạn hoặc giọng bạn có quyền clone.

Nhận định: đây là ứng viên TTS tiếng Việt offline thực sự đáng cân nhắc, thay thế được Vibi TTS về mặt kỹ thuật và không phụ thuộc dịch vụ trả phí.

### 18. morluto/rea

Xem mục "Đảo ngược quan trọng nhất" ở trên. Đây là reverse-engineering toolkit cho phần mềm, không phải video.

MIT cho phần do REA viết.

### 19. JuneYaooo/rea-video

Xem mục "Đảo ngược quan trọng nhất". Công cụ phân tích video thật: phân tích từng shot, phân loại nguồn, xuất `VIDEO.md` cùng báo cáo HTML/PDF kèm hướng dẫn remake. Apache-2.0. 121 commit, 7.9k sao, 1.2k fork.

Nhận định: dùng để học cấu trúc video tham khảo, không dùng để sao chép footage, nhạc hay kịch bản.

## Kết luận về 19 repo

| Nhóm | Repo | Hành động |
|---|---|---|
| Cài sẵn, dùng được | `youtube-agent-skill` (11 skill), `stickman-video-director`, `turboflow`, `cartoon-3d-short`, `directing-stickman-videos` | Dùng, không cài thêm |
| Đã có sẵn trên máy | `OpenCreator` tại `OpenCreator-Phong` | Dùng cho hậu kỳ, cắt clip, dịch, thumbnail |
| Cài được, đáng thử | `shorts-kit` (không cần paid key, có VieNeu offline), `rea-video` (phân tích video tham khảo), `CIT Voice Studio` (TTS offline tiếng Việt) | Thử 1 cái mỗi lần, đo lợi ích |
| Dùng tay khi cần | `StykAnimate` (keyframe thủ công, local, GPL-3.0) | Chỉ khi cần kiểm soát khung hình |
| Không cần | `openbot`, `openmuse` (agent tổng quát), `Scrapling` (không có tính năng YouTube) | Không cài |
| Không nên dùng | `MoneyPrinterTurbo` (nhạc bundle vi phạm bản quyền theo chính README) | Tránh |
| Trùng hoặc rủi ro | `cinecode`, `bang-motion`, `Muse-animated-short-film`, `useapi/muse-api`, `museai`, `mromidev/claude-animated-shorts` | Chỉ tham khảo, không đưa vào pipeline lõi |

## Nguyên tắc ghép công cụ từ bài học đọc repo

1. **Một renderer chính.** OpenMontage đã phủ Remotion, HyperFrames, FFmpeg, character-animation. Không duy trì hai pipeline lõi.
2. **Bổ sung phải mang năng lực khác.** `rea-video` bổ sung khả năng đọc video tham khảo. `CIT Voice Studio` bổ sung TTS offline tiếng Việt. `OpenCreator` bổ sung hậu kỳ đa ngôn ngữ. Đó là ba khoảng trống thật.
3. **Ưu tiên đường không tốn tiền.** Edge TTS, VieNeu, Piper, TurboFlow free tier đều không cần paid key. Chỉ mở khoá API trả phí khi đo thấy lợi ích.
4. **Không để agent tự đăng bài.** Không repo nào trong danh sách nên tự upload lên kênh chính.
5. **Kiểm tra license khi phân phối.** OpenMontage là AGPL-3.0. StykAnimate là GPL-3.0. Sửa và phân phối sản phẩm phái sinh cần cân nhắc nghĩa vụ mã nguồn mở.
