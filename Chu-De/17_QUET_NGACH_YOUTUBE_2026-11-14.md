
# Quét ngách YouTube Việt Nam và quốc tế, và cách dùng tool cho từng ngách

Báo cáo ngày 14/11/2026. Lần quét này dùng công cụ tự xây trong workspace (`_tools/scan_niches.py` và `_tools/analyze_niches.py`) để thu thập 4.585 video trên 22 nhóm ngách từ YouTube công khai, rồi chấm điểm bằng `yt-viral/swipe.py` (bội số trên trung vị kênh của chính nó) và khớp công thức hook bằng `yt-script/hooks.json`.

Dữ liệu gốc lưu ở `_tools/niche_scan.json` (thu thập) và `_tools/niche_detail.json` (276 video có ngày đăng, like, comment, tag).

Phần này bổ sung cho [16_PHAN_TICH_DOC_LAP_GITHUB_THI_TRUONG_NGACH_2026-11-14.md](./16_PHAN_TICH_DOC_LAP_GITHUB_THI_TRUONG_NGACH_2026-11-14.md), nơi đã đánh giá 19 repo, xếp hạng thị trường và đề xuất một ngách. Ở đây tôi trả lời rộng hơn: những ngách nào có tìm năng, và với mỗi ngách thì dùng tool nào, quy trình thế nào.

## 1. Cách đọc số liệu lần này

Ba điều cần biết trước khi đọc bảng:

1. **Lượt xem thô không nói lên ý tưởng.** Video 400.000 lượt trên kênh 2 triệu người đăng ký chỉ là thứ bình thường. Cách so sánh đúng là bội số trên trung vị của chính kênh đó, và cần ít nhất 4 video mỗi kênh thì trung vị mới có nghĩa. Đây chính là logic của `yt-viral/swipe.py`.
2. **Query tìm kiếm trả về cả kênh lớn.** Với các nhóm chỉ có truy vấn từ khoá, trung vị bị kéo lên rất cao và không còn phản ánh ngách. Ở những nhóm đó tôi dùng cách khác: xem video năm 2026 và video bùng nổ thay vì trung vị.
3. **Số sao không nói lên độ chín.** Repo có 2.000 sao với 3 commit vẫn là repo dùng được.

Bộ công cụ đã dùng cho lần quét:

| Công cụ | Vai trò | Kết quả |
|---|---|---|
| `_tools/scan_niches.py` (mới) | Thu thập video công khai qua `yt_dlp`, chế độ flat playlist | 22 nhóm, 4.585 video |
| `_tools/analyze_niches.py` (mới) | Tính trung vị kênh, bội số, khớp công thức hook | Bảng xếp hạng bên dưới |
| `yt-viral/swipe.py` | Chấm điểm bội số, gắn nhãn công thức hook | Dùng lại logic có sẵn |
| `yt-script/hooks.json` | 21 công thức hook tiếng Anh | Khớp theo tiêu đề video 2026 |
| `yt_dlp` (đã có trong Python) | Metadata, ngày đăng, like, comment, tag | 276 video chi tiết |

Hai giới hạn của lần quét:

- Không có chỉ số RPM hay thu nhập trong lần này. Con số tiền ở file phân tích chính lấy từ vidIQ và NexLev, không lấy từ đây.
- Ngày đăng chỉ có ở 276 video lấy chi tiết. Nhóm nào không có cột "video năm 2026" thì phải đọc bằng tiêu đề.

## 2. Bảng tổng quan 22 nhóm

