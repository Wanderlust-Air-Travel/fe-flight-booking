"use client";

import { useRouter, usePathname } from "next/navigation";
import { useEffect } from "react";
import useUserStore from "@/app/zustand/storeUser";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { 
    LayoutDashboard, 
    DollarSign, 
    Plane, 
    Users, 
    LogOut,
    Home
} from "lucide-react";

export default function AdminLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    const router = useRouter();
    const pathname = usePathname();
    const { isLoggedIn, accessToken, hydrated } = useUserStore();

    useEffect(() => {
        if (hydrated && (!isLoggedIn || !accessToken)) {
            router.push("/login?redirect=" + encodeURIComponent(pathname));
        }
    }, [hydrated, isLoggedIn, accessToken, router, pathname]);

    const menuItems = [
        { href: "/admin", label: "Dashboard", icon: LayoutDashboard },
        { href: "/admin/fare-classes", label: "Quản lý giá vé", icon: DollarSign },
        { href: "/admin/flight-schedules", label: "Quản lý lịch chuyến bay", icon: Plane },
        { href: "/admin/users", label: "Quản lý người dùng", icon: Users },
    ];

    if (!hydrated || !isLoggedIn) {
        return <div className="flex items-center justify-center min-h-screen">Đang tải...</div>;
    }

    return (
        <div className="min-h-screen bg-gray-50">
            {/* Sidebar */}
            <aside className="fixed left-0 top-0 h-full w-64 bg-white border-r border-gray-200 shadow-sm">
                <div className="p-6">
                    <h1 className="text-2xl font-bold text-gray-900">Admin Panel</h1>
                    <p className="text-sm text-gray-500 mt-1">Quản trị hệ thống</p>
                </div>
                
                <nav className="mt-6">
                    {menuItems.map((item) => {
                        const Icon = item.icon;
                        const isActive = pathname === item.href || pathname.startsWith(item.href + "/");
                        return (
                            <Link
                                key={item.href}
                                href={item.href}
                                className={`flex items-center gap-3 px-6 py-3 text-sm font-medium transition-colors ${
                                    isActive
                                        ? "bg-blue-50 text-blue-700 border-r-2 border-blue-700"
                                        : "text-gray-700 hover:bg-gray-50"
                                }`}
                            >
                                <Icon className="h-5 w-5" />
                                {item.label}
                            </Link>
                        );
                    })}
                </nav>

                <div className="absolute bottom-0 left-0 right-0 p-6 border-t border-gray-200">
                    <Link
                        href="/"
                        className="flex items-center gap-3 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 rounded-lg transition-colors"
                    >
                        <Home className="h-5 w-5" />
                        Về trang chủ
                    </Link>
                </div>
            </aside>

            {/* Main Content */}
            <main className="ml-64 min-h-screen">
                <div className="p-8">
                    {children}
                </div>
            </main>
        </div>
    );
}

