"use client";

import Link from "next/link";
import BannerHome from "./components/Banner/Banner";
import useIsActiveStore from "./zustand/storeHeader";
import { Button } from "@/components/ui/button";
import ServiceHome from "./components/Services/ServiceHome";
import { usePathname } from "next/navigation";
import { useEffect } from "react";
import useFightSearchBarStore from "./zustand/storeFightSearchBar";





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
      <main className="overflow-hidden pt-[var(--hd)] flex flex-col gap-y-6 sm:gap-y-8 md:gap-y-[var(--rowY)]">
        <BannerHome />

        <section className="flex w-full py-6 sm:py-8 md:py-12">
          <div className="container w-full">
            <div className="flex flex-col gap-y-4 sm:gap-y-6 md:gap-y-[2rem]">
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 sm:gap-6 px-4 sm:px-0">
                <h2 
                  className="text-xl sm:text-2xl md:text-3xl lg:text-lg text-[var(--cl-pri)] uppercase font-bold" 
                  data-aos="fade-right"
                >
                  Services
                </h2>
                <Link className="block w-full sm:w-auto" href="/service" data-aos="fade-left">
                  <Button 
                    className="w-full sm:w-fit px-4 sm:px-6 md:px-[2rem] h-[4rem] sm:h-[4.4rem] bg-[var(--cl-pri)] text-sm sm:text-base md:text-[1.6rem] uppercase hover:bg-[var(--cl-four)] transition-colors duration-200 font-semibold" 
                  >
                    See More
                  </Button>
                </Link>
              </div>
              <div className="px-4 sm:px-0">
                <ServiceHome />
              </div>
            </div>
          </div>
        </section>
      </main>
    </>
  );
}
