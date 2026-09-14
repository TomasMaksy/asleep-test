const CHECKOUT_DISCOUNT_RATES: Record<string, number> = {
  LUCKY99: 0.999,
};

export function normalizeDiscountCode(code: string) {
  return code.trim().toUpperCase();
}

export function discountRateFor(code: string) {
  return CHECKOUT_DISCOUNT_RATES[normalizeDiscountCode(code)] ?? 0;
}

export function acceptedDiscountCode(code: string | undefined) {
  if (!code) {
    return undefined;
  }
  const normalized = normalizeDiscountCode(code);
  return discountRateFor(normalized) > 0 ? normalized : undefined;
}

export function discountedMoney(amount: number, code: string) {
  const off = discountRateFor(code);
  if (off <= 0) {
    return amount;
  }
  return Math.round(amount * (1 - off) * 100) / 100;
}

export function discountedCents(amountCents: number, code: string) {
  const off = discountRateFor(code);
  if (off <= 0) {
    return amountCents;
  }
  return Math.max(1, Math.round(amountCents * (1 - off)));
}
