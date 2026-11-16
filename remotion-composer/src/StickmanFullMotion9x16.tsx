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

export interface StickmanFullMotion9x16Props {
  durationSeconds?: number;
}

// ============================================================================
// MODE A · DIRECTOR MODE PALETTE (Style 2A Modern Beanie Zeke + Style 1 Dark)
// ============================================================================
const STUDIO_WHITE = "#F8FAFC";
const STUDIO_FLOOR = "#F1F5F9";
const DARK_VOID = "#090B10";
const DARK_FLOOR = "#0F1420";
const INK = "#0F172A";
const PURE_WHITE = "#FFFFFF";
const BEANIE_RED = "#EF4444";
const BEANIE_CUFF = "#DC2626";
const SHIRT_YELLOW = "#FACC15";
const SHIRT_SHADOW = "#EAB308";
const CYAN_GLOW = "#00E5FF";
const ELECTRIC_BLUE = "#2563EB";
const DANGER_RED = "#F43F5E";
const EMERALD_GLOW = "#10B981";
const AMBER_GOLD = "#F59E0B";

// ============================================================================
// 1. 3D PERSPECTIVE SCROLLING STUDIO GRID + PARALLAX ENVIRONMENT
// Matches kaomei/stickman-video-director Style 2A (style-2a-demo.mp4) & Style 1 Dark
// ============================================================================
const PerspectiveStudioEnvironment: React.FC<{
  theme: "studio_light" | "classic_dark" | "dusk_cinematic";
  scrollX: number;
  scrollZ: number;
  horizonY?: number;
  chasmRange?: [number, number] | null; // Screen X range [start, end] for abyss chasm
}> = ({ theme, scrollX, scrollZ, horizonY = 1120, chasmRange = null }) => {
  const isDark = theme === "classic_dark";
  const isDusk = theme === "dusk_cinematic";

  const skyBg = isDark
    ? DARK_VOID
    : isDusk
      ? "linear-gradient(180deg, #0F172A 0%, #1E1B4B 48%, #311042 75%, #F97316 100%)"
      : "linear-gradient(180deg, #FFFFFF 0%, #F1F5F9 65%, #E2E8F0 100%)";

  const floorFill = isDark ? DARK_FLOOR : isDusk ? "#131126" : STUDIO_FLOOR;
  const gridStroke = isDark
    ? "rgba(255, 255, 255, 0.16)"
    : isDusk
      ? "rgba(0, 229, 255, 0.22)"
      : "rgba(100, 116, 139, 0.24)";

  const vanishX = 540 - (scrollX * 0.18) % 180;
  const numRayLines = 19;
  const numDepthLines = 12;
  const zOffset = ((scrollZ % 1) + 1) % 1;

  return (
    <AbsoluteFill style={{ background: skyBg, overflow: "hidden" }}>
      <svg width="1080" height="1920" style={{ position: "absolute", inset: 0 }}>
        <defs>
          <radialGradient id="studioSpot" cx="50%" cy="38%" r="60%">
            <stop
              offset="0%"
              stopColor={isDark ? "#1E293B" : "#FFFFFF"}
              stopOpacity={isDark ? 0.55 : 0.9}
            />
            <stop
              offset="100%"
              stopColor={isDark ? "#090B10" : "#E2E8F0"}
              stopOpacity="0"
            />
          </radialGradient>
          <linearGradient id="chasmWall" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor={isDark ? "#020617" : "#334155"} />
            <stop offset="100%" stopColor="#020617" />
          </linearGradient>
          <filter id="cyanGlow" x="-30%" y="-30%" width="160%" height="160%">
            <feGaussianBlur stdDeviation="8" result="blur" />
            <feMerge>
              <feMergeNode in="blur" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>
        </defs>

        {/* Studio Spotlight */}
        <rect x="0" y="0" width="1080" height={horizonY} fill="url(#studioSpot)" />

        {/* Floor Plane */}
        <rect
          x="0"
          y={horizonY}
          width="1080"
          height={1920 - horizonY}
          fill={floorFill}
        />

        {/* Perspective Ray Lines from Vanishing Point */}
        <g stroke={gridStroke} strokeWidth="2">
          {Array.from({ length: numRayLines }).map((_, i) => {
            const idx = i - Math.floor(numRayLines / 2);
            const bottomX =
              540 + idx * 195 - ((scrollX * 1.35) % 195);
            return (
              <line
                key={`ray-${i}`}
                x1={vanishX + idx * 24}
                y1={horizonY}
                x2={bottomX}
                y2={1920}
              />
            );
          })}

          {/* Perspective Horizontal Depth Lines (exponential spacing) */}
          {Array.from({ length: numDepthLines }).map((_, i) => {
            const t = (i + zOffset) / numDepthLines;
            const y = horizonY + Math.pow(t, 1.85) * (1920 - horizonY);
            return (
              <line
                key={`depth-${i}`}
                x1={0}
                y1={y}
                x2={1080}
                y2={y}
                strokeOpacity={0.25 + t * 0.75}
                strokeWidth={1.2 + t * 1.8}
              />
            );
          })}
        </g>

        {/* Horizon Crisp Divider Line */}
        <line
          x1="0"
          y1={horizonY}
          x2="1080"
          y2={horizonY}
          stroke={isDark ? "rgba(255,255,255,0.35)" : "rgba(15,23,42,0.25)"}
          strokeWidth="3"
        />

        {/* Optional Deep Chasm Cutout in Floor (like style-2a-demo.mp4_4s.jpg!) */}
        {chasmRange && (
          <g>
            <polygon
              points={`${chasmRange[0]},${horizonY} ${chasmRange[1]},${horizonY} ${
                chasmRange[1] + 130
              },1920 ${chasmRange[0] - 90},1920`}
              fill="url(#chasmWall)"
              stroke={isDark ? PURE_WHITE : INK}
              strokeWidth="5"
            />
            {/* 3D Cliff Inner Edge Depth Lines */}
            <line
              x1={chasmRange[0]}
              y1={horizonY}
              x2={chasmRange[0] - 90}
              y2={1920}
              stroke={isDark ? PURE_WHITE : INK}
              strokeWidth="6"
            />
            <line
              x1={chasmRange[1]}
              y1={horizonY}
              x2={chasmRange[1] + 130}
              y2={1920}
              stroke={isDark ? PURE_WHITE : INK}
              strokeWidth="6"
            />
            {/* Vertical cliff wall hatch lines */}
            {[0.18, 0.36, 0.56, 0.78].map((p, idx) => {
              const lx = chasmRange[0] - p * 75;
              const ly = horizonY + p * (1920 - horizonY);
              return (
                <line
                  key={`cliff-l-${idx}`}
                  x1={lx}
                  y1={ly}
                  x2={lx + 38}
                  y2={ly + 190}
                  stroke="rgba(255,255,255,0.18)"
                  strokeWidth="3"
                />
              );
            })}
          </g>
        )}
      </svg>
    </AbsoluteFill>
  );
};

// ============================================================================
// 2. ZEKE FULL-MOTION 2-BONE KINEMATIC RIG (Style 2A Beanie Zeke & Style 1 Dark)
// Real articulated Shoulder -> Elbow -> Hand and Hip -> Knee -> Foot + Sneaker!
// Supports: run, walk, brake_look_down, draw_light_pen, leap, push_heavy,
// panic_dodge, steer_wheel, kick_domino, celebrate_summit
// ============================================================================
export type ZekeActionMode =
  | "run"
  | "walk"
  | "brake_look_down"
  | "draw_light_pen"
  | "leap"
  | "push_heavy"
  | "panic_dodge"
  | "steer_wheel"
  | "kick_domino"
  | "celebrate_summit";

const deg2rad = (deg: number) => (deg * Math.PI) / 180;

