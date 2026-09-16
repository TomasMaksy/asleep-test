import { type NextRequest, NextResponse } from "next/server";
import createMiddleware from "next-intl/middleware";
import { routing } from "@/i18n/routing";
import { applyMetaFbcCookies } from "@/lib/tracking/meta-clicks";

const handleI18nRouting = createMiddleware(routing);

function isPostHogIngestPath(pathname: string) {
  return (
    pathname === "/ingest" ||
    pathname.startsWith("/ingest/") ||
    /^\/(lt|en)\/ingest(?:\/|$)/.test(pathname)
  );
}

export default function proxy(request: NextRequest) {
  if (isPostHogIngestPath(request.nextUrl.pathname)) {
    return NextResponse.next();
  }

  // Set `_fbc` / `asleep_fbc` on the i18n response (including locale
  // redirects) so Click ID survives before the Pixel or client JS runs.
  return applyMetaFbcCookies(request, handleI18nRouting(request));
}

export const config = {
  matcher: ["/((?!api|ingest|_next|_vercel|.*\\..*).*)"],
};
