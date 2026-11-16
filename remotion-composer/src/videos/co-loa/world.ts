// Cổ Loa as one three.js scene: sky, clouds, sun, three earthen ramparts (inner rectangle, irregular middle and outer
// rings) each with its moat, village of stilt houses (nhà sàn) with boat-shaped Đông Sơn roofs, trees, canoes, and the
// cast. Sky / light rig / water shader / sight-line culling come from the bridge template (look values unchanged).
// update(id, f, camera) poses everything for shot `id` at frame f (pure function of id + f).
import * as THREE from "three";
import { GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader.js";
import { staticFile } from "remotion";
import { Batch, lam, Kit, Ray, kitClone, prop, setSight, inTheWayOf, V, boxGeo, quad } from "./build";
import { ctex, rng, grassHD, beam, waterNear, waterFar, cloudHD } from "./paint";
import { Pen } from "./toon";
import { LIGHTS, LOOK, LightPreset } from "./lights";
import { TONE, CHAR, LFB, untone } from "./shade";
import { NOINK } from "./ink";
import { Pool, Actor, Fx, stage } from "./cast";
import { FPS, SHOTS, RINGS, Ring, WATER_Y, ringAt, rampY, camAt, FOREGROUND, ShotDef, V3, FOUNDRY, TURTLE, ARMY, VILLAGE, DIG } from "./story";

/** acting areas no house or tree may stand on: [place, radius] */
const KEEP_CLEAR: [V3, number][] = [[FOUNDRY, 9], [TURTLE, 6], [ARMY, 30], [VILLAGE, 8], [DIG, 14]];
const clear = (x: number, z: number, r = 0) => KEEP_CLEAR.every(([p, k]) => Math.hypot(p[0] - x, p[2] - z) > k + r);

// ---------------- assets ----------------
const KENNEY = ["tree_oak", "tree_default", "tree_detailed", "tree_fat", "tree_cone", "tree-high-round", "tree", "plant_bushLarge",
  "plant_bushDetailed", "plant_bush", "grass_large", "grass", "lily_large", "canoe", "cart"];
let kitP: Promise<Kit> | null = null;
export const loadKit = () => {
  if (!kitP) {
    const loader = new GLTFLoader();
    kitP = Promise.all(KENNEY.map((n) => loader.loadAsync(staticFile(`bridge/kenney/${n}.glb`)).then((g) => [n, g.scene] as const).catch(() => [n, null] as const)))
      .then((list) => Object.fromEntries(list.filter((e) => e[1]).map(([n, s]) => [n, s!])) as Kit);
  }
  return kitP;
};

// ---------------- painted textures ----------------
const discTex = () => ctex("sunDisc", 128, 128, (g) => {
  const gr = g.createRadialGradient(64, 64, 58, 64, 64, 64); gr.addColorStop(0, "rgba(255,255,255,1)"); gr.addColorStop(1, "rgba(255,255,255,0)");
  g.fillStyle = gr; g.fillRect(0, 0, 128, 128);
});
const haloTex = () => ctex("sunHalo", 256, 256, (g) => {
  const im = g.createImageData(256, 256);
  for (let y = 0; y < 256; y++) for (let x = 0; x < 256; x++) {
    const u = Math.hypot(x - 127.5, y - 127.5) / 128;
    const a = (0.55 * Math.exp(-((u / 0.25) ** 2)) + 0.35 * Math.exp(-((u / 0.6) ** 2))) * (1 - Math.min(1, Math.max(0, (u - 0.8) / 0.2)));
    const i = (y * 256 + x) * 4; im.data[i] = im.data[i + 1] = im.data[i + 2] = 255; im.data[i + 3] = Math.round(255 * Math.min(1, a));
  }
  g.putImageData(im, 0, 0);
});
/** packed-earth wall walk / path: warm ochre with darker ruts and pebbles */
const earthTex = () => ctex("earthHD", 1024, 1024, (g, r) => {
  g.fillStyle = "#c9a26a"; g.fillRect(0, 0, 1024, 1024);
  for (let k = 0; k < 900; k++) {
    const x = r() * 1024, y = r() * 1024, s = 6 + r() * 26;
    g.fillStyle = r() < 0.5 ? "rgba(150,110,62,0.22)" : "rgba(222,190,140,0.25)";
    g.beginPath(); g.ellipse(x, y, s, s * (0.4 + r() * 0.4), r() * 3, 0, Math.PI * 2); g.fill();
  }
  for (let k = 0; k < 260; k++) { g.fillStyle = "rgba(110,80,46,0.35)"; g.beginPath(); g.arc(r() * 1024, r() * 1024, 2 + r() * 4, 0, Math.PI * 2); g.fill(); }
});
/** rice-straw thatch: long streaks along the slope (v) with darker courses */
const thatchTex = () => ctex("thatchHD", 512, 512, (g, r) => {
  g.fillStyle = "#b8904f"; g.fillRect(0, 0, 512, 512);
  for (let k = 0; k < 700; k++) {
    const x = r() * 512, y = r() * 512, l = 30 + r() * 70;
    g.strokeStyle = r() < 0.5 ? "rgba(120,86,40,0.35)" : "rgba(232,200,140,0.35)"; g.lineWidth = 1.5 + r() * 2;
    g.beginPath(); g.moveTo(x, y); g.lineTo(x + (r() - 0.5) * 6, y + l); g.stroke();
  }
  for (let k = 0; k < 5; k++) { g.fillStyle = "rgba(96,66,30,0.4)"; g.fillRect(0, k * 102 + 96, 512, 6); }
});
/** woven bamboo wall panels (phên tre) */
const bambooTex = () => ctex("bambooHD", 512, 512, (g, r) => {
  g.fillStyle = "#d8b878"; g.fillRect(0, 0, 512, 512);
  for (let y = 0; y < 512; y += 32) for (let x = 0; x < 512; x += 32) {
    const odd = ((x + y) / 32) % 2;
    g.fillStyle = odd ? "rgba(160,120,60,0.35)" : "rgba(240,215,160,0.3)";
    g.fillRect(x + 2, y + 2, 28, 28);
  }
  for (let k = 0; k < 120; k++) { g.fillStyle = "rgba(120,86,40,0.25)"; g.fillRect(r() * 512, r() * 512, 2, 14); }
});
const smokeTex = () => ctex("smoke", 256, 256, (g) => {
  const p = new Pen(g);
  for (const [x, y, r, c] of [[90, 150, 60, "#8f8d96"], [150, 120, 70, "#a3a1aa"], [170, 165, 55, "#8f8d96"], [120, 100, 50, "#b4b2ba"]] as const) p.ell(x, y, r, r * 0.85, c, 0);
});

// ---------------- geometry ----------------
const NT = 480; // samples around every ring
const TH = Array.from({ length: NT }, (_, i) => -Math.PI + (i / NT) * 2 * Math.PI);
type Pt = [number, number, number];
/** closed ribbon through rows of loops: rows[j][i] = point at row j, angle sample i (rows run inner -> outer) */
const ribbon = (rows: Pt[][], uTile: number, vTile: number, flip = false, planar = false) => {
  const nj = rows.length, pos: number[] = [], uv: number[] = [], idx: number[] = [];
  const arc: number[] = [0];
  for (let i = 1; i <= NT; i++) { const a = rows[0][(i - 1) % NT], b = rows[0][i % NT]; arc.push(arc[i - 1] + Math.hypot(b[0] - a[0], b[2] - a[2])); }
  const vAt: number[][] = rows.map(() => []);
  for (let i = 0; i <= NT; i++) { let v = 0; for (let j = 0; j < nj; j++) { if (j) { const a = rows[j - 1][i % NT], b = rows[j][i % NT]; v += Math.hypot(b[0] - a[0], b[1] - a[1], b[2] - a[2]); } vAt[j][i] = v; } }
  // planar: world-space x/z UVs (flat ground: no concentric rings where the loops shrink toward the centre)
  for (let i = 0; i <= NT; i++) for (let j = 0; j < nj; j++) {
    const p = rows[j][i % NT]; pos.push(p[0], p[1], p[2]);
    uv.push(planar ? p[0] / uTile : arc[i] / uTile, planar ? p[2] / vTile : vAt[j][i] / vTile);
  }
  for (let i = 0; i < NT; i++) for (let j = 0; j < nj - 1; j++) {
    const a = i * nj + j, b = (i + 1) * nj + j, c = (i + 1) * nj + j + 1, d = i * nj + j + 1;
    // rows run centre -> outward and samples run counter-clockwise seen from above, so (a, b, c) faces up
    if (flip) idx.push(a, c, b, a, d, c); else idx.push(a, b, c, a, c, d);
  }
  const g = new THREE.BufferGeometry();
  g.setAttribute("position", new THREE.Float32BufferAttribute(pos, 3));
  g.setAttribute("uv", new THREE.Float32BufferAttribute(uv, 2));
  g.setIndex(idx); g.computeVertexNormals();
  return g;
};
const loop = (r: Ring, d: number, y: number | ((d: number) => number)): Pt[] => TH.map((th) => { const [x, z] = ringAt(r, th, d); return [x, typeof y === "number" ? y : y(d), z]; });
const MOAT_BED = -1.7;

/** stilt house (nhà sàn): posts, floor, woven walls, and a saddle roof whose ridge and eaves sweep up at both ends like
 *  the boat-shaped houses on Đông Sơn drums. Local x = ridge direction. */
const nhaSan = (b: Batch, M: Record<string, THREE.Material>, x: number, z: number, yaw: number, L: number, Dp: number, k = 1) => {
  const mtx = new THREE.Matrix4().compose(V(x, 0, z), new THREE.Quaternion().setFromAxisAngle(V(0, 1, 0), yaw), V(k, k, k));
  const add = (g: THREE.BufferGeometry, m: THREE.Material) => b.add(g, m, mtx);
  const fl = 2.0, wt = 3.3;
  for (let i = 0; i < 4; i++) for (const s of [-1, 1]) {
    const px = -L / 2 + 0.35 + (i * (L - 0.7)) / 3;
    add(new THREE.CylinderGeometry(0.13, 0.15, fl, 7).translate(px, fl / 2, s * (Dp / 2 - 0.3)), M.post);
  }
  add(new THREE.BoxGeometry(L + 0.4, 0.22, Dp + 0.4).translate(0, fl + 0.11, 0), M.post);
  add(new THREE.BoxGeometry(L - 0.4, wt - fl - 0.2, Dp - 0.5).translate(0, (wt + fl + 0.2) / 2, 0), M.bamboo);
  // ladder
  for (const s of [-0.35, 0.35]) add(new THREE.BoxGeometry(0.08, 2.4, 0.08).translate(L / 2 + 0.55, 1.05, s).rotateZ(0), M.post);
  // roof: ridge y_r(x), eaves y_e(x) at z = +-(Dp/2 + 1.0), both rising toward the ends
  const Lr = L / 2 + 1.5, nx = 18, rows = 4;
  const yr = (xx: number) => wt + 2.7 + 1.5 * Math.abs(xx / Lr) ** 3;
  const ye = (xx: number) => wt - 0.25 + 0.9 * Math.abs(xx / Lr) ** 3;
  for (const s of [-1, 1]) {
    const pos: number[] = [], uv: number[] = [], idx: number[] = [];
    for (let i = 0; i <= nx; i++) {
      const xx = -Lr + (2 * Lr * i) / nx;
      for (let j = 0; j <= rows; j++) {
        const t = j / rows, zz = s * t * (Dp / 2 + 1.0), yy = yr(xx) + (ye(xx) - yr(xx)) * (t + 0.12 * Math.sin(Math.PI * t));
        pos.push(xx, yy, zz); uv.push(xx / 2.5, t * 2);
      }
    }
    for (let i = 0; i < nx; i++) for (let j = 0; j < rows; j++) {
      const a = i * (rows + 1) + j, bb = (i + 1) * (rows + 1) + j, c = bb + 1, d = a + 1;
      if (s > 0) idx.push(a, bb, c, a, c, d); else idx.push(a, c, bb, a, d, c);
    }
    const g = new THREE.BufferGeometry();
    g.setAttribute("position", new THREE.Float32BufferAttribute(pos, 3)); g.setAttribute("uv", new THREE.Float32BufferAttribute(uv, 2));
    g.setIndex(idx); g.computeVertexNormals();
    add(g, M.thatch);
  }
  // gables under the ridge at the wall ends
  for (const s of [-1, 1]) {
    const gx = s * (L / 2 - 0.2), g = new THREE.BufferGeometry();
    const p = [gx, wt, -(Dp / 2 - 0.25), gx, wt, Dp / 2 - 0.25, gx, yr(gx) - 0.1, 0];
    g.setAttribute("position", new THREE.Float32BufferAttribute(s > 0 ? p : [p[3], p[4], p[5], p[0], p[1], p[2], p[6], p[7], p[8]], 3));
    g.setAttribute("uv", new THREE.Float32BufferAttribute([0, 0, 1, 0, 0.5, 1], 2)); g.computeVertexNormals();
    add(g, M.bamboo);
  }
  // crossed ridge horns at both ends (Đông Sơn house finials)
  for (const s of [-1, 1]) add(new THREE.BoxGeometry(0.12, 1.1, 0.12).rotateZ(-s * 0.5).translate(s * (Lr + 0.15), yr(Lr) + 0.35, 0), M.post);
};

/** every lens position of the film looking at its subject: centre, sides and top of frame (things there are left out) */
const sightLines = (): Ray[] => {
  const out: Ray[] = [];
  for (const s of SHOTS) for (let f = s.a - 8; f < s.b + 8; f += 3) {
    const c = camAt(s.id, Math.max(0, f)), o = V(...c.pos), look = V(...c.look);
    const fw = look.clone().sub(o), len = fw.length();
    fw.normalize();
    const rt = fw.clone().cross(V(0, 1, 0)).normalize(), up = rt.clone().cross(fw);
    const ty = Math.tan((c.fov * Math.PI) / 360), tx = ty * (9 / 16);
    for (const [sx, sy] of [[0, 0], [-0.6, 0], [0.6, 0], [0, 0.6], [0, -0.4]])
      out.push({ o, d: fw.clone().addScaledVector(rt, sx * tx).addScaledVector(up, sy * ty), len, core: sx === 0 && sy === 0 });
  }
  return out;
};

export class World {
  root = new THREE.Group();
  private pool = new Pool();
  private actors: Actor[] = [];
  private fxs: Fx[] = [];
  private hemi: THREE.HemisphereLight; private sun: THREE.DirectionalLight;
  private sky: THREE.Mesh; private skyMat: THREE.ShaderMaterial;
  private fog = new THREE.Fog("#bccbec", 25, 420);
  private WU: Record<string, THREE.IUniform>;
  private sunDisc: THREE.Sprite; private sunHalo: THREE.Sprite;
  private sunCache = new Map<number, THREE.Vector3>();
  private cloudMaps: Record<"day" | "golden", THREE.Texture[]>;
  private clouds: THREE.Mesh[] = [];
  private smoke: { m: THREE.Mesh; mat: THREE.MeshLambertMaterial; top: V3; k: number; big: number; fire: boolean }[] = [];
  private modern = new THREE.Group();
  private fgs: { o: THREE.Object3D; a: number; b: number }[] = [];
  private frustum = new THREE.Frustum();
  private m4 = new THREE.Matrix4(); private v = new THREE.Vector3(); private sph = new THREE.Sphere();

  constructor(kit: Kit) {
    const R = this.root, M: Record<string, THREE.Material> = {};
    // ---- sky + light (bridge template rig) ----
    this.skyMat = new THREE.ShaderMaterial({
      uniforms: { c0: { value: new THREE.Color() }, c1: { value: new THREE.Color() }, c2: { value: new THREE.Color() },
        c3: { value: new THREE.Color() }, c4: { value: new THREE.Color() }, e: { value: new THREE.Vector4() } },
      vertexShader: "varying vec3 vP; void main(){ vP = normalize(position); gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0); }",
      fragmentShader: `uniform vec3 c0, c1, c2, c3, c4; uniform vec4 e; varying vec3 vP;
        void main(){ float el = asin(clamp(normalize(vP).y, -1.0, 1.0));
          vec3 c = mix(c0, c1, smoothstep(0.0, e.x, el));
          c = mix(c, c2, smoothstep(e.x, e.y, el));
          c = mix(c, c3, smoothstep(e.y, e.z, el));
          c = mix(c, c4, smoothstep(e.z, e.w, el));
          gl_FragColor = vec4(c, 1.0); }`,
      side: THREE.BackSide, depthWrite: false, fog: false,
    });
    this.sky = new THREE.Mesh(new THREE.SphereGeometry(2400, 48, 24), this.skyMat);
    this.sky.renderOrder = -1; this.sky.frustumCulled = false; this.sky.layers.set(NOINK);
    R.add(this.sky);
    this.sunDisc = new THREE.Sprite(new THREE.SpriteMaterial({ map: discTex(), color: new THREE.Color(6.0, 4.4, 2.4), fog: false, depthWrite: false }));
    this.sunHalo = new THREE.Sprite(new THREE.SpriteMaterial({ map: haloTex(), color: new THREE.Color(1, 1, 1), fog: false, depthWrite: false, depthTest: true,
      transparent: true, blending: THREE.AdditiveBlending }));
    this.sunDisc.renderOrder = -0.5; this.sunHalo.renderOrder = 5;
    for (const m of [this.sunDisc, this.sunHalo]) { m.frustumCulled = false; m.layers.set(NOINK); R.add(m); }
    this.hemi = new THREE.HemisphereLight("#cfe6ff", "#6c5c8c", 1.1);
    this.sun = new THREE.DirectionalLight("#fff0d6", 2.6);
    this.sun.castShadow = true;
    this.sun.shadow.mapSize.set(4096, 4096);
    R.add(this.hemi, this.sun, this.sun.target);
    this.cloudMaps = { day: [0, 1, 2, 3].map((k) => cloudHD(k, LOOK.day.cloud)), golden: [0, 1, 2, 3].map((k) => cloudHD(k, LOOK.golden.cloud)) };
    for (let i = 0; i < 11; i++) {
      const a = (i / 11) * Math.PI * 2 + 0.3, d = 1300 + (i % 3) * 120;
      const m = new THREE.Mesh(new THREE.PlaneGeometry(1, 1), new THREE.MeshBasicMaterial({ map: this.cloudMaps.day[i % 4], color: new THREE.Color(1.1, 1.1, 1.1), transparent: true, depthWrite: false, fog: false }));
      const w = 280 + (i % 4) * 60;
      m.position.set(Math.cos(a) * d, 260 + (i % 4) * 80, Math.sin(a) * d); m.scale.set(w, w / 2, 1);
      m.layers.set(NOINK);
      this.clouds.push(m); R.add(m);
    }

    // ---- materials ----
    // storybook olive-green: the template grass under this flat open daylight read as neon lime
    M.grass = lam("grassHD", () => ({ map: grassHD(), color: new THREE.Color("#a3a87c") }));
    M.slope = lam("slopeHD", () => ({ map: grassHD(), color: new THREE.Color("#93996c") }));
    M.earth = lam("earthHD", () => ({ map: earthTex() }));
    M.bank = lam("bankEarth", () => ({ map: earthTex(), color: new THREE.Color("#b08c66") }));
    M.bed = lam("moatBed", () => ({ color: "#5d6b4a" }));
    M.post = lam("postWood", () => ({ map: beam(), color: new THREE.Color("#a07a52") }));
    M.bamboo = lam("bamboo", () => ({ map: bambooTex() }));
    M.thatch = lam("thatch", () => ({ map: thatchTex(), side: THREE.DoubleSide }));
    for (const k of ["grass", "slope", "earth", "bank", "thatch", "bamboo"]) {
      const mm = M[k] as THREE.MeshLambertMaterial;
      if (mm.map) { mm.map.wrapS = mm.map.wrapT = THREE.RepeatWrapping; mm.map.anisotropy = 16; mm.map.needsUpdate = true; }
    }

    // ---- ground, ramparts, moats (rows run from the citadel centre outward) ----
    const rays = sightLines();
    setSight(rays);
    const b = new Batch();
    const steps = 12;
    const centre: Pt[] = TH.map(() => [0, 0, 0]);
    let prevOuter: Pt[] = centre;
    RINGS.forEach((r, ri) => {
      const foot = -r.base / 2;
      b.add(ribbon([prevOuter, loop(r, foot, 0)], 9, 9, false, true), M.grass); // ground up to this rampart's inner foot
      const inner: Pt[][] = [], outer: Pt[][] = [];
      for (let k = 0; k <= steps; k++) inner.push(loop(r, foot + ((r.base - r.top) / 2) * (k / steps), (d) => rampY(r, d)));
      for (let k = 0; k <= steps; k++) outer.push(loop(r, r.top / 2 + ((r.base - r.top) / 2) * (k / steps), (d) => rampY(r, d)));
      b.add(ribbon(inner, 8, 8), M.slope);
      b.add(ribbon([loop(r, -r.top / 2, r.h), loop(r, r.top / 2, r.h)], 5, 5), M.earth); // wall walk
      b.add(ribbon(outer, 8, 8), M.slope);
      // moat: berm, bank wall down to the bed, bed, far bank wall up
      const m0 = r.base / 2 + 1.5, m1 = m0 + r.moat;
      b.add(ribbon([loop(r, r.base / 2, 0), loop(r, m0, 0)], 9, 9, false, true), M.grass);
      b.add(ribbon([loop(r, m0, 0), loop(r, m0 + 0.6, MOAT_BED)], 4, 2), M.bank);
      b.add(ribbon([loop(r, m0 + 0.6, MOAT_BED), loop(r, m1 - 0.6, MOAT_BED)], 6, 6), M.bed);
      b.add(ribbon([loop(r, m1 - 0.6, MOAT_BED), loop(r, m1, 0)], 4, 2), M.bank);
      prevOuter = loop(r, m1, 0);
      if (ri === RINGS.length - 1) {
        const far: Pt[] = TH.map((th, i) => { const p = prevOuter[i], a = Math.atan2(p[2], p[0]); return [Math.cos(a) * 2600, 0, Math.sin(a) * 2600]; });
        b.add(ribbon([prevOuter, far], 9, 9, false, true), M.grass);
      }
    });

    // ---- village: stilt houses in the band between the inner moat and the middle rampart, a few outside ----
    const rnd = rng(1959);
    const houses: [number, number, number, number, number][] = [];
    const tryHouse = (x: number, z: number, yaw: number, L: number, Dp: number) => {
      const rr = Math.max(L, Dp) / 2 + 1.6;
      if (houses.some(([hx, hz]) => Math.hypot(hx - x, hz - z) < rr + 5) || !clear(x, z, rr)) return;
      if (inTheWayOf(x - rr, x + rr, 0, 7.5, z - rr, z + rr, true)) return;
      houses.push([x, z, yaw, L, Dp]);
    };
    tryHouse(0, 18, 0, 13, 7.5); // the king's hall in the inner citadel
    for (let n = 0; n < 900 && houses.length < 70; n++) {
      const th = -Math.PI + rnd() * 2 * Math.PI, band = rnd() < 0.75 ? 0 : 1;
      const rA = RINGS[band], rB = RINGS[band + 1];
      const [ax, az] = ringAt(rA, th, rA.base / 2 + 1.5 + rA.moat + 6), [bx, bz] = ringAt(rB, th, -rB.base / 2 - 5);
      const t = rnd(), x = ax + (bx - ax) * t, z = az + (bz - az) * t;
      tryHouse(x, z, Math.atan2(bx - ax, bz - az) + (rnd() - 0.5) * 0.6 + Math.PI / 2, 7 + rnd() * 3.5, 4.6 + rnd() * 1.4);
    }
    for (const [x, z, yaw, L, Dp] of houses) nhaSan(b, M, x, z, yaw, L, Dp);
    // ---- trees and bushes: groves in the bands, a line of trees along the outer moat ----
    const TREES = ["tree_oak", "tree_default", "tree_fat", "tree-high-round", "tree_detailed"];
    for (let n = 0; n < 420; n++) {
      const th = -Math.PI + rnd() * 2 * Math.PI, band = Math.floor(rnd() * 3);
      let x: number, z: number;
      if (band < 2) {
        const rA = RINGS[band], rB = RINGS[band + 1];
        const [ax, az] = ringAt(rA, th, rA.base / 2 + 1.5 + rA.moat + 3), [bx, bz] = ringAt(rB, th, -rB.base / 2 - 2);
        const t = rnd(); x = ax + (bx - ax) * t; z = az + (bz - az) * t;
      } else { const ro = RINGS[2]; [x, z] = ringAt(ro, th, ro.base / 2 + 1.5 + ro.moat + 4 + rnd() * 60); }
      if (houses.some(([hx, hz, , L]) => Math.hypot(hx - x, hz - z) < L / 2 + 4) || !clear(x, z, 3)) continue;
      const h = 5 + rnd() * 5;
      prop(b, kit, TREES[Math.floor(rnd() * TREES.length)], x, 0, z, h, rnd() * 6.28);
    }
    // canoes on the moats
    for (const [ri, th] of [[2, -1.45], [2, -1.75], [1, -1.3], [0, -1.2]] as const) {
      const r = RINGS[ri], [x, z] = ringAt(r, th, r.base / 2 + 1.5 + r.moat / 2);
      prop(b, kit, "canoe", x, WATER_Y - 0.25, z, 0.7, th + Math.PI / 2);
    }
    // ---- the state foundry: open thatched shed on posts, clay furnace with a glowing mouth and a chimney ----
    const F = FOUNDRY;
    M.clay = lam("clay", () => ({ color: "#b5603a" }));
    for (const sx of [-3.4, 3.4]) for (const sz of [-2.6, 2.6]) b.add(new THREE.CylinderGeometry(0.14, 0.16, 3.4, 7).translate(F[0] + sx, 1.7, F[2] + sz), M.post);
    for (const s of [-1, 1]) b.add(quad(V(F[0] - 4.2, 3.1, F[2] + s * 3.4), V(F[0] + 4.2, 3.1, F[2] + s * 3.4), V(F[0] + 4.2, 4.8, F[2]), V(F[0] - 4.2, 4.8, F[2]), 3, 1), M.thatch);
    const FURN = V(F[0] + 1.5, 0, F[2] + 1.6);
    b.add(new THREE.SphereGeometry(1.15, 18, 10, 0, Math.PI * 2, 0, Math.PI / 2).translate(FURN.x, 0, FURN.z), M.clay);
    b.add(new THREE.CylinderGeometry(0.28, 0.36, 1.9, 10).translate(FURN.x + 0.3, 1.6, FURN.z + 0.3), M.clay);
    b.build(R);
    const mouth = new THREE.Mesh(new THREE.CircleGeometry(0.36, 16, 0, Math.PI), new THREE.MeshBasicMaterial({ color: new THREE.Color(5.0, 2.0, 0.5), fog: false }));
    mouth.position.set(FURN.x, 0.02, FURN.z - 1.17); mouth.rotation.y = Math.PI; mouth.layers.set(NOINK); R.add(mouth);
    // ---- 1959 (shot 10 only): the new dirt road, the pit, spoil heaps and a cart ----
    const D = DIG, mb = new Batch();
    mb.add(boxGeo(V(D[0] - 160, 0, D[2] - 2.6), V(D[0] + 160, 0.03, D[2] + 2.6), 5), M.earth);
    mb.add(boxGeo(V(D[0] - 0.6, 0.03, D[2] - 0.6), V(D[0] + 0.6, 0.04, D[2] + 0.6)), lam("pitDark", () => ({ color: "#2e2218" })));
    for (const [x, z, r, h] of [[1.7, -1.3, 1.0, 0.6], [-1.6, 1.5, 0.8, 0.45], [0.2, 1.2, 0.6, 0.3]] as const)
      mb.add(new THREE.ConeGeometry(r, h, 12).translate(D[0] + x, h / 2 + 0.03, D[2] + z), M.bank);
    prop(mb, kit, "cart", D[0] + 3.8, 0.03, D[2] + 2.0, 1.0, 0.7);
    this.modern.visible = false; mb.build(this.modern); R.add(this.modern);

    // ---- water: the three moats, one mesh so the ripples can drift ----
    const wNear = waterNear(), wFar = waterFar();
    for (const t of [wNear, wFar]) { t.colorSpace = THREE.NoColorSpace; t.anisotropy = 16; t.needsUpdate = true; }
    this.WU = {
      wNearC: { value: new THREE.Color() }, wMidC: { value: new THREE.Color() }, wFarC: { value: new THREE.Color() },
      wCrest: { value: new THREE.Color() }, wTrough: { value: new THREE.Color() }, wGlint: { value: new THREE.Color() },
      wShade: { value: new THREE.Vector3(0.5, 0.56, 0.72) }, wNearTex: { value: wNear }, wFarTex: { value: wFar }, wTime: { value: 0 },
    };
    const waterM = new THREE.MeshLambertMaterial({ color: 0xffffff });
    waterM.onBeforeCompile = (sh) => {
      Object.assign(sh.uniforms, this.WU);
      sh.vertexShader = sh.vertexShader
        .replace("#include <common>", "#include <common>\nvarying vec3 vWP;")
        .replace("#include <project_vertex>", "#include <project_vertex>\nvWP = (modelMatrix * vec4(transformed, 1.0)).xyz;");
      sh.fragmentShader = sh.fragmentShader
        .replace("#include <common>", WATER_DECL)
        .replace("#include <map_fragment>", WATER_COL)
        .replace("#include <lights_fragment_begin>", "float sunVis = 1.0;\n" + LFB)
        .replace("#include <lights_fragment_end>", "#include <lights_fragment_end>\n  reflectedLight.directDiffuse = diffuseColor.rgb * mix(wShade, vec3(1.0), sunVis);\n  reflectedLight.indirectDiffuse = vec3(0.0);");
    };
    waterM.customProgramCacheKey = () => "moat1";
    for (const r of RINGS) {
      const m0 = r.base / 2 + 1.5, m1 = m0 + r.moat;
      const wm = new THREE.Mesh(ribbon([loop(r, m0 + 0.25, WATER_Y), loop(r, m1 - 0.25, WATER_Y)], 8, 8), waterM);
      wm.receiveShadow = true; R.add(wm);
    }

    // ---- hearth smoke from a few houses ----
    const smokeT = smokeTex();
    const puff = (top: V3, n: number, big: number, fire: boolean) => { for (let k = 0; k < n; k++) {
      const mat = new THREE.MeshLambertMaterial({ map: smokeT, transparent: true, depthWrite: false, color: fire ? "#6a6470" : "#ffffff" });
      const m = new THREE.Mesh(new THREE.PlaneGeometry(1, 1), mat);
      m.layers.set(NOINK);
      this.smoke.push({ m, mat, top, k: k / n, big, fire }); R.add(m);
    } };
    for (const [hx, hz] of houses.slice(1, 5)) puff([hx, 7.5, hz], 6, 1, false);
    puff([FURN.x + 0.3, 2.6, FURN.z + 0.3], 6, 0.6, false);
    // the fall (shot 9): big dark columns over the village
    for (const [hx, hz] of houses.filter(([x, z]) => z < -60).slice(0, 9)) puff([hx, 6, hz], 7, 5, true);
    for (const fg of FOREGROUND) {
      const o = kitClone(kit, fg.kit, fg.s ?? 1);
      if (!o) continue;
      o.position.set(...fg.pos); o.rotation.y = fg.yaw ?? 0; o.visible = false;
      this.fgs.push({ o, a: fg.a, b: fg.b }); R.add(o);
    }
  }

  /** camera-relative sun, frozen per shot: the shot's mean view direction turned by az toward screen right, lifted by el */
  private shotSun(id: number, s: ShotDef, L: LightPreset) {
    let v = this.sunCache.get(id);
    if (v) return v;
    let fx = 0, fz = 0;
    for (let f = s.a; f < s.b; f += 3) {
      const c = camAt(id, f), x = c.look[0] - c.pos[0], z = c.look[2] - c.pos[2], n = Math.hypot(x, z) || 1;
      fx += x / n; fz += z / n;
    }
    const n = Math.hypot(fx, fz) || 1; fx /= n; fz /= n;
    const az = THREE.MathUtils.degToRad(s.sunAz ?? L.az), el = THREE.MathUtils.degToRad(s.sunEl ?? L.el);
    const hx = fx * Math.cos(az) - fz * Math.sin(az), hz = fz * Math.cos(az) + fx * Math.sin(az);
    v = new THREE.Vector3(hx * Math.cos(el), Math.sin(el), hz * Math.cos(el)).normalize();
    this.sunCache.set(id, v);
    return v;
  }

  private actor(i: number) { while (this.actors.length <= i) this.actors.push(new Actor(this.root)); return this.actors[i]; }
  private fx(i: number) { while (this.fxs.length <= i) this.fxs.push(new Fx(this.root)); return this.fxs[i]; }

  update(id: number, f: number, cam: THREE.PerspectiveCamera, scene: THREE.Scene) {
    const t = f / FPS, s = SHOTS[id - 1], L = LIGHTS[s.light], fogK = s.fogK ?? 1;
    // ---- camera ----
    const c = camAt(id, f);
    cam.position.set(...c.pos); cam.up.set(0, 1, 0); cam.lookAt(...c.look); cam.rotateZ(c.roll);
    cam.fov = c.fov; cam.near = 0.2; cam.far = 5000; cam.updateProjectionMatrix(); cam.updateMatrixWorld();
    const focus = V(...c.look), dist = cam.position.distanceTo(focus);
    cam.layers.enable(NOINK);
    // ---- light rig: camera-relative sun frozen per shot, two-tone uniforms, shadow fit ----
    const K = LOOK[s.light], sunDir = this.shotSun(id, s, L);
    this.hemi.color.set(L.sky); this.hemi.groundColor.set(L.ground); this.hemi.intensity = L.hemiI;
    this.sun.color.set(L.sunCol); this.sun.intensity = L.sunI;
    let Rr = THREE.MathUtils.clamp(dist * 1.15 + 7, 12, 160);
    if (s.light === "golden") Rr = Math.max(Rr, 30);
    this.sun.position.copy(focus).addScaledVector(sunDir, 400); this.sun.target.position.copy(focus);
    const sc = this.sun.shadow.camera;
    sc.left = -Rr; sc.right = Rr; sc.top = Rr; sc.bottom = -Rr; sc.near = 20; sc.far = 900; sc.updateProjectionMatrix();
    this.sun.shadow.bias = L.bias; this.sun.shadow.normalBias = L.normalBias * (Rr / 12);
    TONE.uLitCol.value.set(...L.lit); TONE.uShadeCol.value.set(...L.shade); TONE.uShadeLift.value.set(...L.lift);
    TONE.uLambert.value = L.lambert; TONE.uSideK.value = L.sideK; TONE.uTerm.value = L.term; TONE.uBounce.value.set(...LOOK[s.light].bounce); TONE.uSat.value = LOOK[s.light].sat;
    CHAR.uCharTint.value.set(...L.charTint); CHAR.uCharShade.value = L.charShade; CHAR.uGrad.value = L.charGrad;
    CHAR.uBodyGrad.value = L.bodyGrad; CHAR.uSideTint.value.set(...L.sideTint);
    // ---- sky, fog (horizon colour; stretched on the big establishing shots), sun disc + halo, clouds ----
    const su = this.skyMat.uniforms;
    K.sky.c.forEach((h, i) => untone(h, su["c" + i].value));
    const e = K.sky.e.map((deg) => THREE.MathUtils.degToRad(deg));
    su.e.value.set(e[1], e[2], e[3], e[4]);
    this.sky.position.copy(cam.position);
    untone(L.fog, this.fog.color); this.fog.near = L.fogNear * fogK; this.fog.far = L.fogFar * fogK;
    scene.fog = this.fog; scene.background = null;
    const showSun = s.light === "golden";
    this.sunDisc.visible = this.sunHalo.visible = showSun;
    if (showSun) {
      this.sunDisc.position.copy(cam.position).addScaledVector(sunDir, 2000);
      this.sunDisc.scale.setScalar(2 * 2000 * Math.tan(THREE.MathUtils.degToRad(1.7)));
      this.sunHalo.position.copy(this.sunDisc.position); this.sunHalo.scale.setScalar(2 * 2000 * Math.tan(THREE.MathUtils.degToRad(24)));
      (this.sunHalo.material as THREE.SpriteMaterial).color.set(L.sunDisc).multiplyScalar(1.3);
    }
    for (let i = 0; i < this.clouds.length; i++) {
      const m = this.clouds[i], mat = m.material as THREE.MeshBasicMaterial;
      m.lookAt(cam.position.x, m.position.y, cam.position.z);
      mat.map = this.cloudMaps[s.light][i % 4];
    }
    // ---- water colours ----
    const W = this.WU, wc = K.water;
    untone(wc.near, W.wNearC.value); untone(wc.mid, W.wMidC.value); untone(wc.far, W.wFarC.value);
    untone(wc.crest, W.wCrest.value); untone(wc.trough, W.wTrough.value); untone(wc.glint, W.wGlint.value);
    W.wShade.value.set(...wc.shade); W.wTime.value = t;
    for (const g of this.fgs) g.o.visible = f >= g.a && f < g.b && g.a < s.b && g.b > s.a;
    this.modern.visible = s.crowd === "dig";
    for (const sm of this.smoke) {
      sm.m.visible = sm.fire ? s.crowd === "fall" : s.crowd !== "dig";
      if (!sm.m.visible) continue;
      const u = (t * (sm.fire ? 0.16 : 0.11) + sm.k) % 1, sz = (2 + u * 6) * sm.big;
      sm.m.position.set(sm.top[0] - u * 8 * sm.big, sm.top[1] + (u * 9 + u * u * 3) * sm.big, sm.top[2] + u * 2 * sm.big);
      sm.m.scale.set(sz, sz, 1); sm.m.quaternion.copy(cam.quaternion);
      sm.mat.opacity = (sm.fire ? 0.85 : 0.7) * (1 - u) ** 1.2;
    }
    // ---- cast + effects ----
    const right = V(0, 0, 0).setFromMatrixColumn(cam.matrixWorld, 0);
    const st = stage(id, t, { pos: cam.position, right, sun: sunDir });
    this.frustum.setFromProjectionMatrix(this.m4.multiplyMatrices(cam.projectionMatrix, cam.matrixWorldInverse));
    let ai = 0;
    for (const p of st.places) {
      const sc2 = p.scale ?? 1;
      if (!this.frustum.intersectsSphere(this.sph.set(this.v.set(p.x, p.y + 1.1 * sc2, p.z), 3.5))) continue;
      const a = this.actor(ai++);
      const [w, h, k] = p.size ?? [300, 500, 0.5];
      a.r = this.pool.req(p.key, w, h, k, p.draw);
      a.mesh.visible = true;
      a.mesh.position.set(p.x, p.y, p.z);
      a.mesh.rotation.set(0, p.yaw ?? Math.atan2(cam.position.x - p.x, cam.position.z - p.z), p.roll ?? 0);
      a.mesh.scale.set(p.mirror ? -sc2 : sc2, sc2, sc2);
      a.mesh.castShadow = L.actorShadow;
    }
    for (let i = ai; i < this.actors.length; i++) this.actors[i].mesh.visible = false;
    let fi = 0;
    for (const p of st.fx) {
      if (!this.frustum.intersectsSphere(this.sph.set(this.v.set(p.x, p.y, p.z), Math.max(p.w, p.h)))) continue;
      const e = this.fx(fi++);
      e.r = this.pool.req(p.key, p.cw, p.ch, 1, p.draw);
      e.use(!!p.soft);
      e.mesh.visible = true;
      e.mesh.position.set(p.x, p.y, p.z);
      if (p.flat) e.mesh.rotation.set(-Math.PI / 2, 0, p.rot ?? 0);
      else { e.mesh.quaternion.copy(cam.quaternion); e.mesh.rotateZ(p.rot ?? 0); }
      e.mesh.scale.set(p.w, p.h, 1);
    }
    for (let i = fi; i < this.fxs.length; i++) this.fxs[i].mesh.visible = false;
    this.pool.flush();
    for (let i = 0; i < ai; i++) this.actors[i].bind();
    for (let i = 0; i < fi; i++) this.fxs[i].bind();
    return focus;
  }
}

const WATER_DECL = `#include <common>
varying vec3 vWP;
uniform vec3 wNearC, wMidC, wFarC, wCrest, wTrough, wGlint, wShade;
uniform sampler2D wNearTex, wFarTex;
uniform float wTime;`;
const WATER_COL = `
  vec3 wV = vWP - cameraPosition;
  float wd = length(wV);
  float wDep = asin(clamp(-wV.y / wd, 0.0, 1.0));
  float wf = 1.0 - smoothstep(0.0, 0.42, wDep);
  vec3 wc = mix(mix(wNearC, wMidC, smoothstep(0.0, 0.55, wf)), wFarC, smoothstep(0.55, 1.0, wf));
  vec2 wp = vWP.xz + vec2(0.2 * wTime, 0.0);
  vec4 mk = mix(texture2D(wNearTex, wp / 8.0), texture2D(wFarTex, wp / 40.0 + 0.37), smoothstep(25.0, 90.0, wd));
  wc = mix(wc, wTrough, mk.g * 0.6);
  wc = mix(wc, wCrest, mk.r * 0.7);
  wc = mix(wc, wGlint, mk.b * (0.3 + 0.5 * wf));
  diffuseColor.rgb = wc;`;
