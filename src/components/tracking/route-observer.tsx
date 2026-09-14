"use client";

import { usePathname } from "next/navigation";
import { useEffect, useRef } from "react";
import { useOriginalSizeStore } from "@/lib/product-original-size-store";
import {
  resetConfiguratorVisit,
  trackConfiguratorStarted,
} from "@/lib/tracking/client/configurator";
import { trackClientEvent } from "@/lib/tracking/client/dispatcher";
import { trackProductViewed } from "@/lib/tracking/client/ecommerce";
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
      trackProductViewed(useOriginalSizeStore.getState().sizeId);
    }

    if (CONFIGURATOR_PATH.test(pathname)) {
      trackConfiguratorStarted();
    } else {
      resetConfiguratorVisit();
    }
  }, [pathname]);

  useEffect(() => {
    if (!ORIGINAL_PRODUCT_PATH.test(pathname)) {
      return;
    }

    let previousSizeId = useOriginalSizeStore.getState().sizeId;
    return useOriginalSizeStore.subscribe((state) => {
      if (state.sizeId === previousSizeId) {
        return;
      }
      previousSizeId = state.sizeId;
      trackProductViewed(state.sizeId);
    });
  }, [pathname]);

  return null;
}
