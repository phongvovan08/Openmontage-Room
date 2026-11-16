import React, { useMemo } from "react";
import {
  AbsoluteFill,
  Audio,
  OffthreadVideo,
  Sequence,
  interpolate,
  spring,
  staticFile,
  useCurrentFrame,
  useVideoConfig,
} from "remotion";
import { MOCHI_AUDIO_MIX_CONFIG } from "./BeMochiEp01Suite";
import {
  MOCHI_EP01_FULL_DURATION_SEC,
  MOCHI_EP01_FULL_WORDS,
  MochiFullWord,
} from "./beMochiEp01FullData";
import { MochiEp01ScienceViz } from "./components/MochiEp01ScienceViz";

export interface BeMochiEp01FullProps {
  clipFolder?: string;
  clipMaxPassFrames?: number;
}

type LayoutMode = "cinema_full" | "editorial_split";

interface FullShotSpec {
  shotNumber: number; // 1..30 -> 001.mp4..030.mp4
  startSec: number;
  endSec: number;
  layout: LayoutMode;
  clockLabel: string;
  chapterLabel: string;
  title: string;
  subtitle: string;
  stateBadge: { label: string; color: string };
  keynoteCard?: {
    eyebrow: string;
    headline: string;
    detail: string;
    accent: string;
  };
}

