"use client";

import { useSearchParams, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { CheckCircle2, Mail, Ticket, LogIn } from "lucide-react";
import Breadcrumb from "@/app/components/Breadcrumb/Breadcrumb";
import useUserStore from "@/app/zustand/storeUser";
import { axiosPublic } from "@/lib/axios-instance";

interface BookingSegment {
    segmentId: string;
    flightInstance: {
        flightInstanceId: string;
        departureDatetimeLocal: string;
        arrivalDatetimeLocal: string;
        origin: { airportCode: string; airportName: string };
        destination: { airportCode: string; airportName: string };
        flight: { flightNumber: string; airline: { airlineName: string } };
    };
    fareClass: { fareClassCode: string; fareClassName: string };
    flightSeat?: { seatNumber: string };
}

interface BookingPassenger {
    passengerId: string;
    fullname: string;
    passengerType: string;
}

interface BookingData {
    bookingId: string;
    pnrCode: string;
    status: string;
    totalAmount: number;
    currencyCode: string;
    segments: BookingSegment[];
    passengers: BookingPassenger[];
}

const CheckInConfirmationPage = () => {
    const searchParams = useSearchParams();
    const router = useRouter();
    const { user, accessToken, hydrated } = useUserStore();
    const bookingCode = searchParams.get("bookingCode");
    const ticketCount = searchParams.get("ticketCount") || "0";
    const alreadyCheckedIn = searchParams.get("alreadyCheckedIn") === "true";
    
    const [bookingData, setBookingData] = useState<BookingData | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    
    // Fetch booking details to display seat information
    useEffect(() => {
        const fetchBookingDetails = async () => {
            if (!bookingCode) {
                setError("Mã đặt chỗ không hợp lệ");
                setIsLoading(false);
                return;
            }

            try {
                setIsLoading(true);
                const response = await axiosPublic.get(`/api/bookings/code/${encodeURIComponent(bookingCode)}`);
                setBookingData(response.data);
                console.log('[CheckInConfirmation] Booking details fetched:', {
                    bookingCode: response.data?.pnrCode,
                    segments: response.data?.segments?.map((s: any) => ({
                        segmentId: s.segmentId,
                        hasFlightInstance: !!s.flightInstance,
                        flightNumber: s?.flightInstance?.flight?.flightNumber,
                        hasSeat: !!s.flightSeat,
                        seatNumber: s?.flightSeat?.seatNumber,
                    })),
                    rawSegments: response.data?.segments,
                });
            } catch (err: any) {
                console.error('[CheckInConfirmation] Error fetching booking details:', err);
                setError("Không thể tải thông tin đặt chỗ");
            } finally {
                setIsLoading(false);
            }
        };

        fetchBookingDetails();
    }, [bookingCode]);
    
    // Check if user is logged in
    const isLoggedIn = Boolean(accessToken || user?.id);

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
                        
                        {/* Title */}
                        <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold text-center mb-[1.2rem] text-[var(--cl-pri)]">
                            {alreadyCheckedIn ? "Đặt chỗ đã được làm thủ tục" : "Làm thủ tục thành công!"}
                        </h1>
                        
                        {/* Description */}
                        <p className="text-base sm:text-lg text-gray-600 text-center mb-[2.4rem] leading-relaxed">
                            {alreadyCheckedIn 
                                ? "Đặt chỗ này đã được làm thủ tục trước đó. Vé máy bay đã được phát hành."
                                : "Vé máy bay của bạn đã được tạo thành công."
                            }
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

                        {/* Seat Details Section - Show if booking loaded and has seat assignments */}
                        {!isLoading && bookingData && (
                            <div className="mb-[2.4rem] p-[1.6rem] sm:p-[2rem] bg-blue-50 rounded-lg border border-blue-200">
                                <h3 className="text-base sm:text-lg font-semibold text-gray-800 mb-[1.2rem]">
                                    ✓ Thông tin chỗ ngồi
                                </h3>
                                
                                {/* Group segments by flight */}
                                {bookingData.segments && bookingData.segments.length > 0 ? (
                                    <div className="space-y-[1.2rem]">
                                        {bookingData.segments.map((segment, idx) => {
                                            // Handle both nested format (flightInstance) and flat format (direct fields)
                                            const flightNumber = 
                                                segment?.flightInstance?.flight?.flightNumber ||  // Nested format
                                                segment?.flightNumber ||  // Flat format from getBookingByCode
                                                'N/A';
                                            
                                            const originCode = 
                                                segment?.flightInstance?.origin?.airportCode ||  // Nested format
                                                segment?.originAirport ||  // Flat format
                                                '';
                                            
                                            const destCode = 
                                                segment?.flightInstance?.destination?.airportCode ||  // Nested format
                                                segment?.destinationAirport ||  // Flat format
                                                '';
                                            
                                            const hasFlightData = segment?.flightInstance && segment?.flightInstance?.flight;
                                            // Seat data: either nested (flightSeat) or flat (seatNumber)
                                            const seatNumber = segment?.flightSeat?.seatNumber || segment?.seatNumber;
                                            const hasSeatData = !!seatNumber;
                                            
                                            return (
                                                <div key={segment.segmentId} className="bg-white p-[1.2rem] rounded-lg border border-gray-200">
                                                    {/* Flight Info */}
                                                    <div className="mb-[0.8rem]">
                                                        <p className="text-sm font-medium text-gray-600">
                                                            Chuyến bay {idx + 1}: {flightNumber}
                                                        </p>
                                                        {originCode && destCode && (
                                                            <p className="text-xs text-gray-500">
                                                                {originCode} → {destCode}
                                                            </p>
                                                        )}
                                                    </div>

                                                    {/* Seat Assignment */}
                                                    {hasSeatData ? (
                                                        <div className="bg-green-50 p-[0.8rem] rounded border border-green-200">
                                                            <p className="text-sm font-semibold text-green-700">
                                                                Chỗ ngồi: <span className="text-lg">{seatNumber}</span>
                                                            </p>
                                                        </div>
                                                    ) : !hasFlightData ? (
                                                        <div className="bg-yellow-50 p-[0.8rem] rounded border border-yellow-200">
                                                            <p className="text-sm text-yellow-700">⚠️ Thông tin chuyến bay chưa được tải. Vui lòng làm mới trang.</p>
                                                        </div>
                                                    ) : (
                                                        <div className="bg-yellow-50 p-[0.8rem] rounded border border-yellow-200">
                                                            <p className="text-sm text-yellow-700">Chỗ ngồi chưa được ghi nhận</p>
                                                        </div>
                                                    )}
                                                </div>
                                            );
                                        })}
                                    </div>
                                ) : (
                                    <p className="text-sm text-gray-600">Không có thông tin chỗ ngồi</p>
                                )}
                            </div>
                        )}

                        {/* Email Notification */}
                        <div className="mb-[2.4rem] p-[1.6rem] sm:p-[2rem] bg-gradient-to-br from-[var(--cl-pri)]/10 to-[var(--cl-pri)]/5 rounded-lg border-2 border-[var(--cl-pri)]/30">
                            <div className="flex items-start gap-[1.2rem]">
                                <div className="flex-shrink-0 w-[2.4rem] h-[2.4rem] bg-[var(--cl-pri)]/20 rounded-full flex items-center justify-center mt-[0.2rem]">
                                    <Mail className="w-[1.4rem] h-[1.4rem] text-[var(--cl-pri)]" />
                                </div>
                                <div className="flex-1">
                                    <p className="text-sm sm:text-base text-gray-700 font-medium mb-[0.8rem]">
                                        Email xác nhận đã được gửi
                                    </p>
                                    <p className="text-sm text-gray-600 leading-relaxed">
                                        Chúng tôi đã gửi email xác nhận với thông tin vé máy bay đến địa chỉ email của bạn. Vui lòng kiểm tra hộp thư đến (và cả thư mục spam) để xem chi tiết vé.
                                    </p>
                                </div>
                            </div>
                        </div>

                        {/* Action Buttons */}
                        <div className="flex flex-col sm:flex-row gap-[1rem] sm:gap-[1.2rem] mb-[2rem] sm:justify-end">
                            {/* Only show "Xem vé của tôi" if user is logged in */}
                            {isLoggedIn ? (
                                <Button
                                    onClick={() => router.push("/my-tickets")}
                                    className="flex-1 sm:flex-initial bg-[var(--cl-pri)] hover:bg-[var(--cl-pri)]/90 text-white px-[2rem] py-[1.2rem] text-base sm:text-lg font-semibold rounded-lg transition-all duration-200 shadow-md hover:shadow-lg"
                                >
                                    <span className="flex items-center justify-center gap-[0.8rem]">
                                        <Ticket className="w-[1.6rem] h-[1.6rem]" />
                                        Xem vé của tôi
                                    </span>
                                </Button>
                            ) : (
                                <Button
                                    onClick={() => router.push(`/signin?redirect=${encodeURIComponent('/my-tickets')}`)}
                                    className="flex-1 sm:flex-initial bg-[var(--cl-pri)] hover:bg-[var(--cl-pri)]/90 text-white px-[2rem] py-[1.2rem] text-base sm:text-lg font-semibold rounded-lg transition-all duration-200 shadow-md hover:shadow-lg"
                                >
                                    <span className="flex items-center justify-center gap-[0.8rem]">
                                        <LogIn className="w-[1.6rem] h-[1.6rem]" />
                                        Đăng nhập để xem vé
                                    </span>
                                </Button>
                            )}
                            
                            <Button
                                onClick={() => router.push("/")}
                                variant="outline"
                                className="flex-1 sm:flex-initial border-2 border-gray-300 hover:border-[var(--cl-pri)] hover:bg-[var(--cl-pri)]/5 text-gray-700 hover:text-[var(--cl-pri)] px-[2rem] py-[1.2rem] text-base sm:text-lg font-semibold rounded-lg transition-all duration-200"
                            >
                                Về trang chủ
                            </Button>
                        </div>

                        {/* Ticket Count */}
                        <div className="pt-[1.6rem] border-t border-gray-200">
                            <p className="text-xs sm:text-sm text-gray-500 text-center">
                                Số vé đã tạo: <span className="font-semibold text-[var(--cl-pri)]">{ticketCount}</span>
                            </p>
                        </div>
                    </div>
                </div>
            </div>
        </main>
    );
};

export default CheckInConfirmationPage;

