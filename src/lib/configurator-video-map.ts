/**
 * Visual mattress-state video map.
 *
 * Final state maps below are authoritative. Older individual clip lines in
 * Mattresses_asleep.md (e.g. both-<86 hard/soft as SCN_Double_4_*) are stale
 * and must not be preserved — always resolve oldState/newState from these maps,
 * then play SCN_{Single|Double}_{old}_{new}.
 *
 * Three separate systems (do not mix state IDs):
 *   A) Single size     → SCN_Single_* + Single state map
 *   B) Double Alone    → SCN_Double_* + Alone state map
 *   C) Double Together → SCN_Double_* + Together 3×3 maps (soft/medium/hard)
 *
 * hard in the doc = Firm in the UI. Weight: ≤85 light, ≥86 heavy.
 * One UI action changes one parameter only — no diagonal transitions.
 */

import type { BedKind, Firmness, Sleeping } from "@/lib/configurator";
import { MAX_PREFERENCE, MIN_PREFERENCE } from "@/lib/configurator";

export type WeightClass = "light" | "heavy";
export type AloneFirmness =
  | "supersoft"
  | "soft"
  | "medium"
  | "mediumHard"
  | "hard"
  | "superhard";
export type TogetherFirmness = "soft" | "medium" | "hard";

export type VideoMode = "single" | "doubleAlone" | "doubleTogether";

export function videoMode(bed: BedKind, sleeping: Sleeping): VideoMode {
  if (bed === "single") return "single";
  if (sleeping === "together") return "doubleTogether";
  return "doubleAlone";
}

/** Integer kg: ≤85 light, ≥86 heavy (doc: <86 / >85). */
export function weightClass(kg: number): WeightClass {
  return kg <= 85 ? "light" : "heavy";
}

/**
 * Soft linija = left half (Soft→Medium). Hard linija = right half (Medium→Firm).
 * Percentages are of that half. Exact center = medium.
 */
export function aloneFirmnessFromPreference(preference: number): AloneFirmness {
  const min = MIN_PREFERENCE;
  const max = MAX_PREFERENCE;
  const mid = (min + max) / 2;

  // Integer slider never hits exact mid (35.5); 35 and 36 are the center ticks.
  if (preference === Math.floor(mid) || preference === Math.ceil(mid)) {
    return "medium";
  }

  if (preference < mid) {
    const softHalf = (preference - min) / (mid - min);
    return softHalf < 0.5 ? "supersoft" : "soft";
  }

  const hardHalf = (preference - mid) / (max - mid);
  if (hardHalf <= 0.25) return "mediumHard";
  if (hardHalf < 0.65) return "hard";
  return "superhard";
}

/** Together: soft half → soft, center ticks → medium, hard half → hard. */
export function togetherFirmnessFromPreference(
  preference: number,
): TogetherFirmness {
  const mid = (MIN_PREFERENCE + MAX_PREFERENCE) / 2;
  if (preference === Math.floor(mid) || preference === Math.ceil(mid)) {
    return "medium";
  }
  if (preference < mid) return "soft";
  return "hard";
}

export function aloneFirmnessToLevel(firmness: AloneFirmness): Firmness {
  switch (firmness) {
    case "supersoft":
      return 1;
    case "soft":
      return 2;
    case "medium":
      return 3;
    case "mediumHard":
      return 4;
    case "hard":
      return 5;
    case "superhard":
      return 6;
  }
}

export function togetherFirmnessToLevel(firmness: TogetherFirmness): Firmness {
  switch (firmness) {
    case "soft":
      return 1;
    case "medium":
      return 2;
    case "hard":
      return 3;
  }
}

/** Default opening ends on medium @ light weight. */
export function defaultVisualState(mode: VideoMode): number {
  if (mode === "single") return 3;
  if (mode === "doubleAlone") return 5;
  return 5; // both light, medium/medium
}

// --- Single size (top Single block) ---

const SINGLE_LIGHT: Record<AloneFirmness, number> = {
  supersoft: 1,
  soft: 2,
  medium: 3,
  mediumHard: 4, // not in top block; treat as hard
  hard: 4,
  superhard: 6,
};

const SINGLE_HEAVY: Record<AloneFirmness, number> = {
  supersoft: 2, // falls toward soft band in old map
  soft: 3,
  medium: 4,
  mediumHard: 5,
  hard: 5,
  superhard: 6,
};

function resolveSingleFirmness(
  firmness: AloneFirmness,
  weight: WeightClass,
): AloneFirmness {
  if (weight === "heavy") {
    if (firmness === "supersoft") return "soft";
    if (firmness === "mediumHard") return "hard";
  }
  return firmness;
}

export function singleVisualState(
  firmness: AloneFirmness,
  weight: WeightClass,
): number {
  const resolved = resolveSingleFirmness(firmness, weight);
  return weight === "light"
    ? SINGLE_LIGHT[resolved]
    : SINGLE_HEAVY[resolved];
}

// --- Double Alone (ALONE block) ---

const ALONE_LIGHT: Record<AloneFirmness, number> = {
  supersoft: 1,
  soft: 4,
  medium: 5,
  mediumHard: 8,
  hard: 10,
  superhard: 9,
};

const ALONE_HEAVY: Partial<Record<AloneFirmness, number>> = {
  soft: 4,
  medium: 8,
  hard: 10,
  superhard: 9,
};

export function resolveAloneFirmness(
  firmness: AloneFirmness,
  weight: WeightClass,
): AloneFirmness {
  if (weight === "heavy") {
    if (firmness === "supersoft") return "soft";
    if (firmness === "mediumHard") return "medium";
  }
  return firmness;
}

