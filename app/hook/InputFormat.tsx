"use client"
import { Input } from "@/components/ui/input";
import { InputProps } from "@/types/input-props";
import { useFormikInput } from "./UseFormikInput";
import { AlertCircle, Eye, EyeOff } from "lucide-react";
import { useState } from "react";
import { cn } from "@/lib/utils";

export const InputFormat = ({
    name,
    label,
    placeholder,
    type = "text",
    formatDob = false,
    formatPhone = false,
    formatName = false,
    password = false,
}: InputProps) => {
    const { field, error, isError } = useFormikInput(name);
    const hasError = Boolean(isError && error);

    const [isShow, setIShow] = useState<boolean>(false)

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        let value = e.target.value;

        // Auto format DOB -> DD/MM/YYYY
        if (formatDob) {
            // Chỉ cho nhập số
            value = value.replace(/[^\d]/g, "");

            // Tự thêm /
            if (value.length > 2) value = value.slice(0, 2) + "/" + value.slice(2);
            if (value.length > 5) value = value.slice(0, 5) + "/" + value.slice(5);

            // Giới hạn 10 ký tự (DD/MM/YYYY)
            if (value.length > 10) value = value.slice(0, 10);
        }

        if (formatPhone) {
            value = value.replace(/\D/g, ""); // xoá hết cái gì không phải số
        }

        // Name: chỉ cho nhập chữ (có dấu) + khoảng trắng
        if (formatName) {
            value = value.replace(/[^A-Za-zÀ-ỹ\s]/g, ""); // xoá số, ký tự đặc biệt
        }

        field.onChange({
            target: {
                name: field.name,
                value,
            },
        });
    };

    const handleShowPass = () => {
        setIShow(!isShow)
    }

    return (
        <label className="flex flex-col gap-y-[0.8rem]">
            <p
                className={cn(
                    "font-medium",
                    "text-sm",
                    hasError ? "text-destructive" : "text-[var(--cl-pri)]"
                )}
            >
                {label}
            </p>

            <div className="relative flex flex-col gap-y-1">
                <Input
                    {...field}
                    onChange={handleChange}
                    type={
                        password
                            ? (isShow ? "text" : "password")
                            : (type || "text")
                    }
                    placeholder={placeholder}
                    maxLength={formatDob ? 10 : undefined}
                    aria-invalid={hasError}
                    className={cn(
                        "h-[4rem] px-[1rem] placeholder:text-[var(--cl-six)] !text-[var(--cl-pri)] text-mn border-[0.1rem] border-[var(--cl-six)] focus:!border-[var(--cl-pri)] transition-all duration-200 ease-linear",
                        password && "pr-[4rem]",
                        hasError && "border-destructive focus:!border-destructive focus:ring-destructive/20"
                    )}
                />

                {password && (
                    <span
                        onClick={handleShowPass}
                        className="absolute top-1/2 -translate-y-1/2 right-0 w-[4rem] h-full flex justify-center items-center cursor-pointer z-10"
                    >
                        {!isShow ? (
                            <Eye className="text-[var(--cl-pri)] w-[50%] h-[50%]" />
                        ) : (
                            <EyeOff className="text-[var(--cl-pri)] w-[50%] h-[50%]" />
                        )}
                    </span>
                )}

                {hasError && (
                    <div className="flex items-start gap-2 text-xs md:text-sm text-destructive font-medium animate-in fade-in-0 slide-in-from-top-1">
                        <AlertCircle className="h-4 w-4 flex-shrink-0 mt-0.5" aria-hidden="true" />
                        <span>{error}</span>
                    </div>
                )}
            </div>
        </label>
    );
};
