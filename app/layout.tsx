import type { Metadata } from "next";
import { TikTok_Sans } from "next/font/google";
import "./globals.css";

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
    <html>
      <body className={`${tiktokSans.variable} antialiased`}>{children}</body>
    </html>
  );
}