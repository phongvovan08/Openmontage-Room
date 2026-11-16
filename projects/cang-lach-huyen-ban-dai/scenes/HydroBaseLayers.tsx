import React, { useEffect, useState } from "react";
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
  BACH_DANG_LINE,
  HAIPHONG_LANDFORMS,
  HAIPHONG_SILT_ZONES,
  KENH_HA_NAM_LINE,
  SONG_CAM_LINE,
} from "../data/haiphongHydroData";
import { SATELLITE_MOSAICS, SatelliteMosaic } from "../data/satelliteManifest";
import {
  CameraBox,
  coordsToScreenPath,
  lonLatToScreen,
  lonToWorld,
  latToWorld,
  worldToScreen,
  WORLD,
} from "../mapMath";
import { FONTS, PALETTE } from "../theme";
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

/** Pre-decode visible satellite mosaic WebPs once per tab before Remotion captures any frame. */
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

/**
 * Multi-zoom Real Sentinel-2 Satellite Basemap (EOX s2cloudless_3857, CC BY 4.0)
 * Uses SVG viewBox cropping so macro z14 zooms never stretch low-zoom textures into million-pixel DOM elements.
 */
export const RealSatelliteBasemap: React.FC<{
  box: CameraBox;
  width?: number;
  height?: number;
  dim?: number;
  showAttribution?: boolean;
  attributionBottom?: number;
  attributionRight?: number;
}> = ({
  box,
  width = 1920,
  height = 1080,
  dim = 0.02,
  showAttribution = false,
  attributionBottom = 14,
  attributionRight = 18,
}) => {
  const BX = GROUND_BLEED.x;
  const BT = GROUND_BLEED.top;
  const BB = GROUND_BLEED.bottom;
  const W_G = width + 2 * BX;
  const H_G = height + BT + BB;

  const [vx, vy, vw, vh] = box;
  const scale = Math.max(width / vw, height / vh);
  const viewW = width / scale;
  const viewH = height / scale;
  const viewX = vx + (vw - viewW) / 2;
  const viewY = vy + (vh - viewH) / 2;
  const extX = viewX - BX / scale;
  const extY = viewY - BT / scale;
  const extW = W_G / scale;
  const extH = H_G / scale;
  const extViewBox: CameraBox = [extX, extY, extW, extH];

  const visible = SATELLITE_MOSAICS.filter((m) =>
    boxIntersects([m.x, m.y, m.w, m.h], extViewBox)
  ).sort((a, b) => a.zoom - b.zoom || b.w - a.w);

  const rawLayers = visible.map((m, idx) => {
    if (idx === 0) return { mosaic: m, opacity: 1 };
    const prevMag = mosaicMagnification(visible[idx - 1], box, width, height);
    return {
      mosaic: m,
      opacity: smoothstep(0.32, 0.78, prevMag),
    };
  });

  // Cull lower-zoom mosaics occluded by a higher-zoom interior OR over-magnified (>16x) under near-full higher coverage
  const layers = rawLayers.filter(({ mosaic: m }, idx) => {
    const selfMag = (m.w / m.pixelWidth) * scale;
    for (let j = idx + 1; j < rawLayers.length; j++) {
      const top = rawLayers[j];
      if (top.opacity < 0.98) continue;
      if (selfMag > 16 && boxCoverage(top.mosaic, extViewBox) >= 0.98) {
        return false;
      }
      if (top.opacity < 0.998) continue;
      const padIn = 0.065 * Math.min(top.mosaic.w, top.mosaic.h);
      const ix0 = top.mosaic.x + padIn;
      const iy0 = top.mosaic.y + padIn;
      const ix1 = top.mosaic.x + top.mosaic.w - padIn;
      const iy1 = top.mosaic.y + top.mosaic.h - padIn;
      if (
        extX >= ix0 &&
        extY >= iy0 &&
        extX + extW <= ix1 &&
        extY + extH <= iy1
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
        backgroundColor: PALETTE.deepSea,
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
            backgroundColor: "#040D18",
            opacity: dim,
          }}
        />
      )}

      {showAttribution && (
        <div
          style={{
            position: "absolute",
            right: attributionRight,
            bottom: attributionBottom,
            padding: "4px 10px",
            borderRadius: 5,
            background: "rgba(5, 13, 24, 0.76)",
            border: "1px solid rgba(148, 163, 184, 0.22)",
            fontFamily: FONTS.mono,
            fontSize: 11,
            color: "rgba(226, 232, 240, 0.78)",
            letterSpacing: "0.02em",
          }}
        >
          Ảnh vệ tinh: Sentinel-2 2016 (EOX CC BY 4.0) • Địa hình: © OpenStreetMap
        </div>
      )}
    </div>
  );
};

