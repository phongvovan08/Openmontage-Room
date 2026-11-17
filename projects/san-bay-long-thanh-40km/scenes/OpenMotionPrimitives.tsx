import React, { useEffect, useId, useState } from "react";
import { cancelRender, continueRender, delayRender, Easing, interpolate, staticFile } from "remotion";
import { CameraBox, LonLat, lonLatToScreen } from "../mapMath";
import { FONTS, PALETTE, PAPER } from "../theme";
import { projectGeoPoint, Projector3D, sampleGeoPolyline } from "./Tactical3DKit";

function clamp01(v: number): number {
  return Math.max(0, Math.min(1, v));
}

function easeOutBack(t: number, overshoot = 2.2): number {
  const u = clamp01(t) - 1;
  return 1 + (overshoot + 1) * u * u * u + overshoot * u * u;
}

/**
 * 3-Layer Progressive Luminous Route + Waypoint Breadcrumb Ticks (adapted from openmotion nyc-paris-flight).
 * Staggers outer glow -> crisp core -> bright center thread via pathLength=1,
 * while breadcrumb ticks along the corridor pop as the vehicle passes and fade to 0.26 resting glow.
 */
export const Luminous3LayerRoute: React.FC<{
  coords: readonly LonLat[];
  box: CameraBox;
  project?: Projector3D;
  gz?: number;
  reveal: number;
  tickProgress?: number;
  tickCount?: number;
  showTicks?: boolean;
  color?: string;
  coreWidth?: number;
  dashedCore?: boolean;
}> = ({
  coords,
  box,
  project,
  gz = 4,
  reveal,
  tickProgress = 0,
  tickCount = 9,
  showTicks = false,
  color = PALETTE.goldCaution,
  coreWidth = 7.5,
  dashedCore = false,
}) => {
  if (reveal <= 0.005 || coords.length < 2) return null;

  const samplePts = sampleGeoPolyline(coords, 48);
  const screenPts: Array<[number, number]> = samplePts.map((c) => {
    const [gx, gy] = lonLatToScreen(box, c, 1920, 1080);
    if (!project) return [gx, gy];
    const [sx, sy] = project(gx, gy, gz);
    return [sx, sy];
  });
  const d = screenPts.map((p, i) => `${i === 0 ? "M" : "L"}${p[0].toFixed(1)},${p[1].toFixed(1)}`).join(" ");

  const revGlow = clamp01(reveal * 1.08);
  const revCore = clamp01(reveal);
  const revThread = clamp01((reveal - 0.07) / 0.93);

  const tickGeo = sampleGeoPolyline(coords, Math.max(3, tickCount));
  const ticks = tickGeo.map((c, idx) => {
    const pos = idx / Math.max(1, tickGeo.length - 1);
    const [gx, gy] = lonLatToScreen(box, c, 1920, 1080);
    const [sx, sy] = project ? project(gx, gy, gz + 2) : [gx, gy];
    return { pos, sx, sy, idx };
  });

  return (
    <g>
      {/* Layer 1: Wide Luminous Glow Aura */}
      <path
        d={d}
        fill="none"
        stroke={color}
        strokeOpacity={0.22}
        strokeWidth={coreWidth * 2.9}
        strokeLinecap="round"
        strokeLinejoin="round"
        pathLength={1}
        strokeDasharray="1"
        strokeDashoffset={1 - revGlow}
      />
      {/* Layer 2: Crisp Saturated Core Stroke */}
      <path
        d={d}
        fill="none"
        stroke="#100F0F"
        strokeOpacity={0.68}
        strokeWidth={coreWidth + 4}
        strokeLinecap="round"
        strokeLinejoin="round"
        pathLength={1}
        strokeDasharray="1"
        strokeDashoffset={1 - revCore}
      />
      <path
        d={d}
        fill="none"
        stroke={color}
        strokeWidth={coreWidth}
        strokeLinecap="round"
        strokeLinejoin="round"
        pathLength={1}
        strokeDasharray={dashedCore ? undefined : "1"}
        strokeDashoffset={dashedCore ? undefined : 1 - revCore}
      />
      {/* Layer 3: Inner White Telemetry Thread (time-offset behind core) */}
      <path
        d={d}
        fill="none"
        stroke="#FFFCF0"
        strokeOpacity={0.86}
        strokeWidth={Math.max(2.0, coreWidth * 0.34)}
        strokeLinecap="round"
        strokeLinejoin="round"
        pathLength={1}
        strokeDasharray="1"
        strokeDashoffset={1 - revThread}
      />

      {/* Progressive Waypoint Breadcrumb Ticks (optional, off by default per clean cartography rules) */}
      {showTicks &&
        ticks.map((tk) => {
          if (tickProgress < tk.pos - 0.015) return null;
          const dt = tickProgress - tk.pos;
          const popScale =
            dt < 0.06
              ? interpolate(dt, [-0.015, 0.06], [0.2, 1.32], {
                  extrapolateLeft: "clamp",
                  extrapolateRight: "clamp",
                })
              : interpolate(dt, [0.06, 0.18], [1.32, 0.72], {
                  extrapolateLeft: "clamp",
                  extrapolateRight: "clamp",
                });
          const tickOpacity =
            dt < 0.06
              ? interpolate(dt, [-0.015, 0.03], [0, 0.98], {
                  extrapolateLeft: "clamp",
                  extrapolateRight: "clamp",
                })
              : interpolate(dt, [0.06, 0.18], [0.98, 0.30], {
                  extrapolateLeft: "clamp",
                  extrapolateRight: "clamp",
                });
          if (tickOpacity <= 0.02) return null;
          return (
            <g key={tk.idx} opacity={tickOpacity} transform={`translate(${tk.sx.toFixed(1)}, ${tk.sy.toFixed(1)}) scale(${popScale.toFixed(3)})`}>
              <circle cx={0} cy={0} r={9} fill={color} opacity={0.28} />
              <circle cx={0} cy={0} r={4.4} fill="#FFFCF0" stroke="#100F0F" strokeWidth={1.6} />
            </g>
          );
        })}
    </g>
  );
};

