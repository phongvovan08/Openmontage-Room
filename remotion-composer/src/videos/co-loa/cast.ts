// The Cổ Loa cast as lit flat sprites in the 3D world (machinery from the bridge template: canvas pool, camera-facing
// card actors shaded by cardShade(), unlit effect cards, blinks, contact blobs). Each frame every character asks for a
// drawing (key + draw call); the pool keeps one canvas per distinct drawing. Cards, effects and blobs live on the NOINK
// layer so the world ink pass never outlines their quads.
import * as THREE from "three";
import { Pen, bodyFront, bodySide, aulac, villager, trieu, worker1959, KID_VN, TRONG_THUY, MY_CHAU, fxContact, fxShadow, fxRing, fxPuff, fxBurst, Outfit, Expr, FrontOpts, SideOpts } from "./toon";
import { fxArrowPile, fxMold, fxTurtle, fxArrowFly, fxArrow, fxSwap, fxMousetrap, fxMechanism, fxNoThan } from "./fx";
import { FPS, SHOTS, WALL, OUT, RINGS, FOUNDRY, TURTLE, ARMY, PALACE, VILLAGE, DIG, EV, V3, clamp01, ramp, rampY } from "./story";
import { NOINK } from "./ink";
import { cardShade, blobMaterial, CARD_K } from "./cardshade";

// ---------------- canvas pool ----------------
type Entry = { cv: HTMLCanvasElement; tex: THREE.CanvasTexture; w: number; h: number };
export type Req = { key: string; w: number; h: number; k: number; draw: (p: Pen) => void; tex?: THREE.CanvasTexture };
const makeEntry = (w: number, h: number): Entry => {
  const cv = document.createElement("canvas");
  cv.width = w; cv.height = h;
  const tex = new THREE.CanvasTexture(cv);
  tex.colorSpace = THREE.SRGBColorSpace; tex.anisotropy = 8;
  return { cv, tex, w, h };
};
export class Pool {
  private live = new Map<string, Entry>();
  private free: Entry[] = [];
  private reqs: Req[] = [];
  req(key: string, w: number, h: number, k: number, draw: (p: Pen) => void) {
    const r: Req = { key: `${w}x${h}|${key}`, w, h, k, draw };
    this.reqs.push(r);
    return r;
  }
  flush() {
    const want = new Map<string, Req[]>();
    for (const r of this.reqs) { const l = want.get(r.key); if (l) l.push(r); else want.set(r.key, [r]); }
    for (const [key, e] of this.live) if (!want.has(key)) { this.live.delete(key); this.free.push(e); }
    for (const [key, rs] of want) {
      let e = this.live.get(key);
      if (!e) {
        const r = rs[0], i = this.free.findIndex((x) => x.w === r.w && x.h === r.h);
        e = i >= 0 ? this.free.splice(i, 1)[0] : makeEntry(r.w, r.h);
        const g = e.cv.getContext("2d")!;
        g.setTransform(1, 0, 0, 1, 0, 0); g.clearRect(0, 0, e.w, e.h); g.setTransform(r.k, 0, 0, r.k, 0, 0);
        r.draw(new Pen(g));
        e.tex.needsUpdate = true;
        this.live.set(key, e);
      }
      for (const r of rs) r.tex = e.tex;
    }
    this.reqs = [];
  }
}

// ---------------- sprite meshes ----------------
const blank = (() => { const c = document.createElement("canvas"); c.width = c.height = 2; return new THREE.CanvasTexture(c); })();
export const SU = 0.00216; // metres per design unit: 1000 units = 2.16 m
const BODY = (() => { const g = new THREE.PlaneGeometry(600 * SU, 1000 * SU); g.translate(0, (975 - 500) * SU, 0); return g; })();
const CARD = new THREE.PlaneGeometry(1, 1);

