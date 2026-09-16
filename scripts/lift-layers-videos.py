"""Lift gray studio backdrops in the gallery layers animations.

Keeps the mattress (navy, foam, white top) and only raises the connected
studio field to the site surface color, then re-encodes at a higher CRF.

Usage:
  python3 scripts/lift-layers-videos.py
"""

from __future__ import annotations

import json
import subprocess
import tempfile
from pathlib import Path

import numpy as np
from PIL import Image
from scipy import ndimage

ROOT = Path(__file__).resolve().parents[1]
GALLERY = ROOT / "public/images/product-gallery"
SURFACE = 245
CHROMA_MAX = 28
LUMA_MIN = 170
LUMA_MAX = 232
SEED_TOL = 90
CRF = 18
THUMB_PX = 216

CLIPS = (
    {
        "src": GALLERY / "layers-animation.mp4",
        "poster": GALLERY / "layers-thumb.webp",
        "strip": GALLERY / "thumbs/layers.webp",
        "poster_at": 12.0,
    },
    {
        "src": GALLERY / "layers-animation-single.mp4",
        "poster": GALLERY / "layers-thumb-single.webp",
        "strip": GALLERY / "thumbs/layers-single.webp",
        "poster_at": 6.6,
    },
)


def probe(path: Path) -> dict[str, float | int]:
    raw = subprocess.check_output(
        [
            "ffprobe",
            "-v",
            "error",
            "-select_streams",
            "v:0",
            "-show_entries",
            "stream=width,height,r_frame_rate,nb_frames",
            "-of",
            "json",
            str(path),
        ]
    )
    stream = json.loads(raw)["streams"][0]
    num, den = stream["r_frame_rate"].split("/")
    return {
        "width": int(stream["width"]),
        "height": int(stream["height"]),
        "fps": float(num) / float(den),
        "frames": int(stream.get("nb_frames") or 0),
    }


def studio_mask(rgb: np.ndarray, seed: np.ndarray) -> np.ndarray:
    red = rgb[:, :, 0].astype(np.int16)
    green = rgb[:, :, 1].astype(np.int16)
    blue = rgb[:, :, 2].astype(np.int16)
    chroma = np.maximum(np.maximum(red, green), blue) - np.minimum(
        np.minimum(red, green), blue
    )
    luma = 0.2126 * red + 0.7152 * green + 0.0722 * blue
    dist = (
        np.abs(red - int(seed[0]))
        + np.abs(green - int(seed[1]))
        + np.abs(blue - int(seed[2]))
    )
    candidate = (
        (chroma <= CHROMA_MAX)
        & (luma >= LUMA_MIN)
        & (luma < LUMA_MAX)
        & (dist <= SEED_TOL)
    )
    border = np.zeros_like(candidate)
    border[0] = True
    border[-1] = True
    border[:, 0] = True
    border[:, -1] = True
    labeled, count = ndimage.label(candidate, structure=np.ones((3, 3), dtype=bool))
    keep = np.zeros(count + 1, dtype=bool)
    keep[np.unique(labeled[border & (labeled > 0)])] = True
    return keep[labeled]


def lift_frame(rgb: np.ndarray, seed: np.ndarray, offsets: np.ndarray) -> np.ndarray:
    mask = studio_mask(rgb, seed)
    out = rgb.astype(np.int16)
    out[mask] = np.clip(out[mask] + offsets, 0, 255)
    return out.astype(np.uint8)


def encode_clip(src: Path) -> None:
    info = probe(src)
    width = int(info["width"])
    height = int(info["height"])
    fps = info["fps"]
    frame_bytes = width * height * 3

    decoder = subprocess.Popen(
        [
            "ffmpeg",
            "-v",
            "error",
            "-i",
            str(src),
            "-f",
            "rawvideo",
            "-pix_fmt",
            "rgb24",
            "-",
        ],
        stdout=subprocess.PIPE,
    )
    assert decoder.stdout is not None

    first = decoder.stdout.read(frame_bytes)
    if len(first) != frame_bytes:
        raise SystemExit(f"could not read first frame of {src}")
    seed = np.frombuffer(first, dtype=np.uint8).reshape(height, width, 3)[0, 0].copy()
    offsets = np.array([SURFACE, SURFACE, SURFACE], dtype=np.int16) - seed.astype(
        np.int16
    )
    print(
        f"{src.name}: {width}x{height} @{fps:.2f}  seed={tuple(int(c) for c in seed)}  "
        f"offset={offsets.tolist()}"
    )

    with tempfile.NamedTemporaryFile(suffix=".mp4", delete=False) as tmp:
        dest = Path(tmp.name)

    encoder = subprocess.Popen(
        [
            "ffmpeg",
            "-y",
            "-v",
            "error",
            "-f",
            "rawvideo",
            "-pix_fmt",
            "rgb24",
            "-s",
            f"{width}x{height}",
            "-r",
            str(fps),
            "-i",
            "-",
            "-an",
            "-c:v",
            "libx264",
            "-preset",
            "medium",
            "-crf",
            str(CRF),
            "-pix_fmt",
            "yuv420p",
            "-colorspace",
            "bt709",
            "-color_primaries",
            "bt709",
            "-color_trc",
            "bt709",
            "-color_range",
            "tv",
            "-movflags",
            "+faststart",
            str(dest),
        ],
        stdin=subprocess.PIPE,
    )
    assert encoder.stdin is not None

    def write(frame: np.ndarray) -> None:
        encoder.stdin.write(np.ascontiguousarray(frame).tobytes())

    def as_frame(buf: bytes) -> np.ndarray:
        return np.frombuffer(buf, dtype=np.uint8).reshape(height, width, 3).copy()

    write(lift_frame(as_frame(first), seed, offsets))
    count = 1
    while True:
        buf = decoder.stdout.read(frame_bytes)
        if len(buf) != frame_bytes:
            break
        write(lift_frame(as_frame(buf), seed, offsets))
        count += 1
        if count % 100 == 0:
            print(f"  {count} frames")

    encoder.stdin.close()
    decoder_code = decoder.wait()
    encoder_code = encoder.wait()
    if decoder_code != 0 or encoder_code != 0:
        dest.unlink(missing_ok=True)
        raise SystemExit(f"ffmpeg failed decode={decoder_code} encode={encoder_code}")

    dest.replace(src)
    print(f"  wrote {count} frames  {src.stat().st_size / 1024 / 1024:.1f} MB")


def save_poster(src: Path, poster: Path, strip: Path, at: float) -> None:
    with tempfile.TemporaryDirectory() as tmp:
        frame = Path(tmp) / "frame.png"
        subprocess.run(
            [
                "ffmpeg",
                "-y",
                "-v",
                "error",
                "-ss",
                str(at),
                "-i",
                str(src),
                "-frames:v",
                "1",
                str(frame),
            ],
            check=True,
        )
        image = Image.open(frame).convert("RGB")
        image.save(poster, format="WEBP", quality=90, method=6)
        width, height = image.size
        side = min(width, height)
        left = (width - side) // 2
        top = int((height - side) * 0.68)
        square = image.crop((left, top, left + side, top + side)).resize(
            (THUMB_PX, THUMB_PX),
            Image.Resampling.LANCZOS,
        )
        strip.parent.mkdir(parents=True, exist_ok=True)
        square.save(strip, format="WEBP", quality=90, method=6)
        print(f"  poster {poster.name}  strip {strip.name}")


def main() -> None:
    for clip in CLIPS:
        encode_clip(clip["src"])
        save_poster(clip["src"], clip["poster"], clip["strip"], clip["poster_at"])


if __name__ == "__main__":
    main()
