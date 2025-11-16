import { FightSearchBarStoreState } from "@/types/fight-search-bar";
import { create } from "zustand";



const useFightSearchBarStore = create<FightSearchBarStoreState>((set) => ({
  data: {
    from: "",
    to: "",
    service:"",
    startDate: "",
    endDate: "",
    totalPerson: 0,
  },

  setData: (newData) =>
    set((state) => ({
      data: { ...state.data, ...newData },
    })),
}));

export default useFightSearchBarStore;
