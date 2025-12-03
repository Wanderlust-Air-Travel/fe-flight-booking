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
  const [activeTab, setActiveTab] = useState<"booking-code" | "ticket-number">("booking-code");

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
      <MainNavigationTabs />
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
              <div className="flex items-center gap-2 border-b mb-4">
                <button
                  type="button"
                  onClick={() => setActiveTab("booking-code")}
                  className={`px-4 py-2 text-sm font-medium transition-colors ${
                    activeTab === "booking-code"
                      ? "text-[var(--cl-pri)] border-b-2 border-[var(--cl-pri)]"
                      : "text-gray-600 hover:text-[var(--cl-pri)]"
                  }`}
                >
                  Mã Đặt Chỗ
                </button>
                <button
                  type="button"
                  onClick={() => setActiveTab("ticket-number")}
                  className={`px-4 py-2 text-sm font-medium transition-colors ${
                    activeTab === "ticket-number"
                      ? "text-[var(--cl-pri)] border-b-2 border-[var(--cl-pri)]"
                      : "text-gray-600 hover:text-[var(--cl-pri)]"
                  }`}
                >
                  Số Vé
                </button>
              </div>

              {activeTab === "booking-code" ? (
                <div className="space-y-4">
                  <div>
                    <Label htmlFor="bookingCode">Mã Đặt Chỗ (PNR Code)</Label>
                    <Input
                      id="bookingCode"
                      type="text"
                      placeholder="Ví dụ: ABC123"
                      value={bookingCode}
                      onChange={(e) => {
                        setBookingCode(e.target.value.toUpperCase());
                        setError(null);
                      }}
                      className="mt-2 text-center text-lg font-mono tracking-wider"
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
                    className="w-full bg-[var(--cl-pri)] hover:bg-[var(--cl-four)]"
                  >
                    <Search className="w-4 h-4 mr-2" />
                    {isLoading ? "Đang tìm kiếm..." : "Tìm Kiếm"}
                  </Button>
                </div>
              ) : (
                <div className="space-y-4">
                  <div>
                    <Label htmlFor="ticketNumber">Số Vé</Label>
                    <Input
                      id="ticketNumber"
                      type="text"
                      placeholder="Nhập số vé"
                      className="mt-2"
                      disabled={true}
                    />
                    <p className="text-xs text-gray-500 mt-1">
                      Tính năng tìm kiếm theo số vé đang được phát triển
                    </p>
                  </div>
                  <div>
                    <Label htmlFor="lastName">Họ</Label>
                    <Input
                      id="lastName"
                      type="text"
                      placeholder="NGUYEN"
                      className="mt-2"
                      disabled={true}
                    />
                  </div>
                  <Button
                    disabled={true}
                    className="w-full bg-gray-400 cursor-not-allowed"
                  >
                    <Search className="w-4 h-4 mr-2" />
                    Tìm Kiếm
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
                    <FormatPrice price={booking.totalAmount} currency={booking.currency} />
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

