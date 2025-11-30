"use client";
import Breadcrumb from "@/app/components/Breadcrumb/Breadcrumb";
import FlightSearchBar from "@/app/components/FlightSearchBar/FlightSearchBar";
import TripList from "@/app/components/TripList/TripList";
import { TripListProps } from "@/types/trip-list-type";
import axios from "axios";
import { useEffect, useState } from "react";

const ServiceDetails = () => {
    const [trips, setTrips] = useState<TripListProps | null>(null);
    const [loading, setLoading] = useState<boolean>(true);

    useEffect(() => {
        axios.get("/api/trip")
            .then((res) => {
                // API trả về array, nhưng component mong đợi TripListProps object
                // Wrap data vào format đúng
                const tripData: TripListProps = {
                    tripType: "one_way", // Default, có thể lấy từ query params hoặc state
                    outbound: res.data || [],
                    inbound: undefined,
                };
                setTrips(tripData);
            })
            .catch((err) => {
                console.log(err);
                // Error toast sẽ tự động hiển thị từ axios interceptor
            })
            .finally(() => {
                setLoading(false);
            });
    }, []);

    if (!trips) {
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
                            {loading ? (
                                <p className="text-[var(--cl-pri)]">Đang tải...</p>
                            ) : (
                                <p className="text-[var(--cl-pri)]">Không có dữ liệu</p>
                            )}
                        </div>
                    </div>
                </section>
            </main>
        );
    }

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

export default ServiceDetails