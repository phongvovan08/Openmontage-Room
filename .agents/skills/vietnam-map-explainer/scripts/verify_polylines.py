#!/usr/bin/env python3
"""Cartographic Polyline & Land-Collision QA Gate for Vietnam Map Explainer.

Verifies:
1. All maritime routes (Scene 01, 05, 16, 19 or any maritime TSX array) have ZERO
   sampled points crossing landmasses (Vietnam, China/Hainan/Leizhou, Taiwan,
   Philippines, Malaysia, Indonesia/Sumatra, Singapore, Okinawa/Kyushu).
2. All maritime routes maintain >= 0.30 deg clearance from Hoang Sa & Truong Sa dots.
3. Local estuary channels/canals (LUONG_LACH_HUYEN, KENH_HA_NAM_LINE,
   BACH_DANG_LINE, OLD_CORRIDOR_48KM, BREAKWATER_NE) have ZERO points inside OSM
   cat_hai_island or cat_ba_island polygons.
4. Southern port rail spur RAIL_1435_BRANCH_NDS stays on mainland (no points east
   of 106.790E or south of 20.675N into open sea).
5. Gateway pins on regional ocean routes do not land on unrelated landmasses.

Pure Python stdlib + Pillow (no matplotlib/shapely dependency).
"""

from __future__ import annotations

import argparse
import ast
import json
import math
import re
import sys
from pathlib import Path
from typing import Dict, List, Sequence, Tuple

from PIL import Image, ImageDraw

LonLat = Tuple[float, float]
PolyWM = Tuple[Tuple[float, float, float, float], List[Tuple[float, float]]]


def lonlat_to_wm(lon: float, lat: float) -> Tuple[float, float]:
    wx = (lon + 180.0) / 360.0 * 65536.0
    lat_rad = math.radians(lat)
    wy = (1.0 - math.log(math.tan(lat_rad) + 1.0 / math.cos(lat_rad)) / math.pi) / 2.0 * 65536.0
    return (wx, wy)


def wm_to_lonlat(wx: float, wy: float) -> LonLat:
    lon = (wx / 65536.0) * 360.0 - 180.0
    n = math.pi - 2.0 * math.pi * (wy / 65536.0)
    lat = math.degrees(math.atan(0.5 * (math.exp(n) - math.exp(-n))))
    return (lon, lat)


def point_in_poly(x: float, y: float, poly: Sequence[Tuple[float, float]]) -> bool:
    inside = False
    n = len(poly)
    if n < 3:
        return False
    j = n - 1
    for i in range(n):
        xi, yi = poly[i]
        xj, yj = poly[j]
        if ((yi > y) != (yj > y)) and (x < (xj - xi) * (y - yi) / (yj - yi + 1e-12) + xi):
            inside = not inside
        j = i
    return inside


def parse_svg_polys(d_str: str) -> List[PolyWM]:
    polys: List[PolyWM] = []
    for sub in d_str.split("Z"):
        pts = [(float(x), float(y)) for x, y in re.findall(r"([0-9.]+),([0-9.]+)", sub)]
        if len(pts) >= 3:
            xs = [p[0] for p in pts]
            ys = [p[1] for p in pts]
            polys.append(((min(xs), min(ys), max(xs), max(ys)), pts))
    return polys


def sample_polyline(coords: Sequence[LonLat], count: int = 400) -> List[LonLat]:
    if not coords:
        return []
    if len(coords) == 1:
        return [tuple(coords[0])] * count
    segs: List[float] = []
    total = 0.0
    for i in range(len(coords) - 1):
        d = math.hypot(coords[i + 1][0] - coords[i][0], coords[i + 1][1] - coords[i][1])
        segs.append(d)
        total += d
    out: List[LonLat] = []
    for k in range(count):
        target = (total * k) / max(1, count - 1)
        acc = 0.0
        for i, sd in enumerate(segs):
            if acc + sd >= target or i == len(segs) - 1:
                u = (target - acc) / sd if sd > 1e-9 else 0.0
                out.append((
                    coords[i][0] + (coords[i + 1][0] - coords[i][0]) * u,
                    coords[i][1] + (coords[i + 1][1] - coords[i][1]) * u,
                ))
                break
            acc += sd
    return out


