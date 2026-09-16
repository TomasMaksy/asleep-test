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
- `configurator_started`: PostHog `configurator_started` only. Browser-owned
  when `/configurator` opens.
- `configurator_finished`: PostHog `configurator_finished` only. Browser-owned
  when the configurator reaches the result step. Properties are `size_id`,
  `bed`, and `sleeping` only; firmness options are not attached because that
  flow will change.

All ads-funnel events contain:

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

Ecommerce events add `currency`, `value`, and GA4-compatible `items`. Each
item uses the size SKU (`matt-original-160x200`), not a configurator suffix.
`item_variant` is the size label only. `size_id` is `160x200`. Catalog `price`
and event `value` are the current 45% sale amount the customer pays
(`plusCents`), not the struck-through list price. `discount` is list minus
that selling price, plus any extra checkout code.

```json
{
  "currency": "EUR",
  "value": 411.4,
  "items": [
    {
      "item_id": "matt-original-80x190",
      "item_name": "asleep Original",
      "item_variant": "80 x 190 cm",
      "size_id": "80x190",
      "price": 411.4,
      "discount": 336.6,
      "quantity": 1
    }
  ]
}
```

An extra checkout code such as `LUCKY99` is applied on top of the sale
(`price` 0.41, `discount` 747.59 for 80x190).

PostHog also gets top-level `size_id` (when the cart is one size), `size_ids`,
and `item_ids` so Insights can break down without opening the nested `items`
list. Use `size_id` for “most popular mattress size”.

`value` is always the sum of discounted `price × quantity`. Item `price` is
the unit price after discount; `discount` is the per-unit reduction.

Checkout and purchase events add a session-persisted `checkout_id`. GA4 uses
it as `transaction_id`. Purchase also includes
`"checkout_mode": "fake_door"` and the selected `payment_method`.

## Delivery and deduplication

- Browser-owned ads-funnel events go to PostHog, Meta Pixel, GA4, and the
  same-origin `/api/tracking` Meta CAPI relay.
- `configurator_started` and `configurator_finished` go to PostHog only. They
  are not sent to Meta Pixel, CAPI, GA4, or Google Ads.
- Pixel `eventID` and CAPI `event_id` are the same value. Meta deduplicates the
  browser and server copies by event name and ID.
- Purchase goes to PostHog only from the server. The browser emits Meta Pixel
  and GA4 purchase only after `/api/checkout` accepts the request.
- The server emits Meta CAPI and GA4 Measurement Protocol purchase. Meta uses
  the shared `event_id`; GA4 browser and server events use the same non-empty
  `checkout_id` as `transaction_id`. Measurement Protocol purchase includes
  numeric `session_id` and `engagement_time_msec` so the event joins the
  browser session and shows in Realtime / engaged-session reports. If gtag
  has not minted `_ga` yet, the client seeds a client_id and the server can
  fall back to the request `_ga` cookie so first-session checkout is not
  dropped.
- Browser events are not mirrored to PostHog server-side. That keeps the richer
  browser event and avoids replacing it with a thinner server duplicate.
- `_fbp`, `_fbc`, and first-party `asleep_fbp` / `asleep_fbc` cookies, plus
  the landing `fbclid`, are read by server routes. Checkout contact fields
  are normalized to E.164 using the selected country and SHA-256 hashed
  before Meta CAPI. Purchase also sends hashed email and phone to GA4 as
  user-provided data (`gtag('set', 'user_data')` and Measurement Protocol
  `sha256_email_address` / `sha256_phone_number`). Phone is not sent to
  PostHog. PostHog person properties store email and name so a buyer profile
  can show the journey.
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
Local `bun dev` also allows `http://localhost`. The reserved ngrok host in
`NEXT_PUBLIC_BASE_HOST` is allowed only outside production. Other tunnel
hosts are denied. `bun server` starts that ngrok tunnel to port 3000.

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

Production `next build` fails if any of these are empty. `bun dev` warns and
leaves that provider off. `META_TEST_EVENT_CODE` must be empty on Vercel
Production; a set value fails that deploy.

Tracking failures log `[tracking]` with provider, event name, event id, and a
reason. Tokens, contact data, IP addresses, and provider payloads are not
logged.

- `NEXT_PUBLIC_POSTHOG_PROJECT_TOKEN`: PostHog project token from project
  settings. `NEXT_PUBLIC_POSTHOG_KEY` is accepted as a fallback.
- `NEXT_PUBLIC_POSTHOG_HOST`: PostHog ingest region, e.g.
  `https://eu.i.posthog.com`.
- `NEXT_PUBLIC_META_PIXEL_ID`: Meta dataset/pixel ID.
- `META_CONVERSIONS_API_TOKEN`: server-only Meta CAPI access token.
- `META_TEST_EVENT_CODE`: optional server-only code for Meta Test Events.
  Empty in production.
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
There is no GDPR popup and no Google Consent Mode v2 yet. gtag still loads
and fires; cookies are set; hashed checkout email/phone are sent to Google
for enhanced conversions. Lithuania is EEA, so until a banner sets
`ad_storage`, `analytics_storage`, `ad_user_data`, and `ad_personalization`
before `gtag('config', ...)`, Google Ads modeling and enhanced conversions
will not be full-quality. When the popup lands, default those four signals
to `denied` before the Google tag, then `update` them from the user's
choice. Do not add a consent default now or tags will wait for a banner
that does not exist.

PostHog initializes before hydration with explicit events only: autocapture
is off and session replay is on with inputs masked. Meta and Google scripts
load asynchronously. Meta Pixel `autoConfig` and `disablePushState` are off
so the pixel does not infer `SubscribedButtonClick`, `Lead`, or extra
`PageView`s from buttons or Next.js history changes. The GA4 tag has
automatic pageviews disabled; in GA4 Admin → Data streams → Enhanced
measurement, also turn off "Page changes based on browser history events".
In Meta Events Manager, leave "Track events automatically from this
website" off.

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
   inspect the funnel event properties. Opening the configurator should emit
   `configurator_started`; reaching the result step should emit
   `configurator_finished`. For unique people, use unique users on those two
   events.
2. Set `META_TEST_EVENT_CODE`, use Meta Events Manager → Test Events, and
   complete the funnel. Pixel and server copies must show the same event ID and
   one deduplicated event. Size, quantity, and nav clicks must not appear as
   `SubscribedButtonClick` or other inferred button events.
3. Use GA4 DebugView while developing. Measurement Protocol always POSTs to
   `/mp/collect` (the `/debug/mp/collect` URL only validates and does not
   ingest). Local `bun dev` and Vercel previews add `debug_mode: true` so
   events appear in DebugView; they still land in this property because
   `NODE_ENV` is `production` on every Vercel deploy. A purchase's browser
   and server copies must share one `transaction_id`, and item
   `price × quantity` must equal `value`.
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
7. In GA4 Admin → Data streams → Google tag → Allow user-provided data
   capabilities, turn on user-provided data so enhanced conversions can
   use the hashed checkout email and phone.
