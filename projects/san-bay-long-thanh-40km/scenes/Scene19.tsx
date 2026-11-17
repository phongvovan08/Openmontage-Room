import React from "react";
import { interpolate, useCurrentFrame, useVideoConfig } from "remotion";
import { CAI_MEP_PORT, LT_CENTER, TSN_CENTER } from "../data/longThanhGeoData";
import { REAL_PHOTOS } from "../data/realPhotosManifest";
import { boxOfBounds, lonLatToScreen } from "../mapMath";
import { PALETTE, SAFE_X } from "../theme";
import { DongNamBoCorridorLayer, KpiMetricCard } from "./AviationBaseLayers";
import { EvidencePhotoCard } from "./EvidencePhotoCard";
import { MovingAircraft } from "./MovingAircraft";
import { Arc3DRoute, CompactGeoPin, createProjector3D, HubMedallion, projectPolyline, SceneHeaderPill, Tactical3DStage } from "./Tactical3DKit";

const BOX_TWIN = boxOfBounds({ west: 106.54, south: 10.42, east: 107.24, north: 10.98 }, 0.04);
const TSN_DOMESTIC_SPOKE = [TSN_CENTER, [106.64, 10.94] as const] as const;
const LT_INTL_ARC = [LT_CENTER, [107.18, 10.89] as const] as const;

export const Scene19: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps, durationInFrames } = useVideoConfig();
  const sec = frame / fps;
  const flyP = (sec * 0.16) % 1;
  const arcReveal = interpolate(sec, [2.0, 8.0], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });

  const spec = { width: 1920, height: 1080, pitchDeg: 50, yawDeg: interpolate(sec, [0, durationInFrames / fps], [-5, 5]), mapScale: 1.05, ty: 54 };
  const proj = createProjector3D(spec);

  const [tsn0, tsn1] = lonLatToScreen(BOX_TWIN, TSN_CENTER);
  const [tsnX, tsnY] = proj(tsn0, tsn1, 0);
  const [lt0, lt1] = lonLatToScreen(BOX_TWIN, LT_CENTER);
  const [ltX, ltY] = proj(lt0, lt1, 0);
  const [cm0, cm1] = lonLatToScreen(BOX_TWIN, CAI_MEP_PORT);
  const [cmX, cmY] = proj(cm0, cm1, 0);

  const triD = projectPolyline(BOX_TWIN, proj, [TSN_CENTER, LT_CENTER, CAI_MEP_PORT, TSN_CENTER]);

  return (
    <Tactical3DStage
      spec={spec}
      horizonAccent={PALETTE.tealAirport}
      compassBearingDeg={98}
      groundChildren={<DongNamBoCorridorLayer box={BOX_TWIN} dim={0.08} showRivers showAirports showRoads showRail />}
      overlayChildren={
        <>
          <Arc3DRoute coords={TSN_DOMESTIC_SPOKE} box={BOX_TWIN} project={proj} maxAltitudeZ={38} reveal={arcReveal} color={PALETTE.coralAlert} strokeWidth={3.5} />
          <Arc3DRoute coords={LT_INTL_ARC} box={BOX_TWIN} project={proj} maxAltitudeZ={56} reveal={arcReveal} color={PALETTE.tealAirport} strokeWidth={4} />

          <svg width={1920} height={1080} style={{ position: "absolute", inset: 0, pointerEvents: "none" }}>
            <path d={triD} fill="rgba(45, 212, 191, 0.12)" stroke={PALETTE.tealAirport} strokeWidth={3.5} strokeDasharray="10 6" />
            <HubMedallion cx={tsnX} cy={tsnY} glyph="✈" color={PALETTE.coralAlert} radius={18} />
            <HubMedallion cx={ltX} cy={ltY} glyph="✈" color={PALETTE.tealAirport} radius={22} />
            <HubMedallion cx={cmX} cy={cmY} glyph="⚓" color={PALETTE.skyCyan} radius={19} />

            <MovingAircraft box={BOX_TWIN} project={proj} coords={TSN_DOMESTIC_SPOKE} progress={flyP} altitudeZ={Math.sin(flyP * Math.PI) * 38} kind="narrowbody" color={PALETTE.coralAlert} scale={1.1} />
            <MovingAircraft box={BOX_TWIN} project={proj} coords={LT_INTL_ARC} progress={(flyP + 0.35) % 1} altitudeZ={Math.sin(((flyP + 0.35) % 1) * Math.PI) * 56} kind="widebody" color={PALETTE.tealAirport} scale={1.25} />

            <CompactGeoPin coord={CAI_MEP_PORT} box={BOX_TWIN} project={proj} label="Cái Mép – Thị Vải" tag="CỬA NGÕ HÀNG HẢI ~30–35 KM" color={PALETTE.skyCyan} offset={[-28, 36]} />
          </svg>

          <SceneHeaderPill badge="19 • MÔ HÌNH CẶP SÂN BAY SONG HÀNH" title="Tân Sơn Nhất 50 tr nội vùng — Long Thành 100 tr xuyên lục địa" accent={PALETTE.tealAirport} />

          <KpiMetricCard
            left={SAFE_X}
            top={126}
            width={450}
            value="~50 triệu HK"
            label="TÂN SƠN NHẤT • NỘI ĐỊA & ASEAN NGẮN"
            sublabel="Giống Haneda (Tokyo) / Gimpo (Seoul) giữ đường bay mật độ cao sát trung tâm."
            accent={PALETTE.coralAlert}
          />
          <KpiMetricCard
            left={SAFE_X}
            top={332}
            width={450}
            value="100 triệu HK"
            label="LONG THÀNH • XUYÊN LỤC ĐỊA 400 GHẾ"
            sublabel="Giống Narita / Incheon gánh tàu bay thân rộng tầm xa + trung tâm hàng hóa + Cái Mép."
            accent={PALETTE.tealAirport}
          />

          {/* Verified real Phú Mỹ / Thị Vải - Cái Mép port photo */}
          <EvidencePhotoCard
            photo={REAL_PHOTOS.cai_mep_port}
            left={1920 - SAFE_X - 460}
            top={126}
            width={460}
            height={300}
            accentColor={PALETTE.skyCyan}
            anchorPoint={[cmX, cmY]}
            appearAtSec={1.0}
          />
        </>
      }
    />
  );
};
