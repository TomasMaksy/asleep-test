import { describe, expect, test } from "bun:test";
import {
  cookieDomainAttribute,
  resolveMetaFbc,
  resolveMetaFbp,
} from "@/lib/tracking/client/meta-clicks";

describe("Meta click IDs", () => {
  test("prefers Pixel _fbc over a minted asleep_fbc", () => {
    expect(
      resolveMetaFbc({
        pixelFbc: "fb.1.2000.Abc",
        storedFbc: "fb.1.1000.Abc",
        fbclid: "Abc",
        now: 3000,
      }),
    ).toBe("fb.1.2000.Abc");
  });

  test("keeps the stored fbc until Pixel writes _fbc", () => {
    expect(
      resolveMetaFbc({
        storedFbc: "fb.1.1000.Abc",
        fbclid: "Abc",
        now: 3000,
      }),
    ).toBe("fb.1.1000.Abc");
  });

  test("mints fbc from fbclid when nothing is stored", () => {
    expect(
      resolveMetaFbc({
        fbclid: "Abc",
        now: 3000,
      }),
    ).toBe("fb.1.3000.Abc");
  });

  test("replaces stored fbc when fbclid changes", () => {
    expect(
      resolveMetaFbc({
        storedFbc: "fb.1.1000.Old",
        fbclid: "New",
        now: 3000,
      }),
    ).toBe("fb.1.3000.New");
  });

  test("prefers Pixel _fbp and otherwise mints a stable fallback", () => {
    expect(
      resolveMetaFbp({
        pixelFbp: "fb.1.2000.9",
        storedFbp: "fb.1.1000.8",
      }),
    ).toBe("fb.1.2000.9");
    expect(
      resolveMetaFbp({
        storedFbp: "fb.1.1000.8",
        now: 3000,
        randomId: "7",
      }),
    ).toBe("fb.1.1000.8");
    expect(
      resolveMetaFbp({
        now: 3000,
        randomId: "7",
      }),
    ).toBe("fb.1.3000.7");
  });

  test("shares asleep.lt cookies across www and apex", () => {
    expect(cookieDomainAttribute("asleep.lt")).toBe("; Domain=.asleep.lt");
    expect(cookieDomainAttribute("www.asleep.lt")).toBe("; Domain=.asleep.lt");
    expect(cookieDomainAttribute("localhost")).toBe("");
  });
});
