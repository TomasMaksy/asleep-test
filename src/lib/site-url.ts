const FALLBACK_SITE_URL = "https://asleep.lt";

export function getSiteUrl() {
  const fromEnv =
    process.env.NEXT_PUBLIC_SITE_URL ??
    process.env.NEXT_PUBLIC_BASE_HOST ??
    process.env.VERCEL_URL;

  if (!fromEnv) {
    return FALLBACK_SITE_URL;
  }

  if (fromEnv.startsWith("http://") || fromEnv.startsWith("https://")) {
    return fromEnv.replace(/\/$/, "");
  }

  return `https://${fromEnv.replace(/\/$/, "")}`;
}
