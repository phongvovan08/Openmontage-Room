import React from "react";
import { interpolate, useCurrentFrame, useVideoConfig } from "remotion";
import {
  DONG_NAI_RIVER,
  LONG_THANH_PERIMETER_5000HA,
  LT_CENTER,
  TSN_CENTER,
  TSN_PERIMETER_791HA,
} from "../data/longThanhGeoData";
import { boxOfBounds, coordsToScreenPath } from "../mapMath";
import { EASE, PALETTE } from "../theme";
import { RealSatelliteBasemap } from "../scenes/AviationBaseLayers";
import {
  Arc3DRoute,
  CompactGeoPin,
  createProjector3D,
  GeoCaliperRule,
  SceneHeaderPill,
  Tactical3DStage,
} from "../scenes/Tactical3DKit";

const BOX_OPEN = boxOfBounds({ west: 106.60, south: 10.70, east: 107.12, north: 10.88 }, 0.06);

/**
 * Beat 0 (0.00s - 1.40s): Pure 3D Corridor Plunge Opening (SKILL.md Muc 4.1).
 * Leaves >= 90% of EOX 2024 satellite terrain clear: 2-layer luminous rims on TSN & Long Thanh,
 * 3D parabolic trajectory arc, 40 km geodesic caliper, and compact coordinate pins.
 */
export const DemoBeat0Opener: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const sec = frame / fps;

  const plungeT = interpolate(sec, [0, 1.35], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
    easing: EASE.outCubic,
  });

  const spec = {
    width: 1920,
    height: 1080,
    pitchDeg: interpolate(plungeT, [0, 1], [56, 51]),
    yawDeg: interpolate(plungeT, [0, 1], [-5, -1.5]),
    mapScale: interpolate(plungeT, [0, 1], [1.04, 1.14]),
    ty: 54,
    originYRatio: 0.56,
  };
  const proj = createProjector3D(spec);

  const routeShot = interpolate(sec, [0.08, 0.96], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
    easing: EASE.outExpo,
  });
  const calReveal = interpolate(sec, [0.25, 1.02], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
    easing: EASE.outCubic,
  });
  const pinReveal = interpolate(sec, [0.18, 0.62], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
    easing: EASE.outCubic,
  });

  return (
    <Tactical3DStage
      spec={spec}
      horizonAccent={PALETTE.goldCaution}
      compassBearingDeg={102}
      groundChildren={
        <>
          <RealSatelliteBasemap box={BOX_OPEN} dim={0.08} />
          <svg width={1920} height={1080} style={{ position: "absolute", inset: 0, pointerEvents: "none" }}>
            <path d={coordsToScreenPath(BOX_OPEN, DONG_NAI_RIVER, false)} fill="none" stroke="rgba(86, 149, 201, 0.44)" strokeWidth={8} strokeLinecap="round" />

            {/* 2-Layer Luminous Perimeter Rim: TSN (791 ha) */}
            <path
              d={coordsToScreenPath(BOX_OPEN, TSN_PERIMETER_791HA, true)}
              fill="rgba(217, 78, 65, 0.22)"
              stroke={PALETTE.coralAlert}
              strokeWidth={14}
              strokeOpacity={0.34}
              strokeLinejoin="round"
            />
            <path
              d={coordsToScreenPath(BOX_OPEN, TSN_PERIMETER_791HA, true)}
              fill="none"
              stroke={PALETTE.coralAlert}
              strokeWidth={4.5}
              strokeLinejoin="round"
            />

            {/* 2-Layer Luminous Perimeter Rim: Long Thanh (5.000 ha) */}
            <path
              d={coordsToScreenPath(BOX_OPEN, LONG_THANH_PERIMETER_5000HA, true)}
              fill="rgba(58, 169, 159, 0.20)"
              stroke={PALETTE.tealAirport}
              strokeWidth={16}
              strokeOpacity={0.34}
              strokeLinejoin="round"
            />
            <path
              d={coordsToScreenPath(BOX_OPEN, LONG_THANH_PERIMETER_5000HA, true)}
              fill="none"
              stroke={PALETTE.tealAirport}
              strokeWidth={4.5}
              strokeLinejoin="round"
            />
          </svg>
        </>
      }
      overlayChildren={
        <>
          <Arc3DRoute
            coords={[TSN_CENTER, [106.865, 10.794], LT_CENTER]}
            box={BOX_OPEN}
            project={proj}
            maxAltitudeZ={68}
            reveal={routeShot}
            color={PALETTE.goldCaution}
            strokeWidth={5}
          />

          <svg width={1920} height={1080} style={{ position: "absolute", inset: 0, pointerEvents: "none" }}>
            <GeoCaliperRule
              from={TSN_CENTER}
              to={LT_CENTER}
              box={BOX_OPEN}
              project={proj}
              gz={6}
              label="DỜI TRỤC ĐÔNG: ~40 KM"
              color={PALETTE.goldCaution}
              reveal={calReveal}
              labelOffset={[0, 48]}
            />

            <CompactGeoPin
              coord={TSN_CENTER}
              box={BOX_OPEN}
              project={proj}
              label="TÂN SƠN NHẤT • 791 HA"
              tag="KHE HẸP 365 M • QUÁ TẢI NỘI ĐÔ"
              color={PALETTE.coralAlert}
              offset={[22, -94]}
              reveal={pinReveal}
            />

            <CompactGeoPin
              coord={LT_CENTER}
              box={BOX_OPEN}
              project={proj}
              label="LONG THÀNH • 5.000 HA"
              tag="BÌNH SƠN • SIÊU SÂN BAY 4F"
              color={PALETTE.tealAirport}
              offset={[-20, -88]}
              reveal={pinReveal}
            />
          </svg>

          <SceneHeaderPill
            badge="MỞ MÀN • BẢN ĐỒ VỆ TINH 3D"
            title="Từ khe hẹp 365 m Tân Sơn Nhất đến siêu sân bay 40 km"
            accent={PALETTE.goldCaution}
          />
        </>
      }
    />
  );
};
