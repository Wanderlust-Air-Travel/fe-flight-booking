/**
 * =====================================================================
 *  cnSize — Type-safe inline-style helper using design tokens
 * =====================================================================
 *
 *  Dùng khi cần inline-style thay vì Tailwind class:
 *    - Dynamic values từ props/logic
 *    - Styled-components / inline-style patterns
 *    - SSR where Tailwind can't be processed
 *
 *  Cách dùng:
 *    cnSize('text', 'md')           → { fontSize: '1.6rem' }
 *    cnSize('space', '4')            → { padding: '1.6rem' }
 *    cnSize('height', 'control-md') → { height: '4rem' }
 *    cnSize('radius', 'lg')         → { borderRadius: '0.8rem' }
 *    cnSize('icon', 'md')            → { width: '2rem', height: '2rem' }
 *
 *  Kết hợp với Tailwind:
 *    <div style={cnSize('text', 'md')} className="font-semibold">
 *      Content
 *    </div>
 * =====================================================================
 */

import React from "react"
import { tokens } from "@/lib/design-tokens"
import { clsx, type ClassValue } from "clsx"

type FontSizeKey = keyof typeof tokens.fontSize
type SpaceKey = keyof typeof tokens.space
type RadiusKey = keyof typeof tokens.radius
type ControlSizeKey = keyof typeof tokens.control
type IconSizeKey = keyof typeof tokens.icon

type Category = "text" | "space" | "height" | "width" | "radius" | "icon" | "padding" | "margin"

interface CnSizeOptions {
  /** Multiply the token value (e.g., for margins/padding on both sides) */
  multiply?: number
  /** Append a unit (default inherits from token) */
  unit?: string
}

/**
 * Get a single CSS property value from design tokens.
 */
export function cnSize(
  category: "text",
  size: FontSizeKey,
  options?: CnSizeOptions
): { fontSize: string }

export function cnSize(
  category: "space",
  size: SpaceKey,
  options?: CnSizeOptions
): { padding: string }

export function cnSize(
  category: "padding",
  size: SpaceKey,
  options?: CnSizeOptions
): { padding: string }

export function cnSize(
  category: "margin",
  size: SpaceKey,
  options?: CnSizeOptions
): { margin: string }

export function cnSize(
  category: "height",
  size: ControlSizeKey,
  options?: CnSizeOptions
): { height: string }

export function cnSize(
  category: "width",
  size: ControlSizeKey,
  options?: CnSizeOptions
): { width: string }

export function cnSize(
  category: "radius",
  size: RadiusKey,
  options?: CnSizeOptions
): { borderRadius: string }

export function cnSize(
  category: "icon",
  size: IconSizeKey,
  options?: CnSizeOptions
): { width: string; height: string }

export function cnSize(
  category: Category,
  size: string,
  options?: CnSizeOptions
): Record<string, string> {
  const { multiply = 1, unit } = options ?? {}

  const raw = (() => {
    switch (category) {
      case "text":
        return tokens.fontSize[size as FontSizeKey]
      case "space":
      case "padding":
      case "margin":
        return tokens.space[size as SpaceKey]
      case "height":
        return tokens.control[size as ControlSizeKey]
      case "width":
        return tokens.control[size as ControlSizeKey]
      case "radius":
        return tokens.radius[size as RadiusKey]
      case "icon":
        return tokens.icon[size as IconSizeKey]
      default:
        return null
    }
  })()

  if (!raw) {
    console.warn(`[cnSize] Unknown category "${category}" or size "${size}"`)
    return {}
  }

  const value = unit ?? raw

  if (multiply === 1) {
    switch (category) {
      case "text":
        return { fontSize: value }
      case "space":
      case "padding":
        return { padding: value }
      case "margin":
        return { margin: value }
      case "height":
        return { height: value }
      case "width":
        return { width: value }
      case "radius":
        return { borderRadius: value }
      case "icon":
        return { width: value, height: value }
    }
  }

  // Multiply numeric values
  const numMatch = String(raw).match(/^([\d.]+)(.*)$/)
  if (numMatch) {
    const [, num, suffix] = numMatch
    const multiplied = (parseFloat(num) * multiply).toFixed(2).replace(/\.00$/, "")
    const multipliedVal = `${multiplied}${suffix}`

    switch (category) {
      case "text":
        return { fontSize: multipliedVal }
      case "space":
      case "padding":
        return { padding: multipliedVal }
      case "margin":
        return { margin: multipliedVal }
      case "height":
        return { height: multipliedVal }
      case "width":
        return { width: multipliedVal }
      case "radius":
        return { borderRadius: multipliedVal }
      case "icon":
        return { width: multipliedVal, height: multipliedVal }
    }
  }

  return {}
}

/**
 * Merge cnSize results with Tailwind className.
 * Returns an object to spread onto the element.
 *
 * Usage:
 *   <div {...cnSizeMerge({ className: "font-semibold" }, "text", "md")}>
 */
export function cnSizeMerge(
  rest: { className?: ClassValue; style?: React.CSSProperties },
  category: "text",
  size: FontSizeKey,
  options?: CnSizeOptions
): { className: string; style?: React.CSSProperties }

export function cnSizeMerge(
  rest: { className?: ClassValue; style?: React.CSSProperties },
  category: "space" | "padding" | "margin",
  size: SpaceKey,
  options?: CnSizeOptions
): { className: string; style?: React.CSSProperties }

export function cnSizeMerge(
  rest: { className?: ClassValue; style?: React.CSSProperties },
  category: "height" | "width",
  size: ControlSizeKey,
  options?: CnSizeOptions
): { className: string; style?: React.CSSProperties }

export function cnSizeMerge(
  rest: { className?: ClassValue; style?: React.CSSProperties },
  category: "radius",
  size: RadiusKey,
  options?: CnSizeOptions
): { className: string; style?: React.CSSProperties }

export function cnSizeMerge(
  rest: { className?: ClassValue; style?: React.CSSProperties },
  category: "icon",
  size: IconSizeKey,
  options?: CnSizeOptions
): { className: string; style?: React.CSSProperties }

export function cnSizeMerge(
  rest: { className?: ClassValue; style?: React.CSSProperties },
  category: Category,
  size: string,
  options?: CnSizeOptions
): { className?: ClassValue; style?: React.CSSProperties } {
  // Cast both category and size to satisfy overload resolution
  const styles = (cnSize as (cat: string, s: string, opts?: CnSizeOptions) => Record<string, string>)(category, size, options)
  return {
    ...rest,
    style: { ...styles, ...rest.style },
  }
}

/**
 * Shortcut: get font-size value only.
 */
export function fontSize(size: FontSizeKey): string {
  return tokens.fontSize[size]
}

/**
 * Shortcut: get spacing value only.
 */
export function space(size: SpaceKey): string {
  return tokens.space[size]
}

/**
 * Shortcut: get control height value only.
 */
export function controlHeight(size: ControlSizeKey): string {
  return tokens.control[size]
}

/**
 * Shortcut: get radius value only.
 */
export function radius(size: RadiusKey): string {
  return tokens.radius[size]
}

/**
 * Shortcut: get icon size value only.
 */
export function iconSize(size: IconSizeKey): { width: string; height: string } {
  const s = tokens.icon[size]
  return { width: s, height: s }
}
