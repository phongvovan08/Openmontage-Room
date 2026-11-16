import React from "react";
import { AbsoluteFill, interpolate, spring, useCurrentFrame, useVideoConfig } from "remotion";
import { FONTS, PALETTE, SAFE_X } from "../theme";

export const Scene14BathymetricClash: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps, durationInFrames, width, height } = useVideoConfig();
  const progress = frame / Math.max(1, durationInFrames - 1);

  const stageIn = spring({ frame: frame - 3, fps, config: { damping: 18, stiffness: 135 } });
  const leftSlide = interpolate(progress, [0.04, 0.28], [-120, 0], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
  const isGrounded = progress >= 0.26;
  const impactSpring = spring({ frame: frame - Math.round(durationInFrames * 0.26), fps, config: { damping: 11, stiffness: 180 } });
  const groundedTilt = isGrounded ? -4.2 * impactSpring : 0;

  const rightGlide = interpolate(progress, [0.06, 0.95], [-36, 26], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
  const bldgIn = spring({ frame: frame - Math.round(durationInFrames * 0.18), fps, config: { damping: 17, stiffness: 140 } });

  const pulse = (frame % 36) / 36;
  const seaY = 296;
  const y7m = seaY + 7 * 28;
  const y85m = seaY + 8.5 * 28;
  const y14m = seaY + 14 * 28;
  const y16m = seaY + 16 * 28;
  const yBottom = 842;

  return (
    <AbsoluteFill style={{ background: "linear-gradient(180deg, #040D1A 0%, #071A30 32%, #020813 100%)", overflow: "hidden" }}>
      <div style={{ position: "absolute", left: SAFE_X, right: SAFE_X, top: 32, display: "flex", justifyContent: "space-between", alignItems: "center", opacity: stageIn }}>
        <div>
          <div style={{ display: "inline-block", padding: "5px 14px", borderRadius: 6, background: "#38BDF8", color: "#020611", fontFamily: FONTS.mono, fontSize: 13, fontWeight: 800, marginBottom: 8 }}>
            CHƯƠNG 4.4 • LÁT CẮT ĐỘ SÂU QUYẾT ĐỊNH SỐ PHẬN SIÊU TÀU
          </div>
          <div style={{ fontFamily: FONTS.sans, fontSize: 36, fontWeight: 800, color: "#FFFFFF" }}>
            Mắc cạn ở <span style={{ color: PALETTE.coralWarn }}>-7,0 m / -8,5 m</span> vs Đón siêu tàu ở{" "}
            <span style={{ color: PALETTE.tealDeep }}>-14,0 m → -16,0 m</span>
          </div>
        </div>
        <div style={{ padding: "10px 18px", borderRadius: 10, background: "rgba(15, 23, 42, 0.92)", border: `1.5px solid ${PALETTE.tealDeep}`, fontFamily: FONTS.mono, fontSize: 15, fontWeight: 700, color: PALETTE.tealDeep }}>
          MỚN NƯỚC SIÊU TÀU 165.000 DWT: ~13,0 M
        </div>
      </div>

      <svg width={width} height={height} style={{ position: "absolute", inset: 0 }}>
        <defs>
          <linearGradient id="oceanDepth14" x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor="#0EA5E9" stopOpacity={0.44} />
            <stop offset="45%" stopColor="#0369A1" stopOpacity={0.58} />
            <stop offset="100%" stopColor="#082F49" stopOpacity={0.86} />
          </linearGradient>
          <linearGradient id="seabed14" x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor="#92400E" />
            <stop offset="35%" stopColor="#5C2406" />
            <stop offset="100%" stopColor="#1E0B02" />
          </linearGradient>
        </defs>

        <rect x={SAFE_X} y={seaY} width={width - SAFE_X * 2} height={yBottom - seaY} fill="url(#oceanDepth14)" />

        {[0, 7, 8.5, 14, 16].map((d) => {
          const yy = seaY + d * 28;
          return (
            <g key={d}>
              <line
                x1={SAFE_X}
                y1={yy}
                x2={width - SAFE_X}
                y2={yy}
                stroke={d === 0 ? "#38BDF8" : d <= 8.5 ? PALETTE.amberBright : PALETTE.tealDeep}
                strokeWidth={d === 0 ? 3.2 : 2}
                strokeDasharray={d === 0 ? undefined : "8 6"}
              />
              <text
                x={SAFE_X - 10}
                y={yy + 5}
                textAnchor="end"
                fill={d <= 8.5 && d > 0 ? PALETTE.amberBright : d >= 14 ? PALETTE.tealDeep : "#CBD5E1"}
                fontFamily={FONTS.mono}
                fontSize={14}
                fontWeight={700}
              >
                {d === 0 ? "0,0m" : `-${String(d).replace(".", ",")}m`}
              </text>
            </g>
          );
        })}

        {/* Seabed Stepped Cliff: Song Cam (-7m) -> Ha Nam (-8.5m) -> Lach Huyen Channel (-14m) & Berths Basin (-16m) */}
        <path
          d={`M ${SAFE_X} ${y7m} L 725 ${y7m} L 750 ${y85m} L 945 ${y85m} L 995 ${y14m} L 1280 ${y14m} L 1320 ${y16m} L ${width - SAFE_X} ${y16m} L ${width - SAFE_X} ${yBottom} L ${SAFE_X} ${yBottom} Z`}
          fill="url(#seabed14)"
        />
        <polyline points={`${SAFE_X},${y7m} 725,${y7m} 750,${y85m} 945,${y85m}`} fill="none" stroke={PALETTE.amberBright} strokeWidth={5} />
        <polyline points={`945,${y85m} 995,${y14m} 1280,${y14m} 1320,${y16m} ${width - SAFE_X},${y16m}`} fill="none" stroke={PALETTE.tealDeep} strokeWidth={5} />

        {/* ZONE LABELS ON SEABED FLOOR */}
        <text x={410} y={802} textAnchor="middle" fill="#FDBA74" fontFamily={FONTS.mono} fontSize={20} fontWeight={800}>
          SÔNG CẤM (-7,0 M) • HÀ NAM (-8,5 M)
        </text>
        <text x={1415} y={802} textAnchor="middle" fill="#99F6E4" fontFamily={FONTS.mono} fontSize={20} fontWeight={800}>
          LUỒNG -14,0 M → VŨNG BẾN SÂU -16,0 M
        </text>

        {/* Left Ship Slamming into -7.0m / -8.5m Shelf */}
        <g transform={`translate(${495 + leftSlide}, ${seaY}) rotate(${groundedTilt})`}>
          <path d="M -290 -58 L 235 -58 L 295 0 L 245 364 L -260 364 L -315 0 Z" fill="#991B1B" stroke={PALETTE.coralWarn} strokeWidth={3.5} opacity={0.95} />
          {[-240, -165, -90, -15, 60].map((cx, idx) => (
            <rect key={idx} x={cx} y={-118} width={64} height={60} fill={idx % 2 === 0 ? "#F59E0B" : "#EA580C"} stroke="#450A0A" strokeWidth={1.8} />
          ))}
          <rect x={150} y={-148} width={44} height={90} fill="#F8FAFC" stroke="#450A0A" strokeWidth={2} />
          <line x1={-335} y1={364} x2={325} y2={364} stroke="#FDA4AF" strokeWidth={2.5} strokeDasharray="8 6" />
          <text x={-20} y={392} textAnchor="middle" fill="#FDA4AF" fontFamily={FONTS.mono} fontSize={14} fontWeight={800}>
            MỚN NƯỚC TÀU LỚN ~13,0 M
          </text>
          {isGrounded && (
            <g transform="translate(245, 210)">
              <circle cx={0} cy={0} r={22 + pulse * 44} fill="none" stroke={PALETTE.coralWarn} strokeWidth={3.5} opacity={1 - pulse} />
              <circle cx={0} cy={0} r={16} fill={PALETTE.coralWarn} stroke="#FFFFFF" strokeWidth={3} />
              <rect x={-110} y={-86} width={220} height={46} rx={9} fill="rgba(159, 18, 57, 0.96)" stroke="#FFFFFF" strokeWidth={2} />
              <text x={0} y={-57} textAnchor="middle" fill="#FFFFFF" fontFamily={FONTS.mono} fontSize={20} fontWeight={800}>✕ MẮC CẠN!</text>
            </g>
          )}
        </g>

        {/* Right Hero Megaship (366m) floating cleanly above -16m Basin & 4-Story Scale Building */}
        <g transform={`translate(${1415 + rightGlide}, ${seaY})`}>
          <path d="M -300 -64 L 245 -64 L 308 0 L 252 356 L -268 356 L -326 0 Z" fill="#0F766E" stroke={PALETTE.tealDeep} strokeWidth={3.5} />
          {[-250, -178, -106, -34, 38, 110].map((cx, idx) => (
            <g key={idx}>
              <rect x={cx} y={-124} width={64} height={60} fill={idx % 3 === 0 ? "#F59E0B" : idx % 3 === 1 ? "#38BDF8" : "#22C55E"} stroke="#042F2E" strokeWidth={1.8} />
              <line x1={cx} y1={-94} x2={cx + 64} y2={-94} stroke="#042F2E" strokeWidth={1.5} />
            </g>
          ))}
          <rect x={182} y={-158} width={46} height={94} fill="#F8FAFC" stroke="#042F2E" strokeWidth={2} />

          <line x1={-300} y1={-152} x2={308} y2={-152} stroke="#86EFAC" strokeWidth={2} />
          <rect x={-168} y={-194} width={336} height={36} rx={7} fill="rgba(6, 17, 31, 0.94)" stroke="#86EFAC" strokeWidth={1.6} />
          <text x={0} y={-170} textAnchor="middle" fill="#86EFAC" fontFamily={FONTS.mono} fontSize={14} fontWeight={800}>
            SIÊU TÀU DÀI 366 M (≈ 3,5 SÂN BÓNG)
          </text>

          <rect x={-156} y={96} width={312} height={46} rx={9} fill="rgba(6, 17, 31, 0.92)" stroke={PALETTE.tealDeep} strokeWidth={2} />
          <text x={0} y={125} textAnchor="middle" fill="#5EEAD4" fontFamily={FONTS.mono} fontSize={18} fontWeight={800}>
            ✓ NỔI AN TOÀN TUYỆT ĐỐI
          </text>
        </g>

        {/* 4-to-5 Story Lit Yellow Scale Building inside Deep Basin (-14m to -16m) */}
        <g opacity={bldgIn} transform={`translate(1018, ${seaY})`}>
          <rect x={0} y={0} width={76} height={y16m - seaY} rx={4} fill="rgba(15, 23, 42, 0.90)" stroke="#FACC15" strokeWidth={2.5} />
          {[0, 1, 2, 3].map((fl) => (
            <g key={fl}>
              <line x1={0} y1={fl * 106} x2={76} y2={fl * 106} stroke="#FACC15" strokeWidth={1.6} />
              <rect x={12} y={fl * 106 + 18} width={20} height={64} rx={3} fill="rgba(250, 204, 21, 0.65)" />
              <rect x={44} y={fl * 106 + 18} width={20} height={64} rx={3} fill="rgba(250, 204, 21, 0.65)" />
            </g>
          ))}
          <rect x={-82} y={y16m - seaY + 12} width={240} height={34} rx={6} fill="rgba(2, 6, 17, 0.94)" stroke="#FACC15" strokeWidth={1.5} />
          <text x={38} y={y16m - seaY + 34} textAnchor="middle" fill="#FACC15" fontFamily={FONTS.mono} fontSize={13.5} fontWeight={800}>
            SÂU ≈ TÒA NHÀ 4–5 TẦNG
          </text>
        </g>
      </svg>
    </AbsoluteFill>
  );
};

