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
        variant === "solid-light" && "bg-white text-brand hover:bg-brand-muted",
        variant === "solid-brand" && "bg-brand text-white hover:bg-brand-dark",
        variant === "outline" &&
          "border border-brand bg-white text-brand hover:bg-brand hover:text-white",
        className,
      )}
      href={href}
      {...props}
    >
      {children}
    </Link>
  );
}
