import React from "react";
import { interpolate, spring, useCurrentFrame, useVideoConfig } from "remotion";
import {
  BIEN_HOA_AIRBASE_POLY,
  BIEN_HOA_CENTER,
  BIEN_HOA_RUNWAY,
  CAN_GIO_BIOSPHERE_POLY,
  HCM_CENTER,
  LONG_THANH_PERIMETER_5000HA,
  LT_CENTER,
  LT_LOTUS_TERMINAL,
  LT_RUNWAY_1_NORTH,
  LT_RUNWAY_2_SOUTH,
  LT_RUNWAY_3_NORTH,
  LT_RUNWAY_4_SOUTH,
  NE_URBAN_WALL_POLY,
  SOUTH_MUD_ZONE_POLY,
  TSN_CENTER,
  TSN_PERIMETER_791HA,
} from "../data/longThanhGeoData";
import { boxOfBounds, coordsToScreenPath, interpolateCameraBox } from "../mapMath";
import { EASE, FONTS, PALETTE, SAFE_X } from "../theme";
import { RealSatelliteBasemap, VietnamMiniLocator } from "../scenes/AviationBaseLayers";
import { OnMapPressClippingCard } from "../scenes/OpenMotionPrimitives";
import {
  createProjector3D,
  GeoCaliperRule,
  HubMedallion,
  projectGeoPoint,
  RadarRangeFan,
  Tactical3DStage,
} from "../scenes/Tactical3DKit";

const BOX_SCAN_WEST = boxOfBounds({ west: 106.50, south: 10.43, east: 107.06, north: 11.01 }, 0.05);
const BOX_LOCK_EAST = boxOfBounds({ west: 106.64, south: 10.52, east: 107.16, north: 10.98 }, 0.05);

/**
 * Scene D3 (23.45s - 38.65s | local 0.00s - 15.20s):
 * - Corridor Pan + RadarRangeFan + Spotlight Dimming (SKILL.md Muc 4.1) + Clean Zone Fill & HubMedallions (Muc 4.6) + VnExpress Press Clipping #2 (Muc 4.3).
 * - Rejects South Mud, Inner TSN & NE Bien Hoa cleanly without diagonal hatch patterns, sketchy X doodles, or red squiggles.
 */
