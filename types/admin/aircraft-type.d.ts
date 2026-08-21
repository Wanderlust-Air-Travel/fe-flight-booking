export interface AircraftType {
  aircraftTypeId: string;
  typeCode: string;
  manufacturer: string;
  model: string;
  totalSeats: number;
  createdAt?: string;
  updatedAt?: string;
}

export interface CreateAircraftTypeDto {
  typeCode: string;
  manufacturer: string;
  model: string;
  totalSeats: number;
}

export interface UpdateAircraftTypeDto {
  manufacturer?: string;
  model?: string;
  totalSeats?: number;
}
