import React, { useEffect, useId } from "react";
import { cancelRender, continueRender, delayRender, staticFile } from "remotion";
import {
  HOANG_SA_CENTER,
  HOANG_SA_ISLANDS,
  NEIGHBOUR_PATHS,
  TRUONG_SA_CENTER,
  TRUONG_SA_ISLANDS,
  VIETNAM_PATH,
} from "../data/nationalMapData";
import {
  BIEN_HOA_AIRBASE_POLY,
  BIEN_HOA_RUNWAY,
  CAN_GIO_BIOSPHERE_POLY,
  CAU_LONG_THANH_SPAN,
  CAU_NHON_TRACH_SPAN,
  DONG_NAI_RIVER,
  EXPR_BEN_LUC_LONG_THANH,
  EXPR_BIEN_HOA_VUNG_TAU,
  EXPR_HCM_LT_DAU_GIAY,
  LONG_THANH_PERIMETER_5000HA,
  LT_LOTUS_TERMINAL,
  LT_RUNWAY_1_NORTH,
  LT_RUNWAY_2_SOUTH,
  LT_RUNWAY_3_NORTH,
  LT_RUNWAY_4_SOUTH,
  NE_URBAN_WALL_POLY,
  RAIL_THU_THIEM_LONG_THANH,
  RING_ROAD_3_HCMC,
  SAI_GON_RIVER,
  SOUTH_MUD_ZONE_POLY,
  TSN_PERIMETER_791HA,
  TSN_RUNWAY_25L,
  TSN_RUNWAY_25R,
} from "../data/longThanhGeoData";
import { SATELLITE_MOSAICS, SatelliteMosaic } from "../data/satelliteManifest";
import {
  boxOfBounds,
  CameraBox,
  coordsToScreenPath,
  latToWorld,
  lonLatToScreen,
  lonToWorld,
  WORLD,
} from "../mapMath";
import { DARK_SHADOW, FONTS, PALETTE, PAPER, SAFE_X } from "../theme";
import { GROUND_BLEED } from "./Tactical3DKit";

function smoothstep(edge0: number, edge1: number, x: number): number {
  const t = Math.max(0, Math.min(1, (x - edge0) / Math.max(1e-6, edge1 - edge0)));
  return t * t * (3 - 2 * t);
}

function boxIntersects(a: CameraBox, b: CameraBox): boolean {
  return a[0] < b[0] + b[2] && a[0] + a[2] > b[0] && a[1] < b[1] + b[3] && a[1] + a[3] > b[1];
}

function boxCoverage(m: SatelliteMosaic, box: CameraBox): number {
  const ix = Math.max(0, Math.min(m.x + m.w, box[0] + box[2]) - Math.max(m.x, box[0]));
  const iy = Math.max(0, Math.min(m.y + m.h, box[1] + box[3]) - Math.max(m.y, box[1]));
  return (ix * iy) / Math.max(1e-6, box[2] * box[3]);
}

function mosaicMagnification(m: SatelliteMosaic, box: CameraBox, width: number, height: number): number {
  const scale = Math.max(width / box[2], height / box[3]);
  const worldPerMosaicPx = WORLD / Math.pow(2, m.zoom) / 256;
  return scale * worldPerMosaicPx;
}

const DECODED_CACHE = new Map<string, Promise<void>>();

function decodeMosaicOnce(src: string): Promise<void> {
  const cached = DECODED_CACHE.get(src);
  if (cached) return cached;
  const p = new Promise<void>((resolve, reject) => {
    const img = new Image();
    img.src = src;
    img.decode().then(resolve, reject);
  });
  DECODED_CACHE.set(src, p);
  return p;
}

