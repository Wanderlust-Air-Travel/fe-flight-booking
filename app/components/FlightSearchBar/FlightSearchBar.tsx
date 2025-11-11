import { Input } from "@/components/ui/input"
import FlightDatePicker from "../Date/FlightDatePicker"
import SelectFrom from "../Select/SelectFrom"
import SelectTo from "../Select/SelectTo"
import Image from "next/image"
import useFightSearchBarStore from "@/app/zustand/storeFightSearchBar"
import { Button } from "@/components/ui/button"
import Person from "../Person/Person"

const FlightSearchBar = () => {

    const { data } = useFightSearchBarStore();

    console.log(data)


    return (
        <>
            <div className="flex w-full items-center bg-white rounded-md border-[#CBD4E6] border-[0.1rem]">
                <div className="w-[20%]">
                    <SelectFrom />
                </div>
                <div className="w-[20%]">
                    <SelectTo />
                </div>
                <div className="w-[20%]">
                    <label htmlFor="isOpenId" className="relative w-full block">
                        <div className="h-[4.8rem] flex gap-x-[0.8rem] items-center select-none">
                            <Image src="/icDate.svg" alt="icDate" width={32} height={32} priority />
                            <Input
                                placeholder="Choose Schedule"
                                readOnly
                                className="px-0 h-full outline-none shadow-none border-none placeholder:text-[var(--cl-pri)] pointer-events-none"
                                value={
                                    data.startDate
                                        ? data.endDate
                                            ? `${data.startDate} - ${data.endDate}`
                                            : data.startDate
                                        : ""
                                }
                            />
                        </div>
                        <input id="isOpenId" name="isOpen" type="checkbox" className="peer hidden" />
                        <div className="hidden peer-checked:block fixed inset-0 z-10" />
                        <div className="absolute top-[calc(100%+0.5rem)] left-0 z-20  opacity-0 pointer-events-none translate-y-[5%] transition peer-checked:opacity-100 peer-checked:translate-y-[0%] peer-checked:pointer-events-auto">
                            <FlightDatePicker />
                        </div>
                    </label>
                </div>
                <div className="w-[20%]">
                    <label htmlFor="isOpenPerson" className="relative w-full block">
                        <div className="h-[4.8rem] flex gap-x-[0.8rem] items-center select-none">
                            <Image src="/icPerson.svg" alt="icPerson" width={32} height={32} priority />
                            <Input
                                placeholder="Choose Quantity"
                                readOnly
                                className="px-0 h-full outline-none shadow-none border-none placeholder:text-[var(--cl-pri)] pointer-events-none"
                                value=""
                            />
                        </div>
                        <input id="isOpenPerson" name="isOpen" type="checkbox" className="peer hidden" />
                        <div className="hidden peer-checked:block fixed inset-0 z-10" />
                        <div className="absolute z-20 top-[calc(100%+0.5rem)] left-0 w-full opacity-0 pointer-events-none translate-y-[5%] transition peer-checked:opacity-100 peer-checked:translate-y-[0%] peer-checked:pointer-events-auto">
                            <Person />
                        </div>
                    </label>
                </div>
                <div className="w-[20%] p-2 flex justify-center ali">
                    <Button className="w-full h-[4.4rem] bg-[var(--cl-pri)] text-[1.6rem] uppercase hover:bg-[var(--cl-four)]" >Search</Button>
                </div>
            </div>

        </>
    )
}

export default FlightSearchBar