/**
 * Vox / OpenMotion Sketchy Twin-Stroke Hand-Drawn Marker Doodle (Bezier loops, emphatic underlines, or organic cross marks).
 */
export const VoxSketchDoodle: React.FC<{
  cx: number;
  cy: number;
  rx?: number;
  ry?: number;
  variant?: "circle" | "underline" | "cross";
  color?: string;
  reveal: number;
  strokeWidth?: number;
  rotationDeg?: number;
}> = ({
  cx,
  cy,
  rx = 88,
  ry = 48,
  variant = "circle",
  color = PALETTE.coralAlert,
  reveal,
  strokeWidth = 4.6,
  rotationDeg = -4,
}) => {
  if (reveal <= 0.01) return null;
  const r1 = clamp01(reveal * 1.25);
  const r2 = clamp01((reveal - 0.20) / 0.80);

  if (variant === "cross") {
    const c1 = clamp01(reveal * 1.85);
    const c2 = clamp01((reveal - 0.38) / 0.62);
    const d1 = `M ${(cx - rx).toFixed(1)},${(cy - ry).toFixed(1)} Q ${(cx + rx * 0.05).toFixed(1)},${(cy - ry * 0.06).toFixed(1)} ${(cx + rx).toFixed(1)},${(cy + ry).toFixed(1)}`;
    const d2 = `M ${(cx + rx).toFixed(1)},${(cy - ry).toFixed(1)} Q ${(cx - rx * 0.06).toFixed(1)},${(cy + ry * 0.05).toFixed(1)} ${(cx - rx).toFixed(1)},${(cy + ry).toFixed(1)}`;
    return (
      <g transform={`rotate(${rotationDeg} ${cx} ${cy})`}>
        <path
          d={d1}
          fill="none"
          stroke="rgba(16, 15, 15, 0.84)"
          strokeWidth={strokeWidth + 3.6}
          strokeLinecap="round"
          pathLength={1}
          strokeDasharray="1"
          strokeDashoffset={1 - c1}
        />
        <path
          d={d1}
          fill="none"
          stroke={color}
          strokeWidth={strokeWidth}
          strokeLinecap="round"
          pathLength={1}
          strokeDasharray="1"
          strokeDashoffset={1 - c1}
        />
        {c2 > 0.01 && (
          <>
            <path
              d={d2}
              fill="none"
              stroke="rgba(16, 15, 15, 0.84)"
              strokeWidth={strokeWidth + 3.6}
              strokeLinecap="round"
              pathLength={1}
              strokeDasharray="1"
              strokeDashoffset={1 - c2}
            />
            <path
              d={d2}
              fill="none"
              stroke={color}
              strokeWidth={strokeWidth}
              strokeLinecap="round"
              pathLength={1}
              strokeDasharray="1"
              strokeDashoffset={1 - c2}
            />
          </>
        )}
      </g>
    );
  }

  if (variant === "underline") {
    const x0 = cx - rx;
    const x1 = cx + rx;
    const mid = cx;
    const dMain = `M${x0.toFixed(1)},${(cy + 2).toFixed(1)} Q${mid.toFixed(1)},${(cy - 6).toFixed(1)} ${x1.toFixed(1)},${(cy + 1).toFixed(1)}`;
    const dEcho = `M${(x0 + rx * 0.14).toFixed(1)},${(cy + 9).toFixed(1)} Q${mid.toFixed(1)},${(cy + 4).toFixed(1)} ${(x1 - rx * 0.1).toFixed(1)},${(cy + 8).toFixed(1)}`;
    return (
      <g transform={`rotate(${rotationDeg} ${cx} ${cy})`}>
        <path
          d={dMain}
          fill="none"
          stroke={color}
          strokeWidth={strokeWidth}
          strokeLinecap="round"
          pathLength={1}
          strokeDasharray="1"
          strokeDashoffset={1 - r1}
        />
        <path
          d={dEcho}
          fill="none"
          stroke={color}
          strokeOpacity={0.72}
          strokeWidth={strokeWidth * 0.68}
          strokeLinecap="round"
          pathLength={1}
          strokeDasharray="1"
          strokeDashoffset={1 - r2}
        />
      </g>
    );
  }

  // Organic twin-pass open Bezier marker ring (like openmotion nyc-paris-flight #doodle-a & #doodle-b)
  const pathA = [
    `M ${(cx + rx * 0.15).toFixed(1)} ${(cy - ry * 0.92).toFixed(1)}`,
    `C ${(cx - rx * 0.85).toFixed(1)} ${(cy - ry * 1.05).toFixed(1)}, ${(cx - rx * 1.08).toFixed(1)} ${(cy - ry * 0.12).toFixed(1)}, ${(cx - rx * 0.92).toFixed(1)} ${(cy + ry * 0.45).toFixed(1)}`,
    `C ${(cx - rx * 0.65).toFixed(1)} ${(cy + ry * 1.05).toFixed(1)}, ${(cx + rx * 0.72).toFixed(1)} ${(cy + ry * 1.02).toFixed(1)}, ${(cx + rx * 0.96).toFixed(1)} ${(cy + ry * 0.25).toFixed(1)}`,
    `C ${(cx + rx * 1.12).toFixed(1)} ${(cy - ry * 0.48).toFixed(1)}, ${(cx + rx * 0.42).toFixed(1)} ${(cy - ry * 1.02).toFixed(1)}, ${(cx - rx * 0.18).toFixed(1)} ${(cy - ry * 0.82).toFixed(1)}`,
  ].join(" ");
  const pathB = [
    `M ${(cx - rx * 0.22).toFixed(1)} ${(cy - ry * 0.88).toFixed(1)}`,
    `C ${(cx - rx * 1.02).toFixed(1)} ${(cy - ry * 0.62).toFixed(1)}, ${(cx - rx * 0.98).toFixed(1)} ${(cy + ry * 0.55).toFixed(1)}, ${(cx - rx * 0.25).toFixed(1)} ${(cy + ry * 0.92).toFixed(1)}`,
    `C ${(cx + rx * 0.62).toFixed(1)} ${(cy + ry * 0.96).toFixed(1)}, ${(cx + rx * 1.06).toFixed(1)} ${(cy - ry * 0.15).toFixed(1)}, ${(cx + rx * 0.45).toFixed(1)} ${(cy - ry * 0.78).toFixed(1)}`,
  ].join(" ");

  return (
    <g transform={`rotate(${rotationDeg} ${cx} ${cy})`}>
      <path
        d={pathA}
        fill="none"
        stroke="rgba(16, 15, 15, 0.75)"
        strokeWidth={strokeWidth + 3}
        strokeLinecap="round"
        pathLength={1}
        strokeDasharray="1"
        strokeDashoffset={1 - r1}
      />
      <path
        d={pathA}
        fill="none"
        stroke={color}
        strokeWidth={strokeWidth}
        strokeLinecap="round"
        pathLength={1}
        strokeDasharray="1"
        strokeDashoffset={1 - r1}
      />
      {r2 > 0.01 && (
        <path
          d={pathB}
          fill="none"
          stroke={color}
          strokeOpacity={0.78}
          strokeWidth={strokeWidth * 0.72}
          strokeLinecap="round"
          pathLength={1}
          strokeDasharray="1"
          strokeDashoffset={1 - r2}
        />
      )}
    </g>
  );
};

