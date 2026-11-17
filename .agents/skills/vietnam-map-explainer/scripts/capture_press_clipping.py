"""Capture and cleanly crop authentic Vietnamese news article clippings (ad-free)
for on-map evidence cards (`OnMapPressClippingCard`) in Vietnam Map Explainer.

Usage:
    # Step 1: Capture full raw screenshot of a public article URL (never bypasses CAPTCHA/paywall)
    python .agents/skills/vietnam-map-explainer/scripts/capture_press_clipping.py capture ^
        --url "https://vnexpress.net/..." ^
        --raw-out raw_article.png

    # Step 2: Inspect raw_article.png via read_file, then crop cleanly without ads/sidebars
    python .agents/skills/vietnam-map-explainer/scripts/capture_press_clipping.py crop ^
        --raw-in raw_article.png ^
        --out projects/<project-id>/public/press/clip_name.png ^
        --x-range 115,835 --top-y 420,680 --bot-y 948,1358
"""

from __future__ import annotations

import argparse
import shutil
import subprocess
import sys
from pathlib import Path

from PIL import Image, ImageDraw

DEFAULT_BROWSER_CANDIDATES = (
    r"C:\Program Files\Google\Chrome\Application\chrome.exe",
    r"C:\Program Files (x86)\Microsoft\Edge\Application\msedge.exe",
    "google-chrome",
    "chromium",
    "msedge",
)


def find_browser(explicit: str | None = None) -> str:
    """Locate a Chromium-based browser binary for headless screenshot capture."""
    if explicit:
        p = Path(explicit)
        if p.exists() or shutil.which(explicit):
            return explicit
        raise FileNotFoundError(f"Browser binary not found: {explicit}")
    for cand in DEFAULT_BROWSER_CANDIDATES:
        if Path(cand).exists():
            return cand
        resolved = shutil.which(cand)
        if resolved:
            return resolved
    raise FileNotFoundError(
        "No Chrome/Edge browser found. Pass --browser <path> explicitly."
    )


def _parse_pair(raw: str, name: str) -> tuple[int, int]:
    parts = [p.strip() for p in raw.split(",")]
    if len(parts) != 2:
        raise ValueError(f"--{name} must be two integers formatted as a,b (got {raw!r})")
    a, b = int(parts[0]), int(parts[1])
    if a >= b:
        raise ValueError(f"--{name} start must be < end (got {a} >= {b})")
    return a, b


def cmd_capture(args: argparse.Namespace) -> None:
    """Capture a headless Chromium screenshot of a public article URL."""
    browser = find_browser(args.browser)
    out_path = Path(args.raw_out)
    out_path.parent.mkdir(parents=True, exist_ok=True)
    cmd = [
        browser,
        "--headless=new",
        "--disable-gpu",
        "--hide-scrollbars",
        f"--window-size={args.width},{args.height}",
        f"--virtual-time-budget={args.wait_ms}",
        f"--screenshot={out_path.resolve()}",
        args.url,
    ]
    res = subprocess.run(cmd, capture_output=True, text=True, timeout=args.timeout)
    if res.returncode != 0 or not out_path.exists() or out_path.stat().st_size == 0:
        raise RuntimeError(
            f"Headless capture failed (rc={res.returncode}): {(res.stderr or '').strip()}"
        )
    print(f"[CAPTURE OK] {out_path} ({out_path.stat().st_size:,} bytes)")


def cmd_crop(args: argparse.Namespace) -> None:
    """Crop clean article header/lead (+ optional inline photo slice) from a raw page screenshot."""
    raw_path = Path(args.raw_in)
    out_path = Path(args.out)
    out_path.parent.mkdir(parents=True, exist_ok=True)

    im = Image.open(raw_path).convert("RGB")
    x0, x1 = _parse_pair(args.x_range, "x-range")
    x0 = max(0, x0)
    x1 = min(im.width, x1)

    t0, t1 = _parse_pair(args.top_y, "top-y")
    top_crop = im.crop((x0, max(0, t0), x1, min(im.height, t1)))

    if args.bot_y:
        b0, b1 = _parse_pair(args.bot_y, "bot-y")
        bot_crop = im.crop((x0, max(0, b0), x1, min(im.height, b1)))
        gap = 18
        canvas = Image.new("RGB", (top_crop.width, top_crop.height + gap + bot_crop.height), (255, 255, 255))
        canvas.paste(top_crop, (0, 0))
        canvas.paste(bot_crop, (0, top_crop.height + gap))
        draw = ImageDraw.Draw(canvas)
        sep_y = top_crop.height + gap // 2
        for x in range(18, top_crop.width - 18, 14):
            draw.line([(x, sep_y), (x + 7, sep_y)], fill=(200, 196, 184), width=2)
    else:
        canvas = top_crop

    canvas.save(out_path, format="PNG", optimize=True)
    print(f"[CROP OK] {out_path.name}: {canvas.width}x{canvas.height} px ({out_path.stat().st_size:,} bytes)")


def build_parser() -> argparse.ArgumentParser:
    parser = argparse.ArgumentParser(
        description="Capture and ad-free crop public news article clippings for Vietnam Map Explainer."
    )
    sub = parser.add_subparsers(dest="command", required=True)

    p_cap = sub.add_parser("capture", help="Capture a raw full-column screenshot of a public article URL.")
    p_cap.add_argument("--url", required=True, help="Resolved public article URL (no CAPTCHA/paywall).")
    p_cap.add_argument("--raw-out", required=True, help="Output path for the raw page PNG.")
    p_cap.add_argument("--width", type=int, default=1280, help="Viewport width (default: 1280).")
    p_cap.add_argument("--height", type=int, default=1800, help="Viewport height (default: 1800).")
    p_cap.add_argument("--wait-ms", type=int, default=6500, help="Virtual time budget ms (default: 6500).")
    p_cap.add_argument("--timeout", type=int, default=45, help="Process timeout seconds (default: 45).")
    p_cap.add_argument("--browser", default=None, help="Optional explicit Chrome/Edge binary path.")
    p_cap.set_defaults(func=cmd_capture)

    p_crop = sub.add_parser("crop", help="Crop headline/lead (+ optional inline photo) excluding ads/sidebars.")
    p_crop.add_argument("--raw-in", required=True, help="Raw screenshot PNG produced by `capture`.")
    p_crop.add_argument("--out", required=True, help="Destination clean PNG under public/press/.")
    p_crop.add_argument("--x-range", required=True, help="Horizontal article column pixel bounds x0,x1.")
    p_crop.add_argument("--top-y", required=True, help="Top slice (category + H1 + sapo) vertical bounds y0,y1.")
    p_crop.add_argument("--bot-y", default=None, help="Optional photo/diagram slice vertical bounds y2,y3.")
    p_crop.set_defaults(func=cmd_crop)
    return parser


def main() -> None:
    if hasattr(sys.stdout, "reconfigure"):
        sys.stdout.reconfigure(encoding="utf-8")
    parser = build_parser()
    args = parser.parse_args()
    args.func(args)


if __name__ == "__main__":
    main()