export const ZekeKinematicActor: React.FC<{
  x: number;
  y: number;
  scale?: number;
  action: ZekeActionMode;
  frame: number;
  facing?: 1 | -1;
  variant?: "zeke_beanie" | "classic_dark" | "shadow_clone";
  expression?: "focused" | "shocked" | "strained" | "calm" | "happy";
  showDustPuffs?: boolean;
  holdingLightPen?: boolean;
}> = ({
  x,
  y,
  scale = 1,
  action,
  frame,
  facing = 1,
  variant = "zeke_beanie",
  expression = "focused",
  showDustPuffs = false,
  holdingLightPen = false,
}) => {
  const isClassicDark = variant === "classic_dark";
  const isShadow = variant === "shadow_clone";
  const lineCol = isClassicDark
    ? PURE_WHITE
    : isShadow
      ? DANGER_RED
      : INK;

  // Segment lengths
  const torsoLen = 108;
  const upperArm = 54;
  const lowerArm = 50;
  const upperLeg = 64;
  const lowerLeg = 62;

  // Compute time phase for cyclic locomotion
  const runSpeed = 0.42;
  const walkSpeed = 0.24;
  const phase =
    action === "run"
      ? frame * runSpeed
      : action === "walk"
        ? frame * walkSpeed
        : frame * 0.18;

  // Default joint angles (in degrees relative to vertical down = 0, positive = forward/right)
  let torsoLean = 0; // degrees forward lean
  let bodyBounceY = 0;

  let thighL = -15;
  let kneeBendL = 10; // knee bends backward (positive = bend back)
  let footAngleL = 0;

  let thighR = 15;
  let kneeBendR = 10;
  let footAngleR = 0;

  let shoulderL = -20;
  let elbowBendL = 25; // elbow bends forward (positive = bend forward)

  let shoulderR = 20;
  let elbowBendR = 25;

  let headTilt = 0;

  if (action === "run") {
    torsoLean = 18 + Math.sin(phase * 2) * 3;
    bodyBounceY = -Math.abs(Math.sin(phase)) * 22;

    const sL = Math.sin(phase);
    const cL = Math.cos(phase);
    thighL = sL * 52;
    kneeBendL = cL > 0 ? 18 + cL * 68 : 12 + Math.abs(sL) * 18;
    footAngleL = sL * 20;

    const sR = Math.sin(phase + Math.PI);
    const cR = Math.cos(phase + Math.PI);
    thighR = sR * 52;
    kneeBendR = cR > 0 ? 18 + cR * 68 : 12 + Math.abs(sR) * 18;
    footAngleR = sR * 20;

    // Arms pump opposite to legs
    shoulderL = sR * 56;
    elbowBendL = 62 + cR * 25;
    shoulderR = sL * 56;
    elbowBendR = 62 + cL * 25;
    headTilt = 6;
  } else if (action === "walk") {
    torsoLean = 6 + Math.sin(phase * 2) * 1.5;
    bodyBounceY = -Math.abs(Math.sin(phase)) * 10;

    const sL = Math.sin(phase);
    const cL = Math.cos(phase);
    thighL = sL * 32;
    kneeBendL = cL > 0 ? 8 + cL * 38 : 6;
    footAngleL = sL * 12;

    const sR = Math.sin(phase + Math.PI);
    const cR = Math.cos(phase + Math.PI);
    thighR = sR * 32;
    kneeBendR = cR > 0 ? 8 + cR * 38 : 6;
    footAngleR = sR * 12;

    shoulderL = sR * 28;
    elbowBendL = 22 + Math.max(0, sR) * 20;
    shoulderR = sL * 28;
    elbowBendR = 22 + Math.max(0, sL) * 20;
  } else if (action === "brake_look_down") {
    // Skids and leans forward looking into the chasm (like style-2a-demo.mp4_4s.jpg!)
    const lookCycle = Math.sin(frame * 0.16);
    torsoLean = 22 + lookCycle * 5;
    bodyBounceY = 6;
    thighL = -26;
    kneeBendL = 28;
    thighR = 34;
    kneeBendR = 42;
    shoulderL = -35;
    elbowBendL = 30;
    shoulderR = 48;
    elbowBendR = 55;
    headTilt = 26 + lookCycle * 6;
  } else if (action === "draw_light_pen") {
    // Right arm sweeps across in a wide arc holding the glowing cyan pen
    const sweep = Math.sin(frame * 0.22);
    torsoLean = 12;
    bodyBounceY = Math.sin(frame * 0.2) * 4;
    thighL = -22;
    kneeBendL = 16;
    thighR = 26;
    kneeBendR = 24;
    shoulderL = -30;
    elbowBendL = 35;
    shoulderR = 68 + sweep * 38;
    elbowBendR = 25 + Math.cos(frame * 0.22) * 20;
    headTilt = 8 + sweep * 8;
  } else if (action === "leap") {
    // Mid-air dynamic jump pose!
    torsoLean = 24;
    bodyBounceY = -12;
    thighL = -48 + Math.sin(frame * 0.25) * 10;
    kneeBendL = 65;
    thighR = 58 + Math.cos(frame * 0.25) * 10;
    kneeBendR = 35;
    shoulderL = -65;
    elbowBendL = 30;
    shoulderR = 85;
    elbowBendR = 25;
    headTilt = -8;
  } else if (action === "push_heavy") {
    // Straining against a heavy block/wall while legs drive back
    const drive = Math.sin(frame * 0.35);
    torsoLean = 34;
    bodyBounceY = Math.abs(drive) * 6;
    thighL = -42 + drive * 25;
    kneeBendL = 32 + Math.max(0, drive) * 30;
    thighR = 18 - drive * 25;
    kneeBendR = 48 + Math.max(0, -drive) * 30;
    shoulderL = 68;
    elbowBendL = 35 + drive * 8;
    shoulderR = 76;
    elbowBendR = 28 - drive * 8;
    headTilt = 14;
  } else if (action === "panic_dodge") {
    const jitter = Math.sin(frame * 0.55);
    torsoLean = jitter * 18;
    bodyBounceY = -Math.abs(jitter) * 16;
    thighL = -35 + jitter * 28;
    kneeBendL = 45;
    thighR = 35 + jitter * 28;
    kneeBendR = 45;
    shoulderL = 115 + jitter * 20;
    elbowBendL = 65;
    shoulderR = 130 - jitter * 20;
    elbowBendR = 65;
    headTilt = -12 + jitter * 15;
  } else if (action === "steer_wheel") {
    const turn = Math.sin(frame * 0.18);
    torsoLean = 4;
    bodyBounceY = Math.sin(frame * 0.18) * 3;
    thighL = -18;
    kneeBendL = 10;
    thighR = 18;
    kneeBendR = 10;
    shoulderL = 52 + turn * 22;
    elbowBendL = 45;
    shoulderR = 64 - turn * 22;
    elbowBendR = 45;
    headTilt = turn * 6;
  } else if (action === "kick_domino") {
    const kick = Math.sin(frame * 0.25);
    torsoLean = -12;
    thighL = -24;
    kneeBendL = 18;
    thighR = 78 + Math.max(0, kick) * 28;
    kneeBendR = Math.max(0, -kick) * 45;
    shoulderL = -48;
    elbowBendL = 35;
    shoulderR = 52;
    elbowBendR = 40;
  } else if (action === "celebrate_summit") {
    const wave = Math.sin(frame * 0.24);
    torsoLean = -4;
    bodyBounceY = -Math.abs(wave) * 12;
    thighL = -22;
    kneeBendL = 10;
    thighR = 22;
    kneeBendR = 10;
    shoulderL = 135 + wave * 18;
    elbowBendL = 20;
    shoulderR = 148 - wave * 18;
    elbowBendR = 20;
    headTilt = -8;
  }

  // Compute FK Joint Coordinates relative to Hip (0, 0 + bodyBounceY)
  const hipX = 0;
  const hipY = bodyBounceY;
  const leanRad = deg2rad(torsoLean);
  const shoulderX = hipX + Math.sin(leanRad) * torsoLen;
  const shoulderY = hipY - Math.cos(leanRad) * torsoLen;
  const headX = shoulderX + Math.sin(leanRad + deg2rad(headTilt * 0.4)) * 46;
  const headY = shoulderY - Math.cos(leanRad + deg2rad(headTilt * 0.4)) * 46;

  // Leg FK helper: thighAngle is forward (+X), knee bends backward (-X)
  const calcLeg = (thighDeg: number, kneeDeg: number) => {
    const tRad = deg2rad(thighDeg);
    const kx = hipX + Math.sin(tRad) * upperLeg;
    const ky = hipY + Math.cos(tRad) * upperLeg;
    const lRad = deg2rad(thighDeg - kneeDeg);
    const fx = kx + Math.sin(lRad) * lowerLeg;
    const fy = ky + Math.cos(lRad) * lowerLeg;
    return { kx, ky, fx, fy, lDeg: thighDeg - kneeDeg };
  };

  // Arm FK helper: shoulderDeg is forward (+X), elbow bends forward/up (+X)
  const calcArm = (shDeg: number, elDeg: number) => {
    const sRad = deg2rad(shDeg);
    const ex = shoulderX + Math.sin(sRad) * upperArm;
    const ey = shoulderY + Math.cos(sRad) * upperArm;
    const fRad = deg2rad(shDeg + elDeg);
    const hx = ex + Math.sin(fRad) * lowerArm;
    const hy = ey + Math.cos(fRad) * lowerArm;
    return { ex, ey, hx, hy };
  };

  const legL = calcLeg(thighL, kneeBendL);
  const legR = calcLeg(thighR, kneeBendR);
  const armL = calcArm(shoulderL, elbowBendL);
  const armR = calcArm(shoulderR, elbowBendR);

  return (
    <g transform={`translate(${x}, ${y}) scale(${facing * scale}, ${scale})`}>
      {/* Ground Shadow directly under character */}
      <ellipse
        cx={0}
        cy={upperLeg + lowerLeg + 10}
        rx={46}
        ry={12}
        fill={isClassicDark ? "rgba(0, 229, 255, 0.16)" : "rgba(15, 23, 42, 0.16)"}
      />

      {/* Running / Braking Animated Dust Puffs (like style-2a-demo.mp4!) */}
      {showDustPuffs &&
        [0, 1, 2].map((i) => {
          const p = ((frame * 0.08 + i * 0.33) % 1);
          const puffX = -25 - p * 115;
          const puffY = upperLeg + lowerLeg + 4 - p * 34 - Math.sin(p * Math.PI) * 14;
          const puffR = 10 + p * 22;
          return (
            <circle
              key={`puff-${i}`}
              cx={puffX}
              cy={puffY}
              r={puffR}
              fill={isClassicDark ? "rgba(255,255,255,0.25)" : "rgba(148,163,184,0.45)"}
              opacity={1 - p}
            />
          );
        })}

      {/* BACK ARM (Left Arm) */}
      <path
        d={`M ${shoulderX} ${shoulderY + 8} L ${armL.ex} ${armL.ey} L ${armL.hx} ${armL.hy}`}
        fill="none"
        stroke={lineCol}
        strokeWidth="10"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <circle
        cx={armL.hx}
        cy={armL.hy}
        r="9"
        fill={isClassicDark ? DARK_VOID : PURE_WHITE}
        stroke={lineCol}
        strokeWidth="5"
      />

      {/* BACK LEG (Left Leg) */}
      <path
        d={`M ${hipX - 6} ${hipY} L ${legL.kx} ${legL.ky} L ${legL.fx} ${legL.fy}`}
        fill="none"
        stroke={lineCol}
        strokeWidth="11"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      {/* Left Sneaker */}
      <g
        transform={`translate(${legL.fx}, ${legL.fy}) rotate(${
          -legL.lDeg * 0.35 + footAngleL
        })`}
      >
        <path
          d="M -10 -4 L 22 -2 Q 30 4 24 10 L -12 10 Z"
          fill={isClassicDark ? PURE_WHITE : PURE_WHITE}
          stroke={lineCol}
          strokeWidth="5"
          strokeLinejoin="round"
        />
      </g>

      {/* TORSO: Style 2A Yellow T-Shirt + Black Shorts OR Style 1 Single Line */}
      {isClassicDark || isShadow ? (
        <line
          x1={hipX}
          y1={hipY}
          x2={shoulderX}
          y2={shoulderY}
          stroke={lineCol}
          strokeWidth="11"
          strokeLinecap="round"
        />
      ) : (
        <g
          transform={`translate(${hipX}, ${hipY}) rotate(${torsoLean})`}
        >
          {/* Black Shorts */}
          <path
            d="M -18 -8 L 18 -8 L 22 18 L 3 18 L 0 8 L -3 18 L -22 18 Z"
            fill={INK}
            stroke={INK}
            strokeWidth="4"
            strokeLinejoin="round"
          />
          {/* Yellow T-Shirt Torso (Exact style-2a-demo.mp4 look!) */}
          <path
            d={`M -22 -6 L -26 ${-torsoLen + 8} Q 0 ${-torsoLen - 4} 26 ${
              -torsoLen + 8
            } L 22 -6 Z`}
            fill={SHIRT_YELLOW}
            stroke={INK}
            strokeWidth="6.5"
            strokeLinejoin="round"
          />
          {/* Subtle Yellow Shirt Shadow Fold */}
          <path
            d={`M -16 -12 L -18 ${-torsoLen + 18}`}
            stroke={SHIRT_SHADOW}
            strokeWidth="5"
            strokeLinecap="round"
          />
        </g>
      )}

      {/* FRONT LEG (Right Leg) */}
      <path
        d={`M ${hipX + 6} ${hipY} L ${legR.kx} ${legR.ky} L ${legR.fx} ${legR.fy}`}
        fill="none"
        stroke={lineCol}
        strokeWidth="11"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      {/* Right Sneaker */}
      <g
        transform={`translate(${legR.fx}, ${legR.fy}) rotate(${
          -legR.lDeg * 0.35 + footAngleR
        })`}
      >
        <path
          d="M -10 -4 L 24 -2 Q 32 4 26 10 L -12 10 Z"
          fill={PURE_WHITE}
          stroke={lineCol}
          strokeWidth="5"
          strokeLinejoin="round"
        />
      </g>

      {/* HEAD + RED BEANIE (Style 2A Zeke) or Hollow Circle (Style 1 Dark) */}
      <g
        transform={`translate(${headX}, ${headY}) rotate(${
          torsoLean * 0.45 + headTilt
        })`}
      >
        {/* Round Head */}
        <circle
          cx={0}
          cy={0}
          r={38}
          fill={isClassicDark ? DARK_VOID : isShadow ? "#2A0810" : PURE_WHITE}
          stroke={lineCol}
          strokeWidth="7"
        />

        {/* Expressive Minimal Eyes & Brows */}
        {expression === "shocked" ? (
          <g>
            <circle cx={10} cy={-2} r={5} fill={lineCol} />
            <circle cx={26} cy={-2} r={5} fill={lineCol} />
            <ellipse
              cx={18}
              cy={15}
              rx={7}
              ry={9}
              fill="none"
              stroke={lineCol}
              strokeWidth="4.5"
            />
          </g>
        ) : expression === "strained" ? (
          <g stroke={lineCol} strokeWidth="4.5" strokeLinecap="round" fill="none">
            <path d="M 4 -8 L 14 -3 L 4 2" />
            <path d="M 30 -8 L 20 -3 L 30 2" />
            <path d="M 8 15 Q 18 9 28 15" />
          </g>
        ) : expression === "happy" ? (
          <g stroke={lineCol} strokeWidth="4.5" strokeLinecap="round" fill="none">
            <path d="M 5 -4 Q 10 -12 15 -4" />
            <path d="M 21 -4 Q 26 -12 31 -4" />
            <path d="M 8 10 Q 18 22 28 10" />
          </g>
        ) : (
          <g>
            <circle cx={11} cy={-3} r={4.2} fill={lineCol} />
            <circle cx={26} cy={-3} r={4.2} fill={lineCol} />
            <path
              d={
                expression === "calm"
                  ? "M 10 12 Q 18 18 26 12"
                  : "M 10 13 L 25 11"
              }
              fill="none"
              stroke={lineCol}
              strokeWidth="4"
              strokeLinecap="round"
            />
          </g>
        )}

        {/* Style 2A Red Knit Beanie (Smooth rounded knit, ribbed cuff, no pom-pom!) */}
        {!isClassicDark && !isShadow && (
          <g transform="translate(-2, -14) rotate(-8)">
            {/* Beanie Dome */}
            <path
              d="M -38 2 C -38 -36, 38 -36, 38 2 Z"
              fill={BEANIE_RED}
              stroke={INK}
              strokeWidth="6"
              strokeLinejoin="round"
            />
            {/* Beanie Ribbed Cuff */}
            <rect
              x={-41}
              y={-6}
              width={82}
              height={16}
              rx={8}
              fill={BEANIE_CUFF}
              stroke={INK}
              strokeWidth="5.5"
            />
            {/* Rib lines on cuff */}
            {[-24, -12, 0, 12, 24].map((rx) => (
              <line
                key={`rib-${rx}`}
                x1={rx}
                y1={-4}
                x2={rx}
                y2={8}
                stroke={INK}
                strokeWidth="3"
              />
            ))}
          </g>
        )}
      </g>

      {/* FRONT ARM (Right Arm) + Optional Glowing Cyan Light-Pen */}
      <path
        d={`M ${shoulderX} ${shoulderY + 8} L ${armR.ex} ${armR.ey} L ${armR.hx} ${armR.hy}`}
        fill="none"
        stroke={lineCol}
        strokeWidth="10.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <circle
        cx={armR.hx}
        cy={armR.hy}
        r="9.5"
        fill={isClassicDark ? DARK_VOID : PURE_WHITE}
        stroke={lineCol}
        strokeWidth="5"
      />

      {holdingLightPen && (
        <g transform={`translate(${armR.hx}, ${armR.hy}) rotate(-28)`}>
          <rect
            x={-6}
            y={-38}
            width={12}
            height={44}
            rx={6}
            fill={INK}
            stroke={PURE_WHITE}
            strokeWidth="3"
          />
          <circle cx={0} cy={-42} r={10} fill={CYAN_GLOW} />
          <circle cx={0} cy={-42} r={20} fill={CYAN_GLOW} opacity={0.35} />
        </g>
      )}
    </g>
  );
};

