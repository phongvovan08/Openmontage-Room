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
import { CaptionOverlay, WordCaption } from "./components/CaptionOverlay";

export interface ReactiveMindAtelierProps {
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

// Deterministic pseudo-random helper (0..1)
const seeded = (seed: number): number => {
  const x = Math.sin(seed * 12.9898 + 78.233) * 43758.5453;
  return x - Math.floor(x);
};

// Shared subtle architectural lab backdrop ( changes hue per chapter )
const AtelierBackdrop: React.FC<{
  primaryGlow: string;
  secondaryGlow: string;
  chapterCode: string;
  chapterTitle: string;
  timecodeSec: number;
}> = ({ primaryGlow, secondaryGlow, chapterCode, chapterTitle, timecodeSec }) => {
  const mins = Math.floor(timecodeSec / 60);
  const secs = Math.floor(timecodeSec % 60);
  const ms = Math.floor((timecodeSec % 1) * 100);
  const tc = `${String(mins).padStart(2, "0")}:${String(secs).padStart(2, "0")}.${String(ms).padStart(2, "0")}`;

  return (
    <AbsoluteFill
      style={{
        backgroundColor: "#060913",
        overflow: "hidden",
        fontFamily: "'Inter', 'Segoe UI', system-ui, sans-serif",
      }}
    >
      <style>
        {`
          svg text {
            font-family: 'Inter', 'Segoe UI', system-ui, sans-serif;
          }
        `}
      </style>
      {/* Radial ambient light fields */}
      <div
        style={{
          position: "absolute",
          inset: 0,
          background: `radial-gradient(circle at 22% 28%, ${primaryGlow}22 0%, transparent 55%), radial-gradient(circle at 78% 72%, ${secondaryGlow}1E 0%, transparent 60%)`,
        }}
      />

      {/* Precision SVG Blueprint Grid */}
      <svg
        width="1920"
        height="1080"
        style={{ position: "absolute", inset: 0, opacity: 0.16 }}
      >
        <defs>
          <pattern
            id="atelierGrid"
            width="60"
            height="60"
            patternUnits="userSpaceOnUse"
          >
            <path
              d="M 60 0 L 0 0 0 60"
              fill="none"
              stroke="#475569"
              strokeWidth="0.7"
            />
          </pattern>
          <pattern
            id="atelierSubGrid"
            width="300"
            height="300"
            patternUnits="userSpaceOnUse"
          >
            <rect width="300" height="300" fill="url(#atelierGrid)" />
            <path
              d="M 300 0 L 0 0 0 300"
              fill="none"
              stroke="#94A3B8"
              strokeWidth="1.2"
            />
          </pattern>
        </defs>
        <rect width="1920" height="1080" fill="url(#atelierSubGrid)" />
      </svg>

      {/* Top Telemetry Header Bar */}
      <div
        style={{
          position: "absolute",
          top: 34,
          left: 56,
          right: 56,
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          borderBottom: "1px solid rgba(148, 163, 184, 0.18)",
          paddingBottom: 14,
          zIndex: 10,
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
          <div
            style={{
              width: 10,
              height: 10,
              borderRadius: "50%",
              backgroundColor: primaryGlow,
              boxShadow: `0 0 12px ${primaryGlow}`,
            }}
          />
          <span
            style={{
              fontFamily: "'JetBrains Mono', monospace",
              fontSize: 15,
              letterSpacing: 2.5,
              color: primaryGlow,
              fontWeight: 700,
            }}
          >
            {chapterCode}
          </span>
          <span style={{ color: "rgba(148,163,184,0.45)", fontSize: 15 }}>|</span>
          <span
            style={{
              fontSize: 16,
              letterSpacing: 1.2,
              color: "#E2E8F0",
              fontWeight: 600,
              textTransform: "uppercase",
            }}
          >
            {chapterTitle}
          </span>
        </div>

        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: 22,
            fontFamily: "'JetBrains Mono', monospace",
            fontSize: 14,
            color: "#94A3B8",
            letterSpacing: 1.5,
          }}
        >
          <span>ATELIER BESPOKE ENGINE · ZERO-STOCK</span>
          <span
            style={{
              padding: "4px 10px",
              borderRadius: 6,
              backgroundColor: "rgba(15, 23, 42, 0.8)",
              border: "1px solid rgba(148, 163, 184, 0.25)",
              color: "#F8FAFC",
            }}
          >
            TC {tc}
          </span>
        </div>
      </div>
    </AbsoluteFill>
  );
};

// ============================================================================
// SCENE 1 (0.0s - 4.1s): NEURAL HIJACK MAP (Amygdala Hijack vs Prefrontal Cortex)
// ============================================================================
const Scene01NeuralHijack: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const enter = spring({ frame, fps, config: { damping: 16, stiffness: 90 } });
  const pulse = Math.sin(frame * 0.28) * 0.5 + 0.5;
  const hijackProgress = interpolate(frame, [10, 65], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });
  const severGate = interpolate(frame, [35, 75], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  return (
    <AbsoluteFill>
      <AtelierBackdrop
        primaryGlow="#EF4444"
        secondaryGlow="#F59E0B"
        chapterCode="CƠ CHẾ 01 // NEURAL HIJACK"
        chapterTitle="Trạng Thái Sinh Tồn & Chiếm Quyền Thần Kinh"
        timecodeSec={frame / fps}
      />

      <AbsoluteFill
        style={{
          justifyContent: "center",
          alignItems: "center",
          paddingBottom: 90,
        }}
      >
        <svg width="1680" height="780" viewBox="0 0 1680 780">
          <defs>
            <radialGradient id="amygdalaFire" cx="50%" cy="50%" r="50%">
              <stop offset="0%" stopColor="#EF4444" stopOpacity="0.85" />
              <stop offset="55%" stopColor="#DC2626" stopOpacity="0.28" />
              <stop offset="100%" stopColor="#7F1D1D" stopOpacity="0" />
            </radialGradient>
            <linearGradient id="hijackBeam" x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="0%" stopColor="#F59E0B" />
              <stop offset="50%" stopColor="#EF4444" />
              <stop offset="100%" stopColor="#F43F5E" />
            </linearGradient>
          </defs>

          {/* Upper Bridge (Prefrontal Cortex - Rational Path - BLOCKED) */}
          <path
            d="M 338 380 C 560 150, 960 150, 1340 360"
            fill="none"
            stroke="#38BDF8"
            strokeWidth="3.5"
            strokeDasharray="10 10"
            opacity={1 - severGate * 0.68}
          />

          {/* Lower Short-Circuit Arc (Amygdala Survival Path - ACTIVE) */}
          <path
            d="M 338 430 C 540 560, 650 565, 820 540 C 1020 515, 1180 470, 1335 425"
            fill="none"
            stroke="url(#hijackBeam)"
            strokeWidth="9"
            strokeLinecap="round"
            strokeDasharray="1200"
            strokeDashoffset={1200 * (1 - hijackProgress)}
          />

          {/* Travelling high-speed electrical sparks along Amygdala arc */}
          {[0, 1, 2, 3, 4].map((idx) => {
            const t = ((frame * 0.035 + idx * 0.2) % 1) * hijackProgress;
            const x = 338 + t * 992;
            const y = 430 + Math.sin(t * Math.PI) * 115;
            return (
              <circle
                key={idx}
                cx={x}
                cy={y}
                r={7 + (idx % 2) * 3}
                fill="#FEF08A"
              />
            );
          })}

          {/* Left Node: External Trigger */}
          <g
            transform={`translate(250, 410) scale(${interpolate(enter, [0, 1], [0.7, 1])})`}
          >
            <circle
              r="96"
              fill="#0F172A"
              stroke="#F59E0B"
              strokeWidth="3.5"
              strokeDasharray="8 6"
            />
            <circle r={76 + pulse * 8} fill="rgba(245, 158, 11, 0.14)" />
            <text
              y="-16"
              textAnchor="middle"
              fill="#FBBF24"
              fontSize="15"
              fontWeight="700"
              letterSpacing="2"
            >
              KÍCH THÍCH
            </text>
            <text
              y="14"
              textAnchor="middle"
              fill="#F8FAFC"
              fontSize="21"
              fontWeight="800"
            >
              NGOẠI CẢNH
            </text>
            <text
              y="40"
              textAnchor="middle"
              fill="#94A3B8"
              fontSize="13"
            >
              Lời nói · Áp lực · Va chạm
            </text>
          </g>

          {/* Prefrontal Cortex Node (Dimmed / Locked out) */}
          <g
            transform="translate(820, 185)"
            opacity={interpolate(severGate, [0, 1], [0.95, 0.42])}
          >
            <rect
              x="-215"
              y="-62"
              width="430"
              height="124"
              rx="18"
              fill="#0F172A"
              stroke="#38BDF8"
              strokeWidth="2.5"
            />
            <text
              y="-18"
              textAnchor="middle"
              fill="#38BDF8"
              fontSize="14"
              fontWeight="700"
              letterSpacing="1.8"
            >
              VỎ NÃO TRƯỚC TRÁN (PREFRONTAL CORTEX)
            </text>
            <text
              y="14"
              textAnchor="middle"
              fill="#E2E8F0"
              fontSize="21"
              fontWeight="700"
            >
              Tư Duy Phân Tích & Tỉnh Thức
            </text>
            <text y="42" textAnchor="middle" fill="#94A3B8" fontSize="14">
              Độ trễ xử lý: ~0.50 giây (Bị ngắt kết nối)
            </text>
          </g>

          {/* Red X Sever Gate on Upper Path */}
          {severGate > 0.05 && (
            <g
              transform={`translate(530, 235) scale(${severGate})`}
            >
              <circle r="34" fill="#450A0A" stroke="#EF4444" strokeWidth="3" />
              <path
                d="M -14 -14 L 14 14 M 14 -14 L -14 14"
                stroke="#FCA5A5"
                strokeWidth="4.5"
                strokeLinecap="round"
              />
              <text
                y="56"
                textAnchor="middle"
                fill="#FCA5A5"
                fontSize="13"
                fontWeight="700"
              >
                NGẮT MẠCH LÝ TRÍ
              </text>
            </g>
          )}

          {/* Center-Bottom Node: AMYGDALA (Survival Core) */}
          <g transform="translate(820, 535)">
            <circle r={155 + pulse * 22} fill="url(#amygdalaFire)" />
            <circle
              r="112"
              fill="#1F090D"
              stroke="#EF4444"
              strokeWidth="4.5"
            />
            <circle
              r={124 + pulse * 8}
              fill="none"
              stroke="#F87171"
              strokeWidth="1.8"
              strokeDasharray="12 8"
            />
            <text
              y="-24"
              textAnchor="middle"
              fill="#FCA5A5"
              fontSize="13"
              fontWeight="700"
              letterSpacing="1.5"
            >
              HẠCH HẠNH NHÂN (0.02s)
            </text>
            <text
              y="8"
              textAnchor="middle"
              fill="#FFFFFF"
              fontSize="22"
              fontWeight="800"
            >
              CHẾ ĐỘ SINH TỒN
            </text>
            <text
              y="36"
              textAnchor="middle"
              fill="#F87171"
              fontSize="14"
              fontWeight="600"
            >
              Chiếm quyền điều khiển
            </text>
          </g>

          {/* Right Output Node: Instinctive Reaction */}
          <g
            transform={`translate(1430, 410) scale(${interpolate(
              hijackProgress,
              [0.5, 1],
              [0.85, 1],
              { extrapolateLeft: "clamp", extrapolateRight: "clamp" }
            )})`}
          >
            <polygon
              points="0,-122 112,-60 112,60 0,122 -112,60 -112,-60"
              fill="#2A0A12"
              stroke="#F43F5E"
              strokeWidth="4"
            />
            <text
              y="-22"
              textAnchor="middle"
              fill="#FDA4AF"
              fontSize="14"
              fontWeight="700"
              letterSpacing="1.5"
            >
              HÀNH XỬ TỨC THÌ
            </text>
            <text
              y="10"
              textAnchor="middle"
              fill="#FFFFFF"
              fontSize="20"
              fontWeight="800"
            >
              PHẢN XẠ BẢN NĂNG
            </text>
            <text
              y="38"
              textAnchor="middle"
              fill="#FB7185"
              fontSize="13"
              fontWeight="600"
            >
              100% Dẫn dắt bởi cảm xúc
            </text>
          </g>
        </svg>
      </AbsoluteFill>
    </AbsoluteFill>
  );
};

