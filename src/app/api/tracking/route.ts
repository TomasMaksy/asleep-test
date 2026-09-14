import { after, NextResponse } from "next/server";
import {
  type TrackingEventOf,
  trackingEventSchema,
} from "@/lib/tracking/events";
import { sendBrowserEventToMeta } from "@/lib/tracking/server/dispatch";
import { claimOnce } from "@/lib/tracking/server/idempotency";
import {
  isAllowedEventUrl,
  isTrustedSiteRequest,
} from "@/lib/tracking/server/origins";
import { withServerQuotedEcommerce } from "@/lib/tracking/server/quote";
import { isWithinReplayWindow } from "@/lib/tracking/server/replay";
import {
  consumeMutationRateLimit,
  getTrackingRequestContext,
} from "@/lib/tracking/server/request";

const MAX_BODY_BYTES = 64_000;

export async function POST(request: Request) {
  if (!isTrustedSiteRequest(request)) {
    return NextResponse.json({ error: "Invalid origin." }, { status: 403 });
  }

  if (!consumeMutationRateLimit(request, "tracking")) {
    return NextResponse.json({ error: "Too many requests." }, { status: 429 });
  }

  const contentLength = Number(request.headers.get("content-length") ?? 0);
  if (contentLength > MAX_BODY_BYTES) {
    return NextResponse.json({ error: "Request too large." }, { status: 413 });
  }

  let raw: unknown;
  try {
    raw = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid request." }, { status: 400 });
  }

  const parsed = trackingEventSchema.safeParse(raw);
  if (!parsed.success || parsed.data.name === "purchase") {
    return NextResponse.json(
      { error: "Invalid tracking event." },
      { status: 400 },
    );
  }

  if (
    !isWithinReplayWindow(parsed.data.occurred_at) ||
    !isAllowedEventUrl(parsed.data.url)
  ) {
    return NextResponse.json(
      { error: "Invalid tracking event." },
      { status: 400 },
    );
  }

  const event =
    parsed.data.name === "pageview"
      ? parsed.data
      : parsed.data.name === "product_viewed" ||
          parsed.data.name === "add_to_cart" ||
          parsed.data.name === "checkout_initiated"
        ? withServerQuotedEcommerce(parsed.data)
        : undefined;

  if (!event) {
    return NextResponse.json(
      { error: "Invalid tracking event." },
      { status: 400 },
    );
  }

  if (!claimOnce(`event:${event.event_id}`)) {
    return new NextResponse(null, {
      status: 202,
      headers: { "Cache-Control": "no-store" },
    });
  }

  const context = getTrackingRequestContext(request, event);
  after(() =>
    sendBrowserEventToMeta(
      event as Exclude<typeof event, TrackingEventOf<"purchase">>,
      context,
    ),
  );

  return new NextResponse(null, {
    status: 202,
    headers: { "Cache-Control": "no-store" },
  });
}
