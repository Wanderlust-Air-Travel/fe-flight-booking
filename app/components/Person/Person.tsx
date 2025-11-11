import { Minus, Plus } from "lucide-react"

const Person = () => {
    return (
        <div className="flex flex-col bg-white gap-y-[0.8rem] p-4 rounded-sm overflow-hidden">
            <div className="flex gap-x-[1rem] justify-between items-center">
                <p className="text-[1.6rem] text-[var(--cl-pri)]">Adults:</p>
                <div className="flex items-center gap-x-[0.8rem]">
                    <button className="group w-[3.2rem] h-[3.2rem] flex justify-center items-center text-[var(--cl-pri)] font-bold flex-shrink-0 cursor-pointer transition hover:bg-[var(--cl-pri)]">
                        <Minus className="text-[var(--cl-pri)] group-hover:text-[var(--cl-white)]" strokeWidth={0.8} />
                    </button>
                    <p className="w-[3.2rem] h-[3.2rem] flex justify-center items-center text-center text-[var(--cl-pri)] text-[1.6rem] flex-shrink-0 cursor-pointer">0</p>
                    <button className="group w-[3.2rem] h-[3.2rem] flex justify-center items-center text-[var(--cl-pri)] font-bold flex-shrink-0 cursor-pointer transition hover:bg-[var(--cl-pri)]">
                        <Plus className="text-[var(--cl-pri)] group-hover:text-[var(--cl-white)]" strokeWidth={0.8} />
                    </button>
                </div>
            </div>
            <div className="flex gap-x-[1rem] justify-between items-center">
                <p className="text-[1.6rem] text-[var(--cl-pri)]">Minors:</p>
                <div className="flex items-center gap-x-[0.8rem]">
                    <button className="group w-[3.2rem] h-[3.2rem] flex justify-center items-center text-[var(--cl-pri)] font-bold flex-shrink-0 cursor-pointer transition hover:bg-[var(--cl-pri)]">
                        <Minus className="text-[var(--cl-pri)] group-hover:text-[var(--cl-white)]" strokeWidth={0.8} />
                    </button>
                    <p className="w-[3.2rem] h-[3.2rem] flex justify-center items-center text-center text-[var(--cl-pri)] text-[1.6rem] flex-shrink-0 cursor-pointer">0</p>
                    <button className="group w-[3.2rem] h-[3.2rem] flex justify-center items-center text-[var(--cl-pri)] font-bold flex-shrink-0 cursor-pointer transition hover:bg-[var(--cl-pri)]">
                        <Plus className="text-[var(--cl-pri)] group-hover:text-[var(--cl-white)]" strokeWidth={0.8} />
                    </button>
                </div>
            </div>
        </div>
    )
}

export default Person