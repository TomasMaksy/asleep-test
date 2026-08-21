"use client";

import { usePathname } from "next/navigation";
import { useEffect } from "react";

export function RevealObserver() {
  const pathname = usePathname();

  useEffect(() => {
    if (!pathname) {
      return;
    }

    const items = [...document.querySelectorAll(".reveal:not(.is-in)")];

    if (!items.length) {
      return;
    }

    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      for (const el of items) {
        el.classList.add("is-in");
      }
      return;
    }

    const io = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting) {
            entry.target.classList.add("is-in");
            io.unobserve(entry.target);
          }
        }
      },
      { rootMargin: "0px 0px -20% 0px", threshold: 0 },
    );

    for (const el of items) {
      io.observe(el);
    }

    return () => io.disconnect();
  }, [pathname]);

  return null;
}
