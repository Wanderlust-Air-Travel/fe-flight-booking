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

const TripList = ({ trips }: TripListProps) => {

    // ❗ FIX 1: Nhiều panel => phải dùng mảng ref
    const itemRefs = useRef<HTMLDivElement[]>([]);

    const [tickets, setTicket] = useState<ListProps | null>(null);
    const [activeTripCode, setActiveTripCode] = useState<number | null>(null);
    const [activeIndex, setActiveIndex] = useState<number | null>(null);
    const { setData } = useInfoTicket();
    const router = useRouter();

    // Khi click cabin
    const handleCabin = useCallback((type: string, code: number, index: number) => {
        setActiveTripCode(index);
        setActiveIndex(null);

        axios.get(`/api/ticket?code=${code}&type=${type}`)
            .then((res) => {
                setTicket(res.data[0]);

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
        type: string
    ) => {
        setActiveIndex(index2);

        setData({
            id: trip.id,
            icon: trip.icon,
            code: trip.code,
            airline: trip.airline,
            startDate: trip.startDate,
            endDate: trip.endDate,
            duration: trip.duration,
            durationLocation: trip.durationLocation,
            service: trip.service,
            stopCount: trip.stopCount,
            stopDuration: trip.stopDuration,
            totalTime: trip.totalTime,
            type: type,
            typeTicket: ticket.typeTicket,
            price: ticket.price,
            desc: ticket.desc,
        });
    };

    const handleAccept = () => {
        router.push("/inforticket");
    };

    return (
        <ul className="border-[var(--cl-third)] border-[0.1rem] rounded-[1rem] overflow-hidden">
            <li className="flex gap-x-[1.2rem] items-center p-[1.6rem] bg-[var(--cl-pri)]">
                <div className="w-[5%]">
                    <p className="text-white font-bold text-base uppercase">Logo</p>
                </div>
                <div className="w-[10%]">
                    <p className="text-white font-bold text-base uppercase">Time & Brand</p>
                </div>
                <div className="w-[25%]">
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

            {trips.map((trip, index) => {
                return (
                    <li
                        key={index}
                        className="flex flex-col w-full border-b-[0.1rem] border-[var(--cl-third)] last:border-none"
                    >
                        <div className="flex gap-x-[1.2rem] items-center p-[1.6rem] w-full">
                            <div className="w-[5%]">
                                <Image src={trip.icon} alt="logoBrand" width={40} height={40} unoptimized priority />
                            </div>

                            <div className="w-[10%]">
                                <div className="flex flex-col gap-y-[0.2rem]">
                                    <p className="text-[var(--cl-four)] font-bold text-base">{trip.totalTime}</p>
                                    <p className="text-[var(--cl-third)] text-base">{trip.airline}</p>
                                </div>
                            </div>

                            <div className="w-[25%]">
                                <div className="flex flex-col gap-y-[0.2rem]">
                                    <p className="text-[var(--cl-four)] font-bold text-base">Time: {trip.duration}</p>
                                    <p className="text-[var(--cl-third)] text-mn">Location: {trip.durationLocation}</p>
                                    {trip.startDate && <p className="text-[var(--cl-third)] text-mn">Start date: {trip.startDate}</p>}
                                    {trip.endDate && <p className="text-[var(--cl-third)] text-mn">Start date: {trip.endDate}</p>}
                                </div>
                            </div>

                            <div className="w-[15%]">
                                <div className="flex flex-col gap-y-[0.2rem]">
                                    <p className="text-[var(--cl-four)] font-bold text-base">{trip.stopCount}</p>
                                    <p className="text-[var(--cl-third)] text-base">{trip.stopDuration}</p>
                                </div>
                            </div>

                            <div className="w-[10%]">
                                <p className="text-[var(--cl-four)] font-bold text-base">{trip.service}</p>
                            </div>

                            <div className="w-full flex-1">
                                <div className="flex gap-x-[1rem] items-center">
                                    {trip.cabin.map((cabin, index2) => {
                                        return (
                                            <div
                                                key={index2}
                                                className={`${cabin.type === "economy"
                                                    ? "bg-[var(--cl-four)] hover:bg-[var(--cl-five)]"
                                                    : "bg-[var(--cl-pri)] hover:bg-blue-950"
                                                    } flex flex-col items-center p-[1.2rem] w-[50%] rounded-md cursor-pointer gap-y-[0.2rem] transition ease-linear`}
                                                onClick={() => {
                                                    handleCabin(cabin.type, trip.code, index);
                                                }}
                                            >
                                                <p className="text-base text-white font-bold text-center">
                                                    {cabin.title} ({cabin.quantity} slot)
                                                </p>
                                                <span className="text-sm cl-white text-center">From</span>
                                                <p className="text-base text-white font-bold text-center">
                                                    {FormatPrice(Number(cabin.price))}
                                                </p>
                                                <ChevronDown className="w-[1.2=4rem] h-[1.4rem] text-white" />
                                            </div>
                                        );
                                    })}
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
                                <p className={`${tickets?.type === "economy"
                                        ? "text-[var(--cl-four)]"
                                        : "text-[var(--cl-pri)]"
                                    } uppercase font-bold text-center text-[2.4rem]`}
                                >
                                    Choose Cabin
                                </p>

                                {tickets?.list && (
                                    <ul className="flex justify-center -mx-[1.2rem] w-full">
                                        {tickets.list.map((ticket, index2) => {
                                            return (
                                                <li key={index2} className="w-[calc(100%/3)] block px-[1.2rem]">
                                                    <Ticket
                                                        type={tickets.type}
                                                        tickets={ticket}
                                                        index={index2}
                                                        onChoose={() => {
                                                            handleChoose(index2, ticket, trip, tickets.type);
                                                        }}
                                                        active={activeIndex === index2}
                                                    />
                                                </li>
                                            );
                                        })}
                                    </ul>
                                )}

                                {activeIndex !== null && (
                                    <Button
                                        onClick={handleAccept}
                                        className={`${tickets?.type === "economy"
                                                ? "bg-[var(--cl-four)] hover:bg-[var(--cl-pri)]"
                                                : "bg-[var(--cl-pri)] hover:bg-[var(--cl-four)]"
                                            } w-fit h-[4.4rem] text-[1.6rem] px-[2rem] uppercase`}
                                    >
                                        Accept
                                    </Button>
                                )}
                            </div>
                        </div>
                    </li>
                );
            })}
        </ul>
    );
};

export default TripList;
