import React from "react";
import { AbsoluteFill, interpolate, spring, useCurrentFrame, useVideoConfig } from "remotion";
import { FONTS, PALETTE, SAFE_X, SAFE_Y } from "../theme";

export const Scene05RiverCrossSectionCard: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps, durationInFrames } = useVideoConfig();
  const progress = frame / Math.max(1, durationInFrames - 1);

  const stageIn = spring({
    frame: frame - 3,
    fps,
    config: { damping: 18, stiffness: 130 },
  });

  const dredgeCut = interpolate(progress, [0.08, 0.36], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  const collapseIn = spring({
    frame: frame - Math.round(durationInFrames * 0.22),
    fps,
    config: { damping: 15, stiffness: 145 },
  });

  const waveShift = Math.sin((frame / fps) * Math.PI * 2.2) * 8;
  const shakeX = collapseIn > 0.5 ? Math.sin(frame * 1.4) * 1.8 : 0;

  return (
    <AbsoluteFill
      style={{
        background: "radial-gradient(circle at 46% 42%, #0B213B 0%, #030A16 78%)",
        overflow: "hidden",
      }}
    >
      {/* Top Cinema Title Banner */}
      <div
        style={{
          position: "absolute",
          left: SAFE_X,
          right: SAFE_X,
          top: 38,
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
              background: PALETTE.coralWarn,
              color: "#FFFFFF",
              fontFamily: FONTS.mono,
              fontSize: 13,
              fontWeight: 800,
              letterSpacing: "0.06em",
              marginBottom: 8,
            }}
          >
            PHẦN 02 • MÔ HÌNH ĐỊA CHẤT 3D LÒNG SÔNG CẤM
          </div>
          <div
            style={{
              fontFamily: FONTS.sans,
              fontSize: 38,
              fontWeight: 800,
              color: "#FFFFFF",
            }}
          >
            Vì sao không thể đào sông Cấm sâu xuống{" "}
            <span style={{ color: PALETTE.coralWarn }}>-14,0 m?</span>
          </div>
        </div>

        <div
          style={{
            padding: "12px 20px",
            borderRadius: 12,
            background: "rgba(245, 158, 11, 0.16)",
            border: `2px solid ${PALETTE.amberBright}`,
            fontFamily: FONTS.mono,
            fontSize: 20,
            fontWeight: 800,
            color: PALETTE.amberBright,
          }}
        >
          HÀNH LANG SÔNG NỘI ĐÔ: CHỈ RỘNG 80 M
        </div>
      </div>

      {/* 3D ISOMETRIC GEOLOGICAL DIORAMA SLICE (Left + Center Hero) */}
      <svg
        width={1340}
        height={880}
        style={{
          position: "absolute",
          left: 36,
          top: 132,
          transform: `translateX(${shakeX.toFixed(1)}px) scale(${0.94 + 0.06 * stageIn})`,
          opacity: stageIn,
        }}
      >
        <defs>
          <linearGradient id="water3dTop" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#38BDF8" stopOpacity={0.55} />
            <stop offset="100%" stopColor="#0284C7" stopOpacity={0.32} />
          </linearGradient>
          <linearGradient id="water3dFront" x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor="#0EA5E9" stopOpacity={0.62} />
            <stop offset="100%" stopColor="#082F49" stopOpacity={0.88} />
          </linearGradient>
          <linearGradient id="earthWall" x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor="#334155" />
            <stop offset="45%" stopColor="#451A03" />
            <stop offset="100%" stopColor="#1C0A00" />
          </linearGradient>
          <linearGradient id="siltLayer" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="#B45309" />
            <stop offset="50%" stopColor="#F59E0B" />
            <stop offset="100%" stopColor="#B45309" />
          </linearGradient>
        </defs>

        {/* === 1. BACK ISOMETRIC URBAN DECK (3D Depth Perspective) === */}
        {/* Left Bank Top Deck */}
        <polygon
          points="70,280 230,175 455,175 335,280"
          fill="#1E293B"
          stroke="#64748B"
          strokeWidth={2}
        />
        {/* Right Bank Top Deck */}
        <polygon
          points="925,280 1045,175 1270,175 1190,280"
          fill="#1E293B"
          stroke="#64748B"
          strokeWidth={2}
        />

        {/* Water Top Isometric Surface (receding into river upstream) */}
        <polygon
          points="335,305 455,195 1045,195 925,305"
          fill="url(#water3dTop)"
          stroke="#38BDF8"
          strokeWidth={2}
        />
        {/* Animated Surface Wave Lines on 3D Water */}
        {[0, 1, 2].map((wi) => {
          const wy = 225 + wi * 26;
          return (
            <line
              key={wi}
              x1={430 - wi * 26 + waveShift}
              y1={wy}
              x2={995 - wi * 26 + waveShift}
              y2={wy}
              stroke="rgba(224, 242, 254, 0.45)"
              strokeWidth={2}
              strokeDasharray="18 12"
            />
          );
        })}

        {/* === 2. EXTRUDED 3D CITY BUILDINGS ON BOTH RIVERBANKS === */}
        {/* Left Urban Skyline (3D Roof + Front + Side) */}
        {[
          { x: 112, y: 148, w: 66, h: 122 },
          { x: 192, y: 112, w: 76, h: 158 },
          { x: 280, y: 168, w: 48, h: 102 },
        ].map((b, idx) => (
          <g key={`lb-${idx}`}>
            {/* Side 3D wall */}
            <polygon
              points={`${b.x + b.w},${b.y} ${b.x + b.w + 24},${b.y - 20} ${b.x + b.w + 24},${b.y + b.h - 20} ${b.x + b.w},${b.y + b.h}`}
              fill="#0F172A"
              stroke="#38BDF8"
              strokeWidth={1.2}
            />
            {/* Top 3D roof */}
            <polygon
              points={`${b.x},${b.y} ${b.x + 24},${b.y - 20} ${b.x + b.w + 24},${b.y - 20} ${b.x + b.w},${b.y}`}
              fill="#334155"
              stroke="#38BDF8"
              strokeWidth={1.2}
            />
            {/* Front facade */}
            <rect x={b.x} y={b.y} width={b.w} height={b.h} fill="#1E293B" stroke="#38BDF8" strokeWidth={1.5} />
            {/* Lit windows */}
            {[0, 1, 2, 3].map((r) => (
              <g key={r}>
                <rect x={b.x + 10} y={b.y + 14 + r * 24} width={16} height={11} rx={2} fill="#FDE047" opacity={0.82} />
                <rect x={b.x + 34} y={b.y + 14 + r * 24} width={16} height={11} rx={2} fill="#38BDF8" opacity={0.55} />
              </g>
            ))}
          </g>
        ))}
        <text x={208} y={84} textAnchor="middle" fill="#F8FAFC" fontFamily={FONTS.sans} fontSize={17} fontWeight={800}>
          ĐÔ THỊ &amp; CẢNG BỜ BẮC
        </text>

        {/* Right Urban Skyline */}
        {[
          { x: 948, y: 162, w: 54, h: 108 },
          { x: 1014, y: 118, w: 74, h: 152 },
          { x: 1100, y: 150, w: 62, h: 120 },
        ].map((b, idx) => (
          <g key={`rb-${idx}`}>
            <polygon
              points={`${b.x + b.w},${b.y} ${b.x + b.w + 22},${b.y - 18} ${b.x + b.w + 22},${b.y + b.h - 18} ${b.x + b.w},${b.y + b.h}`}
              fill="#0F172A"
              stroke="#38BDF8"
              strokeWidth={1.2}
            />
            <polygon
              points={`${b.x},${b.y} ${b.x + 22},${b.y - 18} ${b.x + b.w + 22},${b.y - 18} ${b.x + b.w},${b.y}`}
              fill="#334155"
              stroke="#38BDF8"
              strokeWidth={1.2}
            />
            <rect x={b.x} y={b.y} width={b.w} height={b.h} fill="#1E293B" stroke="#38BDF8" strokeWidth={1.5} />
            {[0, 1, 2, 3].map((r) => (
              <g key={r}>
                <rect x={b.x + 10} y={b.y + 14 + r * 24} width={14} height={11} rx={2} fill="#FDE047" opacity={0.82} />
                <rect x={b.x + 30} y={b.y + 14 + r * 24} width={14} height={11} rx={2} fill="#38BDF8" opacity={0.55} />
              </g>
            ))}
          </g>
        ))}
        <text x={1060} y={84} textAnchor="middle" fill="#F8FAFC" fontFamily={FONTS.sans} fontSize={17} fontWeight={800}>
          KHU DÂN CƯ &amp; KÈ BỜ NAM
        </text>

        {/* === 3. FRONT 3D CUTAWAY GEOLOGICAL CROSS-SECTION === */}
        {/* Earth Cutaway Base Block */}
        <polygon
          points="70,280 335,280 405,475 855,475 925,280 1190,280 1190,785 70,785"
          fill="url(#earthWall)"
          stroke="#64748B"
          strokeWidth={2.5}
        />

        {/* Front Water Cutaway Face (0,0 m down to -7,0 m) */}
        <polygon
          points="335,305 925,305 855,475 405,475"
          fill="url(#water3dFront)"
          stroke="#38BDF8"
          strokeWidth={2.5}
        />

        {/* 80 m Narrow Width Caliper */}
        <line x1={355} y1={256} x2={905} y2={256} stroke="#FACC15" strokeWidth={3} />
        <line x1={355} y1={244} x2={355} y2={268} stroke="#FACC15" strokeWidth={3} />
        <line x1={905} y1={244} x2={905} y2={268} stroke="#FACC15" strokeWidth={3} />
        <rect x={498} y={234} width={264} height={42} rx={8} fill="#020611" stroke="#FACC15" strokeWidth={2} />
        <text x={630} y={261} textAnchor="middle" fill="#FACC15" fontFamily={FONTS.mono} fontSize={19} fontWeight={800}>
          LUỒNG CHẬT HẸP: 80 M
        </text>

        {/* Thick Golden-Brown Silt Deposit Layer at -7,0 m */}
        <path
          d="M 398 456 Q 630 434 862 456 L 855 504 L 405 504 Z"
          fill="url(#siltLayer)"
          stroke="#FDE047"
          strokeWidth={2.2}
        />

        {/* === 4. RED DANGER -14,0 M EXCAVATION WEDGE + 4-STORY SCALE BUILDING === */}
        <g opacity={dredgeCut}>
          {/* Deep Dredge Cut eating wide into bank slopes */}
          <polygon
            points={`405,504 ${250} ${718} ${1010} ${718} 855,504`}
            fill="rgba(244, 63, 94, 0.24)"
            stroke={PALETTE.coralWarn}
            strokeWidth={3.5}
            strokeDasharray="12 7"
          />

          {/* 4-Story Scale Building standing inside the -14m cut (from y=305 water surface to y=718 -14m!) */}
          <g transform="translate(442, 305)">
            <rect
              x={0}
              y={0}
              width={84}
              height={413}
              rx={4}
              fill="rgba(15, 23, 42, 0.88)"
              stroke="#FACC15"
              strokeWidth={2.5}
            />
            {[0, 1, 2, 3].map((fl) => (
              <g key={fl}>
                <line x1={0} y1={fl * 103} x2={84} y2={fl * 103} stroke="#FACC15" strokeWidth={1.8} />
                <rect x={12} y={fl * 103 + 18} width={22} height={64} rx={3} fill="rgba(250, 204, 21, 0.62)" />
                <rect x={50} y={fl * 103 + 18} width={22} height={64} rx={3} fill="rgba(250, 204, 21, 0.62)" />
              </g>
            ))}
          </g>

          <rect x={372} y={730} width={516} height={42} rx={8} fill="#020611" stroke="#FACC15" strokeWidth={2} />
          <text x={630} y={757} textAnchor="middle" fill="#FACC15" fontFamily={FONTS.mono} fontSize={17} fontWeight={800}>
            ĐÀO SÂU -14,0 M ≈ TÒA NHÀ 4 TẦNG DƯỚI ĐÁY SÔNG!
          </text>
        </g>

        {/* Silt label rendered on top-right of silt layer, clear of the 4-story building */}
        <rect x={542} y={459} width={310} height={36} rx={6} fill="rgba(2, 6, 17, 0.88)" stroke="#FDE047" strokeWidth={1.6} />
        <text x={697} y={483} textAnchor="middle" fill="#FDE047" fontFamily={FONTS.sans} fontSize={15.5} fontWeight={800}>
          ĐÁY SÔNG (-7,0 M) • PHÙ SA BỒI ĐẦY
        </text>

        {/* === 5. GEOTECHNICAL FRACTURE CRACKS & BANK SLIP ARROWS === */}
        <g opacity={collapseIn}>
          {/* Left Shear Fracture */}
          <path
            d="M 195 280 L 212 365 L 198 440 L 245 545 L 295 645"
            fill="none"
            stroke={PALETTE.coralWarn}
            strokeWidth={5}
          />
          <rect x={72} y={555} width={268} height={52} rx={8} fill="rgba(159, 18, 57, 0.94)" stroke="#FFFFFF" strokeWidth={2} />
          <text x={206} y={587} textAnchor="middle" fill="#FFFFFF" fontFamily={FONTS.sans} fontSize={18} fontWeight={800}>
            ⚠ SẠT TRƯỢT KÈ ĐÔ THỊ!
          </text>

          {/* Right Shear Fracture */}
          <path
            d="M 1065 280 L 1048 365 L 1062 440 L 1015 545 L 965 645"
            fill="none"
            stroke={PALETTE.coralWarn}
            strokeWidth={5}
          />
          <rect x={914} y={555} width={280} height={52} rx={8} fill="rgba(159, 18, 57, 0.94)" stroke="#FFFFFF" strokeWidth={2} />
          <text x={1054} y={587} textAnchor="middle" fill="#FFFFFF" fontFamily={FONTS.sans} fontSize={18} fontWeight={800}>
            ⚠ SỤT MÓNG NHÀ VEN SÔNG!
          </text>
        </g>
      </svg>

      {/* Right-Side Compact High-Contrast Vox Takeaway Cards */}
      <div
        style={{
          position: "absolute",
          right: SAFE_X,
          top: 196,
          width: 496,
          display: "flex",
          flexDirection: "column",
          gap: 24,
          opacity: collapseIn,
          transform: `translateX(${(1 - collapseIn) * 24}px)`,
        }}
      >
        <div
          style={{
            padding: "24px 26px",
            background: "linear-gradient(135deg, rgba(15, 23, 42, 0.96) 0%, rgba(46, 16, 32, 0.92) 100%)",
            borderRadius: 16,
            border: `2px solid ${PALETTE.coralWarn}`,
            borderLeft: `8px solid ${PALETTE.coralWarn}`,
            boxShadow: "0 22px 48px rgba(0,0,0,0.65)",
          }}
        >
          <div style={{ fontFamily: FONTS.mono, fontSize: 13.5, fontWeight: 800, color: PALETTE.coralWarn, marginBottom: 8 }}>
            TỬ HUYỆT 01 • ĐỊA CHẤT HẸP 80 M
          </div>
          <div style={{ fontFamily: FONTS.sans, fontSize: 25, fontWeight: 800, color: "#FFFFFF", lineHeight: 1.25, marginBottom: 10 }}>
            Khoét sâu bằng tòa nhà 4 tầng sẽ làm sập hai bờ phố
          </div>
          <div style={{ fontFamily: FONTS.sans, fontSize: 17.5, color: "#CBD5E1", lineHeight: 1.48 }}>
            Muốn hạ đáy từ <strong style={{ color: "#FACC15" }}>-7 m xuống -14 m</strong> phải mở mái dốc taluy cực rộng sang hai bên, ăn lẹm thẳng vào chân kè và khu dân cư Hải Phòng.
          </div>
        </div>

        <div
          style={{
            padding: "24px 26px",
            background: "linear-gradient(135deg, rgba(15, 23, 42, 0.96) 0%, rgba(42, 28, 12, 0.92) 100%)",
            borderRadius: 16,
            border: `2px solid ${PALETTE.amberBright}`,
            borderLeft: `8px solid ${PALETTE.amberBright}`,
            boxShadow: "0 22px 48px rgba(0,0,0,0.65)",
          }}
        >
          <div style={{ fontFamily: FONTS.mono, fontSize: 13.5, fontWeight: 800, color: "#FACC15", marginBottom: 8 }}>
            TỬ HUYỆT 02 • CHI PHÍ NẠO VÉT VÔ ĐÁY
          </div>
          <div style={{ fontFamily: FONTS.sans, fontSize: 25, fontWeight: 800, color: "#FFFFFF", lineHeight: 1.25, marginBottom: 10 }}>
            Đào năm trước, mùa lũ năm sau bùn lại lấp đầy
          </div>
          <div style={{ fontFamily: FONTS.sans, fontSize: 17.5, color: "#CBD5E1", lineHeight: 1.48 }}>
            Hàng triệu mét khối phù sa thượng nguồn đổ về biến rãnh sâu thành cái phễu hứng bùn tốn kém triền miên.
          </div>
        </div>
      </div>
    </AbsoluteFill>
  );
};
