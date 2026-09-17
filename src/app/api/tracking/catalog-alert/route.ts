import { after, NextResponse } from "next/server";
import { z } from "zod";
import { claimOnce } from "@/lib/tracking/server/idempotency";
import { isTrustedSiteRequest } from "@/lib/tracking/server/origins";
import { notifyCatalogMismatch } from "@/lib/tracking/server/catalog-alert-notify";
import { consumeMutationRateLimit } from "@/lib/tracking/server/request";
import { logTrackingIssue } from "@/lib/tracking/log";

const MAX_BODY_BYTES = 8_000;
const DEDUPE_TTL_MS = 60 * 60 * 1000;

const payloadSchema = z.object({
  eventName: z.enum(["add_to_cart", "checkout_initiated", "purchase"]),
  source: z.string().trim().min(1).max(80),
  cartIds: z.array(z.string().trim().min(1).max(200)).max(20),
  path: z.string().trim().max(500).optional(),
  url: z.string().trim().max(2000).optional(),
  reason: z.literal("catalog_mismatch"),
});

export async function POST(request: Request) {
  if (!isTrustedSiteRequest(request)) {
    logTrackingIssue(
      { reason: "invalid_origin", status: 403 },
      { once: "catalog-alert-origin" },
    );
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

  const parsed = payloadSchema.safeParse(raw);
  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid payload." }, { status: 400 });
  }

  const payload = parsed.data;
  const dedupeKey = `catalog-alert:${payload.eventName}:${payload.cartIds.slice().sort().join("|")}`;
  if (!claimOnce(dedupeKey, DEDUPE_TTL_MS)) {
    return NextResponse.json({ ok: true, deduped: true });
  }

  after(() => notifyCatalogMismatch(payload));
  return NextResponse.json({ ok: true });
}
