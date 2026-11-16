# Hướng Dẫn Cấu Hình `.env` & Bộ API Keys Tối Ưu Chất Lượng Video (`OpenMontage`)

Tài liệu này lưu trữ toàn bộ ý nghĩa các biến môi trường trong [`.env.example`](../.env.example), cấu hình giọng đọc tiếng Việt [`.vibi_api_key`](../.vibi_api_key) và công thức chọn bộ API Key tối ưu nhất cho quy trình sản xuất video.

---

## 1. Giải Thích Chi Tiết Các Nhóm Biến Trong `.env.example`

| Nhóm chức năng | Tên biến trong `.env` | Công dụng chi tiết | Link lấy Key / Ghi chú |
| :--- | :--- | :--- | :--- |
| **1. Cổng AI Đa Năng (Image + Video Gateway)** | `FAL_KEY` *(hoặc `FAL_AI_API_KEY`)* | **Một Key mở khóa nhiều Model đỉnh nhất:** Tạo ảnh (FLUX Pro, Recraft) và tạo video AI (Google Veo, Kling, MiniMax, Seedance) theo hình thức trả phí theo lượt dùng (pay-as-you-go). | `https://fal.ai/dashboard/keys` |
| | `REPLICATE_API_TOKEN` | Cổng dự phòng gọi các model tạo ảnh/video mã nguồn mở (Seedance, Wan, Flux) trên đám mây Replicate. | `https://replicate.com/account/api-tokens` |
| **2. Kho Tư Liệu Quay Thật (Stock Media — Miễn Phí)** | `PEXELS_API_KEY` | Tự động tìm và tải video B-roll quay thật HD/4K và ảnh nhiếp ảnh miễn phí từ Pexels. | Miễn phí 100% tại `pexels.com/api` |
| | `PIXABAY_API_KEY` | Tự động tìm và tải video B-roll, ảnh minh họa miễn phí từ Pixabay. | Miễn phí 100% tại `pixabay.com/api/docs` |
| | `UNSPLASH_ACCESS_KEY` | Tự động tìm và tải ảnh nhiếp ảnh nghệ thuật độ phân giải cao từ Unsplash. | Miễn phí (Developer Key) |
| **3. Hệ Sinh Thái Google (Đa Năng)** | `GOOGLE_API_KEY` *(hoặc `GEMINI_API_KEY`)* | **Một Key mở khóa 4 tác vụ:** Tạo ảnh **Google Imagen**, tạo/chỉnh sửa video **Gemini Omni / Veo**, tạo nhạc **Lyria 3.5**, và **Google Cloud TTS** (700+ giọng đọc). | `https://aistudio.google.com/apikey` |
| | `GOOGLE_APPLICATION_CREDENTIALS`, `GOOGLE_CLOUD_PROJECT`, `GOOGLE_CLOUD_LOCATION` | Cấu hình xác thực bằng file JSON Service Account khi chạy qua Google Cloud Vertex AI chuyên nghiệp. | Tùy chọn (nếu đã có `GOOGLE_API_KEY` thì không bắt buộc) |
| **4. Tạo Video AI Chuyên Biệt (Direct API)** | `KLING_API_KEY`, `KLING_API_BASE_URL` | Gọi trực tiếp Kling AI chính hãng để tạo video 4K, chuyển động đa cảnh (Multi-shot), Lip-sync và Avatar. | Mặc định endpoint Singapore (`api-singapore.klingai.com`) |
| | `RUNWAY_API_KEY` | Gọi trực tiếp Runway Gen-4 / Gen-4.5 để điều khiển góc máy điện ảnh (Camera Control) và đồng nhất nhân vật. | Thay thế cho việc gọi qua `fal.ai` |
| | `MINIMAX_API_KEY`, `MINIMAX_REGION` | Gọi trực tiếp MiniMax (Hailuo / H3) để tạo video chuyển động vật lý chân thực và tạo ảnh. | `https://platform.minimax.io` |
| | `ARK_API_KEY`, `VOLC_ACCESSKEY`, `VOLC_SECRETKEY` | Gọi trực tiếp **Seedance 2.0 / 2.5** và **Jimeng AI (即梦)** của ByteDance/Volcengine. | `https://console.volcengine.com` |
| | `LTX_API_KEY`, `HIGGSFIELD_API_KEY` | Gọi trực tiếp LTX-2.5 Fast/Pro hoặc Higgsfield Cloud để tạo video tốc độ cao. | Tùy chọn |
| | `HEYGEN_API_KEY` | Tạo nhân vật ảo nói chuyện (Talking Head Avatar V) hoặc gọi cổng tổng hợp Veo/Sora/Runway/Kling qua HeyGen. | Dùng khi làm video người thật/MC ảo |
| **5. Giọng Đọc (TTS), Âm Nhạc & Hiệu Ứng SFX** | `ELEVENLABS_API_KEY` | Tạo giọng đọc đa ngôn ngữ siêu thực, **tự động sinh hiệu ứng âm thanh (Text-to-SFX)** và nhạc nền. | Rất mạnh để làm Sound Design |
| | `SUNO_API_KEY` | Tạo nhạc nền AI độc quyền (Lo-fi, Cinematic, Piano chữa lành, Epic lịch sử) không lo bản quyền. | Dùng cho lớp `audio.music` |
| | `OPENAI_API_KEY` | Dùng cho OpenAI TTS dự phòng và tạo ảnh **GPT Image 2 / 2.5**. | Tùy chọn |
| | `FISH_AUDIO_API_KEY`, `CARTESIA_API_KEY`, `INWORLD_API_KEY`, `DOUBAO_SPEECH_API_KEY` | Các engine TTS chuyên sâu hỗ trợ nhân bản giọng nói (Voice Cloning `reference_id`) và đọc tốc độ cao. | Tùy chọn |
| **6. Tạo Ảnh & Thiết Kế Chuyên Sâu** | `IDEOGRAM_API_KEY` | Tạo ảnh AI có **hiển thị chữ viết (Typography) chuẩn xác** (dùng làm Poster, Thumbnail YouTube). | Ideogram 4.5 |
| | `BFL_API_KEY` | Gọi trực tiếp Black Forest Labs (nhà phát triển gốc của dòng model tạo ảnh **FLUX**). | Tùy chọn (có thể dùng qua `FAL_KEY`) |
| | `BRIA_API_TOKEN` | Chuyên tách nền (Background Removal), xóa vật thể, mở rộng khung hình (Outpainting) an toàn bản quyền. | Tùy chọn |
| | `DASHSCOPE_API_KEY`, `TENCENT_TOKENHUB_API_KEY`, `XAI_API_KEY` | Gọi Qwen Image 2.0 Pro / ASR (Alibaba), Hunyuan (Tencent), hoặc Grok Image/Video (xAI). | Tùy chọn |
| **7. Phân Tích Âm Thanh & Chạy Local GPU** | `HF_TOKEN` | Token HuggingFace để kích hoạt tính năng phân biệt nhiều người nói (Speaker Diarization) khi bóc băng âm thanh. | Miễn phí tại `huggingface.co/settings/tokens` |
| | `AZURE_SPEECH_KEY`, `AZURE_SPEECH_REGION` | Chuyển giọng nói thành văn bản (Fast STT) và đọc văn bản (Neural TTS) qua Microsoft Azure. | Mặc định đã có `faster-whisper` chạy offline |
| | `VIDEO_GEN_LOCAL_ENABLED`, `VIDEO_GEN_LOCAL_MODEL`, `COMFYUI_SERVER_URL` | Bật tạo video/ảnh miễn phí ngay trên GPU máy cá nhân (`wan2.2`, `hunyuan-1.5`, `ltx2-local`, `ComfyUI`). | Yêu cầu card đồ họa rời VRAM lớn |

