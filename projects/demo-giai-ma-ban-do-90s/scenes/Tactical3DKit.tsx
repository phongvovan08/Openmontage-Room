import React from "react";
import { AbsoluteFill } from "remotion";
import { LonLat } from "../data/haiphongHydroData";
import { CameraBox, lonLatToScreen } from "../mapMath";
import { FONTS, PALETTE, SAFE_X } from "../theme";

export interface Camera3DSpec {
  width: number;
  height: number;
  pitchDeg: number;
  yawDeg: number;
  mapScale: number;
  ty?: number;
  persp?: number;
  originYRatio?: number;
}

export type Projector3D = (gx: number, gy: number, gz?: number) => [number, number, number];

export function createProjector3D(spec: Camera3DSpec): Projector3D {
  const {
    width,
    height,
    pitchDeg,
    yawDeg,
    mapScale,
    ty = 64,
    persp = 1180,
    originYRatio = 0.62,
  } = spec;
  const ox = width * 0.5;
  const oy = height * originYRatio;
  const rz = (yawDeg * Math.PI) / 180;
  const cosZ = Math.cos(rz);
  const sinZ = Math.sin(rz);
  const rx = (pitchDeg * Math.PI) / 180;
  const cosX = Math.cos(rx);
  const sinX = Math.sin(rx);

  return (gx: number, gy: number, gz = 0): [number, number, number] => {
    const x1 = (gx - ox) * mapScale;
    const y1 = (gy - oy) * mapScale;

    const x2 = x1 * cosZ - y1 * sinZ;
    const y2 = x1 * sinZ + y1 * cosZ;

    const x3 = x2;
    const y3 = y2 * cosX - gz * sinX;
    const z3 = y2 * sinX + gz * cosX;

    const k = persp / Math.max(220, persp - z3);
    return [ox + x3 * k, oy + y3 * k + ty, k];
  };
}

/** Deterministic starfield for the horizon sky dome */
const SKY_STARS = Array.from({ length: 46 }, (_, i) => {
  const s1 = Math.sin(i * 127.1 + 311.7) * 43758.5453;
  const s2 = Math.sin(i * 269.5 + 183.3) * 28461.1293;
  const fx = s1 - Math.floor(s1);
  const fy = s2 - Math.floor(s2);
  return {
    x: 40 + fx * 1840,
    y: 12 + fy * 215,
    r: 0.8 + (i % 3) * 0.65,
    op: 0.22 + (i % 5) * 0.12,
  };
});

