import React from "react";
import { interpolate, spring, useCurrentFrame, useVideoConfig } from "remotion";
import { ANCHORS, BACH_DANG_LINE, KENH_HA_NAM_LINE } from "../data/haiphongHydroData";
import { REAL_PHOTOS } from "../data/realPhotosManifest";
import { boxOfBounds, coordsToScreenPath, interpolateCameraBox, lonLatToScreen, screenPolylineLength } from "../mapMath";
import { FONTS, PALETTE, SAFE_X } from "../theme";
import { EvidencePhotoCard } from "./EvidencePhotoCard";
import { HaiPhongEstuaryLayer, HydroGraticule, RealSatelliteBasemap } from "./HydroBaseLayers";
import { Camera3DSpec, createProjector3D, Pin3DStalk, Tactical3DStage } from "./Tactical3DKit";

export const Scene07HaNamCanal1904: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps, durationInFrames, width, height } = useVideoConfig();
  const progress = frame / Math.max(1, durationInFrames - 1);

  const estuaryBox = boxOfBounds(
    { west: 106.73, east: 106.95, south: 20.725, north: 20.88 },
    0.03,
    width / height
  );
  const macroCanalBox = boxOfBounds(
    { west: 106.775, east: 106.890, south: 20.775, north: 20.842 },
    0.03,
    width / height
  );
  const diveT = interpolate(progress, [0.30, 0.70], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });
  const box = interpolateCameraBox(estuaryBox, macroCanalBox, diveT);

  const camSpec: Camera3DSpec = {
    width,
    height,
    pitchDeg: interpolate(progress, [0, 1], [50.5, 51.5], { extrapolateLeft: "clamp", extrapolateRight: "clamp" }),
    yawDeg: interpolate(progress, [0, 1], [-10, -4], { extrapolateLeft: "clamp", extrapolateRight: "clamp" }),
    mapScale: interpolate(progress, [0, 1], [1.66, 1.74], { extrapolateLeft: "clamp", extrapolateRight: "clamp" }),
    ty: 56,
    persp: 1180,
    originYRatio: 0.60,
  };
  const project = createProjector3D(camSpec);

  const headerIn = spring({ frame: frame - 4, fps, config: { damping: 18, stiffness: 135 } });
  const histIn =
    interpolate(progress, [0.08, 0.28], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" }) *
    interpolate(progress, [0.46, 0.62], [1, 0], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
  const canalDraw = interpolate(progress, [0.28, 0.56], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
  const gaugeIn = spring({ frame: frame - Math.round(durationInFrames * 0.44), fps, config: { damping: 18, stiffness: 135 } });

  const canalLen = screenPolylineLength(box, KENH_HA_NAM_LINE, width, height);
  const bachDangLen = screenPolylineLength(box, BACH_DANG_LINE, width, height);

  const [khnX, khnY] = lonLatToScreen(box, ANCHORS.kenhHaNam, width, height);
  const [ntX, ntY] = lonLatToScreen(box, ANCHORS.cuaNamTrieu, width, height);
  const pulse = (frame % 42) / 42;

  return (
    <Tactical3DStage
      spec={camSpec}
      horizonAccent="#38BDF8"
      compassBearingDeg={14}
      groundChildren={
        <>
          <RealSatelliteBasemap box={box} width={width} height={height} dim={0.02} showAttribution={false} />
          <HydroGraticule box={box} lonStep={0.05} latStep={0.05} lonRange={[106.7, 107.0]} latRange={[20.74, 20.9]} width={width} height={height} />
          <HaiPhongEstuaryLayer box={box} width={width} height={height} siltOpacity={0.32} showSatellite={false} />

          <svg width={width} height={height} style={{ position: "absolute", inset: 0, overflow: "visible" }}>
            {/* 1904 Nam Trieu legacy dredging axis */}
            <path
              d={coordsToScreenPath(box, BACH_DANG_LINE, false, width, height)}
              fill="none"
              stroke="#F59E0B"
              strokeWidth={7}
              strokeDasharray={bachDangLen}
              strokeDashoffset={bachDangLen * (1 - histIn)}
              strokeLinecap="round"
            />
            {/* Modern Ha Nam Canal slicing across Dinh Vu Peninsula */}
            <path
              d={coordsToScreenPath(box, KENH_HA_NAM_LINE, false, width, height)}
              fill="none"
              stroke="rgba(56, 189, 248, 0.35)"
              strokeWidth={24}
              strokeDasharray={canalLen}
              strokeDashoffset={canalLen * (1 - canalDraw)}
              strokeLinecap="round"
            />
            <path
              d={coordsToScreenPath(box, KENH_HA_NAM_LINE, false, width, height)}
              fill="none"
              stroke="#38BDF8"
              strokeWidth={9}
              strokeDasharray={canalLen}
              strokeDashoffset={canalLen * (1 - canalDraw)}
              strokeLinecap="round"
            />
          </svg>
        </>
      }
      overlayChildren={
        <>
          <Pin3DStalk
            gx={ntX}
            gy={ntY}
            stalkZ={142}
            project={project}
            color={PALETTE.amberBright}
            kicker="TỪ NĂM 1904"
            title="Lạch Nam Triệu"
            sub="Hơn 120 năm nạo vét mở luồng"
            reveal={histIn}
            pulsePhase={pulse}
            align="right"
            cardWidth={292}
          />
          <Pin3DStalk
            gx={khnX}
            gy={khnY}
            stalkZ={128}
            project={project}
            color="#38BDF8"
            kicker="XẺ NGANG BÁN ĐẢO ĐÌNH VŨ"
            title="Kênh đào Hà Nam"
            metric="Sâu -8,5 m | Rộng 80 m"
            sub="Đón tàu ~48.000 DWT giảm tải"
            reveal={canalDraw}
            pulsePhase={(pulse + 0.5) % 1}
            align="left"
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
              border: "1.5px solid #38BDF8",
              borderLeft: "7px solid #38BDF8",
              opacity: headerIn,
            }}
          >
            <div style={{ fontFamily: FONTS.mono, fontSize: 13, fontWeight: 800, color: "#38BDF8" }}>
              CHƯƠNG 2.3 • HƠN MỘT THẾ KỶ VÁ LỖI (1904 → KÊNH HÀ NAM)
            </div>
            <div style={{ fontFamily: FONTS.sans, fontSize: 27, fontWeight: 800, color: "#FFFFFF", marginTop: 2 }}>
              Cú xẻ ngang bán đảo Đình Vũ &amp; giới hạn -8,5 m
            </div>
          </div>

          {/* Bottom-Left Comparative Depth Gauge Card (leaves Đình Vũ & Kênh Hà Nam map pins unobstructed) */}
          <div
            style={{
              position: "absolute",
              left: SAFE_X,
              bottom: 118,
              width: 560,
              padding: "20px 24px",
              background: "rgba(6, 17, 31, 0.95)",
              borderRadius: 14,
              border: `1.8px solid rgba(56, 189, 248, 0.55)`,
              boxShadow: "0 24px 54px rgba(0,0,0,0.75)",
              opacity: gaugeIn,
              transform: `translateY(${(1 - gaugeIn) * 16}px)`,
            }}
          >
            <div style={{ fontFamily: FONTS.mono, fontSize: 13, fontWeight: 800, color: "#38BDF8", marginBottom: 14 }}>
              SO SÁNH NGƯỠNG TẢI TRỌNG KÊNH HÀ NAM (-8,5 M)
            </div>

            {/* Bar 1 */}
            <div style={{ marginBottom: 18 }}>
              <div style={{ display: "flex", justifyContent: "space-between", fontFamily: FONTS.sans, fontSize: 16, fontWeight: 700, color: "#E2E8F0", marginBottom: 6 }}>
                <span>Tàu ~48.000 DWT (giảm tải vào Đình Vũ)</span>
                <span style={{ color: "#38BDF8", fontFamily: FONTS.mono }}>-8,5 m ✓ ĐẠT</span>
              </div>
              <div style={{ width: "100%", height: 18, borderRadius: 6, background: "#0F172A", border: "1px solid #334155", overflow: "hidden" }}>
                <div style={{ width: "61%", height: "100%", background: "linear-gradient(90deg, #0284C7, #38BDF8)" }} />
              </div>
            </div>

            {/* Bar 2 */}
            <div style={{ marginBottom: 14 }}>
              <div style={{ display: "flex", justifyContent: "space-between", fontFamily: FONTS.sans, fontSize: 16, fontWeight: 700, color: "#FDA4AF", marginBottom: 6 }}>
                <span>Siêu tàu mẹ 165.000 DWT</span>
                <span style={{ color: PALETTE.coralWarn, fontFamily: FONTS.mono }}>-14,0 m ✕ THIẾU 5,5 M</span>
              </div>
              <div style={{ width: "100%", height: 18, borderRadius: 6, background: "#0F172A", border: "1px solid #881337", overflow: "hidden" }}>
                <div style={{ width: "100%", height: "100%", background: "linear-gradient(90deg, #E11D48, #FB7185)" }} />
              </div>
            </div>

            <div style={{ paddingTop: 10, borderTop: "1px solid rgba(148,163,184,0.22)", fontFamily: FONTS.sans, fontSize: 16, fontWeight: 600, color: "#CBD5E1", lineHeight: 1.4 }}>
              Xẻ kênh rút gọn tuyến sông cũ nhưng vẫn không thể giải thoát miền Bắc khỏi đội tàu feeder.
            </div>
          </div>

          <EvidencePhotoCard
            photo={REAL_PHOTOS.cang_dinh_vu}
            left={width - SAFE_X - 408}
            top={40}
            width={408}
            height={230}
            accentColor="#38BDF8"
            appearAtSec={2.0}
          />
        </>
      }
    />
  );
};