// ============================================================================
// 3. TOP HUD & CHAPTER HEADER (Minimalist Director Mode Overlay)
// ============================================================================
const DirectorTopHUD: React.FC<{
  sceneNum: number;
  beatLabel: string;
  title: string;
  isDark?: boolean;
}> = ({ sceneNum, beatLabel, title, isDark = false }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const enter = spring({ frame, fps, config: { damping: 15, stiffness: 140 } });

  return (
    <div
      style={{
        position: "absolute",
        top: 64,
        left: 52,
        right: 52,
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        transform: `translateY(${interpolate(enter, [0, 1], [-40, 0])}px)`,
        opacity: enter,
        pointerEvents: "none",
      }}
    >
      <div
        style={{
          display: "inline-flex",
          alignItems: "center",
          gap: 12,
          padding: "8px 22px",
          borderRadius: 999,
          backgroundColor: isDark
            ? "rgba(15, 23, 42, 0.88)"
            : "rgba(255, 255, 255, 0.92)",
          border: `3px solid ${isDark ? CYAN_GLOW : INK}`,
          boxShadow: isDark
            ? "0 0 24px rgba(0, 229, 255, 0.35)"
            : "4px 4px 0px #0F172A",
          marginBottom: 14,
        }}
      >
        <span
          style={{
            width: 12,
            height: 12,
            borderRadius: "50%",
            backgroundColor: BEANIE_RED,
            display: "inline-block",
          }}
        />
        <span
          style={{
            fontSize: 22,
            fontWeight: 900,
            letterSpacing: 1.5,
            color: isDark ? PURE_WHITE : INK,
          }}
        >
          SCENE {String(sceneNum).padStart(2, "0")} · {beatLabel}
        </span>
      </div>

      <div
        style={{
          fontSize: 52,
          fontWeight: 900,
          color: isDark ? PURE_WHITE : INK,
          textAlign: "center",
          lineHeight: 1.15,
          padding: "10px 28px",
          backgroundColor: isDark
            ? "rgba(9, 11, 16, 0.78)"
            : "rgba(255, 255, 255, 0.88)",
          borderRadius: 20,
          border: `3.5px solid ${isDark ? "rgba(255,255,255,0.28)" : INK}`,
          boxShadow: isDark
            ? "0 12px 32px rgba(0,0,0,0.65)"
            : "6px 6px 0px #0F172A",
        }}
      >
        {title}
      </div>
    </div>
  );
};

