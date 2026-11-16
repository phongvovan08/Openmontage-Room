# Công cụ GitHub, thị trường YouTube và kế hoạch xây kênh

> **Giới hạn quan trọng về nghiên cứu:** Connector vidIQ/NexLev không khả dụng trong lượt cập nhật ngày 14/11/2026 này. Các số RPM, từ khóa, kênh mới nổi và số dư credit dưới đây là snapshot từ lần nghiên cứu lưu sẵn trước đó, không phải số đã truy vấn lại hôm nay. Nội dung đó được giữ như ghi chú tham khảo, không dùng làm căn cứ chắc chắn cho quyết định thị trường.

**Ngày chốt tài liệu: 14/11/2026.** GitHub README và trang repo đã được đọc; chính sách YPP/AI đã đối chiếu trực tiếp với YouTube Help; reach quốc gia lấy từ DataReportal Digital 2026. Các dữ liệu vidIQ/NexLev và video/kênh là snapshot đã lưu trong workspace, truy vấn ngày 14/11/2026 nhưng không được chạy lại trong lượt kiểm chứng thứ hai. Xem mục 2 để hiểu giới hạn và mục 9 để biết các kết luận cần đọc lại so với tài liệu cũ.

**Quét YouTube công khai bằng script workspace, ngày 14/11/2026:** 4.585 video trên 22 nhóm, chi tiết phương pháp, bảng xếp hạng 22 nhóm ngách, ma trận ngách x tool và quy trình dựng cho từng ngách ở [17_QUET_NGACH_YOUTUBE_2026-11-14.md](./17_QUET_NGACH_YOUTUBE_2026-11-14.md). Bản trình bày có biểu đồ: [BAO_CAO_QUET_NGACH_YOUTUBE_2026-11-14.html](./BAO_CAO_QUET_NGACH_YOUTUBE_2026-11-14.html).

## 1. Kết luận nhanh

