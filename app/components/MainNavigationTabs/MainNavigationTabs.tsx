"use client";

import { usePathname, useRouter } from "next/navigation";
import Link from "next/link";
import { Plane, Ticket, Calendar } from "lucide-react";
import { cn } from "@/lib/utils";
import { TabItem } from "@/types/main-navigation-tabs-type";

const tabs: TabItem[] = [
  {
    id: "book-ticket",
    label: "Đặt Vé",
    path: "/",
    icon: Plane,
    paths: ["/", "/search", "/booking", "/choosecabin", "/service"],
  },
  {
    id: "check-in",
    label: "Làm Thủ Tục",
    path: "/check-in",
    icon: Ticket,
    paths: ["/check-in"],
  },
  {
    id: "my-bookings",
    label: "Đặt Chỗ Của Tôi",
    path: "/my-bookings",
    icon: Calendar,
    paths: ["/my-bookings", "/my-tickets", "/my-journey"],
  },
];

const MainNavigationTabs = () => {
  const pathname = usePathname();
  const router = useRouter();

  const isActive = (tab: TabItem): boolean => {
    return tab.paths.some((path) => pathname.startsWith(path));
  };

  const activeTab = tabs.find((tab) => isActive(tab)) || tabs[0];

  return (
    <div className="w-full bg-white border-b border-gray-200">
      <div className="container">
        <div className="flex items-center gap-0">
          {tabs.map((tab, index) => {
            const Icon = tab.icon;
            const active = isActive(tab);
            
            return (
              <Link
                key={tab.id}
                href={tab.path}
                className={cn(
                  "flex items-center gap-2 px-6 py-4 text-sm font-medium transition-colors relative",
                  "hover:bg-gray-50",
                  active
                    ? "bg-white text-[var(--cl-pri)] border-b-2 border-[var(--cl-pri)]"
                    : "text-gray-600 hover:text-[var(--cl-pri)]",
                  index === 0 && "rounded-tl-lg",
                  index === tabs.length - 1 && "rounded-tr-lg"
                )}
              >
                <Icon className={cn("w-5 h-5", active ? "text-[var(--cl-pri)]" : "text-gray-500")} />
                <span className="hidden sm:inline">{tab.label}</span>
                <span className="sm:hidden">{tab.label.split(" ")[0]}</span>
              </Link>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default MainNavigationTabs;