// ============================================================================
// SCENE 2 (4.1s - 10.1s): TRIAD REFLEX CHAMBERS (Anger / Fear / Hurt)
// ============================================================================
const Scene02TriadReflex: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  // Sub-beats synchronized with narration:
  // 0.0s (4.1s abs): Tức giận -> Tấn công
  // 1.9s (6.0s abs): Sợ hãi -> Né tránh
  // 3.7s (7.8s abs): Tổn thương -> Trút lên người khác
  const c1 = spring({ frame: frame - 2, fps, config: { damping: 14, stiffness: 100 } });
  const c2 = spring({ frame: frame - 55, fps, config: { damping: 14, stiffness: 100 } });
  const c3 = spring({ frame: frame - 108, fps, config: { damping: 14, stiffness: 100 } });

  return (
    <AbsoluteFill>
      <AtelierBackdrop
        primaryGlow="#F43F5E"
        secondaryGlow="#6366F1"
        chapterCode="CƠ CHẾ 02 // TRIAD REFLEX"
        chapterTitle="Ba Phản Xạ Tự Động Khi Chưa Tỉnh Thức"
        timecodeSec={4.1 + frame / fps}
      />

      <div
        style={{
          position: "absolute",
          top: 108,
          left: 60,
          right: 60,
          bottom: 140,
          display: "grid",
          gridTemplateColumns: "1fr 1fr 1fr",
          gap: 32,
          alignItems: "stretch",
        }}
      >
        {/* CHAMBER 1: ANGER -> ATTACK */}
        <div
          style={{
            backgroundColor: "rgba(15, 23, 42, 0.86)",
            border: `2px solid rgba(239, 68, 68, ${0.25 + c1 * 0.65})`,
            borderRadius: 24,
            padding: 32,
            display: "flex",
            flexDirection: "column",
            justifyContent: "space-between",
            transform: `translateY(${(1 - c1) * 45}px)`,
            opacity: c1,
            boxShadow: `0 20px 50px rgba(239, 68, 68, ${c1 * 0.18})`,
          }}
        >
          <div>
            <div
              style={{
                fontFamily: "'JetBrains Mono', monospace",
                color: "#F87171",
                fontSize: 15,
                fontWeight: 700,
                letterSpacing: 2,
              }}
            >
              PHẢN XẠ 01 · FIGHT MODE
            </div>
            <div
              style={{
                color: "#FFFFFF",
                fontSize: 34,
                fontWeight: 800,
                marginTop: 8,
              }}
            >
              KHI TỨC GIẬN
            </div>
          </div>

          {/* Kinetic Spike Burst SVG */}
          <svg width="100%" height="290" viewBox="0 0 400 290">
            <g transform="translate(200, 145)">
              {Array.from({ length: 16 }).map((_, i) => {
                const angle = (i * Math.PI * 2) / 16;
                const burst =
                  65 +
                  c1 * 48 +
                  Math.sin(frame * 0.35 + i) * 14 * c1;
                const x2 = Math.cos(angle) * burst;
                const y2 = Math.sin(angle) * burst;
                return (
                  <line
                    key={i}
                    x1={Math.cos(angle) * 28}
                    y1={Math.sin(angle) * 28}
                    x2={x2}
                    y2={y2}
                    stroke={i % 2 === 0 ? "#EF4444" : "#F59E0B"}
                    strokeWidth={i % 2 === 0 ? "5" : "3"}
                    strokeLinecap="round"
                  />
                );
              })}
              <circle r="42" fill="#450A0A" stroke="#EF4444" strokeWidth="4" />
              <text
                y="6"
                textAnchor="middle"
                fill="#FCA5A5"
                fontSize="16"
                fontWeight="800"
              >
                BÙNG NỔ
              </text>
            </g>
          </svg>

          <div
            style={{
              backgroundColor: "rgba(239, 68, 68, 0.15)",
              borderLeft: "4px solid #EF4444",
              padding: "16px 20px",
              borderRadius: 12,
            }}
          >
            <div style={{ color: "#FCA5A5", fontSize: 14, fontWeight: 700 }}>
              HÀNH VI TỰ ĐỘNG:
            </div>
            <div style={{ color: "#FFFFFF", fontSize: 26, fontWeight: 800, marginTop: 4 }}>
              → LẬP TỨC TẤN CÔNG
            </div>
          </div>
        </div>

        {/* CHAMBER 2: FEAR -> AVOID */}
        <div
          style={{
            backgroundColor: "rgba(15, 23, 42, 0.86)",
            border: `2px solid rgba(56, 189, 248, ${0.2 + c2 * 0.65})`,
            borderRadius: 24,
            padding: 32,
            display: "flex",
            flexDirection: "column",
            justifyContent: "space-between",
            transform: `translateY(${(1 - c2) * 45}px)`,
            opacity: Math.max(0.18, c2),
            boxShadow: `0 20px 50px rgba(56, 189, 248, ${c2 * 0.18})`,
          }}
        >
          <div>
            <div
              style={{
                fontFamily: "'JetBrains Mono', monospace",
                color: "#38BDF8",
                fontSize: 15,
                fontWeight: 700,
                letterSpacing: 2,
              }}
            >
              PHẢN XẠ 02 · FLIGHT MODE
            </div>
            <div
              style={{
                color: "#FFFFFF",
                fontSize: 34,
                fontWeight: 800,
                marginTop: 8,
              }}
            >
              KHI SỢ HÃI
            </div>
          </div>

          {/* Contracting Concentric Vault SVG */}
          <svg width="100%" height="290" viewBox="0 0 400 290">
            <g transform="translate(200, 145)">
              {[115, 88, 62, 38].map((r, idx) => {
                const shrink = interpolate(c2, [0, 1], [1.25, 0.82]);
                return (
                  <circle
                    key={idx}
                    r={r * shrink}
                    fill="none"
                    stroke="#38BDF8"
                    strokeWidth={3 - idx * 0.4}
                    strokeDasharray={idx % 2 === 0 ? "18 10" : "none"}
                    opacity={0.35 + idx * 0.18}
                    transform={`rotate(${frame * (idx % 2 === 0 ? 1.2 : -1.2)})`}
                  />
                );
              })}
              <rect
                x="-26"
                y="-26"
                width="52"
                height="52"
                rx="10"
                fill="#082F49"
                stroke="#7DD3FC"
                strokeWidth="3"
              />
              <text
                y="5"
                textAnchor="middle"
                fill="#BAE6FD"
                fontSize="13"
                fontWeight="800"
              >
                THU MÌNH
              </text>
            </g>
          </svg>

          <div
            style={{
              backgroundColor: "rgba(56, 189, 248, 0.15)",
              borderLeft: "4px solid #38BDF8",
              padding: "16px 20px",
              borderRadius: 12,
            }}
          >
            <div style={{ color: "#7DD3FC", fontSize: 14, fontWeight: 700 }}>
              HÀNH VI TỰ ĐỘNG:
            </div>
            <div style={{ color: "#FFFFFF", fontSize: 26, fontWeight: 800, marginTop: 4 }}>
              → CO RÚT & NÉ TRÁNH
            </div>
          </div>
        </div>

        {/* CHAMBER 3: HURT -> SPILL OVER */}
        <div
          style={{
            backgroundColor: "rgba(15, 23, 42, 0.86)",
            border: `2px solid rgba(168, 85, 247, ${0.2 + c3 * 0.65})`,
            borderRadius: 24,
            padding: 32,
            display: "flex",
            flexDirection: "column",
            justifyContent: "space-between",
            transform: `translateY(${(1 - c3) * 45}px)`,
            opacity: Math.max(0.18, c3),
            boxShadow: `0 20px 50px rgba(168, 85, 247, ${c3 * 0.18})`,
          }}
        >
          <div>
            <div
              style={{
                fontFamily: "'JetBrains Mono', monospace",
                color: "#C084FC",
                fontSize: 15,
                fontWeight: 700,
                letterSpacing: 2,
              }}
            >
              PHẢN XẠ 03 · DISPLACEMENT
            </div>
            <div
              style={{
                color: "#FFFFFF",
                fontSize: 34,
                fontWeight: 800,
                marginTop: 8,
              }}
            >
              KHI TỔN THƯƠNG
            </div>
          </div>

          {/* Overflowing Fractured Vessel SVG */}
          <svg width="100%" height="290" viewBox="0 0 400 290">
            <g transform="translate(200, 145)">
              {[0, 1, 2].map((ring) => {
                const prog = ((frame * 0.025 + ring * 0.33) % 1) * c3;
                return (
                  <circle
                    key={ring}
                    r={30 + prog * 95}
                    fill="none"
                    stroke="#C084FC"
                    strokeWidth={3.5 * (1 - prog)}
                    opacity={1 - prog}
                  />
                );
              })}
              <circle r="38" fill="#3B0764" stroke="#C084FC" strokeWidth="3.5" />
              <path
                d="M -14 -28 L 0 -5 L -8 10 L 10 32"
                fill="none"
                stroke="#F0ABFC"
                strokeWidth="3"
              />
            </g>
          </svg>

          <div
            style={{
              backgroundColor: "rgba(168, 85, 247, 0.15)",
              borderLeft: "4px solid #C084FC",
              padding: "16px 20px",
              borderRadius: 12,
            }}
          >
            <div style={{ color: "#E9D5FF", fontSize: 14, fontWeight: 700 }}>
              HÀNH VI TỰ ĐỘNG:
            </div>
            <div style={{ color: "#FFFFFF", fontSize: 26, fontWeight: 800, marginTop: 4 }}>
              → TRÚT LÊN NGƯỜI KHÁC
            </div>
          </div>
        </div>
      </div>
    </AbsoluteFill>
  );
};

