# Asleep

Next.js App Router site for Asleep.lt. Package manager is **Bun**.

## Copy / translations

Working on headlines, CTAs, FAQs, or reviews? You only need the JSON files under `messages/`.

**Read [COPY.md](./COPY.md) first.** It maps every file to a page, lists the rules (same keys in LT and EN, placeholders, what not to touch), and the leftover lorem / “Matt” checklist.

```bash
bun run i18n:check
```

## Commands

```bash
bun install
bun run dev
bun run lint
bun run format
bun run build
bun run i18n:check
```

Open [http://localhost:3000](http://localhost:3000) for the homepage.

Open [http://localhost:3000/compare](http://localhost:3000/compare) to compare our page against a captured screenshot of the original (split, overlay, and difference blend).

## Structure

A page is assembled from sections; sections are assembled from components. Almost everything is a server component.
