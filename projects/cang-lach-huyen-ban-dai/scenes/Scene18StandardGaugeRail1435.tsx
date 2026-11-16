import React from "react";
import { interpolate, spring, useCurrentFrame, useVideoConfig } from "remotion";
import {
  ANCHORS,
  GA_NAM_HAI_PHONG,
  RAIL_1435_BRANCH_LH,
  RAIL_1435_BRANCH_NDS,
  RAIL_1435_MAINLINE,
} from "../data/haiphongHydroData";
import { HA_NOI_COORD } from "../data/nationalMapData";
import { REAL_PHOTOS } from "../data/realPhotosManifest";
import { boxOfBounds, coordsToScreenPath, interpolateCameraBox, lonLatToScreen, screenPolylineLength } from "../mapMath";
import { FONTS, PALETTE, SAFE_X } from "../theme";
import { EvidencePhotoCard } from "./EvidencePhotoCard";
import { HaiPhongEstuaryLayer, HydroGraticule, NationalWorldLayer } from "./HydroBaseLayers";
import { Camera3DSpec, createProjector3D, Pin3DStalk, Tactical3DStage } from "./Tactical3DKit";

const LAO_CAI_NODE = [103.975, 22.486] as const;

export const Scene18StandardGaugeRail1435: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps, durationInFrames, width, height } = useVideoConfig();
  const progress = frame / Math.max(1, durationInFrames - 1);

  const corridorBox = boxOfBounds({ west: 103.3, east: 107.8, south: 20.20, north: 22.85 }, 0.03, width / height);
  const macroPortRailBox = boxOfBounds({ west: 106.58, east: 107.01, south: 20.62, north: 20.89 }, 0.03, width / height);
  const diveT = interpolate(progress, [0.44, 0.78], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
  const box = interpolateCameraBox(corridorBox, macroPortRailBox, diveT);
  const estuaryOpacity = interpolate(progress, [0.54, 0.70], [0, 0.85], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });

  const camSpec: Camera3DSpec = {
    width,
    height,
    pitchDeg: interpolate(progress, [0, 1], [50.5, 51.5], { extrapolateLeft: "clamp", extrapolateRight: "clamp" }),
    yawDeg: interpolate(progress, [0, 1], [-8, -3], { extrapolateLeft: "clamp", extrapolateRight: "clamp" }),
    mapScale: interpolate(progress, [0, 1], [1.56, 1.66], { extrapolateLeft: "clamp", extrapolateRight: "clamp" }),
    ty: 56,
    persp: 1180,
    originYRatio: 0.60,
  };
  const project = createProjector3D(camSpec);

  const headerIn = spring({ frame: frame - 4, fps, config: { damping: 18, stiffness: 135 } });
  const mainDraw = interpolate(progress, [0.08, 0.42], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
  const branchDraw = interpolate(progress, [0.36, 0.64], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
  const specsIn = spring({ frame: frame - Math.round(durationInFrames * 0.34), fps, config: { damping: 18, stiffness: 135 } });
  const laoCaiReveal = mainDraw * interpolate(progress, [0.44, 0.56], [1, 0], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
  const hanoiOpacity = interpolate(progress, [0.50, 0.62], [1, 0], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });

  const mainLen = screenPolylineLength(box, RAIL_1435_MAINLINE, width, height);
  const b1Len = screenPolylineLength(box, RAIL_1435_BRANCH_LH, width, height);
  const b2Len = screenPolylineLength(box, RAIL_1435_BRANCH_NDS, width, height);

  const [lcX, lcY] = lonLatToScreen(box, LAO_CAI_NODE, width, height);
  const [hnX, hnY] = lonLatToScreen(box, HA_NOI_COORD, width, height);
  const [gaX, gaY] = lonLatToScreen(box, GA_NAM_HAI_PHONG, width, height);
  const [lhX, lhY] = lonLatToScreen(box, ANCHORS.benLachHuyen, width, height);

  const [hn2dX, hn2dY] = project(hnX, hnY, 0);
  const pulse = (frame % 42) / 42;

  // Electric rail pulse moving along Lào Cai -> Hà Nội -> Lạch Huyện
  const fullPath = [...RAIL_1435_MAINLINE, ...RAIL_1435_BRANCH_LH.slice(1)];
  const trainT = ((progress * 1.6) % 1);
  const pts2d = fullPath.map((c) => project(...lonLatToScreen(box, c, width, height), 4));
  const segF = trainT * (pts2d.length - 1);
  const sIdx = Math.min(pts2d.length - 2, Math.floor(segF));
  const u = segF - sIdx;
  const tx = pts2d[sIdx][0] + (pts2d[sIdx + 1][0] - pts2d[sIdx][0]) * u;
  const ty = pts2d[sIdx][1] + (pts2d[sIdx + 1][1] - pts2d[sIdx][1]) * u;

  return (
    <Tactical3DStage
      spec={camSpec}
      horizonAccent={PALETTE.tealDeep}
      compassBearingDeg={112}
      groundChildren={
        <>
          <HydroGraticule box={box} lonStep={1} latStep={1} lonRange={[103, 108]} latRange={[20, 23]} width={width} height={height} />
          <NationalWorldLayer box={box} width={width} height={height} showArchipelagoLabels={false} showAttribution={false} />
          {estuaryOpacity > 0.01 && (
            <HaiPhongEstuaryLayer box={box} width={width} height={height} siltOpacity={0.28} showSatellite={false} opacity={estuaryOpacity} />
          )}
          <svg width={width} height={height} style={{ position: "absolute", inset: 0, overflow: "visible" }}>
            {/* Main 1.435mm Electrified Rail Corridor */}
            <path d={coordsToScreenPath(box, RAIL_1435_MAINLINE, false, width, height)} fill="none" stroke="rgba(45, 212, 191, 0.36)" strokeWidth={18} strokeDasharray={mainLen} strokeDashoffset={mainLen * (1 - mainDraw)} strokeLinecap="round" />
            <path d={coordsToScreenPath(box, RAIL_1435_MAINLINE, false, width, height)} fill="none" stroke={PALETTE.tealDeep} strokeWidth={6} strokeDasharray={mainLen} strokeDashoffset={mainLen * (1 - mainDraw)} strokeLinecap="round" />

            {/* Two Direct Port Spurs (Lach Huyen + Nam Do Son) */}
            <path d={coordsToScreenPath(box, RAIL_1435_BRANCH_LH, false, width, height)} fill="none" stroke="#FACC15" strokeWidth={6} strokeDasharray={b1Len} strokeDashoffset={b1Len * (1 - branchDraw)} strokeLinecap="round" />
            <path d={coordsToScreenPath(box, RAIL_1435_BRANCH_NDS, false, width, height)} fill="none" stroke="#FACC15" strokeWidth={5.5} strokeDasharray={b2Len} strokeDashoffset={b2Len * (1 - branchDraw)} strokeLinecap="round" />
          </svg>
        </>
      }
      overlayChildren={
        <>
          <svg width={width} height={height} style={{ position: "absolute", inset: 0, pointerEvents: "none" }}>
            <g opacity={hanoiOpacity}>
              <circle cx={hn2dX} cy={hn2dY} r={6} fill="#FFFFFF" stroke={PALETTE.tealDeep} strokeWidth={2.5} />
              <text x={hn2dX} y={hn2dY - 14} textAnchor="middle" fill="#FFFFFF" stroke="#020611" strokeWidth={4} paintOrder="stroke" fontFamily={FONTS.sans} fontSize={16} fontWeight={800}>
                Hà Nội (Yên Viên)
              </text>
            </g>
            {mainDraw > 0.35 && (
              <g transform={`translate(${tx}, ${ty})`}>
                <circle r={13} fill="#FACC15" opacity={0.35} />
                <circle r={6.5} fill="#FFFFFF" stroke="#0D9488" strokeWidth={2.5} />
              </g>
            )}
          </svg>

          <Pin3DStalk gx={lcX} gy={lcY} stalkZ={118} project={project} color="#38BDF8" kicker="CỬA KHẨU PHÍA BẮC" title="Lào Cai" reveal={laoCaiReveal} pulsePhase={pulse} align="right" cardWidth={228} />
          <Pin3DStalk gx={gaX} gy={gaY} stalkZ={268} project={project} color="#FACC15" kicker="ĐẦU MỐI TÁCH NHÁNH" title="Ga Nam Hải Phòng" reveal={branchDraw} pulsePhase={(pulse + 0.4) % 1} align="left" cardWidth={276} />
          <Pin3DStalk gx={lhX} gy={lhY} stalkZ={46} project={project} color={PALETTE.tealDeep} kicker="NỐI THẲNG CẦU CẢNG" title="Lạch Huyện &amp; Nam Đồ Sơn" metric="Rời phụ thuộc xe đầu kéo" reveal={branchDraw} pulsePhase={(pulse + 0.7) % 1} align="left" cardWidth={342} />

          <div
            style={{
              position: "absolute",
              left: SAFE_X,
              top: 40,
              padding: "12px 22px",
              background: "rgba(6, 17, 31, 0.94)",
              borderRadius: 12,
              border: `1.5px solid ${PALETTE.tealDeep}`,
              borderLeft: `7px solid ${PALETTE.tealDeep}`,
              opacity: headerIn,
            }}
          >
            <div style={{ fontFamily: FONTS.mono, fontSize: 13, fontWeight: 800, color: PALETTE.tealDeep }}>
              CHƯƠNG 5.4 • MẢNH GHÉP SẮT THÉP CUỐI CÙNG TRÊN ĐẤT LIỀN
            </div>
            <div style={{ fontFamily: FONTS.sans, fontSize: 27, fontWeight: 800, color: "#FFFFFF", marginTop: 2 }}>
              Đường sắt điện khí hóa khổ tiêu chuẩn 1.435 mm Lào Cai – Hải Phòng
            </div>
          </div>

          <div
            style={{
              position: "absolute",
              right: SAFE_X,
              top: 38,
              width: 486,
              padding: "20px 24px",
              background: "rgba(6, 17, 31, 0.95)",
              borderRadius: 14,
              border: `2px solid ${PALETTE.tealDeep}`,
              boxShadow: "0 24px 54px rgba(0,0,0,0.75)",
              opacity: specsIn,
            }}
          >
            <div style={{ fontFamily: FONTS.mono, fontSize: 13, fontWeight: 800, color: "#FACC15", marginBottom: 10 }}>
              THÔNG SỐ KỸ THUẬT HÀNH LANG SẮT THÉP
            </div>
            {[
              { k: "Khổ đường ray", v: "1.435 mm (Chuẩn quốc tế)" },
              { k: "Động lực", v: "Điện khí hóa • Đến 160 km/h" },
              { k: "Điểm cuối", v: "Nối thẳng bãi container Lạch Huyện & Nam Đồ Sơn" },
            ].map((row, ri) => (
              <div key={ri} style={{ padding: "8px 0", borderTop: ri > 0 ? "1px solid rgba(148,163,184,0.22)" : undefined }}>
                <div style={{ fontFamily: FONTS.mono, fontSize: 12.5, color: "#94A3B8" }}>{row.k}</div>
                <div style={{ fontFamily: FONTS.sans, fontSize: 17.5, fontWeight: 700, color: "#FFFFFF" }}>{row.v}</div>
              </div>
            ))}
          </div>

          <EvidencePhotoCard
            photo={REAL_PHOTOS.ga_hai_phong}
            left={SAFE_X}
            top={684}
            width={416}
            height={240}
            accentColor="#FACC15"
            appearAtSec={2.0}
          />
        </>
      }
    />
  );
};
