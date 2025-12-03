export interface BookingSegment {
  segmentId: string;
  flightNumber: string;
  origin: string;
  destination: string;
  departureDateTime: string;
  arrivalDateTime: string;
  cabinClass: string;
  fareClass: string;
}

export interface Booking {
  bookingId: string;
  pnrCode: string;
  bookingDate: string;
  status: string;
  totalAmount: number;
  currency: string;
  contactName: string;
  contactEmail: string;
  contactPhone: string;
  segments: BookingSegment[];
}