| Nhóm | Số video | Số kênh | Tổng lượt xem | Trung vị lượt xem | Video ≥8p | Video ≥15p |
|---|---|---|---|---|---|---|
| vn_ha_tang_dia_ly | 659 | 37 | 37.299.845 | 6.500 | 645 | 50 |
| vn_vi_sao_hang_khong | 50 | 41 | 97.335.493 | 772.673 | 44 | 34 |
| vn_lich_su_tu_lieu | 53 | 24 | 112.333.955 | 908.304 | 48 | 37 |
| vn_thieu_nhi_hoa_anh | 53 | 35 | 37.849.401 | 496.273 | 41 | 29 |
| vn_truyen_audio | 50 | 33 | 38.196.105 | 278.496 | 50 | 49 |
| vn_vi_sao_chi_tiet | 58 | 48 | 28.792.945 | 273.602 | 51 | 40 |
| vn_science_thu_gian | 63 | 16 | 56.899.401 | 0 | 26 | 12 |
| vn_tai_chinh_chung_khoan | 70 | 44 | 28.419.014 | 146.804 | 59 | 46 |
| vn_suc_khoe_dinh_duong | 65 | 41 | 164.927.394 | 396.979 | 49 | 39 |
| vn_cau_chuyen_bep_ky_thuat | 60 | 43 | 81.437.676 | 602.693 | 44 | 24 |
| intl_how_i_made | 60 | 59 | 63.312.546 | 86.112 | 37 | 17 |
| intl_space_science | 58 | 42 | 401.029.437 | 944.901 | 28 | 23 |
| intl_military_tech | 60 | 43 | 205.559.501 | 952.098 | 49 | 36 |
| intl_megaproject | 832 | 57 | 137.149.615 | 11.000 | 802 | 137 |
| intl_geopolitics_map | 625 | 55 | 2.020.249.264 | 1.900.000 | 394 | 217 |
| intl_code_simulation | 419 | 45 | 2.782.415.957 | 2.600.000 | 161 | 78 |
| intl_psychology_philosophy | 72 | 49 | 850.383.713 | 3.535.590 | 57 | 43 |
| intl_finance_history | 50 | 40 | 467.677.954 | 177.129 | 30 | 14 |
| intl_documentary_4k | 50 | 33 | 218.127.329 | 780.142 | 48 | 43 |
| intl_health_science | 50 | 25 | 143.730.609 | 706.981 | 16 | 11 |
| intl_ai_tools | 49 | 37 | 35.267.974 | 176.490 | 47 | 36 |
| intl_football_reaction | 49 | 38 | 77.653.825 | 388.569 | 25 | 9 |

Cột trung vị ở các nhóm chỉ có truy vấn từ khoá (trung vị 177.129 đến 3.535.590) phản ánh kênh lớn xuất hiện trong kết quả tìm kiếm, không phải mức trung bình của ngách. Với các nhóm đó tôi dùng cột "kênh mạnh nhất" ở mục 3.

## 3. Kênh mạnh nhất mỗi nhóm

| Nhóm | Kênh dẫn đầu (trung vị lượt xem) |
|---|---|
| vn_ha_tang_dia_ly | GHIỀN ĐỊA LÝ 299.536 · Tọa Độ Xưa 52.000 · Land Connect 5.900 |
| vn_vi_sao_hang_khong | Không có kênh nào đủ 4 video; nhóm này gộp kênh lớn |
| vn_lich_su_tu_lieu | EZ Sử 2.351.731 · Sử Lược 921.379 · Trang Sử Việt Nam 214 |
| vn_thieu_nhi_hoa_anh | What's Up English 710.986 · Learn English with Om 43.708 |
| vn_truyen_audio | CHUYỆN MA CHÚ 3 DUY 1.756.043 · Đất Đồng Radio 480.259 |
| vn_vi_sao_chi_tiet | Tri Kỷ Cảm Xúc 526.389 · Hoạt Hình Khám Phá Khoa Học 279.786 |
| vn_science_thu_gian | MangoVid 5.603.604 |
| vn_tai_chinh_chung_khoan | Cú Thông Thái 160.623 · Hoàng Vinh 143.125 · Mèo Giải Thích 111.315 |
| vn_suc_khoe_dinh_duong | Bác sĩ Trần Văn Phúc 518.339 · Bác sĩ Hải 122.415 |
| vn_cau_chuyen_bep_ky_thuat | Cô Ba Bình Dương 2.640.248 |
| intl_megaproject | MegaBuilds 50.000 · FctryBuilt 7.900 · GyaanProcess 6.100 · Unthinkable Build 4.100 |
| intl_geopolitics_map | RealLifeLore 2.950.000 · Countryballs Explained 137.000 |
| intl_code_simulation | Vsauce 2.900.000 |
| intl_psychology_philosophy | TED-Ed 7.575.579 · TEDx Talks 6.120.370 |
| intl_finance_history | TED-Ed 1.312.579 |
| intl_documentary_4k | Scenic Relaxation 5.579.835 |
| intl_health_science | TED-Ed 4.800.090 · TED 2.272.029 · Andrew Huberman 1.060.961 |
| intl_ai_tools | Tech With Tim 50.921 · AI Master 32.692 |
| intl_football_reaction | Football Made Simple 315.188 |
| intl_space_science | National Geographic 3.785.220 · BBC Earth Science 2.070.467 |
| intl_military_tech | Yarnhub 11.147.615 |
| intl_how_i_made | Không có kênh nào đủ 4 video trong tập lấy |

