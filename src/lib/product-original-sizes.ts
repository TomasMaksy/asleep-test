export type MattressSizeId = (typeof MATTRESS_SIZES)[number]["id"];

export const MATTRESS_SIZES = [
  {
    id: "80x190",
    label: "80 x 190 cm",
    plusCents: 41140,
    originalCents: 74800,
    compareCents: 74800,
  },
  {
    id: "80x200",
    label: "80 x 200 cm",
    plusCents: 45540,
    originalCents: 82800,
    compareCents: 82800,
  },
  {
    id: "80x210",
    label: "80 x 210 cm",
    plusCents: 51975,
    originalCents: 94500,
    compareCents: 94500,
  },
  {
    id: "80x220",
    label: "80 x 220 cm",
    plusCents: 54120,
    originalCents: 98400,
    compareCents: 98400,
  },
  {
    id: "90x190",
    label: "90 x 190 cm",
    plusCents: 45925,
    originalCents: 83500,
    compareCents: 83500,
  },
  {
    id: "90x200",
    label: "90 x 200 cm",
    plusCents: 51150,
    originalCents: 93000,
    compareCents: 93000,
  },
  {
    id: "90x210",
    label: "90 x 210 cm",
    plusCents: 58355,
    originalCents: 106100,
    compareCents: 106100,
  },
  {
    id: "90x220",
    label: "90 x 220 cm",
    plusCents: 60335,
    originalCents: 109700,
    compareCents: 109700,
  },
  {
    id: "100x200",
    label: "100 x 200 cm",
    plusCents: 56375,
    originalCents: 102500,
    compareCents: 102500,
  },
  {
    id: "100x210",
    label: "100 x 210 cm",
    plusCents: 62755,
    originalCents: 114100,
    compareCents: 114100,
  },
  {
    id: "100x220",
    label: "100 x 220 cm",
    plusCents: 64845,
    originalCents: 117900,
    compareCents: 117900,
  },
  {
    id: "120x190",
    label: "120 x 190 cm",
    plusCents: 61160,
    originalCents: 111200,
    compareCents: 111200,
  },
  {
    id: "120x200",
    label: "120 x 200 cm",
    plusCents: 66330,
    originalCents: 120600,
    compareCents: 120600,
  },
  {
    id: "140x190",
    label: "140 x 190 cm",
    plusCents: 68365,
    originalCents: 124300,
    compareCents: 124300,
  },
  {
    id: "140x200",
    label: "140 x 200 cm",
    plusCents: 76395,
    originalCents: 138900,
    compareCents: 138900,
  },
  {
    id: "160x190",
    label: "160 x 190 cm",
    plusCents: 78815,
    originalCents: 143300,
    compareCents: 143300,
  },
  {
    id: "160x200",
    label: "160 x 200 cm",
    plusCents: 86735,
    originalCents: 157700,
    compareCents: 157700,
  },
  {
    id: "160x210",
    label: "160 x 210 cm",
    plusCents: 94875,
    originalCents: 172500,
    compareCents: 172500,
  },
  {
    id: "160x220",
    label: "160 x 220 cm",
    plusCents: 96800,
    originalCents: 176000,
    compareCents: 176000,
  },
  {
    id: "180x200",
    label: "180 x 200 cm",
    plusCents: 96800,
    originalCents: 176000,
    compareCents: 176000,
  },
  {
    id: "180x210",
    label: "180 x 210 cm",
    plusCents: 109230,
    originalCents: 198600,
    compareCents: 198600,
  },
  {
    id: "180x220",
    label: "180 x 220 cm",
    plusCents: 111925,
    originalCents: 203500,
    compareCents: 203500,
  },
  {
    id: "200x200",
    label: "200 x 200 cm",
    plusCents: 108075,
    originalCents: 196500,
    compareCents: 196500,
  },
] as const;

export const SINGLE_MATTRESS_SIZES = MATTRESS_SIZES.filter(
  (entry) => getMattressSizeWidth(entry.id) <= 120,
);

export const DOUBLE_MATTRESS_SIZES = MATTRESS_SIZES.filter(
  (entry) => getMattressSizeWidth(entry.id) >= 140,
);

export const DEFAULT_MATTRESS_SIZE_ID: MattressSizeId = "80x190";

export function getMattressSizeWidth(id: MattressSizeId) {
  return Number.parseInt(id.split("x")[0] ?? "0", 10);
}

export function isDoubleMattressSize(id: MattressSizeId) {
  return getMattressSizeWidth(id) >= 140;
}

export function getMattressSize(id: MattressSizeId) {
  const size = MATTRESS_SIZES.find((entry) => entry.id === id);
  if (!size) {
    return MATTRESS_SIZES[0];
  }
  return size;
}

export function formatMattPrice(cents: number) {
  const euros = cents / 100;
  return `€${euros.toLocaleString("en-US", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })}`;
}

export function formatInstallmentPrice(cents: number) {
  return formatMattPrice(Math.round(cents / 3));
}
