import type { Airport } from './airport-type';

export interface Route {
  routeId: string;
  originAirportId: string;
  destinationAirportId: string;
  distance?: number | null;
  isDomestic: boolean;
  createdAt?: string;
  updatedAt?: string;
  originAirport?: Airport;
  destinationAirport?: Airport;
}

export interface CreateRouteDto {
  originAirportId: string;
  destinationAirportId: string;
  distance?: number;
}

export interface UpdateRouteDto {
  distance?: number;
}
