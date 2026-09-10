export const ASLEEP_NAVY_FILTER_ID = "asleep-navy-match";

export const asleepNavyFilterStyle = {
  filter: `url(#${ASLEEP_NAVY_FILTER_ID})`,
} as const;

export function AsleepNavyFilter() {
  return (
    <svg
      aria-hidden
      className="pointer-events-none absolute size-0 overflow-hidden"
      focusable="false"
    >
      <title>asleep navy match</title>
      <filter colorInterpolationFilters="sRGB" id={ASLEEP_NAVY_FILTER_ID}>
        <feColorMatrix
          in="SourceGraphic"
          result="rawMask"
          type="matrix"
          values="0 0 0 0 0  0 0 0 0 0  0 0 0 0 0  -1 -1 2 0 0"
        />
        <feComponentTransfer in="rawMask" result="mask">
          <feFuncA intercept="-0.34" slope="2.86" type="linear" />
        </feComponentTransfer>
        <feFlood floodColor="#648cbd" result="navy" />
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
        <feComposite in="tinted" in2="SourceGraphic" operator="over" />
      </filter>
    </svg>
  );
}
