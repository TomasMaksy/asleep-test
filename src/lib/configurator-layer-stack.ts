import type { BedKind, Firmness, Sleeping } from "@/lib/configurator";
import {
  aloneFirmnessFromPreference,
  aloneFirmnessToLevel,
  resolveAloneFirmness,
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

/** Together soft/medium/hard → positions on the shared 6-step cutout scale. */
const TOGETHER_CUTOUT_BASE: Record<"soft" | "medium" | "hard", Firmness> = {
  soft: 2,
  medium: 3,
  hard: 5,
};

function bumpIfHeavy(level: Firmness, heavy: boolean): Firmness {
  if (!heavy || level >= 6) {
    return level;
  }
  return (level + 1) as Firmness;
}

/**
 * Physical layer stack for one sleeper — preference band + weight.
 * Heavier sleepers get a firmer stack for the same preference (matches doc
 * visual shifts, e.g. together medium/medium light=5 vs you-heavy=6).
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
    return bumpIfHeavy(TOGETHER_CUTOUT_BASE[band], heavy);
  }

  const alone = aloneFirmnessFromPreference(input.preference);
  // Alone/single: heavy adjustments live only in resolveAloneFirmness
  // (supersoft→soft, mediumHard→medium). Do not also bump — that cancels
  // mediumHard heavy back to 4 and double-steps supersoft.
  const resolved = resolveAloneFirmness(alone, heavy ? "heavy" : "light");
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
