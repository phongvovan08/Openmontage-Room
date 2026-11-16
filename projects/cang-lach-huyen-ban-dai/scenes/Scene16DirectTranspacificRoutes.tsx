import React from "react";
import { interpolate, spring, useCurrentFrame, useVideoConfig } from "remotion";
import { ANCHORS } from "../data/haiphongHydroData";
import { SINGAPORE_COORD } from "../data/nationalMapData";
import { REAL_PHOTOS } from "../data/realPhotosManifest";
import { boxOfBounds, lonLatToScreen } from "../mapMath";
import { FONTS, PALETTE, SAFE_X } from "../theme";
import { EvidencePhotoCard } from "./EvidencePhotoCard";
import { HydroGraticule, NationalWorldLayer } from "./HydroBaseLayers";
import { Arc3DRoute, Camera3DSpec, createProjector3D, Pin3DStalk, Tactical3DStage } from "./Tactical3DKit";

const LH_TO_US_WEST = [
  ANCHORS.benLachHuyen,
  [107.60, 19.75],
  [108.55, 17.50],
  [110.65, 17.25],
  [114.60, 18.85],
  [118.40, 20.45],
  [121.00, 21.05],
  [125.50, 21.65],
  [132.80, 22.75],
] as const;

const LH_TO_EU = [
  ANCHORS.benLachHuyen,
  [107.60, 19.65],
  [109.40, 17.10],
  [110.65, 14.20],
  [110.35, 10.60],
  [108.15, 7.10],
  [105.35, 3.20],
  [104.35, 1.32],
  [103.65, 1.16],
  [102.25, 1.82],
  [100.95, 2.85],
  [99.65, 4.25],
  [97.80, 5.65],
  [95.20, 6.25],
] as const;

const OLD_SGP_DETOUR = [
  ANCHORS.benLachHuyen,
  [107.60, 19.65],
  [109.40, 17.10],
  [110.65, 14.20],
  [110.35, 10.60],
  [108.15, 7.10],
  [105.35, 3.20],
  [104.25, 1.32],
  SINGAPORE_COORD,
] as const;

