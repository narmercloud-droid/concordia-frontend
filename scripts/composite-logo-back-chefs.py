"""
DEPRECATED — pasting portraits creates visible photo cutouts.
Use v19 merged logo (AI redraw in group style) instead.
Kept only for reference; do not run for production logos.
"""
from __future__ import annotations

import math
from pathlib import Path

from PIL import Image, ImageDraw, ImageFilter

ROOT = Path(__file__).resolve().parents[1]
BASE = ROOT / "public/images/concordia-logo-hero-v17-backup.png"
CHEF3 = ROOT / "public/images/owners/owner-1-logo-portrait.png"
CHEF4 = ROOT / "public/images/owners/owner-4-logo-portrait.png"
OUT_HERO = ROOT / "public/images/concordia-logo-hero.png"
OUT_LOGO = ROOT / "public/images/concordia-logo.png"

SLOT_LEFT = (295, 45, 585, 405)
SLOT_RIGHT = (958, 38, 1302, 412)


def corner_cream(img: Image.Image) -> tuple[int, int, int]:
    px = img.convert("RGB").load()
    w, h = img.size
    pts = [(12, 12), (w - 12, 12), (12, h - 12), (w - 12, h - 12)]
    rs, gs, bs = [], [], []
    for x, y in pts:
        r, g, b = px[x, y]
        rs.append(r)
        gs.append(g)
        bs.append(b)
    return (sum(rs) // 4, sum(gs) // 4, sum(bs) // 4)


def dist(a: tuple[int, int, int], b: tuple[int, int, int]) -> float:
    return math.sqrt(sum((x - y) ** 2 for x, y in zip(a, b)))


def trim_portrait(portrait: Image.Image, bg_tol: float = 46, pad: int = 8) -> Image.Image:
    """Crop away empty cream margins from portrait file."""
    p_cream = corner_cream(portrait)
    px = portrait.convert("RGB").load()
    w, h = portrait.size
    minx, miny, maxx, maxy = w, h, 0, 0
    for y in range(h):
        for x in range(w):
            if dist(px[x, y], p_cream) > bg_tol:
                minx = min(minx, x)
                miny = min(miny, y)
                maxx = max(maxx, x)
                maxy = max(maxy, y)
    if maxx <= minx:
        return portrait
    return portrait.crop((
        max(0, minx - pad),
        max(0, miny - pad),
        min(w, maxx + pad),
        min(h, maxy + pad),
    ))


def prepare_portrait(portrait: Image.Image, logo_cream: tuple[int, int, int]) -> Image.Image:
    trimmed = trim_portrait(portrait)
    p_cream = corner_cream(trimmed)
    w, h = trimmed.size
    rgba = Image.new("RGBA", (w, h))
    src = trimmed.convert("RGB").load()
    dst = rgba.load()
    for y in range(h):
        for x in range(w):
            r, g, b = src[x, y]
            if dist((r, g, b), p_cream) <= 44:
                dst[x, y] = (*logo_cream, 0)
            else:
                dst[x, y] = (r, g, b, 255)
    rgba.putalpha(rgba.split()[3].filter(ImageFilter.GaussianBlur(1)))
    return rgba


def replace_slot(
    base: Image.Image,
    portrait: Image.Image,
    slot: tuple[int, int, int, int],
    logo_cream: tuple[int, int, int],
    *,
    x_nudge: int = 0,
    y_nudge: int = 0,
) -> None:
    x1, y1, x2, y2 = slot
    ImageDraw.Draw(base).rectangle(slot, fill=logo_cream)

    rgba = prepare_portrait(portrait, logo_cream)
    bw, bh = x2 - x1, y2 - y1
    scale = max(bw / rgba.width, bh / rgba.height)
    size = (int(rgba.width * scale), int(rgba.height * scale))
    scaled = rgba.resize(size, Image.Resampling.LANCZOS)

    ox = x1 + (bw - size[0]) // 2 + x_nudge
    oy = y1 + (bh - size[1]) // 2 + y_nudge

    clip = Image.new("L", base.size, 0)
    ImageDraw.Draw(clip).rectangle(slot, fill=255)

    layer = Image.new("RGBA", base.size, (0, 0, 0, 0))
    layer.paste(scaled, (ox, oy), scaled)

    combined = Image.new("L", base.size, 0)
    la, cp, op = layer.split()[3].load(), clip.load(), combined.load()
    for y in range(base.height):
        for x in range(base.width):
            op[x, y] = min(la[x, y], cp[x, y])
    base.paste(layer.convert("RGB"), (0, 0), combined)


def main() -> None:
    base = Image.open(BASE).convert("RGB")
    logo_cream = corner_cream(base)

    replace_slot(base, Image.open(CHEF3), SLOT_LEFT, logo_cream, x_nudge=12)
    replace_slot(base, Image.open(CHEF4), SLOT_RIGHT, logo_cream, x_nudge=-18, y_nudge=-4)

    base.save(OUT_HERO, quality=96)
    base.save(OUT_LOGO, quality=96)
    print(f"Wrote {OUT_HERO}")


if __name__ == "__main__":
    main()
