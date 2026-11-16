# Hướng Dẫn Cách Hoạt Động & Đăng Video TikTok Tự Động (`tiktok_upload_tool.py`)

Công cụ đặt tại: `C:\Users\ACER\Desktop\VIBI_VOICE\English-Channel\_tools\tiktok_upload_tool.py`
Trang đích: `https://www.tiktok.com/tiktokstudio/upload` (trên **Chrome Debug** `port 9222`, thư mục profile `C:\Users\ACER\chrome-debug`).

---

## 1. Cơ chế hoạt động bên trong (`tiktok_upload_tool.py`)

Tool điều khiển trực tiếp trình duyệt **Chrome Debug** thông qua giao thức **Chrome DevTools Protocol (CDP WebSocket)** theo 6 bước hoàn toàn tự động cho từng video Short:

1. **Đọc dữ liệu bài học (`load_lesson_package`)**:
   - Đọc file `<Bài>/youtube_upload/NOI_DUNG_DANG.txt` để lấy danh sách 5 file `.mp4` trong `<Bài>/youtube_upload/shorts/`, khung giờ chuẩn (`08:00`, `12:00`, `17:00`, `21:00`, `22:30`) và dòng **`TikTok:`** caption (gồm tiêu đề `Số X.Y: ...` + bộ hashtag chuẩn).
   - Kiểm tra file biên nhận `<Bài>/youtube_upload/tiktok_receipt.json` — nếu video nào đã có trạng thái `"scheduled"` hoặc `"posted"` thì tự động bỏ qua để không bao giờ đăng trùng.

2. **Mở trang Upload & Nạp thẳng file `.mp4` từ ổ cứng (`DOM.setFileInputFiles`)**:
   - Điều hướng tab tới `https://www.tiktok.com/tiktokstudio/upload` (đồng thời gán `window.onbeforeunload = null` để chặn hộp thoại *"Rời khỏi trang web?"*).
   - Tìm thẻ `<input type="file" accept="video/*">` và bơm thẳng đường dẫn file `.mp4` vào trình duyệt mà **không cần bật cửa sổ chọn file của Windows**.
   - Chờ đến khi nút `Replace` xuất hiện (báo hiệu TikTok đã tải xong 100% file video lên máy chủ).

3. **Điền Caption & Hashtags vào bộ soạn thảo DraftJS (`.public-DraftEditor-content`)**:
   - Click vào ô mô tả `.public-DraftEditor-content[contenteditable="true"]`.
   - Chọn toàn bộ tên file mặc định (`selectAll` + `delete`) và chèn nguyên văn dòng `TikTok:` caption bằng `Input.insertText`, sau đó nhấn phím `Escape` để đóng popup gợi ý hashtag.

4. **Chọn chế độ Hẹn lịch (`Schedule`) hoặc Đăng ngay (`Now`)**:
   - Nếu hẹn lịch (`--schedule-date` hoặc `--interval-minutes`), tool click vào nút radio `input[type="radio"][value="schedule"]`.
   - **Chọn Ngày (`YYYY-MM-DD`)**: Mở bảng lịch (ô `input.TUXTextInputCore-input` thứ 2), tự động bấm mũi tên chuyển tháng (`span.arrow`) nếu ngày hẹn nằm ở tháng sau, rồi click vào ô ngày hợp lệ (`span.day.valid`).
   - **Chọn Giờ (`HH:MM`)**: Mở bảng chọn giờ (ô `input.TUXTextInputCore-input` thứ 1), cuộn và click cột Giờ bên trái (`span.tiktok-timepicker-option-text.tiktok-timepicker-left`) và cột Phút bên phải (`span.tiktok-timepicker-option-text.tiktok-timepicker-right`, làm tròn bội số 5 phút).
   - **Đóng bảng chọn giờ (TimePicker)**: Gửi cú click chuột thật (`Input.dispatchMouseEvent`) vào lại ô giờ để đóng lớp phủ TimePicker trước khi bấm nút đăng.