---

## 2. Cấu Hình Giọng Đọc & Phụ Đề `VIBI_API_KEY` (Chạy Song Song Với `ELEVENLABS_API_KEY`)

Dự án tích hợp độc lập **Vibi API (`https://api.vibi.pro`)** thông qua biến `VIBI_API_KEY` trong [`.env`](../.env) (hoặc file `.vibi_api_key`), hoàn toàn **tách biệt và không ghi đè** lên [`tools/audio/elevenlabs_tts.py`](../tools/audio/elevenlabs_tts.py) để bạn có thể dùng song song cả 2 bất kỳ lúc nào:
- **Tool TTS độc lập trong OpenMontage:** [`tools/audio/vibi_tts.py`](../tools/audio/vibi_tts.py) (`name = "vibi_tts"`, `provider = "vibi"`):
  - Tự động đăng ký vào [`tts_selector.py`](../tools/audio/tts_selector.py) song song với `elevenlabs_tts`.
  - Hỗ trợ cả 3 engine trên Vibi: **MiniMax** (`speech-2.8-hd`, `speech-2.8-turbo`, giọng clone), **ElevenLabs** (`eleven_multilingual_v2`, `eleven_v3`...), và **CapCut** (480+ giọng hệ thống), cùng tính năng hội thoại nhiều người nói (`/v1/dialogue`).
  - Tự động bật `export_transcript: True` để tải đồng thời `.mp3`, `.srt` và xuất `word_timestamps` cho `<CaptionOverlay>` trong [`Explainer.tsx`](../remotion-composer/src/Explainer.tsx).
