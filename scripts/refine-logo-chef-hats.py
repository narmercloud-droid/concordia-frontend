#!/usr/bin/env python3
"""Natural chef toques — strict hat mask, pleat depth, forehead shadow."""

from __future__ import annotations

import math
from pathlib import Path

from PIL import Image, ImageDraw, ImageFilter

ROOT = Path(__file__).resolve().parents[1]
SRC = ROOT / "public/images/concordia-logo-fancy-backup-hats.png"
OUT = ROOT / "public/images/concordia-logo-fancy.png"

HAT_SLOTS = [
    (0.145, 0.04, 0.17, 0.28),
    (0.355, 0.06, 0.15, 0.26),
    (0.645, 0.06, 0.15, 0.26),
    (0.855, 0.04, 0.17, 0.28),
]


def is_hat_pixel(r: int, g: int, b: int) -> bool:
    """Pure toque white — exclude cream page background (~250,248,245)."""
    if max(r, g, b) - min(r, g, b) > 14:
        return False
    avg = (r + g + b) / 3
    return avg >= 248.5 and min(r, g, b) >= 246


def refine_hat(img: Image.Image, slot: tuple[float, float, float, float]) -> None:
    w, h = img.size
    cx, top, sw, sh = slot
    x1 = int((cx - sw / 2) * w)
    x2 = int((cx + sw / 2) * w)
    y1 = int(top * h)
    y2 = int((top + sh) * h)
    px = img.load()

    hat_rows: list[int] = []
    for y in range(max(0, y1), min(h, y2)):
        for x in range(max(0, x1), min(w, x2)):
            r, g, b = px[x, y]
            if not is_hat_pixel(r, g, b):
                continue
            t = (y - y1) / max(1, y2 - y1)
            pleat = 0.972 + 0.028 * math.sin((x - x1) * 0.26)
            top_lit = 1.02 - (0.05 * t)
            factor = pleat * top_lit
            px[x, y] = (
                max(0, min(255, int(r * factor))),
                max(0, min(255, int(g * factor))),
                max(0, min(255, int(b * (factor - 0.008)))),
            )
        if any(is_hat_pixel(*px[x, y]) for x in range(max(0, x1), min(w, x2))):
            hat_rows.append(y)

    if not hat_rows:
        return

    brim_y = max(hat_rows) + 1
    band = Image.new("RGBA", (w, h), (0, 0, 0, 0))
    draw = ImageDraw.Draw(band)
    mid_x = (x1 + x2) // 2
    rx = int((x2 - x1) * 0.34)
    draw.line([(mid_x - rx, brim_y), (mid_x + rx, brim_y)], fill=(48, 38, 32, 48), width=2)
    band = band.filter(ImageFilter.GaussianBlur(1.8))
    img.paste(band, (0, 0), band.split()[3])


def main() -> None:
    src = SRC if SRC.exists() else ROOT / "public/images/concordia-logo-fancy.png"
    img = Image.open(src).convert("RGB")
    for slot in HAT_SLOTS:
        refine_hat(img, slot)
    img.save(OUT, optimize=True, quality=96)
    print(f"Wrote {OUT}")


if __name__ == "__main__":
    main()
