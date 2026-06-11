#!/usr/bin/env python3
"""Rebuild fancy logo — erase only burgundy script pixels, draw Concordia once."""

from __future__ import annotations

import urllib.request
from pathlib import Path

from PIL import Image, ImageDraw, ImageFont

ROOT = Path(__file__).resolve().parents[1]
SRC = ROOT / "public/images/concordia-logo-v20-final.png"
OUT = ROOT / "public/images/concordia-logo-fancy.png"
FONT_CACHE = ROOT / "scripts/.cache/PinyonScript-Regular.ttf"
TARGET_WIDTH = 1024

CREAM = (250, 248, 245)
BURGUNDY = (139, 26, 43)


def ensure_pinyon_font() -> Path | None:
    if FONT_CACHE.exists():
        return FONT_CACHE
    FONT_CACHE.parent.mkdir(parents=True, exist_ok=True)
    url = "https://github.com/google/fonts/raw/main/ofl/pinyonscript/PinyonScript-Regular.ttf"
    try:
        urllib.request.urlretrieve(url, FONT_CACHE)
        return FONT_CACHE
    except OSError:
        return None


def load_script_font(size: int) -> ImageFont.FreeTypeFont | ImageFont.ImageFont:
    pinyon = ensure_pinyon_font()
    candidates = [
        str(pinyon) if pinyon else "",
        "C:/Windows/Fonts/ITCEDSCR.TTF",
        "C:/Windows/Fonts/SCRIPTBL.TTF",
    ]
    for path in candidates:
        if path and Path(path).exists():
            return ImageFont.truetype(path, size=size)
    return ImageFont.load_default()


def is_burgundy(r: int, g: int, b: int) -> bool:
    return r > 95 and g < 95 and b < 95 and r > g + 30 and r > b + 30


def erase_script(img: Image.Image) -> tuple[int, int, int, int]:
    """Replace burgundy script pixels with cream; return text bounding box."""
    w, h = img.size
    px = img.load()
    min_x, min_y = w, h
    max_x, max_y = 0, 0

    y_start = int(h * 0.42)
    y_end = int(h * 0.82)

    for y in range(y_start, y_end):
        for x in range(w):
            r, g, b = px[x, y]
            if is_burgundy(r, g, b):
                px[x, y] = CREAM
                min_x = min(min_x, x)
                max_x = max(max_x, x)
                min_y = min(min_y, y)
                max_y = max(max_y, y)

    # Widen erase zone slightly so anti-aliased script edges disappear.
    pad = max(3, int(w * 0.006))
    for y in range(max(0, min_y - pad), min(h, max_y + pad + 1)):
        for x in range(max(0, min_x - pad), min(w, max_x + pad + 1)):
            r, g, b = px[x, y]
            if is_burgundy(r, g, b):
                px[x, y] = CREAM

    return min_x, min_y, max_x, max_y


def main() -> None:
    if not SRC.exists():
        raise SystemExit(f"Missing source artwork: {SRC}")

    src = Image.open(SRC).convert("RGB")
    scale = TARGET_WIDTH / src.width
    img = src.resize(
        (TARGET_WIDTH, int(src.height * scale)),
        Image.Resampling.LANCZOS,
    )
    w, h = img.size
    box = erase_script(img)
    draw = ImageDraw.Draw(img)

    font_size = int(w * 0.23)
    font = load_script_font(font_size)
    name = "Concordia"
    bbox = draw.textbbox((0, 0), name, font=font)
    text_w = bbox[2] - bbox[0]
    text_h = bbox[3] - bbox[1]

    min_x, min_y, max_x, max_y = box
    if max_y > min_y:
        target_cx = (min_x + max_x) / 2
        target_cy = (min_y + max_y) / 2
    else:
        target_cx = w / 2
        target_cy = h * 0.62

    x = target_cx - text_w / 2 - bbox[0]
    y = target_cy - text_h / 2 - bbox[1]

    draw.text((x, y), name, fill=BURGUNDY, font=font)

    img.save(OUT, optimize=True, quality=95)
    print(f"Wrote {OUT} ({w}x{h})")


if __name__ == "__main__":
    main()
