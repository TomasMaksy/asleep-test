import Link from "next/link";
import type { ComponentProps } from "react";
import { cn } from "@/lib/utils";

type ButtonProps = {
  href?: string;
  variant?: "solid-light" | "solid-brand" | "outline";
} & Omit<ComponentProps<"a">, "href">;

export function Button({
  href = "#",
  variant = "solid-light",
  className,
  children,
  ...props
}: ButtonProps) {
  return (
    <Link
      className={cn(
        "inline-flex items-center justify-center rounded-full px-6 py-3 text-center font-sans text-base tracking-normal transition-colors duration-300",
        variant === "solid-light" &&
          "!text-[#1A478A] bg-white hover:bg-brand-muted",
        variant === "solid-brand" &&
          "bg-[#1A478A] text-white hover:bg-[#2B2D41]",
        variant === "outline" &&
          "border border-[#1A478A] bg-white text-[#1A478A] hover:bg-[#1A478A] hover:text-white",
        className,
      )}
      href={href}
      {...props}
    >
      {children}
    </Link>
  );
}
