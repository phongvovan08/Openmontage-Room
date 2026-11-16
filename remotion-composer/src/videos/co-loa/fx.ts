// 2D effect drawings for "Cái lẫy nỏ" (Cổ Loa), in the same flat ink style as toon.ts: bronze arrowheads and the
// Cầu Vực hoard, the three-piece stone mould, the golden turtle, flying arrows, the trigger swap, the mousetrap and the
// crossbow-trigger diagram. Every drawing is a pure function of its arguments (the canvas pool caches by key). No text.
import { Pen, INK, SKIN, BRONZE } from "./toon";

type P2 = [number, number];
const rad = (d: number) => (d * Math.PI) / 180;
const clamp01 = (x: number) => Math.max(0, Math.min(1, x));
const rot = (pts: P2[], a: number, cx: number, cy: number): P2[] =>
  pts.map(([x, y]) => [cx + (x - cx) * Math.cos(a) - (y - cy) * Math.sin(a), cy + (x - cx) * Math.sin(a) + (y - cy) * Math.cos(a)]);
const hh = (i: number, s = 0) => { const v = Math.sin(i * 127.1 + s * 311.7) * 43758.5453; return v - Math.floor(v); };
const BRONZE_D = "#8a5a24", BRONZE_L = "#f2c76a", STONE = "#8f8a80", STONE_D = "#6c675f", WOOD = "#8a5a34", WOOD_D = "#6b4a2b";
const GOLD = "#f0c040", GOLD_D = "#b8862a";
const curvePts = (a: P2, k: P2, b: P2, n = 12): P2[] => {
  const out: P2[] = [];
  for (let i = 0; i <= n; i++) { const t = i / n, u = 1 - t; out.push([u * u * a[0] + 2 * u * t * k[0] + t * t * b[0], u * u * a[1] + 2 * u * t * k[1] + t * t * b[1]]); }
  return out;
};

/** one three-bladed bronze arrowhead (Cổ Loa type): point, tapering blades, short tang; s = length in px */
export const arrowhead = (p: Pen, x: number, y: number, s: number, a: number, fresh = false) => {
  const tip: P2 = [x, y - s / 2], b0: P2 = [x - 0.17 * s, y + 0.18 * s], b1: P2 = [x + 0.17 * s, y + 0.18 * s];
  p.poly(rot([tip, b1, [x + 0.05 * s, y + 0.25 * s], [x - 0.05 * s, y + 0.25 * s], b0], a, x, y), BRONZE, Math.max(1.5, s * 0.06));
  p.poly(rot([tip, [x + 0.02 * s, y + 0.2 * s], [x - 0.05 * s, y + 0.25 * s], b0], a, x, y), BRONZE_D, 0);
  p.band(rot([[x, y + 0.25 * s], [x, y + 0.5 * s]], a, x, y), BRONZE_D, s * 0.07, 1, "round");
  if (fresh) p.stroke(rot([[x - 0.17 * s, y + 0.18 * s], [x + 0.17 * s, y + 0.18 * s]], a, x, y), Math.max(1, s * 0.03), BRONZE_L); // mould seam
};

/** the Cầu Vực hoard: a heap of arrowheads on a 600 x 400 canvas, glints on top */
export const fxArrowPile = (p: Pen, glint = 0) => {
  p.ell(300, 330, 270, 60, "#5a4030", 6);
  for (let i = 0; i < 70; i++) {
    const r = Math.sqrt(hh(i)), a = hh(i, 1) * Math.PI;
    const x = 300 + Math.cos(a) * 240 * r * (hh(i, 2) < 0.5 ? -1 : 1), y = 330 - Math.sin(a) * 190 * (1 - r * 0.75) + 20 * hh(i, 3);
    arrowhead(p, x, y, 46 + 16 * hh(i, 4), rad(hh(i, 5) * 360), hh(i, 6) < 0.75);
  }
  for (let k = 0; k < 4; k++) {
    const u = (glint + k * 0.25) % 1, x = 160 + 280 * hh(k, 8), y = 170 + 120 * hh(k, 9), r = 22 * Math.sin(u * Math.PI);
    if (r > 2) { p.stroke([[x - r, y], [x + r, y]], 4, "#fff6d0"); p.stroke([[x, y - r], [x, y + r]], 4, "#fff6d0"); }
  }
};

