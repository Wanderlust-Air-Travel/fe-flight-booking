// app/zustand/storeFightSearchBar.ts
"use client";

import { FightSearchBarStoreState } from "@/types/fight-search-bar";
import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";

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
        minor: 0,
      },

      setData: (newData) =>
        set((state) => ({
          data: { ...state.data, ...newData },
        })),
    }),
    {
      name: "flight-search-data",
      storage: createJSONStorage(() => sessionStorage),
      partialize: (state) => ({ data: state.data }), // chỉ lưu data
    }
  )
);

export default useFightSearchBarStore;
