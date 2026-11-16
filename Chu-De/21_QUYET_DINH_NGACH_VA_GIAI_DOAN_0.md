# Quyết định ngách và kế hoạch Giai đoạn 0

Tài liệu này là **file quyết định**, tách khỏi tài liệu nghiên cứu. Nó ghi lại những gì đã chốt, những gì chưa chốt, và checklist Giai đoạn 0.

Tài liệu nghiên cứu gốc: [16_PHAN_TICH_DOC_LAP_GITHUB_THI_TRUONG_NGACH_2026-11-14.md](./16_PHAN_TICH_DOC_LAP_GITHUB_THI_TRUONG_NGACH_2026-11-14.md). Mọi lý do, bảng số liệu và nguồn nằm ở file đó; file này không lặp lại.

Cập nhật: 15/11/2026.

## 1. Những gì đã chốt

| Hạng mục | Quyết định |
|---|---|
| Ngách | Giải mã địa lý kinh tế và hạ tầng dân dụng Việt Nam bằng bản đồ và sơ đồ tự dựng |
| Lời hứa kênh, một câu | Mỗi tuần một địa điểm, một câu hỏi vì sao, trả lời bằng bản đồ |
| Thị trường đầu tiên | Việt Nam, tiếng Việt |
| Định dạng | Video dài 10 đến 16 phút; mỗi video dài sinh 1 đến 2 Shorts độc lập |
| Nhịp pilot | 1 video dài và 2 Shorts mỗi tuần, khoảng 8 đến 10 giờ |
| Giọng đọc | Vibi TTS (chốt 15/11/2026). Không so A/B với VieNeu trong Giai đoạn 0; chỉ dùng VieNeu nếu Vibi gặp lỗi phát âm địa d anh không sửa được bằng pronunciation overrides |
| Quay cảnh thật | Không tự quay được địa điểm nào (chốt 15/11/2026). Toàn bộ visual là bản đồ, sơ đồ và đồ họa dựng bằng code |
| Thị trường thứ hai | Chưa lập lịch. Chỉ đánh giá sau khi có video dài chứng minh audience phù hợp và có năng lực biên tập bản ngữ |
| Công cụ map | `shorts-kit` (clone tại `C:\Users\ACER\Desktop\shorts-kit`) làm thư viện map, recipe và fact ledger; không thay pipeline OpenMontage |
| Kênh tiếng Anh | Chưa mở trong Giai đoạn 0 |

## 2. Những gì chưa chốt, cần bạn quyết

1. **Tên kênh và handle.** Phải kiểm tra không trùng tên kênh đã có trên YouTube và không xâm phạm thương hiệu của người khác, trước khi dùng trong ảnh đại diện và intro.
2. **Ngưỡng thành công của pilot.** Khung cổng trong file 16 là tiêu chí nội bộ gợi ý; bạn có thể đặt ngưỡng riêng.

## 3. Ba đề tài mở màn

Lấy từ mục 6.6 của file 16. Đây là câu hỏi ứng viên, chưa phải kịch bản.

1. Vì sao miền Bắc phải ra tận Lạch Huyện mới làm được cảng nước sâu?
2. Vì sao sân bay Long Thành nằm cách trung tâm TP.HCM khoảng 40 km?
3. Vì sao làm cao tốc ở miền Tây đắt và chậm hơn nơi khác?

Mỗi đề tài phải qua fact ledger trước khi viết. Đề tài nào không đứng vững trước tài liệu gốc thì bỏ.

### Nguồn đã biết, cần mở và đọc trước khi trích dẫn

