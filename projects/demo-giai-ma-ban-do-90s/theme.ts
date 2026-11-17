// Bespoke Art Direction Tokens — Vox / Johnny Harris + Flexoki Archival Atlas Hybrid
// Strictly local to projects/demo-giai-ma-ban-do-90s (Atelier mode).

export const CANVAS_W = 1920;
export const CANVAS_H = 1080;
export const SAFE_X = 64; // Editorial title-safe margin
export const SAFE_Y = 64; // Editorial vertical title-safe margin

export const PALETTE = {
  deepSea: "#100F0F",
  shelfSea: "#161514",
  panelBg: "rgba(24, 23, 21, 0.92)",
  panelBgSolid: "#1C1B1A",
  landMain: "#1C1B1A",
  landHighlight: "#282726",
  landNeighbour: "#141312",
  coastStroke: "#5695C9",
  neighbourStroke: "#282726",
  gridLine: "rgba(242, 240, 229, 0.10)",
  sovereignty: "#E6E4D9",
  amberSilt: "#BC5215",
  amberBright: "#E5AF28",
  tealDeep: "#1E7870",
  tealSoft: "rgba(58, 169, 159, 0.18)",
  coralWarn: "#D94E41",
  coralSoft: "rgba(217, 78, 65, 0.16)",
  textPrimary: "#FFFCF0",
  textSecondary: "#CECDC3",
  textMuted: "#878580",
  borderSubtle: "rgba(242, 240, 229, 0.14)",
} as const;

export const PAPER = {
  bgGrad: ["#F7F3E8", "#F1EBDD", "#E6DFCE"] as const,
  sheet: "#FFFCF0",
  sheetAlt: "#F2F0E5",
  ink: "#100F0F",
  ink2: "#575653",
  rule: "rgba(28, 27, 26, 0.12)",
  barMuted: "#D4CFC0",
  jade: "#1E7870",
  vermilion: "#C93B2B",
  ochre: "#B88308",
} as const;

export const FONTS = {
  sans: "'BeVietnamProLocal', 'Segoe UI', sans-serif",
  mono: "'IBMPlexMonoLocal', 'TechMonoLocal', 'Consolas', monospace",
} as const;

/** Format decimal numbers using Vietnamese comma separator (e.g. -12,9 m | 15,63 km). */
export function formatVnNumber(value: number, decimals = 1): string {
  const fixed = value.toFixed(decimals);
  const [intPart, decPart] = fixed.split(".");
  const sign = intPart.startsWith("-") ? "-" : "";
  const digits = sign ? intPart.slice(1) : intPart;
  const grouped = digits.replace(/\B(?=(\d{3})+(?!\d))/g, ".");
  return decimals > 0 ? `${sign}${grouped},${decPart}` : `${sign}${grouped}`;
}

/** Clamp a floating callout card rectangle strictly inside the 1920x1080 safe zone. */
export function clampCardPosition(
  x: number,
  y: number,
  cardW: number,
  cardH: number,
  canvasW = CANVAS_W,
  canvasH = CANVAS_H,
  padX = SAFE_X,
  padY = SAFE_Y
): { left: number; top: number } {
  const left = Math.max(padX, Math.min(canvasW - padX - cardW, x));
  const top = Math.max(padY, Math.min(canvasH - padY - cardH, y));
  return { left, top };
}