/**
 * Multi-Phase Physics Vehicle (spawn pop -> cruise breathing -> 3-phase arrival squash-and-settle + pulse ring).
 */
export const MultiPhaseVehicle: React.FC<{
  box: CameraBox;
  project?: Projector3D;
  coords: readonly LonLat[];
  progress: number;
  launchPop?: number;
  arrivalPhase?: number;
  cruiseSec?: number;
  altitudeZ?: number;
  kind?: "widebody" | "narrowbody" | "rail";
  color?: string;
  baseScale?: number;
}> = ({
  box,
  project,
  coords,
  progress,
  launchPop = 1,
  arrivalPhase = 0,
  cruiseSec = 0,
  altitudeZ = 6,
  kind = "rail",
  color = PALETTE.goldCaution,
  baseScale = 1.15,
}) => {
  if (coords.length < 2 || launchPop <= 0.02) return null;
  const N = 64;
  const pts = sampleGeoPolyline(coords, N);
  const clamped = clamp01(progress);
  const idx = Math.min(N - 2, Math.max(0, Math.floor(clamped * (N - 1))));
  const frac = clamped * (N - 1) - idx;
  const lon = pts[idx][0] + (pts[idx + 1][0] - pts[idx][0]) * frac;
  const lat = pts[idx][1] + (pts[idx + 1][1] - pts[idx][1]) * frac;

  const [gx0, gy0] = lonLatToScreen(box, pts[idx], 1920, 1080);
  const [gx1, gy1] = lonLatToScreen(box, pts[idx + 1], 1920, 1080);
  const [gxc, gyc] = lonLatToScreen(box, [lon, lat], 1920, 1080);
  const [sx0, sy0] = project ? project(gx0, gy0, altitudeZ) : [gx0, gy0];
  const [sx1, sy1] = project ? project(gx1, gy1, altitudeZ) : [gx1, gy1];
  const [sxc, syc] = project ? project(gxc, gyc, altitudeZ) : [gxc, gyc];

  const angleDeg = (Math.atan2(sy1 - sy0, sx1 - sx0) * 180) / Math.PI;
  const spawnK = launchPop < 1 ? easeOutBack(launchPop, 2.0) : 1;
  const breathK = clamped > 0.02 && clamped < 0.98 ? 1 + 0.045 * Math.sin(cruiseSec * 5.2) : 1;

  // 3-phase arrival squash-and-settle (1.0 -> 1.24 -> 0.89 -> 1.0)
  let settleK = 1;
  if (arrivalPhase > 0 && arrivalPhase < 1) {
    if (arrivalPhase < 0.30) {
      settleK = interpolate(arrivalPhase, [0, 0.30], [1.0, 1.24]);
    } else if (arrivalPhase < 0.65) {
      settleK = interpolate(arrivalPhase, [0.30, 0.65], [1.24, 0.89]);
    } else {
      settleK = interpolate(arrivalPhase, [0.65, 1.0], [0.89, 1.0], {
        easing: Easing.out(Easing.cubic),
      });
    }
  }
  const finalScale = baseScale * spawnK * breathK * settleK;

  // Arrival shockwave ring
  const pulseR = arrivalPhase > 0 ? interpolate(arrivalPhase, [0, 1], [14, 72]) : 0;
  const pulseOp = arrivalPhase > 0 ? interpolate(arrivalPhase, [0, 0.2, 1], [0, 0.85, 0]) : 0;

  return (
    <g>
      {pulseOp > 0.02 && (
        <circle
          cx={sxc}
          cy={syc}
          r={pulseR}
          fill="none"
          stroke={color}
          strokeWidth={3.2}
          opacity={pulseOp}
        />
      )}
      <g transform={`translate(${sxc.toFixed(1)}, ${syc.toFixed(1)}) rotate(${angleDeg.toFixed(1)}) scale(${finalScale.toFixed(3)})`}>
        {kind === "rail" ? (
          <>
            <rect x={-34} y={-8} width={68} height={16} rx={8} fill={color} opacity={0.28} />
            <rect x={-28} y={-5} width={56} height={10} rx={5} fill={color} stroke="#100F0F" strokeWidth={1.8} />
            <rect x={-16} y={-2.2} width={14} height={4.4} rx={1.5} fill="#100F0F" opacity={0.45} />
            <rect x={6} y={-2.8} width={16} height={5.6} rx={2.5} fill="#FFFCF0" />
          </>
        ) : (
          <>
            <line x1={-16} y1={-4} x2={-48} y2={-6} stroke={color} strokeWidth={1.8} opacity={0.55} />
            <line x1={-16} y1={4} x2={-48} y2={6} stroke={color} strokeWidth={1.8} opacity={0.55} />
            <path
              d={
                kind === "widebody"
                  ? "M18,0 L11,-3 L-2,-18 L-6,-17 L0,-3 L-13,-2.5 L-17,-8 L-20,-8 L-18,0 L-20,8 L-17,8 L-13,2.5 L0,3 L-6,17 L-2,18 L11,3 Z"
                  : "M14,0 L8,-2.2 L-1,-13 L-4,-12 L0,-2.2 L-10,-1.8 L-13,-6 L-15,-6 L-14,0 L-15,6 L-13,6 L-10,1.8 L0,2.2 L-4,12 L-1,13 L8,2.2 Z"
              }
              fill="#FFFCF0"
              stroke="#100F0F"
              strokeWidth={1.5}
              strokeLinejoin="round"
            />
            <circle cx={4} cy={0} r={2.3} fill={color} />
          </>
        )}
      </g>
    </g>
  );
};

