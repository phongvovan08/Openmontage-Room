import React from "react";
import { AbsoluteFill, interpolate, spring, useCurrentFrame, useVideoConfig } from "remotion";
import { REAL_PHOTOS } from "../data/realPhotosManifest";
import { formatVnNumber, FONTS, PALETTE, SAFE_X, SAFE_Y } from "../theme";
import { EvidencePhotoCard } from "./EvidencePhotoCard";

export const Scene07Measure: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps, durationInFrames, width, height } = useVideoConfig();
  const progress = frame / Math.max(1, durationInFrames - 1);

  const deckIn = spring({
    frame: frame - 4,
    fps,
    config: { damping: 19, stiffness: 135 },
  });

  const raceT = interpolate(progress, [0.06, 0.78], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  // Old ship crawls slowly through narrow 80m channel; New mother ship surges 2.4x faster in 160m channel (staying clear of right photo!)
  const oldShipX = interpolate(raceT, [0, 1], [110, 248]);
  const newShipX = interpolate(raceT, [0, 1], [110, 442]);

  const kmOld = interpolate(progress, [0.05, 0.35], [0, 48.0], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });
  const kmNew = interpolate(progress, [0.12, 0.42], [0, 20.66], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  const waterFlow = (frame * 3.2) % 48;

  return (
    <AbsoluteFill
      style={{
        background: "radial-gradient(circle at 50% 50%, #091D34 0%, #030914 85%)",
        overflow: "hidden",
      }}
    >
      {/* Top Cinema Header */}
      <div
        style={{
          position: "absolute",
          left: SAFE_X,
          right: SAFE_X,
          top: 32,
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          opacity: deckIn,
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
          <span
            style={{
              padding: "5px 14px",
              borderRadius: 6,
              background: "#FACC15",
              color: "#020611",
              fontFamily: FONTS.mono,
              fontSize: 13,
              fontWeight: 800,
            }}
          >
            PHẦN 04 • ĐUA TỐC ĐỘ &amp; QUY MÔ HAI LUỒNG TÀU
          </span>
          <span style={{ fontFamily: FONTS.sans, fontSize: 30, fontWeight: 800, color: "#FFFFFF" }}>
            So sánh trực diện: Luồng sông cũ vs Luồng biển sâu mới
          </span>
        </div>

        <div
          style={{
            padding: "6px 14px",
            borderRadius: 8,
            background: "rgba(15, 23, 42, 0.9)",
            border: `1px solid ${PALETTE.borderSubtle}`,
            fontFamily: FONTS.mono,
            fontSize: 13,
            color: PALETTE.textSecondary,
          }}
        >
          Tỷ lệ bề rộng 1:1 (80 m vs 160 m)
        </div>
      </div>

      {/* =================================================================== */}
      {/* TOP LANE: OLD 48,0 KM / 80 M CONSTRICTED RIVER CORRIDOR             */}
      {/* =================================================================== */}
      <div
        style={{
          position: "absolute",
          left: SAFE_X,
          right: SAFE_X,
          top: 100,
          height: 356,
          background: "linear-gradient(90deg, rgba(40, 22, 11, 0.95) 0%, rgba(24, 18, 16, 0.92) 100%)",
          borderRadius: 18,
          border: `2px solid ${PALETTE.amberBright}`,
          overflow: "hidden",
          display: "flex",
          opacity: deckIn,
          transform: `translateY(${(1 - deckIn) * -18}px)`,
        }}
      >
        {/* Left Metric Column */}
        <div
          style={{
            width: 450,
            padding: "24px 28px",
            borderRight: "1px solid rgba(245, 158, 11, 0.3)",
            display: "flex",
            flexDirection: "column",
            justifyContent: "space-between",
            background: "rgba(12, 10, 9, 0.55)",
          }}
        >
          <div>
            <div style={{ fontFamily: FONTS.mono, fontSize: 13.5, fontWeight: 800, color: PALETTE.coralWarn, marginBottom: 6 }}>
              ✕ LỘ TRÌNH CŨ • SÔNG CẤM – KÊNH HÀ NAM
            </div>
            <div style={{ fontFamily: FONTS.mono, fontSize: 56, fontWeight: 800, color: PALETTE.amberBright, lineHeight: 1 }}>
              {formatVnNumber(kmOld, 1)} km
            </div>
            <div style={{ fontFamily: FONTS.sans, fontSize: 17, fontWeight: 600, color: "#FED7AA", marginTop: 6 }}>
              Quanh co từ nội đô Hải Phòng ra Phao số 0
            </div>
          </div>

          <div
            style={{
              padding: "12px 16px",
              borderRadius: 10,
              background: "rgba(245, 158, 11, 0.16)",
              border: `1.5px solid ${PALETTE.amberBright}`,
            }}
          >
            <div style={{ fontFamily: FONTS.mono, fontSize: 19.5, fontWeight: 800, color: "#FDE047" }}>
              RỘNG CHỈ 80 M • SÂU -7,0 M
            </div>
            <div style={{ fontFamily: FONTS.sans, fontSize: 15, color: "#E2E8F0", marginTop: 2 }}>
              1 làn hẹp — tàu lớn không tránh nhau được, phải chờ thủy triều
            </div>
          </div>
        </div>

        {/* Right Live Channel Race Track (Narrow 84px Water Band = 80m scale) */}
        <div style={{ flex: 1, position: "relative" }}>
          <svg width={1310} height={356}>
            {/* Urban / Silt Riverbanks squeezing the narrow 80m channel */}
            <rect x={0} y={0} width={1310} height={136} fill="#291D14" />
            <rect x={0} y={220} width={1310} height={136} fill="#291D14" />

            {/* Narrow 80m Turbid Silt Channel (height = 84px) */}
            <rect x={0} y={136} width={1310} height={84} fill="#78350F" />
            <line x1={0} y1={136} x2={1310} y2={136} stroke={PALETTE.amberBright} strokeWidth={3} />
            <line x1={0} y1={220} x2={1310} y2={220} stroke={PALETTE.amberBright} strokeWidth={3} />

            {/* Centerline & Turbid Flow Dashes */}
            <line
              x1={-waterFlow}
              y1={178}
              x2={1350}
              y2={178}
              stroke="rgba(253, 224, 71, 0.35)"
              strokeWidth={2}
              strokeDasharray="18 18"
            />

            {/* Width Caliper */}
            <line x1={1140} y1={136} x2={1140} y2={220} stroke="#FFFFFF" strokeWidth={2.5} />
            <rect x={1154} y={159} width={118} height={38} rx={6} fill="#020611" stroke={PALETTE.amberBright} strokeWidth={1.6} />
            <text x={1213} y={184} textAnchor="middle" fill={PALETTE.amberBright} fontFamily={FONTS.mono} fontSize={18} fontWeight={800}>
              80 M HẸP
            </text>

            {/* Mileposts */}
            {[
              { x: 90, t: "KM 48 (SÔNG CẤM)" },
              { x: 480, t: "KM 28 (HÀ NAM)" },
              { x: 880, t: "CỬA NAM TRIỆU (CẠN)" },
            ].map((m, i) => (
              <text key={i} x={m.x} y={116} fill="#FDBA74" fontFamily={FONTS.mono} fontSize={13.5} fontWeight={700}>
                ▼ {m.t}
              </text>
            ))}

            {/* Small Feeder Ship Crawling Slowly */}
            <g transform={`translate(${oldShipX}, 178)`}>
              {/* Wake */}
              <line x1={-95} y1={0} x2={-42} y2={0} stroke="#FDE68A" strokeWidth={4} strokeDasharray="6 5" opacity={0.65} />
              {/* Hull */}
              <polygon points="-44,-15 32,-15 50,0 32,15 -44,15" fill="#F59E0B" stroke="#FFFFFF" strokeWidth={2} />
              <rect x={-28} y={-9} width={18} height={18} fill="#DC2626" />
              <rect x={-6} y={-9} width={18} height={18} fill="#2563EB" />
              <rect x={16} y={-8} width={10} height={16} fill="#F8FAFC" />
              {/* Tag */}
              <rect x={-62} y={54} width={240} height={34} rx={6} fill="rgba(159, 18, 57, 0.95)" stroke="#FFFFFF" strokeWidth={1.5} />
              <text x={58} y={76} textAnchor="middle" fill="#FFFFFF" fontFamily={FONTS.mono} fontSize={14} fontWeight={800}>
                TÀU NHỎ • BÒ CHẬM 48 KM
              </text>
            </g>
          </svg>
        </div>
      </div>

      {/* =================================================================== */}
      {/* CENTER CLASH RIBBON                                                 */}
      {/* =================================================================== */}
      <div
        style={{
          position: "absolute",
          left: "50%",
          top: 468,
          transform: "translateX(-50%)",
          zIndex: 5,
          padding: "8px 30px",
          borderRadius: 999,
          background: "linear-gradient(90deg, #0F172A 0%, #134E4A 50%, #0F172A 100%)",
          border: `2px solid ${PALETTE.tealDeep}`,
          boxShadow: "0 10px 30px rgba(0,0,0,0.8)",
          fontFamily: FONTS.mono,
          fontSize: 16,
          fontWeight: 800,
          color: "#FACC15",
          letterSpacing: "0.05em",
          whiteSpace: "nowrap",
        }}
      >
        ⚡ CẮT NGẮN 57% QUÃNG ĐƯỜNG &nbsp;•&nbsp; NHÂN ĐÔI BỀ RỘNG LUỒNG (80 M → 160 M)
      </div>

      {/* =================================================================== */}
      {/* BOTTOM LANE: NEW 20,66 KM / 160 M DEEP-WATER SUPERHIGHWAY           */}
      {/* =================================================================== */}
      <div
        style={{
          position: "absolute",
          left: SAFE_X,
          right: SAFE_X,
          top: 522,
          height: 432,
          background: "linear-gradient(90deg, rgba(4, 34, 48, 0.96) 0%, rgba(6, 24, 44, 0.94) 100%)",
          borderRadius: 18,
          border: `2.5px solid ${PALETTE.tealDeep}`,
          overflow: "hidden",
          display: "flex",
          opacity: deckIn,
          transform: `translateY(${(1 - deckIn) * 18}px)`,
        }}
      >
        {/* Left Metric Column */}
        <div
          style={{
            width: 450,
            padding: "26px 28px",
            borderRight: "1px solid rgba(45, 212, 191, 0.3)",
            display: "flex",
            flexDirection: "column",
            justifyContent: "space-between",
            background: "rgba(2, 12, 24, 0.55)",
          }}
        >
          <div>
            <div style={{ fontFamily: FONTS.mono, fontSize: 13.5, fontWeight: 800, color: PALETTE.tealDeep, marginBottom: 6 }}>
              ✓ LỘ TRÌNH MỚI • KHU BẾN NƯỚC SÂU LẠCH HUYỆN
            </div>
            <div style={{ display: "flex", alignItems: "baseline", gap: 12 }}>
              <span style={{ fontFamily: FONTS.mono, fontSize: 56, fontWeight: 800, color: PALETTE.tealDeep, lineHeight: 1 }}>
                {formatVnNumber(kmNew, 2)} km
              </span>
              <span
                style={{
                  padding: "4px 10px",
                  borderRadius: 6,
                  background: "rgba(45, 212, 191, 0.2)",
                  fontFamily: FONTS.mono,
                  fontSize: 20,
                  fontWeight: 800,
                  color: "#5EEAD4",
                }}
              >
                -57%
              </span>
            </div>
            <div style={{ fontFamily: FONTS.sans, fontSize: 17, fontWeight: 600, color: "#CCFBF1", marginTop: 6 }}>
              Vươn thẳng từ đảo Cát Hải ra biển sâu Phao số 0
            </div>
          </div>

          <div
            style={{
              padding: "14px 16px",
              borderRadius: 10,
              background: "rgba(45, 212, 191, 0.16)",
              border: `1.5px solid ${PALETTE.tealDeep}`,
            }}
          >
            <div style={{ fontFamily: FONTS.mono, fontSize: 22, fontWeight: 800, color: "#FFFFFF" }}>
              RỘNG 160 M ≈ 2,3 SÂN BÓNG
            </div>
            <div style={{ fontFamily: FONTS.sans, fontSize: 15.5, color: "#99F6E4", marginTop: 3 }}>
              Rộng gấp đôi luồng cũ — đón siêu tàu mẹ 165.000 DWT ra vào an toàn
            </div>
          </div>
        </div>

        {/* Right Live Superhighway Channel (168px Water Band = exact 2.0x of 84px!) */}
        <div style={{ flex: 1, position: "relative" }}>
          <svg width={1310} height={432}>
            {/* Protective Sand Dikes */}
            <rect x={0} y={0} width={1310} height={88} fill="#082032" />
            <rect x={0} y={256} width={1310} height={176} fill="#061626" />

            {/* 160 m Wide Deep-Ocean Channel (height = 168px = 2x top lane!) */}
            <rect x={0} y={88} width={1310} height={168} fill="#0369A1" />
            <line x1={0} y1={88} x2={1310} y2={88} stroke={PALETTE.tealDeep} strokeWidth={3.5} />
            <line x1={0} y1={256} x2={1310} y2={256} stroke={PALETTE.tealDeep} strokeWidth={3.5} />

            {/* Express Streaming Wake Lines */}
            <line
              x1={-waterFlow * 2}
              y1={172}
              x2={1400}
              y2={172}
              stroke="rgba(125, 211, 252, 0.45)"
              strokeWidth={2.5}
              strokeDasharray="28 16"
            />

            {/* Visual Scale Ruler: 2.3 Mini Green Football Pitches stacked vertically across 168px width! */}
            <g transform="translate(42, 88)">
              {[0, 1].map((pi) => (
                <g key={pi} transform={`translate(0, ${pi * 72})`}>
                  <rect
                    x={0}
                    y={2}
                    width={112}
                    height={68}
                    rx={4}
                    fill="rgba(22, 163, 74, 0.78)"
                    stroke="#FFFFFF"
                    strokeWidth={1.8}
                  />
                  <line x1={56} y1={2} x2={56} y2={70} stroke="#FFFFFF" strokeWidth={1.4} />
                  <circle cx={56} cy={36} r={11} fill="none" stroke="#FFFFFF" strokeWidth={1.4} />
                </g>
              ))}
              {/* 0.3 Pitch fraction */}
              <rect
                x={0}
                y={146}
                width={112}
                height={20}
                rx={3}
                fill="rgba(22, 163, 74, 0.78)"
                stroke="#FACC15"
                strokeWidth={1.8}
              />
              <rect x={-16} y={178} width={274} height={32} rx={6} fill="#020611" stroke="#22C55E" strokeWidth={1.5} />
              <text x={121} y={199} textAnchor="middle" fill="#86EFAC" fontFamily={FONTS.mono} fontSize={13.5} fontWeight={800}>
                BỀ RỘNG 160M ≈ 2,3 SÂN BÓNG NGANG
              </text>
            </g>

            {/* Giant 165.000 DWT Mother Ship Blasting Out to Sea */}
            <g transform={`translate(${newShipX}, 172)`}>
              {/* Express Cyan Wake */}
              <polygon points="-195,-16 -90,-28 -90,28 -195,16" fill="rgba(45, 212, 191, 0.25)" />
              <line x1={-200} y1={0} x2={-92} y2={0} stroke="#5EEAD4" strokeWidth={5} strokeDasharray="12 8" />

              {/* Massive Megaship Hull */}
              <polygon
                points="-96,-32 72,-32 108,0 72,32 -96,32"
                fill="#0F172A"
                stroke={PALETTE.tealDeep}
                strokeWidth={3}
              />
              {/* Colorful Container Bays */}
              {[-78, -48, -18, 12, 42].map((cx, ci) => (
                <g key={ci}>
                  <rect
                    x={cx}
                    y={-22}
                    width={24}
                    height={19}
                    rx={2}
                    fill={ci % 2 === 0 ? "#F59E0B" : "#0EA5E9"}
                  />
                  <rect
                    x={cx}
                    y={3}
                    width={24}
                    height={19}
                    rx={2}
                    fill={ci % 2 === 0 ? "#10B981" : "#F43F5E"}
                  />
                </g>
              ))}
              {/* White Bridge Superstructure */}
              <rect x={-56} y={-27} width={14} height={54} rx={2} fill="#F8FAFC" />

              <rect x={-160} y={-74} width={344} height={34} rx={6} fill="#020611" stroke={PALETTE.tealDeep} strokeWidth={1.8} />
              <text x={12} y={-52} textAnchor="middle" fill={PALETTE.tealDeep} fontFamily={FONTS.mono} fontSize={14.5} fontWeight={800}>
                SIÊU TÀU MẸ 165.000 DWT • PHÓNG THẲNG!
              </text>
            </g>
          </svg>
        </div>
      </div>

      {/* Real STS Gantry Crane Photo Card (calmly docked in bottom-right, no zoom) */}
      <EvidencePhotoCard
        photo={REAL_PHOTOS.lach_huyen_cranes}
        left={width - SAFE_X - 420}
        top={height - SAFE_Y - 224}
        width={402}
        height={210}
        accentColor={PALETTE.tealDeep}
        anchorPoint={[width - SAFE_X - 480, 694]}
        appearAtSec={0.5}
      />
    </AbsoluteFill>
  );
};
