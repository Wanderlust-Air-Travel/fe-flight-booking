"use client";

import useUserStore from "@/app/zustand/storeUser";
import { Card, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import {
  DollarSign,
  LayoutDashboard,
  Luggage,
  Plane,
  Sparkles,
  TrendingUp,
  Users,
} from "lucide-react";
import { useTranslations } from "next-intl";
import Link from "next/link";
import { useEffect, useState } from "react";

interface DashboardItem {
  id: string;
  title: string;
  description: string;
  href: string;
  icon: string;
  color: string;
  bgColor: string;
}

interface DashboardResponse {
  items: DashboardItem[];
  menuItems: DashboardItem[];
}

const iconMap: Record<string, React.ComponentType<{ className?: string }>> = {
  DollarSign,
  Plane,
  Users,
  TrendingUp,
  Luggage,
  Sparkles,
  LayoutDashboard,
};

export default function AdminDashboardPage() {
  const [dashboardItems, setDashboardItems] = useState<DashboardItem[]>([]);
  const [loading, setLoading] = useState(true);
  const { accessToken } = useUserStore();
  const t = useTranslations("admin");
  const tCommon = useTranslations("common");

  useEffect(() => {
    const fetchDashboardItems = async () => {
      try {
        const response = await fetch("/api/admin/dashboard", {
          headers: {
            Authorization: `Bearer ${accessToken}`,
          },
        });

        if (response.ok) {
          const data: DashboardResponse = await response.json();
          setDashboardItems(data.items || []);
        } else {
          console.error("Failed to fetch dashboard items");
        }
      } catch (error) {
        console.error("Error fetching dashboard items:", error);
      } finally {
        setLoading(false);
      }
    };

    if (accessToken) {
      fetchDashboardItems();
    }
  }, [accessToken]);

  if (loading) {
    return (
      <div className="space-y-6">
        {/* Loading Header */}
        <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-[#00558f] to-[#3775A4] p-8 text-white shadow-lg">
          <div className="relative z-10">
            <div className="flex items-center gap-3 mb-2">
              <LayoutDashboard className="h-8 w-8" />
              <h1 className="text-3xl font-bold">Dashboard</h1>
            </div>
            <p className="text-blue-50 text-lg">Quản trị hệ thống</p>
          </div>
          <div className="absolute top-0 right-0 -mt-4 -mr-4 w-32 h-32 bg-white/10 rounded-full blur-2xl" />
          <div className="absolute bottom-0 left-0 -mb-4 -ml-4 w-24 h-24 bg-white/5 rounded-full blur-xl" />
        </div>

        <div className="flex items-center justify-center py-12">
          <p className="text-base text-gray-500">{tCommon("loading")}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header Section with Primary Color */}
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-[#00558f] to-[#3775A4] p-8 text-white shadow-lg">
        <div className="relative z-10">
          <div className="flex items-center gap-3 mb-2">
            <LayoutDashboard className="h-8 w-8" />
            <h1 className="text-3xl font-bold">Dashboard</h1>
          </div>
          <p className="text-blue-50 text-lg">Quản trị hệ thống</p>
        </div>
        {/* Decorative elements */}
        <div className="absolute top-0 right-0 -mt-4 -mr-4 w-32 h-32 bg-white/10 rounded-full blur-2xl" />
        <div className="absolute bottom-0 left-0 -mb-4 -ml-4 w-24 h-24 bg-white/5 rounded-full blur-xl" />
      </div>

      {dashboardItems.length === 0 ? (
        <div className="flex items-center justify-center py-12">
          <p className="text-base text-gray-500">{t("empty")}</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {dashboardItems.map((item) => {
            const Icon = iconMap[item.icon] || DollarSign;
            return (
              <Link key={item.id} href={item.href}>
                <Card className="hover:shadow-lg transition-shadow cursor-pointer h-full">
                  <CardHeader>
                    <div
                      className={`w-12 h-12 ${item.bgColor} rounded-lg flex items-center justify-center mb-4`}
                    >
                      <Icon className={`h-6 w-6 ${item.color}`} />
                    </div>
                    <CardTitle className="text-xl font-bold text-gray-900">{item.title}</CardTitle>
                    <CardDescription className="text-base text-gray-600 mt-2">
                      {item.description}
                    </CardDescription>
                  </CardHeader>
                </Card>
              </Link>
            );
          })}
        </div>
      )}
    </div>
  );
}
