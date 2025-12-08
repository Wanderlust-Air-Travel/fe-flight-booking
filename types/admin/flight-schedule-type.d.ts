export interface Airport {
    airportId: string;
    iataCode: string;
    icaoCode?: string | null;
    name: string;
    city: string;
    country: string;
    timezone: string;
}

export interface Route {
    routeId: string;
    originAirport?: Airport;
    destinationAirport?: Airport;
    distanceKm?: number | null;
    isDomestic: boolean;
}

export interface AircraftType {
    aircraftTypeId: string;
    code: string;
    manufacturer: string;
    model: string;
    totalSeats: number;
}

export interface FlightSchedule {
    flightScheduleId: string;
    flightNumber: string;
    routeId: string;
    route?: Route;
    aircraftTypeId: string;
    aircraftType?: AircraftType;
    departureTime: string;
    arrivalTime: string;
    operatingDays: string;
    effectiveFrom: string | Date;
    effectiveTo: string | Date;
    status: string;
}

