import { FareClass } from './route-fare-price-type';

export interface BaggageAllowance {
    baggageAllowanceId: string;
    fareClassCode: string;
    fareClass?: FareClass;
    checkedBaggageKg: number | null;
    checkedBaggagePieces: number | null;
    carryOnKg: number;
    carryOnPieces: number;
    carryOnDimensions: string | null;
    isDomestic: boolean;
    isInternational: boolean;
    notes: string | null;
}

