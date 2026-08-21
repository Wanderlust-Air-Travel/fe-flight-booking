"use client";

import AOS from "aos";
import { useEffect } from "react";

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
