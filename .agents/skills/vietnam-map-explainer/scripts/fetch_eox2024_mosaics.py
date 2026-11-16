"""Download and sharpen multi-zoom EOX Sentinel-2 2024 (s2cloudless-2024_3857, CC BY 4.0) mosaics
up to z14 (~5376x3840px) for any Vietnamese infrastructure target, writing _ready.webp files and
data/satelliteManifest.ts directly into a Remotion Atelier project.

Example (Long Thanh Airport):
    python .agents/skills/vietnam-map-explainer/scripts/fetch_eox2024_mosaics.py \
        --project-dir projects/long-thanh-40km \
        --slug long_thanh \
        --z9-bbox 105.6,9.8,108.4,11.8 \
        --z12-bbox 106.55,10.55,107.25,11.02 \
        --z14-bbox 106.82,10.68,107.18,10.90
"""

from __future__ import annotations

import argparse
import io
import json
import math
import shutil
import time
import urllib.request
from concurrent.futures import ThreadPoolExecutor, as_completed
from pathlib import Path

import numpy as np
from PIL import Image, ImageEnhance, ImageFilter

WORLD = 65536.0
EOX_ATTRIBUTION = (
    "Ảnh vệ tinh nền: EOxCloudless Sentinel-2 2024 (CC BY 4.0 — EOX IT Services GmbH / Copernicus) • "
    "Dữ liệu địa hình & hạ tầng: Natural Earth & © OpenStreetMap contributors (ODbL)"
)
UA = "Mozilla/5.0 (Windows NT 10.0; Win64; x64) OpenMontage-Cartography/2.0"


def lon_to_world(lon: float) -> float:
    return ((lon + 180.0) / 360.0) * WORLD


def lat_to_world(lat: float) -> float:
    clamped = max(-85.05112878, min(85.05112878, lat))
    phi = math.radians(clamped)
    return ((1.0 - math.log(math.tan(phi) + 1.0 / math.cos(phi)) / math.pi) / 2.0) * WORLD


def parse_bbox(s: str) -> tuple[float, float, float, float]:
    parts = [float(x.strip()) for x in s.split(",")]
    if len(parts) != 4:
        raise ValueError(f"Expected west,south,east,north bbox, got: {s}")
    return parts[0], parts[1], parts[2], parts[3]


def feather_alpha(width: int, height: int, frac: float = 0.05) -> Image.Image:
    fx = max(4, int(round(width * frac)))
    fy = max(4, int(round(height * frac)))
    x_ramp = np.ones(width, dtype=np.float32)
    smooth_x = 0.5 - 0.5 * np.cos(np.pi * np.linspace(0.0, 1.0, fx, dtype=np.float32))
    x_ramp[:fx] = smooth_x
    x_ramp[-fx:] = smooth_x[::-1]

    y_ramp = np.ones(height, dtype=np.float32)
    smooth_y = 0.5 - 0.5 * np.cos(np.pi * np.linspace(0.0, 1.0, fy, dtype=np.float32))
    y_ramp[:fy] = smooth_y
    y_ramp[-fy:] = smooth_y[::-1]

    alpha = np.outer(y_ramp, x_ramp)
    return Image.fromarray(np.clip(alpha * 255.0, 0, 255).astype(np.uint8))


def fetch_tile_bytes(cache_dir: Path, year: str, z: int, x: int, y: int) -> bytes | None:
    cache_dir.mkdir(parents=True, exist_ok=True)
    cache_path = cache_dir / f"{year}_{z}_{x}_{y}.jpg"
    if cache_path.exists() and cache_path.stat().st_size > 64:
        return cache_path.read_bytes()

    url = f"https://tiles.maps.eox.at/wmts/1.0.0/s2cloudless-{year}_3857/default/g/{z}/{y}/{x}.jpg"
    for attempt in range(4):
        try:
            req = urllib.request.Request(url, headers={"User-Agent": UA})
            with urllib.request.urlopen(req, timeout=15) as resp:
                if resp.status == 404:
                    return None
                data = resp.read()
                if len(data) > 64:
                    cache_path.write_bytes(data)
                    return data
        except Exception:
            time.sleep(0.35 * (attempt + 1))
    return None


