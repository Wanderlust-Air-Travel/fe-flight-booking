/**
 * Booking Service - API calls for booking operations
 * Separates API logic from UI components
 */

import axiosInstance, { axiosPublic } from "@/lib/axios-instance";

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

/**
 * Create a new reservation
 */
export async function createReservation(
    data: CreateReservationRequest,
    accessToken?: string
): Promise<CreateReservationResponse> {
    const headers: Record<string, string> = {};
    
    if (accessToken) {
        headers['Authorization'] = `Bearer ${accessToken}`;
    } else {
        // For guest users, get session ID from sessionStorage
        const sessionId = sessionStorage.getItem('guest_session_id');
        if (sessionId) {
            headers['X-Session-Id'] = sessionId;
        }
    }

    const axiosClient = accessToken ? axiosInstance : axiosPublic;
    const response = await axiosClient.post<CreateReservationResponse>(
        "/api/reservations",
        data,
        { headers }
    );

    return response.data;
}

/**
 * Create a booking from reservation
 */
export async function createBooking(
    reservationId: string,
    data: CreateBookingRequest,
    accessToken?: string
): Promise<CreateBookingResponse> {
    const headers: Record<string, string> = {};
    
    if (accessToken) {
        headers['Authorization'] = `Bearer ${accessToken}`;
    }

    const response = await axiosInstance.post<CreateBookingResponse>(
        `/api/bookings?reservationId=${reservationId}`,
        data,
        { headers }
    );

    return response.data;
}