/** the three-piece stone mould (three wedges round a triangular cavity) opening: t 0 closed + glowing .. 1 open, the
 *  fresh arrowhead in the middle. 600 x 600 canvas. */
export const fxMold = (p: Pen, t: number) => {
  const c = 300, open = 90 * clamp01((t - 0.25) / 0.6) ** 0.8, hot = clamp01(1 - t / 0.35);
  for (let k = 0; k < 3; k++) {
    const a = rad(-90 + k * 120), dx = Math.cos(a) * open, dy = Math.sin(a) * open;
    const pts: P2[] = [];
    for (let i = 0; i <= 8; i++) { const b = a - rad(58) + (rad(116) * i) / 8; pts.push([c + dx + Math.cos(b) * 200, c + dy + Math.sin(b) * 200]); }
    pts.push([c + dx + Math.cos(a + rad(60)) * 22, c + dy + Math.sin(a + rad(60)) * 22], [c + dx + Math.cos(a - rad(60)) * 22, c + dy + Math.sin(a - rad(60)) * 22]);
    p.poly(pts, k === 1 ? STONE_D : STONE, 9);
    p.stroke([[c + dx + Math.cos(a) * 60, c + dy + Math.sin(a) * 60], [c + dx + Math.cos(a) * 170, c + dy + Math.sin(a) * 170]], 4, "#a8a297");
  }
  if (hot > 0) p.ell(c, c, 60, 60, `rgba(255,150,40,${(0.85 * hot).toFixed(2)})`, 0);
  if (t > 0.3) arrowhead(p, c, c, 120, 0, true);
};

/** the golden turtle (Kim Quy) on a 600 x 420 canvas; sparkles turn with t; its raised claw glows */
export const fxTurtle = (p: Pen, t: number) => {
  const cx = 300, cy = 240;
  for (const [x, y, a] of [[-150, -60, -30], [150, -60, 30], [-140, 70, 30], [140, 70, -30]] as const)
    p.ell(cx + x, cy + y, 62, 26, GOLD_D, 7, 0, 360, a);
  p.ell(cx, cy - 150, 46, 52, GOLD, 8); // head
  p.dot(cx - 16, cy - 160, 7); p.dot(cx + 16, cy - 160, 7);
  p.arc(cx, cy - 135, 14, 8, 20, 160, 4);
  p.ell(cx, cy, 165, 130, GOLD, 10); // shell
  for (const [x, y] of [[0, 0], [-80, -45], [80, -45], [-80, 45], [80, 45], [0, -90], [0, 90]] as const) {
    const hex: P2[] = []; for (let i = 0; i < 6; i++) hex.push([cx + x + 34 * Math.cos(rad(60 * i)), cy + y + 30 * Math.sin(rad(60 * i))]);
    p.poly(hex, "#f7d36a", 4);
  }
  // the claw it gives: a glowing hooked claw raised by the front-right flipper
  const kx = cx + 215, ky = cy - 120;
  p.ell(kx, ky, 46, 46, "rgba(255,240,170,0.55)", 0);
  p.poly([[kx - 14, ky + 26], [kx + 10, ky + 24], [kx + 18, ky - 6], [kx + 4, ky - 30], [kx - 2, ky - 6]], "#fff1b0", 5);
  for (let k = 0; k < 6; k++) {
    const a = t * Math.PI * 2 + (k * Math.PI) / 3, x = cx + 250 * Math.cos(a), y = cy + 170 * Math.sin(a), r = 14 + 6 * (k % 2);
    p.poly([[x, y - r], [x + r * 0.3, y - r * 0.3], [x + r, y], [x + r * 0.3, y + r * 0.3], [x, y + r], [x - r * 0.3, y + r * 0.3], [x - r, y], [x - r * 0.3, y - r * 0.3]], "#fff6c8", 3);
  }
};

/** a flying arrow with speed lines, pointing +x, on a 420 x 80 canvas */
export const fxArrowFly = (p: Pen) => {
  for (let k = 0; k < 3; k++) p.stroke([[10 + k * 30, 22 + k * 18], [120 + k * 20, 22 + k * 18]], 4, "rgba(255,255,255,0.8)");
  p.band([[110, 40], [370, 40]], WOOD, 8, 2, "round");
  for (const s of [-1, 1]) p.poly([[110, 40], [150, 40], [130, 40 + s * 22], [96, 40 + s * 22]], "#e9e2d0", 3);
  arrowhead(p, 385, 40, 56, rad(90));
};