// ============================================================================
// SCENE 3 (10.1s - 13.5s): THE MISSING PAUSE OSCILLOSCOPE
// ============================================================================
const Scene03MissingPause: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const lensScale = spring({
    frame: frame - 14,
    fps,
    config: { damping: 14, stiffness: 85 },
  });

  // Generate oscilloscope path that flattens inside the pause lens
  const points: string[] = [];
  for (let x = 120; x <= 1800; x += 12) {
    const distFromCenter = Math.abs(x - 960);
    const inLens = distFromCenter < 250;
    const damp = inLens
      ? interpolate(lensScale, [0, 1], [1, 0.08])
      : 1;
    const amp =
      (Math.sin((x + frame * 14) * 0.045) * 95 +
        Math.cos((x - frame * 9) * 0.09) * 55) *
      damp;
    const y = 450 + amp;
    points.push(`${x},${y.toFixed(1)}`);
  }

  return (
    <AbsoluteFill>
      <AtelierBackdrop
        primaryGlow="#38BDF8"
        secondaryGlow="#FACC15"
        chapterCode="CƠ CHẾ 03 // SELF-INQUIRY GAP"
        chapterTitle="Khoảng Dừng Tự Vấn Bị Bỏ Quên"
        timecodeSec={10.1 + frame / fps}
      />

      <svg width="1920" height="1080" style={{ position: "absolute", inset: 0 }}>
        {/* Baseline */}
        <line
          x1="120"
          y1="450"
          x2="1800"
          y2="450"
          stroke="rgba(148, 163, 184, 0.25)"
          strokeWidth="2"
          strokeDasharray="8 8"
        />

        {/* Chaotic Emotional Waveform */}
        <polyline
          fill="none"
          stroke="#38BDF8"
          strokeWidth="4.5"
          points={points.join(" ")}
        />

        {/* Center Magnifying Inspection Portal */}
        <g transform={`translate(960, 450) scale(${lensScale})`}>
          <circle
            r="250"
            fill="rgba(6, 15, 32, 0.90)"
            stroke="#FACC15"
            strokeWidth="4"
          />
          <circle
            r="268"
            fill="none"
            stroke="#38BDF8"
            strokeWidth="1.5"
            strokeDasharray="14 10"
          />
          <text
            y="-120"
            textAnchor="middle"
            fill="#FACC15"
            fontSize="16"
            fontWeight="700"
            letterSpacing="3"
          >
            NHỊP DỪNG 1 GIÂY HIẾM HOI
          </text>
          <text
            y="-40"
            textAnchor="middle"
            fill="#FFFFFF"
            fontSize="31"
            fontWeight="800"
          >
            “Tại sao mình lại
          </text>
          <text
            y="8"
            textAnchor="middle"
            fill="#FFFFFF"
            fontSize="31"
            fontWeight="800"
          >
            cảm thấy như vậy
          </text>
          <text
            y="56"
            textAnchor="middle"
            fill="#38BDF8"
            fontSize="31"
            fontWeight="800"
          >
            ngay lúc này?”
          </text>
          <text
            y="125"
            textAnchor="middle"
            fill="#94A3B8"
            fontSize="16"
          >
            Truy tìm gốc rễ thay vì phản xạ mù quáng
          </text>
        </g>
      </svg>
    </AbsoluteFill>
  );
};

