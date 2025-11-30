"use client";

import { useEffect, useState, useCallback, useRef, Suspense } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import axiosInstance, { axiosPublic } from "@/lib/axios-instance";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Form, Formik, Field, ErrorMessage } from "formik";
import { format } from "date-fns";
import * as Yup from "yup";
import useUserStore from "@/app/zustand/storeUser";
import useInfoTicket from "@/app/zustand/storeInfoTicket";
import useFightSearchBarStore from "@/app/zustand/storeFightSearchBar";
import Breadcrumb from "@/app/components/Breadcrumb/Breadcrumb";
import InfoTicketBox from "@/app/components/InfoTicketBox/InfoTicketBox";
import FormatPrice from "@/app/components/FormatPrice/FormatPrice";
import { PassengerFormData, BookingFormData } from "@/types/booking-form-type";
import { determinePassengerType, getFlightDate, calculateAge, isAdult } from "@/lib/passenger-utils";

/**
 * Calculate default DOB based on passenger type and flight date
 * @param passengerType - ADT, CHD, or INF
 * @param flightDate - Flight departure date
 * @returns DOB string in YYYY-MM-DD format
 */
const getDefaultDOB = (passengerType: string, flightDate: Date): string => {
    const flightDateCopy = new Date(flightDate);
    
    switch (passengerType) {
        case "ADT":
            // Adult: 18 years old at flight date (ensures >= 12 and can accompany infants)
            flightDateCopy.setFullYear(flightDateCopy.getFullYear() - 18);
            break;
        case "CHD":
            // Child: 6 years old at flight date (middle of 2-11 range)
            flightDateCopy.setFullYear(flightDateCopy.getFullYear() - 6);
            break;
        case "INF":
            // Infant: 1 year old at flight date (ensures < 2 years)
            flightDateCopy.setFullYear(flightDateCopy.getFullYear() - 1);
            break;
        default:
            // Default to ADT if unknown type
            flightDateCopy.setFullYear(flightDateCopy.getFullYear() - 18);
    }
    
    // Format as YYYY-MM-DD
    const year = flightDateCopy.getFullYear();
    const month = String(flightDateCopy.getMonth() + 1).padStart(2, '0');
    const day = String(flightDateCopy.getDate()).padStart(2, '0');
    
    return `${year}-${month}-${day}`;
};
import { Checkbox } from "@/components/ui/checkbox";
import { useReservationCountdown } from "@/app/hooks/use-reservation-countdown";

// Validation schema with DOB-based passenger type validation
const createPassengerSchema = (flightDate: Date) => Yup.object().shape({
    passengerType: Yup.string().oneOf(["ADT", "CHD", "INF"], "Invalid passenger type").required("Passenger type is required"),
    fullname: Yup.string().required("Full name is required"),
    dob: Yup.string()
        .required("Date of birth is required")
        .test("dob-format", "Date of birth must be in YYYY-MM-DD format", function(value) {
            if (!value) return false;
            const dateRegex = /^\d{4}-\d{2}-\d{2}$/;
            return dateRegex.test(value);
        })
        .test("dob-age-validation", "Invalid date of birth for passenger type", function(value) {
            if (!value) return false;
            const { passengerType } = this.parent;
            const dobDate = new Date(value);
            if (isNaN(dobDate.getTime())) return false;
            
            const age = calculateAge(dobDate, flightDate);
            if (age < 0) return false;
            
            if (passengerType === "ADT" && age < 12) {
                return this.createError({ message: "Adult must be 12 years or older at flight date." });
            }
            if (passengerType === "CHD" && (age < 2 || age >= 12)) {
                return this.createError({ message: "Child must be between 2 and 11 years old at flight date." });
            }
            if (passengerType === "INF" && age >= 2) {
                return this.createError({ message: "Infant must be less than 2 years old at flight date." });
            }
            return true;
        }),
    gender: Yup.string().required("Gender is required"),
    documentNumber: Yup.string()
        .test("documentNumber-required", "Document number is required for adults", function(value) {
            const { passengerType } = this.parent;
            // ADT requires documentNumber, CHD and INF do not
            if (passengerType === "ADT") {
                return !!value && value.trim().length > 0;
            }
            // CHD and INF: documentNumber is optional
            return true;
        }),
});

