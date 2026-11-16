import React from "react";
import { interpolate, spring, useCurrentFrame, useVideoConfig } from "remotion";
import { ANCHORS } from "../data/haiphongHydroData";
import { SINGAPORE_COORD } from "../data/nationalMapData";
import { boxOfBounds, lonLatToScreen } from "../mapMath";
import { FONTS, PALETTE, SAFE_X } from "../theme";
import { HydroGraticule, NationalWorldLayer } from "./HydroBaseLayers";
import { Arc3DRoute, Camera3DSpec, createProjector3D, Pin3DStalk, Tactical3DStage } from "./Tactical3DKit";

const LH_TO_US_WEST = [ANCHORS.benLachHuyen, [114.8, 21.8], [124.0, 26.2], [133.5, 31.0]] as const;
const LH_TO_EU = [ANCHORS.benLachHuyen, [109.5, 16.5], [106.2, 6.2], [95.0, 4.8]] as const;
const OLD_SGP_DETOUR = [ANCHORS.benLachHuyen, [108.6, 16.2], [107.0, 7.4], SINGAPORE_COORD] as const;

export const Scene16DirectTranspacificRoutes: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps, durationInFrames, width, height } = useVideoConfig();
  const progress = frame / Math.max(1, durationInFrames - 1);

  const camSpec: Camera3DSpec = {
    width,
    height,
    pitchDeg: interpolate(progress, [0, 1], [48.5, 51.0], { extrapolateLeft: "clamp", extrapolateRight: "clamp" }),
    yawDeg: interpolate(progress, [0, 1], [-8, -2], { extrapolateLeft: "clamp", extrapolateRight: "clamp" }),
    mapScale: 1.48,
    ty: 46,
    persp: 1180,
    originYRatio: 0.59,
  };
  const project = createProjector3D(camSpec);

  const box = boxOfBounds({ west: 93.0, east: 133.5, south: -1.5, north: 29.0 }, 0.02, width / height);

  const usDraw = interpolate(progress, [0.12, 0.45], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
  const euDraw = interpolate(progress, [0.22, 0.56], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
  const oldFade = interpolate(progress, [0.05, 0.35, 0.72], [0.9, 0.5, 0.25], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
  const cardIn = spring({ frame: frame - Math.round(durationInFrames * 0.24), fps, config: { damping: 18, stiffness: 135 } });

  const [lhX, lhY] = lonLatToScreen(box, ANCHORS.benLachHuyen, width, height);
  const [usX, usY] = lonLatToScreen(box, [132.0, 29.8], width, height);
  const [euX, euY] = lonLatToScreen(box, [95.5, 5.2], width, height);
  const pulse = (frame % 42) / 42;

  return (
    <Tactical3DStage
      spec={camSpec}
      horizonAccent={PALETTE.tealDeep}
      compassBearingDeg={86}
      groundChildren={
        <>
          <HydroGraticule box={box} lonStep={5} latStep={5} lonRange={[95, 135]} latRange={[0, 30]} width={width} height={height} />
          <NationalWorldLayer box={box} width={width} height={height} showArchipelagoLabels showAttribution={false} />
        </>
      }
      overlayChildren={
        <>
          {/* Dimmed old Singapore Detour Arc being replaced */}
          <g opacity={oldFade}>
            <Arc3DRoute coords={OLD_SGP_DETOUR} box={box} project={project} maxAltitudeZ={100} reveal={1} color={PALETTE.coralWarn} />
          </g>

          {/* Direct Trans-Pacific & Europe Master Routes from Cát Hải */}
          <Arc3DRoute
            coords={LH_TO_US_WEST}
            box={box}
            project={project}
            maxAltitudeZ={155}
            reveal={usDraw}
            color={PALETTE.tealDeep}
            capsuleProgress={interpolate(progress, [0.14, 0.94], [0.06, 0.56], { extrapolateLeft: "clamp", extrapolateRight: "clamp" })}
            capsuleLabel="ĐI THẲNG BỜ TÂY / ĐÔNG MỸ"
          />
          <Arc3DRoute
            coords={LH_TO_EU}
            box={box}
            project={project}
            maxAltitudeZ={130}
            reveal={euDraw}
            color="#38BDF8"
            capsuleProgress={interpolate(progress, [0.24, 0.94], [0.06, 0.94], { extrapolateLeft: "clamp", extrapolateRight: "clamp" })}
          />

          <Pin3DStalk
            gx={lhX}
            gy={lhY}
            stalkZ={154}
            project={project}
            color={PALETTE.tealDeep}
            kicker="BẮC NINH • HẢI PHÒNG • QUẢNG NINH"
            title="Lạch Huyện (Cát Hải)"
            metric="Xếp hàng thẳng lên boong tàu mẹ"
            reveal={1}
            pulsePhase={pulse}
            align="left"
            cardWidth={342}
          />
          <Pin3DStalk gx={usX} gy={usY} stalkZ={124} project={project} color={PALETTE.tealDeep} kicker="XUYÊN THÁI BÌNH DƯƠNG" title="Bờ Tây & Bờ Đông Mỹ" reveal={usDraw} pulsePhase={(pulse + 0.3) % 1} align="left" cardWidth={268} />
          <Pin3DStalk gx={euX} gy={euY} stalkZ={96} project={project} color="#38BDF8" kicker="QUA KÊNH ĐÀO SUEZ" title="Thị trường châu Âu" reveal={euDraw} pulsePhase={(pulse + 0.65) % 1} align="right" cardWidth={256} />

          {/* Top-Left Summary Header */}
          <div
            style={{
              position: "absolute",
              left: SAFE_X,
              top: 40,
              width: 600,
              padding: "16px 24px",
              background: "linear-gradient(135deg, rgba(6, 17, 31, 0.95) 0%, rgba(13, 148, 136, 0.25) 100%)",
              borderRadius: 14,
              border: `1.5px solid ${PALETTE.tealDeep}`,
              borderLeft: `7px solid ${PALETTE.tealDeep}`,
              opacity: cardIn,
            }}
          >
            <div style={{ fontFamily: FONTS.mono, fontSize: 13, fontWeight: 800, color: PALETTE.tealDeep, marginBottom: 6 }}>
              CHƯƠNG 5.2 • VẼ LẠI BẢN ĐỒ LOGISTICS MIỀN BẮC
            </div>
            <div style={{ fontFamily: FONTS.sans, fontSize: 27, fontWeight: 800, color: "#FFFFFF", lineHeight: 1.25 }}>
              Cắt bỏ chặng ghép tàu qua Singapore
            </div>
            <div style={{ display: "flex", gap: 12, marginTop: 10 }}>
              <div style={{ padding: "6px 12px", borderRadius: 7, background: "rgba(45, 212, 191, 0.2)", border: `1px solid ${PALETTE.tealDeep}`, fontFamily: FONTS.mono, fontSize: 14, fontWeight: 800, color: "#99F6E4" }}>
                ✓ 0 LẦN CHUYỂN TẢI TRUNG GIAN
              </div>
              <div style={{ padding: "6px 12px", borderRadius: 7, background: "rgba(56, 189, 248, 0.2)", border: "1px solid #38BDF8", fontFamily: FONTS.mono, fontSize: 14, fontWeight: 800, color: "#BAE6FD" }}>
                ✓ RÚT NGẮN HÀNG TUẦN GIAO HÀNG
              </div>
            </div>
          </div>
        </>
      }
    />
  );
};
