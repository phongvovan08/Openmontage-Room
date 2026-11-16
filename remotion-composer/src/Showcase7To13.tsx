import React from "react";
import {
  AbsoluteFill,
  Audio,
  Sequence,
  interpolate,
  random,
  spring,
  staticFile,
  useCurrentFrame,
  useVideoConfig,
} from "remotion";
import { CaptionOverlay, WordCaption } from "./components/CaptionOverlay";
import { loadPlayfair } from "./lib/localFonts";

const serifRegular = "'Georgia', 'Palatino Linotype', 'Book Antiqua', serif";
const serifItalic = "'Georgia', 'Palatino Linotype', 'Book Antiqua', serif";

export interface ShowcaseVideoProps {
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

// Shared 10-beat psychological script structure (0.0s -> 69.0s)
interface StoryBeat {
  index: number;
  roman: string;
  inSec: number;
  outSec: number;
  tag: string;
  title: string;
  subtitle: string;
  instinctText: string;
  mindfulText: string;
  color: string;
}

const STORY_BEATS: StoryBeat[] = [
  {
    index: 1,
    roman: "I",
    inSec: 0.0,
    outSec: 4.1,
    tag: "TRẠNG THÁI SINH TỒN",
    title: "Khi Cảm Xúc Bản Năng Cầm Lái",
    subtitle: "Mắc kẹt trong cơ chế sinh tồn tự động",
    instinctText: "Phản ứng tức thì 0.02 giây theo bản năng",
    mindfulText: "Nhận biết mình đang bị kích hoạt",
    color: "#EF4444",
  },
  {
    index: 2,
    roman: "II",
    inSec: 4.1,
    outSec: 10.1,
    tag: "BA PHẢN XẠ TỰ ĐỘNG",
    title: "Tấn Công · Né Tránh · Trút Giận",
    subtitle: "Giận thì công kích · Sợ thì thu mình · Đau thì làm tổn thương",
    instinctText: "Xù lông nhím hoặc đóng sập cánh cửa lòng",
    mindfulText: "Quan sát cơn sóng mà không đồng nhất với nó",
    color: "#F97316",
  },
  {
    index: 3,
    roman: "III",
    inSec: 10.1,
    outSec: 13.5,
    tag: "KHOẢNG LẶNG BỊ ĐÁNH MẤT",
    title: "Tại Sao Mình Lại Cảm Thấy Như Vậy?",
    subtitle: "Câu hỏi tự vấn hiếm khi được đặt ra đúng lúc",
    instinctText: "Đổ lỗi ngay cho hoàn cảnh và người đối diện",
    mindfulText: "Quay vào bên trong hỏi thăm gốc rễ cảm xúc",
    color: "#38BDF8",
  },
  {
    index: 4,
    roman: "IV",
    inSec: 13.5,
    outSec: 18.0,
    tag: "HIỆU ỨNG LAN TRUYỀN",
    title: "Vết Thương Chưa Lành Tràn Sang Người Khác",
    subtitle: "Phản ứng mù quáng biến nỗi đau riêng thành vết xước chung",
    instinctText: "Làm người thương yêu nhất chịu trận thay",
    mindfulText: "Ngắt chuỗi lây lan tổn thương ngay tại mình",
    color: "#A855F7",
  },
  {
    index: 5,
    roman: "V",
    inSec: 18.0,
    outSec: 24.7,
    tag: "PHÁO ĐÀI CỦA CÁI TÔI",
    title: "Khi Cái Tôi Bị Chạm Tới",
    subtitle: "Cơ chế phòng thủ bật lên để bảo vệ vùng tự ái",
    instinctText: "Ngắt lời, phản bác, chứng minh “Tôi luôn đúng”",
    mindfulText: "Hạ khiên phòng vệ để nghe trọn vẹn thông điệp",
    color: "#F59E0B",
  },
  {
    index: 6,
    roman: "VI",
    inSec: 24.7,
    outSec: 32.1,
    tag: "BÀN CÂN NHẬN THỨC",
    title: "Dễ Chịu Nhất Thời Hay Sự Thật Giúp Trưởng Thành?",
    subtitle: "Bảo vệ quan điểm cũ chỉ giữ ta đứng yên một chỗ",
    instinctText: "Chọn lời khen giả tạo để vuốt ve cái tôi",
    mindfulText: "Chọn sự thật dù chói tai nhưng mở rộng tầm nhìn",
    color: "#10B981",
  },
  {
    index: 7,
    roman: "VII",
    inSec: 32.1,
    outSec: 39.5,
    tag: "RÀO CẢN ĐỐI THOẠI",
    title: "Vì Sao Rất Khó Trò Chuyện Sâu Sắc?",
    subtitle: "Khi một góc nhìn khác biệt bị xem là sự công kích cá nhân",
    instinctText: "Biến mọi cuộc góp ý thành chiến trường thắng thua",
    mindfulText: "Tách biệt giá trị bản thân khỏi một ý kiến",
    color: "#EC4899",
  },
  {
    index: 8,
    roman: "VIII",
    inSec: 39.5,
    outSec: 45.7,
    tag: "ẢO ẢNH HOÀN HẢO",
    title: "Tấm Gương Tự Họa Dễ Tổn Thương",
    subtitle: "Cơn giận bùng lên vì sợ hình ảnh hoàn hảo bị rạn vỡ",
    instinctText: "Sợ lộ khuyết điểm, gồng mình giữ mặt nạ",
    mindfulText: "Chấp nhận bản thân chưa hoàn thiện để tiến bộ",
    color: "#8B5CF6",
  },
  {
    index: 9,
    roman: "IX",
    inSec: 45.7,
    outSec: 54.0,
    tag: "ĐỊNH NGHĨA TRƯỞNG THÀNH",
    title: "Không Phải Hết Cảm Xúc — Mà Là Không Để Cảm Xúc Lái",
    subtitle: "Cảm xúc là hành khách, sự tỉnh thức mới là người cầm lái",
    instinctText: "Để cơn nóng giận cướp vô-lăng cuộc đời",
    mindfulText: "Cảm nhận rõ cơn sóng nhưng giữ vững tay lái",
    color: "#06B6D4",
  },
  {
    index: 10,
    roman: "X",
    inSec: 54.0,
    outSec: 69.0,
    tag: "BA NHỊP TỈNH THỨC",
    title: "Nhận Diện · Dừng Lại · Chủ Động Lựa Chọn",
    subtitle: "Đừng biến cảm xúc nhất thời thành quyết định hối hận cả đời",
    instinctText: "Buông lời cay đắng trong 3 giây bốc đồng",
    mindfulText: "Nhận diện → Dừng lại 1 nhịp → Đáp trả sáng suốt",
    color: "#34D399",
  },
];

const SharedAudioAndCaptions: React.FC<{
  narrationSrc?: string;
  musicSrc?: string;
  captions?: WordCaption[];
  highlightColor?: string;
}> = ({
  narrationSrc = "episodes/reactive-mind/narration.mp3",
  musicSrc = "episodes/reactive-mind/ambient_music.wav",
  captions = [],
  highlightColor = "#FACC15",
}) => {
  const { durationInFrames } = useVideoConfig();
  return (
    <>
      {captions.length > 0 && (
        <CaptionOverlay
          words={captions}
          wordsPerPage={6}
          fontSize={38}
          highlightColor={highlightColor}
          backgroundColor="rgba(8, 11, 20, 0.86)"
        />
      )}
      {narrationSrc && <Audio src={resolveAsset(narrationSrc)} volume={1.0} />}
      <Audio src={resolveAsset('episodes/reactive-mind/sfx_stem_master.wav')} volume={0.85} />
      {musicSrc && (
        <Audio
          src={resolveAsset(musicSrc)}
          loop
          volume={(f) => {
            const fadeIn = interpolate(f, [0, 35], [0, 0.3], {
              extrapolateLeft: "clamp",
              extrapolateRight: "clamp",
            });
            const fadeOut = interpolate(
              f,
              [durationInFrames - 75, durationInFrames],
              [0.3, 0],
              { extrapolateLeft: "clamp", extrapolateRight: "clamp" }
            );
            return Math.min(fadeIn, fadeOut);
          }}
        />
      )}
    </>
  );
};

// ============================================================================
// LOẠI 7: COLLAGE BURST 3D POLAROID & VELVET CURTAIN (Loai07CollageBurst)
// ============================================================================
export const Loai07CollageBurst: React.FC<ShowcaseVideoProps> = (props) => {
  const frame = useCurrentFrame();
  const { fps, width } = useVideoConfig();
  const sec = frame / fps;

  const curtainStart = 1.1 * fps;
  const curtainEnd = 2.6 * fps;
  const t = interpolate(frame, [curtainStart, curtainEnd], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });
  const ease = t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2;
  const panelShift = ease * (width / 2 + 60);