export function aloneVisualState(
  firmness: AloneFirmness,
  weight: WeightClass,
): number {
  const resolved = resolveAloneFirmness(firmness, weight);
  if (weight === "light") return ALONE_LIGHT[resolved];
  return ALONE_HEAVY[resolved] ?? ALONE_LIGHT[resolved];
}

// --- Double Together ---

type Pair = `${TogetherFirmness}/${TogetherFirmness}`;

function pairKey(you: TogetherFirmness, partner: TogetherFirmness): Pair {
  return `${you}/${partner}`;
}

/** A) you <86 / partner <86 — hard/soft = 11 (not stale early-doc state 4). */
const TOGETHER_BOTH_LIGHT: Record<Pair, number> = {
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

/** B) you >85 / partner <86 */
const TOGETHER_YOU_HEAVY: Record<Pair, number> = {
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

/** C) you <86 / partner >85 */
const TOGETHER_PARTNER_HEAVY: Record<Pair, number> = {
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

/**
 * D) you >85 / partner >85.
 * hard/soft and soft/hard are NOT REAL — resolved in resolveTogetherPair
 * (same fallback whether reached by weight or firmness change).
 */
const TOGETHER_BOTH_HEAVY: Partial<Record<Pair, number>> = {
  "soft/soft": 4,
  "medium/soft": 6,
  "soft/medium": 7,
  "medium/medium": 8,
  "hard/medium": 11,
  "medium/hard": 12,
  "hard/hard": 9,
};

export function resolveTogetherPair(
  you: TogetherFirmness,
  partner: TogetherFirmness,
  youWeight: WeightClass,
  partnerWeight: WeightClass,
): { you: TogetherFirmness; partner: TogetherFirmness } {
  let nextYou = you;
  let nextPartner = partner;

  if (youWeight === "heavy" && partnerWeight === "heavy") {
    // hard/soft → hard/medium (11); soft/hard → medium/hard (12)
    if (nextYou === "hard" && nextPartner === "soft") {
      nextPartner = "medium";
    } else if (nextYou === "soft" && nextPartner === "hard") {
      nextYou = "medium";
    }
  }

  return { you: nextYou, partner: nextPartner };
}

export function togetherVisualState(
  you: TogetherFirmness,
  partner: TogetherFirmness,
  youWeight: WeightClass,
  partnerWeight: WeightClass,
): number {
  const resolved = resolveTogetherPair(you, partner, youWeight, partnerWeight);
  const key = pairKey(resolved.you, resolved.partner);

  if (youWeight === "light" && partnerWeight === "light") {
    return TOGETHER_BOTH_LIGHT[key];
  }
  if (youWeight === "heavy" && partnerWeight === "light") {
    return TOGETHER_YOU_HEAVY[key];
  }
  if (youWeight === "light" && partnerWeight === "heavy") {
    return TOGETHER_PARTNER_HEAVY[key];
  }
  return TOGETHER_BOTH_HEAVY[key] ?? TOGETHER_BOTH_LIGHT[key];
}

export type ProfileSnapshot = {
  yourWeight: number;
  yourPreference: number;
  partnerWeight: number;
  partnerPreference: number;
};

export type VisualResolution = {
  mode: VideoMode;
  /** Asset folder: Single size → Single; Double (alone or together) → Double. */
  clipBed: BedKind;
  state: number;
  youLevel: Firmness;
  partnerLevel: Firmness;
  youAlone?: AloneFirmness;
  partnerAlone?: AloneFirmness;
  youTogether?: TogetherFirmness;
  partnerTogether?: TogetherFirmness;
};

export function resolveVisual(input: {
  bed: BedKind;
  sleeping: Sleeping;
  profile: ProfileSnapshot;
}): VisualResolution {
  const mode = videoMode(input.bed, input.sleeping);
  const youW = weightClass(input.profile.yourWeight);
  const partnerW = weightClass(input.profile.partnerWeight);

  if (mode === "single") {
    const firmness = aloneFirmnessFromPreference(input.profile.yourPreference);
    const resolved = resolveSingleFirmness(firmness, youW);
    const state = singleVisualState(firmness, youW);
    const level = aloneFirmnessToLevel(resolved);
    return {
      mode,
      clipBed: "single",
      state,
      youLevel: level,
      partnerLevel: level,
      youAlone: resolved,
    };
  }

  if (mode === "doubleAlone") {
    const firmness = aloneFirmnessFromPreference(input.profile.yourPreference);
    const resolved = resolveAloneFirmness(firmness, youW);
    const state = aloneVisualState(firmness, youW);
    const level = aloneFirmnessToLevel(resolved);
    return {
      mode,
      clipBed: "double",
      state,
      youLevel: level,
      partnerLevel: level,
      youAlone: resolved,
    };
  }

  const youT = togetherFirmnessFromPreference(input.profile.yourPreference);
  const partnerT = togetherFirmnessFromPreference(
    input.profile.partnerPreference,
  );
  const resolved = resolveTogetherPair(youT, partnerT, youW, partnerW);
  const state = togetherVisualState(youT, partnerT, youW, partnerW);
  return {
    mode,
    clipBed: "double",
    state,
    youLevel: togetherFirmnessToLevel(resolved.you),
    partnerLevel: togetherFirmnessToLevel(resolved.partner),
    youTogether: resolved.you,
    partnerTogether: resolved.partner,
  };
}
