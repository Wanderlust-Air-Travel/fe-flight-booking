// types/seat-type.ts

export interface SeatItem {
  idCabin: string;
  title: string;
  type: string; // vd: "business-flex"
  pos: "left" | "right";
  note: string; // vd: "bf", "bs"
  buyed: boolean;
}

export interface SeatGroup {
  cabinType: "business" | "economy";
  list: SeatItem[];
}

export interface FlightSeats {
  flightCode: string;
  seats: SeatGroup[];
}

export type SeatMapRecord = Record<string, FlightSeats>;
