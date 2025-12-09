"use client";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { LayoutDashboard, DollarSign, Plane, Users, TrendingUp, Luggage, Sparkles } from "lucide-react";
import Link from "next/link";
import { useEffect, useState } from "react";
import useUserStore from "@/app/zustand/storeUser";

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

    useEffect(() => {
        const fetchDashboardItems = async () => {
            try {
                const response = await fetch("/api/admin/dashboard", {
                    headers: {
                        "Authorization": `Bearer ${accessToken}`,
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
            <div>
                <div className="mb-8">
                    <h1 className="text-3xl font-bold text-gray-900">Dashboard</h1>
                    <p className="text-gray-600 mt-2">Chào mừng đến với trang quản trị</p>
                </div>
                <div className="flex items-center justify-center py-12">
                    <p className="text-gray-500">Đang tải...</p>
                </div>
            </div>
        );
    }

    return (
        <div>
            <div className="mb-8">
                <h1 className="text-3xl font-bold text-gray-900">Dashboard</h1>
                <p className="text-gray-600 mt-2">Chào mừng đến với trang quản trị</p>
            </div>

            {dashboardItems.length === 0 ? (
                <div className="flex items-center justify-center py-12">
                    <p className="text-gray-500">Bạn không có quyền truy cập vào bất kỳ mục nào.</p>
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {dashboardItems.map((item) => {
                        const Icon = iconMap[item.icon] || DollarSign;
                        return (
                            <Link key={item.id} href={item.href}>
                                <Card className="hover:shadow-lg transition-shadow cursor-pointer">
                                    <CardHeader>
                                        <div className={`w-12 h-12 ${item.bgColor} rounded-lg flex items-center justify-center mb-4`}>
                                            <Icon className={`h-6 w-6 ${item.color}`} />
                                        </div>
                                        <CardTitle>{item.title}</CardTitle>
                                        <CardDescription>{item.description}</CardDescription>
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

