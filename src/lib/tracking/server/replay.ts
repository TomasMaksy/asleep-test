const PAST_MS = 10 * 60 * 1000;
const FUTURE_MS = 2 * 60 * 1000;

export function isWithinReplayWindow(occurredAt: string, now = Date.now()) {
  const timestamp = Date.parse(occurredAt);
  if (Number.isNaN(timestamp)) {
    return false;
  }
  return timestamp <= now + FUTURE_MS && timestamp >= now - PAST_MS;
}
