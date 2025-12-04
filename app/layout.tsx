import type { Metadata } from "next";
import { Open_Sans, TikTok_Sans } from "next/font/google";
import "./globals.css";
import Header from "./components/Header/Header";
import Footer from "./components/Footer/Footer";
import AOSWrapper from "./components/Aos/AOSWrapper";

const tiktokSans = TikTok_Sans({
  variable: "--font-tiktok-sans",
  subsets: ["latin", "vietnamese"],
});



export const metadata: Metadata = {
  title: "Wanderlust",
  description: "Wanderlust Airways",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">

      <body
        className={`${tiktokSans.variable} antialiased`}
      >
        <Header />
        {children}
        <Footer />
        <AOSWrapper />
      </body>
    </html>
  );
}
