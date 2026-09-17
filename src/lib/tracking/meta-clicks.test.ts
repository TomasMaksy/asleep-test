import { describe, expect, test } from "bun:test";
import { NextRequest, NextResponse } from "next/server";
import {
  ASLEEP_FBC_COOKIE,
  applyMetaFbcCookies,
  cookieDomain,
  cookieDomainAttribute,
  PIXEL_FBC_COOKIE,
  resolveMetaFbc,
  resolveMetaFbp,
} from "@/lib/tracking/meta-clicks";

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

  test("replaces Pixel _fbc when fbclid changes", () => {
    expect(
      resolveMetaFbc({
        pixelFbc: "fb.1.1000.Old",
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
    expect(cookieDomain("asleep.lt")).toBe(".asleep.lt");
    expect(cookieDomain("www.asleep.lt")).toBe(".asleep.lt");
    expect(cookieDomain("localhost")).toBeUndefined();
    expect(cookieDomainAttribute("asleep.lt")).toBe("; Domain=.asleep.lt");
    expect(cookieDomainAttribute("www.asleep.lt")).toBe("; Domain=.asleep.lt");
    expect(cookieDomainAttribute("localhost")).toBe("");
  });
});

describe("applyMetaFbcCookies", () => {
  test("sets _fbc and asleep_fbc when fbclid is present", () => {
    const request = new NextRequest("https://asleep.lt/?fbclid=Click123");
    const response = applyMetaFbcCookies(request, NextResponse.next());

    const pixel = response.cookies.get(PIXEL_FBC_COOKIE)?.value;
    const asleep = response.cookies.get(ASLEEP_FBC_COOKIE)?.value;
    expect(pixel).toMatch(/^fb\.1\.\d+\.Click123$/);
    expect(asleep).toBe(pixel);
  });

  test("skips Set-Cookie when matching fbc cookies already exist", () => {
    const existing = "fb.1.1000.Click123";
    const request = new NextRequest("https://asleep.lt/?fbclid=Click123", {
      headers: {
        cookie: `${PIXEL_FBC_COOKIE}=${existing}; ${ASLEEP_FBC_COOKIE}=${existing}`,
      },
    });
    const response = applyMetaFbcCookies(request, NextResponse.next());
    expect(response.cookies.get(PIXEL_FBC_COOKIE)).toBeUndefined();
    expect(response.cookies.get(ASLEEP_FBC_COOKIE)).toBeUndefined();
  });

  test("does nothing without fbclid", () => {
    const request = new NextRequest("https://asleep.lt/");
    const response = applyMetaFbcCookies(request, NextResponse.next());
    expect(response.cookies.get(PIXEL_FBC_COOKIE)).toBeUndefined();
    expect(response.cookies.get(ASLEEP_FBC_COOKIE)).toBeUndefined();
  });
});