- **Tool STT (Bóc băng âm thanh) độc lập:** [`tools/analysis/vibi_stt.py`](../tools/analysis/vibi_stt.py) (`name = "vibi_stt"`):
  - Gọi `/v1/speech-to-text` (model **ElevenLabs Scribe v2**) hỗ trợ tách người nói (`diarize`), timestamp từng từ và xuất `.srt`.
- **Công cụ CLI chạy nhanh:** [`_tools/vibi_tts.py`](../_tools/vibi_tts.py) và cấu hình giọng mặc định [`_tools/vibi_tts.json`](../_tools/vibi_tts.json).

---

## 3. Bộ Key Khuyên Dùng Để Tối Ưu Chất Lượng Video

Theo quy chuẩn **Kết hợp 3 nguồn tư liệu (Video quay thật HD + Tư liệu khoa học/lịch sử Wikimedia + AI Keyframe/Video 16:9)**, bạn chỉ cần trang bị **5 nhóm Key** sau để đạt chất lượng hình ảnh và âm thanh tối đa:

### Cấp Độ A: Bộ Cốt Lõi (Bắt buộc — Miễn phí hoặc Chi phí cực thấp)
1. **`.vibi_api_key` (Ngoài `.env`):**
   - Tạo giọng đọc tiếng Việt truyền cảm + xuất `.srt` đồng bộ từng từ cho `<CaptionOverlay>`.
2. **`PEXELS_API_KEY` + `PIXABAY_API_KEY` + `UNSPLASH_ACCESS_KEY` (Miễn phí 100%):**
   - Đảm bảo nguồn **Video B-roll quay thật HD/4K** sắc nét. Kết hợp cùng kho tư liệu **Wikimedia Commons** (không cần API key) giúp video có độ chân thực và uy tín khoa học/lịch sử cao.
3. **`GOOGLE_API_KEY` (hoặc `GEMINI_API_KEY`):**
   - Tạo nhanh **AI Keyframe 16:9** bằng Google Imagen, hỗ trợ phân tích kịch bản và gọi video Veo.

### Cấp Độ B: Bộ Nâng Cấp Điện Ảnh (Tối đa hóa Visual AI & Sound Design)
4. **`FAL_KEY` (Khuyên dùng số 1 cho hình ảnh & chuyển động AI):**
   - Chỉ cần nạp 1 tài khoản duy nhất để gọi cả:
     - **FLUX Pro / Recraft:** Vẽ ảnh **AI Keyframe 16:9** có chiều sâu ánh sáng điện ảnh (dùng cho hiệu ứng Ken Burns + hạt vật lý `fireflies`, `mist`, `light-rays`, `sparkles` trong `anime_scene`).
     - **Kling / Veo / Seedance:** Biến các bức ảnh tĩnh quan trọng thành **AI Video B-roll** chuyển động mượt mà.
5. **`ELEVENLABS_API_KEY` *(hoặc `SUNO_API_KEY`)*:**
   - Dùng `ELEVENLABS_API_KEY` để tạo các lớp hiệu ứng âm thanh (**Text-to-SFX**: tiếng mưa đêm, tiếng lật trang sách, tiếng *whoosh* khi biểu đồ xuất hiện).
   - Dùng `SUNO_API_KEY` (hoặc kho nhạc nền có sẵn) để tạo nhạc nền riêng biệt (`audio.music` với `volume: 0.25–0.35`, có `fadeInSeconds` & `fadeOutSeconds`).

---

## 4. Mẫu File `.env` Chuẩn Gọn Nhẹ Nhất (Copy & Dùng Ngay)

Khi tạo file `.env` tại thư mục gốc `C:\Users\ACER\Desktop\Openmontage-Room\.env`, bạn chỉ cần điền cấu hình tinh gọn sau:

```ini
# ==========================================================
# CẤU HÌNH TỐI ƯU CHẤT LƯỢNG VIDEO OPENMONTAGE
# ==========================================================

# 1. Kho Video B-Roll Quay Thật HD/4K (Miễn phí 100%)
PEXELS_API_KEY=
PIXABAY_API_KEY=
UNSPLASH_ACCESS_KEY=

# 2. Cổng AI Đa Năng: Tạo ảnh FLUX Keyframe 16:9 & Video Kling/Veo/Seedance
FAL_KEY=

# 3. Hệ sinh thái Google (Imagen / Gemini / Veo / TTS)
GOOGLE_API_KEY=

# 4. Thiết kế Âm thanh (SFX) & Nhạc nền AI (Tùy chọn nâng cao)
ELEVENLABS_API_KEY=
SUNO_API_KEY=
```