// ============================================================================
// SCENE 4 (13.5s - 18.0s): DOMINO CONTAGION FIELD (Spilling hurt onto others)
// ============================================================================
const Scene04DominoContagion: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const shockwave = interpolate(frame, [5, 115], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  const nodes = [
    { label: "NGƯỜI THÂN", angle: -145, dist: 370 },
    { label: "BẠN ĐỜI", angle: -90, dist: 330 },
    { label: "ĐỒNG NGHIỆP", angle: -35, dist: 370 },
    { label: "CON CÁI", angle: 35, dist: 370 },
    { label: "BẠN BÈ", angle: 90, dist: 330 },
    { label: "NGƯỜI XUNG QUANH", angle: 145, dist: 370 },
  ];

  return (
    <AbsoluteFill>
      <AtelierBackdrop
        primaryGlow="#A855F7"
        secondaryGlow="#EC4899"
        chapterCode="CƠ CHẾ 04 // EMOTIONAL CONTAGION"
        chapterTitle="Dây Chuyền Lan Truyền Tổn Thương"
        timecodeSec={13.5 + frame / fps}
      />

      <svg width="1920" height="1080" style={{ position: "absolute", inset: 0 }}>
        <g transform="translate(960, 470)">
          {/* Expanding Shockwave Rings */}
          {[0, 0.25, 0.5].map((offset, i) => {
            const p = Math.max(0, Math.min(1, (shockwave - offset) * 1.5));
            return (
              <circle
                key={i}
                r={80 + p * 380}
                fill="none"
                stroke="#F43F5E"
                strokeWidth={4 * (1 - p * 0.7)}
                opacity={1 - p * 0.85}
              />
            );
          })}

          {/* Surrounding Relationship Nodes hit by the shockwave */}
          {nodes.map((n, idx) => {
            const rad = (n.angle * Math.PI) / 180;
            const nx = Math.cos(rad) * n.dist;
            const ny = Math.sin(rad) * n.dist;
            const hit = interpolate(
              frame,
              [18 + idx * 10, 45 + idx * 10],
              [0, 1],
              { extrapolateLeft: "clamp", extrapolateRight: "clamp" }
            );

            return (
              <g key={idx}>
                <line
                  x1="0"
                  y1="0"
                  x2={nx}
                  y2={ny}
                  stroke={hit > 0.3 ? "#F43F5E" : "#334155"}
                  strokeWidth="3"
                  strokeDasharray="8 6"
                />
                <g
                  transform={`translate(${nx + Math.cos(rad) * hit * 22}, ${
                    ny + Math.sin(rad) * hit * 22
                  }) rotate(${hit * (idx % 2 === 0 ? 14 : -14)})`}
                >
                  <rect
                    x="-105"
                    y="-42"
                    width="210"
                    height="84"
                    rx="16"
                    fill={hit > 0.5 ? "#3B0A1E" : "#0F172A"}
                    stroke={hit > 0.5 ? "#FB7185" : "#475569"}
                    strokeWidth="3"
                  />
                  <text
                    y="-4"
                    textAnchor="middle"
                    fill="#FFFFFF"
                    fontSize="18"
                    fontWeight="800"
                  >
                    {n.label}
                  </text>
                  <text
                    y="22"
                    textAnchor="middle"
                    fill={hit > 0.5 ? "#FDA4AF" : "#94A3B8"}
                    fontSize="13"
                    fontWeight="600"
                  >
                    {hit > 0.5 ? "Chịu vết xước lây lan" : "Đang kết nối"}
                  </text>
                </g>
              </g>
            );
          })}

          {/* Central Unhealed Core */}
          <circle r="102" fill="#2E1065" stroke="#EC4899" strokeWidth="4.5" />
          <text
            y="-18"
            textAnchor="middle"
            fill="#F9A8D4"
            fontSize="14"
            fontWeight="700"
            letterSpacing="2"
          >
            TÂM CHẤN
          </text>
          <text
            y="12"
            textAnchor="middle"
            fill="#FFFFFF"
            fontSize="23"
            fontWeight="800"
          >
            TỔN THƯƠNG CŨ
          </text>
          <text
            y="38"
            textAnchor="middle"
            fill="#F472B6"
            fontSize="14"
          >
            Chưa được nhận diện
          </text>
        </g>
      </svg>
    </AbsoluteFill>
  );
};

