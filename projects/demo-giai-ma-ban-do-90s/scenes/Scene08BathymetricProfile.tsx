import React from "react";
import { AbsoluteFill, interpolate, spring, useCurrentFrame, useVideoConfig } from "remotion";
import { FONTS, PALETTE, SAFE_X, SAFE_Y } from "../theme";

export const Scene08BathymetricProfile: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps, durationInFrames, width, height } = useVideoConfig();
  const progress = frame / Math.max(1, durationInFrames - 1);

  const stageIn = spring({
    frame: frame - 3,
    fps,
    config: { damping: 18, stiffness: 135 },
  });

  // Left ship slides into -7.0m mud bank and grounds with bow-up tilt & shockwave!
  const leftSlide = interpolate(progress, [0.02, 0.24], [-120, 0], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });
  const isGrounded = progress >= 0.22;
  const impactSpring = spring({
    frame: frame - Math.round(durationInFrames * 0.22),
    fps,
    config: { damping: 11, stiffness: 180 },
  });
  const groundedTilt = isGrounded ? -4.2 * impactSpring : 0;

  // Right megaship glides smoothly across deep -14.0m basin
  const rightGlide = interpolate(progress, [0.05, 0.95], [-36, 26], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });
  const bldgIn = spring({
    frame: frame - Math.round(durationInFrames * 0.16),
    fps,
    config: { damping: 17, stiffness: 140 },
  });

  const pulse = (frame % 36) / 36;
  const seaY = 300;
  // Scale: 1 meter of depth = 29 pixels!
  // 0,0 m -> y=300
  // -7,0 m -> y=503
  // -8,0 m -> y=532
  // -13,0 m -> y=677
  // -14,0 m -> y=706
  // -16,0 m -> y=764
  const y7m = seaY + 7 * 29;
  const y8m = seaY + 8 * 29;
  const y13m = seaY + 13 * 29;
  const y14m = seaY + 14 * 29;
  const yBottom = 860;

  return (
    <AbsoluteFill
      style={{
        background: "linear-gradient(180deg, #040D1A 0%, #071A30 32%, #020813 100%)",
        overflow: "hidden",
      }}
    >
      {/* Top Cinema Header */}
      <div
        style={{
          position: "absolute",
          left: SAFE_X,
          right: SAFE_X,
          top: 34,
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          opacity: stageIn,
        }}
      >
        <div>
          <div
            style={{
              display: "inline-block",
              padding: "5px 14px",
              borderRadius: 6,
              background: "#38BDF8",
              color: "#020611",
              fontFamily: FONTS.mono,
              fontSize: 13,
              fontWeight: 800,
              marginBottom: 8,
            }}
          >
            PHẦN 04 • LÁT CẮT ĐỘ SÂU QUYẾT ĐỊNH SỐ PHẬN SIÊU TÀU
          </div>
          <div style={{ fontFamily: FONTS.sans, fontSize: 38, fontWeight: 800, color: "#FFFFFF" }}>
            Mắc cạn ở <span style={{ color: PALETTE.coralWarn }}>-7,0 m</span> vs Đón siêu tàu ở{" "}
            <span style={{ color: PALETTE.tealDeep }}>-14,0 m</span>
          </div>
        </div>

        <div
          style={{
            padding: "10px 18px",
            borderRadius: 10,
            background: "rgba(15, 23, 42, 0.92)",
            border: `1.5px solid ${PALETTE.tealDeep}`,
            fontFamily: FONTS.mono,
            fontSize: 15,
            fontWeight: 700,
            color: PALETTE.tealDeep,
          }}
        >
          MỚN NƯỚC SIÊU TÀU 165.000 DWT: ~12,5 M – 13,5 M
        </div>
      </div>

      {/* =================================================================== */}
      {/* FULL-BLEED CINEMATIC UNDERWATER CROSS-SECTION                       */}
      {/* =================================================================== */}
      <svg width={width} height={height} style={{ position: "absolute", inset: 0 }}>
        <defs>
          <linearGradient id="oceanDepthGrad" x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor="#0EA5E9" stopOpacity={0.44} />
            <stop offset="45%" stopColor="#0369A1" stopOpacity={0.58} />
            <stop offset="100%" stopColor="#082F49" stopOpacity={0.86} />
          </linearGradient>
          <linearGradient id="seabedSoil" x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor="#92400E" />
            <stop offset="35%" stopColor="#5C2406" />
            <stop offset="100%" stopColor="#1E0B02" />
          </linearGradient>
        </defs>

        {/* Ocean Water Column */}
        <rect x={SAFE_X} y={seaY} width={width - SAFE_X * 2} height={yBottom - seaY} fill="url(#oceanDepthGrad)" />

        {/* Horizontal Depth Grid Lines & Left Depth Ruler */}
        {[0, 4, 7, 8, 12, 14, 16].map((d) => {
          const yy = seaY + d * 29;
          const isKey = d === 0 || d === 7 || d === 14;
          return (
            <g key={d}>
              <line
                x1={SAFE_X}
                y1={yy}
                x2={width - SAFE_X}
                y2={yy}
                stroke={d === 0 ? "#38BDF8" : d === 7 ? PALETTE.amberBright : d === 14 ? PALETTE.tealDeep : "rgba(148, 163, 184, 0.18)"}
                strokeWidth={d === 0 ? 3.2 : isKey ? 2 : 1}
                strokeDasharray={d === 0 ? undefined : "8 6"}
              />
              <text
                x={SAFE_X - 12}
                y={yy + 5}
                textAnchor="end"
                fill={d === 7 ? PALETTE.amberBright : d === 14 ? PALETTE.tealDeep : "#CBD5E1"}
                fontFamily={FONTS.mono}
                fontSize={isKey ? 15.5 : 13}
                fontWeight={700}
              >
                {d === 0 ? "0,0 m" : `-${d},0 m`}
              </text>
            </g>
          );
        })}

        {/* Seabed Stepped Cliff: Song Cam (-7m) -> Ha Nam (-8m) -> Lach Huyen (-14m design / -12.9m actual) */}
        <path
          d={`M ${SAFE_X} ${y7m} L 730 ${y7m} L 750 ${y8m} L 945 ${y8m} L 995 ${y13m} L ${width - SAFE_X} ${y13m} L ${width - SAFE_X} ${yBottom} L ${SAFE_X} ${yBottom} Z`}
          fill="url(#seabedSoil)"
        />
        {/* Glowing Top Seabed Contours */}
        <polyline
          points={`${SAFE_X},${y7m} 730,${y7m} 750,${y8m} 945,${y8m}`}
          fill="none"
          stroke={PALETTE.amberBright}
          strokeWidth={5}
        />
        <polyline
          points={`945,${y8m} 995,${y13m} ${width - SAFE_X},${y13m}`}
          fill="none"
          stroke={PALETTE.tealDeep}
          strokeWidth={5}
        />
        {/* -14,0 m Dredged Design Trench Floor */}
        <line
          x1={995}
          y1={y14m}
          x2={width - SAFE_X}
          y2={y14m}
          stroke="#5EEAD4"
          strokeWidth={2.5}
          strokeDasharray="10 6"
        />

        {/* ================================================================= */}
        {/* LEFT SHIP: SIDE-PROFILE CONTAINER SHIP SLAMMING & GROUNDING AT -7M */}
        {/* ================================================================= */}
        <g transform={`translate(${210 + leftSlide}, ${seaY}) rotate(${groundedTilt.toFixed(2)}, 220, 203)`}>
          {/* Container Stacks above Deck */}
          {[0, 1, 2, 3, 4, 5].map((col) => (
            <g key={col} transform={`translate(${44 + col * 52}, -58)`}>
              <rect x={0} y={0} width={46} height={26} rx={3} fill={col % 2 === 0 ? "#DC2626" : "#D97706"} stroke="#F8FAFC" strokeWidth={1} />
              <rect x={0} y={28} width={46} height={28} rx={3} fill={col % 2 === 0 ? "#1D4ED8" : "#B91C1C"} stroke="#F8FAFC" strokeWidth={1} />
            </g>
          ))}
          {/* White Navigation Bridge Tower */}
          <rect x={366} y={-88} width={42} height={86} rx={4} fill="#F8FAFC" stroke="#475569" strokeWidth={2} />
          <rect x={372} y={-78} width={30} height={12} rx={2} fill="#0284C7" />

          {/* Upper Black Freeboard Hull (above waterline) */}
          <polygon points="10,-4 446,-4 432,42 28,42" fill="#1E293B" stroke="#F8FAFC" strokeWidth={2} />

          {/* Deep Red Underwater Draft Hull (Draft needs ~12.5m = 362px, CRASHING THROUGH -7.0m!) */}
          <polygon
            points="28,42 432,42 418,268 44,268 18,242"
            fill="rgba(225, 29, 72, 0.72)"
            stroke="#FB7185"
            strokeWidth={3}
          />
          <text x={230} y={148} textAnchor="middle" fill="#FFE4E6" fontFamily={FONTS.mono} fontSize={16} fontWeight={800}>
            MỚN NƯỚC TÀU LỚN CẦN ~13 M
          </text>
        </g>

        {/* Grounding Shockwave & Silt Cloud at -7.0 m */}
        {isGrounded && (
          <g>
            <ellipse
              cx={430}
              cy={y7m}
              rx={130 + pulse * 95}
              ry={22 + pulse * 16}
              fill="none"
              stroke={PALETTE.coralWarn}
              strokeWidth={3.5}
              opacity={1 - pulse}
            />
            <ellipse
              cx={430}
              cy={y7m}
              rx={175}
              ry={20}
              fill="rgba(244, 63, 94, 0.42)"
              stroke="#FFFFFF"
              strokeWidth={2}
            />
            <rect x={236} y={y7m + 34} width={396} height={84} rx={12} fill="#0F172A" stroke={PALETTE.coralWarn} strokeWidth={2.5} />
            <text x={434} y={y7m + 67} textAnchor="middle" fill={PALETTE.coralWarn} fontFamily={FONTS.sans} fontSize={23} fontWeight={800}>
              ✕ MẮC CẠN CHẠM ĐÁY (-7,0 M)!
            </text>
            <text x={434} y={y7m + 98} textAnchor="middle" fill="#F8FAFC" fontFamily={FONTS.mono} fontSize={15.5} fontWeight={700}>
              Sông Cấm -7,0 m | Kênh Hà Nam -8,0 m
            </text>
          </g>
        )}

        {/* ================================================================= */}
        {/* 4-STORY BUILDING STANDING ON -14,0 M SEABED (y=300 to y=706!)     */}
        {/* ================================================================= */}
        <g opacity={bldgIn} transform={`translate(1032, ${seaY})`}>
          {/* Vertical Height Caliper */}
          <line x1={-18} y1={0} x2={-18} y2={y14m - seaY} stroke="#FACC15" strokeWidth={2.8} />
          <line x1={-26} y1={0} x2={-10} y2={0} stroke="#FACC15" strokeWidth={2.8} />
          <line x1={-26} y1={y14m - seaY} x2={-10} y2={y14m - seaY} stroke="#FACC15" strokeWidth={2.8} />

          {/* Roof Elevator Penthouse */}
          <rect x={22} y={-16} width={52} height={16} rx={3} fill="#FACC15" />

          {/* 4-Story Illuminated Apartment Building Body (height = 406px = 14,0 m) */}
          <rect
            x={0}
            y={0}
            width={96}
            height={y14m - seaY}
            rx={5}
            fill="rgba(15, 23, 42, 0.88)"
            stroke="#FACC15"
            strokeWidth={3}
          />
          {[0, 1, 2, 3].map((fl) => {
            const fy = fl * 101;
            return (
              <g key={fl}>
                {fl > 0 && <line x1={0} y1={fy} x2={96} y2={fy} stroke="#FACC15" strokeWidth={2} />}
                <rect x={12} y={fy + 16} width={22} height={58} rx={3} fill="#FDE047" opacity={0.9} />
                <rect x={39} y={fy + 16} width={18} height={58} rx={3} fill="#FEF08A" opacity={0.75} />
                <rect x={63} y={fy + 16} width={22} height={58} rx={3} fill="#FDE047" opacity={0.9} />
                <text x={48} y={fy + 92} textAnchor="middle" fill="#FACC15" fontFamily={FONTS.mono} fontSize={11.5} fontWeight={800}>
                  TẦNG {4 - fl}
                </text>
              </g>
            );
          })}

          <rect x={-42} y={y14m - seaY + 14} width={348} height={42} rx={8} fill="#020611" stroke="#FACC15" strokeWidth={2} />
          <text x={132} y={y14m - seaY + 41} textAnchor="middle" fill="#FACC15" fontFamily={FONTS.mono} fontSize={15.5} fontWeight={800}>
            ĐỘ SÂU -14M ≈ TÒA NHÀ 4 TẦNG!
          </text>
        </g>

        {/* ================================================================= */}
        {/* RIGHT MEGA-SHIP: 165.000 DWT (~366 M ≈ 3,5 FOOTBALL PITCHES)      */}
        {/* ================================================================= */}
        <g transform={`translate(${1210 + rightGlide}, ${seaY})`}>
          {/* 3.5 Mini Green Football Pitches floating right above ship length! */}
          <g transform="translate(8, -138)">
            <rect x={-10} y={-34} width={546} height={82} rx={10} fill="rgba(6, 17, 31, 0.92)" stroke={PALETTE.tealDeep} strokeWidth={1.8} />
            <text x={263} y={-11} textAnchor="middle" fill={PALETTE.tealDeep} fontFamily={FONTS.mono} fontSize={14} fontWeight={800}>
              ✓ SIÊU TÀU 165.000 DWT • DÀI ~366 M ≈ 3,5 SÂN BÓNG ĐÁ NỐI TIẾP
            </text>
            {[0, 1, 2].map((pi) => (
              <g key={pi} transform={`translate(${pi * 150}, 2)`}>
                <rect x={0} y={0} width={142} height={36} rx={4} fill="#16A34A" stroke="#FFFFFF" strokeWidth={1.6} />
                <line x1={71} y1={0} x2={71} y2={36} stroke="#FFFFFF" strokeWidth={1.2} />
                <circle cx={71} cy={18} r={8} fill="none" stroke="#FFFFFF" strokeWidth={1.2} />
              </g>
            ))}
            {/* 0.5 Half Pitch */}
            <g transform="translate(450, 2)">
              <rect x={0} y={0} width={74} height={36} rx={4} fill="#16A34A" stroke="#FACC15" strokeWidth={1.8} />
              <text x={37} y={23} textAnchor="middle" fill="#FEF08A" fontFamily={FONTS.mono} fontSize={12} fontWeight={800}>
                +0,5
              </text>
            </g>
          </g>

          {/* Mega Container Stacks */}
          {[0, 1, 2, 3, 4, 5, 6, 7].map((col) => (
            <g key={col} transform={`translate(${24 + col * 56}, -68)`}>
              <rect x={0} y={0} width={50} height={22} rx={2} fill={col % 2 === 0 ? "#F59E0B" : "#0EA5E9"} stroke="#F8FAFC" strokeWidth={0.9} />
              <rect x={0} y={23} width={50} height={22} rx={2} fill={col % 2 === 0 ? "#10B981" : "#F43F5E"} stroke="#F8FAFC" strokeWidth={0.9} />
              <rect x={0} y={46} width={50} height={22} rx={2} fill="#3B82F6" stroke="#F8FAFC" strokeWidth={0.9} />
            </g>
          ))}
          {/* Twin MSC-style Bridge & Funnel */}
          <rect x={476} y={-96} width={44} height={94} rx={4} fill="#F8FAFC" stroke="#0F172A" strokeWidth={2} />
          <rect x={482} y={-86} width={32} height={14} rx={2} fill="#0284C7" />

          {/* Above-water Hull */}
          <polygon points="0,-4 548,-4 532,48 18,48" fill="#0F172A" stroke={PALETTE.tealDeep} strokeWidth={2.5} />
          <text x={274} y={30} textAnchor="middle" fill="#FACC15" fontFamily={FONTS.mono} fontSize={18} fontWeight={800} letterSpacing="0.16em">
            MOTHER VESSEL • 165.000 DWT
          </text>

          {/* Deep Underwater Hull floating safely above -13m / -14m seabed! */}
          <polygon
            points="18,48 532,48 514,348 42,348 12,318"
            fill="rgba(13, 148, 136, 0.72)"
            stroke="#5EEAD4"
            strokeWidth={3}
          />
          <rect x={36} y={184} width={480} height={38} rx={8} fill="rgba(2, 6, 17, 0.82)" stroke="#5EEAD4" strokeWidth={1.4} />
          <text x={276} y={209} textAnchor="middle" fill="#CCFBF1" fontFamily={FONTS.sans} fontSize={16} fontWeight={800}>
            ✓ Nổi an toàn trong luồng sâu (-12,9 m → -14,0 m)
          </text>
        </g>

        {/* Bottom Segment Labels */}
        <text x={SAFE_X + 20} y={842} fill="#FDBA74" fontFamily={FONTS.mono} fontSize={15} fontWeight={700}>
          Km48+000 (Sông Cấm nội đô)
        </text>
        <text x={755} y={842} fill="#FDBA74" fontFamily={FONTS.mono} fontSize={15} fontWeight={700}>
          Km28+500 (Kênh Hà Nam)
        </text>
        <text x={1395} y={842} fill="#5EEAD4" fontFamily={FONTS.mono} fontSize={15} fontWeight={700}>
          Km20+662 → Km0 (Khu bến nước sâu Lạch Huyện)
        </text>
      </svg>
    </AbsoluteFill>
  );
};
