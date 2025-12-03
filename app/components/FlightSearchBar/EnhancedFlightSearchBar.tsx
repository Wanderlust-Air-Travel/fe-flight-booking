"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import FlightSearchBar from "./FlightSearchBar";
import SearchOptionsTabs from "./SearchOptionsTabs";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { axiosPublic } from "@/lib/axios-instance";
import { showError, showLoading, dismissToast, showSuccess } from "@/lib/toast";
import { EnhancedFlightSearchBarProps, SearchOption } from "@/types/enhanced-flight-search-bar-type";

const EnhancedFlightSearchBar = ({ showTabs = false }: EnhancedFlightSearchBarProps) => {
  // Default to "booking-code" if tabs are shown (check-in page), otherwise "flight" (landing page)
  const [activeOption, setActiveOption] = useState<SearchOption>(showTabs ? "booking-code" : "flight");
  const [bookingCode, setBookingCode] = useState("");
  const [ticketNumber, setTicketNumber] = useState("");
  const [membershipNumber, setMembershipNumber] = useState("");
  const [lastName, setLastName] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();

  const handleSearchByBookingCode = async () => {
    if (!bookingCode.trim()) {
      showError("Vui lòng nhập mã đặt chỗ");
      return;
    }

    setIsLoading(true);
    const loadingToastId = showLoading("Đang tìm kiếm đặt chỗ...");

    try {
      const response = await axiosPublic.get(`/api/bookings/code/${bookingCode.trim()}`);
      
      if (response.data) {
        dismissToast(loadingToastId);
        showSuccess("Đã tìm thấy đặt chỗ. Đang chuyển hướng...");
        router.push(`/my-bookings?bookingCode=${encodeURIComponent(bookingCode.trim())}`);
      }
    } catch (error: any) {
      dismissToast(loadingToastId);
      const errorMessage = error.response?.data?.message || 
                          "Không tìm thấy đặt chỗ với mã này. Vui lòng kiểm tra lại.";
      showError(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSearchByTicketNumber = async () => {
    if (!ticketNumber.trim() || !lastName.trim()) {
      showError("Vui lòng nhập số vé và họ");
      return;
    }

    setIsLoading(true);
    const loadingToastId = showLoading("Đang tìm kiếm vé...");

    try {
      // TODO: Implement ticket search API
      showError("Tính năng tìm kiếm theo số vé đang được phát triển");
    } catch (error: any) {
      dismissToast(loadingToastId);
      showError(error.response?.data?.message || "Không tìm thấy vé với thông tin này");
    } finally {
      setIsLoading(false);
    }
  };

  const handleSearchByMembership = async () => {
    if (!membershipNumber.trim()) {
      showError("Vui lòng nhập số hội viên");
      return;
    }

    setIsLoading(true);
    const loadingToastId = showLoading("Đang tìm kiếm thông tin hội viên...");

    try {
      // TODO: Implement membership search API
      showError("Tính năng tìm kiếm theo số hội viên đang được phát triển");
    } catch (error: any) {
      dismissToast(loadingToastId);
      showError(error.response?.data?.message || "Không tìm thấy thông tin hội viên");
    } finally {
      setIsLoading(false);
    }
  };

  const renderSearchForm = () => {
    // On landing page, only show flight search (no tabs)
    if (!showTabs) {
      return <FlightSearchBar />;
    }

    // On check-in page, show tabs for booking-code, ticket-number, membership
    switch (activeOption) {
      case "booking-code":
        return (
          <div className="bg-gradient-to-br from-white to-blue-50/30 rounded-lg border-2 border-[var(--cl-pri)]/20 shadow-lg p-6 md:p-8">
            <div className="space-y-6">
              <div className="text-center mb-4">
                <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-[var(--cl-pri)]/10 mb-3">
                  <svg className="w-8 h-8 text-[var(--cl-pri)]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                </div>
                <Label htmlFor="bookingCode" className="text-lg font-semibold text-[var(--cl-pri)]">
                  Mã Đặt Chỗ (PNR Code)
                </Label>
                <p className="text-sm text-gray-600 mt-1">Nhập mã đặt chỗ 6 ký tự để tra cứu</p>
              </div>
              <div>
                <Input
                  id="bookingCode"
                  type="text"
                  placeholder="Ví dụ: ABC123"
                  value={bookingCode}
                  onChange={(e) => setBookingCode(e.target.value.toUpperCase())}
                  className="mt-2 text-center text-xl font-mono tracking-widest border-2 border-[var(--cl-pri)]/30 focus:border-[var(--cl-pri)] focus:ring-2 focus:ring-[var(--cl-pri)]/20 h-14 transition-all"
                  maxLength={10}
                  disabled={isLoading}
                />
              </div>
              <Button
                onClick={handleSearchByBookingCode}
                disabled={isLoading || !bookingCode.trim()}
                className="w-full bg-gradient-to-r from-[var(--cl-pri)] to-[var(--cl-third)] hover:from-[var(--cl-four)] hover:to-[var(--cl-five)] text-white font-semibold py-6 text-lg shadow-md hover:shadow-lg transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isLoading ? (
                  <span className="flex items-center justify-center gap-2">
                    <svg className="animate-spin h-5 w-5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Đang tìm kiếm...
                  </span>
                ) : (
                  <span className="flex items-center justify-center gap-2">
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                    </svg>
                    Tìm Kiếm
                  </span>
                )}
              </Button>
            </div>
          </div>
        );
      
      case "ticket-number":
        return (
          <div className="bg-gradient-to-br from-white to-blue-50/30 rounded-lg border-2 border-[var(--cl-pri)]/20 shadow-lg p-6 md:p-8">
            <div className="space-y-6">
              <div className="text-center mb-4">
                <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-[var(--cl-pri)]/10 mb-3">
                  <svg className="w-8 h-8 text-[var(--cl-pri)]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 5v2m0 4v2m0 4v2m5-8h2m-2 4h2m-2 4h2M5 5v2m0 4v2m0 4v2M3 9h2m-2 4h2m-2 4h2m5-13h8a1 1 0 011 1v14a1 1 0 01-1 1h-8M5 5H3a1 1 0 00-1 1v14a1 1 0 001 1h2" />
                  </svg>
                </div>
                <Label className="text-lg font-semibold text-[var(--cl-pri)]">
                  Số Vé
                </Label>
                <p className="text-sm text-gray-600 mt-1">Nhập số vé và họ để tra cứu</p>
              </div>
              <div>
                <Label htmlFor="ticketNumber" className="text-sm font-medium text-gray-700">Số Vé</Label>
                <Input
                  id="ticketNumber"
                  type="text"
                  placeholder="Nhập số vé (ví dụ: 123XXXXXXXXXXX)"
                  value={ticketNumber}
                  onChange={(e) => setTicketNumber(e.target.value)}
                  className="mt-2 border-2 border-[var(--cl-pri)]/30 focus:border-[var(--cl-pri)] focus:ring-2 focus:ring-[var(--cl-pri)]/20 h-12 transition-all"
                  disabled={isLoading}
                />
              </div>
              <div>
                <Label htmlFor="lastName" className="text-sm font-medium text-gray-700">Họ</Label>
                <Input
                  id="lastName"
                  type="text"
                  placeholder="NGUYEN"
                  value={lastName}
                  onChange={(e) => setLastName(e.target.value.toUpperCase())}
                  className="mt-2 border-2 border-[var(--cl-pri)]/30 focus:border-[var(--cl-pri)] focus:ring-2 focus:ring-[var(--cl-pri)]/20 h-12 uppercase transition-all"
                  disabled={isLoading}
                />
              </div>
              <Button
                onClick={handleSearchByTicketNumber}
                disabled={isLoading || !ticketNumber.trim() || !lastName.trim()}
                className="w-full bg-gradient-to-r from-[var(--cl-pri)] to-[var(--cl-third)] hover:from-[var(--cl-four)] hover:to-[var(--cl-five)] text-white font-semibold py-6 text-lg shadow-md hover:shadow-lg transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isLoading ? (
                  <span className="flex items-center justify-center gap-2">
                    <svg className="animate-spin h-5 w-5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Đang tìm kiếm...
                  </span>
                ) : (
                  <span className="flex items-center justify-center gap-2">
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                    </svg>
                    Tìm Kiếm
                  </span>
                )}
              </Button>
            </div>
          </div>
        );
      
      case "membership":
        return (
          <div className="bg-gradient-to-br from-white to-blue-50/30 rounded-lg border-2 border-[var(--cl-pri)]/20 shadow-lg p-6 md:p-8">
            <div className="space-y-6">
              <div className="text-center mb-4">
                <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-[var(--cl-pri)]/10 mb-3">
                  <svg className="w-8 h-8 text-[var(--cl-pri)]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                  </svg>
                </div>
                <Label className="text-lg font-semibold text-[var(--cl-pri)]">
                  Số Hội Viên
                </Label>
                <p className="text-sm text-gray-600 mt-1">Nhập số hội viên để tra cứu thông tin</p>
              </div>
              <div>
                <Label htmlFor="membershipNumber" className="text-sm font-medium text-gray-700">Số Hội Viên</Label>
                <Input
                  id="membershipNumber"
                  type="text"
                  placeholder="Nhập số hội viên"
                  value={membershipNumber}
                  onChange={(e) => setMembershipNumber(e.target.value)}
                  className="mt-2 border-2 border-[var(--cl-pri)]/30 focus:border-[var(--cl-pri)] focus:ring-2 focus:ring-[var(--cl-pri)]/20 h-12 transition-all"
                  disabled={isLoading}
                />
              </div>
              <Button
                onClick={handleSearchByMembership}
                disabled={isLoading || !membershipNumber.trim()}
                className="w-full bg-gradient-to-r from-[var(--cl-pri)] to-[var(--cl-third)] hover:from-[var(--cl-four)] hover:to-[var(--cl-five)] text-white font-semibold py-6 text-lg shadow-md hover:shadow-lg transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isLoading ? (
                  <span className="flex items-center justify-center gap-2">
                    <svg className="animate-spin h-5 w-5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Đang tìm kiếm...
                  </span>
                ) : (
                  <span className="flex items-center justify-center gap-2">
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                    </svg>
                    Tìm Kiếm
                  </span>
                )}
              </Button>
            </div>
          </div>
        );
      
      default:
        return null;
    }
  };

  return (
    <div className="w-full">
      {showTabs && (
        <SearchOptionsTabs
          activeOption={activeOption}
          onOptionChange={setActiveOption}
        />
      )}
      <div className={showTabs ? "mt-0" : ""}>
        {renderSearchForm()}
      </div>
    </div>
  );
};

export default EnhancedFlightSearchBar;

