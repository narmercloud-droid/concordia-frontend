#!/usr/bin/env python3
"""Generate PWA / Apple touch icons from Concordia brand mark."""
from __future__ import annotations

from pathlib import Path

from PIL import Image

ROOT = Path(__file__).resolve().parents[1]
SRC = ROOT / "public" / "brand" / "concordia-mark-512.png"
OUT = ROOT / "public" / "brand"

SIZES = {
    "concordia-mark-192.png": 192,
    "apple-touch-icon.png": 180,
    "apple-touch-icon-152.png": 152,
    "apple-touch-icon-167.png": 167,
}


def main() -> None:
    if not SRC.is_file():
        raise SystemExit(f"Source icon not found: {SRC}")

    base = Image.open(SRC).convert("RGBA")
    for name, size in SIZES.items():
        base.resize((size, size), Image.Resampling.LANCZOS).save(OUT / name, optimize=True)
        print(f"wrote {name}")

    print("done")


if __name__ == "__main__":
    main()
