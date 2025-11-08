import { create } from "zustand";


interface IsActiveState {
    isActive: boolean;
    handleIsActive: () => void;
}


const useIsActiveStore = create<IsActiveState>((set) => ({
    isActive: false,
    handleIsActive: () => set({ isActive: true }),
}));

export default useIsActiveStore;
