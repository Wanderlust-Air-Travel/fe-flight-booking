"use client";
import axios from "axios";
import Image from "next/image";
import { useEffect, useState } from "react";
import MainNavigationTabs from "../MainNavigationTabs/MainNavigationTabs";
import { BannerApi } from "@/types/banner";
import FlightSearchBar from "../FlightSearchBar/FlightSearchBar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { AlertCircle, Search } from "lucide-react";
import { axiosPublic } from "@/lib/axios-instance";
import { showError, showLoading, dismissToast, showSuccess } from "@/lib/toast";
import { useRouter } from "next/navigation";

type MainTab = "book-ticket" | "check-in" | "my-bookings";
type CheckInTab = "booking-code" | "ticket-number" | "membership";
type MyBookingsTab = "booking-code-ticket" | "membership";

const BannerHome = () => {
    const [data, setData] = useState<BannerApi | null>(null);
    const [activeMainTab, setActiveMainTab] = useState<MainTab>("book-ticket");
    const [activeCheckInTab, setActiveCheckInTab] = useState<CheckInTab>("booking-code");
    const [activeMyBookingsTab, setActiveMyBookingsTab] = useState<MyBookingsTab>("booking-code-ticket");
    
    // Check-in form states
    const [bookingCode, setBookingCode] = useState("");
    const [ticketNumber, setTicketNumber] = useState("");
    const [membershipNumber, setMembershipNumber] = useState("");
    const [lastName, setLastName] = useState("");
    const [checkInError, setCheckInError] = useState<string | null>(null);
    const [isCheckInLoading, setIsCheckInLoading] = useState(false);
    
    // My bookings form states
    const [myBookingCode, setMyBookingCode] = useState("");
    const [myBookingError, setMyBookingError] = useState<string | null>(null);
    const [isMyBookingLoading, setIsMyBookingLoading] = useState(false);
    
    const router = useRouter();


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

    const handleCheckInSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        
        if (!bookingCode.trim()) {
            setCheckInError("Vui lòng nhập mã đặt chỗ (PNR code)");
            return;
        }

        setIsCheckInLoading(true);
        setCheckInError(null);

        try {
            const response = await axiosPublic.get(`/api/bookings/code/${bookingCode.trim()}`);
            
            if (response.status === 200 && response.data) {
                router.push(`/check-in/seat-selection?bookingCode=${encodeURIComponent(bookingCode.trim())}`);
            } else {
                setCheckInError("Không tìm thấy đặt chỗ với mã này. Vui lòng kiểm tra lại.");
            }
        } catch (err: any) {
            console.error("Error fetching booking:", err);
            const errorMessage = err.response?.data?.message || 
                                err.message || 
                                "Không tìm thấy đặt chỗ với mã này. Vui lòng kiểm tra lại.";
            setCheckInError(errorMessage);
        } finally {
            setIsCheckInLoading(false);
        }
    };

    const handleMyBookingsSearch = async () => {
        if (!myBookingCode.trim()) {
            setMyBookingError("Vui lòng nhập mã đặt chỗ (PNR code)");
            return;
        }

        setIsMyBookingLoading(true);
        setMyBookingError(null);
        const loadingToastId = showLoading("Đang tìm kiếm đặt chỗ...");

        try {
            const response = await axiosPublic.get(`/api/bookings/code/${myBookingCode.trim()}`);
            
            if (response.data) {
                dismissToast(loadingToastId);
                showSuccess("Đã tìm thấy đặt chỗ. Đang chuyển hướng...");
                router.push(`/my-bookings?bookingCode=${encodeURIComponent(myBookingCode.trim())}`);
            }
        } catch (err: any) {
            dismissToast(loadingToastId);
            const errorMessage = err.response?.data?.message || 
                            "Không tìm thấy đặt chỗ với mã này. Vui lòng kiểm tra lại.";
            setMyBookingError(errorMessage);
            showError(errorMessage);
        } finally {
            setIsMyBookingLoading(false);
        }
    };

    const renderFormContent = () => {
        switch (activeMainTab) {
            case "book-ticket":
                return (
                    <div className="p-4 md:p-6">
                        <FlightSearchBar />
                    </div>
                );
            
            case "check-in":
                return (
                    <div className="w-full p-4 md:p-6 rounded-b-lg">
                        <div className="flex items-center gap-0 border-b-2 border-[var(--cl-pri)]/20 mb-6">
                            <button
                                type="button"
                                onClick={() => setActiveCheckInTab("booking-code")}
                                className={`flex-1 relative px-4 py-4 text-base md:text-lg font-semibold transition-all duration-300 flex items-center justify-center ${
                                    activeCheckInTab === "booking-code"
                                        ? "text-[var(--cl-pri)] bg-white"
                                        : "text-gray-600 bg-[var(--cl-pri)]/5 hover:text-[var(--cl-pri)] hover:bg-[var(--cl-pri)]/10"
                                }`}
                            >
                                {activeCheckInTab === "booking-code" && (
                                    <div className="absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r from-[var(--cl-pri)] via-[var(--cl-third)] to-[var(--cl-four)]" />
                                )}
                                <span className="relative z-10">Mã Đặt Chỗ</span>
                            </button>
                            <button
                                type="button"
                                onClick={() => setActiveCheckInTab("ticket-number")}
                                className={`flex-1 relative px-4 py-4 text-base md:text-lg font-semibold transition-all duration-300 flex items-center justify-center ${
                                    activeCheckInTab === "ticket-number"
                                        ? "text-[var(--cl-pri)] bg-white"
                                        : "text-gray-600 bg-[var(--cl-pri)]/5 hover:text-[var(--cl-pri)] hover:bg-[var(--cl-pri)]/10"
                                }`}
                            >
                                {activeCheckInTab === "ticket-number" && (
                                    <div className="absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r from-[var(--cl-pri)] via-[var(--cl-third)] to-[var(--cl-four)]" />
                                )}
                                <span className="relative z-10">Số Vé</span>
                            </button>
                            <button
                                type="button"
                                onClick={() => setActiveCheckInTab("membership")}
                                className={`flex-1 relative px-4 py-4 text-base md:text-lg font-semibold transition-all duration-300 flex items-center justify-center ${
                                    activeCheckInTab === "membership"
                                        ? "text-[var(--cl-pri)] bg-white"
                                        : "text-gray-600 bg-[var(--cl-pri)]/5 hover:text-[var(--cl-pri)] hover:bg-[var(--cl-pri)]/10"
                                }`}
                            >
                                {activeCheckInTab === "membership" && (
                                    <div className="absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r from-[var(--cl-pri)] via-[var(--cl-third)] to-[var(--cl-four)]" />
                                )}
                                <span className="relative z-10">Số Hội Viên</span>
                            </button>
                        </div>

                        {activeCheckInTab === "booking-code" && (
                            <form onSubmit={handleCheckInSubmit} className="bg-white rounded-lg p-8 md:p-10">
                                <div className="max-w-md mx-auto space-y-8">
                                    {/* Header Section */}
                                    <div className="text-center space-y-4">
                                        <div className="inline-flex items-center justify-center w-20 h-20 rounded-2xl bg-gradient-to-br from-[var(--cl-pri)]/10 via-[var(--cl-third)]/10 to-[var(--cl-four)]/10 mb-2 shadow-sm">
                                            <svg className="w-10 h-10 text-[var(--cl-pri)]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                                            </svg>
                                        </div>
                                        <div>
                                            <h3 className="text-2xl md:text-3xl font-bold text-[var(--cl-pri)] mb-2">
                                                Mã Đặt Chỗ
                                            </h3>
                                            <p className="text-sm md:text-base text-gray-500">
                                                Nhập mã đặt chỗ 6 ký tự để làm thủ tục
                                            </p>
                                        </div>
                                    </div>

                                    {/* Input Section */}
                                    <div className="space-y-4">
                                        <div className="relative">
                                            <Input
                                                id="bookingCode"
                                                type="text"
                                                placeholder="Ví dụ: ABC123"
                                                value={bookingCode}
                                                onChange={(e) => {
                                                    setBookingCode(e.target.value.toUpperCase());
                                                    setCheckInError(null);
                                                }}
                                                className="text-center text-2xl md:text-3xl font-mono tracking-[0.2em] border-2 border-gray-200 focus:border-[var(--cl-pri)] focus:ring-4 focus:ring-[var(--cl-pri)]/10 h-16 md:h-20 transition-all duration-200 rounded-xl"
                                                maxLength={10}
                                                disabled={isCheckInLoading}
                                                autoFocus
                                            />
                                            <div className="absolute inset-0 pointer-events-none rounded-xl border-2 border-transparent bg-gradient-to-r from-[var(--cl-pri)]/0 via-[var(--cl-pri)]/5 to-[var(--cl-pri)]/0 opacity-0 transition-opacity duration-200 focus-within:opacity-100" />
                                        </div>
                                        <p className="text-xs text-center text-gray-400">
                                            Vui lòng nhập đúng mã đặt chỗ như trên email xác nhận
                                        </p>
                                    </div>

                                    {/* Error Message */}
                                    {checkInError && (
                                        <Alert variant="destructive" className="border-red-200 bg-red-50/50 rounded-lg">
                                            <AlertCircle className="h-4 w-4" />
                                            <AlertDescription className="text-sm">{checkInError}</AlertDescription>
                                        </Alert>
                                    )}

                                    {/* Submit Button */}
                                    <Button
                                        type="submit"
                                        className="w-full bg-gradient-to-r from-[var(--cl-pri)] via-[var(--cl-third)] to-[var(--cl-four)] hover:from-[var(--cl-four)] hover:via-[var(--cl-third)] hover:to-[var(--cl-pri)] text-white font-bold py-6 md:py-7 text-lg md:text-xl rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:shadow-lg"
                                        disabled={isCheckInLoading || !bookingCode.trim()}
                                    >
                                        {isCheckInLoading ? (
                                            <span className="flex items-center justify-center gap-2">
                                                <svg className="animate-spin h-5 w-5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                                </svg>
                                                Đang kiểm tra...
                                            </span>
                                        ) : (
                                            "Làm Thủ Tục"
                                        )}
                                    </Button>
                                </div>
                            </form>
                        )}

                        {activeCheckInTab === "ticket-number" && (
                            <div className="bg-gradient-to-br from-white to-blue-50/30 rounded-lg border-2 border-[var(--cl-pri)]/20 shadow-lg p-6 md:p-8">
                                <div className="space-y-6">
                                    <div className="text-center mb-4">
                                        <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-gray-100 mb-3">
                                            <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 5v2m0 4v2m0 4v2m5-8h2m-2 4h2m-2 4h2M5 5v2m0 4v2m0 4v2M3 9h2m-2 4h2m-2 4h2m5-13h8a1 1 0 011 1v14a1 1 0 01-1 1h-8M5 5H3a1 1 0 00-1 1v14a1 1 0 001 1h2" />
                                            </svg>
                                        </div>
                                        <Label className="text-lg font-semibold text-gray-600">
                                            Số Vé
                                        </Label>
                                        <p className="text-sm text-gray-500 mt-1">Tính năng đang được phát triển</p>
                                    </div>
                                    <div className="space-y-2">
                                        <Label htmlFor="ticketNumber" className="text-sm font-medium text-gray-700">Số Vé</Label>
                                        <Input
                                            id="ticketNumber"
                                            type="text"
                                            placeholder="123XXXXXXXXXXX"
                                            value={ticketNumber}
                                            onChange={(e) => setTicketNumber(e.target.value)}
                                            disabled={true}
                                            className="border-2 border-gray-200 bg-gray-50 cursor-not-allowed"
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <Label htmlFor="lastName" className="text-sm font-medium text-gray-700">Họ</Label>
                                        <Input
                                            id="lastName"
                                            type="text"
                                            placeholder="NGUYEN"
                                            value={lastName}
                                            onChange={(e) => setLastName(e.target.value.toUpperCase())}
                                            disabled={true}
                                            className="border-2 border-gray-200 bg-gray-50 cursor-not-allowed uppercase"
                                        />
                                    </div>
                                    <Button
                                        disabled={true}
                                        className="w-full bg-gray-300 text-gray-500 cursor-not-allowed py-6"
                                    >
                                        Tính năng đang được phát triển
                                    </Button>
                                </div>
                            </div>
                        )}

                        {activeCheckInTab === "membership" && (
                            <div className="bg-gradient-to-br from-white to-blue-50/30 rounded-lg border-2 border-[var(--cl-pri)]/20 shadow-lg p-6 md:p-8">
                                <div className="space-y-6">
                                    <div className="text-center mb-4">
                                        <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-gray-100 mb-3">
                                            <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                                            </svg>
                                        </div>
                                        <Label className="text-lg font-semibold text-gray-600">
                                            Số Hội Viên
                                        </Label>
                                        <p className="text-sm text-gray-500 mt-1">Tính năng đang được phát triển</p>
                                    </div>
                                    <div className="space-y-2">
                                        <Label htmlFor="membershipNumber" className="text-sm font-medium text-gray-700">Số Hội Viên</Label>
                                        <Input
                                            id="membershipNumber"
                                            type="text"
                                            placeholder="Nhập số hội viên"
                                            value={membershipNumber}
                                            onChange={(e) => setMembershipNumber(e.target.value)}
                                            disabled={true}
                                            className="border-2 border-gray-200 bg-gray-50 cursor-not-allowed"
                                        />
                                    </div>
                                    <Button
                                        disabled={true}
                                        className="w-full bg-gray-300 text-gray-500 cursor-not-allowed py-6"
                                    >
                                        Tính năng đang được phát triển
                                    </Button>
                                </div>
                            </div>
                        )}
                    </div>
                );
            
            case "my-bookings":
                return (
                    <div className="w-full p-4 md:p-6 rounded-b-lg">
                        <div className="flex items-center gap-0 border-b-2 border-[var(--cl-pri)]/20 mb-6">
                            <button
                                type="button"
                                onClick={() => setActiveMyBookingsTab("booking-code-ticket")}
                                className={`flex-1 relative px-4 py-4 text-base md:text-lg font-semibold transition-all duration-300 flex items-center justify-center ${
                                    activeMyBookingsTab === "booking-code-ticket"
                                        ? "text-[var(--cl-pri)] bg-white"
                                        : "text-gray-600 bg-[var(--cl-pri)]/5 hover:text-[var(--cl-pri)] hover:bg-[var(--cl-pri)]/10"
                                }`}
                            >
                                {activeMyBookingsTab === "booking-code-ticket" && (
                                    <div className="absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r from-[var(--cl-pri)] via-[var(--cl-third)] to-[var(--cl-four)]" />
                                )}
                                <span className="relative z-10">Mã Đặt Chỗ/Số Vé</span>
                            </button>
                            <button
                                type="button"
                                onClick={() => setActiveMyBookingsTab("membership")}
                                className={`flex-1 relative px-4 py-4 text-base md:text-lg font-semibold transition-all duration-300 flex items-center justify-center ${
                                    activeMyBookingsTab === "membership"
                                        ? "text-[var(--cl-pri)] bg-white"
                                        : "text-gray-600 bg-[var(--cl-pri)]/5 hover:text-[var(--cl-pri)] hover:bg-[var(--cl-pri)]/10"
                                }`}
                            >
                                {activeMyBookingsTab === "membership" && (
                                    <div className="absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r from-[var(--cl-pri)] via-[var(--cl-third)] to-[var(--cl-four)]" />
                                )}
                                <span className="relative z-10">Hội Viên Bamboo Club</span>
                            </button>
                        </div>

                        {activeMyBookingsTab === "booking-code-ticket" && (
                            <div className="bg-gradient-to-br from-white to-blue-50/30 rounded-lg border-2 border-[var(--cl-pri)]/20 shadow-lg p-6 md:p-8">
                                <div className="space-y-6">
                                    <div className="text-center mb-4">
                                        <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-[var(--cl-pri)]/10 mb-3">
                                            <svg className="w-8 h-8 text-[var(--cl-pri)]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                                            </svg>
                                        </div>
                                        <Label htmlFor="myBookingCode" className="text-lg font-semibold text-[var(--cl-pri)]">
                                            Mã Đặt Chỗ (PNR Code)
                                        </Label>
                                        <p className="text-sm text-gray-600 mt-1">Nhập mã đặt chỗ 6 ký tự để tra cứu</p>
                                    </div>
                                    <div>
                                        <Input
                                            id="myBookingCode"
                                            type="text"
                                            placeholder="Ví dụ: ABC123"
                                            value={myBookingCode}
                                            onChange={(e) => {
                                                setMyBookingCode(e.target.value.toUpperCase());
                                                setMyBookingError(null);
                                            }}
                                            className="text-center text-xl font-mono tracking-widest border-2 border-[var(--cl-pri)]/30 focus:border-[var(--cl-pri)] focus:ring-2 focus:ring-[var(--cl-pri)]/20 h-14 transition-all"
                                            maxLength={10}
                                            disabled={isMyBookingLoading}
                                            onKeyDown={(e) => {
                                                if (e.key === "Enter") {
                                                    handleMyBookingsSearch();
                                                }
                                            }}
                                        />
                                    </div>
                                    {myBookingError && (
                                        <Alert variant="destructive" className="border-red-300 bg-red-50">
                                            <AlertCircle className="h-4 w-4" />
                                            <AlertDescription>{myBookingError}</AlertDescription>
                                        </Alert>
                                    )}
                                    <Button
                                        onClick={handleMyBookingsSearch}
                                        disabled={isMyBookingLoading || !myBookingCode.trim()}
                                        className="w-full bg-gradient-to-r from-[var(--cl-pri)] to-[var(--cl-third)] hover:from-[var(--cl-four)] hover:to-[var(--cl-five)] text-white font-semibold py-6 text-lg shadow-md hover:shadow-lg transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
                                    >
                                        {isMyBookingLoading ? (
                                            <span className="flex items-center justify-center gap-2">
                                                <svg className="animate-spin h-5 w-5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                                </svg>
                                                Đang tìm kiếm...
                                            </span>
                                        ) : (
                                            <span className="flex items-center justify-center gap-2">
                                                <Search className="w-5 h-5" />
                                                Tìm Kiếm
                                            </span>
                                        )}
                                    </Button>
                                </div>
                            </div>
                        )}

                        {activeMyBookingsTab === "membership" && (
                            <div className="bg-gradient-to-br from-white to-blue-50/30 rounded-lg border-2 border-[var(--cl-pri)]/20 shadow-lg p-6 md:p-8">
                                <div className="space-y-6">
                                    <div className="text-center mb-4">
                                        <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-[var(--cl-pri)]/10 mb-3">
                                            <svg className="w-8 h-8 text-[var(--cl-pri)]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                                            </svg>
                                        </div>
                                        <Label className="text-lg font-semibold text-[var(--cl-pri)]">
                                            Hội Viên Bamboo Club
                                        </Label>
                                        <p className="text-sm text-gray-600 mt-1">Đăng nhập vào Bamboo Club để xem chuyến bay sắp tới của bạn</p>
                                    </div>
                                    <Button
                                        className="w-full bg-gradient-to-r from-[var(--cl-four)] to-[var(--cl-five)] hover:from-[var(--cl-five)] hover:to-[var(--cl-four)] text-white font-semibold py-6 text-lg shadow-md hover:shadow-lg transition-all duration-300"
                                    >
                                        Login
                                    </Button>
                                </div>
                            </div>
                        )}
                    </div>
                );
        }
    };

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
                        data && (
                            <h1 
                                className="text-center text-white text-[8rem] uppercase font-medium" 
                                data-aos="fade-up"
                                suppressHydrationWarning
                            >
                                {data.title}
                            </h1>
                        )
                    }
                    <div 
                        className="w-full z-10 relative"
                        data-aos="fade-up" 
                        data-aos-delay="500"
                        suppressHydrationWarning
                    >
                        <div className="bg-white rounded-lg shadow-lg">
                            <MainNavigationTabs activeTab={activeMainTab} onTabChange={setActiveMainTab} />
                            <div className="w-full relative">
                                {renderFormContent()}
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )

}

export default BannerHome