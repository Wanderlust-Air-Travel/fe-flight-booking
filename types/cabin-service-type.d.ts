/**
 * Cabin Service Types
 * Separated from component for better code organization
 */

export interface CabinService {
	cabinServiceId: string;
	serviceType: string;
	serviceName: string;
	description: string | null;
	isIncluded: boolean;
	price: number | null;
	displayOrder: number;
	iconUrl: string | null;
}

export interface CabinServicesSelectorProps {
	flightInstanceId: string;
	fareClassCode: string;
	cabinClassCode: string;
	onServicesChange?: (services: CabinService[]) => void;
	/** Khi true (vd. check-in đang prime cabin), nút Lưu bị disable */
	saveDisabled?: boolean;
}

export interface CabinServiceResponse {
	services: CabinService[];
}

