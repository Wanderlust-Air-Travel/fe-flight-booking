"use client";

import { Suspense } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Form, Formik, Field, ErrorMessage } from "formik";
import { FormField } from "@/components/ui/form-field";
import { format } from "date-fns";
import { AlertCircle } from "lucide-react";
import { cn } from "@/lib/utils";
import { Checkbox } from "@/components/ui/checkbox";
import useUserStore from "@/app/zustand/storeUser";
import useInfoTicket from "@/app/zustand/storeInfoTicket";
import useFightSearchBarStore from "@/app/zustand/storeFightSearchBar";
import Breadcrumb from "@/app/components/Breadcrumb/Breadcrumb";
import InfoTicketBox from "@/app/components/InfoTicketBox/InfoTicketBox";
import FormatPrice from "@/app/components/FormatPrice/FormatPrice";
import { BookingFormData } from "@/types/booking-form-type";
import { determinePassengerType, calculateAge } from "@/lib/passenger-utils";
import { useReservationCountdown } from "@/app/hooks/use-reservation-countdown";
import { useBookingInfo } from "@/app/hooks/use-booking-info";
import { createBookingSchema } from "@/lib/validation/booking-validation";
import { getDefaultDOB } from "@/lib/utils/booking-utils";
import { getDays, getMonths, getYears } from "@/lib/utils/date-select-utils";

