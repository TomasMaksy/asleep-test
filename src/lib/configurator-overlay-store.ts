import { create } from "zustand";

type ConfiguratorOverlayState = {
  isOpen: boolean;
  setOpen: (isOpen: boolean) => void;
};

export const CONFIGURATOR_OVERLAY_DURATION_MS = 700;

export const useConfiguratorOverlayStore = create<ConfiguratorOverlayState>(
  (set) => ({
    isOpen: false,
    setOpen: (isOpen) => set({ isOpen }),
  }),
);
