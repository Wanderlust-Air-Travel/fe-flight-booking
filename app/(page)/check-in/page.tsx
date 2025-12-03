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

const CheckInPage = () => {
    const searchParams = useSearchParams();
    const router = useRouter();
    const [bookingCode, setBookingCode] = useState(searchParams.get("bookingCode") || "");
    const [ticketNumber, setTicketNumber] = useState("");
    const [membershipNumber, setMembershipNumber] = useState("");
    const [lastName, setLastName] = useState("");
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [activeTab, setActiveTab] = useState<"booking-code" | "ticket-number" | "membership">("booking-code");

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        
        if (!bookingCode.trim()) {
            setError("Vui lòng nhập mã đặt chỗ (PNR code)");
            return;
        }

        setIsLoading(true);
        setError(null);

        try {
            // Get booking by code to validate and get booking info
            const response = await axiosPublic.get(`/api/bookings/code/${bookingCode.trim()}`);
            
            if (response.status === 200 && response.data) {
                // Navigate to seat selection page with booking code
                router.push(`/check-in/seat-selection?bookingCode=${encodeURIComponent(bookingCode.trim())}`);
            } else {
                setError("Không tìm thấy đặt chỗ với mã này. Vui lòng kiểm tra lại.");
            }
        } catch (err: any) {
            console.error("Error fetching booking:", err);
            const errorMessage = err.response?.data?.message || 
                                err.message || 
                                "Không tìm thấy đặt chỗ với mã này. Vui lòng kiểm tra lại.";
            setError(errorMessage);
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <main className="flex flex-col pt-[var(--hd)] gap-y-[var(--rowY)] min-h-screen bg-gray-50">
            <MainNavigationTabs />
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

                        {/* Sub-tabs */}
                        <div className="flex items-center gap-0 border-b border-gray-200 mb-6">
                            <button
                                type="button"
                                onClick={() => setActiveTab("booking-code")}
                                className={`px-4 py-2 text-sm font-medium transition-colors ${
                                    activeTab === "booking-code"
                                        ? "text-[var(--cl-pri)] border-b-2 border-[var(--cl-pri)]"
                                        : "text-gray-600 hover:text-[var(--cl-pri)]"
                                }`}
                            >
                                Mã Đặt Chỗ
                            </button>
                            <button
                                type="button"
                                onClick={() => setActiveTab("ticket-number")}
                                className={`px-4 py-2 text-sm font-medium transition-colors ${
                                    activeTab === "ticket-number"
                                        ? "text-[var(--cl-pri)] border-b-2 border-[var(--cl-pri)]"
                                        : "text-gray-600 hover:text-[var(--cl-pri)]"
                                }`}
                            >
                                Số Vé
                            </button>
                            <button
                                type="button"
                                onClick={() => setActiveTab("membership")}
                                className={`px-4 py-2 text-sm font-medium transition-colors ${
                                    activeTab === "membership"
                                        ? "text-[var(--cl-pri)] border-b-2 border-[var(--cl-pri)]"
                                        : "text-gray-600 hover:text-[var(--cl-pri)]"
                                }`}
                            >
                                Số Hội Viên
                            </button>
                        </div>

                        {/* Form based on active tab */}
                        {activeTab === "booking-code" && (
                            <form onSubmit={handleSubmit} className="space-y-4">
                                <div className="space-y-2">
                                    <Label htmlFor="bookingCode">Mã Đặt Chỗ (PNR Code)</Label>
                                    <Input
                                        id="bookingCode"
                                        type="text"
                                        placeholder="123XXX"
                                        value={bookingCode}
                                        onChange={(e) => {
                                            setBookingCode(e.target.value.toUpperCase());
                                            setError(null);
                                        }}
                                        className="text-center text-lg font-mono tracking-wider"
                                        maxLength={10}
                                        disabled={isLoading}
                                        autoFocus
                                    />
                                    <p className="text-xs text-blue-600">
                                        Vui lòng nhập đúng họ như trên vé của bạn
                                    </p>
                                </div>

                                {error && (
                                    <Alert variant="destructive">
                                        <AlertCircle className="h-4 w-4" />
                                        <AlertDescription>{error}</AlertDescription>
                                    </Alert>
                                )}

                                <Button
                                    type="submit"
                                    className="w-full bg-green-600 hover:bg-green-700"
                                    disabled={isLoading || !bookingCode.trim()}
                                >
                                    {isLoading ? "Đang kiểm tra..." : "Làm Thủ Tục"}
                                </Button>
                            </form>
                        )}

                        {activeTab === "ticket-number" && (
                            <div className="space-y-4">
                                <div className="space-y-2">
                                    <Label htmlFor="ticketNumber">Số Vé</Label>
                                    <Input
                                        id="ticketNumber"
                                        type="text"
                                        placeholder="123XXXXXXXXXXX"
                                        value={ticketNumber}
                                        onChange={(e) => setTicketNumber(e.target.value)}
                                        disabled={true}
                                    />
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="lastName">Họ</Label>
                                    <Input
                                        id="lastName"
                                        type="text"
                                        placeholder="NGUYEN"
                                        value={lastName}
                                        onChange={(e) => setLastName(e.target.value.toUpperCase())}
                                        disabled={true}
                                    />
                                </div>
                                <Button
                                    disabled={true}
                                    className="w-full bg-gray-400 cursor-not-allowed"
                                >
                                    Tính năng đang được phát triển
                                </Button>
                            </div>
                        )}

                        {activeTab === "membership" && (
                            <div className="space-y-4">
                                <div className="space-y-2">
                                    <Label htmlFor="membershipNumber">Số Hội Viên</Label>
                                    <Input
                                        id="membershipNumber"
                                        type="text"
                                        placeholder="Nhập số hội viên"
                                        value={membershipNumber}
                                        onChange={(e) => setMembershipNumber(e.target.value)}
                                        disabled={true}
                                    />
                                </div>
                                <Button
                                    disabled={true}
                                    className="w-full bg-gray-400 cursor-not-allowed"
                                >
                                    Tính năng đang được phát triển
                                </Button>
                            </div>
                        )}

                        <div className="mt-6 pt-6 border-t">
                            <p className="text-xs text-gray-500 text-center mb-2">
                                Làm thủ tục trực tuyến chỉ áp dụng cho (i) Các chuyến bay nội địa khởi hành từ Hà Nội (HAN), Đà Nẵng (DAD), Tp Hồ Chí Minh (SGN), Nha Trang (CXR), Quy Nhơn (UIH); (ii) Các chuyến bay quốc tế TP. Hồ Chí Minh (SGN) - Bangkok (DMK).
                            </p>
                            <p className="text-xs text-green-600 text-center underline">
                                Xem chi tiết các trường hợp không áp dụng
                            </p>
                        </div>
                    </div>
                </div>
            </div>
        </main>
    );
};

export default CheckInPage;

