/**
 * useBookingInfo Hook - Business logic for booking info page
 * Separates business logic from UI components
 */

import { useState, useCallback, useRef, useEffect } from "react";
import { useRouter } from "next/navigation";
import { createReservation, createBooking, type CreateReservationResponse } from "@/lib/services/booking-service";
import { getFlightDate } from "@/lib/passenger-utils";
import { getInitialBookingValues, transformBookingData } from "@/lib/utils/booking-utils";
import type { BookingFormData } from "@/types/booking-form-type";
import type { UseBookingInfoParams, UseBookingInfoReturn } from "@/types/use-booking-info-type";

/**
 * Main business logic hook for booking info page
 */
export function useBookingInfo({
    flightInstanceId,
    accessToken,
    user,
    ticketData,
    searchBarData,
}: UseBookingInfoParams): UseBookingInfoReturn {
    const router = useRouter();
    const [reservationId, setReservationId] = useState<string | null>(null);
    const [reservationData, setReservationData] = useState<CreateReservationResponse | null>(null);
    const [isCreatingReservation, setIsCreatingReservation] = useState(false);
    const [isCreatingBooking, setIsCreatingBooking] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const hasCreatedReservationRef = useRef<boolean>(false);

    const flightDate = getFlightDate(ticketData);
    const numberOfPassengers = searchBarData?.totalPerson || 1;
    const initialValues = getInitialBookingValues(user, numberOfPassengers);

    // Create reservation when component mounts
    useEffect(() => {
        // Prevent multiple fetches - only fetch once on mount
        if (hasCreatedReservationRef.current) {
            return;
        }

        if (!flightInstanceId) {
            setError("Please select a flight");
            return;
        }

        hasCreatedReservationRef.current = true;

        const createReservationAsync = async () => {
            setIsCreatingReservation(true);
            setError(null);

            try {
                const response = await createReservation(
                    {
                        segments: [
                            {
                                flightInstanceId,
                                segmentType: "outbound",
                            },
                        ],
                        numberOfPassengers,
                        currencyCode: "VND",
                    },
                    accessToken || undefined
                );

                if (response?.reservationId) {
                    setReservationId(response.reservationId);
                    setReservationData(response);
                } else {
                    setError("Failed to create reservation");
                    // Reset ref on error so user can retry
                    hasCreatedReservationRef.current = false;
                }
            } catch (err: any) {
                console.error("Error creating reservation:", err);
                setError(
                    err.response?.data?.message ||
                        err.message ||
                        "Failed to create reservation"
                );
                // Reset ref on error so user can retry
                hasCreatedReservationRef.current = false;
            } finally {
                setIsCreatingReservation(false);
            }
        };

        createReservationAsync();
    }, [accessToken, flightInstanceId, numberOfPassengers]);

    const handleSubmit = useCallback(
        async (values: BookingFormData) => {
            if (!reservationId) {
                setError("Reservation not found");
                return;
            }

            setIsCreatingBooking(true);
            setError(null);

            try {
                const bookingData = transformBookingData(values);
                const response = await createBooking(reservationId, bookingData, accessToken || undefined);

                if (response?.bookingId) {
                    // Sau khi tạo booking thành công → chuyển sang trang Payment
                    // Booking ID được truyền qua query param để FE stateless, BE là source of truth
                    router.push(`/booking/payment?bookingId=${response.bookingId}`);
                } else {
                    setError("Failed to create booking");
                }
            } catch (err: any) {
                console.error("Error creating booking:", err);
                setError(
                    err.response?.data?.message ||
                        err.message ||
                        "Failed to create booking"
                );
            } finally {
                setIsCreatingBooking(false);
            }
        },
        [reservationId, router, accessToken]
    );

    return {
        reservationId,
        reservationData,
        isCreatingReservation,
        isCreatingBooking,
        error,
        handleSubmit,
        initialValues,
        flightDate,
    };
}

