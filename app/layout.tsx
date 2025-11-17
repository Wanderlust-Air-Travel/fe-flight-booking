import type { Metadata } from "next";
import { Open_Sans } from "next/font/google";
import "./globals.css";
import Header from "./components/Header/Header";
import Footer from "./components/Footer/Footer";
import AOSWrapper from "./components/Aos/AOSWrapper";
import AuthProvider from "./provider/AuthProvider";

const openSans = Open_Sans({
  variable: "--font-open-sans",
  subsets: ["latin", "vietnamese"],
});



export const metadata: Metadata = {
  title: "Bammboo",
  description: "Booking ticket",
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
        <AuthProvider>
        {children}
        </AuthProvider>
        <Footer />
        <AOSWrapper /> 
      </body>
    </html>
  );
}
