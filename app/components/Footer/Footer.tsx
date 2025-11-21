"use client"
import Image from "next/image"
import Link from "next/link"
import { usePathname } from "next/navigation";

interface FooterItem {
    label: string;
    link: string;
}

interface FooterSection {
    title: string;
    list: FooterItem[];
    imgs?: {
        image: string;
    }[]
}

const dataFooters: FooterSection[] = [
    {
        title: "About",
        list: [
            { label: "About Tripma", link: "/about-tripma" },
            { label: "How it works", link: "/how-it-works" },
            { label: "Careers", link: "/careers" },
            { label: "Press", link: "/press" },
            { label: "Blog", link: "/blog" },
            { label: "Forum", link: "/forum" },
        ]
    },
    {
        title: "Partner with us",
        list: [
            { label: "Partnership programs", link: "/partnership-programs" },
            { label: "Affiliate program", link: "/affiliate" },
            { label: "Connectivity partners", link: "/connectivity" },
            { label: "Promotions and events", link: "/events" },
            { label: "Integrations", link: "/integrations" },
            { label: "Community", link: "/community" },
            { label: "Loyalty program", link: "/loyalty" },
        ]
    },
    {
        title: "Support",
        list: [
            { label: "Help Center", link: "/help" },
            { label: "Contact us", link: "/contact" },
            { label: "Privacy policy", link: "/privacy-policy" },
            { label: "Terms of service", link: "/terms" },
            { label: "Trust and safety", link: "/trust" },
            { label: "Accessibility", link: "/accessibility" },
        ]
    },
    {
        title: "Get the app",
        list: [
            { label: "Tripma for Android", link: "/app-android" },
            { label: "Tripma for iOS", link: "/app-ios" },
            { label: "Mobile site", link: "/mobile" },
        ],
        imgs: [
            {
                image: "/alert.png"
            },
            {
                image: "/dmca.png"
            },
        ]
    }
];


const Footer = () => {
    const router = usePathname();
    return (
        <footer className="pt-[var(--rowY)]">

            <div  className="flex flex-col">
                <div className="bg-[var(--cl-pri)]">
                    <div className="container">
                        <div className="flex py-[4rem] -mx-[-1.2rem] w-full">
                            <div className="w-[20%] px-[1.2rem]">
                                <Link
                                    className="group max-w-[18rem] block w-full !h-auto overflow-hidden"
                                    href="/"
                                >
                                    <Image
                                        src="/logoHD.png"
                                        alt="logoHD"
                                        width={100}
                                        height={100}
                                        priority
                                        unoptimized
                                        className="w-full h-full object-contain transition ease-linear group-hover:scale-95 filter-white"
                                    />
                                </Link>
                            </div>
                            {
                                dataFooters.map((dataFooter, index) => {
                                    return (
                                        <div key={index} className="w-[20%] px-[1.2rem] flex justify-center">
                                            <div className="flex flex-col gap-y-[2rem]">
                                                <div className="flex flex-col gap-y-[0.8rem]">
                                                    <p className="text-base cl-white font-bold">
                                                        {dataFooter.title}
                                                    </p>
                                                    <ul className="flex flex-col gap-y-[0.8rem]">
                                                        {
                                                            dataFooter.list.map((list, index) => {
                                                                return (
                                                                    <li key={index}>
                                                                        <Link className={`text-base hover:!text-[var(--cl-four)] ${router === list.link ? "text-[var(--cl-four)]" : "text-[var(--cl-white)]"}`} href={list.link}>
                                                                            {list.label}
                                                                        </Link>
                                                                    </li>
                                                                )
                                                            })
                                                        }
    
                                                    </ul>
                                                </div>
                                                <div className="flex flex-col gap-y-[1.6rem]">
                                                    {
                                                        dataFooter.imgs?.map((img, index) => {
                                                            return (
                                                                <Image key={index} src={img.image} alt="image" width={120} height={60} priority />
                                                            )
                                                        })
                                                    }
                                                </div>
                                            </div>
                                        </div>
                                    )
                                })
                            }
                        </div>
                    </div>
                </div>
                <div className="bg-white">
                    <div className="container">
                        <div className="flex py-[1.6rem] justify-between items-center gap-x-[2rem]">
                            <ul className="flex items-center gap-x-[1.2rem]">
                                <li>
                                    <Link className="hover:scale-[1.2] block transition ease-linear" href="/">
                                        <Image src="/facebook.svg" alt="facebook" width={24} height={24} priority />
                                    </Link>
                                </li>
                                <li>
                                    <Link className="hover:scale-[1.2] block transition ease-linear" href="/">
                                        <Image src="/instagram.svg" alt="instagram" width={24} height={24} priority />
                                    </Link>
                                </li>
                                <li>
                                    <Link className="hover:scale-[1.2] block transition ease-linear" href="/">
                                        <Image src="/twitter.svg" alt="twitter" width={24} height={24} priority />
                                    </Link>
                                </li>
                            </ul>
                            <p className="text-base text-[var(--cl-pri)]">© 2025 Bamboo incorporated</p>
                        </div>
                    </div>
                </div>
            </div>

        </footer>
    )
}

export default Footer