export const MOCHI_EP01_FULL_SHOTS: FullShotSpec[] = [
  // -------------------- MỞ ĐẦU (00:00 - 00:32.5) --------------------
  {
    shotNumber: 1,
    startSec: 0.0,
    endSec: 16.5,
    layout: "cinema_full",
    clockLabel: "01:30 AM",
    chapterLabel: "MỞ ĐẦU · ĐÊM THỨC TRẮNG",
    title: "MẮT ĐÃ CAY XÈ NHƯNG NGÓN TAY CHẲNG TẮT MÀN HÌNH",
    subtitle: "Cả ngày không khuân vác nặng, vậy mà người rã rời cùng bao cảm xúc chẳng biết gọi tên.",
    stateBadge: { label: "🌙 01:30 SÁNG · MẦM RŨ MỆT", color: "#38BDF8" },
  },
  {
    shotNumber: 2,
    startSec: 16.5,
    endSec: 32.5,
    layout: "editorial_split",
    clockLabel: "24 GIỜ",
    chapterLabel: "BẢN ĐỒ TÂM LÝ · 7 KHUNG GIỜ",
    title: "HÀNH TRÌNH 24 GIỜ GIẢI MÃ 7 CƠN SÓNG NGẦM",
    subtitle: "Gọi đúng tên từng trạng thái kỳ lạ và giữ lại một cách tháo gỡ nhẹ nhàng trước khi ngủ.",
    stateBadge: { label: "🕰️ VÒNG ĐỒNG HỒ 24H", color: "#FDE047" },
    keynoteCard: {
      eyebrow: "LỘ TRÌNH 7 ĐIỂM DỪNG TRONG NGÀY",
      headline: "01:30 ➔ 09:30 ➔ 14:00 ➔ 17:30 ➔ 19:30 ➔ 21:30 ➔ 23:45",
      detail: "Càng cố đè nén cảm xúc không tên, sáng hôm sau tâm trí càng cạn kiệt.",
      accent: "#4ADE80",
    },
  },

  // -------------------- CHƯƠNG 1 (00:32.5 - 01:49.5) --------------------
  {
    shotNumber: 3,
    startSec: 32.5,
    endSec: 56.7,
    layout: "cinema_full",
    clockLabel: "01:30 AM",
    chapterLabel: "CẢM XÚC 01/07 · SỰ TRẢ THÙ GIỜ ĐI NGỦ",
    title: "“NẾU NGỦ NGAY LÚC NÀY, HÔM NAY CHƯA SỐNG CHO RIÊNG MÌNH”",
    subtitle: "Thừa biết sáng mai phải dậy sớm, nhưng bàn tay nhỏ vẫn cố gạt thêm một video nữa.",
    stateBadge: { label: "📱 TRÌ HOÃN GIẤC NGỦ", color: "#38BDF8" },
  },
  {
    shotNumber: 4,
    startSec: 56.7,
    endSec: 78.9,
    layout: "editorial_split",
    clockLabel: "01:30 AM",
    chapterLabel: "CẢM XÚC 01/07 · NGHIÊN CỨU TÂM LÝ",
    title: "12 TIẾNG BAN NGÀY BỊ XÉ VỤN CHO KỲ VỌNG",
    subtitle: "Khi cả thành phố tắt đèn, bóng tối trở thành khoảng lặng duy nhất không ai đòi hỏi gì ở bạn.",
    stateBadge: { label: "🧠 TÂM LÝ HỌC HÀNH VI", color: "#4ADE80" },
    keynoteCard: {
      eyebrow: "FLOOR KROESE · ĐẠI HỌC UTRECHT (HÀ LAN, 2014)",
      headline: "Revenge Bedtime Procrastination",
      detail: "Kroese đặt tên “Trì hoãn giờ đi ngủ”; cư dân mạng châu Á & Daphne K. Lee (2020) thêm chữ “Trả thù”.",
      accent: "#38BDF8",
    },
  },
  {
    shotNumber: 5,
    startSec: 78.9,
    endSec: 94.2,
    layout: "cinema_full",
    clockLabel: "02:00 AM",
    chapterLabel: "CẢM XÚC 01/07 · CÁI BẪY ÁNH SÁNG XANH",
    title: "VAY NÓNG SỨC LỰC NGÀY MAI VỚI LÃI SUẤT CẮT CỔ",
    subtitle: "Ánh sáng điện thoại lúc 2 giờ sáng không trả lại tự do thật sự cho tâm trí.",
    stateBadge: { label: "⚡ RÚT CẠN NĂNG LƯỢNG", color: "#FB7185" },
  },
  {
    shotNumber: 6,
    startSec: 94.2,
    endSec: 109.5,
    layout: "editorial_split",
    clockLabel: "01:30 AM",
    chapterLabel: "CẢM XÚC 01/07 · CÁCH THÁO GỠ TỐI NAY",
    title: "15 PHÚT TỰ DO TỈNH TÁO BÊN CỐC NƯỚC ẤM",
    subtitle: "Tắt đèn lớn sớm 15 phút, úp điện thoại ra xa tầm tay để tâm trí thật sự thuộc về chính mình.",
    stateBadge: { label: "🍵 NGHI THỨC DỊU DÀNG", color: "#4ADE80" },
    keynoteCard: {
      eyebrow: "THÁO GỠ NGAY TỐI NAY · 15 PHÚT TRƯỚC NGỦ",
      headline: "Đặt Điện Thoại Xa Tầm Tay + Ôm Cốc Nước Ấm",
      detail: "Trả lại quyền làm chủ thời gian thật sự thay vì đánh cắp giấc ngủ.",
      accent: "#4ADE80",
    },
  },

  // -------------------- CHƯƠNG 2 (01:49.5 - 03:03.1) --------------------
  {
    shotNumber: 7,
    startSec: 109.5,
    endSec: 131.0,
    layout: "cinema_full",
    clockLabel: "09:30 AM",
    chapterLabel: "CẢM XÚC 02/07 · TIN NHẮN LỬNG LƠ",
    title: "SÁU CHỮ CỤT NGỦN: “CHIỀU RẢNH GẶP ANH CHÚT NHÉ”",
    subtitle: "Chẳng có lời giải thích nào, nhưng tim thắt lại và trên đầu Mochi tụ ngay đám mây mưa xám.",
    stateBadge: { label: "🌧️ MÂY XÁM LO ÂU", color: "#FB7185" },
  },
  {
    shotNumber: 8,
    startSec: 131.0,
    endSec: 146.1,
    layout: "editorial_split",
    clockLabel: "09:30 AM",
    chapterLabel: "CẢM XÚC 02/07 · TÂM LÝ HỌC NHẬN THỨC",
    title: "30 GIÂY TỰ DỰNG MƯỜI KỊCH BẢN ĐÁNG SỢ NHẤT",
    subtitle: "Khi thiếu thông tin rõ ràng, não tự điền kịch bản tệ nhất vào chỗ trống để bắt bạn phòng thủ.",
    stateBadge: { label: "⚠️ CƠN BÃO SUY DIỄN", color: "#FB7185" },
    keynoteCard: {
      eyebrow: "TÂM LÝ HỌC NHẬN THỨC (COGNITIVE PSYCHOLOGY)",
      headline: "Catastrophizing & Negativity Bias",
      detail: "Lối suy diễn thảm họa kết hợp thiên kiến ưu tiên mối nguy bẩm sinh của não bộ.",
      accent: "#FB7185",
    },
  },
  {
    shotNumber: 9,
    startSec: 146.1,
    endSec: 167.2,
    layout: "cinema_full",
    clockLabel: "09:30 AM",
    chapterLabel: "CẢM XÚC 02/07 · BẢN NĂNG NGUYÊN THỦY",
    title: "TIẾNG SỘT SOẠT TRONG BỤI RẬM THỜI CỔ ĐẠI",
    subtitle: "Với hạch hạnh nhân, thà báo động nhầm 99 lần còn hơn bỏ sót một mối nguy thật sự.",
    stateBadge: { label: "🦋 PHẢN XẠ HẠCH HẠNH NHÂN", color: "#FDE047" },
  },
  {
    shotNumber: 10,
    startSec: 167.2,
    endSec: 183.1,
    layout: "editorial_split",
    clockLabel: "09:30 AM",
    chapterLabel: "CẢM XÚC 02/07 · NHỊP TÁCH BẠCH 5 GIÂY",
    title: "TÁCH BỘ PHIM TRONG ĐẦU KHỎI SỰ THẬT",
    subtitle: "Một hơi hít sâu 5 giây đưa quyền điều khiển từ vùng hoảng loạn trở về vùng sáng suốt.",
    stateBadge: { label: "🫧 CHẠM TAN MÂY XÁM", color: "#4ADE80" },
    keynoteCard: {
      eyebrow: "KỸ THUẬT TÁCH BẠCH NHẬN THỨC (5 GIÂY)",
      headline: "“Đây mới là phim do não tự dựng, chưa phải sự thật.”",
      detail: "Làm dịu hạch hạnh nhân (Amygdala) và kích hoạt lại vỏ não lý trí.",
      accent: "#4ADE80",
    },
  },

  // -------------------- CHƯƠNG 3 (03:03.1 - 04:17.3) --------------------
  {
    shotNumber: 11,
    startSec: 183.1,
    endSec: 209.6,
    layout: "cinema_full",
    clockLabel: "14:00 PM",
    chapterLabel: "CẢM XÚC 03/07 · HIỆU ỨNG ĐÈN PHA",
    title: "MỘT CÂU LỠ LỜI MÀ MÁ NÓNG RAN SUỐT CẢ BUỔI CHIỀU",
    subtitle: "Cảm giác như có chiếc đèn sân khấu khổng lồ đang chiếu thẳng vào lỗi nhỏ của riêng mình.",
    stateBadge: { label: "🔦 ĐÈN PHA TÂM TRÍ", color: "#FDE047" },
  },
  {
    shotNumber: 12,
    startSec: 209.6,
    endSec: 236.5,
    layout: "editorial_split",
    clockLabel: "14:00 PM",
    chapterLabel: "CẢM XÚC 03/07 · THÍ NGHIỆM ĐẠI HỌC CORNELL",
    title: "CHÚNG TA ĐOÁN QUÁ GẤP ĐÔI SỰ CHÚ Ý CỦA NGƯỜI KHÁC",
    subtitle: "Chiếc đèn pha chói gắt ấy thực chất chỉ bật sáng bên trong tâm trí bạn mà thôi.",
    stateBadge: { label: "📊 ĐH CORNELL (2000)", color: "#38BDF8" },
    keynoteCard: {
      eyebrow: "GS. THOMAS GILOVICH · ĐẠI HỌC CORNELL (2000)",
      headline: "Spotlight Effect: 50% Dự Đoán vs <25% Thực Tế",
      detail: "Sinh viên mặc áo kỳ quặc đoán 1/2 lớp chú ý, nhưng thực tế chưa tới 1/4 người nhận ra.",
      accent: "#FDE047",
    },
  },
  {
    shotNumber: 13,
    startSec: 236.5,
    endSec: 247.1,
    layout: "cinema_full",
    clockLabel: "14:00 PM",
    chapterLabel: "CẢM XÚC 03/07 · GÓC NHÌN SỰ THẬT",
    title: "AI CŨNG BẬN LO CHO NỖI BẤT AN CỦA RIÊNG MÌNH",
    subtitle: "Mỗi người đều sống ở trung tâm vòm đèn nhỏ của chính họ hơn là soi xét bạn.",
    stateBadge: { label: "💡 AI CŨNG BẬN LO RIÊNG", color: "#4ADE80" },
  },
  {
    shotNumber: 14,
    startSec: 247.1,
    endSec: 257.3,
    layout: "editorial_split",
    clockLabel: "14:00 PM",
    chapterLabel: "CẢM XÚC 03/07 · TẮT ĐÈN PHA VÔ HÌNH",
    title: "CÂU HỎI ĐẢO NGƯỢC ĐỂ NHẸ LÒNG NGAY LẬP TỨC",
    subtitle: "Khi nhận ra câu trả lời là “Không”, chiếc đèn pha trên đầu bạn cũng tự khắc tắt phụt.",
    stateBadge: { label: "🌿 THỞ PHÀO NHẸ NHÕM", color: "#4ADE80" },
    keynoteCard: {
      eyebrow: "CÂU HỎI KIỂM CHỨNG ĐẢO NGƯỢC",
      headline: "“Bạn còn nhớ tuần trước người ngồi cạnh nói vấp câu gì không?”",
      detail: "Không ai lưu giữ lỗi nhỏ của bạn lâu như cách bạn tự dằn vặt chính mình.",
      accent: "#4ADE80",
    },
  },

  // -------------------- CHƯƠNG 4 (04:17.3 - 05:28.2) --------------------
  {
    shotNumber: 15,
    startSec: 257.3,
    endSec: 278.3,
    layout: "cinema_full",
    clockLabel: "17:30 PM",
    chapterLabel: "CẢM XÚC 04/07 · LAO ĐỘNG CẢM XÚC",
    title: "HỌNG NGHẸN MUỐN TỪ CHỐI NHƯNG MÔI VẪN TỰ ĐỘNG CƯỜI",
    subtitle: "“Ừ không sao đâu, cứ đưa đây mình làm nốt cho” — câu nói quen thuộc lúc tan tầm.",
    stateBadge: { label: "🎭 NỤ CƯỜI XÃ GIAO", color: "#FDE047" },
  },
  {
    shotNumber: 16,
    startSec: 278.3,
    endSec: 295.3,
    layout: "editorial_split",
    clockLabel: "17:30 PM",
    chapterLabel: "CẢM XÚC 04/07 · XÃ HỘI HỌC HÀNH VI",
    title: "BÌNH DỰ TRỮ NHẪN NẠI BỊ RÚT CẠN TRÊN ĐƯỜNG VỀ",
    subtitle: "Mỗi nụ cười gượng lúc mệt nhoài, mỗi cái gật đầu trái ý đều âm thầm bào mòn năng lượng.",
    stateBadge: { label: "🪫 BÌNH DỰ TRỮ CẠN ĐỎ", color: "#FB7185" },
    keynoteCard: {
      eyebrow: "GS. ARLIE HOCHSCHILD · THE MANAGED HEART (1983)",
      headline: "Lao Động Cảm Xúc (Emotional Labor)",
      detail: "Liên tục nén cảm xúc thật để giữ vẻ mặt dễ chịu làm kiệt quệ nguồn lực tinh thần cuối ngày.",
      accent: "#FB7185",
    },
  },
  {
    shotNumber: 17,
    startSec: 295.3,
    endSec: 311.8,
    layout: "cinema_full",
    clockLabel: "18:30 PM",
    chapterLabel: "CẢM XÚC 04/07 · HỆ QUẢ ĐAU LÒNG NHẤT",
    title: "DỊU DÀNG HẾT VỚI NGƯỜI NGOÀI, VỀ NHÀ LẠI DỄ NỔI CÁU",
    subtitle: "Không phải vì bạn xấu tính, mà vì bình kiên nhẫn đã chạm đáy ngay trước cửa nhà.",
    stateBadge: { label: "💢 MẦM XẸT LỬA MỆT MỎI", color: "#FB7185" },
  },
  {
    shotNumber: 18,
    startSec: 311.8,
    endSec: 328.2,
    layout: "editorial_split",
    clockLabel: "18:45 PM",
    chapterLabel: "CẢM XÚC 04/07 · VÒM RANH GIỚI BÌNH AN",
    title: "CÂU ĐỆM 10 GIÂY NGẮT PHẢN XẠ GẬT ĐẦU TỰ ĐỘNG",
    subtitle: "Chưa cần từ chối thẳng thừng nếu chưa quen — chỉ cần tạo một khoảng đệm lịch sự.",
    stateBadge: { label: "🛡️ VÒM KÍNH RANH GIỚI", color: "#4ADE80" },
    keynoteCard: {
      eyebrow: "MẪU CÂU ĐỆM BẢO VỆ MẦM XANH (10 GIÂY)",
      headline: "“Để mình xem lại việc hiện tại rồi nhắn bạn sau nhé.”",
      detail: "Giữ lại phần năng lượng dịu dàng cho chính bạn và người thương vào buổi tối.",
      accent: "#4ADE80",
    },
  },

  // -------------------- CHƯƠNG 5 (05:28.2 - 06:42.8) --------------------
  {
    shotNumber: 19,
    startSec: 328.2,
    endSec: 352.4,
    layout: "cinema_full",
    clockLabel: "19:30 PM",
    chapterLabel: "CẢM XÚC 05/07 · SẬP NGUỒN DÙ KHÔNG KHUÂN VÁC",
    title: "NGỒI PHÒNG MÁY LẠNH CẢ NGÀY MÀ NHẤC TAY ĐI TẮM CŨNG QUÁ SỨC",
    subtitle: "Bé Mochi đổ xẹp mềm nhũn trên bàn gỗ như cục bột bánh dày, chiếc lá ngả vàng khô héo.",
    stateBadge: { label: "🫠 XẸP MỀM KIỆT SỨC", color: "#F59E0B" },
  },
  {
    shotNumber: 20,
    startSec: 352.4,
    endSec: 386.8,
    layout: "editorial_split",
    clockLabel: "19:30 PM",
    chapterLabel: "CẢM XÚC 05/07 · THẦN KINH HỌC HIỆN ĐẠI",
    title: "50 ỨNG DỤNG CHẠY NGẦM & QUÁ TẢI VỎ NÃO TRƯỚC TRÁN",
    subtitle: "Não chỉ nặng 2% cơ thể nhưng dùng 20% năng lượng và gánh hàng chục việc bỏ dở chưa khép.",
    stateBadge: { label: "⚙️ 50 TAB CHẠY NGẦM", color: "#38BDF8" },
    keynoteCard: {
      eyebrow: "ZEIGARNIK (1927) & ANTONIUS WIEHLER · CURRENT BIOLOGY (2022)",
      headline: "Decision Fatigue & Hiệu Ứng Zeigarnik",
      detail: "8 tiếng kiểm soát suy nghĩ làm tích tụ chất chuyển hóa ở vỏ não trước trán cộng các vòng lặp mở.",
      accent: "#38BDF8",
    },
  },
  {
    shotNumber: 21,
    startSec: 386.8,
    endSec: 402.8,
    layout: "cinema_full",
    clockLabel: "20:00 PM",
    chapterLabel: "CẢM XÚC 05/07 · ĐÓNG CÁC TAB CHẠY NGẦM",
    title: "VIẾT NHANH 3 VIỆC CÒN VƯỚNG RA TỜ GIẤY NHỎ",
    subtitle: "Khi mắt thấy nỗi lo đã nằm an toàn trên mặt giấy, não mới yên tâm gấp lại thành hạc trắng.",
    stateBadge: { label: "📝 ĐÓNG TAB BỘ NHỚ", color: "#4ADE80" },
  },

  // -------------------- CHƯƠNG 6 (06:42.8 - 07:57.6) --------------------
  {
    shotNumber: 22,
    startSec: 402.8,
    endSec: 433.0,
    layout: "cinema_full",
    clockLabel: "21:30 PM",
    chapterLabel: "CẢM XÚC 06/07 · KHOẢNG TRỐNG SAU VẠCH ĐÍCH",
    title: "CHẠM TAY VÀO MỤC TIÊU MƠ ƯỚC NHƯNG LÒNG LẠI HẪNG HỤT",
    subtitle: "Niềm vui rực rỡ chỉ sáng lên vài hôm, rồi nhường chỗ cho khoảng lặng mênh mông lạ lùng.",
    stateBadge: { label: "🏆 ĐỈNH NÚI TRỐNG TRẢI", color: "#FDE047" },
  },
  {
    shotNumber: 23,
    startSec: 433.0,
    endSec: 456.4,
    layout: "editorial_split",
    clockLabel: "21:30 PM",
    chapterLabel: "CẢM XÚC 06/07 · TÂM LÝ HỌC TÍCH CỰC HARVARD",
    title: "ẢO TƯỞNG ĐÍCH ĐẾN & CƠ CHẾ SỤT GIẢM DOPAMINE",
    subtitle: "Dopamine tiết ra mạnh nhất trên đường chạy tìm kiếm, không phải để giữ sự viên mãn ở vạch đích.",
    stateBadge: { label: "🧬 DOPAMINE KHAO KHÁT", color: "#38BDF8" },
    keynoteCard: {
      eyebrow: "TS. TAL BEN-SHAHAR · ĐẠI HỌC HARVARD",
      headline: "Ảo Tưởng Đích Đến (Arrival Fallacy)",
      detail: "Ngộ nhận rằng chạm tới cột mốc sẽ hạnh phúc mãi mãi; khoảng hẫng sau đích đến là sinh học tự nhiên.",
      accent: "#FDE047",
    },
  },
  {
    shotNumber: 24,
    startSec: 456.4,
    endSec: 477.6,
    layout: "cinema_full",
    clockLabel: "21:45 PM",
    chapterLabel: "CẢM XÚC 06/07 · CỎ CÂY DỌC ĐƯỜNG ĐI",
    title: "NIỀM VUI NHỎ KHÔNG CẦN CHỨNG MINH THÀNH TÍCH",
    subtitle: "Hương trà ấm trên tay, tiếng gió ngoài hiên và một giờ thảnh thơi không gắn với con số nào.",
    stateBadge: { label: "🍵 BÌNH YÊN DỌC ĐƯỜNG", color: "#4ADE80" },
  },

  // -------------------- CHƯƠNG 7 (07:57.6 - 09:01.2) --------------------
  {
    shotNumber: 25,
    startSec: 477.6,
    endSec: 488.8,
    layout: "cinema_full",
    clockLabel: "23:45 PM",
    chapterLabel: "CẢM XÚC 07/07 · NỖI NHỚ CHÍNH MÌNH NGÀY XƯA",
    title: "ĐÊM MƯA NHỚ DA DIẾT CHÍNH MÌNH CỦA BẢY NĂM TRƯỚC",
    subtitle: "Bóng phản chiếu trên ô kính ướt mưa đánh thức khoảng lặng sâu nhất trong ngày.",
    stateBadge: { label: "🌧️ Ô KÍNH KÝ ỨC", color: "#38BDF8" },
  },
  {
    shotNumber: 26,
    startSec: 488.8,
    endSec: 512.2,
    layout: "editorial_split",
    clockLabel: "23:45 PM",
    chapterLabel: "CẢM XÚC 07/07 · TÂM LÝ HỌC PHÁT TRIỂN",
    title: "PHIÊN BẢN TỪNG CƯỜI GIÒN TAN VÌ LY TRÀ SỮA VỈA HÈ",
    subtitle: "Một người từng tin đời hết lòng, chưa biết nhìn sắc mặt ai và chưa quen giấu tiếng thở dài.",
    stateBadge: { label: "🍂 HỒI ỨC TRONG TRẺO", color: "#FDE047" },
    keynoteCard: {
      eyebrow: "TÂM LÝ HỌC PHÁT TRIỂN · NGƯỠNG TRƯỞNG THÀNH",
      headline: "Thương Nhớ Bản Dạng Cũ (Past-Self Nostalgia)",
      detail: "Nỗi chạnh lòng tự nhiên khi một người bước qua va vấp và ngoái nhìn nét hồn nhiên ban đầu.",
      accent: "#FDE047",
    },
  },
  {
    shotNumber: 27,
    startSec: 512.2,
    endSec: 528.6,
    layout: "cinema_full",
    clockLabel: "23:55 PM",
    chapterLabel: "CẢM XÚC 07/07 · SỰ NỨT VỎ ĐỂ NỞ HOA",
    title: "LỚP VỎ HẠT GIỐNG NỨT RA ĐỂ BUNG ĐÓA HOA VÀNG NĂM CÁNH",
    subtitle: "Sự trưởng thành nào cũng cần một lần lột xác âm thầm để đủ sức đi qua giông gió.",
    stateBadge: { label: "🌼 MẦM XANH NỞ HOA VÀNG", color: "#FDE047" },
  },
  {
    shotNumber: 28,
    startSec: 528.6,
    endSec: 541.2,
    layout: "cinema_full",
    clockLabel: "23:58 PM",
    chapterLabel: "CẢM XÚC 07/07 · CÁI ÔM TỰ THƯƠNG",
    title: "ĐỨA TRẺ NĂM ẤY VẪN BÌNH YÊN TRONG LỒNG NGỰC BẠN",
    subtitle: "Giờ đây em ấy đã có chính bạn của hiện tại đủ điềm tĩnh để đứng ra che chở mỗi ngày.",
    stateBadge: { label: "💛 ÔM ĐỨA TRẺ NĂM XƯA", color: "#FDE047" },
  },

  // -------------------- KẾT BÀI (09:01.2 - 09:50.0) --------------------
  {
    shotNumber: 29,
    startSec: 541.2,
    endSec: 564.6,
    layout: "editorial_split",
    clockLabel: "00:00 AM",
    chapterLabel: "KẾT TRỌN VÒNG ĐỒNG HỒ · SỚM HƠN 1 TIẾNG RƯỠI",
    title: "7 TÍN HIỆU DỊU DÀNG — KHÔNG PHẢI BẰNG CHỨNG BẤT ỔN",
    subtitle: "Khi gọi đúng tên từng cơn sóng nhỏ trong lòng, nỗi sợ mơ hồ nhường chỗ cho sự tự thương.",
    stateBadge: { label: "🕛 CHẠM MỐC 00:00 ĐÊM", color: "#4ADE80" },
    keynoteCard: {
      eyebrow: "TỔNG KẾT HÀNH TRÌNH 24 GIỜ CÙNG BÉ MOCHI",
      headline: "00:00 Đêm — Sớm Hơn Hẳn Mốc 01:30 Sáng Mọi Hôm",
      detail: "Tâm trí bạn không yếu đuối; nó chỉ đang nhắn rằng bạn đã âm thầm cố gắng quá nhiều rồi.",
      accent: "#4ADE80",
    },
  },
  {
    shotNumber: 30,
    startSec: 564.6,
    endSec: 590.0,
    layout: "cinema_full",
    clockLabel: "00:00 AM",
    chapterLabel: "CHÚC NGỦ NGON · BÉ MOCHI MẦM XANH",
    title: "CHÚC MẦM XANH CỦA BẠN NỞ ĐÓA HOA BÌNH YÊN TRONG MƠ",
    subtitle: "Bạn bắt gặp chính mình rõ nhất ở khung giờ nào? Nhắn lại bên dưới để biết bạn không đơn độc nhé.",
    stateBadge: { label: "✨ NGỦ NGON NHÉ 🌱", color: "#4ADE80" },
  },
];

