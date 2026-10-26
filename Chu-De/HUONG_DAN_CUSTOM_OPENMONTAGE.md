# Toàn Tập Về OpenMontage: Khái Niệm, Tính Năng, Cấu Trúc Thư Mục & Hướng Dẫn Custom Từ A–Z

Tài liệu này giúp bạn nắm trọn vẹn **OpenMontage là gì, dùng để làm gì, chức năng của từng thư mục trong dự án**, và **cách tự tay tùy biến (Custom) mọi thành phần** từ giao diện đồ họa, biểu đồ, hiệu ứng hạt, phụ đề nhảy từng từ cho đến giọng đọc AI tiếng Việt.

---

## Phần 1: OpenMontage Là Gì & Dùng Để Làm Gì?

### 1.1. OpenMontage là gì?
**OpenMontage** là **hệ thống sản xuất video tự động hóa điều phối bởi AI Agent (Agentic Video Production Studio) mã nguồn mở đầu tiên**.
Thay vì chỉ ghép vài bức ảnh tĩnh rồi gọi là video như các công cụ AI thông thường, OpenMontage biến trợ lý lập trình AI của bạn thành một **phòng dựng phim hoàn chỉnh**:
- Tự động lên ý tưởng, viết kịch bản 2 cột (AV Script), lập kế hoạch phân cảnh (Scene Plan).
- Tự động thu thập **video quay thật HD (Stock B-Roll)**, **ảnh tư liệu khoa học/lịch sử (Wikimedia)**, kết hợp **ảnh/video AI (Veo, Kling, Flux)** và **giọng đọc thuyết minh (Vibi TTS / ElevenLabs)**.
- Biên dịch toàn bộ thành các **Component đồ họa chuyển động (Motion Graphics)** bằng **React & Remotion**, gắn phụ đề nhảy từng từ khớp mili-giây và xuất ra file `.mp4` hoàn chỉnh.

### 1.2. OpenMontage dùng để làm gì?
Bạn có thể dùng OpenMontage để sản xuất **13 thể loại video chuyên nghiệp**:
1. **Video Giải Thích & Đồ Họa Số Liệu (`Explainer` / `animated-explainer`):** Kết hợp B-roll video thật với biểu đồ cột (`BarChart`), biểu đồ tròn (`PieChart`), biểu đồ đường (`LineChart`), bảng chỉ số (`KPIGrid`), thẻ đối chiếu (`ComparisonCard`), thẻ thống kê (`StatCard`) — rất hợp với kênh *Tâm lý học hành vi, Mẹo vặt khoa học, Tài chính, Công nghệ*.
2. **Phim Tài Liệu & Lịch Sử Đa Nguồn (`documentary-montage` / `ink-theater`):** Ghép nối tư liệu khảo cổ, bản đồ, hiệu ứng tranh thủy mặc (`Ink Theater`), tia sáng cổ đại — rất hợp với kênh *Bí ẩn lịch sử, Thế giới động vật*.
3. **Kể Chuyện Cảm Xúc & Chữa Lành (`anime_scene` / `anime-ghibli`):** Chuyển cảnh mượt Ken Burns đa lớp kết hợp hạt đom đóm (`fireflies`), sương mù (`mist`), tia nắng (`light-rays`), lấp lánh (`sparkles`) — rất hợp với kênh *Better Version Tâm lý, Kể chuyện đêm khuya*.
4. **Trailer Điện Ảnh (`CinematicRenderer` / `cinematic`):** Dựng trailer phim, intro hoành tráng với hiệu ứng chữ điện ảnh và âm thanh đa lớp.
5. **Video Dọc Shorts / Reels / TikTok (`TalkingHead`, `ProductRevealVertical`, `clip-factory`):** Cắt clip ngắn từ video dài, gắn phụ đề bắt mắt tối ưu tỷ lệ xem hết (Watch-through).
6. **Thuyết Trình Kỹ Thuật & Demo Phần Mềm (`terminal_scene`, `screenshot_scene`, `screen-demo`):** Mô phỏng gõ lệnh Terminal tự động và con trỏ chuột di chuyển/phóng to trên ảnh chụp màn hình.
7. **Thế Giới 3D & Hoạt Hình Nhân Vật (`threejs_world`, `blender_world`, `character-animation`):** Dựng cảnh 3D bằng Three.js / Blender và cử động nhân vật SVG/2D.

---

## Phần 2: Các Tính Năng Cốt Lõi Của OpenMontage

