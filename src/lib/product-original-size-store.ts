import { create } from "zustand";
import {
  DEFAULT_MATTRESS_SIZE_ID,
  type MattressSizeId,
} from "@/lib/product-original-sizes";

type OriginalSizeState = {
  sizeId: MattressSizeId;
  setSizeId: (sizeId: MattressSizeId) => void;
};

export const useOriginalSizeStore = create<OriginalSizeState>((set) => ({
  sizeId: DEFAULT_MATTRESS_SIZE_ID,
  setSizeId: (sizeId) => set({ sizeId }),
}));
