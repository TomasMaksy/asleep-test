const seen = new Set<string>();

type TrackingProvider = "posthog" | "meta" | "ga4";

export type TrackingLogFields = {
  provider?: TrackingProvider;
  eventName?: string;
  eventId?: string;
  reason: string;
  status?: string | number;
  attempt?: number;
};

export function logTrackingIssue(
  fields: TrackingLogFields,
  options: { once?: string } = {},
) {
  if (options.once) {
    if (seen.has(options.once)) {
      return;
    }
    seen.add(options.once);
  }

  console.warn("[tracking]", fields);
}

export function trackingErrorMessage(error: unknown) {
  if (error instanceof Error && error.message.trim()) {
    return error.message.slice(0, 180);
  }
  return "unknown_error";
}
