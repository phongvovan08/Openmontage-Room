# Hướng Dẫn Sử Dụng Tool Đăng Video YouTube (`youtube_upload_tool.py`)

Tool đặt tại: `C:\Users\ACER\Desktop\VIBI_VOICE\English-Channel\_tools\youtube_upload_tool.py`
Kênh đích: **Room English** (`UCFz4agZrEX7zV5F5BEdfl1w` — `pageid=114346749841225190650`)

Tool kết hợp **YouTube Data API v3** (tải ngầm video dài, 5 Shorts, Tiêu đề, Mô tả, 15 Tags, Thumbnail A, Phụ đề `.srt`, hẹn giờ tự động) và **Chrome Debug CDP (port 9222)** (tự động chuyển sang kênh **Room English**, chọn mục **Video có liên quan → `S1 phần <N>`** và bấm **Lưu** cho cả 5 Shorts).

---

## 1. Quy trình 4 bước chuẩn để đăng 1 tập (Video dài + 5 Shorts)

### Bước 1: Tạo 5 video Shorts & đóng gói vào `<Bài>/youtube_upload/` (nếu bài chưa có `youtube_upload/shorts/`)
Nếu thư mục `<Bài>/youtube_upload/shorts/` chưa có đủ 5 file `.mp4`, tạo `<Bài>/shorts/shorts_plan.json` (lấy đúng `start_ms` / `end_ms` của 5 cụm đúc kết từ `<Bài>/ready/edit_plan_measured.json`, đảm bảo mỗi Short bắt đầu bằng cảnh phim `source` và kết thúc ngay sau `explanation`), sau đó chạy:
```powershell
python -X utf8 English-Channel/_tools/prepare_capcut.py --lesson English-Channel/<Bài> --shorts
python -X utf8 English-Channel/_tools/post_info.py --lesson English-Channel/<Bài>
```
*(Lệnh `post_info.py` sẽ tự động `move` toàn bộ 5 Shorts và cập nhật `NOI_DUNG_DANG.txt`, `THONG_TIN_DANG_VIDEO.md` vào trong `<Bài>/youtube_upload/`).*

---

### Bước 2: Kiểm tra trước gói đăng (`--dry-run` — không tốn Quota)
```powershell
python -X utf8 English-Channel/_tools/youtube_upload_tool.py --lesson English-Channel/12-Friends_Season_1 --schedule-date 2026-10-30 --dry-run
```
Kiểm tra:
- Video dài (`Bai_<N>_Friends_S1_phan_<N>.mp4`), 2 Thumbnail (`thumbnail_A.jpg`, `thumbnail_B.jpg`), Phụ đề (`vi - Vietnamese (subtitles_full).srt`).
- Danh sách 5 Shorts (`08:00`, `12:00`, `17:00`, `21:00`, `22:30`) và tổng Quota ước tính.

---

### Bước 3: Các lệnh đăng thực tế (`--target` & `--mode`)

#### Trường hợp A: Chỉ đăng 5 Shorts của một tập (Video dài đã đăng trước đó)
*(Ví dụ muốn hẹn lịch 5 Shorts đăng trong ngày `2026-10-30` lúc `08:00, 12:00, 17:00, 21:00, 22:30`, truyền `--schedule-date` là ngày hôm trước `2026-10-29` vì Shorts tự cộng `+1 ngày`)*:
```powershell
python -u -X utf8 English-Channel/_tools/youtube_upload_tool.py --lesson English-Channel/11-Friends_Season_1 --target shorts --schedule-date 2026-10-29 --mode hybrid
```
Khi chạy lệnh này:
1. API v3 tải cả 5 Shorts lên kênh **Room English**, điền đủ Tiêu đề, Mô tả, Tags, hẹn giờ `08:00, 12:00, 17:00, 21:00, 22:30` và lưu vào `<Bài>/youtube_upload/upload_receipt.json`.
2. Bước 3 (`--mode hybrid`) tự động kết nối vào **Chrome Debug (`port 9222`, profile `C:\Users\ACER\chrome-debug`)**, chuyển phiên sang kênh **Room English** (`pageid=114346749841225190650`), mở lần lượt 5 Shorts trong YouTube Studio, bấm `#linked-video-editor-link` → chọn **`S1 phần <N>`** → bấm nút **`Lưu` (`ytcp-button#save`)** đến khi `saveDisabled: true`.

