import type { BedKind, Firmness, Sleeping } from "@/lib/configurator";
import {
  aloneFirmnessFromPreference,
  aloneFirmnessToLevel,
  resolveAloneFirmness,
  resolveSingleFirmness,
  togetherFirmnessFromPreference,
  type VideoMode,
  videoMode,
  weightClass,
} from "@/lib/configurator-video-map";

/** Foam / cover slices shown in the result-step exploded stack. */
export type ConfiguratorLayerId =
  | "tencel"
  | "hypersupport"
  | "memoryFoam"
  | "coldFoamSoft"
  | "coldFoamFirm"
  | "cover";

export type ConfiguratorLayerSlice = {
  id: ConfiguratorLayerId;
  src: string;
  width: number;
  height: number;
};

const LAYER_SLICES: Record<ConfiguratorLayerId, ConfiguratorLayerSlice> = {
  tencel: {
    id: "tencel",
    src: "/images/product-layers/slice-tencel.webp",
    width: 2300,
    height: 210,
  },
  hypersupport: {
    id: "hypersupport",
    src: "/images/product-layers/slice-hypersupport.webp",
    width: 2300,
    height: 130,
  },
  memoryFoam: {
    id: "memoryFoam",
    src: "/images/product-layers/slice-memory-foam.webp",
    width: 2300,
    height: 130,
  },
  coldFoamSoft: {
    id: "coldFoamSoft",
    src: "/images/product-layers/slice-cold-foam-soft.webp",
    width: 2300,
    height: 175,
  },
  coldFoamFirm: {
    id: "coldFoamFirm",
    src: "/images/product-layers/slice-cold-foam-firm.webp",
    width: 2300,
    height: 160,
  },
  cover: {
    id: "cover",
    src: "/images/product-layers/slice-non-slip.webp",
    width: 1600,
    height: 202,
  },
};

/**
 * Foam letter codes (top → bottom), matching the cutout mapping sheet.
 * H HyperSupport · M Memory · W HR Comfort (white) · G Base Support (green)
 */
type FoamCode = "H" | "M" | "W" | "G";

const FOAM_BY_CODE: Record<FoamCode, ConfiguratorLayerId> = {
  H: "hypersupport",
  M: "memoryFoam",
  W: "coldFoamSoft",
  G: "coldFoamFirm",
};

function foamsFromCode(code: string): ConfiguratorLayerId[] {
  return [...code].map((letter) => {
    const id = FOAM_BY_CODE[letter as FoamCode];
    if (!id) {
      throw new Error(`Unknown foam code letter: ${letter}`);
    }
    return id;
  });
}

/** Single: last number in SCN_Single_* → foam order. */
const SINGLE_FOAM_BY_STATE: Record<number, string> = {
  1: "MHWG",
  2: "MHGW",
  3: "HMWG",
  4: "HMGW",
  5: "WGHM",
  6: "GWHM",
};

/**
 * Double (alone or together): last number in SCN_Double_* → you / partner.
 * Alone only lands on states where both sides match (1, 4, 5, 8, 9, 10).
 */
const DOUBLE_FOAM_BY_STATE: Record<number, { you: string; partner: string }> = {
  1: { you: "MHWG", partner: "MHWG" },
  2: { you: "MHGW", partner: "MHWG" },
  3: { you: "MHWG", partner: "MHGW" },
  4: { you: "MHGW", partner: "MHGW" },
  5: { you: "HMWG", partner: "HMWG" },
  6: { you: "HMGW", partner: "HMWG" },
  7: { you: "HMWG", partner: "HMGW" },
  8: { you: "HMGW", partner: "HMGW" },
  9: { you: "GWHM", partner: "GWHM" },
  10: { you: "WGHM", partner: "WGHM" },
  11: { you: "GWHM", partner: "WGHM" },
  12: { you: "WGHM", partner: "GWHM" },
};

const DEFAULT_SINGLE_CODE = "HMWG";
const DEFAULT_DOUBLE = { you: "HMWG", partner: "HMWG" } as const;

/** Together soft/medium/hard → fixed Soft / Medium / Firm ticks on the 6-step scale. */
const TOGETHER_CUTOUT: Record<"soft" | "medium" | "hard", Firmness> = {
  soft: 2,
  medium: 3,
  hard: 5,
};

/**
 * Side-scale pointer for one sleeper (Soft/Medium/Firm labels) — not foam order.
 * Foam cutout order comes from {@link visualStateLayerStack}.
 */
export function cutoutFirmnessForSleeper(input: {
  bed: BedKind;
  sleeping: Sleeping;
  weightKg: number;
  preference: number;
}): Firmness {
  const mode = videoMode(input.bed, input.sleeping);
  const heavy = weightClass(input.weightKg) === "heavy";

  if (mode === "doubleTogether") {
    const band = togetherFirmnessFromPreference(input.preference);
    return TOGETHER_CUTOUT[band];
  }

  const weight = heavy ? "heavy" : "light";

  if (mode === "single") {
    const alone = aloneFirmnessFromPreference(
      input.preference,
      "single",
      weight,
    );
    const resolved = resolveSingleFirmness(alone, weight);
    return aloneFirmnessToLevel(resolved);
  }

  const alone = aloneFirmnessFromPreference(
    input.preference,
    "doubleAlone",
    weight,
  );
  const resolved = resolveAloneFirmness(alone, weight);
  return aloneFirmnessToLevel(resolved);
}

function foamCodeForVisualState(
  mode: VideoMode,
  state: number,
  side: "you" | "partner",
): string {
  if (mode === "single") {
    return SINGLE_FOAM_BY_STATE[state] ?? DEFAULT_SINGLE_CODE;
  }
  const pair = DOUBLE_FOAM_BY_STATE[state] ?? DEFAULT_DOUBLE;
  return side === "you" ? pair.you : pair.partner;
}

/**
 * Exploded stack for the result step: driven by the last visual mattress
 * state (trailing number in SCN_{Single|Double}_*) before close/packaging.
 * Tencel always top, cover always bottom; only the four foams reorder.
 */
export function visualStateLayerStack(
  mode: VideoMode,
  state: number,
  side: "you" | "partner" = "you",
): ConfiguratorLayerSlice[] {
  const code = foamCodeForVisualState(mode, state, side);
  const ids: ConfiguratorLayerId[] = [
    "tencel",
    ...foamsFromCode(code),
    "cover",
  ];
  return ids.map((id) => LAYER_SLICES[id]);
}

/** @deprecated Prefer {@link visualStateLayerStack} — kept for advice/scale helpers. */
export function firmnessLayerStack(
  firmness: Firmness,
): ConfiguratorLayerSlice[] {
  // Legacy 1–6 firmness → approximate single-state foam codes.
  const legacyState: Record<Firmness, number> = {
    1: 1,
    2: 2,
    3: 3,
    4: 4,
    5: 5,
    6: 6,
  };
  return visualStateLayerStack("single", legacyState[firmness] ?? 3);
}

export function sleeperLayerStack(input: {
  bed: BedKind;
  sleeping: Sleeping;
  weightKg: number;
  preference: number;
  visualState: number;
  side?: "you" | "partner";
}): ConfiguratorLayerSlice[] {
  return visualStateLayerStack(
    videoMode(input.bed, input.sleeping),
    input.visualState,
    input.side ?? "you",
  );
}
