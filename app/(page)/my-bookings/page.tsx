"use client";

import { useState, useEffect } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import Breadcrumb from "@/app/components/Breadcrumb/Breadcrumb";
import MainNavigationTabs from "@/app/components/MainNavigationTabs/MainNavigationTabs";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { AlertCircle, Search, Plane, Calendar, MapPin, User, Ticket as TicketIcon } from "lucide-react";
import { axiosPublic } from "@/lib/axios-instance";
import { showError, showLoading, dismissToast, showSuccess } from "@/lib/toast";
import FormatPrice from "@/app/components/FormatPrice/FormatPrice";
import { convertToDMY, convertToLocalTime } from "@/app/components/FormatDate/FormatDate";
import Link from "next/link";
import { Booking, BookingSegment } from "@/types/my-bookings-type";

const MyBookingsPage = () => {
  const searchParams = useSearchParams();
  const router = useRouter();
  const [bookingCode, setBookingCode] = useState(searchParams.get("bookingCode") || "");
  const [lastName, setLastName] = useState("");
  const [booking, setBooking] = useState<Booking | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<"booking-code-ticket" | "membership">("booking-code-ticket");
  const [activeMainTab, setActiveMainTab] = useState<"book-ticket" | "check-in" | "my-bookings">("my-bookings");

  const handleMainTabChange = (tab: "book-ticket" | "check-in" | "my-bookings") => {
    setActiveMainTab(tab);
    if (tab === "book-ticket") {
      router.push("/");
    } else if (tab === "check-in") {
      router.push("/check-in");
    }
    // If tab is "my-bookings", stay on current page
  };

  useEffect(() => {
    if (bookingCode && searchParams.get("bookingCode")) {
      handleSearch();
    }
  }, []);

  const handleSearch = async () => {
    if (!bookingCode.trim()) {
      setError("Vui lòng nhập mã đặt chỗ (PNR code)");
      return;
    }

    setIsLoading(true);
    setError(null);
    setBooking(null);
    const loadingToastId = showLoading("Đang tìm kiếm đặt chỗ...");

    try {
      const response = await axiosPublic.get(`/api/bookings/code/${bookingCode.trim()}`);
      
      if (response.data) {
        dismissToast(loadingToastId);
        showSuccess("Đã tìm thấy đặt chỗ");
        setBooking(response.data);
        // Update URL without reload
        router.push(`/my-bookings?bookingCode=${encodeURIComponent(bookingCode.trim())}`, { scroll: false });
      }
    } catch (err: any) {
      dismissToast(loadingToastId);
      const errorMessage = err.response?.data?.message || 
                          "Không tìm thấy đặt chỗ với mã này. Vui lòng kiểm tra lại.";
      setError(errorMessage);
      showError(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <main className="flex flex-col pt-[var(--hd)] gap-y-[var(--rowY)] min-h-screen bg-gray-50">
      <MainNavigationTabs activeTab={activeMainTab} onTabChange={handleMainTabChange} />
      <Breadcrumb />
      
      <div className="container py-8">
        <div className="max-w-4xl mx-auto">
          <h1 className="text-3xl font-bold text-[var(--cl-pri)] mb-6">Đặt Chỗ Của Tôi</h1>

          {/* Search Form */}
          <Card className="mb-6">
            <CardHeader>
              <CardTitle>Tra Cứu Đặt Chỗ</CardTitle>
              <CardDescription>
                Nhập mã đặt chỗ (PNR code) để xem thông tin đặt chỗ của bạn
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex items-center gap-1 border-b-2 border-[var(--cl-pri)]/10 bg-gradient-to-r from-white to-blue-50/20 rounded-t-lg overflow-hidden shadow-sm mb-6">
                <button
                  type="button"
                  onClick={() => setActiveTab("booking-code-ticket")}
                  className={`relative px-6 py-3 text-base font-semibold transition-all duration-300 flex items-center justify-center ${
                    activeTab === "booking-code-ticket"
                      ? "text-[var(--cl-pri)] bg-gradient-to-b from-[var(--cl-pri)]/10 to-transparent shadow-sm"
                      : "text-gray-600 hover:text-[var(--cl-pri)] hover:bg-[var(--cl-pri)]/5"
                  }`}
                >
                  {activeTab === "booking-code-ticket" && (
                    <div className="absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r from-[var(--cl-pri)] to-[var(--cl-third)] rounded-t-full" />
                  )}
                  <span className="relative z-10">Mã Đặt Chỗ/Số Vé</span>
                </button>
                <button
                  type="button"
                  onClick={() => setActiveTab("membership")}
                  className={`relative px-6 py-3 text-base font-semibold transition-all duration-300 flex items-center justify-center ${
                    activeTab === "membership"
                      ? "text-[var(--cl-pri)] bg-gradient-to-b from-[var(--cl-pri)]/10 to-transparent shadow-sm"
                      : "text-gray-600 hover:text-[var(--cl-pri)] hover:bg-[var(--cl-pri)]/5"
                  }`}
                >
                  {activeTab === "membership" && (
                    <div className="absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r from-[var(--cl-pri)] to-[var(--cl-third)] rounded-t-full" />
                  )}
                  <span className="relative z-10">Hội Viên Wanderlust Club</span>
                </button>
              </div>

              {activeTab === "booking-code-ticket" ? (
                <div className="space-y-6">
                  <div className="text-center mb-4">
                    <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-[var(--cl-pri)]/10 mb-3">
                      <svg className="w-8 h-8 text-[var(--cl-pri)]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                      </svg>
                    </div>
                    <Label htmlFor="bookingCode" className="text-lg font-semibold text-[var(--cl-pri)]">
                      Mã Đặt Chỗ (PNR Code)
                    </Label>
                    <p className="text-sm text-gray-600 mt-1">Nhập mã đặt chỗ 6 ký tự để tra cứu</p>
                  </div>
                  <div>
                    <Input
                      id="bookingCode"
                      type="text"
                      placeholder="Ví dụ: ABC123"
                      value={bookingCode}
                      onChange={(e) => {
                        setBookingCode(e.target.value.toUpperCase());
                        setError(null);
                      }}
                      className="text-center text-xl font-mono tracking-widest border-2 border-[var(--cl-pri)]/30 focus:border-[var(--cl-pri)] focus:ring-2 focus:ring-[var(--cl-pri)]/20 h-14 transition-all"
                      maxLength={10}
                      disabled={isLoading}
                      onKeyDown={(e) => {
                        if (e.key === "Enter") {
                          handleSearch();
                        }
                      }}
                    />
                  </div>
                  <Button
                    onClick={handleSearch}
                    disabled={isLoading || !bookingCode.trim()}
                    className="w-full bg-gradient-to-r from-[var(--cl-pri)] to-[var(--cl-third)] hover:from-[var(--cl-four)] hover:to-[var(--cl-five)] text-white font-semibold py-6 text-base shadow-md hover:shadow-lg transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {isLoading ? (
                      <span className="flex items-center justify-center gap-2">
                        <svg className="animate-spin h-5 w-5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                        </svg>
                        Đang tìm kiếm...
                      </span>
                    ) : (
                      <span className="flex items-center justify-center gap-2">
                        Tìm Kiếm
                      </span>
                    )}
                  </Button>
                </div>
              ) : (
                <div className="space-y-6">
                  <div className="text-center mb-4">
                    <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-[var(--cl-pri)]/10 mb-3">
                      <svg className="w-8 h-8 text-[var(--cl-pri)]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                      </svg>
                    </div>
                    <Label className="text-lg font-semibold text-[var(--cl-pri)]">
                      Hội Viên Wander Club
                    </Label>
                    <p className="text-sm text-gray-600 mt-1">Đăng nhập vào Wanderlust Club để xem chuyến bay sắp tới của bạn</p>
                  </div>
                  <Button
                    className="w-full bg-gradient-to-r from-[var(--cl-four)] to-[var(--cl-five)] hover:from-[var(--cl-five)] hover:to-[var(--cl-four)] text-white font-semibold py-6 text-lg shadow-md hover:shadow-lg transition-all duration-300"
                  >
                    Login
                  </Button>
                </div>
              )}

              {error && (
                <Alert variant="destructive" className="mt-4">
                  <AlertCircle className="h-4 w-4" />
                  <AlertDescription>{error}</AlertDescription>
                </Alert>
              )}
            </CardContent>
          </Card>

          {/* Booking Details */}
          {booking && (
            <Card>
              <CardHeader>
                <div className="flex justify-between items-start">
                  <div>
                    <CardTitle className="text-2xl">Thông Tin Đặt Chỗ</CardTitle>
                    <CardDescription className="mt-2">
                      Mã đặt chỗ: <span className="font-mono font-bold text-[var(--cl-pri)]">{booking.pnrCode}</span>
                    </CardDescription>
                  </div>
                  <div className="text-right">
                    <div className={`px-3 py-1 rounded-full text-sm font-medium ${
                      booking.status === "paid" ? "bg-green-100 text-green-800" :
                      booking.status === "pending" ? "bg-yellow-100 text-yellow-800" :
                      booking.status === "confirmed" ? "bg-blue-100 text-blue-800" :
                      "bg-gray-100 text-gray-800"
                    }`}>
                      {booking.status === "paid" ? "Đã thanh toán" :
                       booking.status === "pending" ? "Chờ thanh toán" :
                       booking.status === "confirmed" ? "Đã xác nhận" :
                       booking.status}
                    </div>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* Contact Information */}
                <div>
                  <h3 className="font-semibold text-lg mb-3 flex items-center gap-2">
                    <User className="w-5 h-5" />
                    Thông Tin Liên Hệ
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 bg-gray-50 p-4 rounded-lg">
                    <div>
                      <p className="text-sm text-gray-600">Họ tên</p>
                      <p className="font-medium">{booking.contactName}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-600">Email</p>
                      <p className="font-medium">{booking.contactEmail}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-600">Số điện thoại</p>
                      <p className="font-medium">{booking.contactPhone}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-600">Ngày đặt</p>
                      <p className="font-medium">{convertToDMY(booking.bookingDate)}</p>
                    </div>
                  </div>
                </div>

                {/* Flight Segments */}
                <div>
                  <h3 className="font-semibold text-lg mb-3 flex items-center gap-2">
                    <Plane className="w-5 h-5" />
                    Thông Tin Chuyến Bay
                  </h3>
                  <div className="space-y-4">
                    {booking.segments?.map((segment, index) => (
                      <Card key={segment.segmentId} className="bg-white">
                        <CardContent className="p-4">
                          <div className="flex items-center justify-between mb-3">
                            <div className="flex items-center gap-2">
                              <Plane className="w-5 h-5 text-[var(--cl-pri)]" />
                              <span className="font-semibold">{segment.flightNumber}</span>
                            </div>
                            <div className="text-right">
                              <p className="text-sm text-gray-600">Hạng vé</p>
                              <p className="font-medium">{segment.cabinClass} - {segment.fareClass}</p>
                            </div>
                          </div>
                          <div className="grid grid-cols-2 gap-4">
                            <div>
                              <p className="text-sm text-gray-600 flex items-center gap-1 mb-1">
                                <MapPin className="w-4 h-4" />
                                Điểm đi
                              </p>
                              <p className="font-semibold text-lg">{segment.origin}</p>
                              <p className="text-sm text-gray-600">
                                {convertToLocalTime(segment.departureDateTime)}
                              </p>
                            </div>
                            <div>
                              <p className="text-sm text-gray-600 flex items-center gap-1 mb-1">
                                <MapPin className="w-4 h-4" />
                                Điểm đến
                              </p>
                              <p className="font-semibold text-lg">{segment.destination}</p>
                              <p className="text-sm text-gray-600">
                                {convertToLocalTime(segment.arrivalDateTime)}
                              </p>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                </div>

                {/* Total Amount */}
                <div className="flex justify-between items-center pt-4 border-t">
                  <span className="text-lg font-semibold">Tổng tiền:</span>
                  <span className="text-2xl font-bold text-[var(--cl-pri)]">
                    {FormatPrice(booking.totalAmount)}
                  </span>
                </div>

                {/* Actions */}
                <div className="flex gap-3 pt-4">
                  {booking.status === "pending" && (
                    <Button asChild className="flex-1 bg-[var(--cl-pri)] hover:bg-[var(--cl-four)]">
                      <Link href={`/booking/payment?bookingId=${booking.bookingId}`}>
                        Thanh Toán
                      </Link>
                    </Button>
                  )}
                  {booking.status === "paid" && (
                    <Button asChild variant="outline" className="flex-1">
                      <Link href={`/check-in?bookingCode=${booking.pnrCode}`}>
                        Làm Thủ Tục
                      </Link>
                    </Button>
                  )}
                  <Button asChild variant="outline" className="flex-1">
                    <Link href={`/my-tickets`}>
                      Xem Vé Của Tôi
                    </Link>
                  </Button>
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </main>
  );
};

export default MyBookingsPage;

