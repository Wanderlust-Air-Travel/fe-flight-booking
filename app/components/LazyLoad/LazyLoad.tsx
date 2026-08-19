"use client";

/**
 * LazyLoad Component
 * Native implementation using Intersection Observer API
 * Compatible with React 19 and Next.js 16
 *
 * Features:
 * - Lazy load any component or element
 * - Supports placeholder
 * - Configurable offset
 * - Once mode (load once, then ignore)
 * - SSR compatible
 */

import type { LazyLoadProps } from "@/types/lazy-load";
import { useEffect, useRef, useState } from "react";

const LazyLoad = ({
  children,
  placeholder,
  height,
  offset = 100,
  once = true,
  threshold = 0.01,
  className = "",
  style = {},
}: LazyLoadProps) => {
  const [isVisible, setIsVisible] = useState(false);
  const [hasLoaded, setHasLoaded] = useState(false);
  const elementRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const element = elementRef.current;
    if (!element) return;

    // If already loaded and once mode is enabled, don't observe again
    if (hasLoaded && once) return;

    // Check if IntersectionObserver is supported
    if (typeof IntersectionObserver === "undefined") {
      // Fallback for browsers without IntersectionObserver support
      setIsVisible(true);
      setHasLoaded(true);
      return;
    }

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            setIsVisible(true);
            setHasLoaded(true);
            if (once) {
              observer.unobserve(element);
            }
          } else if (!once) {
            setIsVisible(false);
          }
        });
      },
      {
        rootMargin: `${offset}px`,
        threshold,
      }
    );

    observer.observe(element);

    return () => {
      observer.disconnect();
    };
  }, [offset, once, threshold, hasLoaded]);

  const containerStyle: React.CSSProperties = {
    minHeight: height ? (typeof height === "number" ? `${height}px` : height) : "auto",
    ...style,
  };

  return (
    <div ref={elementRef} className={className} style={containerStyle}>
      {isVisible ? children : placeholder || <div style={{ height: height || "200px" }} />}
    </div>
  );
};

export default LazyLoad;
