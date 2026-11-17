import React from "react";
import { interpolate, useCurrentFrame, useVideoConfig } from "remotion";
import { ASIAN_HUB_DISTANCES } from "../data/longThanhGeoData";
import { REAL_PHOTOS } from "../data/realPhotosManifest";
import { EASE, FONTS, PAPER, SAFE_X } from "../theme";
import { EditorialPaperStage } from "./EditorialThemeKit";
import { EvidencePhotoCard } from "./EvidencePhotoCard";
import { SceneHeaderPill } from "./Tactical3DKit";

export const Scene16: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const sec = frame / fps;

  // Shaded 30-60 km Mega-Hub standard band across [0..65 km] horizontal bar scale
  const bandLeftPct = ((30 / 65) * 100).toFixed(2);
  const bandWidthPct = (((60 - 30) / 65) * 100).toFixed(2);

  return (
    <EditorialPaperStage>
      <SceneHeaderPill
        variant="paper"
        badge="16 • ĐỐI CHIẾU ĐẠI ĐÔ THỊ CHÂU Á"
        title="Vì sao các siêu sân bay cấp 4F đều đặt cách lõi 30–60 km?"
        accent={PAPER.jade}
      />

      {/* Left FT/Vox Archival Paper Chart Sheet (Strict Single-Hero-Color Jade on Long Thành) */}
      <div
        style={{
          position: "absolute",
          left: SAFE_X,
          top: 126,
          width: 1080,
          height: 754,
          borderRadius: 8,
          background: PAPER.sheet,
          border: `1px solid ${PAPER.rule}`,
          borderTop: `3px solid ${PAPER.ink}`,
          boxShadow: PAPER.shadow,
          padding: "28px 36px 24px",
          boxSizing: "border-box",
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
          zIndex: 18,
        }}
      >
        <div>
          <div style={{ fontFamily: FONTS.mono, fontSize: 12.5, fontWeight: 700, color: PAPER.jade, letterSpacing: "0.08em" }}>
            CỰ LY ĐẾN TRUNG TÂM ĐÔ THỊ &gt; 10 TRIỆU DÂN (KM)
          </div>
          <div style={{ fontFamily: FONTS.display, fontSize: 28, fontWeight: 800, color: PAPER.ink, marginTop: 6, lineHeight: 1.24, letterSpacing: "-0.015em" }}>
            Mốc 40 km của Long Thành nằm ngay khoảng chuẩn các mega-hub châu Á
          </div>
        </div>

        {/* Plot Area with 30-60 km Magazine Reference Band */}
        <div style={{ position: "relative", paddingTop: 26, paddingBottom: 4 }}>
          <div
            style={{
              position: "absolute",
              left: `${bandLeftPct}%`,
              width: `${bandWidthPct}%`,
              top: 0,
              bottom: 0,
              background: "rgba(30, 120, 112, 0.065)",
              borderLeft: "1.5px dashed rgba(30, 120, 112, 0.42)",
              borderRight: "1.5px dashed rgba(30, 120, 112, 0.42)",
              pointerEvents: "none",
            }}
          >
            <div
              style={{
                position: "absolute",
                top: 3,
                left: 10,
                fontFamily: FONTS.mono,
                fontSize: 11,
                fontWeight: 700,
                color: PAPER.jade,
                letterSpacing: "0.06em",
              }}
            >
              VÙNG CHUẨN 30–60 KM
            </div>
          </div>

          <div style={{ position: "relative", display: "flex", flexDirection: "column", gap: 22 }}>
            {ASIAN_HUB_DISTANCES.map((hub, i) => {
              const p = interpolate(sec, [0.55 + i * 0.28, 1.45 + i * 0.28], [0, 1], {
                extrapolateLeft: "clamp",
                extrapolateRight: "clamp",
                easing: EASE.outExpo,
              });
              const wPct = ((hub.km / 65) * 100 * p).toFixed(1);
              const isHighlight = "highlight" in hub && hub.highlight;
              return (
                <div key={hub.name}>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", marginBottom: 7 }}>
                    <span
                      style={{
                        fontFamily: FONTS.display,
                        fontSize: 21,
                        fontWeight: isHighlight ? 800 : 600,
                        color: isHighlight ? PAPER.jade : PAPER.ink,
                      }}
                    >
                      {hub.name}
                    </span>
                    <span
                      style={{
                        fontFamily: FONTS.mono,
                        fontSize: 20,
                        fontWeight: 700,
                        fontVariantNumeric: "tabular-nums",
                        color: isHighlight ? PAPER.jade : PAPER.ink2,
                      }}
                    >
                      ~{hub.km} km
                    </span>
                  </div>
                  <div
                    style={{
                      width: "100%",
                      height: 26,
                      borderRadius: 5,
                      background: PAPER.well,
                      border: isHighlight ? `1.5px solid rgba(30, 120, 112, 0.45)` : `1px solid ${PAPER.rule}`,
                    }}
                  >
                    <div
                      style={{
                        width: `${wPct}%`,
                        height: "100%",
                        borderRadius: 4,
                        background: isHighlight ? PAPER.jade : hub.color,
                      }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            borderTop: `1px solid ${PAPER.rule}`,
            paddingTop: 14,
          }}
        >
          <span style={{ fontFamily: FONTS.display, fontSize: 17.5, fontWeight: 700, color: PAPER.ochre }}>
            Bí quyết chung của mọi siêu sân bay 30–60 km: Đường ống kết nối tốc độ cao!
          </span>
          <span style={{ fontFamily: FONTS.mono, fontSize: 12, fontWeight: 700, color: PAPER.ink3 }}>
            THANG ĐO CỰ LY 0–65 KM
          </span>
        </div>
      </div>

      {/* Top-Right Archival Polaroid Photograph */}
      <EvidencePhotoCard
        photo={REAL_PHOTOS.incheon_airport}
        left={1210}
        top={126}
        width={646}
        height={422}
        accentColor={PAPER.jade}
        appearAtSec={0.45}
      />

      {/* Bottom-Right Warm Paper Takeaway Slip */}
      <div
        style={{
          position: "absolute",
          left: 1210,
          top: 574,
          width: 646,
          padding: "20px 24px",
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
          ĐIỀU KIỆN TIÊN QUYẾT CỦA MÔ HÌNH 40 KM
        </div>
        <div style={{ fontFamily: FONTS.display, fontSize: 19, fontWeight: 600, color: PAPER.ink, marginTop: 8, lineHeight: 1.46 }}>
          Bước ra ngoài 30–60 km giải phóng tiếng ồn ban đêm &amp; mở đất 100 năm — nhưng sống còn phải có cao tốc đa hướng + đường sắt riêng.
        </div>
      </div>
    </EditorialPaperStage>
  );
};
