// Timeline of "Cái lẫy nỏ" (Cổ Loa, ~78 s): shots timed to the voice words
// (Chu-De/Bi-An-Lich-Su/cartoon3d-tap01-cai-lay-no/voice/words.json), the citadel layout (three earthen ramparts with
// their moats) and the camera grammar of the cartoon-3d-short skill: continuous slow push-ins, symmetric smootherstep
// glides of 18-40 f, big reframes are cuts, impacts are 7-frame kicks that flip sign every frame, no hand-held float.
export const FPS = 30;
export const TOTAL = 2340; // 78.0 s: last word ends 77.23 s, ~0.8 s tail
export const D0 = 0.0; // ground level (build.ts places houses on D0)
export type V3 = [number, number, number];

export const clamp01 = (x: number) => Math.max(0, Math.min(1, x));
export const smooth = (x: number) => { const u = clamp01(x); return u * u * (3 - 2 * u); };
export const easeOut = (u: number) => 1 - (1 - clamp01(u)) ** 4;
/** 0 before frame a, 1 after frame b, smooth between */
export const ramp = (f: number, a: number, b: number) => smooth((f - a) / Math.max(1, b - a));

// ---------------- the citadel ----------------
// Real Cổ Loa: outer rampart ~8 km round, up to 12 m high, 25 m at the base; middle ~6.5 km; inner rectangle ~1.6 km.
// Scaled down here so that a vertical frame can hold all three rings (the shapes and proportions are kept).
export type Ring = { ax: number; az: number; n: number; h: number; base: number; top: number; moat: number; wob: number };
export const RINGS: Ring[] = [
  { ax: 46, az: 66, n: 7, h: 7, base: 18, top: 4.5, moat: 10, wob: 0.0 }, // inner (Thành Nội): rectangular
  { ax: 128, az: 158, n: 2.6, h: 9, base: 22, top: 5, moat: 12, wob: 0.035 }, // middle (Thành Trung): irregular
  { ax: 215, az: 262, n: 2.2, h: 12, base: 25, top: 5.5, moat: 16, wob: 0.045 }, // outer (Thành Ngoại)
];
export const WATER_Y = -0.8;
/** centre line of ring r at angle th (superellipse with a slow wobble, so the outer rings read as hand-built) */
export const ringPt = (r: Ring, th: number): [number, number] => {
  const c = Math.cos(th), s = Math.sin(th), e = 2 / r.n;
  const w = 1 + r.wob * Math.sin(3 * th + 0.7) + r.wob * 0.6 * Math.sin(5 * th + 2.1);
  return [r.ax * Math.sign(c) * Math.abs(c) ** e * w, r.az * Math.sign(s) * Math.abs(s) ** e * w];
};
/** outward unit normal of ring r at angle th */
export const ringN = (r: Ring, th: number): [number, number] => {
  const a = ringPt(r, th - 0.002), b = ringPt(r, th + 0.002), tx = b[0] - a[0], tz = b[1] - a[1], l = Math.hypot(tx, tz) || 1;
  return [tz / l, -tx / l];
};
/** point on ring r at angle th, offset d metres outward from the centre line */
export const ringAt = (r: Ring, th: number, d = 0): [number, number] => {
  const p = ringPt(r, th), n = ringN(r, th);
  return [p[0] + n[0] * d, p[1] + n[1] * d];
};
/** height of the rampart profile at offset d from its centre line (0 outside the base) */
export const rampY = (r: Ring, d: number) => {
  const a = Math.abs(d), t = r.top / 2, b = r.base / 2;
  return a <= t ? r.h : a >= b ? 0 : r.h * smooth((b - a) / (b - t));
};
/** the wall walk where the crossbowmen stand: south side of the inner rampart */
export const WALK_TH = -Math.PI / 2;
export const WALL = (() => { const [x, z] = ringPt(RINGS[0], WALK_TH); return { x, z, y: RINGS[0].h }; })();
/** outer rampart centre line, south side (wobble included) */
export const OUT = ringPt(RINGS[2], -Math.PI / 2);
const moatMid = (ri: number, th: number) => { const r = RINGS[ri]; return ringAt(r, th, r.base / 2 + 1.5 + r.moat / 2); };