export const Tactical3DStage: React.FC<{
  spec: Camera3DSpec;
  horizonAccent?: string;
  compassBearingDeg?: number;
  telemetryLabel?: string;
  groundChildren: React.ReactNode;
  overlayChildren?: React.ReactNode;
}> = ({
  spec,
  horizonAccent = "#38BDF8",
  compassBearingDeg = 18,
  telemetryLabel = "GÓC MÁY CHIẾN THUẬT 3D • PITCH 55°",
  groundChildren,
  overlayChildren,
}) => {
  const {
    width,
    height,
    pitchDeg,
    yawDeg,
    mapScale,
    ty = 64,
    persp = 1180,
    originYRatio = 0.62,
  } = spec;

  const ticks = [-40, -30, -20, -10, 0, 10, 20, 30, 40];
  const ox = width * 0.5;
  const oy = height * originYRatio;

  return (
    <AbsoluteFill style={{ backgroundColor: "#030914", overflow: "hidden" }}>
      {/* 1. True 2x (4K 3840x2160) Supersampled 3D Terrain Plane (zero maskImage so Chromium keeps full GPU crispness!) */}
      <div
        style={{
          position: "absolute",
          left: -ox,
          top: -oy,
          width: width * 2,
          height: height * 2,
          transformOrigin: `${(ox * 2).toFixed(1)}px ${(oy * 2).toFixed(1)}px`,
          transform: `translateY(${ty.toFixed(1)}px) perspective(${persp}px) rotateX(${pitchDeg.toFixed(2)}deg) rotateZ(${yawDeg.toFixed(2)}deg) scale(${(mapScale * 0.5).toFixed(4)})`,
        }}
      >
        <div
          style={{
            position: "absolute",
            left: 0,
            top: 0,
            width,
            height,
            transformOrigin: "0 0",
            transform: "scale(2)",
          }}
        >
          {groundChildren}
        </div>
      </div>

      {/* 2. Crisp Sky Horizon Dome blending only the far-horizon edge (y=335..392), leaving 100% of map terrain completely fog-free! */}
      <div
        style={{
          position: "absolute",
          left: 0,
          right: 0,
          top: 0,
          height: 392,
          background:
            "linear-gradient(180deg, #020611 0%, #051326 66%, rgba(5, 19, 38, 0.95) 86%, rgba(5, 19, 38, 0) 100%)",
          pointerEvents: "none",
        }}
      />

      {/* Starfield & Subtle Horizon Rim Glow */}
      <svg width={width} height={360} style={{ position: "absolute", left: 0, top: 0, pointerEvents: "none" }}>
        <defs>
          <radialGradient id="horizonGlow" cx="50%" cy="88%" r="50%">
            <stop offset="0%" stopColor={horizonAccent} stopOpacity={0.34} />
            <stop offset="55%" stopColor="#0EA5E9" stopOpacity={0.10} />
            <stop offset="100%" stopColor="#020611" stopOpacity={0} />
          </radialGradient>
        </defs>
        <rect width={width} height={360} fill="url(#horizonGlow)" />
        {SKY_STARS.map((st, idx) => (
          <circle key={idx} cx={st.x} cy={st.y} r={st.r} fill="#E2E8F0" opacity={st.op} />
        ))}
        {/* Subtle Tactical Compass Ticks along Sky Horizon */}
        <line x1={540} y1={42} x2={1380} y2={42} stroke="rgba(148, 163, 184, 0.22)" strokeWidth={1} />
        {ticks.map((dt) => {
          const tx = 960 + dt * 9.5;
          const deg = (((Math.round(compassBearingDeg + dt) % 360) + 360) % 360)
            .toString()
            .padStart(3, "0");
          const isMajor = dt % 20 === 0;
          return (
            <g key={dt}>
              <line
                x1={tx}
                y1={isMajor ? 32 : 36}
                x2={tx}
                y2={42}
                stroke={dt === 0 ? horizonAccent : "rgba(148, 163, 184, 0.45)"}
                strokeWidth={dt === 0 ? 2.2 : 1.2}
              />
              {isMajor && (
                <text
                  x={tx}
                  y={26}
                  textAnchor="middle"
                  fill={dt === 0 ? "#F8FAFC" : "rgba(148, 163, 184, 0.65)"}
                  fontFamily={FONTS.mono}
                  fontSize={11}
                  fontWeight={700}
                >
                  {deg}°
                </text>
              )}
            </g>
          );
        })}
      </svg>

      {/* Subtle Outer-Corner-Only Framing (zero center haze) */}
      <div
        style={{
          position: "absolute",
          inset: 0,
          background:
            "radial-gradient(circle at 50% 56%, rgba(0,0,0,0) 74%, rgba(2, 6, 17, 0.36) 100%)",
          pointerEvents: "none",
        }}
      />

      {/* 4. Upright Crisp 3D-Projected Stalks, Arcs & HUD Cards */}
      {overlayChildren}
    </AbsoluteFill>
  );
};

