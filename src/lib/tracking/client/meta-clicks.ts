import {
  ASLEEP_FBC_COOKIE,
  ASLEEP_FBP_COOKIE,
  cookieDomainAttribute,
  META_CLICK_ID_MAX_AGE_SECONDS,
  PIXEL_FBC_COOKIE,
  PIXEL_FBP_COOKIE,
  resolveMetaFbc,
  resolveMetaFbp,
} from "@/lib/tracking/meta-clicks";

export {
  cookieDomainAttribute,
  resolveMetaFbc,
  resolveMetaFbp,
} from "@/lib/tracking/meta-clicks";

const FBP_KEY = "asleep.tracking.fbp";
const FBC_KEY = "asleep.tracking.fbc";

export function persistMetaClickIds() {
  if (typeof window === "undefined") {
    return;
  }

  const fbc = resolveMetaFbc({
    pixelFbc: readCookie(PIXEL_FBC_COOKIE),
    storedFbc: readStoredValue(FBC_KEY, ASLEEP_FBC_COOKIE),
    fbclid: fbclidFromLocation(),
  });
  const fbp = resolveMetaFbp({
    pixelFbp: readCookie(PIXEL_FBP_COOKIE),
    storedFbp: readStoredValue(FBP_KEY, ASLEEP_FBP_COOKIE),
  });

  if (fbc) {
    storeValue(FBC_KEY, ASLEEP_FBC_COOKIE, fbc);
    if (readCookie(PIXEL_FBC_COOKIE) !== fbc) {
      writeCookie(PIXEL_FBC_COOKIE, fbc);
    }
  }
  if (fbp) {
    storeValue(FBP_KEY, ASLEEP_FBP_COOKIE, fbp);
    if (readCookie(PIXEL_FBP_COOKIE) !== fbp) {
      writeCookie(PIXEL_FBP_COOKIE, fbp);
    }
  }
}

export function getPersistedMetaClickIds() {
  persistMetaClickIds();
  return {
    fbp:
      readCookie(PIXEL_FBP_COOKIE) ??
      readStoredValue(FBP_KEY, ASLEEP_FBP_COOKIE),
    fbc:
      readCookie(PIXEL_FBC_COOKIE) ??
      readStoredValue(FBC_KEY, ASLEEP_FBC_COOKIE),
  };
}

function fbclidFromLocation() {
  try {
    return (
      new URL(window.location.href).searchParams.get("fbclid") ?? undefined
    );
  } catch {
    return undefined;
  }
}

function readStoredValue(storageKey: string, cookieName: string) {
  try {
    return localStorage.getItem(storageKey) || readCookie(cookieName);
  } catch {
    return readCookie(cookieName);
  }
}

function storeValue(storageKey: string, cookieName: string, value: string) {
  try {
    localStorage.setItem(storageKey, value);
  } catch {
    // Cookie persistence is enough if storage is blocked.
  }
  writeCookie(cookieName, value);
}

function readCookie(name: string) {
  const cookies = Object.fromEntries(
    document.cookie.split(";").flatMap((entry) => {
      const separator = entry.indexOf("=");
      if (separator < 0) {
        return [];
      }
      return [
        [
          entry.slice(0, separator).trim(),
          decodeURIComponent(entry.slice(separator + 1)),
        ],
      ];
    }),
  );
  return cookies[name] || undefined;
}

function writeCookie(name: string, value: string) {
  const secure = window.location.protocol === "https:" ? "; Secure" : "";
  // biome-ignore lint/suspicious/noDocumentCookie: persist click IDs first-party
  document.cookie = `${name}=${encodeURIComponent(value)}; Max-Age=${META_CLICK_ID_MAX_AGE_SECONDS}; Path=/; SameSite=Lax${secure}${cookieDomainAttribute(window.location.hostname)}`;
}
