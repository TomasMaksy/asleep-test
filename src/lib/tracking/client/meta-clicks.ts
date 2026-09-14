const FBP_KEY = "asleep.tracking.fbp";
const FBC_KEY = "asleep.tracking.fbc";
const FBP_COOKIE = "asleep_fbp";
const FBC_COOKIE = "asleep_fbc";
const PIXEL_FBP = "_fbp";
const PIXEL_FBC = "_fbc";
const NINETY_DAYS_SECONDS = 60 * 60 * 24 * 90;

export function persistMetaClickIds() {
  if (typeof window === "undefined") {
    return;
  }

  const fbc = resolveMetaFbc({
    pixelFbc: readCookie(PIXEL_FBC),
    storedFbc: readStoredValue(FBC_KEY, FBC_COOKIE),
    fbclid: fbclidFromLocation(),
  });
  const fbp = resolveMetaFbp({
    pixelFbp: readCookie(PIXEL_FBP),
    storedFbp: readStoredValue(FBP_KEY, FBP_COOKIE),
  });

  if (fbc) {
    storeValue(FBC_KEY, FBC_COOKIE, fbc);
    if (!readCookie(PIXEL_FBC)) {
      writeCookie(PIXEL_FBC, fbc);
    }
  }
  if (fbp) {
    storeValue(FBP_KEY, FBP_COOKIE, fbp);
    if (!readCookie(PIXEL_FBP)) {
      writeCookie(PIXEL_FBP, fbp);
    }
  }
}

export function getPersistedMetaClickIds() {
  persistMetaClickIds();
  return {
    fbp: readCookie(PIXEL_FBP) ?? readStoredValue(FBP_KEY, FBP_COOKIE),
    fbc: readCookie(PIXEL_FBC) ?? readStoredValue(FBC_KEY, FBC_COOKIE),
  };
}

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
  if (pixelFbc) {
    return pixelFbc;
  }
  if (storedFbc && (!fbclid || clickIdFromFbc(storedFbc) === fbclid)) {
    return storedFbc;
  }
  if (!fbclid) {
    return storedFbc;
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

export function cookieDomainAttribute(hostname: string) {
  const host = hostname.replace(/\.$/, "").toLowerCase();
  if (host === "localhost" || host.endsWith(".localhost")) {
    return "";
  }
  if (host === "asleep.lt" || host.endsWith(".asleep.lt")) {
    return "; Domain=.asleep.lt";
  }
  return "";
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

function clickIdFromFbc(value: string) {
  const parts = value.split(".");
  return parts.length >= 4 ? parts.slice(3).join(".") : undefined;
}

function createFbpRandomId() {
  const bytes = new Uint32Array(2);
  crypto.getRandomValues(bytes);
  return `${bytes[0]}${bytes[1]}`;
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
  document.cookie = `${name}=${encodeURIComponent(value)}; Max-Age=${NINETY_DAYS_SECONDS}; Path=/; SameSite=Lax${secure}${cookieDomainAttribute(window.location.hostname)}`;
}
