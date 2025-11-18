"use client"
import InfoTicketBox from "@/app/components/InfoTicketBox/InfoTicketBox";
import useIsActiveStore from "@/app/zustand/storeHeader";
import Image from "next/image";

const ChooseCabin = () => {
    const { isActive } = useIsActiveStore();


    return (
        <main className={`${isActive ? "pt-[calc(var(--hd)-var(--hdt))]" : "pt-[var(--hd)]"} flex flex-col gap-y-[var(--rowY)]`} >
            <InfoTicketBox />

            <section className="">
                <div className="container">
                    <div className="flex flex-wrap -mx-[1.2rem]">
                        <div className="px-[1.2rem] w-[75%]">
                            <div className="pt-[calc(100%*2965/2425)] w-full relative overflow-hidden block">
                                <Image src="/plane.png" alt="plane" width={100} height={100} className="w-full h-full absolute inset-0 object-cover" priority unoptimized />

                                <div className="absolute h-[55%] w-[8.35%] top-[21%] left-1/2 z-10 -translate-x-1/2 flex flex-col">
                                    <div className="absolute inset-0 w-full h-[25%]  bg-[#F5F7FA] rounded-md">
                                        <div className="flex flex-wrap items-center h-full absolute inset-0 gap-y-[0.2rem] py-[0.2rem] px-[0.3rem] -mx-[0.15rem]">
                                            <span className="w-[calc(100%/4)] h-[15%] block  rounded-[0.25rem] overflow-hidden flex-shrink-0 px-[0.12rem] cursor-pointer">
                                                <span className="block w-full h-full bg-[var(--cl-seven)] text-[0.6rem] font-bold  text-[var(--cl-pri)] flex justify-center items-center uppercase hover:bg-[var(--cl-pri)] hover:text-[var(--cl-white)] transition ease-linear">
                                                    a1
                                                </span>
                                            </span>
                                            <span className="w-[calc(100%/4)] h-[15%] block  rounded-[0.25rem] overflow-hidden flex-shrink-0 px-[0.12rem] cursor-pointer">
                                                <span className="block w-full h-full bg-[var(--cl-seven)] text-[0.6rem] font-bold  text-[var(--cl-pri)] flex justify-center items-center uppercase hover:bg-[var(--cl-pri)] hover:text-[var(--cl-white)] transition ease-linear">
                                                    a2
                                                </span>
                                            </span>
                                            <span className="w-[calc(100%/4)] h-[15%] block  rounded-[0.25rem] overflow-hidden flex-shrink-0 px-[0.12rem] cursor-pointer">
                                                <span className="block w-full h-full bg-[var(--cl-seven)] text-[0.6rem] font-bold  text-[var(--cl-pri)] flex justify-center items-center uppercase hover:bg-[var(--cl-pri)] hover:text-[var(--cl-white)] transition ease-linear">
                                                    a3
                                                </span>
                                            </span>
                                            <span className="w-[calc(100%/4)] h-[15%] block  rounded-[0.25rem] overflow-hidden flex-shrink-0 px-[0.12rem] cursor-pointer">
                                                <span className="block w-full h-full bg-[var(--cl-seven)] text-[0.6rem] font-bold  text-[var(--cl-pri)] flex justify-center items-center uppercase hover:bg-[var(--cl-pri)] hover:text-[var(--cl-white)] transition ease-linear">
                                                    a4
                                                </span>
                                            </span>
                                            <span className="w-[calc(100%/4)] h-[15%] block  rounded-[0.25rem] overflow-hidden flex-shrink-0 px-[0.12rem] cursor-pointer">
                                                <span className="block w-full h-full bg-[var(--cl-seven)] text-[0.6rem] font-bold  text-[var(--cl-pri)] flex justify-center items-center uppercase hover:bg-[var(--cl-pri)] hover:text-[var(--cl-white)] transition ease-linear">
                                                    b1
                                                </span>
                                            </span>
                                            <span className="w-[calc(100%/4)] h-[15%] block  rounded-[0.25rem] overflow-hidden flex-shrink-0 px-[0.12rem] cursor-pointer">
                                                <span className="block w-full h-full bg-[var(--cl-seven)] text-[0.6rem] font-bold  text-[var(--cl-pri)] flex justify-center items-center uppercase hover:bg-[var(--cl-pri)] hover:text-[var(--cl-white)] transition ease-linear">
                                                    b2
                                                </span>
                                            </span>
                                            <span className="w-[calc(100%/4)] h-[15%] block  rounded-[0.25rem] overflow-hidden flex-shrink-0 px-[0.12rem] cursor-pointer">
                                                <span className="block w-full h-full bg-[var(--cl-seven)] text-[0.6rem] font-bold  text-[var(--cl-pri)] flex justify-center items-center uppercase hover:bg-[var(--cl-pri)] hover:text-[var(--cl-white)] transition ease-linear">
                                                    b3
                                                </span>
                                            </span>
                                            <span className="w-[calc(100%/4)] h-[15%] block  rounded-[0.25rem] overflow-hidden flex-shrink-0 px-[0.12rem] cursor-pointer">
                                                <span className="block w-full h-full bg-[var(--cl-seven)] text-[0.6rem] font-bold  text-[var(--cl-pri)] flex justify-center items-center uppercase hover:bg-[var(--cl-pri)] hover:text-[var(--cl-white)] transition ease-linear">
                                                    b4
                                                </span>
                                            </span>
                                            <span className="w-[calc(100%/4)] h-[15%] block  rounded-[0.25rem] overflow-hidden flex-shrink-0 px-[0.12rem] cursor-pointer">
                                                <span className="block w-full h-full bg-[var(--cl-seven)] text-[0.6rem] font-bold  text-[var(--cl-pri)] flex justify-center items-center uppercase hover:bg-[var(--cl-pri)] hover:text-[var(--cl-white)] transition ease-linear">
                                                    c1
                                                </span>
                                            </span>
                                            <span className="w-[calc(100%/4)] h-[15%] block  rounded-[0.25rem] overflow-hidden flex-shrink-0 px-[0.12rem] cursor-pointer">
                                                <span className="block w-full h-full bg-[var(--cl-seven)] text-[0.6rem] font-bold  text-[var(--cl-pri)] flex justify-center items-center uppercase hover:bg-[var(--cl-pri)] hover:text-[var(--cl-white)] transition ease-linear">
                                                    c2
                                                </span>
                                            </span>
                                            <span className="w-[calc(100%/4)] h-[15%] block  rounded-[0.25rem] overflow-hidden flex-shrink-0 px-[0.12rem] cursor-pointer">
                                                <span className="block w-full h-full bg-[var(--cl-seven)] text-[0.6rem] font-bold  text-[var(--cl-pri)] flex justify-center items-center uppercase hover:bg-[var(--cl-pri)] hover:text-[var(--cl-white)] transition ease-linear">
                                                    c3
                                                </span>
                                            </span>
                                            <span className="w-[calc(100%/4)] h-[15%] block  rounded-[0.25rem] overflow-hidden flex-shrink-0 px-[0.12rem] cursor-pointer">
                                                <span className="block w-full h-full bg-[var(--cl-seven)] text-[0.6rem] font-bold  text-[var(--cl-pri)] flex justify-center items-center uppercase hover:bg-[var(--cl-pri)] hover:text-[var(--cl-white)] transition ease-linear">
                                                    c4
                                                </span>
                                            </span>
                                            <span className="w-[calc(100%/4)] h-[15%] block  rounded-[0.25rem] overflow-hidden flex-shrink-0 px-[0.12rem] cursor-pointer">
                                                <span className="block w-full h-full bg-[var(--cl-seven)] text-[0.6rem] font-bold  text-[var(--cl-pri)] flex justify-center items-center uppercase hover:bg-[var(--cl-pri)] hover:text-[var(--cl-white)] transition ease-linear">
                                                    d1
                                                </span>
                                            </span>
                                            <span className="w-[calc(100%/4)] h-[15%] block  rounded-[0.25rem] overflow-hidden flex-shrink-0 px-[0.12rem] cursor-pointer">
                                                <span className="block w-full h-full bg-[var(--cl-seven)] text-[0.6rem] font-bold  text-[var(--cl-pri)] flex justify-center items-center uppercase hover:bg-[var(--cl-pri)] hover:text-[var(--cl-white)] transition ease-linear">
                                                    d2
                                                </span>
                                            </span>
                                            <span className="w-[calc(100%/4)] h-[15%] block  rounded-[0.25rem] overflow-hidden flex-shrink-0 px-[0.12rem] cursor-pointer">
                                                <span className="block w-full h-full bg-[var(--cl-seven)] text-[0.6rem] font-bold  text-[var(--cl-pri)] flex justify-center items-center uppercase hover:bg-[var(--cl-pri)] hover:text-[var(--cl-white)] transition ease-linear">
                                                    d3
                                                </span>
                                            </span>
                                            <span className="w-[calc(100%/4)] h-[15%] block  rounded-[0.25rem] overflow-hidden flex-shrink-0 px-[0.12rem] cursor-pointer">
                                                <span className="block w-full h-full bg-[var(--cl-seven)] text-[0.6rem] font-bold  text-[var(--cl-pri)] flex justify-center items-center uppercase hover:bg-[var(--cl-pri)] hover:text-[var(--cl-white)] transition ease-linear">
                                                    d4
                                                </span>
                                            </span>
                                            <span className="w-[calc(100%/4)] h-[15%] block  rounded-[0.25rem] overflow-hidden flex-shrink-0 px-[0.12rem] cursor-pointer">
                                                <span className="block w-full h-full bg-[var(--cl-seven)] text-[0.6rem] font-bold  text-[var(--cl-pri)] flex justify-center items-center uppercase hover:bg-[var(--cl-pri)] hover:text-[var(--cl-white)] transition ease-linear">
                                                    e1
                                                </span>
                                            </span>
                                            <span className="w-[calc(100%/4)] h-[15%] block  rounded-[0.25rem] overflow-hidden flex-shrink-0 px-[0.12rem] cursor-pointer">
                                                <span className="block w-full h-full bg-[var(--cl-seven)] text-[0.6rem] font-bold  text-[var(--cl-pri)] flex justify-center items-center uppercase hover:bg-[var(--cl-pri)] hover:text-[var(--cl-white)] transition ease-linear">
                                                    e2
                                                </span>
                                            </span>
                                            <span className="w-[calc(100%/4)] h-[15%] block  rounded-[0.25rem] overflow-hidden flex-shrink-0 px-[0.12rem] cursor-pointer">
                                                <span className="block w-full h-full bg-[var(--cl-seven)] text-[0.6rem] font-bold  text-[var(--cl-pri)] flex justify-center items-center uppercase hover:bg-[var(--cl-pri)] hover:text-[var(--cl-white)] transition ease-linear">
                                                    e3
                                                </span>
                                            </span>
                                            <span className="w-[calc(100%/4)] h-[15%] block  rounded-[0.25rem] overflow-hidden flex-shrink-0 px-[0.12rem] cursor-pointer">
                                                <span className="block w-full h-full bg-[var(--cl-seven)] text-[0.6rem] font-bold  text-[var(--cl-pri)] flex justify-center items-center uppercase hover:bg-[var(--cl-pri)] hover:text-[var(--cl-white)] transition ease-linear">
                                                    e4
                                                </span>
                                            </span>
                                        </div>
                                    </div>

                                    
                                </div>



                            </div>
                        </div>
                        <div className="px-[1.2rem] w-[100%] flex-1">

                        </div>
                    </div>
                </div>
            </section>
        </main>
    )
}

export default ChooseCabin