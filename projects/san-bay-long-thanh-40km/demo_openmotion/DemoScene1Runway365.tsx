import React from "react";
import { interpolate, spring, useCurrentFrame, useVideoConfig } from "remotion";
import { TSN_CENTER, TSN_PERIMETER_791HA, TSN_RUNWAY_25L, TSN_RUNWAY_25R } from "../data/longThanhGeoData";
import { boxAround, boxOfBounds, coordsToScreenPath, interpolateCameraBox } from "../mapMath";
import { EASE, FONTS, PALETTE, SAFE_X } from "../theme";
import { NationalWorldLayer, VietnamMiniLocator } from "../scenes/AviationBaseLayers";
import { MovingAircraft } from "../scenes/MovingAircraft";
import {
  CompactGeoPin,
  createProjector3D,
  GeoCaliperRule,
  HubMedallion,
  projectGeoPoint,
  Tactical3DStage,
} from "../scenes/Tactical3DKit";

const BOX_WIDEST = boxAround(108.8, 14.4, 50);
const BOX_TSN_MACRO = boxOfBounds({ west: 106.630, south: 10.805, east: 106.674, north: 10.831 }, 0.04);

/**
 * Opening One-Take Orbital Wide-to-Macro Zoom (0.00s - 11.45s):
 * - Starts from asia_pacific_z4 (50 deg longitude span showing SE Asia, full S-shape Vietnam,
 *   Hoang Sa & Truong Sa), then zooms slowly and continuously via log-scale interpolateCameraBox
 *   through z4 -> z6 -> z7 -> z9 -> z12 -> z14 over 0.00..8.05s.
 * - Holds z14 macro camera completely STILL during 8.05..11.45s while widebody lands on 25R,
 *   wake turbulence ripples, GeoCaliper 365 M locks, and HubMedallion ("✕") stamps waiting narrowbody on 25L.
 */