### 2.1. Kiến Trúc "Agent-First" 7 Giai Đoạn (Pipeline State Machine)
Mọi dự án video trong OpenMontage đều đi qua chuỗi 7 bước chuẩn hóa, có kiểm duyệt chất lượng (QC) ở từng bước:
```text
Idea (Ý tưởng) ➔ Script (Kịch bản) ➔ Scene Plan (Phân cảnh) ➔ Assets (Tư liệu) ➔ Edit (Dựng timeline) ➔ Compose (Render đồ họa) ➔ Publish (Xuất bản)
```

### 2.2. Ba Engine Kết Xuất Đồ Họa (3 Rendering Runtimes)
OpenMontage tự động chọn hoặc cho phép bạn chỉ định 1 trong 3 bộ máy kết xuất:
1. **Remotion Composer (`remotion-composer/` — Ưu tiên số 1):** Dùng **React + TypeScript + CSS + Vật lý lò xo (`spring()`)** để vẽ giao diện video 60fps/30fps sắc nét tuyệt đối, dễ dàng chỉnh sửa như làm web.
2. **HyperFrames (`tools/video/hyperframes_compose.py`):** Dựng cảnh HTML5/CSS3/SVG/Three.js phức tạp theo thời gian thực.
3. **FFmpeg Native (`tools/video/video_stitch.py`):** Cắt ghép video tốc độ cao, chuẩn hóa độ phân giải, trộn âm thanh (Audio Ducking, L-Cut) và đóng dấu phụ đề.

### 2.3. Hệ Thống 14+ Kiểu Cảnh (`Cut Types`) Có Sẵn Trong `Explainer.tsx`
Trong file JSON kịch bản, mỗi phân cảnh (`cut`) chỉ cần khai báo `"type"` là OpenMontage tự động dựng đồ họa tương ứng:

| Tên `type` trong JSON | Component React tương ứng | Chức năng hiển thị |
|---|---|---|
| `"hero_title"` | [`HeroTitle.tsx`](../remotion-composer/src/components/HeroTitle.tsx) | Tiêu đề mở màn cỡ lớn + phụ đề + lớp phủ mờ nghệ thuật (Scrim). |
| `"stat_card"` | [`StatCard.tsx`](../remotion-composer/src/components/StatCard.tsx) | Con số thống kê khổng lồ nhảy lò xo (VD: `45°`, `30 Giây`, `94%`). |
| `"comparison"` | [`ComparisonCard.tsx`](../remotion-composer/src/components/ComparisonCard.tsx) | Chia đôi màn hình đối chiếu Trái vs Phải (VD: *Thân trên* vs *Mũi bàn chân*). |
| `"callout"` | [`CalloutBox.tsx`](../remotion-composer/src/components/CalloutBox.tsx) | Hộp trích dẫn / lưu ý quan trọng (`"quote"`, `"info"`, `"warning"`, `"tip"`). |
| `"bar_chart"` | [`BarChart.tsx`](../remotion-composer/src/components/charts/BarChart.tsx) | Biểu đồ cột mọc tự động từ dưới lên kèm nhãn số liệu. |
| `"pie_chart"` | [`PieChart.tsx`](../remotion-composer/src/components/charts/PieChart.tsx) | Biểu đồ tròn / Donut xoay mở rộng kèm tâm điểm (`centerValue`). |
| `"line_chart"` | [`LineChart.tsx`](../remotion-composer/src/components/charts/LineChart.tsx) | Biểu đồ đường vẽ nét theo thời gian thực. |
| `"kpi_grid"` | [`KPIGrid.tsx`](../remotion-composer/src/components/charts/KPIGrid.tsx) | Lưới 2–4 cột thông số KPI đếm số tăng dần (`count-up`). |
| `"progress_bar"` | [`ProgressBar.tsx`](../remotion-composer/src/components/ProgressBar.tsx) | Thanh tiến trình phần trăm chuyển động mượt. |
| `"anime_scene"` | [`AnimeScene.tsx`](../remotion-composer/src/components/AnimeScene.tsx) | Trình chiếu đa ảnh Ken Burns + Hạt vật lý (`fireflies`, `mist`, `light-rays`, `sparkles`). |
| `"terminal_scene"` | [`TerminalScene.tsx`](../remotion-composer/src/components/TerminalScene.tsx) | Cửa sổ dòng lệnh gõ code tự động từng ký tự. |
| `"screenshot_scene"` | [`ScreenshotScene.tsx`](../remotion-composer/src/components/ScreenshotScene.tsx) | Di chuyển chuột và zoom vào các điểm nhấn trên ảnh chụp màn hình. |
| `"text_card"` | [`TextCard.tsx`](../remotion-composer/src/components/TextCard.tsx) | Thẻ văn bản tối giản đặt giữa khung hình. |
| *(Chỉ truyền `source`)* | `VideoScene` / `ImageScene` | Phát trực tiếp video `.mp4` hoặc ảnh `.jpg/.png` toàn màn hình với hiệu ứng chuyển cảnh. |

