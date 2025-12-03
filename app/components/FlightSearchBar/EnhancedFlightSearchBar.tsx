"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import FlightSearchBar from "./FlightSearchBar";
import SearchOptionsTabs, { SearchOption } from "./SearchOptionsTabs";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { axiosPublic } from "@/lib/axios-instance";
import { showError, showLoading, dismissToast, showSuccess } from "@/lib/toast";

interface EnhancedFlightSearchBarProps {
  showTabs?: boolean;
}

const EnhancedFlightSearchBar = ({ showTabs = true }: EnhancedFlightSearchBarProps) => {
  const [activeOption, setActiveOption] = useState<SearchOption>("flight");
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
    switch (activeOption) {
      case "flight":
        return <FlightSearchBar />;
      
      case "booking-code":
        return (
          <div className="bg-white rounded-md border-[#CBD4E6] border-[0.1rem] p-6">
            <div className="space-y-4">
              <div>
                <Label htmlFor="bookingCode">Mã Đặt Chỗ (PNR Code)</Label>
                <Input
                  id="bookingCode"
                  type="text"
                  placeholder="Ví dụ: ABC123"
                  value={bookingCode}
                  onChange={(e) => setBookingCode(e.target.value.toUpperCase())}
                  className="mt-2 text-center text-lg font-mono tracking-wider"
                  maxLength={10}
                  disabled={isLoading}
                />
              </div>
              <Button
                onClick={handleSearchByBookingCode}
                disabled={isLoading || !bookingCode.trim()}
                className="w-full bg-[var(--cl-pri)] hover:bg-[var(--cl-four)]"
              >
                {isLoading ? "Đang tìm kiếm..." : "Tìm Kiếm"}
              </Button>
            </div>
          </div>
        );
      
      case "ticket-number":
        return (
          <div className="bg-white rounded-md border-[#CBD4E6] border-[0.1rem] p-6">
            <div className="space-y-4">
              <div>
                <Label htmlFor="ticketNumber">Số Vé</Label>
                <Input
                  id="ticketNumber"
                  type="text"
                  placeholder="Nhập số vé"
                  value={ticketNumber}
                  onChange={(e) => setTicketNumber(e.target.value)}
                  className="mt-2"
                  disabled={isLoading}
                />
              </div>
              <div>
                <Label htmlFor="lastName">Họ</Label>
                <Input
                  id="lastName"
                  type="text"
                  placeholder="NGUYEN"
                  value={lastName}
                  onChange={(e) => setLastName(e.target.value.toUpperCase())}
                  className="mt-2"
                  disabled={isLoading}
                />
              </div>
              <Button
                onClick={handleSearchByTicketNumber}
                disabled={isLoading || !ticketNumber.trim() || !lastName.trim()}
                className="w-full bg-[var(--cl-pri)] hover:bg-[var(--cl-four)]"
              >
                {isLoading ? "Đang tìm kiếm..." : "Tìm Kiếm"}
              </Button>
            </div>
          </div>
        );
      
      case "membership":
        return (
          <div className="bg-white rounded-md border-[#CBD4E6] border-[0.1rem] p-6">
            <div className="space-y-4">
              <div>
                <Label htmlFor="membershipNumber">Số Hội Viên</Label>
                <Input
                  id="membershipNumber"
                  type="text"
                  placeholder="Nhập số hội viên"
                  value={membershipNumber}
                  onChange={(e) => setMembershipNumber(e.target.value)}
                  className="mt-2"
                  disabled={isLoading}
                />
              </div>
              <Button
                onClick={handleSearchByMembership}
                disabled={isLoading || !membershipNumber.trim()}
                className="w-full bg-[var(--cl-pri)] hover:bg-[var(--cl-four)]"
              >
                {isLoading ? "Đang tìm kiếm..." : "Tìm Kiếm"}
              </Button>
            </div>
          </div>
        );
      
      default:
        return <FlightSearchBar />;
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

