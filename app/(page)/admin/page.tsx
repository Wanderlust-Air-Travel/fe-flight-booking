"use client";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { LayoutDashboard, DollarSign, Plane, Users } from "lucide-react";
import Link from "next/link";

export default function AdminDashboardPage() {
    const stats = [
        {
            title: "Quản lý giá vé",
            description: "Quản lý hạng vé và giá cả",
            icon: DollarSign,
            href: "/admin/fare-classes",
            color: "text-green-600",
            bgColor: "bg-green-50",
        },
        {
            title: "Quản lý lịch chuyến bay",
            description: "Quản lý lịch chuyến bay và chuyến bay thực tế",
            icon: Plane,
            href: "/admin/flight-schedules",
            color: "text-blue-600",
            bgColor: "bg-blue-50",
        },
        {
            title: "Quản lý người dùng",
            description: "Quản lý người dùng và phân quyền",
            icon: Users,
            href: "/admin/users",
            color: "text-purple-600",
            bgColor: "bg-purple-50",
        },
    ];

    return (
        <div>
            <div className="mb-8">
                <h1 className="text-3xl font-bold text-gray-900">Dashboard</h1>
                <p className="text-gray-600 mt-2">Chào mừng đến với trang quản trị</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {stats.map((stat) => {
                    const Icon = stat.icon;
                    return (
                        <Link key={stat.href} href={stat.href}>
                            <Card className="hover:shadow-lg transition-shadow cursor-pointer">
                                <CardHeader>
                                    <div className={`w-12 h-12 ${stat.bgColor} rounded-lg flex items-center justify-center mb-4`}>
                                        <Icon className={`h-6 w-6 ${stat.color}`} />
                                    </div>
                                    <CardTitle>{stat.title}</CardTitle>
                                    <CardDescription>{stat.description}</CardDescription>
                                </CardHeader>
                            </Card>
                        </Link>
                    );
                })}
            </div>
        </div>
    );
}

