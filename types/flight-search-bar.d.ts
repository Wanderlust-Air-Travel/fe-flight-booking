interface FlightSearchBarData {
  from: string;
  to: string;
  service: string;
  startDate: string;
  endDate?: string;
  totalPerson: number;
  adult: number;
  child: number; // Child (2-11 years old)
  infant: number; // Infant (<2 years old)
  minor: number; // Deprecated: use child + infant instead
}

export interface FlightSearchBarStoreState {
  data: FlightSearchBarData;
  isHydrated: boolean;
  setData: (data: Partial<FlightSearchBarData>) => void;
  setHydrated: (value: boolean) => void;
}
