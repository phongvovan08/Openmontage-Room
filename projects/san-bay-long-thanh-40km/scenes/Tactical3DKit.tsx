import React from "react";
import { AbsoluteFill } from "remotion";
import { CameraBox, LonLat, lonLatToScreen } from "../mapMath";
import { DARK_SHADOW, FONTS, PALETTE, PAPER, SAFE_X } from "../theme";

export const GROUND_BLEED = { x: 880, top: 1250, bottom: 300 } as const;

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

export function projectGeoPoint(
  box: CameraBox,
  proj: Projector3D | undefined,
  coord: LonLat,
  gz = 0,
  width = 1920,
  height = 1080
): [number, number, number] {
  const [gx, gy] = lonLatToScreen(box, coord, width, height);
  if (!proj) return [gx, gy, 1];
  return proj(gx, gy, gz);
}

export function projectPolyline(
  box: CameraBox,
  proj: Projector3D,
  coords: readonly LonLat[],
  gz = 0,
  width = 1920,
  height = 1080
): string {
  return coords
    .map((c, idx) => {
      const [gx, gy] = lonLatToScreen(box, c, width, height);
      const [sx, sy] = proj(gx, gy, gz);
      return `${idx === 0 ? "M" : "L"}${sx.toFixed(1)},${sy.toFixed(1)}`;
    })
    .join(" ");
}

