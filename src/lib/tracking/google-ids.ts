export type GoogleIdentifiers = {
  clientId?: string;
  sessionId?: string;
};

const GA_CLIENT_ID_RE = /^\d+\.\d+$/;
const GA_SESSION_ID_RE = /^\d+$/;

export function parseCookieHeader(header: string) {
  return Object.fromEntries(
    header.split(";").flatMap((entry) => {
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
  ) as Record<string, string>;
}

export function ga4StreamCookieName(measurementId: string) {
  return `_ga_${measurementId.replace(/^G-/, "")}`;
}

export function parseGaClientId(cookieValue?: string) {
  const parts = cookieValue?.split(".") ?? [];
  if (parts.length < 4) {
    return undefined;
  }
  const clientId = parts.slice(-2).join(".");
  return GA_CLIENT_ID_RE.test(clientId) ? clientId : undefined;
}

export function parseGaSessionId(cookieValue?: string) {
  const sessionId =
    cookieValue?.match(/(?:^|[.$])s(\d+)(?:[.$]|$)/)?.[1] ??
    cookieValue?.match(/^GS\d+\.\d+\.(\d+)/)?.[1];
  return sessionId && GA_SESSION_ID_RE.test(sessionId) ? sessionId : undefined;
}

export function googleIdentifiersFromCookies(
  cookies: Record<string, string | undefined>,
  measurementId: string,
): GoogleIdentifiers {
  return {
    clientId: parseGaClientId(cookies._ga),
    sessionId: parseGaSessionId(cookies[ga4StreamCookieName(measurementId)]),
  };
}

export function createGaClientId() {
  const random = Math.floor(1_000_000_000 + Math.random() * 9_000_000_000);
  return `${random}.${Math.floor(Date.now() / 1000)}`;
}

export function ga4SessionIdNumber(sessionId?: string) {
  if (!sessionId || !GA_SESSION_ID_RE.test(sessionId)) {
    return undefined;
  }
  const value = Number(sessionId);
  return Number.isSafeInteger(value) && value > 0 ? value : undefined;
}
