"use client"
import useInfoTicket from "@/app/zustand/storeInfoTicket";
import useUserStore from "@/app/zustand/storeUser";
import useFightSearchBarStore from "@/app/zustand/storeFightSearchBar";
import { Check, ChevronDown, X } from "lucide-react";
import Image from "next/image";
import { useState } from "react";
import FormatPrice from "../FormatPrice/FormatPrice";
import Link from "next/link";
import { Button } from "@/components/ui/button";

const InfoTicketBox = () => {

    const { data, isHydrated } = useInfoTicket();
    const [isOpen, setIsOpen] = useState<boolean>(false);
    const { data: dataPerson } = useInfoTicket();
    const { data: searchBarData, isHydrated: isSearchBarHydrated } = useFightSearchBarStore();
    const { user, accessToken } = useUserStore();
    const isLoggedIn = Boolean(accessToken || user?.id);
    
    // Get total person count from search bar data (adults + children + infants)
    const totalPerson = searchBarData?.totalPerson || data.totalPerson || 1;

    const handleOpen = () => {
        setIsOpen(!isOpen)
    }

    console.log(data)

    // Nếu store đã hydrate nhưng chưa có chuyến/ticket được chọn:
    // - Với user đã login: hiển thị placeholder hướng dẫn (vào /my-tickets hoặc quay lại search)
    // - Với guest: KHÔNG hiển thị gì (guest giữ state qua URL/session, tránh message gây hiểu nhầm)
    if (isHydrated && !data.flightInstanceId && isLoggedIn) {
        return (
            <section className="w-full">
                <div className="container">
                    <div className="border-[0.1rem] border-[var(--cl-third)] rounded-[1rem] bg-gradient-to-r from-blue-50/60 to-white p-[2rem] md:p-[2.4rem] flex flex-col md:flex-row items-center justify-between gap-[1.6rem] shadow-sm">
                        {isLoggedIn ? (
                            <>
                                <div className="flex flex-col gap-y-[0.4rem]">
                                    <p className="text-base md:text-lg font-bold text-[var(--cl-pri)] uppercase tracking-wide">
                                        Bạn chưa có đặt chỗ nào đang được xử lý
                                    </p>
                                    <p className="text-sm md:text-base text-[var(--cl-third)] max-w-[40rem]">
                                        Vui lòng kiểm tra danh sách vé của bạn hoặc quay lại trang tìm kiếm để đặt chuyến bay mới.
                                    </p>
                                </div>
                                <div className="flex flex-col sm:flex-row gap-[0.8rem]">
                                    <Link href="/my-tickets">
                                        <Button variant="outline" className="h-[3.6rem] px-[2.4rem] border-[var(--cl-pri)] text-[var(--cl-pri)] hover:bg-[var(--cl-pri)] hover:text-white text-sm md:text-base font-semibold uppercase tracking-wide rounded-md">
                                            Xem vé của tôi
                                        </Button>
                                    </Link>
                                    <Link href="/">
                                        <Button className="h-[3.6rem] px-[2.4rem] bg-[var(--cl-pri)] hover:bg-[var(--cl-four)] text-white text-sm md:text-base font-semibold uppercase tracking-wide rounded-md shadow-md">
                                            Quay lại tìm kiếm
                                        </Button>
                                    </Link>
                                </div>
                            </>
                        ) : (
                            <>
                                <div className="flex flex-col gap-y-[0.4rem]">
                                    <p className="text-base md:text-lg font-bold text-[var(--cl-pri)] uppercase tracking-wide">
                                        Chưa có chuyến bay nào được chọn
                                    </p>
                                    <p className="text-sm md:text-base text-[var(--cl-third)] max-w-[40rem]">
                                        Vui lòng quay lại trang tìm kiếm để chọn chuyến bay và hạng vé trước khi tiếp tục đặt chỗ.
                                    </p>
                                </div>
                                <Link href="/">
                                    <Button className="h-[3.6rem] px-[2.4rem] bg-[var(--cl-pri)] hover:bg-[var(--cl-four)] text-white text-sm md:text-base font-semibold uppercase tracking-wide rounded-md shadow-md">
                                        Quay lại tìm kiếm
                                    </Button>
                                </Link>
                            </>
                        )}
                    </div>
                </div>
            </section>
        );
    }

    return (

        <section className="w-full">
            <div className="container">
                <ul className="border-[var(--cl-third)] border-[0.1rem] rounded-[1rem] overflow-hidden">
                    <li className="flex gap-x-[1.2rem] items-center p-[1.6rem] bg-[var(--cl-pri)]">
                        <div className="w-[5%]">
                            <p className="text-white font-bold text-base uppercase" >Logo</p>
                        </div>
                        <div className="w-[15%]">
                            <p className="text-white font-bold text-base uppercase" >Time & Brand</p>
                        </div>
                        <div className="w-[25%]">
                            <p className="text-white font-bold text-base uppercase" >Information</p>
                        </div>
                        <div className="w-[15%]">
                            <p className="text-white font-bold text-base uppercase" >Transit</p>
                        </div>
                        <div className="w-[10%]">
                            <p className="text-white font-bold text-base uppercase" >Service</p>
                        </div>
                        <div className="w-full flex-1">
                            <p className="text-white font-bold text-base uppercase text-center" >Cabin</p>
                        </div>
                    </li>

                    {
                        isHydrated
                            ?
                            (
                                data.flightInstanceId !== ""
                                    ?
                                    (
                                        <li className="flex flex-col w-full">
                                            <div className="flex gap-x-[1.2rem] items-center p-[1.6rem]  w-full" >
                                                <div className="w-[5%]">
                                                    <Image src="/logoBrand.png" alt="logoBrand" width={40} height={40} unoptimized priority />
                                                </div>
                                                <div className="w-[15%]">
                                                    <div className="flex flex-col gap-y-[0.2rem]">
                                                        <p className="text-[var(--cl-third)] text-base font-bold">{data.airline}</p>
                                                    </div>
                                                </div>
                                                <div className="w-[25%]">
                                                    <div className="flex flex-col gap-y-[0.2rem]">
                                                        <p className="text-[var(--cl-third)] text-mn font-bold">Location: {data.start} - {data.end}</p>
                                                        {
                                                            data.startDate && (<p className="text-[var(--cl-five)] text-mn">Start date: {data.startDate}</p>)
                                                        }
                                                        {
                                                            data.endDate && (<p className="text-[var(--cl-five)] text-mn">End date: {data.endDate}</p>)
                                                        }

                                                    </div>
                                                </div>
                                                <div className="w-[15%]">
                                                    <div className="flex flex-col gap-y-[0.2rem]">
                                                        <p className="text-[var(--cl-five)] font-bold text-base">{data.stopCount}</p>
                                                        <p className="text-[var(--cl-third)] text-base">{data.stopDuration}</p>
                                                    </div>
                                                </div>
                                                <div className="w-[10%]">
                                                    <p className="text-[var(--cl-five)] font-bold text-base">{data.service}</p>
                                                </div>
                                                <div className="w-full flex-1">
                                                    <div className="flex gap-x-[1rem] items-center" onClick={(handleOpen)}>
                                                        <div className={`${data.typeTicket.includes("Economy") ? "bg-[var(--cl-five)] hover:bg-green-700" : "bg-[var(--cl-pri)] hover:bg-blue-950"} flex flex-col items-center p-[1.2rem] w-full rounded-md cursor-pointer gap-y-[0.2rem]  transition ease-linear`} >
                                                            <p className="text-base text-white font-bold text-center" >
                                                                {data.typeTicket}
                                                            </p>
                                                            <p className="text-base text-white font-bold text-center">
                                                                {FormatPrice(Number(data.price))} x {totalPerson} {totalPerson === 1 ? 'Person' : 'People'}
                                                            </p>
                                                            <ChevronDown className={`w-[1.2=4rem] h-[1.4rem] text-white transition-[rotate] ease-linear ${isOpen && "rotate-[180deg]"}`} />
                                                        </div>

                                                    </div>
                                                </div>
                                            </div>


                                            <div className={`${isOpen ? "max-h-[600px] pointer-events-auto" : "max-h-[0px] pointer-events-none"} overflow-hidden flex w-full transition-[max-height]  ease-linear duration-300 will-change-[max-height] `}>
                                                <div className="flex flex-col justify-center items-center gap-y-[1.2rem] p-[1.2rem] w-full border-t-[0.1rem] border-[var(--cl-third)]">


                                                    <div className="flex -mx-[1.2rem] w-full">
                                                        <div className="w-[35%] px-[1.2rem]">
                                                            <div className="flex flex-col gap-y-[2rem]">
                                                                <p className={`${data.typeTicket.includes("Economy") ? "text-[var(--cl-five)]" : "text-[var(--cl-pri)]"}  uppercase font-bold text-start text-[2.4rem]`}>{data.typeTicket}</p>
                                                                <ul className="flex flex-col gap-y-[0.8rem]">
                                                                    {
                                                                        data?.desc?.map((item: { text: string; status: boolean }, index: number) => {
                                                                            return (
                                                                                <li key={index} className="flex gap-x-[0.8rem]">
                                                                                    {
                                                                                        item.status ? <Check className="w-[2.4rem] h-[2.4rem] flex-shrink-0 text-[var(--cl-four)]" /> : <X className="w-[2.4rem] h-[2.4rem] flex-shrink-0 text-[var(--cl-red)]" />
                                                                                    }
                                                                                    <p className="text-base">
                                                                                        {item.text}
                                                                                    </p>
                                                                                </li>
                                                                            )
                                                                        })
                                                                    }

                                                                </ul>
                                                            </div>

                                                        </div>
                                                        <div className="w-full flex-1 px-[1.2rem] flex-col flex h-full justify-center">
                                                            <div className="flex flex-col gap-y-[4rem] ">
                                                                <p className={`${data.typeTicket.includes("Economy") ? "text-[var(--cl-five)]" : "text-[var(--cl-pri)]"}  uppercase font-bold text-center text-[2.4rem]`}>Itinerary details</p>

                                                                <div className="flex gap-x-[2rem] justify-between items-center">
                                                                    <div className="flex flex-col flex-shrink-0 items-center">
                                                                        <p className={`text-md ${data.typeTicket.includes("Economy") ? "text-[var(--cl-five)]" : "text-[var(--cl-pri)]"} font-bold`}>
                                                                            {data.startCode}
                                                                        </p>

                                                                        <p className={`text-base ${data.typeTicket.includes("Economy") ? "text-[var(--cl-five)]" : "text-[var(--cl-pri)]"} text-nowrap text-nowrap`}>
                                                                            {data.start}
                                                                        </p>
                                                                    </div>

                                                                    <div className="w-full relative h-[0.2rem]">
                                                                        <div className={`w-full h-full border-t-[0.1rem] ${data.typeTicket.includes("Economy") ? "border-[var(--cl-five)]" : "border-[var(--cl-pri)]"} border-dashed `}></div>
                                                                        <div className="absolute bottom-5 left-[50%] -translate-x-1/2">
                                                                            <p className={`text-base ${data.typeTicket.includes("Economy") ? "text-[var(--cl-five)]" : "text-[var(--cl-pri)]"} text-nowrap text-nowrap uppercase font-bold`}>
                                                                                {data.service}
                                                                            </p>
                                                                        </div>

                                                                        <div className="absolute top-5 left-[50%] -translate-x-1/2">

                                                                            {
                                                                                data.startDate && (<p className={`${data.typeTicket.includes("Economy") ? "text-[var(--cl-five)]" : "text-[var(--cl-pri)]"} text-mn`}>Start date: {data.startDate}</p>)
                                                                            }
                                                                            {
                                                                                data.endDate && (<p className={`${data.typeTicket.includes("Economy") ? "text-[var(--cl-five)]" : "text-[var(--cl-pri)]"} text-mn`}>End date: {data.endDate}</p>)
                                                                            }
                                                                        </div>
                                                                    </div>

                                                                    <div className="flex flex flex-col flex-shrink-0 items-center">
                                                                        <p className={`text-md ${data.typeTicket.includes("Economy") ? "text-[var(--cl-five)]" : "text-[var(--cl-pri)]"} text-center font-bold`}>
                                                                            {data.endCode}
                                                                        </p>
                                                                        <p className={`text-base ${data.typeTicket.includes("Economy") ? "text-[var(--cl-five)]" : "text-[var(--cl-pri)]"} text-nowrap text-center`}>
                                                                            {data.end}
                                                                        </p>
                                                                    </div>
                                                                </div>
                                                            </div>

                                                        </div>
                                                    </div>

                                                </div>
                                            </div>

                                        </li>
                                    )
                                    :
                                    (
                                        <li className="flex flex-col w-full justify-center items-center min-h-[6rem] p-[1.6rem]">
                                            <p className="text-md text-[var(--cl-pri)]">No data, please buy tickets
                                            </p>
                                        </li>
                                    )


                            )
                            :
                            (
                                <li className="flex flex-col w-full justify-center items-center min-h-[6rem] p-[1.6rem]">
                                    <Image src="/loading.gif" alt="loading" width={50} height={50} className="object-cover" priority unoptimized />
                                </li>
                            )
                    }




                </ul>
            </div>
        </section>


    )
}

export default InfoTicketBox