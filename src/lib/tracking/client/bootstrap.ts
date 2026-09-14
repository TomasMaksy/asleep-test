import { initializeGoogleTag } from "@/lib/tracking/client/ga4";
import { initializeMetaPixel } from "@/lib/tracking/client/meta";
import { persistMetaClickIds } from "@/lib/tracking/client/meta-clicks";
import { initializePostHog } from "@/lib/tracking/client/posthog";
import { logTrackingIssue, trackingErrorMessage } from "@/lib/tracking/log";

export function initializeTracking() {
  try {
    persistMetaClickIds();
  } catch (error) {
    logTrackingIssue(
      { reason: trackingErrorMessage(error) },
      { once: "click-ids" },
    );
  }
  try {
    initializePostHog();
  } catch (error) {
    logTrackingIssue({
      provider: "posthog",
      reason: trackingErrorMessage(error),
    });
  }
  try {
    initializeMetaPixel();
  } catch (error) {
    logTrackingIssue({
      provider: "meta",
      reason: trackingErrorMessage(error),
    });
  }
  try {
    initializeGoogleTag();
  } catch (error) {
    logTrackingIssue({
      provider: "ga4",
      reason: trackingErrorMessage(error),
    });
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
