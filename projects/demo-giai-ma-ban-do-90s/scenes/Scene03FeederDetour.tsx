import React from "react";
import { interpolate, spring, useCurrentFrame, useVideoConfig } from "remotion";
import {
  HAI_PHONG_COORD,
  HONG_KONG_COORD,
  SINGAPORE_COORD,
} from "../data/nationalMapData";
import { REAL_PHOTOS } from "../data/realPhotosManifest";
import { boxOfBounds, lonLatToScreen } from "../mapMath";
import { FONTS, PALETTE, SAFE_X, SAFE_Y } from "../theme";
import { EvidencePhotoCard } from "./EvidencePhotoCard";
import { HydroGraticule, NationalWorldLayer } from "./HydroBaseLayers";
import { Arc3DRoute, Camera3DSpec, createProjector3D, Pin3DStalk, Tactical3DStage } from "./Tactical3DKit";

const FEEDER_TO_HK = [
  HAI_PHONG_COORD,
  [108.4, 20.1],
  [111.2, 20.9],
  HONG_KONG_COORD,
] as const;

const FEEDER_TO_SGP = [
  HAI_PHONG_COORD,
  [108.6, 17.4],
  [109.7, 12.2],
  [107.2, 6.8],
  SINGAPORE_COORD,
] as const;

const MOTHER_FROM_HK = [
  HONG_KONG_COORD,
  [118.2, 22.6],
  [123.0, 23.8],
] as const;

const MOTHER_FROM_SGP = [
  SINGAPORE_COORD,
  [99.8, 3.4],
  [95.2, 6.4],
] as const;

