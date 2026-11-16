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
import { boxOfBounds, coordsToScreenPath, interpolateCameraBox, lonLatToScreen, screenPolylineLength } from "../mapMath";
import { FONTS, PALETTE, SAFE_X } from "../theme";
import { EvidencePhotoCard } from "./EvidencePhotoCard";
import { HaiPhongEstuaryLayer, HydroGraticule, RealSatelliteBasemap } from "./HydroBaseLayers";
import { MovingVessel } from "./MovingVessel";
import { Bridge3DExtrusion, Camera3DSpec, createProjector3D, Pin3DStalk, Tactical3DStage } from "./Tactical3DKit";

const INBOUND_LACH_HUYEN = [...LUONG_LACH_HUYEN].reverse();

export const Scene11SeaBridgeFlyover: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps, durationInFrames, width, height } = useVideoConfig();
  const progress = frame / Math.max(1, durationInFrames - 1);

  const fullBridgeBox = boxOfBounds(
    { west: 106.72, east: 107.04, south: 20.63, north: 20.86 },
    0.03,
    width / height
  );
  const macroBridgeBox = boxOfBounds(
    { west: 106.765, east: 106.900, south: 20.765, north: 20.842 },
    0.03,
    width / height
  );
  const channelViewBox = boxOfBounds(
    { west: 106.78, east: 107.03, south: 20.66, north: 20.84 },
    0.03,
    width / height
  );

  const zoomInT = interpolate(progress, [0.06, 0.34], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
  const zoomOutT = interpolate(progress, [0.78, 0.96], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
  const box =
    progress < 0.78
      ? interpolateCameraBox(fullBridgeBox, macroBridgeBox, zoomInT)
      : interpolateCameraBox(macroBridgeBox, channelViewBox, zoomOutT);

  const camSpec: Camera3DSpec = {
    width,
    height,
    pitchDeg: interpolate(progress, [0, 0.55, 1], [51.5, 52.0, 50.5], { extrapolateLeft: "clamp", extrapolateRight: "clamp" }),
    yawDeg: interpolate(progress, [0, 1], [-12, -5], { extrapolateLeft: "clamp", extrapolateRight: "clamp" }),
    mapScale: interpolate(progress, [0, 1], [1.68, 1.76], { extrapolateLeft: "clamp", extrapolateRight: "clamp" }),
    ty: 58,
    persp: 1160,
    originYRatio: 0.60,
  };
  const project = createProjector3D(camSpec);

  const route1Draw = interpolate(progress, [0.03, 0.28], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
  const route2Draw = interpolate(progress, [0.20, 0.45], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
  const badge1In = spring({ frame: frame - Math.round(durationInFrames * 0.12), fps, config: { damping: 18, stiffness: 135 } });
  const badge2In =
    spring({ frame: frame - Math.round(durationInFrames * 0.78), fps, config: { damping: 18, stiffness: 135 } });

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
  const inboundShipProg = interpolate(progress, [0.30, 0.96], [0.08, 0.94], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  return (
    <Tactical3DStage
      spec={camSpec}
      horizonAccent={PALETTE.tealDeep}
      compassBearingDeg={118}
      groundChildren={
        <>
          <RealSatelliteBasemap box={box} width={width} height={height} dim={0.02} showAttribution={false} />
          <HydroGraticule box={box} lonStep={0.05} latStep={0.05} lonRange={[106.65, 107.2]} latRange={[20.55, 20.96]} width={width} height={height} />
          <HaiPhongEstuaryLayer box={box} width={width} height={height} siltOpacity={0.30} showSatellite={false} />

          <svg width={width} height={height} style={{ position: "absolute", inset: 0, overflow: "visible" }}>
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
            <path
              d={coordsToScreenPath(box, SAND_DIKE_SW, false, width, height)}
              fill="none"
              stroke="#FACC15"
              strokeWidth={6}
              strokeDasharray={dikeLen}
              strokeDashoffset={dikeLen * (1 - route2Draw)}
              strokeLinecap="round"
            />
            <path d={coordsToScreenPath(box, BREAKWATER_NE, false, width, height)} fill="none" stroke="#F8FAFC" strokeWidth={4.5} opacity={route2Draw} strokeLinecap="round" />
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
            {progress >= 0.30 && (
              <MovingVessel box={box} coords={INBOUND_LACH_HUYEN} progress={inboundShipProg} kind="mother" canvasW={width} canvasH={height} scale={1.22} />
            )}
          </svg>
        </>
      }
      overlayChildren={
        <>
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

          <svg width={width} height={height} style={{ position: "absolute", inset: 0, pointerEvents: "none" }}>
            <circle cx={tv2dX} cy={tv2dY} r={6} fill={PALETTE.tealDeep} stroke="#FFFFFF" strokeWidth={2} />
            <text x={tv2dX - 14} y={tv2dY + 6} textAnchor="end" fill="#FFFFFF" stroke="#020611" strokeWidth={4} paintOrder="stroke" fontFamily={FONTS.sans} fontSize={16} fontWeight={700}>
              Nút Tân Vũ (Đình Vũ)
            </text>
            {route2Draw > 0.75 && (
              <text x={dk2dX - 20} y={dk2dY + 12} textAnchor="end" fill="#FDE047" stroke="#020611" strokeWidth={4} paintOrder="stroke" fontFamily={FONTS.sans} fontSize={16.5} fontWeight={800}>
                Đê chắn cát ngăn bùn phù sa →
              </text>
            )}
          </svg>

          <Pin3DStalk
            gx={brMidX}
            gy={brMidY}
            stalkZ={178}
            project={project}
            color={PALETTE.tealDeep}
            kicker="CẦU VƯỢT BIỂN TÂN VŨ – LẠCH HUYỆN (2017)"
            title="Nhảy vọt qua cửa Nam Triệu sang Cát Hải"
            metric="15,63 km (Cầu biển: 5,44 km)"
            sub="Kéo hạ tầng đường bộ vượt biển ra đón tàu"
            reveal={badge1In}
            pulsePhase={pulse}
            align="right"
            cardWidth={418}
          />
          <Pin3DStalk
            gx={lhX}
            gy={lhY}
            stalkZ={118}
            project={project}
            color={PALETTE.coastStroke}
            kicker="TRỤC LUỒNG BIỂN SÂU"
            title="Cửa ngõ nước sâu Lạch Huyện"
            metric="Dài 20,66 km ra Phao số 0"
            reveal={badge2In}
            pulsePhase={(pulse + 0.5) % 1}
            align="right"
            cardWidth={340}
          />
          <Pin3DStalk
            gx={p0X}
            gy={p0Y}
            stalkZ={82}
            project={project}
            color={PALETTE.coastStroke}
            kicker="BIỂN HỞ"
            title="Phao số 0"
            reveal={badge2In}
            pulsePhase={pulse}
            align="right"
            cardWidth={206}
          />

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
            }}
          >
            <div style={{ fontFamily: FONTS.mono, fontSize: 13, fontWeight: 800, color: PALETTE.tealDeep }}>
              CHƯƠNG 4.1 • BƯỚC QUA BÃI PHÙ SA RA ĐẢO TIỀN TIÊU CÁT HẢI
            </div>
            <div style={{ fontFamily: FONTS.sans, fontSize: 27, fontWeight: 800, color: "#FFFFFF", marginTop: 2 }}>
              Thay vì đưa tàu mẹ vào sông, kéo đường bộ ra biển đón tàu
            </div>
          </div>

          {/* HERO PHOTO ZOOM #1: Tan Vu Sea Bridge (synced 1:1 to sfx_events whooshes) */}
          <EvidencePhotoCard
            photo={REAL_PHOTOS.tan_vu_bridge}
            left={SAFE_X}
            top={height - 122 - 266}
            width={446}
            height={266}
            accentColor={PALETTE.tealDeep}
            anchorPoint={[brDeckX, brDeckY]}
            appearAtSec={1.6}
            focusWindow={{
              zoomInStartSec: 10.2,
              holdStartSec: 10.75,
              holdEndSec: 22.1,
              zoomOutEndSec: 22.75,
            }}
          />
        </>
      }
    />
  );
};

