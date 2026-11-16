# Hướng Dẫn Nhanh Bộ Công Cụ `Vibi TTS` Dùng Chung Đa Dự Án (`_tools/vibi_tts.py`)

> Bản đầy đủ nằm tại: [`Chu-De/12_HUONG_DAN_VIBI_TTS_TOOL.md`](../Chu-De/12_HUONG_DAN_VIBI_TTS_TOOL.md).

## 1. Các File Trong `_tools/`
- [`vibi_tts.py`](./vibi_tts.py): CLI & thư viện Python tạo giọng đọc `.mp3`, phụ đề `.srt` và `word_timestamps` JSON cho Remotion, có bộ nhớ đệm dùng chung `_tools/.cache/vibi_pieces/`.
- [`vibi_voice_pool.json`](./vibi_voice_pool.json): Pool 6 giọng đọc (`Haitrieu`, `Lacthien`, `Zoe 2`, `clone10`, `clone4`, `vanhoc`).
- [`vibi_tts.json`](./vibi_tts.json): Cấu hình giọng mặc định (`Haitrieu`, `speed: 1.1`).
- [`HUONG_DAN_UPLOAD_TIKTOK.md`](./HUONG_DAN_UPLOAD_TIKTOK.md) • [`HUONG_DAN_UPLOAD_YOUTUBE.md`](./HUONG_DAN_UPLOAD_YOUTUBE.md): Hướng dẫn dùng `tiktok_upload_tool.py` và `youtube_upload_tool.py`.

## 2. Các Lệnh Nhanh
```powershell
# 1. Xem danh sách 6 giọng đọc trong Pool
python _tools/vibi_tts.py --voices

# 2. Kiểm tra số dư credit
python _tools/vibi_tts.py --me

# 3. Tạo audio (.mp3) + phụ đề (.srt) + word_timestamps (tts_result.json) cho 1 project
python _tools/vibi_tts.py --project projects/<ten_du_an> --text-file <kich_ban.txt> --voice Haitrieu

# 4. Đổi sang giọng Lacthien hoặc vanhoc
python _tools/vibi_tts.py --project projects/<ten_du_an> --text-file <kich_ban.txt> --voice Lacthien
```