/** Resamples a LonLat polyline into N evenly spaced points for smooth 3D arcs and piers */
export function sampleGeoPolyline(coords: readonly LonLat[], count: number): LonLat[] {
  if (coords.length === 0) return [];
  if (coords.length === 1) return Array.from({ length: count }, () => coords[0]);
  const segs: number[] = [];
  let total = 0;
  for (let i = 0; i < coords.length - 1; i++) {
    const dx = coords[i + 1][0] - coords[i][0];
    const dy = coords[i + 1][1] - coords[i][1];
    const d = Math.hypot(dx, dy);
    segs.push(d);
    total += d;
  }
  const out: LonLat[] = [];
  for (let k = 0; k < count; k++) {
    const target = (total * k) / Math.max(1, count - 1);
    let acc = 0;
    let chosen: LonLat = coords[coords.length - 1];
    for (let i = 0; i < segs.length; i++) {
      if (acc + segs[i] >= target || i === segs.length - 1) {
        const localT = segs[i] > 1e-9 ? (target - acc) / segs[i] : 0;
        chosen = [
          coords[i][0] + (coords[i + 1][0] - coords[i][0]) * localT,
          coords[i][1] + (coords[i + 1][1] - coords[i][1]) * localT,
        ];
        break;
      }
      acc += segs[i];
    }
    out.push(chosen);
  }
  return out;
}

/** Vertical 3D Beacon Stalk + Tactical Floating HUD Flag (Johnny Harris / Vox signature) */
export const Pin3DStalk: React.FC<{
  gx: number;
  gy: number;
  stalkZ?: number;
  project: Projector3D;
  color: string;
  kicker?: string;
  title: string;
  metric?: string;
  sub?: string;
  reveal?: number;
  pulsePhase?: number;
  align?: "left" | "right" | "center";
  cardWidth?: number;
}> = ({
  gx,
  gy,
  stalkZ = 148,
  project,
  color,
  kicker,
  title,
  metric,
  sub,
  reveal = 1,
  pulsePhase = 0,
  align = "right",
  cardWidth = 310,
}) => {
  if (reveal <= 0.01) return null;
  const zNow = stalkZ * reveal;
  const [bx, by, bk] = project(gx, gy, 0);
  const [tx, ty] = project(gx, gy, zNow);

  const rx = 26 * bk;
  const ry = 13 * bk;
  const prx = (22 + pulsePhase * 34) * bk;
  const pry = (11 + pulsePhase * 17) * bk;

  const cardLeft =
    align === "right" ? tx + 14 : align === "left" ? tx - cardWidth - 14 : tx - cardWidth * 0.5;
  const cardTop = ty - 34;

  return (
    <>
      <svg
        width={1920}
        height={1080}
        style={{ position: "absolute", inset: 0, pointerEvents: "none", opacity: reveal }}
      >
        {/* Ground 3D Radar Ring */}
        <ellipse
          cx={bx}
          cy={by}
          rx={prx}
          ry={pry}
          fill="none"
          stroke={color}
          strokeWidth={2.2}
          opacity={1 - pulsePhase}
        />
        <ellipse
          cx={bx}
          cy={by}
          rx={rx}
          ry={ry}
          fill="rgba(7, 19, 32, 0.55)"
          stroke={color}
          strokeWidth={2.5}
        />
        <ellipse cx={bx} cy={by} rx={6 * bk} ry={3.2 * bk} fill="#FFFFFF" />

        {/* Vertical 3D Laser Glow Stalk */}
        <line x1={bx} y1={by} x2={tx} y2={ty} stroke={color} strokeWidth={8} opacity={0.24} strokeLinecap="round" />
        <line x1={bx} y1={by} x2={tx} y2={ty} stroke="#FFFFFF" strokeWidth={2.6} strokeLinecap="round" />
        <line x1={bx} y1={by} x2={tx} y2={ty} stroke={color} strokeWidth={1.6} strokeDasharray="5 3" />

        {/* Apex Orb + Connector */}
        <circle cx={tx} cy={ty} r={9} fill={color} opacity={0.32} />
        <circle cx={tx} cy={ty} r={5} fill="#FFFFFF" stroke={color} strokeWidth={2.5} />
        <line
          x1={tx}
          y1={ty}
          x2={align === "right" ? cardLeft : align === "left" ? cardLeft + cardWidth : tx}
          y2={ty}
          stroke={color}
          strokeWidth={2.2}
        />
      </svg>

      <div
        style={{
          position: "absolute",
          left: Math.max(24, Math.min(1920 - cardWidth - 24, cardLeft)),
          top: Math.max(20, cardTop),
          width: cardWidth,
          padding: "11px 16px",
          background: "linear-gradient(135deg, rgba(6, 17, 31, 0.96) 0%, rgba(12, 31, 54, 0.94) 100%)",
          borderRadius: 10,
          border: `1.5px solid ${color}`,
          borderLeft: `6px solid ${color}`,
          boxShadow: `0 18px 38px rgba(0, 0, 0, 0.65), 0 0 22px rgba(0, 0, 0, 0.35)`,
          opacity: reveal,
          transform: `translateY(${(1 - reveal) * 14}px)`,
          pointerEvents: "none",
        }}
      >
        {kicker && (
          <div
            style={{
              fontFamily: FONTS.mono,
              fontSize: 11.5,
              fontWeight: 700,
              color,
              letterSpacing: "0.06em",
              marginBottom: 3,
            }}
          >
            {kicker}
          </div>
        )}
        <div
          style={{
            fontFamily: FONTS.sans,
            fontSize: 18,
            fontWeight: 700,
            color: PALETTE.textPrimary,
            lineHeight: 1.22,
          }}
        >
          {title}
        </div>
        {metric && (
          <div
            style={{
              fontFamily: FONTS.mono,
              fontSize: 22,
              fontWeight: 700,
              color,
              marginTop: 4,
            }}
          >
            {metric}
          </div>
        )}
        {sub && (
          <div
            style={{
              fontFamily: FONTS.sans,
              fontSize: 13.5,
              fontWeight: 600,
              color: PALETTE.sovereignty,
              marginTop: 3,
              lineHeight: 1.28,
            }}
          >
            {sub}
          </div>
        )}
      </div>
    </>
  );
};

