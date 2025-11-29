"use client"
import useFightSearchBarStore from "@/app/zustand/storeFightSearchBar";
import { Minus, Plus } from "lucide-react"
import { useEffect, useMemo, useState } from "react"

const Person = ({classNameParent,classNameChild}:any) => {
    const { setData } = useFightSearchBarStore();

    const [adult, setAdult] = useState<number>(1);
    const [minor, setMinor] = useState<number>(0);


    const total = useMemo(() => {
        return minor + adult
    }, [minor, adult])


    useEffect(() => {
        setData({ totalPerson: total, adult:adult ,minor:minor  });
    }, [adult,minor])


    const handleMinusAdult = () => {
        setAdult((prev) => {
            if (adult <= 1) {
                return 1;
            }
            return prev - 1
        })
    }

    const handlePlusAdult = () => {
        setAdult((prev) => {
            return prev + 1
        })
    }

    const handleMinusMinor = () => {
        setMinor((prev) => {
            if (minor <= 0) {
                return 0;
            }
            return prev - 1
        })
    }

    const handlePlusMinor = () => {
        setMinor((prev) => {
            return prev + 1
        })
    }


    return (
        <div className={`${classNameParent} flex flex-col bg-white gap-y-[0.6rem] p-3 rounded-sm overflow-hidden`}>
            <div className="flex gap-x-[0.8rem] justify-between items-center">
                <p className={`text-[1.4rem] text-[var(--cl-pri)]  ${classNameChild}`}>Adults:</p>
                <div className="flex items-center gap-x-[0.6rem]">
                    <button onClick={handleMinusAdult} className="group w-[2.8rem] h-[2.8rem] flex justify-center items-center text-[var(--cl-pri)] font-bold flex-shrink-0 cursor-pointer transition hover:bg-[var(--cl-pri)] rounded">
                        <Minus className="text-[var(--cl-pri)] group-hover:text-[var(--cl-white)] w-4 h-4" strokeWidth={0.8} />
                    </button>
                    <p className="w-[2.8rem] h-[2.8rem] flex justify-center items-center text-center text-[var(--cl-pri)] text-[1.4rem] flex-shrink-0 cursor-pointer">{adult}</p>
                    <button onClick={handlePlusAdult} className="group w-[2.8rem] h-[2.8rem] flex justify-center items-center text-[var(--cl-pri)] font-bold flex-shrink-0 cursor-pointer transition hover:bg-[var(--cl-pri)] rounded">
                        <Plus className="text-[var(--cl-pri)] group-hover:text-[var(--cl-white)] w-4 h-4" strokeWidth={0.8} />
                    </button>
                </div>
            </div>
            <div className="flex gap-x-[0.8rem] justify-between items-center">
                <p className={`text-[1.4rem] text-[var(--cl-pri)] ${classNameChild}`}>Minors:</p>
                <div className="flex items-center gap-x-[0.6rem]">
                    <button onClick={handleMinusMinor} className="group w-[2.8rem] h-[2.8rem] flex justify-center items-center text-[var(--cl-pri)] font-bold flex-shrink-0 cursor-pointer transition hover:bg-[var(--cl-pri)] rounded">
                        <Minus className="text-[var(--cl-pri)] group-hover:text-[var(--cl-white)] w-4 h-4" strokeWidth={0.8} />
                    </button>
                    <p className="w-[2.8rem] h-[2.8rem] flex justify-center items-center text-center text-[var(--cl-pri)] text-[1.4rem] flex-shrink-0 cursor-pointer">{minor}</p>
                    <button onClick={handlePlusMinor} className="group w-[2.8rem] h-[2.8rem] flex justify-center items-center text-[var(--cl-pri)] font-bold flex-shrink-0 cursor-pointer transition hover:bg-[var(--cl-pri)] rounded">
                        <Plus className="text-[var(--cl-pri)] group-hover:text-[var(--cl-white)] w-4 h-4" strokeWidth={0.8} />
                    </button>
                </div>
            </div>
        </div>
    )
}

export default Person