/**
 * SVG Blueprint Hatch Pattern definitions (wing-construction style geotechnical & engineering hatches).
 */
export const BlueprintHatchDefs: React.FC<{ prefix: string }> = ({ prefix }) => (
  <defs>
    <pattern id={`${prefix}-mud`} width="10" height="10" patternUnits="userSpaceOnUse" patternTransform="rotate(35)">
      <rect width="10" height="10" fill="#DCD4C4" />
      <line x1="0" y1="0" x2="0" y2="10" stroke="#B65B4B" strokeWidth="2.1" opacity={0.58} />
    </pattern>
    <pattern id={`${prefix}-basalt`} width="12" height="12" patternUnits="userSpaceOnUse" patternTransform="rotate(45)">
      <rect width="12" height="12" fill="#E8E4D6" />
      <line x1="0" y1="0" x2="0" y2="12" stroke="#1E7870" strokeWidth="1.6" opacity={0.42} />
      <line x1="0" y1="0" x2="12" y2="0" stroke="#1E7870" strokeWidth="1.1" opacity={0.28} />
    </pattern>
    <pattern id={`${prefix}-warn`} width="10" height="10" patternUnits="userSpaceOnUse" patternTransform="rotate(-40)">
      <line x1="0" y1="0" x2="0" y2="10" stroke="#C93B2B" strokeWidth="2.4" opacity={0.34} />
    </pattern>
  </defs>
);