// ============================================================================
// 4. SCENE 1 (0.0s – 6.2s): SPRINTING INTO THE NOTIFICATION STORM
// [0-2s] Beat 1: Zeke sprints across the perspective grid as red alerts rain down
// [2-4.2s] Beat 2: Camera zooms in as a giant red message barrier drops in front of him
// [4.2-6.2s] Beat 3: Zeke skids to a stop with dust puffs & dodges exploding alerts
// ============================================================================
const Scene01NotificationStorm: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const t = frame / fps;

  const beat = t < 2.1 ? 1 : t < 4.3 ? 2 : 3;
  const camZoom =
    beat === 1
      ? interpolate(t, [0, 2.1], [1.0, 1.08])
      : beat === 2
        ? interpolate(t, [2.1, 4.3], [1.14, 1.22])
        : interpolate(t, [4.3, 6.2], [1.06, 1.0]);

  const shakeX = beat === 2 ? Math.sin(frame * 1.4) * 8 : 0;
  const shakeY = beat === 2 ? Math.cos(frame * 1.7) * 6 : 0;

  // Zeke X position across the floor
  const zekeX =
    beat === 1
      ? interpolate(t, [0, 2.1], [160, 520])
      : beat === 2
        ? 460
        : 480 + Math.sin(frame * 0.45) * 45;

  const barrierDropY = spring({
    frame: Math.max(0, frame - 58),
    fps,
    config: { damping: 12, stiffness: 180 },
  });

  return (
    <AbsoluteFill>
      <PerspectiveStudioEnvironment
        theme="studio_light"
        scrollX={t * 360}
        scrollZ={t * 2.4}
        horizonY={1140}
      />

      <svg
        width="1080"
        height="1920"
        style={{
          position: "absolute",
          inset: 0,
          transform: `translate(${shakeX}px, ${shakeY}px) scale(${camZoom})`,
          transformOrigin: "540px 1180px",
        }}
      >
        {/* Falling Giant Red Notification Meteors (starting below Top HUD at y=340) */}
        {[
          { x: 260, delay: 4, label: "TIN NHẮN CỤT LỦN!" },
          { x: 770, delay: 18, label: "ĐÃ XEM · IM LẶNG" },
          { x: 340, delay: 95, label: "SAO KHÔNG TRẢ LỜI?!" },
        ].map((m, i) => {
          const localF = Math.max(0, frame - m.delay);
          const fallY = Math.min(1180, 340 + localF * 22);
          const op = Math.min(1, localF / 6);
          return (
            <g
              key={`meteor-${i}`}
              transform={`translate(${m.x}, ${fallY})`}
              opacity={op}
            >
              <rect
                x={-160}
                y={-52}
                width={320}
                height={92}
                rx={20}
                fill={PURE_WHITE}
                stroke={INK}
                strokeWidth="6"
              />
              <rect
                x={-144}
                y={-34}
                width={52}
                height={52}
                rx={12}
                fill={DANGER_RED}
              />
              <text
                x={-118}
                y={6}
                textAnchor="middle"
                fontSize="36"
                fontWeight="900"
                fill={PURE_WHITE}
              >
                !
              </text>
              <text
                x={28}
                y={4}
                textAnchor="middle"
                fontSize="24"
                fontWeight="900"
                fill={INK}
              >
                {m.label}
              </text>
            </g>
          );
        })}

        {/* Beat 2 & 3: Giant Glass Smartphone Monolith slamming onto the grid */}
        {frame >= 55 && (
          <g
            transform={`translate(760, ${interpolate(
              barrierDropY,
              [0, 1],
              [-450, 1020]
            )})`}
          >
            {/* Impact floor shockwave rings */}
            <ellipse
              cx={0}
              cy={240}
              rx={160 + ((frame * 6) % 140)}
              ry={38 + ((frame * 2) % 35)}
              fill="none"
              stroke={DANGER_RED}
              strokeWidth="6"
              opacity={0.65}
            />
            <rect
              x={-135}
              y={-320}
              width={270}
              height={540}
              rx={34}
              fill="#0F172A"
              stroke={INK}
              strokeWidth="8"
            />
            <rect
              x={-115}
              y={-280}
              width={230}
              height={460}
              rx={20}
              fill="#FEF2F2"
            />
            {/* Giant Red Exclamation Bubble on Screen */}
            <circle cx={0} cy={-95} r={68} fill={DANGER_RED} stroke={INK} strokeWidth="6" />
            <text
              x={0}
              y={-68}
              textAnchor="middle"
              fontSize="82"
              fontWeight="900"
              fill={PURE_WHITE}
            >
              !
            </text>
            <text
              x={0}
              y={45}
              textAnchor="middle"
              fontSize="30"
              fontWeight="900"
              fill={DANGER_RED}
            >
              BẤT AN TỨC THÌ
            </text>
            <text
              x={0}
              y={92}
              textAnchor="middle"
              fontSize="24"
              fontWeight="800"
              fill={INK}
            >
              TIM ĐẬP NHANH 120 BPM
            </text>
          </g>
        )}

        {/* Zeke Full-Motion Kinematic Rig */}
        <ZekeKinematicActor
          x={zekeX}
          y={1135}
          scale={1.38}
          action={
            beat === 1
              ? "run"
              : beat === 2
                ? "brake_look_down"
                : "panic_dodge"
          }
          frame={frame}
          facing={1}
          expression={beat === 1 ? "focused" : "shocked"}
          showDustPuffs={beat <= 2}
        />
      </svg>

      <DirectorTopHUD
        sceneNum={1}
        beatLabel={`BEAT ${beat}/3 · KÍCH THÍCH BẤT NGỜ`}
        title="BẪY PHẢN ỨNG TỨC THÌ"
      />
    </AbsoluteFill>
  );
};

// ============================================================================
// 5. SCENE 2 (6.2s – 11.4s): THE CHASM OF OVERTHINKING (3-PANEL DIAGONAL SPLIT!)
// Modeled directly after dark-theme-demo.mp4_4s.jpg & style-2a-demo.mp4_4s.jpg:
// [0-1.8s] Beat 1: Zeke runs up to a deep chasm in the floor & skids at the cliff edge
// [1.8-3.6s] Beat 2: Screen splits into 3 diagonal panels (Pointing Crowd | Red X | Giant Stamp!)
// [3.6-5.2s] Beat 3: Zeke pulls back from the abyss as tangled thoughts swirl above
// ============================================================================
const Scene02ChasmAndDiagonalSplit: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const t = frame / fps;
  const beat = t < 1.8 ? 1 : t < 3.6 ? 2 : 3;

  const zekeX =
    beat === 1 ? interpolate(t, [0, 1.5], [140, 355], { extrapolateRight: "clamp" }) : 355;

  const stampSlam = spring({
    frame: Math.max(0, frame - 62),
    fps,
    config: { damping: 11, stiffness: 200 },
  });

  return (
    <AbsoluteFill>
      <PerspectiveStudioEnvironment
        theme={beat === 2 ? "classic_dark" : "studio_light"}
        scrollX={beat === 1 ? t * 280 : 420}
        scrollZ={t * 1.6}
        horizonY={1100}
        chasmRange={[490, 920]}
      />

      {beat !== 2 ? (
        <svg width="1080" height="1920" style={{ position: "absolute", inset: 0 }}>
          {/* Swirling Tangled Scribble Cloud Rising from the Abyss */}
          <g transform={`translate(710, ${840 + Math.sin(frame * 0.15) * 18})`}>
            <path
              d="M -180 0 C -220 -140, 180 -180, 160 -20 C 140 120, -160 140, -120 -60 C -80 -200, 220 -80, 90 90 C -40 210, -210 50, 0 -90"
              fill="none"
              stroke={DANGER_RED}
              strokeWidth="8"
              strokeDasharray="24 12"
            />
            <text
              x={0}
              y={-15}
              textAnchor="middle"
              fontSize="36"
              fontWeight="900"
              fill={DANGER_RED}
            >
              SUY DIỄN VÔ TẬN
            </text>
            <text
              x={0}
              y={32}
              textAnchor="middle"
              fontSize="26"
              fontWeight="800"
              fill={INK}
            >
              &quot;HỌ GHÉT MÌNH RỒI?!&quot;
            </text>
          </g>

          {/* Zeke skidding at the cliff edge looking down into the chasm (style-2a-demo.mp4_4s.jpg!) */}
          <ZekeKinematicActor
            x={zekeX}
            y={1090}
            scale={1.42}
            action={t < 1.35 ? "run" : "brake_look_down"}
            frame={frame}
            facing={1}
            expression="shocked"
            showDustPuffs={true}
          />
        </svg>
      ) : (
        /* BEAT 2: EXACT 3-PANEL DIAGONAL SPLIT SCREEN FROM dark-theme-demo.mp4_4s.jpg! */
        <svg width="1080" height="1920" style={{ position: "absolute", inset: 0 }}>
          <rect width="1080" height="1920" fill={DARK_VOID} />

          {/* PANEL 1 (LEFT): Silhouettes pointing accusing fingers at Stickman */}
          <g>
            <text
              x="210"
              y="520"
              textAnchor="middle"
              fontSize="32"
              fontWeight="900"
              fill={PURE_WHITE}
            >
              BỊ ĐÁNH GIÁ?
            </text>
            {[720, 920, 1120].map((py, idx) => (
              <g
                key={`finger-${idx}`}
                transform={`translate(${60 + Math.sin(frame * 0.3 + idx) * 18}, ${py})`}
              >
                <line
                  x1="0"
                  y1="0"
                  x2="130"
                  y2="25"
                  stroke={DANGER_RED}
                  strokeWidth="12"
                  strokeLinecap="round"
                />
                <polygon points="130,10 165,28 125,42" fill={DANGER_RED} />
              </g>
            ))}
            <ZekeKinematicActor
              x={255}
              y={1020}
              scale={1.05}
              action="panic_dodge"
              frame={frame}
              variant="classic_dark"
              expression="shocked"
            />
          </g>

          {/* PANEL 2 (MIDDLE): Giant Red X over Message Envelope */}
          <g transform="translate(540, 960)">
            <rect
              x="-120"
              y="-85"
              width="240"
              height="170"
              rx="18"
              fill="none"
              stroke={PURE_WHITE}
              strokeWidth="8"
            />
            <path
              d="M -115 -80 L 0 20 L 115 -80"
              fill="none"
              stroke={PURE_WHITE}
              strokeWidth="8"
            />
            {/* Animated Giant Red Cross X */}
            <line
              x1="-145"
              y1="-125"
              x2="145"
              y2="125"
              stroke={DANGER_RED}
              strokeWidth="22"
              strokeLinecap="round"
            />
            <line
              x1="145"
              y1="-125"
              x2="-145"
              y2="125"
              stroke={DANGER_RED}
              strokeWidth="22"
              strokeLinecap="round"
            />
            <text
              x="0"
              y="195"
              textAnchor="middle"
              fontSize="32"
              fontWeight="900"
              fill={DANGER_RED}
            >
              BỊ BỎ RƠI?
            </text>
          </g>

          {/* PANEL 3 (RIGHT): Giant Red Rubber Stamp Slamming Down */}
          <g
            transform={`translate(875, ${interpolate(
              stampSlam,
              [0, 1],
              [480, 920]
            )})`}
          >
            <rect
              x="-45"
              y="-220"
              width="90"
              height="140"
              rx="16"
              fill="none"
              stroke={PURE_WHITE}
              strokeWidth="8"
            />
            <rect
              x="-115"
              y="-80"
              width="230"
              height="65"
              rx="12"
              fill={DANGER_RED}
              stroke={PURE_WHITE}
              strokeWidth="7"
            />
            <text
              x="0"
              y="75"
              textAnchor="middle"
              fontSize="44"
              fontWeight="900"
              fill={DANGER_RED}
            >
              THẤT BẠI!
            </text>
          </g>

          {/* Bold White Diagonal Comic Split Borders */}
          <line
            x1="410"
            y1="340"
            x2="310"
            y2="1560"
            stroke={PURE_WHITE}
            strokeWidth="10"
          />
          <line
            x1="730"
            y1="340"
            x2="640"
            y2="1560"
            stroke={PURE_WHITE}
            strokeWidth="10"
          />
        </svg>
      )}

      <DirectorTopHUD
        sceneNum={2}
        beatLabel={`BEAT ${beat}/3 · HỐ SÂU SUY DIỄN`}
        title="ẢO GIÁC CỦA NÃO BỘ"
        isDark={beat === 2}
      />
    </AbsoluteFill>
  );
};

