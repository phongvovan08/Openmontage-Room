import React from "react";
import { AbsoluteFill, interpolate, spring, useCurrentFrame, useVideoConfig } from "remotion";
import { REAL_PHOTOS } from "../data/realPhotosManifest";
import { formatVnNumber, FONTS, PALETTE, SAFE_X } from "../theme";
import { EvidencePhotoCard } from "./EvidencePhotoCard";

export const Scene13SplitChannelRace: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps, durationInFrames } = useVideoConfig();
  const progress = frame / Math.max(1, durationInFrames - 1);

  const deckIn = spring({ frame: frame - 4, fps, config: { damping: 19, stiffness: 135 } });
  const raceT = interpolate(progress, [0.08, 0.85], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });

  const oldShipX = interpolate(raceT, [0, 1], [110, 248]);
  const newShipX = interpolate(raceT, [0, 1], [110, 442]);

  const kmOld = interpolate(progress, [0.06, 0.38], [0, 48.0], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
  const kmNew = interpolate(progress, [0.14, 0.46], [0, 20.66], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
  const waterFlow = (frame * 3.2) % 48;

  return (
    <AbsoluteFill style={{ background: "radial-gradient(circle at 50% 50%, #091D34 0%, #030914 85%)", overflow: "hidden" }}>
      <div style={{ position: "absolute", left: SAFE_X, right: SAFE_X, top: 30, display: "flex", justifyContent: "space-between", alignItems: "center", opacity: deckIn }}>
        <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
          <span style={{ padding: "5px 14px", borderRadius: 6, background: "#FACC15", color: "#020611", fontFamily: FONTS.mono, fontSize: 13, fontWeight: 800 }}>
            CHƯƠNG 4.3 • TỶ LỆ TRỰC DIỆN 1:1 HAI LUỒNG TÀU
          </span>
          <span style={{ fontFamily: FONTS.sans, fontSize: 30, fontWeight: 800, color: "#FFFFFF" }}>
            Lộ trình Sông Cấm cũ vs Đại lộ biển Lạch Huyện mới
          </span>
        </div>
        <div style={{ padding: "6px 14px", borderRadius: 8, background: "rgba(15, 23, 42, 0.9)", border: `1px solid ${PALETTE.borderSubtle}`, fontFamily: FONTS.mono, fontSize: 13, color: PALETTE.textSecondary }}>
          Tỷ lệ bề rộng 1:1 (80 m vs 160 m)
        </div>
      </div>

      {/* Top Lane */}
      <div
        style={{
          position: "absolute",
          left: SAFE_X,
          right: SAFE_X,
          top: 94,
          height: 344,
          background: "linear-gradient(90deg, rgba(40, 22, 11, 0.95) 0%, rgba(24, 18, 16, 0.92) 100%)",
          borderRadius: 18,
          border: `2px solid ${PALETTE.amberBright}`,
          overflow: "hidden",
          display: "flex",
          opacity: deckIn,
        }}
      >
        <div style={{ width: 450, padding: "22px 26px", borderRight: "1px solid rgba(245, 158, 11, 0.3)", display: "flex", flexDirection: "column", justifyContent: "space-between", background: "rgba(12, 10, 9, 0.55)" }}>
          <div>
            <div style={{ fontFamily: FONTS.mono, fontSize: 13.5, fontWeight: 800, color: PALETTE.coralWarn, marginBottom: 6 }}>
              ✕ LỘ TRÌNH CŨ • SÔNG CẤM – KÊNH HÀ NAM
            </div>
            <div style={{ fontFamily: FONTS.mono, fontSize: 54, fontWeight: 800, color: PALETTE.amberBright, lineHeight: 1 }}>
              {formatVnNumber(kmOld, 1)} km
            </div>
            <div style={{ fontFamily: FONTS.sans, fontSize: 16.5, fontWeight: 600, color: "#FED7AA", marginTop: 6 }}>
              Quanh co từ nội đô ra Phao số 0
            </div>
          </div>
          <div style={{ padding: "12px 16px", borderRadius: 10, background: "rgba(245, 158, 11, 0.16)", border: `1.5px solid ${PALETTE.amberBright}` }}>
            <div style={{ fontFamily: FONTS.mono, fontSize: 19, fontWeight: 800, color: "#FDE047" }}>RỘNG CHỈ 80 M • SÂU -7,0 M</div>
            <div style={{ fontFamily: FONTS.sans, fontSize: 14.5, color: "#E2E8F0", marginTop: 2 }}>Tàu nhỏ phải bò chậm &amp; chờ thủy triều từng giờ</div>
          </div>
        </div>

        <div style={{ flex: 1, position: "relative" }}>
          <svg width={1310} height={344}>
            <rect x={0} y={0} width={1310} height={130} fill="#291D14" />
            <rect x={0} y={214} width={1310} height={130} fill="#291D14" />
            <rect x={0} y={130} width={1310} height={84} fill="#78350F" />
            <line x1={0} y1={130} x2={1310} y2={130} stroke={PALETTE.amberBright} strokeWidth={3} />
            <line x1={0} y1={214} x2={1310} y2={214} stroke={PALETTE.amberBright} strokeWidth={3} />
            <line x1={-waterFlow} y1={172} x2={1350} y2={172} stroke="rgba(253, 224, 71, 0.35)" strokeWidth={2} strokeDasharray="18 18" />
            <line x1={1140} y1={130} x2={1140} y2={214} stroke="#FFFFFF" strokeWidth={2.5} />
            <rect x={1154} y={153} width={118} height={38} rx={6} fill="#020611" stroke={PALETTE.amberBright} strokeWidth={1.6} />
            <text x={1213} y={178} textAnchor="middle" fill={PALETTE.amberBright} fontFamily={FONTS.mono} fontSize={18} fontWeight={800}>80 M HẸP</text>
            <g transform={`translate(${oldShipX}, 172)`}>
              <line x1={-95} y1={0} x2={-42} y2={0} stroke="#FDE68A" strokeWidth={4} strokeDasharray="6 5" opacity={0.65} />
              <polygon points="-44,-15 32,-15 50,0 32,15 -44,15" fill="#F59E0B" stroke="#FFFFFF" strokeWidth={2} />
              <rect x={-62} y={52} width={240} height={34} rx={6} fill="rgba(159, 18, 57, 0.95)" stroke="#FFFFFF" strokeWidth={1.5} />
              <text x={58} y={74} textAnchor="middle" fill="#FFFFFF" fontFamily={FONTS.mono} fontSize={14} fontWeight={800}>TÀU FEEDER • BÒ CHẬM 48 KM</text>
            </g>
          </svg>
        </div>
      </div>

      {/* Center Ribbon */}
      <div
        style={{
          position: "absolute",
          left: "50%",
          top: 454,
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
          whiteSpace: "nowrap",
        }}
      >
        ⚡ CẮT NGẮN 57% QUÃNG ĐƯỜNG &nbsp;•&nbsp; NHÂN ĐÔI BỀ RỘNG LUỒNG (80 M → 160 M ≈ 2,3 SÂN BÓNG)
      </div>

      {/* Bottom Lane (top=506, height=422 -> bottom=928 well clear above subtitles!) */}
      <div
        style={{
          position: "absolute",
          left: SAFE_X,
          right: SAFE_X,
          top: 506,
          height: 422,
          background: "linear-gradient(90deg, rgba(4, 34, 48, 0.96) 0%, rgba(6, 24, 44, 0.94) 100%)",
          borderRadius: 18,
          border: `2.5px solid ${PALETTE.tealDeep}`,
          overflow: "hidden",
          display: "flex",
          opacity: deckIn,
        }}
      >
        <div style={{ width: 450, padding: "24px 26px", borderRight: "1px solid rgba(45, 212, 191, 0.3)", display: "flex", flexDirection: "column", justifyContent: "space-between", background: "rgba(2, 12, 24, 0.55)" }}>
          <div>
            <div style={{ fontFamily: FONTS.mono, fontSize: 13.5, fontWeight: 800, color: PALETTE.tealDeep, marginBottom: 6 }}>✓ LỘ TRÌNH MỚI • KHU BẾN NƯỚC SÂU LẠCH HUYỆN</div>
            <div style={{ display: "flex", alignItems: "baseline", gap: 12 }}>
              <span style={{ fontFamily: FONTS.mono, fontSize: 54, fontWeight: 800, color: PALETTE.tealDeep, lineHeight: 1 }}>{formatVnNumber(kmNew, 2)} km</span>
              <span style={{ padding: "4px 10px", borderRadius: 6, background: "rgba(45, 212, 191, 0.2)", fontFamily: FONTS.mono, fontSize: 20, fontWeight: 800, color: "#5EEAD4" }}>-57%</span>
            </div>
            <div style={{ fontFamily: FONTS.sans, fontSize: 16.5, fontWeight: 600, color: "#CCFBF1", marginTop: 6 }}>Phóng thẳng từ đảo Cát Hải ra Phao số 0</div>
          </div>
          <div style={{ padding: "14px 16px", borderRadius: 10, background: "rgba(45, 212, 191, 0.16)", border: `1.5px solid ${PALETTE.tealDeep}` }}>
            <div style={{ fontFamily: FONTS.mono, fontSize: 21, fontWeight: 800, color: "#FFFFFF" }}>RỘNG 160 M ≈ 2,3 SÂN BÓNG</div>
            <div style={{ fontFamily: FONTS.sans, fontSize: 15, color: "#99F6E4", marginTop: 3 }}>Gấp đôi luồng cũ — đón siêu tàu container cỡ lớn</div>
          </div>
        </div>

        <div style={{ flex: 1, position: "relative" }}>
          <svg width={1310} height={422}>
            <rect x={0} y={0} width={1310} height={82} fill="#082032" />
            <rect x={0} y={250} width={1310} height={172} fill="#061626" />
            <rect x={0} y={82} width={1310} height={168} fill="#0284C7" opacity={0.44} />
            <line x1={0} y1={82} x2={1310} y2={82} stroke={PALETTE.tealDeep} strokeWidth={4} />
            <line x1={0} y1={250} x2={1310} y2={250} stroke={PALETTE.tealDeep} strokeWidth={4} />
            <line x1={-waterFlow * 1.4} y1={166} x2={1360} y2={166} stroke="rgba(186, 230, 253, 0.4)" strokeWidth={2.5} strokeDasharray="24 18" />

            {/* 2.3 Football Pitches Cross-Section */}
            <g transform="translate(808, 86)">
              <rect x={0} y={0} width={96} height={68} fill="#15803D" stroke="#FFFFFF" strokeWidth={1.6} opacity={0.92} />
              <line x1={0} y1={34} x2={96} y2={34} stroke="#FFFFFF" strokeWidth={1.4} />
              <circle cx={48} cy={34} r={12} fill="none" stroke="#FFFFFF" strokeWidth={1.4} />
              <rect x={0} y={72} width={96} height={68} fill="#15803D" stroke="#FFFFFF" strokeWidth={1.6} opacity={0.92} />
              <line x1={0} y1={106} x2={96} y2={106} stroke="#FFFFFF" strokeWidth={1.4} />
              <circle cx={48} cy={106} r={12} fill="none" stroke="#FFFFFF" strokeWidth={1.4} />
              <rect x={0} y={144} width={96} height={16} fill="#15803D" stroke="#FFFFFF" strokeWidth={1.4} strokeDasharray="4 3" opacity={0.85} />
              <rect x={-124} y={56} width={116} height={48} rx={7} fill="rgba(2, 6, 17, 0.92)" stroke="#86EFAC" strokeWidth={1.5} />
              <text x={-66} y={76} textAnchor="middle" fill="#86EFAC" fontFamily={FONTS.mono} fontSize={13.5} fontWeight={800}>2,3 SÂN</text>
              <text x={-66} y={95} textAnchor="middle" fill="#FFFFFF" fontFamily={FONTS.mono} fontSize={12} fontWeight={700}>BÓNG ĐÁ</text>
            </g>

            {/* Giant Container Ship gliding in 160m trench */}
            <g transform={`translate(${newShipX}, 166)`}>
              <line x1={-155} y1={-18} x2={-75} y2={-6} stroke="#BAE6FD" strokeWidth={4} opacity={0.72} />
              <line x1={-155} y1={18} x2={-75} y2={6} stroke="#BAE6FD" strokeWidth={4} opacity={0.72} />
              <polygon points="-86,-28 62,-28 96,0 62,28 -86,28" fill="#0F766E" stroke="#FFFFFF" strokeWidth={2.8} />
              <rect x={-66} y={-20} width={30} height={17} fill="#F59E0B" />
              <rect x={-66} y={3} width={30} height={17} fill="#EF4444" />
              <rect x={-32} y={-20} width={30} height={17} fill="#38BDF8" />
              <rect x={-32} y={3} width={30} height={17} fill="#22C55E" />
              <rect x={4} y={-20} width={28} height={17} fill="#F97316" />
              <rect x={4} y={3} width={28} height={17} fill="#EC4899" />
              <rect x={36} y={-18} width={16} height={36} fill="#F8FAFC" />
              <rect x={-100} y={108} width={288} height={36} rx={7} fill="rgba(13, 148, 136, 0.95)" stroke="#FFFFFF" strokeWidth={1.6} />
              <text x={44} y={131} textAnchor="middle" fill="#FFFFFF" fontFamily={FONTS.mono} fontSize={14} fontWeight={800}>SIÊU TÀU MẸ • LUỒNG RỘNG 160 M</text>
            </g>
          </svg>
        </div>
      </div>

      {/* Real Cranes Photo (calmly docked right side inside bottom lane, zero overlap) */}
      <EvidencePhotoCard
        photo={REAL_PHOTOS.lach_huyen_cranes}
        left={1432}
        top={532}
        width={408}
        height={244}
        accentColor={PALETTE.tealDeep}
        appearAtSec={1.6}
      />
    </AbsoluteFill>
  );
};

