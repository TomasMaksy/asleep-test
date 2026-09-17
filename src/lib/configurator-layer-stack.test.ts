import { describe, expect, test } from "bun:test";
import {
  cutoutFirmnessForSleeper,
  firmnessLayerStack,
  visualStateLayerStack,
} from "@/lib/configurator-layer-stack";

describe("cutoutFirmnessForSleeper", () => {
  test("together medium stays Medium on the scale for light and heavy", () => {
    expect(
      cutoutFirmnessForSleeper({
        bed: "double",
        sleeping: "together",
        weightKg: 75,
        preference: 35,
      }),
    ).toBe(3);
    expect(
      cutoutFirmnessForSleeper({
        bed: "double",
        sleeping: "together",
        weightKg: 93,
        preference: 35,
      }),
    ).toBe(3);
  });

  test("together soft / medium / firm only — never Extra soft, Medium/firm, Extra firm", () => {
    for (const weightKg of [70, 90]) {
      expect(
        cutoutFirmnessForSleeper({
          bed: "double",
          sleeping: "together",
          weightKg,
          preference: 10,
        }),
      ).toBe(2);
      expect(
        cutoutFirmnessForSleeper({
          bed: "double",
          sleeping: "together",
          weightKg,
          preference: 35,
        }),
      ).toBe(3);
      expect(
        cutoutFirmnessForSleeper({
          bed: "double",
          sleeping: "together",
          weightKg,
          preference: 60,
        }),
      ).toBe(5);
    }
  });

  test("alone medium light vs heavy: resolve maps mediumHard→medium for heavy", () => {
    expect(
      cutoutFirmnessForSleeper({
        bed: "double",
        sleeping: "alone",
        weightKg: 75,
        preference: 35,
      }),
    ).toBe(3);
    expect(
      cutoutFirmnessForSleeper({
        bed: "double",
        sleeping: "alone",
        weightKg: 90,
        preference: 52,
      }),
    ).toBe(3);
  });

  test("alone supersoft heavy steps once to soft (2), not double-bump", () => {
    expect(
      cutoutFirmnessForSleeper({
        bed: "double",
        sleeping: "alone",
        weightKg: 70,
        preference: 5,
      }),
    ).toBe(1);
    expect(
      cutoutFirmnessForSleeper({
        bed: "double",
        sleeping: "alone",
        weightKg: 90,
        preference: 5,
      }),
    ).toBe(2);
  });

  test("single: heavy soft-side stays soft; never medium/firm", () => {
    expect(
      cutoutFirmnessForSleeper({
        bed: "single",
        sleeping: "alone",
        weightKg: 90,
        preference: 5,
      }),
    ).toBe(2);
    expect(
      cutoutFirmnessForSleeper({
        bed: "single",
        sleeping: "alone",
        weightKg: 75,
        preference: 48,
      }),
    ).toBe(5);
    expect(
      cutoutFirmnessForSleeper({
        bed: "single",
        sleeping: "alone",
        weightKg: 90,
        preference: 35,
      }),
    ).toBe(3);
  });
});

describe("visualStateLayerStack", () => {
  const foamIds = (mode: "single" | "doubleAlone" | "doubleTogether", state: number, side: "you" | "partner" = "you") =>
    visualStateLayerStack(mode, state, side)
      .map((layer) => layer.id)
      .filter((id) => id !== "tencel" && id !== "cover");

  test("always wraps foams with tencel and cover", () => {
    const stack = visualStateLayerStack("single", 3);
    expect(stack[0]?.id).toBe("tencel");
    expect(stack.at(-1)?.id).toBe("cover");
    expect(stack).toHaveLength(6);
  });

  test("single states match H/M/W/G mapping sheet", () => {
    expect(foamIds("single", 1)).toEqual([
      "memoryFoam",
      "hypersupport",
      "coldFoamSoft",
      "coldFoamFirm",
    ]); // MHWG
    expect(foamIds("single", 2)).toEqual([
      "memoryFoam",
      "hypersupport",
      "coldFoamFirm",
      "coldFoamSoft",
    ]); // MHGW
    expect(foamIds("single", 3)).toEqual([
      "hypersupport",
      "memoryFoam",
      "coldFoamSoft",
      "coldFoamFirm",
    ]); // HMWG factory
    expect(foamIds("single", 4)).toEqual([
      "hypersupport",
      "memoryFoam",
      "coldFoamFirm",
      "coldFoamSoft",
    ]); // HMGW
    expect(foamIds("single", 5)).toEqual([
      "coldFoamSoft",
      "coldFoamFirm",
      "hypersupport",
      "memoryFoam",
    ]); // WGHM
    expect(foamIds("single", 6)).toEqual([
      "coldFoamFirm",
      "coldFoamSoft",
      "hypersupport",
      "memoryFoam",
    ]); // GWHM
  });

  test("double state 8 alone-style: both sides HMGW", () => {
    expect(foamIds("doubleAlone", 8, "you")).toEqual([
      "hypersupport",
      "memoryFoam",
      "coldFoamFirm",
      "coldFoamSoft",
    ]);
    expect(foamIds("doubleAlone", 8, "partner")).toEqual([
      "hypersupport",
      "memoryFoam",
      "coldFoamFirm",
      "coldFoamSoft",
    ]);
  });

  test("double together state 12: you WGHM / partner GWHM", () => {
    expect(foamIds("doubleTogether", 12, "you")).toEqual([
      "coldFoamSoft",
      "coldFoamFirm",
      "hypersupport",
      "memoryFoam",
    ]);
    expect(foamIds("doubleTogether", 12, "partner")).toEqual([
      "coldFoamFirm",
      "coldFoamSoft",
      "hypersupport",
      "memoryFoam",
    ]);
  });

  test("double together state 2: you MHGW / partner MHWG", () => {
    expect(foamIds("doubleTogether", 2, "you")).toEqual([
      "memoryFoam",
      "hypersupport",
      "coldFoamFirm",
      "coldFoamSoft",
    ]);
    expect(foamIds("doubleTogether", 2, "partner")).toEqual([
      "memoryFoam",
      "hypersupport",
      "coldFoamSoft",
      "coldFoamFirm",
    ]);
  });
});

describe("firmnessLayerStack", () => {
  test("legacy firmness 3 still maps to factory HMWG", () => {
    expect(firmnessLayerStack(3).map((layer) => layer.id)).toEqual([
      "tencel",
      "hypersupport",
      "memoryFoam",
      "coldFoamSoft",
      "coldFoamFirm",
      "cover",
    ]);
  });
});
