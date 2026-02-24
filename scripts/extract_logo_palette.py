from __future__ import annotations

import argparse
from dataclasses import dataclass
from pathlib import Path

from PIL import Image


@dataclass(frozen=True)
class Palette:
    primary: str
    secondary: str
    accent: str
    dark: str
    light: str


def _rgb_to_hex(rgb: tuple[int, int, int]) -> str:
    r, g, b = rgb
    return f"#{r:02X}{g:02X}{b:02X}"


def _is_near_white(rgb: tuple[int, int, int]) -> bool:
    r, g, b = rgb
    return r > 245 and g > 245 and b > 245


def _is_near_black(rgb: tuple[int, int, int]) -> bool:
    r, g, b = rgb
    return r < 18 and g < 18 and b < 18


def extract_palette(image_path: Path, *, max_colors: int = 8) -> tuple[Palette, list[tuple[str, int]]]:
    img = Image.open(image_path).convert("RGBA")

    # Downsample to make quantization stable and fast
    img_small = img.resize((256, 256))

    # Remove transparent pixels
    pixels: list[tuple[int, int, int]] = [
        (r, g, b)
        for (r, g, b, a) in img_small.getdata()
        if a > 200
    ]

    # Prefer ignoring pure background/white; keep dark colors
    pixels_fg = [p for p in pixels if not _is_near_white(p)] or pixels

    # Quantize to a reduced palette
    q = Image.new("RGB", img_small.size)
    q.putdata(pixels_fg)
    q = q.quantize(colors=max_colors, method=Image.Quantize.MEDIANCUT)
    palette = q.getpalette() or []

    # Count indices
    counts: dict[int, int] = {}
    for idx in q.getdata():
        counts[int(idx)] = counts.get(int(idx), 0) + 1

    ranked: list[tuple[tuple[int, int, int], int]] = []
    for idx, count in sorted(counts.items(), key=lambda t: t[1], reverse=True):
        base = idx * 3
        if base + 2 >= len(palette):
            continue
        rgb = (palette[base], palette[base + 1], palette[base + 2])
        ranked.append((rgb, count))

    # Build a simple heuristic palette
    # - dark: darkest color
    # - primary: most common non-dark
    # - accent: a gold-ish color (high R&G, lower B) if present
    # - secondary: next most distinct (usually a complementary purple)
    ranked_rgb = [rgb for rgb, _ in ranked]
    dark_rgb = min(ranked_rgb, key=lambda c: sum(c)) if ranked_rgb else (0, 0, 0)
    light_rgb = (255, 255, 255)

    non_dark = [c for c in ranked_rgb if sum(c) > 80 and not _is_near_black(c)]
    primary_rgb = non_dark[0] if non_dark else (75, 46, 131)

    def is_goldish(c: tuple[int, int, int]) -> bool:
        r, g, b = c
        return r > 160 and g > 120 and b < 140

    gold_candidates = [c for c in ranked_rgb if is_goldish(c) and not _is_near_white(c)]
    accent_rgb = gold_candidates[0] if gold_candidates else primary_rgb

    def dist(a: tuple[int, int, int], b: tuple[int, int, int]) -> int:
        return sum(abs(a[i] - b[i]) for i in range(3))

    secondary_rgb = primary_rgb
    for c in non_dark[1:]:
        if dist(c, primary_rgb) > 80 and dist(c, accent_rgb) > 80:
            secondary_rgb = c
            break

    palette_out = Palette(
        primary=_rgb_to_hex(primary_rgb),
        secondary=_rgb_to_hex(secondary_rgb),
        accent=_rgb_to_hex(accent_rgb),
        dark=_rgb_to_hex(dark_rgb),
        light=_rgb_to_hex(light_rgb),
    )

    top = [(_rgb_to_hex(rgb), count) for rgb, count in ranked]
    return palette_out, top


def main() -> None:
    parser = argparse.ArgumentParser()
    parser.add_argument(
        "--image",
        default=str(Path("apps/web/public/lpadmvLogo.PNG")),
        help="Path to logo PNG",
    )
    parser.add_argument("--max-colors", type=int, default=8)
    args = parser.parse_args()

    image_path = Path(args.image)
    palette, top = extract_palette(image_path, max_colors=args.max_colors)

    print(f"Image: {image_path}")
    print("\nTop colors:")
    for hex_color, count in top[:12]:
        print(f"  {hex_color}  {count}")

    print("\nSuggested brand palette:")
    print(f"  primary:   {palette.primary}")
    print(f"  secondary: {palette.secondary}")
    print(f"  accent:    {palette.accent}")
    print(f"  dark:      {palette.dark}")
    print(f"  light:     {palette.light}")


if __name__ == "__main__":
    main()