// ============================================================================
// 6. SCENE 3 (11.4s – 19.3s): EMOTIONAL DOMINO CHAIN REACTION
// [0-2.6s] Beat 1: Zeke angrily kicks the first red domino block
// [2.6-5.4s] Beat 2: Camera pans right as 4 giant red dominoes topple sequentially
// [5.4-7.9s] Beat 3: The final colossal domino falls back toward Zeke; he braces & pushes!
// ============================================================================
const Scene03DominoChainReaction: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const t = frame / fps;
  const beat = t < 2.6 ? 1 : t < 5.4 ? 2 : 3;

  const camPanX =
    beat === 1
      ? 0
      : beat === 2
        ? interpolate(t, [2.6, 5.2], [0, -240], { extrapolateRight: "clamp" })
        : interpolate(t, [5.4, 7.9], [-240, -90], { extrapolateRight: "clamp" });

  const dominoLabels = [
    "NÓI NẶNG LỜI",
    "TRANH CÃI",
    "MẤT KIỂM SOÁT",
    "HỐI HẬN MUỘN",
  ];

  return (
    <AbsoluteFill>
      <PerspectiveStudioEnvironment
        theme="studio_light"
        scrollX={-camPanX}
        scrollZ={t * 1.4}
        horizonY={1180}
      />

      <svg
        width="1080"
        height="1920"
        style={{
          position: "absolute",
          inset: 0,
          transform: `translateX(${camPanX}px)`,
        }}
      >
        {/* 4 Giant Red Domino Monoliths toppling in sequence */}
        {dominoLabels.map((label, idx) => {
          const triggerT = 1.2 + idx * 0.95;
          const progress = Math.max(0, Math.min(1, (t - triggerT) / 0.85));
          const tiltAngle =
            idx === 3 && beat === 3
              ? -28 // Final domino leans back against Zeke in Beat 3!
              : progress * 56;
          const baseX = 430 + idx * 215;
          const height = 340 + idx * 45;

          return (
            <g
              key={`domino-${idx}`}
              transform={`translate(${baseX}, 1220) rotate(${tiltAngle})`}
            >
              <rect
                x={-48}
                y={-height}
                width={96}
                height={height}
                rx={14}
                fill={idx === 3 ? DANGER_RED : PURE_WHITE}
                stroke={INK}
                strokeWidth="7"
              />
              <text
                x={0}
                y={-height / 2}
                textAnchor="middle"
                fontSize="26"
                fontWeight="900"
                fill={idx === 3 ? PURE_WHITE : DANGER_RED}
                transform={`rotate(-90, 0, ${-height / 2})`}
              >
                {label}
              </text>
            </g>
          );
        })}

        {/* Zeke kicking in Beat 1, running alongside in Beat 2, pushing heavy block in Beat 3 */}
        <ZekeKinematicActor
          x={
            beat === 1
              ? interpolate(t, [0, 1.1], [140, 310], { extrapolateRight: "clamp" })
              : beat === 2
                ? interpolate(t, [2.6, 5.2], [310, 740], { extrapolateRight: "clamp" })
                : 910
          }
          y={1140}
          scale={1.38}
          action={
            beat === 1
              ? t < 1.0
                ? "run"
                : "kick_domino"
              : beat === 2
                ? "run"
                : "push_heavy"
          }
          frame={frame}
          facing={1}
          expression={beat === 3 ? "strained" : "focused"}
          showDustPuffs={true}
        />
      </svg>

      <DirectorTopHUD
        sceneNum={3}
        beatLabel={`BEAT ${beat}/3 · HIỆU ỨNG DOMINO`}
        title="PHẢN ỨNG DÂY CHUYỀN"
      />
    </AbsoluteFill>
  );
};

// ============================================================================
// 7. SCENE 4 (19.3s – 27.9s): THE TUG OF WAR WITH OTHERS' OPINIONS
// [0-2.8s] Beat 1: Red shadow clone pulls Zeke by a glowing rope across the grid
// [2.8-5.8s] Beat 2: Zeke plants his sneakers & pulls out the glowing cyan light-pen
// [5.8-8.6s] Beat 3: Zeke slices the red puppet strings with a cyan slash & sprints free!
// ============================================================================
const Scene04PuppetStringsCut: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const t = frame / fps;
  const beat = t < 2.8 ? 1 : t < 5.8 ? 2 : 3;

  const zekeX =
    beat === 1
      ? interpolate(t, [0, 2.8], [260, 440])
      : beat === 2
        ? 410
        : interpolate(t, [5.8, 8.6], [410, 220]);

  return (
    <AbsoluteFill>
      <PerspectiveStudioEnvironment
        theme="classic_dark"
        scrollX={t * 210}
        scrollZ={t * 1.8}
        horizonY={1140}
      />

      <svg width="1080" height="1920" style={{ position: "absolute", inset: 0 }}>
        {/* Red Shadow Clone on the Right Pulling the Rope */}
        <ZekeKinematicActor
          x={840}
          y={1135}
          scale={1.45}
          action={beat < 3 ? "push_heavy" : "panic_dodge"}
          frame={frame}
          facing={-1}
          variant="shadow_clone"
          expression="strained"
        />
        <text
          x={840}
          y={850}
          textAnchor="middle"
          fontSize="30"
          fontWeight="900"
          fill={DANGER_RED}
        >
          PHÁN XÉT CỦA NGƯỜI KHÁC
        </text>

        {/* Glowing Red Tension Rope between Zeke & Shadow Clone */}
        {beat < 3 ? (
          <path
            d={`M ${zekeX + 55} 1050 Q 640 ${
              1050 + Math.sin(frame * 0.8) * 16
            } 775 1050`}
            fill="none"
            stroke={DANGER_RED}
            strokeWidth="9"
            strokeDasharray="18 8"
          />
        ) : (
          /* Beat 3: Snapped rope ends + Cyan Light Blade Slash! */
          <g>
            <path
              d="M 540 860 L 660 1220"
              stroke={CYAN_GLOW}
              strokeWidth="16"
              strokeLinecap="round"
              filter="url(#cyanGlow)"
            />
            <text
              x="590"
              y="815"
              textAnchor="middle"
              fontSize="38"
              fontWeight="900"
              fill={CYAN_GLOW}
            >
              CẮT ĐỨT DÂY GIẬT!
            </text>
          </g>
        )}

        {/* Zeke */}
        <ZekeKinematicActor
          x={zekeX}
          y={1135}
          scale={1.42}
          action={
            beat === 1
              ? "push_heavy"
              : beat === 2
                ? "draw_light_pen"
                : "leap"
          }
          frame={frame}
          facing={1}
          holdingLightPen={beat >= 2}
          expression={beat === 1 ? "strained" : "focused"}
          showDustPuffs={true}
        />
      </svg>

      <DirectorTopHUD
        sceneNum={4}
        beatLabel={`BEAT ${beat}/3 · DÂY GIẬT CẢM XÚC`}
        title="AI ĐANG ĐIỀU KHIỂN BẠN?"
        isDark={true}
      />
    </AbsoluteFill>
  );
};

// ============================================================================
// 8. SCENE 5 (27.9s – 36.2s): EPICTETUS — DRAWING THE BRIDGE ACROSS FATE
// Exact homage to style-2a-demo.mp4!
// [0-2.7s] Beat 1: Zeke runs up to a wide chasm labeled "10% CHUYỆN XẢY RA"
// [2.7-5.6s] Beat 2: Zeke uses his glowing cyan light-pen to draw a luminous bridge ("90% CÁCH PHẢN ỨNG")
// [5.6-8.3s] Beat 3: Zeke sprints and leaps across the glowing cyan bridge!
// ============================================================================
const Scene05EpictetusBridge: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const t = frame / fps;
  const beat = t < 2.7 ? 1 : t < 5.6 ? 2 : 3;

  const bridgeProgress = Math.max(
    0,
    Math.min(1, interpolate(t, [2.7, 5.2], [0, 1]))
  );

  const zekeX =
    beat === 1
      ? interpolate(t, [0, 2.5], [120, 310], { extrapolateRight: "clamp" })
      : beat === 2
        ? 310
        : interpolate(t, [5.6, 8.2], [310, 920], { extrapolateRight: "clamp" });

  const zekeY =
    beat === 3
      ? 1100 - Math.sin(interpolate(t, [5.6, 8.2], [0, Math.PI], { extrapolateRight: "clamp" })) * 150
      : 1100;

  return (
    <AbsoluteFill>
      <PerspectiveStudioEnvironment
        theme="studio_light"
        scrollX={t * 180}
        scrollZ={t * 1.5}
        horizonY={1120}
        chasmRange={[390, 780]}
      />

      <svg width="1080" height="1920" style={{ position: "absolute", inset: 0 }}>
        {/* Floating Holographic Glass Equation Panel (Style 2A Studio Tech) */}
        <g transform="translate(540, 640)">
          <rect
            x="-430"
            y="-125"
            width="860"
            height="230"
            rx="28"
            fill="rgba(255, 255, 255, 0.94)"
            stroke={CYAN_GLOW}
            strokeWidth="6"
          />
          <text
            x="-235"
            y="-18"
            textAnchor="middle"
            fontSize="44"
            fontWeight="900"
            fill={DANGER_RED}
          >
            10% SỰ VIỆC
          </text>
          <text
            x="0"
            y="-18"
            textAnchor="middle"
            fontSize="46"
            fontWeight="900"
            fill={INK}
          >
            +
          </text>
          <text
            x="235"
            y="-18"
            textAnchor="middle"
            fontSize="44"
            fontWeight="900"
            fill={ELECTRIC_BLUE}
          >
            90% PHẢN ỨNG
          </text>
          <text
            x="0"
            y="64"
            textAnchor="middle"
            fontSize="30"
            fontWeight="800"
            fill={INK}
          >
            TRIẾT GIA KHẮC KỶ EPICTETUS
          </text>
        </g>

        {/* Glowing Cyan Bridge Drawn Across the Chasm in Beat 2 & 3 */}
        {bridgeProgress > 0 && (
          <g>
            <path
              d={`M 360 1165 Q 585 ${1110 - bridgeProgress * 30} ${
                360 + bridgeProgress * 460
              } 1165`}
              fill="none"
              stroke={CYAN_GLOW}
              strokeWidth="18"
              strokeLinecap="round"
            />
            <path
              d={`M 360 1165 Q 585 ${1110 - bridgeProgress * 30} ${
                360 + bridgeProgress * 460
              } 1165`}
              fill="none"
              stroke={ELECTRIC_BLUE}
              strokeWidth="6"
              strokeLinecap="round"
            />
          </g>
        )}

        {/* Zeke running -> drawing bridge with light-pen -> leaping across! */}
        <ZekeKinematicActor
          x={zekeX}
          y={zekeY}
          scale={1.4}
          action={
            beat === 1
              ? t < 2.2
                ? "run"
                : "brake_look_down"
              : beat === 2
                ? "draw_light_pen"
                : "leap"
          }
          frame={frame}
          facing={1}
          holdingLightPen={beat >= 2}
          expression={beat === 3 ? "happy" : "focused"}
          showDustPuffs={beat !== 2}
        />
      </svg>

      <DirectorTopHUD
        sceneNum={5}
        beatLabel={`BEAT ${beat}/3 · QUY LUẬT 10 / 90`}
        title="VẼ CÂY CẦU LÀM CHỦ"
      />
    </AbsoluteFill>
  );
};