Hai điểm đáng chú ý:

- **Ở ngách hạ tầng và địa lý Việt Nam, trung vị lượt xem của kênh nhỏ mới là 5.900 (Land Connect) trong khi GHIỀN ĐỊA LÝ đạt 299.536.** Kênh lớn ở đây không phải vì nội dung hay hơn, mà vì họ có thư viện video dài và đã đầu tư. Đây là ngách nơi một kênh nhỏ vẫn cạnh tranh được.
- **Ở ngách quốc tế, trung vị của kênh dẫn đầu cao hơn hẳn: RealLifeLore 2.950.000, TED-Ed 4.800.090.** Cùng một video "giải thích" mà ở Việt Nam đạt vài trăm nghìn, ở thị trường quốc tế đạt vài triệu, và tiền quảng cáo trên mỗi lượt cũng cao hơn khoảng 10 lần.

## 4. Bản đồ ngách: cái gì đang chạy, cái gì không

### 4.1 Video bùng nổ Việt Nam năm 2026

Từ 35 video hạ tầng và địa lý Việt Nam có ngày đăng năm 2026:

| Lượt xem | Thời lượng | Like | Tiêu đề |
|---|---|---|---|
| 528.033 | 30:57 | 2.485 | 5 SIÊU THÀNH PHỐ TRỰC THUỘC TRUNG ƯƠNG TIẾP THEO CỦA VIỆT NAM |
| 501.936 | 14:39 | 4.444 | Vì Sao Phú Quốc Gần Campuchia Nhưng Vẫn Thuộc Việt Nam? |
| 399.347 | 13:15 | 2.141 | Giải thích kinh tế Đài Loan trong 10 phút |
| 387.578 | 15:15 | 1.449 | Bypassing Singapore: Why Are the World's Megaships Choosing the Cai Mep Port? |
| 333.559 | 34:11 | 1.796 | 37 SỰ THẬT ĐỊA LÝ KHÓ TIN VỀ ẤN ĐỘ |
| 274.151 | 17:42 | 717 | The 2026 GDP Paradox and the Cash Crunch |
| 239.339 | 11:04 | 545 | Vì Sao Việt Nam Dám Xây Hàng Trăm Dự Án Nghìn Tỷ: Tiền Ở Đâu Ra? |
| 190.684 | 16:51 | 502 | Why Is Cam Ranh the Number 1 Natural Military Port in Southeast Asia? |
| 114.080 | 18:41 | 1.726 | Tại sao LOGISTICS QUYẾT ĐỊNH VẬN MỆNH MỘT QUỐC GIA? |

Đọc ra ba quy luật:

1. **Câu hỏi về một địa điểm cụ thể thắng câu hỏi về một danh sách.** "Vì sao Phú Quốc gần Campuchia nhưng vẫn thuộc Việt Nam" (501.936) thắng "5 siêu thành phố" (528.033, dài 30:57). Ngược lại, "37 sự thật địa lý Ấn Độ" vẫn đạt 333.559 vì đề tài Ấn Độ bám hơn.
2. **Có đối thủ nổi tiếng để so thì thắng.** "Bypassing Singapore" đạt 387.578 vì Singapore là thứ khán giả Việt biết rõ. "Vì sao Phú Quốc..." cũng có Campuchia.
3. **Video tiếng Anh về Việt Nam cũng chạy được ở thị trường Việt.** "Bypassing Singapore" (tiếng Anh) đạt 387.578 lượt trên kênh Việt, và "Giải thích kinh tế Đài Loan trong 10 phút" đạt 399.347. Khán giả Việt không chỉ xem tiếng Việt.

Tỷ lệ like trung vị của nhóm hạ tầng Việt là 0,63%, bình luận 0,085%. Ở nhóm mô phỏng bằng code quốc tế: like 2,90%, bình luận 0,127%. Chênh lệch này là lý do ngách "vì sao" khó kiếm tiền hơn ngách giải thích trực quan.