| Đề tài | Văn bản gốc cần mở | Ghi chú |
|---|---|---|
| Lạch Huyện | Quyết định 1069/QĐ-TTg ngày 22/6/2023 về điều chỉnh quy hoạch cảng biển Hải Phòng đến 2030, tầm nhìn 2050 | Tên pháp lý trong quy hoạch là "khu vực cảng Lạch Huyện, Cảng II", phía bắc cửa sông Cấm. Tra trên `vanban.chinhphu.vn` hoặc `vbpl.vn` |
| Long Thành | Quyết định 1704/QĐ-TTg điều chỉnh quy hoạch Cảng hàng không quốc tế Long Thành; Quyết định 1707/QĐ-TTg về quy hoạch sân bay Tân Sơn Nhất | Quy hoạch Long Thành và Tân Sơn Nhất là hai quyết định riêng. Cần đối chiếu cả hai khi nói về khoảng cách 40 km |
| Cao tốc miền Tây | Quyết định 90/2022/QĐ-TTg điều chỉnh quy hoạch tuyến cao tốc Cần Thơ – Cà Mau; Quyết định 16/2022/QĐ-TTg về đề án PPP; Quyết định 1062/QĐ-TTg giao nhiệm vụ thực hiện | Hồ sơ thẩm định dự án ước tính khoảng 1.502.896 tỷ đồng cho tuyến chính và nhánh, chưa bao gồm tăng giá, đền bù, giải phóng mặt bằng. Con số này chưa được kiểm chứng lại ở phiên này |

**Quy tắc:** các nguồn trên chỉ là điểm khởi đầu. Trước khi đưa bất kỳ con số nào vào lời dẫn, phải mở văn bản gốc, ghi publisher, số hiệu, URL, ngày truy cập và phạm vi áp dụng vào fact ledger.

## 4. Giai đoạn 0: Nền móng (15/11 đến 22/11/2026)

**Mục tiêu:** chứng minh có thể làm một video bản đồ nguyên bản, có nguồn, có voice và subtitle, trong giới hạn 8 đến 10 giờ/tuần. Giai đoạn này chưa đăng video.

| Thời gian | Việc | Đầu ra bắt buộc | Trạng thái |
|---|---|---|---|
| 15/11 | Khóa định vị: kênh tiếng Việt, micro-niche hạ tầng dân dụng, lời hứa một câu | Đoạn định vị 1 câu; danh sách chủ đề không làm | Đã chốt ngách; chưa chốt tên và handle |
| 15-16/11 | Chốt 3 đề tài đầu từ mục 3 ở trên | Bảng đề tài: câu hỏi, giả thuyết, nguồn cần mở, rủi ro | Chờ mở và đọc nguồn gốc |
| 16-17/11 | Lập fact ledger và license ledger tại `shorts-kit/docs/facts/` | Mỗi claim có `id`, trạng thái, nguồn, ngày mở; mỗi asset có license và attribution | Template đã có; dữ liệu mẫu trong repo là tiếng Anh, không dùng cho video Việt |
| 17-18/11 | Khóa style map: nền, màu tuyến, màu cảnh báo, font hỗ trợ tiếng Việt, vùng an toàn, quy tắc nhãn | Style note 1 trang; không in cứng chữ vào asset bản đồ | Font Be Vietnam Pro đã có trong workspace; không dùng footage tự quay |
| 18-19/11 | Dựng prototype 5 cảnh trong `shorts-kit` | Prototype 60-90 giây; ưu tiên vector map, chỉ dùng satellite khi ghi rõ ảnh năm 2016 và attribution EOX | Có ba project map thử nghiệm trong clone để sửa tiếp; chưa hoàn thành |
| 19-20/11 | Kiểm tra Vibi trên cùng đoạn 60 giây; rà phát âm địa danh, số, đơn vị và thử pronunciation overrides nếu cần | Voice Vibi dùng cho pilot; danh sách pronunciation overrides đã kiểm tra | Đã chốt Vibi; chưa chạy sample |
| 20-21/11 | Viết packaging trước rồi mới viết kịch bản: 3 title, 3 concept thumbnail, hook cho đề tài số 1 | Title đã qua `title.py`, hook đã qua `hookscore.py`, kịch bản có trích dẫn fact | Chưa bắt đầu |
| 22/11 | Review người thật, đo lại quy trình | Quyết định tiếp tục, sửa hoặc bỏ; ghi giờ làm, lỗi, chi phí, nguồn còn thiếu | Cổng duyệt bắt buộc |

### Năm cảnh kỹ thuật cần khóa trong prototype

