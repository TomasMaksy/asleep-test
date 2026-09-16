import { Check, ChevronDown } from "lucide-react";
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
        alt="asleep"
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
        alt="asleep"
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
    <ChevronDown
      aria-hidden
      className={cn("size-2.5", className)}
      strokeWidth={2}
    />
  );
}

export function CheckIcon({ className }: { className?: string }) {
  return (
    <Check
      aria-hidden
      className={cn("size-5 shrink-0", className)}
      strokeWidth={2}
    />
  );
}
