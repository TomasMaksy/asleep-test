import { describe, expect, test } from "bun:test";
import { isGoogleDebugMode } from "@/lib/tracking/google-debug";

describe("google debug mode", () => {
  test("is on for local development", () => {
    expect(isGoogleDebugMode({ NODE_ENV: "development" })).toBe(true);
  });

  test("is off for a production Node build with no Vercel env", () => {
    expect(isGoogleDebugMode({ NODE_ENV: "production" })).toBe(false);
  });

  test("treats Vercel previews as debug even though NODE_ENV is production", () => {
    expect(
      isGoogleDebugMode({
        NODE_ENV: "production",
        VERCEL_ENV: "preview",
      }),
    ).toBe(true);
    expect(
      isGoogleDebugMode({
        NODE_ENV: "production",
        NEXT_PUBLIC_VERCEL_ENV: "preview",
      }),
    ).toBe(true);
  });

  test("is off on Vercel production", () => {
    expect(
      isGoogleDebugMode({
        NODE_ENV: "production",
        VERCEL_ENV: "production",
        NEXT_PUBLIC_VERCEL_ENV: "production",
      }),
    ).toBe(false);
  });
});
