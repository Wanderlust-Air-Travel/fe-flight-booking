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

    const { data, isHydrated } = useInfoTicket();
    const { accessToken } = useUserStore();

    // Lấy flightInstanceId và cabinType từ query params (theo docs BE)
    const flightInstanceId = searchParams.get('flightInstanceId');
    const cabinTypeFromUrl = searchParams.get('cabinType');

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

    // Bước 2: Gọi API Get Seat Map
    useEffect(() => {
        // Prevent multiple fetches - only fetch once on mount
        if (hasFetchedRef.current) {
            return;
        }

        if (!flightInstanceId) {
            return;
        }

        const fetchSeatMap = async () => {
            hasFetchedRef.current = true;
            setLoading(true);
            setError(null);

            const axiosClient = accessToken ? axiosInstance : axiosPublic;
            const params: any = { flightInstanceId };
            
            // Priority 1: Get cabinType from URL query params
            if (cabinTypeFromUrl) {
                params.cabinType = cabinTypeFromUrl;
            }
            // Priority 2: Get cabinType from Zustand store (info ticket) - wait for hydration
            else if (isHydrated && data.type) {
                params.cabinType = data.type;
            }
            // Priority 3: For authenticated users, try to get from booking state API
            else if (accessToken) {
                try {
                    const bookingStateResponse = await axiosInstance.get(
                        `/api/booking-state/${flightInstanceId}`
                    );
                    if (bookingStateResponse.data?.cabin?.cabinType) {
                        params.cabinType = bookingStateResponse.data.cabin.cabinType;
                    }
                } catch (bookingStateError) {
                    console.warn('Could not get cabinType from booking state:', bookingStateError);
                    // Continue without cabinType - backend will try to get from booking state
                }
            }
            // Priority 4: For guest users, try to get from booking state API with session ID
            else {
                const sessionId = sessionStorage.getItem('guest_session_id');
                if (sessionId) {
                    try {
                        const headers: Record<string, string> = {
                            'X-Session-Id': sessionId
                        };
                        const bookingStateResponse = await axiosPublic.get(
                            `/api/booking-state/${flightInstanceId}`,
                            { headers }
                        );
                        if (bookingStateResponse.data?.cabin?.cabinType) {
                            params.cabinType = bookingStateResponse.data.cabin.cabinType;
                        }
                    } catch (bookingStateError) {
                        console.warn('Could not get cabinType from booking state:', bookingStateError);
                        // Continue without cabinType - backend will try to get from booking state
                    }
                }
            }

            // If still no cabinType, show error and redirect
            if (!params.cabinType) {
                setError(
                    'Cabin type is required. Please select a cabin type first or go back to cabin selection.'
                );
                setLoading(false);
                hasFetchedRef.current = false;
                return;
            }

            try {
                const res = await axiosClient.get("/api/search/seats", { params });
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
                    hasFetchedRef.current = false;
                }
            } catch (err: any) {
                console.error('Error fetching seat map:', err);
                console.error('Error details:', err.response?.data || err.message);
                setError(
                    err.response?.data?.message || 
                    err.message || 
                    'Failed to load seat map. Please try again.'
                );
                // Reset ref on error so user can retry
                hasFetchedRef.current = false;
            } finally {
                setLoading(false);
            }
        };

        // Wait for Zustand store to hydrate before fetching (if no cabinType from URL)
        if (!isHydrated && !cabinTypeFromUrl) {
            // Wait a bit for hydration, then fetch
            const timer = setTimeout(() => {
                fetchSeatMap();
            }, 100);
            return () => clearTimeout(timer);
        }

        // If hydrated or cabinType from URL, fetch immediately
        fetchSeatMap();
    }, [flightInstanceId, accessToken, data.type, isHydrated, cabinTypeFromUrl, searchParams])

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
            
            // BEST PRACTICE: Always send X-Session-Id if available, regardless of accessToken
            // This ensures backend can fallback to guest session if JWT token is invalid/expired
            // Session ID should have been saved when cabin selection was made in TripList component
            const sessionId = sessionStorage.getItem('guest_session_id');
            
            if (!accessToken) {
                // For guest users, sessionId is REQUIRED
                if (!sessionId) {
                    setSaveError('Session ID not found. Please select a cabin type first, then try again.');
                    setIsSaving(false);
                    // Redirect to search flights after showing error
                    setTimeout(() => {
                        router.push('/search/flights');
                    }, 3000);
                    return;
                }
                
                // Add X-Session-Id header for guest users (REQUIRED by backend)
                headers['X-Session-Id'] = sessionId;
            } else if (sessionId) {
                // For authenticated users, also send X-Session-Id as fallback
                // This handles cases where JWT token might be expired/invalid
                // Backend will prioritize userId from JWT, but can fallback to sessionId if needed
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
                                            <div className="bg-red-50 border border-red-200 rounded-lg p-3">
                                                <p className="text-sm text-red-600 font-medium">{saveError}</p>
                                                {!accessToken && !sessionStorage.getItem('guest_session_id') && (
                                                    <p className="text-xs text-red-500 mt-1">
                                                        Vui lòng chọn hạng vé (cabin) trước khi chọn ghế ngồi.
                                                    </p>
                                                )}
                                            </div>
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