#### Trường hợp B: Chỉ đăng Video dài (ở chế độ `unlisted` để kiểm tra bản quyền hoặc hẹn giờ `20:00`)
```powershell
# Đăng Không công khai (unlisted):
python -u -X utf8 English-Channel/_tools/youtube_upload_tool.py --lesson English-Channel/21-Friends_Season_1 --target main --privacy unlisted

# Hoặc hẹn giờ 20:00 ngày 2026-11-03:
python -u -X utf8 English-Channel/_tools/youtube_upload_tool.py --lesson English-Channel/21-Friends_Season_1 --target main --schedule-date 2026-11-03
```

#### Trường hợp C: Đăng trọn bộ cả Video dài (20:00 ngày A) + 5 Shorts (08:00..22:30 ngày A+1)
```powershell
python -u -X utf8 English-Channel/_tools/youtube_upload_tool.py --lesson English-Channel/21-Friends_Season_1 --target all --schedule-date 2026-11-03 --mode hybrid
```

#### Trường hợp D: Chạy lại riêng bước gắn "Video có liên quan" cho 5 Shorts đã đăng (`--link-related-only`)
Nếu Shorts đã được đẩy lên và có trong `<Bài>/youtube_upload/upload_receipt.json`, chỉ cần chạy:
```powershell
python -u -X utf8 English-Channel/_tools/youtube_upload_tool.py --lesson English-Channel/11-Friends_Season_1 --link-related-only
```

---

## 2. Tự động đăng & hẹn giờ 5 Shorts lên TikTok Studio (`tiktok_upload_tool.py`)

Tool đặt tại: `C:\Users\ACER\Desktop\VIBI_VOICE\English-Channel\_tools\tiktok_upload_tool.py`
Kết nối trực tiếp vào `https://www.tiktok.com/tiktokstudio/upload` trên **Chrome Debug (port 9222, `C:\Users\ACER\chrome-debug`)** đã đăng nhập sẵn kênh TikTok **Room English**:
- Tự động nạp từng file `.mp4` trong `<Bài>/youtube_upload/shorts/`.
- Tự động điền đúng dòng `TikTok:` caption kèm bộ hashtag từ `NOI_DUNG_DANG.txt`.
- Tự động bật **Schedule**, chọn đúng Ngày (`YYYY-MM-DD`) và Giờ (`08:00`, `12:00`, `17:00`, `21:00`, `22:30`) rồi bấm nút **Schedule** (hoặc `--post-now` để đăng ngay).
- Lưu biên nhận tại `<Bài>/youtube_upload/tiktok_receipt.json`.

```powershell
# Kiểm tra trước (--dry-run):
python -X utf8 English-Channel/_tools/tiktok_upload_tool.py --lesson English-Channel/11-Friends_Season_1 --schedule-date 2026-10-31 --dry-run

# Chạy đăng & hẹn lịch 5 Shorts lên TikTok Studio:
python -u -X utf8 English-Channel/_tools/tiktok_upload_tool.py --lesson English-Channel/11-Friends_Season_1 --schedule-date 2026-10-31
```

---

## 3. Cấu hình OAuth2 & Bảo mật

- **File khóa Google Cloud:** `English-Channel/_tools/client_secrets.json` (`project_id: room-english-uploader`).
- **File lưu Token (tự động làm mới vĩnh viễn):** `English-Channel/_tools/.youtube_token.json`.
- Nếu cần đăng nhập lại hoặc thêm token thứ 2 để nhân đôi Quota (20,000 units/ngày):
  ```powershell
  python -u -X utf8 English-Channel/_tools/youtube_upload_tool.py --auth --client-secrets English-Channel/_tools/client_secrets.json
  ```
- Cả `*client_secrets*.json` và `*.youtube_token*.json` đều đã được chặn trong `.gitignore` để không bao giờ bị đẩy lên GitHub.