### 4.2 Video bùng nổ quốc tế năm 2026

| Lượt xem | Thời lượng | Like | Tiêu đề | Kênh |
|---|---|---|---|---|
| 12.373.316 | 136:55 | 41.333 | CHINESE MEGASTRUCTURES | Engineering the Future |
| 4.413.121 | 17:36 | 12.391 | Inside the World's Longest "UnderSea" Tunnel | — |
| 3.847.548 | 16:24 | 10.803 | Inside China's $20B "Deep-Sea" Bridge | — |
| 3.730.317 | 9:40 | 8.598 | How Dubai Built a $1B Hotel on Open Water | GyaanProcess |
| 3.705.334 | 8:06 | 27.328 | The $100B Plan to Bypass the Strait of Hormuz | Unthinkable Build |
| 2.760.448 | 16:06 | 5.687 | Japan Built a $20 Billion Airport on the Ocean — Now It's Sinking | FctryBuilt |
| 2.632.417 | 29:30 | 44.910 | Norway is Building The World's Deepest Mega-Tunnel | — |
| 2.299.137 | 15:20 | 21.690 | The Brooklyn Bridge Should Have Been Impossible in 1870 | — |
| 1.893.875 | 9:29 | 16.435 | India Is Building a Dam Across the Sea | Unthinkable Build |
| 489.697 | 11:03 | 3.887 | I Trained an AI Until It Mastered Physics | — |

Công thức hook ở nhóm này rất rõ. Phân bố theo `hooks.json` cho video năm 2026:

| Nhóm | Công thức hook chiếm nhiều nhất |
|---|---|
| intl_megaproject | The Question 24 · The Impossible Claim 3 · The List 3 |
| intl_geopolitics_map | The Question 7 · The List 3 · The Clock 1 |
| intl_code_simulation | The Question 6 · The Statistic 1 |
| vn_ha_tang_dia_ly | The Question 12 · The List 4 |

"The Question" là công thức mạnh nhất trong cả bốn nhóm giải thích. Trong tiếng Việt, "The Question" tương ứng với "Vì sao", "Tại sao", "Vì sao...?" mở đầu tiêu đề.

### 4.3 Ngách nào không nên làm

Bằng chứng từ lần quét:

| Ngách | Vì sao không nên |
|---|---|
| vn_truyen_audio | Trung vị lượt xem của kênh nhỏ chỉ 8.211 đến 12.854 trong khi kênh đã có thư viện đạt 1,7 triệu. Video đồng đạo không bùng nổ (tỷ lệ bội số thấp nhất trong các nhóm Việt). Cộng với rủi ro chính sách đọc lại truyện người khác. |
| vn_tai_chinh_chung_khoan | Video bùng nổ là "Hướng Dẫn Đầu Tư Chứng Khoán Cơ Bản Từ A-Z" (1.490.473) của một kênh đã có 160.623 lượt trung vị. Đây là ngách cần uy tín và thương hiệu, không phải ngách mới làm được. Ngoài ra còn là nội dung tài chính, dễ bị hạn chế quảng cáo. |
| vn_suc_khoe_dinh_duong | Video bùng nổ là của bác sĩ có tên tuổi (Bác sĩ Trần Văn Phúc, 109 phút). Ngách này cần chứng chỉ và danh tính thật. Không dựng được bằng AI mà vẫn đáng tin. |
| vn_cau_chuyen_bep_ky_thuat | Video bùng nổ là "Cách nấu BÚN BÒ HUẾ" của một đầu bếp nổi tiếng với 2,6 triệu lượt trung vị. Ngách này cần bàn tay thật, không dựng bằng code. |
| vn_science_thu_gian | Trung vị 0 lượt trong tập lấy, vì toàn video là Shorts. Nhóm này là Shorts, không phải video dài. Dùng để làm Shorts cắt từ video dài, không phải kênh chính. |
| intl_football_reaction | Chỉ 2 video vượt trung vị, cả hai đều dài trên 80 phút. Ngách này cần kiến thức chiến thuật sâu và tiền thuê người vẽ sơ đồ. |
| intl_ai_tools | Video bùng nổ là hướng dẫn build AI agent (999.839 và 1.021.094). Ngách dạy kỹ năng có tuổi thọ ngắn, dễ bị lỗi thời, và cạnh tranh với chính các nhà sản xuất công cụ. |

