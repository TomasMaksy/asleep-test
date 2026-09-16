# asleep

Next.js App Router site for asleep.lt. Package manager is **Bun**.

## Copy / translations

Working on headlines, CTAs, FAQs, or reviews? You only need the JSON files under `messages/`.

**Read [COPY.md](./COPY.md) first.** It maps every file to a page, lists the rules (same keys in LT and EN, placeholders, what not to touch), and the leftover lorem / “Matt” checklist.

Working on photos, packshots, or layer media? **Read [IMAGES.md](./IMAGES.md)** — folder map, naming rules, and which file feeds which UI.

```bash
bun run i18n:check
```

## Commands

```bash
bun install
bun run dev
bun run server
bun run lint
bun run format
bun run build
bun run i18n:check
```

Open [http://localhost:3000](http://localhost:3000) for the homepage.

`bun run server` starts ngrok against port 3000 using `NEXT_PUBLIC_BASE_HOST`
from `.env.local`. Keep `bun run dev` running in another terminal.

## Structure

A page is assembled from sections; sections are assembled from components. Almost everything is a server component.
