import React from "react";
import {
  AbsoluteFill,
  Audio,
  Sequence,
  interpolate,
  spring,
  staticFile,
  useCurrentFrame,
  useVideoConfig,
} from "remotion";
import { HAITRIEU_WORDS } from "./haitrieuCaptions";
import { MochiScenesLayer } from "./MochiVertical9x16";

export interface CarterSelfDevProps {
  durationSeconds?: number;
}

// ============================================================================
// 1. iOS NOTIFICATION DATA (THÔNG BÁO 01 .. 09 — Exact @carter.selfdev style)
// ============================================================================
interface IOSNotificationSpec {
  num: number;
  code: string;
  inSec: number;
  outSec: number;
  title: string;
  subtitle: string;
  align?: "left" | "right" | "center";
}

const IOS_NOTIFICATIONS: IOSNotificationSpec[] = [
  {
    num: 1,
    code: "THÔNG BÁO 01",
    inSec: 0.2,
    outSec: 5.1,
    title: "Đang kẹt ở chế độ sinh tồn...",
    subtitle: "hành xử hoàn toàn theo cảm xúc bản năng",
  },
  {
    num: 2,
    code: "THÔNG BÁO 02",
    inSec: 5.1,
    outSec: 12.8,
    title: "Giận dữ • Sợ hãi • Đổ lỗi",
    subtitle: "3 phản xạ tự động khi thiếu khoảng lặng",
  },
  {
    num: 3,
    code: "THÔNG BÁO 03",
    inSec: 12.8,
    outSec: 23.0,
    title: "Phản ứng ngay tức khắc",
    subtitle: "vô tình trút tổn thương lên người xung quanh",
  },
  {
    num: 4,
    code: "THÔNG BÁO 04",
    inSec: 23.0,
    outSec: 32.0,
    title: "“Chỉ góp ý một chút thôi”",
    subtitle: "nhưng cơ chế phòng thủ đã bật lên ngay lập tức",
  },
  {
    num: 5,
    code: "THÔNG BÁO 05",
    inSec: 32.0,
    outSec: 42.1,
    title: "Bảo vệ cái tôi tới cùng",
    subtitle: "chọn cảm giác dễ chịu nhất thời hơn là thay đổi",
  },
  {
    num: 6,
    code: "THÔNG BÁO 06",
    inSec: 42.1,
    outSec: 51.0,
    title: "Khó trò chuyện sâu sắc",
    subtitle: "một góc nhìn khác biệt cũng bị xem là xúc phạm",
  },
  {
    num: 7,
    code: "THÔNG BÁO 07",
    inSec: 51.0,
    outSec: 59.2,
    title: "Sự thật đe dọa ảo ảnh",
    subtitle: "hình ảnh hoàn hảo mà họ luôn tin về chính mình",
  },
  {
    num: 8,
    code: "THÔNG BÁO 08",
    inSec: 59.2,
    outSec: 70.1,
    title: "Trưởng thành là cầm lái",
    subtitle: "biết rõ mình đang giận • gọi tên được nỗi sợ",
  },
  {
    num: 9,
    code: "THÔNG BÁO 09",
    inSec: 70.1,
    outSec: 82.2,
    title: "Bắt đầu từ 3 giây dừng lại",
    subtitle: "dừng lại • quan sát • chủ động chọn cách đáp trả",
  },
];

// ============================================================================
// 2. BILINGUAL ENGLISH SUBTITLE SEGMENTS (Synced to 90s Haitrieu script)
// ============================================================================
interface EnglishSubSegment {
  inSec: number;
  outSec: number;
  en: string;
}

