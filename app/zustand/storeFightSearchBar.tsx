// app/zustand/storeFightSearchBar.ts
"use client";

import type { FightSearchBarStoreState } from "@/types/fight-search-bar";
import { create } from "zustand";
import { createJSONStorage, persist } from "zustand/middleware";

const useFightSearchBarStore = create<FightSearchBarStoreState>()(
  persist(
    (set) => ({
      data: {
        from: "",
        to: "",
        service: "",
        startDate: "",
        endDate: "",
        totalPerson: 0,
        adult: 1,
        child: 0,
        infant: 0,
        minor: 0, // Deprecated: use child + infant instead
      },

      isHydrated: false,

      setData: (newData) =>
        set((state) => ({
          data: { ...state.data, ...newData },
        })),

      setHydrated: (value: boolean) =>
        set(() => ({
          isHydrated: value,
        })),
    }),
    {
      name: "flight-search-data",
      storage: createJSONStorage(() => sessionStorage),
      partialize: (state) => ({ data: state.data }), // chỉ lưu data
      onRehydrateStorage: () => (state) => {
        state?.setHydrated(true);
      },
    }
  )
);

export default useFightSearchBarStore;
