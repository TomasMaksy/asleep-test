import { describe, expect, test } from "bun:test";
import {
  cutoutFirmnessForSleeper,
  firmnessLayerStack,
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
    // preference 52 → mediumHard (4); heavy resolves to medium (3), not bump back to 4
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
    ).toBe(5); // hard, not medium/firm (4)
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

describe("firmnessLayerStack", () => {
  test("always wraps foams with tencel and cover", () => {
    const stack = firmnessLayerStack(3);
    expect(stack[0]?.id).toBe("tencel");
    expect(stack.at(-1)?.id).toBe("cover");
    expect(stack).toHaveLength(6);
  });

  test("default medium keeps factory foam order", () => {
    expect(firmnessLayerStack(3).map((layer) => layer.id)).toEqual([
      "tencel",
      "hypersupport",
      "memoryFoam",
      "coldFoamSoft",
      "coldFoamFirm",
      "cover",
    ]);
  });

  test("medium/firm swaps soft and firm foams", () => {
    expect(firmnessLayerStack(4).map((layer) => layer.id)).toEqual([
      "tencel",
      "hypersupport",
      "memoryFoam",
      "coldFoamFirm",
      "coldFoamSoft",
      "cover",
    ]);
  });
});
