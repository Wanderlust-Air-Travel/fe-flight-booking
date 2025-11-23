export interface InfoTicketType {
  id: number;
  icon:string;
  code: number;
  airline: string;
  startDate: string;
  endDate: string;
  startCode: trip.origin.iata,
  endCode: trip.origin.iata,
  start:string,
  end:string,
  service: string;
  totalPerson: number;
  stopCount: number;
  stopDuration: string;
  price: number;
  type:string,
  timeStart:string,
  timeEnd:string,
  typeTicket:string,
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
