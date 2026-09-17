import { NextRequest, NextResponse } from "next/server";
import createMiddleware from "next-intl/middleware";
import { routing } from "@/i18n/routing";
import { stripLocalePrefix } from "@/lib/request-pathname";
import { applyMetaFbcCookies } from "@/lib/tracking/meta-clicks";

const handleI18nRouting = createMiddleware(routing);
const CANONICAL_HOST = "asleep.lt";

function isPostHogIngestPath(pathname: string) {
  return (
    pathname === "/ingest" ||
    pathname.startsWith("/ingest/") ||
    /^\/(lt|en)\/ingest(?:\/|$)/.test(pathname)
  );
}

/** Strip legacy default-locale `/lt` prefix (kept in sync with next.config). */
function stripLegacyLtPrefix(pathname: string) {
  if (pathname === "/lt" || pathname === "/lt/") {
    return "/";
  }
  if (
    pathname.startsWith("/lt/") &&
    !pathname.startsWith("/lt/ingest/") &&
    pathname !== "/lt/ingest"
  ) {
    return pathname.slice(3) || "/";
  }
  return pathname;
}

/** Forward locale-stripped path so `i18n/request.ts` can load messages per route. */
function withPathnameHeader(request: NextRequest) {
  const headers = new Headers(request.headers);
  headers.set(
    "x-pathname",
    stripLocalePrefix(stripLegacyLtPrefix(request.nextUrl.pathname)),
  );
  return new NextRequest(request, { headers });
}

/**
 * Single-hop www → apex (+ legacy /lt strip) so crawlers never see
 * www…/lt/… → apex…/lt/… → apex…/….
 * Requires www requests to reach this app (disable host-only www redirects
 * at the DNS/hosting layer if they run first).
 */
function redirectWwwToCanonical(request: NextRequest) {
  if (request.nextUrl.hostname !== `www.${CANONICAL_HOST}`) {
    return null;
  }

  const url = request.nextUrl.clone();
  url.protocol = "https:";
  url.hostname = CANONICAL_HOST;
  url.port = "";
  url.pathname = stripLegacyLtPrefix(url.pathname);
  return NextResponse.redirect(url, 308);
}

export default function proxy(request: NextRequest) {
  if (isPostHogIngestPath(request.nextUrl.pathname)) {
    return NextResponse.next();
  }

  const wwwRedirect = redirectWwwToCanonical(request);
  if (wwwRedirect) {
    return wwwRedirect;
  }

  const requestWithPath = withPathnameHeader(request);

  // Set `_fbc` / `asleep_fbc` on the i18n response (including locale
  // redirects) so Click ID survives before the Pixel or client JS runs.
  return applyMetaFbcCookies(
    requestWithPath,
    handleI18nRouting(requestWithPath),
  );
}

export const config = {
  matcher: ["/((?!api|ingest|_next|_vercel|.*\\..*).*)"],
};
