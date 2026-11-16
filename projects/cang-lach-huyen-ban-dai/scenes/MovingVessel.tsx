import React from "react";
import { CameraBox, LonLat, lonLatToScreen } from "../mapMath";
import { FONTS, PALETTE } from "../theme";

export interface SampledVesselPose {
  x: number;
  y: number;
  angleDeg: number;
  wakePath: string;
}

/**
 * Sample exact screen position, heading angle, and recent curved wake path along a geographic route.
 */
export function sampleVesselRoute(
  box: CameraBox,
  coords: readonly LonLat[],
  progress: number,
  canvasW = 1920,
  canvasH = 1080,
  wakeFraction = 0.16
): SampledVesselPose {
  if (coords.length === 0) {
    return { x: 0, y: 0, angleDeg: 0, wakePath: "" };
  }
  const pts = coords.map((c) => lonLatToScreen(box, c, canvasW, canvasH));
  if (pts.length === 1) {
    return { x: pts[0][0], y: pts[0][1], angleDeg: 0, wakePath: "" };
  }

  const cum: number[] = [0];
  for (let i = 0; i < pts.length - 1; i++) {
    const d = Math.hypot(pts[i + 1][0] - pts[i][0], pts[i + 1][1] - pts[i][1]);
    cum.push(cum[i] + d);
  }
  const total = Math.max(1e-3, cum[cum.length - 1]);
  const p = Math.max(0, Math.min(1, progress));
  const targetDist = p * total;

  const pointAtDist = (dist: number): { x: number; y: number; angleDeg: number } => {
    const clamped = Math.max(0, Math.min(total, dist));
    for (let i = 0; i < pts.length - 1; i++) {
      const segStart = cum[i];
      const segEnd = cum[i + 1];
      if (clamped <= segEnd || i === pts.length - 2) {
        const segLen = Math.max(1e-5, segEnd - segStart);
        const u = Math.max(0, Math.min(1, (clamped - segStart) / segLen));
        const x = pts[i][0] + (pts[i + 1][0] - pts[i][0]) * u;
        const y = pts[i][1] + (pts[i + 1][1] - pts[i][1]) * u;
        const angleDeg = (Math.atan2(pts[i + 1][1] - pts[i][1], pts[i + 1][0] - pts[i][0]) * 180) / Math.PI;
        return { x, y, angleDeg };
      }
    }
    const last = pts[pts.length - 1];
    return { x: last[0], y: last[1], angleDeg: 0 };
  };

  const head = pointAtDist(targetDist);

  // Sample 8 points along [targetDist - wakeLen .. targetDist] for smooth curved wake foam
  const wakeStart = Math.max(0, targetDist - wakeFraction * total);
  const steps = 8;
  const wakeParts: string[] = [];
  if (targetDist - wakeStart > 2) {
    for (let s = 0; s <= steps; s++) {
      const d = wakeStart + ((targetDist - wakeStart) * s) / steps;
      const wp = pointAtDist(d);
      wakeParts.push(`${s === 0 ? "M" : "L"}${wp.x.toFixed(1)},${wp.y.toFixed(1)}`);
    }
  }

  return {
    x: head.x,
    y: head.y,
    angleDeg: head.angleDeg,
    wakePath: wakeParts.join(" "),
  };
}

/**
 * Top-down animated maritime vessel (Mother Container Ship or Feeder Vessel)
 * with curved wake trail, container deck stacks, and optional halted warning shockwave.
 */