function worldToLon(wx: number): number {
  return (wx / WORLD) * 360 - 180;
}

function worldToLat(wy: number): number {
  const n = Math.PI * (1 - (2 * wy) / WORLD);
  return (Math.atan(Math.sinh(n)) * 180) / Math.PI;
}

export const HydroGraticule: React.FC<{
  box: CameraBox;
  lonStep: number;
  latStep: number;
  lonRange: readonly [number, number];
  latRange: readonly [number, number];
  width?: number;
  height?: number;
}> = ({ box, lonStep, latStep, lonRange, latRange, width = 1920, height = 1080 }) => {
  const BX = GROUND_BLEED.x;
  const BT = GROUND_BLEED.top;
  const BB = GROUND_BLEED.bottom;
  const W_G = width + 2 * BX;
  const H_G = height + BT + BB;

  const [vx, vy, vw, vh] = box;
  const scale = Math.max(width / vw, height / vh);
  const viewW = width / scale;
  const viewH = height / scale;
  const viewX = vx + (vw - viewW) / 2;
  const viewY = vy + (vh - viewH) / 2;
  const extX0 = viewX - BX / scale;
  const extY0 = viewY - BT / scale;
  const extX1 = extX0 + W_G / scale;
  const extY1 = extY0 + H_G / scale;

  const lonMin = Math.max(-175, Math.min(lonRange[0], Math.floor(worldToLon(extX0) / lonStep) * lonStep));
  const lonMax = Math.min(175, Math.max(lonRange[1], Math.ceil(worldToLon(extX1) / lonStep) * lonStep));
  const latMin = Math.max(-75, Math.min(latRange[0], Math.floor(worldToLat(extY1) / latStep) * latStep));
  const latMax = Math.min(75, Math.max(latRange[1], Math.ceil(worldToLat(extY0) / latStep) * latStep));

  const safeLonStep = Math.max(lonStep, (lonMax - lonMin) / 48);
  const safeLatStep = Math.max(latStep, (latMax - latMin) / 48);

  const lons: number[] = [];
  for (let lon = lonMin; lon <= lonMax + 0.0001; lon += safeLonStep) {
    lons.push(Number(lon.toFixed(4)));
  }
  const lats: number[] = [];
  for (let lat = latMin; lat <= latMax + 0.0001; lat += safeLatStep) {
    lats.push(Number(lat.toFixed(4)));
  }
  const midLat = (latMin + latMax) / 2;
  const midLon = (lonMin + lonMax) / 2;

  return (
    <svg
      width={W_G}
      height={H_G}
      viewBox={`${-BX} ${-BT} ${W_G} ${H_G}`}
      style={{ position: "absolute", left: -BX, top: -BT, pointerEvents: "none" }}
    >
      {lons.map((lon) => {
        const [x] = lonLatToScreen(box, [lon, midLat], width, height);
        return (
          <line
            key={`lon-${lon}`}
            x1={x}
            y1={-BT}
            x2={x}
            y2={height + BB}
            stroke="rgba(226, 232, 240, 0.11)"
            strokeWidth={1}
            strokeDasharray="4 8"
          />
        );
      })}
      {lats.map((lat) => {
        const [, y] = lonLatToScreen(box, [midLon, lat], width, height);
        return (
          <line
            key={`lat-${lat}`}
            x1={-BX}
            y1={y}
            x2={width + BX}
            y2={y}
            stroke="rgba(226, 232, 240, 0.11)"
            strokeWidth={1}
            strokeDasharray="4 8"
          />
        );
      })}
    </svg>
  );
};

