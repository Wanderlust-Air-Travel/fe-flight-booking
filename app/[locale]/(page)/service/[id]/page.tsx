"use client";
import Breadcrumb from "@/app/components/Breadcrumb/Breadcrumb";
import FlightSearchBar from "@/app/components/FlightSearchBar/FlightSearchBar";
import TripList from "@/app/components/TripList/TripList";
import useFlightSearchBarStore from "@/app/zustand/storeFlightSearchBar";
import { axiosPublic } from "@/lib/axios-instance";
import type { TripListProps } from "@/types/trip-list-type";
import { useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";

const ServiceDetails = () => {
  const [trips, setTrips] = useState<TripListProps | null>(null);
  const [loading, setLoading] = useState(true);
  const searchParams = useSearchParams();
  const { setData } = useFlightSearchBarStore();

  const origin = searchParams.get("origin") || "HAN";
  const destination = searchParams.get("destination") || "SGN";
  const departDate = searchParams.get("departDate") || "";
  const returnDate = searchParams.get("returnDate") || "";
  const tripType = searchParams.get("tripType") || "one_way";
  const adults = searchParams.get("adults") || "1";
  const minors = searchParams.get("minors") || "0";

  // Hydrate search store from URL params
  useEffect(() => {
    setData({
      from: origin,
      to: destination,
      startDate: departDate,
      endDate: returnDate,
      service: tripType,
      adult: Number(adults),
      minor: Number(minors),
      totalPerson: Number(adults) + Number(minors),
    });
  }, [origin, destination, departDate, returnDate, tripType, adults, minors, setData]);

  // Fetch trips from API
  useEffect(() => {
    if (!origin || !destination || !departDate) return;

    setLoading(true);
    axiosPublic
      .get(
        `${process.env.NEXT_PUBLIC_API_URL}/api/v1/search/flights?origin=${origin}&destination=${destination}&departDate=${departDate}&returnDate=${returnDate}&tripType=${tripType}&adults=${adults}&minors=${minors}`
      )
      .then((res) => {
        const tripTypeValue = tripType === "round_trip" ? "round_trip" : "one_way";
        const outboundFlights = Array.isArray(res.data) ? res.data : res.data?.outbound || [];
        const inboundFlights =
          tripTypeValue === "round_trip"
            ? Array.isArray(res.data) ? undefined : res.data?.inbound || undefined
            : undefined;

        setTrips({
          tripType: tripTypeValue,
          outbound: outboundFlights,
          inbound: inboundFlights,
        });
      })
      .catch((err) => {
        console.error("Failed to fetch trips:", err);
      })
      .finally(() => {
        setLoading(false);
      });
  }, [origin, destination, departDate, returnDate, tripType, adults, minors]);

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
            {trips && <TripList trips={trips} loading={loading} />}
          </div>
        </div>
      </section>
    </main>
  );
};

export default ServiceDetails;
