import React from "react";
import { interpolate, useCurrentFrame, useVideoConfig } from "remotion";
import { LT_CENTER, TSN_CENTER } from "../data/longThanhGeoData";
import { boxOfBounds, CameraBox, interpolateCameraBox, lonLatToScreen } from "../mapMath";
import { PALETTE, SAFE_X } from "../theme";
import { KpiMetricCard, NationalWorldLayer } from "./AviationBaseLayers";
import { MovingAircraft } from "./MovingAircraft";
import {
  Arc3DRoute,
  CompactGeoPin,
  createProjector3D,
  GeoCaliperRule,
  HubMedallion,
  RadarRangeFan,
  SceneHeaderPill,
  Tactical3DStage,
} from "./Tactical3DKit";

const BOX_VN_FULL: CameraBox = boxOfBounds({ west: 100.2, south: 6.4, east: 118.2, north: 23.6 }, 0.04);
const BOX_SOUTH_CORRIDOR: CameraBox = boxOfBounds({ west: 106.34, south: 10.48, east: 107.28, north: 11.02 }, 0.04);
const LEAP_ROUTE = [TSN_CENTER, [106.85, 10.82] as const, LT_CENTER] as const;

export const Scene01: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps, durationInFrames } = useVideoConfig();
  const sec = frame / fps;
  const durSec = durationInFrames / fps;

  // Smooth zoom from Full Vietnam (with Hoang Sa & Truong Sa clear) -> Dong Nam Bo corridor on 3D Tactical Stage
  const zoomP = interpolate(sec, [1.8, 12.5], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
  const box = interpolateCameraBox(BOX_VN_FULL, BOX_SOUTH_CORRIDOR, zoomP);

  const spec = {
    width: 1920,
    height: 1080,
    pitchDeg: interpolate(zoomP, [0, 1], [34, 51]),
    yawDeg: interpolate(zoomP, [0, 1], [0, -7]),
    mapScale: interpolate(zoomP, [0, 1], [0.98, 1.07]),
    ty: interpolate(zoomP, [0, 1], [20, 56]),
  };
  const proj = createProjector3D(spec);

  const [tsnGx, tsnGy] = lonLatToScreen(box, TSN_CENTER);
  const [ltGx, ltGy] = lonLatToScreen(box, LT_CENTER);
  const [tsnX, tsnY] = proj(tsnGx, tsnGy, 0);
  const [ltX, ltY] = proj(ltGx, ltGy, 0);

  const arcDraw = interpolate(sec, [11.5, 16.5], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
  const caliperReveal = interpolate(sec, [14.0, 17.5], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
  const cardOp = interpolate(sec, [5.0, 6.8, durSec - 0.5, durSec], [0, 1, 1, 0], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
  const planeProg = interpolate(sec, [13.5, 29.0], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
  const sweepDeg = (sec * 55) % 360;

  return (
    <Tactical3DStage
      spec={spec}
      horizonAccent={PALETTE.skyCyan}
      compassBearingDeg={102}
      groundChildren={<NationalWorldLayer box={box} showArchipelagoLabels dim={0.04} rimColor="#F59E0B" />}
      overlayChildren={
        <>
          <Arc3DRoute coords={LEAP_ROUTE} box={box} project={proj} maxAltitudeZ={68} reveal={arcDraw} color={PALETTE.goldCaution} strokeWidth={4} />

          <svg width={1920} height={1080} style={{ position: "absolute", inset: 0, pointerEvents: "none" }}>
            {zoomP > 0.65 && (
              <>
                <RadarRangeFan cx={tsnX} cy={tsnY} radii={[38, 66]} sweepDeg={sweepDeg} color={PALETTE.coralAlert} />
                <HubMedallion cx={tsnX} cy={tsnY} glyph="✕" color={PALETTE.coralAlert} radius={18} />
                <HubMedallion cx={ltX} cy={ltY} glyph="✈" color={PALETTE.tealAirport} radius={20} />

                <GeoCaliperRule
                  from={TSN_CENTER}
                  to={LT_CENTER}
                  box={box}
                  project={proj}
                  label="~40 KM ĐƯỜNG CHIM BAY"
                  color={PALETTE.goldCaution}
                  reveal={caliperReveal}
                  labelOffset={[-36, 54]}
                />

                <CompactGeoPin
                  coord={TSN_CENTER}
                  box={box}
                  project={proj}
                  label="Tân Sơn Nhất"
                  tag="2 ĐƯỜNG BĂNG 365 M"
                  color={PALETTE.coralAlert}
                  offset={[-28, -46]}
                  reveal={zoomP}
                />
                <CompactGeoPin
                  coord={LT_CENTER}
                  box={box}
                  project={proj}
                  label="Long Thành (Đồng Nai)"
                  tag="5.000 HA • CẤP 4F"
                  color={PALETTE.tealAirport}
                  offset={[26, 26]}
                  reveal={zoomP}
                />
              </>
            )}

            {arcDraw > 0.45 && (
              <MovingAircraft
                box={box}
                project={proj}
                coords={LEAP_ROUTE}
                progress={planeProg}
                altitudeZ={Math.sin(planeProg * Math.PI) * 68}
                kind="widebody"
                color={PALETTE.goldCaution}
                scale={1.15}
              />
            )}
          </svg>

          <SceneHeaderPill badge="01 • ĐỊNH VỊ ĐỊA LÝ" title="Vì sao Long Thành phải đặt cách TP.HCM 40 km?" accent={PALETTE.skyCyan} />

          <KpiMetricCard
            right={SAFE_X}
            top={126}
            width={410}
            value="365 mét"
            label="NÚT THẮT BẦU TRỜI TÂN SƠN NHẤT"
            sublabel="Nhà ga T3 mở rộng mặt đất, nhưng hai đường băng gần nhau khóa chặt bầu trời."
            accent={PALETTE.coralAlert}
            opacity={cardOp}
          />
          <KpiMetricCard
            right={SAFE_X}
            top={318}
            width={410}
            value="5.000 ha"
            label="SIÊU CẢNG CÁCH LÕI PHỐ 40 KM"
            sublabel="Bước ra vùng đất đỏ Đồng Nai để thiết kế 4 đường băng độc lập cho 100 năm."
            accent={PALETTE.tealAirport}
            opacity={cardOp}
          />
        </>
      }
    />
  );
};
