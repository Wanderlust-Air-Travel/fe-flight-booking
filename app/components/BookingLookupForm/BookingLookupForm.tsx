"use client";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { AlertCircle } from "lucide-react";
import { useState } from "react";

type BookingLookupFormProps = {
  onSubmit: (code: string) => Promise<void>;
  description?: string;
  helper?: string;
  placeholder?: string;
  submitLabel: string;
  submittingLabel?: string;
  initialCode?: string;
  maxLength?: number;
};

/**
 * Single-input booking lookup form.
 * Used by Banner (check-in / my-bookings) and CheckInPageContent.
 */
export function BookingLookupForm({
  onSubmit,
  description,
  helper,
  placeholder = "Ví dụ: ABC123",
  submitLabel,
  submittingLabel,
  initialCode = "",
  maxLength = 10,
}: BookingLookupFormProps) {
  const [code, setCode] = useState(initialCode);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const trimmed = code.trim();
    if (!trimmed) {
      setError("Vui lòng nhập mã đặt chỗ");
      return;
    }

    setIsLoading(true);
    setError(null);
    try {
      await onSubmit(trimmed);
    } catch (err) {
      const message =
        (err as { response?: { data?: { message?: string } }; message?: string })?.response?.data
          ?.message ||
        (err as { message?: string })?.message ||
        "Đã xảy ra lỗi";
      setError(message);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="bg-white rounded-lg">
      <div className="flex justify-between gap-x-[2rem] p-6">
        {description && (
          <div className="flex flex-col gap-y-[0.4rem] w-fit">
            <p className="text-base text-gray-700 font-medium">{description}</p>
            {helper && (
              <p className="text-sm text-gray-600 font-medium">
                <strong className="text-red-600">*</strong> {helper}
              </p>
            )}
          </div>
        )}

        <div className="w-[50%] relative">
          <Input
            type="text"
            placeholder={placeholder}
            value={code}
            onChange={(e) => {
              setCode(e.target.value.toUpperCase());
              setError(null);
            }}
            className="text-center text-xl md:text-2xl font-mono tracking-[0.2em] border-2 border-gray-300 focus:border-[var(--cl-pri)] focus:ring-2 focus:ring-[var(--cl-pri)]/20 h-[4.8rem]! md:h-16 transition-all duration-200 rounded-lg bg-white"
            maxLength={maxLength}
            disabled={isLoading}
            autoFocus
          />
          {error && (
            <Alert
              variant="destructive"
              className="border-red-300 bg-red-50 rounded-lg absolute left-0 w-full top-[105%]"
            >
              <AlertCircle className="h-4 w-4" />
              <AlertDescription className="text-sm font-medium">{error}</AlertDescription>
            </Alert>
          )}
        </div>

        <Button
          type="submit"
          disabled={isLoading || !code.trim()}
          className="w-full h-[4.8rem]! bg-[var(--cl-pri)] hover:bg-[var(--cl-third)] text-white font-bold py-5 md:py-6 text-base md:text-lg rounded-lg shadow-md hover:shadow-lg transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:shadow-md flex-1"
        >
          {isLoading ? submittingLabel ?? submitLabel : submitLabel}
        </Button>
      </div>
    </form>
  );
}
