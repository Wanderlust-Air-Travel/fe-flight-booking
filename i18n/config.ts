/**
 * Client-safe locale constants. Keep this module free of server-only imports
 * (no `next/headers`, no `next-intl/server`) so it can be imported from Client
 * Components such as `LocaleSwitcher`.
 */

export const locales = ["vi", "en"] as const;
export type Locale = (typeof locales)[number];
export const defaultLocale: Locale = "vi";

export const LOCALE_COOKIE = "NEXT_LOCALE";

/**
 * Strip the leading locale segment from a pathname.
 * - "/vi/about" -> "/about"
 * - "/en"       -> "/"
 * - "/about"    -> "/about" (no locale segment)
 */
export function stripLocale(pathname: string): string {
  if (!pathname) return "/";
  const seg = pathname.split("/").filter(Boolean);
  if (seg.length > 0 && (locales as readonly string[]).includes(seg[0])) {
    const rest = seg.slice(1).join("/");
    return rest ? `/${rest}` : "/";
  }
  return pathname.startsWith("/") ? pathname : `/${pathname}`;
}

/**
 * Build a href with the locale prefix. Use to keep `<Link href={...}>` always
 * localized without hard-coding "/vi" or "/en" inline.
 *  localizedHref("/about", "vi") -> "/vi/about"
 *  localizedHref("/", "vi")      -> "/vi"
 */
export function localizedHref(path: string, locale: Locale): string {
  const normalized = path.startsWith("/") ? path : `/${path}`;
  return `/${locale}${normalized === "/" ? "" : normalized}`;
}