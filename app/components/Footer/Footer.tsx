"use client"
import Image from "next/image"
import Link from "next/link"
import { usePathname } from "next/navigation";


const Footer = () => {
    const router = usePathname();

    // Không dùng footer trên trang đăng nhập / đăng ký và trang admin để layout full screen
    if (router === "/sign-in" || router === "/sign-up" || router?.startsWith("/admin")) {
        return null;
    }

    return (
        <footer className="mt-auto border-t border-[var(--cl-pri)]/20 bg-[var(--cl-pri)] text-white py-6">
            <div className="container py-2.5 md:py-3">
                <div className="flex flex-col gap-2 md:flex-row md:items-center md:justify-between">
                    {/* Logo + short text */}
                    <div className="flex items-center gap-2 md:gap-3">
                        <Link
                            className="group block max-w-[11rem] md:max-w-[13rem] !h-auto overflow-hidden"
                            href="/"
                        >
                            <Image
                                src="/logoHD.png"
                                alt="logoHD"
                                width={110}
                                height={36}
                                priority
                                unoptimized
                                className="w-full h-full object-contain transition ease-linear group-hover:scale-95 filter-white"
                            />
                        </Link>
                        <p className="hidden sm:block text-sm md:text-base text-white/80">
                            © 2025 Wanderlust Airways. All rights reserved.
                        </p>
                    </div>

                    {/* Quick links + social icons (gộp cùng bên phải) */}
                    <div className="flex flex-col items-center gap-2 md:flex-row md:gap-4">
                        <nav className="flex flex-wrap items-center justify-center gap-3 text-sm md:text-base text-white/80">
                            <Link
                                href="/about"
                                className={`hover:text-[var(--cl-four)] transition-colors ${
                                    router === "/about" ? "text-[var(--cl-four)]" : ""
                                }`}
                            >
                                About
                            </Link>
                            <span className="hidden sm:inline-block h-[0.8rem] w-px bg-white/25" />
                            <Link
                                href="/help"
                                className={`hover:text-[var(--cl-four)] transition-colors ${
                                    router === "/help" ? "text-[var(--cl-four)]" : ""
                                }`}
                            >
                                Support
                            </Link>
                            <span className="hidden sm:inline-block h-[0.8rem] w-px bg-white/25" />
                            <Link
                                href="/contact"
                                className={`hover:text-[var(--cl-four)] transition-colors ${
                                    router === "/contact" ? "text-[var(--cl-four)]" : ""
                                }`}
                            >
                                Contact
                            </Link>
                            <span className="hidden sm:inline-block h-[0.8rem] w-px bg-white/25" />
                            <Link
                                href="/privacy-policy"
                                className={`hover:text-[var(--cl-four)] transition-colors ${
                                    router === "/privacy-policy" ? "text-[var(--cl-four)]" : ""
                                }`}
                            >
                                Privacy
                            </Link>
                        </nav>

                        <div className="flex items-center gap-3 md:gap-4">
                            <div className="flex items-center gap-2">
                                <Link className="hover:scale-110 transition ease-linear" href="/">
                                    <Image src="/facebook.svg" alt="facebook" width={18} height={18} priority />
                                </Link>
                                <Link className="hover:scale-110 transition ease-linear" href="/">
                                    <Image src="/instagram.svg" alt="instagram" width={18} height={18} priority />
                                </Link>
                                <Link className="hover:scale-110 transition ease-linear" href="/">
                                    <Image src="/twitter.svg" alt="twitter" width={18} height={18} priority />
                                </Link>
                            </div>
                            <p className="sm:hidden text-[0.75rem] text-white/70">
                                © 2025 Wanderlust Airways.
                            </p>
                        </div>
                    </div>
                </div>
            </div>
        </footer>
    )
}

export default Footer