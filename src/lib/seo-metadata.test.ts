import { describe, expect, test } from "bun:test";
import { localePath } from "@/lib/seo-metadata";

describe("localePath", () => {
  test("omits prefix for default Lithuanian", () => {
    expect(localePath("lt")).toBe("");
    expect(localePath("lt", "/")).toBe("");
    expect(localePath("lt", "/products/original")).toBe("/products/original");
  });

  test("prefixes non-default locales", () => {
    expect(localePath("en")).toBe("/en");
    expect(localePath("en", "/")).toBe("/en");
    expect(localePath("en", "/products/original")).toBe(
      "/en/products/original",
    );
  });
});
