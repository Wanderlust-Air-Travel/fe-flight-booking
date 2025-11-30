// types/seat-type.ts

// Legacy mock data format (for development/testing)
export interface LegacySeatItem {
  idCabin: string;
  title: string;
  type: string;
  pos: "left" | "right";
  note: string;
  buyed: boolean;
}

// Backend API Response Format (matching SeatDto from backend)
export interface SeatItem {
  flightSeatId: string; // UUID v7 - use this for reservation
  seatNumber: string; // e.g., "A1", "B2"
  cabinClassCode: string; // e.g., "Y", "C"
  seatType: string | null; // "window", "aisle", "middle"
  isExitRow: boolean;
  position: "left" | "right"; // Backend uses "position" instead of "pos"
  isAvailable: boolean; // Whether the seat is available
  note: string | null; // Fare class note code (e.g., "bf", "ef")
  isSelectable: boolean; // Whether this seat can be selected based on requested cabin type
  
  // Legacy fields for backward compatibility (if needed)
  idCabin?: string; // Deprecated - use flightSeatId instead
  title?: string; // Deprecated - use seatNumber instead
  type?: string; // Deprecated
  pos?: "left" | "right"; // Deprecated - use position instead
  buyed?: boolean; // Deprecated - use !isAvailable instead
}

// Legacy mock data format (for development/testing)
export interface LegacySeatGroup {
  id: "business" | "economy";
  list: LegacySeatItem[];
}

// Backend API Response Format (matching SeatMapGroupDto from backend)
export interface SeatGroup {
  id: "business" | "economy"; // Backend uses "id" not "cabinType"
  list: SeatItem[];
  
  // Legacy field for backward compatibility
  cabinType?: "business" | "economy"; // Deprecated - use id instead
}

export interface FlightSeats {
  flightCode: string;
  seats: SeatGroup[];
}

export interface LegacyFlightSeats {
  flightCode: string;
  seats: LegacySeatGroup[];
}

export type SeatMapRecord = Record<string, FlightSeats>;
export type LegacySeatMapRecord = Record<string, LegacyFlightSeats>;
