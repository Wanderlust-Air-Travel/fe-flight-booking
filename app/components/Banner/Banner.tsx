"use client";
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
        <div className={`min-h-[60vh] sm:min-h-[70vh] md:h-[calc(100vh-var(--hd))] relative flex items-center`}>
            {
                data &&
                (
                    <div className="absolute inset-0 w-full h-full z-0 pointer-events-none modal">
                        <Image src={data.url} alt={data.name} width={100} height={100} priority unoptimized className="w-full h-full object-cover" />
                    </div>
                )
            }
            <div className="container w-full py-8 md:py-0">
                <div className="flex flex-col items-center justify-center z-10 h-full relative gap-y-4 sm:gap-y-6 md:gap-y-8 px-4 sm:px-6 md:px-0" >
                    {
                        data && (
                            <h1 
                                className="text-center text-white uppercase font-medium leading-tight px-4
                                    text-3xl sm:text-4xl md:text-5xl lg:text-6xl xl:text-7xl 2xl:text-[8rem]
                                    drop-shadow-lg" 
                                data-aos="fade-up"
                            >
                                {data.title}
                            </h1>
                        )
                    }
                    <div className="w-full max-w-7xl search-bn p-2 sm:p-3 md:p-4 rounded-md md:rounded-lg relative z-10" data-aos="fade-up" data-aos-delay="500" >
                        <FlightSearchBar />
                    </div>
                </div>
            </div>
        </div>
    )

}

export default BannerHome