function useDecodedMosaics(mosaics: readonly SatelliteMosaic[]): void {
  const missing = mosaics.filter((m) => !DECODED_CACHE.has(staticFile(m.href)));
  const key = missing.map((m) => m.href).join("|");

  useEffect(() => {
    if (missing.length === 0) return;
    let active = true;
    const handle = delayRender(`decode-satellite:${key}`, { timeoutInMilliseconds: 60000 });
    Promise.all(missing.map((m) => decodeMosaicOnce(staticFile(m.href)))).then(
      () => {
        if (active) continueRender(handle);
      },
      (err) => cancelRender(err)
    );
    return () => {
      active = false;
      continueRender(handle);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [key]);
}

export const RealSatelliteBasemap: React.FC<{
  box: CameraBox;
  width?: number;
  height?: number;
  dim?: number;
}> = ({ box, width = 1920, height = 1080, dim = 0.04 }) => {
  const BX = GROUND_BLEED.x;
  const BT = GROUND_BLEED.top;
  const BB = GROUND_BLEED.bottom;
  const W_G = width + 2 * BX;
  const H_G = height + BT + BB;

  const [vx, vy, vw, vh] = box;
  const scale = Math.max(width / vw, height / vh);
  const viewW = width / scale;
  const viewH = height / scale;
  const extX = vx + (vw - viewW) / 2 - BX / scale;
  const extY = vy + (vh - viewH) / 2 - BT / scale;
  const extW = W_G / scale;
  const extH = H_G / scale;
  const extViewBox: CameraBox = [extX, extY, extW, extH];

  const visible = SATELLITE_MOSAICS.filter((m) => boxIntersects([m.x, m.y, m.w, m.h], extViewBox)).sort(
    (a, b) => a.zoom - b.zoom || b.w - a.w
  );

  const rawLayers = visible.map((m, idx) => {
    let coarserIdx = idx - 1;
    while (coarserIdx >= 0 && visible[coarserIdx].zoom >= m.zoom) {
      coarserIdx -= 1;
    }
    if (coarserIdx < 0) return { mosaic: m, opacity: 1 };
    const prevMag = mosaicMagnification(visible[coarserIdx], box, width, height);
    return { mosaic: m, opacity: smoothstep(0.32, 0.78, prevMag) };
  });

  const layers = rawLayers.filter(({ mosaic: m }, idx) => {
    const selfMag = (m.w / m.pixelWidth) * scale;
    for (let j = idx + 1; j < rawLayers.length; j++) {
      const top = rawLayers[j];
      if (top.opacity < 0.98) continue;
      if (selfMag > 16 && boxCoverage(top.mosaic, extViewBox) >= 0.98) return false;
      if (top.opacity < 0.998) continue;
      const padIn = 0.065 * Math.min(top.mosaic.w, top.mosaic.h);
      if (
        extX >= top.mosaic.x + padIn &&
        extY >= top.mosaic.y + padIn &&
        extX + extW <= top.mosaic.x + top.mosaic.w - padIn &&
        extY + extH <= top.mosaic.y + top.mosaic.h - padIn
      ) {
        return false;
      }
    }
    return true;
  });

  useDecodedMosaics(layers.filter((l) => l.opacity > 0.002).map((l) => l.mosaic));

  return (
    <div
      style={{
        position: "absolute",
        left: -BX,
        top: -BT,
        width: W_G,
        height: H_G,
        overflow: "hidden",
        backgroundColor: PALETTE.abyss,
        pointerEvents: "none",
      }}
    >
      <svg
        width={W_G}
        height={H_G}
        viewBox={`${extX} ${extY} ${extW} ${extH}`}
        preserveAspectRatio="none"
        style={{ position: "absolute", inset: 0 }}
      >
        {layers.map(({ mosaic: m, opacity }) =>
          opacity <= 0.002 ? null : (
            <image
              key={m.id}
              href={staticFile(m.href)}
              x={m.x}
              y={m.y}
              width={m.w}
              height={m.h}
              preserveAspectRatio="none"
              opacity={opacity}
            />
          )
        )}
      </svg>

      {dim > 0.001 && (
        <div
          style={{
            position: "absolute",
            inset: 0,
            backgroundColor: PALETTE.abyss,
            opacity: dim,
          }}
        />
      )}
    </div>
  );
};

export const NationalWorldLayer: React.FC<{
  box: CameraBox;
  width?: number;
  height?: number;
  showArchipelagoLabels?: boolean;
  dim?: number;
  rimColor?: string;
  opacity?: number;
}> = ({
  box,
  width = 1920,
  height = 1080,
  showArchipelagoLabels = true,
  dim = 0.05,
  rimColor = "#F59E0B",
  opacity = 1,
}) => {
  const BX = GROUND_BLEED.x;
  const BT = GROUND_BLEED.top;
  const BB = GROUND_BLEED.bottom;
  const W_G = width + 2 * BX;
  const H_G = height + BT + BB;

  const [vx, vy, vw, vh] = box;
  const pxPerWorld = Math.max(width / vw, height / vh);
  const viewW = width / pxPerWorld;
  const viewH = height / pxPerWorld;
  const extX = vx + (vw - viewW) / 2 - BX / pxPerWorld;
  const extY = vy + (vh - viewH) / 2 - BT / pxPerWorld;
  const strokeUnit = 1 / pxPerWorld;
  const extViewBox = `${extX} ${extY} ${W_G / pxPerWorld} ${H_G / pxPerWorld}`;
  // Fade coarse Natural Earth outlines out cleanly below ~4.8 deg viewport width (880 world units)
  const borderOpacity = smoothstep(320, 920, box[2]);

  const [hsX, hsY] = lonLatToScreen(box, HOANG_SA_CENTER, width, height);
  const [tsX, tsY] = lonLatToScreen(box, TRUONG_SA_CENTER, width, height);

  return (
    <div style={{ position: "absolute", inset: 0, opacity }}>
      <RealSatelliteBasemap box={box} width={width} height={height} dim={dim} />

      {borderOpacity > 0.005 && (
        <svg
          width={W_G}
          height={H_G}
          viewBox={extViewBox}
          preserveAspectRatio="none"
          style={{ position: "absolute", left: -BX, top: -BT, opacity: borderOpacity }}
        >
          {NEIGHBOUR_PATHS.map((nb) => (
            <path
              key={nb.iso}
              d={nb.d}
              fill="none"
              stroke="rgba(226, 232, 240, 0.22)"
              strokeWidth={1.0 * strokeUnit}
            />
          ))}
          {/* 2-Layer Luminous Coastline/Territory Rim (outer warm glow halo + crisp core stroke) */}
          <path
            d={VIETNAM_PATH.d}
            fill="none"
            stroke={rimColor}
            strokeOpacity={0.28}
            strokeWidth={6.5 * strokeUnit}
            strokeLinejoin="round"
          />
          <path
            d={VIETNAM_PATH.d}
            fill="rgba(56, 189, 248, 0.07)"
            stroke="#FDE68A"
            strokeWidth={2.0 * strokeUnit}
            strokeLinejoin="round"
          />
          {HOANG_SA_ISLANDS.map(([lon, lat], idx) => (
            <circle
              key={`hs-${idx}`}
              cx={lonToWorld(lon)}
              cy={latToWorld(lat)}
              r={3.2 * strokeUnit}
              fill={PALETTE.goldCaution}
              stroke="#FFFFFF"
              strokeWidth={1.1 * strokeUnit}
            />
          ))}
          {TRUONG_SA_ISLANDS.map(([lon, lat], idx) => (
            <circle
              key={`ts-${idx}`}
              cx={lonToWorld(lon)}
              cy={latToWorld(lat)}
              r={3.2 * strokeUnit}
              fill={PALETTE.goldCaution}
              stroke="#FFFFFF"
              strokeWidth={1.1 * strokeUnit}
            />
          ))}
        </svg>
      )}

      {showArchipelagoLabels && borderOpacity > 0.14 && (
        <svg width={width} height={height} style={{ position: "absolute", inset: 0, pointerEvents: "none" }}>
          <text
            x={hsX + 28}
            y={hsY - 8}
            fill={PALETTE.ivory}
            stroke={PALETTE.abyss}
            strokeWidth={4.2}
            paintOrder="stroke"
            fontFamily={FONTS.display}
            fontSize={16.5}
            fontWeight={700}
            letterSpacing="0.04em"
          >
            QUẦN ĐẢO HOÀNG SA
          </text>
          <text
            x={hsX + 28}
            y={hsY + 12}
            fill={PALETTE.skyCyan}
            stroke={PALETTE.abyss}
            strokeWidth={3.8}
            paintOrder="stroke"
            fontFamily={FONTS.mono}
            fontSize={12.5}
            fontWeight={700}
          >
            (VIỆT NAM)
          </text>

          <text
            x={tsX - 24}
            y={tsY - 30}
            textAnchor="end"
            fill={PALETTE.ivory}
            stroke={PALETTE.abyss}
            strokeWidth={4.2}
            paintOrder="stroke"
            fontFamily={FONTS.display}
            fontSize={16.5}
            fontWeight={700}
            letterSpacing="0.04em"
          >
            QUẦN ĐẢO TRƯỜNG SA
          </text>
          <text
            x={tsX - 24}
            y={tsY - 10}
            textAnchor="end"
            fill={PALETTE.skyCyan}
            stroke={PALETTE.abyss}
            strokeWidth={3.8}
            paintOrder="stroke"
            fontFamily={FONTS.mono}
            fontSize={12.5}
            fontWeight={700}
          >
            (VIỆT NAM)
          </text>
        </svg>
      )}
    </div>
  );
};

export const DongNamBoCorridorLayer: React.FC<{
  box: CameraBox;
  width?: number;
  height?: number;
  dim?: number;
  showRivers?: boolean;
  showAirports?: boolean;
  showRunways?: boolean;
  showRoads?: boolean;
  showRail?: boolean;
  showBridges?: boolean;
  showZones?: boolean;
}> = ({
  box,
  width = 1920,
  height = 1080,
  dim = 0.04,
  showRivers = true,
  showAirports = true,
  showRunways = true,
  showRoads = false,
  showRail = false,
  showBridges = false,
  showZones = false,
}) => (
  <div style={{ position: "absolute", inset: 0 }}>
    <RealSatelliteBasemap box={box} width={width} height={height} dim={dim} />
    <svg width={width} height={height} style={{ position: "absolute", inset: 0, pointerEvents: "none", overflow: "visible" }}>
      {showZones && (
        <>
          <path d={coordsToScreenPath(box, CAN_GIO_BIOSPHERE_POLY, true, width, height)} fill="rgba(45, 212, 191, 0.14)" stroke={PALETTE.tealAirport} strokeWidth={2.2} strokeDasharray="8 6" />
          <path d={coordsToScreenPath(box, SOUTH_MUD_ZONE_POLY, true, width, height)} fill="rgba(148, 163, 184, 0.16)" stroke="#94A3B8" strokeWidth={1.8} strokeDasharray="6 6" />
          <path d={coordsToScreenPath(box, NE_URBAN_WALL_POLY, true, width, height)} fill="rgba(244, 63, 94, 0.14)" stroke={PALETTE.coralAlert} strokeWidth={2.2} strokeDasharray="6 5" />
        </>
      )}

      {showRivers && (
        <>
          <path d={coordsToScreenPath(box, DONG_NAI_RIVER, false, width, height)} fill="none" stroke="rgba(56, 189, 248, 0.55)" strokeWidth={4} strokeLinecap="round" strokeLinejoin="round" />
          <path d={coordsToScreenPath(box, SAI_GON_RIVER, false, width, height)} fill="none" stroke="rgba(56, 189, 248, 0.50)" strokeWidth={3.5} strokeLinecap="round" strokeLinejoin="round" />
        </>
      )}

      {showRoads && (
        <>
          <path d={coordsToScreenPath(box, EXPR_HCM_LT_DAU_GIAY, false, width, height)} fill="none" stroke="rgba(45, 212, 191, 0.25)" strokeWidth={11} strokeLinecap="round" />
          <path d={coordsToScreenPath(box, EXPR_HCM_LT_DAU_GIAY, false, width, height)} fill="none" stroke={PALETTE.tealAirport} strokeWidth={4.2} strokeLinecap="round" />
          <path d={coordsToScreenPath(box, RING_ROAD_3_HCMC, false, width, height)} fill="none" stroke="rgba(56, 189, 248, 0.24)" strokeWidth={10} strokeLinecap="round" />
          <path d={coordsToScreenPath(box, RING_ROAD_3_HCMC, false, width, height)} fill="none" stroke={PALETTE.skyCyan} strokeWidth={3.8} strokeLinecap="round" />
          <path d={coordsToScreenPath(box, EXPR_BEN_LUC_LONG_THANH, false, width, height)} fill="none" stroke={PALETTE.mist} strokeWidth={3} strokeDasharray="10 6" strokeLinecap="round" />
          <path d={coordsToScreenPath(box, EXPR_BIEN_HOA_VUNG_TAU, false, width, height)} fill="none" stroke={PALETTE.lateriteAmber} strokeWidth={3.6} strokeLinecap="round" />
        </>
      )}

      {showRail && (
        <path d={coordsToScreenPath(box, RAIL_THU_THIEM_LONG_THANH, false, width, height)} fill="none" stroke={PALETTE.goldCaution} strokeWidth={4} strokeDasharray="12 6" strokeLinecap="round" />
      )}

      {showBridges && (
        <>
          <path d={coordsToScreenPath(box, CAU_LONG_THANH_SPAN, false, width, height)} fill="none" stroke={PALETTE.goldCaution} strokeWidth={8} strokeLinecap="butt" />
          <path d={coordsToScreenPath(box, CAU_NHON_TRACH_SPAN, false, width, height)} fill="none" stroke={PALETTE.coralAlert} strokeWidth={8} strokeLinecap="butt" />
        </>
      )}

      {showAirports && (
        <>
          <path d={coordsToScreenPath(box, TSN_PERIMETER_791HA, true, width, height)} fill="none" stroke={PALETTE.coralAlert} strokeOpacity={0.32} strokeWidth={8} strokeLinejoin="round" />
          <path d={coordsToScreenPath(box, TSN_PERIMETER_791HA, true, width, height)} fill="rgba(244, 63, 94, 0.16)" stroke={PALETTE.coralAlert} strokeWidth={2.8} strokeLinejoin="round" />
          <path d={coordsToScreenPath(box, LONG_THANH_PERIMETER_5000HA, true, width, height)} fill="none" stroke={PALETTE.tealAirport} strokeOpacity={0.30} strokeWidth={9} strokeLinejoin="round" />
          <path d={coordsToScreenPath(box, LONG_THANH_PERIMETER_5000HA, true, width, height)} fill="rgba(45, 212, 191, 0.13)" stroke={PALETTE.tealAirport} strokeWidth={2.8} strokeLinejoin="round" />
          <path d={coordsToScreenPath(box, BIEN_HOA_AIRBASE_POLY, true, width, height)} fill="rgba(234, 88, 12, 0.15)" stroke={PALETTE.lateriteAmber} strokeWidth={2.2} strokeLinejoin="round" />
        </>
      )}

      {showRunways && (
        <>
          <path d={coordsToScreenPath(box, TSN_RUNWAY_25R, false, width, height)} stroke={PALETTE.skyCyan} strokeWidth={3.5} strokeLinecap="round" />
          <path d={coordsToScreenPath(box, TSN_RUNWAY_25L, false, width, height)} stroke={PALETTE.skyCyan} strokeWidth={3.5} strokeLinecap="round" />
          <path d={coordsToScreenPath(box, BIEN_HOA_RUNWAY, false, width, height)} stroke={PALETTE.lateriteAmber} strokeWidth={3} strokeLinecap="round" />
          <path d={coordsToScreenPath(box, LT_RUNWAY_1_NORTH, false, width, height)} stroke={PALETTE.tealAirport} strokeWidth={4} strokeLinecap="round" />
          <path d={coordsToScreenPath(box, LT_RUNWAY_3_NORTH, false, width, height)} stroke={PALETTE.tealAirport} strokeWidth={4} strokeLinecap="round" />
          <path d={coordsToScreenPath(box, LT_RUNWAY_2_SOUTH, false, width, height)} stroke={PALETTE.goldCaution} strokeWidth={3} strokeDasharray="8 5" />
          <path d={coordsToScreenPath(box, LT_RUNWAY_4_SOUTH, false, width, height)} stroke={PALETTE.goldCaution} strokeWidth={3} strokeDasharray="8 5" />
          <path d={coordsToScreenPath(box, LT_LOTUS_TERMINAL, true, width, height)} fill="rgba(250, 204, 21, 0.22)" stroke={PALETTE.goldCaution} strokeWidth={2} />
        </>
      )}
    </svg>
  </div>
);

const MINI_BOX = boxOfBounds({ west: 101.6, south: 7.4, east: 115.6, north: 23.6 }, 0.04, 168 / 218);

/** Corner Vietnam Locator Mini-Map Inset (Reference Video 1 pattern) showing full S-shape + HS/TS + active target ping */
export const VietnamMiniLocator: React.FC<{
  targetLonLat?: readonly [number, number];
  label?: string;
  accent?: string;
  left?: number;
  right?: number;
  top?: number;
  bottom?: number;
}> = ({
  targetLonLat = [106.85, 10.79],
  label = "ĐÔNG NAM BỘ",
  accent = PALETTE.tealAirport,
  left,
  right = SAFE_X,
  top,
  bottom = 112,
}) => {
  const uid = useId().replace(/[^a-zA-Z0-9]/g, "");
  const w = 168;
  const h = 218;
  const [vx, vy, vw, vh] = MINI_BOX;
  const pxPerWorld = Math.max(w / vw, h / vh);
  const viewW = w / pxPerWorld;
  const viewH = h / pxPerWorld;
  const vb = `${vx + (vw - viewW) / 2} ${vy + (vh - viewH) / 2} ${viewW} ${viewH}`;
  const strokeU = 1 / pxPerWorld;
  const [tx, ty] = lonLatToScreen(MINI_BOX, targetLonLat, w, h);

  return (
    <div
      style={{
        position: "absolute",
        left,
        right: left !== undefined ? undefined : right,
        top,
        bottom: top !== undefined ? undefined : bottom,
        width: w,
        height: h,
        borderRadius: 10,
        background: "rgba(20, 19, 18, 0.92)",
        border: `1px solid ${PALETTE.borderHairline}`,
        borderTop: `3px solid ${accent}`,
        boxShadow: DARK_SHADOW,
        overflow: "hidden",
        pointerEvents: "none",
        zIndex: 28,
      }}
    >
      <svg width={w} height={h} viewBox={vb} style={{ position: "absolute", inset: 0 }}>
        <path
          id={`mini-vn-${uid}`}
          d={VIETNAM_PATH.d}
          fill="rgba(229, 175, 40, 0.16)"
          stroke="#E5AF28"
          strokeWidth={1.6 * strokeU}
          strokeLinejoin="round"
        />
        {HOANG_SA_ISLANDS.slice(0, 5).map(([lo, la], i) => (
          <circle key={`mhs-${i}`} cx={lonToWorld(lo)} cy={latToWorld(la)} r={2.1 * strokeU} fill={PALETTE.goldCaution} />
        ))}
        {TRUONG_SA_ISLANDS.slice(0, 6).map(([lo, la], i) => (
          <circle key={`mts-${i}`} cx={lonToWorld(lo)} cy={latToWorld(la)} r={2.1 * strokeU} fill={PALETTE.goldCaution} />
        ))}
      </svg>
      <svg width={w} height={h} style={{ position: "absolute", inset: 0 }}>
        <circle cx={tx} cy={ty} r={14} fill={accent} opacity={0.22} stroke={accent} strokeWidth={1.6} />
        <circle cx={tx} cy={ty} r={4.5} fill={accent} stroke="#FFFCF0" strokeWidth={1.5} />
        <rect x={10} y={h - 28} width={w - 20} height={20} rx={4} fill="rgba(16, 15, 15, 0.92)" stroke={PALETTE.borderHairline} strokeWidth={1} />
        <text x={w / 2} y={h - 14} textAnchor="middle" fill={accent} fontFamily={FONTS.mono} fontSize={10.5} fontWeight={700}>
          ⌖ {label}
        </text>
      </svg>
    </div>
  );
};

export const KpiMetricCard: React.FC<{
  left?: number;
  right?: number;
  top?: number;
  bottom?: number;
  width: number;
  value: string;
  label: string;
  sublabel?: string;
  accent?: string;
  opacity?: number;
  variant?: "dark" | "paper";
}> = ({ left, right, top, bottom, width, value, label, sublabel, accent = PALETTE.skyCyan, opacity = 1, variant = "dark" }) => {
  const isPaper = variant === "paper";
  return (
    <div
      style={{
        position: "absolute",
        left,
        right,
        top,
        bottom,
        width,
        padding: "16px 20px",
        borderRadius: 10,
        background: isPaper ? PAPER.sheet : PALETTE.cardBg,
        border: isPaper ? `1px solid ${PAPER.rule}` : `1px solid ${PALETTE.borderHairline}`,
        borderLeft: `4px solid ${accent}`,
        boxShadow: isPaper ? PAPER.shadow : DARK_SHADOW,
        boxSizing: "border-box",
        opacity,
        zIndex: 24,
      }}
    >
      <div style={{ fontFamily: FONTS.mono, fontSize: 12, fontWeight: 700, color: accent, letterSpacing: "0.06em" }}>
        {label}
      </div>
      <div
        style={{
          fontFamily: FONTS.display,
          fontSize: 34,
          fontWeight: 800,
          color: isPaper ? PAPER.ink : PALETTE.ivory,
          lineHeight: 1.15,
          marginTop: 4,
          fontVariantNumeric: "tabular-nums",
        }}
      >
        {value}
      </div>
      {sublabel && (
        <div style={{ fontFamily: FONTS.display, fontSize: 15, fontWeight: 500, color: isPaper ? PAPER.ink2 : PALETTE.mist, marginTop: 6, lineHeight: 1.38 }}>
          {sublabel}
        </div>
      )}
    </div>
  );
};