> **Đặc biệt:** Bất kỳ `cut` đồ họa nào ở trên đều có thể gắn thêm `"backgroundVideo": "topics/t1/shot_01.mp4"` hoặc `"backgroundImage": "..."` kèm `"backgroundOverlay": 0.5` để **vừa chạy video thật ở lớp nền, vừa hiển thị biểu đồ/thẻ thông tin trong suốt ở lớp trên**!

---

## Phần 3: Chức Năng Từng Thư Mục Trong Workspace

Dưới đây là bản đồ toàn bộ các thư mục tại `C:\Users\ACER\Desktop\OpenMontage`:

```text
C:\Users\ACER\Desktop\OpenMontage\
├── 📁 Chu-De/                  ⭐ [QUAN TRỌNG NHẤT VỚI BẠN] Kho lưu trữ toàn bộ tài liệu & 6 chủ đề kênh YouTube
│   ├── README.md               # Mục lục trung tâm của thư mục Chu-De
│   ├── TIM_HIEU_OPENMONTAGE.md # Tài liệu toàn tập tìm hiểu & custom OpenMontage
│   ├── HUONG_DAN_CUSTOM_OPENMONTAGE.md # Bản hướng dẫn custom OpenMontage
│   ├── NGHIEN_CUU_CHU_DE.md    # Nghiên cứu từ khóa vidIQ & dữ liệu NexLev
│   ├── TONG_HOP_KICH_BAN_VA_VIDEO_DEMO_6_CHU_DE.md # Kịch bản 2 cột & cấu hình 6 chủ đề
│   ├── DANH_SACH_28_SKILLS_LAM_VIDEO.md            # 28 Skills chọn lọc theo 6 tầng sản xuất
│   ├── brand-profile.md        # Hồ sơ định vị thương hiệu tổng
│   ├── Tam-Ly-Hoc-Tu-Duy/      # Chủ đề 1: Tâm lý học hành vi & Đọc vị (kịch bản, .srt, assets/, video)
│   ├── Better-Version-Tam-Ly/  # Chủ đề 2: Chữa lành tâm lý & Đúc kết sách
│   ├── Ke-Chuyen-Dem-Khuya/    # Chủ đề 3: Kể chuyện đêm khuya
│   ├── Bi-An-Lich-Su/          # Chủ đề 4: Bí ẩn lịch sử & Văn minh cổ đại
│   ├── The-Gioi-Dong-Vat/      # Chủ đề 5: Thế giới động vật hoang dã
│   └── Meo-Vat-Cuoc-Song/      # Chủ đề 6: Mẹo vặt khoa học đời thường
│
├── 📁 remotion-composer/       ⭐ [TRÁI TIM ĐỒ HỌA VIDEO] Dự án React + TypeScript + Remotion
│   ├── src/
│   │   ├── Root.tsx            # Khai báo các Composition (Explainer, Cinematic...) & Bảng màu THEMES
│   │   ├── Explainer.tsx       # Bộ máy ghép các Cut, BackgroundVideo, Overlay, Audio, Phụ đề
│   │   ├── CinematicRenderer.tsx # Bộ máy dựng trailer điện ảnh
│   │   ├── TalkingHead.tsx     # Bộ máy dựng video dọc 9:16 có phụ đề
│   │   └── components/         # Thư viện 16+ Component đồ họa (HeroTitle, BarChart, AnimeScene, CaptionOverlay...)
│   └── public/
│       ├── demo-props/         # Nơi chứa 6 file JSON kịch bản (om_t1_behavior.json -> om_t6_lifehack.json)
│       └── topics/             # Nơi chứa video/ảnh/audio đã chuẩn hóa của 6 chủ đề (t1 -> t6) để Remotion đọc
│
├── 📁 _tools/                  ⭐ [CÔNG CỤ TỰ ĐỘNG HÓA RIÊNG]
│   ├── vibi_tts.py             # Gọi API Vibi tạo giọng đọc tiếng Việt .mp3 + phụ đề .srt khớp từng từ
│   ├── vibi_tts.json           # Cấu hình giọng đọc Vibi mặc định
│   ├── fetch_unique_topic_assets.py # Tự động tải video Mixkit + ảnh Wikimedia riêng biệt cho 6 chủ đề
│   └── run_openmontage_6_topics.py  # Tự động đóng gói JSON Props và gọi Remotion xuất 6 video MP4
│
├── 📁 .agents/skills/          ⭐ [KHO 87 SKILLS AI]
│   └── ...                     # Chứa 87 kỹ năng chuyên sâu (OpenMontage, YouTube, Remotion, AI Film, Social Media)
│
├── 📁 pipeline_defs/           # 13 file YAML định nghĩa quy trình sản xuất (animated-explainer.yaml, cinematic.yaml...)
├── 📁 styles/                  # Các file YAML định nghĩa Style Playbook (anime-ghibli.yaml, flat-motion-graphics.yaml...)
├── 📁 skills/                  # Hướng dẫn nội bộ của OpenMontage cho từng giai đoạn (stage-director skills)
├── 📁 tools/                   # Hàng chục công cụ Python của OpenMontage (audio/, video/, graphics/, subtitle/, avatar/)
├── 📁 backlot/                 # Giao diện web local (Living Storyboard) để xem tiến độ dự án và duyệt phân cảnh
├── 📁 ink-theater/             # Engine chuyên biệt cho phong cách kể chuyện tranh thủy mặc / lịch sử cổ đại
├── 📁 lib/                     # Thư viện lõi Python (quản lý cấu hình, checkpoint, media profiles)
├── 📁 schemas/                 # Các chuẩn JSON Schema kiểm tra tính hợp lệ của kịch bản và phân cảnh
├── 📁 scripts/                 # Các script tiện ích kiểm tra hệ thống và chạy thử nghiệm
├── 📁 docs/                    # Tài liệu kiến trúc gốc bằng tiếng Anh của OpenMontage
└── 📁 tests/                   # Bộ kiểm thử tự động (Unit test & QA test)
```

