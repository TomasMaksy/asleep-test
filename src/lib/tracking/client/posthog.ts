import posthog from "posthog-js";
import { clientTrackingConfig } from "@/lib/tracking/client/config";
import type { TrackingEvent } from "@/lib/tracking/events";
import { TRACKING_EVENT_REGISTRY } from "@/lib/tracking/events";
import { getVisitorId } from "@/lib/tracking/ids";
import { posthogSharedProperties } from "@/lib/tracking/posthog-properties";

let initialized = false;

export function initializePostHog() {
  if (initialized || !clientTrackingConfig.posthogKey) {
    return;
  }

  initialized = true;
  const visitorId = getVisitorId();

  posthog.init(clientTrackingConfig.posthogKey, {
    // Origin-absolute so next-intl cannot turn `/ingest` into `/lt/ingest`.
    api_host: `${window.location.origin}/ingest`,
    ui_host: clientTrackingConfig.posthogUiHost,
    defaults: "2026-05-30",
    tracing_headers: [window.location.hostname],
    bootstrap: {
      distinctID: visitorId,
      isIdentifiedID: false,
    },
    autocapture: false,
    capture_pageview: false,
    capture_pageleave: false,
    disable_session_recording: false,
    enable_recording_console_log: false,
    session_recording: {
      maskAllInputs: true,
    },
    disable_surveys: true,
    person_profiles: "identified_only",
  });

  posthog.register({ visitor_id: visitorId });
}

export function getPostHogSessionId() {
  if (!initialized) {
    return undefined;
  }
  return posthog.get_session_id() || undefined;
}

export function identifyVisitor(
  properties: {
    email?: string;
    checkout_email?: string;
    name?: string;
    newsletter_subscribed?: boolean;
  },
  once: { email?: string; newsletter_email?: string } = {},
) {
  if (!initialized) {
    return;
  }

  try {
    const email = normalizeEmail(properties.email);
    const checkoutEmail = normalizeEmail(properties.checkout_email) ?? email;
    posthog.identify(
      getVisitorId(),
      compact({
        ...properties,
        email,
        checkout_email: checkoutEmail,
      }),
      compact({
        email: normalizeEmail(once.email),
        newsletter_email: normalizeEmail(once.newsletter_email),
      }),
    );
  } catch {
    // Person properties must never block the UI.
  }
}

export function captureNewsletterSignup(email: string, source: string) {
  const normalized = email.trim().toLowerCase();
  identifyVisitor(
    { newsletter_subscribed: true },
    { email: normalized, newsletter_email: normalized },
  );
  if (!initialized) {
    return;
  }

  try {
    posthog.capture("newsletter_signed_up", {
      source,
      visitor_id: getVisitorId(),
      $union: { emails: [normalized] },
    });
  } catch {
    // Person properties must never block the UI.
  }
}

function normalizeEmail(value: string | undefined) {
  const email = value?.trim().toLowerCase();
  return email || undefined;
}

function compact<T extends Record<string, unknown>>(record: T) {
  return Object.fromEntries(
    Object.entries(record).filter(
      ([, value]) => value !== undefined && value !== "",
    ),
  );
}

export function capturePostHogEvent(
  event: TrackingEvent,
  options: { immediate?: boolean } = {},
) {
  if (!initialized || event.name === "purchase") {
    return;
  }

  const properties = posthogSharedProperties(event);

  posthog.capture(TRACKING_EVENT_REGISTRY[event.name].posthog, properties, {
    uuid: event.event_id,
    timestamp: new Date(event.occurred_at),
    send_instantly: options.immediate,
    transport: options.immediate ? "sendBeacon" : undefined,
  });
}
