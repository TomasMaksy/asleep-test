import { create } from "zustand";
import { readCheckoutDraft, writeCheckoutDraft } from "@/lib/checkout-draft";

const hiddenOff: Record<string, number> = {
  LUCKY99: 0.999,
};

function normalizeCode(code: string) {
  return code.trim().toUpperCase();
}

function offFor(code: string) {
  return hiddenOff[normalizeCode(code)] ?? 0;
}

function appliedFromDraft() {
  if (typeof window === "undefined") {
    return "";
  }
  const code = normalizeCode(readCheckoutDraft().appliedDiscountCode);
  return offFor(code) > 0 ? code : "";
}

export function discountedMoney(amount: number, code: string) {
  const off = offFor(code);
  if (off <= 0) {
    return amount;
  }
  return Math.round(amount * (1 - off) * 100) / 100;
}

export function discountedCents(amountCents: number, code: string) {
  const off = offFor(code);
  if (off <= 0) {
    return amountCents;
  }
  return Math.max(1, Math.round(amountCents * (1 - off)));
}

export const useCheckoutDiscountStore = create<{
  applied: string;
  apply: (code: string) => boolean;
}>((set) => ({
  applied: appliedFromDraft(),
  apply: (code) => {
    const normalized = normalizeCode(code);
    if (offFor(normalized) <= 0) {
      return false;
    }
    writeCheckoutDraft({ appliedDiscountCode: normalized });
    set({ applied: normalized });
    return true;
  },
}));