// ---------------- places ----------------
/** state bronze foundry inside the inner citadel (shed, furnace, workers, arrow heap) */
export const FOUNDRY: V3 = [24, 0, -36];
/** the golden turtle surfaces in the inner moat, south-east */
export const TURTLE: V3 = (() => { const [x, z] = moatMid(0, -1.32); return [x, WATER_Y, z]; })();
/** Triệu's army on the far bank of the outer moat (south) */
export const ARMY: V3 = [OUT[0] - 4, 0, OUT[1] - 44];
/** in front of the king's hall (hall at 0, 18; its front edge at z 14.3) */
export const PALACE: V3 = [0, 0, 10.6];
/** a village yard in the band between the inner moat and the middle rampart (south) */
export const VILLAGE: V3 = (() => { const [x, z] = ringAt(RINGS[1], -Math.PI / 2 - 0.12, -30); return [x, 0, z]; })();
/** Cầu Vực, 1959: the new road outside the outer moat, the pit */
export const DIG: V3 = [OUT[0] + 30, 0, OUT[1] - 46];

// ---------------- shots ----------------
export type Light = "day" | "golden";
export type Crowd = "wall" | "foundry" | "army" | "palace" | "misfire" | "village" | "fall" | "dig" | "none";
export type ShotDef = { id: number; a: number; b: number; light: Light; crowd: Crowd; fogK?: number; sunAz?: number; sunEl?: number };
// beats (frames @30 from words.json): hook 2-167 | setting 167-533 | "Trên thành là nỏ" 533-572 | foundry 572-752 |
// legend + Triệu army 752-1015 | Trọng Thủy 1015-1228 | luckily/unluckily 1228-1410 | mousetrap 1410-1838 |
// the fall 1838-1950 | 1959 dig 1950-2340
export const SHOTS: ShotDef[] = [
  { id: 1, a: 0, b: 167, light: "day", crowd: "wall" },
  { id: 2, a: 167, b: 533, light: "day", crowd: "none", fogK: 4.5 },
  { id: 3, a: 533, b: 572, light: "day", crowd: "wall" },
  { id: 4, a: 572, b: 752, light: "day", crowd: "foundry" },
  { id: 5, a: 752, b: 1015, light: "day", crowd: "army", fogK: 1.6 },
  // golden close shots: low sun from the side-front (the backlit preset turned the hall and houses into blue walls)
  { id: 6, a: 1015, b: 1228, light: "golden", crowd: "palace", sunAz: 125, sunEl: 12 },
  { id: 7, a: 1228, b: 1410, light: "day", crowd: "misfire" },
  { id: 8, a: 1410, b: 1838, light: "golden", crowd: "village", sunAz: 120, sunEl: 13 },
  { id: 9, a: 1838, b: 1950, light: "golden", crowd: "fall", fogK: 3.5 },
  { id: 10, a: 1950, b: TOTAL, light: "day", crowd: "dig", fogK: 1.5 },
];
/** crossfades (frames) at place/time changes; a white 4-frame flash after the hook */
export const XFADE: Record<number, number> = { 6: 8, 8: 10, 9: 8, 10: 10 };
export const FLASH_AT = 167;

export const shotAt = (f: number) => SHOTS.find((s) => f >= s.a && f < s.b) ?? SHOTS[SHOTS.length - 1];
export const layersAt = (f: number): { id: number; alpha: number }[] => {
  for (const s of SHOTS) {
    const x = XFADE[s.id];
    if (x && f >= s.a - x / 2 && f < s.a + x / 2) return [{ id: s.id - 1, alpha: 1 }, { id: s.id, alpha: (f - (s.a - x / 2) + 1) / (x + 1) }];
  }
  return [{ id: shotAt(f).id, alpha: 1 }];
};

// ---------------- story events (frames, from the word onsets) ----------------
export const EV = {
  moldOpen: [631, 662] as [number, number], // "khuôn đá ghép ba mảnh"
  turtleUp: [752, 800] as [number, number],
  flee: 890, // "Quân Triệu Đà kéo sang, thua lớn"
  swap: [1186, 1222] as [number, number], // "lặng lẽ đánh tráo cái lẫy"
  misfire: 1364, // "không bắn được nữa"
  trapSet: 1555, trapSlip: [1659, 1676] as [number, number], trapSlam: 1680, // "nếu cái chốt không giữ nổi"
  mechUp: [1705, 1785] as [number, number], mechFire: [1789, 1836] as [number, number], // "bóp nhẹ một ngón tay"
  pick: 2056, // "đào trúng"
  reveal: 2108, // "Bên trong là ..."
};

