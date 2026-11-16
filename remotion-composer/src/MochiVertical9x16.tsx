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
import { HotChar01MochiBlob } from "./CharacterSelectionBoard";
import { HAITRIEU_WORDS } from "./haitrieuCaptions";

export interface MochiVertical9x16Props {
  durationSeconds?: number;
}

const OUTLINE = "#08080A";

// ============================================================================
// SHARED VERTICAL 9:16 CARTOON STAGE (1080x1920)
// ============================================================================
const VerticalMochiStage: React.FC<{
  bgGradient?: string;
  children: React.ReactNode;
}> = ({
  bgGradient = "radial-gradient(circle at 50% 44%, #1E2436 0%, #0E121D 62%, #07090F 100%)",
  children,
}) => {
  return (
    <AbsoluteFill
      style={{
        background: bgGradient,
        overflow: "hidden",
        fontFamily: "'Inter', 'Segoe UI', system-ui, sans-serif",
      }}
    >
      <svg width="1080" height="1920" style={{ position: "absolute", inset: 0 }}>
        {children}

        {/* Top-Center 2D Cartoon Bubble Watermark */}
        <g transform="translate(540, 145)">
          <text
            x="0"
            y="0"
            textAnchor="middle"
            fontSize="48"
            fontWeight="900"
            letterSpacing="3"
            fill="#141824"
            stroke="#F8FAFC"
            strokeWidth="8"
            strokeLinejoin="round"
            paintOrder="stroke fill"
          >
            MOCHI TÂM LÝ
          </text>
        </g>
      </svg>
    </AbsoluteFill>
  );
};

// ============================================================================
// KINETIC CARTOON CAPTIONS (Word-by-word pop in lower-middle safe zone)
// ============================================================================
const MochiKineticCaptions: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const nowSec = frame / fps;

  // Group into chunks of 5 words
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
        left: 64,
        right: 110, // TikTok right icon safe-zone
        bottom: 340, // TikTok bottom caption safe-zone
        display: "flex",
        flexWrap: "wrap",
        justifyContent: "center",
        alignItems: "center",
        gap: "14px 16px",
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
              fontFamily: "'Inter', 'Segoe UI', system-ui, sans-serif",
              fontSize: isCurrent ? 56 : 48,
              fontWeight: 900,
              color: isCurrent ? "#4ADE80" : "#FFFFFF",
              WebkitTextStroke: "10px #08080A",
              paintOrder: "stroke fill",
              textShadow: "0 8px 18px rgba(0,0,0,0.65)",
              transform: isCurrent ? "scale(1.1) translateY(-4px)" : "scale(1)",
              display: "inline-block",
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
// SCENE 01 (0.0s - 5.1s): Mochi Trapped in Flashing Red "SINH TỒN" Battery Cage
// ============================================================================
const Scene01SurvivalCage: React.FC = () => {
  const frame = useCurrentFrame();
  const shake = Math.sin(frame * 0.6) * 5;

  return (
    <VerticalMochiStage bgGradient="radial-gradient(circle at 50% 44%, #351624 0%, #160910 65%, #080406 100%)">
      {/* Puppet Controller at Top */}
      <g transform={`translate(540, 320) rotate(${Math.sin(frame * 0.2) * 6})`}>
        <rect
          x="-280"
          y="-32"
          width="560"
          height="64"
          rx="16"
          fill="#E11D48"
          stroke={OUTLINE}
          strokeWidth="8"
        />
        <line x1="-170" y1="32" x2="-90" y2="420" stroke="#F8FAFC" strokeWidth="5" strokeDasharray="10 8" />
        <line x1="170" y1="32" x2="90" y2="420" stroke="#F8FAFC" strokeWidth="5" strokeDasharray="10 8" />
        <text x="0" y="12" textAnchor="middle" fill="#FFFFFF" fontSize="34" fontWeight="900">
          CHẾ ĐỘ SINH TỒN • BẢN NĂNG
        </text>
      </g>

      <HotChar01MochiBlob
        x={540 + shake}
        y={820}
        scale={2.05}
        mood="scared"
      />
    </VerticalMochiStage>
  );
};