  // Camera shake on card impact
  let shakeX = 0;
  let shakeY = 0;
  let flashAlpha = 0;
  for (const b of STORY_BEATS) {
    const startF = Math.round(b.inSec * fps);
    const dist = frame - startF;
    if (dist >= 0 && dist < 8) {
      const falloff = 1 - dist / 8;
      shakeX += (random(`s7x-${b.index}-${dist}`) - 0.5) * 14 * falloff;
      shakeY += (random(`s7y-${b.index}-${dist}`) - 0.5) * 14 * falloff;
      flashAlpha = Math.max(flashAlpha, falloff * 0.38);
    }
  }

  // Positions and rotations on the 1920x1080 cork/velvet board
  const cardLayout = [
    { x: 460, y: 340, rot: -6, mode: "pop" },
    { x: 960, y: 350, rot: 4, mode: "slide" },
    { x: 1450, y: 340, rot: -5, mode: "spin" },
    { x: 520, y: 610, rot: 5, mode: "swoop" },
    { x: 960, y: 520, rot: -3, mode: "pop" },
    { x: 1410, y: 590, rot: 6, mode: "slide" },
    { x: 510, y: 390, rot: -4, mode: "swoop" },
    { x: 960, y: 420, rot: 3, mode: "spin" },
    { x: 1400, y: 410, rot: -5, mode: "pop" },
    { x: 960, y: 470, rot: 0, mode: "hero" },
  ];

  return (
    <AbsoluteFill
      style={{
        backgroundColor: "#0E0B0A",
        overflow: "hidden",
        fontFamily: "'Inter', 'Segoe UI', sans-serif",
      }}
    >
      {/* Warm Vintage Studio Moodboard Backdrop */}
      <div
        style={{
          position: "absolute",
          inset: 0,
          background:
            "radial-gradient(circle at 50% 42%, rgba(217, 119, 6, 0.22) 0%, rgba(24, 20, 18, 0.92) 68%, #090707 100%)",
        }}
      />

      {/* Subtle Cork / Analog Grid Lines */}
      <svg width="1920" height="1080" style={{ position: "absolute", opacity: 0.14 }}>
        {Array.from({ length: 12 }).map((_, i) => (
          <line
            key={i}
            x1={i * 180}
            y1="0"
            x2={i * 180}
            y2="1080"
            stroke="#F59E0B"
            strokeWidth="1"
            strokeDasharray="6 10"
          />
        ))}
      </svg>

      {/* Top Studio Header */}
      <div
        style={{
          position: "absolute",
          top: 28,
          left: 60,
          right: 60,
          display: "flex",
          justifyContent: "space-between",
          color: "#FDE68A",
          fontSize: 15,
          letterSpacing: 3,
          fontWeight: 700,
          zIndex: 5,
        }}
      >
        <span>LOẠI 07 // COLLAGE BURST POLAROID WALL</span>
        <span>HỒ SƠ TÂM LÝ HỌC HÀNH VI · 10 THẺ CHỨNG CỨ</span>
      </div>

      {/* Polaroid Cards Container with Camera Shake */}
      <AbsoluteFill style={{ transform: `translate(${shakeX}px, ${shakeY}px)` }}>
        {STORY_BEATS.map((beat, idx) => {
          const startF = Math.round(beat.inSec * fps);
          const endF = Math.round(beat.outSec * fps);
          if (frame < startF) return null;

          const rel = frame - startF;
          const isCurrent = sec >= beat.inSec && sec < beat.outSec;
          const settleSp = spring({
            frame: Math.max(0, frame - endF),
            fps,
            config: { damping: 16, stiffness: 90 },
          });

          const sp = spring({
            frame: rel,
            fps,
            config: { damping: 11, stiffness: 120, mass: 0.85 },
          });

          const lay = cardLayout[idx];
          const targetX = interpolate(settleSp, [0, 1], [960, lay.x]);
          const targetY = interpolate(settleSp, [0, 1], [455, lay.y]);
          const targetScale = interpolate(settleSp, [0, 1], [1.1, 0.56]);
          const targetOpacity = interpolate(settleSp, [0, 1], [1, 0.34]);

          const slideOffset =
            lay.mode === "slide"
              ? (1 - sp) * 650
              : lay.mode === "swoop"
              ? (1 - sp) * -550
              : 0;
          const spinDeg =
            lay.mode === "spin" ? (1 - sp) * 240 : (1 - sp) * -25;

          const w = 680;
          const h = 500;

          return (
            <div
              key={beat.index}
              style={{
                position: "absolute",
                left: targetX - w / 2,
                top: targetY - h / 2,
                width: w,
                height: h,
                backgroundColor: "#FAF7F0",
                borderRadius: 18,
                padding: "22px 24px 78px 24px",
                boxShadow: isCurrent
                  ? `0 40px 95px rgba(0,0,0,0.85), 0 0 70px ${beat.color}66`
                  : "0 18px 40px rgba(0,0,0,0.65)",
                transform: `translate(${slideOffset}px, ${(1 - sp) * 120}px) rotate(${
                  (isCurrent ? lay.rot * 0.35 : lay.rot) + spinDeg
                }deg) scale(${sp * targetScale})`,
                opacity: sp * targetOpacity,
                zIndex: isCurrent ? 30 : idx + 2,
              }}
            >
              {/* Red Push-Pin on top of Polaroid */}
              <div
                style={{
                  position: "absolute",
                  top: -12,
                  left: "50%",
                  transform: "translateX(-50%)",
                  width: 26,
                  height: 26,
                  borderRadius: "50%",
                  backgroundColor: beat.color,
                  boxShadow: "0 4px 10px rgba(0,0,0,0.5)",
                  border: "3px solid #FFF",
                }}
              />

              {/* Inner Illustrated Canvas of the Polaroid */}
              <div
                style={{
                  width: "100%",
                  height: "100%",
                  backgroundColor: "#0F172A",
                  borderRadius: 10,
                  padding: 28,
                  display: "flex",
                  flexDirection: "column",
                  justifyContent: "space-between",
                  position: "relative",
                  overflow: "hidden",
                  border: `2px solid ${beat.color}`,
                }}
              >
                <div
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                  }}
                >
                  <span
                    style={{
                      padding: "5px 14px",
                      borderRadius: 999,
                      backgroundColor: `${beat.color}33`,
                      border: `1px solid ${beat.color}`,
                      color: "#FFFFFF",
                      fontSize: 14,
                      fontWeight: 800,
                      letterSpacing: 1.5,
                    }}
                  >
                    THẺ #{String(beat.index).padStart(2, "0")} · {beat.tag}
                  </span>
                  <span
                    style={{
                      color: beat.color,
                      fontSize: 28,
                      fontWeight: 900,
                      fontFamily: serifItalic,
                    }}
                  >
                    {beat.roman}
                  </span>
                </div>

                <div
                  style={{
                    color: "#FFFFFF",
                    fontSize: 32,
                    fontWeight: 800,
                    lineHeight: 1.25,
                  }}
                >
                  {beat.title}
                </div>

                <div
                  style={{
                    display: "grid",
                    gridTemplateColumns: "1fr 1fr",
                    gap: 14,
                  }}
                >
                  <div
                    style={{
                      backgroundColor: "rgba(239, 68, 68, 0.16)",
                      borderLeft: "4px solid #EF4444",
                      padding: 12,
                      borderRadius: 8,
                    }}
                  >
                    <div style={{ color: "#FCA5A5", fontSize: 12, fontWeight: 700 }}>
                      PHẢN XẠ CŨ
                    </div>
                    <div style={{ color: "#F8FAFC", fontSize: 15, marginTop: 4 }}>
                      {beat.instinctText}
                    </div>
                  </div>
                  <div
                    style={{
                      backgroundColor: "rgba(16, 185, 129, 0.16)",
                      borderLeft: "4px solid #10B981",
                      padding: 12,
                      borderRadius: 8,
                    }}
                  >
                    <div style={{ color: "#6EE7B7", fontSize: 12, fontWeight: 700 }}>
                      TỈNH THỨC MỚI
                    </div>
                    <div style={{ color: "#F8FAFC", fontSize: 15, marginTop: 4 }}>
                      {beat.mindfulText}
                    </div>
                  </div>
                </div>
              </div>

              {/* Bottom Polaroid Caption Strip */}
              <div
                style={{
                  height: 68,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                  paddingTop: 12,
                  color: "#1E293B",
                }}
              >
                <span
                  style={{
                    fontFamily: serifItalic,
                    fontSize: 22,
                    fontWeight: 700,
                    color: "#0F172A",
                  }}
                >
                  “{beat.subtitle}”
                </span>
                <span
                  style={{
                    fontSize: 13,
                    fontWeight: 800,
                    color: "#64748B",
                    letterSpacing: 1,
                  }}
                >
                  {beat.inSec.toFixed(1)}s
                </span>
              </div>
            </div>
          );
        })}
      </AbsoluteFill>

      {/* Camera Flash Effect */}
      {flashAlpha > 0 && (
        <AbsoluteFill
          style={{
            backgroundColor: "#FFFBEB",
            opacity: flashAlpha,
            pointerEvents: "none",
          }}
        />
      )}

      {/* Opening Velvet Curtain & Gold Seam (0.0s -> 2.6s) */}
      {frame < curtainEnd + 10 && (
        <AbsoluteFill style={{ pointerEvents: "none", zIndex: 40 }}>
          <div
            style={{
              position: "absolute",
              top: 0,
              left: 0,
              width: "50%",
              height: "100%",
              backgroundColor: "#050505",
              transform: `translateX(${-panelShift}px)`,
            }}
          />
          <div
            style={{
              position: "absolute",
              top: 0,
              right: 0,
              width: "50%",
              height: "100%",
              backgroundColor: "#050505",
              transform: `translateX(${panelShift}px)`,
            }}
          />
          <div
            style={{
              position: "absolute",
              top: 0,
              left: "50%",
              width: 8,
              height: "100%",
              transform: "translateX(-50%)",
              background:
                "linear-gradient(180deg, transparent, #FDE68A, transparent)",
              opacity: 1 - ease,
              boxShadow: "0 0 60px #F59E0B",
            }}
          />
          <div
            style={{
              position: "absolute",
              inset: 0,
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              justifyContent: "center",
              opacity: 1 - ease,
            }}
          >
            <div
              style={{
                fontFamily: serifRegular,
                fontSize: 42,
                color: "#F5E7C5",
              }}
            >
              Giải Phẫu Tâm Thức Qua 10 Thẻ Polaroid
            </div>
            <div
              style={{
                fontFamily: serifItalic,
                fontStyle: "italic",
                fontSize: 74,
                color: "#FDE68A",
                marginTop: 12,
              }}
            >
              Phản Xạ Bản Năng & Sự Tỉnh Thức
            </div>
          </div>
        </AbsoluteFill>
      )}

      <SharedAudioAndCaptions {...props} highlightColor="#FBBF24" />
    </AbsoluteFill>
  );
};

