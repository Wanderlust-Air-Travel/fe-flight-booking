"use client";

import Breadcrumb from "@/app/components/Breadcrumb/Breadcrumb";
import useUserStore from "@/app/zustand/storeUser";
import { Button } from "@/components/ui/button";
import { axiosPublic } from "@/lib/axios-instance";
import { CheckCircle2, LogIn, Mail, Plane, Ticket, User } from "lucide-react";
import { useTranslations } from "next-intl";
import { useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";

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
  const t = useTranslations("checkIn");
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
        setError(t("invalidCode"));
        setIsLoading(false);
        return;
      }

      try {
        setIsLoading(true);
        const resp = await axiosPublic.get(`/api/bookings/code/${encodeURIComponent(bookingCode)}`);
        setBookingData(resp.data as BookingData);
      } catch (err: any) {
        console.error("[CheckInConfirmation] Error:", err);
        setError(t("fetchError"));
      } finally {
        setIsLoading(false);
      }
    };

    fetchBookingDetails();
  }, [bookingCode, t]);

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

  if (isLoading) {
    return (
      <main className="flex flex-col pt-[var(--hd)] gap-y-[var(--rowY)] bg-[var(--cl-six)]/40">
        <Breadcrumb />
        <div className="container max-w-6xl px-2 sm:px-4">
          <div className="flex flex-col items-center justify-center py-10 sm:py-14 gap-4">
            <div className="w-12 h-12 rounded-full border-4 border-[var(--cl-pri)] border-t-transparent animate-spin" />
            <p className="text-base sm:text-lg text-[var(--cl-pri)] font-semibold text-center">
              {t("loading")}
            </p>
          </div>
        </div>
      </main>
    );
  }

  if (error || !bookingCode) {
    return (
      <main className="flex flex-col pt-[var(--hd)] gap-y-[var(--rowY)] bg-[var(--cl-six)]/40">
        <Breadcrumb />
        <div className="container max-w-6xl px-2 sm:px-4">
          <div className="flex flex-col items-center justify-center py-10 sm:py-14 gap-4">
            <p className="text-base sm:text-lg text-[var(--cl-red)] font-semibold text-center max-w-[48rem]">
              {error || t("invalidCode")}
            </p>
            <Button
              onClick={() => (window.location.href = "/")}
              className="bg-[var(--cl-pri)] hover:bg-[var(--cl-four)] text-white px-6 sm:px-8"
            >
              {t("backToHome")}
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
        {/* Success Header - Matching booking confirmation style */}
        <div className="mb-8 rounded-2xl bg-gradient-to-r from-[var(--cl-pri)] to-[var(--cl-five)] shadow-lg px-6 py-5 md:px-8 md:py-6">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-full bg-white/10 flex items-center justify-center border border-white/40">
                <CheckCircle2 className="w-7 h-7 text-white" />
              </div>
              <div>
                <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold text-white tracking-wide">
                  {alreadyCheckedIn ? t("alreadyCheckedInTitle") : t("successTitle")}
                </h1>
                <p className="text-sm sm:text-base md:text-lg text-white/80 mt-2">
                  {alreadyCheckedIn ? t("alreadyCheckedInDesc") : t("successDesc")}
                </p>
              </div>
            </div>
            <div className="flex flex-col items-start md:items-end gap-1 text-sm text-white/90">
              <span className="uppercase tracking-wide text-sm sm:text-base opacity-80">
                {t("pnrCodeLabel")}
              </span>
              <span className="text-xl sm:text-2xl md:text-3xl font-extrabold break-all">
                {bookingCode}
              </span>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 sm:gap-6">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            {/* Passenger Info */}
            {bookingData?.passengers && bookingData.passengers.length > 0 && (
              <div className="bg-white rounded-xl border border-[var(--cl-third)]/40 shadow-sm p-5 sm:p-6 md:p-7">
                <h2 className="text-xl font-bold text-[var(--cl-pri)] mb-4 flex items-center gap-2">
                  <User className="w-5 h-5" />
                  {t("passengersTitle")}
                </h2>
                <div className="space-y-4">
                  {bookingData.passengers.map((pax) => (
                    <div
                      key={pax.passengerId}
                      className="p-4 rounded-lg border border-[var(--cl-six)] bg-[var(--cl-six)]/20"
                    >
                      <div className="flex items-center justify-between flex-wrap gap-3">
                        <div>
                          <p className="text-base sm:text-lg font-bold text-[var(--cl-pri)]">
                            {pax.fullname || "N/A"}
                          </p>
                          <p className="text-sm text-[var(--cl-gray)] font-medium mt-1">
                            {pax.passengerType === "ADT"
                              ? t("passengerTypeADT")
                              : pax.passengerType === "CHD"
                                ? t("passengerTypeCHD")
                                : t("passengerTypeINF")}
                          </p>
                        </div>
                        <span className="px-3 py-1 bg-[var(--cl-pri)]/10 text-[var(--cl-pri)] text-sm sm:text-base font-semibold rounded-full">
                          {pax.passengerId.slice(0, 8)}...
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Flight & Seat Details */}
            {bookingData?.segments && bookingData.segments.length > 0 ? (
              <div className="bg-white rounded-xl border border-[var(--cl-third)]/40 shadow-sm p-5 sm:p-6 md:p-7">
                <h2 className="text-xl font-bold text-[var(--cl-pri)] mb-4 flex items-center gap-2">
                  <Plane className="w-5 h-5" />
                  {t("flightTitle")}
                </h2>
                <div className="space-y-4">
                  {bookingData.segments.map((seg, idx) => (
                    <div
                      key={seg.segmentId}
                      className="p-4 sm:p-5 rounded-lg border border-[var(--cl-six)] bg-[var(--cl-six)]/20"
                    >
                      {/* Flight Info */}
                      <div className="mb-3">
                        <p className="text-base sm:text-lg font-bold text-[var(--cl-pri)]">
                          {t("flightLabel", {
                            n: idx + 1,
                            flight: seg.flightNumber || "N/A",
                          })}
                        </p>
                        {seg.originAirport && seg.destinationAirport && (
                          <p className="text-sm sm:text-base text-[var(--cl-gray)] font-medium mt-1">
                            {seg.originAirport} → {seg.destinationAirport}
                          </p>
                        )}
                        {seg.originCity && seg.destinationCity && (
                          <p className="text-sm sm:text-base text-[var(--cl-gray)]/70 mt-1">
                            {seg.originCity} — {seg.destinationCity}
                          </p>
                        )}
                      </div>

                      {/* Schedule */}
                      <div className="flex flex-col sm:flex-row gap-3 sm:gap-6 text-sm sm:text-base text-[var(--cl-gray)] mb-3">
                        <div>
                          <span className="font-medium">{t("departure")}</span>
                          {seg.departureDateTime ? formatDateTime(seg.departureDateTime) : "—"}
                        </div>
                        <div>
                          <span className="font-medium">{t("arrival")}</span>
                          {seg.arrivalDateTime ? formatDateTime(seg.arrivalDateTime) : "—"}
                        </div>
                      </div>

                      {/* Seat */}
                      {seg.seatNumber ? (
                        <div className="p-3 rounded-lg border border-[var(--cl-five)]/30 bg-[var(--cl-five)]/10">
                          <p className="text-base sm:text-lg font-bold text-[var(--cl-five)]">
                            {`${t("seatLabel")} `}
                            <span className="text-xl sm:text-2xl">{seg.seatNumber}</span>
                            <span className="ml-2 text-sm font-normal text-[var(--cl-gray)]">
                              (
                              {seg.cabinType === "business"
                                ? t("cabinBusiness")
                                : t("cabinEconomy")}
                              )
                            </span>
                          </p>
                        </div>
                      ) : (
                        <div className="p-3 rounded-lg border border-[var(--cl-six)] bg-[var(--cl-six)]/40">
                          <p className="text-sm sm:text-base text-[var(--cl-gray)] font-medium">
                            {t("seatUnassigned")}
                          </p>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            ) : (
              <div className="bg-white rounded-xl border border-[var(--cl-third)]/40 shadow-sm p-5 sm:p-6 md:p-7">
                <p className="text-base text-[var(--cl-gray)] font-medium">{t("flightNoFlight")}</p>
              </div>
            )}

            {/* Ticket count */}
            <div className="bg-white rounded-xl border border-[var(--cl-third)]/40 shadow-sm p-5 sm:p-6">
              <p className="text-sm sm:text-base text-[var(--cl-gray)] text-center font-medium">
                {t("ticketCountLabel")}
                <span className="font-bold text-[var(--cl-pri)] text-lg">{ticketCount}</span>
              </p>
            </div>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Contact / Email */}
            {bookingData?.contactEmail && (
              <div className="bg-white rounded-xl border border-[var(--cl-third)]/40 shadow-sm p-5 sm:p-6 md:p-7">
                <h2 className="text-xl font-bold text-[var(--cl-pri)] mb-4 flex items-center gap-2">
                  <Mail className="w-5 h-5" />
                  {t("emailTitle")}
                </h2>
                <div className="space-y-3">
                  <p className="text-sm sm:text-base text-[var(--cl-gray)] leading-relaxed">
                    {t("emailNotice", { email: bookingData.contactEmail })}
                  </p>
                  {bookingData.contactFullname && (
                    <p className="text-sm text-[var(--cl-gray)]/70">
                      {t("recipient", { name: bookingData.contactFullname })}
                    </p>
                  )}
                </div>
              </div>
            )}

            {/* Action Buttons */}
            <div className="bg-white rounded-xl border border-[var(--cl-third)]/40 shadow-sm p-5 sm:p-6 md:p-7">
              <div className="space-y-3">
                {isLoggedIn ? (
                  <Button
                    onClick={() => (window.location.href = "/my-tickets")}
                    className="w-full bg-[var(--cl-pri)] hover:bg-[var(--cl-pri)]/90 text-white px-6 py-3 text-base font-semibold rounded-lg transition-all duration-200 shadow-md hover:shadow-lg"
                  >
                    <span className="flex items-center justify-center gap-2">
                      <Ticket className="w-5 h-5" />
                      {t("actionMyTickets")}
                    </span>
                  </Button>
                ) : (
                  <Button
                    onClick={() => (window.location.href = "/sign-in?redirect=/my-tickets")}
                    className="w-full bg-[var(--cl-pri)] hover:bg-[var(--cl-pri)]/90 text-white px-6 py-3 text-base font-semibold rounded-lg transition-all duration-200 shadow-md hover:shadow-lg"
                  >
                    <span className="flex items-center justify-center gap-2">
                      <LogIn className="w-5 h-5 cursor-pointer" />
                      {t("actionLoginToView")}
                    </span>
                  </Button>
                )}

                <Button
                  onClick={() => (window.location.href = "/")}
                  variant="outline"
                  className="w-full border-2 border-[var(--cl-six)] hover:border-[var(--cl-pri)] hover:bg-[var(--cl-pri)]/5 text-[var(--cl-gray)] hover:text-[var(--cl-pri)] px-6 py-3 text-base font-semibold rounded-lg transition-all duration-200"
                >
                  {t("backToHome")}
                </Button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
};

export default CheckInConfirmationPage;
