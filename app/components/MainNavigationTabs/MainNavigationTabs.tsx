"use client";

import { cn } from "@/lib/utils";
import { Calendar, Plane, Ticket } from "lucide-react";

type MainTab = "book-ticket" | "check-in" | "my-bookings";

interface MainNavigationTabsProps {
  activeTab: MainTab;
  onTabChange: (tab: MainTab) => void;
}

const tabs: Array<{ id: MainTab; label: string; icon: typeof Plane }> = [
  {
    id: "book-ticket",
    label: "Đặt Vé",
    icon: Plane,
  },
  {
    id: "check-in",
    label: "Làm Thủ Tục",
    icon: Ticket,
  },
  {
    id: "my-bookings",
    label: "Đặt Chỗ Của Tôi",
    icon: Calendar,
  },
];

const MainNavigationTabs = ({ activeTab, onTabChange }: MainNavigationTabsProps) => {
  return (
    <div className="w-full  overflow-hidden border-b border-gray-200">
      <div className="flex items-center gap-0 rounded-t-2xl overflow-hidden!">
        {tabs.map((tab, index) => {
          const Icon = tab.icon;
          const active = activeTab === tab.id;

          return (
            <button
              key={tab.id}
              type="button"
              onClick={() => onTabChange(tab.id)}
              className={cn(
                "flex-1 flex items-center justify-center gap-2 px-4 py-4 md:py-5 text-base md:text-lg font-semibold transition-all duration-200 relative",
                "border-b-2 rounded-tl-none! rounded-tr-none! cursor-pointer not-last:border-r not-last:border-r-[#EEEEEE]",
                active
                  ? "bg-[var(--cl-pri)] text-[var(--cl-white)] border-[var(--cl-pri)]"
                  : "bg-[#CBCBCB] text-black border-transparent",
                index === 0 && "rounded-tl-lg",
                index === tabs.length - 1 && "rounded-tr-lg"
              )}
            >
              <Icon
                className={cn(
                  "w-5 h-5 md:w-6 md:h-6 flex-shrink-0 transition-colors duration-200",
                  active ? "text-[var(--cl-white)]" : "text-black"
                )}
              />
              <span className="hidden sm:inline font-medium">{tab.label}</span>
              <span className="sm:hidden font-medium">{tab.label.split(" ")[0]}</span>
            </button>
          );
        })}
      </div>
    </div>
  );
};

export default MainNavigationTabs;
