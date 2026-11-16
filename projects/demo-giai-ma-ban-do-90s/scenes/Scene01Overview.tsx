import React from "react";
import { interpolate, spring, useCurrentFrame, useVideoConfig } from "remotion";
import { HAI_PHONG_COORD, HA_NOI_COORD } from "../data/nationalMapData";
import { REAL_PHOTOS } from "../data/realPhotosManifest";
import { boxOfBounds, coordsToScreenPath, lonLatToScreen, screenPolylineLength } from "../mapMath";
import { FONTS, PALETTE, SAFE_X, SAFE_Y } from "../theme";
import { EvidencePhotoCard } from "./EvidencePhotoCard";
import { HydroGraticule, NationalWorldLayer } from "./HydroBaseLayers";
import { MovingVessel } from "./MovingVessel";
import { Arc3DRoute, Camera3DSpec, createProjector3D, Pin3DStalk, Tactical3DStage } from "./Tactical3DKit";

const MAIN_SHIPPING_LANE = [
  [104.2, 5.8],
  [108.6, 9.2],
  [111.2, 13.5],
  [113.8, 18.2],
  [117.5, 22.2],
] as const;

const BLOCKED_FEEDER_BRANCH = [
  [111.2, 13.5],
  [109.8, 17.2],
  [108.2, 19.6],
  [107.35, 20.42],
] as const;