/**
 * Sinusoidal red spellcheck/reject squiggle path (adapted from openmotion decision_tree #squiggle).
 */
export const WavyRejectSquiggle: React.FC<{
  x1: number;
  x2: number;
  y: number;
  reveal: number;
  color?: string;
  strokeWidth?: number;
}> = ({ x1, x2, y, reveal, color = PAPER.vermilion, strokeWidth = 3.2 }) => {
  if (reveal <= 0.01) return null;
  const step = 10;
  const segs = Math.max(2, Math.floor((x2 - x1) / step));
  let d = `M ${x1.toFixed(1)} ${y.toFixed(1)}`;
  for (let i = 0; i < segs; i++) {
    const sx = x1 + i * step;
    const mx = sx + step * 0.5;
    const ex = Math.min(x2, sx + step);
    const cy = i % 2 === 0 ? y - 4.2 : y + 4.2;
    d += ` Q ${mx.toFixed(1)} ${cy.toFixed(1)} ${ex.toFixed(1)} ${y.toFixed(1)}`;
  }
  return (
    <path
      d={d}
      fill="none"
      stroke={color}
      strokeWidth={strokeWidth}
      strokeLinecap="round"
      pathLength={1}
      strokeDasharray="1"
      strokeDashoffset={1 - clamp01(reveal)}
    />
  );
};

/**
 * Growth-Teardown Style Leader Evidence Card:
 * Anchors a clipped document citation card (#FFFCF0, top black rule) directly to a breakpoint on a chart via an elbow SVG leader line.
 */
export const LeaderEvidenceCard: React.FC<{
  left: number;
  top: number;
  width: number;
  anchorPoint: readonly [number, number];
  docTag: string;
  headline: string;
  body: string;
  accent?: string;
  reveal: number;
}> = ({ left, top, width, anchorPoint, docTag, headline, body, accent = PAPER.vermilion, reveal }) => {
  const uid = useId().replace(/[^a-zA-Z0-9]/g, "");
  if (reveal <= 0.02) return null;

  const lineProg = clamp01(reveal * 1.4);
  const cardProg = clamp01((reveal - 0.18) / 0.82);
  const cardEdgeX = anchorPoint[0] < left ? left : left + width;
  const cardEdgeY = top + 46;
  const elbowX = anchorPoint[0] + (cardEdgeX - anchorPoint[0]) * 0.42;
  const d = `M ${anchorPoint[0].toFixed(1)} ${anchorPoint[1].toFixed(1)} L ${elbowX.toFixed(1)} ${anchorPoint[1].toFixed(1)} L ${cardEdgeX.toFixed(1)} ${cardEdgeY.toFixed(1)}`;

  return (
    <>
      <svg width={1920} height={1080} style={{ position: "absolute", inset: 0, pointerEvents: "none", zIndex: 26 }}>
        <path
          id={`leader-${uid}`}
          d={d}
          fill="none"
          stroke={accent}
          strokeWidth={2.6}
          strokeDasharray="1"
          pathLength={1}
          strokeDashoffset={1 - lineProg}
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        <circle cx={anchorPoint[0]} cy={anchorPoint[1]} r={11 * lineProg} fill={accent} opacity={0.22} />
        <circle cx={anchorPoint[0]} cy={anchorPoint[1]} r={5.5 * lineProg} fill={PAPER.sheet} stroke={accent} strokeWidth={2.6} />
      </svg>

      <div
        style={{
          position: "absolute",
          left,
          top,
          width,
          padding: "16px 20px",
          borderRadius: 8,
          background: PAPER.sheet,
          border: `1px solid ${PAPER.ruleStrong}`,
          borderTop: `4px solid ${PAPER.ink}`,
          borderLeft: `4px solid ${accent}`,
          boxShadow: PAPER.shadow,
          boxSizing: "border-box",
          opacity: cardProg,
          transform: `translateY(${(1 - cardProg) * 14}px)`,
          zIndex: 27,
        }}
      >
        <div
          style={{
            display: "inline-block",
            padding: "3px 9px",
            borderRadius: 4,
            background: accent,
            color: PAPER.sheet,
            fontFamily: FONTS.mono,
            fontSize: 11.5,
            fontWeight: 700,
            letterSpacing: "0.06em",
          }}
        >
          {docTag}
        </div>
        <div
          style={{
            fontFamily: FONTS.display,
            fontSize: 19,
            fontWeight: 800,
            color: PAPER.ink,
            marginTop: 8,
            lineHeight: 1.25,
            letterSpacing: "-0.015em",
          }}
        >
          {headline}
        </div>
        <div
          style={{
            fontFamily: FONTS.display,
            fontSize: 15,
            fontWeight: 500,
            color: PAPER.ink2,
            marginTop: 6,
            lineHeight: 1.42,
          }}
        >
          {body}
        </div>
      </div>
    </>
  );
};

