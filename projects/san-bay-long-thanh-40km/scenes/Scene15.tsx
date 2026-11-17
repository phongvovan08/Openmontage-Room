import React from "react";
import { interpolate, useCurrentFrame, useVideoConfig } from "remotion";
import { LONG_THANH_PERIMETER_5000HA, LT_CENTER, LT_LOTUS_TERMINAL, LT_RUNWAY_1_NORTH, LT_RUNWAY_3_NORTH } from "../data/longThanhGeoData";
import { REAL_PHOTOS } from "../data/realPhotosManifest";
import { boxOfBounds, coordsToScreenPath, lonLatToScreen } from "../mapMath";
import { PALETTE, SAFE_X } from "../theme";
import { KpiMetricCard, RealSatelliteBasemap } from "./AviationBaseLayers";
import { EvidencePhotoCard } from "./EvidencePhotoCard";
import { OfficialDocCallout } from "./OfficialDocCallout";
import { createProjector3D, Extruded3DPolygon, SceneHeaderPill, Tactical3DBeacon, Tactical3DStage } from "./Tactical3DKit";

const BOX_LT_PHASE1 = boxOfBounds({ west: 106.995, south: 10.725, east: 107.110, north: 10.822 }, 0.04);

export const Scene15: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps, durationInFrames } = useVideoConfig();
  const sec = frame / fps;
  // Runway 3 (2nd northern runway) switches from dashed to active Phase 1 solid teal around lock SFX at +10.42s
  const rwy3Activate = interpolate(sec, [10.0, 15.0], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });

  const spec = { width: 1920, height: 1080, pitchDeg: 50, yawDeg: interpolate(sec, [0, durationInFrames / fps], [-7, 4]), mapScale: 1.06, ty: 54 };
  const proj = createProjector3D(spec);
  const [ax, ay] = lonLatToScreen(BOX_LT_PHASE1, LT_CENTER);
  const [pax, pay] = proj(ax, ay, 0);

  return (
    <Tactical3DStage
      spec={spec}
      horizonAccent={PALETTE.goldCaution}
      compassBearingDeg={55}
      groundChildren={
        <>
          <RealSatelliteBasemap box={BOX_LT_PHASE1} dim={0.04} />
          <svg width={1920} height={1080} style={{ position: "absolute", inset: 0 }}>
            <path d={coordsToScreenPath(BOX_LT_PHASE1, LONG_THANH_PERIMETER_5000HA, true)} fill="rgba(45, 212, 191, 0.10)" stroke={PALETTE.tealAirport} strokeWidth={3.5} />
            <path d={coordsToScreenPath(BOX_LT_PHASE1, LT_RUNWAY_1_NORTH, false)} stroke={PALETTE.skyCyan} strokeWidth={6} strokeLinecap="round" />
            <path
              d={coordsToScreenPath(BOX_LT_PHASE1, LT_RUNWAY_3_NORTH, false)}
              stroke={rwy3Activate > 0.5 ? PALETTE.tealAirport : PALETTE.goldCaution}
              strokeWidth={6}
              strokeDasharray={rwy3Activate > 0.5 ? undefined : "10 6"}
              strokeLinecap="round"
            />
          </svg>
        </>
      }
      overlayChildren={
        <>
          <Extruded3DPolygon
            coords={LT_LOTUS_TERMINAL}
            box={BOX_LT_PHASE1}
            project={proj}
            heightZ={24}
            fillTop="rgba(250, 204, 21, 0.36)"
            fillSide="rgba(245, 158, 11, 0.28)"
            strokeColor={PALETTE.goldCaution}
          />

          <svg width={1920} height={1080} style={{ position: "absolute", inset: 0, pointerEvents: "none" }}>
            <Tactical3DBeacon box={BOX_LT_PHASE1} proj={proj} lonLat={LT_RUNWAY_3_NORTH[1]} label="Đường CHC số 2 phía Bắc" sublabel="BỔ SUNG NGAY GIAI ĐOẠN 1" color={PALETTE.tealAirport} heightPx={105} align="right" reveal={rwy3Activate} />
          </svg>

          <SceneHeaderPill badge="15 • NGHỊ QUYẾT 174/2024/QH15" title="Bổ sung ngay đường băng thứ 2 trước mốc cuối năm 2026" accent={PALETTE.goldCaution} />

          {/* Syncs yellow highlight sweep directly to lock SFX around 470.19s (+10.42s) */}
          <OfficialDocCallout
            docCode="NGHỊ QUYẾT 174/2024/QH15"
            issuer="QUỐC HỘI • BAN HÀNH NGÀY 30/11/2024"
            leadText="Điều chỉnh chủ trương đầu tư cho phép xây dựng ngay"
            highlightText="Đường cất hạ cánh số 2 phía Bắc ngay trong Giai đoạn 1"
            trailText="và hoàn thành chậm nhất ngày 31/12/2026."
            left={SAFE_X}
            top={126}
            width={620}
            appearAtSec={4.5}
            disappearAtSec={34.0}
            accentColor={PALETTE.goldCaution}
          />

          <KpiMetricCard
            left={SAFE_X}
            bottom={112}
            width={480}
            value="25 triệu • 1,2 tr tấn"
            label="CÔNG SUẤT NGÀY MỞ CỬA GIAI ĐOẠN 1"
            sublabel="Dự phòng chủ động hai đường băng ngay từ đợt khai thác đầu tiên."
            accent={PALETTE.tealAirport}
          />

          {/* Newly verified real aerial photo of Long Thanh lotus terminal & tower */}
          <EvidencePhotoCard
            photo={REAL_PHOTOS.long_thanh_site}
            left={1920 - SAFE_X - 490}
            top={126}
            width={490}
            height={318}
            accentColor={PALETTE.goldCaution}
            anchorPoint={[pax, pay]}
            appearAtSec={1.0}
          />
        </>
      }
    />
  );
};