def build_sharp_mosaic(
    shot_id: str,
    z: int,
    bbox: tuple[float, float, float, float],
    public_sat_dir: Path,
    assets_sat_dir: Path,
    cache_dir: Path,
    year: str = "2024",
    is_base: bool = False,
) -> dict:
    west, south, east, north = bbox
    n = 2 ** z
    unit = WORLD / n
    wx0, wy0 = lon_to_world(west), lat_to_world(north)
    wx1, wy1 = lon_to_world(east), lat_to_world(south)

    tx0 = max(0, int(math.floor(wx0 / unit)))
    tx1 = min(n, int(math.ceil(wx1 / unit)))
    ty0 = max(0, int(math.floor(wy0 / unit)))
    ty1 = min(n, int(math.ceil(wy1 / unit)))

    nx, ny = tx1 - tx0, ty1 - ty0
    print(f"[{shot_id}] EOX-{year} z={z}: {nx}x{ny} = {nx*ny} tiles -> {nx*256}x{ny*256}px ...")

    coords = [(tx0 + dx, ty0 + dy) for dy in range(ny) for dx in range(nx)]
    tile_map: dict[tuple[int, int], bytes | None] = {}
    with ThreadPoolExecutor(max_workers=16) as pool:
        futs = {pool.submit(fetch_tile_bytes, cache_dir, year, z, x, y): (x, y) for (x, y) in coords}
        for fut in as_completed(futs):
            tile_map[futs[fut]] = fut.result()

    canvas = Image.new("RGB", (nx * 256, ny * 256), (6, 18, 32))
    missing = 0
    for dy in range(ny):
        for dx in range(nx):
            raw = tile_map.get((tx0 + dx, ty0 + dy))
            if not raw:
                missing += 1
                continue
            try:
                with Image.open(io.BytesIO(raw)) as im:
                    canvas.paste(im.convert("RGB"), (dx * 256, dy * 256))
            except Exception:
                missing += 1

    sharp = canvas.filter(ImageFilter.UnsharpMask(radius=1.25, percent=145, threshold=2))
    sharp = ImageEnhance.Contrast(sharp).enhance(1.18)
    sharp = ImageEnhance.Color(sharp).enhance(1.20)

    public_sat_dir.mkdir(parents=True, exist_ok=True)
    assets_sat_dir.mkdir(parents=True, exist_ok=True)

    jpg_path = public_sat_dir / f"{shot_id}.jpg"
    sharp.save(jpg_path, format="JPEG", quality=94, optimize=True)
    shutil.copyfile(jpg_path, assets_sat_dir / f"{shot_id}.jpg")

    webp_name = f"{shot_id}_ready.webp"
    webp_path = public_sat_dir / webp_name
    if is_base:
        sharp.save(webp_path, "WEBP", quality=94, method=4)
    else:
        rgba = sharp.convert("RGBA")
        rgba.putalpha(feather_alpha(sharp.width, sharp.height, frac=0.05))
        rgba.save(webp_path, "WEBP", quality=95, alpha_quality=95, method=4)

    print(f"  -> saved {webp_name} ({sharp.width}x{sharp.height}px, {webp_path.stat().st_size // 1024} KB, missing={missing})")
    return {
        "id": shot_id,
        "href": f"sat/{webp_name}",
        "zoom": z,
        "x": round(tx0 * unit, 4),
        "y": round(ty0 * unit, 4),
        "w": round(nx * unit, 4),
        "h": round(ny * unit, 4),
        "pixelWidth": nx * 256,
        "pixelHeight": ny * 256,
    }


def main() -> None:
    ap = argparse.ArgumentParser(description=__doc__)
    ap.add_argument("--project-dir", required=True, type=Path)
    ap.add_argument("--slug", required=True, help="Target region slug (e.g. lach_huyen, long_thanh)")
    ap.add_argument("--year", default="2024", help="EOX s2cloudless year (default: 2024)")
    ap.add_argument("--z9-bbox", required=True, help="west,south,east,north for regional z9 mosaic")
    ap.add_argument("--z12-bbox", required=True, help="west,south,east,north for metro z12 mosaic")
    ap.add_argument("--z14-bbox", required=True, help="west,south,east,north for closeup z14 mosaic")
    ap.add_argument("--cache-dir", type=Path, default=Path(".cache/eox_tiles"))
    args = ap.parse_args()

    proj = args.project_dir.resolve()
    pub_sat = proj / "public" / "sat"
    ast_sat = proj / "assets" / "images" / "sat"
    cache_dir = args.cache_dir.resolve()

    shots = [
        ("sea_region_z6", 6, (90.0, -5.0, 129.0, 27.5), True),
        ("vietnam_eastsea_z7", 7, (101.5, 6.0, 119.5, 24.0), False),
        (f"{args.slug}_region_z9", 9, parse_bbox(args.z9_bbox), False),
        (f"{args.slug}_metro_z12", 12, parse_bbox(args.z12_bbox), False),
        (f"{args.slug}_closeup_z14", 14, parse_bbox(args.z14_bbox), False),
    ]
    mosaics = [
        build_sharp_mosaic(sid, z, bb, pub_sat, ast_sat, cache_dir, year=args.year, is_base=base)
        for (sid, z, bb, base) in shots
    ]

    ts_out = proj / "data" / "satelliteManifest.ts"
    ts_out.parent.mkdir(parents=True, exist_ok=True)
    ts_content = (
        f"// Auto-generated from EOX Sentinel-2 {args.year} cloudless WMTS (CC BY 4.0)\n"
        "export interface SatelliteMosaic {\n"
        "  id: string;\n"
        "  href: string;\n"
        "  zoom: number;\n"
        "  x: number;\n"
        "  y: number;\n"
        "  w: number;\n"
        "  h: number;\n"
        "  pixelWidth: number;\n"
        "  pixelHeight: number;\n"
        "}\n\n"
        f"export const SATELLITE_ATTRIBUTION = {json.dumps(EOX_ATTRIBUTION, ensure_ascii=False)};\n\n"
        f"export const SATELLITE_MOSAICS: readonly SatelliteMosaic[] = {json.dumps(mosaics, ensure_ascii=False, indent=2)} as const;\n"
    )
    ts_out.write_text(ts_content, encoding="utf-8")
    print(f"[DONE] Wrote {ts_out}")


if __name__ == "__main__":
    main()

