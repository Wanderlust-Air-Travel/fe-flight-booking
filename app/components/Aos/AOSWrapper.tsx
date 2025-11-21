"use client";

import { useEffect } from "react";
import AOS from "aos";

export default function AOSWrapper() {
  useEffect(() => {
    AOS.init({
      duration: 800,
      easing: "ease-in-out",
      once: true,
    });
  }, []);

  return null; // không render gì cả
}
