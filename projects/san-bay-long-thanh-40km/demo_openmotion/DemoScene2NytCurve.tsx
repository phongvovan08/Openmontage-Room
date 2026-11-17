import React from "react";
import { interpolate, useCurrentFrame, useVideoConfig } from "remotion";
import {
  TSN_PERIMETER_791HA,
  TSN_RUNWAY_25L,
  TSN_RUNWAY_25R,
  TSN_TERMINAL_T1_T2,
  TSN_TERMINAL_T3,
} from "../data/longThanhGeoData";
import { boxOfBounds, coordsToScreenPath } from "../mapMath";
import { EASE, FONTS, PALETTE, SAFE_X } from "../theme";
import { RealSatelliteBasemap, VietnamMiniLocator } from "../scenes/AviationBaseLayers";
import { MovingAircraft } from "../scenes/MovingAircraft";
import { OnMap3DGaugePillar, OnMapPressClippingCard } from "../scenes/OpenMotionPrimitives";
import { createProjector3D, projectGeoPoint, Tactical3DStage } from "../scenes/Tactical3DKit";

const BOX_TSN_ANATOMY = boxOfBounds({ west: 106.630, south: 10.804, east: 106.680, north: 10.832 }, 0.05);

/**
 * Scene D2 (11.45s - 23.45s | local 0.00s - 12.00s):
 * - Direct On-Map Charting (SKILL.md Muc 4.2) + Spotlight Dimming + Subtle Yaw Orbit (Muc 4.1) + VnExpress Press Clipping #1 (Muc 4.3).
 * - Replaces flat off-map paper charts & hatched patterns with crisp zone_fill + 2-layer luminous rims + extruded 3D Gauge Pillars on z14 terrain.
 */
