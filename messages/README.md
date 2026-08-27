# Messages

All site copy lives here. **Start with [`COPY.md`](../COPY.md)** in the repo root — file map, rules, and leftover-copy checklist.

| File | Page |
|------|------|
| `en.json` / `lt.json` | Nav, cart, footer, default SEO |
| `{locale}/home.json` | Homepage |
| `{locale}/product-original.json` | `/products/original` |
| `{locale}/reviews-page.json` | `/reviews` |

`{locale}` is `en` or `lt`. Change values, not keys. Preview with `bun run dev`, then `bun run i18n:check`.
