"use client"

import * as React from "react"

import { ChevronLeft, ChevronRight } from "lucide-react"
import { DayPicker } from "react-day-picker"

import { cn } from "@/lib/utils"
import { buttonVariants } from "@/components/ui/button"

export type CalendarProps = React.ComponentProps<typeof DayPicker>

function Calendar({
  className,
  classNames,
  showOutsideDays = true,
  ...props
}: CalendarProps) {
  return (
    <DayPicker
      showOutsideDays={showOutsideDays}
      className={cn("p-4 bg-white rounded-md shadow-sm border", className)}
      classNames={{
        months: "flex flex-col sm:flex-row space-y-4 sm:space-x-4 sm:space-y-0",
        month: "space-y-4",
        // Caption adjustments
        caption: "flex justify-center pt-2 relative items-center min-h-[40px]",
        caption_label: "text-base font-bold text-gray-700",
        caption_dropdowns: "flex justify-center gap-2 px-2",

        // Navigation buttons (Arrow keys)
        nav: "space-x-1 flex items-center bg-white",
        nav_button: cn(
          buttonVariants({ variant: "outline" }),
          "h-[32px] w-[32px] bg-transparent p-0 opacity-50 hover:opacity-100 border-gray-300"
        ),
        nav_button_previous: "absolute left-2",
        nav_button_next: "absolute right-2",

        // Table layout
        table: "w-full border-collapse space-y-1",
        head_row: "flex mb-2",
        head_cell:
          "text-muted-foreground rounded-md w-[36px] font-normal text-[1.3rem]",

        row: "flex w-full mt-2",

        // Day cells
        cell: "h-[36px] w-[36px] text-center text-sm p-0 relative [&:has([aria-selected].day-range-end)]:rounded-r-md [&:has([aria-selected].day-outside)]:bg-accent/50 [&:has([aria-selected])]:bg-accent first:[&:has([aria-selected])]:rounded-l-md last:[&:has([aria-selected])]:rounded-r-md focus-within:relative focus-within:z-20",

        // Individual Day button
        day: cn(
          buttonVariants({ variant: "ghost" }),
          "h-[36px] w-[36px] p-0 font-normal aria-selected:opacity-100 text-[1.4rem]"
        ),
        day_range_end: "day-range-end",
        day_selected:
          "bg-[var(--cl-pri)] text-white hover:bg-[var(--cl-pri)] hover:text-white focus:bg-[var(--cl-pri)] focus:text-white",
        day_today: "bg-gray-100 text-gray-900 font-bold border border-gray-300",
        day_outside:
          "day-outside text-muted-foreground opacity-50 aria-selected:bg-accent/50 aria-selected:text-muted-foreground aria-selected:opacity-30",
        day_disabled: "text-muted-foreground opacity-50",
        day_range_middle:
          "aria-selected:bg-accent aria-selected:text-accent-foreground",
        day_hidden: "invisible",

        // Dropdown specific styles (cho việc chọn Năm)
        dropdown:
          "appearance-none bg-transparent border-none p-2 text-sm font-medium cursor-pointer hover:bg-gray-100 rounded-md",
        dropdown_month: "relative inline-flex items-center",
        dropdown_year: "relative inline-flex items-center ml-2",

        ...classNames,
      }}
      components={{
        Chevron: ({ orientation, ...props }) =>
          orientation === "left" ? (
            <ChevronLeft className="h-5 w-5" {...props} />
          ) : (
            <ChevronRight className="h-5 w-5" {...props} />
          ),
      }}
      {...props}
    />
  )
}
Calendar.displayName = "Calendar"

export { Calendar }
