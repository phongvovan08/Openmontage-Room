import React from "react";
import {
  AbsoluteFill,
  Audio,
  Img,
  Sequence,
  interpolate,
  spring,
  staticFile,
  useCurrentFrame,
  useVideoConfig,
} from "remotion";
import { HAITRIEU_WORDS } from "./haitrieuCaptions";

export interface CrayonDoodle9x16Props {
  durationSeconds?: number;
}

// Non-negotiable visual constants from kaomei/hand-drawn-video-prompts
const PAPER_BG = "#F8F6EF";
const INK_BLACK = "#141413";
const SUNFLOWER_YELLOW = "#FACC15";
const COBALT_BLUE = "#1E40AF";
const TOMATO_RED = "#E11D48";

interface CrayonShotSpec {
  id: string;
  inSec: number;
  outSec: number;
  imageFile: string;
  keyword: string;
  accentColor: string;
  doodleType: "sparks" | "arrows" | "question" | "exclaim" | "stars" | "rays";
}

const CRAYON_SHOTS: CrayonShotSpec[] = [
  {
    id: "shot01",
    inSec: 0.0,
    outSec: 5.1,
    imageFile: "episodes/crayon-doodle/shot_01.png",
    keyword: "MẮC KẸT SINH TỒN",
    accentColor: TOMATO_RED,
    doodleType: "sparks",
  },
  {
    id: "shot02",
    inSec: 5.1,
    outSec: 12.8,
    imageFile: "episodes/crayon-doodle/shot_02.png",
    keyword: "PHẢN XẠ BẢN NĂNG",
    accentColor: SUNFLOWER_YELLOW,
    doodleType: "exclaim",
  },
  {
    id: "shot03",
    inSec: 12.8,
    outSec: 17.5,
    imageFile: "episodes/crayon-doodle/shot_03.png",
    keyword: "QUÊN TỰ HỎI MÌNH",
    accentColor: COBALT_BLUE,
    doodleType: "question",
  },
  {
    id: "shot04",
    inSec: 17.5,
    outSec: 23.0,
    imageFile: "episodes/crayon-doodle/shot_04.png",
    keyword: "HIỆU ỨNG DOMINO",
    accentColor: TOMATO_RED,
    doodleType: "arrows",
  },
  {
    id: "shot05",
    inSec: 23.0,
    outSec: 32.0,
    imageFile: "episodes/crayon-doodle/shot_05.png",
    keyword: "BẬT KHIÊN CÁI TÔI",
    accentColor: TOMATO_RED,
    doodleType: "sparks",
  },
  {
    id: "shot06",
    inSec: 32.0,
    outSec: 42.1,
    imageFile: "episodes/crayon-doodle/shot_06.png",
    keyword: "CÁI TÔI NẶNG HƠN",
    accentColor: SUNFLOWER_YELLOW,
    doodleType: "exclaim",
  },
  {
    id: "shot07",
    inSec: 42.1,
    outSec: 51.0,
    imageFile: "episodes/crayon-doodle/shot_07.png",
    keyword: "BỨC TƯỜNG BẢO THỦ",
    accentColor: COBALT_BLUE,
    doodleType: "sparks",
  },
  {
    id: "shot08",
    inSec: 51.0,
    outSec: 59.2,
    imageFile: "episodes/crayon-doodle/shot_08.png",
    keyword: "ẢO ẢNH HOÀN HẢO",
    accentColor: TOMATO_RED,
    doodleType: "question",
  },
  {
    id: "shot09",
    inSec: 59.2,
    outSec: 64.6,
    imageFile: "episodes/crayon-doodle/shot_09.png",
    keyword: "CẦM LÁI CẢM XÚC",
    accentColor: COBALT_BLUE,
    doodleType: "stars",
  },
  {
    id: "shot10",
    inSec: 64.6,
    outSec: 70.1,
    imageFile: "episodes/crayon-doodle/shot_10.png",
    keyword: "GỌI TÊN CẢM XÚC",
    accentColor: SUNFLOWER_YELLOW,
    doodleType: "stars",
  },
  {
    id: "shot11",
    inSec: 70.1,
    outSec: 76.8,
    imageFile: "episodes/crayon-doodle/shot_11.png",
    keyword: "DỪNG • QUAN SÁT • CHỌN",
    accentColor: COBALT_BLUE,
    doodleType: "arrows",
  },
  {
    id: "shot12",
    inSec: 76.8,
    outSec: 90.0,
    imageFile: "episodes/crayon-doodle/shot_12.png",
    keyword: "BÌNH TĨNH TỈNH THỨC",
    accentColor: SUNFLOWER_YELLOW,
    doodleType: "rays",
  },
];

