"use client"
import Breadcrumb from "@/app/components/Breadcrumb/Breadcrumb";
import InfoTicketBox from "@/app/components/InfoTicketBox/InfoTicketBox";
import useInfoTicket from "@/app/zustand/storeInfoTicket";
import { SeatGroup, SeatItem } from "@/types/seat-type";
import axiosInstance, { axiosPublic } from "@/lib/axios-instance";
import Image from "next/image";
import { useSearchParams, useRouter } from "next/navigation";
import { useCallback, useEffect, useMemo, useState, useRef } from "react";
import CabinSection from "@/app/components/SeatMap/CabinSection";
import SectionNavigation from "@/app/components/SeatMap/SectionNavigation";
import { divideRowsIntoSections, groupSeatsByRow } from "@/app/utils/seat-utils";
import useUserStore from "@/app/zustand/storeUser";
import { Button } from "@/components/ui/button";

const SeatMapPage = () => {
    const [seatBusiness, setSeatBusiness] = useState<SeatGroup | null>(null)
    const [seatEconomy, setSeatEconomy] = useState<SeatGroup | null>(null)

    const [chooseBusiness, setChooseBusiness] = useState<string[]>([]);
    const [chooseEconomy, setChooseEconomy] = useState<string[]>([]);
    const [selectedSeatInfo, setSelectedSeatInfo] = useState<{ flightSeatId: string; seatNumber: string } | null>(null);
    const [isSaving, setIsSaving] = useState(false);
    const [saveError, setSaveError] = useState<string | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    
    const searchParams = useSearchParams();
    const router = useRouter();
    const hasFetchedRef = useRef<boolean>(false);

    const { data } = useInfoTicket();
    const { accessToken } = useUserStore();

    // Lấy flightInstanceId từ query params (theo docs BE)
    const flightInstanceId = searchParams.get('flightInstanceId');

    // Redirect nếu không có flightInstanceId
    useEffect(() => {
        if (!flightInstanceId) {
            router.push('/search/flights');
            return;
        }
    }, [flightInstanceId, router]);

    // Helper function to find seat by seatId (which can be flightSeatId or generated ID)
    const findSeatBySeatId = useCallback((seatId: string): SeatItem | null => {
        const allSeats = [
            ...(seatBusiness?.list || []),
            ...(seatEconomy?.list || [])
        ];
        // Try to find by flightSeatId first, then by generated ID pattern
        return allSeats.find(seat => 
            seat.flightSeatId === seatId || 
            `${seat.seatNumber}-left` === seatId || 
            `${seat.seatNumber}-right` === seatId
        ) || null;
    }, [seatBusiness, seatEconomy]);

    // Optimized seat toggle handlers with useCallback
    const handleSeatToggle = useCallback(
        (cabinType: "business" | "economy") => (seatId: string, checked: boolean) => {
            // Find the actual seat to get flightSeatId and seatNumber
            const seat = findSeatBySeatId(seatId);
            
            if (checked && seat) {
                // Store the actual seat info
                setSelectedSeatInfo({
                    flightSeatId: seat.flightSeatId,
                    seatNumber: seat.seatNumber,
                });
            } else {
                setSelectedSeatInfo(null);
            }

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
        [findSeatBySeatId]
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

    // Bước 2: Gọi API Get Seat Map (KHÔNG CẦN truyền cabinType - backend tự lấy từ Redis)
    useEffect(() => {
        // Prevent multiple fetches - only fetch once on mount
        if (hasFetchedRef.current) {
            return;
        }

        if (!flightInstanceId) {
            return;
        }

        hasFetchedRef.current = true;
        setLoading(true);
        setError(null);

        // For authenticated users, use axiosInstance (with token)
        // For guest users, use axiosPublic (without token)
        // Backend will auto-fetch cabinType from booking state if authenticated
        // For guest users, we need to pass cabinType explicitly or get from booking state
        const axiosClient = accessToken ? axiosInstance : axiosPublic;
        const params: any = { flightInstanceId };
        
        // For guest users, we can get cabinType from booking state API
        // But for simplicity, we'll get it from the info ticket store (which has the cabin type)
        if (!accessToken && data.type) {
            params.cabinType = data.type;
        }

        axiosClient
            .get("/api/search/seats", {
                params,
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
                    setError('Invalid seat map data format');
                }
            })
            .catch((err) => {
                console.error('Error fetching seat map:', err);
                console.error('Error details:', err.response?.data || err.message);
                setError(
                    err.response?.data?.message || 
                    err.message || 
                    'Failed to load seat map. Please try again.'
                );
                // Reset ref on error so user can retry
                hasFetchedRef.current = false;
            })
            .finally(() => {
                setLoading(false);
            });

    }, [flightInstanceId, accessToken])

    // Handle save seat selection and continue
    const handleContinue = useCallback(async () => {
        // Get selected seat based on cabin type
        const selectedSeats = data.type === "business" ? chooseBusiness : chooseEconomy;
        
        if (selectedSeats.length === 0 || !selectedSeatInfo) {
            setSaveError('Please select a seat');
            return;
        }

        setIsSaving(true);
        setSaveError(null);

        try {
            // Always save to backend Redis (both authenticated and guest users)
            const headers: Record<string, string> = {};
            
            // For guest users, get session ID from sessionStorage
            if (!accessToken) {
                const sessionId = sessionStorage.getItem('guest_session_id');
                if (!sessionId) {
                    setSaveError('Session ID not found. Please start over from cabin selection.');
                    return;
                }
                headers['X-Session-Id'] = sessionId;
            }

            const axiosClient = accessToken ? axiosInstance : axiosPublic;
            const response = await axiosClient.post(
                '/api/booking-state/seat',
                {
                    flightInstanceId,
                    flightSeatId: selectedSeatInfo.flightSeatId,
                    seatNumber: selectedSeatInfo.seatNumber,
                },
                {
                    headers
                }
            );

            if (response.status === 200 || response.status === 201) {
                console.log('Seat selection saved to backend:', response.data);
                
                // For guest users, update sessionId if returned
                if (!accessToken && response.data.sessionId) {
                    sessionStorage.setItem('guest_session_id', response.data.sessionId);
                }
            } else {
                setSaveError(response.data?.message || 'Failed to save seat selection');
                return;
            }

            // Navigate to booking information page
            router.push(`/booking/info?flightInstanceId=${flightInstanceId}`);
        } catch (error: any) {
            console.error('Error saving seat selection:', error);
            setSaveError(
                error.response?.data?.message || 
                error.message || 
                'Failed to save seat selection'
            );
        } finally {
            setIsSaving(false);
        }
    }, [data.type, chooseBusiness, chooseEconomy, selectedSeatInfo, flightInstanceId, router, accessToken]);

    if (loading) {
        return (
            <main className={`flex flex-col pt-[var(--hd)] gap-y-[var(--rowY)]`}>
                <div className="container flex items-center justify-center min-h-[400px]">
                    <p className="text-lg">Loading seat map...</p>
                </div>
            </main>
        );
    }

    if (error) {
        return (
            <main className={`flex flex-col pt-[var(--hd)] gap-y-[var(--rowY)]`}>
                <div className="container flex flex-col items-center justify-center min-h-[400px] gap-4">
                    <p className="text-lg text-red-500">{error}</p>
                    <Button
                        onClick={() => router.push('/search/flights')}
                    >
                        Back to Search
                    </Button>
                </div>
            </main>
        );
    }

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
                                        <li className="flex gap-x-[0.4rem] items-center">
                                            <span className="w-[2rem] h-[1.6rem] block flex-shrink-0 bg-gray-400 rounded opacity-50"></span>
                                            <p className="text-gray-500 text-mn">Not Selectable</p>
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

                                    {/* Continue Button */}
                                    <div className="flex flex-col gap-y-[1rem]">
                                        {saveError && (
                                            <p className="text-sm text-red-500">{saveError}</p>
                                        )}
                                        <Button
                                            onClick={handleContinue}
                                            disabled={isSaving || (data.type === "business" ? chooseBusiness.length === 0 : chooseEconomy.length === 0)}
                                            className="w-full"
                                        >
                                            {isSaving ? 'Saving...' : 'Continue'}
                                        </Button>
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

export default SeatMapPage;