const ENGLISH_SUBTITLES: EnglishSubSegment[] = [
  {
    inSec: 0.0,
    outSec: 5.1,
    en: "People stuck in survival mode often act purely on instinctive emotion.",
  },
  {
    inSec: 5.1,
    outSec: 7.6,
    en: "When angry, they immediately attack.",
  },
  {
    inSec: 7.6,
    outSec: 10.2,
    en: "When afraid, they look for ways to hide and avoid.",
  },
  {
    inSec: 10.2,
    outSec: 12.8,
    en: "When sad, they quickly turn to blaming others.",
  },
  {
    inSec: 12.8,
    outSec: 17.5,
    en: "They rarely pause for a beat to ask: why do I feel this way?",
  },
  {
    inSec: 17.5,
    outSec: 23.0,
    en: "Instead, they react instantly and spill inner wounds onto people around them.",
  },
  {
    inSec: 23.0,
    outSec: 29.4,
    en: "Especially when their ego is touched or someone points out a flaw,",
  },
  {
    inSec: 29.4,
    outSec: 32.0,
    en: "their defense mechanism triggers immediately.",
  },
  {
    inSec: 32.0,
    outSec: 35.8,
    en: "They would rather defend their opinion to the end than face the truth.",
  },
  {
    inSec: 35.8,
    outSec: 42.1,
    en: "They crave validation over understanding, and temporary comfort over growth.",
  },
  {
    inSec: 42.1,
    outSec: 46.6,
    en: "That is why it is so hard to have a deep conversation with them.",
  },
  {
    inSec: 46.6,
    outSec: 51.0,
    en: "Just offer a different perspective and they already feel insulted.",
  },
  {
    inSec: 51.0,
    outSec: 59.2,
    en: "Because that truth threatens the perfect image they have always believed about themselves.",
  },
  {
    inSec: 59.2,
    outSec: 64.6,
    en: "Maturity doesn't mean having no emotions—it means not letting emotions drive you.",
  },
  {
    inSec: 64.6,
    outSec: 70.1,
    en: "When angry, know you are angry. When afraid, name the fear clearly.",
  },
  {
    inSec: 70.1,
    outSec: 76.8,
    en: "Instead of unconscious reflexes, learn to pause, observe, and choose your response.",
  },
  {
    inSec: 76.8,
    outSec: 82.3,
    en: "Don't rush to judge anyone—each person is at a different stage of growth.",
  },
  {
    inSec: 82.3,
    outSec: 90.0,
    en: "What matters most is staying mindful so a fleeting emotion never becomes a lifelong regret.",
  },
];

// ============================================================================
// 3. iOS FROSTED NOTIFICATION BANNER COMPONENT (zs_frame_0, zs_frame_1, zs_frame_4)
// ============================================================================
export const CarterIOSNotificationBanner: React.FC<{
  spec: IOSNotificationSpec;
}> = ({ spec }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const slideIn = spring({
    frame,
    fps,
    config: { damping: 16, stiffness: 140, mass: 0.8 },
  });

  const translateY = interpolate(slideIn, [0, 1], [-120, 0]);
  const opacity = interpolate(slideIn, [0, 1], [0, 1]);

  return (
    <div
      style={{
        position: "absolute",
        top: 135,
        left: 64,
        right: 64,
        transform: `translateY(${translateY}px)`,
        opacity,
        backgroundColor: "rgba(235, 238, 244, 0.95)",
        borderRadius: 28,
        padding: "24px 30px",
        boxShadow:
          "0 20px 45px rgba(0, 0, 0, 0.38), inset 0 1px 0 rgba(255, 255, 255, 0.85)",
        display: "flex",
        alignItems: "center",
        gap: 24,
        zIndex: 40,
        fontFamily: "'Inter', 'Segoe UI', system-ui, sans-serif",
      }}
    >
      {/* Red App Icon + Number Badge on Top-Right Corner */}
      <div style={{ position: "relative", width: 68, height: 68, flexShrink: 0 }}>
        <div
          style={{
            width: 68,
            height: 68,
            borderRadius: 18,
            background: "linear-gradient(145deg, #DC2626 0%, #991B1B 100%)",
            boxShadow: "0 6px 14px rgba(185, 28, 28, 0.35)",
          }}
        />
        <div
          style={{
            position: "absolute",
            top: -6,
            right: -6,
            width: 28,
            height: 28,
            borderRadius: 999,
            backgroundColor: "#EF4444",
            border: "3px solid #F1F5F9",
            color: "#FFFFFF",
            fontSize: 15,
            fontWeight: 900,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          {spec.num}
        </div>
      </div>

      {/* Text Content */}
      <div style={{ flex: 1, minWidth: 0 }}>
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            marginBottom: 4,
          }}
        >
          <span
            style={{
              fontSize: 19,
              fontWeight: 700,
              letterSpacing: "2.2px",
              color: "#64748B",
            }}
          >
            {spec.code}
          </span>
          <span
            style={{
              fontSize: 19,
              fontWeight: 600,
              color: "#64748B",
            }}
          >
            bây giờ
          </span>
        </div>

        <div
          style={{
            fontSize: 34,
            fontWeight: 900,
            color: "#0F172A",
            lineHeight: 1.2,
            marginBottom: 4,
          }}
        >
          {spec.title}
        </div>

        <div
          style={{
            fontSize: 24,
            fontWeight: 500,
            color: "#475569",
            lineHeight: 1.25,
          }}
        >
          {spec.subtitle}
        </div>
      </div>
    </div>
  );
};

