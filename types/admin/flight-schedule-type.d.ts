export interface FlightSchedule {
    flightScheduleId: string;
    flightNumber: string;
    route?: {
        routeId: string;
        originAirport?: { iataCode: string; name: string };
        destinationAirport?: { iataCode: string; name: string };
    };
    aircraftType?: { code: string; model: string };
    departureTime: string;
    arrivalTime: string;
    operatingDays: string;
    effectiveFrom: string;
    effectiveTo: string;
    status: string;
}