// ---------------------------------------------------------------------------
// Seamless Multi-Pass 16:9 Veo 3 Stage (Clamped <= 7.60s per pass, 0.60s Crossfade)
// ---------------------------------------------------------------------------
const SeamlessVeo3WidescreenStage: React.FC<{
  clipSrc: string;
  shotDurationFrames: number;
  width: number;
  height: number;
  veoVolume: number;
  badge: { label: string; color: string };
  clockLabel: string;
  chapterLabel?: string;
  showTopLeftOverlay?: boolean;
  maxPassFrames?: number;
}> = ({
  clipSrc,
  shotDurationFrames,
  width,
  height,
  veoVolume,
  badge,
  clockLabel,
  chapterLabel,
  showTopLeftOverlay = false,
  maxPassFrames = 204,
}) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const enter = spring({ frame, fps, config: { damping: 18, stiffness: 120 } });

  // Safe EOF clamp: stay >= 1.0s below shortest clip duration so OffthreadVideo
  // NEVER seeks near EOF across 24fps/30fps boundaries.
  const PASS_LEN = maxPassFrames;
  const CROSSFADE = 18; // 0.60s
  const STEP = PASS_LEN - CROSSFADE;

  const passes: { idx: number; from: number; dur: number }[] = [];
  for (let i = 0; i * STEP < shotDurationFrames; i++) {
    const from = i * STEP;
    const dur = Math.min(PASS_LEN, shotDurationFrames - from);
    if (dur > 6) {
      passes.push({ idx: i, from, dur });
    }
  }

  return (
    <div
      style={{
        width,
        height,
        borderRadius: 28,
        overflow: "hidden",
        position: "relative",
        border: `2.5px solid ${badge.color}66`,
        boxShadow:
          "0 26px 68px rgba(0, 0, 0, 0.72), 0 0 42px rgba(74, 222, 128, 0.12)",
        backgroundColor: "#070B14",
        opacity: enter,
        transform: `scale(${interpolate(enter, [0, 1], [0.965, 1])})`,
      }}
    >
      {passes.map((p) => {
        const localF = frame - p.from;
        const isVisible = localF >= 0 && localF < p.dur;
        const fadeIn =
          p.idx === 0
            ? 1
            : interpolate(localF, [0, CROSSFADE], [0, 1], {
                extrapolateLeft: "clamp",
                extrapolateRight: "clamp",
              });
        const progress = Math.max(0, Math.min(1, localF / Math.max(1, p.dur)));
        // Alternate subtle cinematic drift vs medium close-up cut-in across passes
        const scale =
          p.idx % 2 === 0
            ? interpolate(progress, [0, 1], [1.0, 1.045])
            : interpolate(progress, [0, 1], [1.085, 1.025]);

        return (
          <Sequence key={p.idx} from={p.from} durationInFrames={p.dur}>
            <AbsoluteFill
              style={{
                opacity: isVisible ? fadeIn : 0,
                transform: `scale(${scale})`,
              }}
            >
              <OffthreadVideo
                src={staticFile(clipSrc)}
                volume={(f) => {
                  const inMul =
                    p.idx === 0
                      ? interpolate(f, [0, 12], [0, 1], {
                          extrapolateLeft: "clamp",
                          extrapolateRight: "clamp",
                        })
                      : interpolate(f, [0, CROSSFADE], [0, 1], {
                          extrapolateLeft: "clamp",
                          extrapolateRight: "clamp",
                        });
                  const outMul = interpolate(
                    f,
                    [Math.max(0, p.dur - CROSSFADE), p.dur],
                    [1, 0],
                    { extrapolateLeft: "clamp", extrapolateRight: "clamp" }
                  );
                  return veoVolume * inMul * outMul;
                }}
                style={{
                  width: "100%",
                  height: "100%",
                  objectFit: "cover",
                }}
              />
            </AbsoluteFill>
          </Sequence>
        );
      })}

      {/* Subtle Cinema Top/Bottom Vignette for UI Legibility */}
      <div
        style={{
          position: "absolute",
          inset: 0,
          background: showTopLeftOverlay
            ? "linear-gradient(180deg, rgba(7,11,20,0.52) 0%, rgba(7,11,20,0.04) 24%, rgba(7,11,20,0.06) 68%, rgba(7,11,20,0.72) 100%)"
            : "linear-gradient(180deg, rgba(7,11,20,0.14) 0%, rgba(7,11,20,0) 30%, rgba(7,11,20,0.48) 100%)",
          pointerEvents: "none",
        }}
      />

      {/* Top-Left Chapter + Clock Pill (Cinema Full Mode) */}
      {showTopLeftOverlay && chapterLabel && (
        <div
          style={{
            position: "absolute",
            top: 22,
            left: 26,
            display: "flex",
            flexDirection: "column",
            gap: 10,
            maxWidth: 1080,
          }}
        >
          <div
            style={{
              display: "inline-flex",
              alignSelf: "flex-start",
              alignItems: "center",
              gap: 12,
              padding: "9px 20px",
              borderRadius: 999,
              backgroundColor: "rgba(10, 18, 32, 0.86)",
              border: "1.8px solid rgba(74, 222, 128, 0.78)",
              backdropFilter: "blur(8px)",
            }}
          >
            <span
              style={{
                padding: "3px 10px",
                borderRadius: 999,
                backgroundColor: "rgba(253, 224, 71, 0.18)",
                color: "#FDE047",
                fontSize: 17,
                fontWeight: 900,
                letterSpacing: 0.8,
              }}
            >
              {clockLabel}
            </span>
            <span
              style={{
                color: "#4ADE80",
                fontSize: 18,
                fontWeight: 800,
                letterSpacing: 0.9,
              }}
            >
              {chapterLabel}
            </span>
          </div>
        </div>
      )}

      {/* Top-Right Mochi Emotion State Pill */}
      <div
        style={{
          position: "absolute",
          top: 22,
          right: 24,
          padding: "8px 18px",
          borderRadius: 999,
          backgroundColor: "rgba(10, 18, 32, 0.86)",
          border: `1.5px solid ${badge.color}AA`,
          color: badge.color,
          fontSize: 17,
          fontWeight: 800,
          letterSpacing: 0.5,
        }}
      >
        {badge.label}
      </div>
    </div>
  );
};

