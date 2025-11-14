import { create } from "zustand";

interface FightSearchBarData {
  from: string;
  to: string;
  service:string,
  startDate: string;
  endDate?: string;
  totalPerson: number;
}

interface FightSearchBarStoreState {
  data: FightSearchBarData;
  setData: (data: Partial<FightSearchBarData>) => void;
}

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