// ============================================================================
// HAND-DRAWN WAX-CRAYON STOP-MOTION ACCENTS (6fps Stepped Doodle Lines)
// ============================================================================
const CrayonStopMotionAccents: React.FC<{
  doodleType: CrayonShotSpec["doodleType"];
  stepFrame: number;
}> = ({ doodleType, stepFrame }) => {
  const jitterX = (stepFrame % 3 === 0 ? 1 : stepFrame % 3 === 1 ? -1 : 0) * 4;
  const jitterY = (stepFrame % 2 === 0 ? 1 : -1) * 3;
  const pulse = stepFrame % 2 === 0 ? 1.0 : 1.08;

  return (
    <svg
      width="1080"
      height="1920"
      style={{ position: "absolute", inset: 0, pointerEvents: "none" }}
    >
      <g transform={`translate(${jitterX}, ${jitterY})`}>
        {doodleType === "sparks" && (
          <>
            {/* Top-left tomato-red & yellow crayon burst lines */}
            <path
              d="M 145 520 L 95 475 M 130 565 L 72 555 M 175 490 L 155 430"
              stroke={TOMATO_RED}
              strokeWidth="12"
              strokeLinecap="round"
            />
            <path
              d="M 935 520 L 985 475 M 950 565 L 1008 555 M 905 490 L 925 430"
              stroke={SUNFLOWER_YELLOW}
              strokeWidth="12"
              strokeLinecap="round"
            />
          </>
        )}

        {doodleType === "exclaim" && (
          <>
            <g transform={`translate(135, 490) scale(${pulse}) rotate(-12)`}>
              <path
                d="M 0 0 L 0 58"
                stroke={TOMATO_RED}
                strokeWidth="16"
                strokeLinecap="round"
              />
              <circle cx="0" cy="86" r="9" fill={TOMATO_RED} />
            </g>
            <g transform={`translate(945, 490) scale(${pulse}) rotate(12)`}>
              <path
                d="M 0 0 L 0 58"
                stroke={COBALT_BLUE}
                strokeWidth="16"
                strokeLinecap="round"
              />
              <circle cx="0" cy="86" r="9" fill={COBALT_BLUE} />
            </g>
          </>
        )}

        {doodleType === "question" && (
          <>
            <g transform={`translate(145, 485) scale(${pulse}) rotate(-10)`}>
              <path
                d="M -18 -20 C -18 -48, 24 -48, 24 -16 C 24 4, 0 10, 0 32"
                fill="none"
                stroke={COBALT_BLUE}
                strokeWidth="14"
                strokeLinecap="round"
              />
              <circle cx="0" cy="56" r="8" fill={COBALT_BLUE} />
            </g>
            <g transform={`translate(935, 495) scale(${pulse}) rotate(12)`}>
              <path
                d="M -18 -20 C -18 -48, 24 -48, 24 -16 C 24 4, 0 10, 0 32"
                fill="none"
                stroke={TOMATO_RED}
                strokeWidth="14"
                strokeLinecap="round"
              />
              <circle cx="0" cy="56" r="8" fill={TOMATO_RED} />
            </g>
          </>
        )}

        {doodleType === "arrows" && (
          <>
            <path
              d="M 110 475 Q 160 445 205 470 M 182 448 L 208 471 L 178 486"
              fill="none"
              stroke={COBALT_BLUE}
              strokeWidth="11"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
            <path
              d="M 970 475 Q 920 445 875 470 M 898 448 L 872 471 L 902 486"
              fill="none"
              stroke={TOMATO_RED}
              strokeWidth="11"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </>
        )}

        {doodleType === "stars" && (
          <>
            <path
              d="M 140 465 L 152 495 L 182 507 L 152 519 L 140 549 L 128 519 L 98 507 L 128 495 Z"
              fill={SUNFLOWER_YELLOW}
              stroke={INK_BLACK}
              strokeWidth="6"
              strokeLinejoin="round"
              transform={`scale(${pulse})`}
              style={{ transformOrigin: "140px 507px" }}
            />
            <path
              d="M 940 465 L 950 490 L 975 500 L 950 510 L 940 535 L 930 510 L 905 500 L 930 490 Z"
              fill={COBALT_BLUE}
              stroke={INK_BLACK}
              strokeWidth="6"
              strokeLinejoin="round"
              transform={`scale(${pulse})`}
              style={{ transformOrigin: "940px 500px" }}
            />
          </>
        )}

        {doodleType === "rays" && (
          <>
            <path
              d="M 130 480 L 185 505 M 115 535 L 175 545 M 950 480 L 895 505 M 965 535 L 905 545"
              stroke={SUNFLOWER_YELLOW}
              strokeWidth="13"
              strokeLinecap="round"
            />
          </>
        )}
      </g>
    </svg>
  );
};

