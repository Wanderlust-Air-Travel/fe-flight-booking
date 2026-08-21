/**
 * Booking response types — aligned with backend GetBookingResponseDto.
 *
 * Backend payload shape (see be-flight-booking/src-nestjs/microservices/booking/dto/get-booking-response.dto.ts):
 *   - bookingDate? (ISO 8601 string, from Booking.created_at)
 *   - contactFullname?, contactEmail?, contactPhone?
 *   - segments: BookingSegmentDto[] (NESTED: flightInstance.{origin,destination,flight}, fareClass, flightSeat?)
 *   - passengers: BookingPassengerDto[]
 */

export interface BookingSegmentAirport {
  airportCode: string;
  airportName: string;
  cityName: string;
}

export interface BookingSegmentFlight {
  flightNumber: string;
  airline: { airlineName: string };
}

export interface BookingSegmentFlightInstance {
  flightInstanceId: string;
  departureDatetimeLocal: string;
  arrivalDatetimeLocal: string;
  origin: BookingSegmentAirport;
  destination: BookingSegmentAirport;
  flight: BookingSegmentFlight;
}

export interface BookingSegment {
  segmentId: string;
  flightInstance: BookingSegmentFlightInstance;
  fareClass: { fareClassCode: string; fareClassName: string };
  flightSeat?: { seatNumber: string };
}

export interface BookingPassenger {
  passengerId: string;
  fullname: string;
  dob: string;
  gender: string;
  documentNumber: string;
}

export interface Booking {
  bookingId: string;
  pnrCode: string;
  status: string;
  totalAmount: number;
  currencyCode: string;
  /** ISO 8601 string from Booking.created_at (added in GetBookingResponseDto). */
  bookingDate?: string;
  contactFullname?: string;
  contactEmail?: string;
  contactPhone?: string;
  segments: BookingSegment[];
  passengers: BookingPassenger[];
}
