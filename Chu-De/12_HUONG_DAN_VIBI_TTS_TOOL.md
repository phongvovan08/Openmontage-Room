# Hướng Dẫn Sử Dụng Bộ Công Cụ Giọng Đọc & Bóc Băng `Vibi Tool` Dùng Chung Đa Dự Án (`vibi_tts` + `vibi_stt`)

Tài liệu này hướng dẫn toàn diện cách sử dụng hệ thống **Vibi TTS & STT (`https://api.vibi.pro`)** đã được đồng bộ từ `C:\Users\ACER\Desktop\VIBI_VOICE\English-Channel\_tools` sang [`_tools/`](../_tools/) và tích hợp vào lõi [`tools/audio/vibi_tts.py`](../tools/audio/vibi_tts.py) của **OpenMontage**.

---

## 1. Cấu Trúc Các File Của Bộ `Vibi Tool`

| Thành phần | Đường dẫn file | Công dụng chính |
| :--- | :--- | :--- |
| **1. CLI & Thư viện dùng chung đa dự án** | [`_tools/vibi_tts.py`](../_tools/vibi_tts.py) | Công cụ dòng lệnh & thư viện Python tạo giọng đọc `.mp3`, phụ đề `.srt` và `word_timestamps` JSON cho mọi dự án, có bộ nhớ đệm dùng chung (`_tools/.cache/vibi_pieces`). |
| **2. Danh sách Pool 6 giọng đọc chuẩn** | [`_tools/vibi_voice_pool.json`](../_tools/vibi_voice_pool.json) | Chứa cấu hình 6 giọng đọc đã tinh chỉnh (`Haitrieu`, `Lacthien`, `Zoe 2`, `clone10`, `clone4`, `vanhoc`). |
| **3. Cấu hình giọng mặc định** | [`_tools/vibi_tts.json`](../_tools/vibi_tts.json) | Cấu hình mặc định (`Haitrieu`, tốc độ `1.10x`, cao độ `0`, cả chế độ tiếng Việt và tiếng Anh). |
| **4. Tool TTS trong OpenMontage Engine** | [`tools/audio/vibi_tts.py`](../tools/audio/vibi_tts.py) | Tool `vibi_tts` tích hợp trong hệ thống Agent của OpenMontage (hỗ trợ cả đọc đơn, đọc theo `voice_name` trong Pool và hội thoại nhiều người `/v1/dialogue`). |
| **5. Tool STT (Bóc băng âm thanh -> Chữ)** | [`tools/analysis/vibi_stt.py`](../tools/analysis/vibi_stt.py) | Tool `vibi_stt` chuyển file `.mp3`/`.mp4` thành văn bản + timestamp từng từ + `.srt` (model `scribe_v2`). |
| **6. Bộ nhớ đệm (Cache) liên dự án** | `_tools/.cache/vibi_pieces/` | Tự động lưu từng câu `.mp3` + `.srt` theo mã băm SHA-1 (`voice_id + settings + text`). Câu không đổi sẽ lấy lại tức thì và **tốn 0 credit**. |

---

## 2. Danh Sách 6 Giọng Đọc Trong `vibi_voice_pool.json`

Bạn có thể xem nhanh bằng lệnh `python _tools/vibi_tts.py --voices`:

| Tên giọng (`voice_name`) | `voice_id` | Model | Tốc độ (`speed`) | Cao độ (`pitch`) | Ghi chú sử dụng |
| :--- | :--- | :--- | :---: | :---: | :--- |
| **`Haitrieu`** *(Mặc định)* | `1ad2682d-1c78-4bb2-8061-b7cc216362c9` | `speech-2.8-hd` | `1.10x` | `0` | `enabled: true` — Giọng nam trầm ấm, chuẩn nhịp kể chuyện & giải thích. |
| **`Lacthien`** | `c10a3efd-f16c-469c-beee-6475474865b7` | `speech-2.8-hd` | `1.10x` | `0` | Gọi bằng `--voice Lacthien` — Giọng truyền cảm, hợp chủ đề tâm lý, triết lý, chiêm nghiệm. |
| **`Zoe 2`** | `30de6177-7cdf-4ebd-8342-07f6f1b4e679` | `speech-2.8-hd` | `1.05x` | `-1` | Gọi bằng `--voice "Zoe 2"` — Giọng nữ tự nhiên, nhẹ nhàng. |
| **`clone10`** | `0a35cc4a-c480-4622-a0bc-dcb7a64348c5` | `speech-2.8-hd` | `1.00x` | `0` | Gọi bằng `--voice clone10`. |
| **`clone4`** | `da9c3b54-814e-4c59-8087-54671a73ee70` | `speech-2.8-hd` | `1.10x` | `0` | Gọi bằng `--voice clone4`. |
| **`vanhoc`** | `321254eb-32f9-46cd-a635-9df4aa27e3c0` | `speech-2.8-hd` | `1.10x` | `0` | Gọi bằng `--voice vanhoc` — Hợp kể chuyện văn học, đêm khuya. |

*(Ngoài 6 giọng trong Pool, bạn vẫn có thể truyền bất kỳ `voice_id` nào khác trên Vibi, ví dụ giọng **Đức Trung** `3d1bdc7a-cf04-425d-8969-72e01fe9c8d4`).*

---

## 3. Cơ Chế Tự Động Tìm API Key (Không Cần Cài Lại Nhiều Nơi)

