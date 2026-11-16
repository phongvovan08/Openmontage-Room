import React from "react";
import {
  AbsoluteFill,
  Audio,
  interpolate,
  spring,
  staticFile,
  useCurrentFrame,
  useVideoConfig,
} from "remotion";
import { WordCaption } from "./components/CaptionOverlay";

export interface TiktokVerticalBespokeProps {
  durationSeconds?: number;
  narrationSrc?: string;
  musicSrc?: string;
  captions?: WordCaption[];
}

const resolveAsset = (src: string): string => {
  if (!src) return "";
  if (
    src.startsWith("http://") ||
    src.startsWith("https://") ||
    src.startsWith("file://") ||
    src.startsWith("/")
  ) {
    return src;
  }
  return staticFile(src);
};

interface VerticalBeat {
  index: number;
  inSec: number;
  outSec: number;
  tag: string;
  title: string;
  subtitle: string;
  badHabit: string;
  goodHabit: string;
  accent: string;
}

const BEATS: VerticalBeat[] = [
  {
    index: 1,
    inSec: 0.0,
    outSec: 4.1,
    tag: "01 · CHẾ ĐỘ SINH TỒN",
    title: "KHI BẢN NĂNG CẦM LÁI",
    subtitle: "Hạch hạnh nhân chiếm quyền chỉ sau 0.02 giây",
    badHabit: "Hành xử hoàn toàn theo cảm xúc tức thời",
    goodHabit: "Nhận biết não đang bật báo động giả",
    accent: "#EF4444",
  },
  {
    index: 2,
    inSec: 4.1,
    outSec: 10.1,
    tag: "02 · BA PHẢN XẠ TỰ ĐỘNG",
    title: "TẤN CÔNG · NÉ TRÁNH · TRÚT GIẬN",
    subtitle: "Ba cơ chế tự vệ mù quáng khi thiếu tỉnh thức",
    badHabit: "Giận → Công kích | Sợ → Trốn | Đau → Xả giận",
    goodHabit: "Nhìn rõ 3 phản xạ trước khi buông lời",
    accent: "#F97316",
  },
  {
    index: 3,
    inSec: 10.1,
    outSec: 13.5,
    tag: "03 · NHỊP DỪNG BỊ BỎ QUÊN",
    title: "“TẠI SAO MÌNH CẢM THẤY VẬY?”",
    subtitle: "Câu hỏi tự vấn hiếm khi được đặt ra đúng lúc",
    badHabit: "Phản ứng ngay lập tức không kịp suy xét",
    goodHabit: "Dừng 1 nhịp để hỏi thăm gốc rễ bên trong",
    accent: "#38BDF8",
  },
  {
    index: 4,
    inSec: 13.5,
    outSec: 18.0,
    tag: "04 · LAN TRUYỀN TỔN THƯƠNG",
    title: "VẾT THƯƠNG TRÀN SANG NGƯỜI THÂN",
    subtitle: "Nỗi đau chưa lành biến thành mũi tên bắn ra ngoài",
    badHabit: "Bắt người xung quanh gánh chịu cơn nóng giận",
    goodHabit: "Chuyển hóa nỗi đau thay vì lây lan nó",
    accent: "#A855F7",
  },
  {
    index: 5,
    inSec: 18.0,
    outSec: 24.7,
    tag: "05 · KHIÊN PHÒNG VỆ CÁI TÔI",
    title: "KHI CÁI TÔI BỊ CHẠM TỚI",
    subtitle: "Cơ chế tự vệ bật lên để chứng minh “Tôi đúng”",
    badHabit: "Xù lông, ngắt lời, phản bác mọi góp ý",
    goodHabit: "Hạ khiên tự ái để lắng nghe trọn vẹn",
    accent: "#F59E0B",
  },
  {
    index: 6,
    inSec: 24.7,
    outSec: 32.1,
    tag: "06 · BÀN CÂN TRƯỞNG THÀNH",
    title: "DỄ CHỊU NHẤT THỜI HAY SỰ THẬT?",
    subtitle: "Bảo vệ quan điểm cũ chỉ giữ ta dậm chân tại chỗ",
    badHabit: "Chọn cảm giác an toàn giả tạo cho cái tôi",
    goodHabit: "Đủ dũng khí đón nhận sự thật để lớn lên",
    accent: "#10B981",
  },
  {
    index: 7,
    inSec: 32.1,
    outSec: 39.5,
    tag: "07 · RÀO CẢN TRÒ CHUYỆN SÂU",
    title: "VÌ SAO KHÓ ĐỐI THOẠI SÂU SẮC?",
    subtitle: "Khi góc nhìn khác biệt bị coi là công kích cá nhân",
    badHabit: "Biến cuộc trò chuyện thành cuộc chiến thắng thua",
    goodHabit: "Tôn trọng góc nhìn khác mà không tự ái",
    accent: "#EC4899",
  },
  {
    index: 8,
    inSec: 39.5,
    outSec: 45.7,
    tag: "08 · TẤM GƯƠNG ẢO TƯỞNG",
    title: "HÌNH ẢNH HOÀN HẢO BỊ LUNG LAY",
    subtitle: "Cơn giận bùng lên để che đậy sự mong manh bên trong",
    badHabit: "Gồng mình bảo vệ chiếc mặt nạ hoàn hảo",
    goodHabit: "Chấp nhận khiếm khuyết để hoàn thiện thật sự",
    accent: "#8B5CF6",
  },
  {
    index: 9,
    inSec: 45.7,
    outSec: 54.0,
    tag: "09 · NGƯỜI CẦM LÁI TỈNH THỨC",
    title: "ĐỪNG ĐỂ CẢM XÚC LÁI HÀNH ĐỘNG",
    subtitle: "Trưởng thành không phải là vô cảm hay đè nén",
    badHabit: "Để cơn giận cướp tay lái trong lúc nóng nảy",
    goodHabit: "Cảm nhận cơn sóng nhưng giữ vững vô-lăng",
    accent: "#06B6D4",
  },
  {
    index: 10,
    inSec: 54.0,
    outSec: 69.0,
    tag: "10 · BA NHỊP THỨC TỈNH",
    title: "NHẬN DIỆN · DỪNG LẠI · LỰA CHỌN",
    subtitle: "Đừng biến cảm xúc 3 giây thành hối hận cả đời",
    badHabit: "Quyết định bốc đồng khi máu nóng dồn lên",
    goodHabit: "1. Nhận diện → 2. Dừng lại → 3. Chủ động chọn",
    accent: "#34D399",
  },
];

