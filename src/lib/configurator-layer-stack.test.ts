import { describe, expect, test } from "bun:test";
import {
  cutoutFirmnessForSleeper,
  firmnessLayerStack,
} from "@/lib/configurator-layer-stack";

describe("cutoutFirmnessForSleeper", () => {
  test("together medium light uses factory stack (3)", () => {
    expect(
      cutoutFirmnessForSleeper({
        bed: "double",
        sleeping: "together",
        weightKg: 75,
        preference: 35,
      }),
    ).toBe(3);
  });

  test("together medium heavy bumps one step (4)", () => {
    expect(
      cutoutFirmnessForSleeper({
        bed: "double",
        sleeping: "together",
        weightKg: 93,
        preference: 35,
      }),
    ).toBe(4);
  });

  test("together soft vs hard land on different bases", () => {
    expect(
      cutoutFirmnessForSleeper({
        bed: "double",
        sleeping: "together",
        weightKg: 70,
        preference: 10,
      }),
    ).toBe(2);
    expect(
      cutoutFirmnessForSleeper({
        bed: "double",
        sleeping: "together",
        weightKg: 70,
        preference: 60,
      }),
    ).toBe(5);
  });

  test("alone medium light vs heavy differ", () => {
    expect(
      cutoutFirmnessForSleeper({
        bed: "single",
        sleeping: "alone",
        weightKg: 75,
        preference: 35,
      }),
    ).toBe(3);
    expect(
      cutoutFirmnessForSleeper({
        bed: "single",
        sleeping: "alone",
        weightKg: 90,
        preference: 35,
      }),
    ).toBe(4);
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
