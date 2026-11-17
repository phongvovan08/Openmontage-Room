import React from "react";
import { CameraBox, LonLat, lonLatToScreen } from "../mapMath";
import { PALETTE } from "../theme";
import { Projector3D, sampleGeoPolyline } from "./Tactical3DKit";

export const MovingAircraft: React.FC<{
  box: CameraBox;
  project?: Projector3D;
  coords: readonly LonLat[];
  progress: number;
  altitudeZ?: number;
  kind?: "widebody" | "narrowbody" | "rail";
  color?: string;
  scale?: number;
}> = ({
  box,
  project,
  coords,
  progress,
  altitudeZ = 0,
  kind = "widebody",
  color = PALETTE.tealAirport,
  scale = 1,
}) => {
  if (coords.length < 2) return null;
  const N = 64;
  const pts = sampleGeoPolyline(coords, N);
  const clamped = Math.max(0, Math.min(1, progress));
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

  return (
    <g transform={`translate(${sxc.toFixed(1)}, ${syc.toFixed(1)}) rotate(${angleDeg.toFixed(1)}) scale(${scale})`}>
      {kind === "rail" ? (
        <>
          <rect x={-26} y={-5} width={52} height={10} rx={5} fill="rgba(229, 175, 40, 0.25)" />
          <rect x={-22} y={-3.5} width={44} height={7} rx={3.5} fill={color} stroke="#100F0F" strokeWidth={1.4} />
          <rect x={8} y={-2.2} width={10} height={4.4} rx={2} fill="#FFFCF0" />
        </>
      ) : (
        <>
          {/* Engine wake / contrail */}
          <line x1={kind === "widebody" ? -18 : -12} y1={-4} x2={-46} y2={-6} stroke={color} strokeWidth={1.6} opacity={0.45} />
          <line x1={kind === "widebody" ? -18 : -12} y1={4} x2={-46} y2={6} stroke={color} strokeWidth={1.6} opacity={0.45} />
          {/* Aircraft fuselage + swept wings + tail */}
          <path
            d={
              kind === "widebody"
                ? "M18,0 L11,-3 L-2,-18 L-6,-17 L0,-3 L-13,-2.5 L-17,-8 L-20,-8 L-18,0 L-20,8 L-17,8 L-13,2.5 L0,3 L-6,17 L-2,18 L11,3 Z"
                : "M14,0 L8,-2.2 L-1,-13 L-4,-12 L0,-2.2 L-10,-1.8 L-13,-6 L-15,-6 L-14,0 L-15,6 L-13,6 L-10,1.8 L0,2.2 L-4,12 L-1,13 L8,2.2 Z"
            }
            fill="#FFFCF0"
            stroke="#100F0F"
            strokeWidth={1.4}
            strokeLinejoin="round"
          />
          <circle cx={4} cy={0} r={2.2} fill={color} />
        </>
      )}
    </g>
  );
};

