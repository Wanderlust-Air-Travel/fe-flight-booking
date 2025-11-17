"use client";
import useIsActiveStore from "@/app/zustand/storeHeader";
import axios from "axios";
import Image from "next/image";
import { useEffect, useState } from "react";
import FlightSearchBar from "../FlightSearchBar/FlightSearchBar";


interface bannerApi {
    title: string,
    url: string,
    name: string
}

const BannerHome = () => {
    const { isActive } = useIsActiveStore();
    const [data, setData] = useState<bannerApi | null>(null)


    useEffect(() => {
        axios.get("/api/banner")
            .then((res) => {
                setData(res.data)
            })
            .catch((error) => {
                console.log(error)
            })
    }, [])

    console.log(data)

    return (
        <div className={`${isActive ? "h-[calc(100vh-(var(--hd)-var(--hdt)))]" : "h-[calc(100vh-var(--hd))]"} relative `}>
            {
                data &&
                (
                    <div className="absolute inset-0 w-full h-full z-0 pointer-events-none modal">
                        <Image src={data.url} alt={data.name} width={100} height={100} priority unoptimized className="w-full h-full object-cover" />
                    </div>
                )
            }
            <div className="container">
                <div className="flex flex-col items-center justify-center z-10 h-full relative gap-y-[3.2rem]" >
                    {
                        data && <h1 className="text-center text-white text-[8rem] uppercase font-bold" data-aos="fade-up">{data.title}</h1>
                    }
                    <div className="w-full" data-aos="fade-up" data-aos-delay="500" >
                        <FlightSearchBar />
                    </div>
                </div>
            </div>
        </div>
    )

}

export default BannerHome