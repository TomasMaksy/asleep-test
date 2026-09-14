import { initializeGoogleTag } from "@/lib/tracking/client/ga4";
import { initializeMetaPixel } from "@/lib/tracking/client/meta";
import { persistMetaClickIds } from "@/lib/tracking/client/meta-clicks";
import { initializePostHog } from "@/lib/tracking/client/posthog";

export function initializeTracking() {
  try {
    persistMetaClickIds();
  } catch {
    // Click IDs must never block page load.
  }
  try {
    initializePostHog();
  } catch {
    // Tracking must never block page load.
  }
  try {
    initializeMetaPixel();
  } catch {
    // Tracking must never block page load.
  }
  try {
    initializeGoogleTag();
  } catch {
    // Tracking must never block page load.
  }
  scheduleMetaClickIdPersist();
}

function scheduleMetaClickIdPersist() {
  for (const delay of [300, 1500, 4000]) {
    window.setTimeout(() => {
      try {
        persistMetaClickIds();
      } catch {
        // Pixel cookies can appear after the first pageview.
      }
    }, delay);
  }
}