export function sampleGeoPolyline(coords: readonly LonLat[], count: number): LonLat[] {
  if (coords.length === 0) return [];
  if (coords.length === 1) return Array.from({ length: count }, () => coords[0]);
  const segs: number[] = [];
  let total = 0;
  for (let i = 0; i < coords.length - 1; i++) {
    const d = Math.hypot(coords[i + 1][0] - coords[i][0], coords[i + 1][1] - coords[i][1]);
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

const SKY_STARS = Array.from({ length: 48 }, (_, i) => {
  const s1 = Math.sin(i * 127.1 + 311.7) * 43758.5453;
  const s2 = Math.sin(i * 269.5 + 183.3) * 28461.1293;
  return {
    x: 40 + (s1 - Math.floor(s1)) * 1840,
    y: 8 + (s2 - Math.floor(s2)) * 112,
    r: 0.8 + (i % 3) * 0.65,
    op: 0.22 + (i % 5) * 0.12,
  };
});

/**
 * 3D Perspective Stage for Aviation Radar.
 * Note: Never puts filter/maskImage on the 3D CSS-transformed container!
 * Compass ticks stay neatly centered at top y=14..36 above SceneHeaderPill (top=50) so they never overlap HUD cards.
 */
export const Tactical3DStage: React.FC<{
  spec: Camera3DSpec;
  horizonAccent?: string;
  compassBearingDeg?: number;
  groundChildren: React.ReactNode;
  overlayChildren?: React.ReactNode;
}> = ({
  spec,
  horizonAccent = PALETTE.skyCyan,
  compassBearingDeg = 18,
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
  const SUPER = 1.5;
  const BX = GROUND_BLEED.x;
  const BT = GROUND_BLEED.top;
  const BB = GROUND_BLEED.bottom;
  const W_G = width + 2 * BX;
  const H_G = height + BT + BB;

  return (
    <AbsoluteFill style={{ backgroundColor: PALETTE.abyss, overflow: "hidden" }}>
      <div
        style={{
          position: "absolute",
          left: ox - (ox + BX) * SUPER,
          top: oy - (oy + BT) * SUPER,
          width: W_G * SUPER,
          height: H_G * SUPER,
          transformOrigin: `${((ox + BX) * SUPER).toFixed(1)}px ${((oy + BT) * SUPER).toFixed(1)}px`,
          transform: `translateY(${ty.toFixed(1)}px) perspective(${persp}px) rotateX(${pitchDeg.toFixed(2)}deg) rotateZ(${yawDeg.toFixed(2)}deg) scale(${(mapScale / SUPER).toFixed(4)})`,
        }}
      >
        <div
          style={{
            position: "absolute",
            left: BX * SUPER,
            top: BT * SUPER,
            width,
            height,
            transformOrigin: "0 0",
            transform: `scale(${SUPER})`,
          }}
        >
          {groundChildren}
        </div>
      </div>

      {/* Warm Obsidian Horizon Sky Dome (clean blend over upper edge without colliding with left/right KPI cards) */}
      <div
        style={{
          position: "absolute",
          left: 0,
          right: 0,
          top: 0,
          height: 176,
          background:
            "linear-gradient(180deg, #0B0A09 0%, #161513 54%, rgba(22, 21, 19, 0.72) 78%, rgba(22, 21, 19, 0) 100%)",
          pointerEvents: "none",
        }}
      />
      <svg width={width} height={176} style={{ position: "absolute", left: 0, top: 0, pointerEvents: "none" }}>
        <defs>
          <radialGradient id="aviationHorizonGlow" cx="50%" cy="88%" r="50%">
            <stop offset="0%" stopColor={horizonAccent} stopOpacity={0.22} />
            <stop offset="55%" stopColor={horizonAccent} stopOpacity={0.07} />
            <stop offset="100%" stopColor="#0B0A09" stopOpacity={0} />
          </radialGradient>
        </defs>
        <rect width={width} height={176} fill="url(#aviationHorizonGlow)" />
        {SKY_STARS.map((st, idx) => (
          <circle key={idx} cx={st.x} cy={st.y} r={st.r} fill="#E6E4D9" opacity={st.op} />
        ))}
        {/* Centered Top-Sky Heading Tape (y=36, strictly above SceneHeaderPill top=50) */}
        <line x1={620} y1={36} x2={1300} y2={36} stroke="rgba(206, 205, 195, 0.24)" strokeWidth={1} />
        {ticks.map((dt) => {
          const tx = 960 + dt * 7.8;
          const deg = (((Math.round(compassBearingDeg + dt) % 360) + 360) % 360)
            .toString()
            .padStart(3, "0");
          const major = dt % 20 === 0;
          return (
            <g key={dt}>
              <line
                x1={tx}
                y1={major ? 26 : 30}
                x2={tx}
                y2={36}
                stroke={dt === 0 ? horizonAccent : "rgba(206, 205, 195, 0.45)"}
                strokeWidth={dt === 0 ? 2.2 : 1.1}
              />
              {major && (
                <text
                  x={tx}
                  y={21}
                  textAnchor="middle"
                  fill={dt === 0 ? "#FFFCF0" : "rgba(206, 205, 195, 0.72)"}
                  fontFamily={FONTS.mono}
                  fontSize={10.5}
                  fontWeight={700}
                >
                  {deg}°
                </text>
              )}
            </g>
          );
        })}
      </svg>

      {overlayChildren}
    </AbsoluteFill>
  );
};

export const Tactical3DBeacon: React.FC<{
  box: CameraBox;
  proj?: Projector3D;
  lonLat: LonLat;
  label: string;
  sublabel?: string;
  color: string;
  heightPx?: number;
  align?: "left" | "right" | "center";
  reveal?: number;
}> = ({
  box,
  proj,
  lonLat,
  label,
  sublabel,
  color,
  heightPx = 88,
  align = "left",
  reveal = 1,
}) => {
  if (reveal <= 0.02) return null;
  const [bx, by] = projectGeoPoint(box, proj, lonLat, 0);
  const [tx, ty] = projectGeoPoint(box, proj, lonLat, heightPx);
  const anchor = align === "right" ? "end" : align === "center" ? "middle" : "start";
  const txOff = align === "right" ? -12 : align === "center" ? 0 : 12;

  return (
    <g opacity={reveal}>
      <circle cx={bx} cy={by} r={11} fill={color} opacity={0.22} />
      <circle cx={bx} cy={by} r={4.5} fill={color} stroke="#100F0F" strokeWidth={2} />
      <line x1={bx} y1={by} x2={tx} y2={ty} stroke="rgba(16, 15, 15, 0.85)" strokeWidth={4.2} />
      <line x1={bx} y1={by} x2={tx} y2={ty} stroke={color} strokeWidth={2.2} strokeDasharray="5 3" />
      <circle cx={tx} cy={ty} r={5.5} fill={PALETTE.ivory} stroke={color} strokeWidth={2.4} />
      <text
        x={tx + txOff}
        y={ty - (sublabel ? 8 : 0)}
        textAnchor={anchor}
        fill={PALETTE.ivory}
        stroke="#100F0F"
        strokeWidth={4.8}
        paintOrder="stroke"
        fontFamily={FONTS.display}
        fontSize={16.5}
        fontWeight={700}
      >
        {label}
      </text>
      {sublabel && (
        <text
          x={tx + txOff}
          y={ty + 18}
          textAnchor={anchor}
          fill={color}
          stroke="#100F0F"
          strokeWidth={4.2}
          paintOrder="stroke"
          fontFamily={FONTS.mono}
          fontSize={12.5}
          fontWeight={700}
        >
          {sublabel}
        </text>
      )}
    </g>
  );
};

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
  stalkZ = 140,
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
  const rx = 24 * bk;
  const ry = 12 * bk;
  const prx = (20 + pulsePhase * 30) * bk;
  const pry = (10 + pulsePhase * 15) * bk;

  const rawLeft = align === "right" ? tx + 16 : align === "left" ? tx - cardWidth - 16 : tx - cardWidth * 0.5;
  const cardLeft = Math.max(SAFE_X, Math.min(1920 - SAFE_X - cardWidth, rawLeft));
  const cardTop = Math.max(106, Math.min(820, ty - 34));

  return (
    <>
      <svg width={1920} height={1080} style={{ position: "absolute", inset: 0, pointerEvents: "none", opacity: reveal }}>
        <ellipse cx={bx} cy={by} rx={prx} ry={pry} fill="none" stroke={color} strokeWidth={2} opacity={1 - pulsePhase} />
        <ellipse cx={bx} cy={by} rx={rx} ry={ry} fill="rgba(16, 15, 15, 0.55)" stroke={color} strokeWidth={2.2} />
        <ellipse cx={bx} cy={by} rx={5.5 * bk} ry={3 * bk} fill="#FFFCF0" />
        <line x1={bx} y1={by} x2={tx} y2={ty} stroke={color} strokeWidth={6} opacity={0.22} strokeLinecap="round" />
        <line x1={bx} y1={by} x2={tx} y2={ty} stroke="#FFFCF0" strokeWidth={2.2} strokeLinecap="round" />
        <circle cx={tx} cy={ty} r={8} fill={color} opacity={0.30} />
        <circle cx={tx} cy={ty} r={4.6} fill="#FFFCF0" stroke={color} strokeWidth={2.2} />
        <line
          x1={tx}
          y1={ty}
          x2={align === "left" ? cardLeft + cardWidth : cardLeft}
          y2={cardTop + 26}
          stroke={color}
          strokeWidth={1.8}
        />
      </svg>
      <div
        style={{
          position: "absolute",
          left: cardLeft,
          top: cardTop,
          width: cardWidth,
          padding: "10px 15px",
          background: PALETTE.cardBg,
          borderRadius: 10,
          border: `1px solid ${PALETTE.borderHairline}`,
          borderLeft: `5px solid ${color}`,
          boxShadow: DARK_SHADOW,
          opacity: reveal,
          pointerEvents: "none",
        }}
      >
        {kicker && <div style={{ fontFamily: FONTS.mono, fontSize: 11.5, fontWeight: 700, color, marginBottom: 2 }}>{kicker}</div>}
        <div style={{ fontFamily: FONTS.display, fontSize: 17.5, fontWeight: 700, color: PALETTE.ivory, lineHeight: 1.24 }}>{title}</div>
        {metric && <div style={{ fontFamily: FONTS.mono, fontSize: 20, fontWeight: 700, color, marginTop: 3 }}>{metric}</div>}
        {sub && <div style={{ fontFamily: FONTS.display, fontSize: 13.5, fontWeight: 600, color: PALETTE.mist, marginTop: 3, lineHeight: 1.3 }}>{sub}</div>}
      </div>
    </>
  );
};

export const Arc3DRoute: React.FC<{
  coords: readonly LonLat[];
  box: CameraBox;
  project?: Projector3D;
  maxAltitudeZ?: number;
  reveal: number;
  color: string;
  dashed?: boolean;
  strokeWidth?: number;
}> = ({ coords, box, project, maxAltitudeZ = 56, reveal, color, dashed = false, strokeWidth = 4 }) => {
  if (reveal <= 0.01) return null;
  const N = 40;
  const ptsGeo = sampleGeoPolyline(coords, N);
  const limitIdx = Math.max(1, Math.round((N - 1) * Math.min(1, reveal)));
  const shadowPts: [number, number][] = [];
  const arcPts: [number, number][] = [];

  for (let i = 0; i <= limitIdx; i++) {
    const t = i / (N - 1);
    const [gx, gy] = lonLatToScreen(box, ptsGeo[i], 1920, 1080);
    const z = Math.sin(t * Math.PI) * maxAltitudeZ;
    const [sx, sy] = project ? project(gx, gy, 0) : [gx, gy];
    const [ax, ay] = project ? project(gx, gy, z) : [gx, gy - z];
    shadowPts.push([sx, sy]);
    arcPts.push([ax, ay]);
  }
  const shadowD = shadowPts.map((p, i) => `${i === 0 ? "M" : "L"}${p[0].toFixed(1)},${p[1].toFixed(1)}`).join(" ");
  const arcD = arcPts.map((p, i) => `${i === 0 ? "M" : "L"}${p[0].toFixed(1)},${p[1].toFixed(1)}`).join(" ");

  return (
    <svg width={1920} height={1080} style={{ position: "absolute", inset: 0, pointerEvents: "none" }}>
      <path d={shadowD} fill="none" stroke="rgba(2, 6, 17, 0.72)" strokeWidth={5} strokeDasharray="8 6" strokeLinecap="round" />
      {arcPts.map((ap, idx) =>
        idx > 0 && idx < limitIdx && idx % 8 === 0 ? (
          <line key={idx} x1={shadowPts[idx][0]} y1={shadowPts[idx][1]} x2={ap[0]} y2={ap[1]} stroke={color} strokeWidth={1.1} opacity={0.32} strokeDasharray="3 3" />
        ) : null
      )}
      <path d={arcD} fill="none" stroke={color} strokeWidth={strokeWidth * 2.4} opacity={0.22} strokeLinecap="round" strokeDasharray={dashed ? "10 7" : undefined} />
      <path d={arcD} fill="none" stroke={color} strokeWidth={strokeWidth} strokeLinecap="round" strokeDasharray={dashed ? "10 7" : undefined} />
      <path d={arcD} fill="none" stroke="#FFFFFF" strokeWidth={1.3} opacity={0.8} strokeLinecap="round" strokeDasharray={dashed ? "10 7" : undefined} />
    </svg>
  );
};

/** 3D Elevated River/Sea Bridge with solid onshore abutment ramps + water-only piers */
export const Bridge3DExtrusion: React.FC<{
  coords: readonly LonLat[];
  box: CameraBox;
  project: Projector3D;
  deckZ?: number;
  pierCount?: number;
  reveal: number;
  deckColor?: string;
  glowColor?: string;
}> = ({ coords, box, project, deckZ = 28, pierCount = 14, reveal, deckColor = "#FFFFFF", glowColor = PALETTE.goldCaution }) => {
  if (reveal <= 0.01) return null;
  const ptsGeo = sampleGeoPolyline(coords, pierCount);
  const limit = Math.max(1, Math.round((pierCount - 1) * Math.min(1, reveal)));
  const basePts: [number, number][] = [];
  const shadowPts: [number, number][] = [];
  const deckPts: [number, number][] = [];

  for (let i = 0; i <= limit; i++) {
    const u = i / Math.max(1, pierCount - 1);
    const ramp = u <= 0.16 ? u / 0.16 : u >= 0.84 ? (1 - u) / 0.16 : 1;
    const zHere = 2 + (deckZ - 2) * Math.sin((Math.min(1, Math.max(0, ramp)) * Math.PI) / 2);
    const [gx, gy] = lonLatToScreen(box, ptsGeo[i], 1920, 1080);
    const [bx, by] = project(gx, gy, 0);
    const [sx, sy] = project(gx + 5, gy + 8, 0);
    const [dx, dy] = project(gx, gy, zHere);
    basePts.push([bx, by]);
    shadowPts.push([sx, sy]);
    deckPts.push([dx, dy]);
  }

  const waterShadows = shadowPts.slice(1, Math.max(2, shadowPts.length - 1));
  const shadowD = waterShadows.map((p, i) => `${i === 0 ? "M" : "L"}${p[0].toFixed(1)},${p[1].toFixed(1)}`).join(" ");
  const deckD = deckPts.map((p, i) => `${i === 0 ? "M" : "L"}${p[0].toFixed(1)},${p[1].toFixed(1)}`).join(" ");

  return (
    <svg width={1920} height={1080} style={{ position: "absolute", inset: 0, pointerEvents: "none" }}>
      {waterShadows.length >= 2 && (
        <path d={shadowD} fill="none" stroke="rgba(2, 6, 17, 0.78)" strokeWidth={10} strokeLinecap="round" />
      )}
      {deckPts.map((dp, i) => {
        if (i === 0 || i === pierCount - 1) return null;
        const bp = basePts[i];
        return (
          <g key={i}>
            <ellipse cx={bp[0]} cy={bp[1]} rx={5} ry={2.4} fill={glowColor} opacity={0.45} />
            <line x1={bp[0]} y1={bp[1]} x2={dp[0]} y2={dp[1]} stroke="#94A3B8" strokeWidth={3.2} />
            <line x1={bp[0] - 1} y1={bp[1]} x2={dp[0] - 1} y2={dp[1]} stroke="#F8FAFC" strokeWidth={1.1} />
          </g>
        );
      })}
      {/* Shore abutment touchdown pads */}
      <circle cx={basePts[0][0]} cy={basePts[0][1]} r={5.5} fill={glowColor} stroke="#100F0F" strokeWidth={2} />
      {deckPts.length === pierCount && (
        <circle cx={basePts[basePts.length - 1][0]} cy={basePts[basePts.length - 1][1]} r={5.5} fill={glowColor} stroke="#100F0F" strokeWidth={2} />
      )}
      <path d={deckD} fill="none" stroke={glowColor} strokeWidth={14} opacity={0.30} strokeLinecap="round" />
      <path d={deckD} fill="none" stroke="#1C1B1A" strokeWidth={9} strokeLinecap="round" />
      <path d={deckD} fill="none" stroke={deckColor} strokeWidth={5} strokeLinecap="round" />
      <path d={deckD} fill="none" stroke={glowColor} strokeWidth={1.5} strokeDasharray="8 6" strokeLinecap="round" />
    </svg>
  );
};

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
}> = ({ coords, box, project, heightZ = 24, fillTop, fillSide, strokeColor, dashed = false, opacity = 1 }) => {
  if (opacity <= 0.01) return null;
  const basePts = coords.map((c) => projectGeoPoint(box, project, c, 0));
  const topPts = coords.map((c) => projectGeoPoint(box, project, c, heightZ * opacity));
  const topD = topPts.map((p, i) => `${i === 0 ? "M" : "L"}${p[0].toFixed(1)},${p[1].toFixed(1)}`).join(" ") + " Z";

  return (
    <svg width={1920} height={1080} style={{ position: "absolute", inset: 0, pointerEvents: "none", opacity }}>
      {basePts.slice(0, -1).map((bp, i) => {
        const bp2 = basePts[i + 1];
        const tp2 = topPts[i + 1];
        const tp = topPts[i];
        const wallD = `M${bp[0].toFixed(1)},${bp[1].toFixed(1)} L${bp2[0].toFixed(1)},${bp2[1].toFixed(1)} L${tp2[0].toFixed(1)},${tp2[1].toFixed(1)} L${tp[0].toFixed(1)},${tp[1].toFixed(1)} Z`;
        return <path key={i} d={wallD} fill={fillSide} stroke={strokeColor} strokeWidth={1.3} strokeDasharray={dashed ? "5 4" : undefined} />;
      })}
      <path d={topD} fill={fillTop} stroke={strokeColor} strokeWidth={2.4} strokeDasharray={dashed ? "8 5" : undefined} />
    </svg>
  );
};

/** Geodesic Caliper / Dimension Ruler ("|◄—— 365 M ——►|") inspired by Chuyen Tren Ban Do */
export const GeoCaliperRule: React.FC<{
  from: LonLat;
  to: LonLat;
  box: CameraBox;
  project?: Projector3D;
  gz?: number;
  label: string;
  color: string;
  reveal?: number;
  labelOffset?: readonly [number, number];
  canvasW?: number;
  canvasH?: number;
}> = ({ from, to, box, project, gz = 0, label, color, reveal = 1, labelOffset = [0, 0], canvasW = 1920, canvasH = 1080 }) => {
  if (reveal <= 0.02) return null;
  const [x1, y1] = projectGeoPoint(box, project, from, gz, canvasW, canvasH);
  const [x2, y2] = projectGeoPoint(box, project, to, gz, canvasW, canvasH);
  const cx = x1 + (x2 - x1) * 0.5;
  const cy = y1 + (y2 - y1) * 0.5;
  const lx = cx + labelOffset[0];
  const ly = cy + labelOffset[1];
  const dx = x2 - x1;
  const dy = y2 - y1;
  const len = Math.max(1, Math.hypot(dx, dy));
  const nx = (-dy / len) * 11;
  const ny = (dx / len) * 11;
  const ex = x1 + dx * reveal;
  const ey = y1 + dy * reveal;
  const pillW = Math.max(118, label.length * 10.6 + 28);

  return (
    <g opacity={Math.min(1, reveal * 1.4)}>
      <line x1={x1 - nx} y1={y1 - ny} x2={x1 + nx} y2={y1 + ny} stroke={PALETTE.abyss} strokeWidth={5.5} strokeLinecap="round" />
      <line x1={x1 - nx} y1={y1 - ny} x2={x1 + nx} y2={y1 + ny} stroke={color} strokeWidth={2.8} strokeLinecap="round" />
      <line x1={x1} y1={y1} x2={ex} y2={ey} stroke={PALETTE.abyss} strokeWidth={6} strokeLinecap="round" />
      <line x1={x1} y1={y1} x2={ex} y2={ey} stroke={color} strokeWidth={2.8} strokeDasharray="8 5" strokeLinecap="round" />
      {reveal > 0.9 && (
        <>
          <line x1={x2 - nx} y1={y2 - ny} x2={x2 + nx} y2={y2 + ny} stroke={PALETTE.abyss} strokeWidth={5.5} strokeLinecap="round" />
          <line x1={x2 - nx} y1={y2 - ny} x2={x2 + nx} y2={y2 + ny} stroke={color} strokeWidth={2.8} strokeLinecap="round" />
        </>
      )}
      {reveal > 0.45 && (
        <g>
          {(labelOffset[0] !== 0 || labelOffset[1] !== 0) && (
            <line x1={cx} y1={cy} x2={lx} y2={ly} stroke={color} strokeWidth={1.8} strokeDasharray="4 3" />
          )}
          <rect
            x={lx - pillW / 2}
            y={ly - 17}
            width={pillW}
            height={34}
            rx={8}
            fill="rgba(20, 19, 18, 0.94)"
            stroke={color}
            strokeWidth={1.5}
          />
          <text x={lx} y={ly + 5.5} textAnchor="middle" fill={color} fontFamily={FONTS.mono} fontSize={14.5} fontWeight={700}>
            {label}
          </text>
        </g>
      )}
    </g>
  );
};

/** Compact dot + leader callout pin so 80%+ of satellite terrain remains unobstructed */
export const CompactGeoPin: React.FC<{
  coord: LonLat;
  box: CameraBox;
  project?: Projector3D;
  label: string;
  tag?: string;
  color?: string;
  offset?: readonly [number, number];
  reveal?: number;
  canvasW?: number;
  canvasH?: number;
}> = ({ coord, box, project, label, tag, color = PALETTE.goldCaution, offset = [18, -32], reveal = 1, canvasW = 1920, canvasH = 1080 }) => {
  if (reveal <= 0.02) return null;
  const [x, y] = projectGeoPoint(box, project, coord, 0, canvasW, canvasH);
  const bx = x + offset[0];
  const by = y + offset[1];
  const textLen = Math.max(label.length, (tag || "").length);
  const w = Math.max(126, textLen * 9.6 + 30);
  const h = tag ? 46 : 30;
  const rx = offset[0] >= 0 ? bx : bx - w;
  const ry = by - h / 2;

  return (
    <g opacity={reveal}>
      <circle cx={x} cy={y} r={5.5} fill={color} stroke="#FFFCF0" strokeWidth={2} />
      <line x1={x} y1={y} x2={offset[0] >= 0 ? rx : rx + w} y2={by} stroke={color} strokeWidth={1.8} />
      <rect x={rx} y={ry} width={w} height={h} rx={7} fill="rgba(20, 19, 18, 0.92)" stroke="rgba(242, 240, 229, 0.24)" strokeWidth={1} />
      <rect x={rx} y={ry} width={4} height={h} rx={2} fill={color} />
      <text x={rx + 13} y={tag ? ry + 19 : ry + 20} fill={PALETTE.ivory} fontFamily={FONTS.display} fontSize={14} fontWeight={700}>
        {label}
      </text>
      {tag && (
        <text x={rx + 13} y={ry + 36} fill={color} fontFamily={FONTS.mono} fontSize={11.5} fontWeight={700}>
          {tag}
        </text>
      )}
    </g>
  );
};

/** Concentric Radar Range Fan with rotating directional sweep cone */
export const RadarRangeFan: React.FC<{
  cx: number;
  cy: number;
  radii: readonly number[];
  sweepDeg: number;
  color: string;
  coneDeg?: number;
}> = ({ cx, cy, radii, sweepDeg, color, coneDeg = 44 }) => {
  const maxR = radii[radii.length - 1] ?? 180;
  const a0 = ((sweepDeg - coneDeg / 2) * Math.PI) / 180;
  const a1 = ((sweepDeg + coneDeg / 2) * Math.PI) / 180;
  const x0 = cx + Math.cos(a0) * maxR;
  const y0 = cy + Math.sin(a0) * maxR;
  const x1 = cx + Math.cos(a1) * maxR;
  const y1 = cy + Math.sin(a1) * maxR;
  const d = `M${cx.toFixed(1)},${cy.toFixed(1)} L${x0.toFixed(1)},${y0.toFixed(1)} A${maxR},${maxR} 0 0,1 ${x1.toFixed(1)},${y1.toFixed(1)} Z`;

  return (
    <g>
      <path d={d} fill={color} opacity={0.14} />
      <line x1={cx} y1={cy} x2={x1} y2={y1} stroke={color} strokeWidth={2.2} opacity={0.85} />
      {radii.map((r, idx) => (
        <circle key={r} cx={cx} cy={cy} r={r} fill="none" stroke={color} strokeWidth={idx === radii.length - 1 ? 2 : 1.3} strokeDasharray="8 6" opacity={0.55 - idx * 0.08} />
      ))}
    </g>
  );
};

/** Circular Anchor Medallion ("✈", "⚓", "✕", "✓") inspired by Video 3 */
export const HubMedallion: React.FC<{
  cx: number;
  cy: number;
  glyph: string;
  color: string;
  radius?: number;
}> = ({ cx, cy, glyph, color, radius = 22 }) => (
  <g>
    <circle cx={cx} cy={cy} r={radius + 6} fill={color} opacity={0.20} />
    <circle cx={cx} cy={cy} r={radius} fill="#161514" stroke={color} strokeWidth={2.4} />
    <text x={cx} y={cy + radius * 0.36} textAnchor="middle" fill={color} fontFamily={FONTS.display} fontSize={Math.round(radius * 1.05)} fontWeight={700}>
      {glyph}
    </text>
  </g>
);

export const SceneHeaderPill: React.FC<{
  badge: string;
  title: string;
  accent?: string;
  variant?: "dark" | "paper";
}> = ({ badge, title, accent = PALETTE.skyCyan, variant = "dark" }) => {
  const isPaper = variant === "paper";
  return (
    <div
      style={{
        position: "absolute",
        left: SAFE_X,
        top: 48,
        display: "inline-flex",
        alignItems: "center",
        gap: 14,
        padding: "10px 20px",
        borderRadius: 10,
        background: isPaper ? PAPER.sheet : "rgba(22, 21, 19, 0.92)",
        border: isPaper ? `1px solid ${PAPER.ruleStrong}` : `1px solid ${PALETTE.borderHairline}`,
        borderLeft: `4px solid ${accent}`,
        boxShadow: isPaper ? PAPER.shadow : DARK_SHADOW,
        zIndex: 32,
      }}
    >
      <span
        style={{
          padding: "4px 10px",
          borderRadius: 6,
          background: accent,
          color: isPaper ? PAPER.sheet : PALETTE.abyss,
          fontFamily: FONTS.mono,
          fontSize: 12.5,
          fontWeight: 700,
          letterSpacing: "0.06em",
        }}
      >
        {badge}
      </span>
      <span
        style={{
          fontFamily: FONTS.display,
          fontSize: 22,
          fontWeight: 800,
          color: isPaper ? PAPER.ink : PALETTE.ivory,
          letterSpacing: "-0.015em",
        }}
      >
        {title}
      </span>
    </div>
  );
};