export class Actor {
  mesh: THREE.Mesh; mat: THREE.MeshLambertMaterial; dmat: THREE.MeshDepthMaterial; r: Req | null = null;
  constructor(parent: THREE.Object3D, geo: THREE.BufferGeometry = BODY) {
    this.mat = cardShade(new THREE.MeshLambertMaterial({ map: blank, alphaTest: 0.5, side: THREE.DoubleSide }));
    this.mat.alphaToCoverage = false;
    this.dmat = new THREE.MeshDepthMaterial({ depthPacking: THREE.RGBADepthPacking, map: blank, alphaTest: 0.5, side: THREE.DoubleSide });
    this.mesh = new THREE.Mesh(geo, this.mat);
    this.mesh.customDepthMaterial = this.dmat;
    this.mesh.onBeforeRender = (r) => { const rt = r.getRenderTarget(); CARD_K.uPx.value = (rt ? rt.height : r.domElement.height) / 1920; };
    this.mesh.castShadow = false; this.mesh.receiveShadow = true; this.mesh.visible = false;
    this.mesh.rotation.order = "YXZ"; this.mesh.renderOrder = 1; this.mesh.layers.set(NOINK);
    parent.add(this.mesh);
  }
  bind() { const t = this.r?.tex; if (t) { this.mat.map = t; this.dmat.map = t; } }
}
export class Fx {
  mesh: THREE.Mesh; mat: THREE.MeshBasicMaterial; soft: THREE.MeshBasicMaterial; blob: THREE.MeshBasicMaterial; r: Req | null = null;
  constructor(parent: THREE.Object3D) {
    this.mat = new THREE.MeshBasicMaterial({ map: blank, alphaTest: 0.5, side: THREE.DoubleSide });
    this.mat.alphaToCoverage = false;
    this.soft = new THREE.MeshBasicMaterial({ map: blank, transparent: true, depthWrite: false, side: THREE.DoubleSide });
    this.blob = blobMaterial(blank);
    this.mesh = new THREE.Mesh(CARD, this.mat);
    this.mesh.visible = false; this.mesh.layers.set(NOINK);
    parent.add(this.mesh);
  }
  use(soft: boolean) { this.mesh.material = soft ? this.soft : this.mat; }
  bind() {
    const t = this.r?.tex;
    if (!t) return;
    if (this.r!.key.includes("|blob|")) {
      if (t.generateMipmaps) { t.generateMipmaps = false; t.minFilter = THREE.LinearFilter; t.needsUpdate = true; }
      this.blob.map = t; this.mesh.material = this.blob; this.mesh.renderOrder = 0.5;
    }
    else { this.mat.map = t; this.soft.map = t; this.mesh.renderOrder = 0; }
  }
}

// ---------------- placements ----------------
export type Place = {
  key: string; draw: (p: Pen) => void; x: number; y: number; z: number;
  scale?: number; mirror?: boolean; yaw?: number; roll?: number; size?: [number, number, number];
};
export type FxPlace = { key: string; cw: number; ch: number; draw: (p: Pen) => void; x: number; y: number; z: number; w: number; h: number; flat?: boolean; rot?: number; soft?: boolean };
/** sun = world direction TOWARD the sun */
export type CamInfo = { pos: THREE.Vector3; right: THREE.Vector3; sun: THREE.Vector3 };
export type Stage = { places: Place[]; fx: FxPlace[] };

const hh = (i: number, s = 0) => { const v = Math.sin(i * 127.1 + s * 311.7) * 43758.5453; return v - Math.floor(v); };
const q = (v: number, n = 120) => Math.round(v * n) / n;
const AULAC = [0, 1, 2, 3].map((v) => aulac(v));
const seedOf = (i: number) => ((i * 5 + 3) % 7) + 1;
/** drawing resolution by distance: [canvas w, h, scale from the 600 x 1000 design]; sized for the 1440 x 2560 final */
const tier = (d: number): [number, number, number] =>
  d < 3.2 ? [1800, 3000, 3.0] : d < 6.5 ? [1080, 1800, 1.8] : d < 16 ? [480, 800, 0.8] : [240, 400, 0.4];

const SUN = new THREE.Vector3(0.5, 0.75, -0.4).normalize();
let LNAME: "day" | "golden" = "day";
/** canvas angle the sun comes FROM on an upright card facing the camera, in 45-degree steps (small texture cache) */
const light2D = (cam: CamInfo, mirror: boolean) => {
  const sx = SUN.dot(cam.right) * (mirror ? -1 : 1), sy = -SUN.y;
  return Math.round(Math.atan2(sy, sx) / (Math.PI / 4)) * (Math.PI / 4);
};
/** front / side view and mirroring for someone at (x, z) facing / walking along (dx, dz) */
const viewOf = (cam: CamInfo, x: number, z: number, dx: number, dz: number) => {
  const tx = cam.pos.x - x, tz = cam.pos.z - z, tl = Math.hypot(tx, tz) || 1;
  const c = (tx * dx + tz * dz) / tl;
  return { side: c < 0.57, mirror: dx * cam.right.x + dz * cam.right.z < 0, fs: Math.round(Math.sqrt(Math.max(0, 1 - c * c)) * 20) / 20 };
};

