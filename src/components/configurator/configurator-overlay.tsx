"use client";

import dynamic from "next/dynamic";
import { useTranslations } from "next-intl";
import { useCallback, useEffect, useLayoutEffect, useState } from "react";
import { usePathname, useRouter } from "@/i18n/navigation";
import { useConfiguratorOverlayStore } from "@/lib/configurator-overlay-store";
import { cn } from "@/lib/utils";

const ConfiguratorSection = dynamic(
  () =>
    import("@/app/[locale]/configurator/sections/configurator-section").then(
      (module) => module.ConfiguratorSection,
    ),
  { ssr: false },
);

export function ConfiguratorOverlaySync() {
  const setOpen = useConfiguratorOverlayStore((state) => state.setOpen);
  const pathname = usePathname();

  useLayoutEffect(() => {
    const shouldOpen = pathname === "/configurator";
    setOpen(shouldOpen);
    return () => {
      if (shouldOpen) {
        setOpen(false);
      }
    };
  }, [pathname, setOpen]);

  return null;
}

export function ConfiguratorOverlay() {
  const t = useTranslations("configuratorPage");
  const router = useRouter();
  const isOpen = useConfiguratorOverlayStore((state) => state.isOpen);
  const [shown, setShown] = useState(false);

  useEffect(() => {
    if (!isOpen) {
      setShown(false);
      return;
    }

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
  }, [isOpen]);

  const dismiss = useCallback(() => {
    if (!isOpen) {
      return;
    }
    router.back();
  }, [isOpen, router]);

  useEffect(() => {
    function onKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") {
        dismiss();
      }
    }

    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [dismiss]);

  return (
    <div
      aria-label={t("overlayLabel")}
      aria-modal="true"
      className={cn(
        "configurator-overlay-panel fixed inset-0 z-80 overflow-hidden bg-white",
        shown && "configurator-overlay-panel-open",
      )}
      role="dialog"
    >
      <ConfiguratorSection onDismiss={dismiss} />
    </div>
  );
}
