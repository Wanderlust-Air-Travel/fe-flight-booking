interface FightInfoData{
    flightInstanceId:string,
    cabinType:string
}

export interface FightInfoStore {
    data: FightInfoData;
    setData: (data: Partial<FightInfoData>) => void;
  }