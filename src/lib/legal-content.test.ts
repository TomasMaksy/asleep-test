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
  test("legal routes skip heavy page namespaces", async () => {
    const messages = await loadMessagesForPath("en", "/privacy");
    expect(messages).toHaveProperty("nav");
    expect(messages).toHaveProperty("footer");
    expect(messages).toHaveProperty("configuratorPage");
    expect(messages).not.toHaveProperty("hero");
    expect(messages).not.toHaveProperty("productOriginal");
    expect(messages).not.toHaveProperty("checkoutPage");
  });

  test("home loads homepage keys and product layers copy", async () => {
    const messages = await loadMessagesForPath("lt", "/");
    expect(messages).toHaveProperty("hero");
    expect(messages).toHaveProperty("productOriginal");
    expect(messages).not.toHaveProperty("checkoutPage");
  });

  test("PDP loads support + reviews carousel namespaces", async () => {
    const messages = await loadMessagesForPath("en", "/products/original");
    expect(messages).toHaveProperty("productOriginal");
    expect(messages).toHaveProperty("support");
    expect(messages).toHaveProperty("reviewsPage");
    expect(messages).not.toHaveProperty("hero");
    expect(messages).not.toHaveProperty("checkoutPage");
  });

  test("reviews page loads carousel + shared home review cards", async () => {
    const messages = await loadMessagesForPath("lt", "/reviews");
    expect(messages).toHaveProperty("reviewsPage");
    expect(messages).toHaveProperty("reviews");
    expect(messages).not.toHaveProperty("hero");
    expect(messages).not.toHaveProperty("productOriginal");
  });

  test("contact loads FAQ + product specs reuse", async () => {
    const messages = await loadMessagesForPath("en", "/contact");
    expect(messages).toHaveProperty("contactPage");
    expect(messages).toHaveProperty("productOriginal");
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
