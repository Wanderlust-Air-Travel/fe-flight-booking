"use client";

import { useState, useEffect, useCallback, useMemo, useRef } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { AlertCircle } from "lucide-react";
import Breadcrumb from "@/app/components/Breadcrumb/Breadcrumb";
import axiosInstance, { axiosPublic } from "@/lib/axios-instance";
import Image from "next/image";
import CabinSection from "@/app/components/SeatMap/CabinSection";
import SectionNavigation from "@/app/components/SeatMap/SectionNavigation";
import { divideRowsIntoSections, groupSeatsByRow } from "@/app/utils/seat-utils";
import { SeatGroup, SeatItem } from "@/types/seat-type";
import FormatPrice from "@/app/components/FormatPrice/FormatPrice";

const CheckInSeatSelectionPage = () => {
    const searchParams = useSearchParams();
    const router = useRouter();
    const bookingCode = searchParams.get("bookingCode");
    
    const [bookingData, setBookingData] = useState<any>(null);
    const [seatBusiness, setSeatBusiness] = useState<SeatGroup | null>(null);
    const [seatEconomy, setSeatEconomy] = useState<SeatGroup | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [submitError, setSubmitError] = useState<string | null>(null);
    
    // Seat selection state - grouped by flight instance
    const [selectedSeatsByFlight, setSelectedSeatsByFlight] = useState<Map<string, Array<{ flightSeatId: string; seatNumber: string }>>>(new Map());
    
    const hasFetchedBookingRef = useRef<boolean>(false);
    const hasFetchedSeatsRef = useRef<Map<string, boolean>>(new Map());

    // Helper function to find seat by seatId
    const findSeatBySeatId = useCallback((seatId: string, seatGroups: SeatGroup[]): SeatItem | null => {
        for (const group of seatGroups) {
            const seat = group.list?.find(seat => 
                seat.flightSeatId === seatId || 
                `${seat.seatNumber}-left` === seatId || 
                `${seat.seatNumber}-right` === seatId
            );
            if (seat) return seat;
        }
        return null;
    }, []);

    // Fetch booking data
    useEffect(() => {
        if (!bookingCode || hasFetchedBookingRef.current) return;
        
        hasFetchedBookingRef.current = true;
        setLoading(true);
        setError(null);

        axiosPublic
            .get(`/api/bookings/code/${bookingCode}`)
            .then((res) => {
                if (res.status === 200 && res.data) {
                    setBookingData(res.data);
                    
                    // Validate booking status
                    if (res.data.status !== 'paid' && res.data.status !== 'confirmed') {
                        setError(`Đặt chỗ này có trạng thái "${res.data.status}". Chỉ có thể làm thủ tục cho đặt chỗ đã thanh toán hoặc đã xác nhận.`);
                        setLoading(false);
                        return;
                    }

                    // Check if already checked in
                    // (We'll check this when submitting, but we can show a warning if tickets exist)
                } else {
                    setError("Không tìm thấy đặt chỗ với mã này.");
                }
            })
            .catch((err) => {
                console.error("Error fetching booking:", err);
                const errorMessage = err.response?.data?.message || 
                                    err.message || 
                                    "Không tìm thấy đặt chỗ với mã này.";
                setError(errorMessage);
            })
            .finally(() => {
                setLoading(false);
            });
    }, [bookingCode]);

    // Fetch seat maps for each flight instance
    useEffect(() => {
        if (!bookingData?.segments || bookingData.segments.length === 0) return;

        const fetchSeatMaps = async () => {
            const flightInstanceIds = [...new Set(bookingData.segments.map((seg: any) => seg.flightInstanceId))];
            
            for (const flightInstanceId of flightInstanceIds) {
                const flightId = String(flightInstanceId);
                if (hasFetchedSeatsRef.current.get(flightId)) continue;
                
                hasFetchedSeatsRef.current.set(flightId, true);
                
                // Get cabin type from first segment of this flight
                const segment = bookingData.segments.find((seg: any) => seg.flightInstanceId === flightInstanceId);
                const cabinType = segment?.cabinType || 'economy';

                try {
                    const res = await axiosPublic.get("/api/search/seats", {
                        params: { flightInstanceId, cabinType },
                    });

                    if (res.data?.seats && Array.isArray(res.data.seats)) {
                        const business = res.data.seats.find((seat: SeatGroup) => seat.id === "business");
                        const economy = res.data.seats.find((seat: SeatGroup) => seat.id === "economy");

                        // Only set if not already set (for multiple flights, we might want to merge)
                        if (!seatBusiness && business) setSeatBusiness(business);
                        if (!seatEconomy && economy) setSeatEconomy(economy);
                    }
                } catch (err) {
                    console.error(`Error fetching seat map for flight ${flightInstanceId}:`, err);
                }
            }
        };

        fetchSeatMaps();
    }, [bookingData, seatBusiness, seatEconomy]);

    // Group segments by flight instance
    const segmentsByFlight = useMemo(() => {
        if (!bookingData?.segments) return new Map();
        
        const map = new Map<string, any[]>();
        for (const segment of bookingData.segments) {
            const flightInstanceId = segment.flightInstanceId;
            if (!map.has(flightInstanceId)) {
                map.set(flightInstanceId, []);
            }
            map.get(flightInstanceId)!.push(segment);
        }
        return map;
    }, [bookingData]);

    // Calculate passengers needing seats per flight (excluding infants)
    const passengersNeedingSeatsByFlight = useMemo(() => {
        const map = new Map<string, number>();
        for (const [flightInstanceId, segments] of segmentsByFlight.entries()) {
            const count = segments.filter((seg: any) => seg.passengerType !== 'INF').length;
            map.set(flightInstanceId, count);
        }
        return map;
    }, [segmentsByFlight]);

    // Handle seat toggle for a specific flight instance
    const handleSeatToggle = useCallback((flightInstanceId: string, cabinType: "business" | "economy") => {
        return (seatId: string, checked: boolean) => {
            const seatGroups = [seatBusiness, seatEconomy].filter(Boolean) as SeatGroup[];
            const seat = findSeatBySeatId(seatId, seatGroups);
            
            if (!seat) return;

            setSelectedSeatsByFlight((prev) => {
                const newMap = new Map(prev);
                const currentSeats = newMap.get(flightInstanceId) || [];
                const passengersNeedingSeats = passengersNeedingSeatsByFlight.get(flightInstanceId) || 0;

                if (checked) {
                    // Check if seat already selected
                    if (currentSeats.some(s => s.flightSeatId === seat.flightSeatId)) {
                        return prev;
                    }

                    // Check if we've reached the limit
                    if (currentSeats.length >= passengersNeedingSeats) {
                        setSubmitError(`Bạn chỉ có thể chọn ${passengersNeedingSeats} ghế cho ${passengersNeedingSeats} hành khách (trừ trẻ sơ sinh).`);
                        return prev;
                    }

                    newMap.set(flightInstanceId, [
                        ...currentSeats,
                        { flightSeatId: seat.flightSeatId, seatNumber: seat.seatNumber },
                    ]);
                } else {
                    newMap.set(
                        flightInstanceId,
                        currentSeats.filter(s => s.flightSeatId !== seat.flightSeatId)
                    );
                }

                setSubmitError(null);
                return newMap;
            });
        };
    }, [seatBusiness, seatEconomy, findSeatBySeatId, passengersNeedingSeatsByFlight]);

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

    // Navigation handler
    const handleSectionNavigate = useCallback((sectionId: string) => {
        const element = document.getElementById(sectionId);
        if (element) {
            element.scrollIntoView({ behavior: "smooth", block: "start" });
        }
    }, []);

    // Handle check-in submission
    const handleCheckIn = useCallback(async () => {
        if (!bookingCode || !bookingData) return;

        // Validate all flights have seats selected
        for (const [flightInstanceId, segments] of segmentsByFlight.entries()) {
            const selectedSeats = selectedSeatsByFlight.get(flightInstanceId) || [];
            const passengersNeedingSeats = passengersNeedingSeatsByFlight.get(flightInstanceId) || 0;

            if (selectedSeats.length !== passengersNeedingSeats) {
                setSubmitError(
                    `Vui lòng chọn đủ ${passengersNeedingSeats} ghế cho chuyến bay ${segments[0]?.flightNumber || flightInstanceId}`
                );
                return;
            }
        }

        setIsSubmitting(true);
        setSubmitError(null);

        try {
            // Prepare segments for check-in
            const checkInSegments = Array.from(segmentsByFlight.entries()).map(([flightInstanceId, segments]) => ({
                flightInstanceId,
                seats: selectedSeatsByFlight.get(flightInstanceId) || [],
            }));

            const response = await axiosPublic.post("/api/bookings/check-in", {
                bookingCode,
                segments: checkInSegments,
            });

            if (response.status === 200 || response.status === 201) {
                // Navigate to confirmation page
                router.push(`/check-in/confirmation?bookingCode=${encodeURIComponent(bookingCode)}&ticketCount=${response.data.ticketCount || 0}`);
            } else {
                setSubmitError(response.data?.message || "Làm thủ tục thất bại. Vui lòng thử lại.");
            }
        } catch (err: any) {
            console.error("Error checking in:", err);
            const errorMessage = err.response?.data?.message || 
                                err.message || 
                                "Làm thủ tục thất bại. Vui lòng thử lại.";
            setSubmitError(errorMessage);
        } finally {
            setIsSubmitting(false);
        }
    }, [bookingCode, bookingData, segmentsByFlight, selectedSeatsByFlight, passengersNeedingSeatsByFlight, router]);

    // Get cabin type from booking (use first segment's cabin type)
    const cabinType = bookingData?.segments?.[0]?.cabinType || 'economy';
    const selectedSeatsForCurrentFlight = Array.from(selectedSeatsByFlight.values()).flat();

    if (loading) {
        return (
            <main className="flex flex-col pt-[var(--hd)] gap-y-[var(--rowY)]">
                <Breadcrumb />
                <div className="container flex items-center justify-center min-h-[400px]">
                    <p className="text-lg">Đang tải thông tin đặt chỗ...</p>
                </div>
            </main>
        );
    }

    if (error) {
        return (
            <main className="flex flex-col pt-[var(--hd)] gap-y-[var(--rowY)]">
                <Breadcrumb />
                <div className="container">
                    <div className="max-w-md mx-auto py-8 md:py-12 lg:py-16">
                        <Alert variant="destructive">
                            <AlertCircle className="h-4 w-4" />
                            <AlertDescription>{error}</AlertDescription>
                        </Alert>
                        <Button
                            onClick={() => router.push("/check-in")}
                            className="mt-4 w-full"
                        >
                            Quay lại
                        </Button>
                    </div>
                </div>
            </main>
        );
    }

    if (!bookingData) {
        return null;
    }

    return (
        <main className="flex flex-col pt-[var(--hd)] gap-y-[var(--rowY)]">
            <Breadcrumb />
            
            {/* Booking Info Summary */}
            <div className="container">
                <div className="bg-white rounded-lg shadow-md p-4 mb-6">
                    <h2 className="text-lg font-bold mb-2">Thông tin đặt chỗ</h2>
                    <div className="grid grid-cols-2 gap-4 text-sm">
                        <div>
                            <span className="text-gray-600">Mã đặt chỗ:</span>
                            <span className="ml-2 font-mono font-bold">{bookingData.pnrCode}</span>
                        </div>
                        <div>
                            <span className="text-gray-600">Trạng thái:</span>
                            <span className="ml-2 capitalize">{bookingData.status}</span>
                        </div>
                        <div>
                            <span className="text-gray-600">Số hành khách:</span>
                            <span className="ml-2">{bookingData.passengers?.length || 0}</span>
                        </div>
                        <div>
                            <span className="text-gray-600">Tổng tiền:</span>
                            <span className="ml-2">
                                {FormatPrice(Number(bookingData.totalAmount) || 0)}
                            </span>
                        </div>
                    </div>
                </div>
            </div>

            {/* Seat Map */}
            <section className="">
                <div className="container">
                    <div className="flex flex-wrap -mx-[1.2rem]">
                        <div className="px-[1.2rem] w-[70%]">
                            <div className="pt-[calc(100%*6000/2000)] w-full relative overflow-hidden block">
                                <Image 
                                    src="/plane.png" 
                                    alt="plane" 
                                    width={100} 
                                    height={100} 
                                    className="w-full h-full absolute inset-0 object-cover" 
                                    priority 
                                    unoptimized 
                                />

                                <div className="absolute h-[55%] w-[24%] top-[16%] left-1/2 z-10 -translate-x-1/2 flex flex-col gap-y-[2rem] overflow-y-auto max-h-full">
                                    {/* Business Section */}
                                    {seatBusiness && (
                                        <CabinSection
                                            seatGroup={seatBusiness}
                                            cabinType="business"
                                            selectedSeats={selectedSeatsForCurrentFlight.map(s => s.seatNumber)}
                                            onSeatToggle={handleSeatToggle(bookingData.segments[0]?.flightInstanceId || '', "business")}
                                            isSelectable={cabinType === "business"}
                                        />
                                    )}

                                    {/* Economy Section */}
                                    {seatEconomy && (
                                        <CabinSection
                                            seatGroup={seatEconomy}
                                            cabinType="economy"
                                            selectedSeats={selectedSeatsForCurrentFlight.map(s => s.seatNumber)}
                                            onSeatToggle={handleSeatToggle(bookingData.segments[0]?.flightInstanceId || '', "economy")}
                                            isSelectable={cabinType === "economy"}
                                        />
                                    )}
                                </div>
                            </div>
                        </div>
                        
                        <div className="px-[1.2rem] w-[100%] flex-1">
                            <div className="sticky top-[calc(var(--hd)+1rem)] flex flex-col border-[var(--cl-third)] border-[0.1rem] rounded-[1rem] p-[1.6rem] gap-y-[2rem]">
                                <h2 className="text-center text-md text-[var(--cl-pri)] font-bold">
                                    Chọn ghế ngồi
                                </h2>

                                {/* Section Navigation */}
                                {cabinType === "business" && businessSections.length > 0 && (
                                    <SectionNavigation
                                        sections={businessSections}
                                        onNavigate={handleSectionNavigate}
                                        cabinType="business"
                                    />
                                )}
                                {cabinType === "economy" && economySections.length > 0 && (
                                    <SectionNavigation
                                        sections={economySections}
                                        onNavigate={handleSectionNavigate}
                                        cabinType="economy"
                                    />
                                )}

                                {/* Selected Seats Info */}
                                <div className="space-y-2">
                                    <p className="text-sm font-medium">Ghế đã chọn:</p>
                                    {selectedSeatsForCurrentFlight.length === 0 ? (
                                        <p className="text-sm text-gray-500">Chưa chọn ghế nào</p>
                                    ) : (
                                        <div className="flex flex-wrap gap-2">
                                            {selectedSeatsForCurrentFlight.map((seat, idx) => (
                                                <span key={idx} className="px-2 py-1 bg-blue-100 text-blue-800 rounded text-sm">
                                                    {seat.seatNumber}
                                                </span>
                                            ))}
                                        </div>
                                    )}
                                    <p className="text-xs text-gray-500">
                                        Cần chọn {Array.from(passengersNeedingSeatsByFlight.values()).reduce((a, b) => a + b, 0)} ghế cho {bookingData.passengers?.filter((p: any) => p.passengerType !== 'INF').length || 0} hành khách
                                    </p>
                                </div>

                                {submitError && (
                                    <Alert variant="destructive">
                                        <AlertCircle className="h-4 w-4" />
                                        <AlertDescription>{submitError}</AlertDescription>
                                    </Alert>
                                )}

                                <Button
                                    onClick={handleCheckIn}
                                    disabled={isSubmitting || selectedSeatsForCurrentFlight.length < Array.from(passengersNeedingSeatsByFlight.values()).reduce((a, b) => a + b, 0)}
                                    className="w-full"
                                >
                                    {isSubmitting ? "Đang xử lý..." : "Hoàn tất làm thủ tục"}
                                </Button>
                            </div>
                        </div>
                    </div>
                </div>
            </section>
        </main>
    );
};

export default CheckInSeatSelectionPage;

