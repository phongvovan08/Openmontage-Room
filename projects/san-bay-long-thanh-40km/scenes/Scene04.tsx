import React from "react";
import { interpolate, useCurrentFrame, useVideoConfig } from "remotion";
import { TSN_RUNWAY_25L, TSN_RUNWAY_25R } from "../data/longThanhGeoData";
import { boxOfBounds, coordsToScreenPath, lonLatToScreen } from "../mapMath";
import { DARK_SHADOW, FONTS, PALETTE, SAFE_X } from "../theme";
import { RealSatelliteBasemap, VietnamMiniLocator } from "./AviationBaseLayers";
import { MovingAircraft } from "./MovingAircraft";
import { createProjector3D, GeoCaliperRule, SceneHeaderPill, Tactical3DStage } from "./Tactical3DKit";

const BOX_TSN_MACRO = boxOfBounds({ west: 106.631, south: 10.800, east: 106.673, north: 10.831 }, 0.04);

export const Scene04: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps, durationInFrames } = useVideoConfig();
  const sec = frame / fps;
  const calDraw = interpolate(sec, [2.0, 6.0], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
  const expandT = interpolate(sec, [9.5, 16.0], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
  const sepIdeal = interpolate(expandT, [0, 1], [86, 178]);
  const p1 = interpolate(sec, [16.5, 28.0], [0.05, 0.92], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
  const holdPulse = 0.5 + 0.5 * Math.sin(sec * 5.0);

  const spec = {
    width: 1920,
    height: 1080,
    pitchDeg: 47,
    yawDeg: interpolate(sec, [0, durationInFrames / fps], [-5, 4]),
    mapScale: 1.12,
    ty: 18,
    originYRatio: 0.44,
  };
  const proj = createProjector3D(spec);

  // Perpendicular gap endpoints across TSN 25R and 25L right near runway center (~365 m)
  const gapNorth: readonly [number, number] = [106.6502, 10.81996];
  const gapSouth: readonly [number, number] = [106.6514, 10.81688];
  const [holdX, holdY] = lonLatToScreen(BOX_TSN_MACRO, TSN_RUNWAY_25L[0]);
  const [phX, phY] = proj(holdX, holdY, 0);

  return (
    <Tactical3DStage
      spec={spec}
      horizonAccent={PALETTE.coralAlert}
      compassBearingDeg={251}
      groundChildren={
        <>
          <RealSatelliteBasemap box={BOX_TSN_MACRO} dim={0.04} />
          <svg width={1920} height={1080} style={{ position: "absolute", inset: 0, pointerEvents: "none" }}>
            <path d={coordsToScreenPath(BOX_TSN_MACRO, TSN_RUNWAY_25R, false)} stroke={PALETTE.coralAlert} strokeOpacity={0.35} strokeWidth={13} strokeLinecap="round" />
            <path d={coordsToScreenPath(BOX_TSN_MACRO, TSN_RUNWAY_25R, false)} stroke={PALETTE.coralAlert} strokeWidth={5.5} strokeLinecap="round" />
            <path d={coordsToScreenPath(BOX_TSN_MACRO, TSN_RUNWAY_25L, false)} stroke={PALETTE.coralAlert} strokeOpacity={0.35} strokeWidth={13} strokeLinecap="round" />
            <path d={coordsToScreenPath(BOX_TSN_MACRO, TSN_RUNWAY_25L, false)} stroke={PALETTE.coralAlert} strokeWidth={5.5} strokeLinecap="round" />
          </svg>
        </>
      }
      overlayChildren={
        <>
          <svg width={1920} height={1080} style={{ position: "absolute", inset: 0, pointerEvents: "none" }}>
            <GeoCaliperRule
              from={gapNorth}
              to={gapSouth}
              box={BOX_TSN_MACRO}
              project={proj}
              label="TIM ĐƯỜNG BĂNG: 365 M"
              color={PALETTE.goldCaution}
              reveal={calDraw}
              labelOffset={[168, -42]}
            />
            <MovingAircraft box={BOX_TSN_MACRO} project={proj} coords={[...TSN_RUNWAY_25R].reverse()} progress={p1} kind="narrowbody" color={PALETTE.skyCyan} scale={1.25} />
            <circle cx={phX} cy={phY} r={18 + holdPulse * 8} fill="rgba(244, 63, 94, 0.24)" stroke={PALETTE.coralAlert} strokeWidth={2.5} />
            <MovingAircraft box={BOX_TSN_MACRO} project={proj} coords={TSN_RUNWAY_25L} progress={0.06} kind="narrowbody" color={PALETTE.coralAlert} scale={1.15} />
          </svg>

          <SceneHeaderPill badge="04 • QUY TẮC 365 MÉT (HERO)" title="Giải phẫu vì sao 2 đường băng Tân Sơn Nhất không thể bay độc lập" accent={PALETTE.coralAlert} />

          {/* Bottom-Left Compact 1:1 ICAO Separation Comparator (leaves top 55% real runways crystal clear) */}
          <div
            style={{
              position: "absolute",
              left: SAFE_X,
              bottom: 108,
              width: 1120,
              height: 298,
              borderRadius: 10,
              background: PALETTE.cardBg,
              border: `1px solid ${PALETTE.borderHairline}`,
              borderLeft: `4px solid ${PALETTE.coralAlert}`,
              boxShadow: DARK_SHADOW,
              padding: "18px 26px",
              boxSizing: "border-box",
              zIndex: 25,
            }}
          >
            <div style={{ fontFamily: FONTS.mono, fontSize: 13.5, fontWeight: 700, color: PALETTE.skyCyan, letterSpacing: "0.07em" }}>
              SO SÁNH CHUẨN AN TOÀN ICAO • KHOẢNG CÁCH TÂM HAI ĐƯỜNG BĂNG SONG SONG
            </div>
            <svg width={1068} height={224} style={{ marginTop: 8 }}>
              <text x={8} y={24} fill={PALETTE.coralAlert} fontFamily={FONTS.display} fontSize={20} fontWeight={700}>
                1. Tân Sơn Nhất (~365 m — Khai thác phụ thuộc)
              </text>
              <rect x={8} y={48} width={455} height={15} rx={3} fill={PALETTE.coralAlert} />
              <rect x={8} y={134} width={455} height={15} rx={3} fill={PALETTE.coralAlert} />
              <line x1={235} y1={63} x2={235} y2={134} stroke={PALETTE.goldCaution} strokeWidth={3} strokeDasharray="5 4" />
              <rect x={165} y={82} width={140} height={30} rx={7} fill={PALETTE.abyss} stroke={PALETTE.goldCaution} strokeWidth={1.8} />
              <text x={235} y={103} textAnchor="middle" fill={PALETTE.goldCaution} fontFamily={FONTS.mono} fontSize={17} fontWeight={700}>
                365 M
              </text>
              <text x={8} y={182} fill={PALETTE.mist} fontFamily={FONTS.display} fontSize={15.5}>
                Dính nhiễu động khí → Chiếc sau phải chờ slot.
              </text>

              <line x1={505} y1={10} x2={505} y2={210} stroke="rgba(148, 163, 184, 0.30)" strokeWidth={1.8} />

              <text x={540} y={24} fill={PALETTE.tealAirport} fontFamily={FONTS.display} fontSize={20} fontWeight={700}>
                2. Chuẩn độc lập ICAO (760 m – 1.035 m+)
              </text>
              <rect x={540} y={44} width={500} height={15} rx={3} fill={PALETTE.tealAirport} />
              <rect x={540} y={44 + sepIdeal * 0.72} width={500} height={15} rx={3} fill={PALETTE.tealAirport} />
              <line x1={790} y1={59} x2={790} y2={44 + sepIdeal * 0.72} stroke={PALETTE.skyCyan} strokeWidth={3} strokeDasharray="5 4" />
              <rect x={685} y={88} width={210} height={32} rx={7} fill={PALETTE.abyss} stroke={PALETTE.tealAirport} strokeWidth={2} />
              <text x={790} y={110} textAnchor="middle" fill={PALETTE.tealAirport} fontFamily={FONTS.mono} fontSize={17.5} fontWeight={700}>
                760 – 1.035 M+
              </text>
              <text x={540} y={214} fill={PALETTE.mist} fontFamily={FONTS.display} fontSize={16}>
                Cất & hạ cánh song song đồng thời không cần chờ nhiễu động.
              </text>
            </svg>
          </div>

          <VietnamMiniLocator targetLonLat={[106.65, 10.82]} label="TÂN SƠN NHẤT" accent={PALETTE.coralAlert} right={SAFE_X} bottom={108} />
        </>
      }
    />
  );
};
