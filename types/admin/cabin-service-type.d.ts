import { FareClass } from './route-fare-price-type';

export interface CabinClass {
    cabinClassCode: string;
    name: string;
}

export interface CabinService {
    cabinServiceId: string;
    cabinClassCode: string | null;
    cabinClass?: CabinClass;
    fareClassCode: string | null;
    fareClass?: FareClass;
    serviceType: string;
    serviceName: string;
    description: string | null;
    isIncluded: boolean;
    price: number | null;
    isActive: boolean;
    displayOrder: number;
    iconUrl: string | null;
}

