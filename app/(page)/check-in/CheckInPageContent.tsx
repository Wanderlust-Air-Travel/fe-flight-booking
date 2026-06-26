"use client";

import { useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { AlertCircle } from "lucide-react";
import Breadcrumb from "@/app/components/Breadcrumb/Breadcrumb";
import MainNavigationTabs from "@/app/components/MainNavigationTabs/MainNavigationTabs";
import axiosInstance, { axiosPublic } from "@/lib/axios-instance";

const CheckInPageContent = () => {
    const searchParams = useSearchParams();
    const router = useRouter();
    const [bookingCode, setBookingCode] = useState(searchParams.get("bookingCode") || "");
    const [ticketNumber, setTicketNumber] = useState("");
    const [membershipNumber, setMembershipNumber] = useState("");
    const [lastName, setLastName] = useState("");
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [activeTab, setActiveTab] = useState<"booking-code" | "ticket-number" | "membership">("booking-code");
    const [activeMainTab, setActiveMainTab] = useState<"book-ticket" | "check-in" | "my-bookings">("check-in");

    const handleMainTabChange = (tab: "book-ticket" | "check-in" | "my-bookings") => {
        setActiveMainTab(tab);
        if (tab === "book-ticket") {
            router.push("/");
        } else if (tab === "my-bookings") {
            router.push("/my-bookings");
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!bookingCode.trim()) {
            setError("Vui lòng nhập mã đặt chỗ (PNR code)");
            return;
        }

        setIsLoading(true);
        setError(null);

        try {
            const response = await axiosPublic.get(`/api/bookings/code/${bookingCode.trim()}`);

            if (response.status === 200 && response.data) {
                router.push(`/check-in/seat-selection?bookingCode=${encodeURIComponent(bookingCode.trim())}`);
            } else {
                setError("Không tìm thấy đặt chỗ với mã này. Vui lòng kiểm tra lại.");
            }
        } catch (err: any) {
            console.error("Error fetching booking:", err);
            const errorMessage =
                err.response?.data?.message || err.message || "Không tìm thấy đặt chỗ với mã này.";
            setError(errorMessage);
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <main className="flex flex-col pt-[var(--hd)] gap-y-[var(--rowY)] min-h-screen bg-gray-50">
            <MainNavigationTabs activeTab={activeMainTab} onTabChange={handleMainTabChange} />
            <Breadcrumb />
            <div className="container">
                <div className="max-w-2xl mx-auto py-8 md:py-12 lg:py-16">
                    <div className="bg-white rounded-lg shadow-md p-6 md:p-8">
                        <h1 className="text-2xl md:text-3xl font-bold text-center mb-2">
                            Làm thủ tục (Check-in)
                        </h1>
                        <p className="text-sm md:text-base text-gray-600 text-center mb-6">
                            Làm thủ tục trực tuyến trong khoảng 24 giờ đến 1 giờ trước khi chuyến bay khởi hành
                        </p>

                        <div className="flex items-center gap-1 border-b-2 border-[var(--cl-pri)]/10 bg-gradient-to-r from-white to-blue-50/20 rounded-t-lg overflow-hidden shadow-sm mb-6">
                            <button
                                type="button"
                                onClick={() => setActiveTab("booking-code")}
                                className={`relative px-6 py-3 text-base font-semibold transition-all duration-300 flex items-center justify-center ${
                                    activeTab === "booking-code"
                                        ? "text-[var(--cl-pri)] bg-gradient-to-b from-[var(--cl-pri)]/10 to-transparent shadow-sm"
                                        : "text-gray-600 hover:text-[var(--cl-pri)] hover:bg-[var(--cl-pri)]/5"
                                }`}
                            >
                                {activeTab === "booking-code" && (
                                    <div className="absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r from-[var(--cl-pri)] to-[var(--cl-third)] rounded-t-full" />
                                )}
                                <span className="relative z-10">Mã Đặt Chỗ</span>
                            </button>
                            <button
                                type="button"
                                onClick={() => setActiveTab("ticket-number")}
                                className={`relative px-6 py-3 text-base font-semibold transition-all duration-300 flex items-center justify-center ${
                                    activeTab === "ticket-number"
                                        ? "text-[var(--cl-pri)] bg-gradient-to-b from-[var(--cl-pri)]/10 to-transparent shadow-sm"
                                        : "text-gray-600 hover:text-[var(--cl-pri)] hover:bg-[var(--cl-pri)]/5"
                                }`}
                            >
                                {activeTab === "ticket-number" && (
                                    <div className="absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r from-[var(--cl-pri)] to-[var(--cl-third)] rounded-t-full" />
                                )}
                                <span className="relative z-10">Số Vé</span>
                            </button>
                            <button
                                type="button"
                                onClick={() => setActiveTab("membership")}
                                className={`relative px-6 py-3 text-base font-semibold transition-all duration-300 flex items-center justify-center ${
                                    activeTab === "membership"
                                        ? "text-[var(--cl-pri)] bg-gradient-to-b from-[var(--cl-pri)]/10 to-transparent shadow-sm"
                                        : "text-gray-600 hover:text-[var(--cl-pri)] hover:bg-[var(--cl-pri)]/5"
                                }`}
                            >
                                {activeTab === "membership" && (
                                    <div className="absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r from-[var(--cl-pri)] to-[var(--cl-third)] rounded-t-full" />
                                )}
                                <span className="relative z-10">Số Hội Viên</span>
                            </button>
                        </div>

                        {activeTab === "booking-code" && (
                            <form onSubmit={handleSubmit} className="space-y-6">
                                <div className="text-center mb-4">
                                    <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-[var(--cl-pri)]/10 mb-3">
                                        <svg className="w-8 h-8 text-[var(--cl-pri)]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                                        </svg>
                                    </div>
                                    <Label htmlFor="bookingCode" className="text-lg font-semibold text-[var(--cl-pri)]">
                                        Mã Đặt Chỗ (PNR Code)
                                    </Label>
                                    <p className="text-sm text-gray-600 mt-1">Nhập mã đặt chỗ 6 ký tự để làm thủ tục</p>
                                </div>
                                <div className="space-y-2">
                                    <Input
                                        id="bookingCode"
                                        type="text"
                                        placeholder="Ví dụ: ABC123"
                                        value={bookingCode}
                                        onChange={(e) => {
                                            setBookingCode(e.target.value.toUpperCase());
                                            setError(null);
                                        }}
                                        className="text-center text-xl font-mono tracking-widest border-2 border-[var(--cl-pri)]/30 focus:border-[var(--cl-pri)] focus:ring-2 focus:ring-[var(--cl-pri)]/20 h-14 transition-all"
                                        maxLength={10}
                                        disabled={isLoading}
                                        autoFocus
                                    />
                                    <p className="text-sm text-[var(--cl-pri)] text-center mt-2">
                                        Vui lòng nhập đúng mã đặt chỗ như trên email xác nhận
                                    </p>
                                </div>

                                {error && (
                                    <Alert variant="destructive" className="border-red-300 bg-red-50">
                                        <AlertCircle className="h-4 w-4" />
                                        <AlertDescription>{error}</AlertDescription>
                                    </Alert>
                                )}

                                <Button
                                    type="submit"
                                    className="w-full bg-gradient-to-r from-[var(--cl-four)] to-[var(--cl-five)] hover:from-[var(--cl-five)] hover:to-[var(--cl-four)] text-white font-semibold py-6 text-lg shadow-md hover:shadow-lg transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
                                    disabled={isLoading || !bookingCode.trim()}
                                >
                                    {isLoading ? (
                                        <span className="flex items-center justify-center gap-2">
                                            <svg className="animate-spin h-5 w-5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                                                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                                            </svg>
                                            Đang kiểm tra...
                                        </span>
                                    ) : (
                                        <span className="flex items-center justify-center gap-2">
                                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                                            </svg>
                                            Làm Thủ Tục
                                        </span>
                                    )}
                                </Button>
                            </form>
                        )}

                        {activeTab === "ticket-number" && (
                            <div className="space-y-6">
                                <div className="text-center mb-4">
                                    <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-gray-100 mb-3">
                                        <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 5v2m0 4v2m0 4v2m5-8h2m-2 4h2m-2 4h2M5 5v2m0 4v2m0 4v2M3 9h2m-2 4h2m-2 4h2m5-13h8a1 1 0 011 1v14a1 1 0 01-1 1h-8M5 5H3a1 1 0 00-1 1v14a1 1 0 001 1h2" />
                                        </svg>
                                    </div>
                                    <Label className="text-lg font-semibold text-gray-600">Số Vé</Label>
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
                                <Button disabled={true} className="w-full bg-gray-300 text-gray-500 cursor-not-allowed py-6">
                                    Tính năng đang được phát triển
                                </Button>
                            </div>
                        )}

                        {activeTab === "membership" && (
                            <div className="space-y-6">
                                <div className="text-center mb-4">
                                    <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-gray-100 mb-3">
                                        <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                                        </svg>
                                    </div>
                                    <Label className="text-lg font-semibold text-gray-600">Số Hội Viên</Label>
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
                                <Button disabled={true} className="w-full bg-gray-300 text-gray-500 cursor-not-allowed py-6">
                                    Tính năng đang được phát triển
                                </Button>
                            </div>
                        )}

                        <div className="mt-6 pt-6 border-t">
                            <p className="text-sm text-gray-500 text-center mb-2">
                                Làm thủ tục trực tuyến chỉ áp dụng cho các chuyến bay nội địa và quốc tế từ các sân bay lớn.
                            </p>
                        </div>
                    </div>
                </div>
            </div>
        </main>
    );
};

export default CheckInPageContent;
