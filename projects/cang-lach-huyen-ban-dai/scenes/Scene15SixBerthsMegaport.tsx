import React from "react";
import { interpolate, spring, useCurrentFrame, useVideoConfig } from "remotion";
import {
  ANCHORS,
  BERTH_1_2_POLY,
  BERTH_3_4_POLY,
  BERTH_5_6_POLY,
  LUONG_LACH_HUYEN,
  TAN_VU_FULL_ROUTE,
} from "../data/haiphongHydroData";
import { REAL_PHOTOS } from "../data/realPhotosManifest";
import { boxOfBounds, coordsToScreenPath, interpolateCameraBox, lonLatToScreen } from "../mapMath";
import { formatVnNumber, FONTS, PALETTE, SAFE_X } from "../theme";
import { EvidencePhotoCard } from "./EvidencePhotoCard";
import { HaiPhongEstuaryLayer, HydroGraticule, RealSatelliteBasemap } from "./HydroBaseLayers";
import { MovingVessel } from "./MovingVessel";
import { Camera3DSpec, createProjector3D, Extruded3DPolygon, Pin3DStalk, Tactical3DStage } from "./Tactical3DKit";

export const Scene15SixBerthsMegaport: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps, durationInFrames, width, height } = useVideoConfig();
  const progress = frame / Math.max(1, durationInFrames - 1);

  const camSpec: Camera3DSpec = {
    width,
    height,
    pitchDeg: interpolate(progress, [0, 1], [51.0, 50.0], { extrapolateLeft: "clamp", extrapolateRight: "clamp" }),
    yawDeg: interpolate(progress, [0, 1], [-10, -5], { extrapolateLeft: "clamp", extrapolateRight: "clamp" }),
    mapScale: interpolate(progress, [0, 1], [1.66, 1.72], { extrapolateLeft: "clamp", extrapolateRight: "clamp" }),
    ty: 56,
    persp: 1180,
    originYRatio: 0.60,
  };
  const project = createProjector3D(camSpec);

  const wideBox = boxOfBounds({ west: 106.84, east: 107.09, south: 20.69, north: 20.84 }, 0.03, width / height);
  const macroBox = boxOfBounds({ west: 106.868, east: 106.975, south: 20.752, north: 20.818 }, 0.03, width / height);
  const pullBox = boxOfBounds({ west: 106.86, east: 107.04, south: 20.71, north: 20.83 }, 0.03, width / height);
  const zoomInT = interpolate(progress, [0.06, 0.38], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
  const pullOutT = interpolate(progress, [0.82, 0.96], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
  const box =
    progress < 0.82
      ? interpolateCameraBox(wideBox, macroBox, zoomInT)
      : interpolateCameraBox(macroBox, pullBox, pullOutT);

  // Sequential reveal of the 3 concrete deep-water terminal clusters (Bến 1-2 -> Bến 3-4 -> Bến 5-6)
  const b12In = spring({ frame: frame - Math.round(durationInFrames * 0.06), fps, config: { damping: 18, stiffness: 135 } });
  const b34In = spring({ frame: frame - Math.round(durationInFrames * 0.14), fps, config: { damping: 18, stiffness: 135 } });
  const b56In = spring({ frame: frame - Math.round(durationInFrames * 0.22), fps, config: { damping: 18, stiffness: 135 } });
  const counterIn = spring({ frame: frame - Math.round(durationInFrames * 0.16), fps, config: { damping: 18, stiffness: 135 } });

  const teuCount = interpolate(progress, [0.16, 0.55], [1.6, 4.7], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });
  const berthKm = interpolate(progress, [0.16, 0.55], [0.75, 2.4], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  const [b12X, b12Y] = lonLatToScreen(box, [106.903, 20.798], width, height);
  const [b34X, b34Y] = lonLatToScreen(box, [106.909, 20.789], width, height);
  const [b56X, b56Y] = lonLatToScreen(box, [106.915, 20.780], width, height);
  const pulse = (frame % 42) / 42;
  const outboundProg = Math.max(0, Math.min(1, (progress - 0.36) * 1.55));

  return (
    <Tactical3DStage
      spec={camSpec}
      horizonAccent={PALETTE.tealDeep}
      compassBearingDeg={142}
      groundChildren={
        <>
          <RealSatelliteBasemap box={box} width={width} height={height} dim={0.02} showAttribution={false} />
          <HydroGraticule box={box} lonStep={0.05} latStep={0.05} lonRange={[106.8, 107.15]} latRange={[20.66, 20.9]} width={width} height={height} />
          <HaiPhongEstuaryLayer box={box} width={width} height={height} siltOpacity={0.28} showSatellite={false} />

          <svg width={width} height={height} style={{ position: "absolute", inset: 0, overflow: "visible" }}>
            <path d={coordsToScreenPath(box, TAN_VU_FULL_ROUTE, false, width, height)} fill="none" stroke={PALETTE.tealDeep} strokeWidth={5} />
            <path d={coordsToScreenPath(box, LUONG_LACH_HUYEN, false, width, height)} fill="none" stroke="rgba(56, 189, 248, 0.35)" strokeWidth={22} strokeLinecap="round" />
            <path d={coordsToScreenPath(box, LUONG_LACH_HUYEN, false, width, height)} fill="none" stroke={PALETTE.coastStroke} strokeWidth={6} strokeDasharray="12 8" />
            {outboundProg > 0.01 && (
              <MovingVessel box={box} coords={LUONG_LACH_HUYEN} progress={0.08 + 0.86 * outboundProg} kind="mother" canvasW={width} canvasH={height} scale={1.25} label="165.000–200.000 DWT →" labelOffset={[96, -16]} />
            )}
          </svg>
        </>
      }
      overlayChildren={
        <>
          {/* Three Distinct 3D Extruded Terminal Blocks Lighting Up Sequentially */}
          <Extruded3DPolygon coords={BERTH_1_2_POLY} box={box} project={project} heightZ={28} fillTop="rgba(20, 184, 166, 0.65)" fillSide="rgba(15, 118, 110, 0.90)" strokeColor="#5EEAD4" opacity={b12In} />
          <Extruded3DPolygon coords={BERTH_3_4_POLY} box={box} project={project} heightZ={34} fillTop="rgba(56, 189, 248, 0.68)" fillSide="rgba(2, 132, 199, 0.90)" strokeColor="#BAE6FD" opacity={b34In} />
          <Extruded3DPolygon coords={BERTH_5_6_POLY} box={box} project={project} heightZ={38} fillTop="rgba(45, 212, 191, 0.72)" fillSide="rgba(13, 148, 136, 0.92)" strokeColor="#99F6E4" opacity={b56In} />

          <Pin3DStalk gx={b12X} gy={b12Y} stalkZ={214} project={project} color="#5EEAD4" kicker="2018 • BẾN MỞ ĐƯỜNG" title="Bến 1–2 (HICT)" reveal={b12In} pulsePhase={pulse} align="left" cardWidth={240} />
          <Pin3DStalk gx={b34X} gy={b34Y} stalkZ={134} project={project} color="#38BDF8" kicker="THÁNG 4/2025 • DÀI 750 M" title="Bến 3–4 (HTIT)" reveal={b34In} pulsePhase={(pulse + 0.33) % 1} align="left" cardWidth={256} />
          <Pin3DStalk gx={b56X} gy={b56Y} stalkZ={54} project={project} color={PALETTE.tealDeep} kicker="THÁNG 4/2025 • TẬP ĐOÀN HATECO" title="Bến 5–6 (HHIT)" reveal={b56In} pulsePhase={(pulse + 0.66) % 1} align="left" cardWidth={268} />

          <div
            style={{
              position: "absolute",
              left: SAFE_X,
              top: 38,
              padding: "12px 22px",
              background: "rgba(6, 17, 31, 0.94)",
              borderRadius: 12,
              border: `1.5px solid ${PALETTE.tealDeep}`,
              borderLeft: `7px solid ${PALETTE.tealDeep}`,
            }}
          >
            <div style={{ fontFamily: FONTS.mono, fontSize: 13, fontWeight: 800, color: PALETTE.tealDeep }}>
              CHƯƠNG 5.1 • CÚ BỨT TỐC 2018–2026 DỌC BỜ ĐẢO CÁT HẢI
            </div>
            <div style={{ fontFamily: FONTS.sans, fontSize: 28, fontWeight: 800, color: "#FFFFFF", marginTop: 2 }}>
              6 bến liên hoàn khai thác đồng bộ — Cửa ngõ đại dương
            </div>
          </div>

          {/* Right Top Giant TEU Counter Card */}
          <div
            style={{
              position: "absolute",
              right: SAFE_X,
              top: 40,
              width: 716,
              padding: "18px 26px",
              background: "linear-gradient(135deg, rgba(6, 17, 31, 0.96) 0%, rgba(13, 148, 136, 0.28) 100%)",
              borderRadius: 14,
              border: `2px solid ${PALETTE.tealDeep}`,
              boxShadow: "0 20px 44px rgba(0,0,0,0.7)",
              opacity: counterIn,
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
            }}
          >
            <div>
              <div style={{ fontFamily: FONTS.mono, fontSize: 13, fontWeight: 800, color: "#99F6E4" }}>
                CÔNG SUẤT THIẾT KẾ LIÊN HOÀN
              </div>
              <div style={{ fontFamily: FONTS.mono, fontSize: 44, fontWeight: 800, color: PALETTE.tealDeep, lineHeight: 1.05, marginTop: 4 }}>
                {formatVnNumber(teuCount, 1)} TRIỆU TEU/NĂM
              </div>
            </div>
            <div style={{ textAlign: "right" }}>
              <div style={{ fontFamily: FONTS.mono, fontSize: 13, fontWeight: 800, color: "#FACC15" }}>
                DẢI CẦU TÀU 06 BẾN
              </div>
              <div style={{ fontFamily: FONTS.mono, fontSize: 38, fontWeight: 800, color: "#FFFFFF", lineHeight: 1.05, marginTop: 4 }}>
                {formatVnNumber(berthKm, 1)} KM
              </div>
            </div>
          </div>

          {/* HERO PHOTO ZOOM #2: HTIT 6-berth MSC Megaship (synced 1:1 to sfx_events whooshes) */}
          <EvidencePhotoCard
            photo={REAL_PHOTOS.cang_htit_lach_huyen}
            left={width - SAFE_X - 716}
            top={176}
            width={716}
            height={392}
            accentColor={PALETTE.tealDeep}
            anchorPoint={[project(b34X, b34Y, 34)[0], project(b34X, b34Y, 34)[1]]}
            appearAtSec={0.8}
            focusWindow={{
              zoomInStartSec: 14.5,
              holdStartSec: 15.05,
              holdEndSec: 28.2,
              zoomOutEndSec: 28.85,
            }}
          />
        </>
      }
    />
  );
};
