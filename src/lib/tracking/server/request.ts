import type { TrackingEvent } from "@/lib/tracking/events";
import { googleIdentifiersFromCookies } from "@/lib/tracking/google-ids";
import { asMetaClientIp } from "@/lib/tracking/ip";
import { serverTrackingConfig } from "@/lib/tracking/server/config";
import { isTrustedSiteRequest } from "@/lib/tracking/server/origins";
import { consumeRateLimit } from "@/lib/tracking/server/rate-limit";

export type TrackingRequestContext = {
  clientIp?: string;
  userAgent?: string;
  fbp?: string;
  fbc?: string;
  gaClientId?: string;
  gaSessionId?: string;
};

export function getTrackingRequestContext(
  request: Request,
  event: TrackingEvent,
): TrackingRequestContext {
  const cookies = parseCookies(request.headers.get("cookie") ?? "");
  const google = googleIdentifiersFromCookies(
    cookies,
    serverTrackingConfig.ga4MeasurementId,
  );

  return {
    clientIp: asMetaClientIp(getClientIp(request)),
    userAgent: request.headers.get("user-agent") || undefined,
    fbp: cookies._fbp || cookies.asleep_fbp || event.fbp,
    fbc:
      cookies._fbc ||
      cookies.asleep_fbc ||
      event.fbc ||
      createFbcFromUrl(event.url, event.occurred_at),
    gaClientId: event.ga_client_id || google.clientId,
    gaSessionId: event.ga_session_id || google.sessionId,
  };
}

export function getClientIp(request: Request) {
  const forwarded = request.headers.get("x-forwarded-for");
  return (
    forwarded?.split(",")[0]?.trim() ||
    request.headers.get("x-real-ip")?.trim() ||
    undefined
  );
}

export function isSameOriginRequest(request: Request) {
  return isTrustedSiteRequest(request);
}

export function consumeMutationRateLimit(
  request: Request,
  scope: "tracking" | "checkout" | "intent",
) {
  const limits = {
    tracking: 60,
    checkout: 10,
    intent: 10,
  } as const;

  return consumeRateLimit(
    `${scope}:${getClientIp(request) ?? "unknown"}`,
    limits[scope],
    60_000,
  );
}

function parseCookies(header: string) {
  return Object.fromEntries(
    header.split(";").flatMap((entry) => {
      const separator = entry.indexOf("=");
      if (separator < 0) {
        return [];
      }
      return [
        [
          entry.slice(0, separator).trim(),
          decodeURIComponent(entry.slice(separator + 1)),
        ],
      ];
    }),
  );
}

function createFbcFromUrl(urlValue: string, occurredAt: string) {
  try {
    const clickId = new URL(urlValue).searchParams.get("fbclid");
    if (!clickId) {
      return undefined;
    }
    return `fb.1.${new Date(occurredAt).getTime()}.${clickId}`;
  } catch {
    return undefined;
  }
}
