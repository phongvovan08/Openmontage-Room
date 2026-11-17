import React from "react";
import { interpolate, useCurrentFrame, useVideoConfig } from "remotion";
import { REAL_PHOTOS } from "../data/realPhotosManifest";
import { EASE, FONTS, PAPER, SAFE_X } from "../theme";
import { KpiMetricCard } from "./AviationBaseLayers";
import { EditorialPaperStage } from "./EditorialThemeKit";
import { EvidencePhotoCard } from "./EvidencePhotoCard";
import { SceneHeaderPill } from "./Tactical3DKit";

const BARS = [
  { label: "Công suất thiết kế ban đầu (T1 + T2)", val: 28, max: 50, barColor: PAPER.barMuted, valueColor: PAPER.ink2, display: "28–30 triệu" },
  { label: "Nhu cầu thực tế trước dịch (2019)", val: 41.2, max: 50, barColor: PAPER.barMuted, valueColor: PAPER.ink2, display: "41,2 triệu" },
  { label: "Công suất Nhà ga khi mở thêm T3", val: 50, max: 50, barColor: PAPER.jade, valueColor: PAPER.jade, display: "50 triệu (Mặt đất)" },
  { label: "Trần cất/hạ cánh 2 đường băng cũ", val: 38, max: 50, barColor: PAPER.vermilion, valueColor: PAPER.vermilion, display: "Khóa bầu trời!" },
];

export const Scene03: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const sec = frame / fps;

  return (
    <EditorialPaperStage>
      <SceneHeaderPill
        variant="paper"
        badge="03 • MẶT ĐẤT VÀ BẦU TRỜI"
        title="Vì sao thêm Nhà ga T3 vẫn không nhân đôi số chuyến bay?"
        accent={PAPER.vermilion}
      />

      <div
        style={{
          position: "absolute",
          left: SAFE_X,
          top: 126,
          width: 1090,
          height: 754,
          padding: "28px 34px 24px",
          borderRadius: 8,
          background: PAPER.sheet,
          border: `1px solid ${PAPER.rule}`,
          borderTop: `3px solid ${PAPER.ink}`,
          boxShadow: PAPER.shadow,
          boxSizing: "border-box",
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
          zIndex: 18,
        }}
      >
        <div>
          <div style={{ fontFamily: FONTS.mono, fontSize: 12.5, fontWeight: 700, color: PAPER.vermilion, letterSpacing: "0.08em" }}>
            SỨC CHỨA HÀNH KHÁCH VS NĂNG LỰC ĐƯỜNG BĂNG • TRIỆU LƯỢT / NĂM
          </div>
          <div style={{ fontFamily: FONTS.display, fontSize: 28, fontWeight: 800, color: PAPER.ink, marginTop: 6, lineHeight: 1.24, letterSpacing: "-0.015em" }}>
            T3 chỉ gỡ ùn ứ soi chiếu mặt đất — bầu trời vẫn kẹt ở 2 đường băng cũ
          </div>
        </div>

        <div style={{ display: "flex", flexDirection: "column", gap: 22 }}>
          {BARS.map((b, i) => {
            const p = interpolate(sec, [0.9 + i * 0.45, 1.9 + i * 0.45], [0, 1], {
              extrapolateLeft: "clamp",
              extrapolateRight: "clamp",
              easing: EASE.outExpo,
            });
            const wPct = ((b.val / b.max) * 100 * p).toFixed(1);
            const isHero = b.barColor !== PAPER.barMuted;
            return (
              <div key={b.label}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", marginBottom: 7 }}>
                  <span style={{ fontFamily: FONTS.display, fontSize: 20, fontWeight: isHero ? 800 : 600, color: PAPER.ink }}>{b.label}</span>
                  <span style={{ fontFamily: FONTS.mono, fontSize: 20, fontWeight: 700, color: b.valueColor, fontVariantNumeric: "tabular-nums" }}>{b.display}</span>
                </div>
                <div style={{ width: "100%", height: 28, borderRadius: 5, background: PAPER.well, border: `1px solid ${PAPER.rule}` }}>
                  <div style={{ width: `${wPct}%`, height: "100%", borderRadius: 4, background: b.barColor }} />
                </div>
              </div>
            );
          })}
        </div>

        <div style={{ display: "flex", gap: 18, borderTop: `1px solid ${PAPER.rule}`, paddingTop: 16 }}>
          <div style={{ flex: 1, padding: "12px 16px", borderRadius: 6, background: "rgba(30, 120, 112, 0.08)", border: `1px solid ${PAPER.rule}`, borderLeft: `4px solid ${PAPER.jade}` }}>
            <div style={{ fontFamily: FONTS.mono, fontSize: 12, fontWeight: 700, color: PAPER.jade }}>PHÍA NAM • NHÀ GA T3 MỚI</div>
            <div style={{ fontFamily: FONTS.display, fontSize: 16, fontWeight: 600, color: PAPER.ink, marginTop: 4 }}>Giảm ùn tắc mặt đất lên 50 triệu khách</div>
          </div>
          <div style={{ flex: 1, padding: "12px 16px", borderRadius: 6, background: "rgba(201, 59, 43, 0.08)", border: `1px solid ${PAPER.rule}`, borderLeft: `4px solid ${PAPER.vermilion}` }}>
            <div style={{ fontFamily: FONTS.mono, fontSize: 12, fontWeight: 700, color: PAPER.vermilion }}>PHÍA BẮC • 2 ĐƯỜNG BĂNG CŨ</div>
            <div style={{ fontFamily: FONTS.display, fontSize: 16, fontWeight: 600, color: PAPER.ink, marginTop: 4 }}>Không có thêm bất kỳ mét đường băng mới nào</div>
          </div>
        </div>
      </div>

      <EvidencePhotoCard
        photo={REAL_PHOTOS.tsn_terminal}
        left={1210}
        top={126}
        width={646}
        height={406}
        accentColor={PAPER.vermilion}
        appearAtSec={0.55}
      />

      <KpiMetricCard
        variant="paper"
        left={1210}
        top={556}
        width={646}
        value="T3 + T1 + T2 ≠ Độc lập"
        label="NÚT THẮT CỔ CHAI"
        sublabel="Cửa check-in thông thoáng hơn, nhưng tàu bay vẫn xếp hàng đợi lệnh cất hạ cánh."
        accent={PAPER.vermilion}
      />
    </EditorialPaperStage>
  );
};