### 4.4 Ngách nào có tìm năng thật

Bốn ngách tôi xếp vào nhóm đáng làm, dựa trên ba tiêu chí: có video mới nổi được người xem tìm kiếm, dựng được bằng code (không cần mặt người thật), và không bị chính sách loại.

| Hạng | Ngách | Bằng chứng | Rủi ro |
|---|---|---|---|
| 1 | Hạ tầng và địa lý kinh tế Việt Nam, bằng bản đồ | Land Connect đạt bội số 83,2 lần trung vị kênh; GHIỀN ĐỊA LÝ 528.033 lượt; Tọa Độ Xưa 734.931 lượt trong 17 ngày | Cạnh tranh cao, cần bản đồ dựng thật |
| 2 | Giải thích công trình lớn bằng mô phỏng code, tiếng Anh | 10 video năm 2026 trên 2,6 triệu lượt trở lên; "I Trained an AI Until It Mastered Physics" 489.697 lượt; kênh Unthinkable Build trung vị chỉ 4.100 nhưng một video đạt 3.705.334 | Làn sóng sao chép, đòi hỏi kỹ thuật cao |
| 3 | Địa lý và địa chính trị bằng bản đồ, tiếng Anh | "How did Vietnam exist?" của Countryballs Explained đạt 1.300.000 lượt trên kênh trung vị 137.000 (bội số 9,5) | Chính trị là vùng nhạy cảm |
| 4 | Tóm tắt lịch sử dài, có cấu trúc | "Quick summary of Vietnamese history over 4000 years" đạt 17.297.545 lượt (bội số 7,4); video 150 phút đạt 9.798.535 | Cần nguồn chính xác tuyệt đối, dễ bị hạn chế quảng cáo nội dung chiến tranh |

## 5. Ma trận ngách × tool

Bảng này là phần bạn hỏi: với mỗi ngách thì dùng tool nào. Các tên viết tắt:

| Viết tắt | Tool |
|---|---|
| OM | OpenMontage (pipeline `animated-explainer`, `documentary-montage`) |
| SK | `shorts-kit` (bản đồ, sổ nguồn, quy trình) |
| YAS | `youtube-agent-skill` (yt-script, yt-package, yt-retention, yt-viral, yt-shorts, yt-seo) |
| RV | `rea-video` (phân rã video) |
| CV | `CIT Voice Studio` (giọng Việt offline) |
| VB | `Vibi TTS` (đã có trong workspace) |
| INK | `openmontage-ink-theater` (metaphor bằng hình vẽ) |
| SM | `stickman-video-director` + `StykAnimate` |
| C3D | `cartoon-3d-short` (three.js trong Remotion) |
| CIM | `cinecode` (dựng video bằng code) |
| OC | `OpenCreator` (dịch, lồng tiếng 123 ngôn ngữ) |
| TB | `turboflow` (Google Flow: Veo 3.1, Omni Flash, Nano Banana) |
| MAN | `manim` (biểu đồ kỹ thuật) |

| Ngách | Tool chính | Tool hỗ trợ | Không dùng |
|---|---|---|---|
| Hạ tầng, địa lý Việt Nam | SK, OM | YAS, VB, MAN, RV | TB, Muse (3 repo), MoneyPrinterTurbo |
| Công trình lớn, mô phỏng code (EN) | OM, CIM | YAS, OC, TB, INK | RV (chỉ để học), Muse |
| Địa lý, biên giới (EN) | SK, OM | YAS, INK, C3D | TB (bản đồ phải đúng) |
| Tóm tắt lịch sử | OM, SK | YAS, VB, RV | SM, C3D |
| Khoa học, vũ trụ (EN) | OM, MAN | TB, INK, C3D | SK (không cần bản đồ) |
| Tâm lý, triết học (EN) | OM, INK | YAS, TB | SM |
| Tài chính, kinh tế học | OM, MAN | YAS, SK (biểu đồ) | TB |
| Truyện audio, truyện ma | VB hoặc CV | OM (montage), YAS | SK, SM, TB, MoneyPrinterTurbo |
| "Vì sao" trong một lĩnh vực | OM, INK | YAS, VB, RV | SK (trừ khi lĩnh vực có bản đồ) |
| Kỹ thuật AI, hướng dẫn | OM, OC | YAS, TB | RV, Muse |
| Ẩm thực, kỹ thuật nấu | OM, TB | YAS, VB | SM, SK |
| Thể thao, chiến thuật | OM, MAN | YAS, RV | SK, TB |