---

## Phần 4: Hướng Dẫn Custom (Tùy Biến) OpenMontage Như Thế Nào?

Bạn có thể tùy biến OpenMontage ở **5 cấp độ** từ dễ nhất (chỉ sửa file JSON/Python, không cần đụng vào React) cho đến nâng cao (tự thiết kế Component đồ họa mới):

---

### Cấp Độ 1: Custom Nội Dung, Cảnh Quay, Biểu Đồ & Nhạc Nền Qua JSON Props *(Nhanh & Dễ Nhất)*

Toàn bộ kịch bản hiển thị của 6 chủ đề nằm tại [`remotion-composer/public/demo-props/`](../remotion-composer/public/demo-props/) (hoặc được sinh ra từ hàm `build_openmontage_props()` trong [`_tools/run_openmontage_6_topics.py`](../_tools/run_openmontage_6_topics.py)).

Một file JSON Props của `Explainer` có 5 phần chính mà bạn có thể sửa bất kỳ lúc nào:

```json
{
  "theme": "flat-motion-graphics",
  "themeConfig": {
    "primaryColor": "#06B6D4",
    "accentColor": "#F43F5E",
    "backgroundColor": "#070B14",
    "surfaceColor": "#0F172A",
    "textColor": "#F8FAFC",
    "captionHighlightColor": "#22D3EE"
  },
  "cuts": [
    {
      "id": "canh-mo-man",
      "type": "hero_title",
      "in_seconds": 0.0,
      "out_seconds": 4.0,
      "text": "Tiêu Đề Chính Của Bạn",
      "heroSubtitle": "Dòng phụ đề giải thích bên dưới",
      "backgroundVideo": "topics/t1/shot_01.mp4",
      "backgroundOverlay": 0.45,
      "accentColor": "#22D3EE"
    }
  ],
  "overlays": [
    {
      "type": "section_title",
      "in_seconds": 1.0,
      "out_seconds": 3.5,
      "text": "CHƯƠNG 01",
      "subtitle": "Ghi chú góc trên bên trái",
      "position": "top-left"
    }
  ],
  "captions": [
    { "word": "Xin", "startMs": 100, "endMs": 350, "pageBreakAfter": false },
    { "word": "chào.", "startMs": 350, "endMs": 700, "pageBreakAfter": true }
  ],
  "audio": {
    "narration": { "src": "topics/t1/narration.mp3", "volume": 1.0 },
    "music": { "src": "topics/t1/music.wav", "volume": 0.3, "fadeInSeconds": 0.8, "fadeOutSeconds": 1.5, "loop": true }
  }
}
```

