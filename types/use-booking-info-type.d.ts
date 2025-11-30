/**
 * Types for useBookingInfo Hook
 * Separates type definitions from business logic
 */

import type { BookingFormData } from "./booking-form-type";
import type { CreateReservationResponse } from "@/lib/services/booking-service";

/**
 * Parameters for useBookingInfo hook
 */
export interface UseBookingInfoParams {
    flightInstanceId: string | null;
    accessToken?: string | null;
    user?: any;
    ticketData?: any;
    searchBarData?: any;
}

/**
 * Return type for useBookingInfo hook
 */
export interface UseBookingInfoReturn {
    // State
    reservationId: string | null;
    reservationData: CreateReservationResponse | null;
    isCreatingReservation: boolean;
    isCreatingBooking: boolean;
    error: string | null;
    
    // Actions
    handleSubmit: (values: BookingFormData) => Promise<void>;
    initialValues: BookingFormData;
    
    // Helpers
    flightDate: Date;
}

