import React from "react";
import { interpolate, spring, useCurrentFrame, useVideoConfig } from "remotion";
import {
  CAU_LONG_THANH_SPAN,
  CAU_NHON_TRACH_SPAN,
  DONG_NAI_RIVER,
  EXPR_BEN_LUC_LONG_THANH,
  EXPR_BIEN_HOA_VUNG_TAU,
  EXPR_HCM_LT_DAU_GIAY,
  LONG_THANH_PERIMETER_5000HA,
  LT_CENTER,
  LT_LOTUS_TERMINAL,
  LT_RUNWAY_1_NORTH,
  LT_RUNWAY_2_SOUTH,
  LT_RUNWAY_3_NORTH,
  LT_RUNWAY_4_SOUTH,
  RAIL_THU_THIEM_LONG_THANH,
  RING_ROAD_3_HCMC,
  THU_THIEM_STATION,
  TSN_SHIFTED_TO_LT_1TO1,
} from "../data/longThanhGeoData";
import { boxOfBounds, coordsToScreenPath } from "../mapMath";
import { DARK_SHADOW, EASE, FONTS, PALETTE, SAFE_X } from "../theme";
import { RealSatelliteBasemap, VietnamMiniLocator } from "../scenes/AviationBaseLayers";
import { MovingAircraft } from "../scenes/MovingAircraft";
import {
  Luminous3LayerRoute,
  OnMap3DGaugePillar,
  OnMapPressClippingCard,
} from "../scenes/OpenMotionPrimitives";
import {
  Bridge3DExtrusion,
  createProjector3D,
  HubMedallion,
  projectGeoPoint,
  Tactical3DStage,
} from "../scenes/Tactical3DKit";

const BOX_CORRIDOR = boxOfBounds({ west: 106.715, south: 10.695, east: 107.125, north: 10.862 }, 0.05);

/**
 * Scene D4 (38.65s - 57.40s | local 0.00s - 18.75s):
 * - Subtle Yaw Orbit + Spotlight Dimming (SKILL.md Muc 4.1) + 1:1 Footprint + Direct On-Map Time Pillars (Muc 4.2) + VnExpress Press Clipping #3 (Muc 4.3).
 * - Replaces breadcrumb dots, bouncy vehicles, and sketchy loops with crisp Bridge3DExtrusion, clean Luminous3LayerRoute, MovingAircraft, HubMedallion, and twin 3D travel-time comparison pillars.
 */
