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
      className={cn("p-4", className)} // Tăng padding tổng thể
      classNames={{
        months: "flex flex-col sm:flex-row space-y-4 sm:space-x-4 sm:space-y-0",
        month: "space-y-4",
        caption: "flex justify-center pt-2 relative items-center", // Tăng pt
        caption_label: "text-base font-medium hidden", // Ẩn label mặc định khi dùng dropdown
        
        // FIX 1: Thêm margin (mx-10) để dropdown không đè lên mũi tên
        caption_dropdowns: "flex justify-center gap-2 mx-10 items-center",
        dropdown: "text-sm bg-transparent p-0 m-0",
        dropdown_month: "relative inline-flex items-center [&>.rdp-vhidden]:hidden", // Ẩn label ẩn của thư viện
        dropdown_year: "relative inline-flex items-center [&>.rdp-vhidden]:hidden",
        
        nav: "space-x-1 flex items-center",
        
        // FIX 2: Tăng kích thước nút mũi tên (vì 1rem = 10px)
        nav_button: cn(
          buttonVariants({ variant: "outline" }),
          "h-[28px] w-[28px] bg-transparent p-0 opacity-50 hover:opacity-100" 
        ),
        nav_button_previous: "absolute left-1",
        nav_button_next: "absolute right-1",
        
        table: "w-full border-collapse space-y-1",
        head_row: "flex",
        
        // FIX 3: Tăng kích thước ô tiêu đề (Mo, Tu...) lên 36px (3.6rem)
        head_cell:
          "text-muted-foreground rounded-md w-[36px] font-normal text-[1.3rem]",
        
        row: "flex w-full mt-2",
        
        // FIX 4: Tăng kích thước ô ngày lên 36px để số không bị vỡ dòng
        cell: "h-[36px] w-[36px] text-center text-sm p-0 relative [&:has([aria-selected].day-range-end)]:rounded-r-md [&:has([aria-selected].day-outside)]:bg-accent/50 [&:has([aria-selected])]:bg-accent first:[&:has([aria-selected])]:rounded-l-md last:[&:has([aria-selected])]:rounded-r-md focus-within:relative focus-within:z-20",
        
        day: cn(
          buttonVariants({ variant: "ghost" }),
          // Tăng font-size ngày và kích thước nút bấm
          "h-[36px] w-[36px] p-0 font-normal aria-selected:opacity-100 text-[1.4rem]" 
        ),
        day_range_end: "day-range-end",
        day_selected:
          "bg-primary text-primary-foreground hover:bg-primary hover:text-primary-foreground focus:bg-primary focus:text-primary-foreground",
        day_today: "bg-accent text-accent-foreground",
        day_outside:
          "day-outside text-muted-foreground opacity-50 aria-selected:bg-accent/50 aria-selected:text-muted-foreground aria-selected:opacity-30",
        day_disabled: "text-muted-foreground opacity-50",
        day_range_middle:
          "aria-selected:bg-accent aria-selected:text-accent-foreground",
        day_hidden: "invisible",
        ...classNames,
      }}
      components={{
        Chevron: ({ orientation, ...props }) => {
          if (orientation === "left") {
            return <ChevronLeft className="h-5 w-5" {...props} />
          }
          return <ChevronRight className="h-5 w-5" {...props} />
        },
      }}
      {...props}
    />
  )
}
Calendar.displayName = "Calendar"

export { Calendar }