export const NationalWorldLayer: React.FC<{
  box: CameraBox;
  width?: number;
  height?: number;
  showArchipelagoLabels?: boolean;
  showSatellite?: boolean;
  showAttribution?: boolean;
  opacity?: number;
}> = ({
  box,
  width = 1920,
  height = 1080,
  showArchipelagoLabels = true,
  showSatellite = true,
  showAttribution = true,
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
  const viewX = vx + (vw - viewW) / 2;
  const viewY = vy + (vh - viewH) / 2;
  const extX = viewX - BX / pxPerWorld;
  const extY = viewY - BT / pxPerWorld;
  const extW = W_G / pxPerWorld;
  const extH = H_G / pxPerWorld;

  const strokeUnit = 1 / pxPerWorld;
  const extViewBox = `${extX} ${extY} ${extW} ${extH}`;
  const borderOpacity = smoothstep(75, 220, box[2]);

  const [hsX, hsY] = lonLatToScreen(box, HOANG_SA_CENTER, width, height);
  const [tsX, tsY] = lonLatToScreen(box, TRUONG_SA_CENTER, width, height);

  return (
    <div style={{ position: "absolute", inset: 0, opacity }}>
      {showSatellite && (
        <RealSatelliteBasemap
          box={box}
          width={width}
          height={height}
          dim={0.03}
          showAttribution={showAttribution}
        />
      )}

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
              stroke="rgba(226, 232, 240, 0.26)"
              strokeWidth={1.1 * strokeUnit}
            />
          ))}
          {/* Crisp Vietnam national boundary highlighted over real satellite terrain */}
          <path
            d={VIETNAM_PATH.d}
            fill="rgba(56, 189, 248, 0.07)"
            stroke={PALETTE.coastStroke}
            strokeWidth={2.3 * strokeUnit}
            strokeLinejoin="round"
          />
          {/* Sovereignty Archipelagos — Quần đảo Hoàng Sa & Trường Sa */}
          {HOANG_SA_ISLANDS.map(([lon, lat], idx) => (
            <circle
              key={`hs-${idx}`}
              cx={lonToWorld(lon)}
              cy={latToWorld(lat)}
              r={3.4 * strokeUnit}
              fill={PALETTE.sovereignty}
              stroke={PALETTE.coastStroke}
              strokeWidth={1.3 * strokeUnit}
            />
          ))}
          {TRUONG_SA_ISLANDS.map(([lon, lat], idx) => (
            <circle
              key={`ts-${idx}`}
              cx={lonToWorld(lon)}
              cy={latToWorld(lat)}
              r={3.4 * strokeUnit}
              fill={PALETTE.sovereignty}
              stroke={PALETTE.coastStroke}
              strokeWidth={1.3 * strokeUnit}
            />
          ))}
        </svg>
      )}

      {showArchipelagoLabels && (
        <svg
          width={width}
          height={height}
          style={{ position: "absolute", inset: 0, pointerEvents: "none" }}
        >
          {/* Quần đảo Hoàng Sa label (clean atlas typography, no perimeter circle) */}
          <text
            x={hsX + 58}
            y={hsY - 6}
            fill="#FFFFFF"
            stroke="#071320"
            strokeWidth={4}
            paintOrder="stroke"
            fontFamily={FONTS.sans}
            fontSize={18}
            fontWeight={700}
            letterSpacing="0.04em"
          >
            QUẦN ĐẢO HOÀNG SA
          </text>
          <text
            x={hsX + 58}
            y={hsY + 16}
            fill={PALETTE.coastStroke}
            stroke="#071320"
            strokeWidth={3.5}
            paintOrder="stroke"
            fontFamily={FONTS.mono}
            fontSize={13}
            fontWeight={700}
          >
            (VIỆT NAM)
          </text>

          {/* Quần đảo Trường Sa label (clean atlas typography, no perimeter circle) */}
          <text
            x={tsX - 64}
            y={tsY - 42}
            fill="#FFFFFF"
            stroke="#071320"
            strokeWidth={4}
            paintOrder="stroke"
            fontFamily={FONTS.sans}
            fontSize={18}
            fontWeight={700}
            letterSpacing="0.04em"
          >
            QUẦN ĐẢO TRƯỜNG SA
          </text>
          <text
            x={tsX - 64}
            y={tsY - 20}
            fill={PALETTE.coastStroke}
            stroke="#071320"
            strokeWidth={3.5}
            paintOrder="stroke"
            fontFamily={FONTS.mono}
            fontSize={13}
            fontWeight={700}
          >
            (VIỆT NAM)
          </text>
        </svg>
      )}
    </div>
  );
};

