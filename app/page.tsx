"use client";

import Link from "next/link";
import dynamic from "next/dynamic";
import useIsActiveStore from "./zustand/storeHeader";
import { Button } from "@/components/ui/button";
import { usePathname } from "next/navigation";
import { useEffect } from "react";
import useFightSearchBarStore from "./zustand/storeFightSearchBar";

// Lazy load heavy components
const BannerHome = dynamic(() => import("./components/Banner/Banner"), {
    loading: () => <div className="h-[calc(100vh-var(--hd))] bg-gray-100 animate-pulse" />,
    ssr: true,
});

const ServiceHome = dynamic(() => import("./components/Services/ServiceHome"), {
    loading: () => (
        <ul className="flex flex-wrap gap-y-[2.4rem] -mx-[1.2rem] pb-1">
            {Array.from({ length: 8 }).map((_, i) => (
                <li key={i} className="w-[calc(100%/4)] px-[1.2rem]">
                    <div className="h-[300px] bg-gray-200 animate-pulse rounded-[1rem]" />
                </li>
            ))}
        </ul>
    ),
    ssr: true,
});





export default function Home() {

  const pathName = usePathname();
  const { setData } = useFightSearchBarStore()
  useEffect(() => {
    if (pathName === "/") {
      setData({
        adult: 1,
        startDate: "",
        endDate: "",
        from: "",
        to: "",

      })
    }
  }, [pathName])



  return (
    <>
      <main className="overflow-hidden pt-[var(--hd)] flex flex-col gap-y-[var(--rowY)]">
        <BannerHome />

        <section className="flex w-full">
          <div className="container">
            <div className="flex flex-col gap-y-[2rem]">
              <div className="flex justify-between items-center">
                <h2 className="text-lg text-[var(--cl-pri)] uppercase font-bold" data-aos="fade-right">
                  Services
                </h2>
                <Link className="block" href="/" data-aos="fade-left">
                  <Button className="w-fit px-[2rem] h-[4.4rem] bg-[var(--cl-pri)] text-[1.6rem] uppercase hover:bg-[var(--cl-four)]" >See More</Button>
                </Link>
              </div>
              <ServiceHome />
            </div>
          </div>
        </section>
      </main>
    </>
  );
}
