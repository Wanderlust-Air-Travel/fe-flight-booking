"use client"
import InfoTicketBox from "@/app/components/InfoTicketBox/InfoTicketBox";
import useIsActiveStore from "@/app/zustand/storeHeader";
import { SeatGroup, SeatItem } from "@/types/seat-type";
import axios from "axios";
import Image from "next/image";
import { ChangeEvent, useEffect, useState } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import useUserStore from "@/app/zustand/storeUser";

const SeatMapPage = () => {
    const { isActive } = useIsActiveStore();
    const searchParams = useSearchParams();
    const router = useRouter();
    const { accessToken } = useUserStore();

    // Bước 1: Lấy flightInstanceId từ URL params
    const flightInstanceId = searchParams.get('flightInstanceId');

    const [seatBusiness, setSeatBusiness] = useState<SeatGroup | null>(null);
    const [seatEconomy, setSeatEconomy] = useState<SeatGroup | null>(null);
    const [chooseBusiness, setChooseBusiness] = useState<string[]>([]);
    const [chooseEconomy, setChooseEconomy] = useState<string[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    // Redirect nếu không có flightInstanceId
    useEffect(() => {
        if (!flightInstanceId) {
            router.push('/booking/search');
            return;
        }
    }, [flightInstanceId, router]);

    // Bước 2: Gọi API Get Seat Map (KHÔNG CẦN truyền cabinType)
    useEffect(() => {
        if (!flightInstanceId) return;

        const fetchSeatMap = async () => {
            setLoading(true);
            setError(null);

            try {
                // ✅ Option 1 (Recommended): Không truyền cabinType
                // Backend tự động lấy cabinType từ Redis (đã save ở bước 3)
                const response = await axios.get(
                    `/api/search/seats?flightInstanceId=${flightInstanceId}`,
                    {
                        headers: {
                            'Authorization': accessToken ? `Bearer ${accessToken}` : undefined,
                        },
                    }
                );

                const seatMapData = response.data;

                // Response format: { seats: [{ id: 'economy', list: [...] }, { id: 'business', list: [...] }] }
                if (seatMapData.seats && Array.isArray(seatMapData.seats)) {
                    const business = seatMapData.seats.find(
                        (seat: SeatGroup) => seat.id === "business"
                    );
                    const economy = seatMapData.seats.find(
                        (seat: SeatGroup) => seat.id === "economy"
                    );

                    setSeatBusiness(business || null);
                    setSeatEconomy(economy || null);
                } else {
                    setError('Invalid seat map data format');
                }
            } catch (err: any) {
                console.error('Error fetching seat map:', err);
                setError(
                    err.response?.data?.message || 
                    'Failed to load seat map. Please try again.'
                );
            } finally {
                setLoading(false);
            }
        };

        fetchSeatMap();
    }, [flightInstanceId, accessToken]);

    const handleChooseBusiness = (e: ChangeEvent<HTMLInputElement>, id: string) => {
        if (e.target.checked) {
            setChooseBusiness((prev) => [...prev, id]);
        } else {
            setChooseBusiness((prev) => prev.filter((item) => item !== id));
        }
    };

    const handleChooseEconomy = (e: ChangeEvent<HTMLInputElement>, id: string) => {
        if (e.target.checked) {
            setChooseEconomy((prev) => [...prev, id]);
        } else {
            setChooseEconomy((prev) => prev.filter((item) => item !== id));
        }
    };

    if (loading) {
        return (
            <main className={`${isActive ? "pt-[calc(var(--hd)-var(--hdt))]" : "pt-[var(--hd)]"} flex flex-col gap-y-[var(--rowY)]`}>
                <div className="container flex items-center justify-center min-h-[400px]">
                    <p className="text-lg">Loading seat map...</p>
                </div>
            </main>
        );
    }

    if (error) {
        return (
            <main className={`${isActive ? "pt-[calc(var(--hd)-var(--hdt))]" : "pt-[var(--hd)]"} flex flex-col gap-y-[var(--rowY)]`}>
                <div className="container flex flex-col items-center justify-center min-h-[400px] gap-4">
                    <p className="text-lg text-red-500">{error}</p>
                    <button
                        onClick={() => router.push('/booking/search')}
                        className="px-4 py-2 bg-blue-500 text-white rounded"
                    >
                        Back to Search
                    </button>
                </div>
            </main>
        );
    }

    return (
        <main className={`${isActive ? "pt-[calc(var(--hd)-var(--hdt))]" : "pt-[var(--hd)]"} flex flex-col gap-y-[var(--rowY)]`}>
            <InfoTicketBox />

            <section className="">
                <div className="container">
                    <div className="flex flex-wrap -mx-[1.2rem]">
                        <div className="px-[1.2rem] w-[70%]">
                            <div className="pt-[calc(100%*6000/1800)] w-full relative overflow-hidden block">
                                <Image 
                                    src="/plane2.png" 
                                    alt="plane" 
                                    width={100} 
                                    height={100} 
                                    className="w-full h-full absolute inset-0 object-cover" 
                                    priority 
                                    unoptimized 
                                />

                                <div className="absolute h-[55%] w-[25%] top-[18.5%] left-1/2 z-10 -translate-x-1/2 flex flex-col gap-y-[2rem]">
                                    {/* Business Section */}
                                    <div className="w-full bg-[#F5F7FA] rounded-md">
                                        <div className="flex gap-[1rem] flex-wrap py-[0.6rem] px-[0.6rem] justify-between">
                                            <div className="w-[45%]">
                                                <div className="flex flex-wrap gap-y-[1rem] -mx-[0.15rem]">
                                                    {seatBusiness?.list
                                                        ?.filter((list: SeatItem) => list.pos === "left")
                                                        .map((seatItem: SeatItem) => {
                                                            // isSelectable = true nếu seat thuộc cabin type được request và isAvailable = true
                                                            const isSelectable = seatItem.isSelectable !== false && !seatItem.buyed;
                                                            
                                                            return (
                                                                <label
                                                                    htmlFor={seatItem.idCabin}
                                                                    key={seatItem.idCabin}
                                                                    className={`w-[calc(100%/2)] block flex-shrink-0 px-[0.15rem] ${
                                                                        isSelectable ? "cursor-pointer" : "pointer-events-none opacity-50"
                                                                    }`}
                                                                >
                                                                    <input
                                                                        name="chooseBusiness"
                                                                        onChange={(e) => handleChooseBusiness(e, seatItem.idCabin)}
                                                                        hidden
                                                                        id={seatItem.idCabin}
                                                                        type="checkbox"
                                                                        disabled={!isSelectable}
                                                                    />
                                                                    <span
                                                                        className={`rounded-[0.5rem] overflow-hidden p-[0.5rem] w-full h-[6rem] bg-[var(--cl-seven)] text-[1.2rem] font-bold flex flex-col text-center justify-center items-center uppercase hover:text-[var(--cl-white)] transition ease-linear ${
                                                                            seatBusiness.id === "business"
                                                                                ? "text-[var(--cl-pri)] hover:bg-[var(--cl-pri)]"
                                                                                : "text-[var(--cl-four)] hover:bg-[var(--cl-four)]"
                                                                        } ${
                                                                            chooseBusiness.includes(seatItem.idCabin) && "!bg-[var(--cl-pri)] !text-white"
                                                                        } ${
                                                                            seatItem.buyed && "!bg-[var(--cl-pri)] !text-white"
                                                                        } ${
                                                                            !isSelectable && "opacity-50"
                                                                        }`}
                                                                    >
                                                                        <span>{seatItem.title}</span>
                                                                        <span className="text-[1rem] font-medium">{seatItem.note}</span>
                                                                    </span>
                                                                </label>
                                                            );
                                                        })}
                                                </div>
                                            </div>

                                            <div className="w-[45%]">
                                                <div className="flex flex-wrap gap-y-[1rem] -mx-[0.15rem]">
                                                    {seatBusiness?.list
                                                        ?.filter((list: SeatItem) => list.pos === "right")
                                                        .map((seatItem: SeatItem) => {
                                                            const isSelectable = seatItem.isSelectable !== false && !seatItem.buyed;
                                                            
                                                            return (
                                                                <label
                                                                    htmlFor={seatItem.idCabin}
                                                                    key={seatItem.idCabin}
                                                                    className={`w-[calc(100%/2)] block flex-shrink-0 px-[0.15rem] ${
                                                                        isSelectable ? "cursor-pointer" : "pointer-events-none opacity-50"
                                                                    }`}
                                                                >
                                                                    <input
                                                                        name="chooseBusiness"
                                                                        onChange={(e) => handleChooseBusiness(e, seatItem.idCabin)}
                                                                        hidden
                                                                        id={seatItem.idCabin}
                                                                        type="checkbox"
                                                                        disabled={!isSelectable}
                                                                    />
                                                                    <span
                                                                        className={`rounded-[0.5rem] overflow-hidden p-[0.5rem] w-full h-[6rem] bg-[var(--cl-seven)] text-[1.2rem] font-bold flex flex-col text-center justify-center items-center uppercase hover:text-[var(--cl-white)] transition ease-linear ${
                                                                            seatBusiness.id === "business"
                                                                                ? "text-[var(--cl-pri)] hover:bg-[var(--cl-pri)]"
                                                                                : "text-[var(--cl-four)] hover:bg-[var(--cl-four)]"
                                                                        } ${
                                                                            chooseBusiness.includes(seatItem.idCabin) && "!bg-[var(--cl-pri)] !text-white"
                                                                        } ${
                                                                            seatItem.buyed && "!bg-[var(--cl-pri)] !text-white"
                                                                        } ${
                                                                            !isSelectable && "opacity-50"
                                                                        }`}
                                                                    >
                                                                        <span>{seatItem.title}</span>
                                                                        <span className="text-[1rem] font-medium">{seatItem.note}</span>
                                                                    </span>
                                                                </label>
                                                            );
                                                        })}
                                                </div>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Economy Section */}
                                    <div className="w-full bg-[#F5F7FA] rounded-md">
                                        <div className="flex gap-[1rem] flex-wrap py-[0.6rem] px-[0.6rem] justify-between">
                                            <div className="w-[45%]">
                                                <div className="flex flex-wrap gap-y-[1rem] -mx-[0.15rem]">
                                                    {seatEconomy?.list
                                                        ?.filter((list) => list.pos === "left")
                                                        .map((seatItem) => {
                                                            const isSelectable = seatItem.isSelectable !== false && !seatItem.buyed;
                                                            
                                                            return (
                                                                <label
                                                                    htmlFor={seatItem.idCabin}
                                                                    key={seatItem.idCabin}
                                                                    className={`w-[calc(100%/3)] block flex-shrink-0 px-[0.15rem] ${
                                                                        isSelectable ? "cursor-pointer" : "pointer-events-none opacity-50"
                                                                    }`}
                                                                >
                                                                    <input
                                                                        name="chooseEconomy"
                                                                        onChange={(e) => handleChooseEconomy(e, seatItem.idCabin)}
                                                                        hidden
                                                                        id={seatItem.idCabin}
                                                                        type="checkbox"
                                                                        disabled={!isSelectable}
                                                                    />
                                                                    <span
                                                                        className={`rounded-[0.5rem] overflow-hidden p-[0.5rem] w-full h-[5rem] bg-[var(--cl-seven)] text-[1.2rem] font-bold flex flex-col text-center justify-center items-center uppercase hover:text-[var(--cl-white)] transition ease-linear ${
                                                                            seatEconomy.id === "business"
                                                                                ? "text-[var(--cl-pri)] hover:bg-[var(--cl-pri)]"
                                                                                : "text-[var(--cl-four)] hover:bg-[var(--cl-four)]"
                                                                        } ${
                                                                            chooseEconomy.includes(seatItem.idCabin) && "!bg-[var(--cl-four)] !text-white"
                                                                        } ${
                                                                            seatItem.buyed && "!bg-[var(--cl-four)] !text-white"
                                                                        } ${
                                                                            !isSelectable && "opacity-50"
                                                                        }`}
                                                                    >
                                                                        <span>{seatItem.title}</span>
                                                                        <span className="text-[1rem] font-medium">{seatItem.note}</span>
                                                                    </span>
                                                                </label>
                                                            );
                                                        })}
                                                </div>
                                            </div>
                                            <div className="w-[45%]">
                                                <div className="flex flex-wrap gap-y-[1rem] -mx-[0.15rem]">
                                                    {seatEconomy?.list
                                                        ?.filter((list) => list.pos === "right")
                                                        .map((seatItem) => {
                                                            const isSelectable = seatItem.isSelectable !== false && !seatItem.buyed;
                                                            
                                                            return (
                                                                <label
                                                                    htmlFor={seatItem.idCabin}
                                                                    key={seatItem.idCabin}
                                                                    className={`w-[calc(100%/3)] block flex-shrink-0 px-[0.15rem] ${
                                                                        isSelectable ? "cursor-pointer" : "pointer-events-none opacity-50"
                                                                    }`}
                                                                >
                                                                    <input
                                                                        name="chooseEconomy"
                                                                        onChange={(e) => handleChooseEconomy(e, seatItem.idCabin)}
                                                                        hidden
                                                                        id={seatItem.idCabin}
                                                                        type="checkbox"
                                                                        disabled={!isSelectable}
                                                                    />
                                                                    <span
                                                                        className={`rounded-[0.5rem] overflow-hidden p-[0.5rem] w-full h-[5rem] bg-[var(--cl-seven)] text-[1.2rem] font-bold flex flex-col text-center justify-center items-center uppercase hover:text-[var(--cl-white)] transition ease-linear ${
                                                                            seatEconomy.id === "business"
                                                                                ? "text-[var(--cl-pri)] hover:bg-[var(--cl-pri)]"
                                                                                : "text-[var(--cl-four)] hover:bg-[var(--cl-four)]"
                                                                        } ${
                                                                            chooseEconomy.includes(seatItem.idCabin) && "!bg-[var(--cl-four)] !text-white"
                                                                        } ${
                                                                            seatItem.buyed && "!bg-[var(--cl-four)] !text-white"
                                                                        } ${
                                                                            !isSelectable && "opacity-50"
                                                                        }`}
                                                                    >
                                                                        <span>{seatItem.title}</span>
                                                                        <span className="text-[1rem] font-medium">{seatItem.note}</span>
                                                                    </span>
                                                                </label>
                                                            );
                                                        })}
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                        <div className="px-[1.2rem] w-[100%] flex-1">
                            <div className={`sticky ${isActive ? "top-[calc(var(--hd)-var(--hdt)+1rem)]" : "top-[calc(var(--hd)+1rem)]"} flex flex-col border-[var(--cl-third)] border-[0.1rem] rounded-[1rem] p-[1.6rem] gap-y-[2rem]`}>
                                <h2 className="text-center text-md text-[var(--cl-pri)] font-bold">
                                    Choose Position
                                </h2>

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
                                        <li className="flex gap-x-[0.4rem] items-center">
                                            <span className="w-[2rem] h-[1.6rem] block flex-shrink-0 bg-gray-400 rounded opacity-50"></span>
                                            <p className="text-gray-500 text-mn">Not Selectable</p>
                                        </li>
                                    </ul>
                                    <div className="flex gap-x-[2rem]">
                                        <ul className="flex flex-col gap-y-[0.4rem] gap-x-[1.2rem]">
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
                                        <ul className="flex flex-col gap-y-[0.4rem] gap-x-[1.2rem]">
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
    );
};

export default SeatMapPage;