// ============================================================================
// SCENE 02 (5.1s - 7.6s): "Khi tức giận, họ lập tức công kích"
// ============================================================================
const Scene02AngryAttack: React.FC = () => {
  const frame = useCurrentFrame();
  const shake = Math.sin(frame * 0.9) * 8;

  return (
    <VerticalMochiStage bgGradient="radial-gradient(circle at 50% 44%, #45121B 0%, #1C060B 65%, #090304 100%)">
      <HotChar01MochiBlob
        x={440 + shake}
        y={820}
        scale={2.1}
        mood="angry"
      />

      {/* Giant Cartoon Megaphone shooting Red Spikes */}
      <g transform={`translate(${660 + shake}, 770)`}>
        <polygon
          points="0,-30 220,-125 220,75 0,30"
          fill="#FACC15"
          stroke={OUTLINE}
          strokeWidth="8"
          strokeLinejoin="round"
        />
        {[0, 1, 2].map((i) => {
          const ax = 240 + ((frame * 12 + i * 75) % 180);
          const ay = (i - 1) * 70 - 20;
          return (
            <polygon
              key={i}
              points={`${ax},${ay - 22} ${ax + 70},${ay} ${ax},${ay + 22}`}
              fill="#F43F5E"
              stroke={OUTLINE}
              strokeWidth="6"
            />
          );
        })}
      </g>

      <text x="540" y="1220" textAnchor="middle" fill="#FB7185" fontSize="54" fontWeight="900">
        TỨC GIẬN → CÔNG KÍCH!
      </text>
    </VerticalMochiStage>
  );
};

// ============================================================================
// SCENE 03 (7.6s - 10.2s): "Khi sợ hãi, họ tìm cách trốn tránh"
// ============================================================================
const Scene03FearHideBox: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const drop = spring({ frame, fps, config: { damping: 13, stiffness: 120 } });
  const boxY = interpolate(drop, [0, 1], [340, 740]);

  return (
    <VerticalMochiStage bgGradient="radial-gradient(circle at 50% 44%, #152942 0%, #0A1422 65%, #040910 100%)">
      <HotChar01MochiBlob x={540} y={840} scale={2.05} mood="scared" />

      {/* Cardboard Box dropping over Mochi */}
      <g transform={`translate(540, ${boxY})`}>
        <rect
          x="-230"
          y="-170"
          width="460"
          height="320"
          rx="20"
          fill="#D97706"
          stroke={OUTLINE}
          strokeWidth="8"
        />
        <line x1="-230" y1="-85" x2="230" y2="-85" stroke={OUTLINE} strokeWidth="7" />
        <rect x="-95" y="-30" width="190" height="72" rx="14" fill="#08080A" />
        <circle cx="-38" cy="6" r="16" fill="#FFFFFF" />
        <circle cx="38" cy="6" r="16" fill="#FFFFFF" />
        <circle cx="-38" cy="6" r="6" fill="#08080A" />
        <circle cx="38" cy="6" r="6" fill="#08080A" />
      </g>

      <text x="540" y="1220" textAnchor="middle" fill="#7DD3FC" fontSize="54" fontWeight="900">
        SỢ HÃI → TRỐN TRÁNH
      </text>
    </VerticalMochiStage>
  );
};

// ============================================================================
// SCENE 04 (10.2s - 12.8s): "Khi buồn bã, họ quay sang đổ lỗi"
// ============================================================================
const Scene04SadBlame: React.FC = () => {
  const frame = useCurrentFrame();

  return (
    <VerticalMochiStage>
      {/* Rain Cloud above Left Mochi */}
      <g transform="translate(340, 430)">
        <path
          d="M -95 20 Q -115 -30 -60 -42 Q -30 -82 25 -62 Q 80 -75 95 -28 Q 130 -10 100 20 Z"
          fill="#64748B"
          stroke={OUTLINE}
          strokeWidth="7"
        />
      </g>

      <HotChar01MochiBlob x={340} y={820} scale={1.55} mood="angry" />
      <HotChar01MochiBlob x={760} y={840} scale={1.45} mood="scared" />

      {/* Giant Pointing Arrow ("ĐỔ LỖI") */}
      <g transform={`translate(${535 + Math.sin(frame * 0.4) * 14}, 760)`}>
        <rect x="-70" y="-22" width="100" height="44" rx="8" fill="#F43F5E" stroke={OUTLINE} strokeWidth="6" />
        <polygon points="30,-48 95,0 30,48" fill="#F43F5E" stroke={OUTLINE} strokeWidth="6" strokeLinejoin="round" />
      </g>

      <text x="540" y="1220" textAnchor="middle" fill="#FDA4AF" fontSize="54" fontWeight="900">
        BUỒN BÃ → ĐỔ LỖI
      </text>
    </VerticalMochiStage>
  );
};

