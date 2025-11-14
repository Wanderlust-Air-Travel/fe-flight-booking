

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
    placeholder: string,
    icon: string,
    value:string,
    onChange:(val: string) => void,
    data: {
        name: string,
        des: string,
        value: string,
        code: string
    }[]
}

export function SelectComponent({ placeholder, icon, data,value,onChange }: SelectComponentProp) {

    

    return (
        <Select value={value} onValueChange={onChange}>
            <SelectTrigger className="w-full border-none outline-none text-start !h-[4.8rem] shadow-none text-[1.4rem] !text-[var(--cl-pri)] px-[1rem] select-none">
                <div className="flex gap-x-[0.8rem] items-center">
                    <Image className="flex-shrink-0" src={icon} alt="icon" width={32} height={32} priority />
                    <SelectValue className="w-full" placeholder={placeholder} />
                </div>

            </SelectTrigger>
            <SelectContent className="shadow2 !border-none overflow-hidden" >
                <SelectGroup className="max-h-[15rem] ">
                    {
                        data?.map((item, index) => {
                            return (
                                <SelectItem key={index} className="group" value={item.value}>
                                    <div className="flex justify-between gap-x-[1rem] w-full group-hover:!bg-[var(--cl-pri)] p-2">
                                        <div className="flex flex-col gap-y-[0.2rem]">
                                            <p className="text-[1.4rem] text-[var(--cl-pri)] group-hover:!text-white">
                                                {item.name}
                                            </p>
                                            <span className="text-[1.2rem] text-[var(--cl-pri)] group-hover:!text-white line-clamp-1 whitespace-wrap">
                                                {item.des}
                                            </span>
                                        </div>

                                        <div className="p-2 text-[1rem] text-white uppercase bg-[var(--cl-pri)] rounded-sm h-full group-hover:!bg-[var(--cl-four)] transition flex-shrink-0 ">
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
