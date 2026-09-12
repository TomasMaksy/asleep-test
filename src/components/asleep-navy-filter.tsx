"use client";

import { useEffect, useState } from "react";
import { needsHevcAlphaVideo } from "@/lib/transparent-video";

export const ASLEEP_NAVY_FILTER_ID = "asleep-navy-match";
export const ASLEEP_NAVY_PACKAGING_FILTER_ID = "asleep-navy-match-packaging";
export const ASLEEP_NAVY_SCROLL_FILTER_ID = "asleep-navy-match-scroll";

export const asleepNavyFilterStyle = {
  filter: `url(#${ASLEEP_NAVY_FILTER_ID})`,
} as const;

export const asleepNavyPackagingFilterStyle = {
  filter: `url(#${ASLEEP_NAVY_PACKAGING_FILTER_ID})`,
} as const;

export const asleepNavyScrollFilterStyle = {
  filter: `url(#${ASLEEP_NAVY_SCROLL_FILTER_ID})`,
} as const;

export function useAsleepNavyFilterStyle() {
  const [style, setStyle] = useState<typeof asleepNavyFilterStyle | undefined>(
    undefined,
  );

  useEffect(() => {
    if (!needsHevcAlphaVideo()) {
      setStyle(asleepNavyFilterStyle);
    }
  }, []);

  return style;
}

export function useAsleepNavyScrollFilterStyle() {
  const [style, setStyle] = useState<
    typeof asleepNavyScrollFilterStyle | undefined
  >(undefined);

  useEffect(() => {
    if (!needsHevcAlphaVideo()) {
      setStyle(asleepNavyScrollFilterStyle);
    }
  }, []);

  return style;
}

function NavyTintFilter({
  amount = 1,
  floodColor,
  id,
}: {
  amount?: number;
  floodColor: string;
  id: string;
}) {
  const mixOriginal = 1 - amount;

  return (
    <filter colorInterpolationFilters="sRGB" id={id}>
      <feColorMatrix
        in="SourceGraphic"
        result="rawMask"
        type="matrix"
        values="0 0 0 0 0  0 0 0 0 0  0 0 0 0 0  -1 -1 2 0 0"
      />
      <feComponentTransfer in="rawMask" result="mask">
        <feFuncA intercept="-0.34" slope="2.86" type="linear" />
      </feComponentTransfer>
      <feFlood floodColor={floodColor} result="navy" />
      <feComposite
        in="navy"
        in2="SourceGraphic"
        k1="1"
        k2="0"
        k3="0"
        k4="0"
        operator="arithmetic"
        result="multiplied"
      />
      <feComposite in="multiplied" in2="mask" operator="in" result="tinted" />
      <feComposite
        in="tinted"
        in2="SourceGraphic"
        operator="over"
        result="full"
      />
      {amount < 1 ? (
        <feComposite
          in="full"
          in2="SourceGraphic"
          k1="0"
          k2={amount}
          k3={mixOriginal}
          k4="0"
          operator="arithmetic"
        />
      ) : null}
    </filter>
  );
}

export function AsleepNavyFilter() {
  return (
    <svg
      aria-hidden
      className="pointer-events-none absolute size-0 overflow-hidden"
      focusable="false"
    >
      <title>asleep navy match</title>
      <NavyTintFilter floodColor="#648cbd" id={ASLEEP_NAVY_FILTER_ID} />
      <NavyTintFilter
        amount={0.62}
        floodColor="#648cbd"
        id={ASLEEP_NAVY_SCROLL_FILTER_ID}
      />
      <NavyTintFilter
        floodColor="#547498"
        id={ASLEEP_NAVY_PACKAGING_FILTER_ID}
      />
    </svg>
  );
}