// ---------------- life: blinks ----------------
const LEAD = 2 / FPS;
const LID = [0.5, 1, 1, 0.5];
const lidAt = (t: number, i: number, swaps: number[] = []) => {
  const f = Math.round(t * FPS);
  for (const ts of swaps) { const k = f - Math.round((ts - LEAD) * FPS) + 1; if (k >= 0 && k < 4) return LID[k]; }
  let s = Math.round(-60 * hh(i, 9));
  for (let n = 0; s <= f && n < 400; n++) {
    const k = f - s;
    if (k >= 0 && k < 4) return LID[k];
    s += Math.round(15 + 54 * hh(i * 31 + n, 13));
  }
  return 0;
};
const fkey = (o: object) => JSON.stringify(o, (_k, v) => (typeof v === "number" ? q(v) : v));

type Who = { i: number; o: Outfit; okey: string };
const person = (cam: CamInfo, who: Who, x: number, y: number, z: number, view: { side: boolean; mirror: boolean }, fo: FrontOpts, so: SideOpts, scale = 1): Place => {
  const d = cam.pos.distanceTo(new THREE.Vector3(x, y + 1.2, z)) / scale;
  const [w, h, k] = tier(d);
  const mirror = view.side && view.mirror, light = light2D(cam, mirror), seed = seedOf(who.i);
  const f2: FrontOpts = { ...fo, light, seed }, s2: SideOpts = { ...so, light, seed };
  const key = view.side ? `S|${who.okey}|${fkey(s2)}` : `F|${who.okey}|${fkey(f2)}`;
  return { key, x, y, z, scale, mirror, draw: (p) => (view.side ? bodySide(p, who.o, s2) : bodyFront(p, who.o, f2)), size: [w, h, k] };
};

// ---------------- ground shadow under a standing card ----------------
const CONTACT: Record<"day" | "golden", [number, number, number]> = { day: [0.2, 0.21, 0.33], golden: [0.24, 0.2, 0.33] };
const TAIL: [number, number, number] = [0.42, 0.44, 0.62];
const toSrgb = (v: number) => { const c = clamp01(v); return c <= 0.0031308 ? 12.92 * c : 1.055 * c ** (1 / 2.4) - 0.055; };
const hexOf = (c: [number, number, number], k: number) => "#" + c.map((v) => Math.round(255 * toSrgb(1 - (1 - v) * k)).toString(16).padStart(2, "0")).join("");
const blob = (out: Stage, x: number, y: number, z: number, sc = 1, k = 1) => {
  const hl = Math.hypot(SUN.x, SUN.z) || 1, ox = -SUN.x / hl, oz = -SUN.z / hl, rot = Math.atan2(-ox, -oz);
  if (LNAME === "day") {
    const el = Math.asin(Math.min(0.99, Math.max(0.1, SUN.y)));
    const len = Math.min(2.4, Math.max(0.5, 1.6 / Math.tan(el))) * sc, h = len + 0.55 * sc, c = 0.3 * h;
    const tc = hexOf(TAIL, k);
    out.fx.push({ key: `blob|shadow|${tc}`, cw: 128, ch: 256, draw: (p) => fxShadow(p, tc), x: x + ox * c, y: y + 0.018, z: z + oz * c, w: 0.72 * sc, h, flat: true, rot });
  }
  const cc = hexOf(CONTACT[LNAME], k);
  out.fx.push({ key: `blob|contact|${cc}`, cw: 128, ch: 128, draw: (p) => fxContact(p, cc), x: x + ox * 0.03 * sc, y: y + 0.022, z: z + oz * 0.03 * sc, w: 0.52 * sc, h: 0.4 * sc, flat: true, rot });
};

// ---------------- crowds ----------------
const card = (out: Stage, key: string, cw: number, ch: number, draw: (p: Pen) => void, at: V3, w: number, h: number, rest: Partial<FxPlace> = {}) =>
  out.fx.push({ key, cw, ch, draw, x: at[0], y: at[1], z: at[2], w, h, ...rest });
