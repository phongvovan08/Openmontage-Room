import React from "react";
import { interpolate, spring, useCurrentFrame, useVideoConfig } from "remotion";
import { ANCHORS } from "../data/haiphongHydroData";
import { REAL_PHOTOS } from "../data/realPhotosManifest";
import { boxOfBounds, lonLatToScreen } from "../mapMath";
import { FONTS, PALETTE, SAFE_X, SAFE_Y } from "../theme";
import { EvidencePhotoCard } from "./EvidencePhotoCard";
import { HaiPhongEstuaryLayer, HydroGraticule, RealSatelliteBasemap } from "./HydroBaseLayers";
import { Camera3DSpec, createProjector3D, Pin3DStalk, Tactical3DStage } from "./Tactical3DKit";

export const Scene04PinLabel: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps, durationInFrames, width, height } = useVideoConfig();
  const progress = frame / Math.max(1, durationInFrames - 1);
  const localSec = frame / fps;

  const lonShift = interpolate(progress, [0, 1], [-0.01, 0.035], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });
  const box = boxOfBounds(
    {
      west: 106.64 + lonShift,
      east: 107.04 + lonShift,
      south: 20.70,
      north: 20.91,
    },
    0.03,
    width / height
  );

  const pitchDeg = interpolate(progress, [0, 1], [52, 55], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });
  const yawDeg = interpolate(progress, [0, 1], [-9, -3], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  const camSpec: Camera3DSpec = {
    width,
    height,
    pitchDeg,
    yawDeg,
    mapScale: 1.70,
    ty: 94,
    persp: 1140,
    originYRatio: 0.63,
  };
  const project = createProjector3D(camSpec);

  const siltPulse = interpolate(progress, [0, 0.3], [0.45, 0.92], {
    extrapolateRight: "clamp",
  });

  const pin1In = spring({
    frame: frame - Math.round(durationInFrames * 0.08),
    fps,
    config: { damping: 18, stiffness: 140 },
  });
  const pin2In = spring({
    frame: frame - Math.round(durationInFrames * 0.2),
    fps,
    config: { damping: 18, stiffness: 140 },
  });

  // Spotlight Document Sheet entrance (pops cleanly before midpoint frame 1035 / localSec=6.0s!)
  const docIn = spring({
    frame: frame - Math.round(2.4 * fps),
    fps,
    config: { damping: 17, stiffness: 135 },
  });
  const docOut =
    localSec > 7.9
      ? interpolate(localSec, [7.9, 8.25], [1, 0], {
          extrapolateLeft: "clamp",
          extrapolateRight: "clamp",
        })
      : 1;
  const docVis = docIn * docOut;
  const hiSweep = interpolate(localSec, [3.1, 4.1], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  const [scX, scY] = lonLatToScreen(box, ANCHORS.cangSongCam, width, height);
  const [ntX, ntY] = lonLatToScreen(box, ANCHORS.cuaNamTrieu, width, height);
  const pulse = (frame % 40) / 40;

  return (
    <Tactical3DStage
      spec={camSpec}
      horizonAccent={PALETTE.amberBright}
      compassBearingDeg={352}
      telemetryLabel="ĐIỀU TRA THỦY VĂN 3D • BẪY PHÙ SA CỬA SÔNG"
      groundChildren={
        <>
          <RealSatelliteBasemap
            box={box}
            width={width}
            height={height}
            dim={0.03}
            showAttribution={false}
          />
          <HydroGraticule
            box={box}
            lonStep={0.05}
            latStep={0.05}
            lonRange={[106.6, 107.1]}
            latRange={[20.68, 20.95]}
            width={width}
            height={height}
          />
          <HaiPhongEstuaryLayer
            box={box}
            width={width}
            height={height}
            siltOpacity={siltPulse}
            showSatellite={false}
          />
        </>
      }
      overlayChildren={
        <>
          {/* Top-Left Story Chapter Header */}
          <div
            style={{
              position: "absolute",
              left: SAFE_X,
              top: 42,
              padding: "12px 20px",
              background: "rgba(6, 17, 31, 0.94)",
              borderRadius: 10,
              border: `1.5px solid ${PALETTE.amberBright}`,
              borderLeft: `6px solid ${PALETTE.amberBright}`,
            }}
          >
            <div style={{ fontFamily: FONTS.mono, fontSize: 13, fontWeight: 700, color: "#FACC15" }}>
              PHẦN 02 • CÁI BẪY PHÙ SA BỒI LẤP HÀNG NĂM
            </div>
            <div style={{ fontFamily: FONTS.sans, fontSize: 24, fontWeight: 800, color: "#FFFFFF", marginTop: 2 }}>
              Phù sa sông Thái Bình &amp; Bạch Đằng khóa chặt cửa biển
            </div>
          </div>

          {/* 3D Vertical Stalk 1: Song Cam Bottleneck */}
          <Pin3DStalk
            gx={scX}
            gy={scY}
            stalkZ={166}
            project={project}
            color={PALETTE.amberBright}
            kicker="ĐIỂM NGHẼN 01 • KM38 → KM48"
            title="Luồng Sông Cấm nội đô"
            metric="Rộng 80 m | Sâu -7,0 m"
            reveal={pin1In}
            pulsePhase={pulse}
            align="right"
            cardWidth={348}
          />

          {/* 3D Vertical Stalk 2: Nam Trieu Silt Bar */}
          <Pin3DStalk
            gx={ntX}
            gy={ntY}
            stalkZ={122}
            project={project}
            color={PALETTE.coralWarn}
            kicker="ĐIỂM NGHẼN 02 • CỬA NAM TRIỆU"
            title="Bãi cạn phù sa bồi lấp mạnh"
            metric="Chỉ còn -0,5 m → -3,7 m"
            sub="Sau mỗi mùa mưa lũ miền Bắc"
            reveal={pin2In}
            pulsePhase={(pulse + 0.45) % 1}
            align="right"
            cardWidth={352}
          />

          {/* JOHNNY HARRIS STYLE CENTER-RIGHT SPOTLIGHT GOVERNMENT DOSSIER */}
          {docVis > 0.01 && (
            <div
              style={{
                position: "absolute",
                right: SAFE_X,
                top: 156,
                width: 736,
                background: "linear-gradient(180deg, #FFFBEB 0%, #FEF3C7 100%)",
                borderRadius: 14,
                border: "2.5px solid #F59E0B",
                boxShadow: "0 30px 70px rgba(0, 0, 0, 0.82), 0 0 0 6px rgba(245, 158, 11, 0.16)",
                transform: `rotate(-1.3deg) translateY(${(1 - docVis) * 28}px) scale(${0.93 + 0.07 * docVis})`,
                opacity: docVis,
                overflow: "hidden",
                pointerEvents: "none",
              }}
            >
              {/* Dark Archive Header Bar */}
              <div
                style={{
                  padding: "12px 22px",
                  background: "#0F172A",
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                  borderBottom: "2px solid #F59E0B",
                }}
              >
                <span
                  style={{
                    fontFamily: FONTS.mono,
                    fontSize: 13.5,
                    fontWeight: 700,
                    color: "#FACC15",
                    letterSpacing: "0.06em",
                  }}
                >
                  ● THÔNG SỐ ĐỘ SÂU LUỒNG HÀNG HẢI SÔNG CẤM
                </span>
                <span
                  style={{
                    padding: "4px 10px",
                    borderRadius: 5,
                    background: "rgba(250, 204, 21, 0.18)",
                    border: "1px solid #FACC15",
                    fontFamily: FONTS.mono,
                    fontSize: 13,
                    fontWeight: 700,
                    color: "#FEF08A",
                  }}
                >
                  QĐ 1995/QĐ-CHHĐTVN
                </span>
              </div>

              {/* Paper Document Body */}
              <div style={{ padding: "20px 26px 22px 26px", position: "relative" }}>
                <div
                  style={{
                    fontFamily: FONTS.sans,
                    fontSize: 24,
                    fontWeight: 700,
                    color: "#0F172A",
                    lineHeight: 1.48,
                  }}
                >
                  “Đoạn luồng hàng hải Sông Cấm (Km38+100 – Km48+000):{" "}
                  <span
                    style={{
                      padding: "2px 8px",
                      borderRadius: 5,
                      backgroundImage: "linear-gradient(90deg, #FACC15 0%, #FDE047 100%)",
                      backgroundRepeat: "no-repeat",
                      backgroundSize: `${(hiSweep * 100).toFixed(1)}% 92%`,
                      backgroundPosition: "0 75%",
                      fontWeight: 800,
                      color: "#020611",
                    }}
                  >
                    bề rộng luồng 80 m, độ sâu đạt -7,0 m
                  </span>{" "}
                  (dải cạn ven luồng từ -6,9 m đến -6,7 m).”
                </div>

                <div
                  style={{
                    marginTop: 14,
                    borderTop: "1px dashed #CBD5E1",
                    paddingTop: 10,
                  }}
                >
                  <span style={{ fontFamily: FONTS.mono, fontSize: 14, fontWeight: 800, color: "#B45309" }}>
                    ↳ Trong khi mớn nước siêu tàu 165.000 DWT cần tới -13 m → -14 m!
                  </span>
                </div>
              </div>
            </div>
          )}

          {/* Real Photo Evidence (calmly docked in bottom-left, no zoom) */}
          <EvidencePhotoCard
            photo={REAL_PHOTOS.song_cam_2023}
            left={SAFE_X}
            top={height - SAFE_Y - 270}
            width={446}
            height={258}
            accentColor={PALETTE.amberBright}
            anchorPoint={[project(scX, scY, 0)[0], project(scX, scY, 0)[1]]}
            appearAtSec={1.2}
          />
        </>
      }
    />
  );
};
