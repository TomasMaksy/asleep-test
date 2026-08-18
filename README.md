# Asleep

Next.js App Router recreation of [mattsleeps.com/en](https://www.mattsleeps.com/en), with lorem ipsum copy. Package manager is **Bun**.

## Commands

```bash
bun install
bun run dev
bun run lint
bun run format
bun run build
```

Open [http://localhost:3000](http://localhost:3000) for the homepage.

Open [http://localhost:3000/compare](http://localhost:3000/compare) to compare our page against a captured screenshot of the original (split, overlay, and difference blend).

## Structure

A page is assembled from sections; sections are assembled from components. Almost everything is a server component.
