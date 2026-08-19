"use client";

import { LOCALE_COOKIE, locales, type Locale } from "@/i18n/config";
import { useLocale } from "next-intl";
import { usePathname, useRouter } from "next/navigation";
import { useTransition, useRef, useEffect, useState } from "react";
import { ChevronDown, Check } from "lucide-react";

const LANGUAGES: Record<Locale, { flag: string; label: string }> = {
	vi: { flag: "🇻🇳", label: "Tiếng Việt" },
	en: { flag: "🇬🇧", label: "English" },
};

export default function LocaleSwitcher() {
	const router = useRouter();
	const pathname = usePathname();
	const currentLocale = useLocale() as Locale;
	const [isPending, startTransition] = useTransition();
	const [isOpen, setIsOpen] = useState(false);
	const dropdownRef = useRef<HTMLDivElement>(null);

	const switchTo = (next: Locale) => {
		if (next === currentLocale) return;
		document.cookie = `${LOCALE_COOKIE}=${next}; path=/; max-age=31536000; samesite=lax`;
		startTransition(() => {
			router.refresh();
			if (pathname) router.replace(pathname);
		});
		setIsOpen(false);
	};

	// Close on outside click
	useEffect(() => {
		const handleClickOutside = (e: MouseEvent) => {
			if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
				setIsOpen(false);
			}
		};
		if (isOpen) {
			document.addEventListener("mousedown", handleClickOutside);
			return () => document.removeEventListener("mousedown", handleClickOutside);
		}
	}, [isOpen]);

	return (
		<div ref={dropdownRef} className="relative inline-flex">
			<button
				type="button"
				aria-label="Select language"
				aria-expanded={isOpen}
				aria-haspopup="listbox"
				disabled={isPending}
				onClick={() => setIsOpen((prev) => !prev)}
				className={`
					inline-flex items-center gap-2 rounded-lg border border-white/30 bg-white/10
					px-[2rem] py-[0.6rem] text-sm font-medium uppercase
					text-white transition-all cursor-pointer
					focus:outline-none focus:ring-2 focus:ring-white/40
					${isPending ? "opacity-50 cursor-wait" : "hover:bg-white/20"}
				`}
			>
				<span className="text-base leading-none">{LANGUAGES[currentLocale].flag}</span>
				<span>{currentLocale}</span>
				<ChevronDown
					className={`w-3.5 h-3.5 transition-transform ${isOpen ? "rotate-180" : ""}`}
				/>
			</button>

			{isOpen && (
				<ul
					role="listbox"
					aria-label="Language options"
					className="absolute right-0 top-full mt-1 z-50 min-w-[12rem] rounded-lg border border-white/20 bg-[var(--cl-pri)] shadow-lg overflow-hidden"
				>
					{locales.map((loc) => {
						const isActive = loc === currentLocale;
						return (
							<li key={loc}>
								<button
									type="button"
									role="option"
									aria-selected={isActive}
									onClick={() => switchTo(loc)}
									className={`
										w-full flex items-center gap-3 px-3 py-2 text-sm text-left
										transition-colors cursor-pointer
										${isActive ? "bg-white/20 text-white" : "text-white/80 hover:bg-white/10 hover:text-white"}
									`}
								>
									<span className="text-lg leading-none">{LANGUAGES[loc].flag}</span>
									<span className="flex-1 font-medium uppercase">{loc}</span>
									{isActive && <Check className="w-4 h-4 text-white" />}
								</button>
							</li>
						);
					})}
				</ul>
			)}
		</div>
	);
}
