import React from "react";
import { AbsoluteFill, useCurrentFrame } from "remotion";
import { PAPER } from "../theme";

const grainCache = new Map<number, string>();

function grainTile(seedIdx: number): string {
  const cached = grainCache.get(seedIdx);
  if (cached) return cached;
  const svg =
    `<svg xmlns='http://www.w3.org/2000/svg' width='240' height='240'>` +
    `<filter id='g'><feTurbulence type='fractalNoise' baseFrequency='0.82' numOctaves='2' seed='${seedIdx * 19 + 5}' stitchTiles='stitch'/>` +
    `<feColorMatrix type='matrix' values='0.33 0.33 0.33 0 0 0.33 0.33 0.33 0 0 0.33 0.33 0.33 0 0 0 0 0 0 1'/>` +
    `<feComponentTransfer><feFuncR type='linear' slope='2.2' intercept='-0.6'/><feFuncG type='linear' slope='2.2' intercept='-0.6'/><feFuncB type='linear' slope='2.2' intercept='-0.6'/></feComponentTransfer></filter>` +
    `<rect width='100%' height='100%' filter='url(#g)'/></svg>`;
  const uri = `url("data:image/svg+xml;utf8,${encodeURIComponent(svg)}")`;
  grainCache.set(seedIdx, uri);
  return uri;
}

/** Deterministic SVG fractal-noise overlay (cached URI tiles, zero external files). */
export const FilmGrainOverlay: React.FC<{
  opacity?: number;
  blend?: React.CSSProperties["mixBlendMode"];
  step?: number;
}> = ({ opacity = 0.04, blend = "multiply", step = 2 }) => {
  const frame = useCurrentFrame();
  const k = Math.floor(frame / Math.max(1, step));
  const h1 = Math.sin(k * 127.1 + 311.7) * 43758.5453;
  const h2 = Math.sin(k * 269.5 + 183.3) * 28461.1293;
  const ox = Math.floor((h1 - Math.floor(h1)) * 240);
  const oy = Math.floor((h2 - Math.floor(h2)) * 240);
  return (
    <div
      style={{
        position: "absolute",
        inset: 0,
        pointerEvents: "none",
        opacity,
        mixBlendMode: blend,
        backgroundImage: grainTile(k % 6),
        backgroundSize: "240px 240px",
        backgroundPosition: `${ox}px ${oy}px`,
        zIndex: 44,
      }}
    />
  );
};

/**
 * 5-Layer Warm Archival Paper Stage for Analytical, Chart, & Split Documentary Scenes.
 * Layer 1: Warm vellum gradient (#F7F3E8 -> #F1EBDD -> #E6DFCE) + soft editorial sunlight glow
 * Layer 2: Subtle 36px cartographic surveyor grid & corner registration crosses
 * Layer 3: Scene content (paper sheets, charts, Polaroid evidence prints)
 * Layer 4: Soft warm desk vignette
 * Layer 5: Multiply cellulose paper grain (0.045)
 */
export const EditorialPaperStage: React.FC<{
  children: React.ReactNode;
}> = ({ children }) => {
  const [c0, c1, c2] = PAPER.bgGrad;
  const marks: Array<[number, number]> = [
    [36, 36],
    [1884, 36],
    [36, 1044],
    [1884, 1044],
  ];

  return (
    <AbsoluteFill
      style={{
        background: `linear-gradient(180deg, ${c0} 0%, ${c1} 54%, ${c2} 100%)`,
        overflow: "hidden",
      }}
    >
      {/* Top-left editorial desk key light */}
      <div
        style={{
          position: "absolute",
          inset: 0,
          pointerEvents: "none",
          background:
            "radial-gradient(ellipse 64% 58% at 22% 10%, rgba(255, 253, 246, 0.85) 0%, rgba(255, 252, 240, 0) 70%)",
        }}
      />

      {/* Subtle 36px surveyor grid & corner crosshairs */}
      <div
        style={{
          position: "absolute",
          inset: 0,
          pointerEvents: "none",
          backgroundImage:
            "linear-gradient(to right, rgba(28, 27, 26, 0.038) 1px, transparent 1px), linear-gradient(to bottom, rgba(28, 27, 26, 0.038) 1px, transparent 1px)",
          backgroundSize: "36px 36px",
        }}
      />
      <svg width={1920} height={1080} style={{ position: "absolute", inset: 0, pointerEvents: "none" }}>
        {marks.map(([mx, my], idx) => (
          <g key={idx} opacity={0.28}>
            <line x1={mx - 8} y1={my} x2={mx + 8} y2={my} stroke={PAPER.ink} strokeWidth={1.2} />
            <line x1={mx} y1={my - 8} x2={mx} y2={my + 8} stroke={PAPER.ink} strokeWidth={1.2} />
          </g>
        ))}
      </svg>

      {children}

      {/* Soft edge vignette */}
      <div
        style={{
          position: "absolute",
          inset: 0,
          pointerEvents: "none",
          background:
            "radial-gradient(ellipse at center, transparent 62%, rgba(42, 31, 18, 0.14) 100%)",
          zIndex: 42,
        }}
      />
      <FilmGrainOverlay opacity={0.045} blend="multiply" step={2} />
    </AbsoluteFill>
  );
};

/**
 * Global 2D warm cinema vignette + gentle film grain placed OUTSIDE CSS 3D containers
 * in Composition.tsx so 3D satellite rendering sharpness stays completely untouched.
 */
export const CinemaMapGradeOverlay: React.FC = () => (
  <AbsoluteFill style={{ pointerEvents: "none", zIndex: 55 }}>
    <div
      style={{
        position: "absolute",
        inset: 0,
        background:
          "radial-gradient(ellipse at center, transparent 64%, rgba(16, 15, 15, 0.24) 100%)",
      }}
    />
    <FilmGrainOverlay opacity={0.038} blend="soft-light" step={2} />
  </AbsoluteFill>
);

