/**
 * Booking Service - API calls for booking operations
 * Separates API logic from UI components
 */

import axiosInstance, { axiosPublic } from "@/lib/axios-instance";
import type {
    CreateReservationRequest,
    CreateReservationResponse,
    CreateBookingRequest,
    CreateBookingResponse,
} from "@/types/booking-service-type";

/**
 * Create a new reservation
 */
export async function createReservation(
    data: CreateReservationRequest,
    accessToken?: string
): Promise<CreateReservationResponse> {
    const headers: Record<string, string> = {};

    if (accessToken) {
        // Authenticated user: chỉ dựa vào JWT, không gửi X-Session-Id để tránh BE hiểu nhầm là guest
        headers["Authorization"] = `Bearer ${accessToken}`;
    } else if (typeof window !== "undefined") {
        // Guest: gửi X-Session-Id nếu có
        const sessionId = sessionStorage.getItem("guest_session_id");
        if (sessionId) {
            headers["X-Session-Id"] = sessionId;
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

