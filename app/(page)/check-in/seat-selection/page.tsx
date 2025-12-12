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
import useUserStore from "@/app/zustand/storeUser";

const CheckInSeatSelectionPage = () => {
    const { accessToken } = useUserStore();
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
    // CRITICAL: Ensure flightInstanceId is always string for consistent Map key matching
    const segmentsByFlight = useMemo(() => {
        if (!bookingData?.segments) return new Map();
        
        const map = new Map<string, any[]>();
        for (const segment of bookingData.segments) {
            // CRITICAL: Convert to string to ensure consistent key matching with selectedSeatsByFlight
            const flightInstanceId = String(segment.flightInstanceId);
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
        return async (seatId: string, checked: boolean) => {
            const seatGroups = [seatBusiness, seatEconomy].filter(Boolean) as SeatGroup[];
            const seat = findSeatBySeatId(seatId, seatGroups);
            
            if (!seat) {
                console.warn(`[handleSeatToggle] Seat not found for seatId: ${seatId}`);
                return;
            }

            // CRITICAL: Ensure we have flightSeatId
            if (!seat.flightSeatId) {
                console.error(`[handleSeatToggle] Seat ${seat.seatNumber} has no flightSeatId. Cannot proceed.`);
                setSubmitError(`Ghế ${seat.seatNumber} không có thông tin hợp lệ. Vui lòng thử lại.`);
                return;
            }

            // Update local state first
            // CRITICAL: Ensure flightInstanceId is string for consistent Map key matching
            const flightInstanceIdStr = String(flightInstanceId);
            
            setSelectedSeatsByFlight((prev) => {
                const newMap = new Map(prev);
                const currentSeats = newMap.get(flightInstanceIdStr) || [];
                const passengersNeedingSeats = passengersNeedingSeatsByFlight.get(flightInstanceIdStr) || 0;

                if (checked) {
                    // Check if seat already selected (by flightSeatId)
                    if (currentSeats.some(s => s.flightSeatId === seat.flightSeatId)) {
                        console.log(`[handleSeatToggle] Seat ${seat.seatNumber} (${seat.flightSeatId}) already selected`);
                        return prev;
                    }

                    // Check if we've reached the limit
                    if (currentSeats.length >= passengersNeedingSeats) {
                        setSubmitError(`Bạn chỉ có thể chọn ${passengersNeedingSeats} ghế cho ${passengersNeedingSeats} hành khách (trừ trẻ sơ sinh).`);
                        return prev;
                    }

                    const newSeats = [
                        ...currentSeats,
                        { flightSeatId: seat.flightSeatId, seatNumber: seat.seatNumber },
                    ];
                    newMap.set(flightInstanceIdStr, newSeats);
                    console.log(`[handleSeatToggle] Selected seat ${seat.seatNumber} (${seat.flightSeatId}) for flight ${flightInstanceIdStr}. Total: ${newSeats.length}`);
                    
                    // NOTE: In check-in flow, we don't save to booking-state immediately
                    // Seats are only saved to DB when user clicks "Hoàn tất làm thủ tục" (check-in API)
                    // This allows users to freely select/deselect seats without backend calls
                    
                    return newMap;
                } else {
                    // Deselect: Remove seat from selection
                    const filteredSeats = currentSeats.filter(s => s.flightSeatId !== seat.flightSeatId);
                    newMap.set(flightInstanceIdStr, filteredSeats);
                    console.log(`[handleSeatToggle] Deselected seat ${seat.seatNumber} (${seat.flightSeatId}) for flight ${flightInstanceIdStr}. Remaining: ${filteredSeats.length}`);
                    
                    // NOTE: In check-in flow, we don't save to booking-state immediately
                    // Seats are only saved to DB when user clicks "Hoàn tất làm thủ tục" (check-in API)
                    // This allows users to freely select/deselect seats without backend calls
                    
                    return newMap;
                }
            });

            setSubmitError(null);
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

    // Manage which flight instance is currently being displayed
    const [currentDisplayFlightId, setCurrentDisplayFlightId] = useState<string | null>(null);
    
    // Set initial flight on load
    useEffect(() => {
        if (currentDisplayFlightId === null && segmentsByFlight.size > 0) {
            const firstFlightId = Array.from(segmentsByFlight.keys())[0];
            setCurrentDisplayFlightId(String(firstFlightId));
        }
    }, [segmentsByFlight, currentDisplayFlightId]);

    // Handle check-in submission
    const handleCheckIn = useCallback(async () => {
        console.log('[handleCheckIn] START - Check-in submission initiated', {
            bookingCode,
            hasBookingData: !!bookingData,
            segmentsByFlightSize: segmentsByFlight.size,
            selectedSeatsByFlightSize: selectedSeatsByFlight.size,
            selectedSeatsByFlightEntries: Array.from(selectedSeatsByFlight.entries()).map(([k, v]) => ({ flightId: k, seatsCount: v.length })),
        });

        if (!bookingCode || !bookingData) {
            console.error('[handleCheckIn] Missing bookingCode or bookingData');
            setSubmitError('Thiếu thông tin đặt chỗ. Vui lòng quay lại và thử lại.');
            return;
        }

        // Validate all flights have seats selected
        // CRITICAL: Ensure flightInstanceId is string for Map lookup
        for (const [flightInstanceId, segments] of segmentsByFlight.entries()) {
            const flightInstanceIdStr = String(flightInstanceId);
            const selectedSeats = selectedSeatsByFlight.get(flightInstanceIdStr) || [];
            const passengersNeedingSeats = passengersNeedingSeatsByFlight.get(flightInstanceIdStr) || 0;

            console.log(`[handleCheckIn] Validating seats for flight ${flightInstanceIdStr}:`, {
                selectedSeatsCount: selectedSeats.length,
                passengersNeedingSeats,
                selectedSeats: selectedSeats.map(s => ({ flightSeatId: s.flightSeatId, seatNumber: s.seatNumber })),
                allKeysInSelectedSeats: Array.from(selectedSeatsByFlight.keys()),
            });

            if (selectedSeats.length !== passengersNeedingSeats) {
                const errorMsg = `Vui lòng chọn đủ ${passengersNeedingSeats} ghế cho chuyến bay ${segments[0]?.flightNumber || flightInstanceIdStr}`;
                console.error('[handleCheckIn] Validation failed:', errorMsg);
                setSubmitError(errorMsg);
                return;
            }
        }

        setIsSubmitting(true);
        setSubmitError(null);

        // Prepare segments for check-in (declare outside try block for error handling)
        let checkInSegments: Array<{ flightInstanceId: string; seats: Array<{ flightSeatId: string; seatNumber: string }> }> = [];

        try {
            // Prepare segments for check-in
            // CRITICAL: Ensure flightInstanceId is string and seats have correct format
            checkInSegments = Array.from(segmentsByFlight.entries()).map(([flightInstanceId, segments]) => {
                // CRITICAL: Ensure flightInstanceId is string for Map lookup
                const flightInstanceIdStr = String(flightInstanceId);
                const seats = selectedSeatsByFlight.get(flightInstanceIdStr) || [];
                
                console.log(`[handleCheckIn] Preparing check-in for flight ${flightInstanceIdStr}:`, {
                    flightInstanceId: flightInstanceIdStr,
                    seatsCount: seats.length,
                    seats: seats.map(s => ({ flightSeatId: s.flightSeatId, seatNumber: s.seatNumber })),
                    passengersNeedingSeats: passengersNeedingSeatsByFlight.get(flightInstanceIdStr),
                    // Debug: Check all keys in selectedSeatsByFlight
                    allSelectedSeatsKeys: Array.from(selectedSeatsByFlight.keys()),
                });
                
                // Validate seats format
                const validSeats = seats.filter(s => s.flightSeatId && s.seatNumber);
                if (validSeats.length !== seats.length) {
                    console.warn(`[handleCheckIn] Some seats have invalid format. Valid: ${validSeats.length}, Total: ${seats.length}`);
                }
                
                if (validSeats.length === 0) {
                    console.error(`[handleCheckIn] No valid seats found for flight ${flightInstanceIdStr}. This should not happen after validation.`);
                }
                
                return {
                    flightInstanceId: flightInstanceIdStr, // Ensure string
                    seats: validSeats,
                };
            });

            // Final validation: Ensure all segments have seats
            const segmentsWithoutSeats = checkInSegments.filter(seg => seg.seats.length === 0);
            if (segmentsWithoutSeats.length > 0) {
                console.error(`[handleCheckIn] Some segments have no seats:`, segmentsWithoutSeats);
                setSubmitError("Có lỗi xảy ra khi chuẩn bị dữ liệu ghế ngồi. Vui lòng thử lại.");
                setIsSubmitting(false);
                return;
            }

            console.log(`[handleCheckIn] Sending check-in request:`, {
                bookingCode,
                segments: checkInSegments,
                totalSegments: checkInSegments.length,
                totalSeats: checkInSegments.reduce((sum, seg) => sum + seg.seats.length, 0),
                // Detailed segment info
                segmentsDetail: checkInSegments.map(seg => ({
                    flightInstanceId: seg.flightInstanceId,
                    seatsCount: seg.seats.length,
                    seats: seg.seats,
                })),
            });

            // CRITICAL: Verify seats are present before sending
            const totalSeats = checkInSegments.reduce((sum, seg) => sum + seg.seats.length, 0);
            if (totalSeats === 0) {
                console.error(`[handleCheckIn] No seats to send! This should not happen.`);
                setSubmitError("Không có ghế ngồi nào được chọn. Vui lòng chọn ghế trước khi hoàn tất làm thủ tục.");
                setIsSubmitting(false);
                return;
            }

            // **LOG BEFORE API CALL** - CRITICAL FOR DEBUGGING
            console.log(`[handleCheckIn] Making API call to /api/bookings/check-in with payload:`, {
                bookingCode,
                segments: checkInSegments,
            });

            const response = await axiosPublic.post("/api/bookings/check-in", {
                bookingCode,
                segments: checkInSegments,
            });

            console.log(`[handleCheckIn] Check-in response:`, {
                status: response.status,
                data: response.data,
            });

            if (response.status === 200 || response.status === 201) {
                // Check if booking was already checked in (idempotent operation)
                if (response.data?.alreadyCheckedIn) {
                    // Booking was already checked in, redirect to confirmation with appropriate message
                    console.log('[handleCheckIn] Booking was already checked in, redirecting to confirmation');
                    router.push(`/check-in/confirmation?bookingCode=${encodeURIComponent(bookingCode)}&ticketCount=${response.data.ticketCount || 0}&alreadyCheckedIn=true`);
                } else {
                    // New check-in completed successfully
                    console.log('[handleCheckIn] Check-in completed successfully, redirecting to confirmation');
                    router.push(`/check-in/confirmation?bookingCode=${encodeURIComponent(bookingCode)}&ticketCount=${response.data.ticketCount || 0}`);
                }
            } else {
                const errorMsg = response.data?.message || "Làm thủ tục thất bại. Vui lòng thử lại.";
                console.error('[handleCheckIn] Unexpected response status:', response.status, errorMsg);
                setSubmitError(errorMsg);
            }
        } catch (err: any) {
            console.error("[handleCheckIn] Error checking in:", {
                error: err,
                message: err.response?.data?.message || err.message || "",
                status: err.response?.status,
                data: err.response?.data,
                // Log request data for debugging
                requestData: {
                    bookingCode,
                    segments: checkInSegments,
                },
            });
            
            // Check if error is about already checked in (for backward compatibility)
            const errorMessage = err.response?.data?.message || err.message || "";
            if (errorMessage.includes("already been checked in") || errorMessage.includes("Tickets have already been issued")) {
                // If booking was already checked in, try to get ticket count from booking data
                // and redirect to confirmation page
                const ticketCount = bookingData?.tickets?.length || bookingData?.passengers?.filter((p: any) => p.passengerType !== 'INF').length || 0;
                console.log('[handleCheckIn] Booking already checked in (from error), redirecting to confirmation');
                router.push(`/check-in/confirmation?bookingCode=${encodeURIComponent(bookingCode)}&ticketCount=${ticketCount}&alreadyCheckedIn=true`);
                return;
            }
            
            setSubmitError(errorMessage || "Làm thủ tục thất bại. Vui lòng thử lại.");
        } finally {
            setIsSubmitting(false);
            console.log('[handleCheckIn] DONE - isSubmitting reset to false');
        }
    }, [bookingCode, bookingData, segmentsByFlight, selectedSeatsByFlight, passengersNeedingSeatsByFlight, router]);

    // Get cabin type from booking (use first segment's cabin type)
    const cabinType = bookingData?.segments?.[0]?.cabinType || 'economy';
    // Get selected seats for current flight (first flight in booking)
    // CRITICAL: Get seats for the current flight instance
    // Use segmentsByFlight to ensure consistent flightInstanceId format
    const firstFlightInstanceId = Array.from(segmentsByFlight.keys())[0];
    const currentFlightInstanceId = firstFlightInstanceId ? String(firstFlightInstanceId) : String(bookingData?.segments?.[0]?.flightInstanceId || '');
    const selectedSeatsForCurrentFlight = currentFlightInstanceId 
        ? (selectedSeatsByFlight.get(currentFlightInstanceId) || [])
        : Array.from(selectedSeatsByFlight.values()).flat();

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
                    {/* Flight Selection Tabs */}
                    {segmentsByFlight.size > 1 && (
                        <div className="mb-6 flex gap-2 flex-wrap">
                            {Array.from(segmentsByFlight.entries()).map(([flightId, segments]) => {
                                const flightStr = String(flightId);
                                const segment = segments[0];
                                return (
                                    <Button
                                        key={flightStr}
                                        onClick={() => setCurrentDisplayFlightId(flightStr)}
                                        variant={currentDisplayFlightId === flightStr ? "default" : "outline"}
                                        className={currentDisplayFlightId === flightStr ? "bg-[var(--cl-pri)]" : ""}
                                    >
                                        {segment?.flightNumber || `Flight ${flightStr.substring(0, 8)}`}
                                    </Button>
                                );
                            })}
                        </div>
                    )}
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
                                    {seatBusiness && (() => {
                                        // Use currentDisplayFlightId to determine which flight's seats to show
                                        const flightInstanceIdStr = currentDisplayFlightId || String(Array.from(segmentsByFlight.keys())[0] || '');
                                        const currentCabinType = bookingData?.segments?.find((s: any) => String(s.flightInstanceId) === flightInstanceIdStr)?.cabinType || 'economy';
                                        const currentSelectedSeats = selectedSeatsByFlight.get(flightInstanceIdStr) || [];
                                        
                                        return (
                                            <CabinSection
                                                seatGroup={seatBusiness}
                                                cabinType="business"
                                                selectedSeats={currentSelectedSeats.map(s => s.seatNumber)}
                                                onSeatToggle={handleSeatToggle(flightInstanceIdStr, "business")}
                                                isSelectable={currentCabinType === "business"}
                                            />
                                        );
                                    })()}

                                    {/* Economy Section */}
                                    {seatEconomy && (() => {
                                        // Use currentDisplayFlightId to determine which flight's seats to show
                                        const flightInstanceIdStr = currentDisplayFlightId || String(Array.from(segmentsByFlight.keys())[0] || '');
                                        const currentCabinType = bookingData?.segments?.find((s: any) => String(s.flightInstanceId) === flightInstanceIdStr)?.cabinType || 'economy';
                                        const currentSelectedSeats = selectedSeatsByFlight.get(flightInstanceIdStr) || [];
                                        
                                        return (
                                            <CabinSection
                                                seatGroup={seatEconomy}
                                                cabinType="economy"
                                                selectedSeats={currentSelectedSeats.map(s => s.seatNumber)}
                                                onSeatToggle={handleSeatToggle(flightInstanceIdStr, "economy")}
                                                isSelectable={cabinType === "economy"}
                                            />
                                        );
                                    })()}
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

                                {/* Selected Seats Info - Show all flights if multi-segment */}
                                <div className="space-y-3">
                                    <p className="text-sm font-medium">Ghế đã chọn:</p>
                                    
                                    {Array.from(segmentsByFlight.entries()).length === 1 ? (
                                        // Single flight
                                        <>
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
                                        </>
                                    ) : (
                                        // Multiple flights
                                        Array.from(segmentsByFlight.entries()).map(([flightId, segments]) => {
                                            const flightStr = String(flightId);
                                            const selectedSeats = selectedSeatsByFlight.get(flightStr) || [];
                                            const passengersNeeded = passengersNeedingSeatsByFlight.get(flightStr) || 0;
                                            return (
                                                <div key={flightStr} className="border-t pt-2">
                                                    <p className="text-xs font-medium text-gray-700">{segments[0]?.flightNumber || `Flight ${flightStr.substring(0, 8)}`}</p>
                                                    {selectedSeats.length === 0 ? (
                                                        <p className="text-xs text-gray-500">Chưa chọn ghế</p>
                                                    ) : (
                                                        <div className="flex flex-wrap gap-1 mt-1">
                                                            {selectedSeats.map((seat, idx) => (
                                                                <span key={idx} className="px-1 py-0.5 bg-blue-100 text-blue-800 rounded text-xs">
                                                                    {seat.seatNumber}
                                                                </span>
                                                            ))}
                                                        </div>
                                                    )}
                                                    <p className="text-xs text-gray-500 mt-1">
                                                        {selectedSeats.length}/{passengersNeeded}
                                                    </p>
                                                </div>
                                            );
                                        })
                                    )}
                                </div>

                                {submitError && (
                                    <Alert variant="destructive">
                                        <AlertCircle className="h-4 w-4" />
                                        <AlertDescription>{submitError}</AlertDescription>
                                    </Alert>
                                )}

                                <Button
                                    onClick={handleCheckIn}
                                    disabled={isSubmitting || (() => {
                                        // Check if all flights have sufficient seats selected
                                        for (const [flightId, passengersNeeded] of passengersNeedingSeatsByFlight.entries()) {
                                            const selectedSeats = selectedSeatsByFlight.get(flightId) || [];
                                            if (selectedSeats.length < passengersNeeded) {
                                                return true; // Button disabled - not enough seats for this flight
                                            }
                                        }
                                        return false; // Button enabled - all flights have enough seats
                                    })()}
                                    className="w-full bg-[var(--cl-pri)] text-white hover:bg-[var(--cl-pri)]/90 disabled:opacity-50 disabled:cursor-not-allowed py-5 md:py-6 text-base md:text-lg font-semibold rounded-lg transition-all duration-200 shadow-md hover:shadow-lg"
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

