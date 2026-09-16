"""Encode size packshots from the Angle_01 PNG export.

Lifts the gray studio backdrop to the site surface color, then writes
high-quality WebPs.

Usage:
  python3 scripts/encode-size-packshots.py "/Users/tomaksy/Downloads/1 2"
"""

from __future__ import annotations

import re
import subprocess
import sys
import tempfile
from collections import deque
from pathlib import Path

from PIL import Image

ROOT = Path(__file__).resolve().parents[1]
SIZES_DIR = ROOT / "public/images/product-gallery/sizes"
THUMBS_DIR = ROOT / "public/images/product-gallery/thumbs/sizes"
NAME_RE = re.compile(r"(\d+)_(\d+)$")
THUMB_SIZE = 216
SURFACE = 245


def size_id(path: Path) -> str:
    match = NAME_RE.search(path.stem)
    if not match:
        raise SystemExit(f"cannot parse size from {path.name}")
    return f"{match.group(1)}x{match.group(2)}"


def is_studio(pixel: tuple[int, int, int]) -> bool:
    red, green, blue = pixel
    chroma = max(red, green, blue) - min(red, green, blue)
    if chroma > 28:
        return False
    luma = 0.2126 * red + 0.7152 * green + 0.0722 * blue
    return luma < 240


def lift_studio(image: Image.Image) -> Image.Image:
    rgb = image.convert("RGB")
    width, height = rgb.size
    pixels = rgb.load()
    seed = pixels[0, 0]
    offsets = [SURFACE - seed[0], SURFACE - seed[1], SURFACE - seed[2]]

    visited = bytearray(width * height)
    queue: deque[tuple[int, int]] = deque()

    def index(x: int, y: int) -> int:
        return y * width + x

    def try_seed(x: int, y: int) -> None:
        if is_studio(pixels[x, y]) and not visited[index(x, y)]:
            visited[index(x, y)] = 1
            queue.append((x, y))

    for x in range(width):
        try_seed(x, 0)
        try_seed(x, height - 1)
    for y in range(height):
        try_seed(0, y)
        try_seed(width - 1, y)

    while queue:
        x, y = queue.popleft()
        if x > 0 and not visited[index(x - 1, y)] and is_studio(pixels[x - 1, y]):
            visited[index(x - 1, y)] = 1
            queue.append((x - 1, y))
        if x + 1 < width and not visited[index(x + 1, y)] and is_studio(
            pixels[x + 1, y]
        ):
            visited[index(x + 1, y)] = 1
            queue.append((x + 1, y))
        if y > 0 and not visited[index(x, y - 1)] and is_studio(pixels[x, y - 1]):
            visited[index(x, y - 1)] = 1
            queue.append((x, y - 1))
        if y + 1 < height and not visited[index(x, y + 1)] and is_studio(
            pixels[x, y + 1]
        ):
            visited[index(x, y + 1)] = 1
            queue.append((x, y + 1))

    lifted = rgb.copy()
    dest = lifted.load()
    for y in range(height):
        row = y * width
        for x in range(width):
            pixel = pixels[x, y]
            if visited[row + x] or is_studio(pixel):
                dest[x, y] = (
                    max(0, min(255, pixel[0] + offsets[0])),
                    max(0, min(255, pixel[1] + offsets[1])),
                    max(0, min(255, pixel[2] + offsets[2])),
                )
    return lifted


def encode_webp(src: Path, dest: Path, quality: int) -> None:
    dest.parent.mkdir(parents=True, exist_ok=True)
    subprocess.run(
        [
            "cwebp",
            "-q",
            str(quality),
            "-m",
            "6",
            "-mt",
            "-af",
            "-sharp_yuv",
            str(src),
            "-o",
            str(dest),
        ],
        check=True,
        capture_output=True,
    )


def encode_thumb(image: Image.Image, dest: Path) -> None:
    dest.parent.mkdir(parents=True, exist_ok=True)
    background = image.getpixel((0, 0))
    fitted = Image.new("RGB", (THUMB_SIZE, THUMB_SIZE), background)
    frame = image.copy()
    frame.thumbnail((THUMB_SIZE, THUMB_SIZE), Image.Resampling.LANCZOS)
    fitted.paste(
        frame,
        ((THUMB_SIZE - frame.width) // 2, (THUMB_SIZE - frame.height) // 2),
    )
    fitted.save(dest, format="WEBP", quality=90, method=6)


def main() -> None:
    source_dir = Path(sys.argv[1] if len(sys.argv) > 1 else "").expanduser()
    if not source_dir.is_dir():
        raise SystemExit("pass the folder of Angle_01_*.png files")

    pngs = sorted(source_dir.glob("Angle_01_*.png"))
    if not pngs:
        raise SystemExit(f"no Angle_01_*.png files in {source_dir}")

    with tempfile.TemporaryDirectory() as tmp:
        tmp_dir = Path(tmp)
        for png in pngs:
            sku = size_id(png)
            with Image.open(png) as source:
                lifted = lift_studio(source)
            lifted_path = tmp_dir / f"{sku}.png"
            lifted.save(lifted_path, format="PNG")
            full = SIZES_DIR / f"{sku}.webp"
            thumb = THUMBS_DIR / f"{sku}.webp"
            encode_webp(lifted_path, full, 92)
            encode_thumb(lifted, thumb)
            print(
                f"{sku:8}  {png.stat().st_size / 1024 / 1024:5.1f} MB PNG  →  "
                f"{full.stat().st_size / 1024:6.1f} KB  /  "
                f"thumb {thumb.stat().st_size / 1024:4.1f} KB"
            )


if __name__ == "__main__":
    main()