// ============================================================================
// 9. SCENE 6 (36.2s – 44.3s): CAPTAIN AT THE HELM IN A STORM
// [0-2.7s] Beat 1: Lightning & storm waves rock the deck while a clone panics
// [2.7-5.5s] Beat 2: Zeke runs to the center glowing cyan ship wheel & grips it
// [5.5-8.1s] Beat 3: Zeke turns the wheel -> expanding cyan radar shield calms the sea!
// ============================================================================
const Scene06CaptainAtTheHelm: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const t = frame / fps;
  const beat = t < 2.7 ? 1 : t < 5.5 ? 2 : 3;

  const deckTilt =
    beat === 1
      ? Math.sin(frame * 0.22) * 9
      : beat === 2
        ? Math.sin(frame * 0.16) * 4
        : 0;

  const wheelAngle = beat === 1 ? frame * 6 : Math.sin(frame * 0.18) * 35;

  return (
    <AbsoluteFill>
      <PerspectiveStudioEnvironment
        theme="dusk_cinematic"
        scrollX={t * 160}
        scrollZ={t * 2.0}
        horizonY={1150}
      />

      <svg
        width="1080"
        height="1920"
        style={{
          position: "absolute",
          inset: 0,
          transform: `rotate(${deckTilt}deg)`,
          transformOrigin: "540px 1150px",
        }}
      >
        {/* Beat 3 Expanding Calm Cyan Dome Shield */}
        {beat === 3 && (
          <circle
            cx={540}
            cy={1120}
            r={interpolate(t, [5.5, 8.0], [120, 620], { extrapolateRight: "clamp" })}
            fill="rgba(0, 229, 255, 0.12)"
            stroke={CYAN_GLOW}
            strokeWidth="8"
          />
        )}

        {/* Giant Glowing Cyan Ship Wheel */}
        <g transform={`translate(540, 1060) rotate(${wheelAngle})`}>
          <circle
            cx={0}
            cy={0}
            r={135}
            fill="none"
            stroke={beat === 1 ? DANGER_RED : CYAN_GLOW}
            strokeWidth="16"
          />
          <circle
            cx={0}
            cy={0}
            r={34}
            fill={DARK_VOID}
            stroke={PURE_WHITE}
            strokeWidth="8"
          />
          {[0, 45, 90, 135, 180, 225, 270, 315].map((ang) => (
            <line
              key={`spoke-${ang}`}
              x1={0}
              y1={-175}
              x2={0}
              y2={175}
              stroke={beat === 1 ? DANGER_RED : CYAN_GLOW}
              strokeWidth="10"
              strokeLinecap="round"
              transform={`rotate(${ang})`}
            />
          ))}
        </g>

        {/* Zeke running to the wheel in Beat 1, steering in Beat 2 & 3 */}
        <ZekeKinematicActor
          x={
            beat === 1
              ? interpolate(t, [0, 2.5], [150, 470], { extrapolateRight: "clamp" })
              : 470
          }
          y={1145}
          scale={1.42}
          action={beat === 1 ? "run" : "steer_wheel"}
          frame={frame}
          facing={1}
          expression={beat === 3 ? "calm" : "focused"}
          showDustPuffs={beat === 1}
        />
      </svg>

      <DirectorTopHUD
        sceneNum={6}
        beatLabel={`BEAT ${beat}/3 · TAY LÁI CẢM XÚC`}
        title="GIỮ VỮNG BÁNH LÁI"
        isDark={true}
      />
    </AbsoluteFill>
  );
};

// ============================================================================
// 10. SCENE 7 (44.3s – 51.6s): AMYGDALA ALARM VS PREFRONTAL CORTEX
// [0-2.4s] Beat 1: Giant red Amygdala Siren flashes & shakes the studio
// [2.4-4.9s] Beat 2: Zeke leaps up to a floating cyan glass control console
// [4.9-7.3s] Beat 3: Zeke pulls the giant switch from RED (BẢN NĂNG) to CYAN (LÝ TRÍ)!
// ============================================================================
const Scene07BrainSwitch: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const t = frame / fps;
  const beat = t < 2.4 ? 1 : t < 4.9 ? 2 : 3;

  const switchFlip = spring({
    frame: Math.max(0, frame - 145),
    fps,
    config: { damping: 12, stiffness: 160 },
  });

  return (
    <AbsoluteFill>
      <PerspectiveStudioEnvironment
        theme="studio_light"
        scrollX={t * 200}
        scrollZ={t * 1.4}
        horizonY={1160}
      />

      <svg width="1080" height="1920" style={{ position: "absolute", inset: 0 }}>
        {/* Giant Brain Control Dashboard Panel */}
        <g transform="translate(540, 760)">
          <rect
            x="-420"
            y="-220"
            width="840"
            height="420"
            rx="32"
            fill={PURE_WHITE}
            stroke={INK}
            strokeWidth="8"
          />
          {/* Left Side: Amygdala Red Siren */}
          <g transform="translate(-210, -20)">
            <circle
              cx="0"
              cy="-30"
              r="78"
              fill={beat < 3 ? DANGER_RED : "#E2E8F0"}
              stroke={INK}
              strokeWidth="6"
            />
            <text
              x="0"
              y="-8"
              textAnchor="middle"
              fontSize="46"
              fontWeight="900"
              fill={beat < 3 ? PURE_WHITE : INK}
            >
              SOS
            </text>
            <text
              x="0"
              y="105"
              textAnchor="middle"
              fontSize="30"
              fontWeight="900"
              fill={DANGER_RED}
            >
              HẠCH HẠNH NHÂN
            </text>
            <text
              x="0"
              y="142"
              textAnchor="middle"
              fontSize="22"
              fontWeight="800"
              fill={INK}
            >
              PHẢN VỆ CẢM TÍNH
            </text>
          </g>

          {/* Right Side: Prefrontal Cortex Cyan Core */}
          <g transform="translate(210, -20)">
            <circle
              cx="0"
              cy="-30"
              r="78"
              fill={beat === 3 ? CYAN_GLOW : "#E2E8F0"}
              stroke={INK}
              strokeWidth="6"
            />
            <text
              x="0"
              y="-8"
              textAnchor="middle"
              fontSize="42"
              fontWeight="900"
              fill={INK}
            >
              IQ
            </text>
            <text
              x="0"
              y="105"
              textAnchor="middle"
              fontSize="30"
              fontWeight="900"
              fill={ELECTRIC_BLUE}
            >
              VỎ NÃO TRƯỚC TRÁN
            </text>
            <text
              x="0"
              y="142"
              textAnchor="middle"
              fontSize="22"
              fontWeight="800"
              fill={INK}
            >
              PHÂN TÍCH LÝ TRÍ
            </text>
          </g>

          {/* Center Lever Switch */}
          <rect
            x="-75"
            y="-45"
            width="150"
            height="64"
            rx="32"
            fill={beat === 3 ? EMERALD_GLOW : DANGER_RED}
            stroke={INK}
            strokeWidth="6"
          />
          <circle
            cx={interpolate(switchFlip, [0, 1], [-38, 38])}
            cy="-13"
            r="26"
            fill={PURE_WHITE}
            stroke={INK}
            strokeWidth="5"
          />
        </g>

        {/* Zeke running in -> leaping up to flip the switch -> landing confidently */}
        <ZekeKinematicActor
          x={
            beat === 1
              ? interpolate(t, [0, 2.3], [160, 480], { extrapolateRight: "clamp" })
              : 510
          }
          y={beat === 2 ? 980 : 1140}
          scale={1.38}
          action={
            beat === 1
              ? "run"
              : beat === 2
                ? "leap"
                : "celebrate_summit"
          }
          frame={frame}
          facing={1}
          expression={beat === 3 ? "happy" : "focused"}
          showDustPuffs={beat !== 2}
        />
      </svg>

      <DirectorTopHUD
        sceneNum={7}
        beatLabel={`BEAT ${beat}/3 · KHOA HỌC THẦN KINH`}
        title="CHUYỂN CÔNG TẮC NÃO BỘ"
      />
    </AbsoluteFill>
  );
};

