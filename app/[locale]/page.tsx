"use client";

import useUserStore from "@/app/zustand/storeUser";
import { Button } from "@/components/ui/button";
import { type Locale, localizedHref } from "@/i18n/config";
import { useLocale, useTranslations } from "next-intl";
import dynamic from "next/dynamic";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect } from "react";

// Lazy load heavy components
const BannerHome = dynamic(() => import("@/app/components/Banner/Banner"), {
  loading: () => <div className="h-[calc(100vh-var(--hd))] bg-gray-100 animate-pulse" />,
  // Banner (FlightSearchBar, calendar, Radix Select...) phụ thuộc mạnh vào client state (Date, session),
  // disable SSR để tránh lỗi hydration do chênh lệch server/client markup.
  ssr: false,
});

const ServiceHome = dynamic(() => import("@/app/components/Services/ServiceHome"), {
  loading: () => (
    <ul className="flex flex-wrap gap-y-[2.4rem] -mx-[1.2rem] pb-1">
      {Array.from({ length: 8 }).map((_, i) => (
        <li key={i} className="w-[calc(100%/4)] px-[1.2rem]">
          <div className="h-[300px] bg-gray-200 animate-pulse rounded-[1rem]" />
        </li>
      ))}
    </ul>
  ),
  ssr: true,
});

// Management roles - redirect to admin page
const MANAGEMENT_ROLES = [
  "ADMIN",
  "SCHEDULE_PLANNER",
  "REVENUE_ANALYST",
  "ANCILLARY_MANAGER",
  "CALL_CENTER",
  "ACCOUNTING_STAFF",
  "DISTRIBUTION_MANAGER",
  "FRAUD_ANALYST",
  "FLIGHT_MANAGER",
  "FARE_MANAGER",
  "OPERATIONS",
];

export default function Home() {
  const router = useRouter();
  const locale = useLocale() as Locale;
  const t = useTranslations("home");
  const { isLoggedIn, user, hydrated } = useUserStore();

  // Redirect management roles to admin (roles do Header fetch và set vào store)
  useEffect(() => {
    if (!hydrated || !isLoggedIn || !user?.roles?.length) return;
    const hasManagementRole = user.roles.some((role) => MANAGEMENT_ROLES.includes(role.roleCode));
    if (hasManagementRole) router.push(localizedHref("/admin", locale));
  }, [hydrated, isLoggedIn, user?.roles, router, locale]);

  return (
    <>
      <main className="overflow-hidden pt-[var(--hd)]">
        <BannerHome />

        <section className="py-[var(--rowY)]">
          <div className="flex flex-col gap-y-[2rem]">
            <div className="flex justify-between items-center">
              <h2
                className="text-lg text-[var(--cl-pri)] uppercase font-bold"
                data-aos="fade-right"
              >
                {t("servicesTitle")}
              </h2>
              <Link className="block" href={localizedHref("/", locale)} data-aos="fade-left">
                <Button className="w-fit px-[2rem] h-[4.4rem] bg-[var(--cl-pri)] text-[1.6rem] uppercase hover:bg-[var(--cl-four)]">
                  {t("seeMore")}
                </Button>
              </Link>
            </div>
            <ServiceHome />
          </div>
        </section>
      </main>
    </>
  );
}