export const MovingVessel: React.FC<{
  box: CameraBox;
  coords: readonly LonLat[];
  progress: number;
  kind: "mother" | "feeder";
  canvasW?: number;
  canvasH?: number;
  scale?: number;
  opacity?: number;
  halted?: boolean;
  pulsePhase?: number;
  label?: string;
  labelOffset?: readonly [number, number];
}> = ({
  box,
  coords,
  progress,
  kind,
  canvasW = 1920,
  canvasH = 1080,
  scale = 1,
  opacity = 1,
  halted = false,
  pulsePhase = 0,
  label,
  labelOffset = [0, -24],
}) => {
  if (opacity <= 0.01) return null;

  const pose = sampleVesselRoute(box, coords, progress, canvasW, canvasH, halted ? 0.08 : 0.16);
  const isMother = kind === "mother";
  const hullColor = halted
    ? PALETTE.coralWarn
    : isMother
    ? PALETTE.tealDeep
    : PALETTE.amberBright;

  return (
    <g opacity={opacity}>
      {/* Curved wake foam trail behind vessel */}
      {pose.wakePath && !halted && (
        <>
          <path
            d={pose.wakePath}
            fill="none"
            stroke={isMother ? "rgba(45, 212, 191, 0.34)" : "rgba(245, 158, 11, 0.32)"}
            strokeWidth={isMother ? 7 * scale : 4.5 * scale}
            strokeLinecap="round"
          />
          <path
            d={pose.wakePath}
            fill="none"
            stroke="rgba(248, 250, 252, 0.72)"
            strokeWidth={isMother ? 2 * scale : 1.5 * scale}
            strokeDasharray="4 4"
            strokeLinecap="round"
          />
        </>
      )}

      {/* Halted warning radar shockwaves */}
      {halted && (
        <g transform={`translate(${pose.x.toFixed(1)}, ${pose.y.toFixed(1)})`}>
          <circle
            r={16 + pulsePhase * 38}
            fill="none"
            stroke={PALETTE.coralWarn}
            strokeWidth={2.6}
            opacity={(1 - pulsePhase) * 0.85}
          />
          <circle
            r={10 + ((pulsePhase + 0.5) % 1) * 32}
            fill="none"
            stroke="#FFFFFF"
            strokeWidth={1.6}
            opacity={(1 - ((pulsePhase + 0.5) % 1)) * 0.55}
          />
        </g>
      )}

      {/* Rotated top-down ship hull */}
      <g
        transform={`translate(${pose.x.toFixed(1)}, ${pose.y.toFixed(1)}) rotate(${pose.angleDeg.toFixed(
          1
        )}) scale(${scale})`}
      >
        {/* V-shaped Kelvin bow wake */}
        {!halted && (
          <path
            d={
              isMother
                ? "M -20 -11 L 14 0 L -20 11"
                : "M -14 -7.5 L 9 0 L -14 7.5"
            }
            fill="none"
            stroke="rgba(226, 232, 240, 0.48)"
            strokeWidth={1.5}
            strokeLinecap="round"
          />
        )}

        {isMother ? (
          <>
            {/* Mother container vessel (38x12px) */}
            <path
              d="M -18 -6 L 10 -6 L 19 0 L 10 6 L -18 6 Z"
              fill="#091829"
              stroke={hullColor}
              strokeWidth={2.2}
              strokeLinejoin="round"
            />
            {/* Colored container bays on deck */}
            <rect x={-14} y={-4} width={5.5} height={8} rx={1} fill={hullColor} />
            <rect x={-7} y={-4} width={5.5} height={8} rx={1} fill="#38BDF8" />
            <rect x={0} y={-4} width={5.5} height={8} rx={1} fill="#F59E0B" />
            {/* White bridge superstructure */}
            <rect x={7} y={-4.5} width={3.2} height={9} rx={1} fill="#F8FAFC" />
          </>
        ) : (
          <>
            {/* Compact feeder vessel (24x8.5px) */}
            <path
              d="M -11 -4.2 L 6 -4.2 L 12 0 L 6 4.2 L -11 4.2 Z"
              fill="#091829"
              stroke={hullColor}
              strokeWidth={1.9}
              strokeLinejoin="round"
            />
            <rect x={-8.5} y={-2.6} width={5} height={5.2} rx={0.8} fill={hullColor} />
            <rect x={-2} y={-2.6} width={4.5} height={5.2} rx={0.8} fill="#FDE68A" />
            <rect x={4} y={-3} width={2.4} height={6} rx={0.8} fill="#F8FAFC" />
          </>
        )}
      </g>

      {/* Optional upright floating vessel tag */}
      {label && (
        <g transform={`translate(${(pose.x + labelOffset[0]).toFixed(1)}, ${(pose.y + labelOffset[1]).toFixed(1)})`}>
          <text
            x={0}
            y={0}
            textAnchor="middle"
            fill={halted ? "#FFE4E6" : "#F8FAFC"}
            stroke="#050D18"
            strokeWidth={4.5}
            paintOrder="stroke"
            fontFamily={FONTS.mono}
            fontSize={12.5}
            fontWeight={700}
          >
            {label}
          </text>
        </g>
      )}
    </g>
  );
};