/**
 * Semi-transparent SVG Hatch Patterns designed specifically for 3D Satellite Map overlays
 * so underlying EOX 2024 terrain remains visible beneath geological / airlock polygons.
 */
export const BlueprintMapHatchDefs: React.FC<{ prefix: string }> = ({ prefix }) => (
  <defs>
    <pattern id={`${prefix}-map-mud`} width="12" height="12" patternUnits="userSpaceOnUse" patternTransform="rotate(-38)">
      <rect width="12" height="12" fill="rgba(217, 78, 65, 0.22)" />
      <line x1="0" y1="0" x2="0" y2="12" stroke="#FF6456" strokeWidth="2.4" opacity={0.75} />
    </pattern>
    <pattern id={`${prefix}-map-airlock`} width="14" height="14" patternUnits="userSpaceOnUse" patternTransform="rotate(-42)">
      <rect width="14" height="14" fill="rgba(217, 78, 65, 0.18)" />
      <line x1="0" y1="0" x2="0" y2="14" stroke="#FF6456" strokeWidth="2.2" opacity={0.78} />
      <line x1="6" y1="0" x2="6" y2="14" stroke="#E5AF28" strokeWidth="1.4" opacity={0.65} />
    </pattern>
    <pattern id={`${prefix}-map-basalt`} width="12" height="12" patternUnits="userSpaceOnUse" patternTransform="rotate(45)">
      <rect width="12" height="12" fill="rgba(58, 169, 159, 0.22)" />
      <line x1="0" y1="0" x2="0" y2="12" stroke="#45D9CC" strokeWidth="2.0" opacity={0.72} />
      <line x1="0" y1="0" x2="12" y2="0" stroke="#45D9CC" strokeWidth="1.2" opacity={0.45} />
    </pattern>
  </defs>
);

/**
 * Extruded 3D Gauge Pillar growing directly from a real geographic coordinate on Tactical3DStage.
 * Replaces off-map flat bar charts by putting quantitative capacity directly onto the airport polygon.
 */
