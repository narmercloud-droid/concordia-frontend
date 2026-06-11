#!/usr/bin/env python3
"""Ken Burns loop for the homepage hero (animated WebP, no ffmpeg required)."""

from __future__ import annotations

from pathlib import Path

from PIL import Image

ROOT = Path(__file__).resolve().parents[1]
SRC = ROOT / "public/images/food/hero-pizzeria.jpg"
OUT = ROOT / "public/videos/hero-oven.webp"
FRAMES = 28
DURATION_MS = 130


def main() -> None:
    src = Image.open(SRC).convert("RGB")
    w, h = src.size
    frames: list[Image.Image] = []

    for i in range(FRAMES):
        t = i / max(FRAMES - 1, 1)
        scale = 1.0 + t * 0.14
        nw, nh = int(w * scale), int(h * scale)
        enlarged = src.resize((nw, nh), Image.Resampling.LANCZOS)
        left = (nw - w) // 2
        top = int((nh - h) * (0.28 + t * 0.08))
        top = max(0, min(top, nh - h))
        frames.append(enlarged.crop((left, top, left + w, top + h)))

    OUT.parent.mkdir(parents=True, exist_ok=True)
    frames[0].save(
        OUT,
        save_all=True,
        append_images=frames[1:],
        duration=DURATION_MS,
        loop=0,
        quality=80,
        method=6,
    )
    print(f"Wrote {OUT} ({len(frames)} frames)")


if __name__ == "__main__":
    main()
