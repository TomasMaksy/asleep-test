import { describe, expect, test } from "bun:test";
import { loadMessagesForPath } from "@/i18n/load-messages";
import { getLegalDocument } from "@/lib/legal-content";
import { stripLocalePrefix } from "@/lib/request-pathname";

describe("stripLocalePrefix", () => {
  test("strips en and legacy lt prefixes", () => {
    expect(stripLocalePrefix("/privacy")).toBe("/privacy");
    expect(stripLocalePrefix("/en/privacy")).toBe("/privacy");
    expect(stripLocalePrefix("/lt/terms")).toBe("/terms");
    expect(stripLocalePrefix("/en")).toBe("/");
  });
});

describe("loadMessagesForPath", () => {
  test("loads the full catalog for every path (soft-nav safe)", async () => {
    for (const path of ["/", "/products/original", "/privacy", "/checkout"]) {
      const messages = await loadMessagesForPath("en", path);
      expect(messages).toHaveProperty("nav");
      expect(messages).toHaveProperty("hero");
      expect(messages).toHaveProperty("productOriginal");
      expect(messages).toHaveProperty("reviewsPage");
      expect(messages).toHaveProperty("contactPage");
      expect(messages).toHaveProperty("configuratorPage");
      expect(messages).toHaveProperty("checkoutPage");
      expect(messages).toHaveProperty("support");
    }
  });

  test("null pathname still loads the full catalog", async () => {
    const messages = await loadMessagesForPath("lt", null);
    expect(messages).toHaveProperty("hero");
    expect(messages).toHaveProperty("checkoutPage");
  });
});

describe("getLegalDocument", () => {
  test("parses frontmatter, intro, and accordion sections", async () => {
    const doc = await getLegalDocument("warranty", "en");
    expect(doc.title).toBe("Warranty");
    expect(doc.intro.length).toBeGreaterThan(40);
    expect(doc.sections.length).toBeGreaterThan(3);
    expect(doc.sections[0]?.title.toLowerCase()).toContain("expires");
  });

  test("loads both locales for privacy", async () => {
    const en = await getLegalDocument("privacy", "en");
    const lt = await getLegalDocument("privacy", "lt");
    expect(en.sections.length).toBe(lt.sections.length);
  });
});
