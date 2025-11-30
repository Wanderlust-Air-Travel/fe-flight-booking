"use client";

import { useEffect, useState, useCallback, useRef, Suspense } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import axiosInstance, { axiosPublic } from "@/lib/axios-instance";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Form, Formik, Field, ErrorMessage } from "formik";
import * as Yup from "yup";
import useUserStore from "@/app/zustand/storeUser";
import useInfoTicket from "@/app/zustand/storeInfoTicket";
import useFightSearchBarStore from "@/app/zustand/storeFightSearchBar";
import Breadcrumb from "@/app/components/Breadcrumb/Breadcrumb";
import InfoTicketBox from "@/app/components/InfoTicketBox/InfoTicketBox";
import FormatPrice from "@/app/components/FormatPrice/FormatPrice";
import { PassengerFormData, BookingFormData } from "@/types/booking-form-type";
import { determinePassengerType, getFlightDate, calculateAge, isAdult } from "@/lib/passenger-utils";
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
                            // Build passenger object - only include documentNumber if provided
                            // ADT requires documentNumber, CHD and INF do not
                            const passengerData: any = {
                                passengerType: p.passengerType,
                                fullname: p.fullname,
                                dob: p.dob,
                                gender: p.gender,
                                loyaltyNumber: p.loyaltyNumber,
                            };
                            
                            // Only include documentNumber if it has a value (required for ADT, optional for CHD/INF)
                            if (p.documentNumber && p.documentNumber.trim().length > 0) {
                                passengerData.documentNumber = p.documentNumber.trim();
                            }
                            
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
                                    <Alert variant="destructive" className="mb-[2rem]">
                                        <AlertDescription>{error}</AlertDescription>
                                    </Alert>
                                )}

                                {reservationData && (
                                    <Alert className="mb-[2rem]">
                                        <AlertDescription>
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
                                        </AlertDescription>
                                    </Alert>
                                )}

                                {/* WebSocket: Real-time Reservation Countdown Timer */}
                                {isCountdownSubscribed && countdown && (
                                    <Alert className={`mb-[2rem] ${isExpired ? 'border-red-500 bg-red-50' : remainingSeconds < 300 ? 'border-yellow-500 bg-yellow-50' : 'border-blue-500 bg-blue-50'}`}>
                                        <AlertDescription>
                                            <div className="flex items-center justify-between">
                                                <div>
                                                    <p className="font-semibold">
                                                        {isExpired ? 'Reservation Expired' : 'Reservation Time Remaining'}
                                                    </p>
                                                    <p className="text-sm text-gray-600 mt-1">
                                                        Complete your booking before the reservation expires
                                                    </p>
                                                </div>
                                                <div className="text-right">
                                                    <p className={`text-2xl font-bold ${isExpired ? 'text-red-600' : remainingSeconds < 300 ? 'text-yellow-600' : 'text-blue-600'}`}>
                                                        {formattedCountdown}
                                                    </p>
                                                    {isExpired && (
                                                        <p className="text-xs text-red-600 mt-1">
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
                                        <Form className="flex flex-col gap-y-[2rem]">
                                            {/* Contact Information */}
                                            <div className="flex flex-col gap-y-[1rem]">
                                                <h3 className="text-md font-semibold">
                                                    Contact Information
                                                </h3>
                                                <div className="grid grid-cols-1 md:grid-cols-2 gap-[1rem]">
                                                    <div className="flex flex-col gap-2">
                                                        <Label htmlFor="contactFullname">
                                                            Full Name *
                                                        </Label>
                                                        <Field
                                                            as={Input}
                                                            type="text"
                                                            id="contactFullname"
                                                            name="contactFullname"
                                                        />
                                                        <ErrorMessage
                                                            name="contactFullname"
                                                            render={(msg) => (
                                                                <p className="text-sm text-destructive mt-1">{msg}</p>
                                                            )}
                                                        />
                                                    </div>
                                                    <div className="flex flex-col gap-2">
                                                        <Label htmlFor="contactEmail">
                                                            Email *
                                                        </Label>
                                                        <Field
                                                            as={Input}
                                                            type="email"
                                                            id="contactEmail"
                                                            name="contactEmail"
                                                        />
                                                        <ErrorMessage
                                                            name="contactEmail"
                                                            render={(msg) => (
                                                                <p className="text-sm text-destructive mt-1">{msg}</p>
                                                            )}
                                                        />
                                                    </div>
                                                    <div className="flex flex-col gap-2">
                                                        <Label htmlFor="contactPhone">
                                                            Phone *
                                                        </Label>
                                                        <Field
                                                            as={Input}
                                                            type="text"
                                                            id="contactPhone"
                                                            name="contactPhone"
                                                        />
                                                        <ErrorMessage
                                                            name="contactPhone"
                                                            render={(msg) => (
                                                                <p className="text-sm text-destructive mt-1">{msg}</p>
                                                            )}
                                                        />
                                                    </div>
                                                </div>
                                            </div>

                                            {/* User Traveling Selection - Only show if user is logged in */}
                                            {user && (
                                                <div className="flex flex-col gap-y-[1rem] p-4 bg-gray-50 border border-gray-200 rounded-lg">
                                                    <div className="flex items-center gap-3">
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
                                                        <Label htmlFor="isUserTraveling" className="cursor-pointer">
                                                            Tôi là một trong những hành khách
                                                        </Label>
                                                    </div>
                                                    
                                                    {values.isUserTraveling && (
                                                        <div className="ml-7 mt-2">
                                                            <Label className="mb-2">
                                                                Chọn hành khách là bạn:
                                                            </Label>
                                                            <div className="flex flex-wrap gap-2 mt-2">
                                                                {values.passengers.map((_, idx) => (
                                                                    <Button
                                                                        key={idx}
                                                                        type="button"
                                                                        variant={values.userPassengerIndex === idx ? "default" : "outline"}
                                                                        size="sm"
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
                                            <div className="flex flex-col gap-y-[1rem]">
                                                <h3 className="text-md font-semibold">
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
                                                            className="border border-[var(--cl-third)] rounded p-[1.5rem]"
                                                        >
                                                            <div className="flex justify-between items-center mb-[1rem]">
                                                                <h4 className="text-sm font-semibold">
                                                                    Passenger {index + 1}
                                                                    {passenger.isCurrentUser && user && (
                                                                        <span className="ml-2 text-xs text-blue-600 font-medium">
                                                                            (Bạn)
                                                                        </span>
                                                                    )}
                                                                </h4>
                                                                <div className="flex items-center gap-2">
                                                                    <Label className="text-sm font-medium">
                                                                        Type:
                                                                    </Label>
                                                                    <Field name={`passengers.${index}.passengerType`}>
                                                                        {({ field, form }: any) => (
                                                                            <Select
                                                                                value={field.value}
                                                                                onValueChange={(value) => {
                                                                                    form.setFieldValue(field.name, value);
                                                                                }}
                                                                            >
                                                                                <SelectTrigger className="w-[180px]">
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
                                                                <Alert className="mb-3">
                                                                    <AlertDescription>
                                                                        <p className="font-semibold mb-2">Infant Requirements:</p>
                                                                        <ul className="list-disc list-inside space-y-1">
                                                                            <li>Must be accompanied by an adult (18+)</li>
                                                                            <li>No separate seat (sits on adult's lap)</li>
                                                                            <li>Maximum 1 infant per adult</li>
                                                                        </ul>
                                                                        {infantCount > adultCount && (
                                                                            <p className="mt-2 font-semibold text-destructive">
                                                                                Warning: You have {infantCount} infant(s) but only {adultCount} adult(s). 
                                                                                Each adult can only accompany 1 infant. Additional infant(s) must be booked as Child (CHD).
                                                                            </p>
                                                                        )}
                                                                    </AlertDescription>
                                                                </Alert>
                                                            )}
                                                            
                                                            <div className="grid grid-cols-1 md:grid-cols-2 gap-[1rem]">
                                                                <div className="flex flex-col gap-2">
                                                                    <Label htmlFor={`passengers.${index}.fullname`}>
                                                                        Full Name *
                                                                    </Label>
                                                                    <Field
                                                                        as={Input}
                                                                        type="text"
                                                                        id={`passengers.${index}.fullname`}
                                                                        name={`passengers.${index}.fullname`}
                                                                        disabled={passenger.isCurrentUser && user} // Disable if this is the current user
                                                                    />
                                                                    {passenger.isCurrentUser && user && (
                                                                        <p className="text-xs text-muted-foreground">
                                                                            Thông tin này được tự động điền từ tài khoản của bạn
                                                                        </p>
                                                                    )}
                                                                    <ErrorMessage
                                                                        name={`passengers.${index}.fullname`}
                                                                        render={(msg) => (
                                                                            <p className="text-sm text-destructive mt-1">{msg}</p>
                                                                        )}
                                                                    />
                                                                </div>
                                                                <div className="flex flex-col gap-2">
                                                                    <Label htmlFor={`passengers.${index}.dob`}>
                                                                        Date of Birth *
                                                                    </Label>
                                                                    <Field
                                                                        as={Input}
                                                                        type="date"
                                                                        id={`passengers.${index}.dob`}
                                                                        name={`passengers.${index}.dob`}
                                                                        onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
                                                                            const dob = e.target.value;
                                                                            setFieldValue(`passengers.${index}.dob`, dob);
                                                                            
                                                                            // Auto-determine passenger type based on DOB
                                                                            if (dob) {
                                                                                const flightDate = getFlightDate(ticketData);
                                                                                const determinedType = determinePassengerType(dob, flightDate);
                                                                                
                                                                                if (determinedType && determinedType !== passenger.passengerType) {
                                                                                    // Auto-update passenger type if different
                                                                                    setFieldValue(`passengers.${index}.passengerType`, determinedType);
                                                                                    
                                                                                    // Show info message
                                                                                    const age = calculateAge(dob, flightDate);
                                                                                    if (age >= 0) {
                                                                                        console.log(`Auto-determined passenger type: ${determinedType} (Age: ${age} at flight date)`);
                                                                                    }
                                                                                }
                                                                            }
                                                                        }}
                                                                    />
                                                                    <ErrorMessage
                                                                        name={`passengers.${index}.dob`}
                                                                        render={(msg) => (
                                                                            <p className="text-sm text-destructive mt-1">{msg}</p>
                                                                        )}
                                                                    />
                                                                    {passenger.dob && (() => {
                                                                        const flightDate = getFlightDate(ticketData);
                                                                        const age = calculateAge(passenger.dob, flightDate);
                                                                        const determinedType = determinePassengerType(passenger.dob, flightDate);
                                                                        
                                                                        if (age >= 0 && determinedType) {
                                                                            const typeMatches = determinedType === passenger.passengerType;
                                                                            return (
                                                                                <p className={`text-xs mt-1 ${typeMatches ? 'text-green-600' : 'text-orange-600'}`}>
                                                                                    {typeMatches ? (
                                                                                        <span>Tuổi tại ngày bay: {age} tuổi - Loại hành khách phù hợp: {determinedType}</span>
                                                                                    ) : (
                                                                                        <span>Tuổi tại ngày bay: {age} tuổi - Đề xuất loại: {determinedType} (hiện tại: {passenger.passengerType})</span>
                                                                                    )}
                                                                                </p>
                                                                            );
                                                                        }
                                                                        return null;
                                                                    })()}
                                                                </div>
                                                                <div className="flex flex-col gap-2">
                                                                    <Label htmlFor={`passengers.${index}.gender`}>
                                                                        Gender *
                                                                    </Label>
                                                                    <Field name={`passengers.${index}.gender`}>
                                                                        {({ field, form }: any) => (
                                                                            <Select
                                                                                value={field.value || ""}
                                                                                onValueChange={(value) => {
                                                                                    form.setFieldValue(field.name, value);
                                                                                }}
                                                                            >
                                                                                <SelectTrigger className="w-full">
                                                                                    <SelectValue placeholder="Select gender" />
                                                                                </SelectTrigger>
                                                                                <SelectContent>
                                                                                    <SelectItem value="Male">Male</SelectItem>
                                                                                    <SelectItem value="Female">Female</SelectItem>
                                                                                    <SelectItem value="Other">Other</SelectItem>
                                                                                </SelectContent>
                                                                            </Select>
                                                                        )}
                                                                    </Field>
                                                                    <ErrorMessage
                                                                        name={`passengers.${index}.gender`}
                                                                        render={(msg) => (
                                                                            <p className="text-sm text-destructive mt-1">{msg}</p>
                                                                        )}
                                                                    />
                                                                </div>
                                                                {/* Document Number: Required for ADT, Optional for CHD and INF */}
                                                                {values.passengers[index].passengerType === "ADT" && (
                                                                    <div className="flex flex-col gap-2">
                                                                        <Label htmlFor={`passengers.${index}.documentNumber`}>
                                                                            Document Number (CCCD/Passport) *
                                                                        </Label>
                                                                        <Field
                                                                            as={Input}
                                                                            type="text"
                                                                            id={`passengers.${index}.documentNumber`}
                                                                            name={`passengers.${index}.documentNumber`}
                                                                        />
                                                                        <ErrorMessage
                                                                            name={`passengers.${index}.documentNumber`}
                                                                            render={(msg) => (
                                                                                <p className="text-sm text-destructive mt-1">{msg}</p>
                                                                            )}
                                                                        />
                                                                    </div>
                                                                )}
                                                                {values.passengers[index].passengerType !== "ADT" && (
                                                                    <div className="flex flex-col gap-2">
                                                                        <Label htmlFor={`passengers.${index}.documentNumber`}>
                                                                            Document Number (CCCD/Passport) <span className="text-gray-500 text-sm">(Optional for {values.passengers[index].passengerType === "CHD" ? "Children" : "Infants"})</span>
                                                                        </Label>
                                                                        <Field
                                                                            as={Input}
                                                                            type="text"
                                                                            id={`passengers.${index}.documentNumber`}
                                                                            name={`passengers.${index}.documentNumber`}
                                                                            placeholder="Optional - not required for children and infants"
                                                                        />
                                                                        <ErrorMessage
                                                                            name={`passengers.${index}.documentNumber`}
                                                                            render={(msg) => (
                                                                                <p className="text-sm text-destructive mt-1">{msg}</p>
                                                                            )}
                                                                        />
                                                                    </div>
                                                                )}
                                                                <div className="flex flex-col gap-2">
                                                                    <Label htmlFor={`passengers.${index}.loyaltyNumber`}>
                                                                        Loyalty Number (Optional)
                                                                    </Label>
                                                                    <Field
                                                                        as={Input}
                                                                        type="text"
                                                                        id={`passengers.${index}.loyaltyNumber`}
                                                                        name={`passengers.${index}.loyaltyNumber`}
                                                                    />
                                                                </div>
                                                        </div>
                                                    </div>
                                                    );
                                                })}
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

const BookingInfo = () => {
    return (
        <Suspense fallback={
            <main className="flex flex-col pt-[var(--hd)] gap-y-[var(--rowY)]">
                <Breadcrumb />
                <div className="container">
                    <div className="text-center py-[4rem]">
                        <p className="text-lg">Loading...</p>
                    </div>
                </div>
            </main>
        }>
            <BookingInfoContent />
        </Suspense>
    );
};

export default BookingInfo;

