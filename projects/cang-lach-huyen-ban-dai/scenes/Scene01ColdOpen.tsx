import React from "react";
import { interpolate, spring, useCurrentFrame, useVideoConfig } from "remotion";
import { HAI_PHONG_COORD, HA_NOI_COORD } from "../data/nationalMapData";
import { boxOfBounds, coordsToScreenPath, lonLatToScreen, screenPolylineLength } from "../mapMath";
import { FONTS, PALETTE, SAFE_X } from "../theme";
import { HydroGraticule, NationalWorldLayer } from "./HydroBaseLayers";
import { MovingVessel } from "./MovingVessel";
import { Arc3DRoute, Camera3DSpec, createProjector3D, Pin3DStalk, Tactical3DStage } from "./Tactical3DKit";

const MAIN_SHIPPING_LANE = [
  [105.10, 3.60],
  [108.20, 7.20],
  [110.85, 11.20],
  [113.55, 15.40],
  [116.80, 18.90],
  [121.20, 20.30],
] as const;

const BLOCKED_FEEDER_BRANCH = [
  [113.55, 15.40],
  [112.60, 14.70],
  [110.10, 15.40],
  [108.45, 17.85],
  [107.65, 19.65],
  [107.35, 20.42],
] as const;

export const Scene01ColdOpen: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps, durationInFrames, width, height } = useVideoConfig();
  const progress = frame / Math.max(1, durationInFrames - 1);

  const pitchDeg = interpolate(progress, [0, 1], [48.5, 50.5], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });
  const yawDeg = interpolate(progress, [0, 1], [-8.5, -4.0], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });
  const mapScale = interpolate(progress, [0, 1], [1.24, 1.32], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  const camSpec: Camera3DSpec = {
    width,
    height,
    pitchDeg,
    yawDeg,
    mapScale,
    ty: 20,
    persp: 1180,
    originYRatio: 0.58,
  };
  const project = createProjector3D(camSpec);

  const box = boxOfBounds(
    { west: 97.5, east: 121.8, south: 5.2, north: 24.4 },
    0.02,
    width / height
  );

  const [hpX, hpY] = lonLatToScreen(box, HAI_PHONG_COORD, width, height);
  const [hnX, hnY] = lonLatToScreen(box, HA_NOI_COORD, width, height);
  const [gateX, gateY] = lonLatToScreen(box, BLOCKED_FEEDER_BRANCH[5], width, height);
  const [eastSeaX, eastSeaY] = lonLatToScreen(box, [111.8, 13.2], width, height);
  const [hn2dX, hn2dY] = project(hnX, hnY, 0);

  const laneLen = screenPolylineLength(box, MAIN_SHIPPING_LANE, width, height);
  const laneDraw = interpolate(progress, [0.03, 0.28], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  const branchDraw = interpolate(progress, [0.16, 0.42], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  const titleIn = spring({
    frame: frame - 4,
    fps,
    config: { damping: 19, stiffness: 135 },
  });
  const hpStalkIn = spring({
    frame: frame - 16,
    fps,
    config: { damping: 18, stiffness: 140 },
  });
  const gateStalkIn = spring({
    frame: frame - Math.round(durationInFrames * 0.25),
    fps,
    config: { damping: 17, stiffness: 150 },
  });

  const pulse = (frame % 45) / 45;
  const mainShipProg = interpolate(progress, [0.05, 0.96], [0.10, 0.94], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  return (
    <Tactical3DStage
      spec={camSpec}
      horizonAccent={PALETTE.coralWarn}
      compassBearingDeg={348}
      groundChildren={
        <>
          <HydroGraticule
            box={box}
            lonStep={5}
            latStep={5}
            lonRange={[100, 120]}
            latRange={[5, 25]}
            width={width}
            height={height}
          />
          <NationalWorldLayer
            box={box}
            width={width}
            height={height}
            showArchipelagoLabels
            showAttribution={false}
          />
          <svg width={width} height={height} style={{ position: "absolute", inset: 0, overflow: "visible" }}>
            <text
              x={eastSeaX}
              y={eastSeaY}
              textAnchor="middle"
              fill="rgba(226, 232, 240, 0.48)"
              fontFamily={FONTS.sans}
              fontSize={24}
              fontWeight={700}
              letterSpacing="0.45em"
            >
              BIỂN ĐÔNG
            </text>

            {/* Glowing Main International Ocean Trunk */}
            <path
              d={coordsToScreenPath(box, MAIN_SHIPPING_LANE, false, width, height)}
              fill="none"
              stroke="rgba(45, 212, 191, 0.34)"
              strokeWidth={16}
              strokeDasharray={laneLen}
              strokeDashoffset={laneLen * (1 - laneDraw)}
              strokeLinecap="round"
            />
            <path
              d={coordsToScreenPath(box, MAIN_SHIPPING_LANE, false, width, height)}
              fill="none"
              stroke={PALETTE.tealDeep}
              strokeWidth={5}
              strokeDasharray={laneLen}
              strokeDashoffset={laneLen * (1 - laneDraw)}
              strokeLinecap="round"
            />

            <MovingVessel
              box={box}
              coords={MAIN_SHIPPING_LANE}
              progress={mainShipProg}
              kind="mother"
              canvasW={width}
              canvasH={height}
              scale={1.25}
              opacity={laneDraw > 0.12 ? 1 : 0}
            />
          </svg>
        </>
      }
      overlayChildren={
        <>
          <Arc3DRoute
            coords={BLOCKED_FEEDER_BRANCH}
            box={box}
            project={project}
            maxAltitudeZ={68}
            reveal={branchDraw}
            color={PALETTE.coralWarn}
            capsuleProgress={branchDraw > 0.2 ? Math.min(0.95, (progress - 0.16) * 2.1) : undefined}
            capsuleLabel={branchDraw > 0.7 ? "BỊ CHẶN CÁCH BỜ 48 KM" : undefined}
          />

          <svg width={width} height={height} style={{ position: "absolute", inset: 0, pointerEvents: "none" }}>
            <circle cx={hn2dX} cy={hn2dY} r={5} fill="#E2E8F0" stroke="#020611" strokeWidth={2} />
            <text
              x={hn2dX - 10}
              y={hn2dY + 20}
              textAnchor="middle"
              fill="#F8FAFC"
              stroke="#020611"
              strokeWidth={4}
              paintOrder="stroke"
              fontFamily={FONTS.sans}
              fontSize={16}
              fontWeight={700}
            >
              Hà Nội
            </text>
            {laneDraw > 0.25 && (() => {
              const [lx, ly] = project(...lonLatToScreen(box, [110.6, 11.4], width, height), 6);
              return (
                <text
                  x={lx}
                  y={ly + 24}
                  textAnchor="middle"
                  fill="#5EEAD4"
                  stroke="#020611"
                  strokeWidth={4}
                  paintOrder="stroke"
                  fontFamily={FONTS.mono}
                  fontSize={14}
                  fontWeight={800}
                >
                  TRỤC SIÊU TÀU QUỐC TẾ ĐI MỸ – ÂU ↗
                </text>
              );
            })()}
          </svg>

          <Pin3DStalk
            gx={hpX}
            gy={hpY}
            stalkZ={158}
            project={project}
            color={PALETTE.amberBright}
            kicker="CỬA NGÕ MIỀN BẮC • HẢI PHÒNG"
            title="Cảng sông trăm tuổi (Sâu -7,0 m)"
            metric="Bến cũ sâu 48 km trong đất liền"
            reveal={hpStalkIn}
            pulsePhase={pulse}
            align="left"
            cardWidth={340}
          />

          <Pin3DStalk
            gx={gateX}
            gy={gateY}
            stalkZ={106}
            project={project}
            color={PALETTE.coralWarn}
            kicker="✕ VÒNG VÂY ĐỊA LÝ 150 NĂM"
            title="Siêu tàu mẹ phải dừng ngoài khơi"
            sub="Không thể đi thẳng Mỹ – châu Âu"
            reveal={gateStalkIn}
            pulsePhase={(pulse + 0.5) % 1}
            align="right"
            cardWidth={332}
          />

          {/* Top-Left Opening Broadcast Card */}
          <div
            style={{
              position: "absolute",
              left: SAFE_X,
              top: 44,
              width: 590,
              padding: "18px 24px",
              background: "linear-gradient(135deg, rgba(6, 17, 31, 0.95) 0%, rgba(12, 31, 54, 0.90) 100%)",
              borderRadius: 14,
              border: `1.5px solid ${PALETTE.coralWarn}`,
              borderLeft: `7px solid ${PALETTE.coralWarn}`,
              boxShadow: "0 24px 52px rgba(0, 0, 0, 0.72)",
              opacity: titleIn,
              transform: `translateY(${(1 - titleIn) * 16}px)`,
            }}
          >
            <div
              style={{
                fontFamily: FONTS.mono,
                fontSize: 13,
                fontWeight: 800,
                color: "#FB7185",
                letterSpacing: "0.06em",
                marginBottom: 6,
              }}
            >
              CHƯƠNG 01 • NGHỊCH LÝ CẢNG LỚN NHẤT MIỀN BẮC
            </div>
            <div
              style={{
                fontFamily: FONTS.sans,
                fontSize: 33,
                fontWeight: 800,
                color: "#FFFFFF",
                lineHeight: 1.18,
              }}
            >
              150 năm kẹt ở sông Cấm:{" "}
              <span style={{ color: PALETTE.tealDeep }}>Hải Phòng vượt biển 48 km</span> thế nào?
            </div>
          </div>
        </>
      }
    />
  );
};
