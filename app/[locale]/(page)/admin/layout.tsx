"use client";

import useUserStore from "@/app/zustand/storeUser";
import { type Locale, localizedHref, stripLocale } from "@/i18n/config";
import {
  Building2,
  DollarSign,
  Home,
  LayoutDashboard,
  LogOut,
  Luggage,
  Plane,
  Route,
  Sparkles,
  TrendingUp,
  Users,
} from "lucide-react";
import { useLocale, useTranslations } from "next-intl";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useState } from "react";

interface MenuItem {
  id: string;
  title: string;
  description: string;
  href: string;
  icon: string;
  color: string;
  bgColor: string;
}

interface DashboardResponse {
  items: MenuItem[];
  menuItems: MenuItem[];
}

const iconMap: Record<string, React.ComponentType<{ className?: string }>> = {
  Building2,
  DollarSign,
  Plane,
  Route,
  Users,
  TrendingUp,
  Luggage,
  Sparkles,
  LayoutDashboard,
};

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const router = useRouter();
  const fullPathname = usePathname();
  const locale = useLocale() as Locale;
  const strippedPath = stripLocale(fullPathname);
  const { isLoggedIn, accessToken, hydrated, logout } = useUserStore();
  const [menuItems, setMenuItems] = useState<MenuItem[]>([]);
  const [loading, setLoading] = useState(true);
  const tCommon = useTranslations("common");
  const t = useTranslations("admin");

  const handleLogout = () => {
    logout();
    // Điều hướng về trang chủ (locale prefix) sau khi đăng xuất
    router.push(localizedHref("/", locale));
  };

  useEffect(() => {
    if (hydrated && (!isLoggedIn || !accessToken)) {
      // Nếu user đã logout hoặc mất token, điều hướng về trang chủ
      router.push(localizedHref("/", locale));
    }
  }, [hydrated, isLoggedIn, accessToken, router, locale]);

  useEffect(() => {
    const fetchMenuItems = async () => {
      if (!accessToken) {
        setLoading(false);
        return;
      }

      try {
        const response = await fetch("/api/admin/dashboard", {
          headers: {
            Authorization: `Bearer ${accessToken}`,
          },
        });

        if (response.ok) {
          const data: DashboardResponse = await response.json();
          // Add Dashboard menu item at the beginning
          const dashboardItem: MenuItem = {
            id: "dashboard",
            title: t("sidebar.dashboard"),
            description: "",
            href: localizedHref("/admin", locale),
            icon: "LayoutDashboard",
            color: "",
            bgColor: "",
          };
          setMenuItems([dashboardItem, ...(data.menuItems || [])]);
        } else {
          console.error("Failed to fetch menu items");
          setMenuItems([
            {
              id: "dashboard",
              title: t("sidebar.dashboard"),
              description: "",
              href: localizedHref("/admin", locale),
              icon: "LayoutDashboard",
              color: "",
              bgColor: "",
            },
          ]);
        }
      } catch (error) {
        console.error("Error fetching menu items:", error);
        setMenuItems([
          {
            id: "dashboard",
            title: t("sidebar.dashboard"),
            description: "",
            href: localizedHref("/admin", locale),
            icon: "LayoutDashboard",
            color: "",
            bgColor: "",
          },
        ]);
      } finally {
        setLoading(false);
      }
    };

    if (accessToken && hydrated) {
      fetchMenuItems();
    }
  }, [accessToken, hydrated, locale]);

  if (!hydrated || !isLoggedIn || loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">{tCommon("loading")}</div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Sidebar */}
      <aside className="fixed left-0 top-[var(--header-height)] h-[calc(100vh-var(--header-height))] w-72 bg-white border-r border-gray-200 shadow-sm overflow-y-auto z-40">
        <div className="p-6 border-b border-gray-200">
          <h1 className="text-2xl font-bold text-[#00558f]">{t("sidebar.title")}</h1>
          <p className="text-base text-gray-500 mt-1">{t("sidebar.subtitle")}</p>
        </div>

        <nav className="mt-6 pb-20">
          {menuItems.map((item) => {
            const Icon = iconMap[item.icon] || LayoutDashboard;
            const strippedItemHref = stripLocale(item.href);
            const isActive =
              strippedPath === strippedItemHref || strippedPath.startsWith(`${strippedItemHref}/`);
            return (
              <Link
                key={item.id || item.href}
                href={item.href}
                className={`flex items-center gap-3 px-6 py-3 text-sm font-medium transition-colors ${
                  isActive
                    ? "bg-[#00558f]/10 text-[#00558f] border-r-2 border-[#00558f] font-semibold"
                    : "text-gray-700 hover:bg-gray-50"
                }`}
              >
                <Icon className="h-5 w-5 flex-shrink-0" />
                {item.title}
              </Link>
            );
          })}
        </nav>

        <div className="absolute bottom-0 left-0 right-0 p-6 border-t border-gray-200 bg-white space-y-2">
          <Link
            href={localizedHref("/", locale)}
            className="flex items-center gap-3 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 rounded-lg transition-colors"
          >
            <Home className="h-5 w-5 flex-shrink-0" />
            {t("sidebar.home")}
          </Link>
          <button
            onClick={handleLogout}
            className="flex items-center gap-3 px-4 py-2 text-sm font-medium text-red-600 hover:bg-red-50 rounded-lg transition-colors w-full"
          >
            <LogOut className="h-5 w-5 flex-shrink-0" />
            {t("sidebar.logout")}
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="ml-72 pt-[var(--header-height)] min-h-screen">
        <div className="p-6 lg:p-8">{children}</div>
      </main>
    </div>
  );
}
