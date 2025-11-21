export interface InfoTicketType {
  id: number;
  icon:string;
  code: number;
  airline: string;
  startDate: string;
  duration: string;
  durationLocation: string;
  service: string;
  endDate: string;
  totalPerson: number;
  stopCount: number;
  stopDuration: string;
  totalTime: string;
  typeTicket: string;
  price: number;
  type:string,
  desc: {
    text: string;
    status: boolean;
  }[];
}
interface InfoTicketTypeState {
  data: InfoTicketType;
  setData: (data: Partial<InfoTicketType>) => void;
   // 👇 thêm để check hydrate
   isHydrated: boolean;
    // 👇 thêm
  setHydrated: (value: boolean) => void;
}
