"use client"
import Breadcrumb from "@/app/components/Breadcrumb/Breadcrumb";
import InfoTicketBox from "@/app/components/InfoTicketBox/InfoTicketBox";
import useInfoTicket from "@/app/zustand/storeInfoTicket";
import { SeatGroup } from "@/types/seat-type";
import axios from "axios";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { useCallback, useEffect, useMemo, useState } from "react";
import CabinSection from "@/app/components/SeatMap/CabinSection";
import SectionNavigation from "@/app/components/SeatMap/SectionNavigation";
import { divideRowsIntoSections, groupSeatsByRow } from "@/app/utils/seat-utils";

const ChooseCabin = () => {
    const [seatBusiness, setSeatBusiness] = useState<SeatGroup | null>(null)
    const [seatEconomy, setSeatEconomy] = useState<SeatGroup | null>(null)


    const [chooseBusiness, setChooseBusiness] = useState<string[]>([]);
    const [chooseEconomy, setChooseEconomy] = useState<string[]>([]);
    const pathname = usePathname();

    const { data } = useInfoTicket();

    const flightInstanceId = useMemo(() => {
        const pathNameFlightInstanceId = pathname.split("/").filter(Boolean)[1];
        return pathNameFlightInstanceId
    }, [pathname])

    const cabinType = useMemo(() => {
        const pathNameCabinType = pathname.split("/").filter(Boolean)[2];
        return pathNameCabinType
    }, [pathname])


    console.log(flightInstanceId)



    // Optimized seat toggle handlers with useCallback
    const handleSeatToggle = useCallback(
        (cabinType: "business" | "economy") => (seatId: string, checked: boolean) => {
            if (cabinType === "business") {
                setChooseBusiness((prev) =>
                    checked ? [...prev, seatId] : prev.filter((id) => id !== seatId)
                );
            } else {
                setChooseEconomy((prev) =>
                    checked ? [...prev, seatId] : prev.filter((id) => id !== seatId)
                );
            }
        },
        []
    );

    const handleBusinessSeatToggle = handleSeatToggle("business");
    const handleEconomySeatToggle = handleSeatToggle("economy");

    // Navigation handler for smooth scrolling
    const handleSectionNavigate = useCallback((sectionId: string) => {
        const element = document.getElementById(sectionId);
        if (element) {
            element.scrollIntoView({ behavior: "smooth", block: "start" });
        }
    }, []);

    // Generate navigation sections
    const businessSections = useMemo(() => {
        if (!seatBusiness?.list) return [];
        const rows = groupSeatsByRow(seatBusiness.list);
        const sections = divideRowsIntoSections(rows);
        return sections.map((section) => ({
            name: section.name,
            id: `business-${section.name}`,
            label: `${section.name.charAt(0).toUpperCase() + section.name.slice(1)} (Rows ${section.startRow}-${section.endRow})`,
        }));
    }, [seatBusiness]);

    const economySections = useMemo(() => {
        if (!seatEconomy?.list) return [];
        const rows = groupSeatsByRow(seatEconomy.list);
        const sections = divideRowsIntoSections(rows);
        return sections.map((section) => ({
            name: section.name,
            id: `economy-${section.name}`,
            label: `${section.name.charAt(0).toUpperCase() + section.name.slice(1)} (Rows ${section.startRow}-${section.endRow})`,
        }));
    }, [seatEconomy]);


    useEffect(() => {
        // axios.get("/api/seats/VN123")
        //     .then((res) => {

        //         const business = res.data?.seats.find((seat: SeatGroup) => {
        //             return seat.id === "business"
        //         });
        //         setSeatBusiness(business);

        //         const economy = res.data?.seats.find((seat: SeatGroup) => {
        //             return seat.id === "economy"
        //         });
        //         setSeatEconomy(economy);
        //     })
        //     .catch((err) => {
        //         console.log(err)
        //     })

        // Bước 2: Gọi API Get Seat Map (KHÔNG CẦN truyền cabinType - backend tự lấy từ Redis)
        // Nhưng nếu muốn explicit, có thể truyền cabinType
        axios
            .get(`${process.env.NEXT_PUBLIC_API_URL}/api/v1/search/seats`, {
                params: {
                    flightInstanceId,
                    // cabinType is optional - backend will auto-fetch from Redis if not provided
                    ...(cabinType && { cabinType })
                },
            })
            .then((res) => {
                console.log('Seat map response:', res.data);

                // Backend response format: { seats: [{ id: 'business', list: [...] }, { id: 'economy', list: [...] }] }
                if (res.data?.seats && Array.isArray(res.data.seats)) {
                    const business = res.data.seats.find((seat: SeatGroup) => {
                        return seat.id === "business";
                    });
                    const economy = res.data.seats.find((seat: SeatGroup) => {
                        return seat.id === "economy";
                    });

                    setSeatBusiness(business || null);
                    setSeatEconomy(economy || null);
                } else {
                    console.error('Invalid seat map data format:', res.data);
                }
            })
            .catch((err) => {
                console.error('Error fetching seat map:', err);
                console.error('Error details:', err.response?.data || err.message);
            });

    }, [])







    return (
        <main className={`flex flex-col pt-[var(--hd)] gap-y-[var(--rowY)]`} >
            <Breadcrumb />
            <InfoTicketBox />

            <section className="">
                <div className="container">
                    <div className="flex flex-wrap -mx-[1.2rem]">
                        <div className="px-[1.2rem] w-[70%]">
                            <div className="pt-[calc(100%*6000/2000)] w-full relative overflow-hidden block">
                                <Image src="/plane.png" alt="plane" width={100} height={100} className="w-full h-full absolute inset-0 object-cover " priority unoptimized />

                                <div className="absolute h-[55%] w-[24%] top-[16%] left-1/2 z-10 -translate-x-1/2 flex flex-col gap-y-[2rem] overflow-y-auto max-h-full">
                                    {/* Business Section */}
                                    <CabinSection
                                        seatGroup={seatBusiness}
                                        cabinType="business"
                                        selectedSeats={chooseBusiness}
                                        onSeatToggle={handleBusinessSeatToggle}
                                        isSelectable={data.type === "business"}
                                    />

                                    {/* Economy Section */}
                                    <CabinSection
                                        seatGroup={seatEconomy}
                                        cabinType="economy"
                                        selectedSeats={chooseEconomy}
                                        onSeatToggle={handleEconomySeatToggle}
                                        isSelectable={data.type === "economy"}
                                    />
                                </div>
                            </div>
                        </div>
                        <div className="px-[1.2rem] w-[100%] flex-1">
                            <div className={`sticky top-[calc(var(--hd)+1rem)] flex flex-col border-[var(--cl-third)] border-[0.1rem] rounded-[1rem] p-[1.6rem]  gap-y-[2rem]`}>
                                <h2 className="text-center text-md text-[var(--cl-pri)] font-bold">
                                    Choose Position
                                </h2>

                                {/* Section Navigation */}
                                {data.type === "business" && businessSections.length > 0 && (
                                    <SectionNavigation
                                        sections={businessSections}
                                        onNavigate={handleSectionNavigate}
                                        cabinType="business"
                                    />
                                )}
                                {data.type === "economy" && economySections.length > 0 && (
                                    <SectionNavigation
                                        sections={economySections}
                                        onNavigate={handleSectionNavigate}
                                        cabinType="economy"
                                    />
                                )}

                                <div className="flex flex-col gap-y-[0.8rem]">
                                    <p className="text-mn text-[var(--cl-red)] font-medium">
                                        Note
                                    </p>
                                    <ul className="flex flex-wrap gap-[1.2rem]">
                                        <li className="flex gap-x-[0.4rem] items-center">
                                            <span className="w-[2rem] h-[1.6rem] block flex-shrink-0 bg-[var(--cl-pri)] rounded"></span>
                                            <p className="text-[var(--cl-pri)] text-mn">Selected</p>
                                        </li>
                                        <li className="flex gap-x-[0.4rem] items-center">
                                            <span className="w-[2rem] h-[1.6rem] block flex-shrink-0 bg-[var(--cl-four)] rounded"></span>
                                            <p className="text-[var(--cl-four)] text-mn">Selected</p>
                                        </li>
                                        <li className="flex gap-x-[0.4rem] items-center">
                                            <span className="w-[2rem] h-[1.6rem] block flex-shrink-0 bg-[var(--cl-seven)] rounded"></span>
                                            <p className="text-[#57595B] text-mn">Empty</p>
                                        </li>
                                    </ul>
                                    <div className="flex gap-x-[2rem]">
                                        <ul className="flex flex-col gap-y-[0.4rem] gap-x-[1.2rem] ">
                                            <li className="text-sm text-[var(--cl-four)] uppercase">
                                                EM: Economy Saver Max
                                            </li>
                                            <li className="text-sm text-[var(--cl-four)] uppercase">
                                                ES: Economy Smart
                                            </li>
                                            <li className="text-sm text-[var(--cl-four)] uppercase">
                                                EF: Economy Flex
                                            </li>
                                        </ul>
                                        <ul className="flex flex-col gap-y-[0.4rem] gap-x-[1.2rem] ">
                                            <li className="text-sm text-[var(--cl-pri)] uppercase">
                                                BS: Business Smart
                                            </li>
                                            <li className="text-sm text-[var(--cl-pri)] uppercase">
                                                BF: Business Flex
                                            </li>
                                        </ul>
                                    </div>

                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </section>
        </main>
    )
}

export default ChooseCabin