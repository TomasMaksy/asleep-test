export const serverTrackingConfig = {
  posthogKey:
    process.env.NEXT_PUBLIC_POSTHOG_PROJECT_TOKEN ??
    process.env.NEXT_PUBLIC_POSTHOG_KEY ??
    "",
  posthogHost:
    process.env.NEXT_PUBLIC_POSTHOG_HOST ?? "https://us.i.posthog.com",
  metaPixelId: process.env.NEXT_PUBLIC_META_PIXEL_ID ?? "",
  metaAccessToken: process.env.META_CONVERSIONS_API_TOKEN ?? "",
  metaTestEventCode: process.env.META_TEST_EVENT_CODE ?? "",
  metaGraphApiVersion: process.env.META_GRAPH_API_VERSION ?? "v26.0",
  ga4MeasurementId: process.env.NEXT_PUBLIC_GA4_MEASUREMENT_ID ?? "",
  ga4ApiSecret: process.env.GA4_MEASUREMENT_PROTOCOL_SECRET ?? "",
} as const;
