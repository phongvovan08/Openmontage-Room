import React from "react";
import { interpolate, spring, useCurrentFrame, useVideoConfig } from "remotion";
import {
  ANCHORS,
  BREAKWATER_NE,
  LUONG_LACH_HUYEN,
  SAND_DIKE_SW,
  TAN_VU_FULL_ROUTE,
  TAN_VU_SEA_BRIDGE,
} from "../data/haiphongHydroData";
import { REAL_PHOTOS } from "../data/realPhotosManifest";
import { boxOfBounds, coordsToScreenPath, lonLatToScreen, screenPolylineLength } from "../mapMath";
import { FONTS, PALETTE, SAFE_X, SAFE_Y } from "../theme";
import { EvidencePhotoCard } from "./EvidencePhotoCard";
import { HaiPhongEstuaryLayer, HydroGraticule, RealSatelliteBasemap } from "./HydroBaseLayers";
import { MovingVessel } from "./MovingVessel";
import {
  Bridge3DExtrusion,
  Camera3DSpec,
  createProjector3D,
  Pin3DStalk,
  Tactical3DStage,
} from "./Tactical3DKit";

const INBOUND_LACH_HUYEN = [...LUONG_LACH_HUYEN].reverse();

export const Scene06Route: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps, durationInFrames, width, height } = useVideoConfig();
  const progress = frame / Math.max(1, durationInFrames - 1);

  const trackLon = interpolate(progress, [0, 1], [-0.016, 0.022], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });
  const trackLat = interpolate(progress, [0, 1], [0.012, -0.014], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });
  const box = boxOfBounds(
    {
      west: 106.72 + trackLon,
      east: 107.05 + trackLon,
      south: 20.62 + trackLat,
      north: 20.86 + trackLat,
    },
    0.03,
    width / height
  );

  // TRUE JOHNNY HARRIS / VOX DEEP 3D HELICOPTER FLYOVER (57° pitch + sweeping yaw!)
  const pitchDeg = interpolate(progress, [0, 0.55, 1], [57, 55.5, 53], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });
  const yawDeg = interpolate(progress, [0, 1], [-17, -6], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });
  const mapScale = interpolate(progress, [0, 1], [1.74, 1.82], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  const camSpec: Camera3DSpec = {
    width,
    height,
    pitchDeg,
    yawDeg,
    mapScale,
    ty: 108,
    persp: 1060,
    originYRatio: 0.64,
  };
  const project = createProjector3D(camSpec);

  const route1Draw = interpolate(progress, [0.03, 0.28], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });
  const route2Draw = interpolate(progress, [0.22, 0.46], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  const badge1In = spring({
    frame: frame - Math.round(durationInFrames * 0.14),
    fps,
    config: { damping: 18, stiffness: 135 },
  });
  const badge2In = spring({
    frame: frame - Math.round(durationInFrames * 0.30),
    fps,
    config: { damping: 18, stiffness: 135 },
  });

  const route1Len = screenPolylineLength(box, TAN_VU_FULL_ROUTE, width, height);
  const route2Len = screenPolylineLength(box, LUONG_LACH_HUYEN, width, height);
  const dikeLen = screenPolylineLength(box, SAND_DIKE_SW, width, height);

  const [tvX, tvY] = lonLatToScreen(box, ANCHORS.nutTanVu, width, height);
  const [brMidX, brMidY] = lonLatToScreen(box, [106.8214, 20.8065], width, height);
  const [lhX, lhY] = lonLatToScreen(box, ANCHORS.benLachHuyen, width, height);
  const [p0X, p0Y] = lonLatToScreen(box, ANCHORS.phaoSo0, width, height);
  const [dikeMidX, dikeMidY] = lonLatToScreen(box, [106.94, 20.738], width, height);

  const [tv2dX, tv2dY] = project(tvX, tvY, 0);
  const [dk2dX, dk2dY] = project(dikeMidX, dikeMidY, 0);
  const [brDeckX, brDeckY] = project(brMidX, brMidY, 38);

  const pulse = (frame % 42) / 42;
  const localSec = frame / fps;
  const inboundShipProg = interpolate(localSec, [4.6, 11.4], [0.08, 0.94], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  return (
    <Tactical3DStage
      spec={camSpec}
      horizonAccent={PALETTE.tealDeep}
      compassBearingDeg={118}
      telemetryLabel="FLYCAM CHIẾN THUẬT 3D • PITCH 56° • CẦU VƯỢT BIỂN 5,44 KM"
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
            lonRange={[106.65, 107.2]}
            latRange={[20.55, 20.96]}
            width={width}
            height={height}
          />
          <HaiPhongEstuaryLayer
            box={box}
            width={width}
            height={height}
            siltOpacity={0.34}
            showSatellite={false}
          />

          <svg width={width} height={height} style={{ position: "absolute", inset: 0 }}>
            {/* Approach Highway on Dinh Vu & Cat Hai Land */}
            <path
              d={coordsToScreenPath(box, TAN_VU_FULL_ROUTE, false, width, height)}
              fill="none"
              stroke="rgba(45, 212, 191, 0.36)"
              strokeWidth={18}
              strokeDasharray={route1Len}
              strokeDashoffset={route1Len * (1 - route1Draw)}
              strokeLinecap="round"
            />
            <path
              d={coordsToScreenPath(box, TAN_VU_FULL_ROUTE, false, width, height)}
              fill="none"
              stroke={PALETTE.tealDeep}
              strokeWidth={6}
              strokeDasharray={route1Len}
              strokeDashoffset={route1Len * (1 - route1Draw)}
              strokeLinecap="round"
            />

            {/* Sand-retaining dike & breakwater */}
            <path
              d={coordsToScreenPath(box, SAND_DIKE_SW, false, width, height)}
              fill="none"
              stroke="#FACC15"
              strokeWidth={6}
              strokeDasharray={dikeLen}
              strokeDashoffset={dikeLen * (1 - route2Draw)}
              strokeLinecap="round"
            />
            <path
              d={coordsToScreenPath(box, BREAKWATER_NE, false, width, height)}
              fill="none"
              stroke="#F8FAFC"
              strokeWidth={4.5}
              opacity={route2Draw}
              strokeLinecap="round"
            />

            {/* Glowing Deep-Water Shipping Trench 20,66 km */}
            <path
              d={coordsToScreenPath(box, LUONG_LACH_HUYEN, false, width, height)}
              fill="none"
              stroke="rgba(56, 189, 248, 0.36)"
              strokeWidth={24}
              strokeDasharray={route2Len}
              strokeDashoffset={route2Len * (1 - route2Draw)}
              strokeLinecap="round"
            />
            <path
              d={coordsToScreenPath(box, LUONG_LACH_HUYEN, false, width, height)}
              fill="none"
              stroke={PALETTE.coastStroke}
              strokeWidth={7}
              strokeDasharray={route2Len}
              strokeDashoffset={route2Len * (1 - route2Draw)}
              strokeLinecap="round"
            />

            {localSec >= 4.6 && (
              <MovingVessel
                box={box}
                coords={INBOUND_LACH_HUYEN}
                progress={inboundShipProg}
                kind="mother"
                canvasW={width}
                canvasH={height}
                scale={1.22}
              />
            )}
          </svg>
        </>
      }
      overlayChildren={
        <>
          {/* TRUE 3D ELEVATED SEA BRIDGE WITH 18 VERTICAL PIERS & WATER SHADOW */}
          <Bridge3DExtrusion
            coords={TAN_VU_SEA_BRIDGE}
            box={box}
            project={project}
            deckZ={38}
            pierCount={18}
            reveal={route1Draw}
            deckColor="#FFFFFF"
            glowColor={PALETTE.tealDeep}
          />

          {/* Crisp 2D Ground Labels */}
          <svg width={width} height={height} style={{ position: "absolute", inset: 0, pointerEvents: "none" }}>
            <circle cx={tv2dX} cy={tv2dY} r={6} fill={PALETTE.tealDeep} stroke="#FFFFFF" strokeWidth={2} />
            <text
              x={tv2dX - 14}
              y={tv2dY + 6}
              textAnchor="end"
              fill="#FFFFFF"
              stroke="#020611"
              strokeWidth={4}
              paintOrder="stroke"
              fontFamily={FONTS.sans}
              fontSize={16}
              fontWeight={700}
            >
              Nút Tân Vũ (Đình Vũ)
            </text>

            {route2Draw > 0.75 && (
              <text
                x={dk2dX - 20}
                y={dk2dY + 12}
                textAnchor="end"
                fill="#FDE047"
                stroke="#020611"
                strokeWidth={4}
                paintOrder="stroke"
                fontFamily={FONTS.sans}
                fontSize={16.5}
                fontWeight={800}
              >
                Đê chắn cát ngăn bùn phù sa →
              </text>
            )}
          </svg>

          {/* 3D Vertical Stalk 1: 5,44 km Sea Bridge */}
          <Pin3DStalk
            gx={brMidX}
            gy={brMidY}
            stalkZ={178}
            project={project}
            color={PALETTE.tealDeep}
            kicker="TUYẾN ĐƯỜNG – CẦU TÂN VŨ – LẠCH HUYỆN"
            title="Cầu vượt biển qua cửa Nam Triệu"
            metric="15,63 km (Cầu biển: 5,44 km)"
            sub="Nhảy vọt qua vùng phù sa sang đảo Cát Hải"
            reveal={badge1In}
            pulsePhase={pulse}
            align="right"
            cardWidth={418}
          />

          {/* 3D Vertical Stalk 2: 20,66 km Deep Channel */}
          <Pin3DStalk
            gx={lhX}
            gy={lhY}
            stalkZ={118}
            project={project}
            color={PALETTE.coastStroke}
            kicker="TRỤC LUỒNG NƯỚC SÂU LẠCH HUYỆN"
            title="Phóng thẳng từ Cát Hải ra biển"
            metric="Dài 20,66 km • Đón siêu tàu"
            reveal={badge2In}
            pulsePhase={(pulse + 0.5) % 1}
            align="right"
            cardWidth={388}
          />

          {/* 3D Vertical Stalk 3: Buoy 0 */}
          {route2Draw > 0.8 && (
            <Pin3DStalk
              gx={p0X}
              gy={p0Y}
              stalkZ={82}
              project={project}
              color="#38BDF8"
              kicker="CỬA BIỂN HỞ"
              title="Phao số 0 (KM 0)"
              reveal={badge2In}
              pulsePhase={pulse}
              align="left"
              cardWidth={224}
            />
          )}

          {/* Top-Left Bold Story Header */}
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
              boxShadow: "0 18px 40px rgba(0,0,0,0.65)",
            }}
          >
            <div style={{ fontFamily: FONTS.mono, fontSize: 13, fontWeight: 800, color: PALETTE.tealDeep }}>
              PHẦN 03 • LỜI GIẢI ĐỊA LÝ: NHẢY QUA CỬA SÔNG CẠN
            </div>
            <div style={{ fontFamily: FONTS.sans, fontSize: 28, fontWeight: 800, color: "#FFFFFF", marginTop: 2 }}>
              Bắc cầu vượt biển <span style={{ color: "#FACC15" }}>5,44 km</span> ra đảo tiền tiêu Cát Hải
            </div>
          </div>

          {/* Key Hero Photo 01: Real Sea Bridge Photo (zooms up when narrator highlights 5,44 km bridge) */}
          <EvidencePhotoCard
            photo={REAL_PHOTOS.tan_vu_bridge}
            left={SAFE_X}
            top={height - SAFE_Y - 270}
            width={456}
            height={260}
            accentColor={PALETTE.tealDeep}
            anchorPoint={[brDeckX, brDeckY]}
            appearAtSec={0.4}
            focusWindow={{
              zoomInStartSec: 6.95,
              holdStartSec: 7.4,
              holdEndSec: 9.75,
              zoomOutEndSec: 10.25,
            }}
          />
        </>
      }
    />
  );
};
