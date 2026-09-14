# Tracking

This site uses one typed event contract for PostHog, Meta Pixel/Conversions
API, GA4, and Google Ads. The implementation is manual; do not run the
PostHog self-driving wizard on top of it.

## Event catalog

- `pageview`: PostHog `$pageview`, Meta `PageView`, GA4 `page_view`.
  Browser-owned. Google Ads traffic/audience signal only.
- `product_viewed`: PostHog `product_viewed`, Meta `ViewContent`, GA4
  `view_item`. Browser-owned. Import `view_item` to Google Ads as Secondary.
- `add_to_cart`: PostHog `add_to_cart`, Meta `AddToCart`, GA4 `add_to_cart`.
  Browser-owned. Import to Google Ads as Secondary.
- `checkout_initiated`: PostHog `checkout_initiated`, Meta
  `InitiateCheckout`, GA4 `begin_checkout`. Browser-owned. Import
  `begin_checkout` to Google Ads as Secondary.
- `purchase`: PostHog `purchase`, Meta `Purchase`, GA4 `purchase`.
  Server-owned after `/api/checkout` accepts the checkout. Import to Google Ads
  as Primary.

All events contain:

```json
{
  "event_id": "df03c65f-53e8-443f-bd61-d86baaf7674c",
  "occurred_at": "2026-09-14T12:00:00.000Z",
  "visitor_id": "e2f15c96-e14a-4e1a-bca6-fb9983f32de0",
  "locale": "lt",
  "path": "/lt/products/original",
  "url": "https://asleep.lt/lt/products/original",
  "source": "pdp_buy_box"
}
```

Ecommerce events add `currency`, `value`, and GA4-compatible `items`:

```json
{
  "currency": "EUR",
  "value": 0.75,
  "items": [
    {
      "item_id": "matt-original-80x190",
      "item_name": "asleep Original",
      "item_variant": "80 x 190 cm",
      "price": 0.75,
      "discount": 747.25,
      "quantity": 1
    }
  ]
}
```

`value` is always the sum of discounted `price × quantity`. Item `price` is
the unit price after discount; `discount` is the per-unit reduction.

Checkout and purchase events add a session-persisted `checkout_id`. GA4 uses
it as `transaction_id`. Purchase also includes
`"checkout_mode": "fake_door"` and the selected `payment_method`.

## Delivery and deduplication

- Browser-owned events go to PostHog, Meta Pixel, GA4, and the same-origin
  `/api/tracking` Meta CAPI relay.
- Pixel `eventID` and CAPI `event_id` are the same value. Meta deduplicates the
  browser and server copies by event name and ID.
- Purchase goes to PostHog only from the server. The browser emits Meta Pixel
  and GA4 purchase only after `/api/checkout` accepts the request.
- The server emits Meta CAPI and GA4 Measurement Protocol purchase. Meta uses
  the shared `event_id`; GA4 browser and server events use the same non-empty
  `checkout_id` as `transaction_id`.
- Browser events are not mirrored to PostHog server-side. That keeps the richer
  browser event and avoids replacing it with a thinner server duplicate.
- `_fbp`, `_fbc`, and first-party `asleep_fbp` / `asleep_fbc` cookies, plus
  the landing `fbclid`, are read by server routes. Checkout contact fields
  are normalized to E.164 using the selected country and SHA-256 hashed
  before Meta CAPI. Phone is not sent to PostHog or GA4. PostHog person
  properties store email and name so a buyer profile can show the journey.
- Analytics provider failures never reject an otherwise accepted checkout.
  Tokens, contact data, IP addresses, and full provider payloads are not
  logged. Purchase delivery retries three times and logs only provider,
  event name, event id, attempt, and HTTP status. That is not a durable
  outbox; add one before taking real payments.

## Request guards

`/api/tracking`, `/api/checkout`, `/api/checkout/intent`, and
`/api/checkout/void` require a browser `Origin` or `Referer` on the allowlist
and reject `Sec-Fetch-Site: cross-site`. Missing origin headers are denied.
Production allows `https://asleep.lt` and `https://www.asleep.lt` only.
Local `bun dev` also allows `http://localhost`. Tunnel hosts are not allowed.

The server also rate-limits by IP, ignores events older than ten minutes,
and drops duplicate `event_id` / `checkout_id` values. Ecommerce item IDs
are looked up in the product catalog; client prices, names, and totals are
not trusted. Fake-door Pay Now does not create a Stripe payment, so there is
no charge to verify. Turn `checkoutConfig.fakeDoor` off before treating
purchases as paid.

