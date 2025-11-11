"use client";
import BannerHome from "./components/Banner/Banner";
import useIsActiveStore from "./zustand/storeHeader";


export default function Home() {

  const { isActive } = useIsActiveStore();
  

  return (
    <>
      <main className={`${isActive ? "pt-[calc(var(--hd)-var(--hdt))]" : "pt-[var(--hd)]"}`} >
        <BannerHome />
      </main>
    </>
  );
}
