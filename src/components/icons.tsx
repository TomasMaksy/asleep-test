import Image from "next/image";
import { cn } from "@/lib/utils";

type LogoProps = {
  className?: string;
  variant?: "auto" | "white" | "dark";
};

export function Logo({ className, variant = "auto" }: LogoProps) {
  if (variant !== "auto") {
    return (
      <Image
        alt="Asleep"
        className={cn("h-[27px] w-auto", className)}
        height={417}
        src={
          variant === "white"
            ? "/images/logo/asleep-white.png"
            : "/images/logo/asleep-blue.png"
        }
        width={1304}
      />
    );
  }

  return (
    <span className={cn("relative block h-[27px] w-[85px]", className)}>
      <Image
        alt="Asleep"
        className="object-contain duration-150 group-hover:opacity-0 group-data-[scrolled=true]:opacity-0"
        fill
        priority
        sizes="85px"
        src="/images/logo/asleep-white.png"
      />
      <Image
        alt=""
        className="object-contain opacity-0 duration-150 group-hover:opacity-100 group-data-[scrolled=true]:opacity-100"
        fill
        sizes="85px"
        src="/images/logo/asleep-blue.png"
      />
    </span>
  );
}

export function ChevronIcon({ className }: { className?: string }) {
  return (
    <svg
      aria-hidden="true"
      className={cn("h-[10px] w-[10px]", className)}
      fill="none"
      viewBox="0 0 9 7"
      xmlns="http://www.w3.org/2000/svg"
    >
      <path
        d="M0.832031 1.53027L4.59836 5.29674L8.36482 1.53027"
        stroke="currentColor"
        strokeLinecap="round"
        strokeWidth="1.208"
      />
    </svg>
  );
}

export function CheckIcon({ className }: { className?: string }) {
  return (
    <svg
      aria-hidden="true"
      className={cn("size-5 shrink-0", className)}
      fill="none"
      viewBox="0 0 20 20"
      xmlns="http://www.w3.org/2000/svg"
    >
      <path
        d="M3.125 9.375L7.5 13.75L17.5 3.75"
        stroke="currentColor"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

export function PlayIcon({ className }: { className?: string }) {
  return (
    <svg
      aria-hidden="true"
      className={cn("size-3", className)}
      fill="currentColor"
      viewBox="0 0 12 12"
    >
      <path d="M2.5 1.2v9.6L11 6 2.5 1.2Z" />
    </svg>
  );
}
