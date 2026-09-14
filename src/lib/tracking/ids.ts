export const VISITOR_ID_KEY = "asleep.tracking.visitor_id";
export const CHECKOUT_ID_KEY = "asleep.tracking.checkout_id";
const CHECKOUT_INITIATED_PREFIX = "asleep.tracking.checkout_initiated.";
const UUID_RE =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[1-8][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

export function isTrackingUuid(
  value: string | undefined | null,
): value is string {
  return Boolean(value && UUID_RE.test(value));
}

export type TrackingStorage = Pick<
  Storage,
  "getItem" | "setItem" | "removeItem"
>;

export function createTrackingId() {
  return globalThis.crypto.randomUUID();
}

export function getOrCreateStoredId(
  storage: TrackingStorage,
  key: string,
  createId: () => string = createTrackingId,
) {
  try {
    const current = storage.getItem(key);
    if (current) {
      return current;
    }
    const next = createId();
    storage.setItem(key, next);
    return next;
  } catch {
    return createId();
  }
}

export function getVisitorId() {
  return getOrCreateUuid(localStorage, VISITOR_ID_KEY);
}

export function getCheckoutId() {
  return getOrCreateUuid(sessionStorage, CHECKOUT_ID_KEY);
}

function getOrCreateUuid(storage: TrackingStorage, key: string) {
  try {
    const current = storage.getItem(key);
    if (isTrackingUuid(current)) {
      return current;
    }
    const next = createTrackingId();
    storage.setItem(key, next);
    return next;
  } catch {
    return createTrackingId();
  }
}

export function claimCheckoutInitiated(
  checkoutId: string,
  storage: TrackingStorage = sessionStorage,
) {
  const key = `${CHECKOUT_INITIATED_PREFIX}${checkoutId}`;
  try {
    if (storage.getItem(key)) {
      return false;
    }
    storage.setItem(key, "1");
    return true;
  } catch {
    return true;
  }
}

export function completeCheckout(
  checkoutId: string,
  storage: TrackingStorage = sessionStorage,
) {
  try {
    if (storage.getItem(CHECKOUT_ID_KEY) === checkoutId) {
      storage.removeItem(CHECKOUT_ID_KEY);
    }
    storage.removeItem(`${CHECKOUT_INITIATED_PREFIX}${checkoutId}`);
  } catch {
    // A blocked storage API must never block checkout completion.
  }
}
