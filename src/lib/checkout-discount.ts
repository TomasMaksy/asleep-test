import { create } from "zustand";
import {
  acceptedDiscountCode,
  discountedCents,
  discountedMoney,
} from "@/lib/checkout-codes";
import { readCheckoutDraft, writeCheckoutDraft } from "@/lib/checkout-draft";

export { discountedCents, discountedMoney };

function appliedFromDraft() {
  if (typeof window === "undefined") {
    return "";
  }
  return acceptedDiscountCode(readCheckoutDraft().appliedDiscountCode) ?? "";
}

export const useCheckoutDiscountStore = create<{
  applied: string;
  apply: (code: string) => boolean;
}>((set) => ({
  applied: appliedFromDraft(),
  apply: (code) => {
    const normalized = acceptedDiscountCode(code);
    if (!normalized) {
      return false;
    }
    writeCheckoutDraft({ appliedDiscountCode: normalized });
    set({ applied: normalized });
    return true;
  },
}));
