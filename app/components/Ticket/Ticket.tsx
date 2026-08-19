import type { TicketProps } from "@/types/ticket-list-type";
import { Check, X } from "lucide-react";
import FormatPrice from "../FormatPrice/FormatPrice";

const Ticket = ({ tickets, type, active, onChoose, index, displayLabel }: TicketProps) => {
  const title = displayLabel ?? tickets.typeTicket;
  return (
    <div
      className={`ticketCabin ${type === "economy" ? "border-[var(--cl-five)]" : "border-[var(--cl-pri)]"} ${active ? "translate-y-[-2%] sm:translate-y-[-2%]" : ""} w-full h-full flex flex-col border-[0.1rem] rounded-[0.8rem] sm:rounded-[1rem] overflow-hidden transition ease-liner duration-200 cursor-pointer`}
      onClick={onChoose}
    >
      <div
        className={`${type === "economy" ? "bg-[var(--cl-five)]" : "bg-[var(--cl-pri)]"} flex flex-col justify-center items-center px-[1.2rem] sm:px-[1.6rem] py-[1.2rem] sm:py-[1.6rem]`}
      >
        <p className="text-sm sm:text-md text-white font-bold uppercase">{title}</p>
        <p className="text-sm sm:text-base text-white mt-[0.4rem]">
          {FormatPrice(Number(tickets.price))}
        </p>
      </div>
      <div className="p-[1.2rem] sm:p-[1.6rem]">
        <ul className="flex flex-col gap-y-[0.6rem] sm:gap-y-[0.8rem]">
          {tickets?.desc?.map((item: { text: string; status: boolean }, index: number) => {
            return (
              <li key={index} className="flex gap-x-[0.6rem] sm:gap-x-[0.8rem] items-start">
                {item.status ? (
                  <Check className="w-[1.8rem] h-[1.8rem] sm:w-[2.4rem] sm:h-[2.4rem] flex-shrink-0 text-[var(--cl-four)] mt-[0.2rem]" />
                ) : (
                  <X className="w-[1.8rem] h-[1.8rem] sm:w-[2.4rem] sm:h-[2.4rem] flex-shrink-0 text-[var(--cl-red)] mt-[0.2rem]" />
                )}
                <p className="text-sm sm:text-base md:text-lg leading-relaxed">{item.text}</p>
              </li>
            );
          })}
        </ul>
      </div>
    </div>
  );
};

export default Ticket;