// ============================================================================
// SCENE 05 (12.8s - 17.5s): "Hiếm khi dừng lại một nhịp để tự hỏi: Tại sao?"
// ============================================================================
const Scene05MagnifyingHeart: React.FC = () => {
  const frame = useCurrentFrame();
  const hover = Math.sin(frame * 0.14) * 12;

  return (
    <VerticalMochiStage bgGradient="radial-gradient(circle at 50% 44%, #1E293B 0%, #0F172A 65%, #060911 100%)">
      <HotChar01MochiBlob x={540} y={820} scale={2.15} mood="default" />

      {/* Giant Magnifying Glass revealing Bandaged Heart + "?" inside Mochi */}
      <g transform={`translate(540, ${840 + hover})`}>
        <circle
          cx="0"
          cy="0"
          r="115"
          fill="#FEF3C7"
          stroke="#F59E0B"
          strokeWidth="14"
        />
        <line x1="82" y1="82" x2="175" y2="175" stroke="#B45309" strokeWidth="26" strokeLinecap="round" />
        <path
          d="M 0 52 C -70 0 -80 -58 -35 -68 C -10 -75 0 -45 0 -45 C 0 -45 10 -75 35 -68 C 80 -58 70 0 0 52 Z"
          fill="#F43F5E"
          stroke={OUTLINE}
          strokeWidth="6"
        />
        <text x="0" y="16" textAnchor="middle" fill="#FFFFFF" fontSize="72" fontWeight="900">
          ?
        </text>
      </g>

      <text x="540" y="1240" textAnchor="middle" fill="#FDE047" fontSize="50" fontWeight="900">
        TẠI SAO MÌNH LẠI ĐAU?
      </text>
    </VerticalMochiStage>
  );
};

// ============================================================================
// SCENE 06 (17.5s - 23.0s): Domino Hurt Contagion (3 Mochis Falling)
// ============================================================================
const Scene06DominoMochis: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const xs = [250, 540, 830];

  return (
    <VerticalMochiStage>
      {xs.map((cx, i) => {
        const p = spring({
          frame: frame - i * 16,
          fps,
          config: { damping: 12, stiffness: 100 },
        });
        const tilt = interpolate(p, [0, 1], [0, i === 2 ? 22 : 34]);
        return (
          <g
            key={i}
            transform={`translate(${cx}, 960) rotate(${tilt}) translate(${-cx}, -960)`}
          >
            <HotChar01MochiBlob
              x={cx}
              y={840}
              scale={1.38}
              mood={i === 0 ? "angry" : "scared"}
            />
          </g>
        );
      })}
      <text x="540" y="1220" textAnchor="middle" fill="#FB7185" fontSize="50" fontWeight="900">
        TRÚT TỔN THƯƠNG LÊN NGƯỜI KHÁC
      </text>
    </VerticalMochiStage>
  );
};