/** a single arrow (shaft + bronze head + fletching), pointing +x, on a 360 x 70 canvas */
export const fxArrow = (p: Pen) => {
  p.band([[40, 35], [300, 35]], WOOD, 8, 2, "round");
  for (const s of [-1, 1]) p.poly([[40, 35], [80, 35], [62, 35 + s * 20], [28, 35 + s * 20]], "#e9e2d0", 3);
  arrowhead(p, 318, 35, 52, rad(90));
};

/** the trigger swap (Trọng Thủy) on an 800 x 500 canvas: a section of the crossbow stock with the trigger slot.
 *  t < .35 the golden claw sits in the slot and glows; .35-.6 a hand covers it; > .6 a plain grey trigger sits there
 *  while the hand slides away right with the claw. */
export const fxSwap = (p: Pen, t: number) => {
  p.band([[40, 230], [760, 230]], WOOD, 90, 6, "butt");
  p.band([[40, 205], [760, 205]], "#a06a3e", 18, 0, "butt");
  p.poly([[340, 270], [460, 270], [470, 300], [330, 300]], WOOD_D, 5); // slot housing
  const claw = (x: number, y: number, glow: boolean) => {
    if (glow) p.ell(x, y + 40, 70, 70, "rgba(255,236,150,0.5)", 0);
    p.poly([[x - 26, y], [x + 22, y], [x + 34, y + 60], [x + 10, y + 120], [x - 4, y + 64]], GOLD, 7);
    p.stroke([[x - 10, y + 20], [x + 14, y + 70]], 3, GOLD_D);
  };
  const plain = (x: number, y: number) => p.poly([[x - 24, y], [x + 24, y], [x + 18, y + 115], [x - 14, y + 115]], "#8d949c", 7);
  const k = clamp01((t - 0.6) / 0.4);
  if (t < 0.35) claw(400, 280, true);
  else if (t >= 0.6) { plain(400, 280); claw(400 + 330 * k, 280 - 40 * k, false); }
  if (t > 0.25) { // the hand: palm + fingers, coming from the right, in a red Han sleeve
    const e = t < 0.6 ? clamp01((t - 0.25) / 0.12) : 1, hx = (t < 0.6 ? 760 - 360 * e : 400 + 330 * k) + 40, hy = 300 - (t >= 0.6 ? 40 * k : 0);
    p.band([[hx + 200, hy + 20], [hx + 400, hy + 10]], "#8c2f39", 120, 6, "butt");
    p.ell(hx + 80, hy + 20, 130, 60, SKIN, 8, 0, 360, -10);
    for (let i = 0; i < 4; i++) p.ell(hx - 30 + i * 10, hy - 30 + i * 28, 46, 16, SKIN, 6, 0, 360, -15);
  }
};

/** the mousetrap on a 700 x 420 canvas: wooden base, spring, bait, hammer, latch. u 0 = set (hammer held back by the
 *  latch), 0..0.5 the latch slipping (hammer trembles), 0.5..1 the hammer swings over; slam 0..1 = impact lines */
export const fxMousetrap = (p: Pen, u: number, slam = 0) => {
  p.poly([[60, 330], [640, 330], [660, 380], [40, 380]], "#c89458", 7); // base
  p.poly([[40, 380], [660, 380], [660, 396], [40, 396]], "#9a6a3c", 5);
  p.ell(470, 316, 26, 18, "#f2d36a", 5); // bait (cheese)
  p.ell(350, 318, 34, 18, "#8d949c", 6); // spring coil
  for (let i = 0; i < 4; i++) p.arc(330 + i * 14, 318, 10, 16, 0, 360, 3, "#5f666e");
  // hammer: a U-bar hinged at the spring; set = lying back to the left (180 deg), shut = flat on the right (0 deg)
  const a = u < 0.5 ? rad(180 - 4 * Math.sin(u * 40)) : rad(180 - 180 * clamp01((u - 0.5) / 0.5) ** 2);
  const L = 230, hx = 350 + Math.cos(a) * L, hy = 318 - Math.sin(a) * L * 0.55;
  p.band([[350, 318], [hx, hy]], "#8d949c", 12, 4, "round");
  // latch (chốt): a thin bar from the bait catching the hammer's end while set; it slides off as u grows
  if (u < 0.5) { const lx = hx + 140 * (u / 0.5); p.band([[470, 312], [lx, hy - 4]], "#5f666e", 6, 2, "round"); }
  else p.band([[470, 312], [520, 250]], "#5f666e", 6, 2, "round");
  if (slam > 0 && slam < 1) for (let i = 0; i < 7; i++) {
    const b = rad(-170 + i * 26), r0 = 70 + 40 * slam, r1 = r0 + 70 * (1 - slam);
    p.stroke([[580 + Math.cos(b) * r0, 300 + Math.sin(b) * r0], [580 + Math.cos(b) * r1, 300 + Math.sin(b) * r1]], 7, INK);
  }
};