export const DemoScene2NytCurve: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps, durationInFrames } = useVideoConfig();
  const sec = frame / fps;

  const spec = {
    width: 1920,
    height: 1080,
    pitchDeg: 53,
    yawDeg: interpolate(sec, [0, durationInFrames / fps], [4, -4]),
    mapScale: 1.09,
    ty: 52,
    originYRatio: 0.56,
  };
  const proj = createProjector3D(spec);

  const spotDim = interpolate(sec, [0, 1.20, 4.60, 5.80], [0.06, 0.16, 0.16, 0.22], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  // Beat 1 (0.25..4.60s local): Ground terminal zone_fill + 3D T3 pillar (28 -> 50M) + Newspaper clipping #1
  const groundZone = interpolate(sec, [0.25, 1.45], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp", easing: EASE.outCubic });
  const t3Pillar = interpolate(sec, [0.55, 3.30], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp", easing: EASE.outExpo });
  const t3Num = (28.0 + t3Pillar * 22.0).toFixed(1).replace(".", ",");
  const pressReveal = interpolate(sec, [1.05, 2.05], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp", easing: EASE.outExpo });

  // Beat 2 (4.65..9.50s local): Runway sky ceiling glow + Pillar #2 jammed at ~38-40M
  const airLock = interpolate(sec, [4.65, 5.85], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp", easing: EASE.outCubic });
  const skyPillar = interpolate(sec, [4.85, 6.75], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp", easing: EASE.outExpo });

  const t3Center: readonly [number, number] = [106.6508, 10.8116];
  const rwyGapCenter: readonly [number, number] = [106.6542, 10.8195];
  const [t3X, t3Y] = projectGeoPoint(BOX_TSN_ANATOMY, proj, t3Center, 12);

  return (
    <Tactical3DStage
      spec={spec}
      horizonAccent={airLock > 0.35 ? PALETTE.coralAlert : PALETTE.tealAirport}
      compassBearingDeg={251}
      groundChildren={
        <>
          <RealSatelliteBasemap box={BOX_TSN_ANATOMY} dim={spotDim} />
          <svg width={1920} height={1080} style={{ position: "absolute", inset: 0, pointerEvents: "none" }}>
            {/* Subtle 791 ha outer boundary */}
            <path
              d={coordsToScreenPath(BOX_TSN_ANATOMY, TSN_PERIMETER_791HA, true)}
              fill="none"
              stroke={PALETTE.ivory}
              strokeOpacity={0.28}
              strokeWidth={2.5}
              strokeDasharray="8 6"
            />

            {/* Terminal T3 & T1/T2 Clean Translucent Zone Fill + 2-Layer Luminous Rim (No hatch clutter) */}
            <path
              d={coordsToScreenPath(BOX_TSN_ANATOMY, TSN_TERMINAL_T3, true)}
              fill="rgba(58, 169, 159, 0.24)"
              fillOpacity={groundZone}
              stroke={PALETTE.tealAirport}
              strokeOpacity={0.32 * groundZone}
              strokeWidth={12}
              strokeLinejoin="round"
            />
            <path
              d={coordsToScreenPath(BOX_TSN_ANATOMY, TSN_TERMINAL_T3, true)}
              fill="none"
              stroke={PALETTE.tealAirport}
              strokeOpacity={groundZone}
              strokeWidth={3.6}
              strokeLinejoin="round"
            />
            <path
              d={coordsToScreenPath(BOX_TSN_ANATOMY, TSN_TERMINAL_T1_T2, true)}
              fill="rgba(58, 169, 159, 0.18)"
              fillOpacity={groundZone * 0.85}
              stroke={PALETTE.tealAirport}
              strokeOpacity={groundZone * 0.78}
              strokeWidth={2.6}
              strokeLinejoin="round"
            />

            {/* Dual-Runway Vermilion Sky Ceiling Corridors */}
            {airLock > 0.01 && (
              <>
                <path
                  d={coordsToScreenPath(BOX_TSN_ANATOMY, TSN_RUNWAY_25R, false)}
                  fill="none"
                  stroke={PALETTE.coralAlert}
                  strokeOpacity={0.44 * airLock}
                  strokeWidth={22}
                  strokeLinecap="round"
                />
                <path
                  d={coordsToScreenPath(BOX_TSN_ANATOMY, TSN_RUNWAY_25R, false)}
                  fill="none"
                  stroke={PALETTE.coralAlert}
                  strokeOpacity={airLock}
                  strokeWidth={5}
                  strokeLinecap="round"
                />
                <path
                  d={coordsToScreenPath(BOX_TSN_ANATOMY, TSN_RUNWAY_25L, false)}
                  fill="none"
                  stroke={PALETTE.coralAlert}
                  strokeOpacity={0.44 * airLock}
                  strokeWidth={22}
                  strokeLinecap="round"
                />
                <path
                  d={coordsToScreenPath(BOX_TSN_ANATOMY, TSN_RUNWAY_25L, false)}
                  fill="none"
                  stroke={PALETTE.coralAlert}
                  strokeOpacity={airLock}
                  strokeWidth={5}
                  strokeLinecap="round"
                />
              </>
            )}
          </svg>
        </>
      }
      overlayChildren={
        <>
          <svg width={1920} height={1080} style={{ position: "absolute", inset: 0, pointerEvents: "none" }}>
            {airLock > 0.08 && (
              <g opacity={airLock}>
                <MovingAircraft
                  box={BOX_TSN_ANATOMY}
                  project={proj}
                  coords={[...TSN_RUNWAY_25L].reverse()}
                  progress={0.07}
                  altitudeZ={6}
                  kind="widebody"
                  color={PALETTE.coralAlert}
                  scale={1.20}
                />
                <MovingAircraft
                  box={BOX_TSN_ANATOMY}
                  project={proj}
                  coords={[...TSN_RUNWAY_25L].reverse()}
                  progress={0.18}
                  altitudeZ={6}
                  kind="narrowbody"
                  color={PALETTE.goldCaution}
                  scale={1.14}
                />
              </g>
            )}

            {/* Extruded 3D Gauge Pillar #1: Ground Capacity (28 -> 50M pax/yr) straight from T3 */}
            <OnMap3DGaugePillar
              box={BOX_TSN_ANATOMY}
              project={proj}
              lonLat={t3Center}
              heightZ={154}
              reveal={t3Pillar}
              color={PALETTE.tealAirport}
              tagTop="MẶT ĐẤT • NHÀ GA T1 + T2 + T3"
              valueText={`${t3Num} TRIỆU KHÁCH/NĂM`}
              subText="Nhà ga T3 chỉ giải tỏa ùn ứ soi chiếu"
              labelOffset={[-356, -28]}
            />

            {/* Extruded 3D Gauge Pillar #2: Sky Capacity Locked at ~38-40M on twin 365m runways */}
            <OnMap3DGaugePillar
              box={BOX_TSN_ANATOMY}
              project={proj}
              lonLat={rwyGapCenter}
              heightZ={146}
              ceilingZ={102}
              jammedReveal={airLock}
              reveal={skyPillar}
              color={PALETTE.coralAlert}
              tagTop="BẦU TRỜI • CẶP ĐƯỜNG BĂNG 365 M"
              valueText="KHÓA TRẦN ~38–40 TRIỆU"
              subText="0 m đường băng mới • Bầu trời vẫn kẹt"
              capLabel="TRẦN CẤT HẠ CÁNH (~38–40 TR)"
              labelOffset={[-386, -124]}
            />
          </svg>

          <OnMapPressClippingCard
            src="press/clip_t3_vnexpress.png"
            left={1366}
            top={84}
            width={490}
            rotationDeg={1.2}
            anchorPoint={[t3X, t3Y]}
            sourceBadge="VNEXPRESS • 24/12/2022"
            accent={PALETTE.tealAirport}
            reveal={pressReveal}
            highlightRect={{ leftPct: 23, topPct: 30.2, widthPct: 58, heightPct: 4.3 }}
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
              color: airLock > 0.35 ? PALETTE.coralAlert : PALETTE.tealAirport,
              textShadow: "0 2px 10px rgba(0, 0, 0, 0.90)",
              zIndex: 25,
            }}
          >
            02 • ĐỐI CHIẾU NGAY TRÊN MẶT BẰNG z14: MẶT ĐẤT T3 (50 TR) VS BẦU TRỜI 365 M (KẸT)
          </div>

          <VietnamMiniLocator targetLonLat={[106.656, 10.817]} label="TÂN SƠN NHẤT • z14" accent={PALETTE.coralAlert} right={SAFE_X} bottom={110} />
        </>
      }
    />
  );
};