## 6. Quy trình cho từng ngách

### 6.1 Hạ tầng và địa lý kinh tế Việt Nam

Đây là ngách được đề xuất ở file phân tích chính. Quy trình đầy đủ nằm ở mục 11 của file đó. Tóm tắt phần khác biệt:

```
Nguồn đề tài  ->  SK: docs/facts/facts.json (sổ nguồn)  ->  SK: map.json + bun run satellite/geo
              ->  OM animated-explainer  ->  VB lồng tiếng  ->  SK subtitle_gen  ->  YAS yt-retention
```

Khác biệt so với ngách khác: mỗi cảnh phải có tọa độ thật, và mọi con số phải truy được về một dòng trong sổ nguồn. Đây là lý do ngách này khó sao chép hơn ngách megaproject tiếng Anh.

### 6.2 Công trình lớn và mô phỏng bằng code (tiếng Anh)

Khác với ngách bản đồ ở chỗ không cần tư liệu ngoài, nên nhịp làm nhanh hơn nhiều.

```
Quét đối thủ  ->  RV phân rã 3 video để thấy nhịp cắt
              ->  OM: viết bằng code (CIM) hoặc dùng footage có license
              ->  TB nếu cần cảnh AI: Omni Flash 10 giây, Veo 3.1 cho cảnh chuyển động
              ->  INK cho cảnh giải thích khái niệm bằng hình vẽ
              ->  OC để lồng tiếng bản tiếng Đức/Tây Ban Nha
              ->  YAS yt-retention
```

Lưu ý chi phí: TB gọi Google Flow, cần tài khoản Google và chạy Chrome với cổng 9222. Cảnh AI 10 giây mỗi đoạn, một video 10 phút cần khoảng 60 đoạn nếu dùng AI cho toàn bộ. Thực tế nên dùng AI cho 20 đến 30% và code cho phần còn lại.

### 6.3 Địa lý và địa chính trị bằng bản đồ (tiếng Anh)

Giống 6.1 nhưng thêm hai điểm:

- **Kiểm tra biên giới trước khi dựng.** Bản đồ nền lấy từ nguồn nước ngoài có thể vẽ sai ở vùng nhạy cảm. `bun run geo --vietnam` dựng lại bộ dữ liệu Việt Nam có Hoàng Sa và Trường Sa từ tọa độ đảo gốc.
- **Tránh suy đoán năng lực quân sự.** Kênh có "Why Is Cam Ranh the Number 1 Natural Military Port" đạt 190.684 lượt, nhưng nội dung về căn cứ và sức mạnh quân sự dễ bị hạn chế quảng cáo. Giữ ở hạ tầng dân sự và kinh tế.

### 6.4 Tóm tắt lịch sử dài

Ngách này dựng nhanh nhất trong nhóm dài, vì không cần bản đồ. Nhưng nó đòi hỏi nghiên cứu kỹ nhất.

```
SK: sổ nguồn (bắt buộc, không có nguồn thì không được đăng)
 -> OM: dựng timeline bằng code, chữ là tham số
 -> VB lồng tiếng, dài 30 đến 150 phút
 -> YAS: yt-chapters để chia mốc thời gian
```

Bằng chứng cho thấy thời lượng dài không phải rào cản: video 150 phút đạt 9.798.535 lượt, video 516 phút đạt 3.357.911. Rào cản là độ chín của nguồn.

### 6.5 Khoa học và vũ trụ (tiếng Anh)

Đây là ngách mà dây chuyền hiện tại khá phù hợp, vì không cần gốc riêng.

```
MAN cho biểu đồ kỹ thuật (quỹ đạo, tỉ lệ, so sánh kích thước)
 -> TB cho cảnh không gian
 -> OM Remotion ghép biểu đồ + cảnh
 -> INK cho cảnh giải thích khái niệm
```

Mẫu bùng nổ rõ: "Solar System 101" của National Geographic đạt 39.813.028 lượt trong video 4 phút. Định dạng "101" và thời lượng ngắn để dẫn nhập một chủ đề lớn.

### 6.6 Tâm lý và triết học (tiếng Anh)