**Mẹo chỉnh nhanh:**
- **Đổi thời lượng cảnh:** Sửa `"in_seconds"` và `"out_seconds"` (tính bằng giây). Tổng thời lượng video sẽ tự động co giãn theo `out_seconds` lớn nhất!
- **Đổi độ tối của lớp phủ trên video nền:** Sửa `"backgroundOverlay"` từ `0.3` (video nền rất sáng) đến `0.7` (video nền tối lại để làm nổi bật biểu đồ/chữ).
- **Đổi hiệu ứng hạt trong `anime_scene`:** Sửa `"particles"` thành `"fireflies"` (đom đóm lập lòe), `"mist"` (sương mù trôi), `"light-rays"` (tia nắng chiếu xiên), hoặc `"sparkles"` (hạt lấp lánh).

---

### Cấp Độ 2: Mở Giao Diện Đồ Họa `Remotion Studio GUI` Để Xem Trước & Sửa Trực Tiếp

Khi muốn vừa sửa giao diện vừa nhìn thấy kết quả ngay lập tức trên trình duyệt:

```powershell
cd C:\Users\ACER\Desktop\OpenMontage\remotion-composer
npx remotion studio
```
- Trình duyệt sẽ mở tại `http://localhost:3000`.
- Bên cột trái, bạn chọn Composition (`Explainer`, `CinematicRenderer`, `TalkingHead`, `HeroTitle`...).
- Khi bạn sửa bất kỳ file `.tsx` nào trong `remotion-composer/src/`, màn hình xem trước sẽ **tự động cập nhật ngay lập tức (Hot Reload)** mà không cần render lại từ đầu.

---

### Cấp Độ 3: Custom Bảng Màu, Font Chữ & Độ Nảy Vật Lý Lò Xo (`Theme System`)

Mở file [`remotion-composer/src/Root.tsx`](../remotion-composer/src/Root.tsx) (dòng `41–106`). Tại hằng số `THEMES`, bạn có thể chỉnh sửa hoặc thêm một Theme mang tên riêng của kênh bạn:

```tsx
export const THEMES: Record<string, ThemeConfig> = {
  // ... các theme có sẵn ...
  "kenh-tam-ly-cua-toi": {
    primaryColor: "#06B6D4",          // Màu chủ đạo (vầng sáng nền, cột biểu đồ chính)
    accentColor: "#F43F5E",           // Màu nhấn (viền thẻ, con số nổi bật)
    backgroundColor: "#070B14",       // Màu nền tổng thể
    surfaceColor: "#0F172A",          // Màu nền bên trong các thẻ Card/Callout
    textColor: "#F8FAFC",             // Màu chữ chính
    mutedTextColor: "#94A3B8",        // Màu chữ phụ
    headingFont: "Space Grotesk",     // Font tiêu đề
    bodyFont: "Inter",                // Font nội dung
    monoFont: "JetBrains Mono",       // Font số liệu
    chartColors: ["#06B6D4", "#F43F5E", "#F59E0B", "#10B981"],
    springConfig: {
      damping: 14,                    // Độ giảm chấn (càng nhỏ càng nảy nhiều)
      stiffness: 100,                 // Độ cứng lò xo (càng lớn chuyển động càng nhanh)
      mass: 1                         // Khối lượng vật lý
    },
    transitionDuration: 0.35,         // Thời gian chuyển cảnh (giây)
    captionHighlightColor: "#22D3EE", // Màu tô sáng từ đang đọc trong phụ đề
    captionBackgroundColor: "rgba(7, 11, 20, 0.85)", // Màu nền hộp phụ đề
  },
};
```

> **Cách đổi kích thước khung hình (16:9 Ngang sang 9:16 Dọc Shorts/TikTok):**
> Trong [`remotion-composer/src/Root.tsx`](../remotion-composer/src/Root.tsx) (dòng `143–144`), chỉ cần đổi `width={1920}` `height={1080}` thành `width={1080}` `height={1920}` (hoặc tạo thêm một `<Composition id="ExplainerVertical" ... />`).

---

