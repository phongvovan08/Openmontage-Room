import React from "react";
import { interpolate, useCurrentFrame, useVideoConfig } from "remotion";
import {
  CAU_LONG_THANH_SPAN,
  CAU_NHON_TRACH_SPAN,
  DONG_NAI_RIVER,
  EXPR_BEN_LUC_LONG_THANH,
  EXPR_BIEN_HOA_VUNG_TAU,
  EXPR_HCM_LT_DAU_GIAY,
  RING_ROAD_3_HCMC,
} from "../data/longThanhGeoData";
import { REAL_PHOTOS } from "../data/realPhotosManifest";
import { boxOfBounds, coordsToScreenPath, lonLatToScreen } from "../mapMath";
import { PALETTE, SAFE_X } from "../theme";
import { KpiMetricCard, RealSatelliteBasemap, VietnamMiniLocator } from "./AviationBaseLayers";
import { EvidencePhotoCard } from "./EvidencePhotoCard";
import { Bridge3DExtrusion, CompactGeoPin, createProjector3D, SceneHeaderPill, Tactical3DStage } from "./Tactical3DKit";

const BOX_BRIDGES = boxOfBounds({ west: 106.76, south: 10.64, east: 107.06, north: 10.85 }, 0.04);

export const Scene17: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps, durationInFrames } = useVideoConfig();
  const sec = frame / fps;
  const yaw = interpolate(sec, [0, durationInFrames / fps], [-8, 5]);
  const netDraw = interpolate(sec, [1.0, 9.0], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });

  const spec = { width: 1920, height: 1080, pitchDeg: 52, yawDeg: yaw, mapScale: 1.07, ty: 54 };
  const proj = createProjector3D(spec);
  const [ax, ay] = lonLatToScreen(BOX_BRIDGES, [106.865, 10.786]);
  const [pax, pay] = proj(ax, ay, 24);

  return (
    <Tactical3DStage
      spec={spec}
      horizonAccent={PALETTE.goldCaution}
      compassBearingDeg={105}
      groundChildren={
        <>
          <RealSatelliteBasemap box={BOX_BRIDGES} dim={0.05} />
          <svg width={1920} height={1080} style={{ position: "absolute", inset: 0 }}>
            <path d={coordsToScreenPath(BOX_BRIDGES, DONG_NAI_RIVER, false)} fill="none" stroke="rgba(56, 189, 248, 0.45)" strokeWidth={8} strokeLinecap="round" strokeLinejoin="round" />
            <path d={coordsToScreenPath(BOX_BRIDGES, EXPR_HCM_LT_DAU_GIAY, false)} fill="none" stroke={PALETTE.tealAirport} strokeWidth={5.5} strokeLinecap="round" opacity={netDraw} />
            <path d={coordsToScreenPath(BOX_BRIDGES, RING_ROAD_3_HCMC, false)} fill="none" stroke={PALETTE.skyCyan} strokeWidth={5} strokeLinecap="round" opacity={netDraw} />
            <path d={coordsToScreenPath(BOX_BRIDGES, EXPR_BEN_LUC_LONG_THANH, false)} fill="none" stroke={PALETTE.mist} strokeWidth={4.2} strokeDasharray="10 6" opacity={netDraw} />
            <path d={coordsToScreenPath(BOX_BRIDGES, EXPR_BIEN_HOA_VUNG_TAU, false)} fill="none" stroke={PALETTE.lateriteAmber} strokeWidth={4.5} opacity={netDraw} />
          </svg>
        </>
      }
      overlayChildren={
        <>
          {/* True 3D Elevated River Bridges with shore abutment ramps on BOTH dry riverbanks + piers in open water */}
          <Bridge3DExtrusion
            coords={CAU_LONG_THANH_SPAN}
            box={BOX_BRIDGES}
            project={proj}
            deckZ={26}
            pierCount={12}
            reveal={Math.min(1, netDraw * 1.4)}
            deckColor="#FFFFFF"
            glowColor={PALETTE.goldCaution}
          />
          <Bridge3DExtrusion
            coords={CAU_NHON_TRACH_SPAN}
            box={BOX_BRIDGES}
            project={proj}
            deckZ={26}
            pierCount={12}
            reveal={Math.min(1, netDraw * 1.4)}
            deckColor="#FFFFFF"
            glowColor={PALETTE.coralAlert}
          />

          {/* Crisp non-overlapping compact corridor callouts */}
          <svg width={1920} height={1080} style={{ position: "absolute", inset: 0, pointerEvents: "none" }}>
            <CompactGeoPin coord={[106.866, 10.786]} box={BOX_BRIDGES} project={proj} label="Cầu Long Thành (CT.01)" tag="4 → 8–10 LÀN + ĐƠN NGUYÊN MỚI" color={PALETTE.goldCaution} offset={[-18, -78]} />
            <CompactGeoPin coord={[106.836, 10.770]} box={BOX_BRIDGES} project={proj} label="Cầu Nhơn Trạch (VĐ3)" tag="KHÉP VÀNH ĐAI 3 VƯỢT SÔNG" color={PALETTE.coralAlert} offset={[-34, 24]} />
            <CompactGeoPin coord={[106.76, 10.66]} box={BOX_BRIDGES} project={proj} label="Bến Lức – Long Thành" tag="ĐÓN THẲNG MIỀN TÂY" color={PALETTE.mist} offset={[-30, -28]} reveal={netDraw} />
            <CompactGeoPin coord={[107.01, 10.72]} box={BOX_BRIDGES} project={proj} label="Biên Hòa – Vũng Tàu" color={PALETTE.lateriteAmber} offset={[22, 16]} reveal={netDraw} />
          </svg>

          <SceneHeaderPill badge="17 • MỞ KHÓA 4 HƯỚNG CAO TỐC & CẦU" title="Phá thế độc đạo 4 làn qua sông Đồng Nai bằng 4 trục cao tốc" accent={PALETTE.goldCaution} />

          <KpiMetricCard
            left={SAFE_X}
            top={126}
            width={435}
            value="4 trục phá kẹt"
            label="MẠNG ĐƯỜNG BỘ VƯỢT SÔNG ĐỒNG NAI"
            sublabel="CT.01 (8–10 làn + cầu Long Thành mới) • VĐ3 (cầu Nhơn Trạch) • Bến Lức – LT • Biên Hòa – VT."
            accent={PALETTE.coralAlert}
          />

          <EvidencePhotoCard
            photo={REAL_PHOTOS.hcm_lt_expressway}
            left={1920 - SAFE_X - 440}
            top={126}
            width={440}
            height={280}
            accentColor={PALETTE.goldCaution}
            anchorPoint={[pax, pay]}
            appearAtSec={1.0}
          />

          <VietnamMiniLocator targetLonLat={[106.86, 10.78]} label="SÔNG ĐỒNG NAI" accent={PALETTE.goldCaution} right={SAFE_X} bottom={112} />
        </>
      }
    />
  );
};
