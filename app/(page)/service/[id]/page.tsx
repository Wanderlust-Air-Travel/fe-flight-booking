"use client";
import FlightSearchBar from "@/app/components/FlightSearchBar/FlightSearchBar";
import TripList from "@/app/components/TripList/TripList";
import { TripListType } from "@/types/trip-list-type";
import axios from "axios";
import { useEffect, useState } from "react";

const ServiceDetails = () => {


    const [trips,setTrips] = useState<TripListType[]>([]);

    useEffect(()=>{
        axios.get("/api/trip")
        .then((res)=>   {
            setTrips(res.data);
        })
        .catch((err)=>{
            console.log(err)
        })
    },[])

    console.log(trips)

    

    return (
        <main className={`pt-[var(--hd)] flex flex-col gap-y-[var(--rowY)]`} >
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
    )
}

export default ServiceDetails