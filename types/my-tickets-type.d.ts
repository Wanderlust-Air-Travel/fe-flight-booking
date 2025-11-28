export interface MyTicketItem {
  ticketId: string
  ticketNumber: string
  bookingId: string
  pnrCode: string
  passengerName: string
  flightNumber: string
  originAirport: string
  originAirportName: string
  originCity: string
  destinationAirport: string
  destinationAirportName: string
  destinationCity: string
  departureDateTime: string
  arrivalDateTime: string
  fareClassCode: string
  fareClassName: string
  cabinClass: string
  seatNumber: string | null
  status: string
  issuedAt: string
  bookingStatus: string
  totalAmount: number
  currencyCode: string
  isDomestic: boolean
  canCancel: boolean
  cancellationDeadline: string | null
  cannotCancelReason: string | null
}

export interface MyTicketsResponse {
  tickets: MyTicketItem[]
  currentPage: number
  pageSize: number
  totalItems: number
  totalPages: number
  hasNextPage: boolean
  hasPreviousPage: boolean
}