// ============================================================================
// 11. SCENE 8 (51.6s – 60.2s): THE SACRED 3-SECOND PAUSE GAP
// [0-2.8s] Beat 1: Two giant walls ("KÍCH THÍCH" & "PHẢN ỨNG") slam toward Zeke
// [2.8-5.8s] Beat 2: Zeke braces both hands & pushes the walls apart with a cyan forcefield!
// [5.8-8.6s] Beat 3: Inside the wide golden gap, a 3-second chronometer ticks 1s -> 2s -> 3s!
// ============================================================================
const Scene08SacredPauseGap: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const t = frame / fps;
  const beat = t < 2.8 ? 1 : t < 5.8 ? 2 : 3;

  const wallOffset =
    beat === 1
      ? interpolate(t, [0, 2.6], [380, 165], { extrapolateRight: "clamp" })
      : interpolate(t, [2.8, 5.4], [165, 360], { extrapolateRight: "clamp" });

  const secCount = Math.min(3, Math.max(1, Math.ceil((t - 3.2) / 1.5)));

  return (
    <AbsoluteFill>
      <PerspectiveStudioEnvironment
        theme="classic_dark"
        scrollX={0}
        scrollZ={t * 1.2}
        horizonY={1180}
      />

      <svg width="1080" height="1920" style={{ position: "absolute", inset: 0 }}>
        {/* Left Giant Sliding Wall: KÍCH THÍCH */}
        <g transform={`translate(${540 - wallOffset}, 960)`}>
          <rect
            x="-280"
            y="-420"
            width="280"
            height="720"
            rx="22"
            fill="#1E293B"
            stroke={DANGER_RED}
            strokeWidth="8"
          />
          <text
            x="-140"
            y="-40"
            textAnchor="middle"
            fontSize="44"
            fontWeight="900"
            fill={DANGER_RED}
          >
            KÍCH THÍCH
          </text>
        </g>

        {/* Right Giant Sliding Wall: PHẢN ỨNG */}
        <g transform={`translate(${540 + wallOffset}, 960)`}>
          <rect
            x="0"
            y="-420"
            width="280"
            height="720"
            rx="22"
            fill="#1E293B"
            stroke={CYAN_GLOW}
            strokeWidth="8"
          />
          <text
            x="140"
            y="-40"
            textAnchor="middle"
            fontSize="44"
            fontWeight="900"
            fill={CYAN_GLOW}
          >
            LỰA CHỌN
          </text>
        </g>

        {/* Expanding Golden/Cyan Forcefield Sphere in Beat 2 & 3 */}
        {beat >= 2 && (
          <g transform="translate(540, 740)">
            <circle
              cx="0"
              cy="0"
              r="145"
              fill="rgba(0, 229, 255, 0.14)"
              stroke={CYAN_GLOW}
              strokeWidth="8"
            />
            <text
              x="0"
              y="18"
              textAnchor="middle"
              fontSize="86"
              fontWeight="900"
              fill={SHIRT_YELLOW}
            >
              0{secCount}s
            </text>
            <text
              x="0"
              y="195"
              textAnchor="middle"
              fontSize="30"
              fontWeight="900"
              fill={PURE_WHITE}
            >
              KHOẢNG DỪNG TỰ DO
            </text>
          </g>
        )}

        {/* Zeke pushing the giant walls apart */}
        <ZekeKinematicActor
          x={540}
          y={1145}
          scale={1.42}
          action={
            beat === 1
              ? "panic_dodge"
              : beat === 2
                ? "push_heavy"
                : "celebrate_summit"
          }
          frame={frame}
          facing={1}
          expression={beat === 3 ? "calm" : "strained"}
          showDustPuffs={true}
        />
      </svg>

      <DirectorTopHUD
        sceneNum={8}
        beatLabel={`BEAT ${beat}/3 · KHOẢNG TRỐNG 3 GIÂY`}
        title="TẠM DỪNG TRƯỚC KHI ĐÁP TRẢ"
        isDark={true}
      />
    </AbsoluteFill>
  );
};

// ============================================================================
// 12. SCENE 9 (60.2s – 67.6s): STEPPING OUT OF THE EMOTIONAL WHIRLPOOL
// [0-2.5s] Beat 1: Zeke is spun inside a giant red floor vortex
// [2.5-5.0s] Beat 2: Zeke leaps high out of the vortex onto a solid glass platform
// [5.0-7.4s] Beat 3: Zeke observes the emotion from outside like a calm scientist
// ============================================================================
const Scene09StepOutOfVortex: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const t = frame / fps;
  const beat = t < 2.5 ? 1 : t < 5.0 ? 2 : 3;

  const zekeX =
    beat === 1
      ? 330 + Math.cos(frame * 0.25) * 45
      : beat === 2
        ? interpolate(t, [2.5, 4.8], [330, 760], { extrapolateRight: "clamp" })
        : 760;

  const zekeY =
    beat === 2
      ? 1120 - Math.sin(interpolate(t, [2.5, 4.8], [0, Math.PI], { extrapolateRight: "clamp" })) * 210
      : beat === 3
        ? 980
        : 1150;

  return (
    <AbsoluteFill>
      <PerspectiveStudioEnvironment
        theme="studio_light"
        scrollX={t * 150}
        scrollZ={t * 1.5}
        horizonY={1140}
      />

      <svg width="1080" height="1920" style={{ position: "absolute", inset: 0 }}>
        {/* Swirling Red Whirlpool Vortex on Left Floor */}
        <g transform={`translate(330, 1220) scale(1, 0.38) rotate(${frame * 5})`}>
          {[220, 165, 110, 60].map((r, i) => (
            <circle
              key={`vortex-${i}`}
              cx={0}
              cy={0}
              r={r}
              fill="none"
              stroke={DANGER_RED}
              strokeWidth="12"
              strokeDasharray="48 24"
            />
          ))}
        </g>
        <text
          x={330}
          y={1355}
          textAnchor="middle"
          fontSize="30"
          fontWeight="900"
          fill={DANGER_RED}
        >
          XOÁY CẢM XÚC
        </text>

        {/* Elevated Glowing Cyan Observation Platform on Right */}
        <g transform="translate(760, 1130)">
          <rect
            x="-150"
            y="0"
            width="300"
            height="42"
            rx="16"
            fill={PURE_WHITE}
            stroke={ELECTRIC_BLUE}
            strokeWidth="7"
          />
          <text
            x="0"
            y="90"
            textAnchor="middle"
            fontSize="30"
            fontWeight="900"
            fill={ELECTRIC_BLUE}
          >
            NGƯỜI QUAN SÁT TỈNH TÁO
          </text>
        </g>

        {/* Zeke escaping the vortex onto the platform */}
        <ZekeKinematicActor
          x={zekeX}
          y={zekeY}
          scale={1.38}
          action={
            beat === 1
              ? "panic_dodge"
              : beat === 2
                ? "leap"
                : "walk"
          }
          frame={frame}
          facing={beat === 3 ? -1 : 1}
          expression={beat === 3 ? "calm" : "focused"}
          showDustPuffs={beat === 2}
        />
      </svg>

      <DirectorTopHUD
        sceneNum={9}
        beatLabel={`BEAT ${beat}/3 · TÁCH KHỎI CƠN GIẬN`}
        title="BƯỚC RA KHỎI VÒNG XOÁY"
      />
    </AbsoluteFill>
  );
};

// ============================================================================
// 13. SCENE 10 (67.6s – 75.5s): 4-SECOND DEEP BREATHING & SILENCE SHIELD
// [0-2.6s] Beat 1: Incoming red arrows fly toward Zeke from the right
// [2.6-5.2s] Beat 2: Zeke taps his sneaker -> a 4-second breathing halo expands
// [5.2-7.9s] Beat 3: The arrows bounce harmlessly off the glowing emerald shield!
// ============================================================================
const Scene10BreathingShield: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const t = frame / fps;
  const beat = t < 2.6 ? 1 : t < 5.2 ? 2 : 3;

  const breathScale = 1 + Math.sin(frame * 0.12) * 0.22;

  return (
    <AbsoluteFill>
      <PerspectiveStudioEnvironment
        theme="studio_light"
        scrollX={t * 140}
        scrollZ={t * 1.2}
        horizonY={1150}
      />

      <svg width="1080" height="1920" style={{ position: "absolute", inset: 0 }}>
        {/* Expanding Emerald/Cyan Breathing Halo around Zeke */}
        <g transform={`translate(380, 1020) scale(${breathScale})`}>
          <circle
            cx={0}
            cy={0}
            r={210}
            fill="rgba(16, 185, 129, 0.14)"
            stroke={EMERALD_GLOW}
            strokeWidth="10"
          />
          <circle
            cx={0}
            cy={0}
            r={160}
            fill="none"
            stroke={CYAN_GLOW}
            strokeWidth="5"
            strokeDasharray="20 12"
          />
        </g>

        <text
          x={380}
          y={720}
          textAnchor="middle"
          fontSize="38"
          fontWeight="900"
          fill={EMERALD_GLOW}
        >
          HÍT SÂU 4 GIÂY · CHỌN SỰ IM LẶNG
        </text>

        {/* Incoming Red Provocation Arrows deflecting off the shield */}
        {[880, 1020, 1160].map((ay, idx) => {
          const arrowX =
            beat < 3
              ? interpolate(t, [0, 4.5], [1020 - idx * 80, 610], {
                  extrapolateRight: "clamp",
                })
              : interpolate(t, [5.2, 7.8], [610, 960], {
                  extrapolateRight: "clamp",
                });
          const rot = beat < 3 ? 0 : 28 + idx * 12;
          return (
            <g
              key={`arrow-${idx}`}
              transform={`translate(${arrowX}, ${ay}) rotate(${rot})`}
            >
              <line
                x1="0"
                y1="0"
                x2="130"
                y2="0"
                stroke={DANGER_RED}
                strokeWidth="12"
                strokeLinecap="round"
              />
              <polygon points="-24,0 12,-18 12,18" fill={DANGER_RED} />
            </g>
          );
        })}

        {/* Zeke walking calmly inside the breathing shield */}
        <ZekeKinematicActor
          x={380}
          y={1140}
          scale={1.42}
          action={beat === 1 ? "walk" : "draw_light_pen"}
          frame={frame}
          facing={1}
          holdingLightPen={true}
          expression="calm"
        />
      </svg>

      <DirectorTopHUD
        sceneNum={10}
        beatLabel={`BEAT ${beat}/3 · KHIÊN CHẮN TĨNH LẶNG`}
        title="SỨC MẠNH CỦA HƠI THỞ"
      />
    </AbsoluteFill>
  );
};

