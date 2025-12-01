/**
 * Types for booking-service API layer
 * Tách riêng type/interface khỏi file business logic FE
 */

export interface CreateReservationRequest {
    segments: Array<{
        flightInstanceId: string;
        segmentType: "outbound" | "return";
    }>;
    numberOfPassengers: number;
    currencyCode: string;
}

export interface CreateReservationResponse {
    reservationId: string;
    reservationCode: string;
    totalAmount: number;
    currencyCode: string;
    expiresAt: string;
    numberOfPassengers: number;
}

export interface CreateBookingRequest {
    passengers: Array<{
        passengerType: "ADT" | "CHD" | "INF";
        fullname: string;
        dob: string;
        gender: "MALE" | "FEMALE";
        documentNumber?: string;
        loyaltyNumber?: string;
    }>;
    contactFullname: string;
    contactEmail: string;
    contactPhone: string;
    channel: string;
}

export interface CreateBookingResponse {
    bookingId: string;
    bookingCode: string;
    status: string;
}


