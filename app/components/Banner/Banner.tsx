"use client";
import axios from "axios";
import { showError, getErrorMessage } from "@/lib/toast";
import Image from "next/image";
import { useEffect, useState } from "react";
import FlightSearchBar from "../FlightSearchBar/FlightSearchBar";
import { BannerApi } from "@/types/banner";

const BannerHome = () => {
    const [data, setData] = useState<BannerApi | null>(null)


    useEffect(() => {
        axios.get("/api/banner")
            .then((res) => {
                setData(res.data)
            })
            .catch((error) => {
                console.log(error)
                // Error toast sẽ tự động hiển thị từ axios interceptor
            })
    }, [])

    console.log(data)

    return (
        <div className={`h-[calc(100vh-var(--hd))] relative `}>
            {
                data &&
                (
                    <div className="absolute inset-0 w-full h-full z-0 pointer-events-none modal">
                        <Image src={data.url} alt={data.name} width={100} height={100} priority unoptimized className="w-full h-full object-cover" />
                    </div>
                )
            }
            <div className="container">
                <div className="flex flex-col items-center justify-center z-10 h-full relative gap-y-[2rem]" >
                    {
                        data && <h1 className="text-center text-white text-[8rem] uppercase font-medium" data-aos="fade-up">{data.title}</h1>
                    }
                    <div className="w-full search-bn p-2 rounded-md" data-aos="fade-up" data-aos-delay="500" >
                        <FlightSearchBar />
                    </div>
                </div>
            </div>
        </div>
    )

}

export default BannerHome