"use client"
import useFightSearchBarStore from "@/app/zustand/storeFightSearchBar";
import { Minus, Plus } from "lucide-react"
import { useEffect, useMemo, useState } from "react"

const Person = ({classNameParent,classNameChild}:any) => {
    const { setData } = useFightSearchBarStore();

    const [adult, setAdult] = useState<number>(1);
    const [child, setChild] = useState<number>(0); // Child (2-11 years)
    const [infant, setInfant] = useState<number>(0); // Infant (<2 years)

    const total = useMemo(() => {
        return adult + child + infant;
    }, [adult, child, infant])

    useEffect(() => {
        setData({ 
            totalPerson: total, 
            adult: adult,
            child: child,
            infant: infant,
            minor: child + infant // Keep for backward compatibility
        });
    }, [adult, child, infant, total, setData])


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

    const handleMinusChild = () => {
        setChild((prev) => {
            if (child <= 0) {
                return 0;
            }
            return prev - 1
        })
    }

    const handlePlusChild = () => {
        setChild((prev) => {
            return prev + 1
        })
    }

    const handleMinusInfant = () => {
        setInfant((prev) => {
            if (infant <= 0) {
                return 0;
            }
            return prev - 1
        })
    }

    const handlePlusInfant = () => {
        setInfant((prev) => {
            // Maximum 1 infant per adult
            if (infant >= adult) {
                return adult;
            }
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
                <div className="flex flex-col">
                    <p className={`text-[1.4rem] text-[var(--cl-pri)] ${classNameChild}`}>Children (2-11):</p>
                    <p className="text-xs text-gray-500">Has own seat</p>
                </div>
                <div className="flex items-center gap-x-[0.6rem]">
                    <button onClick={handleMinusChild} className="group w-[2.8rem] h-[2.8rem] flex justify-center items-center text-[var(--cl-pri)] font-bold flex-shrink-0 cursor-pointer transition hover:bg-[var(--cl-pri)] rounded">
                        <Minus className="text-[var(--cl-pri)] group-hover:text-[var(--cl-white)] w-4 h-4" strokeWidth={0.8} />
                    </button>
                    <p className="w-[2.8rem] h-[2.8rem] flex justify-center items-center text-center text-[var(--cl-pri)] text-[1.4rem] flex-shrink-0 cursor-pointer">{child}</p>
                    <button onClick={handlePlusChild} className="group w-[2.8rem] h-[2.8rem] flex justify-center items-center text-[var(--cl-pri)] font-bold flex-shrink-0 cursor-pointer transition hover:bg-[var(--cl-pri)] rounded">
                        <Plus className="text-[var(--cl-pri)] group-hover:text-[var(--cl-white)] w-4 h-4" strokeWidth={0.8} />
                    </button>
                </div>
            </div>
            <div className="flex gap-x-[0.8rem] justify-between items-center">
                <div className="flex flex-col">
                    <p className={`text-[1.4rem] text-[var(--cl-pri)] ${classNameChild}`}>Infants (&lt;2):</p>
                    <p className="text-xs text-gray-500">No seat (max 1 per adult)</p>
                </div>
                <div className="flex items-center gap-x-[0.6rem]">
                    <button onClick={handleMinusInfant} className="group w-[2.8rem] h-[2.8rem] flex justify-center items-center text-[var(--cl-pri)] font-bold flex-shrink-0 cursor-pointer transition hover:bg-[var(--cl-pri)] rounded">
                        <Minus className="text-[var(--cl-pri)] group-hover:text-[var(--cl-white)] w-4 h-4" strokeWidth={0.8} />
                    </button>
                    <p className="w-[2.8rem] h-[2.8rem] flex justify-center items-center text-center text-[var(--cl-pri)] text-[1.4rem] flex-shrink-0 cursor-pointer">{infant}</p>
                    <button onClick={handlePlusInfant} className="group w-[2.8rem] h-[2.8rem] flex justify-center items-center text-[var(--cl-pri)] font-bold flex-shrink-0 cursor-pointer transition hover:bg-[var(--cl-pri)] rounded">
                        <Plus className="text-[var(--cl-pri)] group-hover:text-[var(--cl-white)] w-4 h-4" strokeWidth={0.8} />
                    </button>
                </div>
                {infant > adult && (
                    <p className="text-xs text-red-500 ml-2">
                        Max {adult} infant(s) allowed
                    </p>
                )}
            </div>
        </div>
    )
}

export default Person