// ---------------- camera ----------------
export type Cam = { pos: V3; look: V3; fov: number; roll: number };
type Shot = Partial<Cam> & { pos: V3; look: V3 };
type Key = { f: number; dur?: number; cut?: boolean; s: (f: number) => Shot };
export const glide = (u: number) => { const x = clamp01(u); return x * x * x * (x * (6 * x - 15) + 10); };
const mix = (a: Cam, b: Cam, k: number): Cam => ({
  pos: a.pos.map((v, i) => v + (b.pos[i] - v) * k) as V3, look: a.look.map((v, i) => v + (b.look[i] - v) * k) as V3,
  fov: a.fov + (b.fov - a.fov) * k, roll: a.roll + (b.roll - a.roll) * k,
});
const full = (c: Shot): Cam => ({ fov: 40, roll: 0, ...c });
const run = (keys: Key[], f: number) => {
  let cur = full(keys[0].s(f));
  for (let i = 1; i < keys.length; i++) {
    const k = keys[i];
    if (f < k.f) break;
    cur = k.cut ? full(k.s(f)) : mix(cur, full(k.s(f)), glide((f - k.f) / (k.dur ?? 24)));
  }
  return cur;
};
const T = (f: number) => f / FPS;
/** push-in factor since f0 (subject grows ~rate per frame); `punch` raises it with 8 f soft edges for n frames */
const pushK = (f: number, f0: number, rate: number, punch = 0, n = 35) => {
  const x = Math.max(0, f - f0);
  let s = rate * x;
  if (punch > rate) for (let i = 0; i < Math.min(x, n); i++) s += (punch - rate) * Math.max(0, Math.min(1, (i + 0.5) / 8, (n - i - 0.5) / 8));
  return Math.exp(-s);
};
const dolly = (pos: V3, look: V3, k: number, rest: Partial<Cam> = {}): Shot =>
  ({ pos: [look[0] + (pos[0] - look[0]) * k, look[1] + (pos[1] - look[1]) * k, look[2] + (pos[2] - look[2]) * k], look, ...rest });
const zoom = (pos: V3, look: V3, fov: number, k: number, rest: Partial<Cam> = {}): Shot =>
  ({ pos, look, fov: (360 / Math.PI) * Math.atan(Math.tan((fov * Math.PI) / 360) * k), ...rest });
const at = (o: V3, x: number, y: number, z: number): V3 => [o[0] + x, o[1] + y, o[2] + z];
/** a dolly framing relative to a place, pushing in from frame f0 */
const near = (o: V3, pos: [number, number, number], look: [number, number, number], f0: number, rate = 0.0025, rest: Partial<Cam> = {}, punch = 0, n = 35) =>
  (f: number) => dolly(at(o, ...pos), at(o, ...look), pushK(f, f0, rate, punch, n), rest);