/** 3D Parabolic Trajectory Arc with Ocean Surface Shadow & Altitude Struts */
export const Arc3DRoute: React.FC<{
  coords: readonly LonLat[];
  box: CameraBox;
  canvasW?: number;
  canvasH?: number;
  project: Projector3D;
  maxAltitudeZ?: number;
  reveal: number;
  color: string;
  capsuleProgress?: number;
  capsuleLabel?: string;
}> = ({
  coords,
  box,
  canvasW = 1920,
  canvasH = 1080,
  project,
  maxAltitudeZ = 125,
  reveal,
  color,
  capsuleProgress,
  capsuleLabel,
}) => {
  if (reveal <= 0.01) return null;
  const N = 44;
  const ptsGeo = sampleGeoPolyline(coords, N);
  const limitIdx = Math.max(1, Math.round((N - 1) * Math.min(1, reveal)));

  const shadowPts: [number, number][] = [];
  const arcPts: [number, number][] = [];

  for (let i = 0; i <= limitIdx; i++) {
    const t = i / (N - 1);
    const [gx, gy] = lonLatToScreen(box, ptsGeo[i], canvasW, canvasH);
    const z = Math.sin(t * Math.PI) * maxAltitudeZ;
    const [sx, sy] = project(gx, gy, 0);
    const [ax, ay] = project(gx, gy, z);
    shadowPts.push([sx, sy]);
    arcPts.push([ax, ay]);
  }

  const shadowD = shadowPts.map((p, i) => `${i === 0 ? "M" : "L"}${p[0].toFixed(1)},${p[1].toFixed(1)}`).join(" ");
  const arcD = arcPts.map((p, i) => `${i === 0 ? "M" : "L"}${p[0].toFixed(1)},${p[1].toFixed(1)}`).join(" ");

  let capPt: [number, number] | null = null;
  if (capsuleProgress !== undefined && capsuleProgress > 0.01) {
    const ci = Math.min(limitIdx, Math.max(0, Math.round(capsuleProgress * (N - 1))));
    capPt = arcPts[ci] || null;
  }

  return (
    <svg width={1920} height={1080} style={{ position: "absolute", inset: 0, pointerEvents: "none" }}>
      {/* Sea-floor dark shadow of the 3D arc */}
      <path
        d={shadowD}
        fill="none"
        stroke="rgba(2, 6, 17, 0.72)"
        strokeWidth={6}
        strokeDasharray="8 6"
        strokeLinecap="round"
      />
      {/* Vertical altitude drop-lines */}
      {arcPts.map((ap, idx) => {
        if (idx === 0 || idx === limitIdx || idx % 7 !== 0) return null;
        const sp = shadowPts[idx];
        return (
          <line
            key={idx}
            x1={sp[0]}
            y1={sp[1]}
            x2={ap[0]}
            y2={ap[1]}
            stroke={color}
            strokeWidth={1.2}
            opacity={0.32}
            strokeDasharray="3 3"
          />
        );
      })}
      {/* Glowing 3D Airborne Arc */}
      <path d={arcD} fill="none" stroke={color} strokeWidth={10} opacity={0.24} strokeLinecap="round" />
      <path d={arcD} fill="none" stroke={color} strokeWidth={4} strokeLinecap="round" />
      <path d={arcD} fill="none" stroke="#FFFFFF" strokeWidth={1.4} opacity={0.85} strokeLinecap="round" />

      {capPt && (
        <g transform={`translate(${capPt[0]}, ${capPt[1]})`}>
          <circle r={12} fill={color} opacity={0.32} />
          <circle r={5.5} fill="#FFFFFF" stroke={color} strokeWidth={2.5} />
          {capsuleLabel && (
            <g transform="translate(14, -10)">
              <rect x={0} y={-14} width={capsuleLabel.length * 8.6 + 20} height={24} rx={5} fill="rgba(6, 17, 31, 0.92)" stroke={color} strokeWidth={1.3} />
              <text x={10} y={2} fill="#FFFFFF" fontFamily={FONTS.mono} fontSize={12} fontWeight={700}>
                {capsuleLabel}
              </text>
            </g>
          )}
        </g>
      )}
    </svg>
  );
};

