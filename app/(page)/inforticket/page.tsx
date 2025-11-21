"use client"
import FormatPrice from "@/app/components/FormatPrice/FormatPrice";
import InfoTicketBox from "@/app/components/InfoTicketBox/InfoTicketBox";
import Person from "@/app/components/Person/Person";
import useFightSearchBarStore from "@/app/zustand/storeFightSearchBar";
import useIsActiveStore from "@/app/zustand/storeHeader";
import useInfoTicket from "@/app/zustand/storeInfoTicket"
import { Button } from "@/components/ui/button";
import { useRouter } from "next/navigation";

import { useMemo, useState } from "react";

const InfoTicket = () => {
    const { data ,setData } = useInfoTicket();
    const { isActive } = useIsActiveStore();
    const { data: dataFightSearchBarStore  } = useFightSearchBarStore();
    const [isOpen, setIsOpen] = useState<boolean>(false);
    const router = useRouter();

    console.log(data)




    // console.log(startTime)

    const handleOpenChangePerson = () => {
        setIsOpen(!isOpen)
    }

    const totalPrice = useMemo(() => {
        return data.price * dataFightSearchBarStore.totalPerson;
    }, [dataFightSearchBarStore.totalPerson])


    const handleAccept = () =>{
        setData({totalPerson:dataFightSearchBarStore.totalPerson , price:totalPrice});
        router.push("/paymentinformation")
    }

    return (
        <main className={`${isActive ? "pt-[calc(var(--hd)-var(--hdt))]" : "pt-[var(--hd)]"} flex flex-col gap-y-[var(--rowY)]`} >
            <InfoTicketBox />

            <section className="">
                <div className="container">
                    <div className="border-[var(--cl-third)] border-[0.1rem] rounded-[1rem] overflow-hidden  flex flex-col ">
                        <div className="bg-[var(--cl-pri)] p-[1.6rem] flex justify-between items-center">
                            <h2 className="text-base text-white font-bold uppercase">Total Bill</h2>
                            <Button onClick={handleAccept} className="w-fit px-[2rem] h-[4.4rem] bg-[var(--cl-four)] text-[1.6rem] uppercase hover:bg-green-700" >Accept</Button>
                        </div>
                        <ul className="flex flex-col gap-y-[0.8rem] p-[1.6rem]">
                            <li className="flex flex-col">
                                <div className="flex gap-x-[2rem] justify-between">
                                    <p className="text-mn text-[var(--cl-pri)] uppercase font-bold">Price {data.service}</p>
                                    <p className="text-mn text-[var(--cl-pri)] uppercase">{FormatPrice(data.price)}</p>
                                </div>
                            </li>
                            <li className="flex flex-col">
                                <div className="flex gap-x-[2rem] justify-between">
                                    <p className="text-mn text-[var(--cl-pri)] uppercase font-bold">Total Preson</p>
                                    <div className="flex flex-col">
                                        <p className="text-mn text-[var(--cl-pri)] uppercase text-end">{dataFightSearchBarStore.totalPerson}</p>
                                        <span className="hover:text-[var(--cl-four)] cursor-pointer" onClick={handleOpenChangePerson}>Change Person</span>
                                    </div>
                                </div>
                                <div className={`${isOpen ? "max-h-[250px] pointer-events-auto" : "max-h-0 pointer-events-none"}  transition-[max-height] overflow-hidden flex-1 ease-linear duration-500 will-change-auto`}>
                                    <Person classNameParent="!p-0" classNameChild="!text-mn" />
                                </div>
                            </li>
                        </ul>
                        <div className="bg-[var(--cl-pri)] p-[1.6rem] flex justify-between items-center">
                            <h2 className="text-base text-white font-bold uppercase">Total Price</h2>
                            <p className="text-base text-white font-bold uppercase">{FormatPrice(totalPrice)}</p>
                        </div>
                    </div>


                </div>
            </section>
        </main>
    )

}

export default InfoTicket