const add = (o: V3, x: number, y: number, z: number): V3 => [o[0] + x, o[1] + y, o[2] + z];
/** someone standing still (front view when they face the lens) */
const stander = (cam: CamInfo, out: Stage, i: number, o: Outfit, okey: string, p: V3, t: number, expr: Expr, extra: FrontOpts = {}, face: [number, number] = [0, -1], scale = 1) => {
  const view = viewOf(cam, p[0], p[2], face[0], face[1]);
  out.places.push(person(cam, { i, o, okey }, p[0], p[1], p[2], view, { mode: "stand", expr, blink: lidAt(t, i), look: 0, ...extra }, { mode: "stand", expr, blink: lidAt(t, i) }, scale));
  blob(out, p[0], p[1], p[2], scale);
};
/** pick / hammer swing: 0 raised .. 1 struck, period ~0.9 s, a fast strike */
const swingK = (t: number, ph: number) => { const u = ((t / 0.9 + ph) % 1 + 1) % 1; return q(u < 0.7 ? 0.15 * (u / 0.7) : Math.min(1, (u - 0.7) / 0.1), 30); };

/** the crossbowmen on the wall walk (inner rampart, south side), facing out over the moat (-z). Index 0 is the hero
 *  of the hook close-up, at the front. */
export const GUARDS: V3[] = [[0.3, 0, 0.9], [-1.6, 0, 1.25], [2.2, 0, 1.15], [-3.5, 0, 1.0], [4.1, 0, 1.35], [-5.4, 0, 1.3], [6.0, 0, 1.05], [-7.3, 0, 1.2], [7.9, 0, 1.3]];
const guards = (id: number, f: number, t: number, cam: CamInfo, out: Stage) => {
  GUARDS.forEach(([dx, , dz], i) => {
    let expr: Expr = id === 1 && i === 0 ? "stern" : (["stern", "neutral", "smile_closed", "neutral"] as Expr[])[i % 4];
    if (id === 7) expr = i === 0 ? (f < 1316 ? "grin" : f < EV.misfire ? "nervous" : f < 1395 ? "shock" : "dazed") : f < EV.misfire ? "smile_closed" : "shock";
    stander(cam, out, i, AULAC[i % 4], `al${i % 4}`, [WALL.x + dx, WALL.y, WALL.z + dz], t, expr);
  });
  if (id === 7 && f >= EV.misfire) { // the arrow just drops off the crossbow (screen-right of the hero = world -x)
    const u = clamp01((f - EV.misfire) / 18), y = WALL.y + 1.95 - 1.85 * u * u;
    card(out, "arrow", 360, 70, fxArrow, [WALL.x + 0.03, y, WALL.z + 0.7], 0.62, 0.12, { rot: -1.45 + 1.6 * u });
    if (u >= 1 && f < EV.misfire + 30) { const k = q((f - EV.misfire - 18) / 12, 30); card(out, `puff${k}`, 300, 300, (p) => fxPuff(p, k), [WALL.x + 0.03, WALL.y + 0.15, WALL.z + 0.6], 0.6, 0.6, { soft: true }); }
  }
};

const foundry = (f: number, t: number, cam: CamInfo, out: Stage) => {
  const F = FOUNDRY;
  stander(cam, out, 20, villager(0), "v0", add(F, 0.4, 0, -0.6), t, f < EV.moldOpen[1] ? "stern" : "grin");
  stander(cam, out, 21, villager(2), "v2", add(F, 2.7, 0, 0.5), t, "stern", { prop: ["hammer", swingK(t, 0)] });
  stander(cam, out, 22, villager(4), "v4", add(F, -2.6, 0, 0.7), t, "neutral", { prop: ["hammer", swingK(t, 0.45)] });
  const g = q((t * 0.7) % 1, 30);
  card(out, `pile${g}`, 600, 400, (p) => fxArrowPile(p, g), add(F, -1.2, 0.37, -0.9), 1.1, 0.73);
  const k = q(ramp(f, ...EV.moldOpen), 60);
  if (f >= 600) card(out, `mold${k}`, 600, 600, (p) => fxMold(p, k), add(F, 0.4, 0.92, -1.05), 0.4, 0.4);
};

