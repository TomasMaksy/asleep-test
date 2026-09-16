import {
  getMattressSize,
  MATTRESS_SIZES,
  type MattressSizeId,
} from "@/lib/product-original-sizes";
import { transparentVideoSrc } from "@/lib/transparent-video";

export type BedKind = "single" | "double";
export type Firmness = 1 | 2 | 3 | 4 | 5 | 6;
export type Sleeping = "alone" | "together";

export const FIRMNESS_LEVELS = [1, 2, 3, 4, 5, 6] as const;
/** Double Together per docs: soft / medium / hard only. */
export const TOGETHER_FIRMNESS_LEVELS = [1, 2, 3] as const;
export const DEFAULT_FIRMNESS: Firmness = 3;
export const DEFAULT_WEIGHT_KG = 75;
export const DEFAULT_PREFERENCE = 35;
export const MIN_WEIGHT_KG = 1;
export const MAX_WEIGHT_KG = 150;
export const MIN_PREFERENCE = 1;
export const MAX_PREFERENCE = 70;
export const CONFIGURATOR_DEFAULT_SIZE_ID: MattressSizeId = "80x200";
export const VIDEO_PLAYBACK_RATE = 1.5;
export const VIDEO_PLAYBACK_RATE_QUEUED = 2.4;
export const VIDEO_PLAYBACK_RATE_FLUSH = 3.2;
export const VIDEO_PLAYBACK_RATE_CATCHUP = 12;
export const MAX_TRANSITION_QUEUE = 2;

const FIRMNESS_TABLE: Firmness[][] = [
  [1, 1, 2, 2],
  [2, 2, 3, 3],
  [3, 3, 4, 4],
  [3, 3, 4, 4],
  [3, 4, 4, 5],
  [4, 5, 5, 5],
  [5, 6, 6, 6],
];

const COMPATIBLE_GROUPS: readonly Firmness[][] = [
  [1, 2],
  [3, 4],
  [5, 6],
];

export type ConfiguratorRecommendation = {
  you: Firmness;
  partner: Firmness;
  mindTheGap: boolean;
};

function preferenceBucket(preference: number): number {
  if (preference <= 10) return 0;
  if (preference <= 20) return 1;
  if (preference <= 30) return 2;
  if (preference <= 40) return 3;
  if (preference <= 50) return 4;
  if (preference <= 60) return 5;
  return 6;
}

function weightBand(kg: number): number {
  if (kg < 55) return 0;
  if (kg < 86) return 1;
  if (kg < 100) return 2;
  return 3;
}

export function firmnessFromProfile(
  weightKg: number,
  preference: number,
): Firmness {
  const row = FIRMNESS_TABLE[preferenceBucket(preference)];
  return row?.[weightBand(weightKg)] ?? DEFAULT_FIRMNESS;
}

export function isMindTheGap(you: Firmness, partner: Firmness): boolean {
  return !COMPATIBLE_GROUPS.some(
    (group) => group.includes(you) && group.includes(partner),
  );
}

/** Together 3×3: soft↔hard is too far for one double top layer. */
export function isMindTheGapTogether(you: Firmness, partner: Firmness): boolean {
  return Math.abs(you - partner) >= 2;
}

export function recommendFirmness(input: {
  bed: BedKind;
  sleeping: Sleeping;
  yourWeight: number;
  yourPreference: number;
  partnerWeight: number;
  partnerPreference: number;
}): ConfiguratorRecommendation {
  const you = firmnessFromProfile(input.yourWeight, input.yourPreference);
  const partner =
    input.bed === "double" && input.sleeping === "together"
      ? firmnessFromProfile(input.partnerWeight, input.partnerPreference)
      : you;
  const mindTheGap =
    input.bed === "double" &&
    input.sleeping === "together" &&
    isMindTheGap(you, partner);

  return { you, partner, mindTheGap };
}

export function introVideoSrc(bed: BedKind, reverse = false): string {
  if (bed === "single") {
    return transparentVideoSrc(
      reverse
        ? "/configurator/single/MAT_Anim_Single_Opening_Reverse.webm"
        : "/configurator/single/MAT_Anim_Single_Opening.webm",
    );
  }
  return transparentVideoSrc(
    reverse
      ? "/configurator/double/MAT_Anim_Double_Opening_Reverse.webm"
      : "/configurator/double/MAT_Anim_Double_Opening.webm",
  );
}

export function packagingVideoSrc(bed: BedKind): string {
  return transparentVideoSrc(
    bed === "single"
      ? "/configurator/single/SCN_Single_Packaging.webm"
      : "/configurator/double/SCN_Double_Packaging.webm",
  );
}

export function holdVideoSrc(bed: BedKind, firmness: Firmness): string {
  if (firmness === DEFAULT_FIRMNESS) {
    return introVideoSrc(bed);
  }
  const from = (firmness === 1 ? 2 : firmness - 1) as Firmness;
  return transitionVideoSrc(bed, from, firmness);
}

/** Visual mattress-state transition (doc SCN_*_{old}_{new}). */
export function transitionVideoSrc(
  bed: BedKind,
  from: number,
  to: number,
): string {
  return transparentVideoSrc(
    bed === "single"
      ? `/configurator/single/SCN_Single_${from}_${to}.webm`
      : `/configurator/double/SCN_Double_${from}_${to}.webm`,
  );
}

export function suggestedSingleSizeId(
  sizeId: MattressSizeId,
): MattressSizeId | null {
  const [width, length] = sizeId.split("x");
  const halfWidth = Number.parseInt(width ?? "0", 10) / 2;
  const candidate = `${halfWidth}x${length}` as MattressSizeId;
  return MATTRESS_SIZES.some((entry) => entry.id === candidate)
    ? candidate
    : null;
}

export function configuratorCartVariant(input: {
  sizeId: MattressSizeId;
  sleeping: Sleeping;
  bed: BedKind;
  you: Firmness;
  partner: Firmness;
  youLabel: string;
  partnerLabel: string;
  mindTheGap: boolean;
}): string {
  const size = getMattressSize(input.sizeId).label;
  if (input.bed === "double" && input.sleeping === "together") {
    return `${size} · ${input.youLabel} / ${input.partnerLabel}`;
  }
  return `${size} · ${input.youLabel}`;
}
