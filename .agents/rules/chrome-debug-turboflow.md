# Chrome Debug & TurboFlow - Quy Tắc Khởi Động

## ⚠️ QUAN TRỌNG: Agent KHÔNG THỂ tự mở Chrome Debug
- Các lệnh `Start-Process` / `cmd /c start` từ agent chạy trong sandbox — Chrome mở nhưng **KHÔNG hiện cửa sổ** trên màn hình user.
- **LUÔN nhờ user mở bằng tay** qua **Win+R** hoặc terminal riêng.

## 🚀 Lệnh mở Chrome Debug (User chạy tay bằng Win+R)
```
"C:\Program Files\Google\Chrome\Application\chrome.exe" --remote-debugging-port=9222 --user-data-dir="C:\Users\ACER\chrome-debug" --start-maximized https://flow.google.com/
```

## 📋 Checklist nhanh
1. **User** chạy lệnh trên bằng Win+R → Chrome mở Google Flow
2. **Agent** chạy `python -X utf8 .agents/skills/turboflow/scripts/turboflow_cli.py --status` → kiểm tra kết nối
3. **Agent** chạy batch với `--prompts-file` + `--wait` + `--out-dir`

## 🔑 Thông tin cố định
- **Profile:** `C:\Users\ACER\chrome-debug`
- **Port CDP:** `9222`
- **TurboFlow:** v2.4.0 PRO, đã cài sẵn trong profile `chrome-debug`
- **Account Google Flow:** `Phòng Võ` — `phongvv198@gmail.com` (đã login sẵn)
- **Download folder pattern:** `C:\Users\ACER\Downloads\<folder-name>\` (TurboFlow đổi `_` thành `-`)

## ❌ KHÔNG làm
- Không cố launch Chrome từ agent command (sẽ không hiện cửa sổ)
- Không cần fix `exit_type` trong Preferences — Chrome chạy tốt khi user mở tay
