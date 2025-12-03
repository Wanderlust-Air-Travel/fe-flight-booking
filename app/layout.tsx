import type { Metadata } from "next";
import { Open_Sans } from "next/font/google";
import "./globals.css";
import Header from "./components/Header/Header";
import Footer from "./components/Footer/Footer";
import AOSWrapper from "./components/Aos/AOSWrapper";

const openSans = Open_Sans({
  variable: "--font-open-sans",
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
        className={`${openSans.variable} antialiased`}
      >
        <Header />
        {children}
        <Footer />
        <AOSWrapper />
      </body>
    </html>
  );
}
