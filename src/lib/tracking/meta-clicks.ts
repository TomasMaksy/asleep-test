import type { NextRequest, NextResponse } from "next/server";

export const PIXEL_FBP_COOKIE = "_fbp";
export const PIXEL_FBC_COOKIE = "_fbc";
export const ASLEEP_FBP_COOKIE = "asleep_fbp";
export const ASLEEP_FBC_COOKIE = "asleep_fbc";
export const META_CLICK_ID_MAX_AGE_SECONDS = 60 * 60 * 24 * 90;

export function resolveMetaFbc({
  pixelFbc,
  storedFbc,
  fbclid,
  now = Date.now(),
}: {
  pixelFbc?: string;
  storedFbc?: string;
  fbclid?: string;
  now?: number;
}) {
  if (pixelFbc && (!fbclid || clickIdFromFbc(pixelFbc) === fbclid)) {
    return pixelFbc;
  }
  if (storedFbc && (!fbclid || clickIdFromFbc(storedFbc) === fbclid)) {
    return storedFbc;
  }
  if (!fbclid) {
    return pixelFbc ?? storedFbc;
  }
  return `fb.1.${now}.${fbclid}`;
}

export function resolveMetaFbp({
  pixelFbp,
  storedFbp,
  now = Date.now(),
  randomId = createFbpRandomId(),
}: {
  pixelFbp?: string;
  storedFbp?: string;
  now?: number;
  randomId?: string;
}) {
  if (pixelFbp) {
    return pixelFbp;
  }
  if (storedFbp) {
    return storedFbp;
  }
  return `fb.1.${now}.${randomId}`;
}

/** Domain option for Next.js `cookies.set`, or undefined for host-only. */
export function cookieDomain(hostname: string) {
  const host = hostname.replace(/\.$/, "").toLowerCase();
  if (host === "localhost" || host.endsWith(".localhost")) {
    return undefined;
  }
  if (host === "asleep.lt" || host.endsWith(".asleep.lt")) {
    return ".asleep.lt";
  }
  return undefined;
}

/** Suffix for `document.cookie` Domain attribute. */
export function cookieDomainAttribute(hostname: string) {
  const domain = cookieDomain(hostname);
  return domain ? `; Domain=${domain}` : "";
}

/**
 * Persist `_fbc` / `asleep_fbc` on the first HTML response when `fbclid` is
 * present. Does not mint `_fbp` — leave that to the Pixel / client.
 */
export function applyMetaFbcCookies(
  request: NextRequest,
  response: NextResponse,
) {
  const fbclid = request.nextUrl.searchParams.get("fbclid") ?? undefined;
  if (!fbclid) {
    return response;
  }

  const pixelFbc = request.cookies.get(PIXEL_FBC_COOKIE)?.value;
  const storedFbc = request.cookies.get(ASLEEP_FBC_COOKIE)?.value;
  const fbc = resolveMetaFbc({ pixelFbc, storedFbc, fbclid });
  if (!fbc) {
    return response;
  }

  const options = {
    maxAge: META_CLICK_ID_MAX_AGE_SECONDS,
    path: "/",
    sameSite: "lax" as const,
    secure: request.nextUrl.protocol === "https:",
    domain: cookieDomain(request.nextUrl.hostname),
  };

  if (pixelFbc !== fbc) {
    response.cookies.set(PIXEL_FBC_COOKIE, fbc, options);
  }
  if (storedFbc !== fbc) {
    response.cookies.set(ASLEEP_FBC_COOKIE, fbc, options);
  }

  return response;
}

export function clickIdFromFbc(value: string) {
  const parts = value.split(".");
  return parts.length >= 4 ? parts.slice(3).join(".") : undefined;
}

function createFbpRandomId() {
  const bytes = new Uint32Array(2);
  crypto.getRandomValues(bytes);
  return `${bytes[0]}${bytes[1]}`;
}
