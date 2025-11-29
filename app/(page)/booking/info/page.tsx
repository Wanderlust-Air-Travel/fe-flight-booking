"use client";

import { useEffect, useState, useCallback, useRef } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import axiosInstance from "@/lib/axios-instance";
import { Button } from "@/components/ui/button";
import { Form, Formik, Field, ErrorMessage } from "formik";
import * as Yup from "yup";
import useUserStore from "@/app/zustand/storeUser";
import useInfoTicket from "@/app/zustand/storeInfoTicket";
import Breadcrumb from "@/app/components/Breadcrumb/Breadcrumb";
import InfoTicketBox from "@/app/components/InfoTicketBox/InfoTicketBox";
import FormatPrice from "@/app/components/FormatPrice/FormatPrice";
import { PassengerFormData, BookingFormData } from "@/types/booking-form-type";

// Validation schema
const passengerSchema = Yup.object().shape({
    fullname: Yup.string().required("Full name is required"),
    dob: Yup.string().required("Date of birth is required"),
    gender: Yup.string().required("Gender is required"),
    documentNumber: Yup.string().required("Document number is required"),
});

const bookingSchema = Yup.object().shape({
    contactFullname: Yup.string().required("Contact full name is required"),
    contactEmail: Yup.string().email("Invalid email format").required("Contact email is required"),
    contactPhone: Yup.string().required("Contact phone is required"),
    passengers: Yup.array()
        .of(passengerSchema)
        .min(1, "At least one passenger is required")
        .required("Passengers are required"),
});