const BookingInfoContent = () => {
    const searchParams = useSearchParams();
    const router = useRouter();
    const { accessToken, user, hydrated } = useUserStore();
    const { data: ticketData } = useInfoTicket();
    const { data: searchBarData } = useFightSearchBarStore();

    const flightInstanceId = searchParams.get("flightInstanceId");
    const reservationIdFromUrl = searchParams.get("reservationId");

    // Business logic hook - separates business logic from UI
    const {
        reservationId,
        reservationData,
        isCreatingReservation,
        isCreatingBooking,
        error,
        handleSubmit,
        initialValues,
        flightDate,
    } = useBookingInfo({
        flightInstanceId,
        reservationIdFromUrl,
        accessToken,
        user,
        ticketData,
        searchBarData,
        isAuthHydrated: hydrated,
    });

    // WebSocket: Real-time reservation countdown timer
    const { 
        isSubscribed: isCountdownSubscribed, 
        countdown, 
        remainingSeconds, 
        isExpired, 
        formattedCountdown 
    } = useReservationCountdown(reservationId);

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
        <main className="flex flex-col pt-[var(--hd)] gap-y-[var(--rowY)] bg-[var(--cl-six)]/40">
            <Breadcrumb />
            <InfoTicketBox />

            <section className="py-4 md:py-6 lg:py-8">
                <div className="container max-w-6xl px-2 sm:px-4">
                    <div className="flex flex-col lg:flex-row lg:items-start gap-6 lg:gap-8">
                        {/* Left: Form */}
                        <div className="w-full lg:w-[70%]">
                            <div className="bg-white rounded-lg md:rounded-xl lg:rounded-2xl p-4 sm:p-5 md:p-6 lg:p-8 xl:p-10 border border-[var(--cl-third)] shadow-md">
                                <h2 className="text-xl md:text-2xl lg:text-3xl xl:text-4xl font-bold text-[var(--cl-pri)] mb-4 md:mb-6 lg:mb-8 uppercase tracking-wide">
                                    Passenger Information
                                </h2>

                                {error && (
                                    <Alert variant="destructive" className="mb-4 md:mb-6 lg:mb-8 border-2">
                                        <AlertDescription className="text-sm md:text-base">{error}</AlertDescription>
                                    </Alert>
                                )}

                                {reservationData && (
                                    <Alert className="mb-4 md:mb-6 lg:mb-8 border border-[var(--cl-third)] bg-blue-50">
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
                                    validationSchema={createBookingSchema(flightDate)}
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
                                                    <FormField
                                                        name="contactFullname"
                                                        label="Full Name"
                                                        required
                                                    >
                                                        {({ field, className }) => (
                                                            <Input
                                                                {...field}
                                                                type="text"
                                                                className={cn(
                                                                    "h-12 md:h-14 lg:h-16 text-sm md:text-base lg:text-lg font-semibold border border-[var(--cl-third)] focus:border-[var(--cl-pri)] focus:ring-2 focus:ring-[var(--cl-pri)] pr-10",
                                                                    className
                                                                )}
                                                            />
                                                        )}
                                                    </FormField>
                                                    
                                                    <FormField
                                                        name="contactEmail"
                                                        label="Email"
                                                        required
                                                    >
                                                        {({ field, className }) => (
                                                            <Input
                                                                {...field}
                                                                type="email"
                                                                className={cn(
                                                                    "h-12 md:h-14 lg:h-16 text-sm md:text-base lg:text-lg font-semibold border border-[var(--cl-third)] focus:border-[var(--cl-pri)] focus:ring-2 focus:ring-[var(--cl-pri)] pr-10",
                                                                    className
                                                                )}
                                                            />
                                                        )}
                                                    </FormField>
                                                    
                                                    <div className="md:col-span-2">
                                                        <FormField
                                                            name="contactPhone"
                                                            label="Phone"
                                                            required
                                                        >
                                                            {({ field, className }) => (
                                                                <Input
                                                                    {...field}
                                                                    type="tel"
                                                                    className={cn(
                                                                        "h-12 md:h-14 lg:h-16 text-sm md:text-base lg:text-lg font-semibold border border-[var(--cl-third)] focus:border-[var(--cl-pri)] focus:ring-2 focus:ring-[var(--cl-pri)] pr-10",
                                                                        className
                                                                    )}
                                                                />
                                                            )}
                                                        </FormField>
                                                    </div>
                                                </div>
                                            </div>

                                            {/* User Traveling Selection - Only show if user is logged in */}
                                            {user && (
                                                <div className="flex flex-col gap-y-4 md:gap-y-6 p-4 md:p-6 lg:p-8 bg-gradient-to-br from-blue-50 to-white border border-[var(--cl-third)] rounded-lg md:rounded-xl shadow-sm">
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
                                                                            ? "bg-[var(--cl-pri)] hover:bg-[var(--cl-four)] text-white border border-[var(--cl-pri)] text-xs md:text-sm lg:text-base font-bold px-3 md:px-4 lg:px-6 py-2 md:py-2.5 lg:py-3"
                                                                            : "border border-[var(--cl-pri)] text-[var(--cl-pri)] hover:bg-[var(--cl-pri)] hover:text-white text-xs md:text-sm lg:text-base font-semibold px-3 md:px-4 lg:px-6 py-2 md:py-2.5 lg:py-3"
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
                                                            className="border border-[var(--cl-third)] rounded-lg md:rounded-xl p-4 md:p-6 lg:p-8 bg-gradient-to-br from-white to-blue-50/30 shadow"
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
                                                                                    const defaultDOB = getDefaultDOB(value, flightDate);
                                                                                    form.setFieldValue(`passengers.${index}.dob`, defaultDOB);
                                                                                    
                                                                                    // Clear documentNumber when changing from ADT to CHD/INF
                                                                                    // (since CHD/INF don't need documentNumber)
                                                                                    if (value !== "ADT" && passenger.documentNumber) {
                                                                                        form.setFieldValue(`passengers.${index}.documentNumber`, "");
                                                                                    }
                                                                                }}
                                                                            >
                                                                                <SelectTrigger className="w-full sm:w-[180px] md:w-[220px] h-12 md:h-14 lg:h-16 px-3 text-sm md:text-base lg:text-lg font-semibold border border-[var(--cl-third)] focus:border-[var(--cl-pri)] focus:ring-2 focus:ring-[var(--cl-pri)]">
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
                                                                <Alert className="mb-4 md:mb-6 border border-[var(--cl-third)] bg-blue-50">
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
                                                                <FormField
                                                                    name={`passengers.${index}.fullname`}
                                                                    label="Full Name"
                                                                    required
                                                                >
                                                                    {({ field, className }) => (
                                                                        <div className="relative">
                                                                            <Input
                                                                                {...field}
                                                                                type="text"
                                                                                disabled={passenger.isCurrentUser && user}
                                                                                className={cn(
                                                                                    "h-12 md:h-14 lg:h-16 text-sm md:text-base lg:text-lg font-semibold border border-[var(--cl-third)] focus:border-[var(--cl-pri)] focus:ring-2 focus:ring-[var(--cl-pri)] pr-10",
                                                                                    className
                                                                                )}
                                                                            />
                                                                            {passenger.isCurrentUser && user && (
                                                                                <p className="text-xs md:text-sm text-[var(--cl-four)] font-medium mt-1">
                                                                                    Thông tin này được tự động điền từ tài khoản của bạn
                                                                                </p>
                                                                            )}
                                                                        </div>
                                                                    )}
                                                                </FormField>
                                                                <FormField
                                                                    name={`passengers.${index}.dob`}
                                                                    label="Date of Birth"
                                                                    required
                                                                >
                                                                    {({ field, form, isError }) => {
                                                                        const dobValue: string | undefined = field.value;
                                                                        const [yearPart, monthPart, dayPart] = dobValue
                                                                            ? dobValue.split("-")
                                                                            : ["", "", ""];

                                                                        const days = getDays();
                                                                        const months = getMonths();
                                                                        const years = getYears();

                                                                        const handleDateChange = (
                                                                            part: "day" | "month" | "year",
                                                                            value: string
                                                                        ) => {
                                                                            const newDay = part === "day" ? value : dayPart;
                                                                            const newMonth = part === "month" ? value : monthPart;
                                                                            const newYear = part === "year" ? value : yearPart;

                                                                            // Luôn lưu lại phần đã chọn để Select hiển thị value,
                                                                            // kể cả khi chưa đủ ngày-tháng-năm
                                                                            const newDobString = `${newYear}-${newMonth}-${newDay}`;
                                                                            form.setFieldValue(field.name, newDobString);

                                                                            // Chỉ auto-detect passenger type khi đủ 3 phần hợp lệ
                                                                            if (newYear && newMonth && newDay) {
                                                                                const fullDob = `${newYear}-${newMonth}-${newDay}`;
                                                                                const determinedType = determinePassengerType(
                                                                                    fullDob,
                                                                                    flightDate
                                                                                );
                                                                                if (
                                                                                    determinedType &&
                                                                                    determinedType !== passenger.passengerType
                                                                                ) {
                                                                                    form.setFieldValue(
                                                                                        `passengers.${index}.passengerType`,
                                                                                        determinedType
                                                                                    );
                                                                                }
                                                                            }
                                                                        };

                                                                        return (
                                                                            <div className="flex flex-col gap-2">
                                                                                <div className="flex gap-2 relative">
                                                                                    <Select
                                                                                        value={dayPart}
                                                                                        onValueChange={(value) =>
                                                                                            handleDateChange("day", value)
                                                                                        }
                                                                                    >
                                                                                        <SelectTrigger
                                                                                            className={cn(
                                                                                                "flex-1 min-w-[7rem] h-12 md:h-14 lg:h-16 text-sm md:text-base lg:text-lg font-semibold border border-[var(--cl-third)] focus:border-[var(--cl-pri)] focus:ring-2 focus:ring-[var(--cl-pri)]",
                                                                                                isError
                                                                                                    ? "border-destructive focus:ring-destructive/20"
                                                                                                    : ""
                                                                                            )}
                                                                                        >
                                                                                            <SelectValue placeholder="Day" />
                                                                                        </SelectTrigger>
                                                                                        <SelectContent className="max-h-[250px] overflow-y-auto">
                                                                                            {days.map((item) => (
                                                                                                <SelectItem
                                                                                                    key={item.value}
                                                                                                    value={item.value}
                                                                                                >
                                                                                                    {item.label}
                                                                                                </SelectItem>
                                                                                            ))}
                                                                                        </SelectContent>
                                                                                    </Select>

                                                                                    <Select
                                                                                        value={monthPart}
                                                                                        onValueChange={(value) =>
                                                                                            handleDateChange("month", value)
                                                                                        }
                                                                                    >
                                                                                        <SelectTrigger
                                                                                            className={cn(
                                                                                                "flex-1 min-w-[7rem] h-12 md:h-14 lg:h-16 text-sm md:text-base lg:text-lg font-semibold border border-[var(--cl-third)] focus:border-[var(--cl-pri)] focus:ring-2 focus:ring-[var(--cl-pri)]",
                                                                                                isError
                                                                                                    ? "border-destructive focus:ring-destructive/20"
                                                                                                    : ""
                                                                                            )}
                                                                                        >
                                                                                            <SelectValue placeholder="Month" />
                                                                                        </SelectTrigger>
                                                                                        <SelectContent className="max-h-[250px] overflow-y-auto">
                                                                                            {months.map((item) => (
                                                                                                <SelectItem
                                                                                                    key={item.value}
                                                                                                    value={item.value}
                                                                                                >
                                                                                                    {item.label}
                                                                                                </SelectItem>
                                                                                            ))}
                                                                                        </SelectContent>
                                                                                    </Select>

                                                                                    <Select
                                                                                        value={yearPart}
                                                                                        onValueChange={(value) =>
                                                                                            handleDateChange("year", value)
                                                                                        }
                                                                                    >
                                                                                        <SelectTrigger
                                                                                            className={cn(
                                                                                                "flex-1 min-w-[7rem] h-12 md:h-14 lg:h-16 text-sm md:text-base lg:text-lg font-semibold border border-[var(--cl-third)] focus:border-[var(--cl-pri)] focus:ring-2 focus:ring-[var(--cl-pri)]",
                                                                                                isError
                                                                                                    ? "border-destructive focus:ring-destructive/20"
                                                                                                    : ""
                                                                                            )}
                                                                                        >
                                                                                            <SelectValue placeholder="Year" />
                                                                                        </SelectTrigger>
                                                                                        <SelectContent className="max-h-[250px] overflow-y-auto">
                                                                                            {years.map((item) => (
                                                                                                <SelectItem
                                                                                                    key={item.value}
                                                                                                    value={item.value}
                                                                                                >
                                                                                                    {item.label}
                                                                                                </SelectItem>
                                                                                            ))}
                                                                                        </SelectContent>
                                                                                    </Select>

                                                                                    {isError && (
                                                                                        <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none">
                                                                                            <AlertCircle
                                                                                                className="h-5 w-5 text-destructive"
                                                                                                aria-hidden="true"
                                                                                            />
                                                                                        </div>
                                                                                    )}
                                                                                </div>
                                                                                <ErrorMessage
                                                                                    name={`passengers.${index}.dob`}
                                                                                    component="p"
                                                                                    className="text-destructive text-xs italic mt-1"
                                                                                />
                                                                            </div>
                                                                        );
                                                                    }}
                                                                </FormField>
                                                                    {passenger.dob && (() => {
                                                                        const age = calculateAge(passenger.dob, flightDate);
                                                                    const determinedType = determinePassengerType(passenger.dob, flightDate);
                                                                    
                                                                    if (age >= 0 && determinedType) {
                                                                        const typeMatches = determinedType === passenger.passengerType;
                                                                        return (
                                                                            <div className="md:col-span-2">
                                                                                <p className={`text-xs md:text-sm mt-2 font-medium ${typeMatches ? 'text-[var(--cl-four)]' : 'text-orange-600'}`}>
                                                                                    {typeMatches ? (
                                                                                        <span>✓ Tuổi tại ngày bay: {age} tuổi - Loại hành khách phù hợp: {determinedType}</span>
                                                                                    ) : (
                                                                                        <span>⚠ Tuổi tại ngày bay: {age} tuổi - Đề xuất loại: {determinedType} (hiện tại: {passenger.passengerType})</span>
                                                                                    )}
                                                                                </p>
                                                                            </div>
                                                                        );
                                                                    }
                                                                    return null;
                                                                })()}
                                                                <FormField
                                                                    name={`passengers.${index}.gender`}
                                                                    label="Gender"
                                                                    required
                                                                >
                                                                    {({ field, form, isError }) => (
                                                                        <div className={cn(
                                                                            "p-3 rounded-md border-2 transition-all duration-200",
                                                                            isError ? "border-destructive" : "border-transparent"
                                                                        )}>
                                                                            <RadioGroup
                                                                                value={field.value || ""}
                                                                                onValueChange={(value: string) => {
                                                                                    form.setFieldValue(field.name, value);
                                                                                }}
                                                                                className="flex flex-row gap-4 md:gap-6 lg:gap-8"
                                                                                aria-invalid={isError}
                                                                            >
                                                                                <div className="flex items-center space-x-2 md:space-x-3">
                                                                                    <RadioGroupItem value="MALE" id={`gender-male-${index}`} className={cn(
                                                                                        "size-5 md:size-6 border-2 data-[state=checked]:bg-[var(--cl-pri)]",
                                                                                        isError ? "border-destructive" : "border-[var(--cl-pri)]"
                                                                                    )} />
                                                                                    <Label htmlFor={`gender-male-${index}`} className="text-sm md:text-base lg:text-lg font-semibold text-[var(--cl-pri)] cursor-pointer">
                                                                                        Male
                                                                                    </Label>
                                                                                </div>
                                                                                <div className="flex items-center space-x-2 md:space-x-3">
                                                                                    <RadioGroupItem value="FEMALE" id={`gender-female-${index}`} className={cn(
                                                                                        "size-5 md:size-6 border-2 data-[state=checked]:bg-[var(--cl-pri)]",
                                                                                        isError ? "border-destructive" : "border-[var(--cl-pri)]"
                                                                                    )} />
                                                                                    <Label htmlFor={`gender-female-${index}`} className="text-sm md:text-base lg:text-lg font-semibold text-[var(--cl-pri)] cursor-pointer">
                                                                                        Female
                                                                                    </Label>
                                                                                </div>
                                                                            </RadioGroup>
                                                                        </div>
                                                                    )}
                                                                </FormField>
                                                                
                                                                {/* Document Number: Only shown for ADT passengers, hidden for CHD and INF */}
                                                                {values.passengers[index].passengerType === "ADT" && (
                                                                    <FormField
                                                                        name={`passengers.${index}.documentNumber`}
                                                                        label="Document Number (CCCD/Passport)"
                                                                        required
                                                                    >
                                                                        {({ field, className }) => (
                                                                            <Input
                                                                                {...field}
                                                                                type="text"
                                                                                className={cn(
                                                                                    "h-12 md:h-14 lg:h-16 text-sm md:text-base lg:text-lg font-semibold border border-[var(--cl-third)] focus:border-[var(--cl-pri)] focus:ring-2 focus:ring-[var(--cl-pri)] pr-10",
                                                                                    className
                                                                                )}
                                                                            />
                                                                        )}
                                                                    </FormField>
                                                                )}
                                                                {/* CHD and INF: documentNumber field is completely hidden - not displayed at all */}
                                                                <FormField
                                                                    name={`passengers.${index}.loyaltyNumber`}
                                                                    label="Loyalty Number (Optional)"
                                                                >
                                                                    {({ field, className }) => (
                                                                        <Input
                                                                            {...field}
                                                                            type="text"
                                                                            className={cn(
                                                                                "h-12 md:h-14 lg:h-16 text-sm md:text-base lg:text-lg font-semibold border-2 border-[var(--cl-third)] focus:border-[var(--cl-pri)] focus:ring-2 focus:ring-[var(--cl-pri)] pr-10",
                                                                                className
                                                                            )}
                                                                        />
                                                                    )}
                                                                </FormField>
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
                                                    className="h-11 md:h-12 lg:h-14 px-4 md:px-6 lg:px-8 text-sm md:text-base font-bold border border-[var(--cl-pri)] text-[var(--cl-pri)] hover:bg-[var(--cl-pri)] hover:text-white transition-all order-2 sm:order-1"
                                                >
                                                    Back
                                                </Button>
                                                <Button
                                                    type="submit"
                                                    disabled={isCreatingBooking}
                                                    className="h-11 md:h-12 lg:h-14 px-4 md:px-6 lg:px-8 text-sm md:text-base font-bold bg-[var(--cl-pri)] hover:bg-[var(--cl-four)] text-white uppercase tracking-wide transition-all shadow-lg order-1 sm:order-2 flex-1 sm:flex-initial"
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

                        {/* Right: Summary */}
                        <div className="w-full lg:w-[30%] mt-2 lg:mt-0">
                            <div className="lg:sticky lg:top-[calc(var(--hd)+1rem)] bg-gradient-to-br from-white to-blue-50/30 rounded-lg md:rounded-xl lg:rounded-2xl p-4 sm:p-5 md:p-6 lg:p-8 border border-[var(--cl-third)] shadow-md">
                                <h3 className="text-lg md:text-xl lg:text-2xl xl:text-3xl font-bold text-[var(--cl-pri)] mb-4 md:mb-6 lg:mb-8 uppercase tracking-wide border-b-2 border-[var(--cl-pri)] pb-3 md:pb-4 lg:pb-6">
                                    Booking Summary
                                </h3>
                                {reservationData && (
                                    <div className="flex flex-col gap-y-4 md:gap-y-6">
                                        <div className="flex justify-between items-center p-3 md:p-4 lg:p-6 bg-white rounded-lg md:rounded-xl border border-[var(--cl-third)]">
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