// ============================================================================
// SCENE 07 (23.0s - 29.4s): Mochi Wearing Giant Gold Crown ("CÁI TÔI") + Feather
// ============================================================================
const Scene07CrownedEgoMochi: React.FC = () => {
  const frame = useCurrentFrame();
  const featherX = interpolate(frame, [0, 120], [960, 720], { extrapolateRight: "clamp" });

  return (
    <VerticalMochiStage bgGradient="radial-gradient(circle at 50% 44%, #2E1A47 0%, #140B21 65%, #07040C 100%)">
      <HotChar01MochiBlob x={500} y={850} scale={2.15} mood="default" />

      {/* Giant Golden Crown on Mochi's Head */}
      <g transform="translate(500, 560)">
        <polygon
          points="-125,0 -85,-110 0,-45 85,-110 125,0"
          fill="#FACC15"
          stroke={OUTLINE}
          strokeWidth="8"
          strokeLinejoin="round"
        />
        <text x="0" y="-12" textAnchor="middle" fill={OUTLINE} fontSize="34" fontWeight="900">
          CÁI TÔI
        </text>
      </g>

      {/* Feather touching Mochi */}
      <g transform={`translate(${featherX}, 780) rotate(-25)`}>
        <ellipse cx="0" cy="0" rx="85" ry="26" fill="#F8FAFC" stroke={OUTLINE} strokeWidth="6" />
        <line x1="-95" y1="0" x2="85" y2="0" stroke="#94A3B8" strokeWidth="5" />
      </g>

      <text x="540" y="1220" textAnchor="middle" fill="#FDE047" fontSize="50" fontWeight="900">
        KHI CÁI TÔI BỊ CHẠM TỚI...
      </text>
    </VerticalMochiStage>
  );
};

// ============================================================================
// SCENE 08 (29.4s - 32.0s): "Cơ chế phòng thủ bật lên ngay lập tức!"
// ============================================================================
const Scene08SpikyShieldPop: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const pop = spring({ frame, fps, config: { damping: 10, stiffness: 160 } });

  return (
    <VerticalMochiStage bgGradient="radial-gradient(circle at 50% 44%, #45121B 0%, #19070B 65%, #080304 100%)">
      <g transform={`translate(540, 780) scale(${interpolate(pop, [0, 1], [0.4, 1.05])})`}>
        {Array.from({ length: 12 }).map((_, i) => (
          <g key={i} transform={`rotate(${i * 30})`}>
            <polygon
              points="-34,-210 0,-360 34,-210"
              fill="#F43F5E"
              stroke={OUTLINE}
              strokeWidth="7"
              strokeLinejoin="round"
            />
          </g>
        ))}
        <HotChar01MochiBlob x={0} y={20} scale={1.65} mood="angry" />
      </g>

      <text x="540" y="1230" textAnchor="middle" fill="#FB7185" fontSize="54" fontWeight="900">
        BẬT GAI PHÒNG THỦ!
      </text>
    </VerticalMochiStage>
  );
};

// ============================================================================
// SCENE 09 (32.0s - 35.8s): Mochi Hugging "TÔI ĐÚNG" Trophy with Headphones
// ============================================================================
const Scene09TrophyDefense: React.FC = () => {
  return (
    <VerticalMochiStage>
      <HotChar01MochiBlob x={540} y={800} scale={2.1} mood="default" />

      {/* Giant Noise-Canceling Headphones on Mochi */}
      <g transform="translate(540, 720)">
        <ellipse cx="-185" cy="0" rx="28" ry="52" fill="#E11D48" stroke={OUTLINE} strokeWidth="7" />
        <ellipse cx="185" cy="0" rx="28" ry="52" fill="#E11D48" stroke={OUTLINE} strokeWidth="7" />
      </g>

      {/* Gold Trophy in Front */}
      <g transform="translate(540, 960)">
        <path
          d="M -115 -110 L 115 -110 L 85 30 Q 0 95 -85 30 Z"
          fill="#FACC15"
          stroke={OUTLINE}
          strokeWidth="8"
        />
        <text x="0" y="-25" textAnchor="middle" fill={OUTLINE} fontSize="38" fontWeight="900">
          TÔI ĐÚNG
        </text>
      </g>
    </VerticalMochiStage>
  );
};