// ============================================================================
// LOẠI 8: UI SIMULATION — MESSAGING CHAT + PSYCHOLOGY TERMINAL (Loai08UIChatSim)
// ============================================================================
export const Loai08UIChatSim: React.FC<ShowcaseVideoProps> = (props) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const sec = frame / fps;

  const activeBeat =
    STORY_BEATS.find((b) => sec >= b.inSec && sec < b.outSec) ||
    STORY_BEATS[STORY_BEATS.length - 1];
  const localSec = Math.max(0, sec - activeBeat.inSec);
  const beatDur = Math.max(1, activeBeat.outSec - activeBeat.inSec);

  // Typing simulation in input box:
  // First 45% of beat: types impulsive reactive draft in red, then deletes it!
  // Next 55% of beat: types mindful response in emerald green!
  const isDeletingPhase = localSec >= beatDur * 0.35 && localSec < beatDur * 0.48;
  const isMindfulPhase = localSec >= beatDur * 0.48;

  let draftText = "";
  if (!isDeletingPhase && !isMindfulPhase) {
    const p = Math.min(1, localSec / (beatDur * 0.32));
    draftText = activeBeat.instinctText.slice(
      0,
      Math.floor(p * activeBeat.instinctText.length)
    );
  } else if (isDeletingPhase) {
    const p = 1 - (localSec - beatDur * 0.35) / (beatDur * 0.13);
    draftText = activeBeat.instinctText.slice(
      0,
      Math.max(0, Math.floor(p * activeBeat.instinctText.length))
    );
  } else {
    const p = Math.min(1, (localSec - beatDur * 0.48) / (beatDur * 0.38));
    draftText = activeBeat.mindfulText.slice(
      0,
      Math.floor(p * activeBeat.mindfulText.length)
    );
  }

  // Animated mouse cursor moving between chat input and send button
  const cursorX = interpolate(
    Math.sin(frame * 0.06),
    [-1, 1],
    [480, 920]
  );
  const cursorY = isDeletingPhase ? 790 : 755;

  return (
    <AbsoluteFill
      style={{
        backgroundColor: "#070B14",
        fontFamily: "'Inter', 'Segoe UI', sans-serif",
        padding: "38px 54px 120px 54px",
      }}
    >
      {/* Top macOS Desktop Menu Bar */}
      <div
        style={{
          height: 40,
          backgroundColor: "rgba(15, 23, 42, 0.9)",
          borderRadius: 10,
          padding: "0 20px",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          border: "1px solid rgba(148,163,184,0.2)",
          marginBottom: 22,
          color: "#E2E8F0",
          fontSize: 14,
          fontWeight: 600,
        }}
      >
        <div style={{ display: "flex", gap: 18, alignItems: "center" }}>
          <span style={{ color: "#38BDF8", fontWeight: 800 }}> MindOS Studio</span>
          <span>Hội Thoại Thực Tế</span>
          <span>Phân Tích Phản Xạ</span>
          <span>Terminal Tâm Thức</span>
        </div>
        <div style={{ fontFamily: "'JetBrains Mono', monospace", color: "#FACC15" }}>
          LOẠI 08 // UI CHAT & TERMINAL SIMULATION · {sec.toFixed(1)}s
        </div>
      </div>

      {/* Main Split Desktop Workspace */}
      <div
        style={{
          flex: 1,
          display: "grid",
          gridTemplateColumns: "1.25fr 1fr",
          gap: 26,
          height: "calc(100% - 62px)",
        }}
      >
        {/* LEFT WINDOW: MindChat Messaging App */}
        <div
          style={{
            backgroundColor: "#0F172A",
            borderRadius: 20,
            border: "1px solid rgba(148,163,184,0.25)",
            display: "flex",
            flexDirection: "column",
            overflow: "hidden",
            boxShadow: "0 25px 70px rgba(0,0,0,0.65)",
            position: "relative",
          }}
        >
          {/* Window Header */}
          <div
            style={{
              padding: "16px 22px",
              backgroundColor: "#1E293B",
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              borderBottom: "1px solid rgba(255,255,255,0.08)",
            }}
          >
            <div style={{ display: "flex", gap: 8 }}>
              <div style={{ width: 12, height: 12, borderRadius: "50%", background: "#EF4444" }} />
              <div style={{ width: 12, height: 12, borderRadius: "50%", background: "#F59E0B" }} />
              <div style={{ width: 12, height: 12, borderRadius: "50%", background: "#10B981" }} />
            </div>
            <div style={{ color: "#F8FAFC", fontWeight: 700, fontSize: 16 }}>
              💬 Đối Thoại Nội Tâm — Tình Huống #{activeBeat.index}/10
            </div>
            <div
              style={{
                padding: "4px 10px",
                borderRadius: 999,
                backgroundColor: `${activeBeat.color}33`,
                color: activeBeat.color,
                fontSize: 12,
                fontWeight: 800,
              }}
            >
              {activeBeat.tag}
            </div>
          </div>

          {/* Chat Messages Stream */}
          <div
            style={{
              flex: 1,
              padding: 28,
              display: "flex",
              flexDirection: "column",
              justifyContent: "space-between",
            }}
          >
            {/* Incoming Stimulus Bubble */}
            <div>
              <div style={{ color: "#94A3B8", fontSize: 13, marginBottom: 6 }}>
                Tình huống kích hoạt ({activeBeat.inSec.toFixed(1)}s):
              </div>
              <div
                style={{
                  backgroundColor: "#1E293B",
                  border: `1.5px solid ${activeBeat.color}`,
                  borderRadius: "18px 18px 18px 4px",
                  padding: "18px 22px",
                  maxWidth: "88%",
                }}
              >
                <div style={{ color: activeBeat.color, fontSize: 14, fontWeight: 800 }}>
                  {activeBeat.title}
                </div>
                <div style={{ color: "#F1F5F9", fontSize: 20, fontWeight: 600, marginTop: 6 }}>
                  “{activeBeat.subtitle}”
                </div>
              </div>
            </div>

            {/* Rejected Instinctive Draft Warning */}
            <div
              style={{
                alignSelf: "flex-end",
                width: "86%",
                backgroundColor: "rgba(127, 29, 29, 0.28)",
                border: "1px dashed #EF4444",
                borderRadius: 16,
                padding: "14px 18px",
                opacity: isMindfulPhase ? 0.55 : 1,
              }}
            >
              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  color: "#FCA5A5",
                  fontSize: 13,
                  fontWeight: 800,
                }}
              >
                <span>⚠️ PHẢN XẠ BẢN NĂNG (TỰ ĐỘNG BẬT LÊN):</span>
                <span>{isMindfulPhase ? "[ĐÃ DỪNG LẠI & XÓA]" : "[ĐANG GÕ...]"}</span>
              </div>
              <div
                style={{
                  color: "#FECACA",
                  fontSize: 18,
                  marginTop: 6,
                  textDecoration: isMindfulPhase ? "line-through" : "none",
                }}
              >
                “{activeBeat.instinctText}”
              </div>
            </div>

            {/* Live Typing Input Box at Bottom */}
            <div>
              <div
                style={{
                  marginBottom: 8,
                  display: "flex",
                  justifyContent: "space-between",
                  fontSize: 13,
                  fontWeight: 700,
                  color: isMindfulPhase
                    ? "#34D399"
                    : isDeletingPhase
                    ? "#FBBF24"
                    : "#F87171",
                }}
              >
                <span>
                  {isMindfulPhase
                    ? "✓ Đang soạn phản hồi tỉnh thức (Sau khi dừng 1 nhịp):"
                    : isDeletingPhase
                    ? "⏸ Đang dừng lại 1 nhịp và xóa tin nhắn nóng giận..."
                    : "⚡ Đang gõ theo cảm xúc bản năng..."}
                </span>
                <span>{isMindfulPhase ? "CHỦ ĐỘNG LỰA CHỌN" : "AUTO-PILOT"}</span>
              </div>
              <div
                style={{
                  height: 76,
                  backgroundColor: "#090D16",
                  borderRadius: 16,
                  border: `2px solid ${
                    isMindfulPhase
                      ? "#10B981"
                      : isDeletingPhase
                      ? "#FACC15"
                      : "#EF4444"
                  }`,
                  padding: "0 20px",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                }}
              >
                <span
                  style={{
                    color: "#FFFFFF",
                    fontSize: 20,
                    fontWeight: 600,
                  }}
                >
                  {draftText}
                  <span
                    style={{
                      display: "inline-block",
                      width: 3,
                      height: 24,
                      backgroundColor: "#FACC15",
                      marginLeft: 4,
                    }}
                  />
                </span>
                <div
                  style={{
                    padding: "10px 20px",
                    borderRadius: 12,
                    backgroundColor: isMindfulPhase ? "#10B981" : "#334155",
                    color: "#060913",
                    fontWeight: 800,
                    fontSize: 15,
                  }}
                >
                  {isMindfulPhase ? "GỬI TỈNH THỨC" : "KHOAN GỬI"}
                </div>
              </div>
            </div>
          </div>

          {/* Animated Mouse Cursor inside Chat Window */}
          <svg
            width="34"
            height="42"
            viewBox="0 0 16 20"
            style={{
              position: "absolute",
              left: cursorX,
              top: cursorY,
              pointerEvents: "none",
              filter: "drop-shadow(0 4px 8px rgba(0,0,0,0.6))",
            }}
          >
            <path
              d="M2 2 L2 16 L6 12 L8.5 17 L10.5 16 L8 11 L13 11 Z"
              fill="#FFFFFF"
              stroke="#0F172A"
              strokeWidth="1.2"
            />
          </svg>
        </div>

        {/* RIGHT WINDOW: TerminalScene Real-Time Psychological Analyzer */}
        <div
          style={{
            backgroundColor: "#0B0F1A",
            borderRadius: 20,
            border: "1px solid rgba(56, 189, 248, 0.3)",
            display: "flex",
            flexDirection: "column",
            overflow: "hidden",
            fontFamily: "'JetBrains Mono', 'Consolas', monospace",
            boxShadow: "0 25px 70px rgba(0,0,0,0.65)",
          }}
        >
          <div
            style={{
              padding: "16px 22px",
              backgroundColor: "#161E2E",
              color: "#38BDF8",
              fontSize: 15,
              fontWeight: 700,
              borderBottom: "1px solid rgba(255,255,255,0.08)",
            }}
          >
            $_ psych-telemetry --live-monitor
          </div>

          <div
            style={{
              padding: 24,
              fontSize: 16,
              lineHeight: 1.7,
              color: "#E2E8F0",
              display: "flex",
              flexDirection: "column",
              gap: 12,
            }}
          >
            <div style={{ color: "#38BDF8" }}>
              $ inspect --beat={activeBeat.index} --code=&quot;{activeBeat.tag}&quot;
            </div>
            <div style={{ color: "#94A3B8" }}>
              [INFO] Đang phân tích trạng thái thần kinh tại giây {sec.toFixed(1)}s...
            </div>
            <div style={{ color: "#F87171" }}>
              [WARN] Phản xạ mặc định: {activeBeat.instinctText}
            </div>
            <div style={{ color: "#FACC15" }}>
              [CHECK] Câu hỏi tự vấn: “Tại sao mình lại cảm thấy như vậy?”
            </div>
            <div style={{ color: "#34D399" }}>
              [OK] Chuyển hướng tỉnh thức: {activeBeat.mindfulText}
            </div>

            {/* Live Progress Bars inside Terminal */}
            <div
              style={{
                marginTop: 18,
                padding: 18,
                backgroundColor: "#111827",
                borderRadius: 12,
                border: "1px solid #1F2937",
              }}
            >
              <div style={{ fontSize: 13, color: "#FCA5A5", marginBottom: 6 }}>
                CƠ CHẾ PHÒNG VỆ CÁI TÔI (EGO SHIELD):{" "}
                {isMindfulPhase ? "22% (ĐÃ HẠ KHIÊN)" : "94% (BÁO ĐỘNG ĐỎ)"}
              </div>
              <div
                style={{
                  height: 12,
                  backgroundColor: "#1F2937",
                  borderRadius: 6,
                  overflow: "hidden",
                  marginBottom: 16,
                }}
              >
                <div
                  style={{
                    width: isMindfulPhase ? "22%" : "94%",
                    height: "100%",
                    backgroundColor: isMindfulPhase ? "#10B981" : "#EF4444",
                  }}
                />
              </div>

              <div style={{ fontSize: 13, color: "#6EE7B7", marginBottom: 6 }}>
                CHỈ SỐ TỰ CHỦ & TỈNH THỨC (MINDFULNESS):{" "}
                {isMindfulPhase ? "96% (LÀM CHỦ HÀNH VI)" : "18% (BỊ CẢM XÚC LÁI)"}
              </div>
              <div
                style={{
                  height: 12,
                  backgroundColor: "#1F2937",
                  borderRadius: 6,
                  overflow: "hidden",
                }}
              >
                <div
                  style={{
                    width: isMindfulPhase ? "96%" : "18%",
                    height: "100%",
                    backgroundColor: "#38BDF8",
                  }}
                />
              </div>
            </div>
          </div>
        </div>
      </div>

      <SharedAudioAndCaptions {...props} highlightColor="#38BDF8" />
    </AbsoluteFill>
  );
};

