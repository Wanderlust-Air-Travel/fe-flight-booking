"use client";

import $ from "jquery";
import { TripListProps, TripListType } from "@/types/trip-list-type";
import Image from "next/image";
import FormatPrice from "../FormatPrice/FormatPrice";
import { ChevronDown } from "lucide-react";
import { Button } from "@/components/ui/button";
import Ticket from "../Ticket/Ticket";
import { useCallback, useRef, useState } from "react";
import { ListProps } from "@/types/ticket-list-type";
import axios from "axios";
import useInfoTicket from "@/app/zustand/storeInfoTicket";
import { useRouter } from "next/navigation";
import { convertToDMY, convertToLocalTime } from "../FormatDate/FormatDate";
import useStoreFightInfo from "@/app/zustand/storeFightInfo";

type TripListPropsType = {
    trips: TripListProps[];
    loading: boolean;
};


const TripList = ({ trips, loading }: TripListPropsType) => {

    // ❗ FIX 1: Nhiều panel => phải dùng mảng ref
    const itemRefs = useRef<HTMLDivElement[]>([]);
    const [type, setType] = useState<string>("");
    const [tickets, setTickets] = useState<ListProps | null>(null);
    const [activeIndex, setActiveIndex] = useState<number | null>(null);
    const { setData } = useInfoTicket();
    const router = useRouter();
    const [loadingChild, setLoadingChild] = useState(false);
    const {setData:setDataFightInfo} = useStoreFightInfo();

    // Khi click cabin
    const handleCabinEconomy = useCallback((code: string, index: number) => {
        setActiveIndex(null);
        setType("economy");

        axios.get(`${process.env.NEXT_PUBLIC_API_URL}/api/v1/search/fare-options?flightInstanceId=${code}&cabinType=economy`)
            .then((res) => {
                console.log(res);
                setTickets(res.data);

                // ❗ FIX 2: slideDown đúng panel + đóng panel khác
                setTimeout(() => {
                    itemRefs.current.forEach((el, i) => {
                        if (!el) return;

                        if (i === index) {
                            $(el).stop(true, true).slideDown(300);
                        } else {
                            $(el).stop(true, true).slideUp(300);
                        }
                    });
                }, 50);



            })
            .catch((err) => {
                console.log(err);

            })
            .finally(() => {

            })
    }, []);

    const handleCabinBusiness = useCallback((code: string, index: number) => {

        setActiveIndex(null);
        setType("business");


        axios.get(`${process.env.NEXT_PUBLIC_API_URL}/api/v1/search/fare-options?flightInstanceId=${code}&cabinType=business`)
            .then((res) => {
                setTickets(res.data);

                // ❗ FIX 2: slideDown đúng panel + đóng panel khác
                setTimeout(() => {
                    itemRefs.current.forEach((el, i) => {
                        if (!el) return;

                        if (i === index) {
                            $(el).stop(true, true).slideDown(300);
                        } else {
                            $(el).stop(true, true).slideUp(300);
                        }
                    });
                }, 50);
            })
            .catch((err) => {
                console.log(err);
            });
    }, []);

    const handleChoose = (
        index2: number,
        ticket: {
            typeTicket: string;
            price: number;
            desc: { text: string; status: boolean }[];
        },
        trip: TripListType,
        trips:any,
        type: string
    ) => {
        setActiveIndex(index2);

        setData({
            id: trip.flightInstanceId,
            icon: "/logoBrand.png",
            airline: "Bamboo",
            startDate: convertToDMY(trip.departureLocal),
            endDate: convertToDMY(trip.arrivalLocal),
            startCode: trip.origin.iata,
            endCode: trip.destination.iata,
            start: trip.origin.iata,
            end: trip.destination.iata,
            service: trips.tripType,
            stopCount: 0,
            stopDuration: "none",
            type: type,
            price: ticket.price,
            desc: ticket.desc,
            typeTicket:ticket.typeTicket,
            timeStart: convertToLocalTime(trip.departureLocal),
            timeEnd: convertToLocalTime(trip.arrivalLocal),

        });
    };

    const handleAccept = (flightInstanceId:string) => {
        router.push("/choosecabin");
        setDataFightInfo({
            flightInstanceId:flightInstanceId,
            cabinType:type
        })
        
        
    };

    console.log(trips)

    return (
        <ul className="border-[var(--cl-third)] border-[0.1rem] rounded-[1rem] overflow-hidden">
            <li className="flex gap-x-[1.2rem] items-center p-[1.6rem] bg-[var(--cl-pri)]">
                <div className="w-[5%]">
                    <p className="text-white font-bold text-base uppercase">Logo</p>
                </div>
                <div className="w-[20%]">
                    <p className="text-white font-bold text-base uppercase">Time & Brand</p>
                </div>
                <div className="w-[20%]">
                    <p className="text-white font-bold text-base uppercase">Information</p>
                </div>
                <div className="w-[15%]">
                    <p className="text-white font-bold text-base uppercase">Transit</p>
                </div>
                <div className="w-[10%]">
                    <p className="text-white font-bold text-base uppercase">Service</p>
                </div>
                <div className="w-full flex-1">
                    <p className="text-white font-bold text-base uppercase text-center">Cabin</p>
                </div>
            </li>

            {
                loading
                    ?
                    (
                        Array.from({ length: 6 }).map((_, i) => (
                            <li
                                key={i}
                                className="flex flex-col w-full border-b-[0.1rem] border-[var(--cl-third)] last:border-none"
                            >
                                <div className="flex gap-x-[1.2rem] items-center p-[1.6rem] w-full">
                                    <div className="w-[5%]"><span className="loading"></span></div>
                                    <div className="w-[20%]"><span className="loading"></span></div>
                                    <div className="w-[20%]"><span className="loading"></span></div>
                                    <div className="w-[15%]"><span className="loading"></span></div>
                                    <div className="w-[10%]"><span className="loading"></span></div>
                                    <div className="w-full flex-1"><span className="loading"></span></div>
                                </div>
                            </li>
                        ))
                    )
                    :
                    (
                        trips?.outbound.length <= 0
                            ?
                            (

                                <li className="flex flex-col w-full border-b-[0.1rem] border-[var(--cl-third)] last:border-none">
                                    <p className="text-lg text-center font-normal text-[var(--cl-red)] p-4">Flight instances are not valid. Please choose another day!</p>
                                </li>

                            )
                            :
                            (
                                trips?.outbound?.map((trip, index: number) => {
                                    return (
                                        <li
                                            key={index}
                                            className="flex flex-col w-full border-b-[0.1rem] border-[var(--cl-third)] last:border-none"
                                        >
                                            <div className="flex gap-x-[1.2rem] items-center p-[1.6rem] w-full">
                                                <div className="w-[5%]">
                                                    <Image src="/logoBrand.png" alt="logoBrand" width={40} height={40} unoptimized priority />
                                                </div>

                                                <div className="w-[20%]">
                                                    <div className="flex flex-col gap-y-[0.2rem]">
                                                        <p className="text-[var(--cl-five)] font-bold text-base">{convertToLocalTime(trip.departureLocal)}AM - {convertToLocalTime(trip.arrivalLocal)}PM</p>
                                                        <p className="text-[var(--cl-third)] text-base">Bamboo</p>
                                                    </div>
                                                </div>

                                                <div className="w-[20%]">
                                                    <div className="flex flex-col gap-y-[0.2rem]">
                                                        <p className="text-[var(--cl-five)] font-bold text-base">{trip.origin.iata} - {trip.destination.iata}</p>
                                                        {trip.departureLocal && <p className="text-[var(--cl-third)] text-mn">Start date: {convertToDMY(trip.departureLocal)}</p>}
                                                        {trip.arrivalLocal && <p className="text-[var(--cl-third)] text-mn">end date: {convertToDMY(trip.arrivalLocal)}</p>}
                                                    </div>
                                                </div>

                                                <div className="w-[15%]">
                                                    <div className="flex flex-col gap-y-[0.2rem]">
                                                        <p className="text-[var(--cl-five)] font-bold text-base">{trip.stopCount || 0}</p>
                                                        <p className="text-[var(--cl-third)] text-base">{trip.stopDuration || "None"}</p>
                                                    </div>
                                                </div>

                                                <div className="w-[10%]">
                                                    <p className="text-[var(--cl-five)] font-bold text-base">{trips.tripType}</p>
                                                </div>

                                                <div className="w-full flex-1">
                                                    <div className="flex gap-x-[1rem] items-center">
                                                        <div

                                                            className={`bg-[var(--cl-five)] hover:bg-green-700 flex flex-col items-center p-[1.2rem] w-[50%] rounded-md cursor-pointer gap-y-[0.2rem] transition ease-linear`}
                                                            onClick={() => {
                                                                handleCabinEconomy(trip.flightInstanceId, index);
                                                            }}
                                                        >
                                                            <p className="text-base text-white font-bold text-center">
                                                                Economy
                                                            </p>
                                                            <span className="text-sm cl-white text-center">Total seats: {trip.availableSeats}</span>

                                                            <ChevronDown className="w-[1.2=4rem] h-[1.4rem] text-white" />
                                                        </div>

                                                        <div

                                                            className={`bg-[var(--cl-pri)] hover:bg-blue-950 flex flex-col items-center p-[1.2rem] w-[50%] rounded-md cursor-pointer gap-y-[0.2rem] transition ease-linear`}
                                                            onClick={() => {
                                                                handleCabinBusiness(trip.flightInstanceId, index);
                                                            }}
                                                        >
                                                            <p className="text-base text-white font-bold text-center">
                                                                Business
                                                            </p>
                                                            <span className="text-sm cl-white text-center">Total seats: {trip.availableSeats}</span>

                                                            <ChevronDown className="w-[1.2=4rem] h-[1.4rem] text-white" />
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>

                                            {/* FIX 3 — panel đúng ref — không hidden, dùng display:none */}
                                            <div
                                                ref={(el) => (itemRefs.current[index] = el!)}
                                                className="w-full"
                                                style={{ display: "none" }}
                                            >
                                                <div className="flex flex-col justify-center items-center gap-y-[1.2rem] p-[1.6rem] w-full border-t-[0.1rem] border-[var(--cl-third)]">
                                                    <p className={`${type === "economy"
                                                        ? "text-[var(--cl-five)]"
                                                        : "text-[var(--cl-pri)]"
                                                        } uppercase font-bold text-center text-[2.4rem]`}
                                                    >
                                                        Choose Cabin
                                                    </p>


                                                    <ul className="flex justify-center -mx-[1.2rem] w-full">
                                                        {tickets?.map((ticket, index2) => {
                                                            console.log("trip",trip)
                                                            console.log("ticket",ticket);
                                                            return (
                                                                <li key={index2} className="w-[calc(100%/3)] block px-[1.2rem]">
                                                                    <Ticket
                                                                        type={type}
                                                                        tickets={ticket}
                                                                        index={index2}
                                                                        onChoose={() => {
                                                                            handleChoose(index2, ticket, trip, trips, type);
                                                                        }}
                                                                        active={activeIndex === index2}
                                                                    />
                                                                </li>
                                                            );
                                                        })}
                                                    </ul>


                                                    {activeIndex !== null && (
                                                        <Button
                                                            onClick={()=>{handleAccept(trip.flightInstanceId)}}
                                                            className={`${type === "economy"
                                                                ? "bg-[var(--cl-five)] hover:bg-green-700"
                                                                : "bg-[var(--cl-pri)] hover:bg-blue-900"
                                                                } w-fit h-[4.4rem] text-[1.6rem] px-[2rem] uppercase`}
                                                        >
                                                            Accept
                                                        </Button>
                                                    )}
                                                </div>
                                            </div>
                                        </li>
                                    );
                                })
                            )

                    )
            }


        </ul>
    );
};

export default TripList;
