import { describe, expect, test } from "bun:test";
import {
  aloneFirmnessFromPreference,
  aloneVisualState,
  resolveVisual,
  togetherFirmnessFromPreference,
  togetherVisualState,
  weightClass,
} from "@/lib/configurator-video-map";
import type { TogetherFirmness } from "@/lib/configurator-video-map";

const TOGETHER: TogetherFirmness[] = ["soft", "medium", "hard"];

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

  test("together preference collapses soft-half / center / hard-half", () => {
    expect(togetherFirmnessFromPreference(1)).toBe("soft");
    expect(togetherFirmnessFromPreference(10)).toBe("soft");
    expect(togetherFirmnessFromPreference(34)).toBe("soft");
    expect(togetherFirmnessFromPreference(35)).toBe("medium");
    expect(togetherFirmnessFromPreference(36)).toBe("medium");
    expect(togetherFirmnessFromPreference(37)).toBe("hard");
    expect(togetherFirmnessFromPreference(60)).toBe("hard");
    expect(togetherFirmnessFromPreference(70)).toBe("hard");
  });

  test("alone visual states match ALONE map", () => {
    expect(aloneVisualState("supersoft", "light")).toBe(1);
    expect(aloneVisualState("soft", "light")).toBe(4);
    expect(aloneVisualState("medium", "light")).toBe(5);
    expect(aloneVisualState("mediumHard", "light")).toBe(8);
    expect(aloneVisualState("hard", "light")).toBe(10);
    expect(aloneVisualState("superhard", "light")).toBe(9);
    expect(aloneVisualState("supersoft", "heavy")).toBe(4); // fallback soft
    expect(aloneVisualState("soft", "heavy")).toBe(4);
    expect(aloneVisualState("mediumHard", "heavy")).toBe(8); // fallback medium
    expect(aloneVisualState("medium", "heavy")).toBe(8);
    expect(aloneVisualState("hard", "heavy")).toBe(10);
    expect(aloneVisualState("superhard", "heavy")).toBe(9);
  });

  test("together both-light final map (hard/soft = 11, not 4)", () => {
    const expected: Record<string, number> = {
      "soft/soft": 1,
      "medium/soft": 2,
      "hard/soft": 11,
      "soft/medium": 3,
      "medium/medium": 5,
      "hard/medium": 6,
      "soft/hard": 12,
      "medium/hard": 7,
      "hard/hard": 8,
    };
    for (const you of TOGETHER) {
      for (const partner of TOGETHER) {
        expect(togetherVisualState(you, partner, "light", "light")).toBe(
          expected[`${you}/${partner}`],
        );
      }
    }
  });

  test("together you-heavy / partner-light final map", () => {
    const expected: Record<string, number> = {
      "soft/soft": 1,
      "medium/soft": 2,
      "hard/soft": 11,
      "soft/medium": 3,
      "medium/medium": 6,
      "hard/medium": 11,
      "soft/hard": 7,
      "medium/hard": 8,
      "hard/hard": 9,
    };
    for (const you of TOGETHER) {
      for (const partner of TOGETHER) {
        expect(togetherVisualState(you, partner, "heavy", "light")).toBe(
          expected[`${you}/${partner}`],
        );
      }
    }
  });

  test("together you-light / partner-heavy final map", () => {
    const expected: Record<string, number> = {
      "soft/soft": 1,
      "medium/soft": 2,
      "hard/soft": 6,
      "soft/medium": 3,
      "medium/medium": 7,
      "hard/medium": 8,
      "soft/hard": 12,
      "medium/hard": 12,
      "hard/hard": 9,
    };
    for (const you of TOGETHER) {
      for (const partner of TOGETHER) {
        expect(togetherVisualState(you, partner, "light", "heavy")).toBe(
          expected[`${you}/${partner}`],
        );
      }
    }
  });

  test("together both-heavy final map + NOT REAL fallbacks", () => {
    const expected: Record<string, number> = {
      "soft/soft": 4,
      "medium/soft": 6,
      "hard/soft": 11, // NOT REAL → hard/medium
      "soft/medium": 7,
      "medium/medium": 8,
      "hard/medium": 11,
      "soft/hard": 12, // NOT REAL → medium/hard
      "medium/hard": 12,
      "hard/hard": 9,
    };
    for (const you of TOGETHER) {
      for (const partner of TOGETHER) {
        expect(togetherVisualState(you, partner, "heavy", "heavy")).toBe(
          expected[`${you}/${partner}`],
        );
      }
    }
  });

  test("together both-heavy NOT REAL hard/soft falls back via resolveVisual", () => {
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

  test("together both-heavy NOT REAL soft/hard falls back via resolveVisual", () => {
    const resolved = resolveVisual({
      bed: "double",
      sleeping: "together",
      profile: {
        yourWeight: 90,
        yourPreference: 10,
        partnerWeight: 90,
        partnerPreference: 70,
      },
    });
    expect(resolved.state).toBe(12); // medium/hard
    expect(resolved.youTogether).toBe("medium");
    expect(resolved.partnerTogether).toBe("hard");
  });

  test("double alone uses double clip bed + Alone state", () => {
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

  test("single size uses single clip bed + Single state", () => {
    const resolved = resolveVisual({
      bed: "single",
      sleeping: "alone",
      profile: {
        yourWeight: 75,
        yourPreference: 35,
        partnerWeight: 75,
        partnerPreference: 35,
      },
    });
    expect(resolved.mode).toBe("single");
    expect(resolved.clipBed).toBe("single");
    expect(resolved.state).toBe(3); // Single light medium
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
