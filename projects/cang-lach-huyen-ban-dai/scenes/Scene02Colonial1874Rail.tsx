import React from "react";
import { interpolate, spring, useCurrentFrame, useVideoConfig } from "remotion";
import { BEN_SAU_KHO_1874, RAIL_1902_INDOCHINA } from "../data/haiphongHydroData";
import { HA_NOI_COORD } from "../data/nationalMapData";
import { REAL_PHOTOS } from "../data/realPhotosManifest";
import { boxOfBounds, coordsToScreenPath, interpolateCameraBox, lonLatToScreen, screenPolylineLength } from "../mapMath";
import { FONTS, PALETTE, SAFE_X } from "../theme";
import { EvidencePhotoCard } from "./EvidencePhotoCard";
import { HaiPhongEstuaryLayer, HydroGraticule, NationalWorldLayer } from "./HydroBaseLayers";
import { Camera3DSpec, createProjector3D, Pin3DStalk, Tactical3DStage } from "./Tactical3DKit";

const VAN_NAM_COORD = [102.712, 25.042] as const;
const LAO_CAI_COORD = [103.975, 22.486] as const;

export const Scene02Colonial1874Rail: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps, durationInFrames, width, height } = useVideoConfig();
  const progress = frame / Math.max(1, durationInFrames - 1);

  const macroBenBox = boxOfBounds(
    { west: 106.64, east: 106.76, south: 20.825, north: 20.89 },
    0.03,
    width / height
  );
  const railCorridorBox = boxOfBounds(
    { west: 101.6, east: 108.4, south: 19.6, north: 25.5 },
    0.03,
    width / height
  );
  const camPullT = interpolate(progress, [0.28, 0.64], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });
  const box = interpolateCameraBox(macroBenBox, railCorridorBox, camPullT);
  const macroEstuaryOpacity = interpolate(progress, [0.24, 0.44], [0.88, 0], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  const pitchDeg = interpolate(progress, [0, 1], [50, 51.5], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });
  const yawDeg = interpolate(progress, [0, 0.28, 1], [-5, -8, -2], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  const camSpec: Camera3DSpec = {
    width,
    height,
    pitchDeg,
    yawDeg,
    mapScale: interpolate(progress, [0, 0.30, 1], [1.66, 1.54, 1.62], { extrapolateLeft: "clamp", extrapolateRight: "clamp" }),
    ty: 56,
    persp: 1180,
    originYRatio: 0.60,
  };
  const project = createProjector3D(camSpec);

  const railLen = screenPolylineLength(box, RAIL_1902_INDOCHINA, width, height);
  const railDraw = interpolate(progress, [0.34, 0.68], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });
  const citiesOpacity = interpolate(progress, [0.46, 0.56], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  const headerIn = spring({ frame: frame - 4, fps, config: { damping: 18, stiffness: 135 } });
  const pinBenIn = spring({ frame: frame - Math.round(durationInFrames * 0.08), fps, config: { damping: 18, stiffness: 140 } });
  const pinRailIn = spring({ frame: frame - Math.round(durationInFrames * 0.46), fps, config: { damping: 18, stiffness: 140 } });
  const cardSpecIn = spring({ frame: frame - Math.round(durationInFrames * 0.18), fps, config: { damping: 18, stiffness: 135 } });

  const [bskX, bskY] = lonLatToScreen(box, BEN_SAU_KHO_1874, width, height);
  const [hnX, hnY] = lonLatToScreen(box, HA_NOI_COORD, width, height);
  const [lcX, lcY] = lonLatToScreen(box, LAO_CAI_COORD, width, height);
  const [vnX, vnY] = lonLatToScreen(box, VAN_NAM_COORD, width, height);

  const [hn2dX, hn2dY] = project(hnX, hnY, 0);
  const [lc2dX, lc2dY] = project(lcX, lcY, 0);
  const [bsk2dX, bsk2dY] = project(bskX, bskY, 0);

  const pulse = (frame % 44) / 44;

  // Animated 1902 steam-train pulse moving from Hai Phong -> Van Nam
  const trainProg = interpolate(progress, [0.24, 0.94], [0.02, 0.96], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });
  const pts2d = RAIL_1902_INDOCHINA.map((c) => {
    const [gx, gy] = lonLatToScreen(box, c, width, height);
    return project(gx, gy, 4);
  });
  const segFloat = trainProg * (pts2d.length - 1);
  const sIdx = Math.min(pts2d.length - 2, Math.floor(segFloat));
  const u = segFloat - sIdx;
  const trainX = pts2d[sIdx][0] + (pts2d[sIdx + 1][0] - pts2d[sIdx][0]) * u;
  const trainY = pts2d[sIdx][1] + (pts2d[sIdx + 1][1] - pts2d[sIdx][1]) * u;

  return (
    <Tactical3DStage
      spec={camSpec}
      horizonAccent={PALETTE.amberBright}
      compassBearingDeg={332}
      groundChildren={
        <>
          <HydroGraticule
            box={box}
            lonStep={2}
            latStep={2}
            lonRange={[102, 108]}
            latRange={[20, 26]}
            width={width}
            height={height}
          />
          <NationalWorldLayer
            box={box}
            width={width}
            height={height}
            showArchipelagoLabels={false}
            showAttribution={false}
          />
          {macroEstuaryOpacity > 0.01 && (
            <HaiPhongEstuaryLayer
              box={box}
              width={width}
              height={height}
              siltOpacity={0.28}
              showSatellite={false}
              opacity={macroEstuaryOpacity}
            />
          )}
          <svg width={width} height={height} style={{ position: "absolute", inset: 0, overflow: "visible" }}>
            {/* Glowing 1902 Indochina Railway Track Hai Phong -> Ha Noi -> Lao Cai -> Van Nam */}
            <path
              d={coordsToScreenPath(box, RAIL_1902_INDOCHINA, false, width, height)}
              fill="none"
              stroke="rgba(245, 158, 11, 0.36)"
              strokeWidth={16}
              strokeDasharray={railLen}
              strokeDashoffset={railLen * (1 - railDraw)}
              strokeLinecap="round"
            />
            <path
              d={coordsToScreenPath(box, RAIL_1902_INDOCHINA, false, width, height)}
              fill="none"
              stroke="#FACC15"
              strokeWidth={5.5}
              strokeDasharray={railLen}
              strokeDashoffset={railLen * (1 - railDraw)}
              strokeLinecap="round"
            />
            <path
              d={coordsToScreenPath(box, RAIL_1902_INDOCHINA, false, width, height)}
              fill="none"
              stroke="#020611"
              strokeWidth={2}
              strokeDasharray="10 12"
              opacity={railDraw}
            />
          </svg>
        </>
      }
      overlayChildren={
        <>
          {/* City markers on tilted plane */}
          <svg width={width} height={height} style={{ position: "absolute", inset: 0, pointerEvents: "none", opacity: citiesOpacity }}>
            {[
              { x: hn2dX, y: hn2dY, label: "Hà Nội" },
              { x: lc2dX, y: lc2dY, label: "Lào Cai" },
            ].map((c, idx) => (
              <g key={idx}>
                <circle cx={c.x} cy={c.y} r={5.5} fill="#FACC15" stroke="#020611" strokeWidth={2} />
                <text
                  x={c.x - 12}
                  y={c.y + 5}
                  textAnchor="end"
                  fill="#F8FAFC"
                  stroke="#020611"
                  strokeWidth={4}
                  paintOrder="stroke"
                  fontFamily={FONTS.sans}
                  fontSize={16}
                  fontWeight={700}
                >
                  {c.label}
                </text>
              </g>
            ))}

            {/* Animated 1902 Rail Cargo Pulse */}
            {railDraw > 0.25 && (
              <g transform={`translate(${trainX}, ${trainY})`}>
                <circle r={12} fill="#FACC15" opacity={0.32} />
                <circle r={6} fill="#FFFFFF" stroke="#D97706" strokeWidth={2.5} />
              </g>
            )}
          </svg>

          <Pin3DStalk
            gx={bskX}
            gy={bskY}
            stalkZ={172}
            project={project}
            color={PALETTE.amberBright}
            kicker="NĂM 1874 • KHỞI NGUỒN"
            title="Bến Sáu Kho (Sông Cấm)"
            metric="Mớn nước 4–6 m • Kín gió bão"
            sub="Vị trí vàng sâu 48 km thời tàu hơi nước"
            reveal={pinBenIn}
            pulsePhase={pulse}
            align="left"
            cardWidth={342}
          />

          <Pin3DStalk
            gx={vnX}
            gy={vnY}
            stalkZ={108}
            project={project}
            color="#FACC15"
            kicker="TUYẾN ĐƯỜNG SẮT 1902"
            title="Hải Phòng – Hà Nội – Vân Nam"
            sub="Mạch giao thương xuyên biên giới"
            reveal={pinRailIn}
            pulsePhase={(pulse + 0.5) % 1}
            align="right"
            cardWidth={320}
          />

          {/* Top-Left Chapter Pill */}
          <div
            style={{
              position: "absolute",
              left: SAFE_X,
              top: 40,
              padding: "12px 22px",
              background: "rgba(6, 17, 31, 0.94)",
              borderRadius: 12,
              border: `1.5px solid ${PALETTE.amberBright}`,
              borderLeft: `7px solid ${PALETTE.amberBright}`,
              opacity: headerIn,
            }}
          >
            <div style={{ fontFamily: FONTS.mono, fontSize: 13, fontWeight: 800, color: "#FACC15" }}>
              CHƯƠNG 1.2 • LỊCH SỬ BẾN SÁU KHO (1874) &amp; ĐƯỜNG SẮT (1902)
            </div>
            <div style={{ fontFamily: FONTS.sans, fontSize: 28, fontWeight: 800, color: "#FFFFFF", marginTop: 2 }}>
              Vì sao cảng Hải Phòng từng chọn đứng sâu trong nội địa?
            </div>
          </div>

          {/* Top-Right Archival Photo Card + Specs Box stacked cleanly above map (y < 430) */}
          <EvidencePhotoCard
            photo={REAL_PHOTOS.cang_hai_phong_old}
            left={width - SAFE_X - 410}
            top={40}
            width={410}
            height={236}
            accentColor={PALETTE.amberBright}
            anchorPoint={[bsk2dX, bsk2dY]}
            appearAtSec={1.4}
          />

          {/* Historical Specs Summary Box directly beneath photo in sky zone */}
          <div
            style={{
              position: "absolute",
              right: SAFE_X,
              top: 292,
              width: 410,
              padding: "14px 18px",
              background: "rgba(6, 17, 31, 0.95)",
              borderRadius: 12,
              border: `1.5px solid rgba(250, 204, 21, 0.55)`,
              borderLeft: `6px solid #FACC15`,
              opacity: cardSpecIn,
              transform: `translateY(${(1 - cardSpecIn) * 14}px)`,
            }}
          >
            <div style={{ fontFamily: FONTS.mono, fontSize: 12.5, fontWeight: 700, color: "#FACC15", marginBottom: 4 }}>
              THÔNG SỐ CẢNG THẾ KỶ XIX
            </div>
            <div style={{ fontFamily: FONTS.sans, fontSize: 16.5, fontWeight: 700, color: "#FFFFFF", lineHeight: 1.35 }}>
              Tàu hơi nước vài nghìn tấn chỉ cần <span style={{ color: "#FACC15" }}>mớn nước 4–6 m</span> — trú bão an toàn sau 6 nhà kho bên bờ sông Cấm.
            </div>
          </div>
        </>
      }
    />
  );
};
