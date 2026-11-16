import React from "react";
import { interpolate, spring, useCurrentFrame, useVideoConfig } from "remotion";
import { BREAKWATER_NE, LUONG_LACH_HUYEN, SAND_DIKE_SW } from "../data/haiphongHydroData";
import { REAL_PHOTOS } from "../data/realPhotosManifest";
import { boxOfBounds, coordsToScreenPath, interpolateCameraBox, lonLatToScreen, screenPolylineLength } from "../mapMath";
import { FONTS, PALETTE, SAFE_X } from "../theme";
import { EvidencePhotoCard } from "./EvidencePhotoCard";
import { HaiPhongEstuaryLayer, HydroGraticule, RealSatelliteBasemap } from "./HydroBaseLayers";
import { Camera3DSpec, createProjector3D, Pin3DStalk, Tactical3DStage } from "./Tactical3DKit";

const SILT_DEFLECTION_ARROWS: readonly (readonly [readonly [number, number], readonly [number, number], readonly [number, number]])[] = [
  [[106.875, 20.772], [106.912, 20.758], [106.895, 20.728]],
  [[106.888, 20.756], [106.925, 20.742], [106.908, 20.708]],
  [[106.902, 20.738], [106.940, 20.722], [106.922, 20.688]],
];

export const Scene12SandDikeShield: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps, durationInFrames, width, height } = useVideoConfig();
  const progress = frame / Math.max(1, durationInFrames - 1);

  const wideShieldBox = boxOfBounds(
    { west: 106.85, east: 107.04, south: 20.67, north: 20.82 },
    0.03,
    width / height
  );
  const macroShieldBox = boxOfBounds(
    { west: 106.885, east: 107.000, south: 20.705, north: 20.785 },
    0.03,
    width / height
  );
  const shieldZoomT = interpolate(progress, [0.16, 0.56], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });
  const box = interpolateCameraBox(wideShieldBox, macroShieldBox, shieldZoomT);

  const camSpec: Camera3DSpec = {
    width,
    height,
    pitchDeg: interpolate(progress, [0, 1], [51, 52], { extrapolateLeft: "clamp", extrapolateRight: "clamp" }),
    yawDeg: interpolate(progress, [0, 1], [-11, -5], { extrapolateLeft: "clamp", extrapolateRight: "clamp" }),
    mapScale: interpolate(progress, [0, 1], [1.68, 1.76], { extrapolateLeft: "clamp", extrapolateRight: "clamp" }),
    ty: 56,
    persp: 1180,
    originYRatio: 0.60,
  };
  const project = createProjector3D(camSpec);

  const headerIn = spring({ frame: frame - 4, fps, config: { damping: 18, stiffness: 135 } });
  const dikeDraw = interpolate(progress, [0.10, 0.36], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
  const waveDraw = interpolate(progress, [0.34, 0.62], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });

  const dikeLen = screenPolylineLength(box, SAND_DIKE_SW, width, height);
  const bwLen = screenPolylineLength(box, BREAKWATER_NE, width, height);

  const [dkX, dkY] = lonLatToScreen(box, [106.942, 20.736], width, height);
  const [bwX, bwY] = lonLatToScreen(box, [106.944, 20.761], width, height);
  const pulse = (frame % 42) / 42;
  const siltFlow = ((frame % 54) / 54);

  return (
    <Tactical3DStage
      spec={camSpec}
      horizonAccent="#FACC15"
      compassBearingDeg={136}
      groundChildren={
        <>
          <RealSatelliteBasemap box={box} width={width} height={height} dim={0.02} showAttribution={false} />
          <HydroGraticule box={box} lonStep={0.05} latStep={0.05} lonRange={[106.85, 107.05]} latRange={[20.66, 20.84]} width={width} height={height} />
          <HaiPhongEstuaryLayer box={box} width={width} height={height} siltOpacity={0.28} showSatellite={false} />

          <svg width={width} height={height} style={{ position: "absolute", inset: 0, overflow: "visible" }}>
            {/* Calm Crystal Deep Channel Between the Two Walls */}
            <path d={coordsToScreenPath(box, LUONG_LACH_HUYEN, false, width, height)} fill="none" stroke="rgba(45, 212, 191, 0.32)" strokeWidth={30} strokeLinecap="round" />
            <path d={coordsToScreenPath(box, LUONG_LACH_HUYEN, false, width, height)} fill="none" stroke="#38BDF8" strokeWidth={8} strokeLinecap="round" />

            {/* Sand-Retaining Dike SW */}
            <path d={coordsToScreenPath(box, SAND_DIKE_SW, false, width, height)} fill="none" stroke="rgba(250, 204, 21, 0.4)" strokeWidth={18} strokeDasharray={dikeLen} strokeDashoffset={dikeLen * (1 - dikeDraw)} strokeLinecap="round" />
            <path d={coordsToScreenPath(box, SAND_DIKE_SW, false, width, height)} fill="none" stroke="#FACC15" strokeWidth={7} strokeDasharray={dikeLen} strokeDashoffset={dikeLen * (1 - dikeDraw)} strokeLinecap="round" />

            {/* Breakwater NE */}
            <path d={coordsToScreenPath(box, BREAKWATER_NE, false, width, height)} fill="none" stroke="rgba(248, 250, 252, 0.35)" strokeWidth={16} strokeDasharray={bwLen} strokeDashoffset={bwLen * (1 - waveDraw)} strokeLinecap="round" />
            <path d={coordsToScreenPath(box, BREAKWATER_NE, false, width, height)} fill="none" stroke="#FFFFFF" strokeWidth={6} strokeDasharray={bwLen} strokeDashoffset={bwLen * (1 - waveDraw)} strokeLinecap="round" />
          </svg>
        </>
      }
      overlayChildren={
        <>
          {/* Deflecting Silt Current Curves & Ocean Wave Shields projected cleanly onto tilted plane */}
          <svg width={width} height={height} style={{ position: "absolute", inset: 0, pointerEvents: "none" }}>
            {dikeDraw > 0.3 &&
              SILT_DEFLECTION_ARROWS.map((pts, idx) => {
                const p0 = project(...lonLatToScreen(box, pts[0], width, height), 6);
                const p1 = project(...lonLatToScreen(box, pts[1], width, height), 6);
                const p2 = project(...lonLatToScreen(box, pts[2], width, height), 6);
                const t = (siltFlow + idx * 0.28) % 1;
                const bx = (1 - t) ** 2 * p0[0] + 2 * (1 - t) * t * p1[0] + t ** 2 * p2[0];
                const by = (1 - t) ** 2 * p0[1] + 2 * (1 - t) * t * p1[1] + t ** 2 * p2[1];
                return (
                  <g key={idx}>
                    <path
                      d={`M ${p0[0].toFixed(1)} ${p0[1].toFixed(1)} Q ${p1[0].toFixed(1)} ${p1[1].toFixed(1)} ${p2[0].toFixed(1)} ${p2[1].toFixed(1)}`}
                      fill="none"
                      stroke={PALETTE.amberBright}
                      strokeWidth={4.5}
                      strokeDasharray="10 6"
                    />
                    <circle cx={bx} cy={by} r={7.5} fill="#FACC15" stroke="#020611" strokeWidth={2} />
                  </g>
                );
              })}
          </svg>

          <Pin3DStalk
            gx={dkX}
            gy={dkY}
            stalkZ={112}
            project={project}
            color="#FACC15"
            kicker="PHÍA TÂY NAM • GIÁP CỬA NAM TRIỆU"
            title="Tuyến Đê chắn cát"
            metric="Bức tường ngầm đẩy lùi bùn phù sa"
            sub="Ngăn bùn từ sông Bạch Đằng tràn vào rãnh"
            reveal={dikeDraw}
            pulsePhase={pulse}
            align="left"
            cardWidth={352}
          />
          <Pin3DStalk
            gx={bwX}
            gy={bwY}
            stalkZ={186}
            project={project}
            color="#F8FAFC"
            kicker="PHÍA ĐÔNG BẮC • HƯỚNG VỊNH BẮC BỘ"
            title="Tuyến Đê chắn sóng"
            metric="Tạo vùng nước lặng sóng"
            sub="Che chắn gió mùa cho siêu tàu vào bến"
            reveal={waveDraw}
            pulsePhase={(pulse + 0.5) % 1}
            align="right"
            cardWidth={342}
          />

          <div
            style={{
              position: "absolute",
              left: SAFE_X,
              top: 40,
              padding: "12px 22px",
              background: "rgba(6, 17, 31, 0.94)",
              borderRadius: 12,
              border: "1.5px solid #FACC15",
              borderLeft: "7px solid #FACC15",
              opacity: headerIn,
            }}
          >
            <div style={{ fontFamily: FONTS.mono, fontSize: 13, fontWeight: 800, color: "#FACC15" }}>
              CHƯƠNG 4.2 • VŨ KHÍ BÍ MẬT NGOÀI KHƠI (VỆ TINH EOX 2024 Z14)
            </div>
            <div style={{ fontFamily: FONTS.sans, fontSize: 27, fontWeight: 800, color: "#FFFFFF", marginTop: 2 }}>
              Gọng kìm Đê chắn cát – Đê chắn sóng bảo vệ luồng Lạch Huyện
            </div>
          </div>

          <EvidencePhotoCard
            photo={REAL_PHOTOS.hict_cat_hai_ship}
            left={width - SAFE_X - 408}
            top={40}
            width={408}
            height={230}
            accentColor={PALETTE.tealDeep}
            appearAtSec={1.8}
          />
        </>
      }
    />
  );
};
