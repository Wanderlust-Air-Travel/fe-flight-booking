 interface FightSearchBarData {
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

export interface FightSearchBarStoreState {
  data: FightSearchBarData;
  setData: (data: Partial<FightSearchBarData>) => void;
}