// ============================================================================
// 14. SCENE 11 (75.5s – 82.3s): CLIMBING THE 3 GOLDEN STEPS OF MASTERY
// [0-2.2s] Beat 1: Zeke leaps onto Step 1 ("HÍT THỞ 4 GIÂY")
// [2.2-4.5s] Beat 2: Zeke leaps onto Step 2 ("ĐẶT CÂU HỎI")
// [4.5-6.8s] Beat 3: Zeke leaps onto Step 3 ("PHẢN HỒI CÓ CHỌN LỌC") & raises trophy!
// ============================================================================
const Scene11ClimbingSteps: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const t = frame / fps;
  const beat = t < 2.2 ? 1 : t < 4.5 ? 2 : 3;

  const zekeX =
    beat === 1
      ? interpolate(t, [0, 2.0], [160, 290], { extrapolateRight: "clamp" })
      : beat === 2
        ? interpolate(t, [2.2, 4.2], [290, 540], { extrapolateRight: "clamp" })
        : interpolate(t, [4.5, 6.4], [540, 800], { extrapolateRight: "clamp" });

  const zekeY =
    beat === 1
      ? 1100
      : beat === 2
        ? 950
        : 800;

  const steps = [
    { x: 290, y: 1230, h: 150, label: "1. THỞ SÂU 4S", col: CYAN_GLOW },
    { x: 540, y: 1080, h: 300, label: "2. ĐẶT CÂU HỎI", col: SHIRT_YELLOW },
    { x: 800, y: 930, h: 450, label: "3. CHỌN PHẢN HỒI", col: EMERALD_GLOW },
  ];

  return (
    <AbsoluteFill>
      <PerspectiveStudioEnvironment
        theme="studio_light"
        scrollX={t * 180}
        scrollZ={t * 1.4}
        horizonY={1240}
      />

      <svg width="1080" height="1920" style={{ position: "absolute", inset: 0 }}>
        {steps.map((s, idx) => {
          const active = beat >= idx + 1;
          return (
            <g key={`step-${idx}`} transform={`translate(${s.x}, ${s.y})`}>
              <rect
                x="-115"
                y="0"
                width="230"
                height={s.h}
                rx="18"
                fill={active ? s.col : PURE_WHITE}
                stroke={INK}
                strokeWidth="7"
              />
              <text
                x="0"
                y="54"
                textAnchor="middle"
                fontSize="24"
                fontWeight="900"
                fill={INK}
              >
                {s.label}
              </text>
            </g>
          );
        })}

        <ZekeKinematicActor
          x={zekeX}
          y={zekeY}
          scale={1.32}
          action={beat < 3 ? "leap" : "celebrate_summit"}
          frame={frame}
          facing={1}
          expression="happy"
          showDustPuffs={true}
        />
      </svg>

      <DirectorTopHUD
        sceneNum={11}
        beatLabel={`BEAT ${beat}/3 · 3 BƯỚC RÈN LUYỆN`}
        title="LỘ TRÌNH LÀM CHỦ CẢM XÚC"
      />
    </AbsoluteFill>
  );
};

// ============================================================================
// 15. SCENE 12 (82.3s – 90.0s): RUNNING INTO THE GOLDEN HORIZON + FINALE QUOTE
// [0-2.8s] Beat 1: Zeke sprints along a glowing highway toward a rising golden sun
// [2.8-5.2s] Beat 2: Zeke pushes open the giant glowing portal of emotional freedom
// [5.2-7.7s] Beat 3: Progressive Quote Pill Box lights up word-by-word synced with Haitrieu!
// ============================================================================
const Scene12GoldenHorizonFinale: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const t = frame / fps;
  const globalSec = 82.3 + t;
  const beat = t < 2.8 ? 1 : t < 5.2 ? 2 : 3;

  const finaleWords = HAITRIEU_WORDS.filter((w) => w.start >= 82.2);

  return (
    <AbsoluteFill>
      <PerspectiveStudioEnvironment
        theme="dusk_cinematic"
        scrollX={0}
        scrollZ={t * 2.8}
        horizonY={1080}
      />

      <svg width="1080" height="1920" style={{ position: "absolute", inset: 0 }}>
        {/* Rising Golden Horizon Sun */}
        <circle
          cx={540}
          cy={1080}
          r={240 + Math.sin(frame * 0.1) * 12}
          fill={AMBER_GOLD}
          opacity={0.85}
        />
        <circle
          cx={540}
          cy={1080}
          r={320}
          fill="none"
          stroke={SHIRT_YELLOW}
          strokeWidth="6"
          strokeDasharray="24 16"
        />

        {/* Zeke running forward and celebrating at the golden horizon */}
        <ZekeKinematicActor
          x={540}
          y={1145}
          scale={1.45}
          action={beat < 3 ? "run" : "celebrate_summit"}
          frame={frame}
          facing={1}
          expression="happy"
          showDustPuffs={beat < 3}
        />
      </svg>

      {/* Progressive Quote Pill Box (Synced word-by-word with Haitrieu VO!) */}
      <div
        style={{
          position: "absolute",
          top: 430,
          left: 64,
          right: 64,
          padding: "34px 38px",
          borderRadius: 32,
          backgroundColor: "rgba(9, 11, 16, 0.88)",
          border: `3.5px solid ${SHIRT_YELLOW}`,
          boxShadow: "0 20px 50px rgba(0,0,0,0.7)",
          display: "flex",
          flexWrap: "wrap",
          justifyContent: "center",
          gap: "10px 12px",
        }}
      >
        {finaleWords.map((w, idx) => {
          const isLit = globalSec >= w.start;
          const isCurrent = globalSec >= w.start && globalSec <= w.end + 0.15;
          return (
            <span
              key={`fw-${idx}`}
              style={{
                fontSize: 38,
                fontWeight: 900,
                color: isCurrent
                  ? SHIRT_YELLOW
                  : isLit
                    ? PURE_WHITE
                    : "rgba(255, 255, 255, 0.25)",
                textShadow: isCurrent
                  ? "0 0 18px rgba(250, 204, 21, 0.85)"
                  : "none",
                transition: "color 0.1s ease",
              }}
            >
              {w.word}
            </span>
          );
        })}
      </div>

      <DirectorTopHUD
        sceneNum={12}
        beatLabel={`BEAT ${beat}/3 · TỰ DO NỘI TÂM`}
        title="LÀM CHỦ CẢM XÚC · LÀM CHỦ CUỘC ĐỜI"
        isDark={true}
      />
    </AbsoluteFill>
  );
};

// ============================================================================
// 16. BOTTOM KARAOKE WORD-BY-WORD CAPTION BAR (High-Contrast Studio Pill)
// ============================================================================
const DirectorKaraokeBar: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const currentSec = frame / fps;

  // Group into 6-word chunks
  const chunkSize = 6;
  const activeIdx = HAITRIEU_WORDS.findIndex(
    (w, i) =>
      currentSec >= w.start &&
      (currentSec <= w.end ||
        (HAITRIEU_WORDS[i + 1] && currentSec < HAITRIEU_WORDS[i + 1].start))
  );

  if (activeIdx === -1) return null;
  const chunkStart = Math.floor(activeIdx / chunkSize) * chunkSize;
  const chunk = HAITRIEU_WORDS.slice(chunkStart, chunkStart + chunkSize);

  return (
    <div
      style={{
        position: "absolute",
        bottom: 130,
        left: 48,
        right: 48,
        display: "flex",
        justifyContent: "center",
        pointerEvents: "none",
      }}
    >
      <div
        style={{
          backgroundColor: "rgba(15, 23, 42, 0.94)",
          border: `4px solid ${SHIRT_YELLOW}`,
          borderRadius: 28,
          padding: "20px 32px",
          boxShadow: "0 14px 36px rgba(0,0,0,0.48)",
          display: "flex",
          flexWrap: "wrap",
          justifyContent: "center",
          gap: "8px 12px",
          maxWidth: 960,
        }}
      >
        {chunk.map((word, idx) => {
          const globalWordIdx = chunkStart + idx;
          const isCurrent = globalWordIdx === activeIdx;
          const isPast = globalWordIdx < activeIdx;
          return (
            <span
              key={`${word.start}-${idx}`}
              style={{
                fontSize: 44,
                fontWeight: 900,
                color: isCurrent
                  ? SHIRT_YELLOW
                  : isPast
                    ? PURE_WHITE
                    : "rgba(255,255,255,0.48)",
                transform: isCurrent ? "scale(1.1)" : "scale(1)",
                display: "inline-block",
              }}
            >
              {word.word}
            </span>
          );
        })}
      </div>
    </div>
  );
};

// ============================================================================
// 17. MASTER COMPOSITION: StickmanFullMotion9x16 (2700 frames = 90.0s @ 30fps)
// ============================================================================
const SCENE_TIMELINE = [
  { start: 0.0, end: 6.2, Comp: Scene01NotificationStorm },
  { start: 6.2, end: 11.4, Comp: Scene02ChasmAndDiagonalSplit },
  { start: 11.4, end: 19.3, Comp: Scene03DominoChainReaction },
  { start: 19.3, end: 27.9, Comp: Scene04PuppetStringsCut },
  { start: 27.9, end: 36.2, Comp: Scene05EpictetusBridge },
  { start: 36.2, end: 44.3, Comp: Scene06CaptainAtTheHelm },
  { start: 44.3, end: 51.6, Comp: Scene07BrainSwitch },
  { start: 51.6, end: 60.2, Comp: Scene08SacredPauseGap },
  { start: 60.2, end: 67.6, Comp: Scene09StepOutOfVortex },
  { start: 67.6, end: 75.5, Comp: Scene10BreathingShield },
  { start: 75.5, end: 82.3, Comp: Scene11ClimbingSteps },
  { start: 82.3, end: 90.0, Comp: Scene12GoldenHorizonFinale },
];

export const StickmanFullMotion9x16: React.FC<StickmanFullMotion9x16Props> = () => {
  const { fps } = useVideoConfig();

  return (
    <AbsoluteFill
      style={{
        backgroundColor: STUDIO_WHITE,
        fontFamily: "'Inter', 'Segoe UI', system-ui, sans-serif",
      }}
    >
      <Audio src={staticFile("episodes/reactive-mind/master_mix_haitrieu_90s.wav")} />

      {SCENE_TIMELINE.map(({ start, end, Comp }, idx) => {
        const fromFrame = Math.round(start * fps);
        const durationInFrames = Math.max(1, Math.round((end - start) * fps));
        return (
          <Sequence
            key={`fm-scene-${idx}`}
            from={fromFrame}
            durationInFrames={durationInFrames}
          >
            <Comp />
          </Sequence>
        );
      })}

      <DirectorKaraokeBar />
    </AbsoluteFill>
  );
};
