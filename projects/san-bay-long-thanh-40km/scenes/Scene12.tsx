import React from "react";
import { interpolate, useCurrentFrame, useVideoConfig } from "remotion";
import { BIEN_HOA_CENTER, CAI_MEP_PORT, HCM_CENTER, LT_CENTER } from "../data/longThanhGeoData";
import { REAL_PHOTOS } from "../data/realPhotosManifest";
import { boxOfBounds, lonLatToScreen } from "../mapMath";
import { PALETTE, SAFE_X } from "../theme";
import { DongNamBoCorridorLayer, KpiMetricCard } from "./AviationBaseLayers";
import { EvidencePhotoCard } from "./EvidencePhotoCard";
import { CompactGeoPin, createProjector3D, GeoCaliperRule, HubMedallion, projectPolyline, SceneHeaderPill, Tactical3DStage } from "./Tactical3DKit";

const BOX_TRIANGLE = boxOfBounds({ west: 106.54, south: 10.42, east: 107.25, north: 11.02 }, 0.04);

export const Scene12: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps, durationInFrames } = useVideoConfig();
  const sec = frame / fps;
  const drawT = interpolate(sec, [1.5, 9.0], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });

  const spec = { width: 1920, height: 1080, pitchDeg: 50, yawDeg: interpolate(sec, [0, durationInFrames / fps], [-6, 5]), mapScale: 1.05, ty: 54 };
  const proj = createProjector3D(spec);

  const [lgx, lgy] = lonLatToScreen(BOX_TRIANGLE, LT_CENTER);
  const [ltX, ltY] = proj(lgx, lgy, 0);
  const [cgx, cgy] = lonLatToScreen(BOX_TRIANGLE, CAI_MEP_PORT);
  const [cmX, cmY] = proj(cgx, cgy, 0);

  const triD = projectPolyline(BOX_TRIANGLE, proj, [HCM_CENTER, BIEN_HOA_CENTER, LT_CENTER, CAI_MEP_PORT, HCM_CENTER]);

  return (
    <Tactical3DStage
      spec={spec}
      horizonAccent={PALETTE.tealAirport}
      compassBearingDeg={112}
      groundChildren={<DongNamBoCorridorLayer box={BOX_TRIANGLE} dim={0.08} showRivers showAirports showRoads showRail />}
      overlayChildren={
        <>
          <svg width={1920} height={1080} style={{ position: "absolute", inset: 0, pointerEvents: "none" }}>
            <path d={triD} fill="rgba(45, 212, 191, 0.14)" stroke={PALETTE.tealAirport} strokeWidth={4} strokeDasharray="10 6" opacity={drawT} />
            <HubMedallion cx={ltX} cy={ltY} glyph="✈" color={PALETTE.tealAirport} radius={21} />
            <HubMedallion cx={cmX} cy={cmY} glyph="⚓" color={PALETTE.skyCyan} radius={20} />

            <GeoCaliperRule from={HCM_CENTER} to={LT_CENTER} box={BOX_TRIANGLE} project={proj} label="~40 KM TP.HCM ↔ LT" color={PALETTE.goldCaution} reveal={drawT} labelOffset={[-20, -34]} />
            <GeoCaliperRule from={LT_CENTER} to={CAI_MEP_PORT} box={BOX_TRIANGLE} project={proj} label="~30–35 KM CÁI MÉP" color={PALETTE.skyCyan} reveal={drawT} labelOffset={[-148, 8]} />

            <CompactGeoPin coord={BIEN_HOA_CENTER} box={BOX_TRIANGLE} project={proj} label="KCN Đồng Nai – Bình Dương" color={PALETTE.lateriteAmber} offset={[20, -34]} />
            <CompactGeoPin coord={CAI_MEP_PORT} box={BOX_TRIANGLE} project={proj} label="Cảng nước sâu Cái Mép – Thị Vải" tag="ĐÓN SIÊU TÀU ĐI MỸ – ÂU" color={PALETTE.skyCyan} offset={[-24, 42]} />
          </svg>

          <SceneHeaderPill badge="12 • TÂM ĐIỂM SEA–AIR ĐÔNG NAM BỘ" title="Không bị đẩy ra rìa: Long Thành nằm ngay tâm tam giác tăng trưởng" accent={PALETTE.tealAirport} />

          <KpiMetricCard
            left={SAFE_X}
            top={126}
            width={440}
            value="30–40 km"
            label="CỬA NGÕ SEA–AIR VÔ SONG"
            sublabel="Nối trực tiếp lõi TP.HCM, thủ phủ KCN Đồng Nai – Bình Dương và cảng nước sâu Cái Mép – Thị Vải."
            accent={PALETTE.tealAirport}
          />

          <EvidencePhotoCard
            photo={REAL_PHOTOS.cai_mep_port}
            left={1920 - SAFE_X - 460}
            top={126}
            width={460}
            height={295}
            accentColor={PALETTE.skyCyan}
            anchorPoint={[cmX, cmY]}
            appearAtSec={1.2}
          />
        </>
      }
    />
  );
};