/** 3D Elevated Sea Bridge with Vertical Concrete Piers & Water Shadow */
export const Bridge3DExtrusion: React.FC<{
  coords: readonly LonLat[];
  box: CameraBox;
  project: Projector3D;
  deckZ?: number;
  pierCount?: number;
  reveal: number;
  deckColor?: string;
  glowColor?: string;
}> = ({
  coords,
  box,
  project,
  deckZ = 34,
  pierCount = 16,
  reveal,
  deckColor = "#FFFFFF",
  glowColor = "#2DD4BF",
}) => {
  if (reveal <= 0.01) return null;
  const ptsGeo = sampleGeoPolyline(coords, pierCount);
  const limit = Math.max(1, Math.round((pierCount - 1) * Math.min(1, reveal)));

  const basePts: [number, number][] = [];
  const shadowPts: [number, number][] = [];
  const deckPts: [number, number][] = [];

  for (let i = 0; i <= limit; i++) {
    const [gx, gy] = lonLatToScreen(box, ptsGeo[i], 1920, 1080);
    const [bx, by] = project(gx, gy, 0);
    const [sx, sy] = project(gx + 8, gy + 12, 0);
    const [dx, dy] = project(gx, gy, deckZ);
    basePts.push([bx, by]);
    shadowPts.push([sx, sy]);
    deckPts.push([dx, dy]);
  }

  const shadowD = shadowPts.map((p, i) => `${i === 0 ? "M" : "L"}${p[0].toFixed(1)},${p[1].toFixed(1)}`).join(" ");
  const deckD = deckPts.map((p, i) => `${i === 0 ? "M" : "L"}${p[0].toFixed(1)},${p[1].toFixed(1)}`).join(" ");

  return (
    <svg width={1920} height={1080} style={{ position: "absolute", inset: 0, pointerEvents: "none" }}>
      {/* Cast shadow on estuary water */}
      <path d={shadowD} fill="none" stroke="rgba(2, 6, 17, 0.78)" strokeWidth={11} strokeLinecap="round" />

      {/* Vertical 3D Bridge Piers rising out of Nam Trieu mouth */}
      {deckPts.map((dp, i) => {
        const bp = basePts[i];
        return (
          <g key={i}>
            <ellipse cx={bp[0]} cy={bp[1]} rx={5.5} ry={2.6} fill="rgba(45, 212, 191, 0.45)" />
            <line x1={bp[0]} y1={bp[1]} x2={dp[0]} y2={dp[1]} stroke="#94A3B8" strokeWidth={3.4} />
            <line x1={bp[0] - 1} y1={bp[1]} x2={dp[0] - 1} y2={dp[1]} stroke="#F8FAFC" strokeWidth={1.2} />
          </g>
        );
      })}

      {/* Elevated 3D Highway Deck */}
      <path d={deckD} fill="none" stroke={glowColor} strokeWidth={15} opacity={0.32} strokeLinecap="round" />
      <path d={deckD} fill="none" stroke="#0F172A" strokeWidth={9.5} strokeLinecap="round" />
      <path d={deckD} fill="none" stroke={deckColor} strokeWidth={5.5} strokeLinecap="round" />
      <path d={deckD} fill="none" stroke={glowColor} strokeWidth={1.6} strokeDasharray="8 6" strokeLinecap="round" />
    </svg>
  );
};