| Câu hỏi | Trả lời |
|---|---|
| Trong 19 repo, cái nào đáng dùng? | 8 repo có vai trò rõ trong dây chuyền: OpenMontage, youtube-agent-skill, shorts-kit, CIT Voice Studio, rea-video, OpenCreator, stickman-video-director, StykAnimate. 5 repo chỉ để tham khảo. 3 repo không phải công cụ làm video. 3 repo nên tránh. |
| Thị trường nào có tiền tốt nhất? | **Không có bảng xếp hạng RPM đáng tin trong tài liệu này.** Ước tính theo quốc gia từ vidIQ là mô hình của bên thứ ba, phụ thuộc nơi đặt kênh, và không dự báo được doanh thu thật. Thứ tự nên thử về khả năng triển khai: Việt Nam → tiếng Anh → Tây Ban Nha → Brazil → Indonesia/Đức. Mục 4.2. |
| Làm thị trường Việt hay tiếng Anh? | Cả hai, theo thứ tự. Kênh tiếng Việt trước để kiểm chứng format và có phản hồi trong vài tuần; kênh tiếng Anh sau, khi đã có bộ nghiên cứu và cảnh bản đồ dùng lại được, với mức chi quảng cáo trên mỗi lượt xem thường cao hơn. Cùng một lần nghiên cứu, cùng bộ bản đồ. |
| Chính sách vừa đổi gì? | Từ 01/02/2027, người nộp mới cần 1.000 người đăng ký cùng 8.000 giờ xem trong 365 ngày, hoặc 20 triệu lượt xem Shorts trong 90 ngày. Giữ tiền từ Shorts Creator Pool cần giữ 10 triệu lượt xem Shorts trong 90 ngày. Video dài là đường chính. Đã đối chiếu trang thông báo chính thức. |
| Nên làm ngách nào? | Giải mã địa lý kinh tế và hạ tầng Việt Nam bằng bản đồ và sơ đồ: mỗi video trả lời một câu "vì sao nó nằm ở đó" về một cảng, sân bay, tuyến đường sắt, cao tốc hay logistics cụ thể. |
| Vì sao ngách đó? | Quét nội bộ 22 nhóm ngách cho thấy nhóm hạ tầng/địa lý Việt Nam có video đạt 239.000-528.000 lượt trong vài tuần, và nhiều video cùng thể loại chỉ 1.000-5.000 lượt. Nội dung dạng này tự viết, tự dựng bản đồ nên ít rủi ro chính sách, và bạn có lợi thế đọc được nguồn tiếng Việt. Mẫu tham chiếu nhỏ và thiên lệch, nên đây là cơ sở để đặt cược có kiểm soát, không phải bằng chứng chắc chắn. |
| Repo ngoài danh sách nên biết? | Thêm 13 repo lấp khoảng trống cụ thể, mục 3.4. Đáng chú ý: [pnnbao97/VieNeu-TTS](https://github.com/pnnbao97/VieNeu-TTS) (TTS Việt offline, Apache-2.0), [pauling-ai/youtube-mcp-server](https://github.com/pauling-ai/youtube-mcp-server) (đọc Analytics của chính kênh qua API chính thức, cần OAuth), [ManimCommunity/manim](https://github.com/ManimCommunity/manim) (biểu đồ chuyển động chính xác), [SYSTRAN/faster-whisper](https://github.com/SYSTRAN/faster-whisper) và [m-bain/whisperX](https://github.com/m-bain/whisperX) cho phụ đề. Không cài tất cả; chọn theo khoảng trống thật. |
| Không nên làm gì? | Phim ngắn và recap, truyện audio đọc lại, nhạc remix, kênh megaproject tiếng Anh theo khuôn AI, kênh lịch sử ru ngủ sao chép, và mọi công cụ "một chạm ra video rồi tự đăng". |

## 2. Cách làm và độ tin cậy của số liệu

- **GitHub:** metadata của 12 repo lấy được qua GitHub API; 7 repo còn lại trả giới hạn 403 nhưng đã đọc README gốc từ `raw.githubusercontent.com` và HTML trang repo. Chức năng được xác định từ README/tài liệu chính chủ; không coi số sao là thước đo chất lượng.
- **vidIQ/NexLev:** snapshot nghiên cứu đã lưu trong workspace gồm các truy vấn trước đó; các con số được gắn ngày trong từng báo cáo. Connector không khả dụng ở lượt kiểm chứng thứ hai này nên không truy vấn lại, không xác nhận số dư credit hoặc analytics cá nhân.
- **Chính sách và thị trường:** đọc trang trợ giúp YouTube cùng DataReportal Digital 2026. reach quốc gia là potential advertising reach, không phải MAU.

**Đợt kiểm chứng lần hai trong ngày 14/11/2026 (sau bản đầu tiên):** bản này đã được đối chiếu lại với nguồn gốc thay vì tin vào số liệu đã ghi. Cụ thể:

- **7 repo bị GitHub API chặn (403) đã được đọc lại bằng cách tải README gốc từ `raw.githubusercontent.com` và quét trang HTML repo.** Kết quả khớp với kết luận cũ, gồm hai điểm quan trọng: `morluto/rea` là "REA: Reverse Engineer Anything", một MCP dịch ngược phần mềm qua binaries, ứng dụng và runtime behavior, **không phải công cụ phân tích video**; còn `JuneYaooo/rea-video` mới là công cụ video, ghi kết quả theo định dạng mở `VIDEO.md`, phân loại từng shot là quay thật, AI-generated, 3D hay code. Hai repo này là dự án khác nhau, không phải bản đổi tên.
- **Ngưỡng kiếm tiền từ 01/02/2027 đã được đối chiếu với trang thông báo chính thức**, không chỉ qua báo chí. Ngưỡng mới: 1.000 người đăng ký cùng 8.000 giờ xem hợp lệ trong 365 ngày, hoặc 20 triệu lượt xem Shorts hợp lệ trong 90 ngày. Điều kiện nhận tiền từ Shorts Creator Pool là giữ 10 triệu lượt xem Shorts trong 90 ngày. Trang cũng nêu Premium Lite mở rộng, chương trình thưởng Shorts mới, quảng cáo nhắm mục tiêu trả trực tiếp 45% cho creator đủ điều kiện, và điều kiện duy trì hoạt động mới gồm ba lựa chọn.
- **Danh sách quốc gia có Chương trình Đối tác đã được xác nhận trên trang trợ giúp chính thức** (mục 4.5).
- **Quy mô tiếp cận quảng cáo YouTube theo quốc gia đã được lấy trực tiếp từ 22 trang quốc gia của DataReportal Digital 2026** (mục 4.2), thay cho một dòng số tổng hợp vốn lấy qua Statista.
- **Danh sách 32 ngôn ngữ lồng tiếng tự động đã tìm thấy trên trang trợ giúp chính thức**, thay cho con số “27 ngôn ngữ” chỉ có trong báo chí.
- **Đã kiểm tra lại chính sách inauthentic content**: policy của YouTube định nghĩa nội dung không đủ điều kiện là nội dung lặp hoặc sản xuất hàng loạt, không nguyên bản. Bản cũ có câu “slideshow ảnh”, “AI làm từ khuôn chung chung” với trích dẫn nhưng chưa ghi đúng nguyên văn; những ví dụ đó nay được trình bày như cách diễn giải nội bộ, không phải quote chính sách.

Bốn điều cần nhớ khi đọc số:

1. RPM và doanh thu là ước tính mô hình của vidIQ và NexLev, không phải số của YouTube. Dùng để so sánh tương đối giữa thị trường và loại nội dung, không dùng để dự báo thu nhập.
2. Danh sách "kênh mới nổi" đã được lọc theo ngưỡng lượt xem nên chỉ gồm kênh thành công. Chúng cho biết cái gì đang chạy, không cho biết xác suất thành công.
3. Số liệu kênh và video là ảnh chụp ngày 14/11/2026.
4. vidIQ có vẻ ước tính thu nhập theo quốc gia đặt kênh. Một kênh đặt tại Việt Nam nhưng làm nội dung tiếng Anh được chấm RPM 0,27 USD, thấp hơn hẳn kênh cùng loại đặt tại Mỹ. Doanh thu thật phụ thuộc quốc gia của người xem. Đây là suy luận của tôi từ một trường hợp.
5. Quy mô người xem trong mục 4.2 là potential advertising reach của DataReportal, không phải MAU. Nếu một nguồn khác đưa ra con số khác cho cùng quốc gia, ưu tiên số của trang country report và ghi rõ khác biệt snapshot.

## 3. Phần A: 19 repo trong Github-tool.txt

File [Github-tool.txt](../Github-tool.txt) có 20 dòng, 19 repo khác nhau (`sonlovinbot-team/Muse-animated-short-film` lặp hai lần).

### 3.1 Bảng tổng hợp

| # | Repo | Làm gì (theo README) | Trạng thái 14/11/2026 | Kết luận cho kênh |
|---|---|---|---|---|
| 1 | [bangtutorial/bang-motion](https://github.com/bangtutorial/bang-motion) | Skill cho agent dựng motion graphic chạy trên trình duyệt: opener, promo, bumper, chữ động, nhiều kiểu explainer. Đầu ra là một file `index.html`, có script xuất MP4. | 2.118 sao, 3 commit, MIT, cập nhật 15/09/2026 | Tham khảo. Dùng làm ident 5 đến 8 giây cho kênh. Trùng vai với HyperFrames đã có trong OpenMontage. |
| 2 | [kaomei/stickman-video-director](https://github.com/kaomei/stickman-video-director) | Biến kịch bản thành video người que, 12 phong cách. Chế độ Director ra storyboard và prompt để tự tạo clip rồi dựng tay. Chế độ Autopilot để agent tự tạo hình, giọng, phụ đề, hiệu ứng âm thanh và dựng thành video dài từ 10 phút. | 6.029 sao, 189 commit, MIT, bản v2026.11.13.5 ngày 13/11/2026 | Dùng được. Lấy phần nhân vật và nhịp kể cho cảnh có người. Không tự đăng. Chỉ trả tiền API bên thứ ba mình chọn. Thư mục skill cùng tên đã có trong `.agents/skills/`. |
| 3 | [CopilotKit/OpenBot](https://github.com/CopilotKit/openbot) | Nền tảng tự host cho "đồng nghiệp AI": mỗi bot có trình duyệt, file và công cụ riêng, mọi hành động đều qua duyệt và ghi nhật ký. | 12.048 sao, 1.113 commit, MIT, v1.0.2 ngày 11/11/2026 | Không phải công cụ làm video. Bỏ qua. |
| 4 | [filippocalippo/StykAnimate-App](https://github.com/filippocalippo/StykAnimate-App) | Phần mềm hoạt hình người que cho Windows, Linux và trình duyệt. Mở được file Pivot và Stick Nodes. Có IK, timeline, camera, hiệu ứng hạt. Xuất MP4, WebM nền trong suốt, GIF. Chạy hoàn toàn trên máy. | 1.575 sao, 1.602 commit, GPL-3.0, cập nhật 13/11/2026 | Dùng khi cần. Dựng tay một cảnh hành động, xuất WebM trong suốt để chồng vào Remotion. Tốn công, không tự động. |
| 5 | [krillinai/OpenCreator](https://github.com/krillinai/OpenCreator) | Workspace cho creator (tên cũ KrillinAI), chạy trên Codex CLI: dịch video từ 123 ngôn ngữ nguồn, lồng tiếng, sửa phụ đề, tải video, tạo thumbnail, ảnh, video, giọng đọc, kịch bản ngắn, hoạt hình người que. Auto Clips và Digital Avatar còn đang phát triển. | 14.328 sao, 1.043 commit, Apache-2.0, v3.3.1 ngày 08/11/2026 | Dùng được cho khâu bản địa hóa khi mở kênh tiếng Anh. Cần Codex (đăng nhập ChatGPT hoặc API key). |
| 6 | [mromidev/claude-animated-shorts](https://github.com/mromidev/claude-animated-shorts) | Skill làm Shorts kể chuyện 55 đến 70 giây: nhân vật 2D trong thế giới 3D, dựng bằng three.js trong Remotion, không dùng AI tạo video. Kèm template và bộ tham chiếu phong cách đo từ 20 video mẫu. | 3.221 sao, 2 commit, MIT, cập nhật 01/11/2026 | Đã có trong workspace dưới tên `cartoon-3d-short`. Hợp Shorts kể chuyện, không phải lõi của ngách đề xuất. |
| 7 | [howznguyen/shorts-kit](https://github.com/howznguyen/shorts-kit) | Bộ sản xuất Shorts có lời dẫn bằng Remotion: 10 skill, 20 flow kể chuyện, hơn 160 công thức chuyển động, sổ kiểm chứng số liệu có linter, thư viện bản đồ (ảnh vệ tinh, biên giới, tuyến đường, quả địa cầu, bản đồ Việt Nam có Hoàng Sa và Trường Sa), giọng Edge miễn phí hoặc VieNeu tiếng Việt offline. | 141 sao, 17 commit, MIT, v2.0.0 ngày 09/11/2026 | Giá trị cao nhất cho ngách đề xuất nhờ thư viện bản đồ và sổ kiểm chứng số liệu. Cần Bun 1.3 trở lên. Không tự đăng. |
| 8 | [sonlovinbot-team/Muse-animated-short-film](https://github.com/sonlovinbot-team/Muse-animated-short-film) | Skill tiếng Việt làm phim hoạt hình ngắn ngay trong Muse AI, 8 bước từ ý tưởng tới MP4, có phim mẫu "The Last Lantern". | 65 sao, 6 commit, MIT, cập nhật 31/10/2026 | Tham khảo cách khóa nhân vật và keyframe. Phụ thuộc tài khoản Muse (xem mục 3.2). |
| 9 | [useapi/muse-api](https://github.com/useapi/muse-api) | Ví dụ gọi Muse qua API của bên thứ ba useapi.net, kèm MCP server 37 công cụ: tạo ảnh và video 10 giây có tiếng trên hạn mức gói Muse của mình. | 24 sao, 47 commit, MIT, cập nhật 12/11/2026 | Tránh ở giai đoạn này. Phải giao email và mật khẩu Muse cho bên thứ ba, phí 15 USD mỗi tháng. |
| 10 | [CopilotKit/openmuse](https://github.com/CopilotKit/openmuse) | Ứng dụng trợ lý cá nhân tự host (trình duyệt, terminal, file, Gmail, lịch), bản alpha. | 6.466 sao, 144 commit, MIT, cập nhật 13/11/2026 | Không phải công cụ làm video. Bỏ qua. |
| 11 | [d4ncboz/museai](https://github.com/d4ncboz/museai) | Cổng API kiểu OpenAI điều khiển muse.ai qua Chromium bằng cookie phiên, có gộp nhiều tài khoản. | 175 sao, 3 commit, MIT, cập nhật 29/09/2026 | Tránh. Dùng cookie phiên, khóa mặc định ai cũng biết, không còn cập nhật. |
| 12 | [sarpstar/cinecode](https://github.com/sarpstar/cinecode) | Bộ công cụ để agent làm phim bằng code: viết kịch bản, dựng từng khung hình bằng Canvas hoặc three.js, thiết kế âm thanh, xuất MP4. Có chế độ nhanh (tới khoảng 3 phút) và chế độ phim cho video dài có nguồn. README chính bằng tiếng Thổ Nhĩ Kỳ, có bản tiếng Anh. | 2.397 sao, 9 commit, MIT, cập nhật 12/11/2026 | Tham khảo. Trùng vai với OpenMontage. Đáng học hai thói quen: file ghi license cho mọi tư liệu tải về và file credit đi kèm mỗi video. |
| 13 | [OpenMontageInc/OpenMontage](https://github.com/OpenMontageInc/OpenMontage) | Hệ thống sản xuất video do agent điều khiển: 12 pipeline, hơn 100 công cụ, Remotion, HyperFrames, FFmpeg. | 80.230 sao, 724 commit, AGPL-3.0, cập nhật 09/11/2026 | Nền tảng của workspace này. Giữ làm dây chuyền gốc. |
| 14 | [D4Vinci/Scrapling](https://github.com/d4vinci/Scrapling) | Framework Python thu thập dữ liệu web: HTTP nhanh, trình duyệt ẩn danh, crawler, có MCP server. | 102.446 sao, 1.827 commit, BSD-3-Clause, v0.5.1 ngày 04/11/2026 | Tham khảo. Chỉ hữu ích khi cần gom dữ liệu công khai cho nghiên cứu đề tài. Với dữ liệu YouTube, dùng vidIQ hoặc API chính thức. |
| 15 | [Jakeschincariol/youtube-agent-skill](https://github.com/jakeschincariol/youtube-agent-skill) | 11 skill vận hành kênh: kịch bản với 21 công thức hook có chấm điểm, soát cặp tiêu đề và thumbnail, danh sách cắt dựng từ transcript, đọc file retention, tìm Shorts trong video dài, tìm video vượt chuẩn theo trung vị từng kênh, SEO, chapters, audit. Kèm 6 công cụ Python không cần thư viện ngoài. | 5.792 sao, 1 commit, MIT, cập nhật 16/09/2026 | Dùng ngay. Đã cài đủ 11 skill trong `.agents/skills/youtube-agent-skill__yt-*`. Không cần API key, không tự đăng. |
| 16 | [harry0703/MoneyPrinterTurbo](https://github.com/harry0703/MoneyPrinterTurbo) | Tạo video ngắn một chạm từ chủ đề: kịch bản, footage stock hoặc AI, giọng đọc, phụ đề, nhạc nền, chạy hàng loạt, tự đăng lên TikTok, Instagram, YouTube Shorts. | 143.233 sao, 1.263 commit, MIT, v1.3.10 ngày 07/11/2026 | Tránh cho kênh muốn kiếm tiền. Đầu ra đúng kiểu video khuôn mẫu sản xuất hàng loạt, và README tự ghi nhạc mặc định lấy từ video YouTube. |
| 17 | [Cuongyd196/cit-voice-studio](https://github.com/Cuongyd196/cit-voice-studio) | Ứng dụng giọng đọc chạy trên máy: 25 giọng tiếng Việt (VieNeu), nhân bản giọng, thẻ cảm xúc và thẻ nghỉ, hội thoại nhiều vai, lồng tiếng theo file SRT, API nội bộ tại cổng 8001. | 205 sao, 45 commit, Apache-2.0, bản 1.0.6 ngày 12/11/2026 | Dùng được. Phương án giọng Việt miễn phí và offline để so với Vibi. Chạy được bằng CPU. |
| 18 | [morluto/rea](https://github.com/morluto/rea) | Bộ công cụ dịch ngược phần mềm (binary, ứng dụng Electron, .NET, website). | 457.154 sao, 7.333 commit, MIT, cập nhật 13/11/2026 | Không liên quan tới video. Tên giống rea-video nhưng là dự án khác hẳn. |
| 19 | [JuneYaooo/rea-video](https://github.com/JuneYaooo/rea-video) | Mổ xẻ video theo từng cảnh: cảnh nào quay thật, AI tạo hay dựng bằng code, nhịp cắt, phụ đề, âm thanh, kèm phương án dựng lại. Xuất báo cáo HTML, PDF và file VIDEO.md. | 7.894 sao, 121 commit, Apache-2.0, v0.1.0 ngày 11/11/2026 | Dùng được. Học cấu trúc và nhịp của video đối thủ trước khi viết kịch bản. Cần Python 3.10 trở lên và ffmpeg. |

### 3.2 Năm điều rút ra khi đọc kỹ

1. **"Muse" trong ba repo là trợ lý AI của Meta tại muse.ai.** Theo README của useapi (ghi mốc tháng 10/2026), Muse chỉ mở ở Mỹ, Canada, Nhật và Singapore, tài khoản phải tạo ở một trong bốn nước đó. Có gói miễn phí, Power 20 USD và Maximum 100 USD mỗi tháng; mỗi video dài khoảng 10 giây ở khoảng 720p. Từ Việt Nam, cả ba repo Muse đều vướng điều kiện tài khoản trước khi bàn tới chất lượng.
2. **Hai repo tên "rea" không liên quan nhau.** `morluto/rea` dịch ngược phần mềm. `JuneYaooo/rea-video` mới là công cụ phân tích video. Chỉ cái sau có ích cho YouTube.
3. **Số sao không nói lên độ chín.** bang-motion có 2.118 sao với 3 commit; claude-animated-shorts 3.221 sao với 2 commit; youtube-agent-skill 5.792 sao với 1 commit. Đây là các "gói skill" phát hành một lần: dùng được, nhưng đừng chờ bảo trì.
4. **License cần nhớ.** OpenMontage là AGPL-3.0 và StykAnimate là GPL-3.0: ràng buộc khi phân phối lại phần mềm, thường không ràng buộc video xuất ra. Remotion miễn phí cho cá nhân và tổ chức tới 3 nhân sự, trên mức đó phải mua giấy phép công ty. Ảnh vệ tinh EOX Sentinel-2 mà shorts-kit dùng là CC BY 4.0 nên phải ghi nguồn trong mô tả video.
5. **Không repo nào thay được ba việc:** chọn đề tài, kiểm chứng số liệu và duyệt bản cuối. Các repo chỉ rút ngắn khâu dựng.

### 3.3 Ghép công cụ thành dây chuyền

Bảng này xếp theo ngách đề xuất ở mục 6. Nguyên tắc: một dây chuyền dựng duy nhất (OpenMontage), các repo khác chỉ lấp chỗ OpenMontage chưa có.

| Khâu | Công cụ chính | Bổ trợ | Vì sao |
|---|---|---|---|
| Tìm đề tài, soi đối thủ | YouTube Search và vidIQ khi kết nối được | `yt-viral`; `rea-video` để học 2-3 video mẫu | vidIQ cho tín hiệu thị trường; `yt-viral` so hiệu suất video trên trung vị của chính kênh; `rea-video` đọc nhịp hình |
| Kiểm chứng số liệu | Sổ nguồn/fact ledger (`shorts-kit` làm tham chiếu) | Quy hoạch, báo cáo dự án, niên giám, văn bản chính thức | Ngách hạ tầng sống bằng con số; mỗi dữ kiện cần nguồn, ngày và phạm vi trước khi vào kịch bản |
| Đóng gói trước khi viết | `yt-package` trong skill đã cài | — | Chốt câu hỏi, title và concept thumbnail trước; kịch bản phải trả đúng lời hứa đó |
| Kịch bản | `yt-script` trong skill đã cài | `hookscore.py` trong cùng thư mục skill | Chấm/so sánh hook để biên tập; điểm không dự đoán hiệu suất thật |
| Bản đồ và hình | OpenMontage/Remotion hiện có | Prototype thư viện bản đồ `shorts-kit`; `threejs_world`/Blender khi có nhu cầu địa hình | Bản đồ là visual chính; chỉ tích hợp recipe sau khi thử chất lượng, license và độ tương thích |
| Nhân vật | Không mặc định dùng | `stickman-video-director`; StykAnimate thủ công | Thêm nhân vật khi nó phục vụ câu chuyện, không phủ mọi video |
| Giọng đọc | Vibi TTS đang dùng | CIT Voice Studio/VieNeu-TTS để A/B | Chọn một voice phù hợp và giữ nhất quán; rà phát âm riêng tên riêng |
| Phụ đề | Workflow STT/SRT hiện có | WhisperX hoặc faster-whisper nếu thực sự cần alignment | Rà thủ công con số, địa danh và thuật ngữ; giữ text layer riêng để bản địa hóa |
| Bản tiếng Anh | Render lại, biên tập lại script/title/context | OpenCreator để dịch/dub bản nháp | Một lần nghiên cứu, nhiều phiên bản có biên tập; không chỉ thay voice |
| Shorts | `yt-shorts` trong skill đã cài | `cartoon-3d-short`, recipe của `shorts-kit` | Mỗi Shorts có setup/payoff riêng và dẫn tới video dài liên quan |
| Đăng | YouTube Studio, làm tay | `yt-seo`, `yt-chapters` | Giữ quyền duyệt title, mô tả, khai báo và comments; không để agent tự đăng |
| Sau đăng | YouTube Studio Analytics | `yt-retention`, `yt-comment`, `yt-audit` | Đo audience của chính kênh; học từ dữ liệu thật thay vì view công khai đơn lẻ |

Skill `youtube-agent-skill` và `stickman-video-director` đã có trong `.agents/skills/`; `cartoon-3d-short` cũng đã có. Dùng bản tích hợp hiện tại, không cài các bản trùng. OpenCreator đã được ghi nhận là cài trên máy trong [14_DANH_GIA_19_REPO_GITHUB.md](./14_DANH_GIA_19_REPO_GITHUB.md).

### 3.4 Repo bổ sung nên biết

Các repository bổ sung được gợi ý theo khoảng trống chức năng, không được cài hoặc benchmark end-to-end trong lượt rà soát này. Vai trò/lưu ý license dựa trên README chính chủ và [báo cáo đánh giá chi tiết](./14_DANH_GIA_19_REPO_GITHUB.md); kiểm tra lại license, model và trạng thái release trước khi triển khai.

| Repo | Lấp khoảng trống nào | Ghi chú |
|---|---|---|
| [pnnbao97/VieNeu-TTS](https://github.com/pnnbao97/VieNeu-TTS) | Giọng Việt offline, TTS, voice cloning theo mẫu ngắn | Apache-2.0 theo repo. TTS, không phải STT. Kiểm tra điều khoản voice/model và so A/B với Vibi trước khi chọn. |
| [m-bain/whisperX](https://github.com/m-bain/whisperX) | Transcript, word-level alignment và timestamp phụ đề | BSD-2-Clause; thử trên audio thật, không thay transcript review. |
| [SYSTRAN/faster-whisper](https://github.com/SYSTRAN/faster-whisper) | Speech-to-text cục bộ | MIT; có thể dư thừa nếu STT hiện tại đủ nhanh/chính xác. |
| [jdepoix/youtube-transcript-api](https://github.com/jdepoix/youtube-transcript-api) | Đọc transcript công khai khi video có transcript khả dụng | MIT; API không chính thức và có thể bị giới hạn. Dùng học cấu trúc, không sao chép lời. |
| [yt-dlp/yt-dlp](https://github.com/yt-dlp/yt-dlp) | Metadata/transcript và xử lý media khi có quyền phù hợp | Unlicense theo repo snapshot; không dùng lại footage của người khác. Tuân thủ quyền và điều khoản dịch vụ. |
| [resemble-ai/chatterbox](https://github.com/resemble-ai/chatterbox) | Thử giọng tổng hợp tiếng Anh | MIT theo repo snapshot; nghe mẫu và kiểm tra quyền voice/model, không clone người thật khi chưa được phép. |
| [ace-step/ACE-Step-1.5](https://github.com/ace-step/ACE-Step-1.5) | Tạo/chỉnh nhạc nền cục bộ | MIT theo README. CUDA khuyến nghị, có đường chạy CPU nhưng chậm; license model/dataset cần kiểm tra riêng. Skill `acestep` đã có trong workspace. |
| [pauling-ai/youtube-mcp-server](https://github.com/pauling-ai/youtube-mcp-server) | Đọc YouTube Analytics của kênh được cấp quyền và thao tác API YouTube | MIT theo repo. Cần Google OAuth; API key tùy tác vụ. Repo nhỏ, audit mã và scope trước khi cấp quyền. |
| [porjo/youtubeuploader](https://github.com/porjo/youtubeuploader) | Upload qua YouTube API | Apache-2.0 theo repo snapshot. Chưa cần tự động upload; giữ bước duyệt thủ công. |
| [gitroomhq/postiz-app](https://github.com/gitroomhq/postiz-app) | Lên lịch social đa nền tảng, tự host được | AGPL-3.0. Tích hợp nền tảng có thể cần app approval; không phải ưu tiên cho YouTube-only pilot. |
| [WyattBlue/auto-editor](https://github.com/WyattBlue/auto-editor) | Cắt khoảng lặng/rough edit bằng CLI | Unlicense theo README. Có ích nếu có footage/narration tự thu; không thay dựng nhịp nội dung. |
| [ManimCommunity/manim](https://github.com/ManimCommunity/manim) | Biểu đồ, sơ đồ toán học chuyển động chính xác | MIT. Workspace đã có skill manim; dùng cho cảnh cần độ chính xác hình học. |
| [googleapis/google-api-nodejs-client](https://github.com/googleapis/google-api-nodejs-client) | Google API client cho Node/TypeScript | Thư viện client tổng quát; dùng API docs và OAuth/quotas chính thức. Không phải analytics tool độc lập. |

Không khuyến nghị `youtube/api-samples` làm tài liệu hiện hành vì repo đã lưu trữ; và không dùng các "nhà máy" tự làm rồi tự đăng video faceless bằng một lệnh như `raunakpatil/youtube-agentic-ai-studio` cho kênh muốn kiếm tiền từ nội dung gốc.

### 3.5 Đánh giá bổ sung: `yihui-dev/awesome-opus5-5-videos`

Repo này đã có trong workspace tại [`../awesome-opus5-5-videos/`](../awesome-opus5-5-videos/), nhưng **không nằm trong `Github-tool.txt`** nên không tính vào 19 repo ở mục 3. Đây là thư viện prompt bổ sung, không phải renderer hay pipeline thứ hai.

#### Kết luận

**Chỉ dùng làm thư viện tham khảo có chọn lọc; không tích hợp vào dây chuyền lõi.** Giá trị thực là xem cách người khác mô tả chuyển động, cấu trúc cảnh và tiêu chuẩn kiểm tra một video code-rendered. Với ngách bản đồ hạ tầng Việt Nam, chỉ có một prompt khớp trực tiếp về ý tưởng bản đồ tuyến xe; không có bộ dữ liệu địa lý, route engine hay template bản đồ Việt Nam. Phần đó đã được `shorts-kit` và OpenMontage phủ có cấu trúc hơn.

#### Đã xác minh repo chứa gì

Đọc README, LICENSE, toàn bộ `data/videos.json`, GitHub tree và kiểm tra một số prompt gốc tại commit local `92aee2f` (13/10/2026). GitHub tree có 709 entry, trong đó `prompts/` chứa 703 file `.md`; phần còn lại là README, LICENSE, `.gitignore` và dữ liệu JSON. Không thấy mã chạy/render, package manifest, test, CI hay workflow build **trong repo gốc**. README tự hướng dẫn sao chép prompt vào agent, tạo HTML rồi tự ghi trang đó thành video.

| Hạng mục | Số đã kiểm tra |
|---|---:|
| Prompt | 703 |
| Tác giả khác nhau theo trường `author` | 616 |
| Prompt đầy đủ / `prompt_partial` | 496 / 207 (70,6% / 29,4%) |
| Có remake (`has_remake`) | 418 (59,5%) |
| Độ dài prompt trong `data/videos.json` | min 11, p25 125, trung vị 222, p75 404, max 15.583 ký tự |
| Ngắn hơn 150 ký tự | 243 (34,6%) |
| Nhóm `category` trong dữ liệu | motion 369, 3D 117, explainer 116, interactive 101 |
| Ngày `added` trong dữ liệu | 26/09/2026–12/10/2026; dữ liệu tập trung ở 5 đợt ngày |
| Tech tag phổ biến | canvas 267, SVG 183, Three.js 131, shader 92, GSAP 86 |

README gọi các mục là “viral videos”, nhưng dữ liệu repo không có lượt xem, lượt thích, retention, cách xếp hạng hay tiêu chí chọn “viral”. `has_remake=true` chỉ xác nhận một trường dữ liệu cho biết có remake; không chứng minh hiệu suất khán giả hay khả năng tái tạo kết quả. Trang Skillry nói remake được tạo từ prompt và có credit/link bài gốc; README cho biết tác giả có thể mở issue để yêu cầu sửa hoặc gỡ entry.

Repo upstream chỉ có prompt và dữ liệu. **Bản clone local có thêm hai file không thuộc repo gốc:** `awesome-opus5-5-videos/tim_prompt.py` và `awesome-opus5-5-videos/HUONG_DAN_SU_DUNG.md`. Tôi đã chạy thử `python awesome-opus5-5-videos/tim_prompt.py --templates --limit 6`; script chạy và báo 30 kết quả. Hướng dẫn local là tài liệu do workspace bổ sung, không phải hướng dẫn chính thức của repo.

#### Prompt nào có thể giúp ngách bản đồ

| Prompt trong thư viện | Đọc thực tế | Cách dùng an toàn, có ích |
|---|---|---|
| [`milos-gis-317580.md`](../awesome-opus5-5-videos/prompts/milos-gis-317580.md) | Mô tả ngắn: mở từ tổng quan các khu vực Portland rồi zoom vào tuyến xe buýt theo từng vùng; điều chỉnh tốc độ khi zoom. Đây là prompt đúng nhất về cấu trúc bản đồ/tuyến đường, nhưng chỉ dài 475 ký tự và không kèm dữ liệu GIS, tọa độ, nguồn hay code bản đồ. | Mượn nhịp “tổng quan → từng vùng → tuyến cụ thể” làm ý tưởng cho một cảnh giải thích cảng, đường sắt hoặc cao tốc. Tự lấy dữ liệu tuyến/tọa độ từ nguồn hợp lệ, ghi sổ nguồn rồi dựng lại. Không bê dữ liệu Portland, không giả định prompt tự tạo dữ liệu chính xác. |
| [`astrothewizard-618782.md`](../awesome-opus5-5-videos/prompts/astrothewizard-618782.md) | Brief 60 giây khá đầy đủ (2.453 ký tự): một câu hỏi giáo dục, số liệu kèm bất định, TTS, caption, âm thanh, animation code và vòng rà soát từng cảnh. Ví dụ là hành trình photon trong Mặt Trời; không phải video địa lý. | Tham khảo checklist cho đoạn mở đầu hoặc prototype 60–90 giây. Thay yêu cầu “tự làm hết” bằng script và số liệu đã được kiểm chứng; tách caption/nhãn tiếng Việt thành text layer. |
| [`cryptoxorz-359201.md`](../awesome-opus5-5-videos/prompts/cryptoxorz-359201.md) | 457 ký tự; nhắc giải thích một câu hỏi khoa học, hook tò mò, điểm ngược trực giác, phép so sánh và ưu tiên paper/tổ chức/tài liệu gốc. Không có form trích dẫn hay kiểm chứng nguồn cụ thể. | Dùng như nhắc nhớ khi soạn brief; thực thi bằng sổ nguồn hiện có, không coi câu “facts must be accurate and sourced” là một cơ chế fact-check. |
| [`deedydas-407965.md`](../awesome-opus5-5-videos/prompts/deedydas-407965.md) | Đề cương video SQLite 7 phút (538 ký tự): chức năng, “bản đồ” kiến trúc code, vòng đời query, abstraction và trace thực thi. “Map” ở đây là sơ đồ codebase, không phải bản đồ địa lý. | Mượn thứ tự giải thích một hệ thống phức tạp từ tổng quan đến một luồng cụ thể; không dùng làm template cho bản đồ tuyến. |

Prompt về kỹ thuật dựng có giá trị tham khảo, nhưng nằm ngoài lõi biên tập ngách:

- [`0xkarmi-129839.md`](../awesome-opus5-5-videos/prompts/0xkarmi-129839.md) mô tả quy tắc mỗi frame phụ thuộc số frame, render 720 frame/12 giây, sáu gate kiểm tra trước khi người xem xem, và phép so frame 0 với frame cuối để bắt chuyển động không tuần hoàn. Đây là bài mô tả phương pháp của tác giả, không phải mã nguồn hay benchmark có thể chạy lại.
- [`twoclipping-496100.md`](../awesome-opus5-5-videos/prompts/twoclipping-496100.md) là prompt motion dài (5.200 ký tự), có `seek(t)`, timeline, QA theo beat và hiệu ứng chuyển cảnh; nhưng hướng tới phim quảng bá hình vuông, ảnh sản phẩm, nhạc và footage, không phải video giải thích hạ tầng 12–16 phút.
- [`fleyta88-443662.md`](../awesome-opus5-5-videos/prompts/fleyta88-443662.md) nhắc dùng Playwright chụp từng frame để rà lỗi animation, nhưng prompt chỉ 398 ký tự và không cung cấp tool/script thực hiện.

#### Khoảng trống và mức trùng với workspace

Quét toàn bộ prompt text theo từ khóa tiếng Việt, `Vietnamese`, diacritics, Unicode, font loading và internationalization không tìm thấy kết quả. Đây là khoảng trống của **corpus prompt**, không phải của workspace: workspace đã có font Be Vietnam Pro tại `remotion-composer/public/episodes/inner-01/fonts/` và `Chu-De/Tam-Ly-Noi-Tam/assets/tap-01/fonts/`; cần giữ đúng font trong từng project và kiểm tra glyph khi render.

Phần kỹ thuật chung hầu như đã có trong dây chuyền:

- `.agents/skills/openmontage-bespoke-composition/SKILL.md:144-152` cấm `Math.random()`/`Date.now()` mỗi frame và yêu cầu GSAP timeline paused, seek theo `frame/fps` trong Remotion.
- `skills/core/hyperframes.md:242-260` đặt `lint → validate` trước render; phần validate seek vào composition paused, chụp ảnh và lấy mẫu pixel. Atelier còn có lệnh `hyperframes snapshot` để spot-check frame.
- `.agents/skills/cartoon-3d-short/templates/scripts/short_qa.py:58` đã báo frame-difference pop bất thường.
- `skills/pipelines/documentary-montage/compose-director.md:277-290` yêu cầu probe duration, resolution, audio, frame đầu/cuối và ghi lại xác minh sau render.

Trong lần rà soát này chưa tìm thấy phép thử pixel-by-pixel giữa frame 0 và frame cuối cho **video loop seamless**. Nhưng đây không phải yêu cầu chính của video giải thích địa lý dạng dài, và workspace đã có frame-diff QA; không đáng tích hợp thêm chỉ vì một prompt trong corpus nêu ra. Quan trọng hơn, các quy tắc deterministic render, screenshot QA, encode và pipeline đều đã tồn tại, nên không có lý do kỹ thuật để nhập một renderer HTML riêng.

`shorts-kit` có lợi thế khác hẳn corpus prompt: 160+ recipe chuyển động, 20 storytelling flow, thư viện bản đồ/routes/globe và linter sổ nguồn. OpenMontage cũng đã có Remotion, HyperFrames, map/3D capability, Vibi TTS, phụ đề và pipeline review. Repo này không mang lại các năng lực có cấu trúc đó; nó cho ví dụ mô tả sáng tạo rời rạc.

**Cảnh báo với hướng dẫn local:** `awesome-opus5-5-videos/HUONG_DAN_SU_DUNG.md` có các ví dụ yêu cầu agent đọc prompt rồi render trực tiếp hoặc dùng Chrome/FFmpeg riêng. Không dùng các bước đó để sản xuất trong OpenMontage: `AGENT_GUIDE.md` quy định mọi sản xuất video đi qua manifest/pipeline, preflight, stage director skills và approval gate. Có thể lấy prompt làm đầu vào tham khảo cho brief của pipeline, sau đó viết lại theo dữ liệu, tiếng Việt, tỷ lệ khung hình và runtime đã được duyệt.

#### License và chính sách kiếm tiền

LICENSE gốc ghi MIT cho “the Software and associated documentation files” và yêu cầu giữ copyright/license notice khi sao chép phần thuộc phạm vi được cấp. Nhưng README đồng thời tuyên bố mỗi video và prompt thuộc về tác giả tương ứng; repo không đưa ra giấy phép riêng rõ ràng cho media của Skillry hay nội dung bài đăng X. Vì vậy **không suy diễn rằng MIT cấp quyền dùng thương mại mọi prompt, poster, remake hoặc video gốc**. Đây không phải kết luận pháp lý: nếu định tái phân phối prompt nguyên văn, xin quyền hoặc đọc điều khoản áp dụng; với kênh, an toàn hơn là chỉ học ý tưởng ở mức cao rồi tự viết, tự vẽ, tự dùng dữ liệu và nguồn có quyền rõ. Không lấy video, poster, nhạc hoặc asset của creator/Skillry đưa vào video monetized khi chưa có quyền.

Cấp quyền dùng media và điều kiện YPP là hai câu hỏi khác nhau. YouTube đánh giá nội dung toàn kênh; nội dung lặp hoặc sản xuất hàng loạt, ít khác biệt hoặc giá trị mới có thể không đủ điều kiện kiếm tiền. Dùng một prompt làm cảm hứng không tự động gây vi phạm, nhưng copy một khuôn prompt hàng loạt rồi thay tên cảng/địa danh mà không có nghiên cứu, phân tích và hình ảnh có giá trị riêng sẽ làm tăng rủi ro “inauthentic content” hoặc “reused content”. Xem [chính sách kiếm tiền của kênh YouTube](https://support.google.com/youtube/answer/1311392). Không có prompt hay repo nào bảo đảm được bật kiếm tiền.

#### Khuyến nghị hành động

**Xếp loại: tham khảo, không tích hợp.** Giữ clone hiện có; dùng `tim_prompt.py` để tìm một mẫu phù hợp khi cần ý tưởng chuyển động. Với video bản đồ Việt Nam, có thể lấy cấu trúc zoom vùng/tuyến từ `milos-gis-317580`, sau đó qua pipeline explainer hiện có: kiểm chứng fact và dữ liệu tuyến, viết lời dẫn nguyên bản, tạo cảnh bản đồ/diagram, lồng tiếng Vibi, đồng bộ phụ đề, chọn Remotion hoặc HyperFrames tại proposal và hoàn tất review. Không import 703 prompt vào skill mặc định, không tạo runtime mới, không chạy hướng dẫn render ngoài pipeline. Đo chất lượng bằng tính đúng của dữ liệu, khả năng hiểu câu chuyện, retention và phản hồi video pilot, không bằng nhãn “viral” của repo.

## 4. Phần B: Thị trường

### 4.1 Ba sự thật chi phối mọi quyết định

**Một. Theo mô hình ước tính của vidIQ, cùng một lượt xem video dài ở nhóm giáo dục, tiền quảng cáo chênh nhau khoảng 10 lần giữa Mỹ và Việt Nam.** Ước tính cho một kênh 10.000 người đăng ký có 1 triệu lượt xem video dài mỗi tháng:

| Thị trường (ngôn ngữ) | Giáo dục: thấp / giữa / cao (USD mỗi tháng) | Giải trí: thấp / giữa / cao |
|---|---|---|
| Mỹ (Anh) | 2.052 / 3.420 / 5.472 | 855 / 1.425 / 2.280 |
| Đức (Đức) | 1.334 / 2.223 / 3.557 | chưa đo |
| Nhật (Nhật) | 1.129 / 1.881 / 3.010 | chưa đo |
| Mexico (Tây Ban Nha) | 616 / 1.026 / 1.642 | chưa đo |
| Brazil (Bồ Đào Nha) | 513 / 855 / 1.368 | chưa đo |
| Ấn Độ (Hindi) | 246 / 410 / 657 | chưa đo |
| Indonesia | 205 / 342 / 547 | chưa đo |
| Việt Nam | 205 / 342 / 547 | 85,5 / 142,5 / 228 |

**Cách đọc bảng này:** đây là mô hình của một công cụ bên thứ ba, không phải số của YouTube và không phải cam kết thu nhập. Một trường hợp trong dữ liệu cho thấy vidIQ có vẻ chấm theo **quốc gia đặt kênh** chứ không theo quốc gia của người xem: một kênh đặt tại Việt Nam nhưng làm nội dung tiếng Anh được chấm RPM 0,27 USD, thấp hơn hẳn kênh cùng loại đặt tại Mỹ. Nếu đúng như vậy, bảng trên chủ yếu phản ánh sức mua quảng cáo tại nơi kênh đặt, không phản ánh tiền mà khán giả nước ngoài mang lại. Vì vậy bảng này chỉ dùng để so sánh tương đối giữa các thiết lập kênh, và không dùng làm dự báo doanh thu cho kênh mới.

Số ước tính cho từng kênh mới nổi khớp với mô hình này:

- **Kênh tiếng Việt mới:** vidIQ tìm thấy 299 kênh tiếng Việt tạo trong 12 tháng qua, làm video dài, có từ 200.000 lượt xem mỗi 30 ngày. Trong 50 kênh đông người đăng ký nhất, thu nhập ước tính chia cho lượt xem ra trung vị 0,15 USD mỗi 1.000 lượt; thấp nhất 0,08 ở kênh nhạc, cao nhất 0,35 ở kênh lịch sử (không tính một kênh tiếng Hàn lọt vào danh sách). 28 trong 50 kênh này là phim ngắn, recap hoặc vietsub.
- **Kênh faceless tiếng Anh mới:** 74 kênh tạo từ 01/03/2026 có từ 500.000 lượt xem video dài mỗi 30 ngày. Trong 50 kênh đông người đăng ký nhất, trung vị là 2,13 USD; nhóm kiến thức đạt 3,1 đến 3,8 USD.
- **NexLev:** RPM trung vị 2,08 đến 4,02 USD ở năm nhóm ngách đã đo, chủ yếu là kênh tiếng Anh.

Lưu ý chung cho cả ba dòng: các danh sách "kênh mới nổi" đã được lọc theo ngưỡng lượt xem nên chỉ gồm kênh thành công. Chúng cho biết cái gì đang chạy, không cho biết xác suất thành công của kênh bạn.

**Hai. Ngưỡng bật kiếm tiền tăng gấp đôi từ 01/02/2027.** Chi tiết ở mục 4.5.

**Ba. Chính sách kiếm tiền có thể từ chối nội dung khuôn mẫu hoặc dùng lại; không cấm AI nói chung.** Dùng AI để hỗ trợ sửa kịch bản, tạo minh họa riêng hoặc phụ đề không tự động làm mất điều kiện kiếm tiền. Rủi ro nằm ở nội dung lặp, sản xuất hàng loạt, ít giá trị biên tập hoặc tái sử dụng nội dung của người khác.

### 4.2 Xếp hạng thị trường

**Quy mô người xem quảng cáo YouTube, DataReportal Digital 2026, chủ yếu là late 2025:** số trong bảng là *potential advertising reach* từ công cụ quảng cáo của Google, không phải MAU, người xem thực tế hay lượng view. Danh sách được xếp theo độ lớn trong nhóm thị trường đã rà soát, không phải toàn bộ mọi quốc gia trên thế giới.

| Hạng trong nhóm đã rà soát | Quốc gia | Tiếp cận quảng cáo YouTube ước tính | Tỷ lệ dân số | Thời điểm và lưu ý |
|---:|---|---:|---:|---|
| 1 | Ấn Độ | 500 triệu | 34,1% | Late 2025; trang country report. Trang tổng quan toàn cầu có số khác do khác snapshot/phương pháp, nên dùng như khoảng quy mô chứ không coi là số tuyệt đối. |
| 2 | Hoa Kỳ | 254 triệu | 73,0% | Late 2025 |
| 3 | Indonesia | 151 triệu | 52,7% | Late 2025 |
| 4 | Brazil | 150 triệu | 70,4% | Late 2025 |
| 5 | Mexico | 85,0 triệu | 64,3% | Late 2025 |
| 6 | Nhật Bản | 78,5 triệu | 63,9% | Late 2025 |
| 7 | Đức | 64,7 triệu | 77,1% | Late 2025 |
| 8 | Việt Nam | 62,1 triệu | 61,0% | Late 2025; tổng dân số 102 triệu |
| 9 | Philippines | 59,6 triệu | 50,9% | Late 2025 |
| 10 | Vương quốc Anh | 55,5 triệu | 79,7% | Late 2025 |
| 11 | Pháp | 51,5 triệu | 77,2% | Late 2025 |
| 12 | Thái Lan | 47,2 triệu | 65,9% | Late 2025 |
| 13 | Hàn Quốc | 42,9 triệu | 83,1% | Late 2025 |
| 14 | Tây Ban Nha | 39,0 triệu | 81,4% | Late 2025 |
| 15 | Canada | 33,0 triệu | 82,1% | Late 2025 |
| 16 | Argentina | 32,9 triệu | 71,7% | Late 2025 |
| 17 | Colombia | 31,0 triệu | 57,9% | Late 2025 |
| 18 | Ba Lan | 27,1 triệu | 71,3% | Late 2025 |
| 19 | Malaysia | 23,6 triệu | 65,4% | Late 2025 |
| 20 | Úc | 21,0 triệu | 77,7% | Late 2025 |
| 21 | Đài Loan | 18,1 triệu | 78,4% | Late 2025 |

Đọc cột tỷ lệ: Ấn Độ có reach tuyệt đối lớn nhất nhưng chỉ chiếm 34,1% dân số, nghĩa là người dùng YouTube phân bố rộng hơn nhiều nơi khác và không tập trung vào một nhóm tuổi hay một ngôn ngữ. Ở chiều ngược lại, Hàn Quốc (83,1%), Canada (82,1%) và Tây Ban Nha (81,4%) là nơi YouTube phủ gần như toàn bộ dân số, nên quy mô thị trường bị giới hạn bởi dân số chứ không phải bởi mức sử dụng.

Các báo cáo quốc gia dùng câu như “YouTube had X million users” trong phần ad-reach. DataReportal đồng thời cảnh báo rằng đây là audience planning estimate, không phải người dùng hoạt động. Vì phương pháp và số liệu được cập nhật, không trộn con số từ những năm hoặc bảng tổng hợp khác vào cùng một phép so sánh.

Nguồn: [DataReportal Digital 2026 Global Overview](https://datareportal.com/reports/digital-2026-global-overview-report), [India](https://datareportal.com/reports/digital-2026-india), [United States](https://datareportal.com/reports/digital-2026-united-states-of-america), [Indonesia](https://datareportal.com/reports/digital-2026-indonesia), [Brazil](https://datareportal.com/reports/digital-2026-brazil), [Mexico](https://datareportal.com/reports/digital-2026-mexico), [Japan](https://datareportal.com/reports/digital-2026-japan), [Germany](https://datareportal.com/reports/digital-2026-germany), [Vietnam](https://datareportal.com/reports/digital-2026-vietnam), [Philippines](https://datareportal.com/reports/digital-2026-philippines), [United Kingdom](https://datareportal.com/reports/digital-2026-united-kingdom), [France](https://datareportal.com/reports/digital-2026-france), [Thailand](https://datareportal.com/reports/digital-2026-thailand), [South Korea](https://datareportal.com/reports/digital-2026-south-korea), [Spain](https://datareportal.com/reports/digital-2026-spain), [Canada](https://datareportal.com/reports/digital-2026-canada), [Argentina](https://datareportal.com/reports/digital-2026-argentina), [Colombia](https://datareportal.com/reports/digital-2026-colombia), [Poland](https://datareportal.com/reports/digital-2026-poland), [Malaysia](https://datareportal.com/reports/digital-2026-malaysia), [Australia](https://datareportal.com/reports/digital-2026-australia), [Taiwan](https://datareportal.com/reports/digital-2026-taiwan).

**Xếp hạng theo mức phù hợp để bạn bắt đầu** (đây không phải xếp hạng RPM hay quy mô):

| Hạng | Thị trường | Lý do xếp hạng | Nội dung phù hợp để thử | Điều kiện |
|---:|---|---|---|---|
| 1 | Việt Nam, tiếng Việt | Có thể tự viết, kiểm tra nguồn và sửa nhanh; chi phí localization thấp nhất | Giải mã địa lý kinh tế/hạ tầng Việt Nam bằng bản đồ; lịch sử đời sống có nguồn; giải thích hệ thống cụ thể | Không đọc lại tin; dẫn nguồn và tạo visual riêng. |
| 2 | Tiếng Anh, ưu tiên audience Mỹ/Anh/Canada/Úc nhưng có thể toàn cầu | Reach lớn và một ngôn ngữ dùng được nhiều thị trường; có thể tận dụng nghiên cứu gốc Việt Nam | Công trình/hệ thống Việt Nam nhìn từ góc độ giải thích có nguồn; khoa học hoặc mô phỏng trong một micro-niche | Chỉ mở sau khi có format gốc chứng minh được; cần biên tập viên tiếng Anh và localization văn hóa. |
| 3 | Tiếng Tây Ban Nha | Nhiều thị trường có thể tiếp cận bằng một ngôn ngữ | Bản địa hóa tập tốt nhất, không dịch thẳng | Chọn audience cluster và người duyệt bản ngữ; Tây Ban Nha không đại diện hết Mỹ Latin. |
| 4 | Brazil, tiếng Bồ Đào Nha | Reach lớn và audience ngôn ngữ riêng | Dubbing/viết lại một loạt đã có dữ liệu | Cần biên tập viên tiếng Bồ Đào Nha Brazil. |
| 5 | Indonesia hoặc Đức | Mỗi thị trường có reach đáng kể và có thể chọn một nhóm cụ thể | Chỉ tái sử dụng format đã được kiểm chứng | Chọn một nước/ngôn ngữ, không mở đồng thời; cần người bản ngữ. |
| 6 | Nhật Bản, Hàn Quốc, Pháp và thị trường ngôn ngữ khác | Reach hiện hữu nhưng chi phí sai ngữ cảnh/biên tập cao nếu chỉ dịch tự động | Chỉ thử khi có biên tập viên bản địa | Không xếp cao chỉ vì RPM ước tính của bên thứ ba. |

Số liệu RPM trong bản trước, gồm các ước tính vidIQ/NexLev, là mô hình của công cụ bên thứ ba và snapshot theo một cấu hình cụ thể; chúng không được YouTube xác nhận và không phải RPM mà kênh mới sẽ nhận. RPM thật phụ thuộc nơi khán giả xem, chủ đề, thời lượng, loại quảng cáo, mùa và tỷ lệ video được kiếm tiền. Do đó, không xếp hạng chiến lược theo câu “quốc gia nào trả cao nhất” khi chưa có dữ liệu Studio của chính kênh.

**Ngôn ngữ lồng tiếng tự động:** trang trợ giúp YouTube hiện liệt kê 32 ngôn ngữ đích, trong đó có tiếng Anh, Đức, Pháp, Hindi, Indonesia, Nhật, Hàn, Bồ Đào Nha, Tây Ban Nha, Thái, Urdu và Việt. Tính năng và khả năng áp dụng có thể khác theo kênh/video; kiểm tra trong Studio trước khi lập kế hoạch, và vẫn cần duyệt giọng/thuật ngữ.

### 4.3 Xếp hạng loại nội dung

Xếp theo bốn tiêu chí: độ phù hợp với nguồn lực sản xuất hiện có, khả năng làm nội dung nguyên bản, có tín hiệu nhu cầu trong snapshot đã lưu, và rủi ro chính sách/độ chính xác. Đây không phải bảng xếp hạng doanh thu; phần RPM/search volume trong hàng nào dùng vidIQ/NexLev đều là snapshot bên thứ ba, chưa truy vấn lại.

| Hạng | Loại nội dung | Bằng chứng nhu cầu | Chỉ số doanh thu | Rủi ro chính sách | Hợp dây chuyền |
|---|---|---|---|---|---|
| 1 | Giải mã hạ tầng và địa lý kinh tế bằng bản đồ | Quét nội bộ 14/11/2026: nhiều video Việt về cảng, đường sắt, logistics và địa lý đạt 239.000-528.000 lượt; kênh quốc tế có video cùng thể loại đạt hàng triệu. | Nhóm giáo dục theo mô hình ước tính | Thấp nếu tự dựng bản đồ và có nguồn | Rất hợp |
| 2 | "Vì sao" trong một lĩnh vực hẹp | Cùng nhóm quét cho thấy câu hỏi về địa điểm cụ thể thu hút tốt trong nhiều tập | Nhóm giáo dục | Thấp | Hợp |
| 3 | Lịch sử dựa trên tài liệu gốc, video 30 đến 70 phút | Trong quét, các video lịch sử dài của kênh lớn đạt lượt xem cao (Sử Lược, EZ Sử) | Nhóm giáo dục | Trung bình: nội dung chiến tranh dễ bị hạn chế quảng cáo, cần chính xác tuyệt đối | Hợp |
| 4 | Mô phỏng bằng code giải thích hiện tượng (tiếng Anh) | Nhóm quét quốc tế `intl_code_simulation` có trung vị lượt xem cao, nhưng phần lớn đến từ Vsauce (371 video); kênh khác trong nhóm có 1-2 video | Nhóm giáo dục, khán giả toàn cầu | Thấp | Rất hợp, nhưng thắng thua theo từng video |
| 5 | Kịch bản giả định "what if" hoạt hình | Không có nhóm quét riêng; chỉ có tín hiệu từ snapshot vidIQ cũ | Nhóm giải trí, thấp hơn | Trung bình: dễ rơi vào "cùng tình huống, cùng kết cục" | Hợp |
| 6 | Luyện nghe tiếng Anh bằng truyện tự viết | Nhóm `vn_thieu_nhi_hoa_anh` trong quét (trung vị 496.273, nhiều video từ kênh lớn) | Khán giả là người học | Trung bình: đang tràn kênh AI | Hợp |
| 7 | Tâm lý, triết học tự sự (tiếng Anh) | Nhóm `intl_psychology_philosophy` trung vị 3.535.590 nhưng phần lớn đến từ TED-Ed/TEDx; có cả kênh mới trong snapshot vidIQ | Nhóm giáo dục | Cao: bão hòa kênh AI, dễ thành "nhân vật AI tư vấn chủ đề nhạy cảm" | Hợp |
| 8 | Truyện audio, truyện đêm khuya, truyện ma (tiếng Việt) | Nhóm `vn_truyen_audio`: trung vị 278.496, 50/50 video trên 10 phút, dẫn đầu là CHUYỆN MA CHÚ 3 DUY | Thấp hơn nhóm giáo dục trong mô hình ước tính | Cao nếu đọc lại truyện người khác | Hợp |
| 9 | Megaproject tiếng Anh chung chung | Nhóm `intl_megaproject`: 832 video, trung vị 11.000, dẫn đầu MegaBuilds 50.000 — nhiều video nhưng trung vị thấp | Nhóm giáo dục | Cao: làn sóng sao chép AI đang dâng | Hợp, nhưng không nên |
| 10 | Phim ngắn, recap, vietsub, nhạc remix, highlight bóng đá | Không có nhóm quét riêng; theo snapshot vidIQ cũ đây là phần lớn lượt tìm ở Việt Nam | Thấp nhất | Rất cao: nội dung dùng lại | Không nên |
| 11 | Thiếu nhi | Nhóm `vn_thieu_nhi_hoa_anh` có dữ liệu nhưng trộn nhiều thể loại | Hạn chế quảng cáo | Cao: có bộ nguyên tắc chất lượng riêng | Không nên |

Điểm quan trọng khi đọc cột "bằng chứng nhu cầu": nhiều nhóm trong bảng quét có trung vị lượt xem rất cao nhưng phần lớn đến từ một vài kênh lớn có thư viện video dài (Vsauce, RealLifeLore, TED-Ed, Sử Lược). Trung vị của nhóm không phải trung vị của một kênh nhỏ mới, và không phản ánh xác suất thắng.

### 4.4 Thị trường nào làm nội dung gì

Ví dụ trong cột cuối đến từ hai nguồn khác nhau và đã được đánh dấu. Số lượt xem từ snapshot vidIQ cũ không được truy vấn lại trong lượt cập nhật này.

| Thị trường | Nội dung đang chạy theo dữ liệu | Ví dụ và nguồn |
|---|---|---|
| Mỹ, Anh, Canada, Úc | Giải thích công trình và hạ tầng; lịch sử đời thường; khoa học và mô phỏng; chuyện kinh tế, doanh nghiệp | Snapshot vidIQ: "The 400 km Wall Japan Built to Stop the Sea" 4,9 triệu lượt từ kênh 13.300 người đăng ký; "Why Attacking a Sleeping Roman Army Was a Death Trap" 4,28 triệu lượt từ kênh 11.600 người đăng ký. Quét nội bộ: nhóm `intl_megaproject` có 832 video nhưng trung vị chỉ 11.000 lượt, dẫn đầu MegaBuilds 50.000. |
| Đức, Áo, Thụy Sĩ | Tài liệu về AI và công nghệ, lịch sử, triết học | Snapshot NexLev: FREMDFORM, Moralpredigt, Philosophie Verstehen (RPM ước tính 2,65 đến 3,95 USD) |
| Pháp | Tài liệu du lịch, lịch sử, khoa học | Snapshot NexLev: Sans Boussole, Origines Historiques (RPM ước tính 2,3 đến 3,6 USD) |
| Tây Ban Nha, Mỹ Latin | "What if" hoạt hình, khoa học cơ thể, lịch sử, tội phạm | Snapshot NexLev: Misterios Corporales 521.000 người đăng ký; Giro Imposible |
| Ấn Độ | Giải thích kinh tế, hạ tầng và lịch sử Ấn Độ | Snapshot vidIQ: "India Was Enslaved for Centuries, Now It's the World's 5th Biggest Power" 2,76 triệu lượt. Quét nội bộ: "37 SỰ THẬT ĐỊA LÝ KHÓ TIN VỀ ẤN ĐỘ" 333.559 lượt (GHIỀN ĐỊA LÝ, 08/05/2026). |
| Việt Nam | Giải mã hạ tầng và địa lý; lịch sử Việt có nguồn; "vì sao" một lĩnh vực; "what if" hoạt hình | Quét nội bộ, xem mục 6.3 |

### 4.5 Chính sách và khả năng bật kiếm tiền

**Ngưỡng tham gia YPP và chia sẻ doanh thu quảng cáo** (trang trợ giúp YouTube, đọc ngày 14/11/2026):

| Hạng mục | Hiện tại | Từ 01/02/2027 (kênh nộp mới) |
|---|---|---|
| Người đăng ký cho chia sẻ doanh thu quảng cáo | 1.000 | 1.000 |
| Giờ xem video dài công khai hợp lệ | 4.000 giờ trong 12 tháng | 8.000 giờ trong 365 ngày |
| Hoặc lượt xem Shorts công khai hợp lệ | 10 triệu trong 90 ngày | 20 triệu trong 90 ngày |
| Tiền từ Shorts Creator Pool | Theo điều kiện hiện hành | Phải giữ 10 triệu lượt xem Shorts trong 90 ngày |
| Duy trì trạng thái hoạt động | Có thể bị tắt nếu 6 tháng không đăng | Một trong ba: 1.000 giờ xem trong 365 ngày, 1 triệu lượt xem Shorts trong 90 ngày, hoặc 2 video dài hay 5 Shorts mỗi 90 ngày |
| Kênh đã trong chương trình | — | Không bị xét lại theo ngưỡng mới; phải chấp nhận điều khoản mới trước 31/01/2027 |

**YPP mở rộng (fan funding/Shopping, không phải chia sẻ doanh thu quảng cáo):** 500 người đăng ký, ít nhất 3 bài đăng công khai trong 90 ngày, và một trong hai điều kiện: 3.000 giờ xem công khai hợp lệ trong 12 tháng hoặc 3 triệu lượt xem Shorts công khai hợp lệ trong 90 ngày. Đây là tầng tính năng sớm; muốn chia sẻ doanh thu quảng cáo vẫn phải đạt ngưỡng cao hơn trong bảng trên.

Các điều kiện tài khoản/chính sách khác gồm ở quốc gia có chương trình, tuân thủ chính sách kiếm tiền, không có Community Guidelines strike đang hiệu lực, bật xác minh 2 bước và liên kết AdSense for YouTube. Hãy kiểm tra trang Earn để xem điều kiện cụ thể của kênh.

**Đã đối chiếu trực tiếp với trang thông báo chính thức** ([YPP changes, 01/02/2027](https://support.google.com/youtube/answer/12843009)), không chỉ qua báo chí. Trang chính thức xác nhận ngưỡng 8.000 giờ xem trong 365 ngày và 20 triệu lượt xem Shorts trong 90 ngày, và nêu điều kiện giữ 10 triệu lượt xem Shorts để không bị mất tiền từ Shorts Creator Pool. Trang cũng nêu: Premium Lite mở rộng tới mọi quốc gia có Premium, creator chia 60% doanh thu ròng của Premium Lite và 30% với lượt xem Premium; chương trình thưởng, production credit và earnings boost mới cho Shorts; quảng cáo nhắm mục tiêu có thể trả trực tiếp cho creator đủ điều kiện tới 45%; và một số creator phải chấp nhận Commerce Product Module để giữ doanh thu từ tính năng liên kết. Điều khoản cập nhật phải được chấp nhận trước 31/01/2027.

**Quốc gia có Chương trình Đối tác** (trang [YPP available areas](https://support.google.com/youtube/answer/7101720), đọc ngày 14/11/2026). Trang nêu tiêu đề "You can sign up for the YouTube Partner Program in the following countries and regions" và liệt kê khoảng 120 quốc gia và vùng lãnh thổ. Đã xác nhận trong danh sách: **Việt Nam, Hoa Kỳ, Ấn Độ, Indonesia, Brazil, Nhật Bản, Đức, Pháp, Vương quốc Anh, Canada, Úc, Mexico, Tây Ban Nha, Hàn Quốc, Thái Lan, Philippines, Đài Loan**, cùng Campuchia, Lào, Singapore, Thổ Nhĩ Kỳ, Ba Lan, Bồ Đào Nha, Italy và các nước khác trong danh sách. Trang ghi thêm creator ở Nga chưa thể đăng ký mới ở thời điểm hiện tại. Trang không tách riêng tầng mở rộng và tầng đầy đủ trong danh sách này; trang điều kiện YPP mới tách hai tầng ngưỡng. Vì vậy, kênh của bạn có thể nộp vào chương trình ở Việt Nam, nhưng mức chia sẻ doanh thu phụ thuộc ngưỡng bạn đạt và đánh giá của YouTube.

Một trang tổng hợp bên thứ ba (AIR Media-Tech) nói đơn nộp trước 23:59 UTC ngày 31/01/2027 vẫn được xét theo ngưỡng cũ. Bài chính thức của YouTube không ghi điều này, nên coi là chưa xác nhận.

**Người duyệt nhìn gì:** chủ đề chính của kênh, video nhiều lượt xem nhất, video mới nhất, phần chiếm nhiều thời gian xem nhất, tiêu đề, thumbnail, mô tả và phần giới thiệu kênh.

**Chính sách "inauthentic content"** (đã đọc lại trực tiếp từ [channel monetization policies](https://support.google.com/youtube/answer/1311392) ngày 14/11/2026). Trang ghi policy đã đổi tên từ "repetitious content" sang "inauthentic content" và định nghĩa nội dung không đủ điều kiện là nội dung **lặp hoặc sản xuất hàng loạt, không nguyên bản**. Các điểm chính theo nguyên văn trang:

- Kiếm tiền đòi hỏi tác phẩm nguyên bản, không "mass-produced, generic, repetitive, or manipulative".
- Video cùng một định dạng vẫn có thể đủ điều kiện nếu "the substance of each video should be materially varied" và có giá trị sáng tạo, giáo dục hoặc giải trí. Video theo khuôn, có thể hoán đổi lẫn nhau và không thêm giá trị thì không đủ điều kiện.
- **Nội dung dùng lại** là nội dung tái sử dụng mà không có "significant original commentary, substantive modifications, or educational or entertainment value". Nội dung có thể đủ điều kiện nếu người xem thấy được khác biệt có ý nghĩa so với nguồn, nhưng **được phép của tác giả gốc không tự động đủ điều kiện**.
- Trang không đưa ra danh sách ba nhóm cụ thể như bản cũ của tài liệu này từng trích. Các ví dụ như "công thức thao túng cảm xúc", "clip AI ghép không có mạch truyện" hay "nhân vật AI đóng vai chuyên gia tài chính" là cách diễn giải của tôi về rủi ro thực tế, không phải trích dẫn chính sách. Hãy kiểm tra lại trang trợ giúp khi quyết định một loại nội dung cụ thể.

**Khai báo nội dung tổng hợp** ([disclose altered or synthetic content](https://support.google.com/youtube/answer/14328491), đọc ngày 14/11/2026):

- **Phải khai báo** khi nội dung AI tạo hoặc bị thay đổi đáng kể mà trông như thật: làm người thật trông như nói hoặc làm việc họ không làm, sửa footage của sự kiện thật, tạo cảnh trông hiện thực nhưng chưa từng xảy ra, hoặc nhạc AI là nội dung trọng tâm của video.
- **Không phải khai báo** với nội dung rõ ràng là hoạt hình hoặc viễn tưởng, chỉnh sửa thẩm mỹ nhỏ, hoặc khi AI chỉ hỗ trợ sinh ý tưởng/dàn ý, tạo phụ đề, cải thiện kịch bản.
- Trang ghi việc khai báo không ảnh hưởng tới khả năng tiếp cận khán giả hay điều kiện kiếm tiền của video.

**Đối chiếu với các hướng nội dung** (đánh giá rủi ro của tôi, không phải kết luận của YouTube):

| Hướng | Rủi ro qua xét duyệt | Vì sao |
|---|---|---|
| Giải thích có kịch bản riêng, bản đồ tự dựng, có nguồn | Thấp | Mỗi video một câu hỏi và mạch riêng; giá trị giáo dục rõ |
| Truyện tự viết, nhiều giọng AI | Trung bình | Được nếu mỗi truyện khác nhau thật sự; dễ thành khuôn nếu cốt truyện na ná |
| Lịch sử kể bằng ảnh AI nối nhau | Trung bình cao | Nhiều khả năng bị xem là nội dung ít biến đổi giữa các video |
| Recap phim, vietsub, tuyển tập nhạc, đọc truyện người khác | Cao | Không có bình luận gốc, thay đổi thực chất hay giá trị giáo dục; đúng mô tả nội dung dùng lại |
| Video tự động từ footage stock và giọng máy, đăng hàng loạt | Cao | Khớp mô tả "sản xuất hàng loạt" trong chính sách |

## 5. Vì sao chọn hai thị trường theo thứ tự

Về tiền trên mỗi lượt xem, tiếng Anh thường cao hơn tiếng Việt khoảng một bậc, nên về dài hạn doanh thu có xu hướng nằm ở đó. Nhưng kênh mới tiếng Anh cạnh tranh cao và tăng chậm, còn ở Việt Nam các kênh giải thích mới đang đạt hàng trăm nghìn lượt trong vài tuần. Vì vậy:

- **Kênh tiếng Việt trước:** kiểm chứng format bằng dữ liệu thật trong 4 đến 6 tuần. Mốc 1.000 người đăng ký là một điều kiện YPP, không phải bảo đảm có thể đạt nhanh.
- **Kênh tiếng Anh sau:** dùng lại nghiên cứu và cảnh bản đồ của những video đã chứng minh, nhưng viết lại lời, ngữ cảnh và title cho khán giả đích. Mọi chữ trên hình là tham số để có thể bản địa hóa.

Điều kiện để cách này rẻ: hình không in cứng chữ tiếng Việt, mọi chữ trên hình là tham số của cảnh Remotion.

## 6. Phần C: Chọn ngách

### 6.1 Thu hẹp từ chủ đề xuống ngách

| Cấp | Nội dung | Vì sao dừng ở đây |
|---|---|---|
| Chủ đề | Video giải thích kiến thức | Ít rủi ro chính sách nhất trong nhóm nội dung dài hạn, và là nơi các đoạn video đã có tiền cao nhất theo mô hình ước tính. Quá rộng để làm. |
| Ngách | Địa lý kinh tế và hạ tầng | Có bằng chứng nhu cầu ở cả thị trường Việt và tiếng Anh; hợp dựng bằng bản đồ |
| Ngách con | Hạ tầng Việt Nam hiện tại: mỗi video trả lời một câu "vì sao nó nằm ở đó" hoặc "vì sao làm kiểu đó" về một địa điểm cụ thể | Đúng phần đang kéo lượt xem (mục 6.3); bạn đọc được nguồn gốc mà kênh nước ngoài không đọc được |
| Loạt mở màn | 10 đến 12 tập về cảng biển, sân bay, cao tốc, đường sắt, điện | Một loạt có chung lời hứa giúp người xem xem tiếp và đăng ký |

**Lời hứa của kênh, một câu:** mỗi tuần một địa điểm, một câu hỏi vì sao, trả lời bằng bản đồ.

Đây là định vị để thử, không phải lựa chọn đã được kiểm chứng. Mẫu bằng chứng ở mục 6.3 nhỏ và thiên lệch; xem mục 6.4 về rủi ro.

### 6.2 Khác gì các kênh đang có

- **So với kênh tin hạ tầng** (Việt Nam GO 103.000 người đăng ký, Land Kết Nối 27.900): họ chạy tin tiến độ, trung bình 19.000 đến 81.000 lượt mỗi video. Kênh này giải thích logic địa lý và kinh tế đằng sau, xem lại được sau nhiều năm.
- **So với kênh bản đồ lịch sử mới nổi** (Tọa Độ Xưa): họ trải từ lịch sử triều đại tới địa chính trị thế giới. Kênh này chỉ làm phần đang chạy tốt nhất của họ là hạ tầng và kinh tế hiện tại, và hiển thị nguồn cho từng con số.
- **So với kênh megaproject tiếng Anh do AI làm:** nguồn tiếng Việt gốc, bản đồ dựng thật, và có thể có cảnh tự quay tại chỗ.

### 6.3 Bằng chứng

**Video Việt Nam về hạ tầng và địa lý, có ngày đăng cụ thể** (lấy từ `_tools/niche_detail.json`, thu thập ngày 14/11/2026; xếp theo lượt xem):

| Ngày đăng | Kênh | Lượt xem | Thời lượng | Tiêu đề |
|---|---|---:|---:|---|
| 21/05/2026 | GHIỀN ĐỊA LÝ | 528.033 | 30:57 | 5 SIÊU THÀNH PHỐ TRỰC THUỘC TRUNG ƯƠNG TIẾP THEO CỦA VIỆT NAM |
| 25/01/2026 | CD Media - Why? | 501.936 | 14:39 | Vì Sao Phú Quốc Gần Campuchia Nhưng Vẫn Thuộc Việt Nam? |
| 03/10/2026 | Land Connect | 491.155 | 10:00 | 6 Weeks of Prep, 6 Hours of Pouring: Vietnam Railway Completes Unprecedented Feat! |
| 08/11/2026 | Tọa Độ Xưa | 387.578 | 15:15 | Bypassing Singapore: Why Are the World's Megaships Choosing the Cai Mep – Thi Vai Port? |
| 01/09/2026 | KIẾN THỨC THÚ VỊ Official | 399.347 | 13:15 | Giải thích kinh tế Đài Loan trong 10 phút |
| 08/05/2026 | GHIỀN ĐỊA LÝ | 333.559 | 34:11 | 37 SỰ THẬT ĐỊA LÝ KHÓ TIN VỀ ẤN ĐỘ: KỶ LỤC THIÊN NHIÊN THẾ GIỚI |
| 26/08/2026 | VỰA TIN | 239.339 | 11:04 | Vì Sao Việt Nam Dám Xây Hàng Trăm Dự Án Nghìn Tỷ: Tiền Ở Đâu Ra? |
| 11/11/2026 | Tọa Độ Xưa | 190.684 | 16:51 | Why Is Cam Ranh the Number 1 Natural Military Port in Southeast Asia? |
| 24/02/2026 | Spiderum | 114.080 | 18:41 | Tại sao LOGISTICS QUYẾT ĐỊNH VẬN MỆNH MỘT QUỐC GIA? |
| 04/11/2026 | Tọa Độ Xưa | 82.219 | 9:43 | Vì Sao Việt Nam Từng Xây Bức Tường Dài 127 Km? |
| 30/10/2026 | Tọa Độ Xưa | 52.696 | 7:45 | Cách biển chưa đầy 50 km, vì sao Lào vẫn là nước duy nhất ở Đông Nam Á không có biển? |

Ba điểm đọc được từ bảng này:

1. **Địa điểm cụ thể có thể tạo lời hứa rõ hơn danh sách địa lý chung.** Trong mẫu có các video về Phú Quốc, cảng Cái Mép và đường sắt đạt hàng trăm nghìn lượt; video danh sách địa lý cũng có thể đạt cao, nhưng số liệu không cho phép kết luận một kiểu luôn thắng.
2. **So sánh với một địa danh/đối thủ người xem biết có thể là góc đóng gói tốt.** "Bypassing Singapore" đạt 387.578 lượt và "Vì Sao Phú Quốc Gần Campuchia" 501.936 lượt; đây là giả thuyết về cách đóng gói, chưa chứng minh quan hệ nhân quả.
3. **Không phải kênh mới nào cũng chạy.** Cùng nhóm quét có các video mới chỉ 1.244 đến 4.120 lượt xem. Kết quả chênh lệch lớn ngay trong cùng nhóm chủ đề.

Mẫu này giúp hình thành giả thuyết pilot, không đủ để đo xác suất thành công, retention, CTR hoặc doanh thu.

**Cùng kênh, kết quả rất khác nhau.** Sáu video của Tọa Độ Xưa có chi tiết ngày đăng:

| Ngày đăng | Video | Thời lượng | Lượt xem |
|---|---|---:|---:|
| 08/11/2026 | Bypassing Singapore... | 15:15 | 387.578 |
| 11/11/2026 | Why Is Cam Ranh... | 16:52 | 190.684 |
| 04/11/2026 | Vì Sao Việt Nam Từng Xây Bức Tường Dài 127 Km? | 9:43 | 82.219 |
| 30/10/2026 | Cách biển chưa đầy 50 km, vì sao Lào vẫn không có biển? | 7:45 | 52.696 |
| 29/10/2026 | Vì Sao Singapore Bị Tách Khỏi Malaysia Năm 1965? | 9:47 | 26.691 |
| 02/11/2026 | Phù Nam biến mất 1.400 năm... | 7:18 | 20.548 |

Sáu video này không chứng minh quy luật nào: độ dài, ngày đăng, mức độ quen thuộc của đề tài và đối thủ so sánh đều thay đổi cùng lúc. Điều duy nhất quan sát được là đề tài hạ tầng cụ thể đang có sức hút mạnh ở Việt Nam.

**Chỉ số tương tác.** Trong nhóm hạ tầng và địa lý Việt Nam (55 video có đủ like và comment), tỷ lệ like trung vị là 0,62% và bình luận 0,085%; ở nhóm mô phỏng bằng code quốc tế (47 video), like là 2,73% và bình luận 0,127%. Chỉ số tương tác này được tính từ video nằm trong nhóm quét, không chứng minh rằng người xem của ngách "vì sao" ít đăng ký hơn. Tỷ lệ người đăng ký trên lượt xem ở báo cáo vidIQ cũ là một nguồn khác, dùng mẫu đã lọc và không truy vấn lại được ở phiên này. Không dùng hai chỉ số thay thế cho nhau.

**Tín hiệu khác ở thị trường Việt (snapshot vidIQ cũ, chưa truy vấn lại):**

- "Container Quay Lưng Với Cao Tốc: Vì Sao Tài Xế Thà Bò Trên Quốc Lộ?" (VỰA TIN, 73.100 người đăng ký): 480.542 lượt xem sau 3 đến 4 ngày.
- "Việt Nam có thể sẽ làm đường điện xuyên biển dài nhất thế giới" (Giải Thích Dễ Hiểu, 191 người đăng ký): 38.194 lượt xem sau 2 ngày.
- Lượt tìm mỗi tháng tại Việt Nam: "kiến thức thú vị" 493.302; "lịch sử" 265.884; "kinh tế" 94.395; "sân bay long thành" 58.351. Đây là snapshot vidIQ cũ, không truy vấn lại được trong lượt cập nhật.

**Tín hiệu ở thị trường tiếng Anh (snapshot vidIQ cũ):**

- Video về Việt Nam: "Why Vietnam's Economic Boom Is So Fragile" 450.000 lượt (kênh 198.000 người đăng ký); "Vietnam Is Dumping 100 Million Cubic Meters of Material Into the Sea to Build a Massive Megacity" 115.200 lượt (kênh 75.800); "30 Insane Geography Facts About Vietnam" 71.100 lượt (kênh 7.200); "Life in Vietnam: Why the Country Is Getting Rich So Fast" 35.200 lượt (kênh 292).
- "20 Years on a Tiny Boat: How They Eat, Sleep and Make Money on the River" của kênh Mekong Delta Life (7.100 người đăng ký): 3,96 triệu lượt.
- Từ khóa "vietnam economy": 22.230 lượt tìm mỗi tháng, tăng 89,5%, cạnh tranh 54 trên 100.
- Chưa thấy kênh tiếng Anh nào chuyên giải thích hạ tầng và địa lý Việt Nam, Đông Nam Á bằng nguồn bản địa. Các kênh gần nhất là kênh megaproject chung và kênh du lịch, sống ở nước ngoài.

### 6.4 Lợi thế riêng và rủi ro

Lợi thế:

1. Đọc được quy hoạch, báo cáo dự án, báo chí tiếng Việt. Kênh nước ngoài làm về Việt Nam thường dựa vào tin tiếng Anh thứ cấp.
2. Dây chuyền dựng bằng code: bản đồ và sơ đồ tự dựng là nội dung gốc theo đúng nghĩa của chính sách, và đổi ngôn ngữ chỉ cần đổi tham số.
3. Ở Việt Nam: có thể tự quay vài cảnh tại chỗ. Cảnh tự quay là thứ kênh AI không sao chép được.

Rủi ro và cách giảm:

| Rủi ro | Cách giảm |
|---|---|
| Làn sóng bão hòa nhanh: trong nhóm quét đã có nhiều video hạ tầng/địa lý đạt hàng trăm nghìn lượt chỉ trong vài tuần | Vào sớm, giữ một ngách con hẹp, hơn nhau ở độ chính xác, chất lượng bản đồ và nguồn dẫn |
| Sai số liệu | Sổ nguồn: không con số nào vào kịch bản khi chưa có dòng nguồn. Ghi nguồn trên hình hoặc trong mô tả. |
| Bản đồ chủ quyền | Dùng bản đồ Việt Nam có đủ Hoàng Sa, Trường Sa; soát từng khung có bản đồ nền lấy từ nguồn nước ngoài. Đây vừa là yêu cầu pháp lý trong nước vừa là điều khán giả Việt rất để ý. |
| Chủ đề quân sự | Nên tránh suy đoán về năng lực quân sự, căn cứ. Dễ bị hạn chế quảng cáo và có rủi ro pháp lý. Giữ ở hạ tầng dân sự và kinh tế. |
| Hình AI như thật về địa điểm thật | Ưu tiên bản đồ, sơ đồ, cảnh tự quay, footage có license. Nếu dùng hình AI trông như ảnh thật của một công trình thật thì phải bật khai báo. |
| Tiền quảng cáo ở Việt Nam thấp | Không xây kế hoạch chi phí dựa trên RPM mẫu; thử thêm ngôn ngữ/thị trường sau khi có video được kiểm chứng, người biên tập phù hợp và dữ liệu thực của kênh. |

Tôi không bảo đảm được ngách này thành công. Bằng chứng là một nhóm video có tín hiệu trong quét nội bộ và một số kênh mới trong vài tuần gần đây, đủ để đặt cược có kiểm soát, chưa đủ để chắc chắn.

### 6.5 Phương án dự phòng

| Phương án | Khi nào chuyển sang | Điểm yếu |
|---|---|---|
| A. "Vì sao" trong một lĩnh vực hẹp khác (đường sắt, tàu biển, điện, xây dựng) | Nếu khâu bản đồ quá tốn công so với kết quả | Dễ sao chép; tỉ lệ người đăng ký trên lượt xem thấp nhất trong bốn kênh mẫu (0,15%) |
| B. Lịch sử Việt Nam theo tài liệu gốc, video 30 đến 60 phút | Nếu ưu tiên giờ xem và bạn thật sự mê sử | Nhạy cảm, cần chính xác tuyệt đối, dễ bị hạn chế quảng cáo ở nội dung chiến tranh |
| C. Mô phỏng bằng code giải thích hiện tượng (tiếng Anh) | Làm thử nghiệm song song sau khi kênh chính ổn | Thắng thua theo từng video; các bản làm theo chỉ đạt khoảng 1.000 lượt |

Về kênh Room English đang có (theo vidIQ: 216 người đăng ký, 151 video, 53.931 lượt xem): ngách mới nên là một kênh mới, vì khán giả và lời hứa khác hẳn. Tôi chưa phân tích sâu kênh này trong tài liệu.

### 6.6 Mười hai đề tài mở màn

Đây là đề tài gợi ý. Mọi con số và nhận định phải qua sổ nguồn trước khi viết; đề tài nào không đứng vững trước tài liệu gốc thì bỏ.

1. Vì sao miền Bắc phải ra tận Lạch Huyện mới làm được cảng nước sâu?
2. Vì sao sân bay Long Thành nằm cách trung tâm TP.HCM khoảng 40 km?
3. Vì sao làm cao tốc ở miền Tây đắt và chậm hơn nơi khác?
4. Vì sao đường sắt Việt Nam dùng khổ 1 mét, và điều đó trói buộc gì?
5. Vì sao điện phải đi dọc đất nước bằng đường dây 500 kV?
6. Vì sao miền Trung nhiều cảng biển mà ít hàng?
7. Vì sao Hà Nội ngập vì mưa, còn TP.HCM ngập vì triều?
8. Vì sao Tây Nguyên chưa có đường sắt nối xuống biển?
9. Vì sao hàng từ khu công nghiệp ra cảng mất nhiều giờ dù chỉ cách vài chục km?
10. Vì sao Phú Quốc phải kéo điện vượt biển?
11. Vì sao Đà Nẵng nằm giữa đất nước mà chưa thành trung tâm trung chuyển?
12. Vì sao hai đầu tàu kinh tế cách nhau hơn 1.600 km lại là bài toán logistics lớn nhất của Việt Nam?

Công thức tiêu đề rút từ video chạy tốt nhất: một câu hỏi vì sao, một địa điểm cụ thể, và nếu có thể thì một đối thủ nổi tiếng để so sánh. Thời lượng nhắm 12 đến 16 phút.

## 7. Phần D: Kế hoạch theo giai đoạn

### 7.1 Phép tính ngưỡng

Với dạng video này, **1.000 người đăng ký là một trong các nút thắt, nhưng không thể kết luận từ mẫu nhỏ rằng giờ xem không phải nút thắt.**

- Kênh trong mẫu vidIQ đã lưu cho thấy tỷ lệ người đăng ký trên lượt xem khoảng 0,15 đến 0,44 trên 100 lượt xem, tương ứng khoảng 225.000 đến 650.000 lượt xem để đạt 1.000 người đăng ký. Mẫu đó không được truy vấn lại ở phiên này, nên chỉ dùng làm kịch bản tham khảo.
- Video dài 14 phút với giả định average view duration bằng 35-45% (giả định, thay bằng YouTube Studio) và 300.000 lượt xem tạo khoảng 24.000-31.500 giờ xem. Phép tính này chỉ cho thấy giờ xem *có thể* đủ trước subscriber nếu lượt xem và retention đạt giả định; không dự báo hiệu suất.

Hệ quả: theo dõi cả lượt xem có chất lượng, watch time, returning viewers và tỷ lệ người xem đăng ký. Không chọn một chỉ số duy nhất để định nghĩa thành công.

Lưu ý về cách áp ngưỡng: ngưỡng 8.000 giờ áp dụng cho kênh nộp mới từ 01/02/2027; kênh đủ điều kiện/nộp trước ngày đó cần theo quy tắc hiện hành trong tab Earn và thông báo chính thức. Đừng dựa vào mốc 31/01 để quyết định nếu tab Earn hoặc YouTube Help không xác nhận điều kiện cụ thể. Ước tính ở trên là phép tính theo giả định, không thay số liệu YouTube Studio.

Kỳ vọng thu nhập quảng cáo theo mô hình vidIQ, chỉ để hình dung:

| Mốc | Ước tính mỗi tháng (thấp / giữa / cao) |
|---|---|
| Kênh Việt, 300.000 lượt xem mỗi tháng | 62 / 103 / 164 USD |
| Kênh Việt, 1 triệu lượt xem mỗi tháng | 205 / 342 / 547 USD |
| Kênh tiếng Anh khán giả Mỹ, 150.000 lượt xem mỗi tháng | 308 / 513 / 821 USD, trước thuế khấu trừ của Mỹ |

Kết quả từng video lệch nhau rất mạnh: trong nhóm quét nội bộ, các video Việt Nam về hạ tầng/địa lý nằm trong khoảng 1.244 đến 528.033 lượt xem cùng thể loại. Đừng đánh giá ngách trước khi có ít nhất 10 video.

### 7.2 Các giai đoạn

Các giai đoạn dưới đây là mốc làm việc gợi ý tính từ ngày bắt đầu, không phải dự báo tăng trưởng. Dừng hoặc đổi nhịp nếu thời gian thực tế không cho phép giữ chất lượng.

**Lộ trình ngắn theo giai đoạn:**

1. **Nền móng, tuần 1:** chốt lời hứa kênh; tạo sổ nguồn/fact ledger; chọn ba câu hỏi có nguồn; dựng prototype 60-90 giây có bản đồ, giọng đọc, subtitle và đo giờ/chi phí.
2. **Pilot, tuần 2-4:** sản xuất ba video dài cùng micro-niche và một đến hai Shorts độc lập từ mỗi video; duyệt thủ công nội dung, nguồn, rights, thumbnail, phụ đề và âm thanh.
3. **Đọc dữ liệu, ngày 30-60:** ghi impressions/CTR theo nguồn traffic, retention, watch time, returning viewers, subscriber conversion; mỗi vòng chỉ đổi một biến chính.
4. **Củng cố, ngày 61-90:** làm thêm tập cùng nhóm chủ đề có tín hiệu, playlist/end screens, đánh giá khả năng duy trì chất lượng và sản lượng. Kiểm tra điều kiện YPP trong YouTube Studio.
5. **Thị trường hai:** sau khi format gốc đã có audience quay lại, chọn một ngôn ngữ, viết lại title/ví dụ/context với biên tập viên bản địa; thử nhóm nhỏ rồi mới quyết định mở rộng.

**Giai đoạn 0: Nền móng (15/11 đến 22/11/2026)**

- Chốt tên kênh, handle, lời hứa một câu, phần giới thiệu kênh có nói rõ cách làm và cách dẫn nguồn (người duyệt đọc phần này).
- Chốt ngôn ngữ hình: bảng màu bản đồ, phông chữ, kiểu nhân vật.
- Dựng 5 cảnh kỹ thuật dùng lại: bay từ quả địa cầu xuống địa điểm, vẽ tuyến đường, mặt cắt độ sâu hoặc độ cao, thanh so sánh, ghim kèm nhãn. Mọi chữ là tham số.
- Lập sổ nguồn và mẫu ghi license tư liệu.
- Nghe so sánh Vibi với VieNeu trên cùng một đoạn 60 giây, chọn một giọng.
- Viết xong 3 kịch bản đầu, tiêu đề và thumbnail chốt trước khi viết.
- Cổng duyệt: bạn đọc kịch bản số 1 và xác nhận đây là kênh bạn muốn làm.

**Giai đoạn 1: Sáu đến tám video thử nghiệm (23/11 đến 20/12/2026)**

- Nhịp A, khoảng 16 đến 20 giờ mỗi tuần: 2 video dài và 2 Shorts. Nhịp B, khoảng 8 đến 10 giờ: 1 video dài và 2 Shorts.
- Mỗi video thử một biến: kiểu câu hỏi, có hay không đối thủ so sánh, 10 phút hay 15 phút.
- Sau mỗi video: tải file retention từ Studio, chạy `yt-retention`, ghi một bài học vào sổ.
- Cổng 1 (tiêu chí nội bộ, không phải ngưỡng của YouTube), ngày 20/12: đã đăng ít nhất 6 video dài; có ít nhất 1 video từ 20.000 lượt xem hoặc kênh đạt 50.000 lượt; tỉ lệ người đăng ký trên lượt xem từ 0,2%. Không đạt thì đổi cách đóng gói và nhóm đề tài trước, chưa đổi ngách.

**Giai đoạn 2: Tăng tốc tới ngưỡng (21/12/2026 đến 31/01/2027)**

- Làm thêm các video cùng nhóm với video chạy tốt nhất. Bỏ nhóm đề tài yếu.
- Thêm playlist theo loạt, màn hình kết thúc dẫn sang tập liên quan, lời mời đăng ký gắn với lời hứa của loạt.
- Mục tiêu vươn: nếu đạt 1.000 người đăng ký và 4.000 giờ xem trước 31/01/2027 thì nộp đơn ngay để có cơ hội được xét theo ngưỡng hiện hành. Ngưỡng 4.000 giờ chỉ áp dụng cho kênh nộp trước thời điểm chuyển đổi; hãy kiểm tra tab Earn. Mục tiêu này cần ít nhất một video bùng nổ, nên là mục tiêu vươn, không phải cam kết.
- Cổng 2, ngày 31/01: từ 1.000 người đăng ký, hoặc từ 150.000 lượt xem tổng. Không đạt cả hai thì cân nhắc phương án A hoặc B ở mục 6.5.

**Giai đoạn 3: Bật kiếm tiền và mở kênh tiếng Anh (tháng 02 đến tháng 04/2027)**

- Nộp đơn khi đủ ngưỡng; khai thông tin thuế trong AdSense.
- Cổng 3 để mở kênh tiếng Anh: kênh Việt có ít nhất 10 video dài, ít nhất 2 video từ 50.000 lượt, thời gian làm mỗi video còn dưới 8 giờ.
- Thí điểm 4 video tiếng Anh từ 4 video Việt tốt nhất. Viết lại cho khán giả quốc tế, không dịch nguyên văn: thêm bối cảnh, đổi phép so sánh, đổi tiêu đề.
- Không đăng bản dịch tự động gần như y hệt lên cùng một kênh.

**Giai đoạn 4: Mở rộng nguồn thu (tháng 05 đến tháng 10/2027)**

- Thử lồng tiếng tự động của YouTube trên kênh tiếng Anh cho tiếng Đức và Tây Ban Nha; đo trước khi đầu tư thêm.
- Nguồn thu ngoài quảng cáo phù hợp khán giả của ngách: tài trợ từ doanh nghiệp logistics, bất động sản, tài chính; hội viên kênh. Công khai mọi quan hệ thương mại.
- Mở loạt thứ hai sang láng giềng Đông Nam Á nếu loạt Việt Nam đã cạn đề tài mạnh.

### 7.3 Dùng vidIQ thế nào cho tiết kiệm

**Trạng thái credit:** con số 375 credit còn lại (từ 510, đã dùng 135) là ảnh chụp sau 27 lượt truy vấn trong phiên nghiên cứu trước đó. Trong lượt kiểm chứng ngày 14/11/2026, connector vidIQ không phản hồi nên **không xác minh được số dư hiện tại, hạn mức gói hay ngày làm mới**. Trước khi lên kế hoạch ngân sách credit, hãy mở trang tài khoản vidIQ để xác nhận. Giả định còn dùng cho bảng dưới: hạn mức theo gói 150 credit mỗi tháng, làm mới ngày 26/11/2026, mỗi truy vấn nghiên cứu tốn 5 credit.

| Việc | Tần suất | Credit mỗi tháng |
|---|---|---|
| Quét video bùng nổ trong ngách (một truy vấn tiếng Việt, một tiếng Anh) | Mỗi tuần | 40 |
| Xem video mới của 2 kênh đối thủ chính | Hai tuần một lần | 20 |
| Kiểm tra lượt tìm cho lô đề tài sắp làm | Mỗi tháng | 10 đến 15 |
| Dự phòng | — | 20 |

Khoảng 90 đến 95 credit mỗi tháng, nằm trong hạn mức 150. Việc không tốn credit: `yt-viral` đọc danh sách công khai, thanh gợi ý tìm kiếm của YouTube, tab Nghiên cứu trong Studio, và `youtube-transcript-api` để lấy transcript.

## 8. Việc cần bạn quyết định

1. Đồng ý ngách ở mục 6, hay chọn một phương án dự phòng.
2. Quỹ thời gian mỗi tuần, để chốt nhịp A hay nhịp B.
3. Tên kênh và giọng đọc.
4. Bạn có thể tự quay vài địa điểm không. Nếu có, đề tài đầu tiên nên chọn theo nơi bạn tới được.

## 9. Khác gì so với các file cũ trong thư mục

- Các file cũ ghi ngưỡng 4.000 giờ xem như điều kiện bắt buộc lâu dài. Ngưỡng này áp dụng cho kênh nộp mới tới 31/01/2027; từ 01/02/2027 ngưỡng là 8.000 giờ trong 365 ngày hoặc 20 triệu lượt xem Shorts trong 90 ngày. Đã đối chiếu trang thông báo chính thức.
- File kế hoạch cũ chọn hướng truyện đêm khuya nhiều giọng. Dữ liệu lần này xếp nhóm truyện audio tiếng Việt thấp trong bảng vì tiền trên lượt xem thấp nhất trong mô hình ước tính (0,09 đến 0,14 USD mỗi 1.000 lượt) và thị trường đã rất đông.
- Phần đánh giá repo về cơ bản cùng hướng; điểm mới là điều kiện tài khoản của Muse, trạng thái từng repo tính tới 14/11/2026 và vai trò của thư viện bản đồ trong shorts-kit.
- Bảng thị trường ở mục 4.2 nay dùng 21 quốc gia lấy trực tiếp từ trang country report của DataReportal, thay cho một dòng số tổng hợp qua Statista. Số 518 triệu (Ấn Độ) và 259 triệu (Mỹ) trong bản cũ đã bị thay bằng 500 triệu và 254 triệu theo trang quốc gia.
- Bảng xếp hạng RPM theo quốc gia đã bị gỡ khỏi phần "kết luận nhanh" và chuyển thành mục 4.1 có ghi rõ giới hạn, vì nó là mô hình bên thứ ba chứ không phải số của YouTube.
- Việc dùng tiếng Việt trước, tiếng Anh sau là lựa chọn dựa trên năng lực biên tập và lợi thế nguồn hiện có; không kết luận rằng thị trường tiếng Anh chắc chắn sinh lời hơn. Cần thử bằng analytics và chi phí sản xuất thực tế.

## 10. Kết luận điều hành: nội dung nào nên thử trước

**Ưu tiên thử một kênh tiếng Việt về địa lý kinh tế và hạ tầng dân dụng Việt Nam, kể bằng bản đồ và sơ đồ tự dựng.** Micro-niche mở màn: mỗi tập giải thích vì sao một công trình/tuyến đường nằm ở vị trí đó và bài toán kinh tế/kết nối mà nó giải quyết. Kênh này hợp lợi thế nguồn tiếng Việt và năng lực sản xuất trực quan trong workspace hơn việc bắt đầu bằng một kênh tiếng Anh cạnh tranh cao. Đây là đề xuất thí điểm dựa trên mẫu video quét và các báo cáo đang có, không phải kết luận rằng ngách này chắc chắn có tiềm năng kiếm tiền cao.

Không coi đây là quyết định mở rộng không thể đảo ngược. Làm 3 video pilot cùng một lời hứa, rồi tiếp tục một loạt 8-12 video nếu các tín hiệu trong YouTube Studio cho thấy audience phù hợp, người xem quay lại và nhóm có thể duy trì chất lượng. Nếu hình thức bản đồ quá tốn công, phương án gần nhất là “vì sao” về một hệ thống hẹp như logistics, đường sắt hoặc năng lượng; vẫn dùng nguồn và visual tự biên tập.

### Lộ trình cô đọng

| Giai đoạn | Việc cần hoàn thành | Cổng quyết định |
|---|---|---|
| 0. Nền móng, tuần 1 | Chốt lời hứa kênh; lập fact ledger; chọn 3 câu hỏi có nguồn; dựng prototype 60-90 giây với bản đồ/voice/subtitle; đo thời gian và chi phí. | Người duyệt xác nhận độ chính xác, chất lượng và khả năng sản xuất. |
| 1. Pilot, tuần 2-4 | Đăng 3 video dài cùng micro-niche; mỗi video có một câu hỏi; làm 1-2 Shorts độc lập từ mỗi video dài; duyệt nguồn, bản quyền, title/thumbnail và kỹ thuật. | Không kết luận từ một video; xác định biến nào cần thử tiếp. |
| 2. Học audience, ngày 30-60 | Tiếp tục format; ghi impressions/CTR theo traffic source, retention, watch time, returning viewers, đăng ký và nguồn traffic; mỗi vòng thử một thay đổi chính. | Nếu packaging tốt mà rời sớm, sửa lời hứa/opening; nếu nhiều tập yếu, xem lại audience và micro-niche. |
| 3. Củng cố, ngày 61-90 | Mở rộng series đang có tín hiệu, tạo playlist/end screen; kiểm tra Earn tab và khả năng duy trì chất lượng, chi phí, giờ công. | Chỉ tăng sản lượng khi pipeline và quyền media vẫn được kiểm soát. |
| 4. Thị trường hai | Bản địa hóa 4-6 video tốt nhất sang một ngôn ngữ; viết lại ví dụ/title và có biên tập viên bản ngữ; thử trên một nhóm nhỏ. | So sánh retention, returning viewers và chi phí; không mở nhiều ngôn ngữ một lúc. |

Các ngưỡng 500/1.000 subscriber hoặc tỷ lệ CTR/retention không phải bảo đảm tăng trưởng. Theo dõi tiêu chí YPP hiện hành và thay đổi chính thức từ 01/02/2027; không mua tương tác.

## 11. Tham khảo kỹ thuật: dùng quy trình và công cụ

Phần này viết sau khi kiểm tra thực tế trên máy ngày 14/11/2026: đã chạy thử hai script của `youtube-agent-skill` bằng tiếng Việt, đọc registry năng lực của OpenMontage, đọc README và tài liệu gốc của `shorts-kit`, `rea-video`, `CIT Voice Studio`. Lệnh nào chưa chạy thử thì ghi rõ.

### 11.1 Công cụ đã có sẵn trên máy

| Công cụ | Trạng thái | Ghi chú |
|---|---|---|
| Bun | 1.3.14 | Đủ cho `shorts-kit` (yêu cầu 1.3 trở lên) |
| Node | v22.20.0 | Có |
| Python | 3.12.10 | Có, `uv` 0.11.29 cũng có |
| FFmpeg | 9.0.2 | Có |
| OpenMontage runtime | ffmpeg, remotion, hyperframes: đủ 3 | `tools/tool_registry` chạy được |
| `youtube-agent-skill` | 11 skill đã cài trong `.agents/skills/youtube-agent-skill__yt-*` | 6 script Python, không cần API key |
| Vibi TTS | `tools/audio/vibi_tts.py` đã nối với OpenMontage | Chạy được trong cả hai chế độ `--text-file` và `--project` |
| CIT Voice Studio | Chưa cài. Thư mục `C:\Users\ACER\Desktop\OpenCreator-Phong` có sẵn | Chỉ có API nội bộ, không có CLI |
| `shorts-kit` | **Đã cài 15/11/2026** | Clone `C:\Users\ACER\Desktop\shorts-kit`, commit `828e120` (v2.0.0), MIT, `bun install` xong 301 package. Xem mục 11.3. |
| `rea-video` | Chưa clone | Cần `pip install -e ".[ocr]"` |

Năng lực OpenMontage đang cấu hình (từ `provider_menu`):

| Nhóm | Đang có | Đang thiếu | Ảnh hưởng tới kế hoạch |
|---|---|---|---|
| TTS | `openai_tts`, `piper_tts`, `vibi_tts` | 16 provider khác | Đủ cho tiếng Việt qua Vibi. Cần thêm cho tiếng Anh thì dùng `openai_tts` |
| Sinh ảnh | `image_gen`, `openai_image`, `pixabay_image` | 26 provider | Đủ cho hình minh họa nếu chỉ cần vài trăm ảnh. Không sinh video bằng AI được, không làm được phim ngắn AI |
| Sinh video | `pixabay_video` | 32 provider | Chỉ lấy được footage có sẵn. Không có provider sinh video AI |
| Nhạc | `pixabay_music` | 6 provider sinh nhạc, `music_library` | Phải dùng nhạc có license từ Pixabay, hoặc tạo nhạc nền bằng `acestep` có sẵn trong workspace |
| Thế giới 3D | `threejs_world` | `3d_world_rendering` | Dựng được khối 3D bằng code. Chưa có renderer 3D (Blender) nên chỉ nên dùng cho hình khối đơn giản, không dựng phong cảnh |
| Phụ đề | `subtitle_gen`, `remotion_caption_burn` | — | Đủ. Nên `subtitle_gen` rồi tải SRT lên YouTube thay vì in chữ vào hình |
| Đồ họa | `diagram_gen`, `code_snippet` | 1 provider | Đủ cho sơ đồ kỹ thuật |
| Phân tích | 10/15 provider gồm `scene_detect`, `frame_sampler`, `visual_qa`, `video_analyzer`, `vibi_stt` | 5 provider | Đủ để tự kiểm tra video trước khi đăng |
| Xuất bản | `export_bundle` | — | Chỉ xuất gói, không tự đăng. Đăng bằng tay qua YouTube Studio |

Hai điểm quan trọng cho ngách đề xuất:

1. **Máy không sinh được video AI.** Với ngách bản đồ, điều này không phải hạn chế: video dựng bằng code là nội dung gốc, đúng ý chính sách. Nhưng nó có nghĩa là mọi cảnh phải dựng được bằng Remotion, three.js hoặc Blender, không dựa vào hình AI sinh sẵn.
2. **Không có provider 3D render.** Nếu muốn có địa hình 3D thật (núi, đường hầm, cầu), phải cài thêm `3d_world_rendering`. Trước khi cài, hãy kiểm tra yêu cầu phần cứng: workflow WAN 2.2 14B đi kèm được khuyến nghị cho 16 GB VRAM, workflow low-VRAM tự chế có thể chạy ở 8 đến 12 GB tuỳ độ phân giải và số khung hình.

### 11.2 Những gì cần cài thêm, và cách cài

**shorts-kit (khuyến nghị cao nhất).** Đây là phần còn thiếu quan trọng nhất: thư viện bản đồ, sổ nguồn và bộ quy trình.

```bash
cd C:/Users/ACER/Desktop
git clone https://github.com/howznguyen/shorts-kit.git
cd shorts-kit
bun install
bun run facts          # kiểm tra sổ nguồn, trả về mã lỗi nếu sai
```

Kỳ vọng sau khi cài: có `src/shared/map/` với `SatelliteMap`, `VectorLayer`, `Route`, `Pin`, `Measure`, `VietnamMap`; có `src/shared/map/data/vietnam-data.ts` với dữ liệu Hoàng Sa và Trường Sa; có `docs/facts/facts.json` và `sources.json`; có `docs/visuals/satellite-map.md` và `globe.md` mô tả cách dùng. Ba lệnh dữ liệu cần biết:

| Lệnh | Việc | Ghi chú |
|---|---|---|
| `bun run satellite <id>` | Tải ảnh vệ tinh EOX Sentinel-2 không mây cho từng cảnh, ghép thành mosaic, ghi `public/img/sat/<id>/`, cập nhật `src/videos/<id>/satellite.json` và ghi nguồn EOX vào `docs/facts/sources.json` | Ảnh là năm 2016. Nếu video nói về thay đổi mới thì phải ghi rõ là ảnh năm 2016 |
| `bun run geo <id>` | Rút bờ biển, đường biên giới, sông từ Natural Earth cho đúng khu vực, rút gọn còn khoảng nửa pixel | `bun run geo --vietnam` dựng lại bộ dữ liệu Việt Nam có sẵn |
| `bun run facts` | Kiểm tra cả hai file sổ nguồn, lỗi thì trả về mã 1 | `bun run lint <id>` kiểm tra kêm: dòng lời dẫn có trích dẫn một fact không tồn tại hoặc chưa xác minh thì lỗi |

Ảnh vệ tinh EOX là CC BY 4.0, nên dòng ghi nguồn phải hiện trên hình và lặp lại ở bình luận ghim.

### 11.3 Trạng thái cài đặt thực tế (15/11/2026)

- Đã clone [`howznguyen/shorts-kit`](https://github.com/howznguyen/shorts-kit) vào `C:\Users\ACER\Desktop\shorts-kit` tại commit `828e120` (v2.0.0, MIT); `bun install` hoàn tất với 301 package. Thư mục `node_modules/` chiếm khoảng 496 MB; cả repo khoảng 523 MB. Clone chính sạch, không có file bị sửa.

Đã xác minh tài nguyên chính:

- Có 20 storytelling flow tại `docs/flows/` và 162 recipe Markdown không phải SFX tại `docs/shots/` (171 file tổng cộng, gồm 8 thẻ SFX và README).
- Có thư viện map/globe tại `src/shared/map/`: `SatelliteMap`, `VectorLayer`, `Route`, `vietnam.tsx`, cùng dữ liệu `vietnam-data.ts` và `archipelago-data.ts`.
- Có sổ `docs/facts/facts.json` / `sources.json`, các hướng dẫn `docs/visuals/satellite-map.md` và `globe.md`, cùng 9 skill trong `.agents/skills/`.
- `bun run facts` chạy thành công: 4 facts verified, 0 lỗi. Có 1 cảnh báo về nguồn `s-0007`: nhạc nền không rõ tên/nhà phát hành, license UNKNOWN; chính README nguồn ghi không đăng video có dùng track này. Không dùng nhạc đó cho nội dung xuất bản.
- `bun run check` ban đầu thất bại do Git trên Windows (`core.autocrlf=true`) đổi 683 file văn bản sang CRLF trong checkout, còn `scripts/check-sfx.ts` chỉ khớp front matter LF. Không thay đổi clone để sửa vấn đề này. Đã chạy lại ở worktree tạm với `core.autocrlf=false`: `boundaries ok: 135 files`, `sfx ok: 8 cards`, TypeScript không lỗi. Worktree tạm đã được xóa; clone chính vẫn sạch.

Dùng repo này làm **thư viện recipe / map / fact-ledger có chọn lọc**, không thay pipeline OpenMontage. Chưa cài VieNeu-TTS: engine mặc định trong bộ này là Edge TTS; VieNeu cần venv riêng và tải model khoảng 600 MB. Chưa tạo `.env` vì chỉ ElevenLabs mới cần API key.

**rea-video (để học cấu trúc video đối thủ).** Tài liệu của repo nói người dùng thường không cần gõ lệnh tay, nhưng CLI hoạt động độc lập:

```bash
cd C:/Users/ACER/Desktop
git clone https://github.com/JuneYaooo/rea-video.git
cd rea-video
pip install -e ".[ocr]"
rea-video decompose ref.mp4 -o out/ref
```

Lưu ý từ README: nếu cài `[ocr]` thì `opencv-python` cài thêm sẽ tranh chấp thư mục `cv2` với `opencv-python-headless` mà rea-video dùng. Sau khi cài phải chạy `pip uninstall -y opencv-python && pip install --force-reinstall --no-deps "opencv-python-headless>=4.8,<5"`. Lần đầu sẽ tải khoảng 67 MB mô hình tách giọng người và tiếng nhạc; một video 30 giây mất khoảng 1 phút nếu không bật mô hình đa phương. Chế độ cơ bản chạy offline và miễn phí, đã đủ để phân tích tài liệu gốc. Kết quả gồm `out/ref/report.html` và `out/ref/VIDEO.md`, trong đó `VIDEO.md` là bản phân rã theo tầng để agent đọc.

**CIT Voice Studio (để so sánh giọng Việt offline).** README ghi ứng dụng chạy sẵn máy chủ API tại `http://127.0.0.1:8001` với các đường dẫn:

| Method | Đường dẫn | Việc |
|---|---|---|
| GET | `/health` | Trạng thái |
| GET | `/voices` | Danh giọng có sẵn |
| GET, POST | `/stream` | Đọc theo thời gian thực |
| POST | `/api/tts/generate` | Văn bản thành WAV hoặc MP3 |
| POST | `/api/tts/generate-with-subtitles` | Audio kèm phụ đề SRT |
| POST | `/api/tts/conversation` | Hội thoại nhiều người nói |

Thẻ cảm xúc, thẻ nghỉ và từ điển phát âm dùng được qua API. Tài liệu đầy đủ ở `http://127.0.0.1:8001/docs`, có sẵn bộ Postman ở `docs/postman/CIT-Voice-Studio.postman_collection.json`.

**Công cụ nền cho nghiên cứu đề tài.** Không cần cài gì thêm nếu đã có `uv`:

```bash
uv tool install youtube-transcript-api   # lấy transcript video công khai
uv tool install yt-dlp                  # metadata, phụ đề, tải video mẫu về phân tích
```

Cả hai chỉ dùng để học cấu trúc và đọc nguồn. Không lấy lại footage của người khác.

### 11.3 Sổ nguồn: cách ghi và cách kiểm tra

Đây là bước làm khác biệt nhất so với kênh AI thông thường, và là thứ giữ kênh trong lành mạnh sau khi làn sóng sao chép.

Kiểu dữ liệu của `facts.json` (mỗi claim một bản ghi):

```json
{
  "id": "f-0001",
  "claim": "Khoảng cách gần nhất giữa lãnh thổ Việt Nam và đảo Hòn Khoai là khoảng 6,9 km",
  "value": "6,9 km",
  "status": "verified",
  "sources": ["s-0001", "s-0002"],
  "caveat": "",
  "checkedAt": "2026-11-14"
}
```

Các trường bắt buộc: `id` (f-0001, f-0002, không đổi sau khi có lời dẫn trích), `claim` (một câu tự đứng được), `status` (verified, contested, unverified), `sources` (bắt buộc khi verified), `caveat` (bắt buộc khi contested và lên hình), `checkedAt` (ngày mở nguồn, định dạng YYYY-MM-DD). Trường tuỳ chọn hay dùng: `value` (số kèm đơn vị, dạng chuỗi), `evidence` (mức bằng chứng), `derivedFrom` (fact nào tính ra), `spokenAs` (cách đọc khác giá trị), `asOf` (mốc thời gian nói về hiện tại), `myth` (true khi là lời đồn sai), `usedIn` (video nào dùng).

Kiểu dữ liệu của `sources.json`:

```json
{
  "id": "s-0001",
  "title": "Quy hoạch cảng Cái Mép - Thị Vải giai đoạn 3",
  "url": "https://...",
  "publisher": "Tập đoàn Vingroup",
  "licence": "© Tập đoàn Vingroup",
  "accessed": "2026-11-14"
}
```

Các trường bắt buộc: `id`, `title` (đủ để trích mà không cần mở lại), `url` (trang thật đã mở, không phải kết quả tìm kiếm, không phải tóm tắt), `publisher`, `licence` (bắt buộc với tư liệu), `accessed`. Trường tuỳ chọn: `tier` (1 là cơ quan phát hành con số, 2 là bách khoa, 3 là báo chí đại chúng), `role` (candidate-finder cho danh sách bài, rejected cho nguồn đã cân nhắc và bỏ), `kind` (image, footage, voice, music, sfx, font), `attribution` (nguyên văn, không viết lại).

Quy tắc kiểm tra:

- Fact trích dẫn một `sources` không tồn tại thì lỗi.
- Lời dẫn trích dẫn fact `unverified` thì lỗi. Trích dẫn fact `contested` mà không có `caveat` thì lỗi.
- Nguồn chỉ có tier 3 thì nên cảnh báo. Nguồn không có URL thì cảnh báo. Tư liệu không có licence thì cảnh báo.
- Claim sai và bị bác bỏ thì giữ lại, đổi thành `contested` hoặc `unverified`, ghi `myth` là true và `caveat` nói sai ở đâu. Lời dẫn trích bản đính chính, chỉ trích lời đồn khi trích dẫn nguyên văn và kèm caveat.
- Tài liệu ghi rõ: chuyển một ứng viên thành `verified` là bước của người. Agent tự nâng trạng thái research của chính nó lên `verified` là cách nhanh nhất để phá vỡ sổ nguồn.

Nguồn nào nên dùng cho từng loại claim:

| Loại claim | Nguồn nên dùng | Tránh |
|---|---|---|
| Số liệu hạ tầng và vận tải | Quy hoạch chính thức, báo cáo đầu tư, quyết định của Chính phủ, cổng thông tin Bộ Giao thông, cổng đầu tư công | Bài báo không ghi nguồn, số trong bài review |
| Số liệu kinh tế vĩ mơ | Niên giám thống kê, Tổng cục Thống kê, IMF, World Bank | Con số trong bài báo không nêu năm |
| Kinh nghiệm địa lý và địa hình | Bản đồ có thẩm quyền, dữ liệu Natural Earth, tài liệu kỹ thuật của dự án | Suy đoán từ trí nhớ |
| Đơn vị tính và quy mô | Với kích thước: đo lại từ tọa độ thật bằng `distanceKm()`, không trích số đã nghe | Trích số đẹp mà không kiểm lại |

### 11.4 Quy trình sản xuất một tập, từng bước có lệnh

Đây là quy trình cho một tập video dài 12 đến 16 phút.

**Bước 1: Chọn đề tài**

```bash
# Xem video nào trong ngách vượt xa trung vị kênh của chính nó
python .agents/skills/youtube-agent-skill__yt-viral/swipe.py collected.json --min 2.0
```

`collected.json` là một mảng JSON, mỗi phần tử một video: `{"channel": "...", "title": "...", "views": 412000, "url": "...", "duration": 613}`. Cần ít nhất 4 video mỗi kênh thì trung vị mới có nghĩa. Công cụ chấm điểm xếp theo bội số của trung vị kênh chứ không theo số lượt xem thô, vì một video 400.000 lượt trên kênh 2 triệu người đăng ký chỉ là thứ bình thường.

Cách lấy dữ liệu mà không tốn credit: dùng `vidiq_outliers` với `keyword` và `minOutlierScore` cao, hoặc `yt-dlp` cho vài kênh đối thủ.

**Bước 2: Chốt tiêu đề và thumbnail trước khi viết kịch bản**

```bash
python .agents/skills/youtube-agent-skill__yt-package/title.py \
  --title "Vì sao sân bay Long Thành nằm cách TP.HCM 40 km?" \
  --thumb "40 KM?"
```

Đã chạy thử, kết quả thật:

```
  48 chars   score 88/100
    x  mobile       a mobile feed shows about "Vì sao sân bay Long Thành nằm cách..." - check the subject survives
    x  duplicate    thumbnail repeats the title on 40, km - the thumbnail should say what the title does not
    ok              48 characters, inside the 60-character desktop cut
    ok              1 all-caps word for emphasis
    ok              carries a concrete figure (40)
    ok              open question in the title
```

Bài học từ lần chạy thử này, áp dụng cho mọi tập:

1. Tiêu đề phải còn đúng ý khi bị cắt ở điện thoại, tức khoảng 40 ký tự đầu phải đủ để hiểu.
2. Thumbnail không được lặp lại con số đã có trong tiêu đề. Thumbnail nói điều tiêu đề không nói.
3. Nên có một con số cụ thể trong tiêu đề.
4. Có thể để dấu hỏi mở.

**Bước 3: Chấm hook**

```bash
python .agents/skills/youtube-agent-skill__yt-script/hookscore.py \
  --hook "Tàu container lớn nhất thế giới không vào được cảng Sài Gòn. Nhưng nó vào được một con sông cách đó 80 km. Vì sao?"
```

Đã chạy thử, kết quả thật:

```
    SPECIFICITY   74  ##############
    ADDRESS       26  #####
    STAKES        36  #######
    CURIOSITY     42  ########
    BREVITY       10  ##
    VERDICT       27  WEAK
    formula      The Question  (1 pattern matched)
    weakest      BREVITY - 9 to 24 words. Read it out loud and stop where you run out of breath
```

Điểm thấp nhất là BREVITY (10 trên 100): hook dài 27 từ, nên rút xuống khoảng 12 từ. Với tiếng Việt, chuẩn mỗi câu 9 đến 24 từ. Chạy lại sau khi sửa và đưa điểm đoạn đầu lên trên 70.

**Bước 4: Nghiên cứu và ghi sổ nguồn**

Mở từng nguồn, đọc số trực tiếp trên trang, ghi một dòng vào `facts.json` và `sources.json`. Đây là bước tốn thời gian nhất và là bước quyết định uy tín kênh.

```bash
cd C:/Users/ACER/Desktop/shorts-kit
bun run facts      # kiểm tra tính hợp lệ
bun run lint <id>  # kiểm tra lời dẫn có trích dẫn fact hợp lệ không
```

**Bước 5: Lên danh sách cảnh và tọa độ**

Tạo `src/videos/<id>/map.json`, mỗi cảnh một mức tỉ lệ:

```json
{"shots": [
  {"id": "country", "lon": 106.8, "lat": 14.5, "spanLon": 21},
  {"id": "saigon", "lon": 106.71, "lat": 10.78, "spanLon": 0.45, "zoom": 12}
]}
```

Quy tắc từ tài liệu `shorts-kit` cần giữ:

- Một cảnh cho một mức tỉ lệ. Bay từ cả nước xuống thành phố cần một mosaic ở mỗi mức (ví dụ zoom 9, 10, 11, 12).
- Máy quay không cắt giữa hai địa điểm nằm trên cùng một bản đồ. Bay. Cắt là mất đúng thứ bản đồ cho.
- Vẽ lên ảnh, không vẽ lên thẻ. Tuyến đường, khoảng cách và vùng nằm cùng hệ tọa độ với mặt đất. Một bảng panel bay trên bản đồ chính là một slide.
- Đo chứ không trích: khoảng cách trên hình tính từ `distanceKm()` giữa hai tọa độ thật, và tọa độ đó đến từ một bản ghi fact. Khi các nguồn khác nhau, đưa con số đã đo lên hình và giữ cả khoảng của các nguồn trong caveat của fact.
- Ảnh vệ tinh là năm 2016. Nếu claim nói về thay đổi mới, phải nói rõ, hoặc dùng dạng `archive-plate`.
- Chữ trên hình theo ngôn ngữ người xem và nằm trong vùng an toàn.

Sau khi có danh sách cảnh:

```bash
bun run satellite <id>   # ảnh vệ tinh EOX cho từng cảnh
bun run geo <id>         # bờ biển, biên giới, sông từ Natural Earth
```

**Bước 6: Lồng tiếng**

Lựa chọn A, giọng Vibi đang dùng, không cần cài gì:

```bash
python tools/audio/vibi_tts.py --text-file narration.txt --lang vi \
  --out-mp3 audio/vo.mp3 --out-srt audio/vo.srt --out-json audio/vo_words.json
```

Cờ đã kiểm tra trong `tools/audio/vibi_tts.py`: `--text`, `--text-file`, `--project`, `--voice`, `--voices`, `--lines`, `--all`, `--lang` (giá trị `vi` hoặc `en`), `--out-mp3`, `--out-srt`, `--out-json`, `--config`, `--history`, `--me`. Chế độ `--project` trỏ tới thư mục dự án OpenMontage và tự lưu `audio/` cùng `tts_voice.json`.

Lựa chọn B, giọng VieNeu offline của CIT Voice Studio, dùng khi ứng dụng đang chạy:

```bash
curl -s http://127.0.0.1:8001/voices
curl -s -X POST http://127.0.0.1:8001/api/tts/generate-with-subtitles \
  -H "Content-Type: application/json" \
  -d '{"text":"...","voice_id":"Minh Đức"}' -o audio/vo.wav
```

Lựa chọn C, tiếng Anh cho kênh thứ hai: `openai_tts` đã có sẵn trong OpenMontage, hoặc `chatterbox` nếu muốn chạy hoàn toàn offline.

Tiêu chí chọn giọng: đọc thử cùng một đoạn 60 giây trên cả ba giọng, nghe có chịu được không ở tốc độ nói 8 phút video; chọn một giọng rồi giữ nguyên cả kênh. Đổi giọng giữa chừng làm mất thói quen nghe.

**Bước 7: Phụ đề**

```bash
python tools/analysis/vibi_stt.py audio/vo.mp3 --out audio/vo.srt
```

Kiểm tra lại phụ đề bằng mắt trước khi dựng. Với ngách bản đồ, nên tải SRT lên YouTube thay vì in chữ vào hình, để sau này dùng lại cho bản tiếng Anh.

**Bước 8: Dựng hình**

Các thành phần có sẵn trong `shorts-kit`: `SatelliteMap` (một SVG, viewBox là khung của camera, chồng các mosaic và chuyển mượt sang ảnh nét hơn khi zoom), `VectorLayer` (bờ biển, biên giới, sông, độ rộng nét giữ nguyên theo pixel màn hình ở mọi mức zoom), `Route` (đường vẽ dần theo `progress` 0 đến 1, có đầu chạy, có bản nét đứt, có đường tròn lớn cho khoảng cách xa), `Pin`, `Ping`, `Cross`, `Measure` (đo khoảng cách bằng `distanceKm`), `GhostSpan`, `Region`, `VietnamMap` (bản đồ Việt Nam sẵn: đường viền, nước láng giềng, sông, quần đảo Hoàng Sa và Trường Sa, nhãn tiếng Việt hoặc tiếng Anh), `Archipelagos`.

Tọa độ nằm trong một hệ toàn cục: Web Mercator chuẩn hoá 0 đến 65536. Đó là không gian duy nhất để một mosaic ảnh và một con sông vector cùng nằm trong một viewBox, và là điều làm camera bay được. Dùng `boxAround(lon, lat, spanLon)` để căn khung ở tỉ lệ 9:16.

Xem thử các cảnh: `bun run dev gallery`, nhóm cảnh bắt đầu bằng `map-`.

**Bước 9: Dựng video**

Dùng pipeline `animated-explainer` của OpenMontage. Các giai đoạn, trong đó bốn giai đoạn dừng chờ bạn duyệt:

| Giai đoạn | Skill | Dừng chờ duyệt |
|---|---|---|
| research | `pipelines/explainer/research-director` | Không |
| proposal | `pipelines/explainer/proposal-director` | Có |
| script | `pipelines/explainer/script-director` | Có |
| scene_plan | `pipelines/explainer/scene-director` | Có |
| assets | `pipelines/explainer/asset-director` | Có |
| edit | `pipelines/explainer/edit-director` | Không |
| compose | `pipelines/explainer/compose-director` | Không |
| publish | `pipelines/explainer/publish-director` | Có |

Pipeline `documentary-montage` cũng có các giai đoạn idea, scene_plan, assets và edit đều dừng chờ duyệt.

**Bước 10: Tự kiểm tra trước khi đăng**

OpenMontage có sẵn 10 provider phân tích: `scene_detect`, `frame_sampler`, `visual_qa`, `video_analyzer`, `vibi_stt`, `transcriber`, `audio_probe`, `audio_energy`, `composition_validator`, `frame_sampler`. Chạy `visual_qa` để bắt lỗi chồng chữ và tràn khung, `composition_validator` để bắt lỗi Remotion, `audio_probe` để kiểm tra mức âm lượng.

**Bước 11: Đăng bằng tay**

Không để agent tự đăng lên kênh chính. Dùng `export_bundle` để xuất gói rồi đăng qua YouTube Studio. Nội dung mô tả, thẻ, phần giới thiệu kênh và bình luận ghim do bạn soát.

**Bước 12: Đọc lại dữ liệu sau khi đăng**

Tải file retention từ Studio: Analytics, một video, Engagement, biểu đồ giữ chức kênh, nút tải, chọn "Audience retention". File CSV có hai cột: vị trí (phần trăm hoặc giây) và phần trăm người còn xem.

```bash
python .agents/skills/youtube-agent-skill__yt-retention/retention.py retention.csv --transcript audio/vo.srt
```

Công cụ báo ba loại vấn đề, vì chúng có ba cách sửa khác nhau:

- HOOK LEAK: mất người trong 30 giây đầu.
- CLIFFS: rớt đột ngột tại một khoảnh khắc, tức có một chỗ cụ thể người ta bỏ đi.
- SLIDE: mất đều đặn ở đoạn giữa.

Bản `--transcript` in ra bạn đang nói gì tại mỗi chỗ rớt, và đó là bản duy nhất có thể hành động được mà không phải tự tua video.

Rồi ghi một bài học vào sổ: video nào giữ chức tốt, video nào rớt ở đâu, điều gì sẽ làm khác ở tập sau.

### 11.5 Đo chi phí và thời gian thực tế

| Việc | Thời gian ước tính | Ghi chú |
|---|---|---|
| Nghiên cứu và ghi sổ nguồn | 2 đến 4 giờ | Nhiều nhất trong tất cả. Đây là việc không nên làm nhanh |
| Lên danh sách cảnh và tọa độ | 45 phút đến 1 giờ | |
| Tải ảnh vệ tinh (`bun run satellite`) | 10 đến 30 phút | Tùy số cảnh. Chạy nền được |
| Lấy dữ liệu Natural Earth (`bun run geo`) | 5 phút | |
| Chấm hook và tiêu đề | 10 phút | Chạy lại sau mỗi lần sửa |
| Lồng tiếng | 10 đến 20 phút | Vibi hoặc VieNeu |
| Phụ đề | 10 phút | Có thể dùng SRT từ bước lồng tiếng |
| Dựng hình Remotion | 3 đến 5 giờ | Lần đầu chậm hơn nhiều khi còn làm khung bản đồ |
| Dựng video (compose) | 20 đến 40 phút | Có thể render nền |
| Tự kiểm tra | 20 phút | |
| Đăng và viết mô tả | 30 phút | |
| Tổng một tập | 8 đến 13 giờ | Lần đầu có thể 16 đến 20 giờ |

Tiền: mỗi tập không tốn tiền nếu dùng Vibi, Pixabay, `threejs_world` và ảnh vệ tinh EOX. Chi phí phát sinh khi thêm provider sinh ảnh hoặc sinh video AI, và ở bản tiếng Anh nếu dùng `openai_tts` có phí theo lượng.

Điểm cần nói rõ: con số trên là ước tính của tôi dựa trên quy trình đã mô tả, chưa có tập nào chạy hết từ đầu đến cuối trên máy này. Nên đo lại tập đầu tiên và sửa ước tính.

### 11.6 Những việc không nên làm

| Không nên | Vì sao |
|---|---|
| Để agent tự đăng lên kênh chính | Mất kiểm soát tiêu đề, mô tả, thẻ và bình luận ghim. Đây là những thứ người duyệt đọc |
| Để agent tự nâng trạng thái fact lên `verified` | Chính tài liệu `shorts-kit` nói đây là cách nhanh nhất để phá vỡ sổ nguồn |
| In chữ tiếng Việt vào hình rồi làm bản tiếng Anh | Mất đường tái dùng. Chữ trên hình phải là tham số của cảnh |
| Dùng ảnh AI cho công trình thật mà không khai báo | Nếu nội dung trông như thật và thuộc trường hợp YouTube yêu cầu khai báo altered/synthetic, phải khai báo. Với ngách này nên ưu tiên bản đồ và sơ đồ. |
| Chạy `bun run satellite` cho cả nước rồi zoom sâu | Ảnh sẽ nhòe. Mỗi mức tỉ lệ một mosaic |
| Dùng lại footage của kênh khác | Không kiếm tiền được. Chỉ dùng để học cấu trúc |
| Tự làm rồi tự đăng hàng loạt bằng `MoneyPrinterTurbo` | Chính sách gọi đúng là "sản xuất hàng loạt" và "nội dung khuôn chung chung" |
| Cài thêm provider sinh video AI trước khi cần | Máy không có GPU mạnh, và ngách này không cần |

### 11.7 Thứ tự cài đặt đề xuất

1. Clone và cài `shorts-kit` (`bun install`), chạy `bun run facts` để kiểm tra bộ sẵn có.
2. Cài `uv tool install youtube-transcript-api yt-dlp` để nghiên cứu không tốn credit.
3. Clone `rea-video`, cài `pip install -e ".[ocr]"`, sửa xung đột `cv2` như README hướng dẫn.
4. Mở CIT Voice Studio một lần để nghe giọng Việt offline, so với Vibi.
5. Tạo thư mục kênh, dựng thử 5 cảnh bản đồ bằng `shorts-kit` để xác nhận dây chuyền hình ảnh chạy được.
6. Chạy một tập thử từ đầu đến cuối, đo lại thời gian thật, rồi mới đặt lịch.

Bước 5 và 6 là hai điểm rủi ro. Nếu bản đồ của `shorts-kit` không chạy được với cấu trúc Remotion của workspace này, cần dựng bản đồ bằng `threejs_world` hoặc code thuần, và kế hoạch thời gian sẽ dài hơn.

## 12. Nguồn

Chính sách YouTube (trang chính thức):

- [Tổng quan và điều kiện Chương trình Đối tác YouTube](https://support.google.com/youtube/answer/72851)
- [Quốc gia và khu vực có Chương trình Đối tác](https://support.google.com/youtube/answer/7101720)
- [Chương trình YPP mở rộng: ngưỡng fan funding](https://support.google.com/youtube/answer/13429240)
- [Thay đổi của Chương trình Đối tác từ 01/02/2027](https://support.google.com/youtube/answer/12843009)
- [Chính sách kiếm tiền của kênh](https://support.google.com/youtube/answer/1311392)
- [Khai báo nội dung đã chỉnh sửa hoặc tổng hợp](https://support.google.com/youtube/answer/14328491)
- [Hướng dẫn lồng tiếng tự động](https://support.google.com/youtube/answer/15569972)
- [Advertiser-friendly content guidelines](https://support.google.com/youtube/answer/6162278)
- [Thông tin thuế Mỹ với thu nhập YouTube](https://support.google.com/youtube/answer/10391362)

Nguồn thị trường (đã dùng để lập bảng reach ở mục 4.2):

- [DataReportal: Digital 2026 Global Overview](https://datareportal.com/reports/digital-2026-global-overview-report)
- Các trang country report của Digital 2026 được liên kết ngay cạnh bảng ở mục 4.2 (Việt Nam, Ấn Độ, Hoa Kỳ, Indonesia, Brazil, Mexico, Nhật Bản, Đức, Philippines, Anh, Pháp, Thái Lan, Hàn Quốc, Tây Ban Nha, Canada, Argentina, Colombia, Ba Lan, Malaysia, Úc, Đài Loan).

Nguồn bên thứ ba (chỉ để đối chiếu, không làm nguồn chính):

- [Tubefilter, 13/07/2026: YouTube làm rõ chính sách inauthentic content](https://www.tubefilter.com/2026/07/13/youtube-inauthentic-content-monetization-policy-update/)
- [AIR Media-Tech: dòng thời gian thay đổi chính sách kiếm tiền 2026](https://air.io/en/monetization/youtube-monetization-policy-changes-2026-a-complete-dated-timeline)
- [Hypebeast, 08/2026: YouTube nâng gấp đôi điều kiện Chương trình Đối tác](https://hypebeast.com/2026/8/youtube-partner-program-doubles-watch-hours-for-2027)
- [India TV, 05/02/2026: lồng tiếng tự động mở cho mọi người dùng](https://www.indiatvnews.com/technology/news/youtube-auto-dubbing-feature-expands-to-all-users-now-supports-27-languages-2026-02-05-1029070). Con số ngôn ngữ đã được đối chiếu lại với trang trợ giúp chính thức ở mục 4.2.
- [DFDL: hiệp định thuế Việt Nam và Mỹ](https://www.dfdl.com/insights/legal-and-tax-updates/tax-alert-the-income-tax-treaty-between-vietnam)

Công cụ dữ liệu: vidIQ và NexLev qua kết nối MCP, truy vấn ngày 14/11/2026 (ảnh chụp đã lưu trong workspace, không truy vấn lại trong lần kiểm chứng thứ hai). GitHub: API và README gốc của từng repo, đường dẫn ở mục 3; với 7 repo bị API chặn, đọc bằng raw README và trang HTML repo.
