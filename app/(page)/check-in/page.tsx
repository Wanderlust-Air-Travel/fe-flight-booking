"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { AlertCircle } from "lucide-react";
import Breadcrumb from "@/app/components/Breadcrumb/Breadcrumb";
import axiosInstance, { axiosPublic } from "@/lib/axios-instance";

const CheckInPage = () => {
    const [bookingCode, setBookingCode] = useState("");
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const router = useRouter();

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
        <main className="flex flex-col pt-[var(--hd)] gap-y-[var(--rowY)]">
            <Breadcrumb />
            <div className="container">
                <div className="max-w-md mx-auto py-8 md:py-12 lg:py-16">
                    <div className="bg-white rounded-lg shadow-md p-6 md:p-8">
                        <h1 className="text-2xl md:text-3xl font-bold text-center mb-2">
                            Làm thủ tục (Check-in)
                        </h1>
                        <p className="text-sm md:text-base text-gray-600 text-center mb-6">
                            Nhập mã đặt chỗ (PNR code) để bắt đầu làm thủ tục và chọn ghế ngồi
                        </p>

                        <form onSubmit={handleSubmit} className="space-y-4">
                            <div className="space-y-2">
                                <Label htmlFor="bookingCode">Mã đặt chỗ (PNR Code)</Label>
                                <Input
                                    id="bookingCode"
                                    type="text"
                                    placeholder="Ví dụ: ABC123"
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
                                <p className="text-xs text-gray-500">
                                    Mã đặt chỗ thường có 6 ký tự chữ và số
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
                                className="w-full"
                                disabled={isLoading || !bookingCode.trim()}
                            >
                                {isLoading ? "Đang kiểm tra..." : "Tiếp tục"}
                            </Button>
                        </form>

                        <div className="mt-6 pt-6 border-t">
                            <p className="text-xs text-gray-500 text-center">
                                Mã đặt chỗ (PNR code) được gửi qua email sau khi đặt vé thành công
                            </p>
                        </div>
                    </div>
                </div>
            </div>
        </main>
    );
};

export default CheckInPage;

