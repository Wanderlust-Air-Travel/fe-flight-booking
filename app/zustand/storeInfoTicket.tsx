
import { InfoTicketTypeState } from "@/types/info-ticket-type";
import { create } from "zustand";



const useInfoTicket = create<InfoTicketTypeState>((set) => ({
  data: {
    id: 0,
    code: 0,
    icon:"",
    airline: "",
    startDate: "",
    duration: "",
    durationLocation: "",
    service: "",
    endDate: "",
    totalPerson: 1,
    stopCount: 0,
    stopDuration: "",
    totalTime: "",
    typeTicket: "",
    price: 0,
    desc: []
  },

  setData: (newData) =>
    set((state) => ({
      data: { ...state.data, ...newData },
    })),
}));

export default useInfoTicket;
