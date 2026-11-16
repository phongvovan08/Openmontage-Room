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

export interface StickmanB1DirectorProps {
  durationSeconds?: number;
}

// ============================================================================
// B1 · MINIMAL HAND-DRAWN CONSTANTS (Exact from b1-minimal-handdrawn.md)
// ============================================================================
const PAPER_BG = "#FDFDFC";
const GRID_COLOR = "rgba(76, 90, 105, 0.048)";
const INK = "#141619";
const MUTED_INK = "#525866";
const ACCENT_RED = "#DC2626";
const ACCENT_YELLOW = "#EAB308";
const ACCENT_GREEN = "#16A34A";
const STICKY_YELLOW = "#FEF08A";
const STICKY_GREEN = "#DCFCE7";

// ============================================================================
// 1. B1 PAPER CANVAS WITH FAINT SQUARE GRID + SOLID BOTTOM CAPTION SAFE BAND
// ============================================================================
const B1GridPaperStage: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const gridSpacing = 72;
  const cols = Math.ceil(1080 / gridSpacing);
  const captionBandTop = 1560; // Solid paper below y=1560 for clean captions
  const rows = Math.ceil(captionBandTop / gridSpacing);

  return (
    <AbsoluteFill
      style={{
        backgroundColor: PAPER_BG,
        overflow: "hidden",
        fontFamily: "'Segoe Print', 'Comic Sans MS', 'Inter', system-ui, sans-serif",
      }}
    >
      <svg width="1080" height="1920" style={{ position: "absolute", inset: 0 }}>
        {/* Faint Square Grid above Caption Band (b1-minimal-handdrawn.md rule) */}
        <g stroke={GRID_COLOR} strokeWidth="1.2">
          {Array.from({ length: cols + 1 }).map((_, c) => (
            <line
              key={`v-${c}`}
              x1={c * gridSpacing}
              y1={0}
              x2={c * gridSpacing}
              y2={captionBandTop}
            />
          ))}
          {Array.from({ length: rows + 1 }).map((_, r) => (
            <line
              key={`h-${r}`}
              x1={0}
              y1={r * gridSpacing}
              x2={1080}
              y2={r * gridSpacing}
            />
          ))}
        </g>

        {children}
      </svg>
    </AbsoluteFill>
  );
};

// ============================================================================
// 2. B1 SLENDER STICKMAN ACTOR (Exact proportions from character-acting-reference.png)
// Round white head, 2 tuft hairs, expressive brows & mouth, single-line torso
// & limbs, small white oval hands & feet, whole-body lean & acting poses!
// ============================================================================
type B1StickmanPose =
  | "desk_typing"
  | "holding_tower"
  | "slumped_stool"
  | "defensive_crown"
  | "pointing_aha"
  | "steering_calm"
  | "climbing_steps";

