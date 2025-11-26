"use client";

import { useSearchParams, useRouter } from "next/navigation";
import { useState } from "react";
import axiosInstance from "@/lib/axios-instance";
import { Button } from "@/components/ui/button";
import Breadcrumb from "@/app/components/Breadcrumb/Breadcrumb";

const DevPaymentPage = () => {
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
      // Sau khi webhook xử lý xong, chuyển về landing page (trang chủ)
      router.push("/");
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
          <div className="text-center py-[4rem]">
            <p className="text-lg text-red-500">
              paymentId is missing. Please start payment flow again.
            </p>
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
          <div className="max-w-xl mx-auto bg-white border border-[var(--cl-third)] rounded-[1rem] p-[2rem] flex flex-col gap-y-[1.5rem]">
            <h1 className="text-xl font-bold text-[var(--cl-pri)]">
              Dev Payment Simulator
            </h1>
            <p className="text-sm text-[var(--cl-third)]">
              This is a development-only payment page. Choose the result below
              to simulate a successful or failed payment.
            </p>
            <p className="text-sm">
              Payment ID: <strong>{paymentId}</strong>
            </p>

            {error && (
              <div className="p-[1rem] bg-red-50 border border-red-200 rounded text-red-600">
                {error}
              </div>
            )}

            <div className="flex gap-x-[1rem]">
              <Button
                type="button"
                onClick={() => handleDevResult("success")}
                disabled={submitting}
              >
                Mark as Success
              </Button>
              <Button
                type="button"
                variant="outline"
                onClick={() => handleDevResult("failed")}
                disabled={submitting}
              >
                Mark as Failed
              </Button>
            </div>
          </div>
        </div>
      </section>
    </main>
  );
};

export default DevPaymentPage;