/** crossbow trigger diagram, side view, on a 900 x 520 canvas. t 0..0.45 the finger comes up to the trigger while the
 *  bronze nut holds the drawn string; 0.5 the finger squeezes, the nut tips, the string flies forward, the arrow leaves */
export const fxMechanism = (p: Pen, t: number) => {
  const fire = clamp01((t - 0.5) / 0.12), go = clamp01((t - 0.52) / 0.45);
  p.band([[80, 230], [820, 230]], WOOD, 46, 5, "butt"); // stock
  p.band(curvePts([140, 60], [90, 230], [140, 400]), WOOD_D, 22, 4, "round"); // prod, edge-on
  const nutX = 560, sx = nutX - (nutX - 140) * fire;
  p.stroke([[140, 62], [sx, 214], [140, 398]], 4, INK); // string, caught on the nut until it fires
  const tip = rad(-35 * fire);
  p.poly(rot([[nutX - 22, 180], [nutX + 22, 180], [nutX + 22, 250], [nutX - 22, 250]], tip, nutX, 240), BRONZE, 5);
  p.band(rot([[nutX + 6, 250], [nutX + 26, 360]], tip * 0.6, nutX, 250), BRONZE, 18, 4, "round");
  const ax = 300 - 900 * go ** 1.4; // the arrow, nocked at the string, then away to the left
  if (ax > -320) {
    p.band([[ax, 205], [ax + 260, 205]], "#a07a52", 9, 2, "round");
    arrowhead(p, ax - 18, 205, 46, rad(-90));
    if (go > 0) for (let k = 0; k < 3; k++) p.stroke([[ax + 280 + k * 40, 190 + k * 14], [ax + 380 + k * 60, 190 + k * 14]], 4, "rgba(80,60,40,0.6)");
  }
  const fy = 470 - 90 * clamp01(t / 0.45) - 14 * fire; // the finger rises to the lever, then squeezes
  p.ell(nutX + 60, fy + 40, 70, 34, SKIN, 7, 0, 360, -20);
  p.ell(nutX + 34, fy - 10, 22, 50, SKIN, 6, 0, 360, -25);
};

/** the divine crossbow on its rack (palace), 800 x 420 canvas: stock, prod, string, the glowing golden-claw trigger */
export const fxNoThan = (p: Pen, claw = true) => {
  for (const x of [170, 630]) { p.band([[x, 410], [x, 240]], WOOD_D, 22, 5, "butt"); p.poly([[x - 40, 240], [x + 40, 240], [x + 30, 222], [x - 30, 222]], WOOD, 5); }
  p.band([[60, 200], [760, 200]], WOOD, 34, 5, "round");
  p.band(curvePts([620, 40], [700, 200], [620, 360]), WOOD_D, 20, 4, "round");
  p.stroke([[620, 42], [330, 200], [620, 358]], 3, INK);
  for (let i = 0; i < 6; i++) p.ell(140 + i * 80, 200, 10, 6, GOLD_D, 0); // Đông Sơn style inlay dots
  if (claw) { p.ell(330, 250, 46, 46, "rgba(255,236,150,0.55)", 0); p.poly([[316, 214], [344, 214], [352, 250], [338, 290], [326, 252]], GOLD, 5); }
  else p.poly([[316, 214], [344, 214], [340, 290], [322, 290]], "#8d949c", 5);
};
