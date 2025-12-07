export interface FlightSchedule {
    flightScheduleId: string;
    flightNumber: string;
    routeId?: string;
    route?: {
        routeId: string;
        originAirport?: { iataCode: string; name: string };
        destinationAirport?: { iataCode: string; name: string };
    };
    aircraftTypeId?: string;
    aircraftType?: { code: string; model: string };
    departureTime: string;
    arrivalTime: string;
    operatingDays: string;
    effectiveFrom: string | Date;
    effectiveTo: string | Date;
    status: string;
}

