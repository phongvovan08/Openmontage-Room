import React from "react";
import {
  AbsoluteFill,
  Img,
  interpolate,
  spring,
  staticFile,
  useCurrentFrame,
  useVideoConfig,
} from "remotion";

export type MochiEmotionState =
  | "peaceful"
  | "angry"
  | "overthinking"
  | "burnout"
  | "blooming";

export interface MochiStateMetadata {
  id: MochiEmotionState;
  code: string;
  titleVi: string;
  subtitleVi: string;
  accentColor: string;
  assetFile: string;
}

export const MOCHI_5_STATES_META: Record<MochiEmotionState, MochiStateMetadata> = {
  peaceful: {
    id: "peaceful",
    code: "TRẠNG THÁI 01",
    titleVi: "BÌNH YÊN & TÒ MÒ",
    subtitleVi: "Mầm 2 lá xanh ngọc (#4ADE80) đung đưa nhẹ, đốm sáng ấm áp",
    accentColor: "#4ADE80",
    assetFile: "mochi-states/01_binh_yen_to_mo.png",
  },
  angry: {
    id: "angry",
    code: "TRẠNG THÁI 02",
    titleVi: "NÓNG GIẬN & PHẢN ỨNG",
    subtitleVi: "Mầm đỏ cam bốc lửa & tia khói (#FB7185), khăn vàng tung bay",
    accentColor: "#FB7185",
    assetFile: "mochi-states/02_nong_gian_boc_lua.png",
  },
  overthinking: {
    id: "overthinking",
    code: "TRẠNG THÁI 03",
    titleVi: "OVERTHINKING & BUỒN BÃ",
    subtitleVi: "Lá xanh rũ xuống, mây xám tý hon mưa lất phất trên đỉnh đầu",
    accentColor: "#38BDF8",
    assetFile: "mochi-states/03_overthinking_may_mua.png",
  },
  burnout: {
    id: "burnout",
    code: "TRẠNG THÁI 04",
    titleVi: "KIỆT SỨC (BURNOUT)",
    subtitleVi: "Lá ngả vàng khô héo (#EAB308), thân xẹp mềm như bột bánh dày",
    accentColor: "#EAB308",
    assetFile: "mochi-states/04_kiet_suc_tan_chay.png",
  },
  blooming: {
    id: "blooming",
    code: "TRẠNG THÁI 05",
    titleVi: "NGỘ RA & NỞ HOA VÀNG",
    subtitleVi: "Mầm vươn thẳng nở hoa sao 5 cánh vàng (#FDE047) phát sáng",
    accentColor: "#FDE047",
    assetFile: "mochi-states/05_chua_lanh_no_hoa.png",
  },
};

export interface MochiCharacterProps {
  state: MochiEmotionState;
  size?: number;
  mode?: "svg" | "illustrated";
}