// ============================================================================
// 4. BILINGUAL YELLOW-GLOW KARAOKE SUBTITLES (zs_frame_0 .. zs_frame_4)
// ============================================================================
export const CarterBilingualYellowSubtitles: React.FC<{
  hideVietnameseInFinale?: boolean;
}> = ({ hideVietnameseInFinale = true }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const nowSec = frame / fps;

  // Group Vietnamese words into chunks of 6 words
  const chunkSize = 6;
  let activeChunkIdx = -1;

  for (let i = 0; i < HAITRIEU_WORDS.length; i++) {
    const w = HAITRIEU_WORDS[i];
    const nextStart =
      i + 1 < HAITRIEU_WORDS.length ? HAITRIEU_WORDS[i + 1].start : w.end + 0.35;
    if (nowSec >= w.start - 0.06 && nowSec <= Math.max(w.end + 0.15, nextStart)) {
      activeChunkIdx = Math.floor(i / chunkSize);
      break;
    }
  }

  const enSeg = ENGLISH_SUBTITLES.find(
    (s) => nowSec >= s.inSec && nowSec <= s.outSec
  );

  const isFinaleQuote = hideVietnameseInFinale && nowSec >= 82.3;

  return (
    <div
      style={{
        position: "absolute",
        left: 56,
        right: 56,
        bottom: 250,
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        gap: 14,
        zIndex: 45,
        pointerEvents: "none",
        fontFamily: "'Inter', 'Segoe UI', system-ui, sans-serif",
      }}
    >
      {/* Upper Line: Vietnamese Uppercase with Progressive Golden-Yellow Glow */}
      {!isFinaleQuote && activeChunkIdx >= 0 && (
        <div
          style={{
            display: "flex",
            flexWrap: "wrap",
            justifyContent: "center",
            gap: "8px 14px",
            textAlign: "center",
          }}
        >
          {HAITRIEU_WORDS.slice(
            activeChunkIdx * chunkSize,
            (activeChunkIdx + 1) * chunkSize
          ).map((item, idx) => {
            const isLit = nowSec >= item.start - 0.04;
            return (
              <span
                key={idx}
                style={{
                  fontSize: 44,
                  fontWeight: 900,
                  textTransform: "uppercase",
                  color: isLit ? "#FDE047" : "#FFFFFF",
                  textShadow: isLit
                    ? "0 0 24px rgba(250, 204, 21, 0.95), 0 0 42px rgba(234, 179, 8, 0.65), 0 4px 10px rgba(0, 0, 0, 0.9)"
                    : "0 4px 12px rgba(0, 0, 0, 0.9)",
                  letterSpacing: "1px",
                  lineHeight: 1.2,
                }}
              >
                {item.word}
              </span>
            );
          })}
        </div>
      )}

      {/* Lower Line: Clean White English Subtitle */}
      {enSeg && (
        <div
          style={{
            fontSize: 28,
            fontWeight: 600,
            color: "#F8FAFC",
            textAlign: "center",
            textShadow: "0 3px 10px rgba(0, 0, 0, 0.95)",
            maxWidth: 920,
            lineHeight: 1.35,
          }}
        >
          {enSeg.en}
        </div>
      )}
    </div>
  );
};

