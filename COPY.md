# Copy & translations

This site is bilingual: **Lithuanian (`lt`, default)** and **English (`en`)**.
Default LT URLs are unprefixed (`/products/original`). Other locales use a prefix (`/en/...`, future `/pl/...`).

All user-facing copy lives in JSON under `messages/`. You do not need to edit React files to change headlines, buttons, FAQs, or reviews.

## If you are using AI

Paste this at the start of the chat:

> Read `COPY.md` and `.cursor/rules/i18n.mdc`. Only edit files under `messages/`. Keep EN and LT keys identical. Do not change keys, ids, hrefs, image paths, prices, or layout numbers (`left`, `top`, `width`, `className`, `offset`). Keep ICU placeholders like `{amount}` and `{count}` unchanged. After edits, run `bun run i18n:check`.

Then say which page and locale you want to work on.

## File map

| File | What it is | Preview |
|------|------------|---------|
| `messages/en.json` / `messages/lt.json` | Shared chrome: nav, language names, cart, footer, default SEO title/description | Every page |
| `messages/{locale}/home.json` | Homepage sections: hero, products, bundles, floating review quotes, bedroom, promise, press, support | `/` and `/en` (also: `support` on PDP, `reviews` cards on `/reviews`) |
| `messages/{locale}/product-original.json` | Original mattress PDP: buy box, FAQs, layers, specs, compare, related | `/products/original`, `/en/products/original` (also: layers on home, specs FAQ on contact, hero bits in configurator) |
| `messages/{locale}/reviews-page.json` | Reviews page: hero, share form, carousel | `/reviews`, `/en/reviews` (also: carousel on PDP) |
| `messages/{locale}/contact.json` | Contact page | `/contact`, `/en/contact` |
| `messages/{locale}/configurator.json` | Mattress configurator | `/configurator`, `/en/configurator` |
| `messages/{locale}/checkout.json` | Fake-door checkout copy | `/checkout`, `/en/checkout` |
| `content/legal/{locale}/*.md` | Privacy, terms, warranty (long-form; **not** shipped in the global i18n bundle) | `/privacy`, `/terms`, `/warranty` |

`{locale}` is `lt` or `en`. Edit **both** when you change meaning — not only the language you are writing.

How UI chrome is wired: `src/i18n/request.ts` loads message JSON **per route** (homepage copy is not sent to checkout, etc.). Legal body copy is separate Markdown under `content/legal/` — see `content/legal/README.md`. Namespaces used in code (`hero`, `nav`, `productOriginal.hero`, …) stay the same, so you can rename a file’s *values* but not its *keys*.

## How to preview

```bash
bun install
bun run dev
```

The first `bun run dev` needs an internet connection so Next can download the Outfit font. After that it is cached.

- Lithuanian homepage: [http://localhost:3000/](http://localhost:3000/)
- English homepage: [http://localhost:3000/en](http://localhost:3000/en)
- Product: `/products/original` and `/en/products/original`
- Reviews: `/reviews` and `/en/reviews`
- Checkout: `/checkout` and `/en/checkout`
- Thank you: `/checkout/thank-you` and `/en/checkout/thank-you`
- Privacy: `/privacy` and `/en/privacy`
- Terms: `/terms` and `/en/terms`
- Warranty: `/warranty` and `/en/warranty`

The language switcher in the header jumps to the same path in the other locale.

After saving a JSON file, the page should hot-reload. If a string does not update, restart `bun run dev`.

## Hard rules

1. **Same keys in EN and LT.** Add or remove a key in one file, do it in the other too. Same for array length (FAQ items, review cards, feature bullets).
2. **Do not rename keys.** `hero.cta` must stay `hero.cta`. The app looks up keys, not English words.
3. **Do not translate keys** like `id`, `href`, `image`, `src`, `icon`, `variant`, `action`, `className`, `offset`, `left`, `top`, `width`, `logoWidth`, `logoHeight`. Those are layout or data, not copy. You *may* edit `label`, `title`, `body`, `quote`, `cta`, `alt`, `imageAlt`, `description`, `question`, `answer`.
4. **Keep placeholders.** Strings such as `"Save: {amount}"` / `"Sutaupote: {amount}"` must keep `{amount}` exactly. Same for `{price}`, `{count}`, `{name}`, `{title}`.
5. **Keep JSON valid.** Trailing commas will break the site. Quotes inside a string need `\"`, or use a JSON-aware editor.

Then run:

```bash
bun run i18n:check
```

That compares EN vs LT (keys, array lengths, placeholders) and warns about leftover lorem ipsum and the old “Matt” brand name.

## Brand and voice

- Brand name is **asleep**, not Matt / Matt Sleeps. A lot of product copy was ported from mattsleeps.com and still says “Matt”. Please replace those with asleep where it reads as the product/brand.
- Default market is Lithuania. Phone numbers, delivery times, “Consumentenbond”, “Baltics”, and Dutch press logos in `home.json` → `media` may need a Lithuania pass — flag anything that still feels NL/BE.
- `Consumentenbond` is the Dutch consumers’ association. Decide with the team whether to keep the award claim, localize the name, or swap for a Baltic equivalent.

## What still needs a copy pass

These are known leftovers, not bugs in the setup:

- **LT homepage products & bundles** still have lorem ipsum (`messages/lt/home.json`).
- **LT footer link labels** are still English (`messages/lt.json` → `footer.columns`).
- **“Matt”** appears in both locales on the product page (`messages/{locale}/product-original.json`) and in a couple of LT homepage promise paragraphs.
- **LT support phone** is still a Dutch `+31` number (`home.json` → `support`).
- **EN nav** has a “More” item to match LT “Daugiau”; both are `#` placeholders until menus exist.
- A few accessibility labels are still hardcoded English in components (cart quantity, mobile menu, “Mattress type”). Ignore those unless you are also touching code.

## Adding a new string

1. Add it to **both** locales, same key path.
2. If it is a one-off button on an existing page, put it in that page’s JSON.
3. If it is chrome (nav / cart / footer), put it in `messages/{locale}.json`.
4. If you are starting a **new marketing page** with a lot of short UI copy, add `messages/{locale}/your-page.json` and ask a developer to wire it in `src/i18n/load-messages.ts`.
5. If you are writing a **long legal / policy page**, edit Markdown under `content/legal/{locale}/` instead — do not put that body text in `messages/`.

Do not put user-facing sentences in `.tsx` files.

## ICU / interpolation examples

```json
"saveLabel": "Save: {amount}",
"installment": "Pay in 3 parts of {price}",
"ratingStar": "{count} stars",
"addLabel": "Add {name} to cart",
"selectLayer": "Show {title} details"
```

The `{...}` tokens are filled in by the app. Translating the words around them is fine; renaming the tokens is not.