Công cụ [`_tools/vibi_tts.py`](../_tools/vibi_tts.py) tự động tìm khóa API theo thứ tự ưu tiên sau:
1. Biến môi trường `VIBI_API_KEY` trong terminal hoặc trong file `.env` ở thư mục gốc.
2. File `.vibi_api_key` tại thư mục gốc `C:\Users\ACER\Desktop\Openmontage-Room\.vibi_api_key`.
3. File `_tools/.vibi_api_key` nội bộ.
4. File `C:\Users\ACER\Desktop\VIBI_VOICE\English-Channel\_tools\.vibi_api_key` (tự động liên kết sang thư mục `VIBI_VOICE` nếu bạn cập nhật key bên đó).

---

## 4. Các Lệnh CLI Thường Dùng Nhất (`_tools/vibi_tts.py`)

### 4.1. Kiểm tra số dư Credit, Danh sách giọng & Lịch sử
```powershell
# Xem số dư credit hiện tại của tài khoản Vibi
python _tools/vibi_tts.py --me

# Xem danh sách 6 giọng đọc trong vibi_voice_pool.json
python _tools/vibi_tts.py --voices

# Xem 10 tác vụ TTS gần nhất trên tài khoản
python _tools/vibi_tts.py --history
```

### 4.2. Tạo giọng đọc chuẩn cho 1 Dự án OpenMontage (`--project`)
Lệnh này tự động:
1. Lưu cấu hình giọng đã chọn vào `<project>/tts_voice.json` (để các lần chạy sau giữ nguyên đúng giọng đó).
2. Xuất 3 file vào `<project>/audio/`:
   - `narration.mp3` (file âm thanh thuyết minh)
   - `narration.srt` (phụ đề chuẩn thời gian)
   - `tts_result.json` (chứa mảng `word_timestamps` khớp từng từ cho `<CaptionOverlay>` và `InnerThoughtsEpisode` trong Remotion).

```powershell
# Tạo từ file kịch bản .txt với giọng mặc định (Haitrieu)
python _tools/vibi_tts.py --project projects/ten_du_an --text-file projects/ten_du_an/script.txt

# Hoặc chỉ định giọng Lacthien / vanhoc / Zoe 2
python _tools/vibi_tts.py --project projects/ten_du_an --text-file projects/ten_du_an/script.txt --voice Lacthien
```

### 4.3. Tạo nhanh 1 file `.mp3` + `.srt` + `.json` ở vị trí bất kỳ
```powershell
python _tools/vibi_tts.py `
  --text "Những người đang mắc kẹt trong trạng thái sinh tồn thường hành xử hoàn toàn theo bản năng." `
  --voice Haitrieu `
  --out-mp3 Chu-De/Tam-Ly-Noi-Tam/demo.mp3 `
  --out-srt Chu-De/Tam-Ly-Noi-Tam/demo.srt `
  --out-json Chu-De/Tam-Ly-Noi-Tam/demo_words.json
```

### 4.4. Chế độ Bài học Song ngữ Anh–Việt (`--lesson` tương thích `English-Channel`)
```powershell
# Tạo toàn bộ các câu còn thiếu hoặc đã sửa chữ trong lesson.json
python _tools/vibi_tts.py --lesson path/to/lesson_folder

# Chỉ tạo lại dòng số 1 và 2
python _tools/vibi_tts.py --lesson path/to/lesson_folder --lines 1,2

# Ghép lại toàn bộ các câu từ bộ nhớ đệm _pieces (không tốn lại credit)
python _tools/vibi_tts.py --lesson path/to/lesson_folder --all
```

---

## 5. Cách Gọi Trong Code Python (Giữa Các Script Dự Án)

### Cách 1: Gọi hàm mức cao `synthesize_project_narration` từ `_tools/vibi_tts.py`
```python
from pathlib import Path
from _tools.vibi_tts import synthesize_project_narration

res = synthesize_project_narration(
    text=Path("projects/my_video/script.txt").read_text(encoding="utf-8"),
    project_dir=Path("projects/my_video"),
    voice_name_or_id="Haitrieu",  # hoặc "Lacthien", "Zoe 2", "vanhoc"
)

print("MP3:", res["output"])
print("SRT:", res["srt_path"])
print("Số từ (word_timestamps cho Remotion):", len(res["word_timestamps"]))
```

### Cách 2: Gọi qua Tool `VibiTTS` của OpenMontage Engine (`tools/audio/vibi_tts.py`)
```python
from tools.audio.vibi_tts import VibiTTS

tts = VibiTTS()
result = tts.execute({
    "text": "Trưởng thành không phải là không còn cảm xúc, mà là không để cảm xúc lái mọi hành động.",
    "voice_name": "Lacthien",  # Tự động tra trong _tools/vibi_voice_pool.json
    "export_transcript": True,
    "output_path": "projects/my_video/audio/narration.mp3",
})

# result.data["word_timestamps"] chứa danh sách [{word, start, end}, ...]
```

### Cách 3: Bóc băng âm thanh từ video gốc bằng `VibiSTT` (`tools/analysis/vibi_stt.py`)
```python
from tools.analysis.vibi_stt import VibiSTT

stt = VibiSTT()
res = stt.execute({
    "audio_path": "projects/my_video/source/reference_audio.mp3",
    "language_code": "vi",
    "diarize": True,
    "output_dir": "projects/my_video/transcript",
})
print("Văn bản bóc băng:", res.data["text"])
```

