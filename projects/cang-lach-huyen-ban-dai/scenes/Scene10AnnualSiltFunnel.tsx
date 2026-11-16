import React from "react";
import { AbsoluteFill, interpolate, spring, useCurrentFrame, useVideoConfig } from "remotion";
import { REAL_PHOTOS } from "../data/realPhotosManifest";
import { FONTS, PALETTE, SAFE_X } from "../theme";
import { EvidencePhotoCard } from "./EvidencePhotoCard";

export const Scene10AnnualSiltFunnel: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps, durationInFrames, width, height } = useVideoConfig();
  const progress = frame / Math.max(1, durationInFrames - 1);

  const stageIn = spring({ frame: frame - 3, fps, config: { damping: 18, stiffness: 135 } });
  const siltFill = interpolate(progress, [0.16, 0.62], [0.05, 0.96], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });
  const pivotIn = spring({ frame: frame - Math.round(durationInFrames * 0.46), fps, config: { damping: 16, stiffness: 135 } });
  const particleOffset = (frame * 2.4) % 90;

  return (
    <AbsoluteFill
      style={{
        background: "linear-gradient(180deg, #040D1A 0%, #091E36 52%, #020813 100%)",
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
              background: PALETTE.amberBright,
              color: "#020611",
              fontFamily: FONTS.mono,
              fontSize: 13,
              fontWeight: 800,
              marginBottom: 8,
            }}
          >
            CHƯƠNG 3.2 • CÁI PHỄU HỨNG BÙN PHÙ SA MỖI MÙA LŨ
          </div>
          <div style={{ fontFamily: FONTS.sans, fontSize: 36, fontWeight: 800, color: "#FFFFFF" }}>
            Đào năm trước → Bồi lấp năm sau: <span style={{ color: PALETTE.coralWarn }}>Vòng xoáy chi phí vô đáy</span>
          </div>
        </div>
      </div>

      {/* Left Diagram: Hydrological Silt-Trap Funnel */}
      <svg width={960} height={680} style={{ position: "absolute", left: SAFE_X, top: 144, opacity: stageIn }}>
        <defs>
          <linearGradient id="water10" x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor="#0EA5E9" stopOpacity={0.44} />
            <stop offset="100%" stopColor="#082F49" stopOpacity={0.9} />
          </linearGradient>
          <linearGradient id="siltFill10" x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor="#F59E0B" />
            <stop offset="100%" stopColor="#92400E" />
          </linearGradient>
        </defs>

        <rect x={0} y={0} width={960} height={650} rx={16} fill="rgba(6, 17, 31, 0.90)" stroke="rgba(245, 158, 11, 0.45)" strokeWidth={2} />
        <rect x={30} y={96} width={900} height={510} rx={8} fill="url(#water10)" />

        {/* Seabed Left Shelf -> Deep Trap Basin -> Right Shelf */}
        <polygon points="30,300 280,300 350,550 610,550 680,300 930,300 930,606 30,606" fill="#271408" stroke="#F59E0B" strokeWidth={2.5} />

        {/* Animated Settling Silt Filling Up the Artificial -14m Pit */}
        <polygon
          points={`350,550 610,550 ${610 + 70 * siltFill},${550 - 245 * siltFill} ${350 - 70 * siltFill},${550 - 245 * siltFill}`}
          fill="url(#siltFill10)"
          opacity={0.86}
        />

        {/* Animated Falling Sediment Particles from River Discharge */}
        {Array.from({ length: 14 }).map((_, i) => {
          const px = 210 + (i * 42);
          const py = 140 + ((particleOffset + i * 31) % 240);
          return <circle key={i} cx={px} cy={py} r={4.5} fill="#FDE047" opacity={0.78} />;
        })}

        {/* Upstream Flow Arrow */}
        <path d="M 60 190 L 390 190" stroke="#FACC15" strokeWidth={5} strokeLinecap="round" />
        <polygon points="390,180 416,190 390,200" fill="#FACC15" />
        <text x={66} y={170} fill="#FDE047" fontFamily={FONTS.sans} fontSize={17} fontWeight={800}>
          HÀNG TRIỆU M³ BÙN CÁT MÙA MƯA LŨ ĐỔ VỀ
        </text>

        <text x={480} y={584} textAnchor="middle" fill="#FFFFFF" fontFamily={FONTS.mono} fontSize={17} fontWeight={800}>
          &ldquo;CHIẾC PHỄU LẮNG BÙN&rdquo; — NẠO VÉT TỐN HÀNG TRĂM TỶ / NĂM
        </text>
      </svg>

      {/* Right Column: Repeating Maintenance Trap Bars + Strategic Pivot Banner */}
      <div
        style={{
          position: "absolute",
          right: SAFE_X,
          top: 144,
          width: 752,
          display: "flex",
          flexDirection: "column",
          gap: 14,
          opacity: stageIn,
        }}
      >
        <div
          style={{
            padding: "16px 22px",
            background: "rgba(6, 17, 31, 0.94)",
            borderRadius: 16,
            border: `2px solid ${PALETTE.amberBright}`,
          }}
        >
          <div style={{ fontFamily: FONTS.mono, fontSize: 13.5, fontWeight: 800, color: "#FACC15", marginBottom: 10 }}>
            CHU KỲ NẠO VÉT LẶP LẠI VÔ TẬN TRONG CỬA SÔNG
          </div>
          {[
            { yr: "Năm 1 • Đào hố sâu -14 m", pct: 42, col: "#38BDF8" },
            { yr: "Mùa lũ • Bồi lấp trở lại", pct: 68, col: PALETTE.amberBright },
            { yr: "Năm 2..N • Tốn hàng trăm tỷ duy tu", pct: 95, col: PALETTE.coralWarn },
          ].map((b, bi) => {
            const wPct = b.pct * Math.min(1, progress * 1.4);
            return (
              <div key={bi} style={{ marginBottom: bi < 2 ? 10 : 0 }}>
                <div style={{ fontFamily: FONTS.sans, fontSize: 16.5, fontWeight: 700, color: "#F8FAFC", marginBottom: 4 }}>
                  {b.yr}
                </div>
                <div style={{ width: "100%", height: 18, borderRadius: 6, background: "#0F172A", overflow: "hidden" }}>
                  <div style={{ width: `${wPct}%`, height: "100%", background: b.col, borderRadius: 6 }} />
                </div>
              </div>
            );
          })}
        </div>

        {/* Decisive Green/Teal Pivot Banner leading directly into Chapter 4 */}
        <div
          style={{
            padding: "18px 24px",
            background: "linear-gradient(135deg, rgba(13, 148, 136, 0.28) 0%, rgba(6, 17, 31, 0.96) 100%)",
            borderRadius: 16,
            border: `2.5px solid ${PALETTE.tealDeep}`,
            borderLeft: `9px solid ${PALETTE.tealDeep}`,
            boxShadow: "0 24px 54px rgba(0,0,0,0.75)",
            opacity: pivotIn,
            transform: `scale(${0.94 + 0.06 * pivotIn})`,
          }}
        >
          <div style={{ fontFamily: FONTS.mono, fontSize: 13.5, fontWeight: 800, color: PALETTE.tealDeep, marginBottom: 6 }}>
            CHÂN LÝ ĐỊA LÝ KINH TẾ
          </div>
          <div style={{ fontFamily: FONTS.sans, fontSize: 25, fontWeight: 800, color: "#FFFFFF", lineHeight: 1.28 }}>
            Không cố đào sâu dòng sông cũ —{" "}
            <span style={{ color: PALETTE.tealDeep }}>NHẢY QUA CỬA SÔNG RA BIỂN HỞ!</span>
          </div>
        </div>
      </div>

      <EvidencePhotoCard
        photo={REAL_PHOTOS.hopper_dredger}
        left={width - SAFE_X - 510}
        top={520}
        width={510}
        height={274}
        accentColor={PALETTE.amberBright}
        appearAtSec={1.8}
      />
    </AbsoluteFill>
  );
};
