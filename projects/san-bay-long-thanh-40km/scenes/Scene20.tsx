import React from "react";
import { interpolate, useCurrentFrame, useVideoConfig } from "remotion";
import { HAI_PHONG_LH, LT_CENTER } from "../data/longThanhGeoData";
import { boxOfBounds, CameraBox, interpolateCameraBox, lonLatToScreen } from "../mapMath";
import { PALETTE, SAFE_X } from "../theme";
import { KpiMetricCard, NationalWorldLayer } from "./AviationBaseLayers";
import { Arc3DRoute, CompactGeoPin, createProjector3D, HubMedallion, SceneHeaderPill, Tactical3DStage } from "./Tactical3DKit";

const BOX_SOUTH_OUT: CameraBox = boxOfBounds({ west: 105.8, south: 9.8, east: 107.8, north: 11.4 }, 0.04);
const BOX_VN_FULL: CameraBox = boxOfBounds({ west: 100.2, south: 6.4, east: 118.2, north: 23.6 }, 0.04);
const SPINE_ROUTE = [HAI_PHONG_LH, [108.4, 15.8] as const, LT_CENTER] as const;

export const Scene20: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps, durationInFrames } = useVideoConfig();
  const sec = frame / fps;

  const zoomP = interpolate(sec, [1.5, 13.5], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
  const box = interpolateCameraBox(BOX_SOUTH_OUT, BOX_VN_FULL, zoomP);
  const arcReveal = interpolate(sec, [10.0, 17.5], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });

  const spec = {
    width: 1920,
    height: 1080,
    pitchDeg: interpolate(zoomP, [0, 1], [48, 32]),
    yawDeg: 0,
    mapScale: interpolate(zoomP, [0, 1], [1.04, 0.98]),
    ty: interpolate(zoomP, [0, 1], [44, 18]),
  };
  const proj = createProjector3D(spec);

  const [hp0, hp1] = lonLatToScreen(box, HAI_PHONG_LH);
  const [hpX, hpY] = proj(hp0, hp1, 0);
  const [lt0, lt1] = lonLatToScreen(box, LT_CENTER);
  const [ltX, ltY] = proj(lt0, lt1, 0);

  return (
    <Tactical3DStage
      spec={spec}
      horizonAccent={PALETTE.goldCaution}
      compassBearingDeg={0}
      groundChildren={<NationalWorldLayer box={box} showArchipelagoLabels dim={0.05} rimColor="#F59E0B" />}
      overlayChildren={
        <>
          <Arc3DRoute coords={SPINE_ROUTE} box={box} project={proj} maxAltitudeZ={48} reveal={arcReveal} color={PALETTE.goldCaution} dashed strokeWidth={4} />

          <svg width={1920} height={1080} style={{ position: "absolute", inset: 0, pointerEvents: "none" }}>
            {zoomP > 0.45 && (
              <>
                <HubMedallion cx={hpX} cy={hpY} glyph="⚓" color={PALETTE.skyCyan} radius={18} />
                {/* Offset EAST into Gulf of Tonkin so zero collision with left KPI cards! */}
                <CompactGeoPin
                  coord={HAI_PHONG_LH}
                  box={box}
                  project={proj}
                  label="Tập 1: Hải Phòng (Lạch Huyện)"
                  tag="RỜI PHÙ SA RA BIỂN SÂU"
                  color={PALETTE.skyCyan}
                  offset={[28, -22]}
                  reveal={interpolate(zoomP, [0.45, 0.85], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" })}
                />
              </>
            )}

            <HubMedallion cx={ltX} cy={ltY} glyph="✈" color={PALETTE.tealAirport} radius={19} />
            {/* Offset WEST over inland Southern corridor so QUẦN ĐẢO TRƯỜNG SA (VIỆT NAM) stays 100% unobstructed! */}
            <CompactGeoPin
              coord={LT_CENTER}
              box={box}
              project={proj}
              label="Tập 2: Long Thành (~40 km)"
              tag="RỜI LÕI PHỐ RA ĐẤT ĐỎ"
              color={PALETTE.tealAirport}
              offset={[-30, -34]}
            />
          </svg>

          <SceneHeaderPill badge="20 • BỨC TRANH HẠ TẦNG VIỆT NAM" title="Từ Lạch Huyện đến Long Thành: Tư duy bứt khỏi giới hạn cũ" accent={PALETTE.goldCaution} />

          <KpiMetricCard
            left={SAFE_X}
            top={126}
            width={480}
            value="Một quy luật địa lý"
            label="LẠCH HUYỆN ↔ LONG THÀNH"
            sublabel="Cảng biển rời phù sa ra biển sâu — Siêu sân bay rời 365 m ra đất đỏ bazan 40 km cho 100 năm tới."
            accent={PALETTE.skyCyan}
          />

          <KpiMetricCard
            left={SAFE_X}
            top={356}
            width={480}
            value="Bình chọn Tập 3"
            label="BẠN CHỌN CHỦ ĐỀ NÀO TIẾP THEO?"
            sublabel="1) Cảng nước sâu Cái Mép – Thị Vải  hoặc  2) Vì sao cao tốc miền Tây đắt và chậm hơn?"
            accent={PALETTE.goldCaution}
          />
        </>
      }
    />
  );
};