const createBookingSchema = (flightDate: Date) => Yup.object().shape({
    contactFullname: Yup.string().required("Contact full name is required"),
    contactEmail: Yup.string().email("Invalid email format").required("Contact email is required"),
    contactPhone: Yup.string().required("Contact phone is required"),
    passengers: Yup.array()
        .of(createPassengerSchema(flightDate))
        .min(1, "At least one passenger is required")
        .required("Passengers are required")
        .test("infant-adult-ratio", "Each adult can only accompany maximum 1 infant. Additional infant(s) must be booked as Child (CHD).", function(passengers) {
            if (!passengers) return true;
            const adults = passengers.filter((p: any) => p.passengerType === "ADT").length;
            const infants = passengers.filter((p: any) => p.passengerType === "INF").length;
            return infants <= adults;
        })
        .test("infant-requires-adult", "Infants (INF) must be accompanied by at least one adult (ADT)", function(passengers) {
            if (!passengers) return true;
            const adults = passengers.filter((p: any) => p.passengerType === "ADT").length;
            const infants = passengers.filter((p: any) => p.passengerType === "INF").length;
            if (infants > 0 && adults === 0) {
                return this.createError({ message: "Infants (INF) must be accompanied by at least one adult (ADT)" });
            }
            return true;
        })
        .test("adult-age-validation", "Adults accompanying infants must be 18 years or older at flight date", function(passengers) {
            if (!passengers) return true;
            const infants = passengers.filter((p: any) => p.passengerType === "INF");
            if (infants.length === 0) return true;
            
            const adults = passengers.filter((p: any) => p.passengerType === "ADT");
            for (const adult of adults) {
                if (!adult.dob) continue;
                const dobDate = new Date(adult.dob);
                if (isNaN(dobDate.getTime())) continue;
                
                if (!isAdult(dobDate, flightDate)) {
                    return this.createError({ 
                        message: `Adult passenger "${adult.fullname || 'Passenger'}" must be 18 years or older at flight date to accompany an infant.` 
                    });
                }
            }
            return true;
        }),
});