export const MochiCharacter: React.FC<MochiCharacterProps> = ({
  state,
  size = 520,
  mode = "svg",
}) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const t = frame / fps;

  const enter = spring({
    frame,
    fps,
    config: { damping: 14, stiffness: 110 },
  });

  if (mode === "illustrated") {
    const floatY =
      state === "burnout"
        ? Math.sin(t * 1.5) * 2
        : state === "angry"
          ? Math.sin(t * 18) * 3
          : Math.sin(t * 2.4) * 6;
    const breathScale =
      state === "burnout"
        ? 1 + Math.sin(t * 1.5) * 0.012
        : 1 + Math.sin(t * 2.4) * 0.022;

    return (
      <div
        style={{
          width: size,
          height: size,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          transform: `translateY(${floatY}px) scale(${interpolate(enter, [0, 1], [0.85, 1]) * breathScale})`,
          opacity: enter,
        }}
      >
        <Img
          src={staticFile(MOCHI_5_STATES_META[state].assetFile)}
          style={{
            width: "100%",
            height: "100%",
            objectFit: "contain",
            borderRadius: 28,
          }}
        />
      </div>
    );
  }

  // Kinematic 2D Vector SVG Rig for all 5 Canonical States
  const blinkCycle = frame % 96;
  const isBlinking = blinkCycle >= 90 && blinkCycle <= 94;

  const tremorX = state === "angry" ? Math.sin(frame * 1.9) * 3.5 : 0;
  const bobY =
    state === "burnout"
      ? 36 + Math.sin(t * 1.6) * 2
      : state === "overthinking"
        ? 10 + Math.sin(t * 2.2) * 3
        : Math.sin(t * 2.5) * 6;

  const squashX =
    state === "burnout"
      ? 1.24 + Math.sin(t * 1.6) * 0.02
      : state === "angry"
        ? 1.06 + Math.sin(t * 8) * 0.02
        : 1 + Math.sin(t * 2.5) * 0.022;

  const squashY =
    state === "burnout"
      ? 0.73 - Math.sin(t * 1.6) * 0.015
      : state === "angry"
        ? 0.97 - Math.sin(t * 8) * 0.015
        : 1 - Math.sin(t * 2.5) * 0.022;

  const headTilt =
    state === "peaceful"
      ? Math.sin(t * 1.8) * 3.5
      : state === "overthinking"
        ? -3
        : 0;

  const leafMainColor =
    state === "angry"
      ? "#F97316"
      : state === "burnout"
        ? "#CA8A04"
        : "#4ADE80";

  const leafHighlightColor =
    state === "angry"
      ? "#FB7185"
      : state === "burnout"
        ? "#EAB308"
        : "#86EFAC";

  const auraGradient =
    state === "angry"
      ? "radial-gradient(circle, rgba(251,113,133,0.28) 0%, rgba(7,11,20,0) 68%)"
      : state === "overthinking"
        ? "radial-gradient(circle, rgba(56,189,248,0.22) 0%, rgba(7,11,20,0) 68%)"
        : state === "burnout"
          ? "radial-gradient(circle, rgba(234,179,8,0.18) 0%, rgba(7,11,20,0) 68%)"
          : state === "blooming"
            ? "radial-gradient(circle, rgba(253,224,71,0.30) 0%, rgba(74,222,128,0.12) 45%, rgba(7,11,20,0) 70%)"
            : "radial-gradient(circle, rgba(74,222,128,0.22) 0%, rgba(7,11,20,0) 68%)";

  const bloomScale =
    state === "blooming"
      ? spring({
          frame: Math.max(0, frame - 8),
          fps,
          config: { damping: 10, stiffness: 120 },
        })
      : 0;

  return (
    <div
      style={{
        width: size,
        height: size,
        position: "relative",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        transform: `scale(${interpolate(enter, [0, 1], [0.85, 1])})`,
        opacity: enter,
      }}
    >
      <div
        style={{
          position: "absolute",
          inset: 0,
          background: auraGradient,
          borderRadius: "50%",
        }}
      />

      <svg width={size} height={size} viewBox="0 0 520 520">
        {/* Burnout wooden desk surface */}
        {state === "burnout" && (
          <g>
            <rect
              x="56"
              y="426"
              width="408"
              height="18"
              rx="9"
              fill="#452719"
              stroke="#27150E"
              strokeWidth="4"
            />
            <ellipse cx="260" cy="426" rx="165" ry="12" fill="rgba(0,0,0,0.45)" />
          </g>
        )}

        {/* Ambient floating particles for peaceful & blooming */}
        {(state === "peaceful" || state === "blooming") &&
          [0, 1, 2, 3, 4, 5].map((i) => {
            const angle = (i / 6) * Math.PI * 2 + t * 0.45;
            const radius = 175 + (i % 2) * 28;
            const px = 260 + Math.cos(angle) * radius;
            const py = 250 + Math.sin(angle) * (radius * 0.72);
            const pulse = 0.45 + 0.55 * Math.abs(Math.sin(t * 2.5 + i));
            return (
              <circle
                key={i}
                cx={px}
                cy={py}
                r={state === "blooming" ? 6 : 4.5}
                fill={state === "blooming" || i % 2 === 0 ? "#FDE047" : "#4ADE80"}
                opacity={pulse}
              />
            );
          })}

        {/* Main Mochi Body Group */}
        <g
          transform={`translate(${260 + tremorX}, ${295 + bobY}) rotate(${headTilt}) scale(${squashX}, ${squashY})`}
        >
          {/* ---------------- SPROUT ON TOP OF HEAD ---------------- */}
          <g transform="translate(0, -130)">
            {/* Stem */}
            <path
              d={
                state === "burnout" || state === "overthinking"
                  ? "M 0 8 Q 4 -18 14 -30"
                  : "M 0 8 Q 0 -22 0 -44"
              }
              stroke={leafMainColor}
              strokeWidth="8"
              strokeLinecap="round"
              fill="none"
            />

            {/* Left & Right Leaves */}
            {state === "burnout" || state === "overthinking" ? (
              <>
                <path
                  d="M 10 -26 C -22 -36 -56 -12 -64 14 C -36 18 -8 2 10 -26 Z"
                  fill={leafMainColor}
                  stroke="#1E293B"
                  strokeWidth="4"
                />
                <path
                  d="M 14 -26 C 46 -34 76 -8 82 18 C 54 20 28 4 14 -26 Z"
                  fill={leafHighlightColor}
                  stroke="#1E293B"
                  strokeWidth="4"
                />
              </>
            ) : (
              <g
                transform={`rotate(${Math.sin(t * (state === "angry" ? 12 : 2.6)) * 6})`}
              >
                <path
                  d="M 0 -34 C -20 -68 -66 -66 -74 -34 C -58 -6 -20 -12 0 -34 Z"
                  fill={leafMainColor}
                  stroke="#132A1E"
                  strokeWidth="4"
                />
                <path
                  d="M 0 -34 C 20 -68 66 -66 74 -34 C 58 -6 20 -12 0 -34 Z"
                  fill={leafHighlightColor}
                  stroke="#132A1E"
                  strokeWidth="4"
                />
              </g>
            )}

            {/* State 02: Fire, Sparks & Smoke */}
            {state === "angry" && (
              <g transform={`translate(0, -56) scale(${1 + Math.sin(t * 16) * 0.1})`}>
                <path
                  d="M 0 -46 C 22 -22 26 6 0 18 C -26 6 -22 -22 0 -46 Z"
                  fill="#EF4444"
                  stroke="#7F1D1D"
                  strokeWidth="3.5"
                />
                <path
                  d="M 0 -28 C 12 -12 14 4 0 12 C -14 4 -12 -12 0 -28 Z"
                  fill="#FDE047"
                />
                {[-28, 26, -14, 18].map((sx, idx) => {
                  const sparkY = -25 - ((frame * 2.4 + idx * 18) % 45);
                  return (
                    <circle
                      key={idx}
                      cx={sx}
                      cy={sparkY}
                      r={idx % 2 === 0 ? 4 : 5.5}
                      fill={idx % 2 === 0 ? "#FDE047" : "#FB923C"}
                      opacity={interpolate(sparkY, [-70, -25], [0, 1])}
                    />
                  );
                })}
              </g>
            )}

            {/* State 05: Blooming 5-Petal Golden Star Flower */}
            {state === "blooming" && (
              <g transform={`translate(0, -64) scale(${bloomScale})`}>
                <circle cx="0" cy="0" r="34" fill="rgba(253,224,71,0.28)" />
                {[0, 72, 144, 216, 288].map((deg) => (
                  <ellipse
                    key={deg}
                    cx="0"
                    cy="-15"
                    rx="10"
                    ry="17"
                    fill="#FDE047"
                    stroke="#92400E"
                    strokeWidth="3.5"
                    transform={`rotate(${deg + t * 14})`}
                  />
                ))}
                <circle
                  cx="0"
                  cy="0"
                  r="9"
                  fill="#FEF08A"
                  stroke="#92400E"
                  strokeWidth="3"
                />
              </g>
            )}
          </g>

          {/* ---------------- CHUBBY ROUND WHITE MOCHI BODY ---------------- */}
          <path
            d="M -126 15 C -132 -88 -76 -134 0 -134 C 76 -134 132 -88 126 15 C 124 96 86 122 0 122 C -86 122 -124 96 -126 15 Z"
            fill="#FFFFFF"
            stroke="#1E293B"
            strokeWidth="7"
          />
          {/* Subtle cool ice-blue shading along right/bottom edge (matches avatar) */}
          <path
            d="M 96 -74 C 122 -26 118 68 74 104 C 42 118 -20 120 -68 112 C 18 112 84 82 96 -74 Z"
            fill="#DBEAFE"
            opacity={0.7}
          />
          {/* Glossy top-left highlight bean */}
          <ellipse
            cx="-56"
            cy="-86"
            rx="26"
            ry="13"
            fill="#FFFFFF"
            opacity={0.95}
            transform="rotate(-28 -56 -86)"
          />

          {/* ---------------- EXPRESSIVE FACE ---------------- */}
          {/* Cheeks */}
          <ellipse
            cx="-66"
            cy="-8"
            rx="24"
            ry="15"
            fill={state === "angry" ? "#FB7185" : "#FDA4AF"}
            opacity={state === "burnout" ? 0.45 : 0.88}
          />
          <ellipse
            cx="66"
            cy="-8"
            rx="24"
            ry="15"
            fill={state === "angry" ? "#FB7185" : "#FDA4AF"}
            opacity={state === "burnout" ? 0.45 : 0.88}
          />

          {/* Eyes by State */}
          {state === "blooming" ? (
            <>
              <path
                d="M -56 -26 Q -42 -42 -28 -26"
                stroke="#3B1D14"
                strokeWidth="6.5"
                strokeLinecap="round"
                fill="none"
              />
              <path
                d="M 28 -26 Q 42 -42 56 -26"
                stroke="#3B1D14"
                strokeWidth="6.5"
                strokeLinecap="round"
                fill="none"
              />
            </>
          ) : state === "burnout" ? (
            <>
              {/* Tired dark circles */}
              <path
                d="M -58 -16 Q -42 -8 -26 -16"
                stroke="#94A3B8"
                strokeWidth="4"
                fill="none"
              />
              <path
                d="M 26 -16 Q 42 -8 58 -16"
                stroke="#94A3B8"
                strokeWidth="4"
                fill="none"
              />
              {/* Half-closed droopy eyes */}
              <ellipse cx="-42" cy="-24" rx="13" ry="7" fill="#3B1D14" />
              <line
                x1="-57"
                y1="-27"
                x2="-27"
                y2="-24"
                stroke="#1E293B"
                strokeWidth="5.5"
                strokeLinecap="round"
              />
              <ellipse cx="42" cy="-24" rx="13" ry="7" fill="#3B1D14" />
              <line
                x1="27"
                y1="-24"
                x2="57"
                y2="-27"
                stroke="#1E293B"
                strokeWidth="5.5"
                strokeLinecap="round"
              />
            </>
          ) : isBlinking ? (
            <>
              <line
                x1="-54"
                y1="-26"
                x2="-30"
                y2="-26"
                stroke="#3B1D14"
                strokeWidth="6"
                strokeLinecap="round"
              />
              <line
                x1="30"
                y1="-26"
                x2="54"
                y2="-26"
                stroke="#3B1D14"
                strokeWidth="6"
                strokeLinecap="round"
              />
            </>
          ) : (
            <>
              <ellipse cx="-42" cy="-26" rx="12" ry="14" fill="#3B1D14" />
              <circle cx="-46" cy="-31" r="4.5" fill="#FFFFFF" />
              <ellipse cx="42" cy="-26" rx="12" ry="14" fill="#3B1D14" />
              <circle cx="38" cy="-31" r="4.5" fill="#FFFFFF" />

              {/* Angry furrowed brows */}
              {state === "angry" && (
                <>
                  <line
                    x1="-60"
                    y1="-48"
                    x2="-26"
                    y2="-38"
                    stroke="#3B1D14"
                    strokeWidth="7"
                    strokeLinecap="round"
                  />
                  <line
                    x1="60"
                    y1="-48"
                    x2="26"
                    y2="-38"
                    stroke="#3B1D14"
                    strokeWidth="7"
                    strokeLinecap="round"
                  />
                </>
              )}

              {/* Overthinking worried brows + glistening tears */}
              {state === "overthinking" && (
                <>
                  <line
                    x1="-58"
                    y1="-40"
                    x2="-28"
                    y2="-48"
                    stroke="#3B1D14"
                    strokeWidth="5.5"
                    strokeLinecap="round"
                  />
                  <line
                    x1="58"
                    y1="-40"
                    x2="28"
                    y2="-48"
                    stroke="#3B1D14"
                    strokeWidth="5.5"
                    strokeLinecap="round"
                  />
                  <circle cx="-51" cy="-14" r="5" fill="#38BDF8" />
                  <circle cx="51" cy="-14" r="5" fill="#38BDF8" />
                </>
              )}
            </>
          )}

          {/* Mouth by State */}
          {state === "peaceful" || state === "blooming" ? (
            <path
              d="M -12 -14 Q 0 -4 12 -14"
              stroke="#3B1D14"
              strokeWidth="5.5"
              strokeLinecap="round"
              fill="none"
            />
          ) : state === "angry" ? (
            <path
              d="M -15 -10 Q 0 -20 15 -10"
              stroke="#3B1D14"
              strokeWidth="6"
              strokeLinecap="round"
              fill="none"
            />
          ) : state === "overthinking" ? (
            <path
              d="M -12 -10 Q 0 -18 12 -10"
              stroke="#3B1D14"
              strokeWidth="5"
              strokeLinecap="round"
              fill="none"
            />
          ) : (
            <ellipse cx="0" cy="-12" rx="9" ry="6" fill="#581C1C" />
          )}

          {/* ---------------- SIGNATURE COZY YELLOW KNITTED SCARF (#FDE047) ---------------- */}
          <g>
            {/* Main wrap band */}
            <path
              d="M -120 18 Q 0 46 120 18 Q 126 42 114 54 Q 0 80 -114 54 Q -126 42 -120 18 Z"
              fill="#FACC15"
              stroke="#78350F"
              strokeWidth="6"
            />
            {/* Hanging fringed tail (flutters up when angry!) */}
            <g
              transform={
                state === "angry"
                  ? `translate(52, 42) rotate(${-28 + Math.sin(t * 14) * 10})`
                  : `translate(52, 42) rotate(${Math.sin(t * 2.2) * 3})`
              }
            >
              <rect
                x="-22"
                y="0"
                width="46"
                height="62"
                rx="12"
                fill="#FDE047"
                stroke="#78350F"
                strokeWidth="6"
              />
              {[-15, -5, 5, 15].map((fx, idx) => (
                <rect
                  key={idx}
                  x={fx - 4}
                  y="58"
                  width="8"
                  height="14"
                  rx="4"
                  fill="#FACC15"
                  stroke="#78350F"
                  strokeWidth="3.5"
                />
              ))}
            </g>
          </g>

          {/* ---------------- STUBBY WHITE ARMS ---------------- */}
          {state === "blooming" ? (
            <>
              <ellipse
                cx="-26"
                cy="74"
                rx="22"
                ry="14"
                fill="#FFFFFF"
                stroke="#1E293B"
                strokeWidth="5.5"
                transform="rotate(20 -26 74)"
              />
              <ellipse
                cx="26"
                cy="74"
                rx="22"
                ry="14"
                fill="#FFFFFF"
                stroke="#1E293B"
                strokeWidth="5.5"
                transform="rotate(-20 26 74)"
              />
            </>
          ) : state === "overthinking" ? (
            <>
              <circle
                cx="-16"
                cy="78"
                r="16"
                fill="#FFFFFF"
                stroke="#1E293B"
                strokeWidth="5.5"
              />
              <circle
                cx="16"
                cy="78"
                r="16"
                fill="#FFFFFF"
                stroke="#1E293B"
                strokeWidth="5.5"
              />
            </>
          ) : (
            <>
              <ellipse
                cx="-122"
                cy="64"
                rx="16"
                ry="24"
                fill="#FFFFFF"
                stroke="#1E293B"
                strokeWidth="5.5"
                transform={`rotate(${state === "burnout" ? 55 : 18} -122 64)`}
              />
              <ellipse
                cx="122"
                cy={state === "peaceful" ? 42 : 64}
                rx="16"
                ry="24"
                fill="#FFFFFF"
                stroke="#1E293B"
                strokeWidth="5.5"
                transform={`rotate(${
                  state === "peaceful"
                    ? -38 + Math.sin(t * 5) * 12
                    : state === "burnout"
                      ? -55
                      : -18
                } 122 ${state === "peaceful" ? 42 : 64})`}
              />
            </>
          )}
        </g>

        {/* State 03: Hovering Miniature Grey Storm Cloud & Falling Rain */}
        {state === "overthinking" && (
          <g transform={`translate(260, ${74 + Math.sin(t * 2) * 4})`}>
            {/* Raindrops */}
            {[-34, -16, 2, 20, 36].map((rx, idx) => {
              const dropY = 26 + ((frame * 3.4 + idx * 14) % 58);
              return (
                <line
                  key={idx}
                  x1={rx}
                  y1={dropY}
                  x2={rx - 5}
                  y2={dropY + 13}
                  stroke="#38BDF8"
                  strokeWidth="3.5"
                  strokeLinecap="round"
                  opacity={interpolate(dropY, [26, 84], [0.95, 0.15])}
                />
              );
            })}
            {/* Mini Storm Cloud */}
            <path
              d="M -48 22 C -66 22 -74 4 -58 -6 C -54 -26 -24 -32 -10 -18 C 6 -34 38 -28 44 -6 C 64 -4 66 22 46 22 Z"
              fill="#475569"
              stroke="#1E293B"
              strokeWidth="5"
            />
            <path
              d="M -36 14 C -48 14 -52 2 -40 -4 C -36 -18 -16 -20 -6 -10 C 6 -22 28 -18 32 -4"
              fill="#64748B"
            />
          </g>
        )}
      </svg>
    </div>
  );
};

