"use client";

import { useEffect } from "react";

/** Toggles data-hidden / data-scrolled on #site-header — keeps the header markup on the server. */
export function HeaderScroll() {
  useEffect(() => {
    const header = document.getElementById("site-header");
    if (!header) {
      return;
    }

    let lastY = window.scrollY;
    let hidden = false;
    let scrolled = lastY > 0;
    let frame = 0;

    const apply = (nextHidden: boolean, nextScrolled: boolean) => {
      hidden = nextHidden;
      scrolled = nextScrolled;
      header.dataset.hidden = nextHidden ? "true" : "false";
      header.dataset.scrolled = nextScrolled ? "true" : "false";
    };

    const update = () => {
      frame = 0;
      const y = window.scrollY;
      let nextHidden = hidden;
      let nextScrolled = scrolled;

      if (y <= 0) {
        nextHidden = false;
        nextScrolled = false;
      } else if (y > lastY + 4) {
        nextHidden = true;
      } else if (y < lastY - 4) {
        nextHidden = false;
        nextScrolled = true;
      }

      lastY = y;
      if (nextHidden !== hidden || nextScrolled !== scrolled) {
        apply(nextHidden, nextScrolled);
      }
    };

    const onScroll = () => {
      if (frame) {
        return;
      }
      frame = window.requestAnimationFrame(update);
    };

    apply(false, lastY > 0);
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => {
      window.removeEventListener("scroll", onScroll);
      if (frame) {
        window.cancelAnimationFrame(frame);
      }
    };
  }, []);

  return null;
}
