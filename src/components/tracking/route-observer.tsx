"use client";

import { usePathname } from "next/navigation";
import { useEffect, useRef } from "react";
import { resolveCatalogItem } from "@/lib/product-catalog";
import { useOriginalSizeStore } from "@/lib/product-original-size-store";
import {
  resetConfiguratorVisit,
  trackConfiguratorStarted,
} from "@/lib/tracking/client/configurator";
import { trackClientEvent } from "@/lib/tracking/client/dispatcher";
import { asHttpUrl, currentTrackingUrl } from "@/lib/tracking/urls";

const ORIGINAL_PRODUCT_PATH = /^\/(?:lt|en)\/products\/original\/?$/;
const CONFIGURATOR_PATH = /^\/(?:lt|en)\/configurator\/?$/;

export function TrackingRouteObserver() {
  const pathname = usePathname();
  const previousPath = useRef("");
  const previousUrl = useRef("");

  useEffect(() => {
    if (previousPath.current === pathname) {
      return;
    }

    const url = currentTrackingUrl();
    const referrer =
      previousUrl.current || asHttpUrl(document.referrer) || undefined;

    previousPath.current = pathname;
    previousUrl.current = url;

    trackClientEvent(
      "pageview",
      {
        page_title: document.title,
        referrer,
      },
      { source: "route" },
    );

    if (ORIGINAL_PRODUCT_PATH.test(pathname)) {
      const sizeId = useOriginalSizeStore.getState().sizeId;
      const item = resolveCatalogItem(`matt-original-${sizeId}`, 1);
      if (item) {
        trackClientEvent(
          "product_viewed",
          {
            currency: "EUR",
            value: item.price * item.quantity,
            items: [item],
          },
          { source: "route" },
        );
      }
    }

    if (CONFIGURATOR_PATH.test(pathname)) {
      trackConfiguratorStarted();
    } else {
      resetConfiguratorVisit();
    }
  }, [pathname]);

  return null;
}
