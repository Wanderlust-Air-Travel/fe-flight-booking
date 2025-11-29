"use client";

import { useCallback, useState } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import axiosInstance from "@/lib/axios-instance";
import Breadcrumb from "@/app/components/Breadcrumb/Breadcrumb";
import InfoTicketBox from "@/app/components/InfoTicketBox/InfoTicketBox";
import { Button } from "@/components/ui/button";
import useInfoTicket from "@/app/zustand/storeInfoTicket";
import FormatPrice from "@/app/components/FormatPrice/FormatPrice";

type PaymentStatus = "idle" | "processing" | "success" | "failed";

const PaymentPage = () => {
  const searchParams = useSearchParams();
  const router = useRouter();

  const bookingId = searchParams.get("bookingId");
  const { data: ticketData } = useInfoTicket();
  const [status, setStatus] = useState<PaymentStatus>("idle");
  const [error, setError] = useState<string | null>(null);
  const [paymentId, setPaymentId] = useState<string | null>(null);
  const [pollingMessage, setPollingMessage] = useState<string | null>(null);

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
      
      // Không tin status ngay lập tức nữa → luôn kiểm tra trong DB qua GET /api/payments/:id
      setPollingMessage("Waiting for payment confirmation from gateway...");
      await pollPaymentStatus(payment.paymentId);
    } catch (err: any) {
      console.error("Error processing payment:", err);
      setStatus("failed");

      // Ưu tiên sử dụng message business từ BE (400), fallback sang lỗi hệ thống (5xx / network)
      const status = err?.response?.status as number | undefined;
      const serverMessage = err?.response?.data?.message as string | undefined;

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
              <div className="bg-white rounded-[1rem] p-[2rem] border border-[var(--cl-third)]">
                <h2 className="text-lg font-bold text-[var(--cl-pri)] mb-[1.5rem]">
                  Payment
                </h2>

                <p className="mb-[1rem]">
                  Booking ID: <strong>{bookingId}</strong>
                </p>

                {ticketData && (
                  <div className="mb-[1.5rem] p-[1rem] bg-blue-50 border border-blue-200 rounded text-blue-700">
                    <p className="font-semibold mb-[0.5rem]">
                      Payment Details
                    </p>
                    <p>
                      Fare:{" "}
                      <strong>{ticketData.typeTicket || "Selected fare"}</strong>
                    </p>
                    <p>
                      Amount to pay:{" "}
                      <strong>{FormatPrice(ticketData.price || 0)}</strong>
                    </p>
                  </div>
                )}

                {error && (
                  <div className="mb-[1.5rem] p-[1rem] bg-red-50 border border-red-200 rounded text-red-600">
                    {error}
                  </div>
                )}

                {pollingMessage && !error && (
                  <div className="mb-[1.5rem] p-[1rem] bg-yellow-50 border border-yellow-200 rounded text-yellow-700">
                    {pollingMessage}
                    {paymentId && (
                      <span className="block text-xs mt-[0.5rem]">
                        Payment ID: {paymentId}
                      </span>
                    )}
                  </div>
                )}

                {status === "success" && (
                  <div className="mb-[1.5rem] p-[1rem] bg-green-50 border border-green-200 rounded text-green-600">
                    Payment successful! Redirecting to confirmation...
                  </div>
                )}

                <div className="flex gap-x-[1rem]">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() =>
                      router.push(`/booking/info?flightInstanceId=`)
                    }
                  >
                    Back
                  </Button>
                  <Button
                    type="button"
                    onClick={handlePayNow}
                    disabled={status === "processing"}
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

export default PaymentPage;