// ============================================================================
// SCENE 5 (18.0s - 24.7s): EGO ARMOR FORTRESS (Deflecting Feedback Arrows)
// ============================================================================
const Scene05EgoArmor: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const shieldDeploy = spring({
    frame: frame - 12,
    fps,
    config: { damping: 12, stiffness: 95 },
  });

  const arrowFlight = interpolate(frame, [30, 85], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  const deflectFlight = interpolate(frame, [85, 145], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  const armorPlates = [
    { label: "TỰ ÁI", angle: -60 },
    { label: "PHẢN BÁC", angle: 0 },
    { label: "BIỆN MINH", angle: 60 },
    { label: "ĐỔ LỖI", angle: 120 },
    { label: "ĐÓNG CỬA", angle: 180 },
    { label: "CÔNG KÍCH", angle: 240 },
  ];

  return (
    <AbsoluteFill>
      <AtelierBackdrop
        primaryGlow="#F59E0B"
        secondaryGlow="#EF4444"
        chapterCode="CHƯƠNG II // EGO DEFENSE MECHANISM"
        chapterTitle="Khi Cái Tôi Bị Chạm Tới — Cơ Chế Phòng Thủ Bật Lên"
        timecodeSec={18.0 + frame / fps}
      />

      <svg width="1920" height="1080" style={{ position: "absolute", inset: 0 }}>
        {/* Center Ego Fortress */}
        <g transform="translate(1060, 470)">
          {/* Rotating Outer Defense Ring */}
          <circle
            r={235 * shieldDeploy}
            fill="none"
            stroke="#F59E0B"
            strokeWidth="3"
            strokeDasharray="24 14"
            transform={`rotate(${frame * 0.8})`}
          />

          {/* 6 Hexagonal Armor Plates */}
          {armorPlates.map((plate, i) => {
            const rad = ((plate.angle + frame * 0.35) * Math.PI) / 180;
            const r = 175 * shieldDeploy;
            const px = Math.cos(rad) * r;
            const py = Math.sin(rad) * r;
            return (
              <g key={i} transform={`translate(${px}, ${py})`}>
                <rect
                  x="-68"
                  y="-24"
                  width="136"
                  height="48"
                  rx="10"
                  fill="#451A03"
                  stroke="#FBBF24"
                  strokeWidth="2.5"
                />
                <text
                  y="6"
                  textAnchor="middle"
                  fill="#FEF3C7"
                  fontSize="15"
                  fontWeight="800"
                  letterSpacing="1.5"
                >
                  {plate.label}
                </text>
              </g>
            );
          })}

          {/* Fragile Ego Core Inside */}
          <circle r="92" fill="#1E1B4B" stroke="#FBBF24" strokeWidth="4" />
          <text
            y="-12"
            textAnchor="middle"
            fill="#FDE68A"
            fontSize="15"
            fontWeight="700"
            letterSpacing="2"
          >
            VÙNG NHẠY CẢM
          </text>
          <text
            y="18"
            textAnchor="middle"
            fill="#FFFFFF"
            fontSize="28"
            fontWeight="800"
          >
            CÁI TÔI (EGO)
          </text>
        </g>

        {/* Incoming Constructive Feedback Beam from Left */}
        {arrowFlight > 0 && (
          <g>
            <line
              x1="180"
              y1="470"
              x2={180 + arrowFlight * 620}
              y2="470"
              stroke="#34D399"
              strokeWidth="6"
              strokeLinecap="round"
            />
            <rect
              x="160"
              y="395"
              width="290"
              height="52"
              rx="10"
              fill="#064E3B"
              stroke="#34D399"
              strokeWidth="2"
            />
            <text
              x="305"
              y="427"
              textAnchor="middle"
              fill="#A7F3D0"
              fontSize="17"
              fontWeight="700"
            >
              GÓP Ý THẬT & GÓC NHÌN MỚI
            </text>
          </g>
        )}

        {/* Deflection Impact & Ricochet when hitting the Ego Shield */}
        {deflectFlight > 0 && (
          <g transform="translate(800, 470)">
            <circle
              r={18 + deflectFlight * 55}
              fill="none"
              stroke="#FBBF24"
              strokeWidth={4 * (1 - deflectFlight)}
            />
            <line
              x1="0"
              y1="0"
              x2={-deflectFlight * 280}
              y2={-deflectFlight * 210}
              stroke="#EF4444"
              strokeWidth="5"
              strokeDasharray="10 6"
            />
            <text
              x="-160"
              y="-150"
              textAnchor="middle"
              fill="#FCA5A5"
              fontSize="18"
              fontWeight="800"
            >
              BẬT NGƯỢC: “TÔI ĐÚNG!”
            </text>
          </g>
        )}
      </svg>
    </AbsoluteFill>
  );
};

// ============================================================================
// SCENE 6 (24.7s - 32.1s): COMFORT VS TRUTH PRECISION SCALE
// ============================================================================
const Scene06ComfortVsTruth: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  // First tilts toward Comfort (left), then shifts toward Truth & Growth (right)
  const tiltAngle = interpolate(
    frame,
    [0, 75, 135, 210],
    [-10, -12, 10, 11],
    { extrapolateLeft: "clamp", extrapolateRight: "clamp" }
  );

  return (
    <AbsoluteFill>
      <AtelierBackdrop
        primaryGlow="#F59E0B"
        secondaryGlow="#10B981"
        chapterCode="CƠ CHẾ 06 // COGNITIVE CHOICE"
        chapterTitle="Bàn Cân Giữa Cảm Giác Dễ Chịu Nhất Thời & Sự Thật Giúp Trưởng Thành"
        timecodeSec={24.7 + frame / fps}
      />

      <svg width="1920" height="1080" style={{ position: "absolute", inset: 0 }}>
        {/* Central Fulcrum Pillar */}
        <polygon
          points="960,520 915,760 1005,760"
          fill="#1E293B"
          stroke="#64748B"
          strokeWidth="3"
        />
        <rect
          x="780"
          y="760"
          width="360"
          height="24"
          rx="12"
          fill="#334155"
        />

        {/* Rotating Balance Beam */}
        <g transform={`translate(960, 520) rotate(${tiltAngle})`}>
          <line
            x1="-520"
            y1="0"
            x2="520"
            y2="0"
            stroke="#E2E8F0"
            strokeWidth="8"
            strokeLinecap="round"
          />
          <circle r="22" fill="#F8FAFC" stroke="#0F172A" strokeWidth="5" />

          {/* Left Pan: Protecting Ego / Temporary Comfort */}
          <g transform={`translate(-500, 0) rotate(${-tiltAngle})`}>
            <line x1="0" y1="0" x2="0" y2="85" stroke="#F59E0B" strokeWidth="3" />
            <rect
              x="-240"
              y="85"
              width="480"
              height="185"
              rx="22"
              fill="rgba(69, 26, 3, 0.9)"
              stroke="#F59E0B"
              strokeWidth="3.5"
            />
            <text
              y="130"
              textAnchor="middle"
              fill="#FCD34D"
              fontSize="15"
              fontWeight="700"
              letterSpacing="2"
            >
              LỰA CHỌN CỦA BẢN NĂNG
            </text>
            <text
              y="168"
              textAnchor="middle"
              fill="#FFFFFF"
              fontSize="26"
              fontWeight="800"
            >
              BẢO VỆ QUAN ĐIỂM CŨ
            </text>
            <text
              y="206"
              textAnchor="middle"
              fill="#FDE68A"
              fontSize="18"
              fontWeight="600"
            >
              ✓ Dễ chịu ngay lập tức cho cái tôi
            </text>
            <text
              y="238"
              textAnchor="middle"
              fill="#FCA5A5"
              fontSize="16"
            >
              ✗ Đóng lại cánh cửa phát triển
            </text>
          </g>

          {/* Right Pan: Facing Truth / Growth */}
          <g transform={`translate(500, 0) rotate(${-tiltAngle})`}>
            <line x1="0" y1="0" x2="0" y2="85" stroke="#10B981" strokeWidth="3" />
            <rect
              x="-240"
              y="85"
              width="480"
              height="185"
              rx="22"
              fill="rgba(6, 78, 59, 0.92)"
              stroke="#10B981"
              strokeWidth="3.5"
            />
            <text
              y="130"
              textAnchor="middle"
              fill="#6EE7B7"
              fontSize="15"
              fontWeight="700"
              letterSpacing="2"
            >
              LỰA CHỌN CỦA TRƯỞNG THÀNH
            </text>
            <text
              y="168"
              textAnchor="middle"
              fill="#FFFFFF"
              fontSize="26"
              fontWeight="800"
            >
              ĐỐI DIỆN VỚI SỰ THẬT
            </text>
            <text
              y="206"
              textAnchor="middle"
              fill="#A7F3D0"
              fontSize="18"
              fontWeight="600"
            >
              ✓ Lắng nghe để nhìn lại chính mình
            </text>
            <text
              y="238"
              textAnchor="middle"
              fill="#34D399"
              fontSize="16"
              fontWeight="700"
            >
              ★ Mở rộng nhận thức & tự do nội tâm
            </text>
          </g>
        </g>
      </svg>
    </AbsoluteFill>
  );
};