// TikTok Safe-Zone Word-by-Word Karaoke Box
const TiktokSafeZoneCaptions: React.FC<{
  words: WordCaption[];
  accentColor: string;
}> = ({ words, accentColor }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const currentMs = (frame / fps) * 1000;

  if (!words || words.length === 0) return null;

  // Group into 5-word pages
  const pages: WordCaption[][] = [];
  let cur: WordCaption[] = [];
  for (const w of words) {
    cur.push(w);
    if (cur.length >= 5 || w.pageBreakAfter) {
      pages.push(cur);
      cur = [];
    }
  }
  if (cur.length > 0) pages.push(cur);

  const activePage = pages.find(
    (p) => currentMs >= p[0].startMs - 120 && currentMs <= p[p.length - 1].endMs + 220
  );
  if (!activePage) return null;

  return (
    <div
      style={{
        position: "absolute",
        left: 54,
        right: 120,
        bottom: 290,
        display: "flex",
        justifyContent: "center",
        zIndex: 40,
      }}
    >
      <div
        style={{
          backgroundColor: "rgba(6, 9, 19, 0.90)",
          border: `2px solid ${accentColor}88`,
          borderRadius: 24,
          padding: "20px 30px",
          boxShadow: `0 18px 45px rgba(0,0,0,0.75), 0 0 30px ${accentColor}33`,
          display: "flex",
          flexWrap: "wrap",
          justifyContent: "center",
          gap: "8px 12px",
        }}
      >
        {activePage.map((w, i) => {
          const isCurrent = currentMs >= w.startMs && currentMs <= w.endMs + 80;
          const isPast = currentMs > w.endMs + 80;
          return (
            <span
              key={i}
              style={{
                fontSize: 44,
                fontWeight: 900,
                color: isCurrent
                  ? "#FACC15"
                  : isPast
                  ? "#FFFFFF"
                  : "rgba(226, 232, 240, 0.65)",
                transform: isCurrent ? "scale(1.1)" : "scale(1)",
                textShadow: isCurrent ? "0 0 18px rgba(250, 204, 21, 0.7)" : "none",
                display: "inline-block",
              }}
            >
              {w.word}
            </span>
          );
        })}
      </div>
    </div>
  );
};

