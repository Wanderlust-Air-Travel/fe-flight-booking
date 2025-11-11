import { Input } from "@/components/ui/input"
import FlightDatePicker from "../Date/FlightDatePicker"
import SelectFrom from "../Select/SelectFrom"
import SelectTo from "../Select/SelectTo"
import Image from "next/image"

const FlightSearchBar = () => {


    return (
        <>
            <div className="flex w-full bg-white rounded-md border-[#CBD4E6] border-[0.1rem]">
                <div className="w-[20%]">
                    <SelectFrom />
                </div>
                <div className="w-[20%]">
                    <SelectTo />
                </div>
                <div className="w-[20%]">
                    <div className="relative w-full">
                        <div className="h-[4.8rem] flex gap-x-[0.8rem] items-center">
                            <Image src="/icDate.svg"  alt="icDate" width={32} height={32} priority  />
                            <Input placeholder="Choose Schedule" className="px-0 h-full outline-none shadow-none border-none placeholder:text-[var(--cl-pri)]" />
                        </div>
                        <div className="absolute t-[100%] l-0">
                            <FlightDatePicker />
                        </div>
                    </div>
                </div>
                <div className="w-[20%]">

                </div>
                <div className="w-[20%]">

                </div>
            </div>

        </>
    )
}

export default FlightSearchBar