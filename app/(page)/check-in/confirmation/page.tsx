"use client";

import { useSearchParams, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { CheckCircle2, Mail, Ticket, LogIn } from "lucide-react";
import Breadcrumb from "@/app/components/Breadcrumb/Breadcrumb";
import useUserStore from "@/app/zustand/storeUser";

const CheckInConfirmationPage = () => {
    const searchParams = useSearchParams();
    const router = useRouter();
    const { user, accessToken, hydrated } = useUserStore();
    const bookingCode = searchParams.get("bookingCode");
    const ticketCount = searchParams.get("ticketCount") || "0";
    const alreadyCheckedIn = searchParams.get("alreadyCheckedIn") === "true";
    
    // Check if user is logged in
    const isLoggedIn = Boolean(accessToken || user?.id);

    return (
        <main className="flex flex-col pt-[var(--hd)] gap-y-[var(--rowY)]">
            <Breadcrumb />
            <div className="container">
                <div className="max-w-2xl mx-auto py-[4rem] sm:py-[6rem]">
                    <div className="bg-white rounded-[1.2rem] sm:rounded-[1.6rem] shadow-lg p-[2rem] sm:p-[2.4rem] md:p-[3rem] border border-[var(--cl-six)]">
                        {/* Success Icon */}
                        <div className="flex justify-center mb-[2.4rem]">
                            <div className="w-[8rem] h-[8rem] sm:w-[10rem] sm:h-[10rem] bg-[var(--cl-pri)]/10 rounded-full flex items-center justify-center">
                                <CheckCircle2 className="w-[4.8rem] h-[4.8rem] sm:w-[6rem] sm:h-[6rem] text-[var(--cl-pri)]" />
                            </div>
                        </div>
                        
                        {/* Title */}
                        <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold text-center mb-[1.2rem] text-[var(--cl-pri)]">
                            {alreadyCheckedIn ? "Đặt chỗ đã được làm thủ tục" : "Làm thủ tục thành công!"}
                        </h1>
                        
                        {/* Description */}
                        <p className="text-base sm:text-lg text-gray-600 text-center mb-[2.4rem] leading-relaxed">
                            {alreadyCheckedIn 
                                ? "Đặt chỗ này đã được làm thủ tục trước đó. Vé máy bay đã được phát hành."
                                : "Vé máy bay của bạn đã được tạo thành công."
                            }
                        </p>

                        {/* Booking Code */}
                        {bookingCode && (
                            <div className="mb-[2.4rem] p-[1.6rem] sm:p-[2rem] bg-[var(--cl-pri)]/5 rounded-lg border border-[var(--cl-pri)]/20">
                                <p className="text-xs sm:text-sm text-gray-600 mb-[0.8rem] uppercase tracking-wide font-medium text-center">
                                    Mã đặt chỗ
                                </p>
                                <p className="text-2xl sm:text-3xl font-mono font-bold text-[var(--cl-pri)] text-center">
                                    {bookingCode}
                                </p>
                            </div>
                        )}

                        {/* Email Notification */}
                        <div className="mb-[2.4rem] p-[1.6rem] sm:p-[2rem] bg-gradient-to-br from-[var(--cl-pri)]/10 to-[var(--cl-pri)]/5 rounded-lg border-2 border-[var(--cl-pri)]/30">
                            <div className="flex items-start gap-[1.2rem]">
                                <div className="flex-shrink-0 w-[2.4rem] h-[2.4rem] bg-[var(--cl-pri)]/20 rounded-full flex items-center justify-center mt-[0.2rem]">
                                    <Mail className="w-[1.4rem] h-[1.4rem] text-[var(--cl-pri)]" />
                                </div>
                                <div className="flex-1">
                                    <p className="text-sm sm:text-base text-gray-700 font-medium mb-[0.8rem]">
                                        Email xác nhận đã được gửi
                                    </p>
                                    <p className="text-sm text-gray-600 leading-relaxed">
                                        Chúng tôi đã gửi email xác nhận với thông tin vé máy bay đến địa chỉ email của bạn. Vui lòng kiểm tra hộp thư đến (và cả thư mục spam) để xem chi tiết vé.
                                    </p>
                                </div>
                            </div>
                        </div>

                        {/* Action Buttons */}
                        <div className="flex flex-col sm:flex-row gap-[1rem] sm:gap-[1.2rem] mb-[2rem]">
                            {/* Only show "Xem vé của tôi" if user is logged in */}
                            {isLoggedIn ? (
                                <Button
                                    onClick={() => router.push("/my-tickets")}
                                    className="flex-1 bg-[var(--cl-pri)] hover:bg-[var(--cl-pri)]/90 text-white px-[2.4rem] py-[1.2rem] sm:py-[1.4rem] text-base sm:text-lg font-semibold rounded-lg transition-all duration-200 shadow-md hover:shadow-lg"
                                >
                                    <span className="flex items-center justify-center gap-[0.8rem]">
                                        <Ticket className="w-[1.6rem] h-[1.6rem]" />
                                        Xem vé của tôi
                                    </span>
                                </Button>
                            ) : (
                                <Button
                                    onClick={() => router.push(`/signin?redirect=${encodeURIComponent('/my-tickets')}`)}
                                    className="flex-1 bg-[var(--cl-pri)] hover:bg-[var(--cl-pri)]/90 text-white px-[2.4rem] py-[1.2rem] sm:py-[1.4rem] text-base sm:text-lg font-semibold rounded-lg transition-all duration-200 shadow-md hover:shadow-lg"
                                >
                                    <span className="flex items-center justify-center gap-[0.8rem]">
                                        <LogIn className="w-[1.6rem] h-[1.6rem]" />
                                        Đăng nhập để xem vé
                                    </span>
                                </Button>
                            )}
                            
                            <Button
                                onClick={() => router.push("/")}
                                variant="outline"
                                className="flex-1 border-2 border-gray-300 hover:border-[var(--cl-pri)] hover:bg-[var(--cl-pri)]/5 text-gray-700 hover:text-[var(--cl-pri)] px-[2.4rem] py-[1.2rem] sm:py-[1.4rem] text-base sm:text-lg font-semibold rounded-lg transition-all duration-200"
                            >
                                Về trang chủ
                            </Button>
                        </div>

                        {/* Ticket Count */}
                        <div className="pt-[1.6rem] border-t border-gray-200">
                            <p className="text-xs sm:text-sm text-gray-500 text-center">
                                Số vé đã tạo: <span className="font-semibold text-[var(--cl-pri)]">{ticketCount}</span>
                            </p>
                        </div>
                    </div>
                </div>
            </div>
        </main>
    );
};

export default CheckInConfirmationPage;

