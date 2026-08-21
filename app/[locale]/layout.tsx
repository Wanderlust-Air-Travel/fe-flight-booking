import AOSWrapper from "@/app/components/Aos/AOSWrapper";
import Footer from "@/app/components/Footer/Footer";
import Header from "@/app/components/Header/Header";
import { type Locale, locales } from "@/i18n/config";
import { NextIntlClientProvider } from "next-intl";
import { getMessages } from "next-intl/server";
import { notFound } from "next/navigation";

export function generateStaticParams() {
  return locales.map((locale) => ({ locale }));
}

export default async function LocaleLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;

  if (!(locales as readonly string[]).includes(locale)) {
    notFound();
  }

  const messages = await getMessages();

  return (
    <NextIntlClientProvider locale={locale as Locale} messages={messages}>
      <Header />
      {children}
      <Footer />
      <AOSWrapper />
    </NextIntlClientProvider>
  );
}
