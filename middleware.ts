import createIntlMiddleware from "next-intl/middleware";
import { defaultLocale, locales } from "./i18n/config";

const intlMiddleware = createIntlMiddleware({
  locales: [...locales],
  defaultLocale,
  localePrefix: "always",
});

export default intlMiddleware;

export const config = {
  matcher: [
    "/((?!api|_next|_vercel|.*\\..*).*)",
  ],
};
