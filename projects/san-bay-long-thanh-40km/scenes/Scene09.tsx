import React from "react";
import { interpolate, useCurrentFrame, useVideoConfig } from "remotion";
import { REAL_PHOTOS } from "../data/realPhotosManifest";
import { boxOfBounds, lonLatToScreen } from "../mapMath";
import { EASE, FONTS, PALETTE, PAPER, SAFE_X } from "../theme";
import { DongNamBoCorridorLayer } from "./AviationBaseLayers";
import { EditorialPaperStage } from "./EditorialThemeKit";
import { EvidencePhotoCard } from "./EvidencePhotoCard";
import { CompactGeoPin, GeoCaliperRule, HubMedallion, SceneHeaderPill } from "./Tactical3DKit";

const BOX_SOUTH_MUD = boxOfBounds({ west: 106.50, south: 10.35, east: 107.04, north: 10.79 }, 0.04);

export const Scene09: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const sec = frame / fps;
  const xMark = interpolate(sec, [8.0, 12.0], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
    easing: EASE.outExpo,
  });

  const [mudX, mudY] = lonLatToScreen(BOX_SOUTH_MUD, [106.71, 10.61], 880, 775);
  const [cgX, cgY] = lonLatToScreen(BOX_SOUTH_MUD, [106.88, 10.50], 880, 775);

  return (
    <EditorialPaperStage>
      <SceneHeaderPill
        variant="paper"
        badge="09 • PHÉP LOẠI TRỪ PHÍA NAM"
        title="Vì sao Nhà Bè, Bình Chánh và Cần Giờ bị gạch đỏ trên bản đồ?"
        accent={PAPER.vermilion}
      />

      {/* Left Map Panel Framed Like an Archival Atlas Print Plate */}
      <div
        style={{
          position: "absolute",
          left: SAFE_X,
          top: 126,
          width: 880,
          height: 775,
          borderRadius: 8,
          padding: 8,
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
          <DongNamBoCorridorLayer box={BOX_SOUTH_MUD} width={862} height={757} dim={0.06} showRivers showZones showAirports={false} showRunways={false} />
          <svg width={862} height={757} style={{ position: "absolute", inset: 0, pointerEvents: "none" }}>
            {xMark > 0.05 && (
              <g opacity={xMark}>
                <HubMedallion cx={mudX} cy={mudY} glyph="✕" color={PALETTE.coralAlert} radius={26} />
                <HubMedallion cx={cgX} cy={cgY} glyph="✕" color={PALETTE.goldCaution} radius={24} />
              </g>
            )}
          </svg>
          <svg width={862} height={757} style={{ position: "absolute", inset: 0, pointerEvents: "none" }}>
            <GeoCaliperRule
              from={[106.70, 10.76]}
              to={[106.71, 10.61]}
              box={BOX_SOUTH_MUD}
              label="20–30 KM NAM"
              color={PALETTE.goldCaution}
              labelOffset={[110, 0]}
              canvasW={862}
              canvasH={757}
            />
            <CompactGeoPin coord={[106.71, 10.61]} box={BOX_SOUTH_MUD} label="Nhà Bè – Bình Chánh" tag="BÙN SÉT YẾU • NGẬP TRIỀU" color={PALETTE.coralAlert} offset={[32, -26]} canvasW={862} canvasH={757} />
            <CompactGeoPin coord={[106.88, 10.50]} box={BOX_SOUTH_MUD} label="Rừng ngập mặn Cần Giờ" tag="VÙNG SINH QUYỂN UNESCO" color={PALETTE.tealAirport} offset={[-24, -40]} canvasW={862} canvasH={757} />
          </svg>
          <div
            style={{
              position: "absolute",
              left: 16,
              top: 16,
              padding: "7px 14px",
              borderRadius: 6,
              background: "rgba(16, 15, 15, 0.88)",
              border: `1px solid ${PALETTE.borderHairline}`,
              borderLeft: `4px solid ${PAPER.vermilion}`,
              fontFamily: FONTS.mono,
              fontSize: 12.5,
              fontWeight: 700,
              color: PALETTE.ivory,
              letterSpacing: "0.05em",
            }}
          >
            VÙNG TRŨNG CHÂU THỔ SÔNG SÀI GÒN – ĐỒNG NAI
          </div>
        </div>
      </div>

      {/* Right Half Top: Geotechnical Stratigraphy Diagram on Crisp Cream Paper */}
      <div
        style={{
          position: "absolute",
          right: SAFE_X,
          top: 126,
          width: 880,
          height: 365,
          borderRadius: 8,
          background: PAPER.sheet,
          border: `1px solid ${PAPER.rule}`,
          borderTop: `3px solid ${PAPER.vermilion}`,
          boxShadow: PAPER.shadow,
          padding: "18px 24px",
          boxSizing: "border-box",
          zIndex: 18,
        }}
      >
        <div style={{ fontFamily: FONTS.mono, fontSize: 12.5, fontWeight: 700, color: PAPER.vermilion, letterSpacing: "0.07em" }}>
          PHẪU THUẬT ĐỊA CHẤT • TẢI TRỌNG 4 ĐƯỜNG BĂNG 4.000 M (&gt; 500 TẤN)
        </div>
        <div style={{ fontFamily: FONTS.display, fontSize: 22, fontWeight: 800, color: PAPER.ink, marginTop: 4, letterSpacing: "-0.015em" }}>
          Lớp bùn sét hữu cơ dày hàng chục mét gây lún lệch &amp; đội chi phí xử lý nền
        </div>

        <svg width={830} height={246} style={{ marginTop: 10 }}>
          {/* Runway Surface Slab */}
          <rect x={28} y={32} width={450} height={20} rx={3} fill="#D4CFC0" stroke={PAPER.ink} strokeWidth={1.6} />
          <text x={253} y={22} textAnchor="middle" fill={PAPER.ink} fontFamily={FONTS.mono} fontSize={12} fontWeight={700}>
            MẶT ĐƯỜNG BĂNG 4F • TẢI &gt; 500 TẤN (B747 / A380)
          </text>
          {/* Soft alluvial mud sagging band */}
          <path d="M28,52 L478,52 L478,158 C350,174 160,174 28,158 Z" fill="#C7BFB0" stroke={PAPER.vermilion} strokeWidth={2} />
          {/* Hard deeper stratum */}
          <path d="M28,158 C160,174 350,174 478,158 L478,225 L28,225 Z" fill="#7D7568" stroke={PAPER.ink2} strokeWidth={1.2} />
          {[95, 195, 295, 395].map((px) => (
            <line key={px} x1={px} y1={52} x2={px} y2={215} stroke={PAPER.vermilion} strokeWidth={3.5} strokeDasharray="6 4" opacity={0.72} />
          ))}
          <rect x={64} y={84} width={378} height={64} rx={6} fill="rgba(255, 252, 240, 0.92)" stroke="rgba(16, 15, 15, 0.14)" strokeWidth={1} />
          <text x={253} y={110} textAnchor="middle" fill={PAPER.ink} fontFamily={FONTS.display} fontSize={16.5} fontWeight={800}>
            Tầng bùn sét hữu cơ mềm yếu (15–30+ m)
          </text>
          <text x={253} y={136} textAnchor="middle" fill={PAPER.vermilion} fontFamily={FONTS.mono} fontSize={13} fontWeight={700}>
            NGUY CƠ LÚN LỆCH KHI CẤT HẠ CÁNH
          </text>

          {/* Right Callout Paper Slips */}
          <rect x={510} y={54} width={305} height={74} rx={6} fill={PAPER.sheetAlt} stroke={PAPER.rule} strokeWidth={1.2} />
          <rect x={510} y={54} width={4.5} height={74} rx={2} fill={PAPER.vermilion} />
          <text x={526} y={80} fill={PAPER.vermilion} fontFamily={FONTS.mono} fontSize={12.5} fontWeight={700}>✕ ĐỘI VỐN CỌC SÂU / BẤC THẤM</text>
          <text x={526} y={104} fill={PAPER.ink} fontFamily={FONTS.display} fontSize={15} fontWeight={600}>Gia cố nền kéo dài &amp; chi phí rất lớn</text>

          <rect x={510} y={144} width={305} height={74} rx={6} fill={PAPER.sheetAlt} stroke={PAPER.rule} strokeWidth={1.2} />
          <rect x={510} y={144} width={4.5} height={74} rx={2} fill={PAPER.jade} />
          <text x={526} y={170} fill={PAPER.jade} fontFamily={FONTS.mono} fontSize={12.5} fontWeight={700}>✕ KHÓA SINH QUYỂN CẦN GIỜ</text>
          <text x={526} y={194} fill={PAPER.ink} fontFamily={FONTS.display} fontSize={15} fontWeight={600}>Phải bảo tồn vùng ngập mặn ven biển</text>
        </svg>
      </div>

      {/* Right Half Bottom: Polaroid Mangrove Photo */}
      <EvidencePhotoCard
        photo={REAL_PHOTOS.can_gio_mangrove}
        left={1920 - SAFE_X - 880}
        top={512}
        width={880}
        height={388}
        accentColor={PAPER.jade}
        appearAtSec={1.0}
      />
    </EditorialPaperStage>
  );
};