export const Scene16DirectTranspacificRoutes: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps, durationInFrames, width, height } = useVideoConfig();
  const progress = frame / Math.max(1, durationInFrames - 1);

  const camSpec: Camera3DSpec = {
    width,
    height,
    pitchDeg: interpolate(progress, [0, 1], [48.5, 51.0], { extrapolateLeft: "clamp", extrapolateRight: "clamp" }),
    yawDeg: interpolate(progress, [0, 1], [-8, -2], { extrapolateLeft: "clamp", extrapolateRight: "clamp" }),
    mapScale: 1.48,
    ty: 46,
    persp: 1180,
    originYRatio: 0.59,
  };
  const project = createProjector3D(camSpec);

  const box = boxOfBounds({ west: 93.0, east: 133.5, south: -1.5, north: 29.0 }, 0.02, width / height);

  const usDraw = interpolate(progress, [0.12, 0.45], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
  const euDraw = interpolate(progress, [0.22, 0.56], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
  const oldFade = interpolate(progress, [0.05, 0.35, 0.72], [0.9, 0.5, 0.25], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
  const cardIn = spring({ frame: frame - Math.round(durationInFrames * 0.24), fps, config: { damping: 18, stiffness: 135 } });

  const [lhX, lhY] = lonLatToScreen(box, ANCHORS.benLachHuyen, width, height);
  const [usX, usY] = lonLatToScreen(box, [131.8, 22.65], width, height);
  const [euX, euY] = lonLatToScreen(box, [97.8, 5.65], width, height);
  const pulse = (frame % 42) / 42;

  return (
    <Tactical3DStage
      spec={camSpec}
      horizonAccent={PALETTE.tealDeep}
      compassBearingDeg={86}
      groundChildren={
        <>
          <HydroGraticule box={box} lonStep={5} latStep={5} lonRange={[95, 135]} latRange={[0, 30]} width={width} height={height} />
          <NationalWorldLayer box={box} width={width} height={height} showArchipelagoLabels showAttribution={false} />
        </>
      }
      overlayChildren={
        <>
          {/* Dimmed old Singapore Detour Arc being replaced */}
          <g opacity={oldFade}>
            <Arc3DRoute coords={OLD_SGP_DETOUR} box={box} project={project} maxAltitudeZ={20} reveal={1} color={PALETTE.coralWarn} />
          </g>

          {/* Direct Trans-Pacific & Europe Master Routes from Cát Hải */}
          <Arc3DRoute
            coords={LH_TO_US_WEST}
            box={box}
            project={project}
            maxAltitudeZ={28}
            reveal={usDraw}
            color={PALETTE.tealDeep}
            capsuleProgress={interpolate(progress, [0.14, 0.94], [0.08, 0.50], { extrapolateLeft: "clamp", extrapolateRight: "clamp" })}
            capsuleLabel="ĐI THẲNG BỜ TÂY / ĐÔNG MỸ"
          />
          <Arc3DRoute
            coords={LH_TO_EU}
            box={box}
            project={project}
            maxAltitudeZ={26}
            reveal={euDraw}
            color="#38BDF8"
            capsuleProgress={interpolate(progress, [0.24, 0.94], [0.06, 0.94], { extrapolateLeft: "clamp", extrapolateRight: "clamp" })}
          />

          <Pin3DStalk
            gx={lhX}
            gy={lhY}
            stalkZ={154}
            project={project}
            color={PALETTE.tealDeep}
            kicker="BẮC NINH • HẢI PHÒNG • QUẢNG NINH"
            title="Lạch Huyện (Cát Hải)"
            metric="Xếp hàng thẳng lên boong tàu mẹ"
            reveal={1}
            pulsePhase={pulse}
            align="left"
            cardWidth={342}
          />
          <Pin3DStalk gx={usX} gy={usY} stalkZ={92} project={project} color={PALETTE.tealDeep} kicker="QUA EO LUZON • VƯỢT THÁI BÌNH DƯƠNG" title="Hướng thẳng Bờ Tây &amp; Đông Mỹ" reveal={usDraw} pulsePhase={(pulse + 0.3) % 1} align="left" cardWidth={292} />
          <Pin3DStalk gx={euX} gy={euY} stalkZ={88} project={project} color="#38BDF8" kicker="QUA EO MALACCA &amp; KÊNH SUEZ" title="Hướng thẳng châu Âu" reveal={euDraw} pulsePhase={(pulse + 0.65) % 1} align="right" cardWidth={268} />

          {/* Top-Left Summary Header */}
          <div
            style={{
              position: "absolute",
              left: SAFE_X,
              top: 40,
              width: 600,
              padding: "16px 24px",
              background: "linear-gradient(135deg, rgba(6, 17, 31, 0.95) 0%, rgba(13, 148, 136, 0.25) 100%)",
              borderRadius: 14,
              border: `1.5px solid ${PALETTE.tealDeep}`,
              borderLeft: `7px solid ${PALETTE.tealDeep}`,
              opacity: cardIn,
            }}
          >
            <div style={{ fontFamily: FONTS.mono, fontSize: 13, fontWeight: 800, color: PALETTE.tealDeep, marginBottom: 6 }}>
              CHƯƠNG 5.2 • VẼ LẠI BẢN ĐỒ LOGISTICS MIỀN BẮC
            </div>
            <div style={{ fontFamily: FONTS.sans, fontSize: 27, fontWeight: 800, color: "#FFFFFF", lineHeight: 1.25 }}>
              Cắt bỏ chặng ghép tàu qua Singapore
            </div>
            <div style={{ display: "flex", gap: 12, marginTop: 10 }}>
              <div style={{ padding: "6px 12px", borderRadius: 7, background: "rgba(45, 212, 191, 0.2)", border: `1px solid ${PALETTE.tealDeep}`, fontFamily: FONTS.mono, fontSize: 14, fontWeight: 800, color: "#99F6E4" }}>
                ✓ 0 LẦN CHUYỂN TẢI TRUNG GIAN
              </div>
              <div style={{ padding: "6px 12px", borderRadius: 7, background: "rgba(56, 189, 248, 0.2)", border: "1px solid #38BDF8", fontFamily: FONTS.mono, fontSize: 14, fontWeight: 800, color: "#BAE6FD" }}>
                ✓ RÚT NGẮN HÀNG TUẦN GIAO HÀNG
              </div>
            </div>
          </div>

          <EvidencePhotoCard
            photo={REAL_PHOTOS.port_of_los_angeles}
            left={width - SAFE_X - 416}
            top={676}
            width={416}
            height={240}
            accentColor={PALETTE.tealDeep}
            appearAtSec={2.2}
          />
        </>
      }
    />
  );
};
