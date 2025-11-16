"use client"
import FormatPrice from "@/app/components/FormatPrice/FormatPrice";
import useIsActiveStore from "@/app/zustand/storeHeader";
import useInfoTicket from "@/app/zustand/storeInfoTicket"
import { Check, ChevronDown, X } from "lucide-react";
import Image from "next/image";
import { useMemo } from "react";

const InfoTicket = () => {
    const { data } = useInfoTicket();
    const { isActive } = useIsActiveStore();

    console.log(data)

    const startTime = useMemo(() => {
        return data.duration.split("-")[0]
    }, [data])

    const endTime = useMemo(() => {
        return data.duration.split("-")[1]
    }, [data])

    const start = useMemo(() => {
        return data.durationLocation.split("-")[0]
    }, [data])

    const end = useMemo(() => {
        return data.durationLocation.split("-")[1]
    }, [data])


    // console.log(startTime)

    return (
        <main className={`${isActive ? "pt-[calc(var(--hd)-var(--hdt))]" : "pt-[var(--hd)]"} flex flex-col gap-y-[var(--rowY)]`} >
            <section className="w-full pt-[var(--rowY)]">
                <div className="container">
                    <ul className="border-[var(--cl-third)] border-[0.1rem] rounded-[1rem] overflow-hidden">
                        <li className="flex gap-x-[1.2rem] items-center p-[1.6rem] bg-[var(--cl-pri)]">
                            <div className="w-[5%]">
                                <p className="text-white font-bold text-base uppercase" >Logo</p>
                            </div>
                            <div className="w-[10%]">
                                <p className="text-white font-bold text-base uppercase" >Time & Brand</p>
                            </div>
                            <div className="w-[25%]">
                                <p className="text-white font-bold text-base uppercase" >Information</p>
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


                        <li className="flex flex-col w-full border-b-[0.1rem] border-[var(--cl-third)] last:border-none">
                            <div className="flex gap-x-[1.2rem] items-center p-[1.6rem]  w-full" >
                                <div className="w-[5%]">
                                    <Image src={data.icon} alt="logoBrand" width={40} height={40} unoptimized priority />
                                </div>
                                <div className="w-[10%]">
                                    <div className="flex flex-col gap-y-[0.2rem]">
                                        <p className="text-[var(--cl-four)] font-bold text-base">{data.totalTime}</p>
                                        <p className="text-[var(--cl-third)] text-base">{data.airline}</p>
                                    </div>
                                </div>
                                <div className="w-[25%]">
                                    <div className="flex flex-col gap-y-[0.2rem]">
                                        <p className="text-[var(--cl-four)] font-bold text-base">Time: {data.duration}</p>
                                        <p className="text-[var(--cl-third)] text-mn">Location: {data.durationLocation}</p>
                                        {
                                            data.startDate && (<p className="text-[var(--cl-third)] text-mn">Start date: {data.startDate}</p>)
                                        }
                                        {
                                            data.endDate && (<p className="text-[var(--cl-third)] text-mn">Start date: {data.endDate}</p>)
                                        }

                                    </div>
                                </div>
                                <div className="w-[15%]">
                                    <div className="flex flex-col gap-y-[0.2rem]">
                                        <p className="text-[var(--cl-four)] font-bold text-base">{data.stopCount}</p>
                                        <p className="text-[var(--cl-third)] text-base">{data.stopDuration}</p>
                                    </div>
                                </div>
                                <div className="w-[10%]">
                                    <p className="text-[var(--cl-four)] font-bold text-base">{data.service}</p>
                                </div>
                                <div className="w-full flex-1">
                                    <div className="flex gap-x-[1rem]  items-center">
                                        <div className={`${data.typeTicket.includes("Economy") ? "bg-[var(--cl-four)] hover:bg-green-700" : "bg-[var(--cl-pri)] hover:bg-blue-950"} flex flex-col items-center p-[1.2rem] w-full rounded-md cursor-pointer gap-y-[0.2rem]  transition ease-linear`} >
                                            <p className="text-base text-white font-bold text-center" >
                                                {data.typeTicket}
                                            </p>
                                            <p className="text-base text-white font-bold text-center">
                                                {FormatPrice(Number(data.price))}
                                            </p>
                                        </div>

                                    </div>
                                </div>
                            </div>


                            <div className="flex w-full">
                                <div className="flex flex-col justify-center items-center gap-y-[1.2rem] p-[1.6rem] w-full border-t-[0.1rem] border-[var(--cl-third)]">


                                    <div className="flex -mx-[1.2rem] w-full">
                                        <div className="w-[35%] px-[1.2rem]">
                                            <div className="flex flex-col gap-y-[2rem]">
                                                <p className={`${data.typeTicket.includes("Economy") ? "text-[var(--cl-four)]" : "text-[var(--cl-pri)]"}  uppercase font-bold text-start text-[2.4rem]`}>{data.typeTicket}</p>
                                                <ul className="flex flex-col gap-y-[0.8rem]">
                                                    {
                                                        data?.desc?.map((item: { text: string; status: boolean }, index: number) => {
                                                            return (
                                                                <li key={index} className="flex gap-x-[0.8rem]">
                                                                    {
                                                                        item.status ? <Check className="w-[2.4rem] h-[2.4rem] flex-shrink-0 text-[var(--cl-four)]" /> : <X className="w-[2.4rem] h-[2.4rem] flex-shrink-0 text-[var(--cl-red)]" />
                                                                    }
                                                                    <p className="text-base">
                                                                        {item.text}
                                                                    </p>
                                                                </li>
                                                            )
                                                        })
                                                    }

                                                </ul>
                                            </div>

                                        </div>
                                        <div className="w-full flex-1 px-[1.2rem] flex-col flex h-full justify-center">
                                            <div className="flex flex-col gap-y-[2rem] ">
                                                <p className={`${data.typeTicket.includes("Economy") ? "text-[var(--cl-four)]" : "text-[var(--cl-pri)]"}  uppercase font-bold text-center text-[2.4rem]`}>Itinerary details</p>

                                                <div className="flex gap-x-[2rem] justify-between items-center">
                                                    <div className="flex flex-col flex-shrink-0 items-center">
                                                        <p className={`text-md ${data.typeTicket.includes("Economy") ? "text-[var(--cl-four)]" : "text-[var(--cl-pri)]"}`}>
                                                            {startTime}
                                                        </p>

                                                        <p className={`text-base ${data.typeTicket.includes("Economy") ? "text-[var(--cl-four)]" : "text-[var(--cl-pri)]"} text-nowrap text-nowrap`}>
                                                            {start}
                                                        </p>
                                                    </div>

                                                    <div className="w-full relative h-[0.2rem]">
                                                        <div className={`w-full h-full border-[0.1rem] ${data.typeTicket.includes("Economy") ? "border-[var(--cl-four)]" : "border-[var(--cl-pri)]"} border-dashed `}></div>
                                                        <div className="absolute bottom-5 left-[50%] -translate-x-1/2">
                                                            <p className={`text-base ${data.typeTicket.includes("Economy") ? "text-[var(--cl-four)]" : "text-[var(--cl-pri)]"} text-nowrap text-nowrap uppercase`}>
                                                                {data.service}
                                                            </p>
                                                        </div>

                                                        <div className="absolute top-5 left-[50%] -translate-x-1/2">

                                                            {
                                                                data.startDate && (<p className={`${data.typeTicket.includes("Economy") ? "text-[var(--cl-four)]" : "text-[var(--cl-pri)]"} text-mn`}>Start date: {data.startDate}</p>)
                                                            }
                                                            {
                                                                data.endDate && (<p className={`${data.typeTicket.includes("Economy") ? "text-[var(--cl-four)]" : "text-[var(--cl-pri)]"} text-mn`}>Start date: {data.endDate}</p>)
                                                            }
                                                        </div>
                                                    </div>

                                                    <div className="flex flex flex-col flex-shrink-0 items-center">
                                                        <p className={`text-md ${data.typeTicket.includes("Economy") ? "text-[var(--cl-four)]" : "text-[var(--cl-pri)]"} text-center`}>
                                                            {endTime}
                                                        </p>
                                                        <p className={`text-base ${data.typeTicket.includes("Economy") ? "text-[var(--cl-four)]" : "text-[var(--cl-pri)]"} text-nowrap text-center`}>
                                                            {end}
                                                        </p>
                                                    </div>
                                                </div>
                                            </div>

                                        </div>
                                    </div>

                                </div>
                            </div>



                        </li>



                    </ul>
                </div>
            </section>
        </main>
    )

}

export default InfoTicket