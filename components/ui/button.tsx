import { Slot } from "@radix-ui/react-slot";
import { type VariantProps, cva } from "class-variance-authority";
import type * as React from "react";

import { tokens } from "@/lib/design-tokens";
import { cn } from "@/lib/utils";

/**
 * Control sizes mapped to design tokens.
 * Always use these — do NOT hard-code h-9, h-10, h-8.
 *
 * Tailwind 4 h-* utilities are mapped via @theme inline in globals.css
 * so h-control-xs = 2.8rem, h-control-sm = 3.2rem, etc.
 */
const buttonVariants = cva(
  "inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-md text-sm font-medium transition-all disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg:not([class*='size-'])]:size-4 shrink-0 [&_svg]:shrink-0 outline-none focus-visible:border-ring focus-visible:ring-ring/50 focus-visible:ring-[3px] aria-invalid:ring-destructive/20 dark:aria-invalid:ring-destructive/40 aria-invalid:border-destructive",
  {
    variants: {
      variant: {
        default: "bg-primary text-primary-foreground hover:bg-primary/90",
        destructive:
          "bg-destructive text-white hover:bg-destructive/90 focus-visible:ring-destructive/20 dark:focus-visible:ring-destructive/40 dark:bg-destructive/60",
        outline:
          "border bg-background shadow-xs hover:bg-accent hover:text-accent-foreground dark:bg-input/30 dark:border-input dark:hover:bg-input/50",
        secondary: "bg-secondary text-secondary-foreground hover:bg-secondary/80",
        ghost: "hover:bg-accent hover:text-accent-foreground dark:hover:bg-accent/50",
        link: "text-primary underline-offset-4 hover:underline",
      },
      /**
       * Button heights aligned to design token control scale.
       * h-control-xs  = 2.8rem (28px) — icon-only tiny
       * h-control-sm  = 3.2rem (32px) — small
       * h-control-md  = 4rem   (40px) — default
       * h-control-lg  = 4.8rem (48px) — large
       * size-9        = 3.6rem (36px) — icon default (shadcn compat)
       * size-8        = 2.8rem (28px) — icon small (shadcn compat)
       * size-10       = 4rem   (40px) — icon large (shadcn compat)
       */
      size: {
        default: "h-control-md px-4 py-2 has-[>svg]:px-3", // 40px
        sm: "h-control-sm gap-1-5 px-3 has-[>svg]:px-2-5", // 32px
        lg: "h-control-lg px-6 has-[>svg]:px-4", // 48px
        xs: "h-control-xs gap-1 px-2 text-xs", // 28px
        icon: "size-9", // 36px (shadcn compat)
        "icon-sm": "size-8", // 28px (shadcn compat)
        "icon-lg": "size-10", // 40px (shadcn compat)
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  }
);

/** Expose raw pixel values for inline-style usage */
export const BUTTON_HEIGHTS = {
  xs: tokens.control.xs, // 2.8rem
  sm: tokens.control.sm, // 3.2rem
  default: tokens.control.md, // 4rem
  lg: tokens.control.lg, // 4.8rem
  xl: tokens.control.xl, // 5.6rem
} as const;

function Button({
  className,
  variant,
  size,
  asChild = false,
  ...props
}: React.ComponentProps<"button"> &
  VariantProps<typeof buttonVariants> & {
    asChild?: boolean;
  }) {
  const Comp = asChild ? Slot : "button";

  return (
    <Comp
      data-slot="button"
      className={cn(buttonVariants({ variant, size, className }))}
      {...props}
    />
  );
}

export { Button, buttonVariants };
