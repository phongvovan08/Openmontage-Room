# Khuôn Vàng Dựng Video Giải Mã Bản Đồ & Cookbook Âm Thanh Foley 1:1

Tài liệu đúc kết chuẩn cấu trúc hình ảnh – nhịp dựng – thiết kế âm thanh thực chiến từ các video tham chiếu (Hải trình Biển Đông, 700 năm Hình chữ S, Vịnh Cam Ranh) để áp dụng đồng bộ cho cả **Shorts `45–58 giây` (`9:16`)** lẫn **Tập dài `10–14 phút` (`16:9`)** của kênh *Giải mã địa lý kinh tế và hạ tầng dân dụng Việt Nam bằng bản đồ*.

---

## 1. Ba Khuôn Kịch Bản Bản Đồ Kinh Điển (`3 Archetype Molds`)

| Khuôn | Cấu trúc cốt lõi | Thẩm mỹ & Đạo cụ thị giác đinh | Thích hợp nhất cho |
|---|---|---|---|
| **Khuôn A — So sánh Cửa ngõ / Nút cổ chai Địa lý** | **Hook câu hỏi rẽ nhánh** ("Có mấy cửa / Vì sao phải đi đường này?") → **Giải phẫu từng cửa/nút** (Rộng – Sâu – Lưu lượng + icon mặt cắt tròn) → **Đối chiếu trực diện 1:1** (`Nông·Hẹp` vs `Rộng·Sâu` / `365 m` vs `2.000 m`) → **Cú chốt & mở mồi tập kế** | Quỹ đạo vòng cung + thước kẹp `GeoCaliperRule`, vòng tròn chọn mục tiêu, lát cắt mặt nước/địa chất | Cảng biển, luồng lạch, eo biển, sân bay song hành, nút thắt cao tốc |
| **Khuôn B — Biên niên sử Mở rộng Không gian / Hạ tầng** | **Hook bổ nhào từ Trái Đất / Quốc gia** → **Chuỗi nhịp lặp 3–5 giây:** *Mốc năm đóng dấu → Camera trượt vùng kế → Loang màu vùng mới (`zone_fill`) → Huy hiệu sự kiện nổ pop* → **Tổng kết kích thước kỷ lục** (nhảy số + thước đo điểm dài/hẹp nhất) → **Câu hỏi tương tác địa phương hóa** | Viền phát sáng 2 lớp loang vùng theo thời gian, đồng hồ lật năm ở đỉnh khung hình, ghim ranh giới ngắn | Lịch sử mở rộng mạng lưới cảng/đường sắt/cao tốc, quy hoạch qua các nhiệm kỳ `2015–2050` |
| **Khuôn C — Giải phẫu Điểm Nút Chiến lược Đa Tầng** | **Hook nghịch lý quyền lực / quy hoạch** ("Tại sao mọi tuyến/nhà hoạch định đều nhắm đúng 1 tọa độ này?") → **Zoom sát đo vật lý thực địa** (`~60 km²`, `-18..-20 m`, `5.000 ha`) + **Thả thực thể tỷ lệ thực** (tàu, máy bay) → **Kéo rộng bật Quạt Radar & Huyết mạch** → **Lật trang lịch sử/quyết định trên cùng 1 ghim 3D** → **Chốt thế đứng bằng chùm tia đa hướng** | Viền rực vùng lõi + chữ đo nghiêng bám lòng vịnh/đường băng, `RadarRangeFan`, huy hiệu tròn đổi biểu tượng theo thời kỳ | Đầu mối logistics đa phương thức (Long Thành – Cái Mép, Lạch Huyện, Cam Ranh, trung tâm năng lượng) |

### Quy đổi nhịp dựng giữa Shorts (`9:16`) và Tập dài (`16:9`)

| Thông số nhịp | Shorts `45–58 giây` (`9:16`) | Tập dài `10–14 phút` (`16:9`) |
|---|---|---|
| Tổng số phân cảnh / nhịp lớn | `8–12` micro-scene | `18–22` phân cảnh trong `4–5` chương |
| Nhịp thay đổi thị giác (`Visual Micro-Beat`) | **`2.0–3.5 giây`** (tuyệt đối không giữ tĩnh quá `4s`) | **`3.5–5.5 giây`** (chuyển động đồ họa liên tục, giữ khung nhìn thoáng) |
| Mật độ Foley SFX | **`10–16 cues/phút`** (chỉ đặt ở cú cắt & pop chữ chính) | **`3–5 cues/phút`** (**`1–3` cues trọng điểm mỗi cảnh**, ưu tiên giọng đọc sạch ở các câu phân tích) |
| Số nhãn map đồng thời | Tối đa `2–3` ghim đang bật | Tối đa `3` ghim phụ + `1` thẻ HUD ngữ cảnh trên cùng |
| Góc nghiêng `Tactical3DStage` | `46°–54°` (dễ nhìn khung dọc + nổi chữ giữa) | `52°–56°` lộ đường chân trời sao + `VietnamMiniLocator` |

---

