import { type NextRequest, NextResponse } from "next/server";
import createMiddleware from "next-intl/middleware";
import { routing } from "@/i18n/routing";

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

  return handleI18nRouting(request);
}

export const config = {
  matcher: ["/((?!api|ingest|_next|_vercel|.*\\..*).*)"],
};