export const OnMap3DGaugePillar: React.FC<{
  box: CameraBox;
  project?: Projector3D;
  lonLat: LonLat;
  heightZ: number;
  ceilingZ?: number;
  reveal: number;
  color: string;
  tagTop: string;
  valueText: string;
  subText?: string;
  capLabel?: string;
  labelOffset?: readonly [number, number];
  jammedReveal?: number;
}> = ({
  box,
  project,
  lonLat,
  heightZ,
  ceilingZ,
  reveal,
  color,
  tagTop,
  valueText,
  subText,
  capLabel,
  labelOffset = [-240, -20],
  jammedReveal = 0,
}) => {
  const rev = clamp01(reveal);
  if (rev <= 0.02) return null;

  const curZ = heightZ * rev;
  const [bx, by] = projectGeoPoint(box, project, lonLat, 0);
  const [tx, ty] = projectGeoPoint(box, project, lonLat, curZ);

  const halfW = 14;
  const colTop = Math.min(by, ty);
  const colH = Math.max(2, by - colTop);

  // Label box attached via leader to pillar top
  const lx = tx + labelOffset[0];
  const ly = ty + labelOffset[1];
  const boxW = 286;
  const boxH = subText ? 82 : 62;
  const labelCenterRight = labelOffset[0] < 0 ? lx + boxW : lx;
  const labelMidY = ly + boxH * 0.5;

  const ceilPoint = ceilingZ !== undefined ? projectGeoPoint(box, project, lonLat, ceilingZ) : null;
  const hasJam = ceilPoint && jammedReveal > 0.02 && ceilingZ !== undefined;

  return (
    <g>
      {/* Glowing anchor footprint on ground */}
      <ellipse cx={bx} cy={by} rx={24} ry={10} fill={color} opacity={0.28 * rev} />
      <ellipse cx={bx} cy={by} rx={17} ry={7} fill="#100F0F" stroke={color} strokeWidth={2.2} opacity={rev} />

      {/* 2-Face Isometric-feel extruded 3D vertical column */}
      <rect x={bx - halfW} y={colTop} width={halfW} height={colH} fill={color} fillOpacity={0.94} />
      <rect x={bx} y={colTop} width={halfW} height={colH} fill={color} fillOpacity={0.62} />
      <rect x={bx} y={colTop} width={halfW} height={colH} fill="#100F0F" fillOpacity={0.28} />
      <rect
        x={bx - halfW}
        y={colTop}
        width={halfW * 2}
        height={colH}
        fill="none"
        stroke="rgba(255, 252, 240, 0.72)"
        strokeWidth={1.4}
      />
      {/* Top bright cap */}
      <ellipse cx={bx} cy={colTop} rx={halfW} ry={5.5} fill="#FFFCF0" stroke={color} strokeWidth={2} />

      {/* Optional Hard Ceiling Crossbar & Jammed Excess Block */}
      {hasJam && ceilPoint && (
        <g opacity={clamp01(jammedReveal)}>
          <rect
            x={bx - halfW - 3}
            y={Math.min(colTop, ceilPoint[1]) - 36}
            width={halfW * 2 + 6}
            height={36}
            fill="rgba(217, 78, 65, 0.24)"
            stroke={PALETTE.coralAlert}
            strokeWidth={1.8}
            strokeDasharray="5 4"
          />
          <rect
            x={ceilPoint[0] - 44}
            y={ceilPoint[1] - 4.5}
            width={88}
            height={9}
            rx={3}
            fill={PALETTE.coralAlert}
            stroke="#100F0F"
            strokeWidth={1.8}
          />
          {capLabel && (
            <g transform={`translate(${(ceilPoint[0] - 298).toFixed(1)}, ${(ceilPoint[1] + 2).toFixed(1)})`}>
              <rect x={0} y={-14} width={256} height={28} rx={6} fill="rgba(16, 15, 15, 0.94)" stroke={PALETTE.coralAlert} strokeWidth={1.6} />
              <text x={128} y={5} textAnchor="middle" fill={PALETTE.coralAlert} fontFamily={FONTS.mono} fontSize={12.5} fontWeight={700}>
                {capLabel}
              </text>
            </g>
          )}
        </g>
      )}

      {/* Leader line from Pillar Top to Dark Glass Metric Callout */}
      <polyline
        points={`${bx},${(colTop + 4).toFixed(1)} ${labelCenterRight.toFixed(1)},${labelMidY.toFixed(1)}`}
        fill="none"
        stroke={color}
        strokeWidth={2}
        strokeOpacity={0.9}
      />
      <circle cx={bx} cy={colTop + 4} r={4.5} fill="#FFFCF0" stroke={color} strokeWidth={2} />

      {/* Dark Glass Callout Card (zero white bloat) */}
      <g opacity={interpolate(rev, [0.18, 0.55], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" })}>
        <rect
          x={lx}
          y={ly}
          width={boxW}
          height={boxH}
          rx={8}
          fill="rgba(16, 15, 15, 0.91)"
          stroke="rgba(255, 252, 240, 0.16)"
          strokeWidth={1.2}
        />
        <rect x={lx} y={ly} width={4.5} height={boxH} rx={2} fill={color} />
        <text x={lx + 15} y={ly + 22} fill={color} fontFamily={FONTS.mono} fontSize={11.5} fontWeight={700} letterSpacing="0.06em">
          {tagTop}
        </text>
        <text x={lx + 15} y={ly + 50} fill="#FFFCF0" fontFamily={FONTS.display} fontSize={22} fontWeight={800}>
          {valueText}
        </text>
        {subText && (
          <text x={lx + 15} y={ly + 71} fill={PALETTE.mist} fontFamily={FONTS.display} fontSize={13.5} fontWeight={600}>
            {subText}
          </text>
        )}
      </g>
    </g>
  );
};

const PRESS_DECODED_CACHE = new Map<string, Promise<void>>();

function useDecodedPressImage(srcRel: string): void {
  const url = staticFile(srcRel);
  const [handle] = useState(() =>
    PRESS_DECODED_CACHE.has(url) ? null : delayRender(`decode-press:${srcRel}`, { timeoutInMilliseconds: 45000 })
  );

  useEffect(() => {
    if (!handle) return;
    let active = true;
    let p = PRESS_DECODED_CACHE.get(url);
    if (!p) {
      p = new Promise<void>((resolve, reject) => {
        const img = new Image();
        img.src = url;
        img.decode().then(resolve, reject);
      });
      PRESS_DECODED_CACHE.set(url, p);
    }
    p.then(
      () => {
        if (active) continueRender(handle);
      },
      (err) => cancelRender(err)
    );
    return () => {
      active = false;
    };
  }, [handle, srcRel, url]);
}

/**
 * Journalistic Real-Newspaper Clipping Card anchored directly onto a 3D map target.
 * Renders an authentic cropped article screenshot (masthead + headline + field photo) inside a slightly angled ivory clipping with a yellow highlighter sweep and elbow leader line pointing straight to the map feature.
 */
export const OnMapPressClippingCard: React.FC<{
  src: string;
  left: number;
  top: number;
  width: number;
  rotationDeg?: number;
  anchorPoint: readonly [number, number];
  sourceBadge: string;
  accent?: string;
  reveal: number;
  highlightRect?: { leftPct: number; topPct: number; widthPct: number; heightPct: number };
}> = ({
  src,
  left,
  top,
  width,
  rotationDeg = 1.2,
  anchorPoint,
  sourceBadge,
  accent = PALETTE.coralAlert,
  reveal,
  highlightRect,
}) => {
  useDecodedPressImage(src);
  const uid = useId().replace(/[^a-zA-Z0-9]/g, "");
  const rev = clamp01(reveal);
  if (rev <= 0.02) return null;

  const lineProg = clamp01(rev * 1.45);
  const cardProg = clamp01((rev - 0.14) / 0.86);
  const cardEdgeX = anchorPoint[0] < left + width * 0.5 ? left + 2 : left + width - 2;
  const cardEdgeY = top + 72;
  const elbowX = anchorPoint[0] + (cardEdgeX - anchorPoint[0]) * 0.45;
  const leaderD = `M ${anchorPoint[0].toFixed(1)} ${anchorPoint[1].toFixed(1)} L ${elbowX.toFixed(1)} ${anchorPoint[1].toFixed(1)} L ${cardEdgeX.toFixed(1)} ${cardEdgeY.toFixed(1)}`;

  const hlProg = clamp01((rev - 0.35) / 0.50);

  return (
    <>
      <svg width={1920} height={1080} style={{ position: "absolute", inset: 0, pointerEvents: "none", zIndex: 27 }}>
        <path
          id={`press-leader-${uid}`}
          d={leaderD}
          fill="none"
          stroke="rgba(16, 15, 15, 0.85)"
          strokeWidth={5.2}
          strokeDasharray="1"
          pathLength={1}
          strokeDashoffset={1 - lineProg}
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        <path
          d={leaderD}
          fill="none"
          stroke={accent}
          strokeWidth={2.8}
          strokeDasharray="1"
          pathLength={1}
          strokeDashoffset={1 - lineProg}
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        <circle cx={anchorPoint[0]} cy={anchorPoint[1]} r={12 * lineProg} fill={accent} opacity={0.28} />
        <circle cx={anchorPoint[0]} cy={anchorPoint[1]} r={5.5 * lineProg} fill="#FFFCF0" stroke={accent} strokeWidth={2.5} />
      </svg>

      <div
        style={{
          position: "absolute",
          left,
          top,
          width,
          padding: 9,
          borderRadius: 6,
          background: "#FCFBF7",
          border: `1.5px solid #D4CFC0`,
          borderTop: `4px solid ${accent}`,
          boxShadow: "0 22px 46px rgba(0, 0, 0, 0.65), 0 4px 14px rgba(0, 0, 0, 0.42)",
          boxSizing: "border-box",
          opacity: cardProg,
          transform: `translateY(${((1 - cardProg) * 18).toFixed(1)}px) rotate(${rotationDeg.toFixed(2)}deg) scale(${(0.95 + 0.05 * cardProg).toFixed(3)})`,
          zIndex: 28,
        }}
      >
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            padding: "4px 8px 6px",
            borderBottom: "1px solid #E2DDD0",
            marginBottom: 6,
          }}
        >
          <span
            style={{
              display: "inline-block",
              padding: "2px 8px",
              borderRadius: 3,
              background: accent,
              color: "#FFFCF0",
              fontFamily: FONTS.mono,
              fontSize: 10.5,
              fontWeight: 700,
              letterSpacing: "0.06em",
            }}
          >
            {sourceBadge}
          </span>
          <span style={{ fontFamily: FONTS.mono, fontSize: 10, fontWeight: 700, color: "#6F6E69" }}>
            TƯ LIỆU BÁO CHÍ THỰC TẾ
          </span>
        </div>

        <div style={{ position: "relative", width: "100%", overflow: "hidden", borderRadius: 3 }}>
          <img
            src={staticFile(src)}
            alt={sourceBadge}
            style={{
              width: "100%",
              height: "auto",
              display: "block",
            }}
          />
          {highlightRect && hlProg > 0.02 && (
            <div
              style={{
                position: "absolute",
                left: `${highlightRect.leftPct}%`,
                top: `${highlightRect.topPct}%`,
                width: `${(highlightRect.widthPct * hlProg).toFixed(2)}%`,
                height: `${highlightRect.heightPct}%`,
                background: "rgba(250, 204, 21, 0.44)",
                mixBlendMode: "multiply",
                borderRadius: 2,
                pointerEvents: "none",
              }}
            />
          )}
        </div>
      </div>
    </>
  );
};

