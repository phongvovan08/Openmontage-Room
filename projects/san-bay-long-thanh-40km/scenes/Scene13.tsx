import React from "react";
import { interpolate, spring, useCurrentFrame, useVideoConfig } from "remotion";
import { LONG_THANH_PERIMETER_5000HA, LT_CENTER, TSN_SHIFTED_TO_LT_1TO1 } from "../data/longThanhGeoData";
import { boxOfBounds, coordsToScreenPath, lonLatToScreen } from "../mapMath";
import { FONTS, PALETTE, SAFE_X } from "../theme";
import { KpiMetricCard, RealSatelliteBasemap, VietnamMiniLocator } from "./AviationBaseLayers";
import { createProjector3D, SceneHeaderPill, Tactical3DStage } from "./Tactical3DKit";

const BOX_COMPARE = boxOfBounds({ west: 106.992, south: 10.722, east: 107.114, north: 10.824 }, 0.04);

export const Scene13: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps, durationInFrames } = useVideoConfig();
  const sec = frame / fps;

  // Syncs dramatic 1:1 drop-in around whoosh at +8.7s / clearance +20.2s
  const dropSpring = spring({ frame: Math.max(0, frame - Math.round(7.8 * fps)), fps, config: { damping: 16, stiffness: 120 } });
  const dropScale = interpolate(dropSpring, [0, 1], [1.45, 1]);
  const dropOpacity = interpolate(sec, [6.5, 8.2], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });

  const spec = {
    width: 1920,
    height: 1080,
    pitchDeg: 48,
    yawDeg: interpolate(sec, [0, durationInFrames / fps], [-5, 5]),
    mapScale: 1.07,
    ty: 52,
  };
  const proj = createProjector3D(spec);
  const [gcx, gcy] = lonLatToScreen(BOX_COMPARE, LT_CENTER);
  const [cx, cy] = proj(gcx, gcy, 0);
  const [lgx, lgy] = lonLatToScreen(BOX_COMPARE, [107.072, 10.798]);
  const [lx, ly] = proj(lgx, lgy, 0);

  return (
    <Tactical3DStage
      spec={spec}
      horizonAccent={PALETTE.goldCaution}
      compassBearingDeg={55}
      groundChildren={
        <>
          <RealSatelliteBasemap box={BOX_COMPARE} dim={0.05} />
          <svg width={1920} height={1080} style={{ position: "absolute", inset: 0, pointerEvents: "none" }}>
            <path d={coordsToScreenPath(BOX_COMPARE, LONG_THANH_PERIMETER_5000HA, true)} fill="none" stroke={PALETTE.tealAirport} strokeOpacity={0.34} strokeWidth={14} strokeLinejoin="round" />
            <path d={coordsToScreenPath(BOX_COMPARE, LONG_THANH_PERIMETER_5000HA, true)} fill="rgba(45, 212, 191, 0.14)" stroke={PALETTE.tealAirport} strokeWidth={4} strokeLinejoin="round" />

            <g opacity={dropOpacity} transform={`translate(${gcx.toFixed(1)}, ${gcy.toFixed(1)}) scale(${dropScale.toFixed(4)}) translate(${(-gcx).toFixed(1)}, ${(-gcy).toFixed(1)})`}>
              <path d={coordsToScreenPath(BOX_COMPARE, TSN_SHIFTED_TO_LT_1TO1, true)} fill="rgba(244, 63, 94, 0.38)" stroke={PALETTE.coralAlert} strokeWidth={4.5} strokeLinejoin="round" />
            </g>
          </svg>
        </>
      }
      overlayChildren={
        <>
          <svg width={1920} height={1080} style={{ position: "absolute", inset: 0, pointerEvents: "none" }}>
            <text x={lx} y={ly} textAnchor="middle" fill={PALETTE.tealAirport} stroke={PALETTE.abyss} strokeWidth={5} paintOrder="stroke" fontFamily={FONTS.mono} fontSize={22} fontWeight={700}>
              5.000 HA • LONG THÀNH
            </text>
            {dropOpacity > 0.3 && (
              <g opacity={dropOpacity}>
                <rect x={cx - 185} y={cy - 23} width={370} height={44} rx={8} fill={PALETTE.cardBg} stroke={PALETTE.coralAlert} strokeWidth={1.6} />
                <text x={cx} y={cy + 6} textAnchor="middle" fill={PALETTE.ivory} fontFamily={FONTS.display} fontSize={18.5} fontWeight={700}>
                  TÂN SƠN NHẤT (~791 HA • TỶ LỆ 1:1)
                </text>
              </g>
            )}
          </svg>

          <SceneHeaderPill badge="13 • SO SÁNH TỶ LỆ THỰC 1:1 (HERO)" title="Đặt trọn vẹn Tân Sơn Nhất vào giữa lòng 5.000 ha Long Thành" accent={PALETTE.goldCaution} />

          <KpiMetricCard
            left={SAFE_X}
            top={126}
            width={430}
            value="Gấp 6,3 lần"
            label="SO SÁNH TỶ LỆ TRẮC ĐỊA 1:1"
            sublabel="Long Thành 5.000 ha ôm trọn > 6 lần Tân Sơn Nhất (~791 ha)."
            accent={PALETTE.tealAirport}
          />
          <KpiMetricCard
            right={SAFE_X}
            top={126}
            width={430}
            value="< 1/6 diện tích"
            label="KHÔNG GIAN MỞ RỘNG 100 NĂM"
            sublabel="Đủ chỗ cho 4 đường băng 4.000 m, nhà ga hoa sen và trung tâm logistics cargo."
            accent={PALETTE.coralAlert}
          />

          <VietnamMiniLocator targetLonLat={LT_CENTER} label="SO SÁNH 1:1" accent={PALETTE.goldCaution} right={SAFE_X} bottom={112} />
        </>
      }
    />
  );
};
