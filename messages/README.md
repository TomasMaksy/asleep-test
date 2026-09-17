# Messages

All site copy lives here. **Start with [`COPY.md`](../COPY.md)** in the repo root — file map, rules, and leftover-copy checklist.

| File | Page |
|------|------|
| `en.json` / `lt.json` | Nav, cart, footer, default SEO |
| `{locale}/home.json` | Homepage (+ `support` on PDP, `reviews` cards on `/reviews`) |
| `{locale}/product-original.json` | `/products/original` (+ layers on home, specs on contact) |
| `{locale}/reviews-page.json` | `/reviews` (+ carousel on PDP) |
| `{locale}/contact.json` | `/contact` |
| `{locale}/configurator.json` | `/configurator` |
| `{locale}/checkout.json` | `/checkout`, `/checkout/thank-you` |

Long legal/policy body copy is **not** here — edit `content/legal/{locale}/*.md` (see `content/legal/README.md`).

`{locale}` is `en` or `lt`. Change values, not keys. Preview with `bun run dev`, then `bun run i18n:check`.
