"use client";

import { useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { CheckCircle2, Mail, Ticket, LogIn } from "lucide-react";
import Breadcrumb from "@/app/components/Breadcrumb/Breadcrumb";
import useUserStore from "@/app/zustand/storeUser";
import { axiosPublic } from "@/lib/axios-instance";

// ─── Backend API response shape ───────────────────────────────────────────────
interface ApiSegment {
    segmentId: string;
    flightInstanceId: string;
    flightNumber: string;
    originAirport: string;
    originAirportName: string;
    originCity: string;
    destinationAirport: string;
    destinationAirportName: string;
    destinationCity: string;
    departureDateTime: string;
    arrivalDateTime: string;
    fareClassCode: string;
    fareClassName: string;
    cabinType: string;
    seatNumber: string | null;
    passengerId: string;
    passengerType: string;
}

interface ApiPassenger {
    passengerId: string;
    fullname: string;
    dob: string;
    gender: string;
    passengerType: string;
    documentNumber: string;
}

interface ApiBooking {
    bookingId: string;
    pnrCode: string;
    status: string;
    totalAmount: number;
    currencyCode: string;
    contactFullname?: string;
    contactEmail?: string;
    contactPhone?: string;
    segments: ApiSegment[];
    passengers: ApiPassenger[];
}

// ─── UI component types (for display) ───────────────────────────────────────
interface BookingData {
    bookingId: string;
    pnrCode: string;
    status: string;
    totalAmount: number;
    currencyCode: string;
    contactFullname?: string;
    contactEmail?: string;
    contactPhone?: string;
    segments: ApiSegment[];
    passengers: ApiPassenger[];
}

const CheckInConfirmationPage = () => {
    const searchParams = useSearchParams();
    const { user, accessToken } = useUserStore();
    const bookingCode = searchParams.get("bookingCode");
    const ticketCount = searchParams.get("ticketCount") || "0";
    const alreadyCheckedIn = searchParams.get("alreadyCheckedIn") === "true";

    const [bookingData, setBookingData] = useState<BookingData | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        const fetchBookingDetails = async () => {
            if (!bookingCode) {
                setError("Mã đặt chỗ không hợp lệ");
                setIsLoading(false);
                return;
            }

            try {
                setIsLoading(true);
                const resp = await axiosPublic.get(`/api/bookings/code/${encodeURIComponent(bookingCode)}`);
                setBookingData(resp.data as BookingData);
            } catch (err: any) {
                console.error("[CheckInConfirmation] Error:", err);
                setError("Không thể tải thông tin đặt chỗ");
            } finally {
                setIsLoading(false);
            }
        };

        fetchBookingDetails();
    }, [bookingCode]);

    const isLoggedIn = Boolean(accessToken || user?.id);

    // Format datetime to readable string
    const formatDateTime = (isoString: string) => {
        try {
            const date = new Date(isoString);
            return date.toLocaleString("vi-VN", {
                weekday: "short",
                day: "2-digit",
                month: "2-digit",
                year: "numeric",
                hour: "2-digit",
                minute: "2-digit",
            });
        } catch {
            return isoString;
        }
    };

    return (
        <main className="flex flex-col pt-[var(--hd)] gap-y-[var(--rowY)]">
            <Breadcrumb />
            <div className="container">
                <div className="max-w-2xl mx-auto py-[4rem] sm:py-[6rem]">
                    <div className="bg-white rounded-[1.2rem] sm:rounded-[1.6rem] shadow-lg p-[2rem] sm:p-[2.4rem] md:p-[3rem] border border-[var(--cl-six)]">
                        {/* Success Icon */}
                        <div className="flex justify-center mb-[2.4rem]">
                            <div className="w-[8rem] h-[8rem] sm:w-[10rem] sm:h-[10rem] bg-[var(--cl-pri)]/10 rounded-full flex items-center justify-center">
                                <CheckCircle2 className="w-[4.8rem] h-[4.8rem] sm:w-[6rem] sm:h-[6rem] text-[var(--cl-pri)]" />
                            </div>
                        </div>

                        <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold text-center mb-[1.2rem] text-[var(--cl-pri)]">
                            {alreadyCheckedIn ? "Đặt chỗ đã được làm thủ tục" : "Làm thủ tục thành công!"}
                        </h1>

                        <p className="text-base sm:text-lg text-gray-600 text-center mb-[2.4rem] leading-relaxed">
                            {alreadyCheckedIn
                                ? "Đặt chỗ này đã được làm thủ tục trước đó. Vé máy bay đã được phát hành."
                                : "Vé máy bay của bạn đã được tạo thành công."}
                        </p>

                        {/* Booking Code */}
                        {bookingCode && (
                            <div className="mb-[2.4rem] p-[1.6rem] sm:p-[2rem] bg-[var(--cl-pri)]/5 rounded-lg border border-[var(--cl-pri)]/20">
                                <p className="text-xs sm:text-sm text-gray-600 mb-[0.8rem] uppercase tracking-wide font-medium text-center">
                                    Mã đặt chỗ
                                </p>
                                <p className="text-2xl sm:text-3xl font-mono font-bold text-[var(--cl-pri)] text-center">
                                    {bookingCode}
                                </p>
                            </div>
                        )}

                        {/* Passenger & Flight Details */}
                        {!isLoading && bookingData && (
                            <>
                                {/* Passenger Info */}
                                {bookingData.passengers && bookingData.passengers.length > 0 && (
                                    <div className="mb-[2.4rem] p-[1.6rem] sm:p-[2rem] bg-purple-50 rounded-lg border border-purple-200">
                                        <h3 className="text-lg sm:text-xl font-bold text-gray-800 mb-[1.2rem]">
                                            Thông tin hành khách
                                        </h3>
                                        <div className="space-y-[0.8rem]">
                                            {bookingData.passengers.map((pax) => (
                                                <div key={pax.passengerId} className="bg-white p-[1rem] rounded-lg border border-gray-200">
                                                    <div className="flex items-center justify-between">
                                                        <div>
                                                            <p className="text-base sm:text-lg font-bold text-[var(--cl-pri)]">
                                                                {pax.fullname || "N/A"}
                                                            </p>
                                                            <p className="text-sm text-gray-500 font-medium">
                                                                {pax.passengerType === "ADT" ? "Người lớn" : pax.passengerType === "CHD" ? "Trẻ em" : "Em bé"}
                                                            </p>
                                                        </div>
                                                        <span className="px-3 py-1 bg-purple-100 text-purple-700 text-xs sm:text-sm font-semibold rounded-full">
                                                            {pax.passengerId.slice(0, 8)}...
                                                        </span>
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                )}

                                {/* Flight & Seat Details */}
                                {bookingData.segments && bookingData.segments.length > 0 ? (
                                    <div className="mb-[2.4rem] p-[1.6rem] sm:p-[2rem] bg-blue-50 rounded-lg border border-blue-200">
                                        <h3 className="text-lg sm:text-xl font-bold text-gray-800 mb-[1.2rem]">
                                            Thông tin chuyến bay &amp; ghế ngồi
                                        </h3>
                                        <div className="space-y-[1.2rem]">
                                            {bookingData.segments.map((seg, idx) => (
                                                <div key={seg.segmentId} className="bg-white p-[1.2rem] sm:p-[1.6rem] rounded-lg border border-gray-200">
                                                    {/* Flight Info */}
                                                    <div className="mb-[1rem]">
                                                        <p className="text-base sm:text-lg font-bold text-[var(--cl-pri)]">
                                                            Chuyến bay {idx + 1}: {seg.flightNumber || "N/A"}
                                                        </p>
                                                        {seg.originAirport && seg.destinationAirport && (
                                                            <p className="text-sm sm:text-base text-gray-500 font-medium mt-[0.4rem]">
                                                                {seg.originAirport} → {seg.destinationAirport}
                                                            </p>
                                                        )}
                                                        {seg.originCity && seg.destinationCity && (
                                                            <p className="text-xs sm:text-sm text-gray-400 mt-[0.2rem]">
                                                                {seg.originCity} — {seg.destinationCity}
                                                            </p>
                                                        )}
                                                    </div>

                                                    {/* Schedule */}
                                                    <div className="flex flex-col sm:flex-row gap-[0.8rem] sm:gap-[2rem] mb-[1rem] text-xs sm:text-sm text-gray-600">
                                                        <div>
                                                            <span className="font-medium">Khởi hành:</span>{" "}
                                                            {seg.departureDateTime ? formatDateTime(seg.departureDateTime) : "—"}
                                                        </div>
                                                        <div>
                                                            <span className="font-medium">Đến nơi:</span>{" "}
                                                            {seg.arrivalDateTime ? formatDateTime(seg.arrivalDateTime) : "—"}
                                                        </div>
                                                    </div>

                                                    {/* Seat */}
                                                    {seg.seatNumber ? (
                                                        <div className="bg-green-50 p-[1rem] rounded-lg border border-green-200">
                                                            <p className="text-base sm:text-lg font-bold text-green-700">
                                                                Ghế: <span className="text-xl sm:text-2xl">{seg.seatNumber}</span>
                                                                <span className="ml-[1rem] text-sm font-normal text-green-600">
                                                                    ({seg.cabinType === "business" ? "Hạng thương gia" : "Phổ thông"})
                                                                </span>
                                                            </p>
                                                        </div>
                                                    ) : (
                                                        <div className="bg-yellow-50 p-[1rem] rounded-lg border border-yellow-200">
                                                            <p className="text-sm sm:text-base text-yellow-700 font-medium">Chỗ ngồi chưa được ghi nhận</p>
                                                        </div>
                                                    )}
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                ) : (
                                    <div className="mb-[2.4rem] p-[1.6rem] bg-yellow-50 rounded-lg border border-yellow-200">
                                        <p className="text-base text-gray-600 font-medium">Không có thông tin chuyến bay</p>
                                    </div>
                                )}

                                {/* Contact / Email */}
                                {bookingData.contactEmail && (
                                    <div className="mb-[2.4rem] p-[1.6rem] sm:p-[2rem] bg-gradient-to-br from-[var(--cl-pri)]/10 to-[var(--cl-pri)]/5 rounded-lg border-2 border-[var(--cl-pri)]/30">
                                        <div className="flex items-start gap-[1.2rem]">
                                            <div className="flex-shrink-0 w-[3rem] h-[3rem] bg-[var(--cl-pri)]/20 rounded-full flex items-center justify-center mt-[0.2rem]">
                                                <Mail className="w-[1.6rem] h-[1.6rem] text-[var(--cl-pri)]" />
                                            </div>
                                            <div className="flex-1">
                                                <p className="text-base sm:text-lg text-gray-700 font-bold mb-[0.4rem]">
                                                    Email xác nhận đã được gửi
                                                </p>
                                                <p className="text-sm sm:text-base text-gray-600 leading-relaxed">
                                                    Chúng tôi đã gửi email xác nhận đến{" "}
                                                    <span className="font-semibold text-[var(--cl-pri)]">{bookingData.contactEmail}</span>
                                                </p>
                                                {bookingData.contactFullname && (
                                                    <p className="text-sm text-gray-500 mt-[0.2rem]">
                                                        Người nhận: {bookingData.contactFullname}
                                                    </p>
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                )}

                                {/* Ticket count */}
                                <div className="pt-[1.6rem] border-t border-gray-200">
                                    <p className="text-sm sm:text-base text-gray-600 text-center font-medium">
                                        Số vé đã tạo: <span className="font-bold text-[var(--cl-pri)] text-lg">{ticketCount}</span>
                                    </p>
                                </div>
                            </>
                        )}

                        {/* Loading State */}
                        {isLoading && (
                            <div className="mb-[2.4rem] flex flex-col items-center gap-[1.2rem]">
                                <div className="w-[3rem] h-[3rem] border-4 border-[var(--cl-pri)]/20 border-t-[var(--cl-pri)] rounded-full animate-spin" />
                                <p className="text-base sm:text-lg text-gray-500">Đang tải thông tin đặt chỗ...</p>
                            </div>
                        )}

                        {/* Error State */}
                        {error && (
                            <div className="mb-[2.4rem] p-[1.6rem] bg-red-50 rounded-lg border border-red-200">
                                <p className="text-base sm:text-lg text-red-700 font-medium text-center">{error}</p>
                            </div>
                        )}

                        {/* Action Buttons */}
                        <div className="flex flex-col sm:flex-row gap-[1rem] sm:gap-[1.2rem] mb-[2rem] sm:justify-end">
                            {isLoggedIn ? (
                                <Button
                                    onClick={() => window.location.href = "/my-tickets"}
                                    className="flex-1 sm:flex-initial bg-[var(--cl-pri)] hover:bg-[var(--cl-pri)]/90 text-white px-[2rem] py-[1.2rem] text-base sm:text-lg font-semibold rounded-lg transition-all duration-200 shadow-md hover:shadow-lg"
                                >
                                    <span className="flex items-center justify-center gap-[0.8rem]">
                                        <Ticket className="w-[1.6rem] h-[1.6rem]" />
                                        Xem vé của tôi
                                    </span>
                                </Button>
                            ) : (
                                <Button
                                    onClick={() => window.location.href = "/signin?redirect=/my-tickets"}
                                    className="flex-1 sm:flex-initial bg-[var(--cl-pri)] hover:bg-[var(--cl-pri)]/90 text-white px-[2rem] py-[1.2rem] text-base sm:text-lg font-semibold rounded-lg transition-all duration-200 shadow-md hover:shadow-lg"
                                >
                                    <span className="flex items-center justify-center gap-[0.8rem]">
                                        <LogIn className="w-[1.6rem] h-[1.6rem]" />
                                        Đăng nhập để xem vé
                                    </span>
                                </Button>
                            )}

                            <Button
                                onClick={() => window.location.href = "/"}
                                variant="outline"
                                className="flex-1 sm:flex-initial border-2 border-gray-300 hover:border-[var(--cl-pri)] hover:bg-[var(--cl-pri)]/5 text-gray-700 hover:text-[var(--cl-pri)] px-[2rem] py-[1.2rem] text-base sm:text-lg font-semibold rounded-lg transition-all duration-200"
                            >
                                Về trang chủ
                            </Button>
                        </div>
                    </div>
                </div>
            </div>
        </main>
    );
};

export default CheckInConfirmationPage;
