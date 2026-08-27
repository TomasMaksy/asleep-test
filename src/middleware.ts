import { type NextRequest, NextResponse } from "next/server";
import createMiddleware from "next-intl/middleware";
import { routing } from "@/i18n/routing";

const intlMiddleware = createMiddleware(routing);

export default function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const pathnameWithoutLocale =
    pathname.replace(/^\/(lt|en)(?=\/|$)/, "") || "/";

  request.headers.set("x-pathname", pathnameWithoutLocale);

  const response = intlMiddleware(request);
  if (response instanceof NextResponse) {
    response.headers.set("x-pathname", pathnameWithoutLocale);
  }

  return response;
}

export const config = {
  matcher: ["/((?!api|_next|_vercel|.*\\..*).*)"],
};