// ============================================================================
// 5. FINALE PROGRESSIVE DARK PILL QUOTE BOX (zs_frame_5: 82.3s - 90.0s)
// ============================================================================
export const CarterFinaleProgressiveQuoteBox: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const nowSec = frame / fps;

  // Words from 82.5s to 89.0s ("Điều quan trọng nhất là đủ tỉnh thức...")
  const finaleWords = HAITRIEU_WORDS.filter((w) => w.start >= 82.3);

  return (
    <div
      style={{
        position: "absolute",
        top: 165,
        left: 56,
        right: 56,
        backgroundColor: "rgba(8, 10, 15, 0.94)",
        borderRadius: 28,
        padding: "38px 44px",
        boxShadow:
          "0 26px 60px rgba(0, 0, 0, 0.65), 0 0 0 1.5px rgba(255, 255, 255, 0.08)",
        display: "flex",
        flexWrap: "wrap",
        justifyContent: "center",
        gap: "10px 12px",
        zIndex: 50,
        fontFamily: "'Inter', 'Segoe UI', system-ui, sans-serif",
      }}
    >
      {finaleWords.map((w, idx) => {
        const isLit = nowSec >= w.start - 0.04;
        const isLastThree = idx >= finaleWords.length - 3; // "cả cuộc đời."
        return (
          <span
            key={idx}
            style={{
              fontSize: 38,
              fontWeight: 800,
              color: isLit
                ? isLastThree
                  ? "#EF4444"
                  : "#FFFFFF"
                : isLastThree
                ? "rgba(239, 68, 68, 0.24)"
                : "rgba(255, 255, 255, 0.18)",
              textShadow:
                isLit && isLastThree
                  ? "0 0 18px rgba(239, 68, 68, 0.55)"
                  : isLit
                  ? "0 0 14px rgba(255, 255, 255, 0.25)"
                  : "none",
              lineHeight: 1.35,
            }}
          >
            {w.word}
          </span>
        );
      })}
    </div>
  );
};

