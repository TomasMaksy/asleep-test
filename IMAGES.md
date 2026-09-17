# Images & media

All static media lives under `public/images/`. Prefer **descriptive kebab-case names** that say *what* the asset is and *where* it belongs — never Codex exports, timestamps, or opaque numbered dumps (`laag1`, `IMG_0234`, `Codex Image 15 Sept…`).

After replacing a file that is already referenced, bump `STATIC_IMAGE_CACHE_VERSION` in `src/lib/static-image-url.ts` when the consumer uses `staticImageUrl`, or change the filename if `next/image` is caching an old path.

## Naming

| Pattern | Example | Use for |
|---------|---------|---------|
| `{surface}-{subject}.{ext}` | `cover-corner.webp` | Still that belongs to one UI surface |
| `{surface}-{subject}-{variant}.{ext}` | `product-unpack-reverse.webm` | Forward/reverse, locale, size |
| `slice-{layer}.webp` | `slice-memory-foam.webp` | Exploded mattress stack layers |

Formats: **webp** for photos/UI stills, **webm + hevc mp4** for transparent video, **mp4 (h264)** for opaque UI video.

## Size targets (this UI is not huge)

Layer detail media sits in ~`aspect-video` panels (~400–700px CSS wide). Homepage unpack sits under ~500px. Prefer encoding for **~2× that**, not 1080p/4K.

| Kind | Target | Notes |
|------|--------|-------|
| Layer detail video | ≤960×540, H.264, CRF ~27 | Looping muted clips |
| Layer posters | ≤800×450 webp | Tiny posters are fine |
| Cover / still details | ≤1000px on long edge, webp | |
| Stack slices | ≤1600–2300px wide webp | Retina on `~60vw` stack; keep files small |
| Transparent unpack | ~720 wide VP9 webm + HEVC mp4 | Alpha required; Safari HEVC will be larger |

## Adding a new asset

| Path | What it is | Used on |
|------|------------|---------|
| `public/images/product-layers/` | PDP layer explorer: stack slices, layer detail stills/videos | `/products/original` layers section |
| `public/images/product-gallery/` | PDP media gallery (hero, lifestyle, sizes, add-ons) | Original product gallery / buy box |
| `public/images/product-specs/` | Specs / firmness stills | Original PDP |
| `public/images/product-difference/` | “Why asleep” loop videos | Home / difference section |
| `public/images/configurator/` | Configurator stills (intro posters, marketing section) | `/configurator` |
| `public/configurator/single/` | Single mattress stage videos (VP9 webm + HEVC mp4, ~1280×1520) | Configurator |
| `public/configurator/double/` | Double mattress stage videos (VP9 webm + HEVC mp4, ~1280×1520) | Configurator |
| `public/images/reviews/` | Review page media | `/reviews` |
| `public/images/logo/`, `icons/`, `payments/`, `media/` | Chrome, icons, press logos | Global |

## `logo/` catalog

| File | Shows | Used on |
|------|-------|---------|
| `asleep-logo.svg` | Monochrome asleep wordmark (`fill=currentColor`) | Header/footer `Logo` (inlined); prefer this over PNGs |
| `asleep-white.png` | White wordmark PNG (legacy, 1304×417) | Reviews hero badge |
| `asleep-blue.png` | Navy wordmark PNG (legacy) | Unused after SVG switch (kept for now) |
| `asleep-black.png` | Near-black wordmark PNG (legacy) | Home reviews source mark; reviews page messages |

Root-level product packshots used on the homepage:

| File | Shows | Used on |
|------|-------|---------|
| `product-unpack.{webm,mp4,webp}` (+ `-reverse`) | Original mattress unpack / peel animation (alpha) | Home products card — Original (video + poster / messages image) |
| `product-hybrid.webp` | Custom / hybrid mattress corner packshot (alpha) | Home products card — Sukurk savo |
| `bedroom-wide.webp` | Bedroom lifestyle (asleep) | Home bedroom grid hero tile |
| `trust-badges.webp` | LT trust / awards strip (972×342), shared for all locales | Home hero + PDP purchase extras |
| `13-time-award.webp` | EN “Best tested / 13-time winner” badge | PDP gallery corner (`en`) |
| `13-time-award-lt.webp` | LT “Geriausias iš testų” badge | PDP gallery corner (`lt`) |

## `seo/` catalog

| File | Shows | Used on |
|------|-------|---------|
| `og-default.webp` | Lifestyle bedroom, asleep logo on mattress (1200×630) | Default Open Graph / Twitter + PDP share |
| `og-brand.webp` | Campaign shot with large asleep wordmark (1200×630) | Kept for brand/campaign use; not default OG |

## `product-gallery/` (SEO-relevant)

| File | Shows | Used on |
|------|-------|---------|
| `hero-square.webp` | Original lifestyle with **asleep** logo | PDP gallery hero; Product JSON-LD; configurator cart line |

## `product-layers/` catalog

| File | Shows | Wired as |
|------|-------|----------|
| `slice-tencel.webp` | Top TENCEL™ cover strip in the exploded stack | `SLICES` → `tencel` |
| `slice-hypersupport.webp` | Hypersupport foam strip | `SLICES` → `hypersupport` |
| `slice-memory-foam.webp` | Memory foam strip | `SLICES` → `memoryFoam` |
| `slice-cold-foam-soft.webp` | Soft cold-foam strip | `SLICES` → `coldFoamSoft` |
| `slice-cold-foam-firm.webp` | Firm cold-foam strip | `SLICES` → `coldFoamFirm` |
| `slice-non-slip.webp` | Non-slip base strip (+ cover hotspot) | `SLICES` → `nonSlip` |
| `slice-stack-base.webp` | Stack underside plate under the slices | Layers stack chrome |
| `cover-corner.webp` | Cover fabric corner close-up (asleep logo) | Layer detail → `cover` (“Užvalkalas”) |
| `non-slip.webp` | Non-slip underside detail still | Layer detail → `nonSlip` |
| `tencel.{mp4,webp}` | TENCEL detail video + poster | Layer detail → `tencel` |
| `memory-foam.{mp4,webp}` | Memory foam detail video + poster | Layer detail → `memoryFoam` |
| `hypersupport.{mp4,webp}` | Hypersupport detail video + poster | Layer detail → `hypersupport` |
| `cold-foam-soft.{mp4,webp}` | Soft cold-foam detail | Layer detail → `coldFoamSoft` |
| `cold-foam-firm.{mp4,webp}` | Firm cold-foam detail | Layer detail → `coldFoamFirm` |

Code entry point: `src/app/[locale]/products/original/sections/product-layers.tsx` (`SLICES` + `MEDIA`).

## `configurator/` catalog

| File | Shows | Used on |
|------|-------|---------|
| `intro-single.webp` | Closed single mattress (opening clip frame 0, lossless alpha, 1280×1520) | Configurator size-step still + video cover |
| `intro-double.webp` | Closed double mattress (opening clip frame 0, lossless alpha, 1280×1280) | Configurator size-step still + video cover |
| `section.webp` | Marketing still of the configurator mattress | PDP “create your mattress” section |
| `section-shadow.png` | Soft shadow under the section still | PDP configurator section |

## Adding a new asset

1. Drop it under the matching folder with a descriptive name (see table above).
2. Point the React / messages `src` / `image` path at that file.
3. Document the row in this file.
4. Bump `STATIC_IMAGE_CACHE_VERSION` if needed for hot-reload while `bun dev` is running.