const W = WALL, WY = W.y, WP: V3 = [W.x, WY, W.z];
// NB lenses looking +z have screen-right = world -x: a crossbow carried on a soldier's screen-right sits at x - 0.25
const S1a = near(WP, [2.4, 1.9, -5.2], [0.3, 1.45, 0.9], 0, 0.0025, { fov: 40, roll: -0.03 });
const S1b = near(WP, [-0.55, 1.15, -1.7], [0.06, 1.0, 0.85], 92, 0.002, { fov: 34, roll: 0.04 }, 0.006, 40);
const S2a = (f: number) => zoom([150, 165, -470], [0, 0, -20], 46, pushK(f, 167, 0.0012));
const S2b = (f: number) => dolly([90, 75, -430], [0, 2, -170], pushK(f, 300, 0.0018), { fov: 44, roll: -0.03 });
const S2c = (f: number) => dolly([OUT[0] + 22, 17, OUT[1] - 62], [OUT[0] - 6, 8, OUT[1] + 6], pushK(f, 420, 0.0022), { fov: 42 });
const S3a = near(WP, [5.5, 2.3, -7.5], [0, 1.5, 1.0], 533, 0.003, { fov: 42, roll: 0.03 });
// foundry: the heap of fresh arrowheads -> the mould opening -> wide of the state foundry inside the walls
const S4a = near(FOUNDRY, [-0.5, 1.25, -3.4], [-1.2, 0.5, -0.9], 572, 0.003, { fov: 38, roll: 0.03 });
const S4b = near(FOUNDRY, [0.4, 1.0, -2.6], [0.4, 0.95, -1.1], 626, 0.002, { fov: 34, roll: -0.03 });
const S4c = near(FOUNDRY, [-9, 5.5, -15], [0.5, 1.6, 0.5], 673, 0.0022, { fov: 42 });
// the golden turtle in the inner moat (low over the water) -> Triệu's army fleeing on the far bank of the outer moat
const S5a = near(TURTLE, [-1.5, 1.6, -7.5], [0, 1.4, 0], 752, 0.002, { fov: 40, roll: 0.03 }, 0.005, 30);
// from the south, low: the fleeing army in front, the outer moat and rampart (where the arrows come from) behind
const S5b = near(ARMY, [5, 3.6, -13], [-1, 2.6, 8], 890, 0.002, { fov: 44, roll: -0.03 });
// palace at golden hour: Trọng Thủy and Mỵ Châu -> the divine crossbow on its rack -> the swap insert
const S6a = near(PALACE, [2.6, 1.8, -6.6], [0, 1.35, 0], 1015, 0.0022, { fov: 40, roll: 0.03 });
const S6b = near(PALACE, [0.5, 1.35, -3.7], [0, 0.95, -1.2], 1130, 0.0025, { fov: 38, roll: -0.03 });
const S6c = near(PALACE, [0, 1.0, -2.65], [0, 1.0, -1.0], 1180, 0.0015, { fov: 36 });
// back on the wall: proud "luckily" -> closer on "unluckily", the misfire
const S7a = near(WP, [1.8, 1.8, -4.2], [0.25, 1.35, 0.9], 1228, 0.0025, { fov: 40, roll: -0.03 });
const S7b = near(WP, [0.5, 1.45, -2.8], [0.12, 1.1, 0.9], 1316, 0.0025, { fov: 38, roll: 0.04 }, 0.006, 30);
// golden village: trigger diagram -> kid with the mousetrap -> trigger diagram firing
const DIA: [number, number, number] = [0, 1.4, -2.0];
const S8a = near(VILLAGE, [0, 1.4, -3.65], DIA, 1410, 0.0015, { fov: 36 });
const S8b = near(VILLAGE, [0.75, 0.95, -3.2], [0.2, 0.4, -0.55], 1525, 0.0022, { fov: 40, roll: 0.03 }, 0.005, 30);
const S8c = near(VILLAGE, [0, 1.4, -3.65], DIA, 1700, 0.0015, { fov: 36, roll: -0.02 });
// the fall: golden aerial, smoke over the village, the army streaming over the outer rampart
const S9a = (f: number) => dolly([140, 120, -520], [0, 0, -170], pushK(f, 1838, 0.0018), { fov: 44, roll: 0.02 });
// 1959: the road crew -> the pick strikes -> into the pit -> crane up to the old rampart
const S10a = near(DIG, [7, 3.2, -11], [0, 1.1, 0.5], 1950, 0.002, { fov: 42 });
const S10b = near(DIG, [1.6, 1.5, -3.6], [0.1, 0.6, 0], 2049, 0.0025, { fov: 40, roll: 0.03 }, 0.006, 30);
const S10c = near(DIG, [0.12, 2.1, -0.55], [0, 0, 0], 2108, 0.002, { fov: 38 });
// crane up and back over the pit: the crew and the hole below, the old outer rampart rising behind them
const CRANE: V3 = at(DIG, 2, 9, -16), CRANE_LOOK: V3 = at(DIG, 0, 2, 16);
const S10d = (f: number): Shot => {
  const a = S10c(2285), s = glide((f - 2285) / 55);
  return { pos: a.pos.map((v, i) => v + (CRANE[i] - v) * s) as V3, look: a.look.map((v, i) => v + (CRANE_LOOK[i] - v) * s) as V3, fov: 38 + 6 * s, roll: 0 };
};

const CAMS: Record<number, Key[]> = {
  1: [{ f: 0, s: S1a }, { f: 92, dur: 34, s: S1b }],
  2: [{ f: 167, s: S2a }, { f: 300, dur: 40, s: S2b }, { f: 420, dur: 40, s: S2c }],
  3: [{ f: 533, s: S3a }],
  4: [{ f: 572, s: S4a }, { f: 626, cut: true, s: S4b }, { f: 673, cut: true, s: S4c }],
  5: [{ f: 752, s: S5a }, { f: 890, cut: true, s: S5b }],
  6: [{ f: 1015, s: S6a }, { f: 1130, cut: true, s: S6b }, { f: 1180, cut: true, s: S6c }],
  7: [{ f: 1228, s: S7a }, { f: 1316, cut: true, s: S7b }],
  8: [{ f: 1410, s: S8a }, { f: 1525, cut: true, s: S8b }, { f: 1700, cut: true, s: S8c }],
  9: [{ f: 1838, s: S9a }],
  10: [{ f: 1950, s: S10a }, { f: 2049, cut: true, s: S10b }, { f: 2108, cut: true, s: S10c }, { f: 2285, cut: true, s: S10d }],
};

