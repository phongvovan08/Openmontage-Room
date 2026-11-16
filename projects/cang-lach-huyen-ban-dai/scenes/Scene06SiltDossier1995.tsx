import React from "react";
import { interpolate, spring, useCurrentFrame, useVideoConfig } from "remotion";
import { ANCHORS } from "../data/haiphongHydroData";
import { REAL_PHOTOS } from "../data/realPhotosManifest";
import { boxOfBounds, interpolateCameraBox, lonLatToScreen } from "../mapMath";
import { FONTS, PALETTE, SAFE_X } from "../theme";
import { EvidencePhotoCard } from "./EvidencePhotoCard";
import { HaiPhongEstuaryLayer, HydroGraticule, RealSatelliteBasemap } from "./HydroBaseLayers";
import { Camera3DSpec, createProjector3D, Pin3DStalk, Tactical3DStage } from "./Tactical3DKit";

export const Scene06SiltDossier1995: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps, durationInFrames, width, height } = useVideoConfig();
  const progress = frame / Math.max(1, durationInFrames - 1);

  const macroSongCamBox = boxOfBounds(
    { west: 106.665, east: 106.795, south: 20.815, north: 20.885 },
    0.03,
    width / height
  );
  const namTrieuBox = boxOfBounds(
    { west: 106.71, east: 106.96, south: 20.725, north: 20.875 },
    0.03,
    width / height
  );
  const glideT = interpolate(progress, [0.36, 0.74], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });
  const box = interpolateCameraBox(macroSongCamBox, namTrieuBox, glideT);

  const camSpec: Camera3DSpec = {
    width,
    height,
    pitchDeg: interpolate(progress, [0, 1], [50.0, 51.5], { extrapolateLeft: "clamp", extrapolateRight: "clamp" }),
    yawDeg: interpolate(progress, [0, 1], [-8, -3], { extrapolateLeft: "clamp", extrapolateRight: "clamp" }),
    mapScale: interpolate(progress, [0, 1], [1.66, 1.70], { extrapolateLeft: "clamp", extrapolateRight: "clamp" }),
    ty: 56,
    persp: 1180,
    originYRatio: 0.60,
  };
  const project = createProjector3D(camSpec);

  const siltPulse = interpolate(progress, [0, 0.35, 1], [0.45, 0.92, 0.86], { extrapolateRight: "clamp" });
  const pin1In = spring({ frame: frame - Math.round(durationInFrames * 0.06), fps, config: { damping: 18, stiffness: 140 } });
  const pin2In = spring({ frame: frame - Math.round(durationInFrames * 0.52), fps, config: { damping: 18, stiffness: 140 } });

  const docIn = spring({ frame: frame - Math.round(durationInFrames * 0.30), fps, config: { damping: 17, stiffness: 135 } });
  const docOut =
    progress > 0.88
      ? interpolate(progress, [0.88, 0.96], [1, 0], { extrapolateLeft: "clamp", extrapolateRight: "clamp" })
      : 1;
  const docVis = docIn * docOut;
  const hiSweep = interpolate(progress, [0.38, 0.56], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });

  const [scX, scY] = lonLatToScreen(box, ANCHORS.cangSongCam, width, height);
  const [ntX, ntY] = lonLatToScreen(box, ANCHORS.cuaNamTrieu, width, height);
  const pulse = (frame % 40) / 40;

  return (
    <Tactical3DStage
      spec={camSpec}
      horizonAccent={PALETTE.amberBright}
      compassBearingDeg={352}
      groundChildren={
        <>
          <RealSatelliteBasemap box={box} width={width} height={height} dim={0.02} showAttribution={false} />
          <HydroGraticule box={box} lonStep={0.05} latStep={0.05} lonRange={[106.6, 107.1]} latRange={[20.68, 20.95]} width={width} height={height} />
          <HaiPhongEstuaryLayer box={box} width={width} height={height} siltOpacity={siltPulse} showSatellite={false} />
        </>
      }
      overlayChildren={
        <>
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
              CHƯƠNG 2.2 • THỦ PHẠM PHÙ SA SÔNG THÁI BÌNH &amp; BẠCH ĐẰNG
            </div>
            <div style={{ fontFamily: FONTS.sans, fontSize: 24, fontWeight: 800, color: "#FFFFFF", marginTop: 2 }}>
              Hồ sơ hàng hải khóa chặt cửa biển miền Bắc ở -7,0 m
            </div>
          </div>

          <Pin3DStalk
            gx={scX}
            gy={scY}
            stalkZ={166}
            project={project}
            color={PALETTE.amberBright}
            kicker="ĐIỂM NGHẼN 01 • SÔNG CẤM"
            title="Luồng Sông Cấm nội đô"
            metric="Rộng 80 m | Sâu -7,0 m"
            reveal={pin1In}
            pulsePhase={pulse}
            align="right"
            cardWidth={348}
          />
          <Pin3DStalk
            gx={ntX}
            gy={ntY}
            stalkZ={122}
            project={project}
            color={PALETTE.coralWarn}
            kicker="ĐIỂM NGHẼN 02 • CỬA NAM TRIỆU"
            title="Bãi cạn phù sa bồi lấp mạnh"
            metric="Chỉ còn -0,5 m → -3,7 m"
            sub="Triệu tấn bùn cát mỗi mùa lũ"
            reveal={pin2In}
            pulsePhase={(pulse + 0.45) % 1}
            align="right"
            cardWidth={352}
          />

          {/* Cream Archival Dossier (QĐ 1995/QĐ-CHHĐTVN) safely in sky zone top-right */}
          {docVis > 0.02 && (
            <div
              style={{
                position: "absolute",
                right: SAFE_X,
                top: 124,
                width: 650,
                background: "linear-gradient(180deg, #FFFBEB 0%, #FEF3C7 100%)",
                borderRadius: 14,
                border: `2.5px solid ${PALETTE.amberBright}`,
                boxShadow: "0 28px 64px rgba(0, 0, 0, 0.78)",
                opacity: docVis,
                transform: `translateY(${(1 - docIn) * 20}px) rotate(-0.8deg) scale(${0.94 + 0.06 * docIn})`,
                zIndex: 25,
                overflow: "hidden",
              }}
            >
              <div
                style={{
                  padding: "11px 20px",
                  background: "#0F172A",
                  borderBottom: `2px solid ${PALETTE.amberBright}`,
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                }}
              >
                <span style={{ fontFamily: FONTS.mono, fontSize: 13.5, fontWeight: 800, color: "#FACC15", letterSpacing: "0.06em" }}>
                  ● HỒ SƠ THỦY VĂN CHÍNH THỨC
                </span>
                <span
                  style={{
                    padding: "3px 10px",
                    borderRadius: 5,
                    background: "rgba(250, 204, 21, 0.2)",
                    border: "1px solid rgba(250, 204, 21, 0.6)",
                    fontFamily: FONTS.mono,
                    fontSize: 13,
                    fontWeight: 800,
                    color: "#FEF08A",
                  }}
                >
                  QĐ 1995/QĐ-CHHĐTVN
                </span>
              </div>

              <div style={{ padding: "18px 24px 20px 24px" }}>
                <div style={{ fontFamily: FONTS.mono, fontSize: 13, fontWeight: 700, color: "#64748B", marginBottom: 8 }}>
                  CẢNG VỤ HÀNG HẢI HẢI PHÒNG — THÔNG BÁO HÀNG HẢI
                </div>
                <div style={{ fontFamily: FONTS.sans, fontSize: 22.5, fontWeight: 700, color: "#0F172A", lineHeight: 1.46 }}>
                  &ldquo;Chuẩn tắc tuyến luồng hàng hải{" "}
                  <span
                    style={{
                      padding: "2px 6px",
                      borderRadius: 4,
                      fontWeight: 800,
                      color: "#090D16",
                      backgroundImage: "linear-gradient(90deg, #FACC15, #FDE047)",
                      backgroundRepeat: "no-repeat",
                      backgroundSize: `${(hiSweep * 100).toFixed(1)}% 95%`,
                    }}
                  >
                    rộng 80 m • Sông Cấm sâu -7,0 m
                  </span>{" "}
                  ; ngoài cửa Nam Triệu bãi cạn nhiều điểm chỉ còn{" "}
                  <span style={{ color: "#BE123C", fontWeight: 800 }}>-0,5 m đến -3,7 m</span>.&rdquo;
                </div>
              </div>
            </div>
          )}

          <EvidencePhotoCard
            photo={REAL_PHOTOS.song_cam_2023}
            left={SAFE_X}
            top={height - 122 - 252}
            width={436}
            height={252}
            accentColor={PALETTE.amberBright}
            anchorPoint={[project(scX, scY, 0)[0], project(scX, scY, 0)[1]]}
            appearAtSec={1.6}
          />
        </>
      }
    />
  );
};