export const HaiPhongEstuaryLayer: React.FC<{
  box: CameraBox;
  width?: number;
  height?: number;
  siltOpacity?: number;
  showSatellite?: boolean;
  opacity?: number;
}> = ({
  box,
  width = 1920,
  height = 1080,
  siltOpacity = 0.35,
  showSatellite = true,
  opacity = 1,
}) => {
  const catHai = HAIPHONG_LANDFORMS.find((l) => l.id === "cat_hai_island");

  return (
    <div style={{ position: "absolute", inset: 0, opacity }}>
      {showSatellite && <RealSatelliteBasemap box={box} width={width} height={height} dim={0.02} />}

      <svg
        width={width}
        height={height}
        style={{ position: "absolute", inset: 0, pointerEvents: "none", overflow: "visible" }}
      >
        <defs>
          <radialGradient id="siltPlumeGrad" cx="45%" cy="45%" r="60%">
            <stop offset="0%" stopColor={PALETTE.amberBright} stopOpacity={0.52} />
            <stop offset="65%" stopColor={PALETTE.amberSilt} stopOpacity={0.24} />
            <stop offset="100%" stopColor={PALETTE.amberSilt} stopOpacity={0.0} />
          </radialGradient>
        </defs>

        {/* Translucent contour over real satellite brown silt plumes */}
        {siltOpacity > 0 &&
          HAIPHONG_SILT_ZONES.map((sz) => (
            <path
              key={sz.id}
              d={coordsToScreenPath(box, sz.coords, true, width, height)}
              fill="url(#siltPlumeGrad)"
              stroke={PALETTE.amberBright}
              strokeWidth={1.5}
              strokeDasharray="7 6"
              opacity={siltOpacity}
            />
          ))}

        {/* Real 117-point GPS perimeter highlight on Đảo Cát Hải */}
        {catHai && (
          <path
            d={coordsToScreenPath(box, catHai.coords, true, width, height)}
            fill="rgba(45, 212, 191, 0.11)"
            stroke={PALETTE.tealDeep}
            strokeWidth={2.2}
            strokeLinejoin="round"
          />
        )}

        {/* Real OSM GPS Sông Cấm & Bạch Đằng & Hà Nam navigation axes */}
        <path
          d={coordsToScreenPath(box, SONG_CAM_LINE, false, width, height)}
          fill="none"
          stroke={PALETTE.amberBright}
          strokeWidth={4.5}
          strokeLinecap="round"
          opacity={0.82}
        />
        <path
          d={coordsToScreenPath(box, BACH_DANG_LINE, false, width, height)}
          fill="none"
          stroke="rgba(56, 189, 248, 0.62)"
          strokeWidth={4}
          strokeLinecap="round"
        />
        <path
          d={coordsToScreenPath(box, KENH_HA_NAM_LINE, false, width, height)}
          fill="none"
          stroke="rgba(56, 189, 248, 0.65)"
          strokeWidth={3.5}
          strokeDasharray="8 5"
          strokeLinecap="round"
        />
      </svg>
    </div>
  );
};