// ============================================================================
// SCENE 10 (35.8s - 42.1s): Scale of Comfort vs. Change
// ============================================================================
const Scene10ComfortScale: React.FC = () => {
  const frame = useCurrentFrame();
  const tilt = interpolate(frame, [0, 45], [0, -14], { extrapolateRight: "clamp" });

  return (
    <VerticalMochiStage>
      <g transform="translate(540, 860)">
        <polygon points="-85,180 85,180 0,-20" fill="#64748B" stroke={OUTLINE} strokeWidth="8" />
        <g transform={`rotate(${tilt})`}>
          <line x1="-320" y1="0" x2="320" y2="0" stroke="#F8FAFC" strokeWidth="14" strokeLinecap="round" />
          {/* Left Pan: Mochi on Cozy Pillow ("DỄ CHỊU") */}
          <g transform="translate(-260, -110)">
            <HotChar01MochiBlob x={0} y={0} scale={1.15} mood="default" />
            <rect x="-135" y="130" width="270" height="58" rx="18" fill="#F472B6" stroke={OUTLINE} strokeWidth="6" />
            <text x="0" y="168" textAnchor="middle" fill={OUTLINE} fontSize="30" fontWeight="900">
              DỄ CHỊU
            </text>
          </g>
          {/* Right Pan: Empty "THAY ĐỔI" */}
          <g transform="translate(260, -20)">
            <rect x="-135" y="0" width="270" height="58" rx="18" fill="#38BDF8" stroke={OUTLINE} strokeWidth="6" />
            <text x="0" y="38" textAnchor="middle" fill={OUTLINE} fontSize="30" fontWeight="900">
              THAY ĐỔI
            </text>
          </g>
        </g>
      </g>
    </VerticalMochiStage>
  );
};

// ============================================================================
// SCENE 11 (42.1s - 46.6s): Brick Wall Building Between Two Mochis
// ============================================================================
const Scene11BrickWallMochis: React.FC = () => {
  const frame = useCurrentFrame();
  const rows = Math.min(6, Math.floor(frame / 14) + 1);

  return (
    <VerticalMochiStage>
      <HotChar01MochiBlob x={240} y={840} scale={1.35} mood="angry" />
      <HotChar01MochiBlob x={840} y={840} scale={1.35} mood="scared" />

      <g transform="translate(540, 1020)">
        {Array.from({ length: rows }).map((_, r) => (
          <rect
            key={r}
            x="-95"
            y={-(r + 1) * 70}
            width="190"
            height="64"
            rx="8"
            fill="#E11D48"
            stroke={OUTLINE}
            strokeWidth="7"
          />
        ))}
      </g>

      <text x="540" y="1220" textAnchor="middle" fill="#FDA4AF" fontSize="50" fontWeight="900">
        KHÓ TRÒ CHUYỆN SÂU SẮC
      </text>
    </VerticalMochiStage>
  );
};

// ============================================================================
// SCENE 12 (46.6s - 51.0s): Flower ("Góp ý") -> Ticking Bomb ("Xúc phạm!")
// ============================================================================
const Scene12FlowerToBomb: React.FC = () => {
  const frame = useCurrentFrame();
  const spark = (frame % 10) * 1.6;

  return (
    <VerticalMochiStage>
      {/* Left: Cute Green Plant */}
      <g transform="translate(270, 780)">
        <polygon points="-70,0 70,0 52,110 -52,110" fill="#D97706" stroke={OUTLINE} strokeWidth="7" />
        <line x1="0" y1="0" x2="0" y2="-90" stroke="#22C55E" strokeWidth="10" />
        <ellipse cx="-32" cy="-65" rx="34" ry="18" transform="rotate(-25 -32 -65)" fill="#4ADE80" stroke={OUTLINE} strokeWidth="6" />
        <ellipse cx="32" cy="-82" rx="34" ry="18" transform="rotate(25 32 -82)" fill="#4ADE80" stroke={OUTLINE} strokeWidth="6" />
        <text x="0" y="175" textAnchor="middle" fill="#4ADE80" fontSize="42" fontWeight="900">
          góp ý
        </text>
      </g>

      <path d="M 430 780 L 580 780" stroke="#F8FAFC" strokeWidth="12" strokeLinecap="round" />
      <polygon points="580,752 630,780 580,808" fill="#F8FAFC" />

      {/* Right: Cartoon Bomb */}
      <g transform="translate(800, 780)">
        <path d="M 0 -115 Q 35 -165 80 -145" fill="none" stroke="#FACC15" strokeWidth="8" strokeLinecap="round" />
        <circle cx="84" cy="-145" r={14 + spark} fill="#F43F5E" />
        <circle cx="0" cy="0" r="105" fill="#1E293B" stroke={OUTLINE} strokeWidth="8" />
        <text x="0" y="175" textAnchor="middle" fill="#FB7185" fontSize="42" fontWeight="900">
          xúc phạm!
        </text>
      </g>
    </VerticalMochiStage>
  );
};

