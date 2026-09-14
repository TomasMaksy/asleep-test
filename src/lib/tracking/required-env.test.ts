import { describe, expect, test } from "bun:test";
import {
  assertTrackingEnvForBuild,
  missingTrackingEnv,
} from "@/lib/tracking/required-env";

const complete = {
  NEXT_PUBLIC_POSTHOG_PROJECT_TOKEN: "phc_test",
  NEXT_PUBLIC_META_PIXEL_ID: "123",
  META_CONVERSIONS_API_TOKEN: "token",
  NEXT_PUBLIC_GA4_MEASUREMENT_ID: "G-TEST",
  GA4_MEASUREMENT_PROTOCOL_SECRET: "secret",
} as NodeJS.ProcessEnv;

describe("tracking env", () => {
  test("lists missing required names", () => {
    expect(missingTrackingEnv({})).toEqual([
      "NEXT_PUBLIC_POSTHOG_PROJECT_TOKEN",
      "NEXT_PUBLIC_META_PIXEL_ID",
      "META_CONVERSIONS_API_TOKEN",
      "NEXT_PUBLIC_GA4_MEASUREMENT_ID",
      "GA4_MEASUREMENT_PROTOCOL_SECRET",
    ]);
  });

  test("accepts the PostHog key alias", () => {
    expect(
      missingTrackingEnv({
        ...complete,
        NEXT_PUBLIC_POSTHOG_PROJECT_TOKEN: "",
        NEXT_PUBLIC_POSTHOG_KEY: "phc_alias",
      }),
    ).toEqual([]);
  });

  test("does not throw in development when values are missing", () => {
    const warn = console.warn;
    console.warn = () => undefined;
    try {
      expect(() =>
        assertTrackingEnvForBuild({
          NODE_ENV: "development",
        } as NodeJS.ProcessEnv),
      ).not.toThrow();
    } finally {
      console.warn = warn;
    }
  });

  test("throws on production builds when values are missing", () => {
    expect(() =>
      assertTrackingEnvForBuild({
        NODE_ENV: "production",
      } as NodeJS.ProcessEnv),
    ).toThrow(/NEXT_PUBLIC_GA4_MEASUREMENT_ID/);
  });

  test("throws on Vercel production when the Meta test code is set", () => {
    expect(() =>
      assertTrackingEnvForBuild({
        ...complete,
        NODE_ENV: "production",
        VERCEL_ENV: "production",
        META_TEST_EVENT_CODE: "TEST123",
      }),
    ).toThrow(/META_TEST_EVENT_CODE/);
  });

  test("allows a complete production config", () => {
    expect(() =>
      assertTrackingEnvForBuild({
        ...complete,
        NODE_ENV: "production",
        VERCEL_ENV: "production",
      }),
    ).not.toThrow();
  });
});
