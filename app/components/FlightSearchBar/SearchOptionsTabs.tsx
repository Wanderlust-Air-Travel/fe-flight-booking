"use client";

import { cn } from "@/lib/utils";
import { SearchOption, SearchOptionsTabsProps } from "@/types/search-options-tabs-type";

const SearchOptionsTabs = ({ activeOption, onOptionChange }: SearchOptionsTabsProps) => {
  // These tabs are only used in check-in page, not on landing page
  // Landing page only shows flight search (no tabs needed)
  const options: { value: SearchOption; label: string }[] = [
    { value: "booking-code", label: "Mã Đặt Chỗ" },
    { value: "ticket-number", label: "Số Vé" },
    { value: "membership", label: "Số Hội Viên" },
  ];

  const visibleOptions = options;

  return (
    <div className="flex items-center gap-0 border-b border-gray-200">
      {visibleOptions.map((option, index) => (
        <button
          key={option.value}
          type="button"
          onClick={() => onOptionChange(option.value)}
          className={cn(
            "px-6 py-3 text-sm font-medium transition-colors duration-200",
            "flex items-center justify-center",
            activeOption === option.value
              ? "text-[var(--cl-pri)] border-b-2 border-[var(--cl-pri)]"
              : "text-gray-600 hover:text-[var(--cl-pri)]"
          )}
        >
          {option.label}
        </button>
      ))}
    </div>
  );
};

export default SearchOptionsTabs;

