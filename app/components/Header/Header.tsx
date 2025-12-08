"use client"
import useIsActiveStore from "@/app/zustand/storeHeader";
import useUserStore from "@/app/zustand/storeUser";
import { ChevronDown, CircleUserRound, X, Menu, Settings, LogOut } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { MenuListsInterface } from "@/types/header-type"
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import axiosInstance from "@/lib/axios-instance";
const menuLists: MenuListsInterface[] = [
    {
        title: "Home",
        path: "/"
    },
    // {
    //     title: "Booking",
    //     path: "/booking",
    //     child: [
    //         {
    //             title: "Demo 1",
    //             path: "/",
    //         },
    //         {
    //             title: "Demo 2",
    //             path: "/",
    //         }
    //     ]
    // },
    {
        title: "About",
        path: "/about"
    },
    {
        title: "Service",
        path: "/service"
    }
];


// Management roles - không cần "Vé của tôi" và "Hành trình của tôi"
const MANAGEMENT_ROLES = [
    'ADMIN',
    'SCHEDULE_PLANNER',
    'REVENUE_ANALYST',
    'ANCILLARY_MANAGER',
    'CALL_CENTER',
    'ACCOUNTING_STAFF',
    'DISTRIBUTION_MANAGER',
    'FRAUD_ANALYST',
    'FLIGHT_MANAGER',
    'FARE_MANAGER',
    'OPERATIONS',
];

