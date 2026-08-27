"use client";

import { Menu, X } from "lucide-react";
import { AnimatePresence, motion, useReducedMotion } from "motion/react";
import { useTranslations } from "next-intl";
import { useEffect, useState } from "react";
import { Link } from "@/i18n/navigation";
import { cn } from "@/lib/utils";

const sheetTransition = {
  type: "tween" as const,
  duration: 0.28,
  ease: [0.22, 1, 0.36, 1] as const,
};

type NavLink = {
  label: string;
  href: string;
  accent?: boolean;
};

export function MobileNav({
  links,
  solid,
  reviewsLabel,
}: {
  links: NavLink[];
  solid: boolean;
  reviewsLabel: string;
}) {
  const t = useTranslations("nav");
  const reduceMotion = useReducedMotion();
  const [open, setOpen] = useState(false);
  const duration = reduceMotion ? 0 : sheetTransition.duration;

  useEffect(() => {
    if (!open) return;
    const previous = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") setOpen(false);
    };
    window.addEventListener("keydown", onKeyDown);
    return () => {
      document.body.style.overflow = previous;
      window.removeEventListener("keydown", onKeyDown);
    };
  }, [open]);

  return (
    <>
      <button
        aria-expanded={open}
        aria-label={open ? "Close menu" : "Open menu"}
        className={cn(
          "flex size-10 cursor-pointer items-center justify-center rounded-full border duration-150 lg:hidden",
          solid
            ? "border-brand-dark/25 text-brand-dark"
            : "border-white/30 text-current group-hover:border-brand-dark/20 group-data-[scrolled=true]:border-brand-dark/20",
        )}
        onClick={() => setOpen(true)}
        type="button"
      >
        <Menu className="size-5" strokeWidth={1.75} />
      </button>

      <AnimatePresence>
        {open ? (
          <div className="fixed inset-0 z-[2000] lg:hidden" key="mobile-nav">
            <motion.button
              animate={{ opacity: 1 }}
              aria-label="Close menu"
              className="absolute inset-0 cursor-pointer bg-brand-dark/25 backdrop-blur-[6px]"
              exit={{ opacity: 0 }}
              initial={{ opacity: 0 }}
              onClick={() => setOpen(false)}
              transition={{ duration, ease: sheetTransition.ease }}
              type="button"
            />
            <motion.aside
              animate={{ x: 0 }}
              className="absolute inset-y-0 left-0 flex w-[min(100%,320px)] flex-col bg-white text-brand-dark shadow-[12px_0_40px_rgba(0,0,0,0.12)]"
              exit={{ x: "-100%" }}
              initial={{ x: "-100%" }}
              transition={{ duration, ease: sheetTransition.ease }}
            >
              <div className="flex h-20 items-center justify-between border-brand-dark/10 border-b px-5">
                <p className="font-bold text-lg">{t("menu")}</p>
                <button
                  aria-label="Close menu"
                  className="flex size-10 cursor-pointer items-center justify-center rounded-full border border-brand-dark/15"
                  onClick={() => setOpen(false)}
                  type="button"
                >
                  <X className="size-5" strokeWidth={1.75} />
                </button>
              </div>
              <nav className="flex flex-col gap-1 overflow-y-auto px-3 py-4">
                {links.map((link) => (
                  <Link
                    className={cn(
                      "rounded-xl px-4 py-3 font-medium text-base",
                      link.accent ? "text-red-600" : "text-brand-dark",
                    )}
                    href={link.href}
                    key={link.label}
                    onClick={() => setOpen(false)}
                  >
                    {link.label}
                  </Link>
                ))}
                <Link
                  className="rounded-xl px-4 py-3 font-medium text-base text-brand-dark"
                  href="/reviews"
                  onClick={() => setOpen(false)}
                >
                  {reviewsLabel}
                </Link>
              </nav>
            </motion.aside>
          </div>
        ) : null}
      </AnimatePresence>
    </>
  );
}
