import React from "react";
import { interpolate, useCurrentFrame, useVideoConfig } from "remotion";
import { BIEN_HOA_CENTER, HCM_CENTER, LT_CENTER, TSN_CENTER } from "../data/longThanhGeoData";
import { boxOfBounds, lonLatToScreen } from "../mapMath";
import { FONTS, PALETTE, SAFE_X } from "../theme";
import { DongNamBoCorridorLayer, KpiMetricCard } from "./AviationBaseLayers";
import { CompactGeoPin, createProjector3D, GeoCaliperRule, RadarRangeFan, SceneHeaderPill, Tactical3DBeacon, Tactical3DStage } from "./Tactical3DKit";

const BOX_NE_AIRSPACE = boxOfBounds({ west: 106.56, south: 10.68, east: 107.18, north: 11.06 }, 0.04);

export const Scene10: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps, durationInFrames } = useVideoConfig();
  const sec = frame / fps;
  const pulse = 0.5 + 0.5 * Math.sin(sec * 3.8);
  const sweepDeg = interpolate(sec, [0, 33], [-95, -15]);

  const spec = { width: 1920, height: 1080, pitchDeg: 52, yawDeg: interpolate(sec, [0, durationInFrames / fps], [-6, 5]), mapScale: 1.04, ty: 54 };
  const proj = createProjector3D(spec);

  const [bh0, bh1] = lonLatToScreen(BOX_NE_AIRSPACE, BIEN_HOA_CENTER);
  const [bhX, bhY] = proj(bh0, bh1, 0);
  const [tsn0, tsn1] = lonLatToScreen(BOX_NE_AIRSPACE, TSN_CENTER);
  const [tsnX, tsnY] = proj(tsn0, tsn1, 0);
  const [lt0, lt1] = lonLatToScreen(BOX_NE_AIRSPACE, LT_CENTER);
  const [ltX, ltY] = proj(lt0, lt1, 0);

  return (
    <Tactical3DStage
      spec={spec}
      horizonAccent={PALETTE.lateriteAmber}
      compassBearingDeg={55}
      groundChildren={<DongNamBoCorridorLayer box={BOX_NE_AIRSPACE} dim={0.08} showRivers showAirports showRunways showZones />}
      overlayChildren={
        <>
          <svg width={1920} height={1080} style={{ position: "absolute", inset: 0, pointerEvents: "none" }}>
            <RadarRangeFan cx={bhX} cy={bhY} radii={[95, 145]} sweepDeg={sweepDeg} color={PALETTE.lateriteAmber} coneDeg={60} />
            <circle cx={bhX} cy={bhY} r={130 + pulse * 10} fill="rgba(234, 88, 12, 0.16)" stroke={PALETTE.lateriteAmber} strokeWidth={3} strokeDasharray="10 6" />
            <line x1={tsnX} y1={tsnY} x2={bhX} y2={bhY} stroke={PALETTE.coralAlert} strokeWidth={3.5} strokeDasharray="8 6" />
            <circle cx={ltX} cy={ltY} r={108} fill="rgba(45, 212, 191, 0.12)" stroke={PALETTE.tealAirport} strokeWidth={3} />

            <GeoCaliperRule
              from={HCM_CENTER}
              to={[106.84, 10.90]}
              box={BOX_NE_AIRSPACE}
              project={proj}
              label="15–25 KM ĐÔNG BẮC"
              color={PALETTE.coralAlert}
              labelOffset={[-60, -28]}
            />

            <Tactical3DBeacon box={BOX_NE_AIRSPACE} proj={proj} lonLat={BIEN_HOA_CENTER} label="Sân bay Quân sự Biên Hòa" sublabel="XUNG ĐỘT KHÔNG PHẬN QUỐC PHÒNG" color={PALETTE.lateriteAmber} heightPx={110} align="right" />
            <Tactical3DBeacon box={BOX_NE_AIRSPACE} proj={proj} lonLat={TSN_CENTER} label="Tân Sơn Nhất" color={PALETTE.coralAlert} heightPx={85} align="left" />
            <CompactGeoPin coord={[106.76, 10.89]} box={BOX_NE_AIRSPACE} project={proj} label="Thủ Đức • Dĩ An • Thuận An" tag="ĐÔ THỊ CÔNG NGHIỆP KÍN ĐẶC" color={PALETTE.coralAlert} offset={[-28, -54]} />
          </svg>

          <SceneHeaderPill badge="10 • PHÉP LOẠI TRỪ ĐÔNG BẮC" title="Vành đai 15–25 km: Kẹt bức tường đô thị & không phận Biên Hòa" accent={PALETTE.lateriteAmber} />

          <KpiMetricCard
            left={SAFE_X}
            top={126}
            width={450}
            value="Kín 5.000 ha"
            label="BỨC TƯỜNG ĐÔ THỊ ĐÔNG BẮC"
            sublabel="Thủ Đức, Dĩ An, Thuận An tới Biên Hòa đã phủ kín khu công nghiệp và dân cư."
            accent={PALETTE.coralAlert}
          />
          <KpiMetricCard
            right={SAFE_X}
            top={126}
            width={460}
            value="Biên Hòa (Quân sự)"
            label="XUNG ĐỘT BẦU TRỜI TRỌNG YẾU"
            sublabel="Đặt sân bay trong vòng 25 km sẽ đan chéo phễu bay vào vùng huấn luyện quân sự."
            accent={PALETTE.lateriteAmber}
          />
        </>
      }
    />
  );
};
