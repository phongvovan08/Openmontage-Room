import React from "react";
import { interpolate, useCurrentFrame, useVideoConfig } from "remotion";
import { HCM_CENTER, TSN_CENTER, TSN_PERIMETER_791HA } from "../data/longThanhGeoData";
import { REAL_PHOTOS } from "../data/realPhotosManifest";
import { boxOfBounds, coordsToScreenPath, lonLatToScreen } from "../mapMath";
import { FONTS, PALETTE, SAFE_X } from "../theme";
import { KpiMetricCard, RealSatelliteBasemap } from "./AviationBaseLayers";
import { EvidencePhotoCard } from "./EvidencePhotoCard";
import { MovingAircraft } from "./MovingAircraft";
import { CompactGeoPin, createProjector3D, SceneHeaderPill, Tactical3DBeacon, Tactical3DStage } from "./Tactical3DKit";

const BOX_HCM_APPROACH = boxOfBounds({ west: 106.59, south: 10.74, east: 106.76, north: 10.85 }, 0.04);
const GLIDE_PATH = [[106.745, 10.785] as const, [106.705, 10.800] as const, TSN_CENTER] as const;

export const Scene05: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps, durationInFrames } = useVideoConfig();
  const sec = frame / fps;
  const yaw = interpolate(sec, [0, durationInFrames / fps], [6, -11]);
  const approachP = (sec * 0.14) % 1;

  const spec = { width: 1920, height: 1080, pitchDeg: 55, yawDeg: yaw, mapScale: 1.05, ty: 58 };
  const proj = createProjector3D(spec);
  const [hx, hy] = lonLatToScreen(BOX_HCM_APPROACH, HCM_CENTER);
  const [tx, ty] = lonLatToScreen(BOX_HCM_APPROACH, TSN_CENTER);
  const [phx, phy] = proj(hx, hy, 0);
  const [ptx, pty] = proj(tx, ty, 0);
  const [, tHigh] = proj(tx, ty, 195);

  return (
    <Tactical3DStage
      spec={spec}
      horizonAccent={PALETTE.skyCyan}
      compassBearingDeg={70}
      groundChildren={
        <>
          <RealSatelliteBasemap box={BOX_HCM_APPROACH} dim={0.08} />
          <svg width={1920} height={1080} style={{ position: "absolute", inset: 0 }}>
            <path d={coordsToScreenPath(BOX_HCM_APPROACH, TSN_PERIMETER_791HA, true)} fill="rgba(244, 63, 94, 0.24)" stroke={PALETTE.coralAlert} strokeWidth={4} />
          </svg>
        </>
      }
      overlayChildren={
        <>
          <svg width={1920} height={1080} style={{ position: "absolute", inset: 0, pointerEvents: "none" }}>
            <polygon
              points={`${ptx},${pty} ${phx - 86},${phy - 165} ${phx + 86},${phy - 225}`}
              fill="rgba(244, 63, 94, 0.22)"
              stroke={PALETTE.coralAlert}
              strokeWidth={2.5}
              strokeDasharray="8 5"
            />
            <line x1={phx} y1={phy - 195} x2={ptx} y2={pty} stroke={PALETTE.goldCaution} strokeWidth={3.5} />
            <ellipse cx={ptx} cy={tHigh} rx={115} ry={32} fill="none" stroke={PALETTE.skyCyan} strokeWidth={2.2} strokeDasharray="8 6" />

            <MovingAircraft
              box={BOX_HCM_APPROACH}
              project={proj}
              coords={GLIDE_PATH}
              progress={approachP}
              altitudeZ={(1 - approachP) * 145}
              kind="narrowbody"
              color={PALETTE.goldCaution}
              scale={1.15}
            />

            <Tactical3DBeacon box={BOX_HCM_APPROACH} proj={proj} lonLat={HCM_CENTER} label="Quận 1 & Sông Sài Gòn" sublabel="Phễu hạ cánh xuyên nội đô" color={PALETTE.goldCaution} heightPx={135} align="right" />
            <Tactical3DBeacon box={BOX_HCM_APPROACH} proj={proj} lonLat={TSN_CENTER} label="Đầu 25R/25L" sublabel="Vòng chờ trên không" color={PALETTE.coralAlert} heightPx={155} align="left" />
            <CompactGeoPin coord={[106.712, 10.818]} box={BOX_HCM_APPROACH} project={proj} label="BÌNH THẠNH" color={PALETTE.lateriteAmber} offset={[20, -34]} />
            <CompactGeoPin coord={[106.672, 10.802]} box={BOX_HCM_APPROACH} project={proj} label="PHÚ NHUẬN" color={PALETTE.coralAlert} offset={[-18, 26]} />
          </svg>

          <SceneHeaderPill badge="05 • PHỄU BAY & ĐỘ CAO TĨNH KHÔNG" title="Máy bay hạ cánh ngay trên nóc nhà khu dân cư nội đô" accent={PALETTE.skyCyan} />

          <EvidencePhotoCard
            photo={REAL_PHOTOS.hcm_skyline}
            left={SAFE_X}
            top={126}
            width={450}
            height={285}
            accentColor={PALETTE.goldCaution}
            anchorPoint={[phx, phy]}
            appearAtSec={1.0}
          />

          <KpiMetricCard
            right={SAFE_X}
            top={126}
            width={430}
            value="3 rào cản lớn"
            label="ÁP LỰC TỪ BỐN PHÍA ĐÔ THỊ"
            sublabel="1. Tiếng ồn vượt ngưỡng • 2. Rủi ro khẩn cấp khu dân cư • 3. Trần cao ốc nội đô."
            accent={PALETTE.skyCyan}
          />
        </>
      }
    />
  );
};
