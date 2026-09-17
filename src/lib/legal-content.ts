import { readFile } from "node:fs/promises";
import path from "node:path";
import { cache } from "react";
import { routing } from "@/i18n/routing";

export type LegalSlug = "privacy" | "terms" | "warranty";

export type LegalSection = {
  id: string;
  title: string;
  /** Markdown body under the `##` heading. */
  body: string;
};

export type LegalDocument = {
  slug: LegalSlug;
  locale: string;
  title: string;
  description: string;
  /** Markdown above the first `##` (optional intro). */
  intro: string;
  sections: LegalSection[];
};

const CONTENT_ROOT = path.join(process.cwd(), "content/legal");

function slugify(title: string) {
  return title
    .toLowerCase()
    .normalize("NFKD")
    .replace(/[^\w\s-]/g, "")
    .trim()
    .replace(/[\s_-]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

function parseFrontmatter(raw: string): {
  data: Record<string, string>;
  body: string;
} {
  const match = raw.match(/^---\r?\n([\s\S]*?)\r?\n---\r?\n?([\s\S]*)$/);
  if (!match) {
    return { data: {}, body: raw };
  }

  const data: Record<string, string> = {};
  for (const line of match[1].split(/\r?\n/)) {
    const idx = line.indexOf(":");
    if (idx === -1) continue;
    const key = line.slice(0, idx).trim();
    let value = line.slice(idx + 1).trim();
    if (
      (value.startsWith('"') && value.endsWith('"')) ||
      (value.startsWith("'") && value.endsWith("'"))
    ) {
      value = value.slice(1, -1);
    }
    data[key] = value;
  }

  return { data, body: match[2] };
}

function parseSections(body: string): {
  intro: string;
  sections: LegalSection[];
} {
  const lines = body.replace(/\r\n/g, "\n").split("\n");
  const sections: LegalSection[] = [];
  let introLines: string[] = [];
  let currentTitle: string | null = null;
  let currentBody: string[] = [];

  const flush = () => {
    if (currentTitle === null) return;
    sections.push({
      id: slugify(currentTitle) || `section-${sections.length + 1}`,
      title: currentTitle,
      body: currentBody.join("\n").trim(),
    });
    currentBody = [];
  };

  for (const line of lines) {
    const heading = line.match(/^##\s+(.+)$/);
    if (heading) {
      if (currentTitle === null) {
        introLines = currentBody;
      } else {
        flush();
      }
      currentTitle = heading[1].trim();
      currentBody = [];
      continue;
    }

    currentBody.push(line);
  }

  if (currentTitle === null) {
    return { intro: currentBody.join("\n").trim(), sections: [] };
  }

  flush();
  return { intro: introLines.join("\n").trim(), sections };
}

async function readLegalMarkdown(slug: LegalSlug, locale: string) {
  const filePath = path.join(CONTENT_ROOT, locale, `${slug}.md`);
  try {
    return await readFile(filePath, "utf8");
  } catch {
    return null;
  }
}

export const getLegalDocument = cache(
  async (slug: LegalSlug, locale: string): Promise<LegalDocument> => {
    const resolvedLocale = routing.locales.includes(
      locale as (typeof routing.locales)[number],
    )
      ? locale
      : routing.defaultLocale;

    const raw =
      (await readLegalMarkdown(slug, resolvedLocale)) ??
      (resolvedLocale !== routing.defaultLocale
        ? await readLegalMarkdown(slug, routing.defaultLocale)
        : null);

    if (!raw) {
      throw new Error(`Missing legal document: ${slug} (${resolvedLocale})`);
    }

    const { data, body } = parseFrontmatter(raw);
    const { intro, sections } = parseSections(body);

    return {
      slug,
      locale: resolvedLocale,
      title: data.title ?? slug,
      description: data.description ?? "",
      intro,
      sections,
    };
  },
);