def strip_ts_comments(text: str) -> str:
    text = re.sub(r"/\*.*?\*/", "", text, flags=re.S)
    text = re.sub(r"//[^\n]*", "", text)
    return text


def eval_ts_coord_array(expr: str, symbols: Dict[str, LonLat]) -> List[LonLat]:
    cleaned = strip_ts_comments(expr)
    cleaned = re.sub(r"\s+as\s+const\b", "", cleaned)
    cleaned = re.sub(r"\s+as\s+LonLat\b", "", cleaned)
    for k, v in sorted(symbols.items(), key=lambda kv: -len(kv[0])):
        cleaned = cleaned.replace(k, f"[{v[0]}, {v[1]}]")
    data = ast.literal_eval(cleaned.strip())
    return [(float(p[0]), float(p[1])) for p in data]


def extract_named_array(ts_text: str, name: str, symbols: Dict[str, LonLat]) -> List[LonLat] | None:
    pat = rf"(?:export\s+)?const\s+{re.escape(name)}(?:\s*:[^=]+)?\s*=\s*(\[.*?\])(?:\s+as\s+const)?\s*;"
    m = re.search(pat, ts_text, re.S)
    if not m:
        return None
    return eval_ts_coord_array(m.group(1), symbols)


def build_symbol_map(nat_txt: str, hydro_txt: str) -> Dict[str, LonLat]:
    symbols: Dict[str, LonLat] = {}
    for var_name in ("HAI_PHONG_COORD", "LACH_HUYEN_COORD", "HA_NOI_COORD", "HONG_KONG_COORD", "SINGAPORE_COORD"):
        m = re.search(rf"export\s+const\s+{var_name}[^=]*=\s*(\[[^\]]+\])", nat_txt)
        if m:
            arr = ast.literal_eval(m.group(1))
            symbols[var_name] = (float(arr[0]), float(arr[1]))
    m_anc = re.search(r"export\s+const\s+ANCHORS\s*=\s*\{(.*?)\}\s*(?:as\s+const)?\s*;", hydro_txt, re.S)
    if m_anc:
        for km in re.finditer(r"(\w+)\s*:\s*(\[[^\]]+\])", m_anc.group(1)):
            arr = ast.literal_eval(km.group(2))
            symbols[f"ANCHORS.{km.group(1)}"] = (float(arr[0]), float(arr[1]))
    for var_name in ("BEN_SAU_KHO_1874", "GA_NAM_HAI_PHONG"):
        m = re.search(rf"export\s+const\s+{var_name}[^=]*=\s*(\[[^\]]+\])", hydro_txt)
        if m:
            arr = ast.literal_eval(m.group(1))
            symbols[var_name] = (float(arr[0]), float(arr[1]))
    return symbols


def rect_to_wm_poly(iso: str, lon0: float, lat0: float, lon1: float, lat1: float) -> Tuple[str, Tuple[float, float, float, float], List[Tuple[float, float]]]:
    corners = [(lon0, lat0), (lon1, lat0), (lon1, lat1), (lon0, lat1), (lon0, lat0)]
    wm_pts = [lonlat_to_wm(lo, la) for lo, la in corners]
    xs = [p[0] for p in wm_pts]
    ys = [p[1] for p in wm_pts]
    return (iso, (min(xs), min(ys), max(xs), max(ys)), wm_pts)