// ============================================================================
// LOẠI 9: POETIC SERIF EDITORIAL QUOTE CINEMA (Loai09PoeticQuote)
// ============================================================================
export const Loai09PoeticQuote: React.FC<ShowcaseVideoProps> = (props) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const sec = frame / fps;

  const activeBeat =
    STORY_BEATS.find((b) => sec >= b.inSec && sec < b.outSec) ||
    STORY_BEATS[STORY_BEATS.length - 1];
  const localFrame = Math.max(0, frame - Math.round(activeBeat.inSec * fps));
  const enter = spring({
    frame: localFrame,
    fps,
    config: { damping: 20, stiffness: 70 },
  });

  return (
    <AbsoluteFill
      style={{
        backgroundColor: "#080706",
        overflow: "hidden",
        justifyContent: "center",
        alignItems: "center",
      }}
    >
      {/* Warm Golden Bokeh Orbs */}
      {Array.from({ length: 14 }).map((_, i) => {
        const x = ((i * 197) % 1720) + 100;
        const y =
          ((i * 131 + Math.sin(frame * 0.015 + i) * 60) % 880 + 880) % 880 + 80;
        const r = 45 + (i % 4) * 35;
        return (
          <div
            key={i}
            style={{
              position: "absolute",
              left: x - r,
              top: y - r,
              width: r * 2,
              height: r * 2,
              borderRadius: "50%",
              background:
                "radial-gradient(circle, rgba(255, 214, 150, 0.14) 0%, transparent 70%)",
              filter: "blur(8px)",
            }}
          />
        );
      })}

      {/* Editorial Frame Border */}
      <div
        style={{
          position: "absolute",
          inset: 44,
          border: "1px solid rgba(245, 231, 197, 0.22)",
          pointerEvents: "none",
        }}
      />

      {/* Top Editorial Header */}
      <div
        style={{
          position: "absolute",
          top: 72,
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          gap: 8,
        }}
      >
        <div
          style={{
            fontFamily: "'Inter', sans-serif",
            fontSize: 14,
            letterSpacing: 4,
            color: "rgba(255, 214, 150, 0.85)",
            fontWeight: 600,
          }}
        >
          LOẠI 09 // POETIC SERIF ESSAY · CHƯƠNG {activeBeat.roman}
        </div>
        <div
          style={{
            width: 140 * enter,
            height: 1.5,
            background:
              "linear-gradient(90deg, transparent, rgba(255,214,150,0.9), transparent)",
          }}
        />
      </div>

      {/* Center Poetic Typography */}
      <div
        style={{
          maxWidth: 1380,
          padding: "0 80px 70px 80px",
          textAlign: "center",
          transform: `translateY(${(1 - enter) * 28}px)`,
          opacity: enter,
        }}
      >
        <div
          style={{
            fontFamily: serifItalic,
            fontStyle: "italic",
            fontSize: 34,
            color: "#FFD696",
            marginBottom: 18,
          }}
        >
          — {activeBeat.tag} —
        </div>

        <div
          style={{
            fontFamily: serifRegular,
            fontSize: 72,
            color: "#F5E7C5",
            lineHeight: 1.18,
            textShadow: "0 4px 30px rgba(0,0,0,0.85)",
          }}
        >
          “{activeBeat.title}”
        </div>

        {/* Center Gold Jewel Divider */}
        <div
          style={{
            margin: "34px auto",
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            gap: 16,
          }}
        >
          <div
            style={{
              width: 180 * enter,
              height: 1.5,
              background: "linear-gradient(90deg, transparent, #FFD696)",
            }}
          />
          <div
            style={{
              width: 9,
              height: 9,
              transform: "rotate(45deg)",
              backgroundColor: "#FFD696",
              boxShadow: "0 0 14px #FFD696",
            }}
          />
          <div
            style={{
              width: 180 * enter,
              height: 1.5,
              background: "linear-gradient(90deg, #FFD696, transparent)",
            }}
          />
        </div>

        <div
          style={{
            fontFamily: serifItalic,
            fontStyle: "italic",
            fontSize: 42,
            color: "#E2D5B5",
            lineHeight: 1.35,
          }}
        >
          {activeBeat.subtitle}
        </div>

        <div
          style={{
            marginTop: 32,
            fontFamily: "'Inter', sans-serif",
            fontSize: 22,
            color: "#A7F3D0",
            letterSpacing: 1,
            fontWeight: 600,
          }}
        >
          ✦ Chuyển hóa: {activeBeat.mindfulText}
        </div>
      </div>

      <SharedAudioAndCaptions {...props} highlightColor="#FDE68A" />
    </AbsoluteFill>
  );
};

