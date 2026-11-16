import React from "react";
import { AbsoluteFill, interpolate, spring, useCurrentFrame, useVideoConfig } from "remotion";
import { FONTS, PALETTE, SAFE_X } from "../theme";

export const Scene03VesselEvolutionScale: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps, durationInFrames, width, height } = useVideoConfig();
  const progress = frame / Math.max(1, durationInFrames - 1);

  const stageIn = spring({ frame: frame - 3, fps, config: { damping: 18, stiffness: 135 } });
  const era1In = spring({ frame: frame - Math.round(durationInFrames * 0.08), fps, config: { damping: 17, stiffness: 140 } });
  const era2In = spring({ frame: frame - Math.round(durationInFrames * 0.24), fps, config: { damping: 17, stiffness: 140 } });
  const era3In = spring({ frame: frame - Math.round(durationInFrames * 0.42), fps, config: { damping: 16, stiffness: 135 } });
  const pitchReveal = interpolate(progress, [0.54, 0.78], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  // Waterline at y=470; depth scale 1m = 21px -> -6m (596), -7m (617), -14m (764), -16m (806)
  const waterY = 470;
  const pxPerMeter = 21;
  const y7 = waterY + 7 * pxPerMeter;
  const y14 = waterY + 14 * pxPerMeter;
  const y16 = waterY + 16 * pxPerMeter;

  return (
    <AbsoluteFill
      style={{
        background: "linear-gradient(180deg, #040D1A 0%, #071A30 40%, #020813 100%)",
        overflow: "hidden",
      }}
    >
      {/* Top Broadcast Title */}
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
              background: "#FACC15",
              color: "#020611",
              fontFamily: FONTS.mono,
              fontSize: 13,
              fontWeight: 800,
              marginBottom: 8,
            }}
          >
            CHƯƠNG 1.3 • CÚ NHẢY VỌT KÍCH CỠ TÀU BIỂN GẤP 20 LẦN
          </div>
          <div style={{ fontFamily: FONTS.sans, fontSize: 36, fontWeight: 800, color: "#FFFFFF" }}>
            Ba thế hệ tàu trên cùng một dòng sông: <span style={{ color: PALETTE.coralWarn }}>Lồng chật thế kỷ XXI</span>
          </div>
        </div>

        <div
          style={{
            padding: "10px 18px",
            borderRadius: 10,
            background: "rgba(244, 63, 94, 0.16)",
            border: `2px solid ${PALETTE.coralWarn}`,
            fontFamily: FONTS.mono,
            fontSize: 18,
            fontWeight: 800,
            color: "#FDA4AF",
          }}
        >
          MỚN NƯỚC TĂNG TỪ 4–6 M LÊN 13,5–16 M
        </div>
      </div>

      <svg width={width} height={height} style={{ position: "absolute", inset: 0 }}>
        <defs>
          <linearGradient id="seaZone3" x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor="#0EA5E9" stopOpacity={0.36} />
            <stop offset="100%" stopColor="#082F49" stopOpacity={0.85} />
          </linearGradient>
        </defs>

        {/* Water column down to y=850 */}
        <rect x={SAFE_X} y={waterY} width={width - SAFE_X * 2} height={375} fill="url(#seaZone3)" />

        {/* Water Surface + Horizontal Depth Calipers */}
        <line x1={SAFE_X} y1={waterY} x2={width - SAFE_X} y2={waterY} stroke="#38BDF8" strokeWidth={3.5} />
        <line x1={SAFE_X} y1={y7} x2={width - SAFE_X} y2={y7} stroke={PALETTE.coralWarn} strokeWidth={2.6} strokeDasharray="10 6" />
        <line x1={SAFE_X} y1={y14} x2={width - SAFE_X} y2={y14} stroke={PALETTE.tealDeep} strokeWidth={2.2} strokeDasharray="8 6" />
        <line x1={SAFE_X} y1={y16} x2={width - SAFE_X} y2={y16} stroke="#38BDF8" strokeWidth={1.6} strokeDasharray="6 6" opacity={0.7} />

        {/* === GENERATION 1: 1874 STEAMSHIP (~85m, draft 5m -> 105px below waterY) === */}
        <g opacity={era1In} transform={`translate(295, ${waterY})`}>
          <polygon points="-85,-32 85,-32 102,0 82,105 -78,105 -95,0" fill="#D97706" stroke="#FDE68A" strokeWidth={2.5} />
          <rect x={-26} y={-82} width={52} height={50} fill="#F5F5F4" stroke="#0F172A" strokeWidth={2} />
          <rect x={-10} y={-122} width={20} height={42} fill="#1E293B" stroke="#FACC15" strokeWidth={1.8} />
          <rect x={-118} y={-236} width={250} height={96} rx={10} fill="rgba(15, 23, 42, 0.94)" stroke="#FACC15" strokeWidth={2} />
          <text x={7} y={-208} textAnchor="middle" fill="#FACC15" fontFamily={FONTS.mono} fontSize={14} fontWeight={800}>
            1. TÀU HƠI NƯỚC (1874)
          </text>
          <text x={7} y={-182} textAnchor="middle" fill="#FFFFFF" fontFamily={FONTS.sans} fontSize={17} fontWeight={700}>
            Vài nghìn tấn • Dài ~85 m
          </text>
          <text x={7} y={-156} textAnchor="middle" fill="#86EFAC" fontFamily={FONTS.mono} fontSize={15} fontWeight={700}>
            ✓ Mớn 4–6 m (Lọt sông Cấm)
          </text>
        </g>

        {/* === GENERATION 2: FEEDER VESSEL (~195m, draft 7.5m -> 157px below waterY) === */}
        <g opacity={era2In} transform={`translate(685, ${waterY})`}>
          <polygon points="-155,-44 155,-44 185,0 165,157 -148,157 -170,0" fill="#B45309" stroke="#FDBA74" strokeWidth={2.5} />
          <rect x={-125} y={-92} width={215} height={48} fill="#EA580C" stroke="#FED7AA" strokeWidth={1.5} />
          <rect x={98} y={-126} width={38} height={82} fill="#F8FAFC" stroke="#0F172A" strokeWidth={2} />
          <rect x={-185} y={-258} width={370} height={106} rx={10} fill="rgba(15, 23, 42, 0.94)" stroke={PALETTE.amberBright} strokeWidth={2} />
          <text x={0} y={-230} textAnchor="middle" fill={PALETTE.amberBright} fontFamily={FONTS.mono} fontSize={14} fontWeight={800}>
            2. TÀU GOM HÀNG FEEDER
          </text>
          <text x={0} y={-204} textAnchor="middle" fill="#FFFFFF" fontFamily={FONTS.sans} fontSize={17} fontWeight={700}>
            20.000–30.000 DWT • ~195 m
          </text>
          <text x={0} y={-176} textAnchor="middle" fill="#FDE047" fontFamily={FONTS.mono} fontSize={14.5} fontWeight={700}>
            ! Chạm ngưỡng cạn sông &amp; Kênh Hà Nam
          </text>
        </g>

        {/* === GENERATION 3: ULTRAMAX MOTHER SHIP (200.000 DWT, ~400 m, draft 13.5–16m -> 310px) === */}
        <g opacity={era3In} transform={`translate(1375, ${waterY})`}>
          <polygon points="-335,-76 315,-76 365,0 325,310 -320,310 -360,0" fill="#0F766E" stroke={PALETTE.tealDeep} strokeWidth={3.5} />
          {[-290, -220, -150, -80, -10, 60, 130, 200].map((cx, ci) => (
            <g key={ci}>
              <rect x={cx} y={-144} width={60} height={68} fill={ci % 3 === 0 ? "#F59E0B" : ci % 3 === 1 ? "#EF4444" : "#38BDF8"} stroke="#042F2E" strokeWidth={1.8} />
              <line x1={cx} y1={-122} x2={cx + 60} y2={-122} stroke="#042F2E" strokeWidth={1.5} />
              <line x1={cx} y1={-100} x2={cx + 60} y2={-100} stroke="#042F2E" strokeWidth={1.5} />
            </g>
          ))}
          <rect x={268} y={-188} width={48} height={112} fill="#F8FAFC" stroke="#0F172A" strokeWidth={2.5} />
          <rect x={-328} y={7 * pxPerMeter} width={656} height={163} fill="rgba(244, 63, 94, 0.25)" stroke={PALETTE.coralWarn} strokeWidth={2.5} strokeDasharray="8 5" />

          <rect x={-305} y={-292} width={610} height={92} rx={12} fill="rgba(6, 17, 31, 0.96)" stroke={PALETTE.tealDeep} strokeWidth={2.5} />
          <text x={0} y={-262} textAnchor="middle" fill={PALETTE.tealDeep} fontFamily={FONTS.mono} fontSize={15} fontWeight={800}>
            3. SIÊU TÀU MẸ THẾ KỶ XXI (GẤP 20 LẦN TẢI TRỌNG)
          </text>
          <text x={0} y={-234} textAnchor="middle" fill="#FFFFFF" fontFamily={FONTS.sans} fontSize={20} fontWeight={800}>
            165.000–200.000 DWT • Dài ~400 m • Mớn 13,5–16 m
          </text>
          <text x={0} y={-212} textAnchor="middle" fill="#FDA4AF" fontFamily={FONTS.mono} fontSize={14} fontWeight={700}>
            ✕ SÔNG CẤM (-7,0 M) QUÁ NÔNG &amp; HẸP ĐỂ QUAY ĐẦU
          </text>
        </g>

        {/* Crisp Left Depth Labels rendered OVER water & vessels so never covered */}
        <rect x={SAFE_X + 10} y={waterY - 30} width={166} height={24} rx={4} fill="rgba(6, 17, 31, 0.92)" />
        <text x={SAFE_X + 16} y={waterY - 13} fill="#38BDF8" fontFamily={FONTS.mono} fontSize={13.5} fontWeight={800}>
          MẶT NƯỚC 0,0 M
        </text>
        <rect x={SAFE_X + 10} y={y7 - 15} width={258} height={28} rx={5} fill="rgba(159, 18, 57, 0.94)" />
        <text x={SAFE_X + 20} y={y7 + 4} fill="#FFFFFF" fontFamily={FONTS.mono} fontSize={13.5} fontWeight={800}>
          ĐÁY SÔNG CẤM HIỆN HỮU: -7,0 M
        </text>
        <text x={SAFE_X + 12} y={y14 - 8} fill={PALETTE.tealDeep} fontFamily={FONTS.mono} fontSize={14} fontWeight={800}>
          CHUẨN TẮC SIÊU TÀU: -14,0 M
        </text>
        <text x={SAFE_X + 12} y={y16 - 8} fill="#7DD3FC" fontFamily={FONTS.mono} fontSize={14} fontWeight={800}>
          BẾN NƯỚC SÂU TỐI ĐA: -16,0 M
        </text>

        {/* === 4 SOCCER PITCHES SCALE COMPARISON (y=865..930, clear above bottom subtitle!) === */}
        <g opacity={pitchReveal} transform="translate(950, 864)">
          <rect x={-16} y={-8} width={852} height={74} rx={10} fill="rgba(6, 17, 31, 0.92)" stroke="#22C55E" strokeWidth={2} />
          {[0, 1, 2, 3].map((pIdx) => {
            const sx = pIdx * 188;
            return (
              <g key={pIdx} transform={`translate(${sx}, 4)`}>
                <rect x={0} y={0} width={178} height={50} rx={4} fill="#15803D" stroke="#FFFFFF" strokeWidth={1.6} />
                <line x1={89} y1={0} x2={89} y2={50} stroke="#FFFFFF" strokeWidth={1.4} />
                <circle cx={89} cy={25} r={10} fill="none" stroke="#FFFFFF" strokeWidth={1.4} />
              </g>
            );
          })}
          <text x={755} y={26} fill="#86EFAC" fontFamily={FONTS.mono} fontSize={16} fontWeight={800}>
            ≈ 4 SÂN
          </text>
          <text x={755} y={48} fill="#FFFFFF" fontFamily={FONTS.mono} fontSize={14.5} fontWeight={700}>
            BÓNG ĐÁ
          </text>
        </g>
      </svg>
    </AbsoluteFill>
  );
};