const B1StickmanActor: React.FC<{
  x: number;
  y: number;
  scale?: number;
  pose: B1StickmanPose;
  emotion: "frustrated" | "strained" | "sad" | "angry" | "happy" | "calm";
  frame: number;
  flipX?: boolean;
}> = ({ x, y, scale = 1, pose, emotion, frame, flipX = false }) => {
  const bob = Math.sin(frame * 0.18) * 3;
  const fastJitter = Math.sin(frame * 0.65) * 2.5;

  const renderFace = (headX: number, headY: number, lookDir = 1) => {
    const ex = headX + lookDir * 14;
    const ey = headY - 4;
    return (
      <g>
        {/* 2 curved tuft hairs on top of head */}
        <path
          d={`M ${headX - 6} ${headY - 52} Q ${headX - 18} ${headY - 72} ${headX - 30} ${headY - 64}`}
          fill="none"
          stroke={INK}
          strokeWidth="4.5"
          strokeLinecap="round"
        />
        <path
          d={`M ${headX + 2} ${headY - 52} Q ${headX + 12} ${headY - 70} ${headX + 24} ${headY - 60}`}
          fill="none"
          stroke={INK}
          strokeWidth="4.5"
          strokeLinecap="round"
        />

        {/* Round white head */}
        <circle
          cx={headX}
          cy={headY}
          r={52}
          fill="#FFFFFF"
          stroke={INK}
          strokeWidth="5.5"
        />

        {/* Eyes & Brows by Emotion */}
        {emotion === "frustrated" || emotion === "angry" ? (
          <>
            {/* Pinched V-brows */}
            <path
              d={`M ${ex - 22} ${ey - 22} L ${ex - 4} ${ey - 12}`}
              stroke={INK}
              strokeWidth="4.5"
              strokeLinecap="round"
            />
            <path
              d={`M ${ex + 22} ${ey - 22} L ${ex + 6} ${ey - 12}`}
              stroke={INK}
              strokeWidth="4.5"
              strokeLinecap="round"
            />
            <ellipse cx={ex - 10} cy={ey - 2} rx="5.5" ry="9" fill={INK} />
            <ellipse cx={ex + 12} cy={ey - 2} rx="5.5" ry="9" fill={INK} />
            {/* Wide open frustrated mouth */}
            <path
              d={`M ${ex - 14} ${ey + 18} Q ${ex + 4} ${ey + 12} ${ex + 18} ${ey + 20} Q ${ex + 14} ${ey + 36} ${ex - 10} ${ey + 32} Z`}
              fill="#FFFFFF"
              stroke={INK}
              strokeWidth="4.5"
              strokeLinejoin="round"
            />
          </>
        ) : emotion === "strained" ? (
          <>
            {/* Worried raised brows */}
            <path
              d={`M ${ex - 22} ${ey - 14} Q ${ex - 12} ${ey - 24} ${ex - 4} ${ey - 18}`}
              fill="none"
              stroke={INK}
              strokeWidth="4.5"
              strokeLinecap="round"
            />
            <path
              d={`M ${ex + 4} ${ey - 18} Q ${ex + 12} ${ey - 24} ${ex + 22} ${ey - 14}`}
              fill="none"
              stroke={INK}
              strokeWidth="4.5"
              strokeLinecap="round"
            />
            <ellipse cx={ex - 10} cy={ey - 3} rx="5.5" ry="8.5" fill={INK} />
            <ellipse cx={ex + 10} cy={ey - 3} rx="5.5" ry="8.5" fill={INK} />
            {/* Open strained grimace mouth with tongue line */}
            <path
              d={`M ${ex - 16} ${ey + 16} C ${ex - 16} ${ey + 8}, ${ex + 18} ${ey + 8}, ${ex + 18} ${ey + 26} C ${ex + 18} ${ey + 34}, ${ex - 16} ${ey + 34}, ${ex - 16} ${ey + 24} Z`}
              fill="#FFFFFF"
              stroke={INK}
              strokeWidth="4.5"
            />
            <path
              d={`M ${ex - 12} ${ey + 22} Q ${ex + 2} ${ey + 18} ${ex + 15} ${ey + 24}`}
              fill="none"
              stroke={INK}
              strokeWidth="3.5"
            />
            {/* Flying sweat drops */}
            <ellipse
              cx={headX + 68}
              cy={headY - 18 + fastJitter}
              rx="5"
              ry="9"
              transform={`rotate(25 ${headX + 68} ${headY - 18})`}
              fill="#FFFFFF"
              stroke={INK}
              strokeWidth="3.5"
            />
            <ellipse
              cx={headX + 62}
              cy={headY + 12 - fastJitter}
              rx="4.5"
              ry="8"
              transform={`rotate(35 ${headX + 62} ${headY + 12})`}
              fill="#FFFFFF"
              stroke={INK}
              strokeWidth="3.5"
            />
          </>
        ) : emotion === "sad" ? (
          <>
            {/* Drooping sad brows */}
            <path
              d={`M ${ex - 22} ${ey - 10} L ${ex - 6} ${ey - 18}`}
              stroke={INK}
              strokeWidth="4.5"
              strokeLinecap="round"
            />
            <path
              d={`M ${ex + 6} ${ey - 18} L ${ex + 22} ${ey - 10}`}
              stroke={INK}
              strokeWidth="4.5"
              strokeLinecap="round"
            />
            <ellipse cx={ex - 9} cy={ey} rx="4.5" ry="6.5" fill={INK} />
            <ellipse cx={ex + 11} cy={ey} rx="4.5" ry="6.5" fill={INK} />
            {/* Deflated frown + small tear */}
            <path
              d={`M ${ex - 12} ${ey + 24} Q ${ex + 2} ${ey + 14} ${ex + 14} ${ey + 24}`}
              fill="none"
              stroke={INK}
              strokeWidth="4.5"
              strokeLinecap="round"
            />
            <circle cx={ex - 16} cy={ey + 8} r="3" fill={INK} />
          </>
        ) : (
          <>
            {/* Happy / Calm arched brows */}
            <path
              d={`M ${ex - 20} ${ey - 18} Q ${ex - 10} ${ey - 26} ${ex - 2} ${ey - 18}`}
              fill="none"
              stroke={INK}
              strokeWidth="4"
              strokeLinecap="round"
            />
            <path
              d={`M ${ex + 4} ${ey - 18} Q ${ex + 14} ${ey - 26} ${ex + 22} ${ey - 18}`}
              fill="none"
              stroke={INK}
              strokeWidth="4"
              strokeLinecap="round"
            />
            <ellipse cx={ex - 9} cy={ey - 2} rx="5" ry="8" fill={INK} />
            <ellipse cx={ex + 11} cy={ey - 2} rx="5" ry="8" fill={INK} />
            {/* Broad confident grin */}
            <path
              d={`M ${ex - 14} ${ey + 14} Q ${ex + 2} ${ey + 32} ${ex + 18} ${ey + 14} Z`}
              fill="#FFFFFF"
              stroke={INK}
              strokeWidth="4.5"
              strokeLinejoin="round"
            />
          </>
        )}
      </g>
    );
  };

  return (
    <g
      transform={`translate(${x}, ${y}) scale(${flipX ? -scale : scale}, ${scale})`}
    >
      {pose === "holding_tower" && (
        <g>
          {/* Leaning back torso */}
          <path
            d="M 0 -110 L 38 35"
            stroke={INK}
            strokeWidth="6"
            strokeLinecap="round"
          />
          {/* Wide braced legs */}
          <path
            d="M 38 35 L -10 115 L 8 190"
            fill="none"
            stroke={INK}
            strokeWidth="6"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
          <path
            d="M 38 35 L 95 115 L 145 190"
            fill="none"
            stroke={INK}
            strokeWidth="6"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
          {/* Oval white feet */}
          <ellipse
            cx="-4"
            cy="192"
            rx="18"
            ry="7"
            fill="#FFFFFF"
            stroke={INK}
            strokeWidth="5"
          />
          <ellipse
            cx="156"
            cy="192"
            rx="18"
            ry="7"
            fill="#FFFFFF"
            stroke={INK}
            strokeWidth="5"
          />
          {/* Two arms reaching up & left to support wobbling stack */}
          <path
            d={`M 8 -85 Q -45 -135 ${-75 + fastJitter} -210`}
            fill="none"
            stroke={INK}
            strokeWidth="5.5"
            strokeLinecap="round"
          />
          <path
            d={`M 16 -55 Q -35 -35 ${-82 + fastJitter} -45`}
            fill="none"
            stroke={INK}
            strokeWidth="5.5"
            strokeLinecap="round"
          />
          <ellipse
            cx={-78 + fastJitter}
            cy={-215}
            rx="12"
            ry="8"
            fill="#FFFFFF"
            stroke={INK}
            strokeWidth="4.5"
          />
          <ellipse
            cx={-88 + fastJitter}
            cy={-45}
            rx="12"
            ry="8"
            fill="#FFFFFF"
            stroke={INK}
            strokeWidth="4.5"
          />
          {renderFace(-8, -162 + bob, -1)}
        </g>
      )}

      {pose === "slumped_stool" && (
        <g>
          {/* Round hand-drawn stool */}
          <ellipse
            cx="30"
            cy="75"
            rx="56"
            ry="12"
            fill="#FFFFFF"
            stroke={INK}
            strokeWidth="5"
          />
          <path
            d="M -14 84 L -24 190 M 12 87 L 8 190 M 52 87 L 56 190 M 74 84 L 84 190"
            stroke={INK}
            strokeWidth="5"
            strokeLinecap="round"
          />
          {/* Slumped curved back */}
          <path
            d="M -15 -95 Q 35 -40 35 68"
            fill="none"
            stroke={INK}
            strokeWidth="6"
            strokeLinecap="round"
          />
          {/* Seated bent legs */}
          <path
            d="M 35 68 L -55 95 L -55 188"
            fill="none"
            stroke={INK}
            strokeWidth="6"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
          <path
            d="M 35 68 L 5 102 L 15 188"
            fill="none"
            stroke={INK}
            strokeWidth="6"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
          <ellipse
            cx="-68"
            cy="190"
            rx="16"
            ry="7"
            fill="#FFFFFF"
            stroke={INK}
            strokeWidth="5"
          />
          <ellipse
            cx="2"
            cy="190"
            rx="16"
            ry="7"
            fill="#FFFFFF"
            stroke={INK}
            strokeWidth="5"
          />
          {/* Drooping arms */}
          <path
            d="M 5 -65 L -38 25 L -15 80"
            fill="none"
            stroke={INK}
            strokeWidth="5.5"
            strokeLinecap="round"
          />
          {renderFace(-28, -142 + bob, -1)}
        </g>
      )}

      {(pose === "pointing_aha" ||
        pose === "defensive_crown" ||
        pose === "steering_calm" ||
        pose === "desk_typing" ||
        pose === "climbing_steps") && (
        <g>
          {/* Upright / slightly leaning slender torso */}
          <path
            d="M 0 -105 L -6 45"
            stroke={INK}
            strokeWidth="6"
            strokeLinecap="round"
          />
          {/* Two standing legs */}
          <path
            d="M -6 45 L -42 120 L -48 190"
            fill="none"
            stroke={INK}
            strokeWidth="6"
            strokeLinecap="round"
          />
          <path
            d="M -6 45 L 34 120 L 42 190"
            fill="none"
            stroke={INK}
            strokeWidth="6"
            strokeLinecap="round"
          />
          <ellipse
            cx="-58"
            cy="192"
            rx="17"
            ry="7"
            fill="#FFFFFF"
            stroke={INK}
            strokeWidth="5"
          />
          <ellipse
            cx="52"
            cy="192"
            rx="17"
            ry="7"
            fill="#FFFFFF"
            stroke={INK}
            strokeWidth="5"
          />

          {/* Arms by pose */}
          {pose === "pointing_aha" ? (
            <>
              {/* Left arm writing on desk */}
              <path
                d={`M -2 -75 L -58 -20 L ${-45 + fastJitter} 18`}
                fill="none"
                stroke={INK}
                strokeWidth="5.5"
                strokeLinecap="round"
              />
              <ellipse
                cx={-45 + fastJitter}
                cy={20}
                rx="10"
                ry="7"
                fill="#FFFFFF"
                stroke={INK}
                strokeWidth="4.5"
              />
              {/* Right arm raised pointing up ("aha!") */}
              <path
                d={`M 2 -75 L 55 -105 L 78 ${-160 + bob}`}
                fill="none"
                stroke={INK}
                strokeWidth="5.5"
                strokeLinecap="round"
              />
              <ellipse
                cx={78}
                cy={-165 + bob}
                rx="10"
                ry="8"
                fill="#FFFFFF"
                stroke={INK}
                strokeWidth="4.5"
              />
            </>
          ) : pose === "defensive_crown" ? (
            <>
              {/* Crossed defensive arms */}
              <path
                d="M -2 -75 L -52 -25 L 28 -30"
                fill="none"
                stroke={INK}
                strokeWidth="5.5"
                strokeLinecap="round"
              />
              <path
                d="M 2 -75 L 52 -25 L -28 -30"
                fill="none"
                stroke={INK}
                strokeWidth="5.5"
                strokeLinecap="round"
              />
            </>
          ) : (
            <>
              {/* Active gesturing arms */}
              <path
                d={`M -2 -75 L -62 -28 L ${-82 + bob} -42`}
                fill="none"
                stroke={INK}
                strokeWidth="5.5"
                strokeLinecap="round"
              />
              <path
                d={`M 2 -75 L 62 -28 L ${82 - bob} -48`}
                fill="none"
                stroke={INK}
                strokeWidth="5.5"
                strokeLinecap="round"
              />
              <ellipse
                cx={-85 + bob}
                cy={-44}
                rx="11"
                ry="7"
                fill="#FFFFFF"
                stroke={INK}
                strokeWidth="4.5"
              />
              <ellipse
                cx={85 - bob}
                cy={-50}
                rx="11"
                ry="7"
                fill="#FFFFFF"
                stroke={INK}
                strokeWidth="4.5"
              />
            </>
          )}

          {renderFace(0, -158 + bob, 1)}

          {/* Optional Paper Crown for defensive_crown pose */}
          {pose === "defensive_crown" && (
            <polygon
              points="-42,-205 -22,-250 0,-218 22,-250 42,-205"
              fill={ACCENT_YELLOW}
              stroke={INK}
              strokeWidth="5"
              strokeLinejoin="round"
            />
          )}
        </g>
      )}
    </g>
  );
};