const TRIEU = [0, 1, 2].map((v) => trieu(v));
const army = (f: number, t: number, cam: CamInfo, out: Stage) => {
  if (f < EV.flee) { // the turtle surfaces in the inner moat
    const up = ramp(f, ...EV.turtleUp), s = q((t * 0.5) % 1, 30);
    card(out, `turtle${s}`, 600, 420, (p) => fxTurtle(p, s), add(TURTLE, 0, -1.1 + 1.85 * up, 0), 2.0, 1.4);
    const r = q(((t * 0.6) % 1), 30);
    card(out, `ring${r}`, 600, 600, (p) => fxRing(p, r), add(TURTLE, 0, 0.03, 0), 3.4, 3.4, { flat: true });
    return;
  }
  const t0 = EV.flee / FPS;
  for (let i = 0; i < 18; i++) {
    const sp = 2.0 + 0.6 * hh(i, 3), x = ARMY[0] + (i % 6) * 1.7 - 2 - sp * (t - t0) + hh(i) * 0.8, z = ARMY[2] + Math.floor(i / 6) * 1.6 + hh(i, 2) * 0.6;
    const view = viewOf(cam, x, z, -1, 0), ph = q(((t * sp) / 1.4 + hh(i, 5)) % 1, 30);
    const expr: Expr = (["shock", "nervous", "pained"] as Expr[])[i % 3];
    out.places.push(person(cam, { i: 40 + i, o: TRIEU[i % 3], okey: `tr${i % 3}` }, x, 0, z, view,
      { mode: "march", phase: ph, expr, blink: 0, lift: 70 }, { mode: "march", phase: ph, expr, blink: 0, stomp: 1, stride: view.fs }));
    blob(out, x, 0, z);
  }
  for (let k = 0; k < 9; k++) { // arrows raining in from the walls behind the lens
    const u = ((t * 1.3 + hh(k, 7)) % 1), x0 = ARMY[0] + 8 - 14 * hh(k, 8), z0 = ARMY[2] + 30;
    card(out, "arrowFly", 420, 80, fxArrowFly, [x0 - 3 * u, 9 - 8 * u, z0 - 30 * u], 1.2, 0.23, { rot: -0.7 });
  }
};

const palace = (f: number, t: number, cam: CamInfo, out: Stage) => {
  const P = PALACE;
  const tt: Expr = f < 1100 ? "smile" : f < 1137 ? "smile_closed" : f < 1186 ? "grin" : "smile_closed";
  stander(cam, out, 60, TRONG_THUY, "tt", add(P, -0.95, 0, 0.1), t, tt, { look: f > 1137 ? 1 : 0 });
  stander(cam, out, 61, MY_CHAU, "mc", add(P, 0.95, 0, 0), t, "smile", { look: f > 1137 ? -1 : 0 });
  const claw = f < EV.swap[1];
  card(out, `rack${claw}`, 800, 420, (p) => fxNoThan(p, claw), add(P, 0, 0.42, -1.2), 1.5, 0.79);
  if (f >= 1180) { const k = q(ramp(f, ...EV.swap), 60); card(out, `swap${k}`, 800, 500, (p) => fxSwap(p, k), add(P, 0, 1.0, -1.0), 0.56, 0.35); }
};

const village = (f: number, t: number, cam: CamInfo, out: Stage) => {
  const V = VILLAGE;
  const kid: Expr = f < EV.trapSlip[0] ? "smile" : f < EV.trapSlam ? "nervous" : f < EV.trapSlam + 20 ? "shock" : "dazed";
  out.places.push(person(cam, { i: 70, o: KID_VN, okey: "kid" }, V[0] + 0.2, 0, V[2], { side: false, mirror: false }, { mode: "sit", expr: kid, blink: lidAt(t, 70), look: -1 }, {}));
  blob(out, V[0] + 0.2, 0, V[2], 0.8);
  stander(cam, out, 71, villager(1), "v1", add(V, 3.2, 0, 4.5), t, "smile");
  stander(cam, out, 72, villager(2), "v2", add(V, -3.8, 0, 6), t, "neutral");
  const [s0, s1] = EV.trapSlip;
  const u = q(f < s0 ? 0 : f < s1 ? (0.5 * (f - s0)) / (s1 - s0) : 0.5 + 0.5 * clamp01((f - s1) / 4), 60), slam = q(f >= EV.trapSlam ? clamp01((f - EV.trapSlam) / 8) : 0, 30);
  card(out, `trap${u}|${slam}`, 700, 420, (p) => fxMousetrap(p, u, slam), add(V, 0.2, 0.23, -0.75), 0.8, 0.48);
  if (f < 1525 || f >= 1700) {
    const m = q(f < 1525 ? 0.3 : f < EV.mechFire[0] ? 0.45 * ramp(f, ...EV.mechUp) : 0.5 + 0.5 * clamp01((f - EV.mechFire[0]) / (EV.mechFire[1] - EV.mechFire[0])), 60);
    card(out, `mech${m}`, 900, 520, (p) => fxMechanism(p, m), add(V, 0, 1.4, -2.0), 0.56, 0.324);
  }
};