export const Scene01Overview: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps, durationInFrames, width, height } = useVideoConfig();
  const progress = frame / Math.max(1, durationInFrames - 1);

  const pitchDeg = interpolate(progress, [0, 1], [51, 55], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });
  const yawDeg = interpolate(progress, [0, 1], [-10, -4.5], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });
  const mapScale = interpolate(progress, [0, 1], [1.54, 1.66], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  const camSpec: Camera3DSpec = {
    width,
    height,
    pitchDeg,
    yawDeg,
    mapScale,
    ty: 92,
    persp: 1180,
    originYRatio: 0.63,
  };
  const project = createProjector3D(camSpec);

  const box = boxOfBounds(
    { west: 98.5, east: 121.2, south: 6.2, north: 23.9 },
    0.02,
    width / height
  );

  const [hpX, hpY] = lonLatToScreen(box, HAI_PHONG_COORD, width, height);
  const [hnX, hnY] = lonLatToScreen(box, HA_NOI_COORD, width, height);
  const [gateX, gateY] = lonLatToScreen(box, BLOCKED_FEEDER_BRANCH[3], width, height);
  const [eastSeaX, eastSeaY] = lonLatToScreen(box, [111.8, 13.2], width, height);
  const [hn2dX, hn2dY] = project(hnX, hnY, 0);

  const laneLen = screenPolylineLength(box, MAIN_SHIPPING_LANE, width, height);
  const laneDraw = interpolate(progress, [0.04, 0.34], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  const branchDraw = interpolate(progress, [0.18, 0.44], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  const titleIn = spring({
    frame: frame - 4,
    fps,
    config: { damping: 19, stiffness: 135 },
  });
  const hpStalkIn = spring({
    frame: frame - 18,
    fps,
    config: { damping: 18, stiffness: 140 },
  });
  const gateStalkIn = spring({
    frame: frame - Math.round(durationInFrames * 0.28),
    fps,
    config: { damping: 17, stiffness: 150 },
  });

  const pulse = (frame % 45) / 45;
  const localSec = frame / fps;
  const mainShipProg = interpolate(localSec, [0.4, 11.8], [0.12, 0.92], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  return (
    <Tactical3DStage
      spec={camSpec}
      horizonAccent={PALETTE.coralWarn}
      compassBearingDeg={348}
      telemetryLabel="KHÔNG ẢNH CHIẾN LƯỢC 3D • BIỂN ĐÔNG & VỊNH BẮC BỘ"
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
          <svg width={width} height={height} style={{ position: "absolute", inset: 0 }}>
            <text
              x={eastSeaX}
              y={eastSeaY}
              textAnchor="middle"
              fill="rgba(226, 232, 240, 0.45)"
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
              label="TRỤC SIÊU TÀU ĐI MỸ – ÂU"
              labelOffset={[0, 28]}
            />
          </svg>
        </>
      }
      overlayChildren={
        <>
          {/* 3D Airborne Diversion Arc slamming into Gulf of Tonkin Depth Wall */}
          <Arc3DRoute
            coords={BLOCKED_FEEDER_BRANCH}
            box={box}
            project={project}
            maxAltitudeZ={118}
            reveal={branchDraw}
            color={PALETTE.coralWarn}
            capsuleProgress={Math.min(1, branchDraw * 1.15)}
          />

          {/* Hanoi Capital Marker */}
          <svg width={width} height={height} style={{ position: "absolute", inset: 0, pointerEvents: "none" }}>
            <circle cx={hn2dX} cy={hn2dY} r={5.5} fill="#FACC15" stroke="#FFFFFF" strokeWidth={2} />
            <text
              x={hn2dX - 12}
              y={hn2dY + 5}
              textAnchor="end"
              fill="#FEF08A"
              stroke="#020611"
              strokeWidth={4}
              paintOrder="stroke"
              fontFamily={FONTS.sans}
              fontSize={16}
              fontWeight={700}
            >
              ★ Hà Nội
            </text>
          </svg>

          {/* Vertical 3D Stalk 1: Hai Phong Century Port */}
          <Pin3DStalk
            gx={hpX}
            gy={hpY}
            stalkZ={164}
            project={project}
            color={PALETTE.amberBright}
            kicker="CỬA NGÕ MIỀN BẮC • HƠN 100 NĂM"
            title="Cảng Hải Phòng (Sông Cấm)"
            metric="Nằm sâu trong đáy vịnh"
            reveal={hpStalkIn}
            pulsePhase={pulse}
            align="left"
            cardWidth={318}
          />

          {/* Vertical 3D Stalk 2: Blocked Megaship Gate */}
          <Pin3DStalk
            gx={gateX}
            gy={gateY}
            stalkZ={124}
            project={project}
            color={PALETTE.coralWarn}
            kicker="RÀO CẢN ĐỘ SÂU CỬA SÔNG"
            title="✕ Siêu tàu mẹ bị chặn ngoài vịnh!"
            metric="Luồng cũ chỉ sâu -7,0 m"
            sub="Không thể đón tàu lớn đi thẳng Mỹ – Âu"
            reveal={gateStalkIn}
            pulsePhase={(pulse + 0.4) % 1}
            align="right"
            cardWidth={348}
          />

          {/* Johnny Harris Cold-Open Cinema Title Block */}
          <div
            style={{
              position: "absolute",
              left: SAFE_X,
              top: 46,
              width: 720,
              opacity: titleIn,
              transform: `translateY(${(1 - titleIn) * -18}px)`,
            }}
          >
            <div
              style={{
                display: "inline-block",
                padding: "5px 14px",
                borderRadius: 6,
                background: "#FACC15",
                color: "#020611",
                fontFamily: FONTS.mono,
                fontSize: 13.5,
                fontWeight: 700,
                letterSpacing: "0.06em",
                marginBottom: 10,
              }}
            >
              PHẦN 01 • NGHỊCH LÝ CẢNG BIỂN 100 TUỔI
            </div>
            <div
              style={{
                fontFamily: FONTS.sans,
                fontSize: 44,
                fontWeight: 800,
                color: "#FFFFFF",
                lineHeight: 1.14,
                textShadow: "0 8px 28px rgba(0,0,0,0.85)",
              }}
            >
              Vì sao cảng Hải Phòng phải{" "}
              <span style={{ color: "#38BDF8" }}>vượt biển ra Lạch Huyện?</span>
            </div>
          </div>

          {/* Real Archival Photo Card (kept calmly docked in upper-right sky) */}
          <EvidencePhotoCard
            photo={REAL_PHOTOS.cang_hai_phong_old}
            left={width - SAFE_X - 468}
            top={56}
            width={468}
            height={264}
            accentColor={PALETTE.amberBright}
            anchorPoint={[project(hpX, hpY, 164)[0], project(hpX, hpY, 164)[1]]}
            appearAtSec={0.35}
          />
        </>
      }
    />
  );
};
