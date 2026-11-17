import React from "react";
import { interpolate, useCurrentFrame, useVideoConfig } from "remotion";
import { LONG_THANH_PERIMETER_5000HA, LT_CENTER, LT_LOTUS_TERMINAL, LT_RUNWAY_1_NORTH, LT_RUNWAY_3_NORTH } from "../data/longThanhGeoData";
import { REAL_PHOTOS } from "../data/realPhotosManifest";
import { boxOfBounds, coordsToScreenPath, lonLatToScreen } from "../mapMath";
import { DARK_SHADOW, FONTS, PALETTE, SAFE_X } from "../theme";
import { RealSatelliteBasemap, VietnamMiniLocator } from "./AviationBaseLayers";
import { EvidencePhotoCard } from "./EvidencePhotoCard";
import { createProjector3D, RadarRangeFan, SceneHeaderPill, Tactical3DBeacon, Tactical3DStage } from "./Tactical3DKit";

const BOX_LT_Z14 = boxOfBounds({ west: 106.992, south: 10.722, east: 107.114, north: 10.824 }, 0.04);

const UNLOCKS = [
  { title: "✓ ĐỊA CHẤT ĐẤT ĐỎ BAZAN CỔ", sub: "Cốt nền cao ráo, chịu tải > 500 tấn, hoàn toàn thoát ngập triều", color: PALETTE.tealAirport },
  { title: "✓ NÔNG TRƯỜNG CAO SU LIỀN MẠCH", sub: "Ít dân cư phân tán, giải phóng gọn một khối 5.000 ha", color: PALETTE.goldCaution },
  { title: "✓ BẦU TRỜI BÌNH SƠN ĐỘC LẬP", sub: "Không cắt cao ốc TP.HCM, tách khỏi vùng bay Biên Hòa & TSN", color: PALETTE.skyCyan },
];

export const Scene11: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps, durationInFrames } = useVideoConfig();
  const sec = frame / fps;
  const yaw = interpolate(sec, [0, durationInFrames / fps], [-10, 6]);
  const sweepDeg = (sec * 42) % 360;

  const spec = { width: 1920, height: 1080, pitchDeg: 50, yawDeg: yaw, mapScale: 1.05, ty: 56 };
  const proj = createProjector3D(spec);
  const [ax, ay] = lonLatToScreen(BOX_LT_Z14, LT_CENTER);
  const [pax, pay] = proj(ax, ay, 0);

  return (
    <Tactical3DStage
      spec={spec}
      horizonAccent={PALETTE.tealAirport}
      compassBearingDeg={54}
      groundChildren={
        <>
          <RealSatelliteBasemap box={BOX_LT_Z14} dim={0.03} />
          <svg width={1920} height={1080} style={{ position: "absolute", inset: 0 }}>
            <path d={coordsToScreenPath(BOX_LT_Z14, LONG_THANH_PERIMETER_5000HA, true)} fill="none" stroke={PALETTE.tealAirport} strokeOpacity={0.34} strokeWidth={12} />
            <path d={coordsToScreenPath(BOX_LT_Z14, LONG_THANH_PERIMETER_5000HA, true)} fill="rgba(45, 212, 191, 0.11)" stroke={PALETTE.tealAirport} strokeWidth={3.8} />
            <path d={coordsToScreenPath(BOX_LT_Z14, LT_LOTUS_TERMINAL, true)} fill="rgba(250, 204, 21, 0.25)" stroke={PALETTE.goldCaution} strokeWidth={3} />
            <path d={coordsToScreenPath(BOX_LT_Z14, LT_RUNWAY_1_NORTH, false)} stroke={PALETTE.skyCyan} strokeWidth={5} />
            <path d={coordsToScreenPath(BOX_LT_Z14, LT_RUNWAY_3_NORTH, false)} stroke={PALETTE.tealAirport} strokeWidth={4} />
          </svg>
        </>
      }
      overlayChildren={
        <>
          <svg width={1920} height={1080} style={{ position: "absolute", inset: 0, pointerEvents: "none" }}>
            <RadarRangeFan cx={pax} cy={pay} radii={[72, 128]} sweepDeg={sweepDeg} color={PALETTE.tealAirport} />
            <Tactical3DBeacon box={BOX_LT_Z14} proj={proj} lonLat={LT_CENTER} label="Bình Sơn – Long Thành (40 km)" sublabel="5.000 HA • ĐẤT ĐỎ BAZAN CỔ" color={PALETTE.tealAirport} heightPx={132} align="right" />
          </svg>

          <SceneHeaderPill badge="11 • ĐIỂM RƠI 40 KM BÌNH SƠN" title="Ba ổ khóa địa chất, mặt bằng và bầu trời đồng loạt mở ra" accent={PALETTE.tealAirport} />

          {/* Left Column: 3 Gold-Standard Unlock Badges */}
          <div style={{ position: "absolute", left: SAFE_X, top: 126, width: 470, display: "flex", flexDirection: "column", gap: 12, zIndex: 24 }}>
            {UNLOCKS.map((u, i) => {
              const op = interpolate(sec, [2.0 + i * 2.2, 3.2 + i * 2.2], [0.25, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
              return (
                <div
                  key={u.title}
                  style={{
                    padding: "12px 16px",
                    borderRadius: 10,
                    background: PALETTE.cardBg,
                    border: `1px solid ${PALETTE.borderHairline}`,
                    borderLeft: `4px solid ${u.color}`,
                    boxShadow: DARK_SHADOW,
                    opacity: op,
                  }}
                >
                  <div style={{ fontFamily: FONTS.mono, fontSize: 13.5, fontWeight: 700, color: u.color }}>{u.title}</div>
                  <div style={{ fontFamily: FONTS.display, fontSize: 15, fontWeight: 600, color: PALETTE.ivory, marginTop: 4, lineHeight: 1.32 }}>{u.sub}</div>
                </div>
              );
            })}
          </div>

          <EvidencePhotoCard
            photo={REAL_PHOTOS.rubber_plantation_dn}
            left={1920 - SAFE_X - 430}
            top={126}
            width={430}
            height={272}
            accentColor={PALETTE.goldCaution}
            anchorPoint={[pax, pay]}
            appearAtSec={1.2}
          />

          <VietnamMiniLocator targetLonLat={LT_CENTER} label="BÌNH SƠN • 40 KM" accent={PALETTE.tealAirport} right={SAFE_X} bottom={112} />
        </>
      }
    />
  );
};