export const DemoScene1Runway365: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const sec = frame / fps;

  // Smooth continuous orbital zoom from widest satellite tier z4 (0.00s) down to TSN z14 macro (8.05s), then hold
  const zoomT = interpolate(sec, [0.00, 8.05], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  const activeBox = interpolateCameraBox(BOX_WIDEST, BOX_TSN_MACRO, zoomT);
  const spec = {
    width: 1920,
    height: 1080,
    pitchDeg: interpolate(zoomT, [0, 1], [32, 52]),
    yawDeg: interpolate(zoomT, [0, 1], [0, -3]),
    mapScale: interpolate(zoomT, [0, 1], [1.00, 1.14]),
    ty: interpolate(zoomT, [0, 1], [24, 46]),
    originYRatio: 0.56,
  };
  const proj = createProjector3D(spec);

  const spotDim = interpolate(sec, [7.40, 8.35], [0.04, 0.20], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  // National stage (0.08s - 4.15s): CompactGeoPin pointing LEFT inland so Hoang Sa / Truong Sa stay 100% clear
  const natPinAlpha =
    interpolate(sec, [0.08, 0.45], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" }) *
    (1 - interpolate(sec, [3.40, 4.15], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" }));

  // Urban stage (3.80s - 7.75s): 791 ha red perimeter rim & 4 surrounding districts fade in during fly-through then Clean-Slate Wipe before runway lock
  const urbanRimAlpha =
    interpolate(sec, [3.80, 4.70], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" }) *
    (1 - interpolate(sec, [6.90, 7.75], [0, 0.78], { extrapolateLeft: "clamp", extrapolateRight: "clamp" }));
  const urbanLabelAlpha =
    interpolate(sec, [4.50, 5.20], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" }) *
    (1 - interpolate(sec, [6.55, 7.25], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" }));

  // Runway tracks fade in smoothly as z12 -> z14 macro resolves
  const runwayAlpha = interpolate(sec, [6.40, 7.50], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });

  // Macro Action synced strictly to Hold phase (8.05s..11.45s)
  const plane1Prog = interpolate(sec, [7.35, 9.25], [0.06, 0.86], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
    easing: EASE.outCubic,
  });
  const wakeProg = interpolate(sec, [8.65, 9.95], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });
  const calDraw = interpolate(sec, [8.55, 9.30], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
    easing: EASE.outCubic,
  });
  const lockReveal = interpolate(sec, [9.65, 10.25], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
    easing: EASE.outCubic,
  });
  const lockPop = spring({
    frame: Math.max(0, frame - Math.round(9.65 * fps)),
    fps,
    config: { damping: 15, stiffness: 185 },
  });

  const locatorAlpha = interpolate(sec, [6.20, 7.00], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });

  const gapNorth: readonly [number, number] = [106.6502, 10.81996];
  const gapSouth: readonly [number, number] = [106.6514, 10.81688];
  const holdCoord: readonly [number, number] = [106.6669, 10.8227];

  const [hx, hy] = projectGeoPoint(activeBox, proj, holdCoord, 8);
  const [rxCenter, ryCenter] = projectGeoPoint(activeBox, proj, [106.6525, 10.8206], 0);
  const [tsnCenterX, tsnCenterY] = projectGeoPoint(activeBox, proj, TSN_CENTER, 0);

  const eyebrowText =
    sec < 3.6
      ? "01 • ĐỊNH VỊ TOÀN CẢNH TỪ VŨ TRỤ: VIỆT NAM & BIỂN ĐÔNG → TP.HCM"
      : sec < 7.5
        ? "01 • ỐC ĐẢO TÂN SƠN NHẤT ~791 HA BỊ ĐÔ THỊ VÂY KÍN 4 MẶT"
        : "01 • CẬN CẢNH z14: HAI ĐƯỜNG BĂNG 25R / 25L CHỈ CÁCH 365 M";

  return (
    <Tactical3DStage
      spec={spec}
      horizonAccent={PALETTE.coralAlert}
      compassBearingDeg={251}
      groundChildren={
        <>
          <NationalWorldLayer box={activeBox} showArchipelagoLabels dim={spotDim} rimColor="#F59E0B" />
          <svg width={1920} height={1080} style={{ position: "absolute", inset: 0, pointerEvents: "none" }}>
            {/* 791 ha TSN Perimeter emerging at metro/urban scale */}
            {urbanRimAlpha > 0.01 && (
              <g opacity={urbanRimAlpha}>
                <path
                  d={coordsToScreenPath(activeBox, TSN_PERIMETER_791HA, true)}
                  fill="rgba(217, 78, 65, 0.18)"
                  stroke={PALETTE.coralAlert}
                  strokeOpacity={0.35}
                  strokeWidth={14}
                  strokeLinejoin="round"
                />
                <path
                  d={coordsToScreenPath(activeBox, TSN_PERIMETER_791HA, true)}
                  fill="none"
                  stroke={PALETTE.coralAlert}
                  strokeWidth={4}
                  strokeLinejoin="round"
                />
              </g>
            )}

            {/* Runway highlight tracks */}
            {runwayAlpha > 0.01 && (
              <g opacity={runwayAlpha}>
                <path d={coordsToScreenPath(activeBox, TSN_RUNWAY_25R, false)} stroke={PALETTE.skyCyan} strokeOpacity={0.35} strokeWidth={13} strokeLinecap="round" />
                <path d={coordsToScreenPath(activeBox, TSN_RUNWAY_25R, false)} stroke={PALETTE.skyCyan} strokeWidth={5} strokeLinecap="round" />
                <path d={coordsToScreenPath(activeBox, TSN_RUNWAY_25L, false)} stroke={PALETTE.coralAlert} strokeOpacity={0.38} strokeWidth={13} strokeLinecap="round" />
                <path d={coordsToScreenPath(activeBox, TSN_RUNWAY_25L, false)} stroke={PALETTE.coralAlert} strokeWidth={5} strokeLinecap="round" />
              </g>
            )}
          </svg>
        </>
      }
      overlayChildren={
        <>
          <svg width={1920} height={1080} style={{ position: "absolute", inset: 0, pointerEvents: "none" }}>
            {/* National Zoom Origin Ping + Inland Pin (extends left so Hoang Sa / Truong Sa remain unobstructed) */}
            {natPinAlpha > 0.02 && (
              <g opacity={natPinAlpha}>
                <circle
                  cx={tsnCenterX}
                  cy={tsnCenterY}
                  r={18 + ((sec * 24) % 18)}
                  fill="none"
                  stroke={PALETTE.coralAlert}
                  strokeWidth={2}
                  opacity={0.55}
                />
                <circle cx={tsnCenterX} cy={tsnCenterY} r={5.5} fill="#FFFCF0" stroke={PALETTE.coralAlert} strokeWidth={2.5} />
                <CompactGeoPin
                  coord={TSN_CENTER}
                  box={activeBox}
                  project={proj}
                  label="TP.HCM • TÂN SƠN NHẤT"
                  tag="ĐIỂM NGHẼN BẦU TRỜI"
                  color={PALETTE.coralAlert}
                  offset={[-26, -46]}
                  reveal={natPinAlpha}
                />
              </g>
            )}

            {/* Urban Fly-Through Surrounding Districts + 791 ha Badge (Clean-Slate Wipe before z14 landing) */}
            {urbanLabelAlpha > 0.02 && (
              <g opacity={urbanLabelAlpha}>
                {(
                  [
                    { name: "GÒ VẤP", pt: [106.678, 10.842] as const },
                    { name: "TÂN BÌNH", pt: [106.638, 10.796] as const },
                    { name: "PHÚ NHUẬN", pt: [106.686, 10.800] as const },
                    { name: "TÂN PHÚ", pt: [106.620, 10.816] as const },
                  ] as const
                ).map((d) => {
                  const [dx, dy] = projectGeoPoint(activeBox, proj, d.pt, 4);
                  return (
                    <text
                      key={d.name}
                      x={dx}
                      y={dy}
                      textAnchor="middle"
                      fill="#FFFCF0"
                      stroke="#100F0F"
                      strokeWidth={6}
                      paintOrder="stroke"
                      fontFamily={FONTS.mono}
                      fontSize={16}
                      fontWeight={700}
                      letterSpacing="0.08em"
                    >
                      {d.name}
                    </text>
                  );
                })}
                <g transform={`translate(${tsnCenterX.toFixed(1)}, ${(tsnCenterY - 96).toFixed(1)})`}>
                  <rect x={-215} y={-28} width={430} height={56} rx={9} fill="rgba(18, 17, 16, 0.94)" stroke={PALETTE.coralAlert} strokeWidth={2} />
                  <text x={0} y={-2} textAnchor="middle" fill={PALETTE.goldCaution} fontFamily={FONTS.mono} fontSize={13.5} fontWeight={700}>
                    ỐC ĐẢO NỘI ĐÔ TP.HCM
                  </text>
                  <text x={0} y={20} textAnchor="middle" fill={PALETTE.ivory} fontFamily={FONTS.display} fontSize={18} fontWeight={800}>
                    ~791 HA • BỊ NHÀ PHỐ KHÓA KÍN 4 MẶT
                  </text>
                </g>
              </g>
            )}

            {/* Wake turbulence concentric pressure arcs */}
            {wakeProg > 0.02 && wakeProg < 1 && (
              <g opacity={(1 - wakeProg) * 0.72}>
                {[1, 2].map((ring) => {
                  const rr = (28 + wakeProg * 165) * (ring === 1 ? 1 : 0.68);
                  return (
                    <ellipse
                      key={ring}
                      cx={rxCenter}
                      cy={ryCenter}
                      rx={rr * 1.45}
                      ry={rr * 0.62}
                      fill="none"
                      stroke={PALETTE.coralAlert}
                      strokeWidth={2.5}
                      strokeDasharray="8 6"
                    />
                  );
                })}
              </g>
            )}

            {/* Macro 365 M Geodesic Caliper */}
            <GeoCaliperRule
              from={gapNorth}
              to={gapSouth}
              box={activeBox}
              project={proj}
              label="TIM ĐƯỜNG BĂNG: 365 M"
              color={PALETTE.goldCaution}
              reveal={calDraw}
              labelOffset={[-210, -68]}
            />

            {/* Aircraft #1 landing along 25R */}
            {runwayAlpha > 0.15 && (
              <g opacity={runwayAlpha}>
                <MovingAircraft
                  box={activeBox}
                  project={proj}
                  coords={[...TSN_RUNWAY_25R].reverse()}
                  progress={plane1Prog}
                  altitudeZ={10}
                  kind="widebody"
                  color={PALETTE.skyCyan}
                  scale={1.34}
                />
                <MovingAircraft
                  box={activeBox}
                  project={proj}
                  coords={[...TSN_RUNWAY_25L].reverse()}
                  progress={0.08}
                  altitudeZ={6}
                  kind="narrowbody"
                  color={PALETTE.coralAlert}
                  scale={1.22}
                />
              </g>
            )}

            {/* Clean HubMedallion ("✕") + Status Badge on waiting jet at 25L */}
            {lockReveal > 0.02 && (
              <g opacity={lockReveal}>
                <ellipse
                  cx={hx}
                  cy={hy}
                  rx={54}
                  ry={24}
                  fill="none"
                  stroke={PALETTE.coralAlert}
                  strokeWidth={2.4}
                  strokeDasharray="7 5"
                  opacity={0.78}
                />
                <g transform={`translate(${hx.toFixed(1)}, ${(hy - 42).toFixed(1)}) scale(${(0.75 + 0.25 * lockPop).toFixed(3)})`}>
                  <HubMedallion cx={0} cy={0} glyph="✕" color={PALETTE.coralAlert} radius={18} />
                </g>
                <g opacity={Math.min(1, lockReveal * 1.3)}>
                  <rect
                    x={hx - 150}
                    y={hy + 42}
                    width={300}
                    height={38}
                    rx={8}
                    fill="rgba(20, 19, 18, 0.94)"
                    stroke={PALETTE.coralAlert}
                    strokeWidth={1.8}
                  />
                  <text
                    x={hx}
                    y={hy + 66}
                    textAnchor="middle"
                    fill={PALETTE.ivory}
                    fontFamily={FONTS.mono}
                    fontSize={14}
                    fontWeight={700}
                  >
                    KHÓA CHỜ SLOT • &lt; 760 M ICAO
                  </text>
                </g>
              </g>
            )}
          </svg>

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
            {eyebrowText}
          </div>

          {locatorAlpha > 0.02 && (
            <div style={{ opacity: locatorAlpha }}>
              <VietnamMiniLocator targetLonLat={[106.656, 10.817]} label="TÂN SƠN NHẤT" accent={PALETTE.coralAlert} right={SAFE_X} bottom={110} />
            </div>
          )}
        </>
      }
    />
  );
};
