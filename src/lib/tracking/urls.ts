const STRIPPED_QUERY_PARAMETERS = [
  "payment_intent",
  "payment_intent_client_secret",
  "redirect_status",
];

export function sanitizeTrackingUrl(href: string) {
  const url = new URL(href);
  for (const key of STRIPPED_QUERY_PARAMETERS) {
    url.searchParams.delete(key);
  }
  return url.toString();
}

export function currentTrackingUrl() {
  return sanitizeTrackingUrl(window.location.href);
}

export function asHttpUrl(value: string | undefined) {
  if (!value) {
    return undefined;
  }
  try {
    const parsed = new URL(value);
    return parsed.protocol === "http:" || parsed.protocol === "https:"
      ? parsed.toString()
      : undefined;
  } catch {
    return undefined;
  }
}
