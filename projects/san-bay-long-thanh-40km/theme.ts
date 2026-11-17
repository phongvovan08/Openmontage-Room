import { Easing } from "remotion";

export const CANVAS = {
  width: 1920,
  height: 1080,
  fps: 30,
  safeMargin: 64,
  subtitleSafeBottom: 930,
} as const;

/**
 * Vox / Johnny Harris + kepano/flexoki Hybrid Archival Atlas Tokens.
 * - Dark 3D Satellite Map scenes use warm Obsidian Ink (#100F0F / #1C1B1A) + calibrated map inks.
 * - Analytical / Chart / Split scenes use Warm Archival Paper (#F7F3E8 -> #E6DFCE) + single hero accent.
 */
export const PALETTE = {
  abyss: "#100F0F",
  deepNavy: "#161514",
  panelBgSolid: "#1C1B1A",
  surfaceNavy: "#1C1B1A",
  cardBg: "rgba(24, 23, 21, 0.92)",
  skyCyan: "#5695C9",
  tealAirport: "#3AA99F",
  tealDeep: "#1E7870",
  coralAlert: "#D94E41",
  crimsonGlow: "rgba(217, 78, 65, 0.22)",
  goldCaution: "#E5AF28",
  lateriteAmber: "#DA702C",
  mudOlive: "#6F6A60",
  ivory: "#FFFCF0",
  textPrimary: "#FFFCF0",
  mist: "#CECDC3",
  slateMuted: "#878580",
  borderHairline: "rgba(242, 240, 229, 0.14)",
  dossierCream: "#F6F1E3",
  dossierPaper: "#FFFCF0",
  dossierInk: "#100F0F",
  dossierCrimson: "#B8352B",
} as const;

export const PAPER = {
  bgGrad: ["#F7F3E8", "#F1EBDD", "#E6DFCE"] as readonly [string, string, string],
  sheet: "#FFFCF0",
  sheetAlt: "#F2F0E5",
  well: "#EAE4D5",
  ink: "#100F0F",
  ink2: "#575653",
  ink3: "#878580",
  rule: "rgba(28, 27, 26, 0.12)",
  ruleStrong: "rgba(28, 27, 26, 0.24)",
  barMuted: "#D4CFC0",
  jade: "#1E7870",
  vermilion: "#C93B2B",
  ochre: "#B88308",
  blue: "#205EA6",
  shadow: "0 18px 42px rgba(36, 26, 14, 0.10), 0 2px 6px rgba(36, 26, 14, 0.06)",
} as const;

export const SAFE_X = 64;

export const FONTS = {
  display: '"BeVietnamProLocal", "Segoe UI", sans-serif',
  sans: '"BeVietnamProLocal", "Segoe UI", sans-serif',
  mono: '"IBMPlexMonoLocal", "TechMonoLocal", "Consolas", monospace',
} as const;

export const EASE = {
  outExpo: Easing.bezier(0.16, 1, 0.3, 1),
  inOutQuint: Easing.bezier(0.83, 0, 0.17, 1),
  outCubic: Easing.out(Easing.cubic),
} as const;

export const DARK_SHADOW =
  "0 18px 44px rgba(0, 0, 0, 0.62), inset 0 1px 0 rgba(255, 252, 240, 0.07)";

export function formatVnNumber(value: number, decimals = 0): string {
  const fixed = decimals > 0 ? value.toFixed(decimals) : Math.round(value).toString();
  const [intPart, decPart] = fixed.split(".");
  const grouped = intPart.replace(/\B(?=(\d{3})+(?!\d))/g, ".");
  return decPart !== undefined ? `${grouped},${decPart}` : grouped;
}

export function clampCardPosition(
  left: number,
  top: number,
  width: number,
  height: number
): { left: number; top: number } {
  const maxL = Math.max(CANVAS.safeMargin, CANVAS.width - CANVAS.safeMargin - width);
  const maxT = Math.max(CANVAS.safeMargin, CANVAS.subtitleSafeBottom - height);
  return {
    left: Math.max(CANVAS.safeMargin, Math.min(maxL, left)),
    top: Math.max(CANVAS.safeMargin, Math.min(maxT, top)),
  };
}