const BookingInfo = () => {
    const searchParams = useSearchParams();
    const router = useRouter();
    const { accessToken, refreshToken, user, refreshAccessToken } = useUserStore();
    const { data: ticketData } = useInfoTicket();

    const flightInstanceId = searchParams.get("flightInstanceId");
    const [reservationId, setReservationId] = useState<string | null>(null);
    const [isCreatingReservation, setIsCreatingReservation] = useState(false);
    const [isCreatingBooking, setIsCreatingBooking] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [reservationData, setReservationData] = useState<any>(null);
    const hasCreatedReservationRef = useRef<boolean>(false);

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

        const createReservation = async () => {
            setIsCreatingReservation(true);
            setError(null);

            try {
                // For guest bookings, don't include Authorization header
                // For authenticated bookings, include Authorization header
                const headers: Record<string, string> = {};
                if (accessToken) {
                    headers['Authorization'] = `Bearer ${accessToken}`;
                }

                const response = await axiosInstance.post(
                    "/api/reservations",
                    {
                        segments: [
                            {
                                flightInstanceId,
                                segmentType: "outbound",
                            },
                        ],
                        numberOfPassengers: 1, // TODO: Get from search params or state
                        currencyCode: "VND",
                    },
                    {
                        headers,
                    }
                );

                if (response.data?.reservationId) {
                    setReservationId(response.data.reservationId);
                    setReservationData(response.data);
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

        createReservation();
    }, [accessToken, flightInstanceId]);

    const handleSubmit = useCallback(
        async (values: BookingFormData) => {
            if (!reservationId) {
                setError("Reservation not found");
                return;
            }

            setIsCreatingBooking(true);
            setError(null);

            try {
                // For guest bookings, don't include Authorization header
                // For authenticated bookings, include Authorization header
                const headers: Record<string, string> = {};
                if (accessToken) {
                    headers['Authorization'] = `Bearer ${accessToken}`;
                }

                const response = await axiosInstance.post(
                    `/api/bookings?reservationId=${reservationId}`,
                    {
                        passengers: values.passengers.map((p) => ({
                            passengerType: p.passengerType,
                            fullname: p.fullname,
                            dob: p.dob,
                            gender: p.gender,
                            documentNumber: p.documentNumber,
                            loyaltyNumber: p.loyaltyNumber,
                        })),
                        contactFullname: values.contactFullname,
                        contactEmail: values.contactEmail,
                        contactPhone: values.contactPhone,
                        channel: "web",
                    },
                    {
                        headers,
                    }
                );

                if (response.data?.bookingId) {
                    // Sau khi tạo booking thành công → chuyển sang trang Payment
                    // Booking ID được truyền qua query param để FE stateless, BE là source of truth
                    router.push(`/booking/payment?bookingId=${response.data.bookingId}`);
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

    const initialValues: BookingFormData = {
        contactFullname: user?.fullname || "",
        contactEmail: user?.email || "",
        contactPhone: user?.phone ? String(user.phone) : "",
        passengers: [
            {
                passengerType: "ADT",
                fullname: "",
                dob: "",
                gender: "",
                documentNumber: "",
            },
        ],
    };

    // Guest bookings are now allowed - no need to check accessToken

    if (isCreatingReservation) {
        return (
            <main className="flex flex-col pt-[var(--hd)] gap-y-[var(--rowY)]">
                <Breadcrumb />
                <div className="container">
                    <div className="text-center py-[4rem]">
                        <p className="text-lg">Creating reservation...</p>
                    </div>
                </div>
            </main>
        );
    }

    if (error && !reservationId) {
        return (
            <main className="flex flex-col pt-[var(--hd)] gap-y-[var(--rowY)]">
                <Breadcrumb />
                <div className="container">
                    <div className="text-center py-[4rem]">
                        <p className="text-lg text-red-500">{error}</p>
                        <Button
                            onClick={() => router.back()}
                            className="mt-[2rem]"
                        >
                            Go Back
                        </Button>
                    </div>
                </div>
            </main>
        );
    }

    return (
        <main className="flex flex-col pt-[var(--hd)] gap-y-[var(--rowY)]">
            <Breadcrumb />
            <InfoTicketBox />

            <section className="">
                <div className="container">
                    <div className="flex flex-wrap -mx-[1.2rem]">
                        <div className="px-[1.2rem] w-full lg:w-[70%]">
                            <div className="bg-white rounded-[1rem] p-[2rem] border border-[var(--cl-third)]">
                                <h2 className="text-lg font-bold text-[var(--cl-pri)] mb-[2rem]">
                                    Passenger Information
                                </h2>

                                {error && (
                                    <div className="mb-[2rem] p-[1rem] bg-red-50 border border-red-200 rounded text-red-600">
                                        {error}
                                    </div>
                                )}

                                {reservationData && (
                                    <div className="mb-[2rem] p-[1rem] bg-blue-50 border border-blue-200 rounded text-blue-600">
                                        <p>
                                            Reservation Code:{" "}
                                            <strong>{reservationData.reservationCode}</strong>
                                        </p>
                                        <p>
                                            Expires at:{" "}
                                            {new Date(
                                                reservationData.expiresAt
                                            ).toLocaleString()}
                                        </p>
                                    </div>
                                )}

                                <Formik
                                    initialValues={initialValues}
                                    validationSchema={bookingSchema}
                                    onSubmit={handleSubmit}
                                >
                                    {({ values, setFieldValue }) => (
                                        <Form className="flex flex-col gap-y-[2rem]">
                                            {/* Contact Information */}
                                            <div className="flex flex-col gap-y-[1rem]">
                                                <h3 className="text-md font-semibold">
                                                    Contact Information
                                                </h3>
                                                <div className="grid grid-cols-1 md:grid-cols-2 gap-[1rem]">
                                                    <div>
                                                        <label className="block text-sm font-medium mb-[0.5rem]">
                                                            Full Name *
                                                        </label>
                                                        <Field
                                                            type="text"
                                                            name="contactFullname"
                                                            className="w-full px-[1rem] py-[0.8rem] border border-[var(--cl-third)] rounded"
                                                        />
                                                        <ErrorMessage
                                                            name="contactFullname"
                                                            component="div"
                                                            className="text-red-500 text-sm mt-[0.5rem]"
                                                        />
                                                    </div>
                                                    <div>
                                                        <label className="block text-sm font-medium mb-[0.5rem]">
                                                            Email *
                                                        </label>
                                                        <Field
                                                            type="email"
                                                            name="contactEmail"
                                                            className="w-full px-[1rem] py-[0.8rem] border border-[var(--cl-third)] rounded"
                                                        />
                                                        <ErrorMessage
                                                            name="contactEmail"
                                                            component="div"
                                                            className="text-red-500 text-sm mt-[0.5rem]"
                                                        />
                                                    </div>
                                                    <div>
                                                        <label className="block text-sm font-medium mb-[0.5rem]">
                                                            Phone *
                                                        </label>
                                                        <Field
                                                            type="text"
                                                            name="contactPhone"
                                                            className="w-full px-[1rem] py-[0.8rem] border border-[var(--cl-third)] rounded"
                                                        />
                                                        <ErrorMessage
                                                            name="contactPhone"
                                                            component="div"
                                                            className="text-red-500 text-sm mt-[0.5rem]"
                                                        />
                                                    </div>
                                                </div>
                                            </div>

                                            {/* Passengers */}
                                            <div className="flex flex-col gap-y-[1rem]">
                                                <h3 className="text-md font-semibold">
                                                    Passenger Information
                                                </h3>
                                                {values.passengers.map((passenger, index) => (
                                                    <div
                                                        key={index}
                                                        className="border border-[var(--cl-third)] rounded p-[1.5rem]"
                                                    >
                                                        <h4 className="text-sm font-semibold mb-[1rem]">
                                                            Passenger {index + 1}
                                                        </h4>
                                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-[1rem]">
                                                            <div>
                                                                <label className="block text-sm font-medium mb-[0.5rem]">
                                                                    Full Name *
                                                                </label>
                                                                <Field
                                                                    type="text"
                                                                    name={`passengers.${index}.fullname`}
                                                                    className="w-full px-[1rem] py-[0.8rem] border border-[var(--cl-third)] rounded"
                                                                />
                                                                <ErrorMessage
                                                                    name={`passengers.${index}.fullname`}
                                                                    component="div"
                                                                    className="text-red-500 text-sm mt-[0.5rem]"
                                                                />
                                                            </div>
                                                            <div>
                                                                <label className="block text-sm font-medium mb-[0.5rem]">
                                                                    Date of Birth *
                                                                </label>
                                                                <Field
                                                                    type="date"
                                                                    name={`passengers.${index}.dob`}
                                                                    className="w-full px-[1rem] py-[0.8rem] border border-[var(--cl-third)] rounded"
                                                                />
                                                                <ErrorMessage
                                                                    name={`passengers.${index}.dob`}
                                                                    component="div"
                                                                    className="text-red-500 text-sm mt-[0.5rem]"
                                                                />
                                                            </div>
                                                            <div>
                                                                <label className="block text-sm font-medium mb-[0.5rem]">
                                                                    Gender *
                                                                </label>
                                                                <Field
                                                                    as="select"
                                                                    name={`passengers.${index}.gender`}
                                                                    className="w-full px-[1rem] py-[0.8rem] border border-[var(--cl-third)] rounded"
                                                                >
                                                                    <option value="">Select</option>
                                                                    <option value="Male">Male</option>
                                                                    <option value="Female">Female</option>
                                                                    <option value="Other">Other</option>
                                                                </Field>
                                                                <ErrorMessage
                                                                    name={`passengers.${index}.gender`}
                                                                    component="div"
                                                                    className="text-red-500 text-sm mt-[0.5rem]"
                                                                />
                                                            </div>
                                                            <div>
                                                                <label className="block text-sm font-medium mb-[0.5rem]">
                                                                    Document Number (CCCD/Passport) *
                                                                </label>
                                                                <Field
                                                                    type="text"
                                                                    name={`passengers.${index}.documentNumber`}
                                                                    className="w-full px-[1rem] py-[0.8rem] border border-[var(--cl-third)] rounded"
                                                                />
                                                                <ErrorMessage
                                                                    name={`passengers.${index}.documentNumber`}
                                                                    component="div"
                                                                    className="text-red-500 text-sm mt-[0.5rem]"
                                                                />
                                                            </div>
                                                            <div>
                                                                <label className="block text-sm font-medium mb-[0.5rem]">
                                                                    Loyalty Number (Optional)
                                                                </label>
                                                                <Field
                                                                    type="text"
                                                                    name={`passengers.${index}.loyaltyNumber`}
                                                                    className="w-full px-[1rem] py-[0.8rem] border border-[var(--cl-third)] rounded"
                                                                />
                                                            </div>
                                                        </div>
                                                    </div>
                                                ))}
                                            </div>

                                            <div className="flex gap-x-[1rem]">
                                                <Button
                                                    type="button"
                                                    variant="outline"
                                                    onClick={() => router.back()}
                                                >
                                                    Back
                                                </Button>
                                                <Button
                                                    type="submit"
                                                    disabled={isCreatingBooking}
                                                >
                                                    {isCreatingBooking
                                                        ? "Creating Booking..."
                                                        : "Continue to Payment"}
                                                </Button>
                                            </div>
                                        </Form>
                                    )}
                                </Formik>
                            </div>
                        </div>

                        <div className="px-[1.2rem] w-full lg:w-[30%]">
                            <div className="sticky top-[calc(var(--hd)+1rem)] bg-white rounded-[1rem] p-[2rem] border border-[var(--cl-third)]">
                                <h3 className="text-md font-bold text-[var(--cl-pri)] mb-[2rem]">
                                    Booking Summary
                                </h3>
                                {reservationData && (
                                    <div className="flex flex-col gap-y-[1rem]">
                                        <div className="flex justify-between">
                                            <span>Total Amount:</span>
                                            <span className="font-bold">
                                                {FormatPrice(reservationData.totalAmount)}
                                            </span>
                                        </div>
                                        <div className="flex justify-between">
                                            <span>Currency:</span>
                                            <span>{reservationData.currencyCode || "VND"}</span>
                                        </div>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            </section>
        </main>
    );
};

export default BookingInfo;