// ============================================================================
// SINGLE Q-VERSION WAX-CRAYON SHOT (Tactile Paper Cut-Out Stop-Motion)
// ============================================================================
const CrayonShotView: React.FC<{ spec: CrayonShotSpec }> = ({ spec }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  // Paper cutout entry spring (First 0.4s: blank paper -> tactile cutout pop)
  const popProgress = spring({
    frame,
    fps,
    config: { damping: 13, stiffness: 160, mass: 0.7 },
  });

  // 6fps stepped stop-motion frame index (changes every 5 frames @ 30fps)
  const stepFrame = Math.floor(frame / 5);

  // Subtle rigid paper-cutout stop-motion wobble (no camera zoom/drift)
  const paperTiltDeg =
    interpolate(popProgress, [0, 1], [-3.5, 0]) +
    (stepFrame % 4 === 0
      ? 0.65
      : stepFrame % 4 === 1
      ? -0.55
      : stepFrame % 4 === 2
      ? 0.4
      : -0.45);

  const paperShiftY =
    interpolate(popProgress, [0, 1], [36, 0]) +
    (stepFrame % 2 === 0 ? -3.5 : 3.5);

  const paperScale = interpolate(popProgress, [0, 1], [0.88, 1.0]);

  // Keyword hand-drawn underline reveal
  const lineReveal = interpolate(frame, [2, 14], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  return (
    <AbsoluteFill style={{ backgroundColor: PAPER_BG }}>
      {/* Central 9:16 Q-Version Wax-Crayon Illustration */}
      <div
        style={{
          position: "absolute",
          top: 0,
          left: 0,
          width: 1080,
          height: 1920,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          transform: `translateY(${paperShiftY}px) scale(${paperScale}) rotate(${paperTiltDeg}deg)`,
          transformOrigin: "center center",
        }}
      >
        <Img
          src={staticFile(spec.imageFile)}
          style={{
            width: "100%",
            height: "100%",
            objectFit: "cover",
            WebkitMaskImage:
              "radial-gradient(ellipse 52% 52% at 50% 50%, #000 84%, transparent 100%)",
            maskImage:
              "radial-gradient(ellipse 52% 52% at 50% 50%, #000 84%, transparent 100%)",
          }}
        />
      </div>

      {/* Top Safe-Zone On-Paper Hand-Drawn Keyword (No boxes/cards per SKILL.md) */}
      <div
        style={{
          position: "absolute",
          top: 205,
          left: 80,
          right: 80,
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          pointerEvents: "none",
          zIndex: 10,
        }}
      >
        <div
          style={{
            fontFamily: "'Segoe Print', 'Comic Sans MS', 'Inter', system-ui, sans-serif",
            fontSize: 54,
            fontWeight: 900,
            color: INK_BLACK,
            letterSpacing: "2px",
            textAlign: "center",
            lineHeight: 1.15,
            transform: "rotate(-1deg)",
          }}
        >
          {spec.keyword}
        </div>

        {/* Wax-Crayon Hand-Drawn Underline Stroke directly on #F8F6EF paper */}
        <svg
          width="520"
          height="36"
          viewBox="0 0 520 36"
          style={{ marginTop: 4, overflow: "visible" }}
        >
          <path
            d={`M 30 16 Q 260 6 ${30 + 460 * lineReveal} 18`}
            fill="none"
            stroke={spec.accentColor}
            strokeWidth="14"
            strokeLinecap="round"
            opacity={0.9}
          />
          <path
            d={`M 55 24 Q 260 28 ${55 + 410 * lineReveal} 22`}
            fill="none"
            stroke={INK_BLACK}
            strokeWidth="4.5"
            strokeLinecap="round"
          />
        </svg>
      </div>

      {/* 6fps Stop-Motion Crayon Doodle Accents */}
      <CrayonStopMotionAccents doodleType={spec.doodleType} stepFrame={stepFrame} />
    </AbsoluteFill>
  );
};

// ============================================================================
// DETERMINISTIC BOTTOM SAFE-ZONE SUBTITLES (Direct on #F8F6EF Paper)
// ============================================================================
const CrayonPaperCaptions: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const nowSec = frame / fps;

  const chunkSize = 5;
  let activeChunkIdx = -1;
  let activeWordIdx = -1;

  for (let i = 0; i < HAITRIEU_WORDS.length; i++) {
    const w = HAITRIEU_WORDS[i];
    const nextStart =
      i + 1 < HAITRIEU_WORDS.length ? HAITRIEU_WORDS[i + 1].start : w.end + 0.35;
    if (nowSec >= w.start - 0.06 && nowSec <= Math.max(w.end + 0.15, nextStart)) {
      activeWordIdx = i;
      activeChunkIdx = Math.floor(i / chunkSize);
      break;
    }
  }

  if (activeChunkIdx < 0) return null;

  const chunkWords = HAITRIEU_WORDS.slice(
    activeChunkIdx * chunkSize,
    (activeChunkIdx + 1) * chunkSize
  );

  return (
    <div
      style={{
        position: "absolute",
        left: 72,
        right: 96,
        bottom: 285, // Reserved lower safe-zone on #F8F6EF paper
        display: "flex",
        flexWrap: "wrap",
        justifyContent: "center",
        alignItems: "center",
        gap: "12px 16px",
        pointerEvents: "none",
      }}
    >
      {chunkWords.map((item, idx) => {
        const globalIdx = activeChunkIdx * chunkSize + idx;
        const isCurrent = globalIdx === activeWordIdx;
        return (
          <span
            key={globalIdx}
            style={{
              position: "relative",
              fontFamily: "'Inter', 'Segoe UI', system-ui, sans-serif",
              fontSize: isCurrent ? 52 : 46,
              fontWeight: 900,
              color: isCurrent ? TOMATO_RED : INK_BLACK,
              backgroundColor: isCurrent ? SUNFLOWER_YELLOW : "transparent",
              padding: isCurrent ? "4px 14px" : "4px 6px",
              borderRadius: isCurrent ? "10px" : "0px",
              border: isCurrent ? `4px solid ${INK_BLACK}` : "none",
              boxShadow: isCurrent ? `4px 4px 0px ${INK_BLACK}` : "none",
              transform: isCurrent ? "scale(1.06) rotate(-1.5deg)" : "scale(1)",
              display: "inline-block",
              lineHeight: 1.2,
            }}
          >
            {item.word}
          </span>
        );
      })}
    </div>
  );
};