// ============================================================================
// LOẠI 10: 3D STAGE BOOK & MASTERCLASS REVEAL (Loai10BookReveal)
// ============================================================================
export const Loai10BookReveal: React.FC<ShowcaseVideoProps> = (props) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const sec = frame / fps;

  const activeBeat =
    STORY_BEATS.find((b) => sec >= b.inSec && sec < b.outSec) ||
    STORY_BEATS[STORY_BEATS.length - 1];
  const localFrame = Math.max(0, frame - Math.round(activeBeat.inSec * fps));
  const cardSpring = spring({
    frame: localFrame,
    fps,
    config: { damping: 15, stiffness: 90 },
  });

  const floatY = Math.sin(frame * 0.05) * 12;
  const bookRotY = -18 + Math.sin(frame * 0.03) * 8;

  return (
    <AbsoluteFill
      style={{
        backgroundColor: "#050811",
        fontFamily: "'Inter', 'Segoe UI', sans-serif",
        overflow: "hidden",
      }}
    >
      {/* Stage Spotlight Cone */}
      <div
        style={{
          position: "absolute",
          inset: 0,
          background: `radial-gradient(ellipse at 32% 45%, ${activeBeat.color}33 0%, rgba(15,23,42,0.85) 55%, #050811 100%)`,
        }}
      />

      {/* Top Stage Header */}
      <div
        style={{
          position: "absolute",
          top: 34,
          left: 64,
          right: 64,
          display: "flex",
          justifyContent: "space-between",
          color: "#94A3B8",
          fontSize: 14,
          letterSpacing: 2.5,
          fontWeight: 700,
        }}
      >
        <span style={{ color: activeBeat.color }}>
          LOẠI 10 // 3D BOOK & MASTERCLASS PRODUCT REVEAL
        </span>
        <span>ẤN PHẨM TÂM LÝ HỌC ỨNG DỤNG · CHƯƠNG {activeBeat.index}/10</span>
      </div>

      {/* Left Stage: 3D Floating Hardcover Book */}
      <div
        style={{
          position: "absolute",
          left: 150,
          top: 150 + floatY,
          width: 470,
          height: 640,
          perspective: 1200,
        }}
      >
        <div
          style={{
            width: "100%",
            height: "100%",
            borderRadius: "8px 24px 24px 8px",
            background:
              "linear-gradient(135deg, #0F172A 0%, #1E293B 50%, #090D16 100%)",
            border: `3px solid ${activeBeat.color}`,
            boxShadow: `-24px 30px 60px rgba(0,0,0,0.85), inset 16px 0 25px rgba(255,255,255,0.08), 0 0 55px ${activeBeat.color}44`,
            transform: `rotateY(${bookRotY}deg)`,
            padding: 38,
            display: "flex",
            flexDirection: "column",
            justifyContent: "space-between",
          }}
        >
          {/* Book Spine Highlight */}
          <div
            style={{
              position: "absolute",
              left: 16,
              top: 0,
              bottom: 0,
              width: 3,
              backgroundColor: "rgba(255,255,255,0.22)",
            }}
          />

          <div
            style={{
              color: "#FACC15",
              fontSize: 13,
              letterSpacing: 3,
              fontWeight: 800,
            }}
          >
            BESTSELLER TÂM LÝ HỌC TỈNH THỨC
          </div>

          <div>
            <div
              style={{
                fontFamily: serifItalic,
                fontStyle: "italic",
                color: activeBeat.color,
                fontSize: 26,
              }}
            >
              Nghệ Thuật Tự Chủ Nội Tâm
            </div>
            <div
              style={{
                fontFamily: serifRegular,
                color: "#FFFFFF",
                fontSize: 46,
                fontWeight: 700,
                lineHeight: 1.15,
                marginTop: 10,
              }}
            >
              DỪNG LẠI MỘT NHỊP TRƯỚC KHI PHẢN ỨNG
            </div>
          </div>

          {/* Geometric Emblem on Book Cover */}
          <svg width="160" height="160" viewBox="0 0 160 160" style={{ alignSelf: "center" }}>
            <circle
              cx="80"
              cy="80"
              r="68"
              fill="none"
              stroke="#FACC15"
              strokeWidth="2"
              strokeDasharray="8 6"
            />
            <circle
              cx="80"
              cy="80"
              r="46"
              fill="none"
              stroke={activeBeat.color}
              strokeWidth="3"
            />
            <polygon
              points="80,28 124,106 36,106"
              fill="none"
              stroke="#FFFFFF"
              strokeWidth="2.5"
            />
          </svg>

          <div
            style={{
              borderTop: "1px solid rgba(255,255,255,0.15)",
              paddingTop: 14,
              display: "flex",
              justifyContent: "space-between",
              color: "#CBD5E1",
              fontSize: 14,
              fontWeight: 600,
            }}
          >
            <span>TỦ SÁCH TỈNH THỨC</span>
            <span style={{ color: "#FACC15" }}>★ 5.0 EDITION</span>
          </div>
        </div>
      </div>

      {/* Right Stage: Unfurling Chapter Specification Card */}
      <div
        style={{
          position: "absolute",
          left: 720,
          right: 90,
          top: 175,
          height: 590,
          backgroundColor: "rgba(15, 23, 42, 0.88)",
          borderRadius: 28,
          border: `2px solid ${activeBeat.color}`,
          padding: 48,
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
          transform: `translateX(${(1 - cardSpring) * 60}px)`,
          opacity: cardSpring,
          boxShadow: "0 30px 80px rgba(0,0,0,0.65)",
        }}
      >
        <div>
          <div
            style={{
              display: "inline-block",
              padding: "6px 16px",
              borderRadius: 999,
              backgroundColor: `${activeBeat.color}25`,
              border: `1px solid ${activeBeat.color}`,
              color: activeBeat.color,
              fontSize: 15,
              fontWeight: 800,
              letterSpacing: 2,
            }}
          >
            TRÍCH ĐOẠN CHƯƠNG {activeBeat.roman} · {activeBeat.tag}
          </div>

          <div
            style={{
              color: "#FFFFFF",
              fontSize: 46,
              fontWeight: 800,
              lineHeight: 1.2,
              marginTop: 22,
            }}
          >
            {activeBeat.title}
          </div>

          <div
            style={{
              color: "#CBD5E1",
              fontSize: 24,
              marginTop: 14,
              lineHeight: 1.45,
            }}
          >
            {activeBeat.subtitle}
          </div>
        </div>

        <div
          style={{
            display: "grid",
            gridTemplateColumns: "1fr 1fr",
            gap: 22,
          }}
        >
          <div
            style={{
              backgroundColor: "rgba(239, 68, 68, 0.12)",
              borderRadius: 16,
              padding: 22,
              border: "1px solid rgba(239, 68, 68, 0.4)",
            }}
          >
            <div style={{ color: "#FCA5A5", fontSize: 14, fontWeight: 800 }}>
              ✗ CẠM BẪY BẢN NĂNG
            </div>
            <div style={{ color: "#FFFFFF", fontSize: 20, fontWeight: 600, marginTop: 8 }}>
              {activeBeat.instinctText}
            </div>
          </div>

          <div
            style={{
              backgroundColor: "rgba(16, 185, 129, 0.14)",
              borderRadius: 16,
              padding: 22,
              border: "1px solid rgba(16, 185, 129, 0.45)",
            }}
          >
            <div style={{ color: "#6EE7B7", fontSize: 14, fontWeight: 800 }}>
              ✓ BÀI HỌC CHUYỂN HÓA
            </div>
            <div style={{ color: "#FFFFFF", fontSize: 20, fontWeight: 600, marginTop: 8 }}>
              {activeBeat.mindfulText}
            </div>
          </div>
        </div>
      </div>

      <SharedAudioAndCaptions {...props} highlightColor="#FACC15" />
    </AbsoluteFill>
  );
};

