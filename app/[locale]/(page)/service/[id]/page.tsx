"use client";
import Breadcrumb from "@/app/components/Breadcrumb/Breadcrumb";
import FlightSearchBar from "@/app/components/FlightSearchBar/FlightSearchBar";
import { tripList } from "@/app/_fixtures/trips";
import type { TripListProps } from "@/types/trip-list-type";
import dynamic from "next/dynamic";

// Lazy load TripList component (heavy component with many interactions)
const TripList = dynamic(() => import("@/app/components/TripList/TripList"), {
  loading: () => (
    <div className="flex flex-col gap-y-[1rem]">
      {Array.from({ length: 3 }).map((_, i) => (
        <div key={i} className="h-[200px] bg-gray-200 animate-pulse rounded" />
      ))}
    </div>
  ),
  ssr: true,
});

const ServiceDetails = () => {
  const trips: TripListProps = {
    tripType: "one_way",
    outbound: tripList as unknown as TripListProps["outbound"],
    inbound: undefined,
  };

  return (
    <main className="pt-[var(--hd)] flex flex-col gap-y-[var(--rowY)]">
      <Breadcrumb />
      <section className="w-full">
        <div className="container">
          <FlightSearchBar />
        </div>
      </section>
      <section className="">
        <div className="container">
          <div className="flex flex-col gap-y-[2rem]">
            <h2 className="text-lg text-[var(--cl-pri)] font-bold uppercase">Trip list</h2>
            <TripList trips={trips} loading={false} />
          </div>
        </div>
      </section>
    </main>
  );
};

export default ServiceDetails;