// ---------------------------------------------------------------------------
// 1920x1080 Animated Character Sheet Showcase (All 5 States Side-by-Side)
// ---------------------------------------------------------------------------
export const BeMochi5StatesShowcase: React.FC<{
  mode?: "svg" | "illustrated";
}> = ({ mode = "illustrated" }) => {
  const statesOrder: MochiEmotionState[] = [
    "peaceful",
    "angry",
    "overthinking",
    "burnout",
    "blooming",
  ];

  return (
    <AbsoluteFill
      style={{
        backgroundColor: "#070B14",
        fontFamily: "'Inter', 'Segoe UI', Arial, sans-serif",
        padding: "48px 44px",
        display: "flex",
        flexDirection: "column",
        justifyContent: "space-between",
      }}
    >
      {/* Header */}
      <div style={{ textAlign: "center" }}>
        <div
          style={{
            display: "inline-block",
            padding: "8px 22px",
            borderRadius: 999,
            background: "rgba(74, 222, 128, 0.14)",
            border: "1.5px solid rgba(74, 222, 128, 0.5)",
            color: "#4ADE80",
            fontSize: 18,
            fontWeight: 800,
            letterSpacing: 1.5,
            marginBottom: 14,
          }}
        >
          CHARACTER BIBLE · BÉ MOCHI MẦM XANH
        </div>
        <div
          style={{
            color: "#F8FAFC",
            fontSize: 46,
            fontWeight: 900,
            letterSpacing: -0.5,
          }}
        >
          5 TRẠNG THÁI CẢM XÚC ĐỘC QUYỀN CỦA BÉ MOCHI
        </div>
        <div style={{ color: "#94A3B8", fontSize: 22, marginTop: 8 }}>
          Cùng Mochi hiểu những cảm xúc không gọi được tên 🌱
        </div>
      </div>

      {/* 5 State Cards Row */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(5, 1fr)",
          gap: 22,
          alignItems: "stretch",
          marginTop: 18,
          marginBottom: 12,
        }}
      >
        {statesOrder.map((st) => {
          const meta = MOCHI_5_STATES_META[st];
          return (
            <div
              key={st}
              style={{
                background: "rgba(15, 23, 42, 0.85)",
                border: `2px solid ${meta.accentColor}55`,
                borderRadius: 28,
                padding: "20px 16px 24px",
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                boxShadow: "0 18px 40px rgba(0,0,0,0.45)",
              }}
            >
              <div
                style={{
                  padding: "5px 14px",
                  borderRadius: 999,
                  background: `${meta.accentColor}22`,
                  color: meta.accentColor,
                  fontSize: 14,
                  fontWeight: 800,
                  letterSpacing: 1,
                }}
              >
                {meta.code}
              </div>

              <div style={{ margin: "8px 0" }}>
                <MochiCharacter state={st} size={310} mode={mode} />
              </div>

              <div
                style={{
                  color: "#FFFFFF",
                  fontSize: 22,
                  fontWeight: 800,
                  textAlign: "center",
                  marginTop: 6,
                }}
              >
                {meta.titleVi}
              </div>
              <div
                style={{
                  color: "#CBD5E1",
                  fontSize: 15.5,
                  lineHeight: 1.42,
                  textAlign: "center",
                  marginTop: 8,
                }}
              >
                {meta.subtitleVi}
              </div>
            </div>
          );
        })}
      </div>

      {/* Footer Color Lock Bar */}
      <div
        style={{
          display: "flex",
          justifyContent: "center",
          gap: 32,
          color: "#94A3B8",
          fontSize: 16,
          fontWeight: 600,
        }}
      >
        <span>Nền Kênh: #070B14</span>
        <span style={{ color: "#4ADE80" }}>● Mầm Xanh: #4ADE80</span>
        <span style={{ color: "#FDE047" }}>● Khăn & Hoa Vàng: #FDE047</span>
        <span style={{ color: "#FB7185" }}>● Lửa Phản Ứng: #FB7185</span>
        <span style={{ color: "#38BDF8" }}>● Mưa Overthinking: #38BDF8</span>
      </div>
    </AbsoluteFill>
  );
};

