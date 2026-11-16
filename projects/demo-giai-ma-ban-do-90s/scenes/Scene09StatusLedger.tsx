import React from "react";
import { interpolate, spring, useCurrentFrame, useVideoConfig } from "remotion";
import {
  ANCHORS,
  LUONG_LACH_HUYEN,
  OPERATING_BERTHS_1_6,
  PLANNED_EXPANSION_2030,
  TAN_VU_FULL_ROUTE,
} from "../data/haiphongHydroData";
import { REAL_PHOTOS } from "../data/realPhotosManifest";
import { boxOfBounds, coordsToScreenPath, lonLatToScreen } from "../mapMath";
import { FONTS, PALETTE, SAFE_X, SAFE_Y } from "../theme";
import { EvidencePhotoCard } from "./EvidencePhotoCard";
import { HaiPhongEstuaryLayer, HydroGraticule, RealSatelliteBasemap } from "./HydroBaseLayers";
import { MovingVessel } from "./MovingVessel";
import {
  Camera3DSpec,
  createProjector3D,
  Extruded3DPolygon,
  Pin3DStalk,
  Tactical3DStage,
} from "./Tactical3DKit";

export const Scene09StatusLedger: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps, durationInFrames, width, height } = useVideoConfig();
  const progress = frame / Math.max(1, durationInFrames - 1);
  const localSec = frame / fps;

  const pitchDeg = interpolate(progress, [0, 1], [55, 52], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });
  const yawDeg = interpolate(progress, [0, 1], [-12, -4], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  const camSpec: Camera3DSpec = {
    width,
    height,
    pitchDeg,
    yawDeg,
    mapScale: 1.72,
    ty: 92,
    persp: 1120,
    originYRatio: 0.62,
  };
  const project = createProjector3D(camSpec);

  // Shift geographic bounds slightly east so Cat Hai Island sits prominently on the left/center-left
  const box = boxOfBounds(
    { west: 106.82, east: 107.12, south: 20.69, north: 20.85 },
    0.03,
    width / height
  );

  const opIn = spring({
    frame: frame - 4,
    fps,
    config: { damping: 18, stiffness: 135 },
  });
  const planIn = spring({
    frame: frame - Math.round(durationInFrames * 0.14),
    fps,
    config: { damping: 18, stiffness: 135 },
  });
  const ctaIn = spring({
    frame: frame - Math.round(durationInFrames * 0.26),
    fps,
    config: { damping: 18, stiffness: 130 },
  });

  const hiSweep = interpolate(localSec, [5.1, 6.2], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  const [opX, opY] = lonLatToScreen(box, ANCHORS.benLachHuyen, width, height);
  const [plX, plY] = lonLatToScreen(box, ANCHORS.quyHoach2030, width, height);
  const pulse = (frame % 42) / 42;
  const outboundProg = Math.min(1, Math.max(0, (localSec - 4.4) / 7.0));

  return (
    <Tactical3DStage
      spec={camSpec}
      horizonAccent={PALETTE.tealDeep}
      compassBearingDeg={142}
      telemetryLabel="QUY HOẠCH 3D ĐẢO CÁT HẢI • QĐ 1579/QĐ-TTg"
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
            lonStep={0.05}
            latStep={0.05}
            lonRange={[106.78, 107.15]}
            latRange={[20.65, 20.9]}
            width={width}
            height={height}
          />
          <HaiPhongEstuaryLayer
            box={box}
            width={width}
            height={height}
            siltOpacity={0.32}
            showSatellite={false}
          />

          <svg width={width} height={height} style={{ position: "absolute", inset: 0 }}>
            <path
              d={coordsToScreenPath(box, TAN_VU_FULL_ROUTE, false, width, height)}
              fill="none"
              stroke={PALETTE.tealDeep}
              strokeWidth={5}
            />
            <path
              d={coordsToScreenPath(box, LUONG_LACH_HUYEN, false, width, height)}
              fill="none"
              stroke="rgba(56, 189, 248, 0.35)"
              strokeWidth={22}
              strokeLinecap="round"
            />
            <path
              d={coordsToScreenPath(box, LUONG_LACH_HUYEN, false, width, height)}
              fill="none"
              stroke={PALETTE.coastStroke}
              strokeWidth={6}
              strokeDasharray="12 8"
            />

            {outboundProg > 0.01 && (
              <MovingVessel
                box={box}
                coords={LUONG_LACH_HUYEN}
                progress={0.08 + 0.84 * outboundProg}
                kind="mother"
                canvasW={width}
                canvasH={height}
                scale={1.25}
                label="ĐI THẲNG MỸ – CHÂU ÂU →"
                labelOffset={[96, -16]}
              />
            )}
          </svg>
        </>
      }
      overlayChildren={
        <>
          {/* 3D EXTRUDED PORT TERMINAL BLOCKS ON CAT HAI ISLAND */}
          <Extruded3DPolygon
            coords={OPERATING_BERTHS_1_6}
            box={box}
            project={project}
            heightZ={32}
            fillTop="rgba(45, 212, 191, 0.62)"
            fillSide="rgba(13, 148, 136, 0.88)"
            strokeColor="#5EEAD4"
            opacity={opIn}
          />
          <Extruded3DPolygon
            coords={PLANNED_EXPANSION_2030}
            box={box}
            project={project}
            heightZ={22}
            fillTop="rgba(250, 204, 21, 0.25)"
            fillSide="rgba(180, 83, 9, 0.45)"
            strokeColor="#FACC15"
            dashed
            opacity={planIn}
          />

          {/* 3D Vertical Beacons on Operating Berths & 2030 Expansion */}
          <Pin3DStalk
            gx={opX}
            gy={opY}
            stalkZ={164}
            project={project}
            color={PALETTE.tealDeep}
            kicker="● ĐANG VẬN HÀNH THỰC TẾ (KHỐI NỔI 3D)"
            title="06 Bến container (Bến 1–6)"
            metric="Đón tàu 165.000 DWT"
            sub="Đi thẳng bờ Tây/Đông Mỹ & châu Âu"
            reveal={opIn}
            pulsePhase={pulse}
            align="left"
            cardWidth={332}
          />

          <Pin3DStalk
            gx={plX}
            gy={plY}
            stalkZ={108}
            project={project}
            color="#FACC15"
            kicker="◌ LỘ TRÌNH QUY HOẠCH ĐẾN 2030"
            title="Mở rộng các bến tiếp theo"
            sub="Vươn dài về phía Nam đảo Cát Hải"
            reveal={planIn}
            pulsePhase={(pulse + 0.5) % 1}
            align="left"
            cardWidth={308}
          />

          {/* Top-Left Cinema Title */}
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
              PHẦN 05 • TỪ CẢNG SÔNG NỘI ĐÔ THÀNH CỬA NGÕ ĐẠI DƯƠNG
            </div>
            <div style={{ fontFamily: FONTS.sans, fontSize: 30, fontWeight: 800, color: "#FFFFFF", marginTop: 2 }}>
              Khu bến cảng nước sâu Lạch Huyện — Đảo Cát Hải
            </div>
          </div>

          {/* Right Column Top: Real HTIT Megaship Aerial Photo */}
          <EvidencePhotoCard
            photo={REAL_PHOTOS.cang_htit_lach_huyen}
            left={width - SAFE_X - 716}
            top={112}
            width={716}
            height={272}
            accentColor={PALETTE.tealDeep}
            anchorPoint={[project(opX, opY, 32)[0], project(opX, opY, 32)[1]]}
            appearAtSec={0.05}
            focusWindow={{
              zoomInStartSec: 0.5,
              holdStartSec: 0.95,
              holdEndSec: 4.15,
              zoomOutEndSec: 4.65,
            }}
          />

          {/* Right Column Middle: Spotlight Official Government Decision Dossier (QĐ 1579/QĐ-TTg) */}
          <div
            style={{
              position: "absolute",
              right: SAFE_X,
              top: 412,
              width: 716,
              background: "linear-gradient(180deg, #FFFBEB 0%, #FEF3C7 100%)",
              borderRadius: 14,
              border: `2.5px solid ${PALETTE.tealDeep}`,
              boxShadow: "0 26px 60px rgba(0,0,0,0.78)",
              transform: `rotate(0.9deg) translateY(${(1 - planIn) * 20}px)`,
              opacity: planIn,
              overflow: "hidden",
            }}
          >
            <div
              style={{
                padding: "10px 20px",
                background: "#0F172A",
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                borderBottom: `2px solid ${PALETTE.tealDeep}`,
              }}
            >
              <span style={{ fontFamily: FONTS.mono, fontSize: 13, fontWeight: 800, color: PALETTE.tealDeep }}>
                ● ĐỊNH HƯỚNG PHÁT TRIỂN CẢNG CỬA NGÕ QUỐC TẾ
              </span>
              <span
                style={{
                  padding: "3px 10px",
                  borderRadius: 5,
                  background: "rgba(45, 212, 191, 0.18)",
                  border: `1px solid ${PALETTE.tealDeep}`,
                  fontFamily: FONTS.mono,
                  fontSize: 12.5,
                  fontWeight: 800,
                  color: "#99F6E4",
                }}
              >
                QĐ 1579/QĐ-TTg
              </span>
            </div>

            <div style={{ padding: "16px 22px 18px 22px" }}>
              <div style={{ fontFamily: FONTS.sans, fontSize: 22, fontWeight: 700, color: "#0F172A", lineHeight: 1.44 }}>
                “Khu bến cửa ngõ quốc tế Lạch Huyện (Bến 1–6) đang khai thác{" "}
                <span
                  style={{
                    padding: "2px 7px",
                    borderRadius: 5,
                    backgroundImage: "linear-gradient(90deg, #FACC15 0%, #FDE047 100%)",
                    backgroundRepeat: "no-repeat",
                    backgroundSize: `${(hiSweep * 100).toFixed(1)}% 92%`,
                    backgroundPosition: "0 75%",
                    fontWeight: 800,
                    color: "#020611",
                  }}
                >
                  đón tàu container đến 165.000 DWT giảm tải
                </span>{" "}
                đi thẳng Mỹ &amp; châu Âu, đồng thời mở rộng các bến tiếp theo đến năm 2030.”
              </div>
              <div
                style={{
                  marginTop: 10,
                  display: "flex",
                  justifyContent: "space-between",
                  fontFamily: FONTS.mono,
                  fontSize: 12.5,
                  fontWeight: 700,
                  color: "#475569",
                }}
              >
                <span>Quy hoạch cảng biển Việt Nam đến 2030, tầm nhìn 2050</span>
                <span style={{ color: "#0F766E" }}>✓ ĐI THẲNG MỸ &amp; CHÂU ÂU</span>
              </div>
            </div>
          </div>

          {/* Bottom Interactive Audience Poll Banner */}
          <div
            style={{
              position: "absolute",
              left: SAFE_X,
              right: SAFE_X,
              bottom: SAFE_Y + 8,
              height: 92,
              padding: "0 28px",
              background: "linear-gradient(90deg, rgba(8, 25, 44, 0.96) 0%, rgba(16, 46, 74, 0.96) 100%)",
              borderRadius: 14,
              border: `2px solid ${PALETTE.coastStroke}`,
              boxShadow: "0 18px 44px rgba(0,0,0,0.7)",
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              opacity: ctaIn,
              transform: `translateY(${(1 - ctaIn) * 16}px)`,
            }}
          >
            <div>
              <div style={{ fontFamily: FONTS.mono, fontSize: 12.5, fontWeight: 800, color: "#FACC15", marginBottom: 3 }}>
                BÌNH LUẬN CHỌN TẬP GIẢI MÃ BẢN ĐỒ TIẾP THEO
              </div>
              <div style={{ fontFamily: FONTS.sans, fontSize: 23, fontWeight: 800, color: "#FFFFFF" }}>
                Tuần tới, giải mã Sân bay Long Thành hay Cao tốc miền Tây?
              </div>
            </div>

            <div style={{ display: "flex", gap: 14 }}>
              <div
                style={{
                  padding: "11px 18px",
                  borderRadius: 10,
                  background: "rgba(245, 158, 11, 0.18)",
                  border: `1.8px solid ${PALETTE.amberBright}`,
                  fontFamily: FONTS.sans,
                  fontSize: 17.5,
                  fontWeight: 800,
                  color: "#FDE047",
                }}
              >
                [1] Long Thành cách TP.HCM 40 km
              </div>
              <div
                style={{
                  padding: "11px 18px",
                  borderRadius: 10,
                  background: "rgba(45, 212, 191, 0.18)",
                  border: `1.8px solid ${PALETTE.tealDeep}`,
                  fontFamily: FONTS.sans,
                  fontSize: 17.5,
                  fontWeight: 800,
                  color: "#5EEAD4",
                }}
              >
                [2] Cao tốc miền Tây &amp; nền đất yếu
              </div>
            </div>
          </div>
        </>
      }
    />
  );
};