/**
 * Animated Hydrographic Map Spotlight Lasso:
 * Draws a high-contrast target perimeter + radar ripple + optional callout badge directly on a map SVG.
 */
export const MapSpotlightLasso: React.FC<{
  cx: number;
  cy: number;
  rx: number;
  ry: number;
  rotationDeg?: number;
  color: string;
  reveal: number;
  pulsePhase?: number;
  label?: string;
  sublabel?: string;
  badgeOffset?: readonly [number, number];
}> = ({
  cx,
  cy,
  rx,
  ry,
  rotationDeg = 0,
  color,
  reveal,
  pulsePhase = 0,
  label,
  sublabel,
  badgeOffset = [0, -76],
}) => {
  if (reveal <= 0.01) return null;
  const draw = Math.max(0, Math.min(1, reveal));
  const bx = cx + badgeOffset[0];
  const by = cy + badgeOffset[1];
  const badgeW = label ? Math.max(216, label.length * 10.5 + 34) : 0;
  const badgeH = sublabel ? 48 : 34;

  return (
    <g opacity={draw}>
      <g transform={`translate(${cx.toFixed(1)}, ${cy.toFixed(1)}) rotate(${rotationDeg})`}>
        {/* Subtle inner zone tint */}
        <ellipse cx={0} cy={0} rx={rx} ry={ry} fill={color} opacity={0.11} />

        {/* Radar pulse ring */}
        <ellipse
          cx={0}
          cy={0}
          rx={rx * (1 + 0.22 * pulsePhase)}
          ry={ry * (1 + 0.22 * pulsePhase)}
          fill="none"
          stroke={color}
          strokeWidth={2}
          opacity={(1 - pulsePhase) * 0.6}
        />

        {/* Dark outer contrast halo */}
        <ellipse
          cx={0}
          cy={0}
          rx={rx}
          ry={ry}
          fill="none"
          stroke="rgba(5, 13, 24, 0.86)"
          strokeWidth={6.5}
          pathLength={1}
          strokeDasharray="1"
          strokeDashoffset={1 - draw}
          strokeLinecap="round"
        />

        {/* Animated primary lasso ring */}
        <ellipse
          cx={0}
          cy={0}
          rx={rx}
          ry={ry}
          fill="none"
          stroke={color}
          strokeWidth={3.2}
          pathLength={1}
          strokeDasharray="1"
          strokeDashoffset={1 - draw}
          strokeLinecap="round"
        />

        {/* Inner dashed survey ring */}
        <ellipse
          cx={0}
          cy={0}
          rx={Math.max(8, rx - 7)}
          ry={Math.max(8, ry - 7)}
          fill="none"
          stroke="#FFFFFF"
          strokeWidth={1.3}
          strokeDasharray="7 5"
          opacity={0.72}
        />
      </g>

      {label && (
        <g opacity={smoothstep(0.35, 1.0, draw)}>
          <line
            x1={cx}
            y1={cy + (badgeOffset[1] < 0 ? -ry : ry)}
            x2={bx}
            y2={by + (badgeOffset[1] < 0 ? badgeH / 2 : -badgeH / 2)}
            stroke={color}
            strokeWidth={2.2}
          />
          <rect
            x={bx - badgeW / 2}
            y={by - badgeH / 2}
            width={badgeW}
            height={badgeH}
            rx={8}
            fill="rgba(7, 19, 32, 0.94)"
            stroke={color}
            strokeWidth={1.8}
          />
          <text
            x={bx}
            y={sublabel ? by - 4 : by + 5}
            textAnchor="middle"
            fill={color}
            fontFamily={FONTS.mono}
            fontSize={14}
            fontWeight={700}
          >
            {label}
          </text>
          {sublabel && (
            <text
              x={bx}
              y={by + 15}
              textAnchor="middle"
              fill={PALETTE.textPrimary}
              fontFamily={FONTS.sans}
              fontSize={13}
              fontWeight={600}
            >
              {sublabel}
            </text>
          )}
        </g>
      )}
    </g>
  );
};