// ============================================================================
// LOẠI 11: DAN KOE MINIMALIST BLACKBOARD SELF-DRAWING SKETCH (Loai11DanKoeSketch)
// ============================================================================
export const Loai11DanKoeSketch: React.FC<ShowcaseVideoProps> = (props) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const sec = frame / fps;

  const activeBeat =
    STORY_BEATS.find((b) => sec >= b.inSec && sec < b.outSec) ||
    STORY_BEATS[STORY_BEATS.length - 1];
  const localFrame = Math.max(0, frame - Math.round(activeBeat.inSec * fps));
  const beatFrames = Math.max(
    1,
    Math.round((activeBeat.outSec - activeBeat.inSec) * fps)
  );
  const drawProg = interpolate(
    localFrame,
    [0, Math.min(75, beatFrames * 0.65)],
    [0, 1],
    { extrapolateLeft: "clamp", extrapolateRight: "clamp" }
  );

  // Unique minimalist geometric diagram path per beat index (1..10)
  const renderSketchGeometry = (idx: number, prog: number) => {
    const dash = 1400;
    const offset = dash * (1 - prog);

    switch (idx) {
      case 1:
        // Loop trap vs escape arrow
        return (
          <g>
            <circle
              cx="560"
              cy="370"
              r="140"
              fill="none"
              stroke="#FFFFFF"
              strokeWidth="4.5"
              strokeDasharray={dash}
              strokeDashoffset={offset}
            />
            <path
              d="M 700 370 L 1220 370 L 1180 335 M 1220 370 L 1180 405"
              fill="none"
              stroke="#FACC15"
              strokeWidth="5"
              strokeDasharray={dash}
              strokeDashoffset={offset}
            />
            <rect
              x="1240"
              y="280"
              width="240"
              height="180"
              fill="none"
              stroke="#FFFFFF"
              strokeWidth="4"
              strokeDasharray={dash}
              strokeDashoffset={offset}
            />
          </g>
        );
      case 2:
        // Triangle of 3 reflexes
        return (
          <g>
            <polygon
              points="960,180 640,520 1280,520"
              fill="none"
              stroke="#FFFFFF"
              strokeWidth="4.5"
              strokeDasharray={dash}
              strokeDashoffset={offset}
            />
            <circle cx="960" cy="180" r="36" fill="#050505" stroke="#FACC15" strokeWidth="4" />
            <circle cx="640" cy="520" r="36" fill="#050505" stroke="#FACC15" strokeWidth="4" />
            <circle cx="1280" cy="520" r="36" fill="#050505" stroke="#FACC15" strokeWidth="4" />
          </g>
        );
      case 3:
        // Question mark & magnifying circle
        return (
          <g>
            <circle
              cx="960"
              cy="355"
              r="165"
              fill="none"
              stroke="#FFFFFF"
              strokeWidth="4.5"
              strokeDasharray={dash}
              strokeDashoffset={offset}
            />
            <text
              x="960"
              y="415"
              textAnchor="middle"
              fill="#FACC15"
              fontSize="160"
              fontWeight="800"
              opacity={prog}
            >
              ?
            </text>
          </g>
        );
      case 4:
        // Concentric ripple contagion
        return (
          <g>
            {[55, 115, 175, 235].map((r, i) => (
              <circle
                key={i}
                cx="960"
                cy="360"
                r={r}
                fill="none"
                stroke={i === 0 ? "#FACC15" : "#FFFFFF"}
                strokeWidth="3.5"
                strokeDasharray={dash}
                strokeDashoffset={offset}
              />
            ))}
          </g>
        );
      case 5:
        // Ego Shield vs Arrow
        return (
          <g>
            <path
              d="M 460 360 L 850 360 L 815 325 M 850 360 L 815 395"
              fill="none"
              stroke="#FFFFFF"
              strokeWidth="5"
              strokeDasharray={dash}
              strokeDashoffset={offset}
            />
            <polygon
              points="1080,190 1240,260 1240,460 1080,530 920,460 920,260"
              fill="none"
              stroke="#FACC15"
              strokeWidth="5"
              strokeDasharray={dash}
              strokeDashoffset={offset}
            />
          </g>
        );
      default:
        // Bifurcated path: Downward reactive loop vs Upward conscious growth
        return (
          <g>
            <circle cx="480" cy="380" r="45" fill="none" stroke="#FFFFFF" strokeWidth="4" />
            <path
              d="M 525 380 C 780 380, 920 520, 1380 530"
              fill="none"
              stroke="#64748B"
              strokeWidth="4"
              strokeDasharray="12 10"
            />
            <path
              d="M 525 380 C 780 380, 920 210, 1380 190"
              fill="none"
              stroke="#FACC15"
              strokeWidth="6"
              strokeDasharray={dash}
              strokeDashoffset={offset}
            />
            <circle
              cx="1380"
              cy="190"
              r="34"
              fill="#050505"
              stroke="#FACC15"
              strokeWidth="5"
              opacity={prog}
            />
          </g>
        );
    }
  };

  return (
    <AbsoluteFill
      style={{
        backgroundColor: "#040404",
        fontFamily: "'Inter', 'Segoe UI', sans-serif",
      }}
    >
      {/* Top Minimalist Dan Koe Header */}
      <div
        style={{
          position: "absolute",
          top: 38,
          left: 72,
          right: 72,
          display: "flex",
          justifyContent: "space-between",
          color: "#71717A",
          fontSize: 15,
          fontFamily: "'JetBrains Mono', monospace",
          letterSpacing: 2,
        }}
      >
        <span style={{ color: "#F4F4F5" }}>
          LOẠI 11 // DAN KOE MINIMALIST WHITE-ON-BLACK SKETCH
        </span>
        <span>
          IDEA {activeBeat.index}.0 // {activeBeat.tag}
        </span>
      </div>

      {/* Hand-drawn SVG Canvas */}
      <svg width="1920" height="1080" style={{ position: "absolute", inset: 0 }}>
        {renderSketchGeometry(activeBeat.index, drawProg)}
      </svg>

      {/* Bottom-Center Minimalist Essay Caption Box */}
      <div
        style={{
          position: "absolute",
          bottom: 155,
          left: 160,
          right: 160,
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          textAlign: "center",
        }}
      >
        <div
          style={{
            color: "#FFFFFF",
            fontSize: 44,
            fontWeight: 800,
            letterSpacing: -0.5,
          }}
        >
          {activeBeat.title}
        </div>
        <div
          style={{
            color: "#A1A1AA",
            fontSize: 23,
            marginTop: 10,
            maxWidth: 1100,
          }}
        >
          {activeBeat.subtitle}
        </div>
        <div
          style={{
            marginTop: 18,
            display: "flex",
            gap: 32,
            fontFamily: "'JetBrains Mono', monospace",
            fontSize: 16,
          }}
        >
          <span style={{ color: "#71717A" }}>[×] {activeBeat.instinctText}</span>
          <span style={{ color: "#FACC15" }}>[→] {activeBeat.mindfulText}</span>
        </div>
      </div>

      <SharedAudioAndCaptions {...props} highlightColor="#FACC15" />
    </AbsoluteFill>
  );
};