// ---------------------------------------------------------------------------
// Word-Level Karaoke Bar (7-9 syllables per chunk, Honey-Yellow Active Highlight)
// ---------------------------------------------------------------------------
interface KaraokePage {
  start: number;
  end: number;
  words: MochiFullWord[];
}

function buildKaraokePages(words: MochiFullWord[]): KaraokePage[] {
  const pages: KaraokePage[] = [];
  let buf: MochiFullWord[] = [];

  for (let i = 0; i < words.length; i++) {
    const w = words[i];
    buf.push(w);
    const next = words[i + 1];
    const gap = next ? next.start - w.end : 999;
    const hasPunct = /[.?!:;]$/.test(w.word);
    const hasComma = /[,]$/.test(w.word) && buf.length >= 6;
    if (
      w.pageBreakAfter ||
      hasPunct ||
      hasComma ||
      gap > 0.35 ||
      buf.length >= 9
    ) {
      pages.push({
        start: buf[0].start,
        end: buf[buf.length - 1].end,
        words: buf,
      });
      buf = [];
    }
  }
  if (buf.length > 0) {
    pages.push({
      start: buf[0].start,
      end: buf[buf.length - 1].end,
      words: buf,
    });
  }
  return pages;
}

const FullEpisodeKaraokeBar: React.FC<{ currentSec: number }> = ({
  currentSec,
}) => {
  const pages = useMemo(() => buildKaraokePages(MOCHI_EP01_FULL_WORDS), []);

  const activePage = useMemo(() => {
    for (let i = 0; i < pages.length; i++) {
      const p = pages[i];
      const nextStart = pages[i + 1] ? pages[i + 1].start : p.end + 0.6;
      if (currentSec >= p.start - 0.08 && currentSec < Math.min(nextStart, p.end + 0.55)) {
        return p;
      }
    }
    return null;
  }, [pages, currentSec]);

  if (!activePage) return null;

  return (
    <div
      style={{
        display: "inline-flex",
        flexWrap: "wrap",
        justifyContent: "center",
        alignItems: "center",
        gap: "8px 11px",
        padding: "14px 30px",
        borderRadius: 22,
        backgroundColor: "rgba(8, 13, 24, 0.88)",
        border: "1.5px solid rgba(148, 163, 184, 0.28)",
        boxShadow: "0 14px 36px rgba(0, 0, 0, 0.62)",
        maxWidth: 1320,
      }}
    >
      {activePage.words.map((w, idx) => {
        const isActive = currentSec >= w.start - 0.04 && currentSec <= w.end + 0.08;
        const isPast = currentSec > w.end + 0.08;
        return (
          <span
            key={`${w.start}-${idx}`}
            style={{
              fontSize: 31,
              fontWeight: 800,
              lineHeight: 1.28,
              color: isActive ? "#FDE047" : isPast ? "#F8FAFC" : "#CBD5E1",
              transform: isActive ? "scale(1.07)" : "scale(1)",
              textShadow: isActive
                ? "0 0 18px rgba(253, 224, 71, 0.55)"
                : "0 2px 6px rgba(0,0,0,0.65)",
            }}
          >
            {w.word}
          </span>
        );
      })}
    </div>
  );
};

