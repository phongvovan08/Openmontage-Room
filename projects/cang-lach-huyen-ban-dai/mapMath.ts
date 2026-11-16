// Dynamic 16:9 Web Mercator projection & WGS84 Haversine math
// Built from scratch for 1920x1080 landscape cartography (no portrait hardcoding).

export const WORLD = 65536;
export const MAX_LAT = 85.05112878;
const EARTH_RADIUS_KM = 6371.0088;

export type LonLat = readonly [number, number];
export type WorldXY = readonly [number, number];
/** [x, y, w, h] in [0..65536] Web Mercator world units. */
export type CameraBox = readonly [number, number, number, number];

export interface GeoBounds {
  west: number;
  south: number;
  east: number;
  north: number;
}

export function lonToWorld(lon: number): number {
  return ((lon + 180) / 360) * WORLD;
}

export function latToWorld(lat: number): number {
  const clamped = Math.max(-MAX_LAT, Math.min(MAX_LAT, lat));
  const phi = (clamped * Math.PI) / 180;
  return ((1 - Math.log(Math.tan(phi) + 1 / Math.cos(phi)) / Math.PI) / 2) * WORLD;
}

export function toWorld([lon, lat]: LonLat): WorldXY {
  return [lonToWorld(lon), latToWorld(lat)];
}

export function boxOfBounds(
  bounds: GeoBounds,
  padFraction = 0.06,
  aspect = 1920 / 1080
): CameraBox {
  const x0 = lonToWorld(bounds.west);
  const y0 = latToWorld(bounds.north);
  const rawW = lonToWorld(bounds.east) - x0;
  const rawH = latToWorld(bounds.south) - y0;

  let bw = rawW * (1 + 2 * padFraction);
  let bh = rawH * (1 + 2 * padFraction);
  if (bw / bh > aspect) {
    bh = bw / aspect;
  } else {
    bw = bh * aspect;
  }
  const cx = x0 + rawW / 2;
  const cy = y0 + rawH / 2;
  return [cx - bw / 2, cy - bh / 2, bw, bh];
}

export function boxAround(
  lon: number,
  lat: number,
  spanLon: number,
  aspect = 1920 / 1080
): CameraBox {
  const w = (spanLon / 360) * WORLD;
  const h = w / aspect;
  return [lonToWorld(lon) - w / 2, latToWorld(lat) - h / 2, w, h];
}

/** Log-scale camera interpolation so wide-to-local fly-ins have smooth perceptual speed. */
export function interpolateCameraBox(a: CameraBox, b: CameraBox, t: number): CameraBox {
  const u = Math.max(0, Math.min(1, t));
  const smooth = u * u * (3 - 2 * u);

  const acx = a[0] + a[2] / 2;
  const acy = a[1] + a[3] / 2;
  const bcx = b[0] + b[2] / 2;
  const bcy = b[1] + b[3] / 2;

  const logW = Math.log(a[2]) + (Math.log(b[2]) - Math.log(a[2])) * smooth;
  const w = Math.exp(logW);
  const aspect = a[2] / a[3];
  const h = w / aspect;

  // Weight center shift toward the zoomed-in target as scale shrinks
  const ratio = a[2] / b[2];
  const centerWeight =
    Math.abs(ratio - 1) < 0.01
      ? smooth
      : (1 - Math.pow(ratio, -smooth)) / (1 - Math.pow(ratio, -1));

  const cx = acx + (bcx - acx) * centerWeight;
  const cy = acy + (bcy - acy) * centerWeight;
  return [cx - w / 2, cy - h / 2, w, h];
}

export function worldToScreen(
  box: CameraBox,
  [wx, wy]: WorldXY,
  canvasW = 1920,
  canvasH = 1080
): readonly [number, number] {
  const scale = Math.max(canvasW / box[2], canvasH / box[3]);
  const ox = (canvasW - box[2] * scale) / 2;
  const oy = (canvasH - box[3] * scale) / 2;
  return [ox + (wx - box[0]) * scale, oy + (wy - box[1]) * scale];
}

export function lonLatToScreen(
  box: CameraBox,
  coord: LonLat,
  canvasW = 1920,
  canvasH = 1080
): readonly [number, number] {
  return worldToScreen(box, toWorld(coord), canvasW, canvasH);
}

/** Convert an array of [lon, lat] points to an SVG path in screen pixel space. */
export function coordsToScreenPath(
  box: CameraBox,
  coords: readonly LonLat[],
  closed = false,
  canvasW = 1920,
  canvasH = 1080
): string {
  if (coords.length === 0) return "";
  const parts = coords.map((pt, idx) => {
    const [sx, sy] = lonLatToScreen(box, pt, canvasW, canvasH);
    return `${idx === 0 ? "M" : "L"}${sx.toFixed(1)},${sy.toFixed(1)}`;
  });
  if (closed) parts.push("Z");
  return parts.join(" ");
}

/** Approximate pixel length of a screen-space polyline for deterministic stroke-dashoffset reveals. */
export function screenPolylineLength(
  box: CameraBox,
  coords: readonly LonLat[],
  canvasW = 1920,
  canvasH = 1080
): number {
  let total = 0;
  for (let i = 0; i < coords.length - 1; i++) {
    const [x1, y1] = lonLatToScreen(box, coords[i], canvasW, canvasH);
    const [x2, y2] = lonLatToScreen(box, coords[i + 1], canvasW, canvasH);
    total += Math.hypot(x2 - x1, y2 - y1);
  }
  return Math.max(1, total);
}

/** WGS84 Haversine great-circle distance in kilometers. */
export function distanceKm(a: LonLat, b: LonLat): number {
  const toRad = (deg: number) => (deg * Math.PI) / 180;
  const dLat = toRad(b[1] - a[1]);
  const dLon = toRad(b[0] - a[0]);
  const lat1 = toRad(a[1]);
  const lat2 = toRad(b[1]);
  const h =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(lat1) * Math.cos(lat2) * Math.sin(dLon / 2) * Math.sin(dLon / 2);
  return 2 * EARTH_RADIUS_KM * Math.asin(Math.min(1, Math.sqrt(h)));
}

