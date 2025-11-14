"use client";
import FlightSearchBar from "@/app/components/FlightSearchBar/FlightSearchBar";
import useIsActiveStore from "@/app/zustand/storeHeader";

const ServiceDetails = () => {

    const { isActive } = useIsActiveStore();


    return (
        <main className={`${isActive ? "pt-[calc(var(--hd)-var(--hdt))]" : "pt-[var(--hd)]"} flex flex-col gap-y-[var(--rowY)]`} >
            <section className="pt-[var(--rowY)] w-full">
                <div className="container">
                    <FlightSearchBar />
                </div>
            </section>
            <section className="">
                <div className="container">
                    <div className="flex flex-col gap-y-[2rem]">
                        <h2 className="text-lg text-[var(--cl-pri)] font-bold uppercase">
                            Trip list
                        </h2>
                    </div>  
                </div>
            </section>
        </main>
    )
}

export default ServiceDetails