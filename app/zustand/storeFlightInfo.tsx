import type { FlightInfoStore } from "@/types/flight-info";
import { create } from "zustand";
import { createJSONStorage, persist } from "zustand/middleware";

const useStoreFlightInfo = create<FlightInfoStore>()(
  persist(
    (set) => ({
      data: {
        flightInstanceId: "",
        cabinType: "",
      },
      setData: (newData) => {
        set((state) => {
          return {
            data: {
              ...newData,
              ...state.data,
            },
          };
        });
      },
    }),

    {
      name: "flight-info",
      storage: createJSONStorage(() => {
        return sessionStorage;
      }),
    }
  )
);

export default useStoreFlightInfo;