def run_audit(proj_dir: Path, debug_dir: Path | None) -> int:
    nat_path = proj_dir / "data" / "nationalMapData.ts"
    hydro_path = proj_dir / "data" / "haiphongHydroData.ts"
    if not nat_path.exists():
        print(f"[SKIP] Missing {nat_path}")
        return 1

    nat_txt = nat_path.read_text(encoding="utf-8")
    hydro_txt = hydro_path.read_text(encoding="utf-8") if hydro_path.exists() else ""
    symbols = build_symbol_map(nat_txt, hydro_txt)

    vnm_obj = json.loads(re.search(r"VIETNAM_PATH:\s*CountryVector\s*=\s*(\{.*?\});", nat_txt).group(1))
    nb_list = json.loads(re.search(r"NEIGHBOUR_PATHS:\s*CountryVector\[\]\s*=\s*(\[.*?\]);", nat_txt).group(1))
    hoang_sa: List[LonLat] = [tuple(p) for p in json.loads(re.search(r"HOANG_SA_ISLANDS[^=]*=\s*(\[[^\n]+);", nat_txt).group(1))]
    truong_sa: List[LonLat] = [tuple(p) for p in json.loads(re.search(r"TRUONG_SA_ISLANDS[^=]*=\s*(\[[^\n]+);", nat_txt).group(1))]

    land_polys: List[Tuple[str, Tuple[float, float, float, float], List[Tuple[float, float]]]] = []
    for bb, pts in parse_svg_polys(vnm_obj["d"]):
        land_polys.append(("VNM", bb, pts))
    for c in nb_list:
        for bb, pts in parse_svg_polys(c["d"]):
            land_polys.append((c["iso"], bb, pts))
    # Explicit island exclusion boxes present on asia_pacific_z4 raster outside NEIGHBOUR_PATHS
    land_polys.append(rect_to_wm_poly("JPN_KYUSHU", 129.2, 30.1, 132.4, 34.4))
    land_polys.append(rect_to_wm_poly("JPN_OKINAWA", 126.8, 25.9, 128.6, 27.2))
    land_polys.append(rect_to_wm_poly("JPN_SAKI_SHIMA", 123.5, 24.0, 125.6, 25.0))

    errors: List[str] = []

    # 1. Discover & check maritime routes in scenes/*.tsx
    maritime_candidates = [
        ("Scene01ColdOpen.tsx", "MAIN_SHIPPING_LANE", False),
        ("Scene01ColdOpen.tsx", "BLOCKED_FEEDER_BRANCH", True),
        ("Scene05SingaporeDetour.tsx", "FEEDER_TO_HK", True),
        ("Scene05SingaporeDetour.tsx", "FEEDER_TO_SGP", True),
        ("Scene05SingaporeDetour.tsx", "MOTHER_FROM_HK", True),
        ("Scene05SingaporeDetour.tsx", "MOTHER_FROM_SGP", True),
        ("Scene16DirectTranspacificRoutes.tsx", "LH_TO_US_WEST", True),
        ("Scene16DirectTranspacificRoutes.tsx", "LH_TO_EU", True),
        ("Scene16DirectTranspacificRoutes.tsx", "OLD_SGP_DETOUR", True),
        ("Scene19GrandFinale150Years.tsx", "GRAND_VISION_ARC", True),
    ]

    port_anchors = [
        v for k, v in symbols.items()
        if k in ("HAI_PHONG_COORD", "HONG_KONG_COORD", "SINGAPORE_COORD", "ANCHORS.benLachHuyen", "LACH_HUYEN_COORD")
    ]
    maritime_routes_drawn: List[Tuple[str, List[LonLat], List[Tuple[float, float, str]]]] = []

    for fname, var_name, is_port_bound in maritime_candidates:
        fpath = proj_dir / "scenes" / fname
        if not fpath.exists():
            continue
        sc_txt = fpath.read_text(encoding="utf-8")
        coords = extract_named_array(sc_txt, var_name, symbols)
        if not coords:
            continue
        sampled = sample_polyline(coords, 400)
        hits: List[Tuple[float, float, str]] = []
        arch_hits: List[Tuple[float, float, str]] = []
        for idx, (lon, lat) in enumerate(sampled):
            # Allow origin/destination port pin overlap only within 0.16 deg of true coastal harbor anchor
            if is_port_bound and any(math.hypot(lon - ax, lat - ay) <= 0.16 for ax, ay in port_anchors):
                continue
            wx, wy = lonlat_to_wm(lon, lat)
            for iso, (x0, y0, x1, y1), poly in land_polys:
                if x0 <= wx <= x1 and y0 <= wy <= y1 and point_in_poly(wx, wy, poly):
                    hits.append((lon, lat, iso))
                    break
            for hx, hy in hoang_sa:
                if math.hypot(lon - hx, lat - hy) < 0.30:
                    arch_hits.append((lon, lat, "HOANG_SA"))
                    break
            for tx, ty in truong_sa:
                if math.hypot(lon - tx, lat - ty) < 0.30:
                    arch_hits.append((lon, lat, "TRUONG_SA"))
                    break
        maritime_routes_drawn.append((f"{fname}:{var_name}", coords, hits + arch_hits))
        if hits:
            errors.append(f"[MARITIME LAND HIT] {fname}:{var_name} -> {len(hits)} hits (first: {hits[0][2]} @ {hits[0][0]:.3f}, {hits[0][1]:.3f})")
        elif arch_hits:
            errors.append(f"[ARCHIPELAGO HIT] {fname}:{var_name} -> {len(arch_hits)} close passes (first: {arch_hits[0][2]} @ {arch_hits[0][0]:.3f}, {arch_hits[0][1]:.3f})")
        else:
            print(f"[PASS] {fname}:{var_name} -> 0 land/island hits ({len(coords)} waypoints)")

    # Verify gateway pins in Scene 16 are in open water (not pinned on Japan!)
    s16_path = proj_dir / "scenes" / "Scene16DirectTranspacificRoutes.tsx"
    if s16_path.exists():
        s16_txt = s16_path.read_text(encoding="utf-8")
        for pin_m in re.finditer(r"const\s+\[(usX|euX),\s*\w+\]\s*=\s*lonLatToScreen\(box,\s*(\[[^\]]+\])", s16_txt):
            pname = pin_m.group(1)
            plon, plat = ast.literal_eval(pin_m.group(2))
            wx, wy = lonlat_to_wm(plon, plat)
            for iso, (x0, y0, x1, y1), poly in land_polys:
                if x0 <= wx <= x1 and y0 <= wy <= y1 and point_in_poly(wx, wy, poly):
                    errors.append(f"[GATEWAY PIN LAND HIT] Scene16 {pname} @ ({plon}, {plat}) lands on {iso}!")
                    break
            else:
                print(f"[PASS] Scene16 gateway pin {pname} @ ({plon}, {plat}) in open ocean")

    # 2. Check local Hai Phong hydro & rail lines against OSM landforms
    local_lines: Dict[str, List[LonLat]] = {}
    if hydro_txt:
        m_lf = re.search(r"HAIPHONG_LANDFORMS:\s*readonly\s*LandPolygon\[\]\s*=\s*(\[.*?\]);\s*export const HAIPHONG_SILT_ZONES", hydro_txt, re.S)
        lfs = json.loads(m_lf.group(1)) if m_lf else []
        cat_hai = next((x["coords"] for x in lfs if x["id"] == "cat_hai_island"), [])
        cat_ba = next((x["coords"] for x in lfs if x["id"] == "cat_ba_island"), [])

        for var_name in (
            "SONG_CAM_LINE", "BACH_DANG_LINE", "KENH_HA_NAM_LINE", "OLD_CORRIDOR_48KM",
            "LUONG_LACH_HUYEN", "SAND_DIKE_SW", "BREAKWATER_NE", "TAN_VU_SEA_BRIDGE", "TAN_VU_FULL_ROUTE",
            "OPERATING_BERTHS_1_6", "BERTH_1_2_POLY", "BERTH_3_4_POLY", "BERTH_5_6_POLY",
            "BERTH_7_8_POLY", "NAM_DO_SON_ZONE",
            "RAIL_1902_INDOCHINA", "RAIL_1435_MAINLINE", "RAIL_1435_BRANCH_LH", "RAIL_1435_BRANCH_NDS",
        ):
            arr = extract_named_array(hydro_txt, var_name, symbols)
            if arr:
                local_lines[var_name] = arr

        for w_name in ("LUONG_LACH_HUYEN", "KENH_HA_NAM_LINE", "BACH_DANG_LINE", "OLD_CORRIDOR_48KM", "BREAKWATER_NE"):
            pts = local_lines.get(w_name, [])
            if not pts:
                continue
            ch_hits = []
            cb_hits = []
            for idx, (lon, lat) in enumerate(sample_polyline(pts, 300)):
                # Allow canal entry at Dinh Vu/Ha Nam junction? Ha Nam canal runs NORTH of Cat Hai island (cat_hai north edge is 20.8169)!
                if cat_hai and point_in_poly(lon, lat, cat_hai):
                    ch_hits.append((lon, lat))
                if cat_ba and point_in_poly(lon, lat, cat_ba):
                    cb_hits.append((lon, lat))
            if ch_hits or cb_hits:
                errors.append(f"[LOCAL WATERWAY LAND HIT] {w_name}: CatHai={len(ch_hits)} {ch_hits[:2]}, CatBa={len(cb_hits)} {cb_hits[:2]}")
            else:
                print(f"[PASS] {w_name} -> 0 hits on Cat Hai / Cat Ba OSM polygons")

        if "RAIL_1435_BRANCH_NDS" in local_lines:
            nds_pts = sample_polyline(local_lines["RAIL_1435_BRANCH_NDS"], 120)
            bad = [(round(lo, 4), round(la, 4)) for lo, la in nds_pts if lo > 106.790 or la < 20.675]
            if bad:
                errors.append(f"[RAIL SEA/PENINSULA OVERFLOW] RAIL_1435_BRANCH_NDS extends outside mainland bounds: {bad[:3]}")
            else:
                print("[PASS] RAIL_1435_BRANCH_NDS terminates cleanly on mainland coastal root")

        if "TAN_VU_SEA_BRIDGE" in local_lines:
            br_pts = local_lines["TAN_VU_SEA_BRIDGE"]
            if len(br_pts) < 2:
                errors.append("[SEA BRIDGE INVALID] TAN_VU_SEA_BRIDGE has fewer than 2 points")
            else:
                out_bounds = [
                    (round(lo, 5), round(la, 5))
                    for lo, la in br_pts
                    if lo < 106.8280 or lo > 106.8500
                ]
                west_ok = 106.8280 <= br_pts[0][0] <= 106.8310
                east_ok = br_pts[-1][0] >= 106.8470 and (not cat_hai or point_in_poly(br_pts[-1][0], br_pts[-1][1], cat_hai))
                center_hits = [
                    (round(lo, 5), round(la, 5))
                    for lo, la in sample_polyline(br_pts, 80)[22:58]
                    if cat_hai and point_in_poly(lo, la, cat_hai)
                ]
                if out_bounds or not west_ok or not east_ok or center_hits:
                    errors.append(
                        f"[SEA BRIDGE ABUTMENT/SPAN ERROR] TAN_VU_SEA_BRIDGE: out={out_bounds[:2]}, west_ok={west_ok}, east_ok={east_ok}, center_hits={center_hits[:2]}"
                    )
                else:
                    print("[PASS] TAN_VU_SEA_BRIDGE anchors firmly on both Nam Đình Vũ & Cát Hải banks across open Cửa Nam Triệu water")

    # 3. Render Debug Visual Overlays if requested
    if debug_dir is not None:
        debug_dir.mkdir(parents=True, exist_ok=True)
        # Overlay A: z14 satellite + local polylines
        z14_path = proj_dir / "public" / "sat" / "lach_huyen_z14_ready.webp"
        if z14_path.exists() and hydro_txt:
            base = Image.open(z14_path).convert("RGBA")
            w_out, h_out = 2688, 1920
            img = base.resize((w_out, h_out), Image.Resampling.BILINEAR)
            draw = ImageDraw.Draw(img, "RGBA")
            X0, Y0, WM_W, WM_H = 52176.0, 28872.0, 84.0, 60.0

            def to_px(pt: LonLat) -> Tuple[float, float]:
                wx, wy = lonlat_to_wm(pt[0], pt[1])
                return ((wx - X0) / WM_W * w_out, (wy - Y0) / WM_H * h_out)

            # Draw Cat Hai / Cat Ba OSM boundary thinly
            for poly_pts, col in [(cat_hai, (148, 163, 184, 150)), (cat_ba, (148, 163, 184, 120))]:
                if len(poly_pts) >= 3:
                    draw.line([to_px(p) for p in poly_pts], fill=col, width=2)

            styles = [
                ("OLD_CORRIDOR_48KM", (245, 158, 11, 200), 6),
                ("BACH_DANG_LINE", (251, 146, 60, 220), 4),
                ("KENH_HA_NAM_LINE", (56, 189, 248, 255), 6),
                ("TAN_VU_FULL_ROUTE", (45, 212, 191, 255), 5),
                ("TAN_VU_SEA_BRIDGE", (255, 255, 255, 255), 8),
                ("LUONG_LACH_HUYEN", (14, 165, 233, 255), 7),
                ("SAND_DIKE_SW", (250, 204, 21, 255), 6),
                ("BREAKWATER_NE", (255, 255, 255, 255), 5),
                ("RAIL_1435_BRANCH_LH", (244, 114, 182, 230), 3),
                ("RAIL_1435_BRANCH_NDS", (250, 204, 21, 230), 4),
            ]
            for name, col, wd in styles:
                pts = local_lines.get(name, [])
                if len(pts) >= 2:
                    pxs = [to_px(p) for p in pts]
                    draw.line(pxs, fill=col, width=wd)
                    for px in pxs:
                        draw.ellipse((px[0] - 3, px[1] - 3, px[0] + 3, px[1] + 3), fill=col)

            for name, fill_c, out_c in [
                ("BERTH_1_2_POLY", (20, 184, 166, 130), (94, 234, 212, 255)),
                ("BERTH_3_4_POLY", (56, 189, 248, 130), (186, 230, 253, 255)),
                ("BERTH_5_6_POLY", (45, 212, 191, 140), (153, 246, 228, 255)),
                ("BERTH_7_8_POLY", (250, 204, 21, 110), (250, 204, 21, 255)),
                ("NAM_DO_SON_ZONE", (250, 204, 21, 100), (250, 204, 21, 255)),
            ]:
                pts = local_lines.get(name, [])
                if len(pts) >= 3:
                    draw.polygon([to_px(p) for p in pts], fill=fill_c, outline=out_c, width=3)

            out_z14 = debug_dir / "debug_z14_local_polylines.png"
            img.convert("RGB").save(out_z14)
            print(f"[DEBUG IMG] {out_z14}")

        # Overlay B: Maritime routes against country polygons in WM space
        mw, mh = 2400, 1800
        wm_w0, wm_h0 = lonlat_to_wm(92.0, 33.5)
        wm_w1, wm_h1 = lonlat_to_wm(135.5, -1.5)
        mimg = Image.new("RGB", (mw, mh), (5, 16, 31))
        mdraw = ImageDraw.Draw(mimg, "RGBA")

        def wm_to_mpx(wx: float, wy: float) -> Tuple[float, float]:
            return ((wx - wm_w0) / (wm_w1 - wm_w0) * mw, (wy - wm_h0) / (wm_h1 - wm_h0) * mh)

        for iso, _, poly in land_polys:
            pts_px = [wm_to_mpx(wx, wy) for wx, wy in poly]
            fill_col = (29, 78, 78, 255) if iso == "VNM" else (30, 41, 59, 255)
            out_col = (94, 234, 212, 220) if iso == "VNM" else (71, 85, 105, 200)
            if len(pts_px) >= 3:
                mdraw.polygon(pts_px, fill=fill_col, outline=out_col, width=2)

        for hx, hy in hoang_sa + truong_sa:
            px, py = wm_to_mpx(*lonlat_to_wm(hx, hy))
            mdraw.ellipse((px - 5, py - 5, px + 5, py + 5), fill=(250, 204, 21, 255))

        palette = [(45, 212, 191, 255), (56, 189, 248, 255), (245, 158, 11, 255), (244, 63, 94, 220), (167, 139, 250, 255)]
        for i, (label, coords, rhits) in enumerate(maritime_routes_drawn):
            col = palette[i % len(palette)]
            pts_px = [wm_to_mpx(*lonlat_to_wm(lo, la)) for lo, la in coords]
            mdraw.line(pts_px, fill=col, width=4)
            for hlon, hlat, _ in rhits:
                hx, hy = wm_to_mpx(*lonlat_to_wm(hlon, hlat))
                mdraw.ellipse((hx - 4, hy - 4, hx + 4, hy + 4), fill=(255, 0, 0, 255))

        out_mar = debug_dir / "debug_maritime_routes.png"
        mimg.save(out_mar)
        print(f"[DEBUG IMG] {out_mar}")

    if errors:
        print("\n[FAILED] Cartographic Polyline Audit Errors:")
        for e in errors:
            print("  -", e)
        return 1

    print("\n[VERIFIED] 100% Cartographic Polyline & Land-Collision QA PASSED (0 violations).")
    return 0


def main() -> int:
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("project_dir", type=Path, help="Path to projects/<project-id>")
    parser.add_argument("--debug-dir", type=Path, default=None, help="Directory to save debug overlay PNGs")
    args = parser.parse_args()
    return run_audit(args.project_dir.resolve(), args.debug_dir.resolve() if args.debug_dir else None)


if __name__ == "__main__":
    raise SystemExit(main())
