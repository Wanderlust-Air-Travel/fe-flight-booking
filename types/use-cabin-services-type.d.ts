/**
 * useCabinServices Hook Types
 */

import { CabinService } from "./cabin-service-type";

export interface UseCabinServicesParams {
	fareClassCode: string;
	cabinClassCode: string;
	isLoggedIn: boolean;
}

export interface UseCabinServicesReturn {
	services: CabinService[];
	selectedServices: Set<string>;
	loading: boolean;
	error: string | null;
	saving: boolean;
	totalPrice: number;
	toggleService: (serviceId: string, isIncluded: boolean) => void;
	saveServices: (flightInstanceId: string) => Promise<void>;
}

