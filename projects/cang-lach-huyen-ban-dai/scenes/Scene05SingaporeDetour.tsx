import React from "react";
import { interpolate, spring, useCurrentFrame, useVideoConfig } from "remotion";
import { HAI_PHONG_COORD, HONG_KONG_COORD, SINGAPORE_COORD } from "../data/nationalMapData";
import { REAL_PHOTOS } from "../data/realPhotosManifest";
import { boxOfBounds, lonLatToScreen } from "../mapMath";
import { FONTS, PALETTE, SAFE_X } from "../theme";
import { EvidencePhotoCard } from "./EvidencePhotoCard";
import { HydroGraticule, NationalWorldLayer } from "./HydroBaseLayers";
import { Arc3DRoute, Camera3DSpec, createProjector3D, Pin3DStalk, Tactical3DStage } from "./Tactical3DKit";

const FEEDER_TO_HK = [
  HAI_PHONG_COORD,
  [107.35, 20.45],
  [107.85, 19.35],
  [108.45, 18.10],
  [110.30, 17.85],
  [112.40, 19.60],
  [113.85, 21.65],
  HONG_KONG_COORD,
] as const;

const FEEDER_TO_SGP = [
  HAI_PHONG_COORD,
  [107.60, 19.65],
  [109.40, 17.10],
  [110.65, 14.20],
  [110.35, 10.60],
  [108.15, 7.10],
  [105.35, 3.20],
  [104.25, 1.32],
  SINGAPORE_COORD,
] as const;

const MOTHER_FROM_HK = [
  HONG_KONG_COORD,
  [116.20, 21.65],
  [119.20, 21.30],
  [121.35, 21.45],
  [124.50, 21.85],
] as const;

const MOTHER_FROM_SGP = [
  SINGAPORE_COORD,
  [103.50, 1.18],
  [102.25, 1.82],
  [100.95, 2.85],
  [99.65, 4.25],
  [97.80, 5.65],
  [95.20, 6.25],
] as const;