// ============================================================================
// 3. B1 HAND-LETTERED FOCAL HEADING + MARKER UNDERLINE
// ============================================================================
const B1FocalHeader: React.FC<{
  title: string;
  highlightWord?: string;
  highlightColor?: string;
  subtitle?: string;
  underlineColor?: string;
}> = ({
  title,
  highlightWord,
  highlightColor = ACCENT_RED,
  subtitle,
  underlineColor = ACCENT_YELLOW,
}) => {
  const frame = useCurrentFrame();
  const drawProg = interpolate(frame, [0, 14], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  return (
    <g transform="translate(84, 210)">
      <text
        x="0"
        y="0"
        fontSize="58"
        fontWeight="900"
        fill={INK}
        letterSpacing="1.5"
      >
        {title}{" "}
        {highlightWord && (
          <tspan fill={highlightColor} fontWeight="900">
            {highlightWord}
          </tspan>
        )}
      </text>

      {/* Hand-drawn marker underline */}
      <path
        d={`M 0 22 Q 220 14 ${Math.max(4, 540 * drawProg)} 24`}
        fill="none"
        stroke={underlineColor}
        strokeWidth="10"
        strokeLinecap="round"
      />

      {subtitle && (
        <text
          x="0"
          y="78"
          fontSize="34"
          fontWeight="700"
          fill={MUTED_INK}
          letterSpacing="0.5"
        >
          {subtitle}
        </text>
      )}
    </g>
  );
};

// ============================================================================
// 4. TWELVE B1 MINIMAL HAND-DRAWN SCENES (Modeled after Ryan V4 Contact Sheet)
// ============================================================================

// SCENE 1 (0.0s - 5.1s): Desk + 4 Step Icons (WRITE / EDIT / REFRESH style)
const B1Scene01SurvivalLoop: React.FC = () => {
  const frame = useCurrentFrame();
  const activeStep = Math.floor(frame / 28) % 4;
  const steps = ["KÍCH THÍCH", "BỐC ĐỒNG", "CÔNG KÍCH", "LẶP LẠI"];

  return (
    <B1GridPaperStage>
      <B1FocalHeader
        title="KẸT Ở SINH TỒN."
        subtitle="HÀNH XỬ HOÀN TOÀN THEO BẢN NĂNG."
        underlineColor={ACCENT_YELLOW}
      />

      {/* 4 Mini Step Icons with Moving Yellow Underline (Ryan V4 Row 1) */}
      <g transform="translate(84, 355)">
        {steps.map((label, idx) => {
          const isAct = idx === activeStep;
          const xPos = idx * 225;
          return (
            <g key={idx} transform={`translate(${xPos}, 0)`}>
              <rect
                x="0"
                y="0"
                width="195"
                height="74"
                rx="10"
                fill={isAct ? "#FFFFFF" : "rgba(255,255,255,0.5)"}
                stroke={isAct ? INK : "#CBD5E1"}
                strokeWidth={isAct ? "4.5" : "3"}
              />
              <text
                x="97"
                y="46"
                textAnchor="middle"
                fontSize="24"
                fontWeight="900"
                fill={isAct ? INK : "#94A3B8"}
              >
                {label}
              </text>
              {isAct && (
                <path
                  d="M 12 92 Q 97 82 182 92"
                  fill="none"
                  stroke={ACCENT_YELLOW}
                  strokeWidth="9"
                  strokeLinecap="round"
                />
              )}
            </g>
          );
        })}
      </g>

      {/* Hand-drawn Desk + Monitor + Frustrated Stickman */}
      <g transform="translate(150, 880)">
        {/* Floor sketch line */}
        <line x1="-60" y1="430" x2="840" y2="430" stroke={INK} strokeWidth="3.5" />
        {/* Desk */}
        <polygon
          points="20,180 540,180 580,210 0,210"
          fill="#FFFFFF"
          stroke={INK}
          strokeWidth="5"
        />
        <rect
          x="35"
          y="210"
          width="24"
          height="220"
          fill="#FFFFFF"
          stroke={INK}
          strokeWidth="5"
        />
        <rect
          x="490"
          y="210"
          width="24"
          height="220"
          fill="#FFFFFF"
          stroke={INK}
          strokeWidth="5"
        />
        {/* Monitor with Red Alert Play Icon */}
        <rect
          x="120"
          y="-90"
          width="310"
          height="220"
          rx="10"
          fill="#FFFFFF"
          stroke={INK}
          strokeWidth="5.5"
        />
        <rect
          x="250"
          y="130"
          width="50"
          height="50"
          fill="#FFFFFF"
          stroke={INK}
          strokeWidth="5"
        />
        <rect
          x="195"
          y="-35"
          width="160"
          height="95"
          rx="14"
          fill={ACCENT_RED}
          stroke={INK}
          strokeWidth="4.5"
        />
        <text
          x="275"
          y="25"
          textAnchor="middle"
          fontSize="36"
          fontWeight="900"
          fill="#FFFFFF"
        >
          BẢN NĂNG!
        </text>
        {/* Coffee mug */}
        <rect
          x="455"
          y="125"
          width="46"
          height="55"
          rx="6"
          fill={ACCENT_YELLOW}
          stroke={INK}
          strokeWidth="4.5"
        />

        {/* Stickman leaning at desk */}
        <B1StickmanActor
          x={665}
          y={238}
          scale={1.35}
          pose="desk_typing"
          emotion="frustrated"
          frame={frame}
          flipX={true}
        />
      </g>
    </B1GridPaperStage>
  );
};

// SCENE 2 (5.1s - 12.8s): Wobbling Tower of 6 Emotional Reflex Boxes (Ryan V4 Row 2)
const B1Scene02WobblingTower: React.FC = () => {
  const frame = useCurrentFrame();
  const wobble = Math.sin(frame * 0.45) * 4;
  const boxes = [
    "1. TỨC GIẬN → CÔNG KÍCH",
    "2. SỢ HÃI → TRỐN TRÁNH",
    "3. BUỒN BÃ → ĐỔ LỖI",
    "4. XÙ LÔNG PHÒNG THỦ",
    "5. NÓNG NẢY TỨC THÌ",
    "6. MẤT KIỂM SOÁT",
  ];

  return (
    <B1GridPaperStage>
      <B1FocalHeader
        title="3 PHẢN XẠ BẢN NĂNG."
        subtitle="Giận công kích • Sợ trốn tránh • Buồn đổ lỗi"
        underlineColor={ACCENT_RED}
      />

      {/* Red-Top Table + Wobbling Stack of 6 Cards + Straining Stickman */}
      <g transform="translate(150, 1180)">
        <line x1="-60" y1="195" x2="840" y2="195" stroke={INK} strokeWidth="3.5" />

        {/* Red-top small table */}
        <rect
          x="40"
          y="10"
          width="360"
          height="28"
          rx="4"
          fill={ACCENT_RED}
          stroke={INK}
          strokeWidth="5"
        />
        <rect
          x="70"
          y="38"
          width="20"
          height="157"
          fill="#FFFFFF"
          stroke={INK}
          strokeWidth="5"
        />
        <rect
          x="350"
          y="38"
          width="20"
          height="157"
          fill="#FFFFFF"
          stroke={INK}
          strokeWidth="5"
        />

        {/* Stack of 6 Wobbling Cards */}
        {boxes.map((label, idx) => {
          const yTop = -82 - idx * 88;
          const tilt = (idx % 2 === 0 ? -1 : 1) * (1.8 + idx * 0.6) + wobble * 0.35;
          const shiftX = idx * 4 + wobble * (idx * 0.3);
          return (
            <g
              key={idx}
              transform={`translate(${65 + shiftX}, ${yTop}) rotate(${tilt} 155 38)`}
            >
              <rect
                x="0"
                y="0"
                width="320"
                height="74"
                rx="6"
                fill="#FFFFFF"
                stroke={INK}
                strokeWidth="5"
              />
              <rect
                x="16"
                y="18"
                width="48"
                height="36"
                rx="8"
                fill={ACCENT_RED}
              />
              <polygon points="36,27 36,45 50,36" fill="#FFFFFF" />
              <text
                x="78"
                y="45"
                fontSize="20"
                fontWeight="900"
                fill={INK}
              >
                {label}
              </text>
            </g>
          );
        })}

        {/* Straining Stickman holding up the stack */}
        <B1StickmanActor
          x={560}
          y={-65}
          scale={1.38}
          pose="holding_tower"
          emotion="strained"
          frame={frame}
        />
      </g>
    </B1GridPaperStage>
  );
};

// SCENE 3 (12.8s - 17.5s): Giant "0" Evidence Frame (Ryan V4 "0 new connections")
const B1Scene03ZeroPause: React.FC = () => {
  const frame = useCurrentFrame();
  const pop = spring({ frame, fps: 30, config: { damping: 14, stiffness: 130 } });

  return (
    <B1GridPaperStage>
      <B1FocalHeader
        title="HIẾM KHI DỪNG LẠI 1 NHỊP."
        subtitle="TẠI SAO MÌNH LẠI CẢM THẤY NHƯ VẬY?"
        underlineColor={ACCENT_RED}
      />

      {/* Framed Evidence Card with Giant Red "0" */}
      <g
        transform={`translate(540, 880) scale(${interpolate(pop, [0, 1], [0.9, 1])})`}
      >
        <rect
          x="-410"
          y="-260"
          width="820"
          height="520"
          rx="12"
          fill="#FFFFFF"
          stroke={INK}
          strokeWidth="5.5"
        />
        <rect
          x="-350"
          y="-205"
          width="74"
          height="50"
          rx="10"
          fill={ACCENT_RED}
        />
        <polygon points="-320,-192 -320,-168 -300,-180" fill="#FFFFFF" />
        <text
          x="-255"
          y="-170"
          fontSize="34"
          fontWeight="700"
          fill={MUTED_INK}
        >
          khi cơn cảm xúc ập đến
        </text>

        {/* Giant Red 0 */}
        <text
          x="0"
          y="55"
          textAnchor="middle"
          fontSize="230"
          fontWeight="900"
          fill={ACCENT_RED}
        >
          0
        </text>
        <text
          x="0"
          y="145"
          textAnchor="middle"
          fontSize="36"
          fontWeight="700"
          fill={MUTED_INK}
        >
          giây dừng lại để tự hỏi chính mình
        </text>

        {/* Hand-drawn Mouse Cursor */}
        <polygon
          points="180,65 180,120 198,105 212,132 224,126 210,98 232,98"
          fill="#FFFFFF"
          stroke={INK}
          strokeWidth="4.5"
          strokeLinejoin="round"
        />
      </g>
    </B1GridPaperStage>
  );
};

// SCENE 4 (17.5s - 23.0s): Spilling Wounds (+1 reaction -> More hurt)
const B1Scene04SpillingWounds: React.FC = () => {
  const frame = useCurrentFrame();
  return (
    <B1GridPaperStage>
      <B1FocalHeader
        title="PHẢN ỨNG NGAY TỨC KHẮC."
        subtitle="TRÚT TỔN THƯƠNG LÊN NGƯỜI XUNG QUANH."
        underlineColor={ACCENT_RED}
      />

      {/* Left Callout Text with Red Underline */}
      <g transform="translate(84, 470)">
        <text x="0" y="0" fontSize="48" fontWeight="900" fill={INK}>
          +1 lời nói tổn thương.
        </text>
        <text x="0" y="62" fontSize="38" fontWeight="700" fill={MUTED_INK}>
          Vết thương bên trong tràn ra ngoài.
        </text>
        <path
          d="M 0 88 Q 260 80 560 86"
          fill="none"
          stroke={ACCENT_RED}
          strokeWidth="7"
          strokeLinecap="round"
        />
      </g>

      {/* Two Stickmen: Left angry shouting, Right startled leaning back */}
      <g transform="translate(150, 1080)">
        <line x1="-60" y1="260" x2="840" y2="260" stroke={INK} strokeWidth="3.5" />
        <B1StickmanActor
          x={180}
          y={0}
          scale={1.35}
          pose="pointing_aha"
          emotion="angry"
          frame={frame}
        />
        {/* Red curved impact arrows */}
        <path
          d="M 320 -110 Q 430 -160 520 -95"
          fill="none"
          stroke={ACCENT_RED}
          strokeWidth="6"
          strokeLinecap="round"
        />
        <polygon points="520,-95 495,-112 502,-82" fill={ACCENT_RED} />

        <B1StickmanActor
          x={640}
          y={0}
          scale={1.35}
          pose="holding_tower"
          emotion="strained"
          frame={frame}
        />
      </g>
    </B1GridPaperStage>
  );
};

// SCENE 5 (23.0s - 32.0s): Crowned Ego & Calendar/Shield (Ryan V4 Row 3 Col 1)
const B1Scene05EgoShield: React.FC = () => {
  const frame = useCurrentFrame();
  return (
    <B1GridPaperStage>
      <B1FocalHeader
        title="KHI CÁI TÔI BỊ CHẠM TỚI."
        subtitle="CƠ CHẾ PHÒNG THỦ BẬT LÊN NGAY LẬP TỨC."
        underlineColor={ACCENT_YELLOW}
      />

      <g transform="translate(140, 1040)">
        <line x1="-50" y1="260" x2="840" y2="260" stroke={INK} strokeWidth="3.5" />

        {/* Defensive Stickman wearing Yellow Crown */}
        <B1StickmanActor
          x={210}
          y={0}
          scale={1.42}
          pose="defensive_crown"
          emotion="angry"
          frame={frame}
        />

        {/* Right: Red-Top Shield Board + Yellow Sticky Note */}
        <g transform="translate(450, -210)">
          <rect
            x="0"
            y="0"
            width="340"
            height="340"
            rx="10"
            fill="#FFFFFF"
            stroke={INK}
            strokeWidth="5.5"
          />
          <rect
            x="0"
            y="0"
            width="340"
            height="68"
            rx="10"
            fill={ACCENT_RED}
            stroke={INK}
            strokeWidth="5.5"
          />
          <text
            x="170"
            y="46"
            textAnchor="middle"
            fontSize="28"
            fontWeight="900"
            fill="#FFFFFF"
          >
            PHÒNG THỦ TỨC THÌ
          </text>

          {/* Tilted Yellow Sticky Note overlapping */}
          <g transform="translate(-55, 75) rotate(-8)">
            <rect
              x="0"
              y="0"
              width="210"
              height="210"
              fill={STICKY_YELLOW}
              stroke={INK}
              strokeWidth="4.5"
              opacity={0.92}
            />
            <text x="24" y="65" fontSize="26" fontWeight="900" fill={INK}>
              “TÔI KHÔNG SAI!”
            </text>
            <line
              x1="24"
              y1="95"
              x2="175"
              y2="95"
              stroke={INK}
              strokeWidth="3.5"
            />
            <line
              x1="24"
              y1="130"
              x2="145"
              y2="130"
              stroke={INK}
              strokeWidth="3.5"
            />
          </g>
        </g>
      </g>
    </B1GridPaperStage>
  );
};

// SCENE 6 (32.0s - 42.1s): MORE POSTS ≠ REMEMBERED style ("CÔNG NHẬN ≠ THẤU HIỂU")
const B1Scene06ValidationVsTruth: React.FC = () => {
  return (
    <B1GridPaperStage>
      {/* Split Header with Red ≠ Symbol (Exact Ryan V4 Row 4 Col 1-2) */}
      <g transform="translate(84, 240)">
        <text x="0" y="0" fontSize="50" fontWeight="900" fill={INK}>
          ĐƯỢC CÔNG NHẬN
        </text>
        <text x="485" y="0" fontSize="64" fontWeight="900" fill={ACCENT_RED}>
          ≠
        </text>
        <text x="555" y="0" fontSize="50" fontWeight="900" fill={INK}>
          THẤU HIỂU
        </text>
        <path
          d="M 550 22 Q 720 16 900 22"
          fill="none"
          stroke={ACCENT_RED}
          strokeWidth="8"
          strokeLinecap="round"
        />
      </g>

      {/* Left: 3 Yellow Sticky Notes -> Curved Arrow -> Right: Dashed Empty Box */}
      <g transform="translate(95, 640)">
        {[
          { x: 0, y: 20, rot: -4, title: "CÃI THẮNG" },
          { x: 145, y: 45, rot: 3, title: "DỄ CHỊU" },
          { x: 290, y: 10, rot: -2, title: "BẢO THỦ" },
        ].map((n, idx) => (
          <g
            key={idx}
            transform={`translate(${n.x}, ${n.y}) rotate(${n.rot})`}
          >
            <rect
              x="0"
              y="0"
              width="175"
              height="220"
              fill={STICKY_YELLOW}
              stroke={INK}
              strokeWidth="4.5"
            />
            <text
              x="87"
              y="60"
              textAnchor="middle"
              fontSize="24"
              fontWeight="900"
              fill={INK}
            >
              {n.title}
            </text>
            <line x1="25" y1="100" x2="150" y2="100" stroke={INK} strokeWidth="3" />
            <line x1="25" y1="132" x2="135" y2="132" stroke={INK} strokeWidth="3" />
            <line x1="25" y1="164" x2="115" y2="164" stroke={INK} strokeWidth="3" />
          </g>
        ))}

        {/* Curved Hand-Drawn Arrow */}
        <path
          d="M 485 135 Q 555 100 615 135"
          fill="none"
          stroke={MUTED_INK}
          strokeWidth="4.5"
          strokeLinecap="round"
        />
        <polyline
          points="598,120 618,136 595,148"
          fill="none"
          stroke={MUTED_INK}
          strokeWidth="4.5"
          strokeLinecap="round"
          strokeLinejoin="round"
        />

        {/* Right: Dashed Empty Box ("SỰ THAY ĐỔI") */}
        <rect
          x="645"
          y="-10"
          width="255"
          height="280"
          rx="8"
          fill="none"
          stroke="#94A3B8"
          strokeWidth="4.5"
          strokeDasharray="14 12"
        />
        <text
          x="772"
          y="140"
          textAnchor="middle"
          fontSize="28"
          fontWeight="800"
          fill="#94A3B8"
        >
          SỰ THAY ĐỔI
        </text>
      </g>
    </B1GridPaperStage>
  );
};

// SCENE 7 (42.1s - 51.0s): Slumped on Stool + "BACK TO ZERO." Timeline (Ryan V4 Row 3 Col 2-3)
const B1Scene07BackToZero: React.FC = () => {
  const frame = useCurrentFrame();
  return (
    <B1GridPaperStage>
      <B1FocalHeader
        title="MỖI GÓC NHÌN KHÁC BIỆT..."
        subtitle="ĐỀU BỊ XEM NHƯ ĐANG XÚC PHẠM."
        underlineColor={ACCENT_RED}
      />

      <g transform="translate(150, 1020)">
        {/* Slumped Stickman on Stool */}
        <B1StickmanActor
          x={140}
          y={0}
          scale={1.4}
          pose="slumped_stool"
          emotion="sad"
          frame={frame}
        />

        {/* Right: "BACK TO ZERO" Timeline */}
        <g transform="translate(350, -90)">
          <text
            x="0"
            y="-145"
            fontSize="44"
            fontWeight="900"
            fill={ACCENT_RED}
          >
            QUAY VỀ XÙ LÔNG.
          </text>

          {/* Yellow Sticky Note above START */}
          <rect
            x="10"
            y="-115"
            width="135"
            height="155"
            fill={STICKY_YELLOW}
            stroke={INK}
            strokeWidth="4"
          />
          <text x="77" y="-65" textAnchor="middle" fontSize="22" fontWeight="900" fill={INK}>
            GÓP Ý
          </text>
          <line x1="28" y1="-35" x2="120" y2="-35" stroke={INK} strokeWidth="3" />
          <line x1="28" y1="-10" x2="105" y2="-10" stroke={INK} strokeWidth="3" />

          {/* Horizontal Timeline Bar */}
          <line x1="0" y1="90" x2="480" y2="90" stroke={MUTED_INK} strokeWidth="4" />
          {[0, 160, 320, 480].map((tx, i) => (
            <line
              key={i}
              x1={tx}
              y1={74}
              x2={tx}
              y2={106}
              stroke={MUTED_INK}
              strokeWidth="4"
            />
          ))}
          <circle cx="48" cy="90" r="10" fill={ACCENT_RED} />
          <text x="0" y="140" fontSize="24" fontWeight="800" fill={MUTED_INK}>
            BẮT ĐẦU
          </text>
          <text x="395" y="140" fontSize="24" fontWeight="800" fill={MUTED_INK}>
            TỰ ÁI LẠI
          </text>
        </g>
      </g>
    </B1GridPaperStage>
  );
};

// SCENE 8 (51.0s - 59.2s): Threatening the Perfect Self-Image
const B1Scene08PerfectIllusion: React.FC = () => {
  const frame = useCurrentFrame();
  return (
    <B1GridPaperStage>
      <B1FocalHeader
        title="SỰ THẬT ĐE DỌA ẢO ẢNH."
        subtitle="HÌNH ẢNH HOÀN HẢO HỌ LUÔN TIN VỀ MÌNH."
        underlineColor={ACCENT_YELLOW}
      />

      <g transform="translate(160, 1020)">
        <line x1="-60" y1="260" x2="840" y2="260" stroke={INK} strokeWidth="3.5" />

        {/* Cracked Portrait Frame */}
        <g transform="translate(80, -220)">
          <rect
            x="0"
            y="0"
            width="320"
            height="380"
            rx="10"
            fill="#FFFFFF"
            stroke={INK}
            strokeWidth="5.5"
          />
          <text
            x="160"
            y="58"
            textAnchor="middle"
            fontSize="26"
            fontWeight="900"
            fill={ACCENT_RED}
          >
            “TÔI HOÀN HẢO”
          </text>
          {/* Crack lines */}
          <path
            d="M 190 95 L 145 170 L 210 225 L 155 310"
            fill="none"
            stroke={ACCENT_RED}
            strokeWidth="5"
            strokeLinecap="round"
          />
        </g>

        <B1StickmanActor
          x={580}
          y={0}
          scale={1.42}
          pose="holding_tower"
          emotion="strained"
          frame={frame}
        />
      </g>
    </B1GridPaperStage>
  );
};

// SCENE 9 (59.2s - 64.6s): Maturity = Steering Your Emotions
const B1Scene09SteeringEmotions: React.FC = () => {
  const frame = useCurrentFrame();
  return (
    <B1GridPaperStage>
      <B1FocalHeader
        title="TRƯỞNG THÀNH LÀ CẦM LÁI."
        subtitle="KHÔNG ĐỂ CẢM XÚC LÁI MỌI HÀNH ĐỘNG."
        underlineColor={ACCENT_GREEN}
      />

      <g transform="translate(160, 1040)">
        <line x1="-60" y1="260" x2="840" y2="260" stroke={INK} strokeWidth="3.5" />
        <B1StickmanActor
          x={260}
          y={0}
          scale={1.45}
          pose="steering_calm"
          emotion="happy"
          frame={frame}
        />
        {/* Hand-drawn Ship Wheel / Control Wheel */}
        <g transform="translate(560, -80)">
          <circle
            cx="0"
            cy="0"
            r="115"
            fill="#FFFFFF"
            stroke={INK}
            strokeWidth="6"
          />
          <circle
            cx="0"
            cy="0"
            r="32"
            fill={STICKY_YELLOW}
            stroke={INK}
            strokeWidth="5"
          />
          <line x1="-135" y1="0" x2="135" y2="0" stroke={INK} strokeWidth="6" />
          <line x1="0" y1="-135" x2="0" y2="135" stroke={INK} strokeWidth="6" />
        </g>
      </g>
    </B1GridPaperStage>
  );
};

// SCENE 10 (64.6s - 70.1s): Naming Emotions Clearly
const B1Scene10NamingEmotions: React.FC = () => {
  const frame = useCurrentFrame();
  return (
    <B1GridPaperStage>
      <B1FocalHeader
        title="GỌI ĐÚNG TÊN CẢM XÚC."
        subtitle="Biết rõ mình đang giận • Gọi tên được nỗi sợ"
        underlineColor={ACCENT_YELLOW}
      />

      <g transform="translate(120, 620)">
        {[
          {
            x: 0,
            bg: STICKY_YELLOW,
            tag: "NHẬN DIỆN 01",
            text: "“Mình đang giận”",
          },
          {
            x: 440,
            bg: STICKY_GREEN,
            tag: "NHẬN DIỆN 02",
            text: "“Mình đang sợ”",
          },
        ].map((card, i) => (
          <g key={i} transform={`translate(${card.x}, 0)`}>
            <rect
              x="0"
              y="0"
              width="390"
              height="270"
              rx="10"
              fill={card.bg}
              stroke={INK}
              strokeWidth="5"
            />
            <text x="36" y="72" fontSize="26" fontWeight="900" fill={MUTED_INK}>
              {card.tag}
            </text>
            <text x="36" y="145" fontSize="38" fontWeight="900" fill={INK}>
              {card.text}
            </text>
            <path
              d="M 36 195 L 62 220 L 115 170"
              fill="none"
              stroke={ACCENT_GREEN}
              strokeWidth="8"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </g>
        ))}

        <B1StickmanActor
          x={420}
          y={520}
          scale={1.35}
          pose="pointing_aha"
          emotion="happy"
          frame={frame}
        />
      </g>
    </B1GridPaperStage>
  );
};

// SCENE 11 (70.1s - 76.8s): "BEFORE YOU POST AGAIN... FIX THESE 3 THINGS." (Exact Ryan V4 Row 4 Col 3)
const B1Scene11FixThreeThings: React.FC = () => {
  const frame = useCurrentFrame();
  const notes = [
    { num: "1", label: "Dừng lại", bg: STICKY_YELLOW },
    { num: "2", label: "Quan sát", bg: STICKY_GREEN },
    { num: "3", label: "Chọn đáp trả", bg: STICKY_YELLOW },
  ];

  return (
    <B1GridPaperStage>
      <B1FocalHeader
        title="TRƯỚC KHI PHẢN ỨNG..."
        subtitle="HỌC CÁCH LÀM CHỦ PHẢN XẠ VÔ THỨC."
        underlineColor={ACCENT_YELLOW}
      />

      {/* Left: Stickman at angled table pointing up */}
      <g transform="translate(110, 980)">
        <B1StickmanActor
          x={155}
          y={-75}
          scale={1.35}
          pose="pointing_aha"
          emotion="happy"
          frame={frame}
        />
        {/* Angled Perspective Table with Sticky Notes */}
        <polygon
          points="-30,40 310,40 375,140 -75,140"
          fill="#FFFFFF"
          stroke={INK}
          strokeWidth="5"
        />
        <line x1="-55" y1="140" x2="-55" y2="310" stroke={INK} strokeWidth="5" />
        <line x1="150" y1="140" x2="150" y2="330" stroke={INK} strokeWidth="5" />
        <line x1="350" y1="140" x2="350" y2="310" stroke={INK} strokeWidth="5" />
        <rect
          x="35"
          y="65"
          width="75"
          height="42"
          fill={STICKY_YELLOW}
          stroke={INK}
          strokeWidth="3.5"
        />
        <rect
          x="145"
          y="65"
          width="75"
          height="42"
          fill={STICKY_GREEN}
          stroke={INK}
          strokeWidth="3.5"
        />
      </g>

      {/* Right: "NHỚ KỸ 3 BƯỚC NÀY." + 3 Numbered Sticky Notes */}
      <g transform="translate(500, 620)">
        <text x="0" y="0" fontSize="38" fontWeight="900" fill={INK}>
          THỰC HÀNH NGAY
        </text>
        <text x="0" y="62" fontSize="54" fontWeight="900" fill={ACCENT_RED}>
          3 BƯỚC NÀY.
        </text>
        <path
          d="M 0 84 Q 210 78 440 86 M 10 102 Q 210 98 420 104"
          fill="none"
          stroke={ACCENT_RED}
          strokeWidth="5.5"
          strokeLinecap="round"
        />

        {notes.map((n, idx) => (
          <g
            key={idx}
            transform={`translate(${idx * 165}, 155) rotate(${idx % 2 === 0 ? -2 : 2})`}
          >
            <rect
              x="0"
              y="0"
              width="148"
              height="210"
              fill={n.bg}
              stroke={INK}
              strokeWidth="4.5"
            />
            <text
              x="74"
              y="62"
              textAnchor="middle"
              fontSize="36"
              fontWeight="900"
              fill={INK}
            >
              {n.num}
            </text>
            <text
              x="74"
              y="125"
              textAnchor="middle"
              fontSize="21"
              fontWeight="900"
              fill={INK}
            >
              {n.label}
            </text>
            <line x1="25" y1="158" x2="122" y2="158" stroke={INK} strokeWidth="3" />
          </g>
        ))}
      </g>
    </B1GridPaperStage>
  );
};

// SCENE 12 (76.8s - 90.0s): Mindful Finale Steps
const B1Scene12MindfulFinale: React.FC = () => {
  const frame = useCurrentFrame();
  return (
    <B1GridPaperStage>
      <B1FocalHeader
        title="ĐỦ TỈNH THỨC MỖI NGÀY."
        subtitle="ĐỪNG BIẾN CẢM XÚC NHẤT THỜI THÀNH HỐI HẬN CẢ ĐỜI."
        underlineColor={ACCENT_GREEN}
      />

      <g transform="translate(120, 1180)">
        <line x1="-40" y1="160" x2="880" y2="160" stroke={INK} strokeWidth="4" />

        {/* 3 Ascending Step Blocks */}
        <rect
          x="40"
          y="40"
          width="240"
          height="120"
          fill="#FFFFFF"
          stroke={INK}
          strokeWidth="5"
        />
        <rect
          x="280"
          y="-60"
          width="240"
          height="220"
          fill={STICKY_YELLOW}
          stroke={INK}
          strokeWidth="5"
        />
        <rect
          x="520"
          y="-170"
          width="260"
          height="330"
          fill={STICKY_GREEN}
          stroke={INK}
          strokeWidth="5"
        />

        <text x="160" y="110" textAnchor="middle" fontSize="26" fontWeight="900" fill={INK}>
          NHẬN BIẾT
        </text>
        <text x="400" y="55" textAnchor="middle" fontSize="26" fontWeight="900" fill={INK}>
          THẤU HIỂU
        </text>
        <text x="650" y="-10" textAnchor="middle" fontSize="30" fontWeight="900" fill={ACCENT_GREEN}>
          TỈNH THỨC
        </text>

        <B1StickmanActor
          x={650}
          y={-365}
          scale={1.38}
          pose="pointing_aha"
          emotion="happy"
          frame={frame}
        />
      </g>
    </B1GridPaperStage>
  );
};

// ============================================================================
// 5. B1 QUIET PHRASE-BASED BOTTOM SAFE-BAND CAPTIONS (Exact Ryan V4 style)
// ============================================================================
const B1BottomPhraseCaptions: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const nowSec = frame / fps;

  const chunkSize = 6;
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
        right: 72,
        bottom: 240,
        display: "flex",
        flexWrap: "wrap",
        justifyContent: "center",
        alignItems: "center",
        gap: "10px 14px",
        pointerEvents: "none",
        fontFamily: "'Segoe Print', 'Comic Sans MS', 'Inter', system-ui, sans-serif",
      }}
    >
      {chunkWords.map((item, idx) => {
        const globalIdx = activeChunkIdx * chunkSize + idx;
        const isCurrent = globalIdx === activeWordIdx;
        return (
          <span
            key={globalIdx}
            style={{
              fontSize: 44,
              fontWeight: isCurrent ? 900 : 700,
              color: isCurrent ? ACCENT_RED : "#334155",
              borderBottom: isCurrent ? `6px solid ${ACCENT_YELLOW}` : "none",
              paddingBottom: 2,
              lineHeight: 1.25,
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
// MASTER COMPOSITION: StickmanB1Director (1080x1920, 90.0s, B1 Minimal Hand-Drawn)
// ============================================================================
export const StickmanB1Director: React.FC<StickmanB1DirectorProps> = () => {
  const { fps } = useVideoConfig();

  const scenes: Array<{
    id: string;
    inSec: number;
    outSec: number;
    Comp: React.FC;
  }> = [
    { id: "b1_01", inSec: 0.0, outSec: 5.1, Comp: B1Scene01SurvivalLoop },
    { id: "b1_02", inSec: 5.1, outSec: 12.8, Comp: B1Scene02WobblingTower },
    { id: "b1_03", inSec: 12.8, outSec: 17.5, Comp: B1Scene03ZeroPause },
    { id: "b1_04", inSec: 17.5, outSec: 23.0, Comp: B1Scene04SpillingWounds },
    { id: "b1_05", inSec: 23.0, outSec: 32.0, Comp: B1Scene05EgoShield },
    { id: "b1_06", inSec: 32.0, outSec: 42.1, Comp: B1Scene06ValidationVsTruth },
    { id: "b1_07", inSec: 42.1, outSec: 51.0, Comp: B1Scene07BackToZero },
    { id: "b1_08", inSec: 51.0, outSec: 59.2, Comp: B1Scene08PerfectIllusion },
    { id: "b1_09", inSec: 59.2, outSec: 64.6, Comp: B1Scene09SteeringEmotions },
    { id: "b1_10", inSec: 64.6, outSec: 70.1, Comp: B1Scene10NamingEmotions },
    { id: "b1_11", inSec: 70.1, outSec: 76.8, Comp: B1Scene11FixThreeThings },
    { id: "b1_12", inSec: 76.8, outSec: 90.0, Comp: B1Scene12MindfulFinale },
  ];

  return (
    <AbsoluteFill style={{ backgroundColor: PAPER_BG }}>
      {scenes.map(({ id, inSec, outSec, Comp }) => {
        const from = Math.round(inSec * fps);
        const dur = Math.max(1, Math.round((outSec - inSec) * fps));
        return (
          <Sequence key={id} from={from} durationInFrames={dur}>
            <Comp />
          </Sequence>
        );
      })}

      {/* B1 Quiet Bottom Safe-Band Phrase Captions */}
      <B1BottomPhraseCaptions />

      {/* 3-Layer Master Audio (Haitrieu 90s Voiceover + BGM + Soft 0.20 SFX) */}
      <Audio
        src={staticFile("episodes/reactive-mind/master_mix_haitrieu_90s.wav")}
        volume={1.0}
      />
    </AbsoluteFill>
  );
};

