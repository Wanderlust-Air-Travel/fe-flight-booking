 interface FightSearchBarData {
  from: string;
  to: string;
  service: string;
  startDate: string;
  endDate?: string;
  totalPerson: number;
  minor:number,
  adult:number
}

export interface FightSearchBarStoreState {
  data: FightSearchBarData;
  setData: (data: Partial<FightSearchBarData>) => void;
}
