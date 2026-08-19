/**
 * Client-safe locale constants. Keep this module free of server-only imports
 * (no `next/headers`, no `next-intl/server`) so it can be imported from Client
 * Components such as `LocaleSwitcher`.
 */

export const locales = ["vi", "en"] as const;
export type Locale = (typeof locales)[number];
export const defaultLocale: Locale = "vi";

export const LOCALE_COOKIE = "NEXT_LOCALE";
