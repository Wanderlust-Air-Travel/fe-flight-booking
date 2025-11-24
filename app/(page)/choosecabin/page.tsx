"use client"
import Breadcrumb from "@/app/components/Breadcrumb/Breadcrumb";
import InfoTicketBox from "@/app/components/InfoTicketBox/InfoTicketBox";
import useInfoTicket from "@/app/zustand/storeInfoTicket";
import { SeatGroup, SeatItem } from "@/types/seat-type";
import axios from "axios";
import Image from "next/image";
import { ChangeEvent, useEffect, useState } from "react";




const ChooseCabin = () => {
    const [seatBusiness, setSeatBusiness] = useState<SeatGroup | null>(null)
    const [seatEconomy, setSeatEconomy] = useState<SeatGroup | null>(null)


    const [chooseBusiness, setChooseBusiness] = useState<string[]>([]);
    const [chooseEconomy, setChooseEconomy] = useState<string[]>([]);

    const { data } = useInfoTicket();

    const handleChooseBusiness = (e: ChangeEvent<HTMLInputElement>, id: string) => {
        console.log(e.target.checked);
        if (e.target.checked) {
            setChooseBusiness((prev) => {
                return [...prev, id]
            })
        } else {
            setChooseBusiness((prev) => {
                return prev.filter((prev) => {
                    return prev !== id
                })
            })
        }
    }

    const handleChooseEconomy = (e: ChangeEvent<HTMLInputElement>, id: string) => {
        console.log(e.target.checked);
        if (e.target.checked) {
            setChooseEconomy((prev) => {
                return [...prev, id]
            })
        } else {
            setChooseEconomy((prev) => {
                return prev.filter((prev) => {
                    return prev !== id
                })
            })
        }
    }

    console.log(chooseBusiness)


    useEffect(() => {
        axios.get("/api/seats/VN123")
            .then((res) => {

                const business = res.data?.seats.find((seat: SeatGroup) => {
                    return seat.id === "business"
                });
                setSeatBusiness(business);

                const economy = res.data?.seats.find((seat: SeatGroup) => {
                    return seat.id === "economy"
                });
                setSeatEconomy(economy);
            })
            .catch((err) => {
                console.log(err)
            })
    }, [])


    console.log(seatBusiness)



    return (
        <main className={`flex flex-col pt-[var(--hd)] gap-y-[var(--rowY)]`} >
            <Breadcrumb />
            <InfoTicketBox />

            <section className="">
                <div className="container">
                    <div className="flex flex-wrap -mx-[1.2rem]">
                        <div className="px-[1.2rem] w-[70%]">
                            <div className="pt-[calc(100%*6000/2000)] w-full relative overflow-hidden block">
                                <Image src="/plane.png" alt="plane" width={100} height={100} className="w-full h-full absolute inset-0 object-cover " priority unoptimized />

                                <div className="absolute h-[55%] w-[24%] top-[16%] left-1/2 z-10 -translate-x-1/2 flex flex-col gap-y-[2rem]">

                                    <div className={` w-full bg-[#F5F7FA] rounded-md ${data.type === "business" ? "" : "opacity-50 pointer-events-none cursor-not-allowed"} `}>
                                        <div className="flex gap-[1rem] flex-wrap py-[0.6rem] px-[0.6rem] justify-between">
                                            <div className="w-[47%]">
                                                <div className="flex flex-wrap gap-y-[1rem]  -mx-[0.15rem]">
                                                    {
                                                        seatBusiness && (
                                                            seatBusiness?.list?.filter((list: SeatItem) => list.pos === "left").map((seatItem: SeatItem, index) => {
                                                                return (
                                                                    <label htmlFor={seatItem.idCabin} key={seatItem.idCabin} className={`w-[calc(100%/2)] block  flex-shrink-0 px-[0.15rem] cursor-pointer ${seatItem.buyed && "pointer-events-none"}`}>
                                                                        <input name="chooseBusiness" onChange={(e) => { handleChooseBusiness(e, seatItem.idCabin) }} hidden id={seatItem.idCabin} type="checkbox" />
                                                                        <span className={`rounded-[0.5rem] overflow-hidden p-[0.5rem] w-full h-[100%] bg-[var(--cl-seven)] text-[1.2rem] font-bold flex flex-col text-center justify-center items-center uppercase  hover:text-[var(--cl-white)] transition ease-linear ${seatBusiness.id === "business" ? "text-[var(--cl-pri)] hover:bg-[var(--cl-pri)]" : "text-[var(--cl-four)] hover:bg-[var(--cl-four)]"}  ${chooseBusiness.includes(seatItem.idCabin) && "!bg-[var(--cl-pri)] !text-white"} ${seatItem.buyed && "!bg-[var(--cl-pri)] !text-white"} `}>
                                                                            <span>{seatItem.title}</span>
                                                                            <span className="text-[1rem] font-medium">{seatItem.note}</span>
                                                                        </span>
                                                                    </label>
                                                                )
                                                            })
                                                        )
                                                    }




                                                </div>
                                            </div>

                                            <div className="w-[47%]">
                                                <div className="flex flex-wrap gap-y-[1rem]  -mx-[0.15rem]">
                                                    {
                                                        seatBusiness && (
                                                            seatBusiness?.list?.filter((list: SeatItem) => list.pos === "right").map((seatItem: SeatItem, index) => {
                                                                return (
                                                                    <label htmlFor={seatItem.idCabin} key={seatItem.idCabin} className={`w-[calc(100%/2)] block  flex-shrink-0 px-[0.15rem] cursor-pointer ${seatItem.buyed && "pointer-events-none"}`}>
                                                                        <input name="chooseBusiness" onChange={(e) => { handleChooseBusiness(e, seatItem.idCabin) }} hidden id={seatItem.idCabin} type="checkbox" />
                                                                        <span className={`rounded-[0.5rem] overflow-hidden p-[0.5rem] w-full h-[100%] bg-[var(--cl-seven)] text-[1.2rem] font-bold flex flex-col text-center justify-center items-center uppercase  hover:text-[var(--cl-white)] transition ease-linear ${seatBusiness.id === "business" ? "text-[var(--cl-pri)] hover:bg-[var(--cl-pri)]" : "text-[var(--cl-four)] hover:bg-[var(--cl-four)]"}  ${chooseBusiness.includes(seatItem.idCabin) && "!bg-[var(--cl-pri)] !text-white"} ${seatItem.buyed && "!bg-[var(--cl-pri)] !text-white"} `}>
                                                                            <span>{seatItem.title}</span>
                                                                            <span className="text-[1rem] font-medium">{seatItem.note}</span>
                                                                        </span>
                                                                    </label>
                                                                )
                                                            })
                                                        )
                                                    }




                                                </div>
                                            </div>
                                        </div>


                                    </div>

                                    <div className={`w-full bg-[#F5F7FA] rounded-md ${data.type === "economy" ? "" : "opacity-60 pointer-events-none cursor-not-allowed"}`}>
                                        <div className="flex gap-[1rem] flex-wrap py-[0.6rem] px-[0.6rem] justify-between">
                                            <div className="w-[47%]">
                                                <div className="flex flex-wrap gap-y-[1rem]  -mx-[0.15rem]">
                                                    {
                                                        seatEconomy && (
                                                            seatEconomy?.list?.filter((list) => list.pos === "left").map((seatItem, index) => {
                                                                return (
                                                                    <label htmlFor={seatItem.idCabin} key={seatItem.idCabin} className={`w-[calc(100%/3)] block  flex-shrink-0 px-[0.15rem] cursor-pointer ${seatItem.buyed && "pointer-events-none"}`}>
                                                                        <input name="chooseEconomy" onChange={(e) => { handleChooseEconomy(e, seatItem.idCabin) }} hidden id={seatItem.idCabin} type="checkbox" />
                                                                        <span className={`rounded-[0.5rem] overflow-hidden p-[0.5rem] w-full h-[100%] bg-[var(--cl-seven)] text-[1.2rem] font-bold flex flex-col text-center justify-center items-center uppercase  hover:text-[var(--cl-white)] transition ease-linear ${seatEconomy.id === "business" ? "text-[var(--cl-pri)] hover:bg-[var(--cl-pri)]" : "text-[var(--cl-four)] hover:bg-[var(--cl-four)]"}  ${chooseEconomy.includes(seatItem.idCabin) && "!bg-[var(--cl-four)] !text-white"} ${seatItem.buyed && "!bg-[var(--cl-four)] !text-white"} `}>
                                                                            <span>{seatItem.title}</span>
                                                                            <span className="text-[1rem] font-medium">{seatItem.note}</span>
                                                                        </span>
                                                                    </label>
                                                                )
                                                            })
                                                        )
                                                    }

                                                </div>
                                            </div>
                                            <div className="w-[47%]">
                                                <div className="flex flex-wrap gap-y-[1rem]  -mx-[0.15rem]">
                                                    {
                                                        seatEconomy && (
                                                            seatEconomy?.list?.filter((list) => list.pos === "right").map((seatItem, index) => {
                                                                return (
                                                                    <label htmlFor={seatItem.idCabin} key={seatItem.idCabin} className={`w-[calc(100%/3)] block  flex-shrink-0 px-[0.15rem] cursor-pointer ${seatItem.buyed && "pointer-events-none"}`}>
                                                                        <input name="chooseEconomy" onChange={(e) => { handleChooseEconomy(e, seatItem.idCabin) }} hidden id={seatItem.idCabin} type="checkbox" />
                                                                        <span className={`rounded-[0.5rem] overflow-hidden p-[0.5rem] w-full h-[100%] bg-[var(--cl-seven)] text-[1.2rem] font-bold flex flex-col text-center justify-center items-center uppercase  hover:text-[var(--cl-white)] transition ease-linear ${seatEconomy.id === "business" ? "text-[var(--cl-pri)] hover:bg-[var(--cl-pri)]" : "text-[var(--cl-four)] hover:bg-[var(--cl-four)]"}  ${chooseEconomy.includes(seatItem.idCabin) && "!bg-[var(--cl-four)] !text-white"} ${seatItem.buyed && "!bg-[var(--cl-four)] !text-white"} ${seatItem.buyed && "!bg-[var(--cl-four)] !text-white"}`}>
                                                                            <span>{seatItem.title}</span>
                                                                            <span className="text-[1rem] font-medium">{seatItem.note}</span>
                                                                        </span>
                                                                    </label>
                                                                )
                                                            })
                                                        )
                                                    }

                                                </div>
                                            </div>
                                        </div>
                                    </div>

                                </div>
                            </div>
                        </div>
                        <div className="px-[1.2rem] w-[100%] flex-1">
                            <div className={`sticky top-[calc(var(--hd)+1rem)] flex flex-col border-[var(--cl-third)] border-[0.1rem] rounded-[1rem] p-[1.6rem]  gap-y-[2rem]`}>
                                <h2 className="text-center text-md text-[var(--cl-pri)] font-bold">
                                    Choose Position
                                </h2>

                                <ul className="flex">

                                </ul>

                                <div className="flex flex-col gap-y-[0.8rem]">
                                    <p className="text-mn text-[var(--cl-red)] font-medium">
                                        Note
                                    </p>
                                    <ul className="flex flex-wrap gap-[1.2rem]">
                                        <li className="flex gap-x-[0.4rem] items-center">
                                            <span className="w-[2rem] h-[1.6rem] block flex-shrink-0 bg-[var(--cl-pri)] rounded"></span>
                                            <p className="text-[var(--cl-pri)] text-mn">Selected</p>
                                        </li>
                                        <li className="flex gap-x-[0.4rem] items-center">
                                            <span className="w-[2rem] h-[1.6rem] block flex-shrink-0 bg-[var(--cl-four)] rounded"></span>
                                            <p className="text-[var(--cl-four)] text-mn">Selected</p>
                                        </li>
                                        <li className="flex gap-x-[0.4rem] items-center">
                                            <span className="w-[2rem] h-[1.6rem] block flex-shrink-0 bg-[var(--cl-seven)] rounded"></span>
                                            <p className="text-[#57595B] text-mn">Empty</p>
                                        </li>
                                    </ul>
                                    <div className="flex gap-x-[2rem]">
                                        <ul className="flex flex-col gap-y-[0.4rem] gap-x-[1.2rem] ">
                                            <li className="text-sm text-[var(--cl-four)] uppercase">
                                                EM: Economy Saver Max
                                            </li>
                                            <li className="text-sm text-[var(--cl-four)] uppercase">
                                                ES: Economy Smart
                                            </li>
                                            <li className="text-sm text-[var(--cl-four)] uppercase">
                                                EF: Economy Flex
                                            </li>
                                        </ul>
                                        <ul className="flex flex-col gap-y-[0.4rem] gap-x-[1.2rem] ">
                                            <li className="text-sm text-[var(--cl-pri)] uppercase">
                                                BS: Business Smart
                                            </li>
                                            <li className="text-sm text-[var(--cl-pri)] uppercase">
                                                BF: Business Flex
                                            </li>
                                        </ul>
                                    </div>

                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </section>
        </main>
    )
}

export default ChooseCabin