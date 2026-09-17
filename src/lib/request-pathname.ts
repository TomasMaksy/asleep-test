import { headers } from "next/headers";
import { routing } from "@/i18n/routing";

/** Strip `/en` (and legacy `/lt`) so route matching is locale-agnostic. */
export function stripLocalePrefix(pathname: string) {
  let path = pathname.split("?")[0] || "/";

  if (path === "/lt" || path === "/lt/") {
    path = "/";
  } else if (path.startsWith("/lt/")) {
    path = path.slice(3) || "/";
  }

  for (const locale of routing.locales) {
    if (locale === routing.defaultLocale) continue;
    if (path === `/${locale}`) return "/";
    if (path.startsWith(`/${locale}/`)) {
      return path.slice(locale.length + 1) || "/";
    }
  }

  return path || "/";
}

/**
 * Pathname set by `proxy.ts` for per-route message loading.
 * Missing during some static/build contexts — callers should fall back safely.
 */
export async function getRequestPathname() {
  try {
    const headerStore = await headers();
    const raw = headerStore.get("x-pathname");
    if (!raw) return null;
    return stripLocalePrefix(raw);
  } catch {
    return null;
  }
}
