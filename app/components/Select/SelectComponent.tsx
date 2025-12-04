

import {
    Select,
    SelectContent,
    SelectGroup,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select"
import Image from "next/image"
import { SelectComponentProp } from "@/types/select-component-type"

export function SelectComponent({ placeholder, icon, data, value, onChange, disabled = false }: SelectComponentProp) {

    console.log(data)

    return (
        <Select value={value} onValueChange={onChange} disabled={disabled}>
            <SelectTrigger className="w-full  border-none outline-none text-start !h-[4.8rem] shadow-none text-sm sm:text-base md:text-[1.4rem] !text-[var(--cl-pri)] px-2 sm:px-3 md:px-[1rem] select-none" disabled={disabled}>
                <div className="flex gap-x-2 sm:gap-x-[0.8rem] w-full items-center custom-sl">
                    <Image className="flex-shrink-0 w-5 h-5 sm:w-6 sm:h-6 md:w-8 md:h-8" src={icon} alt="icon" width={32} height={32} priority />
                    <SelectValue className="!w-full text-sm sm:text-base md:text-[1.4rem]" placeholder={placeholder} />
                </div>

            </SelectTrigger>
            <SelectContent className="shadow2 !border-none overflow-hidden max-w-[90vw] sm:max-w-none" >
                <SelectGroup className="max-h-[15rem] sm:max-h-[20rem] overflow-y-auto">
                    {
                        data?.map((item, index) => {
                            return (
                                <SelectItem key={index} className="group" value={item.code}>
                                    <div className="flex justify-between items-center gap-x-2 sm:gap-x-[1rem] w-full group-hover:!bg-[var(--cl-pri)] p-2 sm:p-3 group-data-[state=checked]:bg-[var(--cl-pri)]">
                                        <div className="flex flex-col gap-y-[0.2rem] min-w-0 flex-1">
                                            <p className="text-xs sm:text-sm md:text-[1.4rem] text-[var(--cl-pri)] group-hover:!text-white group-data-[state=checked]:text-[var(--cl-white)] font-medium">
                                                {item.name}
                                            </p>
                                            <span className="text-[0.9rem] sm:text-[1rem] text-[var(--cl-pri)] group-hover:!text-white line-clamp-1 group-data-[state=checked]:text-[var(--cl-white)]">
                                                {item.des}
                                            </span>
                                        </div>

                                        <div className="p-1.5 sm:p-2 text-xs sm:text-[1rem] text-white uppercase bg-[var(--cl-pri)] rounded-sm h-full group-hover:!bg-[var(--cl-four)] transition flex-shrink-0 group-data-[state=checked]:bg-[var(--cl-four)] font-semibold">
                                            {item.code}
                                        </div>
                                    </div>
                                </SelectItem>
                            )
                        })
                    }
                </SelectGroup>
            </SelectContent>
        </Select>
    )
}
