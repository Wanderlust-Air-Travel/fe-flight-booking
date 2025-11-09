

import {
    Select,
    SelectContent,
    SelectGroup,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select"
import Image from "next/image"

interface SelectComponentProp {
    placeholder:string,
    icon:string,
    data:{
        name:string,
        value:string
    }[]
}   

export function SelectComponent({ placeholder, icon,data }:SelectComponentProp) {
    return (
        <Select>
            <SelectTrigger className="w-full border-none outline-none !h-[4.8rem] shadow-none text-[1.6rem] !text-[var(--cl-pri)] px-[1rem] select-none">
                <div className="flex gap-x-[0.8rem] items-center">
                    <Image src={icon === "from" ? "/icFrom.svg" : "" } alt="icon" width={32} height={32} priority />
                    <SelectValue placeholder={placeholder} />
                </div>

            </SelectTrigger>
            <SelectContent >
                <SelectGroup>
                    <SelectItem className="group xl:hover:!bg-[var(--cl-pri)] " value="apple">
                        <div className="flex justify-between gap-x-[2rem]">
                            <div className="flex flex-col gap-y-[0.2rem]">
                                <p className="text-[1.4rem] text-[var(--cl-pri)] group-hover:!text-white">
                                    Hà Nội
                                </p>
                                <span className="text-[1.2rem] text-[var(--cl-pri)] group-hover:!text-white">
                                    Sân bay quốc tế Nội Bài
                                </span>
                            </div>
                            <div className="div">

                            </div>
                        </div>
                    </SelectItem>
                    <SelectItem value="banana">Banana</SelectItem>
                    <SelectItem value="blueberry">Blueberry</SelectItem>
                    <SelectItem value="grapes">Grapes</SelectItem>
                    <SelectItem value="pineapple">Pineapple</SelectItem>
                </SelectGroup>
            </SelectContent>
        </Select>
    )
}
