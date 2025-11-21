"use client";
import FlightSearchBar from "@/app/components/FlightSearchBar/FlightSearchBar";
import { convertToYMD } from "@/app/components/FormatDate/FormatDate";
import TripList from "@/app/components/TripList/TripList";
import useFightSearchBarStore from "@/app/zustand/storeFightSearchBar";
import { TripListType } from "@/types/trip-list-type";
import axios from "axios";
import { useEffect, useState } from "react";

const ServiceDetailsResultSearch = () => {
  const [trips, setTrips] = useState<TripListType[]>([]);
  const { data, setData } = useFightSearchBarStore();

  useEffect(() => {
    axios
      .get(
        `http://localhost:3000/search/flights?origin=${data.from}&destination=${
          data.to
        }&departDate=${convertToYMD(data.startDate)}&tripType=one_way&adults=${
          data.adult
        }&minors=${data.minor}`
      )
      .then((res) => {
        setTrips(res.data);
      })
      .catch((err) => {
        console.log(err);
      });
  }, []);
  

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
            {/* <TripList trips={trips} /> */}
          </div>
        </div>
      </section>
    </main>
  );
};

export default ServiceDetailsResultSearch;
