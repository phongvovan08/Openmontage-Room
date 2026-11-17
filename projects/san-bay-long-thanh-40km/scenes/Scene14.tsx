import React from "react";
import { interpolate, useCurrentFrame, useVideoConfig } from "remotion";
import {
  LONG_THANH_PERIMETER_5000HA,
  LT_CENTER,
  LT_LOTUS_TERMINAL,
  LT_RUNWAY_1_NORTH,
  LT_RUNWAY_2_SOUTH,
  LT_RUNWAY_3_NORTH,
  LT_RUNWAY_4_SOUTH,
} from "../data/longThanhGeoData";
import { REAL_PHOTOS } from "../data/realPhotosManifest";
import { boxOfBounds, coordsToScreenPath, lonLatToScreen } from "../mapMath";
import { PALETTE, SAFE_X } from "../theme";
import { KpiMetricCard, RealSatelliteBasemap, VietnamMiniLocator } from "./AviationBaseLayers";
import { EvidencePhotoCard } from "./EvidencePhotoCard";
import { MovingAircraft } from "./MovingAircraft";
import { createProjector3D, Extruded3DPolygon, GeoCaliperRule, SceneHeaderPill, Tactical3DStage } from "./Tactical3DKit";

const BOX_LT_MASTER = boxOfBounds({ west: 106.995, south: 10.725, east: 107.110, north: 10.822 }, 0.04);

export const Scene14: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps, durationInFrames } = useVideoConfig();
  const sec = frame / fps;
  const r2Reveal = interpolate(sec, [4.5, 9.5], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
  const calReveal = interpolate(sec, [8.5, 12.0], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
  const pNorth = (sec * 0.12) % 1;
  const pSouth = ((sec * 0.12) + 0.15) % 1;

  const spec = {
    width: 1920,
    height: 1080,
    pitchDeg: 49,
    yawDeg: interpolate(sec, [0, durationInFrames / fps], [-6, 5]),
    mapScale: 1.07,
    ty: 52,
  };
  const proj = createProjector3D(spec);
  const [lgx, lgy] = lonLatToScreen(BOX_LT_MASTER, LT_CENTER);
  const [ltX, ltY] = proj(lgx, lgy, 0);

  // Perpendicular north-wing <-> south-wing gap (>2.000 m independent operations)
  const wingN: readonly [number, number] = [107.0398, 10.7854];
  const wingS: readonly [number, number] = [107.0502, 10.7712];

  return (
    <Tactical3DStage
      spec={spec}
      horizonAccent={PALETTE.tealAirport}
      compassBearingDeg={55}
      groundChildren={
        <>
          <RealSatelliteBasemap box={BOX_LT_MASTER} dim={0.04} />
          <svg width={1920} height={1080} style={{ position: "absolute", inset: 0, pointerEvents: "none" }}>
            <path d={coordsToScreenPath(BOX_LT_MASTER, LONG_THANH_PERIMETER_5000HA, true)} fill="rgba(45, 212, 191, 0.11)" stroke={PALETTE.tealAirport} strokeWidth={3.5} />
            <path d={coordsToScreenPath(BOX_LT_MASTER, LT_RUNWAY_1_NORTH, false)} stroke={PALETTE.skyCyan} strokeWidth={6} strokeLinecap="round" />
            <path d={coordsToScreenPath(BOX_LT_MASTER, LT_RUNWAY_3_NORTH, false)} stroke={PALETTE.tealAirport} strokeWidth={5.5} strokeLinecap="round" />
            <g opacity={r2Reveal}>
              <path d={coordsToScreenPath(BOX_LT_MASTER, LT_RUNWAY_2_SOUTH, false)} stroke={PALETTE.goldCaution} strokeWidth={5} strokeDasharray="10 6" />
              <path d={coordsToScreenPath(BOX_LT_MASTER, LT_RUNWAY_4_SOUTH, false)} stroke={PALETTE.goldCaution} strokeWidth={5} strokeDasharray="10 6" />
            </g>
          </svg>
        </>
      }
      overlayChildren={
        <>
          <Extruded3DPolygon
            coords={LT_LOTUS_TERMINAL}
            box={BOX_LT_MASTER}
            project={proj}
            heightZ={22}
            fillTop="rgba(250, 204, 21, 0.34)"
            fillSide="rgba(245, 158, 11, 0.28)"
            strokeColor={PALETTE.goldCaution}
          />

          <svg width={1920} height={1080} style={{ position: "absolute", inset: 0, pointerEvents: "none" }}>
            <GeoCaliperRule
              from={wingN}
              to={wingS}
              box={BOX_LT_MASTER}
              project={proj}
              label="HAI CÁNH CÁCH > 2.000 M"
              color={PALETTE.goldCaution}
              reveal={calReveal}
              labelOffset={[-175, 48]}
            />
            <MovingAircraft box={BOX_LT_MASTER} project={proj} coords={LT_RUNWAY_1_NORTH} progress={pNorth} kind="widebody" color={PALETTE.skyCyan} scale={1.2} />
            {r2Reveal > 0.6 && (
              <MovingAircraft box={BOX_LT_MASTER} project={proj} coords={LT_RUNWAY_2_SOUTH} progress={pSouth} kind="widebody" color={PALETTE.goldCaution} scale={1.2} />
            )}
          </svg>

          <SceneHeaderPill badge="14 • 4 ĐƯỜNG BĂNG CẤP ICAO 4F" title="Khoảng tách > 2 km xóa sổ nút thắt 365 m cho siêu tàu bay" accent={PALETTE.tealAirport} />

          <KpiMetricCard
            left={SAFE_X}
            top={126}
            width={430}
            value="4 × 4.000 m"
            label="HAI CẶP ĐƯỜNG BĂNG BẮC – NAM"
            sublabel="Đủ chiều dài 4.000 m × 60 m cho A380 và B747/777 cất hạ cánh đồng thời độc lập."
            accent={PALETTE.tealAirport}
          />

          {/* SELECTIVE HERO PHOTO ZOOM #1 synced 1:1 to sfx_events.json whooshes at 438.07s (+13.30s) & 452.07s (+27.30s) */}
          <EvidencePhotoCard
            photo={REAL_PHOTOS.widebody_a380}
            left={1920 - SAFE_X - 450}
            top={126}
            width={450}
            height={290}
            accentColor={PALETTE.skyCyan}
            anchorPoint={[ltX, ltY]}
            appearAtSec={0.8}
            focusWindow={{
              zoomInStartSec: 13.0,
              holdStartSec: 13.55,
              holdEndSec: 27.0,
              zoomOutEndSec: 27.6,
            }}
          />

          <VietnamMiniLocator targetLonLat={LT_CENTER} label="4 ĐƯỜNG BĂNG 4F" accent={PALETTE.tealAirport} right={SAFE_X} bottom={112} />
        </>
      }
    />
  );
};
