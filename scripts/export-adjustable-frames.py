from pathlib import Path

from PIL import Image

SRC = Path("/Users/tomaksy/Desktop/0. Maksy/3. asleep.lt/Assets/image sequence")
DST = Path("public/images/original-scroll/adjustable")
CROP = (384, 192, 1531, 979)
WIDTH = 1146
HEIGHT = 786

DST.mkdir(parents=True, exist_ok=True)
files = sorted(SRC.glob("*.webp"))
if len(files) != 265:
    raise SystemExit(f"expected 265 frames, found {len(files)}")

total = 0
for index, path in enumerate(files):
    with Image.open(path) as im:
        frame = im.convert("RGBA").crop(CROP).resize(
            (WIDTH, HEIGHT),
            Image.Resampling.LANCZOS,
        )
        out = DST / f"{index:03d}.webp"
        frame.save(out, format="WEBP", quality=82, method=6, exact=True)
        total += out.stat().st_size
    if index % 40 == 0 or index == len(files) - 1:
        print(f"{index:03d}/{len(files) - 1}")

print(f"wrote {len(files)} frames, {total / 1024 / 1024:.2f} MB")
