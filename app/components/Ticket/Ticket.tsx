import { TicketProps } from "@/types/ticket-list-type"
import { Check, X } from "lucide-react"
import FormatPrice from "../FormatPrice/FormatPrice"


const Ticket = ({ tickets }: any) => {
    console.log(tickets)


    return (
        <div className="w-full h-full flex flex-col border-[0.1rem] border-[var(--cl-gray)] rounded-[1rem] overflow-hidden">
            <div className="flex flex-col justify-center items-center border-b-[0.1rem] border-[var(--cl-gray)] px-[1.2rem] py-[1.6rem]">
                <p className="text-md text-[var(--cl-pri)] font-bold">{FormatPrice(Number(tickets.price))}</p>
                <p className="text-base text-[var(--cl-pri)]">{tickets.typeTicket}</p>
            </div>
            <div className="p-[1.2rem]">
                <ul className="flex flex-col">
                    {
                        tickets?.desc?.map((item: any, index: number) => {
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

