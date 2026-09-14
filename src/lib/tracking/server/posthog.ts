import { PostHog } from "posthog-node";
import type { TrackingEventOf } from "@/lib/tracking/events";
import { TRACKING_EVENT_REGISTRY } from "@/lib/tracking/events";
import { logTrackingIssue } from "@/lib/tracking/log";
import { posthogSharedProperties } from "@/lib/tracking/posthog-properties";
import { serverTrackingConfig } from "@/lib/tracking/server/config";

function createPostHogClient() {
  if (!serverTrackingConfig.posthogKey) {
    return undefined;
  }

  return new PostHog(serverTrackingConfig.posthogKey, {
    host: serverTrackingConfig.posthogHost,
    flushAt: 1,
    flushInterval: 0,
  });
}

function compact(record: Record<string, string | undefined>) {
  return Object.fromEntries(
    Object.entries(record).filter(
      ([, value]) => value !== undefined && value !== "",
    ),
  );
}

export async function capturePostHogPurchase(
  event: TrackingEventOf<"purchase">,
  contact: { email?: string; firstName?: string; lastName?: string } = {},
) {
  const posthog = createPostHogClient();
  if (!posthog) {
    logTrackingIssue(
      {
        provider: "posthog",
        eventName: event.name,
        eventId: event.event_id,
        reason: "missing_credentials",
      },
      { once: "posthog-server-creds" },
    );
    return;
  }

  try {
    await posthog.captureImmediate({
      distinctId: event.visitor_id,
      event: TRACKING_EVENT_REGISTRY.purchase.posthog,
      uuid: event.event_id,
      timestamp: new Date(event.occurred_at),
      disableGeoip: true,
      properties: {
        ...posthogSharedProperties(event),
        $session_id: event.posthog_session_id,
        $set: compact({
          email: contact.email?.trim().toLowerCase(),
          checkout_email: contact.email?.trim().toLowerCase(),
          name: [contact.firstName, contact.lastName]
            .filter(Boolean)
            .join(" ")
            .trim(),
        }),
        $union: contact.email
          ? { emails: [contact.email.trim().toLowerCase()] }
          : undefined,
      },
    });
  } finally {
    await posthog.shutdown();
  }
}
