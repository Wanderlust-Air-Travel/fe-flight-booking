import { TicketProps } from "@/types/ticket-list-type"
import { Check, X } from "lucide-react"
import FormatPrice from "../FormatPrice/FormatPrice"
import { useState } from "react"


const Ticket = ({ tickets,type,active,onChoose,index }:TicketProps ) => {


 


    return (
        <div className={`ticketCabin ${type === "economy" ? "border-[var(--cl-four)]" : "border-[var(--cl-pri)]"} ${active && "translate-y-[-2%]"} w-full h-full flex flex-col border-[0.1rem] rounded-[1rem] overflow-hidden transition ease-liner duration-200 cursor-pointer`} onClick={onChoose}>
            <div className={`${type === "economy" ? "bg-[var(--cl-four)]" : "bg-[var(--cl-pri)]"} flex flex-col justify-center items-center px-[1.6rem] py-[1.6rem]`}>
                <p className="text-md text-white font-bold uppercase">{tickets.typeTicket}</p>
                <p className="text-base text-white">{FormatPrice(Number(tickets.price))}</p>
            </div>
            <div className="p-[1.6rem]">
                <ul className="flex flex-col gap-y-[0.8rem]">
                    {
                        tickets?.desc?.map((item: { text: string; status: boolean }, index: number) => {
                            return (
                                <li key={index} className="flex gap-x-[0.8rem]">
                                    {
                                        item.status ? <Check className="w-[2.4rem] h-[2.4rem] flex-shrink-0 text-[var(--cl-four)]" /> :  <X className="w-[2.4rem] h-[2.4rem] flex-shrink-0 text-[var(--cl-red)]" />
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
    )
}

export default Ticket

