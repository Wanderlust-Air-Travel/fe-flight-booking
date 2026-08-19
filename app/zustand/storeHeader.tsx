import type { IsActiveState } from "@/types/header-type";
import { create } from "zustand";

const useIsActiveStore = create<IsActiveState>((set) => ({
  isActive: false,
  handleIsActive: () => set({ isActive: true }),
}));

export default useIsActiveStore;