/** 3D Extruded Terminal / Port Berth Block on Tilted Ground */
export const Extruded3DPolygon: React.FC<{
  coords: readonly LonLat[];
  box: CameraBox;
  project: Projector3D;
  heightZ?: number;
  fillTop: string;
  fillSide: string;
  strokeColor: string;
  dashed?: boolean;
  opacity?: number;
}> = ({
  coords,
  box,
  project,
  heightZ = 26,
  fillTop,
  fillSide,
  strokeColor,
  dashed = false,
  opacity = 1,
}) => {
  if (opacity <= 0.01) return null;
  const basePts = coords.map((c) => {
    const [gx, gy] = lonLatToScreen(box, c, 1920, 1080);
    return project(gx, gy, 0);
  });
  const topPts = coords.map((c) => {
    const [gx, gy] = lonLatToScreen(box, c, 1920, 1080);
    return project(gx, gy, heightZ * opacity);
  });

  const topD =
    topPts.map((p, i) => `${i === 0 ? "M" : "L"}${p[0].toFixed(1)},${p[1].toFixed(1)}`).join(" ") + " Z";

  return (
    <svg width={1920} height={1080} style={{ position: "absolute", inset: 0, pointerEvents: "none", opacity }}>
      {/* Extruded Side Walls */}
      {basePts.slice(0, -1).map((bp, i) => {
        const bp2 = basePts[i + 1];
        const tp2 = topPts[i + 1];
        const tp = topPts[i];
        const wallD = `M${bp[0].toFixed(1)},${bp[1].toFixed(1)} L${bp2[0].toFixed(1)},${bp2[1].toFixed(1)} L${tp2[0].toFixed(1)},${tp2[1].toFixed(1)} L${tp[0].toFixed(1)},${tp[1].toFixed(1)} Z`;
        return (
          <path
            key={i}
            d={wallD}
            fill={fillSide}
            stroke={strokeColor}
            strokeWidth={1.3}
            strokeDasharray={dashed ? "5 4" : undefined}
          />
        );
      })}
      {/* Glowing Roof Face */}
      <path
        d={topD}
        fill={fillTop}
        stroke={strokeColor}
        strokeWidth={2.5}
        strokeDasharray={dashed ? "8 5" : undefined}
      />
    </svg>
  );
};