// ============================================================================
// SCENE 7 (32.1s - 39.5s): PERCEPTION DISTORTION WALL (Why deep talk fails)
// ============================================================================
const Scene07DistortionWall: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const waveProgress = interpolate(frame, [10, 125], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  const wallHeight = interpolate(frame, [75, 175], [0, 420], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  return (
    <AbsoluteFill>
      <AtelierBackdrop
        primaryGlow="#38BDF8"
        secondaryGlow="#F43F5E"
        chapterCode="CƠ CHẾ 07 // COMMUNICATION BARRIER"
        chapterTitle="Vì Sao Rất Khó Trò Chuyện Sâu Sắc Khi Cái Tôi Quá Lớn?"
        timecodeSec={32.1 + frame / fps}
      />

      <svg width="1920" height="1080" style={{ position: "absolute", inset: 0 }}>
        {/* Left Speaker: Sharing a different perspective */}
        <g transform="translate(320, 490)">
          <circle r="85" fill="#0F172A" stroke="#38BDF8" strokeWidth="4" />
          <text
            y="-10"
            textAnchor="middle"
            fill="#7DD3FC"
            fontSize="15"
            fontWeight="700"
          >
            NGƯỜI ĐỐI THOẠI
          </text>
          <text
            y="20"
            textAnchor="middle"
            fill="#FFFFFF"
            fontSize="22"
            fontWeight="800"
          >
            GÓC NHÌN KHÁC
          </text>
          <text y="125" textAnchor="middle" fill="#94A3B8" fontSize="16">
            Chia sẻ thiện chí, khách quan
          </text>
        </g>

        {/* Smooth Blue Soundwave before hitting the distortion prism */}
        <g opacity={waveProgress > 0 ? 1 : 0}>
          <path
            d="M 430 490 Q 520 430, 610 490 T 790 490"
            fill="none"
            stroke="#38BDF8"
            strokeWidth="5"
          />
          <circle
            cx={430 + Math.min(0.5, waveProgress) * 960}
            cy="490"
            r="14"
            fill="#38BDF8"
          />
        </g>

        {/* Center Distortion Filter ("Lăng Kính Tự Ái") */}
        <g transform="translate(960, 490)">
          <polygon
            points="0,-185 45,0 0,185 -45,0"
            fill="rgba(244, 63, 94, 0.24)"
            stroke="#F43F5E"
            strokeWidth="3.5"
          />
          <text
            y="-210"
            textAnchor="middle"
            fill="#FDA4AF"
            fontSize="16"
            fontWeight="800"
            letterSpacing="2"
          >
            LĂNG KÍNH PHÒNG VỆ
          </text>

          {/* Brick wall rising between the two people */}
          <rect
            x="-22"
            y={210 - wallHeight}
            width="44"
            height={wallHeight}
            rx="6"
            fill="#881337"
            stroke="#FB7185"
            strokeWidth="2.5"
          />
        </g>

        {/* Warped Red Jagged Spikes after passing the prism */}
        {waveProgress > 0.45 && (
          <g>
            <polyline
              points="1015,490 1090,420 1150,550 1230,410 1310,545 1390,460 1460,490"
              fill="none"
              stroke="#EF4444"
              strokeWidth="6"
            />
            <text
              x="1240"
              y="380"
              textAnchor="middle"
              fill="#FCA5A5"
              fontSize="20"
              fontWeight="800"
            >
              DIỄN GIẢI THÀNH: “ĐANG CÔNG KÍCH CÁ NHÂN!”
            </text>
          </g>
        )}

        {/* Right Listener: Defensive Ego */}
        <g transform="translate(1600, 490)">
          <circle r="85" fill="#3B0A1E" stroke="#F43F5E" strokeWidth="4" />
          <text
            y="-10"
            textAnchor="middle"
            fill="#FDA4AF"
            fontSize="15"
            fontWeight="700"
          >
            NGƯỜI PHẢN ỨNG
          </text>
          <text
            y="20"
            textAnchor="middle"
            fill="#FFFFFF"
            fontSize="22"
            fontWeight="800"
          >
            ĐÓNG SẬP LÒNG
          </text>
          <text y="125" textAnchor="middle" fill="#FB7185" fontSize="16">
            Mất kết nối sâu sắc
          </text>
        </g>
      </svg>
    </AbsoluteFill>
  );
};

// ============================================================================
// SCENE 8 (39.5s - 45.7s): SHATTERED SELF-IMAGE MIRROR (Fragile Perfection)
// ============================================================================
const Scene08FragileMirror: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const crackProgress = interpolate(frame, [18, 110], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  const crackLines = [
    "M 960 460 L 820 260 L 740 190",
    "M 960 460 L 1140 280 L 1210 210",
    "M 960 460 L 1220 490 L 1310 530",
    "M 960 460 L 1080 690 L 1150 770",
    "M 960 460 L 810 680 L 720 755",
    "M 960 460 L 690 440 L 620 410",
    "M 820 260 L 980 230 L 1140 280",
    "M 810 680 L 960 720 L 1080 690",
  ];

  return (
    <AbsoluteFill>
      <AtelierBackdrop
        primaryGlow="#A855F7"
        secondaryGlow="#F43F5E"
        chapterCode="CƠ CHẾ 08 // SELF-IMAGE ILLUSION"
        chapterTitle="Khi Sự Thật Đe Dọa Hình Ảnh Hoàn Hảo Họ Luôn Tin Về Chính Mình"
        timecodeSec={39.5 + frame / fps}
      />

      <svg width="1920" height="1080" style={{ position: "absolute", inset: 0 }}>
        {/* Ornate Mirror Frame */}
        <rect
          x="590"
          y="140"
          width="740"
          height="660"
          rx="42"
          fill="#0F172A"
          stroke="#A855F7"
          strokeWidth="5"
        />
        <rect
          x="612"
          y="162"
          width="696"
          height="616"
          rx="30"
          fill="#1E1B4B"
          stroke="rgba(216, 180, 254, 0.35)"
          strokeWidth="2"
        />

        {/* Idealized Self-Image Crown & Halo Inside the Mirror */}
        <g
          transform="translate(960, 445)"
          opacity={1 - crackProgress * 0.45}
        >
          <circle
            r="140"
            fill="none"
            stroke="#FDE047"
            strokeWidth="3"
            strokeDasharray="12 8"
          />
          <polygon
            points="-75,-45 -40,-105 0,-60 40,-105 75,-45"
            fill="#FACC15"
          />
          <text
            y="10"
            textAnchor="middle"
            fill="#FEF08A"
            fontSize="26"
            fontWeight="800"
          >
            “HÌNH ẢNH HOÀN HẢO”
          </text>
          <text
            y="45"
            textAnchor="middle"
            fill="#DDD6FE"
            fontSize="17"
          >
            Ảo ảnh cái tôi tự vẽ về bản thân
          </text>
        </g>

        {/* Voronoi Fracture Cracks Spreading Across the Mirror */}
        {crackLines.map((d, i) => (
          <path
            key={i}
            d={d}
            fill="none"
            stroke={i % 2 === 0 ? "#F43F5E" : "#FBBF24"}
            strokeWidth="4.5"
            strokeLinecap="round"
            strokeDasharray="600"
            strokeDashoffset={600 * (1 - crackProgress)}
          />
        ))}

        {/* Impact point */}
        {crackProgress > 0.05 && (
          <circle
            cx="960"
            cy="460"
            r="14"
            fill="#FFFFFF"
            stroke="#F43F5E"
            strokeWidth="5"
          />
        )}
      </svg>
    </AbsoluteFill>
  );
};

// ============================================================================
// SCENE 9 (45.7s - 54.0s): SOVEREIGN HELMSMAN WHEEL (Emotion vs Action)
// ============================================================================
const Scene09SovereignHelmsman: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const helmEnter = spring({
    frame: frame - 8,
    fps,
    config: { damping: 16, stiffness: 80 },
  });

  // Turbulent wave below vs steady straight course above
  const wavePath: string[] = [];
  for (let x = 140; x <= 1780; x += 20) {
    const y =
      670 +
      Math.sin((x + frame * 8) * 0.025) * 42 +
      Math.cos((x - frame * 5) * 0.04) * 24;
    wavePath.push(`${x},${y.toFixed(1)}`);
  }

  return (
    <AbsoluteFill>
      <AtelierBackdrop
        primaryGlow="#10B981"
        secondaryGlow="#38BDF8"
        chapterCode="CHƯƠNG III // EMOTIONAL SOVEREIGNTY"
        chapterTitle="Trưởng Thành Không Phải Là Hết Cảm Xúc — Mà Là Không Để Cảm Xúc Lái Hành Động"
        timecodeSec={45.7 + frame / fps}
      />

      <svg width="1920" height="1080" style={{ position: "absolute", inset: 0 }}>
        {/* Lower Zone: Natural Emotional Waves (Allowed to exist, not suppressed) */}
        <polyline
          fill="none"
          stroke="#38BDF8"
          strokeWidth="4"
          points={wavePath.join(" ")}
          opacity="0.75"
        />
        <text
          x="960"
          y="775"
          textAnchor="middle"
          fill="#7DD3FC"
          fontSize="18"
          fontWeight="700"
          letterSpacing="1.5"
        >
          TẦNG CẢM XÚC TỰ NHIÊN: Vẫn có buồn · giận · chạnh lòng (Được quan sát, không đè nén)
        </text>

        {/* Upper Zone: Steady Golden Trajectory & Helmsman Compass */}
        <line
          x1="180"
          y1="380"
          x2="1740"
          y2="380"
          stroke="#10B981"
          strokeWidth="5"
        />

        <g transform={`translate(960, 380) scale(${helmEnter})`}>
          <circle
            r="148"
            fill="#022C22"
            stroke="#10B981"
            strokeWidth="5"
          />
          <circle
            r="122"
            fill="none"
            stroke="#34D399"
            strokeWidth="2"
            strokeDasharray="10 8"
          />
          {Array.from({ length: 8 }).map((_, i) => {
            const a = (i * Math.PI) / 4;
            return (
              <line
                key={i}
                x1={Math.cos(a) * 45}
                y1={Math.sin(a) * 45}
                x2={Math.cos(a) * 165}
                y2={Math.sin(a) * 165}
                stroke="#34D399"
                strokeWidth="4"
                strokeLinecap="round"
              />
            );
          })}
          <circle r="56" fill="#064E3B" stroke="#FACC15" strokeWidth="4" />
          <text
            y="-6"
            textAnchor="middle"
            fill="#FEF08A"
            fontSize="14"
            fontWeight="800"
          >
            NGƯỜI CẦM LÁI
          </text>
          <text
            y="16"
            textAnchor="middle"
            fill="#FFFFFF"
            fontSize="18"
            fontWeight="800"
          >
            TỈNH THỨC
          </text>
        </g>

        {/* Left & Right Trajectory Labels */}
        <rect
          x="180"
          y="295"
          width="360"
          height="62"
          rx="12"
          fill="#064E3B"
          stroke="#10B981"
          strokeWidth="2"
        />
        <text
          x="360"
          y="333"
          textAnchor="middle"
          fill="#A7F3D0"
          fontSize="18"
          fontWeight="700"
        >
          NHẬN BIẾT CƠN SÓNG BÊN DƯỚI
        </text>

        <rect
          x="1380"
          y="295"
          width="360"
          height="62"
          rx="12"
          fill="#064E3B"
          stroke="#FACC15"
          strokeWidth="2.5"
        />
        <text
          x="1560"
          y="333"
          textAnchor="middle"
          fill="#FEF08A"
          fontSize="18"
          fontWeight="800"
        >
          GIỮ VỮNG TAY LÁI HÀNH ĐỘNG
        </text>
      </svg>
    </AbsoluteFill>
  );
};