5. **Bấm nút `Schedule` / `Post` & Xác nhận hộp thoại kiểm tra bản quyền**:
   - Cuộn nút `[data-e2e="post_video_button"]` ra giữa màn hình, chờ `0.8s` rồi gửi sự kiện click chuột thật (`Input.dispatchMouseEvent`).
   - Nếu TikTok bật hộp thoại xác nhận **`"Continue to post? We're still checking your video for potential issues."`**, tool tự động tìm nút **`"Post now"`** trong `.common-modal-footer button` và bấm xác nhận ngay lập tức.

6. **Xác nhận chuyển về `/tiktokstudio/content` & Lưu biên nhận**:
   - Chờ trang tự động chuyển về `https://www.tiktok.com/tiktokstudio/content`, sau đó ghi trạng thái vào `<Bài>/youtube_upload/tiktok_receipt.json` rồi mới chuyển sang video tiếp theo.

---

## 2. Các lệnh sử dụng thực tế

Mở PowerShell tại `C:\Users\ACER\Desktop\VIBI_VOICE`:

### Cách 1: Kiểm tra trước danh sách 5 Shorts & Caption (`--dry-run`)
Không mở trình duyệt, chỉ in ra 5 file `.mp4`, dung lượng, lịch đăng và nội dung `TikTok Caption`:
```powershell
python -X utf8 English-Channel/_tools/tiktok_upload_tool.py --lesson English-Channel/11-Friends_Season_1 --schedule-date 2026-10-31 --dry-run
```

### Cách 2: Hẹn lịch 5 video trong ngày theo khung giờ chuẩn (`08:00, 12:00, 17:00, 21:00, 22:30`)
Dùng khi bạn muốn lên lịch trước cho ngày mai hoặc các ngày tiếp theo:
```powershell
# Hẹn lịch 5 Shorts Tập 11 cho ngày 31/10/2026:
python -u -X utf8 English-Channel/_tools/tiktok_upload_tool.py --lesson English-Channel/11-Friends_Season_1 --schedule-date 2026-10-31

# Hẹn lịch 5 Shorts Tập 12 cho ngày 01/11/2026:
python -u -X utf8 English-Channel/_tools/tiktok_upload_tool.py --lesson English-Channel/12-Friends_Season_1 --schedule-date 2026-11-01
```

### Cách 3: Hẹn lịch 5 video đăng liên tiếp cách nhau `N` phút (`--interval-minutes`)
Dùng khi bạn muốn đăng 5 video của một tập ngay trong hôm nay cách nhau mỗi `10` phút (hoặc `15`, `30` phút). Tool sẽ tự động lấy mốc giờ hợp lệ sớm nhất của TikTok (`hiện tại + 20 phút`, làm tròn lên 5 phút) rồi cộng thêm `N` phút cho từng video tiếp theo:
```powershell
python -u -X utf8 English-Channel/_tools/tiktok_upload_tool.py --lesson English-Channel/11-Friends_Season_1 --interval-minutes 10
```

### Cách 4: Đăng công khai ngay lập tức cả 5 video (`--post-now`)
```powershell
python -u -X utf8 English-Channel/_tools/tiktok_upload_tool.py --lesson English-Channel/11-Friends_Season_1 --post-now
```

---

## 3. Lưu ý khi sử dụng
- **Trình duyệt sử dụng**: Tool tự động kết nối (hoặc tự bật nếu chưa mở) vào **Chrome Debug (`port 9222`, profile `C:\Users\ACER\chrome-debug`)** nơi đã đăng nhập sẵn tài khoản TikTok của kênh **Room English**.
- **Chống đăng trùng**: Nếu đang chạy mà bạn tắt giữa chừng, khi chạy lại lệnh cũ tool sẽ đọc `<Bài>/youtube_upload/tiktok_receipt.json` để bỏ qua các video đã lên lịch thành công và chỉ làm tiếp các video còn lại. Nếu muốn đăng lại từ đầu, chỉ cần xóa file `tiktok_receipt.json` trong thư mục `youtube_upload/` của bài đó.