// ============================================================================
// 6. APPLE KEYNOTE CLEAN WHITE CARD SLIDE (zs_frame_2 style)
// ============================================================================
export const CarterAppleKeynoteWhiteSlide: React.FC<{
  mode: "ego_cost" | "three_steps";
}> = ({ mode }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const pop = spring({
    frame,
    fps,
    config: { damping: 16, stiffness: 120 },
  });

  const cards =
    mode === "ego_cost"
      ? [
          {
            icon: "🛡️",
            label: "Bảo vệ quan điểm",
            sub: "Thà cãi thắng hơn nhìn thẳng sự thật",
          },
          {
            icon: "🏆",
            label: "Cần được công nhận",
            sub: "Hơn là sự thấu hiểu chân thành",
          },
          {
            icon: "🛋️",
            label: "Dễ chịu nhất thời",
            sub: "Hơn là bước ra để thay đổi",
          },
        ]
      : [
          {
            icon: "⏸️",
            label: "1. Dừng lại 3 giây",
            sub: "Ngắt phản xạ công kích tự động",
          },
          {
            icon: "🔍",
            label: "2. Gọi tên cảm xúc",
            sub: "Biết rõ mình đang giận hay sợ",
          },
          {
            icon: "🧭",
            label: "3. Chọn cách đáp trả",
            sub: "Giữ bình yên thay vì hối hận",
          },
        ];

  return (
    <AbsoluteFill
      style={{
        background:
          "radial-gradient(circle at 50% 42%, #FFFFFF 0%, #E2E8F0 68%, #CBD5E1 100%)",
        fontFamily: "'Inter', 'Segoe UI', system-ui, sans-serif",
      }}
    >
      <div
        style={{
          position: "absolute",
          top: 420,
          left: 64,
          right: 64,
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          transform: `scale(${interpolate(pop, [0, 1], [0.92, 1])})`,
        }}
      >
        <div
          style={{
            fontSize: 44,
            fontWeight: 900,
            color: "#0F172A",
            marginBottom: 8,
            textAlign: "center",
          }}
        >
          {mode === "ego_cost" ? (
            <>
              Cái giá của việc{" "}
              <span style={{ color: "#EF4444" }}>bảo vệ cái tôi</span>
            </>
          ) : (
            <>
              Quy tắc{" "}
              <span style={{ color: "#EF4444" }}>chuyển hóa phản xạ</span>
            </>
          )}
        </div>

        {/* Giant Apple Keynote Stat */}
        <div
          style={{
            display: "flex",
            alignItems: "baseline",
            gap: 20,
            marginBottom: 42,
          }}
        >
          <span
            style={{
              fontSize: 190,
              fontWeight: 900,
              color: "#0F172A",
              letterSpacing: "-6px",
              lineHeight: 1,
            }}
          >
            {mode === "ego_cost" ? "99%" : "3s"}
          </span>
          <span
            style={{
              fontSize: 64,
              fontWeight: 900,
              color: "#EF4444",
              letterSpacing: "-1px",
            }}
          >
            {mode === "ego_cost" ? "năng lượng/ngày" : "khoảng lặng"}
          </span>
        </div>

        {/* 3 White Rounded Keynote Cards */}
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            gap: 24,
            width: "100%",
          }}
        >
          {cards.map((c, i) => (
            <div
              key={i}
              style={{
                backgroundColor: "#FFFFFF",
                borderRadius: 26,
                padding: "26px 34px",
                boxShadow:
                  "0 18px 38px rgba(15, 23, 42, 0.10), 0 2px 6px rgba(15, 23, 42, 0.05)",
                display: "flex",
                alignItems: "center",
                gap: 26,
              }}
            >
              <div
                style={{
                  fontSize: 54,
                  width: 78,
                  height: 78,
                  borderRadius: 20,
                  backgroundColor: "#F1F5F9",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  flexShrink: 0,
                }}
              >
                {c.icon}
              </div>
              <div>
                <div
                  style={{
                    fontSize: 34,
                    fontWeight: 900,
                    color: "#0F172A",
                    marginBottom: 4,
                  }}
                >
                  {c.label}
                </div>
                <div
                  style={{
                    fontSize: 24,
                    fontWeight: 500,
                    color: "#64748B",
                  }}
                >
                  {c.sub}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </AbsoluteFill>
  );
};

// ============================================================================
// 7. 3D MINIMALIST SCENES FOR PURE @carter.selfdev STYLE
// ============================================================================
const Carter3DSmartphoneFeedScene: React.FC = () => {
  const frame = useCurrentFrame();
  const scrollY = (frame * 2.2) % 180;

  return (
    <AbsoluteFill
      style={{
        background:
          "radial-gradient(circle at 50% 45%, #E7D2BD 0%, #B89F88 60%, #7C6552 100%)",
        overflow: "hidden",
      }}
    >
      {/* 3D Perspective Smartphone with Red Notification Feed (zs_frame_0 style) */}
      <div
        style={{
          position: "absolute",
          top: 460,
          left: 160,
          width: 760,
          height: 1380,
          borderRadius: 72,
          backgroundColor: "#0F141C",
          border: "16px solid #262E3D",
          boxShadow: "0 50px 110px rgba(0, 0, 0, 0.65)",
          transform: "perspective(1100px) rotateX(22deg)",
          transformOrigin: "center top",
          padding: 36,
          overflow: "hidden",
        }}
      >
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            gap: 28,
            transform: `translateY(-${scrollY}px)`,
          }}
        >
          {Array.from({ length: 8 }).map((_, idx) => (
            <div
              key={idx}
              style={{
                backgroundColor: "rgba(185, 48, 42, 0.55)",
                borderRadius: 28,
                padding: "30px 34px",
                display: "flex",
                alignItems: "center",
                gap: 28,
                border: "2px solid rgba(248, 113, 113, 0.3)",
                boxShadow: "0 12px 30px rgba(220, 38, 38, 0.22)",
              }}
            >
              <div
                style={{
                  width: 58,
                  height: 58,
                  borderRadius: 999,
                  backgroundColor: "#F87171",
                  flexShrink: 0,
                }}
              />
              <div style={{ flex: 1 }}>
                <div
                  style={{
                    height: 18,
                    width: "78%",
                    backgroundColor: "#F8FAFC",
                    borderRadius: 9,
                    marginBottom: 14,
                  }}
                />
                <div
                  style={{
                    height: 14,
                    width: "52%",
                    backgroundColor: "rgba(248, 250, 252, 0.55)",
                    borderRadius: 7,
                  }}
                />
              </div>
            </div>
          ))}
        </div>
      </div>
    </AbsoluteFill>
  );
};

