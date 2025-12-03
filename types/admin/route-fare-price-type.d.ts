export interface Route {
    routeId: string;
    originAirport?: { iataCode: string; city: string };
    destinationAirport?: { iataCode: string; city: string };
}

export interface FareClass {
    fareClassCode: string;
    description: string | null;
}

export interface RouteFarePrice {
    routeFarePriceId: string;
    routeId: string;
    route?: Route;
    fareClassCode: string;
    fareClass?: FareClass;
    basePrice: number;
    taxRate: number;
    feeRate: number;
    effectiveFrom: string;
    effectiveTo: string | null;
    isActive: boolean;
    priority: number;
    notes: string | null;
}

