"use client"
import useIsActiveStore from "@/app/zustand/storeHeader";
import useUserStore from "@/app/zustand/storeUser";
import { ChevronDown, CircleUserRound, X } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";


interface menuListsInterface {
    title: string,
    path: string,
    child?: menuListsInterface[]
}



const menuLists: menuListsInterface[] = [
    {
        title: "Home",
        path: "/"
    },
    {
        title: "Booking",
        path: "/booking",
        child: [
            {
                title: "Demo 1",
                path: "/",
            },
            {
                title: "Demo 2",
                path: "/",
            }
        ]
    },
    {
        title: "About",
        path: "/about"
    },
    // {
    //     title: "Sign in",
    //     path: "/signin"
    // },
    // {
    //     title: "Sign up",
    //     path: "/signup"
    // },
];


const Header = () => {

    const { isActive, handleIsActive } = useIsActiveStore();
    const { isLoggedIn, user ,logout } = useUserStore();
    const router = usePathname();
    const handleClose = (): void => {
        handleIsActive();
    }
    const hydrated = useUserStore.persist.hasHydrated();

    console.log(hydrated)

    const handleLogout = () =>{
        logout();

    }

    return (
        <header
            className={`${isActive ? "h-[calc(var(--hd)-var(--hdt))]" : "h-[var(--hd)]"
                } shadow fixed top-0 left-0 w-full z-[999]`}
        >
            <div
                className={`${isActive && "translate-y-[-100%] opacity-0 pointer-events-none "
                    } bg-[var(--cl-pri)] h-[var(--hdt)] transition ease-linear w-full absolute top-0 left-0`}
            >
                <div className="container">
                    <div className="flex flex-col justify-center h-full">
                        <div className="flex justify-between gap-x-[2rem]">
                            <p className="cl-sec text-md text-center w-full flex-1">
                                Join Tripma today and save up to 20% on your flight using code
                                TRAVEL at checkout. Promotion valid for new users only.
                            </p>
                            <button
                                onClick={handleClose}
                                className="group w-[3.2rem] h-[3.2rem] flex justify-center items-center cursor-pointer transition ease-linear xl:hover:bg-[var(--cl-sec)]"
                            >
                                <X
                                    className="text-[var(--cl-sec)] xl:group-hover:text-[var(--cl-pri)] transition ease-linear"
                                />
                            </button>
                        </div>
                    </div>
                </div>
            </div>
            <div
                className={`${isActive ? "translate-y-[0%]" : "translate-y-[var(--hdt)]"
                    } bg-white h-[calc(var(--hd)-var(--hdt))] transition ease-linear`}
            >
                <div className="container">
                    <div className="flex h-full justify-between gap-x-[3.2rem]">
                        <Link
                            className="group max-w-[20rem] w-full !h-auto overflow-hidden block"
                            href="/"
                        >
                            <Image
                                src="/logoHD.png"
                                alt="logoHD"
                                width={100}
                                height={100}
                                priority
                                unoptimized
                                className="w-full h-full object-contain transition ease-linear xl:group-hover:scale-95"
                            />
                        </Link>
                        <ul className="flex gap-x-[1.2rem] items-center ">
                            {menuLists.map((menuList, index) => {
                                return (
                                    <li
                                        key={index}
                                        className="group last:[&>a]:h-auto last:flex last:flex-col last:justify-center last:[&>a]:bg-[var(--cl-pri)] h-full last:[&>a]:text-[var(--cl-sec)] last:[&>a]:px-[2rem] last:[&>a]:py-[1.2rem] last:[&>a]:rounded-lg last:[&>a]:hover:bg-[var(--cl-four)] relative last:[&>a]:hover:!text-[var(--cl-white)]"
                                    >
                                        <Link
                                            className={`p-[1rem]  text-md group-hover:text-[var(--cl-four)] transition ease-linear h-full flex justify-center items-center gap-x-2 ${router === menuList.path ? "text-[var(--cl-four)]" : "text-[var(--cl-third)]"} uppercase`}
                                            href={menuList.path}
                                        >
                                            {menuList.title}
                                            {menuList.child &&
                                                menuList.child?.length > 0 && (
                                                    <span className="w-[2rem] h-[2rem] flex justify-center items-center ">
                                                        <ChevronDown
                                                            className="text-[var(--cl-third)] w-full h-full mt-[0.35rem] transition group-hover:rotate-[180deg] group-hover:text-[var(--cl-four)]"
                                                        />
                                                    </span>
                                                )}
                                        </Link>

                                        {menuList.child &&
                                            menuList.child?.length > 0 && (
                                                <ul
                                                    className="absolute top-[100%] l-0 min-w-[16rem] shadow-bg-dark-900 shadow-lg bg-white opacity-0 pointer-events-none transition translate-y-[5%] group-hover:opacity-100 group-hover:pointer-events-auto group-hover:translate-y-[0%]"
                                                >
                                                    {menuList.child.map(
                                                        (child, index) => {
                                                            return (
                                                                <li key={index} className="">
                                                                    <Link
                                                                        className="p-[1rem] text-base flex items-center text-[var(--cl-third)] text-base xl:hover:text-[var(--cl-sec)] xl:hover:bg-[var(--cl-pri)] transition ease-linear uppercase text-nowrap"
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
                                                <p className="text-md text-[var(--cl-pri)] uppercase font-medium">{user?.fullname}</p>
                                            </div>
                                            <span className="w-[2rem] h-[2rem] flex justify-center items-center ">
                                                <ChevronDown
                                                    className="text-[var(--cl-pri)] w-full h-full mt-[0.25rem] transition group-hover:rotate-[180deg] group-hover:text-[var(--cl-pri)]"
                                                />
                                            </span>
                                        </div>
                                        <ul
                                            className="absolute top-[100%] l-0 w-full min-w-[16rem] shadow-bg-dark-900 shadow-lg bg-white opacity-0 pointer-events-none transition translate-y-[5%] group-hover:opacity-100 group-hover:pointer-events-auto group-hover:translate-y-[0%]"
                                        >
                                            <li>
                                                <Link
                                                    className="p-[1rem] text-base flex items-center text-[var(--cl-third)] text-base hover:text-[var(--cl-sec)] hover:bg-[var(--cl-pri)] transition ease-linear uppercase text-nowrap"
                                                    href="/"
                                                >
                                                    History
                                                </Link>
                                            </li>
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
                                                    className={`p-[1rem]  text-md group-hover:text-[var(--cl-four)] transition ease-linear h-full flex uppercase justify-center items-center gap-x-2 ${router === "/signin" ? "text-[var(--cl-four)]" : "text-[var(--cl-third)]"}`}
                                                    href="/signin"
                                                >
                                                    Sign in
                                                </Link>
                                            </li>


                                            <li className={`group h-auto flex flex-col justify-center px-[2rem] py-[0.6rem] rounded-lg hover:bg-[var(--cl-four)] relative  ${router === "/signup" ? "bg-[var(--cl-four)]" : "bg-[var(--cl-pri)]"} transition `}>
                                                <Link
                                                    className={`p-[1rem] text-md text-[var(--cl-white)] transition ease-linear h-full flex justify-center items-center gap-x-2 uppercase`}
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
                    </div>
                </div>
            </div>
        </header>
    );
};

export default Header;