## 2. Chu Trình Nhịp Vi Mô 4 Bước & Nguyên Tắc "SFX Chỉ Cho Điểm Nhấn Thật" (`Selective SFX Discipline`)

Mỗi ý thuyết minh `3–5 giây` trên bản đồ vận hành nhịp thị giác sạch, nhưng **không phải bước nào cũng bật hiệu ứng âm thanh** (giữ khoảng thở cho giọng Vibi TTS `Haitrieu`):

1. **Bước 1 — Tái định khung Camera (chỉ đặt `whoosh -18 ms` cho các cú bay/zoom lớn hoặc `focusWindow` ảnh đinh):**
   - Bay/lướt camera mượt; các cảnh pan chậm theo mạch phân tích giữ im tiếng để nhạc pulse `96 BPM` dẫn tự nhiên.
2. **Bước 2 — Vẽ dấu vết địa lý trọng tâm (`line_draw` / `zone_fill` / `caliper_snap` cho các cự ly & ranh giới chủ chốt):**
   - Đặt hiệu ứng đúng khi lời bình chốt con số đinh (`365 m`, `~40 km`, `5.000 ha`, chuẩn ICAO `760–1.035 m`).
3. **Bước 3 — Bật bằng chứng bước ngoặt (`dossier_snap` + `marker_swipe`, `era_stamp`, `locks`, `rail_glide`, 1 `pin_pop` chọn lọc):**
   - Chỉ kích hoạt âm thanh ở điểm bẻ lái lập luận hoặc đóng dấu bác bỏ/hoàn thành; tuyệt đối tránh chèn tick ở mọi đầu cảnh hay pop nhiều lần liên thanh trong tập dài.
4. **Bước 4 — Quét sạch nhãn cũ (`Clean-Slate Anti-Clutter` — thu hồi im lặng, không SFX):**
   - Thu hồi/làm mờ (`opacity -> 0.15` hoặc ẩn hẳn) các ghim phụ của ý vừa nói xong để giữ tối đa **`<= 3` ghim phụ** cùng lúc và `>= 80%` diện tích ảnh vệ tinh thông thoáng.

---

## 3. Cookbook Ánh Xạ `1:1` Remotion ↔ `sfx_events.json` (`Single Source of Timing Truth`)

Sai lầm phổ biến nhất khiến video bản đồ bị "trôi" tiếng động là viết cứng số giây trong script audio một nơi và viết frame trong React scene một nẻo. Hãy dùng cấu trúc **1 nguồn sự thật về thời gian (`beat` giây tương đối tính từ `start_seconds` của cảnh)**:

### Mẫu TypeScript dùng chung cho `SceneXX.tsx`
```tsx
// data/sceneBeats.ts — Single source of timing truth cho cả Remotion & sfx_events.json
export const SCENE_04_BEATS = {
  camDiveSec: 0.0,        // whoosh (-18ms)
  headerPopSec: 0.35,     // pin_pop
  trace25RSec: 2.4,       // line_draw (đường băng Bắc)
  trace25LSec: 4.1,       // line_draw (đường băng Nam)
  caliper365Sec: 6.8,     // caliper_snap ("365 m")
  jetPassSec: 11.2,       // jet_pass (tàu bay vượt đầu băng)
  warningWakeSec: 16.5,   // warnings (cảnh báo nhiễu động khí)
  staggerComparePops: 21.0, // pin_pop count=2 (365m vs 760–1.035m)
} as const;
```

Trong `Scene04.tsx`, đọc trực tiếp `SCENE_04_BEATS`:
```tsx
const draw25R = interpolate(sec, [SCENE_04_BEATS.trace25RSec, SCENE_04_BEATS.trace25RSec + 0.6], [0, 1], clamp);
const calReveal = interpolate(sec, [SCENE_04_BEATS.caliper365Sec, SCENE_04_BEATS.caliper365Sec + 0.5], [0, 1], clamp);
```

Và trong bước build `sfx_events.json`, tính `t = round(scene_start + beat_sec, 3)` (tuyệt đối **không trừ thủ công `0.018`**, vì `synth_documentary_audio_bed.py` tự động đẩy `whooshes` sớm `18 ms` và `scene_ticks` sớm `15 ms` để não người nghe khớp đúng đỉnh chuyển động thị giác):

```json
{
  "chapter_braams": [0.0, 95.24, 220.08],
  "whooshes": [
    {"t": 30.67, "up": true, "dur": 0.38},
    {"t": 63.93, "up": false, "dur": 0.44}
  ],
  "pin_pops": [
    {"t": 0.35, "count": 1},
    {"t": 116.24, "count": 2, "stagger": 0.14}
  ],
  "line_draws": [{"t": 97.64, "dur": 0.55}],
  "caliper_snaps": [{"t": 102.04, "dur": 0.34}],
  "era_stamps": [14.2, 69.5],
  "zone_fills": [{"t": 18.4, "dur": 0.65}],
  "jet_passes": [{"t": 106.44, "dur": 0.85, "ltr": true}]
}
```