const Carter3DNightDeskRoomScene: React.FC<{ isFinale?: boolean }> = ({
  isFinale = false,
}) => {
  const frame = useCurrentFrame();
  const plantGrow = interpolate(frame, [0, 120], [0.55, 1.0], {
    extrapolateRight: "clamp",
  });

  return (
    <AbsoluteFill
      style={{
        background: isFinale
          ? "linear-gradient(180deg, #64748B 0%, #94A3B8 55%, #CBD5E1 100%)"
          : "linear-gradient(180deg, #475569 0%, #64748B 55%, #94A3B8 100%)",
        overflow: "hidden",
      }}
    >
      <svg width="1080" height="1920" style={{ position: "absolute", inset: 0 }}>
        {/* Floating Soft Dust Particles */}
        {Array.from({ length: 24 }).map((_, i) => {
          const cx = (i * 173 + 90) % 1020;
          const cy = ((i * 137 + 200 - frame * 0.6) % 1200 + 1200) % 1200;
          return (
            <circle
              key={i}
              cx={cx}
              cy={cy}
              r={(i % 3) + 3}
              fill="#F8FAFC"
              opacity={0.35}
            />
          );
        })}

        {/* Window with Curtains (zs_frame_4 & zs_frame_5) */}
        <g transform="translate(360, 120)">
          <rect
            x="0"
            y="0"
            width="420"
            height="620"
            rx="8"
            fill={isFinale ? "#F8FAFC" : "#CBD5E1"}
          />
          <rect x="200" y="0" width="20" height="620" fill="#94A3B8" />
          {/* Left & Right Blue-Gray Window Panels */}
          <polygon points="-30,0 165,0 155,640 -45,630" fill="#2A364F" />
          <polygon points="255,0 450,0 440,640 245,630" fill="#2A364F" />
        </g>

        {/* 3D Minimalist Study Table */}
        <polygon
          points="-40,1220 1120,1250 1120,1920 -40,1920"
          fill="#C8C2AE"
        />

        {/* Red-Lid Storage Box on Left (zs_frame_4 & zs_frame_5) */}
        <g transform="translate(110, 1015)">
          <polygon points="0,60 210,70 210,275 0,260" fill="#9499A1" />
          <polygon points="210,70 285,35 285,235 210,275" fill="#6B7078" />
          <polygon points="-6,25 206,35 206,75 -6,65" fill="#B91C1C" />
          <polygon points="206,35 288,0 288,40 206,75" fill="#7F1D1D" />
          <polygon points="-6,25 78,-10 288,0 206,35" fill="#DC2626" />
        </g>

        {/* Notebook on Right */}
        <g transform="translate(650, 1360)">
          <polygon points="0,0 210,12 245,235 20,215" fill="#172554" />
          <polygon points="20,215 245,235 245,260 20,240" fill="#CBD5E1" />
        </g>

        {/* Terracotta Pot + Growing Green Plant on Right (zs_frame_4 -> zs_frame_5) */}
        <g transform="translate(835, 1180)">
          <ellipse cx="75" cy="95" rx="75" ry="26" fill="#B45309" />
          <polygon points="5,95 145,95 128,225 22,225" fill="#7C2D12" />
          <ellipse cx="75" cy="95" rx="68" ry="22" fill="#9A3412" />
          {/* Plant stem and leaves */}
          <g
            transform={`translate(75, 95) scale(${plantGrow})`}
            style={{ transformOrigin: "0px 0px" }}
          >
            <rect x="-6" y="-170" width="12" height="170" rx="6" fill="#14532D" />
            <ellipse
              cx="-42"
              cy="-55"
              rx="42"
              ry="14"
              transform="rotate(-18 -42 -55)"
              fill="#15803D"
            />
            <ellipse
              cx="45"
              cy="-75"
              rx="42"
              ry="14"
              transform="rotate(18 45 -75)"
              fill="#16A34A"
            />
            <ellipse
              cx="-38"
              cy="-115"
              rx="38"
              ry="13"
              transform="rotate(-15 -38 -115)"
              fill="#16A34A"
            />
            <ellipse
              cx="40"
              cy="-135"
              rx="38"
              ry="13"
              transform="rotate(15 40 -135)"
              fill="#22C55E"
            />
          </g>
        </g>
      </svg>
    </AbsoluteFill>
  );
};