/** impact kicks: image offset flips sign every frame, decays to 0 in 7 f (seconds, gain) */
const KICKS: [number, number][] = [[EV.swap[0] / FPS + 0.6, 0.8], [EV.misfire / FPS, 0.9], [EV.trapSlam / FPS, 1.3], [EV.mechFire[0] / FPS, 0.6], [EV.pick / FPS, 0.9]];
export const kickAt = (t: number) => {
  let a = 0;
  for (const [t0, g] of KICKS) {
    const n = Math.floor((t - t0) * FPS + 1e-6);
    if (n >= 0 && n < 7) a += g * (n % 2 ? -1 : 1) * (1 - n / 7) ** 1.5;
  }
  return a;
};
export const camAt = (id: number, f: number): Cam => {
  const c = run(CAMS[id], f), a = kickAt(T(f));
  if (!a) return c;
  const d: V3 = [c.look[0] - c.pos[0], c.look[1] - c.pos[1], c.look[2] - c.pos[2]];
  const L = Math.hypot(...d), h = Math.hypot(d[0], d[2]) || 1;
  const m = (3 / 640) * Math.tan((c.fov * Math.PI) / 360) * L * a;
  return { ...c, look: [c.look[0] - (d[2] / h) * m, c.look[1] + 0.6 * m, c.look[2] + (d[0] / h) * m], roll: c.roll + a * 0.004 };
};

// ---------------- lens: depth of field + foreground framing ----------------
export type Dof = { f: number; dur?: number; cInf: number; focus?: (f: number) => V3 };
export const DOF: Dof[] = [
  { f: 0, cInf: 15, focus: () => at(WP, 0.3, 1.55, 0.9) }, // hook MS: front crossbowman's eyes
  { f: 92, dur: 34, cInf: 16, focus: () => at(WP, 0.06, 1.0, 0.85) }, // hand + trigger
  { f: 167, cInf: 0 }, // flycam establishing
  { f: 533, cInf: 11, focus: () => at(WP, 0, 1.55, 1.0) }, // line of crossbowmen
  { f: 572, cInf: 14 }, // arrow heap CU (focus = look)
  { f: 626, cInf: 15 }, // mould insert
  { f: 673, cInf: 0 }, // foundry wide
  { f: 752, cInf: 12 }, // turtle (focus = look)
  { f: 890, cInf: 0 }, // army wide
  { f: 1015, cInf: 10, focus: () => at(PALACE, 0, 1.55, 0) }, // palace MS
  { f: 1130, cInf: 13 }, // rack CU
  { f: 1180, cInf: 15 }, // swap insert
  { f: 1228, cInf: 11, focus: () => at(WP, 0.3, 1.55, 0.9) }, // luckily
  { f: 1316, cInf: 14, focus: () => at(WP, 0.3, 1.5, 0.9) }, // unluckily
  { f: 1410, cInf: 14 }, // trigger diagram (focus = the card)
  { f: 1525, cInf: 9 }, // kid + mousetrap (focus = look)
  { f: 1700, cInf: 14 }, // trigger diagram firing
  { f: 1838, cInf: 0 }, // the fall, aerial
  { f: 1950, cInf: 0 }, // road crew wide
  { f: 2049, cInf: 12 }, // pick strike
  { f: 2108, cInf: 13 }, // into the pit
  { f: 2285, dur: 40, cInf: 0 }, // crane out
];
export const dofAt = (f: number) => {
  let i = 0; while (i + 1 < DOF.length && f >= DOF[i + 1].f) i++;
  const d = DOF[i], p = DOF[Math.max(0, i - 1)];
  const k = d.dur ? Math.min(1, (f - d.f) / d.dur) : 1;
  return { cInf: p.cInf + (d.cInf - p.cInf) * k, focus: d.focus };
};

/** near framing objects: visible while a <= f < b (kit = a GLB name accepted by build.ts kitClone) */
export type Fg = { a: number; b: number; kit: string; pos: V3; s?: number; yaw?: number };
export const FOREGROUND: Fg[] = [];
