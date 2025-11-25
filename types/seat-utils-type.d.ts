import { SeatItem } from "./seat-type";

export interface SeatRow {
    rowNumber: number;
    seats: SeatItem[];
    leftSeats: SeatItem[];
    rightSeats: SeatItem[];
}

export interface SeatSection {
    name: "front" | "middle" | "back";
    rows: SeatRow[];
    startRow: number;
    endRow: number;
}

