export interface Airport {
  airportId: string;
  iataCode: string;
  icaoCode?: string | null;
  name: string;
  city: string;
  country: string;
  timezone: string;
  latitude?: number | null;
  longitude?: number | null;
  createdAt?: string;
  updatedAt?: string;
}

export interface CreateAirportDto {
  iataCode: string;
  icaoCode?: string;
  name: string;
  city: string;
  country: string;
  timezone: string;
  latitude?: number;
  longitude?: number;
}

export interface UpdateAirportDto {
  icaoCode?: string;
  name?: string;
  city?: string;
  country?: string;
  timezone?: string;
  latitude?: number;
  longitude?: number;
}
