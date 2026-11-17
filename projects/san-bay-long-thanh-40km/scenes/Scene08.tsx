import React from "react";
import { interpolate, useCurrentFrame, useVideoConfig } from "remotion";
import { HCM_CENTER, LT_CENTER } from "../data/longThanhGeoData";
import { boxOfBounds, lonLatToScreen } from "../mapMath";
import { PALETTE, SAFE_X } from "../theme";
import { DongNamBoCorridorLayer, KpiMetricCard } from "./AviationBaseLayers";
import { OfficialDocCallout } from "./OfficialDocCallout";
import { createProjector3D, RadarRangeFan, SceneHeaderPill, Tactical3DStage } from "./Tactical3DKit";

const BOX_POLICY = boxOfBounds({ west: 106.56, south: 10.60, east: 107.20, north: 10.98 }, 0.04);

export const Scene08: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const sec = frame / fps;
  const sweepDeg = interpolate(sec, [14.0, 33.0], [-140, 220], { extrapolateLeft: "clamp", extrapolateRight: "extend" });
  const radarOp = interpolate(sec, [13.0, 16.0], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });

  const spec = { width: 1920, height: 1080, pitchDeg: 51, yawDeg: interpolate(sec, [0, 33.8], [-5, 4]), mapScale: 1.05, ty: 54 };
  const proj = createProjector3D(spec);
  const [hx0, hy0] = lonLatToScreen(BOX_POLICY, HCM_CENTER);
  const [hx, hy] = proj(hx0, hy0, 0);
  const [lx0, ly0] = lonLatToScreen(BOX_POLICY, LT_CENTER);
  const [lx, ly] = proj(lx0, ly0, 0);

  return (
    <Tactical3DStage
      spec={spec}
      horizonAccent={PALETTE.goldCaution}
      compassBearingDeg={92}
      groundChildren={<DongNamBoCorridorLayer box={BOX_POLICY} dim={0.22} showRivers showAirports showRunways />}
      overlayChildren={
        <>
          <svg width={1920} height={1080} style={{ position: "absolute", inset: 0, pointerEvents: "none" }}>
            {radarOp > 0.02 && (
              <g opacity={radarOp}>
                <RadarRangeFan cx={hx} cy={hy} radii={[110, 220, 340]} sweepDeg={sweepDeg} color={PALETTE.skyCyan} />
                <circle cx={lx} cy={ly} r={22} fill="rgba(45, 212, 191, 0.25)" stroke={PALETTE.tealAirport} strokeWidth={3} strokeDasharray="6 4" />
              </g>
            )}
          </svg>

          <SceneHeaderPill badge="08 • NGHỊ QUYẾT 94/2015/QH13" title="Đầu bài lịch sử: Tìm mặt bằng 5.000 ha cấp 4F quanh TP.HCM" accent={PALETTE.goldCaution} />

          <OfficialDocCallout
            docCode="NGHỊ QUYẾT SỐ 94/2015/QH13"
            issuer="QUỐC HỘI KHÓA XIII • CHỦ TRƯƠNG ĐẦU TƯ LONG THÀNH"
            leadText="Xây dựng Cảng hàng không quốc tế đạt cấp 4F cao nhất của ICAO trên quỹ đất liền khối"
            highlightText="5.000 ha • 4 đường băng độc lập • 100 triệu khách & 5 triệu tấn hàng/năm"
            trailText=" — Câu hỏi quy hoạch: Quét radar quanh TP.HCM, đặt khối 5.000 ha ấy vào đâu?"
            left={SAFE_X}
            top={126}
            width={1140}
            appearAtSec={1.0}
            disappearAtSec={33.2}
            accentColor={PALETTE.goldCaution}
          />

          <KpiMetricCard
            right={SAFE_X}
            top={126}
            width={520}
            value="5.000 ha • Cấp 4F"
            label="ĐẦU BÀI CHƯA TỪNG CÓ TẠI VIỆT NAM"
            sublabel="Gấp > 6 lần Tân Sơn Nhất và buộc tìm đất liền khoảnh ngoài nội đô."
            accent={PALETTE.goldCaution}
          />
          <KpiMetricCard
            right={SAFE_X}
            top={326}
            width={520}
            value="100 tr + 5 tr tấn"
            label="MỤC TIÊU HÀNH KHÁCH & HÀNG HÓA"
            sublabel="4 đường băng độc lập đón tàu bay thân rộng xuyên lục địa."
            accent={PALETTE.tealAirport}
          />
        </>
      }
    />
  );
};
