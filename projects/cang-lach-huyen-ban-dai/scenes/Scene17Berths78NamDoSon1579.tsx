import React from "react";
import { interpolate, spring, useCurrentFrame, useVideoConfig } from "remotion";
import {
  ANCHORS,
  BERTH_7_8_POLY,
  LUONG_LACH_HUYEN,
  NAM_DO_SON_ZONE,
  OPERATING_BERTHS_1_6,
} from "../data/haiphongHydroData";
import { boxOfBounds, coordsToScreenPath, lonLatToScreen } from "../mapMath";
import { FONTS, PALETTE, SAFE_X } from "../theme";
import { HaiPhongEstuaryLayer, HydroGraticule, RealSatelliteBasemap } from "./HydroBaseLayers";
import { Camera3DSpec, createProjector3D, Extruded3DPolygon, Pin3DStalk, Tactical3DStage } from "./Tactical3DKit";

const NAM_DO_SON_CENTER = [106.818, 20.656] as const;
const BERTH_7_8_CENTER = [106.921, 20.770] as const;

export const Scene17Berths78NamDoSon1579: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps, durationInFrames, width, height } = useVideoConfig();
  const progress = frame / Math.max(1, durationInFrames - 1);

  const camSpec: Camera3DSpec = {
    width,
    height,
    pitchDeg: interpolate(progress, [0, 1], [51.5, 49.5], { extrapolateLeft: "clamp", extrapolateRight: "clamp" }),
    yawDeg: interpolate(progress, [0, 1], [-10, -3], { extrapolateLeft: "clamp", extrapolateRight: "clamp" }),
    mapScale: 1.66,
    ty: 56,
    persp: 1180,
    originYRatio: 0.60,
  };
  const project = createProjector3D(camSpec);

  // Covers Cat Hai Island + Nam Do Son coast (both inside z12/z14 satellite bounds!)
  const box = boxOfBounds({ west: 106.73, east: 107.03, south: 20.59, north: 20.84 }, 0.03, width / height);

  const opIn = spring({ frame: frame - 4, fps, config: { damping: 18, stiffness: 135 } });
  const b78In = spring({ frame: frame - Math.round(durationInFrames * 0.24), fps, config: { damping: 18, stiffness: 135 } });
  const ndsIn = spring({ frame: frame - Math.round(durationInFrames * 0.44), fps, config: { damping: 18, stiffness: 135 } });
  const docIn = spring({ frame: frame - Math.round(durationInFrames * 0.30), fps, config: { damping: 17, stiffness: 135 } });
  const hiSweep = interpolate(progress, [0.36, 0.56], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });

  const [b16X, b16Y] = lonLatToScreen(box, ANCHORS.benLachHuyen, width, height);
  const [b78X, b78Y] = lonLatToScreen(box, BERTH_7_8_CENTER, width, height);
  const [ndsX, ndsY] = lonLatToScreen(box, NAM_DO_SON_CENTER, width, height);
  const pulse = (frame % 42) / 42;

  return (
    <Tactical3DStage
      spec={camSpec}
      horizonAccent="#FACC15"
      compassBearingDeg={152}
      groundChildren={
        <>
          <RealSatelliteBasemap box={box} width={width} height={height} dim={0.02} showAttribution={false} />
          <HydroGraticule box={box} lonStep={0.05} latStep={0.05} lonRange={[106.7, 107.05]} latRange={[20.6, 20.86]} width={width} height={height} />
          <HaiPhongEstuaryLayer box={box} width={width} height={height} siltOpacity={0.26} showSatellite={false} />
          <svg width={width} height={height} style={{ position: "absolute", inset: 0, overflow: "visible" }}>
            <path d={coordsToScreenPath(box, LUONG_LACH_HUYEN, false, width, height)} fill="none" stroke="#38BDF8" strokeWidth={6} strokeDasharray="10 8" />
          </svg>
        </>
      }
      overlayChildren={
        <>
          {/* Solid Operating Berths 1-6 */}
          <Extruded3DPolygon coords={OPERATING_BERTHS_1_6} box={box} project={project} heightZ={32} fillTop="rgba(45, 212, 191, 0.65)" fillSide="rgba(13, 148, 136, 0.88)" strokeColor="#5EEAD4" opacity={opIn} />
          {/* Dashed Gold Future Expansion: Berths 7-8 + Nam Do Son */}
          <Extruded3DPolygon coords={BERTH_7_8_POLY} box={box} project={project} heightZ={24} fillTop="rgba(250, 204, 21, 0.30)" fillSide="rgba(180, 83, 9, 0.55)" strokeColor="#FACC15" dashed opacity={b78In} />
          <Extruded3DPolygon coords={NAM_DO_SON_ZONE} box={box} project={project} heightZ={24} fillTop="rgba(250, 204, 21, 0.22)" fillSide="rgba(180, 83, 9, 0.45)" strokeColor="#FACC15" dashed opacity={ndsIn} />

          <Pin3DStalk gx={b16X} gy={b16Y} stalkZ={198} project={project} color={PALETTE.tealDeep} kicker="● ĐANG KHAI THÁC" title="Bến 1–6 Lạch Huyện" metric="2,4 km • 4,7 triệu TEU" reveal={opIn} pulsePhase={pulse} align="left" cardWidth={302} />
          <Pin3DStalk gx={b78X} gy={b78Y} stalkZ={104} project={project} color="#FACC15" kicker="◌ ĐANG CHUẨN BỊ TRIỂN KHAI" title="Bến số 7 & số 8" metric="Dài 900 m • ~1,9 triệu TEU" reveal={b78In} pulsePhase={(pulse + 0.4) % 1} align="right" cardWidth={318} />
          <Pin3DStalk gx={ndsX} gy={ndsY} stalkZ={136} project={project} color="#FACC15" kicker="◌ CỰC TĂNG TRƯỞNG MỚI" title="Khu bến Nam Đồ Sơn" sub="Mở rộng không gian cảng biển Hải Phòng" reveal={ndsIn} pulsePhase={(pulse + 0.7) % 1} align="left" cardWidth={324} />

          <div
            style={{
              position: "absolute",
              left: SAFE_X,
              top: 38,
              padding: "12px 22px",
              background: "rgba(6, 17, 31, 0.94)",
              borderRadius: 12,
              border: "1.5px solid #FACC15",
              borderLeft: "7px solid #FACC15",
            }}
          >
            <div style={{ fontFamily: FONTS.mono, fontSize: 13, fontWeight: 800, color: "#FACC15" }}>
              CHƯƠNG 5.3 • QUY HOẠCH TẦM NHÌN 2030–2050 (QĐ 1579/QĐ-TTg)
            </div>
            <div style={{ fontFamily: FONTS.sans, fontSize: 27, fontWeight: 800, color: "#FFFFFF", marginTop: 2 }}>
              Mở tiếp Bến 7–8 Lạch Huyện &amp; Khu bến chiến lược Nam Đồ Sơn
            </div>
          </div>

          {/* Right Archival Cream Dossier QĐ 1579/QĐ-TTg in top sky zone */}
          <div
            style={{
              position: "absolute",
              right: SAFE_X,
              top: 96,
              width: 630,
              background: "linear-gradient(180deg, #FFFBEB 0%, #FEF3C7 100%)",
              borderRadius: 14,
              border: `2.5px solid ${PALETTE.tealDeep}`,
              boxShadow: "0 26px 60px rgba(0,0,0,0.78)",
              transform: `rotate(0.8deg) translateY(${(1 - docIn) * 20}px)`,
              opacity: docIn,
              overflow: "hidden",
            }}
          >
            <div style={{ padding: "10px 20px", background: "#0F172A", display: "flex", justifyContent: "space-between", alignItems: "center", borderBottom: `2px solid ${PALETTE.tealDeep}` }}>
              <span style={{ fontFamily: FONTS.mono, fontSize: 13, fontWeight: 800, color: PALETTE.tealDeep }}>
                ● QUY HOẠCH TỔNG THỂ HỆ THỐNG CẢNG BIỂN VIỆT NAM
              </span>
              <span style={{ padding: "3px 10px", borderRadius: 5, background: "rgba(45, 212, 191, 0.18)", border: `1px solid ${PALETTE.tealDeep}`, fontFamily: FONTS.mono, fontSize: 12.5, fontWeight: 800, color: "#99F6E4" }}>
                QĐ 1579/QĐ-TTg
              </span>
            </div>
            <div style={{ padding: "18px 24px 22px 24px" }}>
              <div style={{ fontFamily: FONTS.mono, fontSize: 12.5, fontWeight: 700, color: "#64748B", marginBottom: 8 }}>
                THỦ TƯỚNG CHÍNH PHỦ • THỜI KỲ 2021–2030, TẦM NHÌN ĐẾN 2050
              </div>
              <div style={{ fontFamily: FONTS.sans, fontSize: 22, fontWeight: 700, color: "#0F172A", lineHeight: 1.44 }}>
                &ldquo;Phát triển cảng biển Hải Phòng là cảng biển đặc biệt — tiếp tục đầu tư{" "}
                <span
                  style={{
                    padding: "2px 6px",
                    borderRadius: 4,
                    fontWeight: 800,
                    backgroundImage: "linear-gradient(90deg, #FACC15, #FDE047)",
                    backgroundRepeat: "no-repeat",
                    backgroundSize: `${(hiSweep * 100).toFixed(1)}% 95%`,
                  }}
                >
                  Bến 7–8 (900 m • ~1,9 triệu TEU) &amp; Khu bến Nam Đồ Sơn
                </span>{" "}
                đón tàu trọng tải lớn vươn thẳng đại dương.&rdquo;
              </div>
            </div>
          </div>
        </>
      }
    />
  );
};
