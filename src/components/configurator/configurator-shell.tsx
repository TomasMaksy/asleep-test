"use client";

import {
  type ReactNode,
  useEffect,
  useLayoutEffect,
  useRef,
  useState,
} from "react";
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
  const pageRef = useRef<HTMLDivElement>(null);
  const lockedScrollYRef = useRef(0);
  const wasLockedRef = useRef(false);
  const lockScroll = isOpen || animating;

  useLayoutEffect(() => {
    if (pathname !== "/configurator") {
      setOpen(false);
    }
  }, [pathname, setOpen]);

  useLayoutEffect(() => {
    const root = document.documentElement;
    const page = pageRef.current;

    if (lockScroll) {
      if (!wasLockedRef.current) {
        lockedScrollYRef.current = window.scrollY;
        wasLockedRef.current = true;
      }
      root.classList.add("configurator-overlay-lock");
      if (page) {
        page.style.top = `-${lockedScrollYRef.current}px`;
      }
      return () => {
        root.classList.remove("configurator-overlay-lock");
      };
    }

    root.classList.remove("configurator-overlay-lock");
    if (page) {
      page.style.top = "";
    }
    if (wasLockedRef.current) {
      window.scrollTo({ top: lockedScrollYRef.current, behavior: "instant" });
      wasLockedRef.current = false;
    }
  }, [lockScroll]);

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

  return (
    <>
      <div
        className={cn(
          lockScroll ? "configurator-page-slide" : "min-h-full",
          shown && "configurator-page-slide-open",
        )}
        ref={pageRef}
      >
        {children}
      </div>
      {overlay}
      {lockScroll ? <ConfiguratorOverlay /> : null}
    </>
  );
}
