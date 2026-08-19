import type { Metadata } from "next";
import { NextIntlClientProvider } from "next-intl";
import { getLocale, getMessages } from "next-intl/server";
import { TikTok_Sans } from "next/font/google";
import "./globals.css";
import AOSWrapper from "./components/Aos/AOSWrapper";
import Footer from "./components/Footer/Footer";
import Header from "./components/Header/Header";

const tiktokSans = TikTok_Sans({
  variable: "--font-tiktok-sans",
  subsets: ["latin", "vietnamese"],
});

export const metadata: Metadata = {
  title: "Wanderlust",
  description: "Wanderlust Airways",
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const locale = await getLocale();
  const messages = await getMessages();

  return (
    <html lang={locale}>
      <body className={`${tiktokSans.variable} antialiased`}>
        <NextIntlClientProvider locale={locale} messages={messages}>
          <Header />
          {children}
          <Footer />
          <AOSWrapper />
        </NextIntlClientProvider>
      </body>
    </html>
  );
}
