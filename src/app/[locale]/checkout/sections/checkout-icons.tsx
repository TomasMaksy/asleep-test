export function LockIcon({ className }: { className?: string }) {
  return (
    <svg
      aria-hidden="true"
      className={className}
      fill="none"
      viewBox="0 0 14 16"
    >
      <path
        d="M3.5 7V5.2C3.5 3.015 5.015 1.25 7 1.25s3.5 1.765 3.5 3.95V7"
        stroke="currentColor"
        strokeLinecap="round"
        strokeWidth="1.4"
      />
      <rect
        fill="currentColor"
        height="8.25"
        rx="1.6"
        width="11"
        x="1.5"
        y="6.75"
      />
    </svg>
  );
}

export function ChevronIcon({ className }: { className?: string }) {
  return (
    <svg
      aria-hidden="true"
      className={className}
      fill="none"
      viewBox="0 0 12 8"
    >
      <path
        d="M1 1.5 6 6.5 11 1.5"
        stroke="currentColor"
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth="1.5"
      />
    </svg>
  );
}

export function BackArrowIcon({ className }: { className?: string }) {
  return (
    <svg
      aria-hidden="true"
      className={className}
      fill="none"
      viewBox="0 0 12 12"
    >
      <path
        d="M7.5 2 3.5 6l4 4"
        stroke="currentColor"
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth="1.4"
      />
    </svg>
  );
}
