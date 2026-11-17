import React from "react";
import { interpolate, useCurrentFrame, useVideoConfig } from "remotion";
import { HCM_CENTER, OVERSEA_HUBS } from "../data/longThanhGeoData";
import { REAL_PHOTOS } from "../data/realPhotosManifest";
import { boxOfBounds, lonLatToScreen } from "../mapMath";
import { FONTS, PALETTE, SAFE_X } from "../theme";
import { KpiMetricCard, NationalWorldLayer } from "./AviationBaseLayers";
import { EvidencePhotoCard } from "./EvidencePhotoCard";
import { MovingAircraft } from "./MovingAircraft";
import {
  Arc3DRoute,
  CompactGeoPin,
  createProjector3D,
  HubMedallion,
  SceneHeaderPill,
  Tactical3DStage,
} from "./Tactical3DKit";

// Regional Asia-Pacific frame keeping Vietnam + Hoang Sa + Truong Sa cleanly visible in center-left, gateways in open ocean!
const BOX_APAC = boxOfBounds({ west: 93.0, south: 1.5, east: 136.5, north: 27.5 }, 0.04);

// Verified open-water / high-altitude gateway arcs with 0 land collisions over unintended archipelagos
const ARC_TO_US = [
  HCM_CENTER,
  [115.8, 19.6] as const,
  [120.2, 18.6] as const,
  OVERSEA_HUBS.LOS_ANGELES_GATEWAY,
] as const;

const ARC_TO_EU = [
  HCM_CENTER,
  [104.2, 8.2] as const,
  OVERSEA_HUBS.FRANKFURT_GATEWAY,
] as const;

export const Scene07: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps, durationInFrames } = useVideoConfig();
  const sec = frame / fps;
  const arcReveal = interpolate(sec, [4.0, 14.0], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
  const flyP = (sec * 0.10) % 1;

  const spec = {
    width: 1920,
    height: 1080,
    pitchDeg: 46,
    yawDeg: interpolate(sec, [0, durationInFrames / fps], [3, -4]),
    mapScale: 1.04,
    ty: 48,
  };
  const proj = createProjector3D(spec);

  const [hgx, hgy] = lonLatToScreen(BOX_APAC, HCM_CENTER);
  const [hx, hy] = proj(hgx, hgy, 0);

  return (
    <Tactical3DStage
      spec={spec}
      horizonAccent={PALETTE.tealAirport}
      compassBearingDeg={86}
      groundChildren={<NationalWorldLayer box={BOX_APAC} showArchipelagoLabels dim={0.06} rimColor="#F59E0B" />}
      overlayChildren={
        <>
          <Arc3DRoute coords={ARC_TO_US} box={BOX_APAC} project={proj} maxAltitudeZ={52} reveal={arcReveal} color={PALETTE.tealAirport} strokeWidth={4} />
          <Arc3DRoute coords={ARC_TO_EU} box={BOX_APAC} project={proj} maxAltitudeZ={46} reveal={arcReveal} color={PALETTE.skyCyan} strokeWidth={4} />

          <svg width={1920} height={1080} style={{ position: "absolute", inset: 0, pointerEvents: "none" }}>
            <HubMedallion cx={hx} cy={hy} glyph="✈" color={PALETTE.goldCaution} radius={20} />

            {/* Industrial & Export Cluster Pins around SE Vietnam (offset cleanly NW/W so Hoang Sa/Truong Sa stay 100% open!) */}
            <CompactGeoPin coord={HCM_CENTER} box={BOX_APAC} project={proj} label="TP.HCM • Bình Dương • Đồng Nai" tag="ĐIỆN TỬ • BÁN DẪN • THIẾT BỊ Y TẾ" color={PALETTE.goldCaution} offset={[-32, -48]} />
            <CompactGeoPin coord={OVERSEA_HUBS.LOS_ANGELES_GATEWAY} box={BOX_APAC} project={proj} label="ĐƯỜNG BAY THẲNG BẮC MỸ" tag="KHÔNG QUA TRUNG CHUYỂN HUB NGOẠI" color={PALETTE.tealAirport} offset={[-28, 78]} reveal={arcReveal} />
            <CompactGeoPin coord={OVERSEA_HUBS.FRANKFURT_GATEWAY} box={BOX_APAC} project={proj} label="ĐƯỜNG BAY THẲNG CHÂU ÂU" tag="TÀU BAY THÂN RỘNG TẦM XA" color={PALETTE.skyCyan} offset={[22, -26]} reveal={arcReveal} />

            {arcReveal > 0.6 && (
              <>
                <MovingAircraft
                  box={BOX_APAC}
                  project={proj}
                  coords={ARC_TO_US}
                  progress={flyP}
                  altitudeZ={Math.sin(flyP * Math.PI) * 52}
                  kind="widebody"
                  color={PALETTE.tealAirport}
                  scale={1.2}
                />
                <MovingAircraft
                  box={BOX_APAC}
                  project={proj}
                  coords={ARC_TO_EU}
                  progress={(flyP + 0.4) % 1}
                  altitudeZ={Math.sin(((flyP + 0.4) % 1) * Math.PI) * 46}
                  kind="widebody"
                  color={PALETTE.skyCyan}
                  scale={1.15}
                />
              </>
            )}
          </svg>

          <SceneHeaderPill badge="07 • ĐỘNG LỰC HÀNG HÓA CÔNG NGHỆ CAO" title="Chuỗi xuất khẩu triệu đô cần bay thẳng liên lục địa từ miền Nam" accent={PALETTE.tealAirport} />

          <KpiMetricCard
            left={SAFE_X}
            top={126}
            width={450}
            value="Bay thẳng Âu – Mỹ"
            label="CHUỖI CUNG ỨNG ĐÔNG NAM BỘ"
            sublabel="Bán dẫn, linh kiện điện tử & thiết bị y tế không thể chờ tàu biển nhiều tuần hay nhường khách về hub ngoại."
            accent={PALETTE.tealAirport}
          />

          <EvidencePhotoCard
            photo={REAL_PHOTOS.widebody_a380}
            left={1920 - SAFE_X - 420}
            top={126}
            width={420}
            height={266}
            accentColor={PALETTE.skyCyan}
            anchorPoint={[hx, hy]}
            appearAtSec={1.2}
          />
        </>
      }
    />
  );
};