## Fake-door semantics

An accepted fake-door checkout is intentionally reported as the providers'
standard `Purchase`/`purchase` event even though no money is captured. The
internal `checkout_mode: "fake_door"` property keeps that meaning explicit.
Stripe payment intent IDs are never used as event or transaction IDs.

Thank-you page visits, refreshes, empty carts, invalid checkout requests, and
honeypot submissions do not generate purchases.

## Environment

All tracking is disabled safely when the matching public identifier or
server credential is empty.

- `NEXT_PUBLIC_POSTHOG_PROJECT_TOKEN`: PostHog project token from project
  settings. `NEXT_PUBLIC_POSTHOG_KEY` is accepted as a fallback.
- `NEXT_PUBLIC_POSTHOG_HOST`: PostHog ingest region, e.g.
  `https://eu.i.posthog.com`.
- `NEXT_PUBLIC_META_PIXEL_ID`: Meta dataset/pixel ID.
- `META_CONVERSIONS_API_TOKEN`: server-only Meta CAPI access token.
- `META_TEST_EVENT_CODE`: optional server-only code for Meta Test Events.
- `META_GRAPH_API_VERSION`: Meta Graph API version; currently `v26.0`.
- `NEXT_PUBLIC_GA4_MEASUREMENT_ID`: GA4 web stream ID (`G-...`).
- `GA4_MEASUREMENT_PROTOCOL_SECRET`: server-only GA4 API secret.

## Person profiles

The cookie `visitor_id` is the PostHog `distinct_id` for the whole visit.
Events and recordings already share that id and `$session_id`. A person
profile is the named record on top: email, name, People tab, cohorts.

`identify()` runs when we get an email (newsletter or checkout). It uses the
visitor id, never the email as the person id. PostHog People still shows and
searches the `email` property, which is the checkout address once they buy.

Both addresses are kept: `newsletter_email` (first footer signup),
`checkout_email` (purchase), `email` (same as checkout after purchase, or the
newsletter address until then), and `emails` (the unique list). Browsing
without an email stays anonymous until that point.

Do not set `$process_person_profile: false` on server purchase. That would
strip the buyer file you want to open.

## Privacy and loading

Tracking starts immediately without a consent gate, by product decision.
PostHog initializes before hydration with explicit events only: autocapture
is off and session replay is on with inputs masked. Meta and Google scripts
load asynchronously. The GA4 tag has automatic pageviews disabled; in GA4
Admin → Data streams → Enhanced measurement, also turn off "Page changes
based on browser history events".

PostHog browser traffic uses the same-origin `/ingest` reverse proxy from
[PostHog's Next.js rewrite guide](https://posthog.com/docs/advanced/proxy/nextjs).
Recordings also go through that proxy (often 1–5 MB per session). Fine at
fake-door volume; if Vercel bandwidth spikes, switch `/ingest` to PostHog's
[managed reverse proxy](https://posthog.com/docs/advanced/proxy/managed-reverse-proxy).
`src/proxy.ts` skips `/ingest` and `/{locale}/ingest` so next-intl cannot
locale-prefix capture endpoints. Keep those paths reserved, do not cache the
responses, and restart the Next.js server after changing `next.config.ts` or
`src/proxy.ts`.

## Live verification

After adding credentials:

1. Open PostHog Live Events. Confirm one `$pageview` per navigation and
   inspect the funnel event properties.
2. Set `META_TEST_EVENT_CODE`, use Meta Events Manager → Test Events, and
   complete the funnel. Pixel and server copies must show the same event ID and
   one deduplicated event.
3. Use GA4 DebugView while developing. Non-production Measurement Protocol
   calls go to the validation endpoint. A purchase's browser and server copies
   must share one `transaction_id`, and item `price × quantity` must equal
   `value`.
4. Remove `META_TEST_EVENT_CODE` before production verification.

## One-time Google Ads setup

1. Enable Google Ads auto-tagging.
2. Link the GA4 property to Google Ads.
3. Import GA4 `purchase` as the Primary conversion used for bidding.
4. Import `view_item`, `add_to_cart`, and `begin_checkout` as Secondary
   conversions for diagnostics.
5. Leave `page_view` out of conversions.
6. Do not install a separate `AW-...` tag or duplicate native Google Ads
   conversion actions.
