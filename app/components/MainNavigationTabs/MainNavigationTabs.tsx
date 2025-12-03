"use client";

import { Plane, Ticket, Calendar } from "lucide-react";
import { cn } from "@/lib/utils";

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
    <div className="w-full bg-white rounded-t-lg border-b border-gray-200">
      <div className="container px-0">
        <div className="flex items-center gap-0">
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
                  "border-b-2",
                  active
                    ? "bg-white text-[var(--cl-pri)] border-[var(--cl-pri)]"
                    : "bg-gray-50 text-gray-600 border-transparent hover:text-[var(--cl-pri)] hover:bg-gray-100",
                  index === 0 && "rounded-tl-lg",
                  index === tabs.length - 1 && "rounded-tr-lg"
                )}
              >
                <Icon className={cn(
                  "w-5 h-5 md:w-6 md:h-6 flex-shrink-0 transition-colors duration-200",
                  active ? "text-[var(--cl-pri)]" : "text-gray-600"
                )} />
                <span className="hidden sm:inline font-medium">{tab.label}</span>
                <span className="sm:hidden font-medium">{tab.label.split(" ")[0]}</span>
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default MainNavigationTabs;

