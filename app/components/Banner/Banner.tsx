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
                    <div className="w-full rounded-b-lg bg-white">
                        <div className="flex items-center gap-0 border-b border-gray-200 bg-gray-50 rounded-t-lg">
                            <button
                                type="button"
                                onClick={() => setActiveCheckInTab("booking-code")}
                                className={`flex-1 relative px-4 py-4 text-base md:text-lg font-semibold transition-all duration-200 flex items-center justify-center border-b-2 ${activeCheckInTab === "booking-code"
                                    ? "text-[var(--cl-pri)] bg-white border-[var(--cl-pri)]"
                                    : "text-gray-600 bg-gray-50 border-transparent hover:text-[var(--cl-pri)] hover:bg-gray-100"
                                    }`}
                            >
                                <span className="font-medium">Mã Đặt Chỗ</span>
                            </button>
                            <button
                                type="button"
                                onClick={() => setActiveCheckInTab("ticket-number")}
                                className={`flex-1 relative px-4 py-4 text-base md:text-lg font-semibold transition-all duration-200 flex items-center justify-center border-b-2 ${activeCheckInTab === "ticket-number"
                                    ? "text-[var(--cl-pri)] bg-white border-[var(--cl-pri)]"
                                    : "text-gray-600 bg-gray-50 border-transparent hover:text-[var(--cl-pri)] hover:bg-gray-100"
                                    }`}
                            >
                                <span className="font-medium">Số Vé</span>
                            </button>
                            <button
                                type="button"
                                onClick={() => setActiveCheckInTab("membership")}
                                className={`flex-1 relative px-4 py-4 text-base md:text-lg font-semibold transition-all duration-200 flex items-center justify-center border-b-2 ${activeCheckInTab === "membership"
                                    ? "text-[var(--cl-pri)] bg-white border-[var(--cl-pri)]"
                                    : "text-gray-600 bg-gray-50 border-transparent hover:text-[var(--cl-pri)] hover:bg-gray-100"
                                    }`}
                            >
                                <span className="font-medium">Số Hội Viên</span>
                            </button>
                        </div>

                        {activeCheckInTab === "booking-code" && (
                            <form onSubmit={handleCheckInSubmit} className="bg-white rounded-lg">
                                <div className="flex justify-between gap-x-[2rem] p-6">
                                    {/* Header Section */}
                                    <div className="flex flex-col gap-y-[0.4rem]  w-fit">
                                        <p className="text-base text-gray-700 font-medium">
                                            Nhập mã đặt chỗ 6 ký tự để làm thủ tục
                                        </p>
                                        <p className="text-sm  text-gray-600 font-medium">
                                            <strong className="text-red-600 ">*</strong> Vui lòng nhập đúng mã đặt chỗ như trên email xác nhận
                                        </p>
                                    </div>

                                    {/* Input Section */}
                                    <div className="w-[50%] relative">
                                        <div className="">
                                            <Input
                                                id="bookingCode"
                                                type="text"
                                                placeholder="Ví dụ: ABC123"
                                                value={bookingCode}
                                                onChange={(e) => {
                                                    setBookingCode(e.target.value.toUpperCase());
                                                    setCheckInError(null);
                                                }}
                                                className="h-[4.8rem]! text-center text-xl md:text-2xl font-mono tracking-[0.2em] border-2 border-gray-300 focus:border-[var(--cl-pri)] focus:ring-2 focus:ring-[var(--cl-pri)]/20 h-14 md:h-16 transition-all duration-200 rounded-lg bg-white"
                                                maxLength={10}
                                                disabled={isCheckInLoading}
                                                autoFocus
                                            />
                                        </div>

                                        {/* Error Message */}
                                        {checkInError && (
                                            <Alert variant="destructive" className="border-red-300 bg-red-50 rounded-lg absolute left-0 w-full top-[105%]">
                                                <AlertCircle className="h-4 w-4" />
                                                <AlertDescription className="text-sm font-medium">{checkInError}</AlertDescription>
                                            </Alert>
                                        )}
                                    </div>



                                    {/* Submit Button */}
                                    <Button
                                        type="submit"
                                        className="w-full h-[4.8rem]! bg-[var(--cl-pri)] hover:bg-[var(--cl-third)] text-white font-bold py-5 md:py-6 text-base md:text-lg rounded-lg shadow-md hover:shadow-lg transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:shadow-md flex-1"
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
                            <div className="bg-white rounded-lg ">
                                <div className="flex justify-between gap-x-[2rem] p-6">
                                    {/* Header Section */}
                                    <div className=" w-fit flex flex-col gap-y-[0.4rem]">
                                        <p className="text-base text-gray-700 font-medium ">
                                            Nhập số vé và họ để tra cứu
                                        </p>
                                        <p className="text-sm  text-gray-600 font-medium">
                                            <strong className="text-red-600 ">*</strong> Tính năng đang được phát triển
                                        </p>
                                    </div>

                                    {/* Input Section */}
                                    <div className="w-[55%] flex gap-x-[0.8rem] h-full">
                                        <div className="flex-1 flex items-center gap-x-[0.8rem]">
                                            <Label htmlFor="ticketNumber" className="text-mn font-semibold text-gray-70 block text-nowrap">Số Vé</Label>
                                            <Input
                                                id="ticketNumber"
                                                type="text"
                                                placeholder="123XXXXXXXXXXX"
                                                value={ticketNumber}
                                                onChange={(e) => setTicketNumber(e.target.value)}
                                                disabled={true}
                                                className="text-base h-[4.8rem]! border-2 border-gray-300 bg-gray-100 cursor-not-allowed h-14 md:h-16 rounded-lg"
                                            />
                                        </div>
                                        <div className="flex-1 flex items-center gap-x-[0.8rem]">
                                            <Label htmlFor="lastName" className="text-mn font-semibold text-gray-700 mb-2 block">Họ</Label>
                                            <Input
                                                id="lastName"
                                                type="text"
                                                placeholder="NGUYEN"
                                                value={lastName}
                                                onChange={(e) => setLastName(e.target.value.toUpperCase())}
                                                disabled={true}
                                                className="text-base h-[4.8rem]! border-2 border-gray-300 bg-gray-100 cursor-not-allowed h-14 md:h-16 rounded-lg uppercase"
                                            />
                                        </div>

                                    </div>

                                    {/* Submit Button */}
                                    <Button
                                        onClick={() => showError("Tính năng tìm kiếm theo số vé đang được phát triển")}
                                        disabled={isCheckInLoading || !ticketNumber.trim() || !lastName.trim()}
                                        className="w-full flex-1 h-[4.8rem]! bg-[var(--cl-pri)] hover:bg-[var(--cl-third)] text-white font-bold py-5 md:py-6 text-base md:text-xl rounded-lg shadow-md hover:shadow-lg transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:shadow-md"
                                    >
                                        {isCheckInLoading ? (
                                            <span className="flex items-center justify-center gap-2">
                                                <svg className="animate-spin h-5 w-5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                                </svg>
                                                Đang tìm kiếm...
                                            </span>
                                        ) : (
                                            <span className="flex items-center justify-center gap-2">
                                                Tìm Kiếm
                                            </span>
                                        )}
                                    </Button>
                                </div>
                            </div>
                        )}

                        {activeCheckInTab === "membership" && (
                            <div className="bg-white rounded-lg">
                                <div className="flex justify-between gap-x-[2rem] p-6">
                                    {/* Header Section */}
                                    <div className="flex flex-col gap-y-[0.4rem] w-fit">
                                        <p className="text-base text-gray-700 font-medium">
                                            Nhập số hội viên để tra cứu
                                        </p>
                                        <p className="text-sm  text-gray-600 font-medium">
                                            <strong className="text-red-600 ">*</strong> Tính năng đang được phát triển
                                        </p>
                                    </div>

                                    {/* Input Section */}
                                    <div className="w-[55%]">
                                        <Input
                                            id="membershipNumber"
                                            type="text"
                                            placeholder="Nhập số hội viên"
                                            value={membershipNumber}
                                            onChange={(e) => setMembershipNumber(e.target.value)}
                                            disabled={true}
                                            className="text-base border-2 border-gray-300 bg-gray-100 cursor-not-allowed md:h-16 rounded-lg h-[4.8rem]!"
                                        />

                                    </div>

                                    {/* Submit Button */}
                                    <Button
                                        onClick={() => showError("Tính năng tìm kiếm theo số hội viên đang được phát triển")}
                                        disabled={isCheckInLoading || !membershipNumber.trim()}
                                        className="w-full flex-1 bg-[var(--cl-pri)] hover:bg-[var(--cl-third)] text-white font-bold py-5 md:py-6 text-base md:text-xl rounded-lg shadow-md hover:shadow-lg transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:shadow-md h-[4.8rem]!"
                                    >
                                        {isCheckInLoading ? (
                                            <span className="flex items-center justify-center gap-2">
                                                <svg className="animate-spin h-5 w-5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                                </svg>
                                                Đang tìm kiếm...
                                            </span>
                                        ) : (
                                            <span className="flex items-center justify-center gap-2">
                                                Tìm Kiếm
                                            </span>
                                        )}
                                    </Button>
                                </div>
                            </div>
                        )}
                    </div>
                );

            case "my-bookings":
                return (
                    <div className="w-full rounded-b-lg bg-white">
                        <div className="flex items-center gap-0 border-b border-gray-200  bg-gray-50 rounded-t-lg">
                            <button
                                type="button"
                                onClick={() => setActiveMyBookingsTab("booking-code-ticket")}
                                className={`flex-1 relative px-4 py-4 text-base md:text-lg font-semibold transition-all duration-200 flex items-center justify-center border-b-2 ${activeMyBookingsTab === "booking-code-ticket"
                                    ? "text-[var(--cl-pri)] bg-white border-[var(--cl-pri)]"
                                    : "text-gray-600 bg-gray-50 border-transparent hover:text-[var(--cl-pri)] hover:bg-gray-100"
                                    }`}
                            >
                                <span className="font-medium">Mã Đặt Chỗ/Số Vé</span>
                            </button>
                            <button
                                type="button"
                                onClick={() => setActiveMyBookingsTab("membership")}
                                className={`flex-1 relative px-4 py-4 text-base md:text-lg font-semibold transition-all duration-200 flex items-center justify-center border-b-2 ${activeMyBookingsTab === "membership"
                                    ? "text-[var(--cl-pri)] bg-white border-[var(--cl-pri)]"
                                    : "text-gray-600 bg-gray-50 border-transparent hover:text-[var(--cl-pri)] hover:bg-gray-100"
                                    }`}
                            >
                                <span className="font-medium">Hội Viên Wanderlust Club</span>
                            </button>
                        </div>

                        {activeMyBookingsTab === "booking-code-ticket" && (
                            <div className="bg-white rounded-lg">
                                <div className="flex justify-between gap-x-[2rem] p-6">
                                    {/* Header Section */}
                                    <div className=" w-fit flex flex-col gap-y-[0.4rem]">
                                        <p className="text-base text-gray-700 font-medium">
                                            Nhập mã đặt chỗ 6 ký tự để tra cứu
                                        </p>
                                        <p className="text-sm  text-gray-600 font-medium">
                                            <strong className="text-red-600 ">*</strong> Vui lòng nhập đúng mã đặt chỗ như trên email xác nhận
                                        </p>
                                    </div>

                                    {/* Input Section */}
                                    <div className="w-[50%] relative">
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
                                                className="text-center text-xl md:text-2xl font-mono tracking-[0.2em] border-2 border-gray-300 focus:border-[var(--cl-pri)] focus:ring-2 focus:ring-[var(--cl-pri)]/20 h-[4.8rem]! md:h-16 transition-all duration-200 rounded-lg bg-white"
                                                maxLength={10}
                                                disabled={isMyBookingLoading}
                                                autoFocus
                                                onKeyDown={(e) => {
                                                    if (e.key === "Enter") {
                                                        handleMyBookingsSearch();
                                                    }
                                                }}
                                            />
                                        </div>
                                        {/* Error Message */}
                                        {myBookingError && (
                                            <Alert variant="destructive" className="border-red-300 bg-red-50 rounded-lg absolute left-0 w-full top-[105%]">
                                                <AlertCircle className="h-4 w-4" />
                                                <AlertDescription className="text-sm font-medium">{myBookingError}</AlertDescription>
                                            </Alert>
                                        )}
                                    </div>



                                    {/* Submit Button */}
                                    <Button
                                        onClick={handleMyBookingsSearch}
                                        disabled={isMyBookingLoading || !myBookingCode.trim()}
                                        className="w-full flex-1 bg-[var(--cl-pri)] hover:bg-[var(--cl-third)] text-white font-bold py-5 md:py-6 text-base md:text-lg rounded-lg shadow-md hover:shadow-lg transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:shadow-md h-[4.8rem]!"
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
                                            "Tìm Kiếm"
                                        )}
                                    </Button>
                                </div>
                            </div>
                        )}

                        {activeMyBookingsTab === "membership" && (
                            <div className="bg-white rounded-lg">
                                <div className="p-6 flex flex-col  gap-y-[1.2rem]">
                                    {/* Header Section */}
                                    <div className="text-center">
                                        <p className="text-base text-gray-700 font-medium">
                                            Đăng nhập vào Wanderlust Club để xem chuyến bay sắp tới của bạn
                                        </p>
                                    </div>

                                    {/* Submit Button */}
                                    <Button
                                        className="w-full max-w-[20rem] mx-auto flex-1 h-[4rem]! bg-[var(--cl-pri)] hover:bg-[var(--cl-third)] text-white font-bold py-5 md:py-6 text-base md:text-lg rounded-lg shadow-md hover:shadow-lg transition-all duration-200"
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
                <div className="flex flex-col items-start justify-end z-10 h-full relative gap-y-[1.6rem] py-[4rem]" >
                    {
                        data && (
                            <h1
                                className="text-start text-white text-[4rem] uppercase font-medium"
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
                        <div className="bg-white rounded-2xl">
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