import React from "react";
import { interpolate, useCurrentFrame, useVideoConfig } from "remotion";
import { TSN_HYPOTHETICAL_RWY3_NORTH, TSN_PERIMETER_791HA, TSN_RUNWAY_25L, TSN_RUNWAY_25R } from "../data/longThanhGeoData";
import { boxOfBounds, coordsToScreenPath, interpolateCameraBox, lonLatToScreen } from "../mapMath";
import { FONTS, PALETTE, SAFE_X } from "../theme";
import { KpiMetricCard, RealSatelliteBasemap, VietnamMiniLocator } from "./AviationBaseLayers";
import { createProjector3D, GeoCaliperRule, SceneHeaderPill, Tactical3DStage } from "./Tactical3DKit";

const BOX_IN = boxOfBounds({ west: 106.622, south: 10.799, east: 106.682, north: 10.844 }, 0.04);
const BOX_OUT = boxOfBounds({ west: 106.608, south: 10.790, east: 106.696, north: 10.854 }, 0.04);

export const Scene06: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const sec = frame / fps;
  const reveal = interpolate(sec, [2.0, 5.5], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
  const zoomOutP = interpolate(sec, [8.0, 24.0], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
  const box = interpolateCameraBox(BOX_IN, BOX_OUT, zoomOutP);

  const spec = { width: 1920, height: 1080, pitchDeg: 49, yawDeg: interpolate(zoomOutP, [0, 1], [-4, 4]), mapScale: 1.07, ty: 52 };
  const proj = createProjector3D(spec);

  const [gx0, gy0] = lonLatToScreen(box, TSN_HYPOTHETICAL_RWY3_NORTH[0]);
  const [gx1, gy1] = lonLatToScreen(box, TSN_HYPOTHETICAL_RWY3_NORTH[1]);
  const [rx0, ry0] = proj(gx0, gy0, 0);
  const [rx1, ry1] = proj(gx1, gy1, 0);
  const midX = (rx0 + rx1) / 2;
  const midY = (ry0 + ry1) / 2;

  const p25Mid: readonly [number, number] = [106.6502, 10.8199];
  const p3Mid: readonly [number, number] = [106.6502, 10.8269];

  return (
    <Tactical3DStage
      spec={spec}
      horizonAccent={PALETTE.coralAlert}
      compassBearingDeg={251}
      groundChildren={
        <>
          <RealSatelliteBasemap box={box} dim={0.06} />
          <svg width={1920} height={1080} style={{ position: "absolute", inset: 0, pointerEvents: "none" }}>
            <path d={coordsToScreenPath(box, TSN_PERIMETER_791HA, true)} fill="rgba(56, 189, 248, 0.12)" stroke={PALETTE.skyCyan} strokeWidth={2.5} />
            <path d={coordsToScreenPath(box, TSN_RUNWAY_25R, false)} stroke={PALETTE.skyCyan} strokeWidth={4.5} />
            <path d={coordsToScreenPath(box, TSN_RUNWAY_25L, false)} stroke={PALETTE.skyCyan} strokeWidth={4.5} />
            {reveal > 0.02 && (
              <g opacity={reveal}>
                <path d={coordsToScreenPath(box, TSN_HYPOTHETICAL_RWY3_NORTH, false)} stroke="rgba(244, 63, 94, 0.34)" strokeWidth={96} strokeLinecap="round" />
                <path
                  d={coordsToScreenPath(box, TSN_HYPOTHETICAL_RWY3_NORTH, false)}
                  stroke={PALETTE.coralAlert}
                  strokeWidth={6}
                  strokeDasharray="16 10"
                />
              </g>
            )}
          </svg>
        </>
      }
      overlayChildren={
        <>
          <svg width={1920} height={1080} style={{ position: "absolute", inset: 0, pointerEvents: "none" }}>
            <GeoCaliperRule
              from={p25Mid}
              to={p3Mid}
              box={box}
              project={proj}
              label="+760 M VỀ PHÍA BẮC"
              color={PALETTE.goldCaution}
              reveal={reveal}
              labelOffset={[195, 16]}
            />
            {reveal > 0.35 && (
              <g opacity={reveal}>
                <rect x={midX - 280} y={midY - 82} width={560} height={46} rx={8} fill={PALETTE.cardBg} stroke={PALETTE.coralAlert} strokeWidth={1.6} />
                <text x={midX} y={midY - 52} textAnchor="middle" fill={PALETTE.coralAlert} fontFamily={FONTS.display} fontSize={18.5} fontWeight={700}>
                  GIẢ ĐỊNH ĐƯỜNG BĂNG SỐ 3 (+760 M) — BẤT KHẢ THI
                </text>
              </g>
            )}
          </svg>

          <SceneHeaderPill badge="06 • BÀI TOÁN GIẢI TỎA" title="Nếu ép xây đường băng thứ 3 ngay giữa Tân Bình – Gò Vấp?" accent={PALETTE.coralAlert} />

          <KpiMetricCard
            left={SAFE_X}
            top={126}
            width={450}
            value="4 km xuyên phố"
            label="ĐỀN BÙ HÀNG TRĂM HA NỘI ĐÔ"
            sublabel="Cắt ngang khu dân cư đặc quánh Gò Vấp – Tân Bình với chi phí vượt cả sân bay mới."
            accent={PALETTE.coralAlert}
          />

          <KpiMetricCard
            right={SAFE_X}
            top={126}
            width={450}
            value="Vẫn kẹt trần bay"
            label="KHÔNG GIẢI ĐƯỢC TĨNH KHÔNG"
            sublabel="Mặt bằng chật hẹp và vùng ồn 10 triệu dân vẫn trói công suất khai thác ban đêm."
            accent={PALETTE.goldCaution}
          />

          <VietnamMiniLocator targetLonLat={[106.65, 10.82]} label="GÒ VẤP • TÂN BÌNH" accent={PALETTE.coralAlert} right={SAFE_X} bottom={112} />
        </>
      }
    />
  );
};
