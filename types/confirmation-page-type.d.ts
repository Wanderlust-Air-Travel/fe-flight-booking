export interface BookingSegmentDetails {
  segmentId: string;
  flightInstance: {
    flightInstanceId: string;
    departureDatetimeLocal: string;
    arrivalDatetimeLocal: string;
    origin: {
      airportCode: string;
      airportName: string;
      cityName: string;
    };
    destination: {
      airportCode: string;
      airportName: string;
      cityName: string;
    };
    flight: {
      flightNumber: string;
      airline: {
        airlineName: string;
      };
    };
  };
  fareClass: {
    fareClassCode: string;
    fareClassName: string;
  };
  flightSeat?: {
    seatNumber: string;
  };
  /** Cabin services registered for this segment (meals, WiFi, etc.) */
  services?: Array<{
    serviceType?: string;
    serviceName?: string;
    price?: number;
    isIncluded?: boolean;
  }>;
}

export interface BookingPassengerDetails {
  passengerId: string;
  fullname: string;
  dob: string;
  gender: string;
  documentNumber: string;
}

export interface BookingDetails {
  bookingId: string;
  pnrCode: string;
  status: string;
  totalAmount: number;
  currencyCode: string;
  contactFullname?: string;
  contactEmail?: string;
  contactPhone?: string;
  segments?: BookingSegmentDetails[];
  passengers?: BookingPassengerDetails[];
}

export interface PaymentDetails {
  paymentId: string;
  bookingId: string;
  status: string;
  amount: number;
  currencyCode: string;
  paymentMethodCode: string;
  paymentMethodName: string;
  transactionRef?: string;
  paidAt?: string;
}

