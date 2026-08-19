"use client";

import Breadcrumb from "@/app/components/Breadcrumb/Breadcrumb";
import { Button } from "@/components/ui/button";
import { localizedHref, type Locale } from "@/i18n/config";
import axiosInstance from "@/lib/axios-instance";
import { useLocale } from "next-intl";
import { AlertCircle, Check, CreditCard, Loader2, X } from "lucide-react";
import { useRouter, useSearchParams } from "next/navigation";
import { Suspense, useState } from "react";

const DevPaymentPageContent = () => {
  const searchParams = useSearchParams();
  const router = useRouter();
  const locale = useLocale() as Locale;
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
      if (window.opener) {
        window.close();
      } else {
        router.push(localizedHref("/", locale));
      }
    } catch (err: any) {
      console.error("Error sending dev webhook:", err);
      setError(err?.response?.data?.message || err?.message || "Failed to send dev payment result");
    } finally {
      setSubmitting(false);
    }
  };

  if (!paymentId) {
    return (
      <main className="flex flex-col pt-[var(--hd)] gap-y-[var(--rowY)] min-h-[60vh]">
        <Breadcrumb />
        <div className="container flex-1 flex items-center justify-center py-12">
          <div className="w-full max-w-[28rem] bg-white rounded-2xl border border-[var(--cl-six)] shadow-sm overflow-hidden">
            <div className="bg-red-50/80 px-6 py-4 border-b border-red-100">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-white/90 flex items-center justify-center shadow-sm">
                  <AlertCircle className="w-5 h-5 text-[var(--cl-red)]" />
                </div>
                <div>
                  <h1 className="text-base font-bold text-gray-900">Payment ID missing</h1>
                  <p className="text-[var(--cl-gray)] text-sm mt-0.5">
                    Start the payment flow again from checkout.
                  </p>
                </div>
              </div>
            </div>
            <div className="p-6" />
          </div>
        </div>
      </main>
    );
  }

  return (
    <main className="flex flex-col pt-[var(--hd)] gap-y-[var(--rowY)] min-h-[60vh]">
      <Breadcrumb />
      <section className="container flex-1 flex items-center justify-center py-8 sm:py-12">
        <div className="w-full max-w-[32rem]">
          <div className="bg-white rounded-2xl border border-[var(--cl-six)] shadow-sm overflow-hidden">
            {/* Header strip */}
            <div className="bg-[var(--cl-pri)] px-6 py-5">
              <div className="flex items-center gap-3">
                <div className="w-11 h-11 rounded-xl bg-white/15 flex items-center justify-center">
                  <CreditCard className="w-6 h-6 text-white" />
                </div>
                <div>
                  <span className="inline-block text-[10px] font-semibold uppercase tracking-widest text-white/80 mb-0.5">
                    Dev only
                  </span>
                  <h1 className="text-lg font-bold text-white tracking-tight">Payment Simulator</h1>
                </div>
              </div>
            </div>

            <div className="p-6 sm:p-8">
              <p className="text-sm text-[var(--cl-gray)] mb-5">
                Simulate success or failure for this payment.
              </p>

              <div className="mb-6">
                <label className="block text-sm font-semibold text-[var(--cl-gray)] uppercase tracking-wider mb-2">
                  Payment ID
                </label>
                <div className="rounded-xl bg-gray-50/80 border border-gray-200/80 px-4 py-3 font-mono text-[1.3rem] text-gray-800 break-all leading-snug">
                  {paymentId}
                </div>
              </div>

              {error && (
                <div className="mb-6 flex items-start gap-3 rounded-xl bg-red-50 border border-red-100 px-4 py-3">
                  <AlertCircle className="w-5 h-5 text-[var(--cl-red)] flex-shrink-0 mt-0.5" />
                  <p className="text-sm text-red-800 font-medium">{error}</p>
                </div>
              )}

              <div className="flex flex-col sm:flex-row gap-3">
                <Button
                  type="button"
                  onClick={() => handleDevResult("success")}
                  disabled={submitting}
                  className="flex-1 h-12 bg-[var(--cl-pri)] hover:bg-[var(--cl-pri)]/90 text-white font-semibold rounded-xl shadow-md shadow-[var(--cl-pri)]/20 hover:shadow-lg hover:shadow-[var(--cl-pri)]/25 transition-all duration-200 inline-flex items-center justify-center gap-2"
                >
                  {submitting ? (
                    <Loader2 className="w-5 h-5 animate-spin" />
                  ) : (
                    <>
                      <Check className="w-5 h-5" strokeWidth={2.5} />
                      Mark as Success
                    </>
                  )}
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => handleDevResult("failed")}
                  disabled={submitting}
                  className="flex-1 h-12 border-2 border-gray-200 text-gray-700 hover:bg-gray-50 hover:border-gray-300 hover:text-gray-900 font-semibold rounded-xl inline-flex items-center justify-center gap-2 transition-all duration-200"
                >
                  {submitting ? (
                    <Loader2 className="w-5 h-5 animate-spin text-gray-500" />
                  ) : (
                    <>
                      <X className="w-5 h-5" strokeWidth={2.5} />
                      Mark as Failed
                    </>
                  )}
                </Button>
              </div>
            </div>
          </div>
        </div>
      </section>
    </main>
  );
};

const DevPaymentPage = () => {
  return (
    <Suspense
      fallback={
        <main className="flex flex-col pt-[var(--hd)] gap-y-[var(--rowY)]">
          <Breadcrumb />
          <div className="container flex justify-center items-center py-24">
            <Loader2 className="w-8 h-8 animate-spin text-[var(--cl-pri)]" />
          </div>
        </main>
      }
    >
      <DevPaymentPageContent />
    </Suspense>
  );
};

export default DevPaymentPage;
