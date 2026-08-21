"use client";
import { Button } from "@/components/ui/button";
import { type Locale, localizedHref } from "@/i18n/config";
import { axiosPublic } from "@/lib/axios-instance";
import { dismissToast, showError, showLoading, showSuccess } from "@/lib/toast";
import type { BannerApi } from "@/types/banner";
import axios from "axios";
import { useLocale, useTranslations } from "next-intl";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { BookingLookupForm } from "../BookingLookupForm/BookingLookupForm";
import FlightSearchBar from "../FlightSearchBar/FlightSearchBar";
import MainNavigationTabs from "../MainNavigationTabs/MainNavigationTabs";

type MainTab = "book-ticket" | "check-in" | "my-bookings";
type CheckInTab = "booking-code" | "ticket-number" | "membership";
type MyBookingsTab = "booking-code-ticket" | "membership";

const BannerHome = () => {
  const [data, setData] = useState<BannerApi | null>(null);
  const [activeMainTab, setActiveMainTab] = useState<MainTab>("book-ticket");
  const [activeCheckInTab, setActiveCheckInTab] = useState<CheckInTab>("booking-code");
  const [activeMyBookingsTab, setActiveMyBookingsTab] =
    useState<MyBookingsTab>("booking-code-ticket");

  const router = useRouter();
  const locale = useLocale() as Locale;
  const tCheckIn = useTranslations("checkIn");
  const tMyBk = useTranslations("myBookings");
  const tCommon = useTranslations("common");

  useEffect(() => {
    axios
      .get("/api/banner")
      .then((res) => {
        setData(res.data);
      })
      .catch(() => {
        // Error toast is shown by the axios interceptor
      });
  }, []);

  const handleCheckInSubmit = async (code: string) => {
    const response = await axiosPublic.get(`/api/bookings/code/${code}`);
    if (response.status === 200 && response.data) {
      router.push(
        `${localizedHref("/check-in/seat-selection", locale)}?bookingCode=${encodeURIComponent(code)}`
      );
      return;
    }
    throw new Error(tCheckIn("notFoundToast"));
  };

  const handleMyBookingsSearch = async (code: string) => {
    const loadingToastId = showLoading(tMyBk("searchingToast"));
    try {
      const response = await axiosPublic.get(`/api/bookings/code/${code.trim()}`);
      if (response.data) {
        dismissToast(loadingToastId);
        showSuccess(tMyBk("foundToast"));
        router.push(
          `${localizedHref("/my-bookings", locale)}?bookingCode=${encodeURIComponent(code.trim())}`
        );
      }
    } catch (err: unknown) {
      dismissToast(loadingToastId);
      const errorMessage =
        (err as { response?: { data?: { message?: string } } })?.response?.data?.message ||
        tMyBk("notFoundToast");
      showError(errorMessage);
      throw err;
    }
  };

  const renderCheckInForm = () => {
    switch (activeCheckInTab) {
      case "booking-code":
        return (
          <BookingLookupForm
            onSubmit={handleCheckInSubmit}
            description={tCheckIn("enterPnr")}
            helper={tCheckIn("pnrConfirmHelp")}
            submitLabel={tCheckIn("checkInButton")}
            submittingLabel={tCheckIn("checkInSubmitting")}
          />
        );

      case "ticket-number":
        return (
          <div className="bg-white rounded-lg p-6 text-center text-gray-600">
            {tCheckIn("featureComingSoon")}
          </div>
        );

      case "membership":
        return (
          <div className="bg-white rounded-lg p-6 text-center text-gray-600">
            {tCheckIn("featureComingSoon")}
          </div>
        );
    }
  };

  const renderMyBookingsForm = () => {
    if (activeMyBookingsTab === "booking-code-ticket") {
      return (
        <BookingLookupForm
          onSubmit={handleMyBookingsSearch}
          description={tMyBk("searchCardDesc")}
          helper={tMyBk("pnrConfirmHelp") || tMyBk("pnrHelper")}
          submitLabel={tMyBk("searchButton")}
          submittingLabel={tCommon("searching")}
        />
      );
    }

    return (
      <div className="bg-white rounded-lg p-6 flex flex-col gap-y-[1.2rem]">
        <p className="text-center text-base text-gray-700 font-medium">{tMyBk("membershipDesc")}</p>
        <Button
          onClick={() => router.push(localizedHref("/sign-in", locale))}
          className="w-full max-w-[20rem] mx-auto h-[4rem]! bg-[var(--cl-pri)] hover:bg-[var(--cl-third)] text-white font-bold py-5 md:py-6 text-base md:text-lg rounded-lg shadow-md hover:shadow-lg transition-all duration-200"
        >
          {tMyBk("membershipLogin")}
        </Button>
      </div>
    );
  };

  const renderFormContent = () => {
    if (activeMainTab === "book-ticket") {
      return (
        <div className="p-4 md:p-6">
          <FlightSearchBar />
        </div>
      );
    }
    if (activeMainTab === "check-in") {
      return <div className="w-full rounded-b-lg bg-white">{renderCheckInForm()}</div>;
    }
    return <div className="w-full rounded-b-lg bg-white">{renderMyBookingsForm()}</div>;
  };

  return (
    <div className="h-[calc(100vh-var(--hd))] relative ">
      {data && (
        <div className="absolute inset-0 w-full h-full z-0 pointer-events-none modal">
          <Image
            src={data.url}
            alt={data.name}
            width={100}
            height={100}
            priority
            unoptimized
            className="w-full h-full object-cover"
          />
        </div>
      )}
      <div className="container">
        <div className="flex flex-col items-start justify-end z-10 h-full relative gap-y-[1.6rem] py-[4rem]">
          {data && (
            <h1
              className="text-start text-white text-[4rem] uppercase font-medium"
              data-aos="fade-up"
              suppressHydrationWarning
            >
              {data.title}
            </h1>
          )}
          <div
            className="w-full z-10 relative"
            data-aos="fade-up"
            data-aos-delay="500"
            suppressHydrationWarning
          >
            <div className="bg-white rounded-2xl">
              <MainNavigationTabs activeTab={activeMainTab} onTabChange={setActiveMainTab} />
              <div className="w-full relative">{renderFormContent()}</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default BannerHome;
