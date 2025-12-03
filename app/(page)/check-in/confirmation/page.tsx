"use client";

import { useSearchParams, useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { CheckCircle2 } from "lucide-react";
import Breadcrumb from "@/app/components/Breadcrumb/Breadcrumb";

const CheckInConfirmationPage = () => {
    const searchParams = useSearchParams();
    const router = useRouter();
    const bookingCode = searchParams.get("bookingCode");
    const ticketCount = searchParams.get("ticketCount") || "0";
    const alreadyCheckedIn = searchParams.get("alreadyCheckedIn") === "true";

    return (
        <main className="flex flex-col pt-[var(--hd)] gap-y-[var(--rowY)]">
            <Breadcrumb />
            <div className="container">
                <div className="max-w-2xl mx-auto py-8 md:py-12 lg:py-16">
                    <div className="bg-white rounded-lg shadow-md p-6 md:p-8 text-center">
                        <div className="flex justify-center mb-4">
                            <CheckCircle2 className="h-16 w-16 text-green-500" />
                        </div>
                        
                        <h1 className="text-2xl md:text-3xl font-bold mb-4">
                            {alreadyCheckedIn ? "Đặt chỗ đã được làm thủ tục" : "Làm thủ tục thành công!"}
                        </h1>
                        
                        <p className="text-base md:text-lg text-gray-600 mb-6">
                            {alreadyCheckedIn 
                                ? "Đặt chỗ này đã được làm thủ tục trước đó. Vé máy bay đã được phát hành."
                                : "Vé máy bay của bạn đã được tạo thành công."
                            }
                        </p>

                        {bookingCode && (
                            <div className="bg-gray-50 rounded-lg p-4 mb-6">
                                <p className="text-sm text-gray-600 mb-2">Mã đặt chỗ</p>
                                <p className="text-2xl font-mono font-bold">{bookingCode}</p>
                            </div>
                        )}

                        <div className="bg-blue-50 rounded-lg p-4 mb-6">
                            <p className="text-sm text-gray-700">
                                Chúng tôi đã gửi email xác nhận với thông tin vé máy bay đến địa chỉ email của bạn.
                            </p>
                            <p className="text-sm text-gray-700 mt-2">
                                Vui lòng kiểm tra hộp thư đến (và cả thư mục spam) để xem chi tiết vé.
                            </p>
                        </div>

                        <div className="space-y-3">
                            <Button
                                onClick={() => router.push("/my-tickets")}
                                className="w-full"
                            >
                                Xem vé của tôi
                            </Button>
                            
                            <Button
                                onClick={() => router.push("/")}
                                variant="outline"
                                className="w-full"
                            >
                                Về trang chủ
                            </Button>
                        </div>

                        <div className="mt-6 pt-6 border-t">
                            <p className="text-xs text-gray-500">
                                Số vé đã tạo: {ticketCount}
                            </p>
                        </div>
                    </div>
                </div>
            </div>
        </main>
    );
};

export default CheckInConfirmationPage;

