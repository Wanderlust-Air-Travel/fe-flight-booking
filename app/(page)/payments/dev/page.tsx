"use client";

import { useSearchParams, useRouter } from "next/navigation";
import { useState, Suspense } from "react";
import axiosInstance from "@/lib/axios-instance";
import { Button } from "@/components/ui/button";
import Breadcrumb from "@/app/components/Breadcrumb/Breadcrumb";

const DevPaymentPageContent = () => {
  const searchParams = useSearchParams();
  const router = useRouter();
  const paymentId = searchParams.get("paymentId");

  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleDevResult = async (status: "success" | "failed") => {
    if (!paymentId) return;
    setSubmitting(true);
    setError(null);

    try {
      await axiosInstance.post("/api/payments/webhooks/dev", {
        paymentId,
        status,
      });
      // Sau khi webhook xử lý xong, tự động đóng tab
      // Nếu không thể đóng (e.g., không phải tab được mở bởi JavaScript), sẽ chuyển về trang chủ
      if (window.opener) {
        // Nếu là popup được mở bởi window.open, đóng popup này
        window.close();
      } else {
        // Nếu không, chuyển về trang chủ
        router.push("/");
      }
    } catch (err: any) {
      console.error("Error sending dev webhook:", err);
      setError(
        err?.response?.data?.message ||
          err?.message ||
          "Failed to send dev payment result"
      );
    } finally {
      setSubmitting(false);
    }
  };

  if (!paymentId) {
    return (
      <main className="flex flex-col pt-[var(--hd)] gap-y-[var(--rowY)]">
        <Breadcrumb />
        <div className="container">
          <div className="max-w-xl mx-auto bg-white rounded-[1.2rem] sm:rounded-[1.6rem] p-[2rem] sm:p-[2.4rem] border-2 border-red-300 shadow-md">
            <div className="text-center py-[2rem]">
              <div className="mb-[1.2rem]">
                <div className="w-[4.8rem] h-[4.8rem] mx-auto bg-red-100 rounded-full flex items-center justify-center mb-[1.2rem]">
                  <svg className="w-[2.4rem] h-[2.4rem] text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
              </div>
              <p className="text-lg sm:text-xl font-semibold text-red-600 mb-[0.8rem]">
                Payment ID Missing
              </p>
              <p className="text-sm sm:text-base text-gray-600">
                Please start the payment flow again.
              </p>
            </div>
          </div>
        </div>
      </main>
    );
  }

  return (
    <main className="flex flex-col pt-[var(--hd)] gap-y-[var(--rowY)]">
      <Breadcrumb />
      <section>
        <div className="container">
          <div className="max-w-2xl mx-auto bg-white rounded-[1.2rem] sm:rounded-[1.6rem] p-[2rem] sm:p-[2.4rem] md:p-[3rem] border border-[var(--cl-six)] shadow-lg">
            {/* Header */}
            <div className="mb-[2.4rem]">
              <div className="flex items-center gap-[1.2rem] mb-[1.2rem]">
                <div className="w-[4.8rem] h-[4.8rem] bg-[var(--cl-pri)]/10 rounded-full flex items-center justify-center">
                  <svg className="w-[2.4rem] h-[2.4rem] text-[var(--cl-pri)]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                <h1 className="text-2xl sm:text-3xl font-bold text-[var(--cl-pri)]">
                  Dev Payment Simulator
                </h1>
              </div>
              <p className="text-sm sm:text-base text-gray-600 leading-relaxed">
                This is a development-only payment page. Choose the result below to simulate a successful or failed payment.
              </p>
            </div>

            {/* Payment ID Section */}
            <div className="mb-[2.4rem] p-[1.6rem] sm:p-[2rem] bg-[var(--cl-pri)]/5 rounded-lg border border-[var(--cl-pri)]/20">
              <p className="text-xs sm:text-sm text-gray-600 mb-[0.8rem] uppercase tracking-wide font-medium">
                Payment ID
              </p>
              <p className="text-sm sm:text-base font-mono font-semibold text-[var(--cl-pri)] break-all">
                {paymentId}
              </p>
            </div>

            {/* Error Message */}
            {error && (
              <div className="mb-[2rem] p-[1.2rem] sm:p-[1.6rem] bg-red-50 border-2 border-red-300 rounded-lg">
                <div className="flex items-start gap-[0.8rem]">
                  <svg className="w-[2rem] h-[2rem] text-red-500 flex-shrink-0 mt-[0.2rem]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  <p className="text-sm sm:text-base text-red-700 font-medium">
                    {error}
                  </p>
                </div>
              </div>
            )}

            {/* Action Buttons */}
            <div className="flex flex-col sm:flex-row gap-[1rem] sm:gap-[1.2rem] pt-[1rem] border-t border-gray-200">
              <Button
                type="button"
                onClick={() => handleDevResult("success")}
                disabled={submitting}
                className="flex-1 bg-[var(--cl-pri)] hover:bg-[var(--cl-pri)]/90 text-white px-[2.4rem] py-[1.2rem] sm:py-[1.4rem] text-base sm:text-lg font-semibold rounded-lg transition-all duration-200 shadow-md hover:shadow-lg disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {submitting ? (
                  <span className="flex items-center gap-[0.8rem]">
                    <svg className="animate-spin h-[1.6rem] w-[1.6rem] text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Processing...
                  </span>
                ) : (
                  <span className="flex items-center gap-[0.8rem]">
                    <svg className="w-[1.6rem] h-[1.6rem]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                    Mark as Success
                  </span>
                )}
              </Button>
              <Button
                type="button"
                variant="outline"
                onClick={() => handleDevResult("failed")}
                disabled={submitting}
                className="flex-1 border-2 border-red-300 hover:border-red-400 hover:bg-red-50 text-red-600 hover:text-red-700 px-[2.4rem] py-[1.2rem] sm:py-[1.4rem] text-base sm:text-lg font-semibold rounded-lg transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {submitting ? (
                  <span className="flex items-center gap-[0.8rem]">
                    <svg className="animate-spin h-[1.6rem] w-[1.6rem] text-red-600" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Processing...
                  </span>
                ) : (
                  <span className="flex items-center gap-[0.8rem]">
                    <svg className="w-[1.6rem] h-[1.6rem]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                    Mark as Failed
                  </span>
                )}
              </Button>
            </div>
          </div>
        </div>
      </section>
    </main>
  );
};

const DevPaymentPage = () => {
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
      <DevPaymentPageContent />
    </Suspense>
  );
};

export default DevPaymentPage;


