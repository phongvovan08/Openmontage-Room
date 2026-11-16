"""Pre-bake Sentinel-2 / aerial mosaic tiles into sharp, high-contrast, alpha-feathered WebP files.

Eliminates slow per-frame SVG <feGaussianBlur> masks and CSS filters inside Remotion while
applying optical UnsharpMask + crisp contrast enhancement for 3D tilted broadcast maps.

Usage:
    python .agents/skills/vietnam-map-explainer/scripts/prebake_satellite_webp.py \
        --input-dir projects/<project-id>/public/sat \
        --base-layer sea_region_z6
"""

from __future__ import annotations

import argparse
from pathlib import Path

import numpy as np
from PIL import Image, ImageEnhance, ImageFilter


def feather_alpha(width: int, height: int, frac: float = 0.05) -> Image.Image:
    """Create a smooth raised-cosine rectangular edge feather alpha channel."""
    fx = max(4, int(round(width * frac)))
    fy = max(4, int(round(height * frac)))

    x_ramp = np.ones(width, dtype=np.float32)
    t_x = np.linspace(0.0, 1.0, fx, dtype=np.float32)
    smooth_x = 0.5 - 0.5 * np.cos(np.pi * t_x)
    x_ramp[:fx] = smooth_x
    x_ramp[-fx:] = smooth_x[::-1]

    y_ramp = np.ones(height, dtype=np.float32)
    t_y = np.linspace(0.0, 1.0, fy, dtype=np.float32)
    smooth_y = 0.5 - 0.5 * np.cos(np.pi * t_y)
    y_ramp[:fy] = smooth_y
    y_ramp[-fy:] = smooth_y[::-1]

    alpha = np.outer(y_ramp, x_ramp)
    return Image.fromarray(np.clip(alpha * 255.0, 0, 255).astype(np.uint8))


def prebake_directory(
    input_dir: Path,
    base_layers: set[str],
    contrast: float = 1.18,
    saturation: float = 1.20,
    unsharp_radius: float = 1.25,
    unsharp_percent: int = 145,
    feather_frac: float = 0.05,
    quality: int = 95,
) -> None:
    if not input_dir.is_dir():
        raise FileNotFoundError(f"Input directory not found: {input_dir}")

    sources = sorted(
        p
        for p in input_dir.iterdir()
        if p.is_file()
        and p.suffix.lower() in {".jpg", ".jpeg", ".png"}
        and not p.stem.endswith("_ready")
    )
    if not sources:
        print(f"[WARN] No source .jpg/.png mosaics found in {input_dir}")
        return

    for src in sources:
        stem = src.stem
        out_webp = input_dir / f"{stem}_ready.webp"
        with Image.open(src) as im:
            rgb = im.convert("RGB")
            if unsharp_percent > 0:
                rgb = rgb.filter(
                    ImageFilter.UnsharpMask(radius=unsharp_radius, percent=unsharp_percent, threshold=2)
                )
            rgb = ImageEnhance.Contrast(rgb).enhance(contrast)
            rgb = ImageEnhance.Color(rgb).enhance(saturation)
            if stem in base_layers:
                rgb.save(out_webp, "WEBP", quality=quality, method=4)
                mode_note = "opaque base (UnsharpMask)"
            else:
                rgba = rgb.convert("RGBA")
                rgba.putalpha(feather_alpha(rgb.width, rgb.height, frac=feather_frac))
                rgba.save(out_webp, "WEBP", quality=quality, alpha_quality=95, method=4)
                mode_note = f"alpha-feathered ({feather_frac * 100:.1f}%, UnsharpMask)"
        print(f"[OK] {out_webp.name} ({rgb.width}x{rgb.height}, {mode_note}, {out_webp.stat().st_size:,} bytes)")


def main() -> None:
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("--input-dir", required=True, type=Path, help="Directory containing source satellite tiles")
    parser.add_argument(
        "--base-layer",
        action="append",
        default=["sea_region_z6"],
        help="Stem name(s) of lowest-zoom base mosaic(s) kept opaque (no edge feather)",
    )
    parser.add_argument("--feather-frac", type=float, default=0.05, help="Edge feather fraction (default: 0.05)")
    args = parser.parse_args()
    prebake_directory(args.input_dir.resolve(), set(args.base_layer), feather_frac=args.feather_frac)


if __name__ == "__main__":
    main()
