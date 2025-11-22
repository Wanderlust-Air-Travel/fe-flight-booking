"use client";
import FlightSearchBar from "@/app/components/FlightSearchBar/FlightSearchBar";
import TripList from "@/app/components/TripList/TripList";
import { TripListType } from "@/types/trip-list-type";
import axios from "axios";
import { useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";

const ServiceDetailsResultSearch = () => {
  const [trips, setTrips] = useState<TripListType[]>([]);



  const searchParams = useSearchParams();

  const origin = searchParams.get("origin");
  const destination = searchParams.get("destination");
  const departDate = searchParams.get("departDate");
  const adults = searchParams.get("adults");
  const minors = searchParams.get("minors");

  useEffect(() => {
    axios
      .get(
        `${process.env.NEXT_PUBLIC_API_URL}/api/v1/search/flights?origin=${origin}&destination=${destination}&departDate=${departDate}&tripType=one_way&adults=${adults}&minors=${minors}`
      )
      .then((res) => {
        setTrips(res.data);
      })
      .catch((err) => {
        console.log(err);
      });
  }, [origin, destination, departDate, adults, minors]);



  console.log(trips);

  return (
    <main className={`pt-[var(--hd)] flex flex-col gap-y-[var(--rowY)]`}>
      <section className="pt-[var(--rowY)] w-full">
        <div className="container">
          <FlightSearchBar />
        </div>
      </section>
      <section className="">
        <div className="container">
          <div className="flex flex-col gap-y-[2rem]">
            <h2 className="text-lg text-[var(--cl-pri)] font-bold uppercase">
              Trip list
            </h2>
            <TripList trips={trips} />
          </div>
        </div>
      </section>
    </main>
  );
};

export default ServiceDetailsResultSearch;
