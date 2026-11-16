import React from "react";
import { interpolate, spring, useCurrentFrame, useVideoConfig } from "remotion";
import { ANCHORS, BEN_SAU_KHO_1874 } from "../data/haiphongHydroData";
import { HAI_PHONG_COORD } from "../data/nationalMapData";
import { boxAround, boxOfBounds, interpolateCameraBox, lonLatToScreen } from "../mapMath";
import { FONTS, PALETTE, SAFE_X } from "../theme";
import { HydroGraticule, NationalWorldLayer } from "./HydroBaseLayers";
import { Arc3DRoute, Camera3DSpec, createProjector3D, Pin3DStalk, Tactical3DStage } from "./Tactical3DKit";

const GRAND_VISION_ARC = [ANCHORS.benLachHuyen, [112.5, 19.5], [118.2, 20.8]] as const;

export const Scene19GrandFinale150Years: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps, durationInFrames, width, height } = useVideoConfig();
  const progress = frame / Math.max(1, durationInFrames - 1);
  const aspect = width / height;

  // Grand sweeping pull-back from Hải Phòng / Cát Hải out across full S-shape Vietnam + East Sea with Hoàng Sa & Trường Sa clearly visible!
  const nearBox = boxAround(106.85, 20.78, 3.2, aspect);
  const wideBox = boxOfBounds({ west: 97.5, east: 121.8, south: 5.2, north: 24.4 }, 0.02, aspect);
  const box = interpolateCameraBox(nearBox, wideBox, Math.min(1, progress * 1.45));

  const camSpec: Camera3DSpec = {
    width,
    height,
    pitchDeg: interpolate(progress, [0, 1], [50.5, 48.5], { extrapolateLeft: "clamp", extrapolateRight: "clamp" }),
    yawDeg: interpolate(progress, [0, 1], [-8.5, -4.0], { extrapolateLeft: "clamp", extrapolateRight: "clamp" }),
    mapScale: interpolate(progress, [0, 1], [1.48, 1.28], { extrapolateLeft: "clamp", extrapolateRight: "clamp" }),
    ty: 20,
    persp: 1180,
    originYRatio: 0.58,
  };
  const project = createProjector3D(camSpec);

  const timelineIn = spring({ frame: frame - 8, fps, config: { damping: 18, stiffness: 135 } });
  const ctaIn = spring({ frame: frame - Math.round(durationInFrames * 0.42), fps, config: { damping: 16, stiffness: 130 } });

  const [hpX, hpY] = lonLatToScreen(box, HAI_PHONG_COORD, width, height);
  const [bskX, bskY] = lonLatToScreen(box, BEN_SAU_KHO_1874, width, height);
  const [lhX, lhY] = lonLatToScreen(box, ANCHORS.benLachHuyen, width, height);
  const pulse = (frame % 44) / 44;

  return (
    <Tactical3DStage
      spec={camSpec}
      horizonAccent={PALETTE.tealDeep}
      compassBearingDeg={138}
      groundChildren={
        <>
          <HydroGraticule box={box} lonStep={5} latStep={5} lonRange={[100, 120]} latRange={[5, 25]} width={width} height={height} />
          <NationalWorldLayer box={box} width={width} height={height} showArchipelagoLabels={progress > 0.25} showAttribution={false} />
        </>
      }
      overlayChildren={
        <>
          <Arc3DRoute
            coords={GRAND_VISION_ARC}
            box={box}
            project={project}
            maxAltitudeZ={125}
            reveal={Math.min(1, progress * 1.6)}
            color={PALETTE.tealDeep}
            capsuleProgress={interpolate(progress, [0.10, 0.94], [0.05, 0.94], { extrapolateLeft: "clamp", extrapolateRight: "clamp" })}
            capsuleLabel="VƯƠN THẲNG ĐẠI DƯƠNG →"
          />

          <Pin3DStalk gx={lhX} gy={lhY} stalkZ={148} project={project} color={PALETTE.tealDeep} kicker="1874 → 2026 (150 NĂM)" title="Hải Phòng • Cát Hải • Lạch Huyện" metric="Thấu hiểu địa lý để bước ra biển lớn" reveal={1} pulsePhase={pulse} align="left" cardWidth={378} />

          {/* Top-Left 150-Year Timeline Synthesis Bar */}
          <div
            style={{
              position: "absolute",
              left: SAFE_X,
              top: 40,
              padding: "16px 24px",
              background: "rgba(6, 17, 31, 0.94)",
              borderRadius: 14,
              border: `1.5px solid ${PALETTE.tealDeep}`,
              borderLeft: `7px solid ${PALETTE.tealDeep}`,
              opacity: timelineIn,
            }}
          >
            <div style={{ fontFamily: FONTS.mono, fontSize: 13, fontWeight: 800, color: "#FACC15", marginBottom: 6 }}>
              CHƯƠNG 5.5 • HÀNH TRÌNH 150 NĂM VƯỢT CỬA SÔNG
            </div>
            <div style={{ fontFamily: FONTS.sans, fontSize: 24, fontWeight: 800, color: "#FFFFFF" }}>
              <span style={{ color: PALETTE.amberBright }}>1874 Bến Sáu Kho</span> ➔{" "}
              <span style={{ color: "#38BDF8" }}>2017 Cầu vượt biển 5,44 km</span> ➔{" "}
              <span style={{ color: PALETTE.tealDeep }}>2026 Cửa ngõ đại dương</span>
            </div>
          </div>

          {/* Interactive Episode Poll Box kept compact at left so Mũi Cà Mau, Hoàng Sa & Trường Sa remain 100% unobstructed! */}
          <div
            style={{
              position: "absolute",
              left: SAFE_X,
              bottom: 118,
              width: 500,
              padding: "14px 18px",
              background: "linear-gradient(135deg, rgba(6, 17, 31, 0.96) 0%, rgba(13, 148, 136, 0.24) 100%)",
              borderRadius: 14,
              border: "2px solid #FACC15",
              boxShadow: "0 20px 44px rgba(0,0,0,0.8)",
              display: "flex",
              flexDirection: "column",
              gap: 10,
              opacity: ctaIn,
              transform: `translateY(${(1 - ctaIn) * 16}px)`,
            }}
          >
            <div style={{ fontFamily: FONTS.mono, fontSize: 13.5, fontWeight: 800, color: "#FACC15" }}>
              BÌNH CHỌN TẬP GIẢI MÃ BẢN ĐỒ TIẾP THEO DƯỚI BÌNH LUẬN:
            </div>
            <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
              <div style={{ padding: "8px 14px", borderRadius: 8, background: "rgba(56, 189, 248, 0.20)", border: "1.5px solid #38BDF8", fontFamily: FONTS.sans, fontSize: 17, fontWeight: 800, color: "#FFFFFF" }}>
                [1] Sân bay Long Thành cách TP.HCM 40 km — Bài toán kết nối vùng
              </div>
              <div style={{ padding: "8px 14px", borderRadius: 8, background: "rgba(245, 158, 11, 0.20)", border: `1.5px solid ${PALETTE.amberBright}`, fontFamily: FONTS.sans, fontSize: 17, fontWeight: 800, color: "#FFFFFF" }}>
                [2] Cao tốc miền Tây — Thách thức túi bùn yếu &amp; thiếu cát đắp nền
              </div>
            </div>
          </div>
        </>
      }
    />
  );
};
