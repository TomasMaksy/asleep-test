const posthogHost =
  process.env.NEXT_PUBLIC_POSTHOG_HOST ?? "https://eu.i.posthog.com";

export const clientTrackingConfig = {
  posthogKey:
    process.env.NEXT_PUBLIC_POSTHOG_PROJECT_TOKEN ??
    process.env.NEXT_PUBLIC_POSTHOG_KEY ??
    "",
  posthogHost,
  posthogUiHost: posthogUiHost(posthogHost),
  metaPixelId: process.env.NEXT_PUBLIC_META_PIXEL_ID ?? "",
  ga4MeasurementId: process.env.NEXT_PUBLIC_GA4_MEASUREMENT_ID ?? "",
} as const;

function posthogUiHost(ingestHost: string) {
  if (ingestHost.includes("eu.")) {
    return "https://eu.posthog.com";
  }
  if (ingestHost.includes("us.")) {
    return "https://us.posthog.com";
  }
  return ingestHost.replace(/\/$/, "");
}
