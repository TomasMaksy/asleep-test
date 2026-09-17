import type { BedKind, Firmness, Sleeping } from "@/lib/configurator";
import {
  aloneFirmnessFromPreference,
  aloneFirmnessToLevel,
  resolveAloneFirmness,
  resolveSingleFirmness,
  togetherFirmnessFromPreference,
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
 * Foam order under the cover, top → bottom, for each firmness.
 * Factory default (3): HyperSupport → Memory → Soft → Firm.
 * Config 4: HyperSupport → Memory → Firm → Soft.
 */
const FOAM_ORDER: Record<Firmness, ConfiguratorLayerId[]> = {
  1: ["coldFoamSoft", "coldFoamFirm", "memoryFoam", "hypersupport"],
  2: ["coldFoamSoft", "coldFoamFirm", "hypersupport", "memoryFoam"],
  3: ["hypersupport", "memoryFoam", "coldFoamSoft", "coldFoamFirm"],
  4: ["hypersupport", "memoryFoam", "coldFoamFirm", "coldFoamSoft"],
  5: ["memoryFoam", "hypersupport", "coldFoamFirm", "coldFoamSoft"],
  6: ["coldFoamFirm", "coldFoamSoft", "memoryFoam", "hypersupport"],
};

/** Together soft/medium/hard → fixed Soft / Medium / Firm ticks on the 6-step scale. */
const TOGETHER_CUTOUT: Record<"soft" | "medium" | "hard", Firmness> = {
  soft: 2,
  medium: 3,
  hard: 5,
};

/**
 * Physical layer stack for one sleeper — preference band + weight.
 * Together: side pointers stay Soft/Medium/Firm regardless of weight
 * (video states still shift with weight via the together maps).
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
    const alone = aloneFirmnessFromPreference(input.preference, "single", weight);
    const resolved = resolveSingleFirmness(alone, weight);
    return aloneFirmnessToLevel(resolved);
  }

  // Double alone: heavy adjustments live only in resolveAloneFirmness
  // (supersoft→soft, mediumHard→medium). Do not also bump — that cancels
  // mediumHard heavy back to 4 and double-steps supersoft.
  const alone = aloneFirmnessFromPreference(
    input.preference,
    "doubleAlone",
    weight,
  );
  const resolved = resolveAloneFirmness(alone, weight);
  return aloneFirmnessToLevel(resolved);
}

/** Full exploded stack for a firmness: Tencel → foams → cover. */
export function firmnessLayerStack(
  firmness: Firmness,
): ConfiguratorLayerSlice[] {
  const foams = FOAM_ORDER[firmness] ?? FOAM_ORDER[3];
  const ids: ConfiguratorLayerId[] = ["tencel", ...foams, "cover"];
  return ids.map((id) => LAYER_SLICES[id]);
}

export function sleeperLayerStack(input: {
  bed: BedKind;
  sleeping: Sleeping;
  weightKg: number;
  preference: number;
}): ConfiguratorLayerSlice[] {
  return firmnessLayerStack(cutoutFirmnessForSleeper(input));
}
