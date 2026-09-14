const PRODUCTION_HOSTS = new Set(["asleep.lt", "www.asleep.lt"]);

export function isTrustedSiteRequest(request: Request) {
  if (request.headers.get("sec-fetch-site") === "cross-site") {
    return false;
  }

  const origin = requestOrigin(request);
  if (!origin) {
    return false;
  }

  return isAllowedOrigin(origin);
}

export function isAllowedOrigin(origin: string, env = process.env) {
  const parsed = parseOrigin(origin);
  if (!parsed) {
    return false;
  }

  if (isProduction(env)) {
    if (parsed.protocol !== "https:") {
      return false;
    }
    return allowedProductionHosts(env).has(parsed.host);
  }

  if (isLocalhostHost(parsed.host) && parsed.protocol === "http:") {
    return true;
  }

  if (parsed.protocol !== "https:") {
    return false;
  }

  return allowedProductionHosts(env).has(parsed.host);
}

export function isAllowedEventUrl(urlValue: string, env = process.env) {
  try {
    return isAllowedOrigin(new URL(urlValue).origin, env);
  } catch {
    return false;
  }
}

function requestOrigin(request: Request) {
  const origin = request.headers.get("origin");
  if (origin) {
    return origin;
  }

  const referrer = request.headers.get("referer");
  if (!referrer) {
    return undefined;
  }

  try {
    return new URL(referrer).origin;
  } catch {
    return undefined;
  }
}

function allowedProductionHosts(env = process.env) {
  const hosts = new Set(PRODUCTION_HOSTS);
  const siteHost = hostFromEnvUrl(
    env.NEXT_PUBLIC_SITE_URL ?? "https://asleep.lt",
  );
  if (siteHost) {
    hosts.add(siteHost);
  }
  return hosts;
}

function hostFromEnvUrl(value: string) {
  try {
    return new URL(value).host.toLowerCase();
  } catch {
    return undefined;
  }
}

function parseOrigin(origin: string) {
  try {
    const url = new URL(origin);
    if (url.protocol !== "http:" && url.protocol !== "https:") {
      return undefined;
    }
    if (url.pathname !== "/" || url.search || url.hash) {
      return undefined;
    }
    return { protocol: url.protocol, host: url.host.toLowerCase() };
  } catch {
    return undefined;
  }
}

function isLocalhostHost(host: string) {
  return /^(localhost|127\.0\.0\.1|\[::1\])(?::\d+)?$/.test(host);
}

function isProduction(env = process.env) {
  return env.NODE_ENV === "production";
}