// ---------------------------------------------------------------------------
// Editorial Split Layout vs Cinema Full Layout
// ---------------------------------------------------------------------------
const ShotRenderer: React.FC<{
  shot: FullShotSpec;
  clipFolder: string;
  clipMaxPassFrames: number;
}> = ({ shot, clipFolder, clipMaxPassFrames }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const shotFrames = Math.max(1, Math.round((shot.endSec - shot.startSec) * fps));
  const clipNum = String(shot.shotNumber).padStart(3, "0");
  const clipSrc = `${clipFolder}/${clipNum}.mp4`;
  const veoVol = MOCHI_AUDIO_MIX_CONFIG["16:9"].veo3;

  const cardEnter = spring({ frame, fps, config: { damping: 17, stiffness: 120 } });

  if (shot.layout === "cinema_full") {
    return (
      <AbsoluteFill
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          paddingTop: 6,
          paddingBottom: 14,
        }}
      >
        {/* Enlarged 16:9 Widescreen Cinema Stage (1776 x 999 = exact 16:9!) */}
        <SeamlessVeo3WidescreenStage
          clipSrc={clipSrc}
          shotDurationFrames={shotFrames}
          width={1776}
          height={999}
          veoVolume={veoVol}
          badge={shot.stateBadge}
          clockLabel={shot.clockLabel}
          chapterLabel={shot.chapterLabel}
          showTopLeftOverlay
          maxPassFrames={clipMaxPassFrames}
        />
      </AbsoluteFill>
    );
  }

  const accentColor = shot.keynoteCard?.accent ?? shot.stateBadge.color;

  // EDITORIAL SPLIT LAYOUT (Left Hybrid Science Viz + Keynote Column + Right Uncropped 1088x612 16:9 Video Stage)
  return (
    <AbsoluteFill
      style={{
        display: "flex",
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "space-between",
        padding: "36px 54px 118px 58px",
      }}
    >
      {/* Left Editorial + Animated Science Visualizer Column */}
      <div
        style={{
          width: 684,
          display: "flex",
          flexDirection: "column",
          gap: 13,
          opacity: cardEnter,
          transform: `translateY(${interpolate(cardEnter, [0, 1], [24, 0])}px)`,
        }}
      >
        <div
          style={{
            display: "inline-flex",
            alignSelf: "flex-start",
            alignItems: "center",
            gap: 12,
            padding: "7px 18px",
            borderRadius: 999,
            backgroundColor: "rgba(15, 23, 42, 0.92)",
            border: "2px solid #4ADE80",
          }}
        >
          <span
            style={{
              padding: "2px 10px",
              borderRadius: 999,
              backgroundColor: "rgba(253, 224, 71, 0.2)",
              color: "#FDE047",
              fontSize: 16,
              fontWeight: 900,
            }}
          >
            {shot.clockLabel}
          </span>
          <span
            style={{
              color: "#4ADE80",
              fontSize: 16.5,
              fontWeight: 800,
              letterSpacing: 0.8,
            }}
          >
            {shot.chapterLabel}
          </span>
        </div>

        <div
          style={{
            fontSize: 36,
            fontWeight: 900,
            lineHeight: 1.17,
            color: "#FFFFFF",
          }}
        >
          {shot.title}
        </div>

        <div
          style={{
            fontSize: 21,
            fontWeight: 600,
            lineHeight: 1.38,
            color: "#CBD5E1",
          }}
        >
          {shot.subtitle}
        </div>

        {/* Opus-5.5 Hybrid Animated Science / Takeaway Visualizer */}
        <MochiEp01ScienceViz
          shotNumber={shot.shotNumber}
          shotDurationFrames={shotFrames}
          accent={accentColor}
        />

        {shot.keynoteCard && (
          <div
            style={{
              marginTop: 2,
              padding: "14px 22px",
              borderRadius: 18,
              backgroundColor: "rgba(248, 250, 252, 0.97)",
              borderLeft: `9px solid ${shot.keynoteCard.accent}`,
              boxShadow: "0 14px 36px rgba(0, 0, 0, 0.46)",
              display: "flex",
              flexDirection: "column",
              gap: 4,
            }}
          >
            <span
              style={{
                fontSize: 14,
                fontWeight: 800,
                color: "#475569",
                letterSpacing: 0.9,
              }}
            >
              {shot.keynoteCard.eyebrow}
            </span>
            <span
              style={{
                fontSize: 24,
                fontWeight: 900,
                color: "#0F172A",
                lineHeight: 1.2,
              }}
            >
              {shot.keynoteCard.headline}
            </span>
            <span
              style={{
                fontSize: 17.5,
                fontWeight: 600,
                color: "#334155",
                lineHeight: 1.34,
              }}
            >
              {shot.keynoteCard.detail}
            </span>
          </div>
        )}
      </div>

      {/* Right Uncropped 16:9 Widescreen Video Stage (1088 x 612 = exact 16:9!) */}
      <div style={{ display: "flex", alignItems: "center", justifyContent: "center" }}>
        <SeamlessVeo3WidescreenStage
          clipSrc={clipSrc}
          shotDurationFrames={shotFrames}
          width={1088}
          height={612}
          veoVolume={veoVol}
          badge={shot.stateBadge}
          clockLabel={shot.clockLabel}
          maxPassFrames={clipMaxPassFrames}
        />
      </div>
    </AbsoluteFill>
  );
};