export const DemoScene4LuminousRail: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps, durationInFrames } = useVideoConfig();
  const sec = frame / fps;

  const spec = {
    width: 1920,
    height: 1080,
    pitchDeg: 52,
    yawDeg: interpolate(sec, [0, durationInFrames / fps], [-6, 4]),
    mapScale: 1.07,
    ty: 54,
    originYRatio: 0.58,
  };
  const proj = createProjector3D(spec);

  const spotDim = interpolate(sec, [12.80, 14.40], [0.05, 0.18], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  // Beat 1: 1:1 footprint drop + clean 3-layer luminous rail stroke (global ~41.50s)
  const ltGlow = interpolate(sec, [0.25, 1.45], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp", easing: EASE.outCubic });
  const tsnShadowPop = interpolate(sec, [0.85, 2.05], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp", easing: EASE.outExpo });
  const tsnNoteAlpha =
    tsnShadowPop *
    (1 - interpolate(sec, [12.20, 13.40], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" }));
  const railDraw = interpolate(sec, [2.10, 4.90], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp", easing: EASE.outCubic });

  // Clean-Slate Wipe: Press card drops @0.95s, retracts cleanly before Direct On-Map time comparison pillars grow
  const pressIn = interpolate(sec, [0.95, 1.75], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp", easing: EASE.outExpo });
  const pressOut = 1 - interpolate(sec, [12.70, 13.65], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
  const pressReveal = pressIn * pressOut;

  // Beat 2: Smooth express train glide (no breadcrumb ticks, no cartoon bounce)
  const trainLaunch = interpolate(sec, [5.15, 5.65], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
  const trainProg = interpolate(sec, [5.40, 14.45], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp", easing: EASE.outCubic });

  // Beat 3: Arrival HubMedallion lock + Direct On-Map Travel-Time Comparison Pillars (60-120 min Road vs 20-25 min Rail)
  const arrivePop = spring({
    frame: Math.max(0, frame - Math.round(14.55 * fps)),
    fps,
    config: { damping: 14, stiffness: 185 },
  });
  const timeChartReveal = interpolate(sec, [13.90, 15.60], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
    easing: EASE.outExpo,
  });

  const liveKm = (trainProg * 47.2).toFixed(1).replace(".", ",");
  const liveMin = Math.round(trainProg * 22);

  const [ttX, ttY] = projectGeoPoint(BOX_CORRIDOR, proj, THU_THIEM_STATION, 8);
  const [ltX, ltY] = projectGeoPoint(BOX_CORRIDOR, proj, LT_CENTER, 8);
  const [railMidX, railMidY] = projectGeoPoint(BOX_CORRIDOR, proj, [106.8287, 10.789], 8);
  const [tsn1to1X, tsn1to1Y] = projectGeoPoint(BOX_CORRIDOR, proj, [107.045, 10.779], 8);

  const highwayNode: readonly [number, number] = [106.885, 10.798];
  const railGatewayNode: readonly [number, number] = [107.010, 10.790];

  return (
    <Tactical3DStage
      spec={spec}
      horizonAccent={PALETTE.goldCaution}
      compassBearingDeg={104}
      groundChildren={
        <>
          <RealSatelliteBasemap box={BOX_CORRIDOR} dim={spotDim} />
          <svg width={1920} height={1080} style={{ position: "absolute", inset: 0, pointerEvents: "none" }}>
            <path d={coordsToScreenPath(BOX_CORRIDOR, DONG_NAI_RIVER, false)} fill="none" stroke="rgba(86, 149, 201, 0.45)" strokeWidth={8} strokeLinecap="round" strokeLinejoin="round" />

            <path d={coordsToScreenPath(BOX_CORRIDOR, EXPR_HCM_LT_DAU_GIAY, false)} fill="none" stroke={PALETTE.coralAlert} strokeOpacity={0.68} strokeWidth={4.5} strokeLinecap="round" />
            <path d={coordsToScreenPath(BOX_CORRIDOR, RING_ROAD_3_HCMC, false)} fill="none" stroke={PALETTE.skyCyan} strokeOpacity={0.55} strokeWidth={3.8} strokeLinecap="round" />
            <path d={coordsToScreenPath(BOX_CORRIDOR, EXPR_BEN_LUC_LONG_THANH, false)} fill="none" stroke={PALETTE.tealAirport} strokeOpacity={0.48} strokeWidth={3.6} strokeDasharray="9 5" strokeLinecap="round" />
            <path d={coordsToScreenPath(BOX_CORRIDOR, EXPR_BIEN_HOA_VUNG_TAU, false)} fill="none" stroke={PALETTE.tealAirport} strokeOpacity={0.48} strokeWidth={3.6} strokeDasharray="9 5" strokeLinecap="round" />

            {/* 5.000 ha Long Thanh 2-Layer Luminous Perimeter */}
            <path
              d={coordsToScreenPath(BOX_CORRIDOR, LONG_THANH_PERIMETER_5000HA, true)}
              fill="none"
              stroke={PALETTE.tealAirport}
              strokeOpacity={0.35 * ltGlow}
              strokeWidth={14}
              strokeLinejoin="round"
            />
            <path
              d={coordsToScreenPath(BOX_CORRIDOR, LONG_THANH_PERIMETER_5000HA, true)}
              fill="rgba(58, 169, 159, 0.16)"
              stroke={PALETTE.tealAirport}
              strokeOpacity={ltGlow}
              strokeWidth={4}
              strokeLinejoin="round"
            />

            {[LT_RUNWAY_1_NORTH, LT_RUNWAY_3_NORTH, LT_RUNWAY_2_SOUTH, LT_RUNWAY_4_SOUTH].map((rw, idx) => (
              <path
                key={`d4-rw-${idx}`}
                d={coordsToScreenPath(BOX_CORRIDOR, rw, false)}
                fill="none"
                stroke="#FFFCF0"
                strokeOpacity={0.74 * ltGlow}
                strokeWidth={2.6}
                strokeLinecap="round"
              />
            ))}
            <path
              d={coordsToScreenPath(BOX_CORRIDOR, LT_LOTUS_TERMINAL, true)}
              fill="rgba(229, 175, 40, 0.25)"
              stroke={PALETTE.goldCaution}
              strokeOpacity={ltGlow}
              strokeWidth={2.2}
              strokeLinejoin="round"
            />

            {/* 791 ha TSN 1:1 Footprint Overlay directly inside 5.000 ha Long Thanh */}
            {tsnShadowPop > 0.01 && (
              <path
                d={coordsToScreenPath(BOX_CORRIDOR, TSN_SHIFTED_TO_LT_1TO1, true)}
                fill="rgba(217, 78, 65, 0.34)"
                stroke={PALETTE.coralAlert}
                strokeOpacity={tsnShadowPop}
                strokeWidth={3.2}
                strokeDasharray="8 5"
                strokeLinejoin="round"
              />
            )}
          </svg>
        </>
      }
      overlayChildren={
        <>
          <Bridge3DExtrusion
            coords={CAU_LONG_THANH_SPAN}
            box={BOX_CORRIDOR}
            project={proj}
            deckZ={26}
            pierCount={12}
            reveal={ltGlow}
            deckColor="#FFFCF0"
            glowColor={PALETTE.coralAlert}
          />
          <Bridge3DExtrusion
            coords={CAU_NHON_TRACH_SPAN}
            box={BOX_CORRIDOR}
            project={proj}
            deckZ={26}
            pierCount={12}
            reveal={ltGlow}
            deckColor="#FFFCF0"
            glowColor={PALETTE.skyCyan}
          />

          <svg width={1920} height={1080} style={{ position: "absolute", inset: 0, pointerEvents: "none" }}>
            <Luminous3LayerRoute
              coords={RAIL_THU_THIEM_LONG_THANH}
              box={BOX_CORRIDOR}
              project={proj}
              gz={6}
              reveal={railDraw}
              showTicks={false}
              color={PALETTE.goldCaution}
              coreWidth={7.5}
            />

            {/* Origin Pin: Ga Thủ Thiêm */}
            <circle cx={ttX} cy={ttY} r={8} fill="#FFFCF0" stroke={PALETTE.skyCyan} strokeWidth={3} />
            <rect x={ttX - 88} y={ttY + 14} width={176} height={30} rx={7} fill="rgba(18, 17, 16, 0.92)" stroke={PALETTE.skyCyan} strokeWidth={1.6} />
            <text x={ttX} y={ttY + 34} textAnchor="middle" fill={PALETTE.ivory} fontFamily={FONTS.mono} fontSize={13} fontWeight={700}>
              GA THỦ THIÊM
            </text>

            {/* 1:1 791 ha TSN footprint callout above Long Thanh perimeter (clears cleanly at ~13.4s before time chart) */}
            {tsnNoteAlpha > 0.04 && (
              <g opacity={tsnNoteAlpha}>
                <line x1={tsn1to1X} y1={tsn1to1Y} x2={ltX} y2={ltY - 90} stroke={PALETTE.coralAlert} strokeWidth={2} strokeDasharray="4 3" />
                <rect
                  x={ltX - 208}
                  y={ltY - 128}
                  width={416}
                  height={40}
                  rx={8}
                  fill="rgba(18, 17, 16, 0.92)"
                  stroke={PALETTE.tealAirport}
                  strokeWidth={1.6}
                />
                <text x={ltX} y={ltY - 103} textAnchor="middle" fill={PALETTE.tealAirport} fontFamily={FONTS.mono} fontSize={14} fontWeight={700}>
                  5.000 HA LONG THÀNH • ÔM TRỌN 6,3× TSN (791 HA)
                </text>
              </g>
            )}

            {/* Smooth Express Train on Dedicated Rail */}
            {trainLaunch > 0.02 && (
              <g opacity={trainLaunch}>
                <MovingAircraft
                  box={BOX_CORRIDOR}
                  project={proj}
                  coords={RAIL_THU_THIEM_LONG_THANH}
                  progress={trainProg}
                  altitudeZ={10}
                  kind="rail"
                  color={PALETTE.goldCaution}
                  scale={1.35}
                />
              </g>
            )}

            {/* Direct On-Map Travel-Time Comparison Pillars (Road Jam vs Dedicated Rail) */}
            {timeChartReveal > 0.02 && (
              <>
                <OnMap3DGaugePillar
                  box={BOX_CORRIDOR}
                  project={proj}
                  lonLat={highwayNode}
                  heightZ={148}
                  reveal={timeChartReveal}
                  color={PALETTE.coralAlert}
                  tagTop="CAO TỐC GIỜ CAO ĐIỂM"
                  valueText="60 – 120 PHÚT"
                  subText="Dễ ùn ứ cầu Long Thành & nút giao"
                  labelOffset={[-322, -28]}
                />
                <OnMap3DGaugePillar
                  box={BOX_CORRIDOR}
                  project={proj}
                  lonLat={railGatewayNode}
                  heightZ={62}
                  reveal={timeChartReveal}
                  color={PALETTE.tealAirport}
                  tagTop="ĐƯỜNG SẮT 120 KM/H"
                  valueText="20 – 25 PHÚT"
                  subText="Chuyên biệt • Thẳng tới sảnh bay"
                  labelOffset={[-322, -118]}
                />
              </>
            )}

            {/* Destination Lock HubMedallion + Arrival Pill */}
            {arrivePop > 0.04 && (
              <g opacity={arrivePop}>
                <g transform={`translate(${ltX.toFixed(1)}, ${ltY.toFixed(1)}) scale(${(0.76 + 0.24 * arrivePop).toFixed(3)})`}>
                  <HubMedallion cx={0} cy={0} glyph="✓" color={PALETTE.tealAirport} radius={20} />
                </g>
                <g transform={`translate(${ltX.toFixed(1)}, ${(ltY + 62).toFixed(1)}) scale(${(0.76 + 0.24 * arrivePop).toFixed(3)})`}>
                  <rect x={-168} y={-24} width={336} height={48} rx={9} fill={PALETTE.tealAirport} stroke="#100F0F" strokeWidth={2.5} />
                  <text x={0} y={6} textAnchor="middle" fill="#100F0F" fontFamily={FONTS.mono} fontSize={17} fontWeight={700}>
                    ✓ TỚI SẢNH BAY: 20–25 PHÚT
                  </text>
                </g>
              </g>
            )}
          </svg>

          <OnMapPressClippingCard
            src="press/clip_rail_vnexpress.png"
            left={SAFE_X}
            top={86}
            width={446}
            rotationDeg={-1.1}
            anchorPoint={[railMidX, railMidY]}
            sourceBadge="VNEXPRESS • 03/03/2026"
            accent={PALETTE.goldCaution}
            reveal={pressReveal}
            highlightRect={{ leftPct: 2, topPct: 9.6, widthPct: 91, heightPct: 6.8 }}
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
              color: PALETTE.goldCaution,
              textShadow: "0 2px 10px rgba(0, 0, 0, 0.88)",
              zIndex: 25,
            }}
          >
            04 • ĐƯỜNG SẮT CHUYÊN BIỆT THỦ THIÊM – LONG THÀNH (~47 KM • 120 KM/H)
          </div>

          <div
            style={{
              position: "absolute",
              right: SAFE_X,
              top: 56,
              padding: "12px 20px",
              borderRadius: 10,
              background: "rgba(20, 19, 18, 0.90)",
              border: `1px solid ${PALETTE.borderHairline}`,
              borderTop: `3px solid ${PALETTE.goldCaution}`,
              boxShadow: DARK_SHADOW,
              display: "flex",
              alignItems: "center",
              gap: 24,
              zIndex: 28,
            }}
          >
            <div>
              <div style={{ fontFamily: FONTS.mono, fontSize: 11, fontWeight: 700, color: PALETTE.mist }}>QUÃNG ĐƯỜNG</div>
              <div style={{ fontFamily: FONTS.mono, fontSize: 24, fontWeight: 700, color: PALETTE.goldCaution, fontVariantNumeric: "tabular-nums" }}>
                {liveKm} km
              </div>
            </div>
            <div style={{ width: 1, height: 34, background: PALETTE.borderHairline }} />
            <div>
              <div style={{ fontFamily: FONTS.mono, fontSize: 11, fontWeight: 700, color: PALETTE.mist }}>TỐC ĐỘ</div>
              <div style={{ fontFamily: FONTS.mono, fontSize: 24, fontWeight: 700, color: PALETTE.ivory }}>
                120 km/h
              </div>
            </div>
            <div style={{ width: 1, height: 34, background: PALETTE.borderHairline }} />
            <div>
              <div style={{ fontFamily: FONTS.mono, fontSize: 11, fontWeight: 700, color: PALETTE.mist }}>THỜI GIAN</div>
              <div style={{ fontFamily: FONTS.mono, fontSize: 24, fontWeight: 700, color: PALETTE.tealAirport, fontVariantNumeric: "tabular-nums" }}>
                {arrivePop > 0.3 ? "~20–25 phút" : `${String(liveMin).padStart(2, "0")} phút`}
              </div>
            </div>
          </div>

          <VietnamMiniLocator targetLonLat={LT_CENTER} label="LONG THÀNH 40 KM" accent={PALETTE.tealAirport} right={SAFE_X} bottom={110} />
        </>
      }
    />
  );
};