export const TiktokVerticalBespoke: React.FC<TiktokVerticalBespokeProps> = ({
  narrationSrc = "episodes/reactive-mind/narration.mp3",
  musicSrc = "episodes/reactive-mind/tiktok_newpulse_bgm.wav",
  captions = [],
}) => {
  const frame = useCurrentFrame();
  const { fps, durationInFrames } = useVideoConfig();
  const sec = frame / fps;

  const beat =
    BEATS.find((b) => sec >= b.inSec && sec < b.outSec) || BEATS[BEATS.length - 1];
  const localFrame = Math.max(0, frame - Math.round(beat.inSec * fps));
  const enter = spring({
    frame: localFrame,
    fps,
    config: { damping: 14, stiffness: 105 },
  });

  // Beat pulse synced to ~128 BPM TikTok remix rhythm
  const bpmPulse = Math.sin((frame / fps) * Math.PI * 2 * (128 / 60)) * 0.5 + 0.5;

  // Render distinct interactive SVG visual per beat index (1..10)
  const renderVerticalMechanism = () => {
    switch (beat.index) {
      case 1:
        return (
          <svg width="820" height="520" viewBox="0 0 820 520">
            <circle
              cx="410"
              cy="260"
              r={155 + bpmPulse * 24}
              fill="rgba(239, 68, 68, 0.16)"
            />
            <circle
              cx="410"
              cy="260"
              r="125"
              fill="#2A0A12"
              stroke="#EF4444"
              strokeWidth="5"
            />
            {Array.from({ length: 12 }).map((_, i) => {
              const a = (i * Math.PI * 2) / 12 + frame * 0.03;
              return (
                <line
                  key={i}
                  x1={410 + Math.cos(a) * 135}
                  y1={260 + Math.sin(a) * 135}
                  x2={410 + Math.cos(a) * (175 + bpmPulse * 25)}
                  y2={260 + Math.sin(a) * (175 + bpmPulse * 25)}
                  stroke="#F87171"
                  strokeWidth="4"
                  strokeLinecap="round"
                />
              );
            })}
            <text
              x="410"
              y="242"
              textAnchor="middle"
              fill="#FCA5A5"
              fontSize="20"
              fontWeight="800"
            >
              AMYGDALA HIJACK
            </text>
            <text
              x="410"
              y="282"
              textAnchor="middle"
              fill="#FFFFFF"
              fontSize="32"
              fontWeight="900"
            >
              0.02 GIÂY BẢN NĂNG
            </text>
          </svg>
        );

      case 2:
        return (
          <svg width="820" height="520" viewBox="0 0 820 520">
            {[
              { y: 110, label: "1. TỨC GIẬN → TẤN CÔNG", c: "#EF4444" },
              { y: 260, label: "2. SỢ HÃI → NÉ TRÁNH", c: "#38BDF8" },
              { y: 410, label: "3. TỔN THƯƠNG → TRÚT GIẬN", c: "#A855F7" },
            ].map((row, i) => (
              <g key={i} transform={`translate(90, ${row.y - 52})`}>
                <rect
                  width="640"
                  height="104"
                  rx="22"
                  fill="#0F172A"
                  stroke={row.c}
                  strokeWidth="4"
                />
                <circle cx="62" cy="52" r={22 + bpmPulse * 5} fill={row.c} />
                <text
                  x="115"
                  y="62"
                  fill="#FFFFFF"
                  fontSize="28"
                  fontWeight="900"
                >
                  {row.label}
                </text>
              </g>
            ))}
          </svg>
        );

      case 5:
        return (
          <svg width="820" height="520" viewBox="0 0 820 520">
            <g transform="translate(410, 260)">
              <polygon
                points="0,-190 165,-95 165,95 0,190 -165,95 -165,-95"
                fill="rgba(69, 26, 3, 0.85)"
                stroke="#F59E0B"
                strokeWidth="5"
                transform={`rotate(${frame * 0.6})`}
              />
              <circle r="95" fill="#0F172A" stroke="#FACC15" strokeWidth="4" />
              <text
                y="-8"
                textAnchor="middle"
                fill="#FDE047"
                fontSize="18"
                fontWeight="800"
              >
                KHIÊN TỰ VỆ
              </text>
              <text
                y="26"
                textAnchor="middle"
                fill="#FFFFFF"
                fontSize="30"
                fontWeight="900"
              >
                CÁI TÔI (EGO)
              </text>
            </g>
          </svg>
        );

      case 10:
        return (
          <svg width="820" height="520" viewBox="0 0 820 520">
            {[
              { y: 105, step: "BƯỚC 01", name: "NHẬN DIỆN CẢM XÚC", c: "#38BDF8" },
              { y: 260, step: "BƯỚC 02", name: "DỪNG LẠI MỘT NHỊP", c: "#FACC15" },
              { y: 415, step: "BƯỚC 03", name: "CHỦ ĐỘNG LỰA CHỌN", c: "#34D399" },
            ].map((s, i) => (
              <g key={i} transform={`translate(70, ${s.y - 54})`}>
                <rect
                  width="680"
                  height="108"
                  rx="24"
                  fill="rgba(6, 78, 59, 0.55)"
                  stroke={s.c}
                  strokeWidth="4"
                />
                <text
                  x="42"
                  y="62"
                  fill={s.c}
                  fontSize="22"
                  fontWeight="900"
                >
                  {s.step}
                </text>
                <text
                  x="185"
                  y="64"
                  fill="#FFFFFF"
                  fontSize="30"
                  fontWeight="900"
                >
                  {s.name}
                </text>
              </g>
            ))}
          </svg>
        );

      default:
        return (
          <svg width="820" height="520" viewBox="0 0 820 520">
            <g transform="translate(410, 260)">
              {[190, 145, 100].map((r, idx) => (
                <circle
                  key={idx}
                  r={r + bpmPulse * 10}
                  fill="none"
                  stroke={beat.accent}
                  strokeWidth={4 - idx}
                  strokeDasharray={idx % 2 === 0 ? "18 12" : "none"}
                  opacity={0.35 + idx * 0.22}
                  transform={`rotate(${frame * (idx % 2 === 0 ? 1 : -1)})`}
                />
              ))}
              <circle r="82" fill="#0F172A" stroke={beat.accent} strokeWidth="4.5" />
              <text
                y="-6"
                textAnchor="middle"
                fill={beat.accent}
                fontSize="18"
                fontWeight="800"
              >
                TÂM THỨC
              </text>
              <text
                y="26"
                textAnchor="middle"
                fill="#FFFFFF"
                fontSize="28"
                fontWeight="900"
              >
                PHÂN CẢNH #{beat.index}
              </text>
            </g>
          </svg>
        );
    }
  };

  return (
    <AbsoluteFill
      style={{
        backgroundColor: "#050812",
        fontFamily: "'Inter', 'Segoe UI', system-ui, sans-serif",
        overflow: "hidden",
      }}
    >
      <style>
        {`svg text { font-family: 'Inter', 'Segoe UI', system-ui, sans-serif; }`}
      </style>

      {/* Beat-Synced Radial Glow */}
      <div
        style={{
          position: "absolute",
          inset: 0,
          background: `radial-gradient(circle at 50% 38%, ${beat.accent}${
            Math.round(22 + bpmPulse * 16).toString(16)
          } 0%, rgba(8, 12, 24, 0.94) 62%, #04060E 100%)`,
        }}
      />

      {/* Top TikTok Header Pill (y = 88px, safe below status bar) */}
      <div
        style={{
          position: "absolute",
          top: 88,
          left: 54,
          right: 110,
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
        }}
      >
        <div
          style={{
            padding: "10px 22px",
            borderRadius: 999,
            backgroundColor: "rgba(15, 23, 42, 0.9)",
            border: `2px solid ${beat.accent}`,
            color: "#FFFFFF",
            fontSize: 20,
            fontWeight: 800,
            letterSpacing: 1.5,
            boxShadow: `0 0 24px ${beat.accent}55`,
          }}
        >
          {beat.tag}
        </div>
        <div
          style={{
            padding: "8px 16px",
            borderRadius: 12,
            backgroundColor: "rgba(15, 23, 42, 0.85)",
            color: "#FACC15",
            fontFamily: "'JetBrains Mono', monospace",
            fontSize: 18,
            fontWeight: 800,
          }}
        >
          {beat.index}/10
        </div>
      </div>

      {/* Main Vertical Story Stage (Left-aligned away from TikTok right sidebar icons) */}
      <div
        style={{
          position: "absolute",
          top: 175,
          left: 54,
          right: 116,
          height: 1150,
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
          transform: `translateY(${(1 - enter) * 35}px)`,
          opacity: enter,
        }}
      >
        {/* Title & Subtitle Block */}
        <div>
          <div
            style={{
              color: "#FFFFFF",
              fontSize: 52,
              fontWeight: 900,
              lineHeight: 1.15,
              letterSpacing: -0.5,
              textShadow: "0 6px 24px rgba(0,0,0,0.8)",
            }}
          >
            {beat.title}
          </div>
          <div
            style={{
              color: "#CBD5E1",
              fontSize: 27,
              fontWeight: 600,
              marginTop: 12,
              lineHeight: 1.35,
            }}
          >
            {beat.subtitle}
          </div>
        </div>

        {/* Center Bespoke Animated SVG Stage */}
        <div
          style={{
            height: 520,
            backgroundColor: "rgba(15, 23, 42, 0.72)",
            borderRadius: 32,
            border: `2px solid ${beat.accent}66`,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            boxShadow: "0 24px 60px rgba(0,0,0,0.65)",
          }}
        >
          {renderVerticalMechanism()}
        </div>

        {/* Contrast Cards: Phản Xạ Bản Năng vs Tỉnh Thức */}
        <div style={{ display: "flex", flexDirection: "column", gap: 18 }}>
          <div
            style={{
              backgroundColor: "rgba(127, 29, 29, 0.35)",
              borderLeft: "6px solid #EF4444",
              borderRadius: 20,
              padding: "18px 24px",
            }}
          >
            <div style={{ color: "#FCA5A5", fontSize: 16, fontWeight: 800, letterSpacing: 1.5 }}>
              ✗ KHI SỐNG THEO BẢN NĂNG:
            </div>
            <div style={{ color: "#FFFFFF", fontSize: 26, fontWeight: 700, marginTop: 4 }}>
              {beat.badHabit}
            </div>
          </div>

          <div
            style={{
              backgroundColor: "rgba(6, 78, 59, 0.42)",
              borderLeft: "6px solid #10B981",
              borderRadius: 20,
              padding: "18px 24px",
            }}
          >
            <div style={{ color: "#6EE7B7", fontSize: 16, fontWeight: 800, letterSpacing: 1.5 }}>
              ★ KHI TRƯỞNG THÀNH TỈNH THỨC:
            </div>
            <div style={{ color: "#FFFFFF", fontSize: 26, fontWeight: 700, marginTop: 4 }}>
              {beat.goodHabit}
            </div>
          </div>
        </div>
      </div>

      {/* TikTok Safe-Zone Karaoke Captions */}
      <TiktokSafeZoneCaptions words={captions} accentColor={beat.accent} />

      {/* Audio Layers (Narration + Subtle SFX + TikTok Remix BGM) */}
      {narrationSrc && <Audio src={resolveAsset(narrationSrc)} volume={1.08} />}
      <Audio
        src={resolveAsset("episodes/reactive-mind/sfx_stem_master.wav")}
        volume={0.20}
      />
      {musicSrc && (
        <Audio
          src={resolveAsset(musicSrc)}
          loop
          volume={(f) => {
            const fadeIn = interpolate(f, [0, 30], [0, 0.25], {
              extrapolateLeft: "clamp",
              extrapolateRight: "clamp",
            });
            const fadeOut = interpolate(
              f,
              [durationInFrames - 75, durationInFrames],
              [0.25, 0],
              { extrapolateLeft: "clamp", extrapolateRight: "clamp" }
            );
            return Math.min(fadeIn, fadeOut);
          }}
        />
      )}
    </AbsoluteFill>
  );
};

