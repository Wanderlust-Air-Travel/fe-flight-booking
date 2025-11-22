"use client";

import Link from "next/link";
import BannerHome from "./components/Banner/Banner";
import useIsActiveStore from "./zustand/storeHeader";
import { Button } from "@/components/ui/button";
import ServiceHome from "./components/Services/ServiceHome";





export default function Home() {


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
