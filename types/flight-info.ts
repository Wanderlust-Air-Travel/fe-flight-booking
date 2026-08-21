interface FlightInfoData {
  flightInstanceId: string;
  cabinType: string;
}

export interface FlightInfoStore {
  data: FlightInfoData;
  setData: (data: Partial<FlightInfoData>) => void;
}