Ngách này cần cảnh giải thích trừu tượng, và đó là lúc INK bật cảnh giải thích khái niệm bằng hình vẽ bắt vào sứ mệnh.

```
INK: khái niệm -> một hành động vật lý -> một vật thể đơn giản
 -> OC hoặc VB lồng tiếng
 -> OM Remotion
```

Rủi ro cao nhất trong nhóm quốc tế: chính sách YouTube ghi rõ loại "nhân vật AI đóng vai chuyên gia ở chủ đề nhạy cảm". Không làm video kiểu "chuyên gia AI" về tâm lý và trị liệu.

### 6.7 Truyện audio và truyện ma

Quy trình ngắn nhất, nhưng ngách có vấn đề.

```
VB (25 giọng Việt) hoặc CV (VieNeu offline, có thẻ cảm xúc và hội thoại nhiều vai)
 -> OM documentary-montage cho hình
 -> OM để dựng từ nhiều tư liệu
```

Hai điều bắt buộc: truyện phải do bạn viết (không đọc lại truyện người khác, không kiếm tiền được), và phải có nguồn cho mỗi chi tiết lịch sử.

### 6.8 Kỹ thuật AI và hướng dẫn dùng tool

```
OC (dịch và lồng tiếng đa ngôn ngữ) + TB (sinh hình minh họa)
 -> OM Remotion với code highlight
 -> YAS yt-chapters
```

Ngách này không bền: công cụ thay đổi mỗi vài tháng, và video hướng dẫn AI agent hiện đang là dạng bùng nổ nhanh nhất nhóm quốc tế. Nếu làm thì phải cập nhật video cũ.

## 7. Ba cách dùng tool thu hút nhất

### 7.1 Chuỗi công cụ tạo hình nhanh nhất cho video giải thích dài

Đây là chuỗi tôi khuyên cho phần lớn các ngách, vì nó tận dụng đúng những gì đã cấu hình trên máy.

```
YAS yt-package (chốt tiêu đề + thumbnail)
  -> YAS yt-script hookscore (chấm hook, lặp tới khi điểm > 70)
  -> OM animated-explainer: research -> proposal -> script -> scene_plan -> assets
  -> TB cho 20-30% cảnh (Omni Flash 10s) hoặc SM cho nhân vật
  -> VB lồng tiếng Việt / openai_tts cho tiếng Anh
  -> OM Remotion ghép (chữ là tham số)
  -> OM subtitle_gen (SRT tải lên YouTube, không in vào hình)
  -> OM visual_qa + composition_validator + audio_probe
  -> YAS yt-seo + yt-chapters
  -> Đăng tay qua YouTube Studio
  -> YAS yt-retention sau 48 giờ
```

Điểm mấu chốt: chữ trên hình phải là tham số của cảnh Remotion, không in cứng. Như vậy cùng một video dựng được ra bản tiếng Anh chỉ bằng cách đổi tham số, và không phải làm lại hình.

### 7.2 Chuỗi cho ngách bản đồ

Bổ sung vào chuỗi trên, thay bước hình:

```
SK: map.json (tọa độ thật cho mỗi cảnh)
  -> bun run satellite <id>  (ảnh vệ tinh EOX, CC BY 4.0)
  -> bun run geo <id>        (bờ biển, biên giới, sông từ Natural Earth)
  -> SK SatelliteMap + VectorLayer + Route + Measure + VietnamMap
  -> SK: ghi nguồn EOX vào docs/facts/sources.json
  -> OM Remotion
```

Cấu hình tọa độ của `shorts-kit`: Web Mercator chuẩn hoá 0 đến 65536. Đó là không gian duy nhất để ảnh raster và đường sông vector cùng nằm trong một viewBox, và là điều làm camera bay được.

Quy tắc bắt buộc: một cảnh cho một mức tỉ lệ, không cắt giữa hai địa điểm trên cùng một bản đồ, vẽ lên ảnh chứ không vẽ lên thẻ, khoảng cách đo từ `distanceKm()` chứ không trích số đã nghe, và dòng ghi nguồn EOX phải hiện trên hình.

### 7.3 Chuỗi cho ngách ngắn (Shorts cắt từ video dài)

```
YAS yt-shorts (tìm đoạn có thể cắt)
  -> OM captions-and-clipping / C3D nếu cần phong cách hoạt hình
  -> OM Remotion dọc 1080x1920
  -> OM subtitle_gen (phụ đề đốt lưu bắt buộc)
```