// ============================================================================
// LOẠI 12: SPLIT-SCREEN BEHAVIORAL ROLEPLAY (Loai12SplitRoleplay)
// ============================================================================
export const Loai12SplitRoleplay: React.FC<ShowcaseVideoProps> = (props) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const sec = frame / fps;

  const activeBeat =
    STORY_BEATS.find((b) => sec >= b.inSec && sec < b.outSec) ||
    STORY_BEATS[STORY_BEATS.length - 1];
  const localFrame = Math.max(0, frame - Math.round(activeBeat.inSec * fps));
  const enter = spring({
    frame: localFrame,
    fps,
    config: { damping: 14, stiffness: 95 },
  });

  return (
    <AbsoluteFill
      style={{
        backgroundColor: "#060913",
        fontFamily: "'Inter', 'Segoe UI', sans-serif",
      }}
    >
      {/* Top Situation Banner */}
      <div
        style={{
          position: "absolute",
          top: 26,
          left: 60,
          right: 60,
          height: 82,
          backgroundColor: "rgba(15, 23, 42, 0.94)",
          borderRadius: 18,
          border: "1px solid rgba(148,163,184,0.28)",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          padding: "0 32px",
          zIndex: 20,
        }}
      >
        <div>
          <div style={{ color: "#FACC15", fontSize: 13, fontWeight: 800, letterSpacing: 2 }}>
            LOẠI 12 // SPLIT-SCREEN ROLEPLAY · TÌNH HUỐNG #{activeBeat.index}/10
          </div>
          <div style={{ color: "#FFFFFF", fontSize: 24, fontWeight: 800, marginTop: 2 }}>
            {activeBeat.title}
          </div>
        </div>
        <div
          style={{
            padding: "8px 18px",
            borderRadius: 999,
            backgroundColor: "rgba(255,255,255,0.06)",
            color: "#CBD5E1",
            fontSize: 16,
            fontWeight: 600,
          }}
        >
          {activeBeat.subtitle}
        </div>
      </div>

      {/* Split Screen Left & Right Columns */}
      <div
        style={{
          position: "absolute",
          top: 126,
          bottom: 130,
          left: 60,
          right: 60,
          display: "grid",
          gridTemplateColumns: "1fr 1fr",
          gap: 28,
        }}
      >
        {/* LEFT SIDE: INSTINCTIVE REACTION */}
        <div
          style={{
            background:
              "linear-gradient(180deg, rgba(69, 10, 10, 0.72) 0%, rgba(15, 23, 42, 0.92) 100%)",
            borderRadius: 24,
            border: "2px solid #EF4444",
            padding: 36,
            display: "flex",
            flexDirection: "column",
            justifyContent: "space-between",
            transform: `translateY(${(1 - enter) * 30}px)`,
            opacity: enter,
          }}
        >
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <span
              style={{
                padding: "6px 14px",
                borderRadius: 999,
                backgroundColor: "rgba(239,68,68,0.25)",
                color: "#FCA5A5",
                fontSize: 14,
                fontWeight: 800,
              }}
            >
              BÊN A · KHI SỐNG THEO BẢN NĂNG
            </span>
            <span style={{ color: "#EF4444", fontWeight: 800, fontSize: 16 }}>
              ⚡ NHỊP TIM: 138 BPM
            </span>
          </div>

          {/* Character Avatar & Thought Bubble */}
          <div style={{ display: "flex", alignItems: "center", gap: 24 }}>
            <svg width="130" height="130" viewBox="0 0 130 130">
              <circle cx="65" cy="65" r="58" fill="#450A0A" stroke="#EF4444" strokeWidth="4" />
              <circle cx="65" cy="48" r="20" fill="#FCA5A5" />
              <path d="M 32 105 C 32 78, 98 78, 98 105" fill="#FCA5A5" />
            </svg>
            <div
              style={{
                flex: 1,
                backgroundColor: "rgba(0,0,0,0.45)",
                borderRadius: 18,
                padding: 22,
                borderLeft: "5px solid #EF4444",
              }}
            >
              <div style={{ color: "#FCA5A5", fontSize: 13, fontWeight: 800 }}>
                PHẢN XẠ TỨC THÌ (0.02 GIÂY):
              </div>
              <div style={{ color: "#FFFFFF", fontSize: 25, fontWeight: 800, marginTop: 8 }}>
                “{activeBeat.instinctText}”
              </div>
            </div>
          </div>

          {/* Outcome Meter */}
          <div
            style={{
              backgroundColor: "rgba(0,0,0,0.4)",
              borderRadius: 16,
              padding: 20,
            }}
          >
            <div style={{ color: "#FCA5A5", fontSize: 14, fontWeight: 700 }}>
              HỆ QUẢ TÂM LÝ & MỐI QUAN HỆ:
            </div>
            <div style={{ color: "#E2E8F0", fontSize: 18, marginTop: 6 }}>
              ✗ Cái tôi được ve vuốt nhất thời nhưng để lại khoảng cách và sự hối tiếc.
            </div>
          </div>
        </div>

        {/* RIGHT SIDE: MINDFUL MATURITY */}
        <div
          style={{
            background:
              "linear-gradient(180deg, rgba(6, 78, 59, 0.72) 0%, rgba(15, 23, 42, 0.92) 100%)",
            borderRadius: 24,
            border: "2px solid #10B981",
            padding: 36,
            display: "flex",
            flexDirection: "column",
            justifyContent: "space-between",
            transform: `translateY(${(1 - enter) * 30}px)`,
            opacity: enter,
          }}
        >
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <span
              style={{
                padding: "6px 14px",
                borderRadius: 999,
                backgroundColor: "rgba(16,185,129,0.25)",
                color: "#6EE7B7",
                fontSize: 14,
                fontWeight: 800,
              }}
            >
              BÊN B · KHI TRƯỞNG THÀNH TỈNH THỨC
            </span>
            <span style={{ color: "#34D399", fontWeight: 800, fontSize: 16 }}>
              🌿 NHỊP THỞ: ĐIỀM TĨNH
            </span>
          </div>

          {/* Character Avatar & Mindful Bubble */}
          <div style={{ display: "flex", alignItems: "center", gap: 24 }}>
            <svg width="130" height="130" viewBox="0 0 130 130">
              <circle cx="65" cy="65" r="58" fill="#064E3B" stroke="#10B981" strokeWidth="4" />
              <circle cx="65" cy="48" r="20" fill="#A7F3D0" />
              <path d="M 32 105 C 32 78, 98 78, 98 105" fill="#A7F3D0" />
            </svg>
            <div
              style={{
                flex: 1,
                backgroundColor: "rgba(0,0,0,0.45)",
                borderRadius: 18,
                padding: 22,
                borderLeft: "5px solid #10B981",
              }}
            >
              <div style={{ color: "#6EE7B7", fontSize: 13, fontWeight: 800 }}>
                SAU KHI DỪNG LẠI 1 NHỊP (3 GIÂY):
              </div>
              <div style={{ color: "#FFFFFF", fontSize: 25, fontWeight: 800, marginTop: 8 }}>
                “{activeBeat.mindfulText}”
              </div>
            </div>
          </div>

          {/* Outcome Meter */}
          <div
            style={{
              backgroundColor: "rgba(0,0,0,0.4)",
              borderRadius: 16,
              padding: 20,
            }}
          >
            <div style={{ color: "#6EE7B7", fontSize: 14, fontWeight: 700 }}>
              HỆ QUẢ TÂM LÝ & MỐI QUAN HỆ:
            </div>
            <div style={{ color: "#E2E8F0", fontSize: 18, marginTop: 6 }}>
              ★ Giữ trọn sự tự do nội tâm, thấu hiểu sâu sắc và không hối hận về sau.
            </div>
          </div>
        </div>
      </div>

      <SharedAudioAndCaptions {...props} highlightColor="#34D399" />
    </AbsoluteFill>
  );
};

