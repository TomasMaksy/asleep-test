import { describe, expect, test } from "bun:test";
import {
  createGaClientId,
  ga4SessionIdNumber,
  ga4StreamCookieName,
  googleIdentifiersFromCookies,
  parseGaClientId,
  parseGaSessionId,
} from "@/lib/tracking/google-ids";

describe("google identifiers", () => {
  test("reads the GA client id from the _ga cookie", () => {
    expect(parseGaClientId("GA1.1.123456789.987654321")).toBe(
      "123456789.987654321",
    );
  });

  test("reads GS1 and GS2 session ids", () => {
    expect(parseGaSessionId("GS1.1.1789387200.2.1.1789387800.0.0.0")).toBe(
      "1789387200",
    );
    expect(
      parseGaSessionId("GS2.1.s1789387200$o2$g1$t1789387800$j60$l0$h0"),
    ).toBe("1789387200");
  });

  test("uses the measurement id stream cookie", () => {
    expect(
      googleIdentifiersFromCookies(
        {
          _ga: "GA1.1.123456789.987654321",
          _ga_ABC123: "GS2.1.s1789387200$o1$g1$t1789387200$j60$l0$h0",
        },
        "G-ABC123",
      ),
    ).toEqual({
      clientId: "123456789.987654321",
      sessionId: "1789387200",
    });
    expect(ga4StreamCookieName("G-ABC123")).toBe("_ga_ABC123");
  });

  test("coerces session ids to the Measurement Protocol number schema", () => {
    expect(ga4SessionIdNumber("1789387200")).toBe(1789387200);
    expect(ga4SessionIdNumber("session")).toBeUndefined();
    expect(typeof ga4SessionIdNumber("1789387200")).toBe("number");
  });

  test("creates client ids in the gtag format", () => {
    expect(createGaClientId()).toMatch(/^\d{10}\.\d+$/);
  });
});
