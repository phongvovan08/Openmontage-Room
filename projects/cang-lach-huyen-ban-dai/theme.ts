// Bespoke Art Direction Tokens — Modern Nautical & Hydrographic Atlas
// Strictly local to projects/cang-lach-huyen-ban-dai (Atelier mode).

export const CANVAS_W = 1920;
export const CANVAS_H = 1080;
export const SAFE_X = 96; // 5% horizontal title-safe margin
export const SAFE_Y = 64; // ~6% vertical title-safe margin

export const PALETTE = {
  deepSea: "#071320",
  shelfSea: "#0D2238",
  panelBg: "rgba(9, 22, 38, 0.90)",
  panelBgSolid: "#0B192C",
  landMain: "#16293D",
  landHighlight: "#1E3852",
  landNeighbour: "#0B1828",
  coastStroke: "#38BDF8",
  neighbourStroke: "#1E3A54",
  gridLine: "rgba(56, 189, 248, 0.12)",
  sovereignty: "#E2E8F0",
  amberSilt: "#D97706",
  amberBright: "#F59E0B",
  tealDeep: "#2DD4BF",
  tealSoft: "rgba(45, 212, 191, 0.18)",
  coralWarn: "#F43F5E",
  coralSoft: "rgba(244, 63, 94, 0.16)",
  textPrimary: "#F8FAFC",
  textSecondary: "#94A3B8",
  textMuted: "#64748B",
  borderSubtle: "rgba(148, 163, 184, 0.26)",
} as const;

export const FONTS = {
  sans: "'BeVietnamProLocal', 'Segoe UI', sans-serif",
  mono: "'TechMonoLocal', 'Cascadia Mono', 'Consolas', monospace",
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

