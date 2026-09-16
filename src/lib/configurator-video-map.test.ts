import { describe, expect, test } from "bun:test";
import {
  aloneFirmnessFromPreference,
  aloneVisualState,
  resolveVisual,
  togetherFirmnessFromPreference,
  togetherVisualState,
  weightClass,
} from "@/lib/configurator-video-map";

describe("configurator-video-map", () => {
  test("weight class uses ≤85 / ≥86", () => {
    expect(weightClass(85)).toBe("light");
    expect(weightClass(86)).toBe("heavy");
  });

  test("alone preference buckets on soft/hard halves", () => {
    expect(aloneFirmnessFromPreference(1)).toBe("supersoft");
    expect(aloneFirmnessFromPreference(10)).toBe("supersoft");
    expect(aloneFirmnessFromPreference(20)).toBe("soft");
    expect(aloneFirmnessFromPreference(35)).toBe("medium");
    expect(aloneFirmnessFromPreference(36)).toBe("medium");
    expect(aloneFirmnessFromPreference(40)).toBe("mediumHard");
    expect(aloneFirmnessFromPreference(50)).toBe("hard");
    expect(aloneFirmnessFromPreference(70)).toBe("superhard");
  });

  test("together preference collapses to soft/medium/hard", () => {
    expect(togetherFirmnessFromPreference(10)).toBe("soft");
    expect(togetherFirmnessFromPreference(35)).toBe("medium");
    expect(togetherFirmnessFromPreference(60)).toBe("hard");
  });

  test("alone visual states match ALONE map", () => {
    expect(aloneVisualState("supersoft", "light")).toBe(1);
    expect(aloneVisualState("soft", "light")).toBe(4);
    expect(aloneVisualState("medium", "light")).toBe(5);
    expect(aloneVisualState("mediumHard", "light")).toBe(8);
    expect(aloneVisualState("hard", "light")).toBe(10);
    expect(aloneVisualState("superhard", "light")).toBe(9);
    expect(aloneVisualState("supersoft", "heavy")).toBe(4); // fallback soft
    expect(aloneVisualState("mediumHard", "heavy")).toBe(8); // fallback medium
    expect(aloneVisualState("medium", "heavy")).toBe(8);
  });

  test("together both-light medium/medium is state 5", () => {
    expect(togetherVisualState("medium", "medium", "light", "light")).toBe(5);
  });

  test("together both-heavy NOT REAL hard/soft falls back", () => {
    const resolved = resolveVisual({
      bed: "double",
      sleeping: "together",
      profile: {
        yourWeight: 90,
        yourPreference: 70,
        partnerWeight: 90,
        partnerPreference: 10,
      },
    });
    expect(resolved.state).toBe(11); // hard/medium
    expect(resolved.youTogether).toBe("hard");
    expect(resolved.partnerTogether).toBe("medium");
    expect(resolved.youLevel).toBe(3);
    expect(resolved.partnerLevel).toBe(2);
  });

  test("double alone uses double clip bed", () => {
    const resolved = resolveVisual({
      bed: "double",
      sleeping: "alone",
      profile: {
        yourWeight: 75,
        yourPreference: 35,
        partnerWeight: 75,
        partnerPreference: 35,
      },
    });
    expect(resolved.mode).toBe("doubleAlone");
    expect(resolved.clipBed).toBe("double");
    expect(resolved.state).toBe(5);
  });

  test("together levels are 1 soft / 2 medium / 3 hard", () => {
    const soft = resolveVisual({
      bed: "double",
      sleeping: "together",
      profile: {
        yourWeight: 75,
        yourPreference: 10,
        partnerWeight: 75,
        partnerPreference: 35,
      },
    });
    expect(soft.youLevel).toBe(1);
    expect(soft.partnerLevel).toBe(2);
  });
});
