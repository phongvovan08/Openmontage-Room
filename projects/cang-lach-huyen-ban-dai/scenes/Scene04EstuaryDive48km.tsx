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
import { formatVnNumber, FONTS, PALETTE, SAFE_X } from "../theme";
import { EvidencePhotoCard } from "./EvidencePhotoCard";
import {
  HaiPhongEstuaryLayer,
  HydroGraticule,
  NationalWorldLayer,
  RealSatelliteBasemap,
} from "./HydroBaseLayers";
import { MovingVessel } from "./MovingVessel";
import { Camera3DSpec, createProjector3D, Pin3DStalk, Tactical3DStage } from "./Tactical3DKit";

export const Scene04EstuaryDive48km: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps, durationInFrames, width, height } = useVideoConfig();
  const progress = frame / Math.max(1, durationInFrames - 1);
  const aspect = width / height;

  const wideBox = boxAround(106.88, 20.72, 4.4, aspect);
  const midBox = boxOfBounds({ west: 106.64, east: 107.06, south: 20.62, north: 20.91 }, 0.04, aspect);
  const closeBox = boxOfBounds({ west: 106.65, east: 107.08, south: 20.60, north: 20.91 }, 0.04, aspect);

  const box =
    progress < 0.28
      ? interpolateCameraBox(wideBox, midBox, progress / 0.28)
      : interpolateCameraBox(midBox, closeBox, (progress - 0.28) / 0.72);

  const pitchDeg = interpolate(progress, [0, 0.38, 1], [47, 51, 52], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
  const yawDeg = interpolate(progress, [0, 1], [14, 5], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
  const mapScale = interpolate(progress, [0, 0.38, 1], [1.52, 1.68, 1.72], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });

  const camSpec: Camera3DSpec = {
    width,
    height,
    pitchDeg,
    yawDeg,
    mapScale,
    ty: 56,
    persp: 1180,
    originYRatio: 0.60,
  };
  const project = createProjector3D(camSpec);

  const nationalOpacity = interpolate(progress, [0.10, 0.26], [1, 0], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
  const estuaryOpacity = interpolate(progress, [0.09, 0.26], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
  const labelReveal = spring({ frame: frame - Math.round(durationInFrames * 0.22), fps, config: { damping: 19, stiffness: 135 } });

  const corridorLen = screenPolylineLength(box, OLD_CORRIDOR_48KM, width, height);
  const corridorDraw = interpolate(progress, [0.05, 0.35], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });

  const [scX, scY] = lonLatToScreen(box, ANCHORS.cangSongCam, width, height);
  const [lhX, lhY] = lonLatToScreen(box, ANCHORS.benLachHuyen, width, height);
  const [p0X, p0Y] = lonLatToScreen(box, ANCHORS.phaoSo0, width, height);
  const pulse = (frame % 42) / 42;
  const feederCrawl = interpolate(progress, [0.22, 0.94], [0.10, 0.92], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
  const kmNow = 48.0 * corridorDraw;

  return (
    <Tactical3DStage
      spec={camSpec}
      horizonAccent={PALETTE.amberBright}
      compassBearingDeg={12}
      groundChildren={
        <>
          <RealSatelliteBasemap box={box} width={width} height={height} dim={0.02} showAttribution={false} />
          <HydroGraticule box={box} lonStep={0.1} latStep={0.1} lonRange={[106.4, 107.3]} latRange={[20.5, 21.1]} width={width} height={height} />
          {nationalOpacity > 0.01 && (
            <NationalWorldLayer box={box} width={width} height={height} showArchipelagoLabels={false} showSatellite={false} showAttribution={false} opacity={nationalOpacity} />
          )}
          {estuaryOpacity > 0.01 && (
            <HaiPhongEstuaryLayer box={box} width={width} height={height} siltOpacity={0.36} showSatellite={false} opacity={estuaryOpacity} />
          )}

          <svg width={width} height={height} style={{ position: "absolute", inset: 0, overflow: "visible" }}>
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
              label="TÀU NHỎ LUỒN LÁCH 48 KM"
              labelOffset={[0, 34]}
            />
          </svg>
        </>
      }
      overlayChildren={
        <>
          <Pin3DStalk
            gx={scX}
            gy={scY}
            stalkZ={172}
            project={project}
            color={PALETTE.amberBright}
            kicker="ĐIỂM KẸT NỘI ĐÔ • KM 48"
            title="Hoàng Diệu & Chùa Vẽ"
            metric="Sâu 48 km trong đất liền"
            sub="Gấp đôi cự ly các cảng hiện đại"
            reveal={labelReveal}
            pulsePhase={pulse}
            align="right"
            cardWidth={332}
          />
          <Pin3DStalk
            gx={lhX}
            gy={lhY}
            stalkZ={158}
            project={project}
            color={PALETTE.tealDeep}
            kicker="BIỂN HỞ • ĐẢO CÁT HẢI"
            title="Cửa ngõ Lạch Huyện"
            metric="Bỏ lại 28 km sông cạn"
            reveal={labelReveal}
            pulsePhase={(pulse + 0.5) % 1}
            align="right"
            cardWidth={308}
          />
          <Pin3DStalk
            gx={p0X}
            gy={p0Y}
            stalkZ={88}
            project={project}
            color={PALETTE.coastStroke}
            kicker="ĐIỂM ĐÓN TÀU"
            title="Phao số 0 (KM 0)"
            reveal={labelReveal}
            pulsePhase={pulse}
            align="left"
            cardWidth={236}
          />

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
            <div style={{ fontFamily: FONTS.mono, fontSize: 13, fontWeight: 700, color: "#FACC15", letterSpacing: "0.06em", marginBottom: 4 }}>
              CHƯƠNG 1.4 • HÀNH LANG 48,0 KM TỪ PHAO SỐ 0 VÀO SÔNG CẤM
            </div>
            <div style={{ display: "flex", alignItems: "baseline", gap: 14 }}>
              <span style={{ fontFamily: FONTS.mono, fontSize: 64, fontWeight: 800, color: PALETTE.amberBright, lineHeight: 1 }}>
                {formatVnNumber(kmNow, 1)} km
              </span>
              <span style={{ fontFamily: FONTS.sans, fontSize: 20, fontWeight: 700, color: PALETTE.textPrimary }}>
                luồng sông quanh co &amp; hẹp
              </span>
            </div>
          </div>

          <EvidencePhotoCard
            photo={REAL_PHOTOS.chua_ve_port}
            left={SAFE_X}
            top={height - 122 - 254}
            width={436}
            height={254}
            accentColor={PALETTE.amberBright}
            anchorPoint={[project(scX, scY, 0)[0], project(scX, scY, 0)[1]]}
            appearAtSec={2.2}
          />
        </>
      }
    />
  );
};