### Cấp Độ 4: Custom Phụ Đề Nhảy Từng Từ (`CaptionOverlay.tsx`)

Mở file [`remotion-composer/src/components/CaptionOverlay.tsx`](../remotion-composer/src/components/CaptionOverlay.tsx):
- **Đổi số từ hiển thị trên mỗi cụm phụ đề:** Chỉnh tham số `wordsPerPage = 6` (mặc định 6 từ/trang cho video ngang 16:9, hoặc giảm xuống `3–4` từ/trang cho video dọc Shorts).
- **Đổi vị trí cao/thấp của phụ đề:** Chỉnh `bottom: 60` (cách đáy màn hình 60px) thành `bottom: 120` hoặc đặt ở chính giữa màn hình.
- **Đổi cỡ chữ và hiệu ứng nhảy từ:** Chỉnh `fontSize = 42` và hệ số `scale` khi từ đang được đọc (`isActive`).

---

### Cấp Độ 5: Tự Tạo Thêm Một Kiểu Cảnh Đồ Họa Mới (`Custom Cut Type`)

Giả sử bạn muốn tạo thêm một kiểu cảnh mới tên là `"book_quote"` để đóng khung trích dẫn sách đẹp mắt:

1. **Bước 1:** Tạo file `remotion-composer/src/components/BookQuote.tsx`:
   ```tsx
   import React from "react";
   import { AbsoluteFill, spring, useCurrentFrame, useVideoConfig } from "remotion";

   export const BookQuote: React.FC<{ quote: string; author?: string; accentColor?: string }> = ({
     quote,
     author,
     accentColor = "#F59E0B",
   }) => {
     const frame = useCurrentFrame();
     const { fps } = useVideoConfig();
     const scale = spring({ frame, fps, config: { damping: 15, stiffness: 90 } });

     return (
       <AbsoluteFill style={{ justifyContent: "center", alignItems: "center", padding: 120 }}>
         <div
           style={{
             transform: `scale(${scale})`,
             background: "rgba(15, 23, 42, 0.85)",
             borderLeft: `8px solid ${accentColor}`,
             padding: "48px 64px",
             borderRadius: 24,
             color: "#F8FAFC",
             fontSize: 44,
             fontWeight: 700,
           }}
         >
           “{quote}”
           {author && <div style={{ marginTop: 24, fontSize: 28, color: accentColor }}>— {author}</div>}
         </div>
       </AbsoluteFill>
     );
   };
   ```

2. **Bước 2:** Mở [`remotion-composer/src/Explainer.tsx`](../remotion-composer/src/Explainer.tsx), import `BookQuote` và thêm 1 dòng `if` trong `SceneRenderer`:
   ```tsx
   if (cut.type === "book_quote" && cut.text) {
     return maybeWrapWithBg(
       <BookQuote quote={cut.text} author={cut.subtitle} accentColor={accent} />
     );
   }
   ```

3. **Bước 3:** Từ giờ trong file JSON kịch bản, bạn chỉ cần viết `"type": "book_quote"` là sử dụng được ngay!

---

## Phần 5: Tổng Hợp Các Lệnh Chạy Nhanh Hàng Ngày

| Mục đích | Lệnh chạy trong PowerShell / Terminal |
|---|---|
| **1. Tạo giọng đọc tiếng Việt Vibi TTS + `.srt`** | `python _tools/vibi_tts.py --text "Nội dung kịch bản..." --out-mp3 Chu-De/Tam-Ly-Hoc-Tu-Duy/tts_tap2.mp3 --out-srt Chu-De/Tam-Ly-Hoc-Tu-Duy/tts_tap2.srt` |
| **2. Tải tư liệu video/ảnh đa nguồn cho 6 chủ đề** | `python _tools/fetch_unique_topic_assets.py` |
| **3. Tự động đóng gói Props & Render cả 6 chủ đề** | `python _tools/run_openmontage_6_topics.py` |
| **4. Mở giao diện thiết kế trực tiếp Remotion Studio** | `cd remotion-composer ; npx remotion studio` |
| **5. Render lẻ 1 video bất kỳ từ file JSON Props** | `cd remotion-composer ; npx remotion render src/index.tsx Explainer ../Chu-De/Tam-Ly-Hoc-Tu-Duy/video_moi.mp4 --props public/demo-props/om_t1_behavior.json --codec h264` |
| **6. Mở bảng theo dõi dự án Backlot Storyboard** | `python -m backlot open` |
