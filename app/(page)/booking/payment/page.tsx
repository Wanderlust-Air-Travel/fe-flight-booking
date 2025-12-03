"use client";

import { useCallback, useState, Suspense, useEffect } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import axiosInstance from "@/lib/axios-instance";
import Breadcrumb from "@/app/components/Breadcrumb/Breadcrumb";
import InfoTicketBox from "@/app/components/InfoTicketBox/InfoTicketBox";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription } from "@/components/ui/alert";
import useInfoTicket from "@/app/zustand/storeInfoTicket";
import useUserStore from "@/app/zustand/storeUser";
import FormatPrice from "@/app/components/FormatPrice/FormatPrice";
import { PaymentStatus } from "@/types/payment";
import { usePaymentStatus } from "@/app/hooks/use-payment-status";
import { showSuccess, showError } from "@/lib/toast";

const PaymentPageContent = () => {
  const searchParams = useSearchParams();
  const router = useRouter();
  const { accessToken } = useUserStore();

  const bookingId = searchParams.get("bookingId");
  const { data: ticketData } = useInfoTicket();
  const [status, setStatus] = useState<PaymentStatus>("idle");
  const [error, setError] = useState<string | null>(null);
  const [paymentId, setPaymentId] = useState<string | null>(null);
  const [pollingMessage, setPollingMessage] = useState<string | null>(null);

  // WebSocket: Real-time payment status updates
  const { 
    isSubscribed: isPaymentStatusSubscribed, 
    paymentStatus, 
    status: paymentStatusValue, 
    isSuccess, 
    isFailed, 
    isPending 
  } = usePaymentStatus(bookingId, paymentId);

  // Handle real-time payment status updates from WebSocket
  useEffect(() => {
    if (!paymentStatus) return;

    if (isSuccess) {
      setStatus("success");
      setPollingMessage(null);
      showSuccess("Payment successful! Redirecting to confirmation...");
      // Redirect to confirmation page
      setTimeout(() => {
        router.push(`/booking/confirmation?bookingId=${bookingId}&paymentId=${paymentStatus.paymentId}`);
      }, 1500);
    } else if (isFailed) {
      setStatus("failed");
      setPollingMessage(null);
      setError("Payment failed. Please check your payment or try another method.");
      showError("Payment failed. Please check your payment or try another method.");
    } else if (isPending) {
      setStatus("processing");
      setPollingMessage("Waiting for payment confirmation from gateway...");
    }
  }, [paymentStatus, isSuccess, isFailed, isPending, bookingId, router]);

  const pollPaymentStatus = useCallback(
    async (paymentId: string) => {
      if (!paymentId) {
        setStatus("failed");
        setError("Payment ID is missing. Please try again or contact support.");
        return;
      }

      // Poll tối đa ~2 phút (40 lần, mỗi lần cách nhau 3s)
      const maxAttempts = 40;
      const delayMs = 3000;

      for (let attempt = 1; attempt <= maxAttempts; attempt++) {
        try {
          const res = await axiosInstance.get(`/api/payments/${paymentId}`);
          const payment = res.data;

          if (!payment) {
            setStatus("failed");
            setError("Could not retrieve payment information. Please try again.");
            return;
          }

          if (payment?.status === "success") {
            setStatus("success");
            setPollingMessage(null);
            // Khi payment success → chuyển sang trang confirmation, dùng bookingId từ payment
            const bookingId = payment.bookingId;
            router.push(
              `/booking/confirmation?bookingId=${bookingId}&paymentId=${payment.paymentId}`
            );
            return;
          }

          if (payment?.status === "failed") {
            setStatus("failed");
            setPollingMessage(null);
            setError(
              "Payment failed. Please check your payment or try another method."
            );
            return;
          }

          // pending → tiếp tục chờ
          setPollingMessage(
            "Waiting for payment confirmation from gateway..."
          );
        } catch (err: any) {
          console.error("Error polling payment status:", err);
          setError(
            err?.response?.data?.message ||
              err?.message ||
              "Failed to check payment status"
          );
          setStatus("failed");
          setPollingMessage(null);
          return;
        }

        await new Promise((resolve) => setTimeout(resolve, delayMs));
      }

      // Hết thời gian chờ
      setStatus("failed");
      setPollingMessage(null);
      setError(
        "Payment confirmation timeout. Please check your transaction at the gateway or try again."
      );
    },
    [router]
  );

  const handlePayNow = useCallback(async () => {
    if (!bookingId) {
      setError("Missing bookingId. Please go back to booking page.");
      return;
    }

    setStatus("processing");
    setError(null);

    try {
      // BEST PRACTICE:
      // - Frontend chỉ gọi API payment của backend (stateless)
      // - Backend xử lý logic: tạo Payment, gọi payment gateway (mock), cập nhật Booking
      // - Ở môi trường production, backend có thể trả về paymentUrl để redirect sang cổng thanh toán
      const response = await axiosInstance.post(
        `/api/payments/bookings/${bookingId}/process`,
        {
          // Dùng EWALLET để đi qua MoMo gateway (mock/sandbox)
          paymentMethodCode: "EWALLET",
        },
        {
          // Payment có thể lâu hơn 30s → tăng timeout cho request này
          timeout: 60000,
        }
      );

      const payment = response.data;

      if (!payment?.paymentId) {
        setStatus("failed");
        setError(
          "Payment was created but we couldn't get the payment ID. Please contact support with your booking ID: " +
            bookingId
        );
        return;
      }

      setPaymentId(payment.paymentId);
      
      // Mở trang thanh toán dev simulator trong tab mới để user thao tác
      if (payment.paymentUrl) {
        window.open(payment.paymentUrl, "_blank");
      } else {
        // Fallback: Redirect to dev payment simulator if paymentUrl is not provided
        const devPaymentUrl = `/payments/dev?paymentId=${payment.paymentId}&bookingId=${bookingId}`;
        window.open(devPaymentUrl, "_blank");
      }
      
      // Use WebSocket for real-time updates (preferred)
      // Fallback to polling if WebSocket is not connected
      if (!isPaymentStatusSubscribed) {
        setPollingMessage("Waiting for payment confirmation from gateway...");
        await pollPaymentStatus(payment.paymentId);
      } else {
        // WebSocket is connected - it will handle status updates automatically
        setPollingMessage(null);
        setStatus("processing");
      }
    } catch (err: any) {
      console.error("Error processing payment:", err);
      
      // Ưu tiên sử dụng message business từ BE (400), fallback sang lỗi hệ thống (5xx / network)
      const status = err?.response?.status as number | undefined;
      const serverMessage = err?.response?.data?.message as string | undefined;

      // Check if booking is already paid - redirect to confirmation instead of showing error
      if (
        serverMessage &&
        (serverMessage.toLowerCase().includes("already paid") ||
          serverMessage.toLowerCase().includes("booking is already paid"))
      ) {
        // Booking is already paid - redirect to confirmation page
        setStatus("success");
        setError(null);
        setPollingMessage("This booking has already been paid. Redirecting to confirmation...");
        
        // Try to get paymentId from existing payments
        // Note: This API requires authentication, so we'll just redirect with bookingId
        // The confirmation page can fetch payment details if needed
        setTimeout(() => {
          router.push(`/booking/confirmation?bookingId=${bookingId}`);
        }, 1500);
        return;
      }

      setStatus("failed");

      if (status && status >= 500) {
        setError(
          serverMessage ||
            "Payment service is temporarily unavailable. Please try again later or contact support."
        );
      } else {
        setError(
          serverMessage ||
            err?.message ||
            "Failed to process payment. Please try again."
        );
      }
    }
  }, [bookingId, pollPaymentStatus, router]);

  if (!bookingId) {
    return (
      <main className="flex flex-col pt-[var(--hd)] gap-y-[var(--rowY)]">
        <Breadcrumb />
        <div className="container">
          <div className="text-center py-[4rem]">
            <p className="text-lg text-red-500">
              Booking ID is missing. Please restart the booking process.
            </p>
            <Button
              onClick={() => router.push("/search/flights")}
              className="mt-[2rem]"
            >
              Back to Search
            </Button>
          </div>
        </div>
      </main>
    );
  }

  return (
    <main className="flex flex-col pt-[var(--hd)] gap-y-[var(--rowY)]">
      <Breadcrumb />
      <InfoTicketBox />

      <section>
        <div className="container">
          <div className="flex flex-wrap -mx-[1.2rem]">
            <div className="px-[1.2rem] w-full lg:w-[70%]">
              <div className="bg-white rounded-[1.2rem] sm:rounded-[1.6rem] p-[2rem] sm:p-[2.4rem] border border-[var(--cl-six)] shadow-md">
                <h2 className="text-xl sm:text-2xl font-bold text-[var(--cl-pri)] mb-[2rem]">
                  Payment
                </h2>

                <div className="mb-[2rem] p-[1.2rem] sm:p-[1.6rem] bg-[var(--cl-pri)]/5 rounded-lg border border-[var(--cl-pri)]/20">
                  <p className="text-sm text-gray-600 mb-[0.4rem]">
                    Booking ID
                  </p>
                  <p className="text-base sm:text-lg font-semibold text-[var(--cl-pri)]">
                    {bookingId}
                  </p>
                </div>

                {ticketData && (
                  <div className="mb-[2rem] p-[1.6rem] sm:p-[2rem] bg-gradient-to-br from-[var(--cl-pri)]/10 to-[var(--cl-pri)]/5 rounded-lg border-2 border-[var(--cl-pri)]/30 shadow-sm">
                    <p className="text-base sm:text-lg font-bold text-[var(--cl-pri)] mb-[1.2rem] uppercase tracking-wide">
                      Payment Details
                    </p>
                    <div className="space-y-[0.8rem]">
                      <div className="flex justify-between items-center">
                        <p className="text-sm sm:text-base text-gray-700">
                          Fare:
                        </p>
                        <p className="text-base sm:text-lg font-semibold text-[var(--cl-pri)]">
                          {ticketData.typeTicket || "Selected fare"}
                        </p>
                      </div>
                      <div className="flex justify-between items-center pt-[0.8rem] border-t border-[var(--cl-pri)]/20">
                        <p className="text-sm sm:text-base text-gray-700">
                          Amount to pay:
                        </p>
                        <p className="text-xl sm:text-2xl font-bold text-[var(--cl-pri)]">
                          {FormatPrice(ticketData.price || 0)}
                        </p>
                      </div>
                    </div>
                  </div>
                )}

                {error && (
                  <div className="mb-[2rem] p-[1.2rem] sm:p-[1.6rem] bg-red-50 border-2 border-red-300 rounded-lg">
                    <p className="text-sm sm:text-base text-red-700 font-medium">
                      {error}
                    </p>
                  </div>
                )}

                {/* WebSocket Connection Status */}
                {isPaymentStatusSubscribed && paymentId && (
                  <div className="mb-[2rem] p-[1.2rem] sm:p-[1.6rem] bg-green-50 border-2 border-green-400 rounded-lg">
                    <p className="text-sm sm:text-base text-green-700 font-medium">
                      Real-time payment status monitoring active
                    </p>
                  </div>
                )}

                {/* Polling fallback message (only shown if WebSocket is not connected) */}
                {pollingMessage && !error && !isPaymentStatusSubscribed && (
                  <div className="mb-[2rem] p-[1.2rem] sm:p-[1.6rem] bg-yellow-50 border-2 border-yellow-400 rounded-lg">
                    <p className="text-sm sm:text-base text-yellow-700 font-medium">
                      {pollingMessage}
                    </p>
                    {paymentId && (
                      <p className="text-xs text-yellow-600 mt-[0.8rem]">
                        Payment ID: {paymentId}
                      </p>
                    )}
                  </div>
                )}

                {/* WebSocket status message */}
                {isPaymentStatusSubscribed && isPending && (
                  <div className="mb-[2rem] p-[1.2rem] sm:p-[1.6rem] bg-blue-50 border-2 border-blue-400 rounded-lg">
                    <p className="text-sm sm:text-base text-blue-700 font-medium">
                      Waiting for payment confirmation from gateway...
                    </p>
                    {paymentId && (
                      <p className="text-xs text-blue-600 mt-[0.8rem]">
                        Payment ID: {paymentId}
                      </p>
                    )}
                  </div>
                )}

                {status === "success" && (
                  <div className="mb-[2rem] p-[1.2rem] sm:p-[1.6rem] bg-green-50 border-2 border-green-400 rounded-lg">
                    <p className="text-sm sm:text-base text-green-700 font-medium">
                      Payment successful! Redirecting to confirmation...
                    </p>
                  </div>
                )}

                <div className="flex flex-col sm:flex-row gap-[1rem] sm:gap-[1.2rem] pt-[1rem] border-t border-gray-200">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() =>
                      router.push(`/booking/info?flightInstanceId=`)
                    }
                    className="w-full sm:w-auto px-[2.4rem] py-[1.2rem] sm:py-[1.4rem] text-base sm:text-lg font-semibold border-2 border-gray-300 hover:border-[var(--cl-pri)] hover:text-[var(--cl-pri)] rounded-lg transition-all duration-200"
                  >
                    Back
                  </Button>
                  <Button
                    type="button"
                    onClick={handlePayNow}
                    disabled={status === "processing"}
                    className="w-full sm:flex-1 bg-[var(--cl-pri)] hover:bg-[var(--cl-pri)]/90 text-white px-[2.4rem] py-[1.2rem] sm:py-[1.4rem] text-base sm:text-lg font-semibold rounded-lg transition-all duration-200 shadow-md hover:shadow-lg disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {status === "processing" ? "Processing..." : "Pay Now"}
                  </Button>
                </div>
              </div>
            </div>

            <div className="px-[1.2rem] w-full lg:w-[30%]">
              {/* Có thể reuse Booking Summary hoặc Payment Summary trong tương lai */}
            </div>
          </div>
        </div>
      </section>
    </main>
  );
};

const PaymentPage = () => {
  return (
    <Suspense fallback={
      <main className="flex flex-col pt-[var(--hd)] gap-y-[var(--rowY)]">
        <Breadcrumb />
        <div className="container">
          <div className="text-center py-[4rem]">
            <p className="text-lg">Loading...</p>
          </div>
        </div>
      </main>
    }>
      <PaymentPageContent />
    </Suspense>
  );
};

export default PaymentPage;