const BookingInfoContent = () => {
    const searchParams = useSearchParams();
    const router = useRouter();
    const { accessToken, refreshToken, user, refreshAccessToken } = useUserStore();
    const { data: ticketData } = useInfoTicket();
    const { data: searchBarData } = useFightSearchBarStore();

    const flightInstanceId = searchParams.get("flightInstanceId");
    const [reservationId, setReservationId] = useState<string | null>(null);
    const [isCreatingReservation, setIsCreatingReservation] = useState(false);
    const [isCreatingBooking, setIsCreatingBooking] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [reservationData, setReservationData] = useState<any>(null);
    const hasCreatedReservationRef = useRef<boolean>(false);

    // WebSocket: Real-time reservation countdown timer
    const { 
        isSubscribed: isCountdownSubscribed, 
        countdown, 
        remainingSeconds, 
        isExpired, 
        formattedCountdown 
    } = useReservationCountdown(reservationId);

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
                // For guest bookings, don't include Authorization header but include X-Session-Id
                // For authenticated bookings, include Authorization header
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
                const response = await axiosClient.post(
                    "/api/reservations",
                    {
                        segments: [
                            {
                                flightInstanceId,
                                segmentType: "outbound",
                            },
                        ],
                        numberOfPassengers: searchBarData.totalPerson || 1,
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
                        passengers: values.passengers.map((p) => {
                            // Build passenger object
                            // ADT requires documentNumber, CHD and INF do not need it (field is hidden)
                            const passengerData: any = {
                                passengerType: p.passengerType,
                                fullname: p.fullname,
                                dob: p.dob,
                                gender: p.gender,
                                loyaltyNumber: p.loyaltyNumber,
                            };
                            
                            // Only include documentNumber for ADT passengers
                            // CHD and INF: field is hidden, so documentNumber should not be sent
                            if (p.passengerType === "ADT" && p.documentNumber && p.documentNumber.trim().length > 0) {
                                passengerData.documentNumber = p.documentNumber.trim();
                            }
                            // For CHD and INF, documentNumber is not included in the request
                            
                            return passengerData;
                        }),
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

    // Initialize passengers based on reservation data
    const getInitialPassengers = (): PassengerFormData[] => {
        const numberOfPassengers = reservationData?.numberOfPassengers || 1;
        const passengers: PassengerFormData[] = [];
        
        for (let i = 0; i < numberOfPassengers; i++) {
            passengers.push({
                passengerType: "ADT", // Default to ADT, user can change
                fullname: "",
                dob: "",
                gender: "",
                documentNumber: "",
                loyaltyNumber: "",
                isCurrentUser: false, // Will be set by user selection
            });
        }
        
        return passengers;
    };

    const initialValues: BookingFormData = {
        contactFullname: user?.fullname || "",
        contactEmail: user?.email || "",
        contactPhone: user?.phone ? String(user.phone) : "",
        passengers: getInitialPassengers(),
        isUserTraveling: false, // User must explicitly choose
        userPassengerIndex: undefined,
    };

    // Guest bookings are now allowed - no need to check accessToken

    if (isCreatingReservation) {
        return (
            <main className="flex flex-col pt-[var(--hd)] gap-y-[var(--rowY)]">
                <Breadcrumb />
                <div className="container">
                    <div className="text-center py-8 md:py-12 lg:py-16">
                        <p className="text-base md:text-lg lg:text-xl">Creating reservation...</p>
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
                    <div className="text-center py-8 md:py-12 lg:py-16">
                        <p className="text-sm md:text-base lg:text-lg text-red-500 mb-4 md:mb-6">{error}</p>
                        <Button
                            onClick={() => router.back()}
                            className="mt-4 md:mt-6 lg:mt-8"
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

            <section className="py-4 md:py-6 lg:py-8">
                <div className="container max-w-[160rem]">
                    <div className="flex flex-wrap -mx-2 md:-mx-4 lg:-mx-8">
                        <div className="px-2 md:px-4 lg:px-8 w-full lg:w-[70%]">
                            <div className="bg-white rounded-lg md:rounded-xl lg:rounded-2xl p-4 md:p-6 lg:p-8 xl:p-12 border-2 border-[var(--cl-pri)] shadow-lg">
                                <h2 className="text-xl md:text-2xl lg:text-3xl xl:text-4xl font-bold text-[var(--cl-pri)] mb-4 md:mb-6 lg:mb-8 uppercase tracking-wide">
                                    Passenger Information
                                </h2>

                                {error && (
                                    <Alert variant="destructive" className="mb-4 md:mb-6 lg:mb-8 border-2">
                                        <AlertDescription className="text-sm md:text-base">{error}</AlertDescription>
                                    </Alert>
                                )}

                                {reservationData && (
                                    <Alert className="mb-4 md:mb-6 lg:mb-8 border-2 border-[var(--cl-pri)] bg-blue-50">
                                        <AlertDescription className="text-sm md:text-base">
                                            <p className="font-semibold text-[var(--cl-pri)] mb-2">
                                                Reservation Code:{" "}
                                                <span className="text-base md:text-lg">{reservationData.reservationCode}</span>
                                            </p>
                                            <p className="text-gray-700 text-xs md:text-sm">
                                                Expires at:{" "}
                                                <strong>{new Date(
                                                    reservationData.expiresAt
                                                ).toLocaleString()}</strong>
                                            </p>
                                        </AlertDescription>
                                    </Alert>
                                )}

                                {/* WebSocket: Real-time Reservation Countdown Timer */}
                                {isCountdownSubscribed && countdown && (
                                    <Alert className={`mb-4 md:mb-6 lg:mb-8 border-2 ${isExpired ? 'border-red-500 bg-red-50' : remainingSeconds < 300 ? 'border-yellow-500 bg-yellow-50' : 'border-[var(--cl-pri)] bg-blue-50'}`}>
                                        <AlertDescription>
                                            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 sm:gap-4">
                                                <div className="flex-1">
                                                    <p className={`font-bold text-base md:text-lg lg:text-xl ${isExpired ? 'text-red-600' : remainingSeconds < 300 ? 'text-yellow-700' : 'text-[var(--cl-pri)]'}`}>
                                                        {isExpired ? 'Reservation Expired' : 'Reservation Time Remaining'}
                                                    </p>
                                                    <p className="text-xs md:text-sm text-gray-700 mt-1 md:mt-2">
                                                        Complete your booking before the reservation expires
                                                    </p>
                                                </div>
                                                <div className="text-left sm:text-right">
                                                    <p className={`text-2xl md:text-3xl lg:text-4xl font-bold ${isExpired ? 'text-red-600' : remainingSeconds < 300 ? 'text-yellow-700' : 'text-[var(--cl-pri)]'}`}>
                                                        {formattedCountdown}
                                                    </p>
                                                    {isExpired && (
                                                        <p className="text-xs md:text-sm text-red-600 mt-1 md:mt-2 font-medium">
                                                            Please create a new reservation
                                                        </p>
                                                    )}
                                                </div>
                                            </div>
                                        </AlertDescription>
                                    </Alert>
                                )}

                                <Formik
                                    initialValues={initialValues}
                                    validationSchema={createBookingSchema(getFlightDate(ticketData))}
                                    onSubmit={handleSubmit}
                                >
                                    {({ values, setFieldValue }) => (
                                        <Form className="flex flex-col gap-y-6 md:gap-y-8 lg:gap-y-12">
                                            {/* Contact Information */}
                                            <div className="flex flex-col gap-y-4 md:gap-y-6">
                                                <h3 className="text-lg md:text-xl lg:text-2xl xl:text-3xl font-bold text-[var(--cl-pri)] uppercase tracking-wide border-b-2 border-[var(--cl-pri)] pb-2 md:pb-3 lg:pb-4">
                                                    Contact Information
                                                </h3>
                                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6">
                                                    <div className="flex flex-col gap-2 md:gap-3">
                                                        <Label htmlFor="contactFullname" className="text-sm md:text-base font-semibold text-[var(--cl-pri)]">
                                                            Full Name *
                                                        </Label>
                                                        <Field
                                                            as={Input}
                                                            type="text"
                                                            id="contactFullname"
                                                            name="contactFullname"
                                                            className="h-12 md:h-14 lg:h-16 text-sm md:text-base lg:text-lg font-semibold border-2 border-[var(--cl-third)] focus:border-[var(--cl-pri)] focus:ring-2 focus:ring-[var(--cl-pri)]"
                                                        />
                                                        <ErrorMessage
                                                            name="contactFullname"
                                                            render={(msg) => (
                                                                <p className="text-xs md:text-sm text-destructive mt-1 font-medium">{msg}</p>
                                                            )}
                                                        />
                                                    </div>
                                                    <div className="flex flex-col gap-2 md:gap-3">
                                                        <Label htmlFor="contactEmail" className="text-sm md:text-base font-semibold text-[var(--cl-pri)]">
                                                            Email *
                                                        </Label>
                                                        <Field
                                                            as={Input}
                                                            type="email"
                                                            id="contactEmail"
                                                            name="contactEmail"
                                                            className="h-12 md:h-14 lg:h-16 text-sm md:text-base lg:text-lg font-semibold border-2 border-[var(--cl-third)] focus:border-[var(--cl-pri)] focus:ring-2 focus:ring-[var(--cl-pri)]"
                                                        />
                                                        <ErrorMessage
                                                            name="contactEmail"
                                                            render={(msg) => (
                                                                <p className="text-xs md:text-sm text-destructive mt-1 font-medium">{msg}</p>
                                                            )}
                                                        />
                                                    </div>
                                                    <div className="flex flex-col gap-2 md:gap-3 md:col-span-2">
                                                        <Label htmlFor="contactPhone" className="text-sm md:text-base font-semibold text-[var(--cl-pri)]">
                                                            Phone *
                                                        </Label>
                                                        <Field
                                                            as={Input}
                                                            type="tel"
                                                            id="contactPhone"
                                                            name="contactPhone"
                                                            className="h-12 md:h-14 lg:h-16 text-sm md:text-base lg:text-lg font-semibold border-2 border-[var(--cl-third)] focus:border-[var(--cl-pri)] focus:ring-2 focus:ring-[var(--cl-pri)]"
                                                        />
                                                        <ErrorMessage
                                                            name="contactPhone"
                                                            render={(msg) => (
                                                                <p className="text-xs md:text-sm text-destructive mt-1 font-medium">{msg}</p>
                                                            )}
                                                        />
                                                    </div>
                                                </div>
                                            </div>

                                            {/* User Traveling Selection - Only show if user is logged in */}
                                            {user && (
                                                <div className="flex flex-col gap-y-4 md:gap-y-6 p-4 md:p-6 lg:p-8 bg-gradient-to-br from-blue-50 to-white border-2 border-[var(--cl-pri)] rounded-lg md:rounded-xl shadow-md">
                                                    <div className="flex items-center gap-2 md:gap-3">
                                                        <Checkbox
                                                            id="isUserTraveling"
                                                            checked={values.isUserTraveling}
                                                            onCheckedChange={(checked: boolean) => {
                                                                setFieldValue("isUserTraveling", checked);
                                                                if (checked) {
                                                                    // Auto-select first passenger as user if not set
                                                                    if (values.userPassengerIndex === undefined) {
                                                                        setFieldValue("userPassengerIndex", 0);
                                                                        // Auto-fill first passenger with user info
                                                                        setFieldValue("passengers.0.fullname", user.fullname || "");
                                                                        setFieldValue("passengers.0.isCurrentUser", true);
                                                                    }
                                                                } else {
                                                                    // Clear user info from all passengers
                                                                    setFieldValue("userPassengerIndex", undefined);
                                                                    values.passengers.forEach((_, idx) => {
                                                                        if (values.passengers[idx].isCurrentUser) {
                                                                            setFieldValue(`passengers.${idx}.fullname`, "");
                                                                            setFieldValue(`passengers.${idx}.isCurrentUser`, false);
                                                                        }
                                                                    });
                                                                }
                                                            }}
                                                        />
                                                        <Label htmlFor="isUserTraveling" className="cursor-pointer text-sm md:text-base lg:text-lg font-bold text-[var(--cl-pri)]">
                                                            Tôi là một trong những hành khách
                                                        </Label>
                                                    </div>
                                                    
                                                    {values.isUserTraveling && (
                                                        <div className="ml-4 md:ml-7 mt-2 md:mt-3">
                                                            <Label className="mb-2 md:mb-3 text-sm md:text-base font-semibold text-[var(--cl-pri)] block">
                                                                Chọn hành khách là bạn:
                                                            </Label>
                                                            <div className="flex flex-wrap gap-2 md:gap-3 mt-2 md:mt-3">
                                                                {values.passengers.map((_, idx) => (
                                                                    <Button
                                                                        key={idx}
                                                                        type="button"
                                                                        variant={values.userPassengerIndex === idx ? "default" : "outline"}
                                                                        size="sm"
                                                                        className={values.userPassengerIndex === idx 
                                                                            ? "bg-[var(--cl-pri)] hover:bg-[var(--cl-four)] text-white border-2 border-[var(--cl-pri)] text-xs md:text-sm lg:text-base font-bold px-3 md:px-4 lg:px-6 py-2 md:py-2.5 lg:py-3"
                                                                            : "border-2 border-[var(--cl-pri)] text-[var(--cl-pri)] hover:bg-[var(--cl-pri)] hover:text-white text-xs md:text-sm lg:text-base font-semibold px-3 md:px-4 lg:px-6 py-2 md:py-2.5 lg:py-3"
                                                                        }
                                                                        onClick={() => {
                                                                            // Clear previous user selection
                                                                            const prevIndex = values.userPassengerIndex;
                                                                            if (prevIndex !== undefined) {
                                                                                setFieldValue(`passengers.${prevIndex}.isCurrentUser`, false);
                                                                                setFieldValue(`passengers.${prevIndex}.fullname`, "");
                                                                            }
                                                                            
                                                                            // Set new user selection
                                                                            setFieldValue("userPassengerIndex", idx);
                                                                            setFieldValue(`passengers.${idx}.isCurrentUser`, true);
                                                                            setFieldValue(`passengers.${idx}.fullname`, user.fullname || "");
                                                                        }}
                                                                    >
                                                                        Passenger {idx + 1}
                                                                    </Button>
                                                                ))}
                                                            </div>
                                                        </div>
                                                    )}
                                                </div>
                                            )}

                                            {/* Passengers */}
                                            <div className="flex flex-col gap-y-4 md:gap-y-6 lg:gap-y-8">
                                                <h3 className="text-lg md:text-xl lg:text-2xl xl:text-3xl font-bold text-[var(--cl-pri)] uppercase tracking-wide border-b-2 border-[var(--cl-pri)] pb-2 md:pb-3 lg:pb-4">
                                                    Passenger Information
                                                </h3>
                                                {values.passengers.map((passenger, index) => {
                                                    const isInfant = passenger.passengerType === "INF";
                                                    const isChild = passenger.passengerType === "CHD";
                                                    const adultCount = values.passengers.filter(p => p.passengerType === "ADT").length;
                                                    const infantCount = values.passengers.filter(p => p.passengerType === "INF").length;
                                                    
                                                    return (
                                                        <div
                                                            key={index}
                                                            className="border-2 border-[var(--cl-pri)] rounded-lg md:rounded-xl p-4 md:p-6 lg:p-8 bg-gradient-to-br from-white to-blue-50/30 shadow-md"
                                                        >
                                                            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 sm:gap-0 mb-4 md:mb-6 pb-3 md:pb-4 border-b-2 border-[var(--cl-pri)]">
                                                                <h4 className="text-base md:text-lg lg:text-xl xl:text-2xl font-bold text-[var(--cl-pri)]">
                                                                    Passenger {index + 1}
                                                                    {passenger.isCurrentUser && user && (
                                                                        <span className="ml-2 md:ml-3 text-xs md:text-sm text-[var(--cl-four)] font-semibold bg-[var(--cl-four)]/20 px-2 md:px-3 py-0.5 md:py-1 rounded-full">
                                                                            (Bạn)
                                                                        </span>
                                                                    )}
                                                                </h4>
                                                                <div className="flex flex-col sm:flex-row items-start sm:items-center gap-2 sm:gap-3 w-full sm:w-auto">
                                                                    <Label className="text-sm md:text-base font-semibold text-[var(--cl-pri)]">
                                                                        Type:
                                                                    </Label>
                                                                    <Field name={`passengers.${index}.passengerType`}>
                                                                        {({ field, form }: any) => (
                                                                            <Select
                                                                                value={field.value}
                                                                                onValueChange={(value) => {
                                                                                    form.setFieldValue(field.name, value);
                                                                                    
                                                                                    // Auto-fill DOB based on selected passenger type
                                                                                    const flightDate = getFlightDate(ticketData);
                                                                                    const defaultDOB = getDefaultDOB(value, flightDate);
                                                                                    form.setFieldValue(`passengers.${index}.dob`, defaultDOB);
                                                                                    
                                                                                    // Clear documentNumber when changing from ADT to CHD/INF
                                                                                    // (since CHD/INF don't need documentNumber)
                                                                                    if (value !== "ADT" && passenger.documentNumber) {
                                                                                        form.setFieldValue(`passengers.${index}.documentNumber`, "");
                                                                                    }
                                                                                }}
                                                                            >
                                                                                <SelectTrigger className="w-full sm:w-[180px] md:w-[220px] h-12 md:h-14 lg:h-16 text-sm md:text-base border-2 border-[var(--cl-pri)] focus:ring-2 focus:ring-[var(--cl-pri)]">
                                                                                    <SelectValue placeholder="Select type" />
                                                                                </SelectTrigger>
                                                                                <SelectContent>
                                                                                    <SelectItem value="ADT">Adult (12+)</SelectItem>
                                                                                    <SelectItem value="CHD">Child (2-11)</SelectItem>
                                                                                    <SelectItem value="INF">Infant (&lt;2)</SelectItem>
                                                                                </SelectContent>
                                                                            </Select>
                                                                        )}
                                                                    </Field>
                                                                </div>
                                                            </div>
                                                            
                                                            {isInfant && (
                                                                <Alert className="mb-4 md:mb-6 border-2 border-[var(--cl-pri)] bg-blue-50">
                                                                    <AlertDescription className="text-xs md:text-sm lg:text-base">
                                                                        <p className="font-bold text-[var(--cl-pri)] mb-2 md:mb-3 text-sm md:text-base lg:text-lg">Infant Requirements:</p>
                                                                        <ul className="list-disc list-inside space-y-1 md:space-y-2 text-gray-700 text-xs md:text-sm">
                                                                            <li>Must be accompanied by an adult (18+)</li>
                                                                            <li>No separate seat (sits on adult's lap)</li>
                                                                            <li>Maximum 1 infant per adult</li>
                                                                        </ul>
                                                                        {infantCount > adultCount && (
                                                                            <p className="mt-2 md:mt-3 font-bold text-destructive text-xs md:text-sm lg:text-base">
                                                                                Warning: You have {infantCount} infant(s) but only {adultCount} adult(s). 
                                                                                Each adult can only accompany 1 infant. Additional infant(s) must be booked as Child (CHD).
                                                                            </p>
                                                                        )}
                                                                    </AlertDescription>
                                                                </Alert>
                                                            )}
                                                            
                                                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6">
                                                                <div className="flex flex-col gap-2 md:gap-3">
                                                                    <Label htmlFor={`passengers.${index}.fullname`} className="text-sm md:text-base font-semibold text-[var(--cl-pri)]">
                                                                        Full Name *
                                                                    </Label>
                                                                    <Field
                                                                        as={Input}
                                                                        type="text"
                                                                        id={`passengers.${index}.fullname`}
                                                                        name={`passengers.${index}.fullname`}
                                                                        disabled={passenger.isCurrentUser && user}
                                                                        className="h-12 md:h-14 lg:h-16 text-sm md:text-base lg:text-lg font-semibold border-2 border-[var(--cl-third)] focus:border-[var(--cl-pri)] focus:ring-2 focus:ring-[var(--cl-pri)]"
                                                                    />
                                                                    {passenger.isCurrentUser && user && (
                                                                        <p className="text-xs md:text-sm text-[var(--cl-four)] font-medium">
                                                                            Thông tin này được tự động điền từ tài khoản của bạn
                                                                        </p>
                                                                    )}
                                                                    <ErrorMessage
                                                                        name={`passengers.${index}.fullname`}
                                                                        render={(msg) => (
                                                                            <p className="text-xs md:text-sm text-destructive mt-1 font-medium">{msg}</p>
                                                                        )}
                                                                    />
                                                                </div>
                                                                <div className="flex flex-col gap-2 md:gap-3">
                                                                    <Label htmlFor={`passengers.${index}.dob`} className="text-sm md:text-base font-semibold text-[var(--cl-pri)]">
                                                                        Date of Birth *
                                                                    </Label>
                                                                    <Field name={`passengers.${index}.dob`}>
                                                                        {({ field, form }: any) => {
                                                                            const dobValue = field.value ? new Date(field.value) : undefined;
                                                                            const flightDate = getFlightDate(ticketData);
                                                                            
                                                                            return (
                                                                                <Popover>
                                                                                    <PopoverTrigger asChild>
                                                                                        <Button
                                                                                            variant="outline"
                                                                                            className={`w-full h-12 md:h-14 lg:h-16 text-sm md:text-base lg:text-lg font-semibold justify-start text-left border-2 border-[var(--cl-third)] hover:border-[var(--cl-pri)] focus:border-[var(--cl-pri)] focus:ring-2 focus:ring-[var(--cl-pri)] ${
                                                                                                !dobValue && "text-muted-foreground"
                                                                                            }`}
                                                                                        >
                                                                                            <svg
                                                                                                className="mr-2 md:mr-3 h-4 w-4 md:h-5 md:w-5 text-[var(--cl-pri)] flex-shrink-0"
                                                                                                fill="none"
                                                                                                stroke="currentColor"
                                                                                                viewBox="0 0 24 24"
                                                                                                xmlns="http://www.w3.org/2000/svg"
                                                                                            >
                                                                                                <path
                                                                                                    strokeLinecap="round"
                                                                                                    strokeLinejoin="round"
                                                                                                    strokeWidth={2}
                                                                                                    d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
                                                                                                />
                                                                                            </svg>
                                                                                            {dobValue ? (
                                                                                                format(dobValue, "PPP")
                                                                                            ) : (
                                                                                                <span>Pick a date</span>
                                                                                            )}
                                                                                        </Button>
                                                                                    </PopoverTrigger>
                                                                                    <PopoverContent 
                                                                                        className="w-auto min-w-[340px] sm:min-w-[380px] md:min-w-[420px] max-w-[95vw] sm:max-w-none overflow-hidden p-0" 
                                                                                        align="start" 
                                                                                        sideOffset={8}
                                                                                    >
                                                                                        <Calendar
                                                                                            mode="single"
                                                                                            selected={dobValue}
                                                                                            onSelect={(date) => {
                                                                                                if (date) {
                                                                                                    const dobString = format(date, "yyyy-MM-dd");
                                                                                                    form.setFieldValue(field.name, dobString);
                                                                                                    
                                                                                                    // Auto-determine passenger type based on DOB
                                                                                                    const determinedType = determinePassengerType(dobString, flightDate);
                                                                                                    
                                                                                                    if (determinedType && determinedType !== passenger.passengerType) {
                                                                                                        form.setFieldValue(`passengers.${index}.passengerType`, determinedType);
                                                                                                        
                                                                                                        const age = calculateAge(dobString, flightDate);
                                                                                                        if (age >= 0) {
                                                                                                            console.log(`Auto-determined passenger type: ${determinedType} (Age: ${age} at flight date)`);
                                                                                                        }
                                                                                                    }
                                                                                                }
                                                                                            }}
                                                                                            disabled={(date) => date > flightDate}
                                                                                            initialFocus
                                                                                            captionLayout="dropdown"
                                                                                            fromYear={1900}
                                                                                            toYear={new Date().getFullYear()}
                                                                                            className="rounded-md border"
                                                                                            classNames={{
                                                                                                day_selected: "bg-[var(--cl-pri)] text-white hover:bg-[var(--cl-pri)] hover:text-white",
                                                                                                day_today: "bg-[var(--cl-four)]/20 text-[var(--cl-pri)] font-bold",
                                                                                            }}
                                                                                        />
                                                                                    </PopoverContent>
                                                                                </Popover>
                                                                            );
                                                                        }}
                                                                    </Field>
                                                                    <ErrorMessage
                                                                        name={`passengers.${index}.dob`}
                                                                        render={(msg) => (
                                                                            <p className="text-xs md:text-sm text-destructive mt-1 font-medium">{msg}</p>
                                                                        )}
                                                                    />
                                                                    {passenger.dob && (() => {
                                                                        const flightDate = getFlightDate(ticketData);
                                                                        const age = calculateAge(passenger.dob, flightDate);
                                                                        const determinedType = determinePassengerType(passenger.dob, flightDate);
                                                                        
                                                                        if (age >= 0 && determinedType) {
                                                                            const typeMatches = determinedType === passenger.passengerType;
                                                                            return (
                                                                                <p className={`text-xs md:text-sm mt-2 font-medium ${typeMatches ? 'text-[var(--cl-four)]' : 'text-orange-600'}`}>
                                                                                    {typeMatches ? (
                                                                                        <span>✓ Tuổi tại ngày bay: {age} tuổi - Loại hành khách phù hợp: {determinedType}</span>
                                                                                    ) : (
                                                                                        <span>⚠ Tuổi tại ngày bay: {age} tuổi - Đề xuất loại: {determinedType} (hiện tại: {passenger.passengerType})</span>
                                                                                    )}
                                                                                </p>
                                                                            );
                                                                        }
                                                                        return null;
                                                                    })()}
                                                                </div>
                                                                <div className="flex flex-col gap-2 md:gap-3">
                                                                    <Label htmlFor={`passengers.${index}.gender`} className="text-sm md:text-base font-semibold text-[var(--cl-pri)]">
                                                                        Gender *
                                                                    </Label>
                                                                    <Field name={`passengers.${index}.gender`}>
                                                                        {({ field, form }: any) => (
                                                                            <RadioGroup
                                                                                value={field.value || ""}
                                                                                onValueChange={(value: string) => {
                                                                                    form.setFieldValue(field.name, value);
                                                                                }}
                                                                                className="flex flex-row gap-4 md:gap-6 lg:gap-8"
                                                                            >
                                                                                <div className="flex items-center space-x-2 md:space-x-3">
                                                                                    <RadioGroupItem value="MALE" id={`gender-male-${index}`} className="size-5 md:size-6 border-2 border-[var(--cl-pri)] data-[state=checked]:bg-[var(--cl-pri)]" />
                                                                                    <Label htmlFor={`gender-male-${index}`} className="text-sm md:text-base lg:text-lg font-semibold text-[var(--cl-pri)] cursor-pointer">
                                                                                        Male
                                                                                    </Label>
                                                                                </div>
                                                                                <div className="flex items-center space-x-2 md:space-x-3">
                                                                                    <RadioGroupItem value="FEMALE" id={`gender-female-${index}`} className="size-5 md:size-6 border-2 border-[var(--cl-pri)] data-[state=checked]:bg-[var(--cl-pri)]" />
                                                                                    <Label htmlFor={`gender-female-${index}`} className="text-sm md:text-base lg:text-lg font-semibold text-[var(--cl-pri)] cursor-pointer">
                                                                                        Female
                                                                                    </Label>
                                                                                </div>
                                                                            </RadioGroup>
                                                                        )}
                                                                    </Field>
                                                                    <ErrorMessage
                                                                        name={`passengers.${index}.gender`}
                                                                        render={(msg) => (
                                                                            <p className="text-xs md:text-sm text-destructive mt-1 font-medium">{msg}</p>
                                                                        )}
                                                                    />
                                                                </div>
                                                                {/* Document Number: Only shown for ADT passengers, hidden for CHD and INF */}
                                                                {values.passengers[index].passengerType === "ADT" && (
                                                                    <div className="flex flex-col gap-2 md:gap-3">
                                                                        <Label htmlFor={`passengers.${index}.documentNumber`} className="text-sm md:text-base font-semibold text-[var(--cl-pri)]">
                                                                            Document Number (CCCD/Passport) *
                                                                        </Label>
                                                                        <Field
                                                                            as={Input}
                                                                            type="text"
                                                                            id={`passengers.${index}.documentNumber`}
                                                                            name={`passengers.${index}.documentNumber`}
                                                                            className="h-12 md:h-14 lg:h-16 text-sm md:text-base lg:text-lg font-semibold border-2 border-[var(--cl-third)] focus:border-[var(--cl-pri)] focus:ring-2 focus:ring-[var(--cl-pri)]"
                                                                        />
                                                                        <ErrorMessage
                                                                            name={`passengers.${index}.documentNumber`}
                                                                            render={(msg) => (
                                                                                <p className="text-xs md:text-sm text-destructive mt-1 font-medium">{msg}</p>
                                                                            )}
                                                                        />
                                                                    </div>
                                                                )}
                                                                {/* CHD and INF: documentNumber field is completely hidden - not displayed at all */}
                                                                <div className="flex flex-col gap-2 md:gap-3">
                                                                    <Label htmlFor={`passengers.${index}.loyaltyNumber`} className="text-sm md:text-base font-semibold text-[var(--cl-pri)]">
                                                                        Loyalty Number (Optional)
                                                                    </Label>
                                                                    <Field
                                                                        as={Input}
                                                                        type="text"
                                                                        id={`passengers.${index}.loyaltyNumber`}
                                                                        name={`passengers.${index}.loyaltyNumber`}
                                                                        className="h-12 md:h-14 lg:h-16 text-sm md:text-base lg:text-lg font-semibold border-2 border-[var(--cl-third)] focus:border-[var(--cl-pri)] focus:ring-2 focus:ring-[var(--cl-pri)]"
                                                                    />
                                                                </div>
                                                        </div>
                                                    </div>
                                                    );
                                                })}
                                            </div>

                                            <div className="flex flex-col sm:flex-row gap-3 md:gap-4 lg:gap-6 pt-4 md:pt-6 lg:pt-8 border-t-2 border-[var(--cl-pri)]">
                                                <Button
                                                    type="button"
                                                    variant="outline"
                                                    onClick={() => router.back()}
                                                    className="h-12 md:h-14 lg:h-16 px-4 md:px-6 lg:px-8 text-sm md:text-base lg:text-lg font-bold border-2 border-[var(--cl-pri)] text-[var(--cl-pri)] hover:bg-[var(--cl-pri)] hover:text-white transition-all order-2 sm:order-1"
                                                >
                                                    Back
                                                </Button>
                                                <Button
                                                    type="submit"
                                                    disabled={isCreatingBooking}
                                                    className="h-12 md:h-14 lg:h-16 px-4 md:px-6 lg:px-8 text-sm md:text-base lg:text-lg font-bold bg-[var(--cl-pri)] hover:bg-[var(--cl-four)] text-white uppercase tracking-wide transition-all shadow-lg order-1 sm:order-2 flex-1 sm:flex-initial"
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

                        <div className="px-2 md:px-4 lg:px-8 w-full lg:w-[30%] mt-6 lg:mt-0">
                            <div className="lg:sticky lg:top-[calc(var(--hd)+1rem)] bg-gradient-to-br from-white to-blue-50/30 rounded-lg md:rounded-xl lg:rounded-2xl p-4 md:p-6 lg:p-8 border-2 border-[var(--cl-pri)] shadow-lg">
                                <h3 className="text-lg md:text-xl lg:text-2xl xl:text-3xl font-bold text-[var(--cl-pri)] mb-4 md:mb-6 lg:mb-8 uppercase tracking-wide border-b-2 border-[var(--cl-pri)] pb-3 md:pb-4 lg:pb-6">
                                    Booking Summary
                                </h3>
                                {reservationData && (
                                    <div className="flex flex-col gap-y-4 md:gap-y-6">
                                        <div className="flex justify-between items-center p-3 md:p-4 lg:p-6 bg-white rounded-lg md:rounded-xl border-2 border-[var(--cl-pri)]">
                                            <span className="text-sm md:text-base font-semibold text-gray-700">Total Amount:</span>
                                            <span className="text-base md:text-lg lg:text-xl xl:text-2xl font-bold text-[var(--cl-pri)]">
                                                {FormatPrice(reservationData.totalAmount)}
                                            </span>
                                        </div>
                                        <div className="flex justify-between items-center p-3 md:p-4 lg:p-6 bg-white rounded-lg md:rounded-xl border border-[var(--cl-third)]">
                                            <span className="text-sm md:text-base font-semibold text-gray-700">Currency:</span>
                                            <span className="text-sm md:text-base lg:text-lg font-bold text-[var(--cl-pri)]">{reservationData.currencyCode || "VND"}</span>
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

const BookingInfo = () => {
    return (
        <Suspense fallback={
            <main className="flex flex-col pt-[var(--hd)] gap-y-[var(--rowY)]">
                <Breadcrumb />
                <div className="container">
                    <div className="text-center py-8 md:py-12 lg:py-16">
                        <p className="text-base md:text-lg lg:text-xl">Loading...</p>
                    </div>
                </div>
            </main>
        }>
            <BookingInfoContent />
        </Suspense>
    );
};

export default BookingInfo;