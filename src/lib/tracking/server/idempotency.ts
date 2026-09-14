type Claim = {
  expiresAt: number;
};

const claims = new Map<string, Claim>();
const MAX_CLAIMS = 10_000;
const DEFAULT_TTL_MS = 24 * 60 * 60 * 1000;

export function claimOnce(
  key: string,
  ttlMs = DEFAULT_TTL_MS,
  now = Date.now(),
) {
  pruneExpired(now);
  const existing = claims.get(key);
  if (existing && existing.expiresAt > now) {
    return false;
  }

  claims.set(key, { expiresAt: now + ttlMs });
  return true;
}

export function resetIdempotencyForTests() {
  claims.clear();
}

function pruneExpired(now: number) {
  if (claims.size <= MAX_CLAIMS) {
    return;
  }
  for (const [key, claim] of claims) {
    if (claim.expiresAt <= now) {
      claims.delete(key);
    }
  }
}