// ============================================================================
// MASTER COMPOSITION: CrayonDoodle9x16 (1080x1920, 90.0s, #F8F6EF Crayon Style)
// ============================================================================
export const CrayonDoodle9x16: React.FC<CrayonDoodle9x16Props> = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const stepSeed = Math.floor(frame / 5) % 10;

  return (
    <AbsoluteFill style={{ backgroundColor: PAPER_BG, overflow: "hidden" }}>
      {/* Global SVG Filters for Hand-Drawn Crayon Line-Boil & Subtle Paper Grain */}
      <svg width="0" height="0" style={{ position: "absolute" }}>
        <defs>
          <filter id="crayon-line-boil" x="-5%" y="-5%" width="110%" height="110%">
            <feTurbulence
              type="fractalNoise"
              baseFrequency="0.03"
              numOctaves="2"
              seed={stepSeed}
              result="noise"
            />
            <feDisplacementMap
              in="SourceGraphic"
              in2="noise"
              scale="2.2"
              xChannelSelector="R"
              yChannelSelector="G"
            />
          </filter>

          <filter id="crayon-rough-filter" x="-10%" y="-10%" width="120%" height="120%">
            <feTurbulence
              type="fractalNoise"
              baseFrequency="0.08"
              numOctaves="3"
              seed={stepSeed + 20}
              result="crayonNoise"
            />
            <feDisplacementMap
              in="SourceGraphic"
              in2="crayonNoise"
              scale="3.8"
              xChannelSelector="R"
              yChannelSelector="G"
            />
          </filter>

          <filter id="paper-grain-overlay">
            <feTurbulence
              type="fractalNoise"
              baseFrequency="0.65"
              numOctaves="3"
              result="fineGrain"
            />
            <feColorMatrix
              type="matrix"
              values="0 0 0 0 0.35  0 0 0 0 0.32  0 0 0 0 0.25  0 0 0 0.035 0"
            />
          </filter>
        </defs>
      </svg>

      {/* Shot Sequences */}
      {CRAYON_SHOTS.map((spec) => {
        const from = Math.round(spec.inSec * fps);
        const dur = Math.max(1, Math.round((spec.outSec - spec.inSec) * fps));
        return (
          <Sequence key={spec.id} from={from} durationInFrames={dur}>
            <CrayonShotView spec={spec} />
          </Sequence>
        );
      })}

      {/* Small Hand-Drawn Top Watermark Tag directly on paper */}
      <div
        style={{
          position: "absolute",
          top: 118,
          left: 0,
          right: 0,
          textAlign: "center",
          fontFamily: "'Inter', system-ui, sans-serif",
          fontSize: 28,
          fontWeight: 800,
          letterSpacing: "3px",
          color: COBALT_BLUE,
          opacity: 0.85,
          pointerEvents: "none",
        }}
      >
        SỔ TAY TÂM LÝ • Q-DOODLE
      </div>

      {/* Deterministic Bottom Safe-Zone Captions */}
      <CrayonPaperCaptions />

      {/* 3-Layer Master Audio (Haitrieu 90s Voiceover + BGM + Soft 0.20 SFX) */}
      <Audio
        src={staticFile("episodes/reactive-mind/master_mix_haitrieu_90s.wav")}
        volume={1.0}
      />
    </AbsoluteFill>
  );
};