export const Scene03FeederDetour: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps, durationInFrames, width, height } = useVideoConfig();
  const progress = frame / Math.max(1, durationInFrames - 1);

  const pitchDeg = interpolate(progress, [0, 1], [50, 54], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });
  const yawDeg = interpolate(progress, [0, 1], [-8, -2], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  const camSpec: Camera3DSpec = {
    width,
    height,
    pitchDeg,
    yawDeg,
    mapScale: 1.52,
    ty: 52,
    persp: 1180,
    originYRatio: 0.60,
  };
  const project = createProjector3D(camSpec);

  // Shift geographic center slightly west & south so Singapore sits high above the subtitle bar!
  const box = boxOfBounds(
    { west: 90.0, east: 124.5, south: -4.8, north: 24.5 },
    0.02,
    width / height
  );

  const feederProgress = interpolate(progress, [0.04, 0.42], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });
  const motherProgress = interpolate(progress, [0.30, 0.62], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  const cardIn = spring({
    frame: frame - 5,
    fps,
    config: { damping: 19, stiffness: 135 },
  });
  const pulse = (frame % 42) / 42;

  const [hpX, hpY] = lonLatToScreen(box, HAI_PHONG_COORD, width, height);
  const [hkX, hkY] = lonLatToScreen(box, HONG_KONG_COORD, width, height);
  const [sgX, sgY] = lonLatToScreen(box, SINGAPORE_COORD, width, height);

  return (
    <Tactical3DStage
      spec={camSpec}
      horizonAccent={PALETTE.amberBright}
      compassBearingDeg={165}
      telemetryLabel="MẠNG LƯỚI TRUNG CHUYỂN 3D • ĐÔNG NAM Á"
      groundChildren={
        <>
          <HydroGraticule
            box={box}
            lonStep={5}
            latStep={5}
            lonRange={[90, 125]}
            latRange={[0, 25]}
            width={width}
            height={height}
          />
          <NationalWorldLayer
            box={box}
            width={width}
            height={height}
            showArchipelagoLabels
            showAttribution={false}
          />
        </>
      }
      overlayChildren={
        <>
          {/* 3D Airborne Cargo Detour Arcs with Ocean Surface Shadows */}
          <Arc3DRoute
            coords={FEEDER_TO_HK}
            box={box}
            project={project}
            maxAltitudeZ={95}
            reveal={feederProgress}
            color={PALETTE.amberBright}
            capsuleProgress={interpolate(progress, [0.06, 0.78], [0.1, 0.94], {
              extrapolateLeft: "clamp",
              extrapolateRight: "clamp",
            })}
          />
          <Arc3DRoute
            coords={FEEDER_TO_SGP}
            box={box}
            project={project}
            maxAltitudeZ={160}
            reveal={feederProgress}
            color={PALETTE.amberBright}
            capsuleProgress={interpolate(progress, [0.06, 0.85], [0.08, 0.92], {
              extrapolateLeft: "clamp",
              extrapolateRight: "clamp",
            })}
            capsuleLabel="TÀU FEEDER GOM HÀNG"
          />

          <Arc3DRoute
            coords={MOTHER_FROM_HK}
            box={box}
            project={project}
            maxAltitudeZ={92}
            reveal={motherProgress}
            color={PALETTE.tealDeep}
            capsuleProgress={Math.min(0.95, motherProgress * 1.12 + 0.16)}
            capsuleLabel="ĐI BỜ TÂY MỸ →"
          />
          <Arc3DRoute
            coords={MOTHER_FROM_SGP}
            box={box}
            project={project}
            maxAltitudeZ={115}
            reveal={motherProgress}
            color={PALETTE.tealDeep}
            capsuleProgress={motherProgress}
          />

          {/* 3D Vertical Hub Beacons */}
          <Pin3DStalk
            gx={hpX}
            gy={hpY}
            stalkZ={148}
            project={project}
            color={PALETTE.amberBright}
            kicker="XUẤT PHÁT • CẢNG SÔNG HẸP"
            title="Hải Phòng (Sông Cấm)"
            sub="Phải chia hàng sang tàu nhỏ"
            reveal={cardIn}
            pulsePhase={pulse}
            align="left"
            cardWidth={276}
          />
          <Pin3DStalk
            gx={hkX}
            gy={hkY}
            stalkZ={136}
            project={project}
            color={PALETTE.tealDeep}
            kicker="CẢNG TRUNG CHUYỂN 01"
            title="Hồng Kông"
            sub="Dỡ & xếp lại lên siêu tàu mẹ"
            reveal={cardIn}
            pulsePhase={(pulse + 0.35) % 1}
            align="right"
            cardWidth={256}
          />
          <Pin3DStalk
            gx={sgX}
            gy={sgY}
            stalkZ={118}
            project={project}
            color={PALETTE.tealDeep}
            kicker="CẢNG TRUNG CHUYỂN 02"
            title="Singapore (~2.600 km)"
            sub="Ghép chuyến đi Mỹ & châu Âu"
            reveal={cardIn}
            pulsePhase={(pulse + 0.65) % 1}
            align="right"
            cardWidth={286}
          />

          {/* Left-Side High-Impact Penalty Stack (Vox Infographic Style) */}
          <div
            style={{
              position: "absolute",
              left: SAFE_X,
              top: 44,
              width: 536,
              display: "flex",
              flexDirection: "column",
              gap: 16,
              opacity: cardIn,
              transform: `translateX(${(1 - cardIn) * -22}px)`,
            }}
          >
            <div
              style={{
                padding: "18px 24px",
                background: "linear-gradient(135deg, rgba(6, 17, 31, 0.96) 0%, rgba(28, 16, 36, 0.92) 100%)",
                borderRadius: 14,
                border: `1.5px solid ${PALETTE.coralWarn}`,
                borderLeft: `7px solid ${PALETTE.coralWarn}`,
                boxShadow: "0 20px 44px rgba(0,0,0,0.68)",
              }}
            >
              <div style={{ fontFamily: FONTS.mono, fontSize: 13, fontWeight: 700, color: "#FACC15", marginBottom: 6 }}>
                PHẦN 01 • CÁI GIÁ CỦA VIỆC GHÉP TÀU TRUNG CHUYỂN
              </div>
              <div style={{ fontFamily: FONTS.sans, fontSize: 30, fontWeight: 800, color: "#FFFFFF", lineHeight: 1.2, marginBottom: 14 }}>
                Hàng miền Bắc phải đi vòng hàng nghìn hải lý
              </div>

              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
                <div
                  style={{
                    padding: "12px 14px",
                    borderRadius: 10,
                    background: "rgba(244, 63, 94, 0.16)",
                    border: `1px solid ${PALETTE.coralWarn}`,
                  }}
                >
                  <div style={{ fontFamily: FONTS.mono, fontSize: 32, fontWeight: 800, color: PALETTE.coralWarn }}>
                    2 CHẶNG
                  </div>
                  <div style={{ fontFamily: FONTS.sans, fontSize: 14.5, fontWeight: 600, color: "#E2E8F0", marginTop: 2 }}>
                    Bốc dỡ trung gian đội phí THC
                  </div>
                </div>
                <div
                  style={{
                    padding: "12px 14px",
                    borderRadius: 10,
                    background: "rgba(245, 158, 11, 0.16)",
                    border: `1px solid ${PALETTE.amberBright}`,
                  }}
                >
                  <div style={{ fontFamily: FONTS.mono, fontSize: 32, fontWeight: 800, color: PALETTE.amberBright }}>
                    +5–7 NGÀY
                  </div>
                  <div style={{ fontFamily: FONTS.sans, fontSize: 14.5, fontWeight: 600, color: "#E2E8F0", marginTop: 2 }}>
                    Chờ nối chuyến tàu mẹ quốc tế
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Docked Feeder Ship Photo Card (calmly docked, no zoom) */}
          <EvidencePhotoCard
            photo={REAL_PHOTOS.cang_tan_vu}
            left={SAFE_X}
            top={height - SAFE_Y - 268}
            width={456}
            height={256}
            accentColor={PALETTE.amberBright}
            anchorPoint={[project(hpX, hpY, 0)[0], project(hpX, hpY, 0)[1]]}
            appearAtSec={0.2}
          />
        </>
      }
    />
  );
};
