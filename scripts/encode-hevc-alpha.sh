#!/usr/bin/env bash
# Safari-quality transparent video:
#   VP9 WebM (Chrome/Firefox) stays as-is.
#   HEVC-with-alpha MP4 is encoded via ProRes 4444 → Apple avconvert
#   so WebKit gets a real premultiplied matte instead of a dark fringe.
set -euo pipefail

root="$(cd "$(dirname "$0")/.." && pwd)"
cd "$root"

find public -name "*.webm" -print0 |
  xargs -0 -P 2 -I{} sh -c '
    set -e
    webm="$1"
    mp4="${webm%.webm}.mp4"
    old_mov="${webm%.webm}.mov"
    slug="$(basename "$webm" .webm)"
    tmp="/tmp/asleep-pr-$$-$slug.mov"
    echo "HEVC  $webm"
    ffmpeg -y -hide_banner -loglevel error \
      -c:v libvpx-vp9 -i "$webm" \
      -c:v prores_ks -profile:v 4444 -pix_fmt yuva444p10le -an \
      "$tmp"
    avconvert --source "$tmp" --output "$mp4" \
      --preset PresetHEVCHighestQualityWithAlpha --replace >/dev/null
    rm -f "$tmp" "$old_mov"
  ' _ {}

echo "done"
