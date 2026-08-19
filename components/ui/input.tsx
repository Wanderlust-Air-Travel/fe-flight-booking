import type * as React from "react";

import { cn } from "@/lib/utils";

/**
 * Input heights aligned to design token control scale.
 * h-control-md = 4rem (40px) — default
 * h-control-sm = 3.2rem (32px) — small
 *
 * Tailwind 4 h-* utilities mapped via @theme inline in globals.css.
 */
function Input({ className, type, value, ...props }: React.ComponentProps<"input">) {
  // Ensure value is always a string (never null or undefined) for controlled components
  const controlledValue = value == null ? "" : String(value);

  return (
    <input
      type={type}
      data-slot="input"
      value={controlledValue}
      className={cn(
        "file:text-foreground placeholder:text-muted-foreground selection:bg-primary selection:text-primary-foreground dark:bg-input/30 " +
          "border-input " +
          "h-control-md " + // 4rem = 40px — aligns with default button height
          "w-full min-w-0 " +
          "rounded-md " + // var(--radius-md) = 0.6rem
          "border " +
          "bg-transparent " +
          "px-3 py-1 " + // horizontal padding, input text padding
          "text-base " + // font-size 1.4rem (14px)
          "shadow-xs " +
          "transition-[color,box-shadow] " +
          "outline-none " +
          "file:inline-flex file:h-7 file:border-0 file:bg-transparent file:text-sm file:font-medium " +
          "disabled:pointer-events-none disabled:cursor-not-allowed disabled:opacity-50 " +
          "aria-invalid:ring-destructive/20 dark:aria-invalid:ring-destructive/40 aria-invalid:border-destructive",
        className
      )}
      {...props}
    />
  );
}

export { Input };

/** Pixel value for small input variant (inline-style usage) */
export const INPUT_HEIGHT_SM = "3.2rem"; // = tokens.control.sm
