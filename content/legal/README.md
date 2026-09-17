# Legal pages (`content/legal/`)

Long-form legal copy lives here — **not** in `messages/`. That keeps privacy/terms/warranty text out of the global next-intl bundle and off pages that do not need it.

## Files

| Page | EN | LT | URL |
|------|----|----|-----|
| Privacy | `en/privacy.md` | `lt/privacy.md` | `/privacy`, `/en/privacy` |
| Terms | `en/terms.md` | `lt/terms.md` | `/terms`, `/en/terms` |
| Warranty | `en/warranty.md` | `lt/warranty.md` | `/warranty`, `/en/warranty` |

Edit **both** locales when you change meaning. Keep the same `##` section headings in both files (titles may be translated).

## Format

```md
---
title: Page title
description: SEO / meta description
---

Optional intro paragraphs above the accordion.

## Section title

Paragraphs, **bold**, [links](/contact), and lists:

- Bullet one
- Bullet two

1. Numbered one
2. Numbered two
```

- YAML frontmatter → page `<title>` / meta description
- Text before the first `##` → intro under the H1
- Each `##` → one accordion row (Matt Sleeps–style)

Supported inline/body markdown: paragraphs, `-` / `*` bullets, `1.` lists, `**bold**`, `*italic*`, `[label](/path)` or external URLs.

After saving, refresh the page (restart `bun run dev` if needed).