// ============================================================================
// SCENE 10 (54.0s - 69.0s): SIGNATURE DEVICE — THE MINDFUL SPACE BRIDGE
// (Stimulus <--- [1. Nhận diện | 2. Dừng lại | 3. Chủ động lựa chọn] ---> Response)
// ============================================================================
const Scene10MindfulSpaceBridge: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  // Terminals pull apart to open the Sacred Pause Space
  const openGap = spring({
    frame: frame - 10,
    fps,
    config: { damping: 18, stiffness: 55 },
  });

  const step1 = spring({
    frame: frame - 40,
    fps,
    config: { damping: 15, stiffness: 85 },
  });
  const step2 = spring({
    frame: frame - 105,
    fps,
    config: { damping: 15, stiffness: 85 },
  });
  const step3 = spring({
    frame: frame - 175,
    fps,
    config: { damping: 15, stiffness: 85 },
  });

  const gapHalfWidth = interpolate(openGap, [0, 1], [110, 560]);

  return (
    <AbsoluteFill>
      <AtelierBackdrop
        primaryGlow="#10B981"
        secondaryGlow="#FACC15"
        chapterCode="SIGNATURE DEVICE // THE SACRED PAUSE"
        chapterTitle="Khoảng Trống Tự Do: Nhận Diện · Dừng Lại · Chủ Động Lựa Chọn"
        timecodeSec={54.0 + frame / fps}
      />

      <svg width="1920" height="1080" style={{ position: "absolute", inset: 0 }}>
        {/* Golden Sanctuary Field in the Center */}
        <rect
          x={960 - gapHalfWidth}
          y="165"
          width={gapHalfWidth * 2}
          height="560"
          rx="28"
          fill="rgba(6, 78, 59, 0.25)"
          stroke="#FACC15"
          strokeWidth="2.5"
          strokeDasharray="14 10"
        />

        <text
          x="960"
          y="212"
          textAnchor="middle"
          fill="#FDE047"
          fontSize="18"
          fontWeight="800"
          letterSpacing="3"
        >
          KHOẢNG TRỐNG TỰ DO NỘI TÂM (THE MINDFUL GAP)
        </text>

        {/* Left Terminal: STIMULUS */}
        <g transform={`translate(${960 - gapHalfWidth - 135}, 445)`}>
          <rect
            x="-115"
            y="-85"
            width="230"
            height="170"
            rx="20"
            fill="#1E293B"
            stroke="#F59E0B"
            strokeWidth="3.5"
          />
          <text
            y="-18"
            textAnchor="middle"
            fill="#FBBF24"
            fontSize="14"
            fontWeight="700"
            letterSpacing="2"
          >
            ĐẦU VÀO
          </text>
          <text
            y="16"
            textAnchor="middle"
            fill="#FFFFFF"
            fontSize="24"
            fontWeight="800"
          >
            CẢM XÚC
          </text>
          <text
            y="44"
            textAnchor="middle"
            fill="#94A3B8"
            fontSize="15"
          >
            Nhất thời khởi lên
          </text>
        </g>

        {/* Right Terminal: CONSCIOUS CHOICE */}
        <g transform={`translate(${960 + gapHalfWidth + 135}, 445)`}>
          <rect
            x="-115"
            y="-85"
            width="230"
            height="170"
            rx="20"
            fill="#064E3B"
            stroke="#34D399"
            strokeWidth="3.5"
          />
          <text
            y="-18"
            textAnchor="middle"
            fill="#6EE7B7"
            fontSize="14"
            fontWeight="700"
            letterSpacing="2"
          >
            ĐẦU RA
          </text>
          <text
            y="16"
            textAnchor="middle"
            fill="#FFFFFF"
            fontSize="24"
            fontWeight="800"
          >
            QUYẾT ĐỊNH
          </text>
          <text
            y="44"
            textAnchor="middle"
            fill="#A7F3D0"
            fontSize="15"
          >
            Không hối hận cả đời
          </text>
        </g>

        {/* 3 Crystalline Pillars inside the Gap */}
        {[
          {
            prog: step1,
            x: 640,
            code: "BƯỚC 01",
            title: "NHẬN DIỆN",
            desc: "Gọi đúng tên cảm xúc đang diễn ra bên trong",
            color: "#38BDF8",
          },
          {
            prog: step2,
            x: 960,
            code: "BƯỚC 02",
            title: "DỪNG LẠI 1 NHỊP",
            desc: "Ngắt phản xạ tự động trước khi buông lời",
            color: "#FACC15",
          },
          {
            prog: step3,
            x: 1280,
            code: "BƯỚC 03",
            title: "CHỦ ĐỘNG CHỌN",
            desc: "Đáp trả bằng sự trưởng thành & tỉnh thức",
            color: "#34D399",
          },
        ].map((p, idx) => (
          <g
            key={idx}
            transform={`translate(${p.x}, ${460 + (1 - p.prog) * 70})`}
            opacity={p.prog}
          >
            <rect
              x="-140"
              y="-150"
              width="280"
              height="300"
              rx="22"
              fill="rgba(15, 23, 42, 0.92)"
              stroke={p.color}
              strokeWidth="3.5"
            />
            <circle
              cy="-85"
              r="32"
              fill="rgba(255,255,255,0.06)"
              stroke={p.color}
              strokeWidth="2.5"
            />
            <text
              y="-79"
              textAnchor="middle"
              fill={p.color}
              fontSize="16"
              fontWeight="800"
            >
              {p.code}
            </text>
            <text
              y="-10"
              textAnchor="middle"
              fill="#FFFFFF"
              fontSize="25"
              fontWeight="800"
            >
              {p.title}
            </text>
            <text
              y="38"
              textAnchor="middle"
              fill="#CBD5E1"
              fontSize="15"
            >
              {p.desc.slice(0, 24)}
            </text>
            <text
              y="62"
              textAnchor="middle"
              fill="#CBD5E1"
              fontSize="15"
            >
              {p.desc.slice(24)}
            </text>
          </g>
        ))}

        {/* Ambient Golden Sparks inside the Sanctuary */}
        {Array.from({ length: 18 }).map((_, i) => {
          const sx = 460 + seeded(i + 1) * 1000;
          const sy =
            240 +
            ((seeded(i + 20) * 420 - frame * (0.6 + seeded(i) * 0.8)) % 420 +
              420) %
              420;
          return (
            <circle
              key={i}
              cx={sx}
              cy={sy}
              r={2.5 + seeded(i + 9) * 3}
              fill="#FDE047"
              opacity={0.45}
            />
          );
        })}
      </svg>
    </AbsoluteFill>
  );
};

