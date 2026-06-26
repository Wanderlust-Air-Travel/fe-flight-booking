"use client"
/**
 * =====================================================================
 *  useBreakpoint — Hook for responsive design using design tokens
 * =====================================================================
 *
 *  Dùng để lấy breakpoint hiện tại trong React components.
 *  Breakpoints match Tailwind defaults:
 *    sm  : 640px
 *    md  : 768px
 *    lg  : 1024px
 *    xl  : 1280px
 *    2xl : 1536px
 *
 *  Cách dùng:
 *    const bp = useBreakpoint()
 *    if (bp.isMd) { ... }
 *    const height = bp.isLg ? tokens.layout.header.lg : tokens.layout.header.md
 * =====================================================================
 */

import { useEffect, useState } from "react"

export const BREAKPOINTS = {
  sm: 640,
  md: 768,
  lg: 1024,
  xl: 1280,
  "2xl": 1536,
} as const

export type BreakpointKey = keyof typeof BREAKPOINTS

interface BreakpointState {
  width: number
  current: BreakpointKey | null
  isSm: boolean
  isMd: boolean
  isLg: boolean
  isXl: boolean
  is2xl: boolean
  isBelowSm: boolean
  isBelowMd: boolean
  isBelowLg: boolean
  isAboveSm: boolean
  isAboveMd: boolean
  isAboveLg: boolean
  isAboveXl: boolean
  isMobile: boolean
  isTablet: boolean
  isDesktop: boolean
}

function getBreakpoint(width: number): BreakpointKey | null {
  if (width >= BREAKPOINTS["2xl"]) return "2xl"
  if (width >= BREAKPOINTS.xl) return "xl"
  if (width >= BREAKPOINTS.lg) return "lg"
  if (width >= BREAKPOINTS.md) return "md"
  if (width >= BREAKPOINTS.sm) return "sm"
  return null
}

function createBreakpointState(width: number): BreakpointState {
  const current = getBreakpoint(width)
  return {
    width,
    current,
    isSm: current === "sm",
    isMd: current === "md",
    isLg: current === "lg",
    isXl: current === "xl",
    is2xl: current === "2xl",
    isBelowSm: width < BREAKPOINTS.sm,
    isBelowMd: width < BREAKPOINTS.md,
    isBelowLg: width < BREAKPOINTS.lg,
    isAboveSm: width >= BREAKPOINTS.sm,
    isAboveMd: width >= BREAKPOINTS.md,
    isAboveLg: width >= BREAKPOINTS.lg,
    isAboveXl: width >= BREAKPOINTS.xl,
    isMobile: width < BREAKPOINTS.md,
    isTablet: width >= BREAKPOINTS.md && width < BREAKPOINTS.lg,
    isDesktop: width >= BREAKPOINTS.lg,
  }
}

export function useBreakpoint(): BreakpointState {
  const [state, setState] = useState<BreakpointState>(() => {
    if (typeof window === "undefined") {
      return createBreakpointState(0)
    }
    return createBreakpointState(window.innerWidth)
  })

  useEffect(() => {
    function handleResize() {
      setState(createBreakpointState(window.innerWidth))
    }

    window.addEventListener("resize", handleResize, { passive: true })
    return () => window.removeEventListener("resize", handleResize)
  }, [])

  return state
}

/**
 * useHeaderHeight — Returns responsive header height from design tokens.
 * Combines useBreakpoint with tokens.layout.header.
 */
export function useHeaderHeight(): string {
  const bp = useBreakpoint()
  if (bp.isXl) return "9rem"
  if (bp.isLg) return "9rem"
  if (bp.isMd) return "8rem"
  return "7rem"
}