// ============================================================================
// COMPOSITION A: CarterSelfDevStyle9x16 (Pure @carter.selfdev 9:16 Video)
// ============================================================================
export const CarterSelfDevStyle9x16: React.FC<CarterSelfDevProps> = () => {
  const { fps } = useVideoConfig();

  return (
    <AbsoluteFill style={{ backgroundColor: "#0B0E14", overflow: "hidden" }}>
      {/* Visual Background Beats */}
      <Sequence from={0} durationInFrames={Math.round(32.0 * fps)}>
        <Carter3DSmartphoneFeedScene />
      </Sequence>

      <Sequence
        from={Math.round(32.0 * fps)}
        durationInFrames={Math.round((42.1 - 32.0) * fps)}
      >
        <CarterAppleKeynoteWhiteSlide mode="ego_cost" />
      </Sequence>

      <Sequence
        from={Math.round(42.1 * fps)}
        durationInFrames={Math.round((70.1 - 42.1) * fps)}
      >
        <Carter3DNightDeskRoomScene isFinale={false} />
      </Sequence>

      <Sequence
        from={Math.round(70.1 * fps)}
        durationInFrames={Math.round((76.8 - 70.1) * fps)}
      >
        <CarterAppleKeynoteWhiteSlide mode="three_steps" />
      </Sequence>

      <Sequence
        from={Math.round(76.8 * fps)}
        durationInFrames={Math.round((90.0 - 76.8) * fps)}
      >
        <Carter3DNightDeskRoomScene isFinale={true} />
      </Sequence>

      {/* iOS Frosted Notification Cards (THÔNG BÁO 01 .. 09) */}
      {IOS_NOTIFICATIONS.map((spec) => {
        const from = Math.round(spec.inSec * fps);
        const dur = Math.max(1, Math.round((spec.outSec - spec.inSec) * fps));
        return (
          <Sequence key={spec.code} from={from} durationInFrames={dur}>
            <CarterIOSNotificationBanner spec={spec} />
          </Sequence>
        );
      })}

      {/* Finale Progressive Dark Pill Quote Box (82.3s - 90.0s) */}
      <Sequence
        from={Math.round(82.3 * fps)}
        durationInFrames={Math.round((90.0 - 82.3) * fps)}
      >
        <CarterFinaleProgressiveQuoteBox />
      </Sequence>

      {/* Bilingual Yellow-Glow Subtitles */}
      <CarterBilingualYellowSubtitles hideVietnameseInFinale={true} />

      {/* 3-Layer Master Audio (Haitrieu 90s Voiceover + BGM + Soft 0.20 SFX) */}
      <Audio
        src={staticFile("episodes/reactive-mind/master_mix_haitrieu_90s.wav")}
        volume={1.0}
      />
    </AbsoluteFill>
  );
};

// ============================================================================
// COMPOSITION B: MochiCarterVertical9x16 (18 Mochi Scenes + @carter.selfdev UI)
// ============================================================================
export const MochiCarterVertical9x16: React.FC<CarterSelfDevProps> = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const nowSec = frame / fps;

  const isKeynoteEgo = nowSec >= 35.8 && nowSec < 42.1;
  const isKeynoteSteps = nowSec >= 70.1 && nowSec < 76.8;

  return (
    <AbsoluteFill style={{ backgroundColor: "#07090F", overflow: "hidden" }}>
      {/* All 18 Animated Mochi 9:16 Scenes */}
      <MochiScenesLayer />

      {/* Apple Keynote Clean White Card Slides at Key Analytical Beats */}
      {isKeynoteEgo && <CarterAppleKeynoteWhiteSlide mode="ego_cost" />}
      {isKeynoteSteps && <CarterAppleKeynoteWhiteSlide mode="three_steps" />}

      {/* iOS Frosted Notification Cards (THÔNG BÁO 01 .. 09) */}
      {IOS_NOTIFICATIONS.map((spec) => {
        const from = Math.round(spec.inSec * fps);
        const dur = Math.max(1, Math.round((spec.outSec - spec.inSec) * fps));
        return (
          <Sequence key={spec.code} from={from} durationInFrames={dur}>
            <CarterIOSNotificationBanner spec={spec} />
          </Sequence>
        );
      })}

      {/* Finale Progressive Dark Pill Quote Box (82.3s - 90.0s) */}
      <Sequence
        from={Math.round(82.3 * fps)}
        durationInFrames={Math.round((90.0 - 82.3) * fps)}
      >
        <CarterFinaleProgressiveQuoteBox />
      </Sequence>

      {/* Bilingual Yellow-Glow Subtitles */}
      <CarterBilingualYellowSubtitles hideVietnameseInFinale={true} />

      {/* 3-Layer Master Audio */}
      <Audio
        src={staticFile("episodes/reactive-mind/master_mix_haitrieu_90s.wav")}
        volume={1.0}
      />
    </AbsoluteFill>
  );
};