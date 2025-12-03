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
    <div className="w-full">
      <div className="container px-0">
        <div className="flex items-end gap-0">
          {tabs.map((tab, index) => {
            const Icon = tab.icon;
            const active = activeTab === tab.id;
            
            return (
              <button
                key={tab.id}
                type="button"
                onClick={() => onTabChange(tab.id)}
                className={cn(
                  "flex-1 flex items-center justify-center gap-2 px-4 py-5 text-base md:text-lg font-semibold transition-all duration-300 relative",
                  active
                    ? "bg-transparent text-[var(--cl-pri)]"
                    : "bg-gradient-to-r from-[var(--cl-pri)]/90 to-[var(--cl-pri)] text-white hover:from-[var(--cl-pri)] hover:to-[var(--cl-four)]",
                  index === 0 && active && "rounded-tl-lg",
                  index === tabs.length - 1 && active && "rounded-tr-lg"
                )}
                style={{
                  marginBottom: active ? 0 : undefined,
                }}
              >
                <Icon className={cn("w-5 h-5 md:w-6 md:h-6 flex-shrink-0", active ? "text-[var(--cl-pri)]" : "text-white")} />
                <span className="hidden sm:inline">{tab.label}</span>
                <span className="sm:hidden">{tab.label.split(" ")[0]}</span>
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default MainNavigationTabs;

