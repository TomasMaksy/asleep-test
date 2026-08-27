"use client";

import { motion, useReducedMotion } from "motion/react";
import { cn } from "@/lib/utils";

type AnimatedRadioIndicatorProps = {
  selected: boolean;
  size?: "sm" | "md";
};

export function AnimatedRadioIndicator({
  selected,
  size = "md",
}: AnimatedRadioIndicatorProps) {
  const reduceMotion = useReducedMotion();

  if (size === "sm") {
    return (
      <span
        aria-hidden="true"
        className={cn(
          "relative flex size-4 shrink-0 items-center justify-center rounded-full border transition-colors duration-200",
          selected ? "border-brand-dark bg-brand-dark" : "border-grey bg-white",
        )}
      >
        <motion.span
          animate={{
            scale: selected ? 1 : 0,
            opacity: selected ? 1 : 0,
          }}
          className="size-1.5 rounded-full bg-white"
          initial={false}
          transition={
            reduceMotion
              ? { duration: 0 }
              : { type: "spring", stiffness: 520, damping: 32, mass: 0.55 }
          }
        />
      </span>
    );
  }

  return (
    <span
      aria-hidden="true"
      className={cn(
        "relative flex size-7 shrink-0 items-center justify-center rounded-full border-2 transition-colors duration-200",
        selected ? "border-brand-dark bg-brand-dark" : "border-grey bg-white",
      )}
    >
      <motion.span
        animate={{
          scale: selected ? 1 : 0,
          opacity: selected ? 1 : 0,
        }}
        className="absolute inset-1 rounded-full bg-white"
        initial={false}
        transition={
          reduceMotion
            ? { duration: 0 }
            : { type: "spring", stiffness: 520, damping: 32, mass: 0.55 }
        }
      />
    </span>
  );
}