// ---------------------------------------------------------------------------
// Master Full Episode 01 Component (1920x1080, 590.0s = 9m 50s)
// ---------------------------------------------------------------------------
export const BeMochiEp01Full16x9: React.FC<BeMochiEp01FullProps> = ({
  clipFolder = "episodes/mochi-ep01-full",
  clipMaxPassFrames = 204,
}) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const currentSec = frame / fps;
  const totalFrames = Math.round(MOCHI_EP01_FULL_DURATION_SEC * fps);
  const audioMix = MOCHI_AUDIO_MIX_CONFIG["16:9"];
  const progressPct = Math.min(100, (frame / totalFrames) * 100);

  // Seamless looped Building 20 BGM across 590s (59.19s track, stepped every 58.2s with gentle crossfade)
  const bgmStepSec = 58.2;
  const bgmTrackLenSec = 59.1;
  const bgmLoops: { idx: number; fromFrame: number; durFrames: number }[] = [];
  for (let i = 0; i * bgmStepSec < MOCHI_EP01_FULL_DURATION_SEC; i++) {
    const fromSec = i * bgmStepSec;
    const durSec = Math.min(bgmTrackLenSec, MOCHI_EP01_FULL_DURATION_SEC - fromSec);
    if (durSec > 1) {
      bgmLoops.push({
        idx: i,
        fromFrame: Math.round(fromSec * fps),
        durFrames: Math.round(durSec * fps),
      });
    }
  }

  return (
    <AbsoluteFill
      style={{
        backgroundColor: "#070B14",
        fontFamily: "'Segoe UI', 'Inter', Arial, sans-serif",
        overflow: "hidden",
      }}
    >
      {/* 0. Cozy Midnight Indigo Atmosphere + Drifting Firefly Bokeh */}
      <AbsoluteFill
        style={{
          background:
            "radial-gradient(circle at 22% 28%, rgba(30, 58, 95, 0.34) 0%, rgba(7, 11, 20, 0.98) 68%)",
          pointerEvents: "none",
        }}
      >
        {[
          { x: 8, y: 18, s: 5, sp: 0.6 },
          { x: 24, y: 76, s: 4, sp: 0.8 },
          { x: 42, y: 14, s: 6, sp: 0.5 },
          { x: 65, y: 22, s: 4, sp: 0.7 },
          { x: 88, y: 82, s: 5, sp: 0.65 },
          { x: 52, y: 86, s: 4, sp: 0.9 },
        ].map((m, idx) => {
          const dy = Math.sin(currentSec * m.sp + idx * 1.7) * 14;
          const op = 0.22 + (Math.sin(currentSec * 1.2 + idx) + 1) * 0.18;
          return (
            <div
              key={idx}
              style={{
                position: "absolute",
                left: `${m.x}%`,
                top: `${m.y}%`,
                width: m.s,
                height: m.s,
                borderRadius: "50%",
                backgroundColor: "#FDE047",
                boxShadow: "0 0 12px #FDE047",
                opacity: op,
                transform: `translateY(${dy}px)`,
              }}
            />
          );
        })}
      </AbsoluteFill>
      {/* 1. Master Haitrieu Narration (1.0 volume) */}
      <Audio
        src={staticFile(`${clipFolder}/narration.mp3`)}
        volume={audioMix.narration}
      />
      {/* 2. Locked Building 20 Background Music (0.05 volume, 2s fade-in, crossfaded loops, 3.5s fade-out) */}
      {bgmLoops.map((loop, idx) => {
        const isFirst = idx === 0;
        const isLast = idx === bgmLoops.length - 1;
        return (
          <Sequence
            key={loop.idx}
            from={loop.fromFrame}
            durationInFrames={loop.durFrames}
          >
            <Audio
              src={staticFile("episodes/mochi-ep01/audio/building_20.wav")}
              volume={(f) => {
                const fadeInLen = isFirst ? 2 * fps : Math.round(0.9 * fps);
                const fadeOutLen = isLast ? Math.round(3.5 * fps) : Math.round(0.9 * fps);
                const inMul = interpolate(f, [0, fadeInLen], [0, 1], {
                  extrapolateLeft: "clamp",
                  extrapolateRight: "clamp",
                });
                const outMul = interpolate(
                  f,
                  [Math.max(0, loop.durFrames - fadeOutLen), loop.durFrames],
                  [1, 0],
                  { extrapolateLeft: "clamp", extrapolateRight: "clamp" }
                );
                return audioMix.building20 * inMul * outMul;
              }}
            />
          </Sequence>
        );
      })}
      {/* 3. 30 Veo 3 Shots Along the 24-Hour Clock */}
      {MOCHI_EP01_FULL_SHOTS.map((shot) => {
        const fromFrame = Math.round(shot.startSec * fps);
        const durFrames = Math.max(
          1,
          Math.round((shot.endSec - shot.startSec) * fps)
        );
        return (
          <Sequence
            key={shot.shotNumber}
            from={fromFrame}
            durationInFrames={durFrames}
            style={{
              translate: "0px -7.4px"
            }}>
            <ShotRenderer
              shot={shot}
              clipFolder={clipFolder}
              clipMaxPassFrames={clipMaxPassFrames}
            />
          </Sequence>
        );
      })}
      {/* 4. Live Word-by-Word Karaoke Subtitle Bar */}
      {currentSec <= 586.7 && (
        <div
          style={{
            position: "absolute",
            bottom: 36,
            left: 60,
            right: 60,
            display: "flex",
            justifyContent: "center",
            pointerEvents: "none",
          }}
        >
          <FullEpisodeKaraokeBar currentSec={currentSec} />
        </div>
      )}
      {/* 5. Gentle End-Screen Closing Quote (586.6s -> 590.0s) */}
      {currentSec > 586.6 && (
        <div
          style={{
            position: "absolute",
            bottom: 44,
            left: 0,
            right: 0,
            display: "flex",
            justifyContent: "center",
          }}
        >
          <div
            style={{
              padding: "18px 38px",
              borderRadius: 999,
              backgroundColor: "rgba(10, 18, 32, 0.9)",
              border: "2px solid rgba(253, 224, 71, 0.75)",
              color: "#FDE047",
              fontSize: 28,
              fontWeight: 800,
              boxShadow: "0 14px 40px rgba(0,0,0,0.65)",
            }}
          >
            🌱 Chúc chiếc mầm xanh của bạn ngủ thật ngon đêm nay · 00:00 AM
          </div>
        </div>
      )}
      {/* 6. Subtle Top-Center / Bottom Progress Bar */}
      <div
        style={{
          position: "absolute",
          bottom: 0,
          left: 0,
          height: 6,
          width: `${progressPct}%`,
          background: "linear-gradient(90deg, #4ADE80, #FDE047)",
        }}
      />
    </AbsoluteFill>
  );
};

