
"use client";

import { InfoTicketTypeState } from "@/types/info-ticket-type";
import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";

const useInfoTicket = create<InfoTicketTypeState>()(
  persist(
    (set) => ({
      data: {
        id: "",
        icon: "",
        airline: "",
        startDate: "",
        endDate: "",
        startCode: "",
        endCode: "",
        start: "",
        end: "",
        service: "",
        stopCount: 0,
        stopDuration: "none",
        type: "",
        price: 0,
        desc: [],
        typeTicket: "",
        timeStart: "",
        timeEnd: "",
        fareClassCode: "",
        flightInstanceId: "",
        totalPerson: 0,
        code: 0
      },

      // 👇 thêm field này
      isHydrated: false,

      setData: (newData) =>
        set((state) => ({
          data: { ...state.data, ...newData },
        })),

      // 👇 thêm hàm này để dùng trong onRehydrateStorage
      setHydrated: (value: boolean) =>
        set(() => ({
          isHydrated: value,
        })),
    }),

    {
      name: "info-ticket-storage",
      storage: createJSONStorage(() => sessionStorage),
      // khi hydrate xong từ sessionStorage sẽ gọi vào đây
      onRehydrateStorage: () => (state) => {
        state?.setHydrated(true);
      },
    }
  )
);

export default useInfoTicket;
