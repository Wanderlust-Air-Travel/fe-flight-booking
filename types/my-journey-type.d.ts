export interface MyJourneyItem {
  journeyId: string
  pnrCode: string
  originAirport: string
  originAirportName: string
  originCity: string
  destinationAirport: string
  destinationAirportName: string
  destinationCity: string
  departureDateTime: string
  arrivalDateTime: string
  flightNumber: string
  numberOfPassengers: number
  isDomestic: boolean
  bookingDate: string
  status: string
}

export interface MyJourneyResponse {
  journeys: MyJourneyItem[]
  totalJourneys: number
}

