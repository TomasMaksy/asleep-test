const FBP_KEY = "asleep.tracking.fbp";
const FBC_KEY = "asleep.tracking.fbc";
const FBP_COOKIE = "asleep_fbp";
const FBC_COOKIE = "asleep_fbc";
const NINETY_DAYS_SECONDS = 60 * 60 * 24 * 90;

export function persistMetaClickIds() {
  if (typeof window === "undefined") {
    return;
  }

  const fbc = readStoredValue(FBC_KEY, FBC_COOKIE) ?? fbcFromLocation();
  const fbp = readCookie("_fbp") ?? readStoredValue(FBP_KEY, FBP_COOKIE);

  if (fbc) {
    storeValue(FBC_KEY, FBC_COOKIE, fbc);
  }
  if (fbp) {
    storeValue(FBP_KEY, FBP_COOKIE, fbp);
  }
}

export function getPersistedMetaClickIds() {
  persistMetaClickIds();
  return {
    fbp: readStoredValue(FBP_KEY, FBP_COOKIE) ?? readCookie("_fbp"),
    fbc: readStoredValue(FBC_KEY, FBC_COOKIE) ?? readCookie("_fbc"),
  };
}

function fbcFromLocation() {
  try {
    const clickId = new URL(window.location.href).searchParams.get("fbclid");
    if (!clickId) {
      return undefined;
    }
    return `fb.1.${Date.now()}.${clickId}`;
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
  // biome-ignore lint/suspicious/noDocumentCookie: persist fbclid first-party
  document.cookie = `${name}=${encodeURIComponent(value)}; Max-Age=${NINETY_DAYS_SECONDS}; Path=/; SameSite=Lax${secure}`;
}