Nếu làm kênh tiếng Việt, Shorts cắt từ video dài là cách tốt nhất để có video mỗi tuần mà không tốn thêm một tập dài nữa.

## 8. Những gì không nên dùng

| Không dùng | Vì sao |
|---|---|
| `MoneyPrinterTurbo` | Chính sách gọi đúng là "sản xuất hàng loạt" và "nội dung khuôn chung chung". README của chính repo ghi mặc định lấy nhạc từ video YouTube khác. |
| 3 repo Muse | Muse chỉ mở ở Mỹ, Canada, Nhật, Singapore; `d4ncboz/museai` dùng cookie phiên và không còn cập nhật; `useapi/muse-api` phải giao email và mật khẩu Muse cho bên thứ ba. |
| `morluto/rea` | Là công cụ dịch ngược phần mềm, không liên quan video. Tên giống `rea-video` nhưng là dự án khác. |
| `CopilotKit/openbot`, `CopilotKit/openmuse` | Không phải công cụ làm video. |
| `bang-motion` cho ident chính | Trùng vai với HyperFrames đã có sẵn trong OpenMontage. Chỉ dùng khi cần ident khác phong cách. |
| `openmuse` cho agent AI | Chỉ là ứng dụng trợ lý cá nhân. |

## 9. Việc cần bạn quyết định

1. Chọn một ngách từ mục 4.4 để bắt đầu. Tôi vẫn khuyên hạ tầng và địa lý kinh tế Việt Nam nếu bạn muốn dùng lợi thế đọc nguồn tiếng Việt, hoặc công trình lớn bằng code tiếng Anh nếu bạn muốn tiền nhanh hơn và chấp nhận cạnh tranh cao.
2. Cài `shorts-kit` trước nếu chọn ngách bản đồ. Việc này mất khoảng 15 phút và là điều kiện tiên quyết cho dây chuyền 7.2.
3. Nhịp làm: 1 hay 2 video dài mỗi tuần. Mỗi tập 8 đến 13 giờ theo ước tính ở file phân tích chính.
4. Có hay không mở kênh tiếng Anh song song. Nếu có, dây chuyền 7.1 đã hỗ trợ, chỉ cần thêm `openai_tts` và `OC` cho bản địa hóa.

## 10. Cách tái lập lần quét này

```bash
cd C:/Users/ACER/Desktop/Openmontage-Room

# 1. Thu thập (giữ nguyên file cũ, chỉ thêm nhóm mới)
python -I _tools/scan_niches.py _tools/niche_plan.json
python -I _tools/scan_niches.py _tools/niche_plan2.json

# 2. Chấm điểm
python -I _tools/analyze_niches.py                    # tất cả 22 nhóm
python -I _tools/analyze_niches.py vn_ha_tang_dia_ly   # một nhóm

# 3. Dùng công cụ sẵn có của youtube-agent-skill cho dữ liệu bạn tự thu
python .agents/skills/youtube-agent-skill__yt-viral/swipe.py collected.json --min 2.0
```

`collected.json` cần ít nhất 4 video mỗi kênh thì trung vị mới có nghĩa:

```json
[{"channel": "...", "title": "...", "views": 412000, "url": "...", "duration": 613}]
```

Lưu ý về `yt-dlp`: đây là dữ liệu công khai. Chỉ dùng để học cấu trúc và đọc nguồn. Không lấy lại footage của người khác.

## 11. Nguồn

Dữ liệu: YouTube công khai, thu thập ngày 14/11/2026 qua `yt_dlp`. File gốc: `_tools/niche_scan.json`, `_tools/niche_detail.json`.

Công cụ phân tích trong workspace: `_tools/scan_niches.py`, `_tools/analyze_niches.py`, `.agents/skills/youtube-agent-skill__yt-viral/swipe.py`, `.agents/skills/youtube-agent-skill__yt-script/hooks.json`.

Chính sách và thị trường: xem [16_PHAN_TICH_DOC_LAP_GITHUB_THI_TRUONG_NGACH_2026-11-14.md](./16_PHAN_TICH_DOC_LAP_GITHUB_THI_TRUONG_NGACH_2026-11-14.md), mục 4 và mục 10.
