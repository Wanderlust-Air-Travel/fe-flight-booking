"use client"
import useIsActiveStore from "@/app/zustand/store";
import { ChevronDown, X } from "lucide-react";
import Image from "next/image";
import Link from "next/link";

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
    {
        title: "Sign in",
        path: "/signin"
    },
    {
        title: "Sign up",
        path: "/signup"
    },
];


const Header = () => {

    const { isActive, handleIsActive } = useIsActiveStore();

    const handleClose = (): void => {
        handleIsActive();
    }

    return (
        <header className={`${isActive ? "h-[calc(var(--hd)-var(--hdt))]" : "h-[var(--hd)]"} shadow fixed top-0 left-0 w-full `}>
            <div className={`${isActive && "translate-y-[-100%] opacity-0 pointer-events-none "} bg-[var(--cl-pri)] h-[var(--hdt)] transition ease-linear w-full absolute top-0 left-0`}>
                <div className="container ">
                    <div className="flex flex-col justify-center h-full">
                        <div className="flex justify-between gap-x-[2rem]">
                            <p className="cl-sec text-md text-center w-full flex-1">
                                Join Tripma today and save up to 20% on your flight using code
                                TRAVEL at checkout. Promotion valid for new users only.
                            </p>
                            <button onClick={handleClose} className="group w-[3.2rem] h-[3.2rem] flex justify-center items-center cursor-pointer transition ease-linear  xl:hover:bg-[var(--cl-sec)] ">
                                <X className="text-[var(--cl-sec)] xl:group-hover:text-[var(--cl-pri)] transition ease-linear" />
                            </button>
                        </div>
                    </div>
                </div>
            </div>
            <div className={`${isActive ? "translate-y-[0%]" : "translate-y-[var(--hdt)]"} bg-white h-[calc(var(--hd)-var(--hdt))] transition ease-linear`}>
                <div className="container">
                    <div className="flex h-full justify-between gap-x-[3.2rem]">
                        <Link className="group max-w-[18rem] w-full !h-auto overflow-hidden" href="/">
                            <Image src="/logoHD.png" alt="logoHD" width={100} height={100} priority unoptimized className="w-full h-full object-contain transition ease-linear xl:group-hover:scale-95" />
                        </Link>
                        <ul className="flex gap-x-[1.2rem] items-center mx-[-1rem]">
                            {
                                menuLists.map((menuList, index) => {
                                    return (
                                        <li key={index} className="group last:[&>a]:h-auto last:flex last:flex-col last:justify-center last:[&>a]:bg-[var(--cl-pri)] h-full last:[&>a]:text-[var(--cl-sec)] last:[&>a]:px-[2rem] last:[&>a]:py-[1.2rem] last:[&>a]:rounded-lg xl:last:[&>a]:hover:bg-[var(--cl-pri)] relative xl:last:[&>a]:hover:!text-[var(--cl-white)]">
                                            <Link className={`$index p-[1rem] text-[var(--cl-third)] text-md xl:group-hover:text-[var(--cl-sec)] transition ease-linear h-full flex justify-center items-center gap-x-2 `} href={menuList.path}>{menuList.title}
                                                {menuList.child && menuList.child?.length > 0
                                                    &&
                                                    <span className="w-[2rem] h-[2rem] flex justify-center items-center xl:group-hover:text-[var(--cl-sec)] ">
                                                        <ChevronDown className="text-[var(--cl-third)] w-full h-full mt-[0.5rem] transition xl:group-hover:rotate-[180deg]" />
                                                    </span>
                                                }
                                            </Link>

                                            {
                                                menuList.child && menuList.child?.length > 0
                                                &&
                                                (
                                                    <ul className="absolute top-[101%] l-0 min-w-[16rem] shadow-bg-dark-500 shadow-md bg-white opacity-0 pointer-events-none transition translate-y-[5%] xl:group-hover:opacity-100 xl:group-hover:pointer-events-auto xl:group-hover:translate-y-[0%]">
                                                        {
                                                            menuList.child.map((child, index) => {
                                                                return (
                                                                    <li key={index} className="">
                                                                        <Link className="p-[1rem] text-base flex items-center text-[var(--cl-third)] text-base xl:hover:text-[var(--cl-sec)] xl:hover:bg-[var(--cl-pri)] transition ease-linear" href={child.path}>{child.title}</Link>
                                                                    </li>
                                                                )
                                                            })
                                                        }

                                                    </ul>
                                                )
                                            }
                                        </li>
                                    )
                                })
                            }
                        </ul>
                    </div>
                </div>
            </div>
        </header>
    );
};

export default Header;
