"use client";

import { useEffect, useState } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import axiosInstance, { axiosPublic } from "@/lib/axios-instance";
import Breadcrumb from "@/app/components/Breadcrumb/Breadcrumb";
import { Button } from "@/components/ui/button";
import useUserStore from "@/app/zustand/storeUser";
import FormatPrice from "@/app/components/FormatPrice/FormatPrice";
import { CheckCircle2, Calendar, MapPin, Clock, User, CreditCard } from "lucide-react";
import type { BookingDetails, PaymentDetails } from "@/types/confirmation-page-type";

const ConfirmationPage = () => {
  const searchParams = useSearchParams();
  const router = useRouter();
  const { accessToken, hydrated } = useUserStore();

  const bookingId = searchParams.get("bookingId");
  const paymentId = searchParams.get("paymentId");

  const [booking, setBooking] = useState<BookingDetails | null>(null);
  const [payment, setPayment] = useState<PaymentDetails | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    // Đợi store hydrate xong trước khi gọi API để tránh gọi API 2 lần
    if (!hydrated) {
      return;
    }
    const fetchData = async () => {
      if (!bookingId) {
        setError("Booking ID is missing");
        setLoading(false);
        return;
      }

      try {
        const axiosClient = accessToken ? axiosInstance : axiosPublic;

        // Fetch booking details
        const bookingResponse = await axiosClient.get(`/api/bookings/${bookingId}`);
        setBooking(bookingResponse.data);

        // Fetch payment details if paymentId is provided
        if (paymentId) {
          try {
            const paymentResponse = await axiosClient.get(`/api/payments/${paymentId}`);
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
  }, [bookingId, paymentId, hydrated]);

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
      <main className="flex flex-col pt-[var(--hd)] gap-y-[var(--rowY)]">
        <Breadcrumb />
        <div className="container">
          <div className="text-center py-[4rem]">
            <p className="text-lg">Loading confirmation...</p>
          </div>
        </div>
      </main>
    );
  }

  if (error || !booking) {
    return (
      <main className="flex flex-col pt-[var(--hd)] gap-y-[var(--rowY)]">
        <Breadcrumb />
        <div className="container">
          <div className="text-center py-[4rem]">
            <p className="text-lg text-red-500 mb-[2rem]">
              {error || "Booking not found"}
            </p>
            <Button onClick={() => router.push("/search/flights")}>
              Back to Search
            </Button>
          </div>
        </div>
      </main>
    );
  }

  return (
    <main className="flex flex-col pt-[var(--hd)] gap-y-[var(--rowY)]">
      <Breadcrumb />
      <div className="container">
        {/* Success Header */}
        <div className="bg-green-50 border border-green-200 rounded-lg p-6 mb-6">
          <div className="flex items-center gap-3">
            <CheckCircle2 className="w-8 h-8 text-green-600" />
            <div>
              <h1 className="text-2xl font-bold text-green-800">
                Booking Confirmed!
              </h1>
              <p className="text-green-700 mt-1">
                Your flight booking has been successfully confirmed.
              </p>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            {/* Booking Information */}
            <div className="bg-white rounded-lg border border-gray-200 p-6">
              <h2 className="text-xl font-bold text-[var(--cl-pri)] mb-4 flex items-center gap-2">
                <Calendar className="w-5 h-5" />
                Booking Information
              </h2>
              <div className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-gray-600">PNR Code:</span>
                  <span className="font-bold">{booking.pnrCode}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Booking ID:</span>
                  <span className="font-mono text-sm">{booking.bookingId}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Status:</span>
                  <span className="font-semibold capitalize">{booking.status}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Total Amount:</span>
                  <span className="font-bold text-lg">
                    {FormatPrice(booking.totalAmount)} {booking.currencyCode}
                  </span>
                </div>
              </div>
            </div>

            {/* Flight Details */}
            {booking.segments && booking.segments.length > 0 && (
              <div className="bg-white rounded-lg border border-gray-200 p-6">
                <h2 className="text-xl font-bold text-[var(--cl-pri)] mb-4 flex items-center gap-2">
                  <MapPin className="w-5 h-5" />
                  Flight Details
                </h2>
                <div className="space-y-6">
                  {booking.segments.map((segment, index) => (
                    <div key={segment.segmentId} className="border-b border-gray-200 pb-4 last:border-b-0 last:pb-0">
                      <div className="flex items-center justify-between mb-3">
                        <div>
                          <p className="font-semibold text-lg">
                            {segment.flightInstance.origin.cityName} ({segment.flightInstance.origin.airportCode})
                          </p>
                          <p className="text-sm text-gray-600">
                            {segment.flightInstance.origin.airportName}
                          </p>
                        </div>
                        <div className="text-center">
                          <p className="text-sm text-gray-600">to</p>
                        </div>
                        <div className="text-right">
                          <p className="font-semibold text-lg">
                            {segment.flightInstance.destination.cityName} ({segment.flightInstance.destination.airportCode})
                          </p>
                          <p className="text-sm text-gray-600">
                            {segment.flightInstance.destination.airportName}
                          </p>
                        </div>
                      </div>
                      <div className="grid grid-cols-2 gap-4 mt-4">
                        <div>
                          <p className="text-sm text-gray-600">Departure</p>
                          <p className="font-semibold">
                            {formatDate(segment.flightInstance.departureDatetimeLocal)} at {formatTime(segment.flightInstance.departureDatetimeLocal)}
                          </p>
                        </div>
                        <div>
                          <p className="text-sm text-gray-600">Arrival</p>
                          <p className="font-semibold">
                            {formatDate(segment.flightInstance.arrivalDatetimeLocal)} at {formatTime(segment.flightInstance.arrivalDatetimeLocal)}
                          </p>
                        </div>
                      </div>
                      <div className="mt-4 flex items-center gap-4">
                        <div>
                          <p className="text-sm text-gray-600">Flight Number</p>
                          <p className="font-semibold">{segment.flightInstance.flight.flightNumber}</p>
                        </div>
                        <div>
                          <p className="text-sm text-gray-600">Cabin Class</p>
                          <p className="font-semibold">{segment.fareClass.fareClassName}</p>
                        </div>
                        {segment.flightSeat && (
                          <div>
                            <p className="text-sm text-gray-600">Seat</p>
                            <p className="font-semibold">{segment.flightSeat.seatNumber}</p>
                          </div>
                        )}
                      </div>
                      <div className="mt-4 p-3 bg-blue-50 rounded">
                        <p className="text-sm text-blue-800">
                          <Clock className="w-4 h-4 inline mr-1" />
                          <strong>Recommended Check-in Time:</strong> {getRecommendedCheckInTime(segment.flightInstance.departureDatetimeLocal)}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Passenger Information */}
            {booking.passengers && booking.passengers.length > 0 && (
              <div className="bg-white rounded-lg border border-gray-200 p-6">
                <h2 className="text-xl font-bold text-[var(--cl-pri)] mb-4 flex items-center gap-2">
                  <User className="w-5 h-5" />
                  Passenger Information
                </h2>
                <div className="space-y-4">
                  {booking.passengers.map((passenger) => (
                    <div key={passenger.passengerId} className="border-b border-gray-200 pb-4 last:border-b-0 last:pb-0">
                      <p className="font-semibold text-lg mb-2">{passenger.fullname}</p>
                      <div className="grid grid-cols-2 gap-4 text-sm">
                        <div>
                          <span className="text-gray-600">Date of Birth:</span>
                          <span className="ml-2">{formatDate(passenger.dob)}</span>
                        </div>
                        <div>
                          <span className="text-gray-600">Gender:</span>
                          <span className="ml-2 capitalize">{passenger.gender}</span>
                        </div>
                        <div className="col-span-2">
                          <span className="text-gray-600">Document Number:</span>
                          <span className="ml-2 font-mono">{passenger.documentNumber}</span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Payment Information */}
            {payment && (
              <div className="bg-white rounded-lg border border-gray-200 p-6">
                <h2 className="text-xl font-bold text-[var(--cl-pri)] mb-4 flex items-center gap-2">
                  <CreditCard className="w-5 h-5" />
                  Payment Information
                </h2>
                <div className="space-y-3">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Payment ID:</span>
                    <span className="font-mono text-sm">{payment.paymentId}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Status:</span>
                    <span className={`font-semibold capitalize ${
                      payment.status === "success" ? "text-green-600" : 
                      payment.status === "failed" ? "text-red-600" : 
                      "text-yellow-600"
                    }`}>
                      {payment.status}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Amount:</span>
                    <span className="font-bold">
                      {FormatPrice(payment.amount)} {payment.currencyCode}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Payment Method:</span>
                    <span className="font-semibold">{payment.paymentMethodName}</span>
                  </div>
                  {payment.transactionRef && (
                    <div className="flex justify-between">
                      <span className="text-gray-600">Transaction Ref:</span>
                      <span className="font-mono text-sm">{payment.transactionRef}</span>
                    </div>
                  )}
                  {payment.paidAt && (
                    <div className="flex justify-between">
                      <span className="text-gray-600">Paid At:</span>
                      <span className="text-sm">{formatDateTime(payment.paidAt)}</span>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Contact Information */}
            {(booking.contactFullname || booking.contactEmail || booking.contactPhone) && (
              <div className="bg-white rounded-lg border border-gray-200 p-6">
                <h2 className="text-xl font-bold text-[var(--cl-pri)] mb-4">
                  Contact Information
                </h2>
                <div className="space-y-2 text-sm">
                  {booking.contactFullname && (
                    <p>
                      <span className="text-gray-600">Name:</span>{" "}
                      <span className="font-semibold">{booking.contactFullname}</span>
                    </p>
                  )}
                  {booking.contactEmail && (
                    <p>
                      <span className="text-gray-600">Email:</span>{" "}
                      <span className="font-semibold">{booking.contactEmail}</span>
                    </p>
                  )}
                  {booking.contactPhone && (
                    <p>
                      <span className="text-gray-600">Phone:</span>{" "}
                      <span className="font-semibold">{booking.contactPhone}</span>
                    </p>
                  )}
                </div>
              </div>
            )}

            {/* Actions */}
            <div className="bg-white rounded-lg border border-gray-200 p-6">
              <div className="space-y-3">
                <Button
                  onClick={() => router.push("/search/flights")}
                  className="w-full"
                  variant="outline"
                >
                  Book Another Flight
                </Button>
                {accessToken && (
                  <Button
                    onClick={() => router.push("/my-tickets")}
                    className="w-full"
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

export default ConfirmationPage;