1. `overview`: bản đồ vùng, có camera box và nhãn địa điểm.
2. `zoom`: bay từ vùng rộng vào địa điểm bằng `boxAround()` và camera path, không nhảy tọa độ.
3. `route`: vẽ tuyến theo tiến độ bằng `Route`, chỉ dùng tọa độ đã có nguồn.
4. `pin-label`: ghim địa điểm, nhãn và phụ đề nằm trong safe zone.
5. `comparison-measure`: `Measure`, thanh so sánh hoặc mặt cắt độ cao, độ sâu; số đo phải có fact hoặc được ghi rõ là minh họa.

### Quy tắc dữ liệu

- `verified` chỉ dùng sau khi người thực sự mở và đọc nguồn. Agent không tự nâng trạng thái fact.
- Nguồn tìm thấy qua web search chỉ là candidate cho tới khi mở văn bản gốc và ghi đủ publisher, URL, license, ngày truy cập.
- Ảnh vệ tinh EOX trong `shorts-kit` là ảnh năm 2016, license CC BY 4.0, cần attribution. Prototype có thể bỏ qua satellite để giảm rủi ro quyền và thời gian.
- Không dùng số RPM, search volume hoặc credit chưa truy vấn lại làm điều kiện quyết định.

### Cổng duyệt ngày 22/11

Chỉ chuyển sang Giai đoạn 1 khi tất cả điều sau đạt:

- Prototype chạy được, đủ 5 cảnh.
- Phát âm địa danh chấp nhận được.
- Mọi claim trên prototype có trạng thái phù hợp trong fact ledger.
- License và attribution của mọi asset đã ghi.
- Bạn xác nhận kịch bản số 1 đúng định hướng kênh.

Nếu không đạt, sửa prototype và ledger trước khi viết thêm video.

## 5. Giai đoạn 1: Pilot (23/11 đến 20/12/2026)

- Nhịp đã chốt: 1 video dài và 2 Shorts mỗi tuần. Không cam kết số lượng video nếu thời gian thực tế không đủ giữ chất lượng.
- Mỗi video thử một biến: kiểu câu hỏi, có hay không đối thủ so sánh, 10 phút hay 15 phút.
- Sau mỗi video: tải file retention từ YouTube Studio, chạy `yt-retention`, ghi một bài học vào sổ.
- Cổng 1 (tiêu chí nội bộ, không phải ngưỡng của YouTube) ngày 20/12: đánh giá số video đã hoàn thành, chất lượng fact và license, giờ làm thực tế, retention, returning viewers và subscriber conversion. Không đạt thì đổi cách đóng gói hoặc nhóm đề tài trước, chưa đổi ngách.

## 6. Trạng thái công cụ

| Công cụ | Trạng thái |
|---|---|
| `shorts-kit` | Đã clone tại `C:\Users\ACER\Desktop\shorts-kit`, commit `828e120` (v2.0.0, MIT), `bun install` xong 301 package. Có ba project map thử nghiệm chưa được Git theo dõi: `co-loa-five-map-shots`, `hs-map-h-smoke`, `hs-ts-smoke`. Không xóa trong Giai đoạn 0 |
| Module map đã xác minh | `SatelliteMap`, `VectorLayer`, `Route`, `Measure`, `Pin`, `VietnamMap`, `boxAround()`, `VIETNAM_VIEWS` |
| Fact ledger | `shorts-kit/docs/facts/facts.json` và `sources.json`; `bun run facts` chạy được với dữ liệu mẫu tiếng Anh |
| Khác biệt phiên bản | `shorts-kit` cần Remotion 4.0.540 và React 19.2.0; `remotion-composer` trong workspace dùng Remotion 4.0.484 và React 18.2.0. Chưa copy module sang workspace trước khi có spike tương thích |
| Vibi TTS | Đã có trong workspace tại `tools/audio/vibi_tts.py` và `_tools/vibi_tts.py` |
| VieNeu / CIT Voice Studio | Phương án A/B giọng offline; chưa xác nhận ứng dụng local chạy được |
| vidIQ connector | Không khả dụng trong lượt này. Không có số credit, search volume hay analytics cá nhân mới; các con số cũ trong file 16 chỉ là snapshot có ngày và giới hạn rõ ràng |
| `youtube-agent-skill` | 11 skill trong `.agents/skills/youtube-agent-skill__yt-*`, gồm `hookscore.py`, `title.py`, `retention.py`, `swipe.py`; không cần API key |