// ============================================================================
// SCENE 13 (51.0s - 59.2s): Cracking Royal Mirror Revealing Scared Mochi Inside
// ============================================================================
const Scene13CrackedMirrorEgo: React.FC = () => {
  const frame = useCurrentFrame();
  const doorOpen = interpolate(frame, [45, 110], [0, 175], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  return (
    <VerticalMochiStage bgGradient="radial-gradient(circle at 50% 44%, #2A1B3D 0%, #120B1B 65%, #07040A 100%)">
      <g transform="translate(540, 760)">
        <rect
          x="-280"
          y="-260"
          width="560"
          height="500"
          rx="42"
          fill="#334155"
          stroke="#FACC15"
          strokeWidth="12"
        />
        <rect
          x="-210"
          y="-190"
          width="420"
          height="360"
          rx="28"
          fill="#0F172A"
          stroke={OUTLINE}
          strokeWidth="7"
        />

        {/* Scared Mochi inside */}
        <HotChar01MochiBlob x={0} y={20} scale={1.38} mood="scared" />

        {/* Sliding Armor Doors */}
        <rect
          x={-215 - doorOpen}
          y="-195"
          width="216"
          height="370"
          rx="14"
          fill="#64748B"
          stroke={OUTLINE}
          strokeWidth="8"
        />
        <rect
          x={-1 + doorOpen}
          y="-195"
          width="216"
          height="370"
          rx="14"
          fill="#64748B"
          stroke={OUTLINE}
          strokeWidth="8"
        />
      </g>

      <text x="540" y="1220" textAnchor="middle" fill="#FDE047" fontSize="48" fontWeight="900">
        SỢ HÌNH ẢNH HOÀN HẢO BỊ VỠ
      </text>
    </VerticalMochiStage>
  );
};

// ============================================================================
// SCENE 14 (59.2s - 64.6s): Mochi Steering the Wooden Ship Wheel Over Waves
// ============================================================================
const Scene14ShipHelmMochi: React.FC = () => {
  const frame = useCurrentFrame();
  const rot = Math.sin(frame * 0.08) * 24;

  return (
    <VerticalMochiStage bgGradient="radial-gradient(circle at 50% 44%, #163A5F 0%, #0B1F36 65%, #050E1A 100%)">
      <HotChar01MochiBlob x={540} y={720} scale={2.05} mood="awakened" />

      {/* Ship Steering Wheel */}
      <g transform={`translate(540, 880) rotate(${rot})`}>
        {Array.from({ length: 8 }).map((_, i) => (
          <rect
            key={i}
            x="-10"
            y="-190"
            width="20"
            height="380"
            rx="10"
            transform={`rotate(${i * 45})`}
            fill="#B45309"
            stroke={OUTLINE}
            strokeWidth="6"
          />
        ))}
        <circle cx="0" cy="0" r="130" fill="none" stroke="#D97706" strokeWidth="28" />
        <circle cx="0" cy="0" r="38" fill="#FDE047" stroke={OUTLINE} strokeWidth="6" />
      </g>

      <text x="540" y="1230" textAnchor="middle" fill="#4ADE80" fontSize="50" fontWeight="900">
        KHÔNG ĐỂ CẢM XÚC CẦM LÁI
      </text>
    </VerticalMochiStage>
  );
};

// ============================================================================
// SCENE 15 (64.6s - 70.1s): Mochi Naming Anger & Fear with Warm Lantern
// ============================================================================
const Scene15NamingEmotions: React.FC = () => {
  return (
    <VerticalMochiStage bgGradient="radial-gradient(circle at 50% 44%, #14332B 0%, #0A1B17 65%, #040C0A 100%)">
      <HotChar01MochiBlob x={540} y={760} scale={1.95} mood="awakened" />
      <HotChar01MochiBlob x={230} y={880} scale={1.05} mood="angry" label="biết đang giận" />
      <HotChar01MochiBlob x={850} y={880} scale={1.05} mood="scared" label="biết đang sợ" />
    </VerticalMochiStage>
  );
};

// ============================================================================
// SCENE 16 (70.1s - 76.8s): 3 Cream Cards + Mochi Round Hand Selecting
// ============================================================================
const Scene16ThreeMindfulCards: React.FC = () => {
  const frame = useCurrentFrame();
  const active = frame < 65 ? 0 : frame < 135 ? 1 : 2;
  const handX = interpolate(
    frame,
    [0, 55, 75, 125, 145, 200],
    [220, 220, 540, 540, 860, 860],
    { extrapolateRight: "clamp" }
  );

  const cards = [
    { x: 220, rot: -5, title: "dừng lại", mood: "default" as const },
    { x: 540, rot: 0, title: "quan sát", mood: "awakened" as const },
    { x: 860, rot: 5, title: "đáp trả", mood: "awakened" as const },
  ];

  return (
    <VerticalMochiStage>
      {cards.map((c, idx) => {
        const isSel = idx === active;
        return (
          <g
            key={idx}
            transform={`translate(${c.x}, 760) rotate(${c.rot}) scale(${isSel ? 1.08 : 0.94})`}
          >
            <rect
              x="-145"
              y="-235"
              width="290"
              height="450"
              rx="24"
              fill="#F6F3EA"
              stroke={isSel ? "#4ADE80" : OUTLINE}
              strokeWidth={isSel ? 12 : 7}
            />
            <HotChar01MochiBlob x={0} y={-25} scale={0.92} mood={c.mood} />
            <text
              x="0"
              y="165"
              textAnchor="middle"
              fill={OUTLINE}
              fontSize="38"
              fontWeight="900"
            >
              {c.title}
            </text>
          </g>
        );
      })}

      {/* Cute White Mochi Hand Pointing */}
      <g transform={`translate(${handX}, ${1095 + Math.sin(frame * 0.25) * 8})`}>
        <ellipse
          cx="0"
          cy="0"
          rx="54"
          ry="42"
          fill="#FFFFFF"
          stroke={OUTLINE}
          strokeWidth="7"
        />
      </g>
    </VerticalMochiStage>
  );
};

// ============================================================================
// SCENE 17 (76.8s - 82.3s): 3 Mochis on 3 Growth Steps ("Mỗi người 1 chặng đường")
// ============================================================================
const Scene17GrowthSteps: React.FC = () => {
  return (
    <VerticalMochiStage>
      {/* 3 Rising Green Steps */}
      <rect x="110" y="960" width="260" height="180" rx="14" fill="#334155" stroke={OUTLINE} strokeWidth="7" />
      <rect x="410" y="850" width="260" height="290" rx="14" fill="#1E293B" stroke={OUTLINE} strokeWidth="7" />
      <rect x="710" y="730" width="260" height="410" rx="14" fill="#0F172A" stroke="#4ADE80" strokeWidth="7" />

      <HotChar01MochiBlob x={240} y={810} scale={1.08} mood="scared" />
      <HotChar01MochiBlob x={540} y={700} scale={1.12} mood="default" />
      <HotChar01MochiBlob x={840} y={580} scale={1.18} mood="awakened" />

      <text x="540" y="1225" textAnchor="middle" fill="#6EE7B7" fontSize="48" fontWeight="900">
        MỖI NGƯỜI MỘT CHẶNG TRƯỞNG THÀNH
      </text>
    </VerticalMochiStage>
  );
};

// ============================================================================
// SCENE 18 (82.3s - 90.0s): Sunrise Green Hilltop Finale — Awakened Mochi
// ============================================================================
const Scene18SunriseFinale: React.FC = () => {
  const frame = useCurrentFrame();

  return (
    <VerticalMochiStage bgGradient="linear-gradient(180deg, #0F172A 0%, #1E3A8A 48%, #FACC15 100%)">
      {/* Golden Rising Sun */}
      <circle
        cx="540"
        cy="820"
        r={280 + Math.sin(frame * 0.1) * 12}
        fill="#FEF08A"
        opacity="0.28"
      />
      <circle
        cx="540"
        cy="820"
        r="195"
        fill="#FACC15"
        stroke={OUTLINE}
        strokeWidth="8"
      />

      {/* Green Hilltop */}
      <ellipse
        cx="540"
        cy="1320"
        rx="760"
        ry="360"
        fill="#22C55E"
        stroke={OUTLINE}
        strokeWidth="9"
      />

      {/* Giant Awakened Mochi with Blooming Golden Flower */}
      <HotChar01MochiBlob
        x={540}
        y={840}
        scale={2.25}
        mood="awakened"
      />

      <text
        x="540"
        y="1195"
        textAnchor="middle"
        fill="#FFFFFF"
        stroke={OUTLINE}
        strokeWidth="9"
        paintOrder="stroke fill"
        fontSize="54"
        fontWeight="900"
      >
        ĐỦ TỈNH THỨC → THỰC SỰ TỰ DO
      </text>
    </VerticalMochiStage>
  );
};

// ============================================================================
// MASTER VERTICAL 9:16 COMPOSITION (1080x1920, 90.0s, Haitrieu Voice + Mochi #1)
// ============================================================================
export const MochiScenesLayer: React.FC = () => {
  const { fps } = useVideoConfig();

  const scenes: Array<{
    id: string;
    inSec: number;
    outSec: number;
    Comp: React.FC;
  }> = [
    { id: "m01", inSec: 0.0, outSec: 5.1, Comp: Scene01SurvivalCage },
    { id: "m02", inSec: 5.1, outSec: 7.6, Comp: Scene02AngryAttack },
    { id: "m03", inSec: 7.6, outSec: 10.2, Comp: Scene03FearHideBox },
    { id: "m04", inSec: 10.2, outSec: 12.8, Comp: Scene04SadBlame },
    { id: "m05", inSec: 12.8, outSec: 17.5, Comp: Scene05MagnifyingHeart },
    { id: "m06", inSec: 17.5, outSec: 23.0, Comp: Scene06DominoMochis },
    { id: "m07", inSec: 23.0, outSec: 29.4, Comp: Scene07CrownedEgoMochi },
    { id: "m08", inSec: 29.4, outSec: 32.0, Comp: Scene08SpikyShieldPop },
    { id: "m09", inSec: 32.0, outSec: 35.8, Comp: Scene09TrophyDefense },
    { id: "m10", inSec: 35.8, outSec: 42.1, Comp: Scene10ComfortScale },
    { id: "m11", inSec: 42.1, outSec: 46.6, Comp: Scene11BrickWallMochis },
    { id: "m12", inSec: 46.6, outSec: 51.0, Comp: Scene12FlowerToBomb },
    { id: "m13", inSec: 51.0, outSec: 59.2, Comp: Scene13CrackedMirrorEgo },
    { id: "m14", inSec: 59.2, outSec: 64.6, Comp: Scene14ShipHelmMochi },
    { id: "m15", inSec: 64.6, outSec: 70.1, Comp: Scene15NamingEmotions },
    { id: "m16", inSec: 70.1, outSec: 76.8, Comp: Scene16ThreeMindfulCards },
    { id: "m17", inSec: 76.8, outSec: 82.3, Comp: Scene17GrowthSteps },
    { id: "m18", inSec: 82.3, outSec: 90.0, Comp: Scene18SunriseFinale },
  ];

  return (
    <>
      {scenes.map(({ id, inSec, outSec, Comp }) => {
        const from = Math.round(inSec * fps);
        const dur = Math.max(1, Math.round((outSec - inSec) * fps));
        return (
          <Sequence key={id} from={from} durationInFrames={dur}>
            <Comp />
          </Sequence>
        );
      })}
    </>
  );
};

export const MochiVertical9x16: React.FC<MochiVertical9x16Props> = () => {
  return (
    <AbsoluteFill style={{ backgroundColor: "#07090F" }}>
      <MochiScenesLayer />

      {/* Synchronized Kinetic Word-by-Word Captions */}
      <MochiKineticCaptions />

      {/* 3-Layer Master Audio (Haitrieu Voice + TikTok BGM + Soft 0.20 SFX) */}
      <Audio
        src={staticFile("episodes/reactive-mind/master_mix_haitrieu_90s.wav")}
        volume={1.0}
      />
    </AbsoluteFill>
  );
};

