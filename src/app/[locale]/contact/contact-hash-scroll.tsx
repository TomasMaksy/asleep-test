"use client";

import { useEffect } from "react";
import { usePathname } from "@/i18n/navigation";

export function ContactHashScroll() {
  const pathname = usePathname();

  useEffect(() => {
    function scrollToHash() {
      const id = window.location.hash.replace(/^#/, "");
      if (!id || !pathname) {
        return;
      }

      const reduceMotion = window.matchMedia(
        "(prefers-reduced-motion: reduce)",
      ).matches;

      document.getElementById(id)?.scrollIntoView({
        behavior: reduceMotion ? "auto" : "smooth",
        block: "start",
      });
    }

    const frame = window.requestAnimationFrame(scrollToHash);
    window.addEventListener("hashchange", scrollToHash);

    return () => {
      window.cancelAnimationFrame(frame);
      window.removeEventListener("hashchange", scrollToHash);
    };
  }, [pathname]);

  return null;
}
