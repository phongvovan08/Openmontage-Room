import React from "react";
import { interpolate, spring, useCurrentFrame, useVideoConfig } from "remotion";
import { ANCHORS, OLD_CORRIDOR_48KM } from "../data/haiphongHydroData";
import { REAL_PHOTOS } from "../data/realPhotosManifest";
import {
  boxAround,
  boxOfBounds,
  coordsToScreenPath,
  interpolateCameraBox,
  lonLatToScreen,
  screenPolylineLength,
} from "../mapMath";
import { formatVnNumber, FONTS, PALETTE, SAFE_X, SAFE_Y } from "../theme";
import { EvidencePhotoCard } from "./EvidencePhotoCard";
import {
  HaiPhongEstuaryLayer,
  HydroGraticule,
  NationalWorldLayer,
  RealSatelliteBasemap,
} from "./HydroBaseLayers";
import { MovingVessel } from "./MovingVessel";
import { Camera3DSpec, createProjector3D, Pin3DStalk, Tactical3DStage } from "./Tactical3DKit";

export const Scene02Zoom: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps, durationInFrames, width, height } = useVideoConfig();
  const progress = frame / Math.max(1, durationInFrames - 1);
  const aspect = width / height;

  const wideBox = boxAround(106.88, 20.72, 4.4, aspect);
  const midBox = boxOfBounds(
    { west: 106.64, east: 107.06, south: 20.62, north: 20.91 },
    0.04,
    aspect
  );
  const closeBox = boxOfBounds(
    { west: 106.65, east: 107.08, south: 20.60, north: 20.91 },
    0.04,
    aspect
  );

  const box =
    progress < 0.34
      ? interpolateCameraBox(wideBox, midBox, progress / 0.34)
      : interpolateCameraBox(midBox, closeBox, (progress - 0.34) / 0.66);

  const pitchDeg = interpolate(progress, [0, 0.45, 1], [48, 55, 56], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });
  const yawDeg = interpolate(progress, [0, 1], [14, 6], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });
  const mapScale = interpolate(progress, [0, 0.45, 1], [1.56, 1.72, 1.78], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  const camSpec: Camera3DSpec = {
    width,
    height,
    pitchDeg,
    yawDeg,
    mapScale,
    ty: 96,
    persp: 1140,
    originYRatio: 0.63,
  };
  const project = createProjector3D(camSpec);

  const nationalOpacity = interpolate(progress, [0.14, 0.34], [1, 0], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });
  const estuaryOpacity = interpolate(progress, [0.12, 0.34], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  const labelReveal = spring({
    frame: frame - Math.round(durationInFrames * 0.30),
    fps,
    config: { damping: 19, stiffness: 135 },
  });

  const corridorLen = screenPolylineLength(box, OLD_CORRIDOR_48KM, width, height);
  const corridorDraw = interpolate(progress, [0.06, 0.35], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  const [scX, scY] = lonLatToScreen(box, ANCHORS.cangSongCam, width, height);
  const [lhX, lhY] = lonLatToScreen(box, ANCHORS.benLachHuyen, width, height);
  const [p0X, p0Y] = lonLatToScreen(box, ANCHORS.phaoSo0, width, height);
  const pulse = (frame % 42) / 42;
  const localSec = frame / fps;
  const feederCrawl = interpolate(localSec, [3.2, 9.8], [0.14, 0.86], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  const kmNow = 48.0 * corridorDraw;

  return (
    <Tactical3DStage
      spec={camSpec}
      horizonAccent={PALETTE.amberBright}
      compassBearingDeg={12}
      telemetryLabel="LAO SÂU VÀO CỬA SÔNG • GÓC NGHIÊNG 3D 56°"
      groundChildren={
        <>
          <RealSatelliteBasemap
            box={box}
            width={width}
            height={height}
            dim={0.02}
            showAttribution={false}
          />
          <HydroGraticule
            box={box}
            lonStep={0.1}
            latStep={0.1}
            lonRange={[106.4, 107.3]}
            latRange={[20.5, 21.1]}
            width={width}
            height={height}
          />
          {nationalOpacity > 0.01 && (
            <NationalWorldLayer
              box={box}
              width={width}
              height={height}
              showArchipelagoLabels={false}
              showSatellite={false}
              showAttribution={false}
              opacity={nationalOpacity}
            />
          )}
          {estuaryOpacity > 0.01 && (
            <HaiPhongEstuaryLayer
              box={box}
              width={width}
              height={height}
              siltOpacity={0.38}
              showSatellite={false}
              opacity={estuaryOpacity}
            />
          )}

          {/* Glowing 48 km Tortuous River Corridor */}
          <svg width={width} height={height} style={{ position: "absolute", inset: 0 }}>
            <path
              d={coordsToScreenPath(box, OLD_CORRIDOR_48KM, false, width, height)}
              fill="none"
              stroke="rgba(245, 158, 11, 0.35)"
              strokeWidth={18}
              strokeDasharray={corridorLen}
              strokeDashoffset={corridorLen * (1 - corridorDraw)}
              strokeLinecap="round"
              opacity={estuaryOpacity}
            />
            <path
              d={coordsToScreenPath(box, OLD_CORRIDOR_48KM, false, width, height)}
              fill="none"
              stroke={PALETTE.amberBright}
              strokeWidth={6}
              strokeDasharray={corridorLen}
              strokeDashoffset={corridorLen * (1 - corridorDraw)}
              strokeLinecap="round"
              opacity={estuaryOpacity}
            />

            <MovingVessel
              box={box}
              coords={OLD_CORRIDOR_48KM}
              progress={feederCrawl}
              kind="feeder"
              canvasW={width}
              canvasH={height}
              scale={1.18}
              opacity={corridorDraw > 0.2 ? 1 : 0}
              label="TÀU NHỎ BÒ QUA SÔNG HẸP"
              labelOffset={[0, -24]}
            />
          </svg>
        </>
      }
      overlayChildren={
        <>
          {/* 3D Vertical Beacons contrasting Old River Port vs New Sea Island */}
          <Pin3DStalk
            gx={scX}
            gy={scY}
            stalkZ={172}
            project={project}
            color={PALETTE.amberBright}
            kicker="ĐIỂM KẸT NỘI ĐÔ • KM 48"
            title="Cụm cảng cũ Sông Cấm"
            metric="Sâu 48 km trong đất liền"
            sub="Luồng sông quanh co, vướng cầu & đô thị"
            reveal={labelReveal}
            pulsePhase={pulse}
            align="right"
            cardWidth={332}
          />

          <Pin3DStalk
            gx={lhX}
            gy={lhY}
            stalkZ={138}
            project={project}
            color={PALETTE.tealDeep}
            kicker="CỬA NGÕ MỚI • ĐẢO CÁT HẢI"
            title="Bến nước sâu Lạch Huyện"
            metric="Vươn thẳng ra rìa biển"
            reveal={labelReveal}
            pulsePhase={(pulse + 0.5) % 1}
            align="right"
            cardWidth={318}
          />

          <Pin3DStalk
            gx={p0X}
            gy={p0Y}
            stalkZ={88}
            project={project}
            color={PALETTE.coastStroke}
            kicker="CỬA BIỂN ĐÓN TÀU"
            title="Phao số 0 (KM 0)"
            reveal={labelReveal}
            pulsePhase={pulse}
            align="left"
            cardWidth={236}
          />

          {/* Top-Left Giant Vox Metric Counter */}
          <div
            style={{
              position: "absolute",
              left: SAFE_X,
              top: 44,
              padding: "16px 24px",
              background: "linear-gradient(135deg, rgba(6, 17, 31, 0.94) 0%, rgba(15, 32, 54, 0.90) 100%)",
              borderRadius: 14,
              border: `1.5px solid ${PALETTE.amberBright}`,
              borderLeft: `7px solid ${PALETTE.amberBright}`,
              boxShadow: "0 20px 44px rgba(0,0,0,0.65)",
            }}
          >
            <div
              style={{
                fontFamily: FONTS.mono,
                fontSize: 13,
                fontWeight: 700,
                color: "#FACC15",
                letterSpacing: "0.06em",
                marginBottom: 4,
              }}
            >
              PHẦN 01 • KHOẢNG CÁCH TỪ NỘI ĐÔ RA PHAO SỐ 0
            </div>
            <div style={{ display: "flex", alignItems: "baseline", gap: 14 }}>
              <span
                style={{
                  fontFamily: FONTS.mono,
                  fontSize: 64,
                  fontWeight: 800,
                  color: PALETTE.amberBright,
                  lineHeight: 1,
                }}
              >
                {formatVnNumber(kmNow, 1)} km
              </span>
              <span
                style={{
                  fontFamily: FONTS.sans,
                  fontSize: 20,
                  fontWeight: 700,
                  color: PALETTE.textPrimary,
                }}
              >
                luồng sông hẹp &amp; cạn
              </span>
            </div>
          </div>

          {/* Real Photo Evidence (calmly docked in bottom-left) */}
          <EvidencePhotoCard
            photo={REAL_PHOTOS.chua_ve_port}
            left={SAFE_X}
            top={height - SAFE_Y - 266}
            width={436}
            height={254}
            accentColor={PALETTE.amberBright}
            anchorPoint={[project(scX, scY, 0)[0], project(scX, scY, 0)[1]]}
            appearAtSec={2.4}
          />
        </>
      }
    />
  );
};