export const DemoScene3DecisionBlueprint: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const sec = frame / fps;

  const panT = interpolate(sec, [5.85, 8.85], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
    easing: EASE.inOutQuint,
  });

  const spotDim = interpolate(panT, [0, 1], [0.07, 0.16]);

  const activeBox = interpolateCameraBox(BOX_SCAN_WEST, BOX_LOCK_EAST, panT);
  const spec = {
    width: 1920,
    height: 1080,
    pitchDeg: interpolate(panT, [0, 1], [50, 53]),
    yawDeg: interpolate(panT, [0, 1], [-2, 3]),
    mapScale: interpolate(panT, [0, 1], [1.04, 1.07]),
    ty: 54,
    originYRatio: 0.56,
  };
  const proj = createProjector3D(spec);

  const b1Zone = interpolate(sec, [0.35, 1.35], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp", easing: EASE.outCubic });
  const b1Cross = interpolate(sec, [2.75, 3.55], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp", easing: EASE.outCubic });
  const b2Cross = interpolate(sec, [4.45, 5.15], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp", easing: EASE.outCubic });
  const b3Cross = interpolate(sec, [5.35, 5.95], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp", easing: EASE.outCubic });

  const rejLabelFade = 1 - interpolate(panT, [0.15, 0.65], [0, 0.74], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });

  const radarDraw = interpolate(sec, [5.95, 7.35], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp", easing: EASE.outExpo });
  const radarSweep = interpolate(sec, [5.95, 8.20], [-28, 12], { extrapolateLeft: "clamp", extrapolateRight: "clamp", easing: EASE.outCubic });
  const ltZoneGlow = interpolate(sec, [6.40, 7.65], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp", easing: EASE.outCubic });
  const ltCheck = spring({
    frame: Math.max(0, frame - Math.round(7.05 * fps)),
    fps,
    config: { damping: 14, stiffness: 185 },
  });
  const pressReveal = interpolate(sec, [7.75, 8.70], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp", easing: EASE.outExpo });

  const lock1 = spring({ frame: Math.max(0, frame - Math.round(8.75 * fps)), fps, config: { damping: 16, stiffness: 180 } });
  const lock2 = spring({ frame: Math.max(0, frame - Math.round(10.35 * fps)), fps, config: { damping: 16, stiffness: 180 } });
  const lock3 = spring({ frame: Math.max(0, frame - Math.round(11.95 * fps)), fps, config: { damping: 16, stiffness: 180 } });

  const southTarget: readonly [number, number] = [106.71, 10.58];
  const [sx1, sy1] = projectGeoPoint(activeBox, proj, southTarget, 8);
  const [sx2, sy2] = projectGeoPoint(activeBox, proj, TSN_CENTER, 8);
  const [sx3, sy3] = projectGeoPoint(activeBox, proj, BIEN_HOA_CENTER, 8);
  const [hcmX, hcmY] = projectGeoPoint(activeBox, proj, HCM_CENTER, 8);
  const [ltX, ltY] = projectGeoPoint(activeBox, proj, LT_CENTER, 10);

  const [lkPt1X, lkPt1Y] = projectGeoPoint(activeBox, proj, [107.048, 10.798], 4);
  const [lkPt2X, lkPt2Y] = projectGeoPoint(activeBox, proj, [107.086, 10.778], 4);
  const [lkPt3X, lkPt3Y] = projectGeoPoint(activeBox, proj, [107.055, 10.752], 4);

  return (
    <Tactical3DStage
      spec={spec}
      horizonAccent={radarDraw > 0.35 ? PALETTE.tealAirport : PALETTE.coralAlert}
      compassBearingDeg={92}
      groundChildren={
        <>
          <RealSatelliteBasemap box={activeBox} dim={spotDim} />
          <svg width={1920} height={1080} style={{ position: "absolute", inset: 0, pointerEvents: "none" }}>
            {/* Branch 1: South Soft Mud + Can Gio Biosphere clean translucent fill + 2-layer luminous rim */}
            <path
              d={coordsToScreenPath(activeBox, SOUTH_MUD_ZONE_POLY, true)}
              fill="rgba(217, 78, 65, 0.22)"
              fillOpacity={b1Zone}
              stroke={PALETTE.coralAlert}
              strokeOpacity={0.28 * b1Zone}
              strokeWidth={12}
              strokeLinejoin="round"
            />
            <path
              d={coordsToScreenPath(activeBox, SOUTH_MUD_ZONE_POLY, true)}
              fill="none"
              stroke={PALETTE.coralAlert}
              strokeOpacity={b1Zone * 0.92}
              strokeWidth={3.2}
              strokeLinejoin="round"
            />
            <path
              d={coordsToScreenPath(activeBox, CAN_GIO_BIOSPHERE_POLY, true)}
              fill="rgba(58, 169, 159, 0.16)"
              fillOpacity={b1Zone}
              stroke={PALETTE.coralAlert}
              strokeOpacity={b1Zone * 0.85}
              strokeWidth={2.8}
              strokeDasharray="10 6"
              strokeLinejoin="round"
            />

            {/* Branch 2: Inner-city TSN Cage */}
            {b2Cross > 0.02 && (
              <>
                <path
                  d={coordsToScreenPath(activeBox, TSN_PERIMETER_791HA, true)}
                  fill="rgba(217, 78, 65, 0.24)"
                  fillOpacity={b2Cross}
                  stroke={PALETTE.coralAlert}
                  strokeOpacity={0.30 * b2Cross}
                  strokeWidth={11}
                  strokeLinejoin="round"
                />
                <path
                  d={coordsToScreenPath(activeBox, TSN_PERIMETER_791HA, true)}
                  fill="none"
                  stroke={PALETTE.coralAlert}
                  strokeOpacity={b2Cross}
                  strokeWidth={3.4}
                  strokeLinejoin="round"
                />
              </>
            )}

            {/* Branch 3: Northeast Bien Hoa Military Airbase Conflict */}
            {b3Cross > 0.02 && (
              <>
                <path
                  d={coordsToScreenPath(activeBox, NE_URBAN_WALL_POLY, true)}
                  fill="rgba(217, 78, 65, 0.14)"
                  fillOpacity={b3Cross}
                  stroke={PALETTE.coralAlert}
                  strokeOpacity={0.72 * b3Cross}
                  strokeWidth={2.5}
                  strokeDasharray="8 5"
                />
                <path
                  d={coordsToScreenPath(activeBox, BIEN_HOA_AIRBASE_POLY, true)}
                  fill="rgba(217, 78, 65, 0.28)"
                  fillOpacity={b3Cross}
                  stroke={PALETTE.coralAlert}
                  strokeOpacity={b3Cross}
                  strokeWidth={3}
                />
                <path
                  d={coordsToScreenPath(activeBox, BIEN_HOA_RUNWAY, false)}
                  fill="none"
                  stroke={PALETTE.coralAlert}
                  strokeOpacity={b3Cross}
                  strokeWidth={5}
                  strokeLinecap="round"
                />
              </>
            )}

            {/* Branch 4: Long Thành 5.000 ha Binh Son Red Basalt Plateau + 4 Independent Runways */}
            {ltZoneGlow > 0.01 && (
              <>
                <path
                  d={coordsToScreenPath(activeBox, LONG_THANH_PERIMETER_5000HA, true)}
                  fill="none"
                  stroke={PALETTE.tealAirport}
                  strokeOpacity={0.42 * ltZoneGlow}
                  strokeWidth={16}
                  strokeLinejoin="round"
                />
                <path
                  d={coordsToScreenPath(activeBox, LONG_THANH_PERIMETER_5000HA, true)}
                  fill="rgba(58, 169, 159, 0.22)"
                  fillOpacity={ltZoneGlow}
                  stroke={PALETTE.tealAirport}
                  strokeOpacity={ltZoneGlow}
                  strokeWidth={4.2}
                  strokeLinejoin="round"
                />
                {[LT_RUNWAY_1_NORTH, LT_RUNWAY_3_NORTH, LT_RUNWAY_2_SOUTH, LT_RUNWAY_4_SOUTH].map((rw, idx) => (
                  <path
                    key={`d3-rw-${idx}`}
                    d={coordsToScreenPath(activeBox, rw, false)}
                    fill="none"
                    stroke="#FFFCF0"
                    strokeOpacity={0.85 * ltZoneGlow}
                    strokeWidth={3}
                    strokeLinecap="round"
                  />
                ))}
                <path
                  d={coordsToScreenPath(activeBox, LT_LOTUS_TERMINAL, true)}
                  fill="rgba(229, 175, 40, 0.34)"
                  stroke={PALETTE.goldCaution}
                  strokeOpacity={ltZoneGlow}
                  strokeWidth={2.4}
                />
              </>
            )}
          </svg>
        </>
      }
      overlayChildren={
        <>
          <svg width={1920} height={1080} style={{ position: "absolute", inset: 0, pointerEvents: "none" }}>
            {b1Cross > 0.02 && (
              <g opacity={rejLabelFade * b1Cross}>
                <HubMedallion cx={sx1} cy={sy1} glyph="✕" color={PALETTE.coralAlert} radius={22} />
                <g opacity={interpolate(b1Cross, [0.2, 0.7], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" })}>
                  <rect x={sx1 - 196} y={sy1 + 36} width={392} height={40} rx={7} fill="rgba(16, 15, 15, 0.92)" stroke={PALETTE.coralAlert} strokeWidth={1.6} />
                  <text x={sx1} y={sy1 + 61} textAnchor="middle" fill="#FFFCF0" fontFamily={FONTS.mono} fontSize={14.5} fontWeight={700}>
                    HƯỚNG NAM • BÙN YẾU 15–30M &amp; CẦN GIỜ
                  </text>
                </g>
              </g>
            )}

            {b2Cross > 0.02 && (
              <g opacity={rejLabelFade * b2Cross}>
                <HubMedallion cx={sx2} cy={sy2} glyph="✕" color={PALETTE.coralAlert} radius={19} />
                <g opacity={interpolate(b2Cross, [0.15, 0.65], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" })}>
                  <rect x={sx2 - 335} y={sy2 - 64} width={320} height={38} rx={7} fill="rgba(16, 15, 15, 0.92)" stroke={PALETTE.coralAlert} strokeWidth={1.6} />
                  <text x={sx2 - 175} y={sy2 - 40} textAnchor="middle" fill="#FFFCF0" fontFamily={FONTS.mono} fontSize={14} fontWeight={700}>
                    NỘI ĐÔ TSN • KÍN ĐẶC NHÀ PHỐ
                  </text>
                </g>
              </g>
            )}

            {b3Cross > 0.02 && (
              <g opacity={rejLabelFade * b3Cross}>
                <HubMedallion cx={sx3} cy={sy3} glyph="✕" color={PALETTE.coralAlert} radius={19} />
                <g opacity={interpolate(b3Cross, [0.15, 0.65], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" })}>
                  <rect x={sx3 - 150} y={sy3 - 76} width={334} height={38} rx={7} fill="rgba(16, 15, 15, 0.92)" stroke={PALETTE.coralAlert} strokeWidth={1.6} />
                  <text x={sx3 + 17} y={sy3 - 52} textAnchor="middle" fill="#FFFCF0" fontFamily={FONTS.mono} fontSize={14} fontWeight={700}>
                    ĐÔNG BẮC • KẸT KHÔNG LƯU BIÊN HÒA
                  </text>
                </g>
              </g>
            )}

            {/* Branch 4: Radar Range Fan + 40 km Geodesic Caliper Lock */}
            {radarDraw > 0.02 && (
              <>
                <g opacity={radarDraw * 0.78}>
                  <RadarRangeFan
                    cx={hcmX}
                    cy={hcmY}
                    radii={[140, 260, 390]}
                    sweepDeg={radarSweep}
                    color={PALETTE.tealAirport}
                    coneDeg={42}
                  />
                </g>
                <circle cx={hcmX} cy={hcmY} r={8} fill="#FFFCF0" stroke={PALETTE.tealAirport} strokeWidth={3} />
                <text
                  x={hcmX}
                  y={hcmY + 26}
                  textAnchor="middle"
                  opacity={Math.max(0, 1 - pressReveal)}
                  fill="#FFFCF0"
                  stroke="#100F0F"
                  strokeWidth={5}
                  paintOrder="stroke"
                  fontFamily={FONTS.mono}
                  fontSize={13.5}
                  fontWeight={700}
                >
                  TRUNG TÂM TP.HCM
                </text>
                <GeoCaliperRule
                  from={HCM_CENTER}
                  to={LT_CENTER}
                  box={activeBox}
                  project={proj}
                  label="TIA RADAR: ~40 KM ĐÔNG"
                  color={PALETTE.tealAirport}
                  reveal={radarDraw}
                  labelOffset={[0, -34]}
                />
              </>
            )}

            {/* Emerald HubMedallion Checkmark Locking Long Thành 5.000 ha */}
            {ltCheck > 0.04 && (
              <g opacity={ltCheck} transform={`translate(${ltX.toFixed(1)}, ${ltY.toFixed(1)}) scale(${(0.75 + 0.25 * ltCheck).toFixed(3)})`}>
                <HubMedallion cx={0} cy={0} glyph="✓" color={PALETTE.tealAirport} radius={22} />
              </g>
            )}

            {/* 3 Sequential Lock Badges Anchored Directly Around Long Thành 5.000 ha */}
            {lock1 > 0.04 && (
              <g opacity={lock1}>
                <line x1={lkPt1X} y1={lkPt1Y} x2={lkPt1X} y2={lkPt1Y - 122} stroke={PALETTE.tealAirport} strokeWidth={2.2} strokeDasharray="4 3" />
                <circle cx={lkPt1X} cy={lkPt1Y} r={4.5} fill="#FFFCF0" stroke={PALETTE.tealAirport} strokeWidth={2} />
                <g transform={`translate(${(lkPt1X - 180).toFixed(1)}, ${(lkPt1Y - 178).toFixed(1)}) scale(${(0.86 + 0.14 * lock1).toFixed(3)})`}>
                  <rect x={0} y={0} width={360} height={54} rx={8} fill="rgba(16, 15, 15, 0.93)" stroke={PALETTE.tealAirport} strokeWidth={1.8} />
                  <text x={16} y={22} fill={PALETTE.tealAirport} fontFamily={FONTS.mono} fontSize={12} fontWeight={700}>
                    ✓ Ổ KHÓA 1 • ĐỊA CHẤT CỨNG
                  </text>
                  <text x={16} y={42} fill="#FFFCF0" fontFamily={FONTS.display} fontSize={16} fontWeight={700}>
                    Đất đỏ bazan Bình Sơn (+45–65 m)
                  </text>
                </g>
              </g>
            )}

            {lock2 > 0.04 && (
              <g opacity={lock2}>
                <line x1={lkPt2X} y1={lkPt2Y} x2={lkPt2X + 90} y2={lkPt2Y - 16} stroke={PALETTE.tealAirport} strokeWidth={2.2} strokeDasharray="4 3" />
                <circle cx={lkPt2X} cy={lkPt2Y} r={4.5} fill="#FFFCF0" stroke={PALETTE.tealAirport} strokeWidth={2} />
                <g transform={`translate(${(lkPt2X + 90).toFixed(1)}, ${(lkPt2Y - 44).toFixed(1)}) scale(${(0.86 + 0.14 * lock2).toFixed(3)})`}>
                  <rect x={0} y={0} width={348} height={54} rx={8} fill="rgba(16, 15, 15, 0.93)" stroke={PALETTE.tealAirport} strokeWidth={1.8} />
                  <text x={16} y={22} fill={PALETTE.tealAirport} fontFamily={FONTS.mono} fontSize={12} fontWeight={700}>
                    ✓ Ổ KHÓA 2 • QUỸ ĐẤT LIỀN KHỐI
                  </text>
                  <text x={16} y={42} fill="#FFFCF0" fontFamily={FONTS.display} fontSize={16} fontWeight={700}>
                    5.000 ha cao su thu hồi một lần
                  </text>
                </g>
              </g>
            )}

            {lock3 > 0.04 && (
              <g opacity={lock3}>
                <line x1={lkPt3X} y1={lkPt3Y} x2={lkPt3X - 40} y2={lkPt3Y + 124} stroke={PALETTE.goldCaution} strokeWidth={2.2} strokeDasharray="4 3" />
                <circle cx={lkPt3X} cy={lkPt3Y} r={4.5} fill="#FFFCF0" stroke={PALETTE.goldCaution} strokeWidth={2} />
                <g transform={`translate(${(lkPt3X - 210).toFixed(1)}, ${(lkPt3Y + 124).toFixed(1)}) scale(${(0.86 + 0.14 * lock3).toFixed(3)})`}>
                  <rect x={0} y={0} width={356} height={54} rx={8} fill="rgba(16, 15, 15, 0.93)" stroke={PALETTE.goldCaution} strokeWidth={1.8} />
                  <text x={16} y={22} fill={PALETTE.goldCaution} fontFamily={FONTS.mono} fontSize={12} fontWeight={700}>
                    ✓ Ổ KHÓA 3 • BẦU TRỜI 4F ĐỘC LẬP
                  </text>
                  <text x={16} y={42} fill="#FFFCF0" fontFamily={FONTS.display} fontSize={16} fontWeight={700}>
                    4 đường băng 4.000×60 m • 100 tr khách
                  </text>
                </g>
              </g>
            )}
          </svg>

          <OnMapPressClippingCard
            src="press/clip_lt_vnexpress.png"
            left={SAFE_X}
            top={432}
            width={452}
            rotationDeg={-1.3}
            anchorPoint={[ltX, ltY]}
            sourceBadge="VNEXPRESS • 30/10/2026"
            accent={PALETTE.tealAirport}
            reveal={pressReveal}
            highlightRect={{ leftPct: 2, topPct: 9.8, widthPct: 86, heightPct: 6.8 }}
          />

          <div
            style={{
              position: "absolute",
              left: SAFE_X,
              top: 52,
              fontFamily: FONTS.mono,
              fontSize: 15,
              fontWeight: 700,
              letterSpacing: "0.10em",
              color: radarDraw > 0.35 ? PALETTE.tealAirport : PALETTE.coralAlert,
              textShadow: "0 2px 10px rgba(0, 0, 0, 0.90)",
              zIndex: 25,
            }}
          >
            03 •{" "}
            {radarDraw > 0.35
              ? "TIA RADAR 40 KM KHÓA CAO NGUYÊN BAZAN BÌNH SƠN (LONG THÀNH)"
              : "QUÉT ĐỊA CHẤT & KHÔNG LƯU: KHÓA ĐỎ 3 HƯỚNG QUANH TP.HCM"}
          </div>

          <VietnamMiniLocator targetLonLat={LT_CENTER} label="BÌNH SƠN • 40 KM ĐÔNG" accent={PALETTE.tealAirport} right={SAFE_X} bottom={110} />
        </>
      }
    />
  );
};