// ============================================================================
// LOẠI 13: LATE-NIGHT PODCAST VINYL & WAVEFORM AUDIOGRAM (Loai13PodcastAudiogram)
// ============================================================================
export const Loai13PodcastAudiogram: React.FC<ShowcaseVideoProps> = (props) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const sec = frame / fps;

  const activeBeat =
    STORY_BEATS.find((b) => sec >= b.inSec && sec < b.outSec) ||
    STORY_BEATS[STORY_BEATS.length - 1];

  return (
    <AbsoluteFill
      style={{
        backgroundColor: "#08060A",
        fontFamily: "'Inter', 'Segoe UI', sans-serif",
        overflow: "hidden",
      }}
    >
      {/* Warm Radio Studio Ambient Glow */}
      <div
        style={{
          position: "absolute",
          inset: 0,
          background:
            "radial-gradient(circle at 26% 46%, rgba(245, 158, 11, 0.22) 0%, rgba(17, 12, 24, 0.94) 60%, #060408 100%)",
        }}
      />

      {/* Top Studio ON-AIR Header */}
      <div
        style={{
          position: "absolute",
          top: 36,
          left: 64,
          right: 64,
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
          <div
            style={{
              padding: "6px 16px",
              borderRadius: 8,
              backgroundColor: "#DC2626",
              color: "#FFFFFF",
              fontWeight: 900,
              fontSize: 14,
              letterSpacing: 2,
              boxShadow: "0 0 20px rgba(220,38,38,0.8)",
            }}
          >
            ● ON AIR
          </div>
          <span
            style={{
              color: "#FDE68A",
              fontSize: 16,
              fontWeight: 700,
              letterSpacing: 2,
            }}
          >
            LOẠI 13 // RADIO ĐÊM KHUYA & SÓNG ÂM ĐĨA THAN · FM 98.8 MHz
          </span>
        </div>

        <div
          style={{
            fontFamily: "'JetBrains Mono', monospace",
            color: "#A78BFA",
            fontSize: 16,
          }}
        >
          02:15 AM · EPISODE #{activeBeat.index}/10
        </div>
      </div>

      {/* Left: Spinning 33 RPM Vinyl Record */}
      <div
        style={{
          position: "absolute",
          left: 110,
          top: 165,
          width: 520,
          height: 520,
        }}
      >
        <svg width="520" height="520" viewBox="0 0 520 520">
          <g transform={`translate(260, 260) rotate(${frame * 1.8})`}>
            <circle r="245" fill="#111113" stroke="#27272A" strokeWidth="6" />
            {[215, 185, 155, 125].map((r, i) => (
              <circle
                key={i}
                r={r}
                fill="none"
                stroke="rgba(255,255,255,0.08)"
                strokeWidth="2"
                strokeDasharray={i % 2 === 0 ? "120 40" : "80 30"}
              />
            ))}
            {/* Center Vinyl Label */}
            <circle r="82" fill={activeBeat.color} stroke="#FEF08A" strokeWidth="4" />
            <text
              y="-28"
              textAnchor="middle"
              fill="#09090B"
              fontSize="13"
              fontWeight="900"
              letterSpacing="2"
            >
              TẦN SỐ TỈNH THỨC
            </text>
            <text
              y="38"
              textAnchor="middle"
              fill="#09090B"
              fontSize="14"
              fontWeight="800"
            >
              TRACK {activeBeat.roman}
            </text>
            <circle r="14" fill="#09090B" />
          </g>

          {/* Turntable Tonearm */}
          <path
            d="M 465 75 L 395 235 L 350 265"
            fill="none"
            stroke="#D4D4D8"
            strokeWidth="7"
            strokeLinecap="round"
          />
          <circle cx="465" cy="75" r="24" fill="#3F3F46" stroke="#FACC15" strokeWidth="3" />
        </svg>
      </div>

      {/* Right: Podcast Episode Card + 48-Bar Dynamic Audio Spectrum */}
      <div
        style={{
          position: "absolute",
          left: 690,
          right: 76,
          top: 170,
          height: 520,
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
        }}
      >
        <div
          style={{
            backgroundColor: "rgba(24, 24, 27, 0.88)",
            borderRadius: 24,
            border: "1px solid rgba(250, 204, 21, 0.3)",
            padding: 38,
          }}
        >
          <div
            style={{
              color: "#FACC15",
              fontSize: 14,
              fontWeight: 800,
              letterSpacing: 2.5,
            }}
          >
            TRACK {String(activeBeat.index).padStart(2, "0")} // {activeBeat.tag}
          </div>
          <div
            style={{
              color: "#FFFFFF",
              fontSize: 42,
              fontWeight: 800,
              marginTop: 12,
              lineHeight: 1.2,
            }}
          >
            {activeBeat.title}
          </div>
          <div
            style={{
              color: "#D4D4D8",
              fontSize: 22,
              marginTop: 14,
              lineHeight: 1.4,
            }}
          >
            “{activeBeat.subtitle}”
          </div>
          <div
            style={{
              marginTop: 20,
              paddingTop: 16,
              borderTop: "1px solid rgba(255,255,255,0.1)",
              color: "#6EE7B7",
              fontSize: 18,
              fontWeight: 600,
            }}
          >
            🎙️ Lời nhắn đêm khuya: {activeBeat.mindfulText}
          </div>
        </div>

        {/* 48-Bar Real-Time Audio Spectrum Waveform */}
        <div
          style={{
            height: 155,
            backgroundColor: "rgba(15, 23, 42, 0.75)",
            borderRadius: 20,
            border: "1px solid rgba(255,255,255,0.1)",
            padding: "0 28px",
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            gap: 6,
          }}
        >
          {Array.from({ length: 48 }).map((_, i) => {
            const wave =
              Math.abs(Math.sin(frame * 0.22 + i * 0.45)) * 0.65 +
              Math.abs(Math.cos(frame * 0.15 - i * 0.3)) * 0.35;
            const barH = 16 + wave * 105;
            return (
              <div
                key={i}
                style={{
                  flex: 1,
                  height: barH,
                  borderRadius: 999,
                  background: `linear-gradient(180deg, #FACC15 0%, ${activeBeat.color} 100%)`,
                }}
              />
            );
          })}
        </div>
      </div>

      <SharedAudioAndCaptions {...props} highlightColor="#FACC15" />
    </AbsoluteFill>
  );
};
