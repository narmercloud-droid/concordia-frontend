#!/usr/bin/env python3
"""Build tiered people crop and spelling-correct full logo PNGs from v20 artwork."""

from __future__ import annotations

from pathlib import Path

from PIL import Image, ImageDraw, ImageFont

ROOT = Path(__file__).resolve().parents[1]
SRC = ROOT / "public/images/concordia-logo-v20-final.png"
OUT_DIR = ROOT / "public/images"
PEOPLE_HEIGHT_RATIO = 0.52
CREAM = (250, 248, 245)
BURGUNDY = (139, 26, 43)
GREEN = (45, 90, 61)


def load_font(size: int, bold: bool = False) -> ImageFont.FreeTypeFont | ImageFont.ImageFont:
    candidates = [
        "C:/Windows/Fonts/georgiab.ttf" if bold else "C:/Windows/Fonts/georgiai.ttf",
        "C:/Windows/Fonts/timesbd.ttf" if bold else "C:/Windows/Fonts/timesi.ttf",
        "/usr/share/fonts/truetype/dejavu/DejaVuSerif-Bold.ttf"
        if bold
        else "/usr/share/fonts/truetype/dejavu/DejaVuSerif-Italic.ttf",
    ]
    for path in candidates:
        if Path(path).exists():
            return ImageFont.truetype(path, size=size)
    return ImageFont.load_default()


def crop_people(src: Image.Image) -> Image.Image:
    w, h = src.size
    crop_h = int(h * PEOPLE_HEIGHT_RATIO)
    return src.crop((0, 0, w, crop_h))


def build_full_logo(people: Image.Image, tagline: str) -> Image.Image:
    w, people_h = people.size
    text_band = int(people_h * 0.62)
    canvas = Image.new("RGB", (w, people_h + text_band), CREAM)
    canvas.paste(people, (0, 0))

    draw = ImageDraw.Draw(canvas)
    name_font = load_font(int(w * 0.11), bold=False)
    restaurant_font = load_font(int(w * 0.028), bold=True)
    tag_font = load_font(int(w * 0.018), bold=False)

    name = "Concordia"
    restaurant = "RESTAURANT"
    y = people_h + int(text_band * 0.08)

    name_bbox = draw.textbbox((0, 0), name, font=name_font)
    name_w = name_bbox[2] - name_bbox[0]
    draw.text(((w - name_w) / 2, y), name, fill=BURGUNDY, font=name_font)

    y += int(text_band * 0.34)
    rest_bbox = draw.textbbox((0, 0), restaurant, font=restaurant_font)
    rest_w = rest_bbox[2] - rest_bbox[0]
    draw.text(((w - rest_w) / 2, y), restaurant, fill=GREEN, font=restaurant_font)

    y += int(text_band * 0.22)
    tag_bbox = draw.textbbox((0, 0), tagline, font=tag_font)
    tag_w = tag_bbox[2] - tag_bbox[0]
    draw.text(((w - tag_w) / 2, y), tagline, fill=GREEN, font=tag_font)

    return canvas


def main() -> None:
    if not SRC.exists():
        raise SystemExit(f"Missing source artwork: {SRC}")

    src = Image.open(SRC).convert("RGB")
    people = crop_people(src)

    people_path = OUT_DIR / "concordia-logo-people-tiered.png"
    people.save(people_path, optimize=True)

    tagline = "DEUTSCHE HERZLICHKEIT • ITALIENISCHE LEIDENSCHAFT"
    full = build_full_logo(people, tagline)

    for name in ("concordia-logo-hero.png", "concordia-logo.png"):
        out = OUT_DIR / name
        full.save(out, optimize=True)
        print(f"Wrote {out} ({full.size[0]}x{full.size[1]})")

    print(f"Wrote {people_path} ({people.size[0]}x{people.size[1]})")


if __name__ == "__main__":
    main()
