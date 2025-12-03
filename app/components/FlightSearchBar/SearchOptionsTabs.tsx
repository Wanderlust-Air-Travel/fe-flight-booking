"use client";

import { cn } from "@/lib/utils";
import { SearchOption, SearchOptionsTabsProps } from "@/types/search-options-tabs-type";

const SearchOptionsTabs = ({ activeOption, onOptionChange }: SearchOptionsTabsProps) => {
  const options: { value: SearchOption; label: string }[] = [
    { value: "flight", label: "Tìm chuyến bay" },
    { value: "booking-code", label: "Mã Đặt Chỗ" },
    { value: "ticket-number", label: "Số Vé" },
    { value: "membership", label: "Số Hội Viên" },
  ];

  // Only show booking-code, ticket-number, membership on landing page
  // For other pages, only show flight search
  const visibleOptions = options;

  return (
    <div className="flex items-center gap-0 border-b border-gray-200 bg-white rounded-t-lg overflow-hidden">
      {visibleOptions.map((option, index) => (
        <button
          key={option.value}
          type="button"
          onClick={() => onOptionChange(option.value)}
          className={cn(
            "px-4 py-2 text-sm font-medium transition-colors relative",
            "hover:bg-gray-50",
            activeOption === option.value
              ? "text-[var(--cl-pri)] border-b-2 border-[var(--cl-pri)] bg-white"
              : "text-gray-600 hover:text-[var(--cl-pri)]",
            index === 0 && "rounded-tl-lg"
          )}
        >
          {option.label}
        </button>
      ))}
    </div>
  );
};

export default SearchOptionsTabs;

