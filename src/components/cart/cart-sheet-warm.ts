/**
 * Shared cart-sheet chunk warm. Safe to call from buttons/hosts;
 * module cache dedupes parallel imports.
 */
export function warmCartSheet() {
  void import("@/components/cart/cart-sheet");
  for (const listener of readyListeners) {
    listener();
  }
}

const readyListeners = new Set<() => void>();

/** Used by CartSheetHost to mount as soon as anything warms the sheet. */
export function subscribeCartSheetWarm(listener: () => void) {
  readyListeners.add(listener);
  return () => {
    readyListeners.delete(listener);
  };
}
