import React from "react";
import { interpolate, useCurrentFrame, useVideoConfig } from "remotion";
import { LT_CENTER, RAIL_THU_THIEM_LONG_THANH, THU_THIEM_STATION } from "../data/longThanhGeoData";
import { REAL_PHOTOS } from "../data/realPhotosManifest";
import { boxOfBounds, coordsToScreenPath, lonLatToScreen } from "../mapMath";
import { EASE, FONTS, PALETTE, PAPER, SAFE_X } from "../theme";
import { DongNamBoCorridorLayer } from "./AviationBaseLayers";
import { EditorialPaperStage } from "./EditorialThemeKit";
import { EvidencePhotoCard } from "./EvidencePhotoCard";
import { SceneHeaderPill } from "./Tactical3DKit";

const BOX_RAIL = boxOfBounds({ west: 106.68, south: 10.71, east: 107.12, north: 10.86 }, 0.04);

export const Scene18: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const sec = frame / fps;

  const raceP = interpolate(sec, [2.0, 14.0], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
    easing: EASE.outCubic,
  });
  const railProgress = interpolate(raceP, [0, 1], [0, 100]);
  const carProgress = interpolate(raceP, [0, 1], [0, 36]);
  const trainLoop = (sec * 0.14) % 1;

  const [ttX, ttY] = lonLatToScreen(BOX_RAIL, THU_THIEM_STATION, 1104, 374);
  const [ltX, ltY] = lonLatToScreen(BOX_RAIL, LT_CENTER, 1104, 374);

  return (
    <EditorialPaperStage>
      <SceneHeaderPill
        variant="paper"
        badge="18 • ĐƯỜNG SẮT 120 KM/H (HERO)"
        title="40 km tính bằng phút tàu chạy, không chỉ tính bằng cây số"
        accent={PAPER.jade}
      />

      {/* Top-Left Rail Map Framed in Crisp Ivory Atlas Print Plate */}
      <div
        style={{
          position: "absolute",
          left: SAFE_X,
          top: 120,
          width: 1120,
          height: 390,
          borderRadius: 8,
          padding: 7,
          background: PAPER.sheet,
          border: `1px solid ${PAPER.rule}`,
          boxShadow: PAPER.shadow,
          boxSizing: "border-box",
          zIndex: 18,
        }}
      >
        <div
          style={{
            position: "relative",
            width: "100%",
            height: "100%",
            borderRadius: 4,
            overflow: "hidden",
            border: `1px solid ${PAPER.rule}`,
          }}
        >
          <DongNamBoCorridorLayer box={BOX_RAIL} width={1104} height={374} dim={0.06} showRivers showAirports showRoads showRail />
          <svg width={1104} height={374} style={{ position: "absolute", inset: 0 }}>
            <path d={coordsToScreenPath(BOX_RAIL, RAIL_THU_THIEM_LONG_THANH, false, 1104, 374)} fill="none" stroke="rgba(229, 175, 40, 0.28)" strokeWidth={12} strokeLinecap="round" />
            <path d={coordsToScreenPath(BOX_RAIL, RAIL_THU_THIEM_LONG_THANH, false, 1104, 374)} fill="none" stroke={PALETTE.goldCaution} strokeWidth={4.5} strokeLinecap="round" />
            <circle cx={ttX} cy={ttY} r={7.5} fill={PALETTE.goldCaution} stroke="#100F0F" strokeWidth={2} />
            <circle cx={ltX} cy={ltY} r={8.5} fill={PALETTE.tealAirport} stroke="#100F0F" strokeWidth={2} />
            {(() => {
              const idx = Math.min(RAIL_THU_THIEM_LONG_THANH.length - 2, Math.floor(trainLoop * (RAIL_THU_THIEM_LONG_THANH.length - 1)));
              const u = trainLoop * (RAIL_THU_THIEM_LONG_THANH.length - 1) - idx;
              const p0 = RAIL_THU_THIEM_LONG_THANH[idx];
              const p1 = RAIL_THU_THIEM_LONG_THANH[idx + 1];
              const [sx0, sy0] = lonLatToScreen(BOX_RAIL, p0, 1104, 374);
              const [sx1, sy1] = lonLatToScreen(BOX_RAIL, p1, 1104, 374);
              const sx = sx0 + (sx1 - sx0) * u;
              const sy = sy0 + (sy1 - sy0) * u;
              const ang = (Math.atan2(sy1 - sy0, sx1 - sx0) * 180) / Math.PI;
              return (
                <g transform={`translate(${sx.toFixed(1)}, ${sy.toFixed(1)}) rotate(${ang.toFixed(1)})`}>
                  <rect x={-18} y={-4.5} width={36} height={9} rx={4.5} fill={PALETTE.goldCaution} stroke="#100F0F" strokeWidth={1.6} />
                  <rect x={5} y={-2.5} width={9} height={5} rx={2} fill="#FFFCF0" />
                </g>
              );
            })()}
          </svg>
          <div
            style={{
              position: "absolute",
              left: 16,
              top: 14,
              padding: "6px 14px",
              borderRadius: 6,
              background: "rgba(16, 15, 15, 0.90)",
              border: `1px solid ${PALETTE.borderHairline}`,
              borderLeft: `4px solid ${PALETTE.goldCaution}`,
              fontFamily: FONTS.mono,
              fontSize: 14,
              fontWeight: 700,
              color: PALETTE.goldCaution,
            }}
          >
            ĐƯỜNG SẮT THỦ THIÊM – LONG THÀNH (~46–48 KM • &gt;11 KM NGẦM + &gt;34 KM CAO)
          </div>
        </div>
      </div>

      {/* Bottom-Left Time Comparison Sheet on Warm Archival Paper */}
      <div
        style={{
          position: "absolute",
          left: SAFE_X,
          top: 534,
          width: 1120,
          height: 368,
          borderRadius: 8,
          background: PAPER.sheet,
          border: `1px solid ${PAPER.rule}`,
          borderTop: `3px solid ${PAPER.ink}`,
          boxShadow: PAPER.shadow,
          padding: "22px 32px",
          boxSizing: "border-box",
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
          zIndex: 18,
        }}
      >
        <div style={{ fontFamily: FONTS.mono, fontSize: 13, fontWeight: 700, color: PAPER.jade, letterSpacing: "0.08em" }}>
          SO SÁNH THỜI GIAN TỪ CỬA NGÕ PHÍA ĐÔNG TP.HCM RA SẢNH BAY LONG THÀNH
        </div>

        <div>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", marginBottom: 8 }}>
            <span style={{ fontFamily: FONTS.display, fontSize: 22, fontWeight: 800, color: PAPER.jade }}>
              Đường sắt tốc độ 120 km/h (Không giao cắt đèn đỏ)
            </span>
            <span style={{ fontFamily: FONTS.mono, fontSize: 23, fontWeight: 700, color: PAPER.jade, fontVariantNumeric: "tabular-nums" }}>
              ~20–25 PHÚT
            </span>
          </div>
          <div style={{ width: "100%", height: 32, borderRadius: 6, background: PAPER.well, border: `1.5px solid rgba(30, 120, 112, 0.45)` }}>
            <div style={{ width: `${railProgress.toFixed(1)}%`, height: "100%", borderRadius: 4, background: PAPER.jade }} />
          </div>
        </div>

        <div>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", marginBottom: 8 }}>
            <span style={{ fontFamily: FONTS.display, fontSize: 21, fontWeight: 600, color: PAPER.ink }}>
              Ô tô trên cao tốc giờ cao điểm (Ùn cầu sông Đồng Nai)
            </span>
            <span style={{ fontFamily: FONTS.mono, fontSize: 23, fontWeight: 700, color: PAPER.vermilion, fontVariantNumeric: "tabular-nums" }}>
              60–120 PHÚT
            </span>
          </div>
          <div style={{ width: "100%", height: 32, borderRadius: 6, background: PAPER.well, border: `1px solid ${PAPER.rule}` }}>
            <div style={{ width: `${carProgress.toFixed(1)}%`, height: "100%", borderRadius: 4, background: PAPER.barMuted, borderRight: `4px solid ${PAPER.vermilion}` }} />
          </div>
        </div>

        <div style={{ fontFamily: FONTS.display, fontSize: 17, fontWeight: 600, color: PAPER.ink2, borderTop: `1px solid ${PAPER.rule}`, paddingTop: 12 }}>
          40 km xa hay gần không đo bằng cây số — mà bằng tốc độ đường sắt chuyên biệt!
        </div>
      </div>

      {/* Polaroid Evidence Photo with Focus Zoom #2 */}
      <EvidencePhotoCard
        photo={REAL_PHOTOS.hcm_metro_line1}
        left={1214}
        top={120}
        width={642}
        height={498}
        accentColor={PAPER.jade}
        appearAtSec={0.6}
        focusWindow={{
          zoomInStartSec: 12.6,
          holdStartSec: 13.15,
          holdEndSec: 26.8,
          zoomOutEndSec: 27.4,
        }}
      />

      <div
        style={{
          position: "absolute",
          left: 1214,
          top: 642,
          width: 642,
          height: 260,
          padding: "22px 26px",
          borderRadius: 8,
          background: PAPER.sheetAlt,
          border: `1px solid ${PAPER.rule}`,
          borderLeft: `4px solid ${PAPER.jade}`,
          boxShadow: PAPER.shadow,
          boxSizing: "border-box",
          zIndex: 18,
        }}
      >
        <div style={{ fontFamily: FONTS.mono, fontSize: 12.5, fontWeight: 700, color: PAPER.jade, letterSpacing: "0.06em" }}>
          KẾT NỐI METRO SỐ 1 – GA THỦ THIÊM – LONG THÀNH
        </div>
        <div style={{ fontFamily: FONTS.display, fontSize: 20, fontWeight: 700, color: PAPER.ink, marginTop: 10, lineHeight: 1.45 }}>
          Đoàn tàu chuyên dụng 120 km/h biến khoảng cách 40 km ngoại vi thành ~20 phút chuẩn đại đô thị quốc tế.
        </div>
      </div>
    </EditorialPaperStage>
  );
};
