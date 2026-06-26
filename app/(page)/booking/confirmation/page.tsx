"use client";

import { useEffect, useState, Suspense } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import axiosInstance, { axiosPublic } from "@/lib/axios-instance";
import Breadcrumb from "@/app/components/Breadcrumb/Breadcrumb";
import { Button } from "@/components/ui/button";
import useUserStore from "@/app/zustand/storeUser";
import FormatPrice from "@/app/components/FormatPrice/FormatPrice";
import { CheckCircle2, Calendar, MapPin, Clock, User, CreditCard, Package } from "lucide-react";
import type { BookingDetails, PaymentDetails } from "@/types/confirmation-page-type";

const ConfirmationPageContent = () => {
  const searchParams = useSearchParams();
  const router = useRouter();
  const { accessToken } = useUserStore();

  const bookingId = searchParams.get("bookingId");
  const paymentId = searchParams.get("paymentId");

  const [booking, setBooking] = useState<BookingDetails | null>(null);
  const [payment, setPayment] = useState<PaymentDetails | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      if (!bookingId) {
        setError("Booking ID is missing");
        setLoading(false);
        return;
      }

      try {
        // Try with authenticated client first if user is logged in
        let axiosClient = accessToken ? axiosInstance : axiosPublic;
        let bookingResponse;
        let usedPublicClient = false;

        try {
          // Fetch booking details
          bookingResponse = await axiosClient.get(`/api/bookings/${bookingId}`);
          setBooking(bookingResponse.data);
        } catch (err: any) {
          // If error is "Booking does not belong to the current user" and user is logged in,
          // try again with public client (for guest bookings)
          if (
            accessToken &&
            (err?.response?.data?.message?.includes("Booking does not belong to the current user") ||
             err?.response?.data?.message?.includes("does not belong"))
          ) {
            console.log("Retrying with public client for guest booking...");
            try {
              bookingResponse = await axiosPublic.get(`/api/bookings/${bookingId}`);
              setBooking(bookingResponse.data);
              usedPublicClient = true; // Mark that we used public client
            } catch (retryErr: any) {
              // If retry also fails, throw the original error
              throw err;
            }
          } else {
            // If not a "does not belong" error or user is not logged in, throw the error
            throw err;
          }
        }

        // Fetch payment details if paymentId is provided
        if (paymentId) {
          try {
            // Use public client if we used it for booking, otherwise use the same client as booking
            const paymentClient = usedPublicClient ? axiosPublic : axiosClient;
            const paymentResponse = await paymentClient.get(`/api/payments/${paymentId}`);
            setPayment(paymentResponse.data);
          } catch (paymentError: any) {
            console.warn("Could not fetch payment details:", paymentError.message);
            // Payment fetch failure is not critical, continue without it
          }
        }
      } catch (err: any) {
        console.error("Error fetching confirmation data:", err);
        setError(
          err?.response?.data?.message ||
            err?.message ||
            "Failed to load booking confirmation. Please try again later."
        );
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [bookingId, paymentId, accessToken]);

  const formatDate = (dateString: string) => {
    if (!dateString) return "N/A";
    const date = new Date(dateString);
    return date.toLocaleDateString("vi-VN", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
    });
  };

  const formatTime = (dateString: string) => {
    if (!dateString) return "N/A";
    const date = new Date(dateString);
    return date.toLocaleTimeString("vi-VN", {
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const formatDateTime = (dateString: string) => {
    if (!dateString) return "N/A";
    const date = new Date(dateString);
    return date.toLocaleString("vi-VN", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const getRecommendedCheckInTime = (departureTime: string) => {
    if (!departureTime) return "N/A";
    const departure = new Date(departureTime);
    const checkIn = new Date(departure.getTime() - 2 * 60 * 60 * 1000); // 2 hours before
    return formatDateTime(checkIn.toISOString());
  };

  if (loading) {
    return (
      <main className="flex flex-col pt-[var(--hd)] gap-y-[var(--rowY)] bg-[var(--cl-six)]/40">
        <Breadcrumb />
        <div className="container max-w-6xl px-2 sm:px-4">
          <div className="flex flex-col items-center justify-center py-10 sm:py-14 gap-4">
            <div className="w-12 h-12 rounded-full border-4 border-[var(--cl-pri)] border-t-transparent animate-spin" />
            <p className="text-base sm:text-lg text-[var(--cl-pri)] font-semibold text-center">
              Loading confirmation...
            </p>
          </div>
        </div>
      </main>
    );
  }

  if (error || !booking) {
    return (
      <main className="flex flex-col pt-[var(--hd)] gap-y-[var(--rowY)] bg-[var(--cl-six)]/40">
        <Breadcrumb />
        <div className="container max-w-6xl px-2 sm:px-4">
          <div className="flex flex-col items-center justify-center py-10 sm:py-14 gap-4">
            <p className="text-base sm:text-lg text-[var(--cl-red)] font-semibold text-center max-w-[48rem]">
              {error || "Booking not found"}
            </p>
            <Button
              onClick={() => router.push("/search/flights")}
              className="bg-[var(--cl-pri)] hover:bg-[var(--cl-four)] text-white px-6 sm:px-8"
            >
              Back to Search
            </Button>
          </div>
        </div>
      </main>
    );
  }

  return (
    <main className="flex flex-col pt-[var(--hd)] gap-y-[var(--rowY)] bg-[var(--cl-six)]/40">
      <Breadcrumb />
      <div className="container max-w-6xl px-2 sm:px-4 py-6 md:py-8 lg:py-10">
        {/* Success Header */}
        <div className="mb-8 rounded-2xl bg-gradient-to-r from-[var(--cl-pri)] to-[var(--cl-five)] shadow-lg px-6 py-5 md:px-8 md:py-6">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-full bg-white/10 flex items-center justify-center border border-white/40">
                <CheckCircle2 className="w-7 h-7 text-white" />
              </div>
              <div>
                <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold text-white tracking-wide">
                  Booking Confirmed
                </h1>
                <p className="text-sm sm:text-base md:text-lg text-white/80 mt-2">
                  Your Wanderlust Airways trip is ready. A confirmation email has been sent to your inbox.
                </p>
              </div>
            </div>
            <div className="flex flex-col items-start md:items-end gap-1 text-sm text-white/90">
              <span className="uppercase tracking-wide text-sm sm:text-base opacity-80">
                Booking Code
              </span>
              <span className="text-xl sm:text-2xl md:text-3xl font-extrabold break-all">
                {booking.pnrCode}
              </span>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 sm:gap-6">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            {/* Booking Information */}
            <div className="bg-white rounded-xl border border-[var(--cl-third)]/40 shadow-sm p-5 sm:p-6 md:p-7">
              <h2 className="text-xl font-bold text-[var(--cl-pri)] mb-4 flex items-center gap-2">
                <Calendar className="w-5 h-5" />
                Booking Information
              </h2>
              <div className="space-y-4">
                <div className="flex justify-between items-center text-sm sm:text-base md:text-lg gap-4">
                  <span className="text-gray-600 shrink-0">PNR Code:</span>
                  <span className="font-bold text-[var(--cl-pri)]">{booking.pnrCode}</span>
                </div>
                <div className="flex justify-between items-center text-sm sm:text-base md:text-lg gap-4">
                  <span className="text-gray-600 shrink-0">Booking ID:</span>
                  <span className="font-mono text-[0.75rem] sm:text-sm text-gray-800 break-all">{booking.bookingId}</span>
                </div>
                <div className="flex justify-between items-center text-sm sm:text-base md:text-lg gap-4">
                  <span className="text-gray-600 shrink-0">Status:</span>
                  <span className="font-semibold capitalize text-[var(--cl-five)]">
                    {booking.status}
                  </span>
                </div>
                <div className="flex justify-between items-center pt-3 border-t border-dashed border-[var(--cl-third)]/40 mt-4 text-base sm:text-lg md:text-xl">
                  <span className="text-gray-600 shrink-0">Total Amount:</span>
                  <span className="font-bold text-[var(--cl-pri)]">
                    {FormatPrice(booking.totalAmount)} {booking.currencyCode}
                  </span>
                </div>
              </div>
            </div>

            {/* Flight Details */}
            {booking.segments && booking.segments.length > 0 && (
              <div className="bg-white rounded-xl border border-[var(--cl-third)]/40 shadow-sm p-5 sm:p-6 md:p-7">
                <h2 className="text-xl font-bold text-[var(--cl-pri)] mb-4 flex items-center gap-2">
                  <MapPin className="w-5 h-5" />
                  Flight Details
                </h2>
                <div className="space-y-6">
                  {booking.segments.map((segment, index) => (
                    <div
                      key={segment.segmentId}
                      className="border-b border-dashed border-[var(--cl-third)]/40 pb-4 last:border-b-0 last:pb-0"
                    >
                      <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-3 gap-3">
                        <div className="flex-1">
                          <p className="font-semibold text-lg text-[var(--cl-pri)]">
                            {segment.flightInstance.origin.cityName} ({segment.flightInstance.origin.airportCode})
                          </p>
                          <p className="text-sm text-gray-600">
                            {segment.flightInstance.origin.airportName}
                          </p>
                        </div>
                        <div className="text-center text-[var(--cl-third)] font-semibold text-sm uppercase tracking-wide">
                          <span className="inline-block px-3 py-1 rounded-full bg-[var(--cl-six)]">
                            to
                          </span>
                        </div>
                        <div className="flex-1 text-right">
                          <p className="font-semibold text-lg text-[var(--cl-pri)]">
                            {segment.flightInstance.destination.cityName} ({segment.flightInstance.destination.airportCode})
                          </p>
                          <p className="text-sm text-gray-600">
                            {segment.flightInstance.destination.airportName}
                          </p>
                        </div>
                      </div>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-4 text-base md:text-lg">
                        <div>
                          <p className="text-sm uppercase tracking-wide text-gray-500 font-medium">
                            Departure
                          </p>
                          <p className="font-semibold text-[var(--cl-pri)] text-base md:text-lg">
                            {formatDate(segment.flightInstance.departureDatetimeLocal)} at {formatTime(segment.flightInstance.departureDatetimeLocal)}
                          </p>
                        </div>
                        <div>
                          <p className="text-sm uppercase tracking-wide text-gray-500 font-medium">
                            Arrival
                          </p>
                          <p className="font-semibold text-[var(--cl-pri)] text-base md:text-lg">
                            {formatDate(segment.flightInstance.arrivalDatetimeLocal)} at {formatTime(segment.flightInstance.arrivalDatetimeLocal)}
                          </p>
                        </div>
                      </div>
                      <div className="mt-5 flex flex-wrap items-center gap-5 text-base">
                        <div>
                          <p className="text-sm text-gray-500 font-medium">Flight Number</p>
                          <p className="font-semibold text-[var(--cl-pri)]">{segment.flightInstance.flight.flightNumber}</p>
                        </div>
                        <div>
                          <p className="text-sm text-gray-500 font-medium">Cabin Class</p>
                          <p className="font-semibold text-[var(--cl-pri)]">{segment.fareClass.fareClassName}</p>
                        </div>
                        {segment.flightSeat && (
                          <div>
                            <p className="text-sm text-gray-500 font-medium">Seat</p>
                            <p className="font-semibold text-[var(--cl-pri)]">{segment.flightSeat.seatNumber}</p>
                          </div>
                        )}
                      </div>
                      <div className="mt-5 p-4 bg-[var(--cl-pri)]/5 border border-[var(--cl-pri)]/10 rounded-lg">
                        <p className="text-base text-[var(--cl-pri)]">
                          <Clock className="w-5 h-5 inline mr-1" />
                          <strong>Recommended Check-in Time:</strong> {getRecommendedCheckInTime(segment.flightInstance.departureDatetimeLocal)}
                        </p>
                      </div>
                      {segment.services && segment.services.length > 0 && (
                        <div className="mt-4 p-3 bg-[var(--cl-six)]/60 border border-[var(--cl-third)]/30 rounded-md">
                          <p className="text-sm font-semibold text-[var(--cl-pri)] mb-2 flex items-center gap-2">
                            <Package className="w-4 h-4" />
                            Dịch vụ đã đăng ký
                          </p>
                          <ul className="space-y-1 text-sm text-gray-700">
                            {segment.services.map((svc, i) => (
                              <li key={i} className="flex justify-between items-center">
                                <span>{svc.serviceName ?? svc.serviceType ?? "Dịch vụ"}</span>
                                <span className="font-medium">
                                  {svc.isIncluded ? "Đã bao gồm" : (svc.price != null ? `${FormatPrice(svc.price)} ${booking.currencyCode}` : "—")}
                                </span>
                              </li>
                            ))}
                          </ul>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Passenger Information */}
            {booking.passengers && booking.passengers.length > 0 && (
              <div className="bg-white rounded-xl border border-[var(--cl-third)]/40 shadow-sm p-5 sm:p-6 md:p-7">
                <h2 className="text-xl font-bold text-[var(--cl-pri)] mb-4 flex items-center gap-2">
                  <User className="w-5 h-5" />
                  Passenger Information
                </h2>
                <div className="space-y-4">
                  {booking.passengers.map((passenger) => (
                    <div
                      key={passenger.passengerId}
                      className="border-b border-dashed border-[var(--cl-third)]/40 pb-4 last:border-b-0 last:pb-0"
                    >
                      <p className="font-semibold text-xl mb-3 text-[var(--cl-pri)]">
                        {passenger.fullname}
                      </p>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-base md:text-lg">
                        <div>
                          <span className="text-gray-500 font-medium">Date of Birth:</span>
                          <span className="ml-2 font-semibold">{formatDate(passenger.dob)}</span>
                        </div>
                        <div>
                          <span className="text-gray-500 font-medium">Gender:</span>
                          <span className="ml-2 font-semibold capitalize">{passenger.gender}</span>
                        </div>
                        <div className="col-span-2">
                          <span className="text-gray-500 font-medium">Document Number:</span>
                          <span className="ml-2 font-mono font-semibold">{passenger.documentNumber}</span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Sidebar */}
          <div className="space-y-4 sm:space-y-6">
            {/* Payment Information */}
            {payment && (
              <div className="bg-white rounded-xl border border-[var(--cl-third)]/40 shadow-sm p-5 sm:p-6 md:p-7">
                <h2 className="text-xl font-bold text-[var(--cl-pri)] mb-4 flex items-center gap-2">
                  <CreditCard className="w-5 h-5" />
                  Payment Information
                </h2>
                <div className="space-y-4 text-base md:text-lg">
                  <div className="flex justify-between items-start">
                    <span className="text-gray-500 font-medium shrink-0">Payment ID:</span>
                    <span className="font-mono text-[0.7rem] sm:text-sm text-gray-800 break-all text-right">{payment.paymentId}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-gray-500 font-medium shrink-0">Status:</span>
                    <span className={`font-semibold capitalize ${
                      payment.status === "success" ? "text-green-600" :
                      payment.status === "failed" ? "text-red-600" :
                      "text-yellow-600"
                    }`}>
                      {payment.status}
                    </span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-gray-500 font-medium shrink-0">Amount:</span>
                    <span className="font-bold text-[var(--cl-pri)] text-lg">
                      {FormatPrice(payment.amount)} {payment.currencyCode}
                    </span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-gray-500 font-medium shrink-0">Payment Method:</span>
                    <span className="font-semibold text-right">{payment.paymentMethodName}</span>
                  </div>
                  {payment.transactionRef && (
                    <div className="flex justify-between items-start">
                      <span className="text-gray-500 font-medium shrink-0">Transaction Ref:</span>
                      <span className="font-mono text-[0.7rem] sm:text-sm text-gray-800 break-all text-right">{payment.transactionRef}</span>
                    </div>
                  )}
                  {payment.paidAt && (
                    <div className="flex justify-between items-center">
                      <span className="text-gray-500 font-medium shrink-0">Paid At:</span>
                      <span className="font-semibold text-right">{formatDateTime(payment.paidAt)}</span>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Contact Information */}
            {(booking.contactFullname || booking.contactEmail || booking.contactPhone) && (
              <div className="bg-white rounded-xl border border-[var(--cl-third)]/40 shadow-sm p-5 sm:p-6 md:p-7">
                <h2 className="text-xl font-bold text-[var(--cl-pri)] mb-4">
                  Contact Information
                </h2>
                <div className="space-y-3 text-base md:text-lg">
                  {booking.contactFullname && (
                    <div className="flex justify-between items-start gap-2">
                      <span className="text-gray-500 font-medium shrink-0">Name:</span>
                      <span className="font-semibold text-right">{booking.contactFullname}</span>
                    </div>
                  )}
                  {booking.contactEmail && (
                    <div className="flex justify-between items-start gap-2">
                      <span className="text-gray-500 font-medium shrink-0">Email:</span>
                      <span className="font-semibold text-right break-all">{booking.contactEmail}</span>
                    </div>
                  )}
                  {booking.contactPhone && (
                    <div className="flex justify-between items-center gap-2">
                      <span className="text-gray-500 font-medium shrink-0">Phone:</span>
                      <span className="font-semibold text-right">{booking.contactPhone}</span>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Actions */}
            <div className="bg-white rounded-xl border border-[var(--cl-third)]/40 shadow-sm p-5 sm:p-6 md:p-7">
              <div className="space-y-3">
                <Button
                  onClick={() => router.push("/search/flights")}
                  className="w-full h-11 md:h-12 bg-[var(--cl-pri)] hover:bg-[var(--cl-four)] text-white font-semibold"
                >
                  Book Another Flight
                </Button>
                {accessToken && (
                  <Button
                    onClick={() => router.push("/my-tickets")}
                    className="w-full h-11 md:h-12 border border-[var(--cl-pri)] text-[var(--cl-pri)] hover:bg-[var(--cl-pri)] hover:text-white font-semibold"
                    variant="outline"
                  >
                    View My Tickets
                  </Button>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
};

const ConfirmationPage = () => {
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
      <ConfirmationPageContent />
    </Suspense>
  );
};

export default ConfirmationPage;

