import { TripListProps, TripListType } from "@/types/trip-list-type";
import Image from "next/image";
import FormatPrice from "../FormatPrice/FormatPrice";
import { ChevronDown } from "lucide-react";
import { Button } from "@/components/ui/button";
import Ticket from "../Ticket/Ticket";
import { useCallback, useEffect, useState } from "react";
import { ListProps, TicketListType } from "@/types/ticket-list-type";
import axios from "axios";





const TripList = ({ trips }: TripListProps) => {



    const [tickets, setTicket] = useState<ListProps | null>(null);
    const [activeTripCode, setActiveTripCode] = useState<number | null>(null);

    useEffect(() => {

    }, [])

    const handleCabin = useCallback((type: string, code: number ,index:number) => {
        setActiveTripCode(index);

        axios.get(`/api/ticket?code=${code}&type=${type}`)
            .then((res) => {
                setTicket(res.data[0]);
            })
            .catch((err) => {
                console.log(err)
            })
    }, [tickets]);


    console.log(tickets);


    return (
        <ul className="border-[var(--cl-third)] border-[0.1rem] rounded-[1rem] overflow-hidden">
            <li className="flex gap-x-[1.2rem] items-center p-[1.6rem] bg-[var(--cl-pri)]">
                <div className="w-[5%]">
                    <p className="text-white font-bold text-base uppercase" >Logo</p>
                </div>
                <div className="w-[15%]">
                    <p className="text-white font-bold text-base uppercase" >Total Time & Brand</p>
                </div>
                <div className="w-[20%]">
                    <p className="text-white font-bold text-base uppercase" >Takeoff - Landing</p>
                </div>
                <div className="w-[15%]">
                    <p className="text-white font-bold text-base uppercase" >Transit</p>
                </div>
                <div className="w-[10%]">
                    <p className="text-white font-bold text-base uppercase" >Service</p>
                </div>
                <div className="w-full flex-1">
                    <p className="text-white font-bold text-base uppercase text-center" >Cabin</p>
                </div>
            </li>
            {
                trips.map((trip, index) => {
                    return (
                        <li key={index} className="flex flex-col w-full border-b-[0.1rem] border-[var(--cl-third)] last:border-none">
                            <div className="flex gap-x-[1.2rem] items-center p-[1.6rem]  w-full" >
                                <div className="w-[5%]">
                                    <Image src={trip.icon} alt="logoBrand" width={40} height={40} unoptimized priority />
                                </div>
                                <div className="w-[15%]">
                                    <div className="flex flex-col gap-y-[0.2rem]">
                                        <p className="text-[var(--cl-four)] font-bold text-base">{trip.totalTime}</p>
                                        <p className="text-[var(--cl-third)] text-base">{trip.airline}</p>
                                    </div>
                                </div>
                                <div className="w-[20%]">
                                    <div className="flex flex-col gap-y-[0.2rem]">
                                        <p className="text-[var(--cl-four)] font-bold text-base">{trip.duration}</p>
                                        <p className="text-[var(--cl-third)] text-mn">{trip.durationLocation}</p>
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
                                    <div className="flex gap-x-[1rem]  items-center">
                                        {
                                            trip.cabin.map((cabin, index2) => {
                                                return (
                                                    <div key={index2} className={`${cabin.type === "economy" ? "bg-[var(--cl-four)] hover:bg-green-700" : "bg-[var(--cl-pri)] hover:bg-blue-950"} flex flex-col items-center p-[1.2rem] w-[50%] rounded-md cursor-pointer gap-y-[0.2rem]  transition ease-linear`} onClick={() => { handleCabin(cabin.type, trip.code , index) }}>
                                                        <p className="text-base text-white font-bold text-center" >
                                                            {cabin.title} ({cabin.quantity} slot)
                                                        </p>
                                                        <span className="text-sm cl-white text-center">From</span>
                                                        <p className="text-base text-white font-bold text-center">
                                                            {FormatPrice(Number(cabin.price))}
                                                        </p>
                                                        <ChevronDown className="w-[1.2=4rem] h-[1.4rem] text-white" />
                                                    </div>
                                                )
                                            })
                                        }

                                    </div>
                                </div>
                            </div>
                            {
                                activeTripCode === index && (
                                    <div className="flex w-full">
                                        <div className="flex flex-col justify-center items-center gap-y-[1.2rem] p-[1.6rem] w-full border-t-[0.1rem] border-[var(--cl-third)]">
                                            <p className="text-[var(--cl-pri)] uppercase font-bold text-center text-[2.4rem]">Choose Cabin</p>
                                            {
                                                tickets?.list && (
                                                    <ul className="flex justify-center -mx-[1.2rem] w-full">
                                                        {
                                                            tickets?.list?.map((ticket,index) => {
                                                                return (
                                                                    <li key={index} className="w-[calc(100%/3)] block px-[1.2rem]">
                                                                        <Ticket tickets={ticket} />
                                                                    </li>
                                                                )
                                                            })
                                                        }

                                                    </ul>
                                                )
                                            }
                                            <Button className="w-fit h-[4.4rem] bg-[var(--cl-pri)] text-[1.6rem] px-[2rem] uppercase hover:bg-[var(--cl-four)]" >Accpect</Button>
                                        </div>
                                    </div>
                                )
                            }

                        </li>
                    )
                })
            }

        </ul>
    )
}

export default TripList