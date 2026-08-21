export interface Airline {
  airlineId: string;
  iataCode: string;
  icaoCode?: string | null;
  name: string;
  country?: string | null;
  logoUrl?: string | null;
  createdAt?: string;
  updatedAt?: string;
}

export interface AirlineListItem {
  airlineId: string;
  iataCode: string;
  name: string;
}
