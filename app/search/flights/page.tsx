"use client";
import Breadcrumb from "@/app/components/Breadcrumb/Breadcrumb";
import FlightSearchBar from "@/app/components/FlightSearchBar/FlightSearchBar";
import TripList from "@/app/components/TripList/TripList";
import { TripListType } from "@/types/trip-list-type";
import axios from "axios";
import { useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";

const ServiceDetailsResultSearch = () => {
  const [trips, setTrips] = useState<TripListType[]>([]);
  const [loading, setLoading] = useState<boolean>(true);



  const searchParams = useSearchParams();

  const origin = searchParams.get("origin");
  const destination = searchParams.get("destination");
  const departDate = searchParams.get("departDate");
  const returnDate = searchParams.get("returnDate") === "undefined-undefined-" ? "" : searchParams.get("returnDate");
  const adults = searchParams.get("adults");
  const minors = searchParams.get("minors");
  const tripType = searchParams.get("tripType");


  console.log(returnDate);


  useEffect(() => {
    setLoading(true);
    axios
      .get(
        `${process.env.NEXT_PUBLIC_API_URL}/api/v1/search/flights?origin=${origin}&destination=${destination}&departDate=${departDate}&returnDate=${returnDate}&tripType=${tripType}&adults=${adults}&minors=${minors}`
      )
      .then((res) => {
        setTrips(res.data);

      })
      .catch((err) => {
        console.log(err);
        setLoading(false);

      })
      .finally(() => {
        setLoading(false);

      })
  }, [origin, destination, departDate, adults, minors, tripType, returnDate]);



  console.log(trips);

  return (
    <main className={`pt-[var(--hd)] flex flex-col gap-y-[var(--rowY)]`}>
      <Breadcrumb />
      <section className="w-full">
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
            <TripList trips={trips} loading={loading} />
          </div>
        </div>
      </section>
    </main>
  );
};

export default ServiceDetailsResultSearch;
