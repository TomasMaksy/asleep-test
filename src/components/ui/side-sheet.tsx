"use client";

import { X } from "lucide-react";
import { type ReactNode, useEffect, useRef, useState } from "react";
import { cn } from "@/lib/utils";

/** Matches the previous motion tween used by cart / size / review sheets. */
export const SIDE_SHEET_DURATION_MS = 280;
export const SIDE_SHEET_EASE = "cubic-bezier(0.22, 1, 0.36, 1)";

const panelTransitionClass =
  "duration-[280ms] ease-[cubic-bezier(0.22,1,0.36,1)] motion-reduce:duration-0 motion-reduce:transition-none";

type SideSheetProps = {
  open: boolean;
  onClose: () => void;
  labelledBy: string;
  closeLabel: string;
  children: ReactNode;
  panelClassName?: string;
};

/**
 * Right-edge dialog with CSS enter/exit (no motion/react).
 * Stays mounted through the close animation, then unmounts.
 */
export function SideSheet({
  open,
  onClose,
  labelledBy,
  closeLabel,
  children,
  panelClassName,
}: SideSheetProps) {
  const [present, setPresent] = useState(open);
  const [entered, setEntered] = useState(false);
  const exitTimerRef = useRef<number | null>(null);

  useEffect(() => {
    if (exitTimerRef.current !== null) {
      window.clearTimeout(exitTimerRef.current);
      exitTimerRef.current = null;
    }

    if (open) {
      setPresent(true);
      let innerFrame = 0;
      const outerFrame = window.requestAnimationFrame(() => {
        innerFrame = window.requestAnimationFrame(() => setEntered(true));
      });
      return () => {
        window.cancelAnimationFrame(outerFrame);
        window.cancelAnimationFrame(innerFrame);
      };
    }

    setEntered(false);

    const reduceMotion = window.matchMedia(
      "(prefers-reduced-motion: reduce)",
    ).matches;
    const delay = reduceMotion ? 0 : SIDE_SHEET_DURATION_MS + 40;

    exitTimerRef.current = window.setTimeout(() => {
      setPresent(false);
      exitTimerRef.current = null;
    }, delay);

    return () => {
      if (exitTimerRef.current !== null) {
        window.clearTimeout(exitTimerRef.current);
        exitTimerRef.current = null;
      }
    };
  }, [open]);

  useEffect(() => {
    if (!present) {
      return;
    }

    const previous = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        onClose();
      }
    };

    window.addEventListener("keydown", onKeyDown);
    return () => {
      document.body.style.overflow = previous;
      window.removeEventListener("keydown", onKeyDown);
    };
  }, [present, onClose]);

  if (!present) {
    return null;
  }

  return (
    <div className="fixed inset-0 z-[2000]" data-side-sheet="">
      <button
        aria-label={closeLabel}
        className={cn(
          "absolute inset-0 cursor-pointer bg-brand-dark/25 backdrop-blur-[6px] transition-opacity supports-[backdrop-filter]:bg-brand-dark/20",
          panelTransitionClass,
          entered ? "opacity-100" : "opacity-0",
        )}
        onClick={onClose}
        type="button"
      />

      <aside
        aria-labelledby={labelledBy}
        aria-modal="true"
        className={cn(
          "absolute inset-y-0 right-0 flex w-full flex-col bg-white text-brand-dark shadow-[-12px_0_40px_rgba(0,0,0,0.12)] transition-transform",
          "md:w-[50%] lg:w-[min(40%,512px)]",
          panelTransitionClass,
          entered ? "translate-x-0" : "translate-x-full",
          panelClassName,
        )}
        role="dialog"
      >
        {children}
      </aside>
    </div>
  );
}

type SideSheetHeaderProps = {
  titleId: string;
  closeLabel: string;
  onClose: () => void;
  children: ReactNode;
  className?: string;
  titleClassName?: string;
};

export function SideSheetHeader({
  titleId,
  closeLabel,
  onClose,
  children,
  className,
  titleClassName,
}: SideSheetHeaderProps) {
  return (
    <header
      className={cn(
        "flex h-20 shrink-0 items-center justify-between border-brand-dark/10 border-b px-5 md:px-8",
        className,
      )}
    >
      <h2
        className={cn(
          "!text-[1.25rem] !leading-none !tracking-normal font-bold",
          titleClassName,
        )}
        id={titleId}
      >
        {children}
      </h2>
      <SideSheetCloseButton label={closeLabel} onClose={onClose} />
    </header>
  );
}

export function SideSheetCloseButton({
  label,
  onClose,
  className,
}: {
  label: string;
  onClose: () => void;
  className?: string;
}) {
  return (
    <button
      aria-label={label}
      className={cn(
        "flex size-10 shrink-0 cursor-pointer items-center justify-center rounded-full border border-brand-dark/15 transition-colors hover:bg-surface",
        className,
      )}
      onClick={onClose}
      type="button"
    >
      <X className="size-5" strokeWidth={1.5} />
    </button>
  );
}