export const Scene05SingaporeDetour: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps, durationInFrames, width, height } = useVideoConfig();
  const progress = frame / Math.max(1, durationInFrames - 1);

  const camSpec: Camera3DSpec = {
    width,
    height,
    pitchDeg: interpolate(progress, [0, 1], [48.5, 51.0], { extrapolateLeft: "clamp", extrapolateRight: "clamp" }),
    yawDeg: interpolate(progress, [0, 1], [-8, -2], { extrapolateLeft: "clamp", extrapolateRight: "clamp" }),
    mapScale: 1.50,
    ty: 46,
    persp: 1180,
    originYRatio: 0.59,
  };
  const project = createProjector3D(camSpec);

  const box = boxOfBounds({ west: 90.0, east: 124.5, south: -4.8, north: 24.5 }, 0.02, width / height);

  const feederProgress = interpolate(progress, [0.05, 0.38], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
  const motherProgress = interpolate(progress, [0.30, 0.62], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });

  const cardIn = spring({ frame: frame - 5, fps, config: { damping: 19, stiffness: 135 } });
  const factoryIn = spring({ frame: frame - Math.round(durationInFrames * 0.14), fps, config: { damping: 18, stiffness: 135 } });
  const pulse = (frame % 42) / 42;

  const [hpX, hpY] = lonLatToScreen(box, HAI_PHONG_COORD, width, height);
  const [hkX, hkY] = lonLatToScreen(box, HONG_KONG_COORD, width, height);
  const [sgX, sgY] = lonLatToScreen(box, SINGAPORE_COORD, width, height);

  return (
    <Tactical3DStage
      spec={camSpec}
      horizonAccent={PALETTE.amberBright}
      compassBearingDeg={165}
      groundChildren={
        <>
          <HydroGraticule box={box} lonStep={5} latStep={5} lonRange={[90, 125]} latRange={[0, 25]} width={width} height={height} />
          <NationalWorldLayer box={box} width={width} height={height} showArchipelagoLabels showAttribution={false} />
        </>
      }
      overlayChildren={
        <>
          <Arc3DRoute
            coords={FEEDER_TO_HK}
            box={box}
            project={project}
            maxAltitudeZ={56}
            reveal={feederProgress}
            color={PALETTE.amberBright}
            capsuleProgress={interpolate(progress, [0.06, 0.85], [0.1, 0.94], { extrapolateLeft: "clamp", extrapolateRight: "clamp" })}
          />
          <Arc3DRoute
            coords={FEEDER_TO_SGP}
            box={box}
            project={project}
            maxAltitudeZ={68}
            reveal={feederProgress}
            color={PALETTE.amberBright}
            capsuleProgress={interpolate(progress, [0.06, 0.92], [0.08, 0.94], { extrapolateLeft: "clamp", extrapolateRight: "clamp" })}
            capsuleLabel="TÀU FEEDER GOM HÀNG"
          />
          <Arc3DRoute
            coords={MOTHER_FROM_HK}
            box={box}
            project={project}
            maxAltitudeZ={58}
            reveal={motherProgress}
            color={PALETTE.tealDeep}
            capsuleProgress={Math.min(0.95, motherProgress * 1.12 + 0.16)}
            capsuleLabel="ĐI MỸ – CHÂU ÂU →"
          />
          <Arc3DRoute
            coords={MOTHER_FROM_SGP}
            box={box}
            project={project}
            maxAltitudeZ={58}
            reveal={motherProgress}
            color={PALETTE.tealDeep}
            capsuleProgress={motherProgress}
          />

          <Pin3DStalk
            gx={hpX}
            gy={hpY}
            stalkZ={154}
            project={project}
            color={PALETTE.amberBright}
            kicker="BẮC NINH • THÁI NGUYÊN • HẢI DƯƠNG"
            title="Hải Phòng (Sông Cấm)"
            sub="Hàng công nghiệp phải đi tàu nhỏ"
            reveal={cardIn}
            pulsePhase={pulse}
            align="left"
            cardWidth={336}
          />
          <Pin3DStalk
            gx={hkX}
            gy={hkY}
            stalkZ={94}
            project={project}
            color={PALETTE.coastStroke}
            kicker="GHÉP CHUYẾN PHỤ"
            title="Hồng Kông"
            reveal={motherProgress}
            pulsePhase={(pulse + 0.3) % 1}
            align="right"
            cardWidth={248}
          />
          <Pin3DStalk
            gx={sgX}
            gy={sgY}
            stalkZ={114}
            project={project}
            color={PALETTE.coralWarn}
            kicker="CẢNG TRUNG CHUYỂN (2.600 KM)"
            title="Singapore"
            metric="Bốc dỡ xuống bãi → Chờ tàu mẹ"
            reveal={feederProgress}
            pulsePhase={(pulse + 0.65) % 1}
            align="right"
            cardWidth={340}
          />

          {/* Top-Left Penalty Cost Banner */}
          <div
            style={{
              position: "absolute",
              left: SAFE_X,
              top: 40,
              width: 556,
              padding: "16px 22px",
              background: "linear-gradient(135deg, rgba(6, 17, 31, 0.95) 0%, rgba(15, 23, 42, 0.92) 100%)",
              borderRadius: 14,
              border: `1.5px solid ${PALETTE.coralWarn}`,
              borderLeft: `7px solid ${PALETTE.coralWarn}`,
              opacity: factoryIn,
            }}
          >
            <div style={{ fontFamily: FONTS.mono, fontSize: 13, fontWeight: 800, color: "#FB7185", marginBottom: 6 }}>
              CHƯƠNG 2.1 • CÁI GIÁ KINH TẾ CỦA LUỒNG SÔNG CẠN
            </div>
            <div style={{ fontFamily: FONTS.sans, fontSize: 27, fontWeight: 800, color: "#FFFFFF", lineHeight: 1.25 }}>
              Đi vòng <span style={{ color: PALETTE.amberBright }}>2.600 km qua Singapore</span>
            </div>
            <div style={{ display: "flex", gap: 12, marginTop: 10 }}>
              <div style={{ padding: "6px 12px", borderRadius: 7, background: "rgba(244, 63, 94, 0.22)", border: `1px solid ${PALETTE.coralWarn}`, fontFamily: FONTS.mono, fontSize: 14.5, fontWeight: 800, color: "#FDA4AF" }}>
                2 LẦN BỐC DỠ TRUNG GIAN
              </div>
              <div style={{ padding: "6px 12px", borderRadius: 7, background: "rgba(245, 158, 11, 0.2)", border: `1px solid ${PALETTE.amberBright}`, fontFamily: FONTS.mono, fontSize: 14.5, fontWeight: 800, color: "#FDE047" }}>
                +5 ĐẾN 7 NGÀY TRỄ HẸN
              </div>
            </div>
          </div>

          <EvidencePhotoCard
            photo={REAL_PHOTOS.cang_tan_vu}
            left={SAFE_X}
            top={height - 122 - 236}
            width={408}
            height={236}
            accentColor={PALETTE.amberBright}
            anchorPoint={[project(hpX, hpY, 0)[0], project(hpX, hpY, 0)[1]]}
            appearAtSec={2.4}
          />
          <EvidencePhotoCard
            photo={REAL_PHOTOS.port_of_singapore}
            left={width - SAFE_X - 408}
            top={height - 122 - 236}
            width={408}
            height={236}
            accentColor={PALETTE.coralWarn}
            anchorPoint={[project(sgX, sgY, 0)[0], project(sgX, sgY, 0)[1]]}
            appearAtSec={4.2}
          />
        </>
      }
    />
  );
};