const Header = () => {
    const { isLoggedIn, user, logout, setUserRoles, accessToken } = useUserStore();
    const router = usePathname();
    const navigation = useRouter();
    const hydrated = useUserStore((state) => state.hydrated);
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
    const [userRoles, setUserRolesState] = useState<Array<{ roleCode: string; name: string; description: string | null }>>([]);

    // Check if user has management roles
    const hasManagementRole = userRoles.some(role => MANAGEMENT_ROLES.includes(role.roleCode));
    const isRegularUser = !hasManagementRole && userRoles.length > 0;

    // Fetch user roles when logged in
    useEffect(() => {
        const fetchUserRoles = async () => {
            if (isLoggedIn && accessToken && user?.id) {
                try {
                    const response = await axiosInstance.get('/api/auth/me');
                    if (response.data && response.data.roles) {
                        setUserRolesState(response.data.roles);
                        setUserRoles(response.data.roles);
                    }
                } catch (error) {
                    console.error('Error fetching user roles:', error);
                }
            }
        };

        if (hydrated && isLoggedIn) {
            fetchUserRoles();
        }
    }, [hydrated, isLoggedIn, accessToken, user?.id, setUserRoles]);

    const handleLogout = () => {
        logout();
        setUserRolesState([]);
        setIsMobileMenuOpen(false);
    }

    return (
        <header
            className={`h-[var(--hd)] shadow fixed top-0 left-0 w-full z-[999]`}
        >
            <div
                className={`bg-[var(--cl-pri)] h-full transition ease-linear`}
            >
                <div className="container h-full">
                    <div className="flex h-full items-center justify-between gap-x-[1.6rem]">
                        <Link
                            className="group max-w-[16rem] w-full !h-auto overflow-hidden block"
                            href={hasManagementRole ? "/admin" : "/"}
                        >
                            <Image
                                src="/logoHD.png"
                                alt="logoHD"
                                width={100}
                                height={100}
                                priority
                                unoptimized
                                className="w-full h-full object-contain transition ease-linear xl:group-hover:scale-95 filter-white"
                            />
                        </Link>
                        {/* Logout button for admin pages */}
                        {router?.startsWith('/admin') && hydrated && isLoggedIn && (
                            <div className="ml-auto flex items-center gap-4">
                                <div className="hidden lg:flex items-center gap-2 text-[var(--cl-white)]">
                                    <Image src="/icAva.png" alt="icAva" width={24} height={24} className="flex-shrink-0 rounded-full" priority unoptimized />
                                    <span className="text-sm uppercase font-medium">{user?.fullname}</span>
                                </div>
                                <button
                                    onClick={() => {
                                        handleLogout();
                                        navigation.push('/');
                                    }}
                                    className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-[var(--cl-white)] hover:bg-[var(--cl-four)] rounded-lg transition-colors uppercase"
                                    title="Đăng xuất"
                                >
                                    <LogOut className="w-4 h-4" />
                                    <span className="hidden lg:inline">Đăng xuất</span>
                                </button>
                            </div>
                        )}
                        {/* Desktop navigation - Ẩn menu cho management roles */}
                        {!hasManagementRole && !router?.startsWith('/admin') && (
                            <ul className="hidden lg:flex gap-x-[1.2rem] items-center ">
                                {menuLists.map((menuList, index) => {
                                return (
                                    <li
                                        key={index}
                                        className="group last:[&>a]:h-auto last:flex last:flex-col last:justify-center last:[&>a]:bg-[var(--cl-pri)] h-full last:[&>a]:text-[var(--cl-sec)] last:[&>a]:px-[2rem] last:[&>a]:py-[1.2rem] last:[&>a]:rounded-lg last:[&>a]:hover:bg-[var(--cl-four)] relative last:[&>a]:hover:!text-[var(--cl-white)]"
                                    >
                                        <Link
                                            className={`p-[1rem]  text-md group-hover:text-[var(--cl-four)] transition ease-linear h-full flex justify-center items-center gap-x-2 ${router === menuList.path ? "text-[var(--cl-four)]" : "text-[var(--cl-white)]"} uppercase`}
                                            href={menuList.path}
                                        >
                                            {menuList.title}
                                            {menuList.child &&
                                                menuList.child?.length > 0 && (
                                                    <span className="w-[2rem] h-[2rem] flex justify-center items-center ">
                                                        <ChevronDown
                                                            className="text-[var(--cl-white)] w-full h-full mt-[0.35rem] transition group-hover:rotate-[180deg] group-hover:text-[var(--cl-four)]"
                                                        />
                                                    </span>
                                                )}
                                        </Link>

                                        {menuList.child &&
                                            menuList.child?.length > 0 && (
                                                <ul
                                                    className="absolute top-[100%] left-0 min-w-[16rem] shadow-bg-dark-900 shadow-lg bg-white opacity-0 pointer-events-none transition translate-y-[5%] group-hover:opacity-100 group-hover:pointer-events-auto group-hover:translate-y-[0%]"
                                                >
                                                    {menuList.child.map(
                                                        (child, index) => {
                                                            return (
                                                                <li key={index} className="">
                                                                    <Link
                                                                        className="p-[1rem] text-base flex items-center text-[var(--cl-pri)] text-base xl:hover:text-[var(--cl-sec)] xl:hover:bg-[var(--cl-four)] transition ease-linear uppercase text-nowrap"
                                                                        href={child.path}
                                                                    >
                                                                        {child.title}
                                                                    </Link>
                                                                </li>
                                                            );
                                                        }
                                                    )}
                                                </ul>
                                            )}      
                                    </li>
                                );
                            })}
                            {
                                hydrated && (
                                    isLoggedIn
                                    ?
                                    <li className="group flex items-center gap-x-[0.4rem] h-full flex-shrink-0 relative">
                                        <div className="flex h-full items-center gap-x-[0.4rem]">
                                            <Image src="/icAva.png" alt="icAva" width={26} height={26} className="flex-shrink-0 mt-[0.25rem]" priority unoptimized />
                                            <div className="flex flex-col">
                                                <p className="text-md text-[var(--cl-white)] uppercase font-medium">{user?.fullname}</p>
                                            </div>
                                            <span className="w-[2rem] h-[2rem] flex justify-center items-center ">
                                                <ChevronDown
                                                className="text-[var(--cl-white)] w-full h-full mt-[0.25rem] transition group-hover:rotate-[180deg] group-hover:text-[var(--cl-white)]"
                                                />
                                            </span>
                                        </div>
                                        <ul
                                            className="absolute top-[100%] right-0 w-full min-w-[16rem] shadow-bg-dark-900 shadow-lg bg-white opacity-0 pointer-events-none transition translate-y-[5%] group-hover:opacity-100 group-hover:pointer-events-auto group-hover:translate-y-[0%]"
                                        >
                                            {hasManagementRole ? (
                                                <li>
                                                    <Link
                                                        className="p-[1rem] text-base flex items-center gap-2 text-[var(--cl-third)] text-base hover:text-[var(--cl-sec)] hover:bg-[var(--cl-four)] transition ease-linear uppercase text-nowrap"
                                                        href="/admin"
                                                    >
                                                        <Settings className="w-4 h-4" />
                                                        Quản lý
                                                    </Link>
                                                </li>
                                            ) : (
                                                <>
                                                    <li>
                                                        <Link
                                                            className="p-[1rem] text-base flex items-center text-[var(--cl-third)] text-base hover:text-[var(--cl-sec)] hover:bg-[var(--cl-four)] transition ease-linear uppercase text-nowrap"
                                                            href="/my-tickets"
                                                        >
                                                            Vé của tôi
                                                        </Link>
                                                    </li>
                                                    <li>
                                                        <Link
                                                            className="p-[1rem] text-base flex items-center text-[var(--cl-third)] text-base hover:text-[var(--cl-sec)] hover:bg-[var(--cl-four)] transition ease-linear uppercase text-nowrap"
                                                            href="/my-journey"
                                                        >
                                                            Hành trình của tôi
                                                        </Link>
                                                    </li>
                                                </>
                                            )}
                                            <li>
                                                <button onClick={handleLogout}
                                                    className="p-[1rem] text-base flex items-center text-[var(--cl-red)] text-base hover:text-[var(--cl-white)] hover:bg-[var(--cl-red)] w-full transition ease-linear uppercase text-nowrap cursor-pointer"
                                                    
                                                >
                                                    Logout
                                                </button>
                                            </li>
                                        </ul>
                                    </li>
                                    :
                                    (
                                        <>
                                            <li className="group">
                                                <Link
                                                    className={`p-[1rem]  text-md group-hover:text-[var(--cl-four)] transition ease-linear h-full flex uppercase justify-center items-center gap-x-2 ${router === "/signin" ? "text-[var(--cl-four)]" : "text-[var(--cl-white)]"}`}
                                                    href="/signin"
                                                >
                                                    Sign in
                                                </Link>
                                            </li>


                                            <li className={`group h-auto flex flex-col justify-center px-[2rem] py-[0.6rem] rounded-lg hover:bg-[var(--cl-white)]  relative  ${router === "/signup" ? "bg-[var(--cl-white)]" : "bg-[var(--cl-four)]"} transition `}>
                                                <Link
                                                    className={`p-[1rem] text-md transition ease-linear h-full flex justify-center items-center gap-x-2 uppercase group-hover:text-[var(--cl-pri)] ${router === "/signup" ? "text-[var(--cl-pri)]" : "text-[var(--cl-white)]"}`}
                                                    href="/signup"
                                                >
                                                    Sign up
                                                </Link>
                                            </li>
                                        </>
                                    )

                                )
                            }
                            </ul>
                        )}
                        {/* Mobile actions */}
                        <div className="flex items-center gap-x-2 lg:hidden ml-auto">
                            {router?.startsWith('/admin') && hydrated && isLoggedIn ? (
                                <button
                                    onClick={() => {
                                        handleLogout();
                                        navigation.push('/');
                                    }}
                                    className="flex items-center gap-2 px-3 py-2 text-sm font-medium text-[var(--cl-white)] hover:bg-[var(--cl-four)] rounded-lg transition-colors"
                                    title="Đăng xuất"
                                >
                                    <LogOut className="w-5 h-5" />
                                </button>
                            ) : (
                                <>
                                    {hydrated && !isLoggedIn && (
                                        <Link href="/signin" className="text-[var(--cl-white)] text-sm uppercase">
                                            Sign in
                                        </Link>
                                    )}
                                    <Button
                                        variant="ghost"
                                        size="icon"
                                        className="text-[var(--cl-white)] hover:bg-[var(--cl-four)]"
                                        onClick={() => setIsMobileMenuOpen((prev) => !prev)}
                                        aria-label="Toggle navigation menu"
                                    >
                                        {isMobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
                                    </Button>
                                </>
                            )}
                        </div>
                    </div>
                </div>
            </div>
            {/* Mobile navigation drawer */}
            <div
                className={`lg:hidden bg-[var(--cl-pri)] text-[var(--cl-white)] transition-max-height duration-300 overflow-hidden ${isMobileMenuOpen ? "max-h-[40rem]" : "max-h-0"
                    }`}
            >
                <div className="container pb-4">
                    <nav className="flex flex-col gap-y-2 pt-2">
                        {!hasManagementRole && menuLists.map((menuList, index) => (
                            <Link
                                key={index}
                                href={menuList.path}
                                onClick={() => setIsMobileMenuOpen(false)}
                                className={`py-2 text-sm font-medium uppercase border-b border-white/10 last:border-b-0 ${router === menuList.path ? "text-[var(--cl-four)]" : "text-[var(--cl-white)]"
                                    }`}
                            >
                                {menuList.title}
                            </Link>
                        ))}

                        {hydrated && (
                            isLoggedIn ? (
                                <div className="mt-2 border-t border-white/10 pt-2 flex flex-col gap-y-2">
                                    <p className="text-xs uppercase text-white/80 flex items-center gap-x-2">
                                        <Image src="/icAva.png" alt="icAva" width={20} height={20} className="flex-shrink-0" priority unoptimized />
                                        {user?.fullname}
                                    </p>
                                    {hasManagementRole ? (
                                        <Link
                                            href="/admin"
                                            onClick={() => setIsMobileMenuOpen(false)}
                                            className="text-sm text-[var(--cl-white)] hover:text-[var(--cl-four)] flex items-center gap-2"
                                        >
                                            <Settings className="w-4 h-4" />
                                            Quản lý
                                        </Link>
                                    ) : (
                                        <>
                                            <Link
                                                href="/my-tickets"
                                                onClick={() => setIsMobileMenuOpen(false)}
                                                className="text-sm text-[var(--cl-white)] hover:text-[var(--cl-four)]"
                                            >
                                                Vé của tôi
                                            </Link>
                                            <Link
                                                href="/my-journey"
                                                onClick={() => setIsMobileMenuOpen(false)}
                                                className="text-sm text-[var(--cl-white)] hover:text-[var(--cl-four)]"
                                            >
                                                Hành trình của tôi
                                            </Link>
                                        </>
                                    )}
                                    <Button
                                        variant="destructive"
                                        size="sm"
                                        className="mt-1 self-start"
                                        onClick={handleLogout}
                                    >
                                        Logout
                                    </Button>
                                </div>
                            ) : (
                                <div className="mt-2 border-t border-white/10 pt-2 flex flex-col gap-y-2">
                                    <Link
                                        href="/signin"
                                        onClick={() => setIsMobileMenuOpen(false)}
                                        className={`text-sm uppercase ${router === "/signin" ? "text-[var(--cl-four)]" : "text-[var(--cl-white)]"}`}
                                    >
                                        Sign in
                                    </Link>
                                    <Button
                                        asChild
                                        size="sm"
                                        className="bg-[var(--cl-four)] text-[var(--cl-white)] hover:bg-[var(--cl-white)] hover:text-[var(--cl-pri)]"
                                    >
                                        <Link href="/signup" onClick={() => setIsMobileMenuOpen(false)} className="uppercase text-sm">
                                            Sign up
                                        </Link>
                                    </Button>
                                </div>
                            )
                        )}
                    </nav>
                </div>
            </div>
        </header>
    );
};

export default Header;
