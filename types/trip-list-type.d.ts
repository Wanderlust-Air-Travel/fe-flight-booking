// Backend API Response Format (matching FlightResultDto from backend)
export interface AirportInfo {
    iata: string;
    city: string;
    name?: string;
}

export interface CabinTypeInfo {
    cabinType: string; // 'economy' | 'business' | 'first'
    availableSeats: number;
}

export interface TripListType {
    flightInstanceId: string;
    flightNumber: string;
    departureLocal: Date | string;
    arrivalLocal: Date | string;
    availableSeats: number;
    origin: AirportInfo;
    destination: AirportInfo;
    stopCount?: number;
    stopDuration?: string;
    cabinTypes?: CabinTypeInfo[]; // Available cabin types with seat counts
}

// Backend API Response Format (matching SearchFlightsResponseDto from backend)
export interface TripListProps {
    tripType: string; // "one_way" | "round_trip"
    outbound: TripListType[];
    inbound?: TripListType[];
    totalPassengers?: number;
}