const fall = (t: number, cam: CamInfo, out: Stage) => {
  const t0 = 1838 / FPS, r = RINGS[2];
  for (let i = 0; i < 48; i++) {
    const x = OUT[0] + (i % 8) * 2.4 - 9 + hh(i) * 1.2, z = OUT[1] - 40 + (t - t0) * 2.2 + Math.floor(i / 8) * 3.2 + hh(i, 2) * 1.5;
    const d = -(z - OUT[1]), y = Math.abs(d) < r.base / 2 ? rampY(r, d) : 0;
    const ph = q(((t * 2.2) / 1.4 + hh(i, 5)) % 1, 30);
    out.places.push(person(cam, { i: 100 + i, o: TRIEU[i % 3], okey: `tr${i % 3}` }, x, y, z, viewOf(cam, x, z, 0, 1),
      { mode: "march", phase: ph, expr: "stern", blink: 0 }, { mode: "march", phase: ph, expr: "stern", stomp: 1 }));
  }
};

const WORKERS = [0, 1, 2, 3].map((v) => worker1959(v));
const dig = (f: number, t: number, cam: CamInfo, out: Stage) => {
  const D = DIG, hit = f >= EV.pick;
  const ex = (i: number): Expr => (f < EV.pick ? (["stern", "neutral", "smile_closed", "neutral"] as Expr[])[i] : f < EV.reveal + 25 ? "shock" : (["grin", "laugh", "shock", "grin"] as Expr[])[i]);
  stander(cam, out, 80, WORKERS[0], "w0", add(D, -1.1, 0, 0.35), t, ex(0), { prop: ["hammer", hit ? 1 : swingK(t, 0.2)] });
  stander(cam, out, 81, WORKERS[1], "w1", add(D, 1.0, 0, -0.45), t, ex(1), { prop: ["hammer", hit ? 0 : swingK(t, 0.65)] });
  stander(cam, out, 82, WORKERS[2], "w2", add(D, 2.7, 0, 1.4), t, ex(2));
  stander(cam, out, 83, WORKERS[3], "w3", add(D, -2.9, 0, -0.9), t, ex(3));
  if (hit && f < EV.pick + 6) { const k = q((f - EV.pick) / 6, 30); card(out, `burst${k}`, 500, 500, (p) => fxBurst(p, k), add(D, 0, 0.35, -0.1), 0.9, 0.9); }
  if (hit) { const g = q((t * 0.8) % 1, 30); card(out, `pile${g}`, 600, 400, (p) => fxArrowPile(p, g), add(D, 0, 0.05, 0), 1.15, 0.77, { flat: true }); }
};

/** everything with a face in shot `id` at time t */
export const stage = (id: number, t: number, cam: CamInfo): Stage => {
  const out: Stage = { places: [], fx: [] };
  const s = SHOTS[id - 1], f = Math.round(t * FPS);
  LNAME = s.light;
  SUN.copy(cam.sun).normalize();
  if (s.crowd === "wall" || s.crowd === "misfire") guards(id, f, t, cam, out);
  else if (s.crowd === "foundry") foundry(f, t, cam, out);
  else if (s.crowd === "army") army(f, t, cam, out);
  else if (s.crowd === "palace") palace(f, t, cam, out);
  else if (s.crowd === "village") village(f, t, cam, out);
  else if (s.crowd === "fall") fall(t, cam, out);
  else if (s.crowd === "dig") dig(f, t, cam, out);
  return out;
};
