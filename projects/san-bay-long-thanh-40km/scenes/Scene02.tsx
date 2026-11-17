import React from "react";
import { interpolate, useCurrentFrame, useVideoConfig } from "remotion";
import { TSN_CENTER, TSN_PERIMETER_791HA, TSN_RUNWAY_25L, TSN_RUNWAY_25R, TSN_TERMINAL_T3 } from "../data/longThanhGeoData";
import { REAL_PHOTOS } from "../data/realPhotosManifest";
import { boxOfBounds, coordsToScreenPath, lonLatToScreen } from "../mapMath";
import { FONTS, PALETTE, SAFE_X } from "../theme";
import { KpiMetricCard, RealSatelliteBasemap, VietnamMiniLocator } from "./AviationBaseLayers";
import { EvidencePhotoCard } from "./EvidencePhotoCard";
import { OfficialDocCallout } from "./OfficialDocCallout";
import { CompactGeoPin, createProjector3D, SceneHeaderPill, Tactical3DBeacon, Tactical3DStage } from "./Tactical3DKit";

const BOX_TSN = boxOfBounds({ west: 106.618, south: 10.793, east: 106.695, north: 10.842 }, 0.04);

export const Scene02: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps, durationInFrames } = useVideoConfig();
  const sec = frame / fps;
  const yaw = interpolate(sec, [0, durationInFrames / fps], [-9, 7]);
  const perimDraw = interpolate(sec, [1.2, 6.0], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });

  const spec = { width: 1920, height: 1080, pitchDeg: 52, yawDeg: yaw, mapScale: 1.06, ty: 56 };
  const proj = createProjector3D(spec);
  const [anchorX, anchorY] = lonLatToScreen(BOX_TSN, TSN_CENTER);
  const [projAx, projAy] = proj(anchorX, anchorY, 0);

  return (
    <Tactical3DStage
      spec={spec}
      horizonAccent={PALETTE.coralAlert}
      compassBearingDeg={250}
      groundChildren={
        <>
          <RealSatelliteBasemap box={BOX_TSN} dim={0.04} />
          <svg width={1920} height={1080} style={{ position: "absolute", inset: 0, pointerEvents: "none" }}>
            <path
              d={coordsToScreenPath(BOX_TSN, TSN_PERIMETER_791HA, true)}
              fill="rgba(244, 63, 94, 0.16)"
              stroke={PALETTE.coralAlert}
              strokeOpacity={0.32}
              strokeWidth={10}
              pathLength={1}
              strokeDasharray="1"
              strokeDashoffset={1 - perimDraw}
            />
            <path
              d={coordsToScreenPath(BOX_TSN, TSN_PERIMETER_791HA, true)}
              fill="none"
              stroke={PALETTE.coralAlert}
              strokeWidth={3.5}
              pathLength={1}
              strokeDasharray="1"
              strokeDashoffset={1 - perimDraw}
            />
            <path d={coordsToScreenPath(BOX_TSN, TSN_TERMINAL_T3, true)} fill="rgba(250, 204, 21, 0.28)" stroke={PALETTE.goldCaution} strokeWidth={2.5} />
            <path d={coordsToScreenPath(BOX_TSN, TSN_RUNWAY_25R, false)} stroke={PALETTE.skyCyan} strokeWidth={4.5} />
            <path d={coordsToScreenPath(BOX_TSN, TSN_RUNWAY_25L, false)} stroke={PALETTE.skyCyan} strokeWidth={4.5} />
          </svg>
        </>
      }
      overlayChildren={
        <>
          <svg width={1920} height={1080} style={{ position: "absolute", inset: 0, pointerEvents: "none" }}>
            <Tactical3DBeacon box={BOX_TSN} proj={proj} lonLat={TSN_CENTER} label="Tân Sơn Nhất (~791 ha)" sublabel="ỐC ĐẢO GIỮA 4 BỀ PHỐ" color={PALETTE.coralAlert} heightPx={115} align="right" />
            <Tactical3DBeacon box={BOX_TSN} proj={proj} lonLat={[106.651, 10.8115]} label="Nhà ga T3" sublabel="Mặt bằng cũ" color={PALETTE.goldCaution} heightPx={78} align="left" />
            <CompactGeoPin coord={[106.664, 10.831]} box={boxOfBounds({ west: 106.618, south: 10.793, east: 106.695, north: 10.842 }, 0.04)} project={proj} label="GÒ VẤP" color={PALETTE.coralAlert} offset={[14, -22]} reveal={perimDraw} />
            <CompactGeoPin coord={[106.630, 10.818]} box={BOX_TSN} project={proj} label="TÂN BÌNH" color={PALETTE.lateriteAmber} offset={[-18, -32]} reveal={perimDraw} />
            <CompactGeoPin coord={[106.678, 10.802]} box={BOX_TSN} project={proj} label="PHÚ NHUẬN" color={PALETTE.goldCaution} offset={[18, 20]} reveal={perimDraw} />
          </svg>

          <SceneHeaderPill badge="02 • LÕI ĐÔ THỊ TÂN BÌNH" title="Từ sân bay ngoại ô 1920 đến ốc đảo 791 ha giữa phố" accent={PALETTE.coralAlert} />

          <KpiMetricCard
            left={SAFE_X}
            top={126}
            width={420}
            value="~791 ha"
            label="KHÉP KÍN KHÔNG CÒN ĐẤT RÌA"
            sublabel="Đô thị hóa bao vây trọn Tân Bình, Phú Nhuận và Gò Vấp."
            accent={PALETTE.coralAlert}
          />

          <OfficialDocCallout
            docCode="QĐ 648/QĐ-TTG"
            issuer="QUY HOẠCH CẢNG HÀNG KHÔNG TOÀN QUỐC"
            leadText="Toàn bộ ranh giới Cảng HKQT Tân Sơn Nhất hiện nay gói gọn ở quy mô"
            highlightText="khoảng 791 ha trong nội đô TP.HCM"
            trailText="không còn mặt bằng dự trữ bên ngoài."
            left={SAFE_X}
            bottom={112}
            width={560}
            appearAtSec={16.5}
            disappearAtSec={32.8}
            accentColor={PALETTE.goldCaution}
          />

          <EvidencePhotoCard
            photo={REAL_PHOTOS.tsn_apron}
            left={1920 - SAFE_X - 450}
            top={122}
            width={450}
            height={285}
            accentColor={PALETTE.coralAlert}
            anchorPoint={[projAx, projAy]}
            appearAtSec={1.0}
          />

          <VietnamMiniLocator targetLonLat={TSN_CENTER} label="TP.HCM • TSN" accent={PALETTE.coralAlert} right={SAFE_X} bottom={112} />
        </>
      }
    />
  );
};