// ============================================================================
// MASTER ATELIER COMPOSITION (0.0s -> 69.0s, 10 Bespoke Scenes)
// ============================================================================
export const ReactiveMindAtelier: React.FC<ReactiveMindAtelierProps> = ({
  narrationSrc = "episodes/reactive-mind/narration.mp3",
  musicSrc = "episodes/reactive-mind/ambient_music.wav",
  captions = [],
}) => {
  const { fps, durationInFrames } = useVideoConfig();

  const scenes: Array<{
    id: string;
    inSec: number;
    outSec: number;
    Comp: React.FC;
  }> = [
    { id: "s01-hijack", inSec: 0.0, outSec: 4.1, Comp: Scene01NeuralHijack },
    { id: "s02-triad", inSec: 4.1, outSec: 10.1, Comp: Scene02TriadReflex },
    { id: "s03-pause", inSec: 10.1, outSec: 13.5, Comp: Scene03MissingPause },
    { id: "s04-contagion", inSec: 13.5, outSec: 18.0, Comp: Scene04DominoContagion },
    { id: "s05-ego-armor", inSec: 18.0, outSec: 24.7, Comp: Scene05EgoArmor },
    { id: "s06-scale", inSec: 24.7, outSec: 32.1, Comp: Scene06ComfortVsTruth },
    { id: "s07-wall", inSec: 32.1, outSec: 39.5, Comp: Scene07DistortionWall },
    { id: "s08-mirror", inSec: 39.5, outSec: 45.7, Comp: Scene08FragileMirror },
    { id: "s09-helmsman", inSec: 45.7, outSec: 54.0, Comp: Scene09SovereignHelmsman },
    { id: "s10-bridge", inSec: 54.0, outSec: 69.0, Comp: Scene10MindfulSpaceBridge },
  ];

  return (
    <AbsoluteFill style={{ backgroundColor: "#060913" }}>
      {scenes.map(({ id, inSec, outSec, Comp }) => {
        const from = Math.round(inSec * fps);
        const dur = Math.max(1, Math.round((outSec - inSec) * fps));
        return (
          <Sequence key={id} from={from} durationInFrames={dur}>
            <Comp />
          </Sequence>
        );
      })}

      {/* Synchronized Word-Level Subtitle Bar at Bottom */}
      {captions.length > 0 && (
        <CaptionOverlay
          words={captions}
          wordsPerPage={6}
          fontSize={40}
          highlightColor="#FACC15"
          backgroundColor="rgba(6, 9, 19, 0.86)"
        />
      )}

      {/* Voiceover Narration */}
      {narrationSrc && <Audio src={resolveAsset(narrationSrc)} volume={1.0} />}

      {/* Synchronized Transition & Action SFX Stem */}
      <Audio
        src={resolveAsset("episodes/reactive-mind/sfx_stem_master.wav")}
        volume={0.28}
      />

      {/* Ambient Soundtrack with Smooth Fade In/Out */}
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
              {
                extrapolateLeft: "clamp",
                extrapolateRight: "clamp",
              }
            );
            return Math.min(fadeIn, fadeOut);
          }}
        />
      )}
    </AbsoluteFill>
  );
};
