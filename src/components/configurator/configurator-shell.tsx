"use client";

import { type ReactNode, useEffect, useLayoutEffect, useState } from "react";
import { ConfiguratorOverlay } from "@/components/configurator/configurator-overlay";
import { usePathname } from "@/i18n/navigation";
import {
  CONFIGURATOR_OVERLAY_DURATION_MS,
  useConfiguratorOverlayStore,
} from "@/lib/configurator-overlay-store";
import { cn } from "@/lib/utils";

export function ConfiguratorShell({
  children,
  overlay,
}: {
  children: ReactNode;
  overlay: ReactNode;
}) {
  const pathname = usePathname();
  const isOpen = useConfiguratorOverlayStore((state) => state.isOpen);
  const setOpen = useConfiguratorOverlayStore((state) => state.setOpen);
  const [animating, setAnimating] = useState(false);
  const [shown, setShown] = useState(false);
  const lockScroll = isOpen || animating;

  useLayoutEffect(() => {
    if (pathname !== "/configurator") {
      setOpen(false);
    }
  }, [pathname, setOpen]);

  useEffect(() => {
    if (isOpen) {
      setAnimating(true);

      let secondFrameId = 0;
      const frameId = window.requestAnimationFrame(() => {
        secondFrameId = window.requestAnimationFrame(() => {
          setShown(true);
        });
      });

      return () => {
        window.cancelAnimationFrame(frameId);
        window.cancelAnimationFrame(secondFrameId);
      };
    }

    setShown(false);
    const timeoutId = window.setTimeout(() => {
      setAnimating(false);
    }, CONFIGURATOR_OVERLAY_DURATION_MS);

    return () => window.clearTimeout(timeoutId);
  }, [isOpen]);

  useEffect(() => {
    const root = document.documentElement;
    root.classList.toggle("configurator-overlay-lock", lockScroll);

    return () => {
      root.classList.remove("configurator-overlay-lock");
    };
  }, [lockScroll]);

  return (
    <>
      <div
        className={cn(
          lockScroll ? "h-dvh overflow-hidden" : "min-h-full",
          lockScroll && "configurator-page-slide",
          shown && "configurator-page-slide-open",
        )}
      >
        {children}
      </div>
      {overlay}
      {lockScroll ? <ConfiguratorOverlay /> : null}
    </>
  );
}
