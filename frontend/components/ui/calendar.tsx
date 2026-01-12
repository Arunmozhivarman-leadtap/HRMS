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
      className={cn("p-3", className)}
      classNames={{
        months: "flex flex-col sm:flex-row space-y-4 sm:space-x-4 sm:space-y-0",
        month: "space-y-4",
        month_caption: "flex justify-center pt-1 relative items-center mb-4",
        caption_label: "text-sm font-bold tracking-tight",
        nav: "flex items-center justify-between absolute w-full left-0 px-2 top-4 pointer-events-none z-10",
        button_previous: cn(
          buttonVariants({ variant: "ghost", size: "icon" }),
          "h-7 w-7 bg-transparent p-0 opacity-50 hover:opacity-100 pointer-events-auto rounded-full"
        ),
        button_next: cn(
          buttonVariants({ variant: "ghost", size: "icon" }),
          "h-7 w-7 bg-transparent p-0 opacity-50 hover:opacity-100 pointer-events-auto rounded-full"
        ),
        month_grid: "w-full border-collapse",
        weekdays: "grid grid-cols-7 mb-2",
        weekday: "text-muted-foreground text-[0.65rem] uppercase font-black text-center tracking-tighter",
        week: "grid grid-cols-7 mt-1",
        day: "h-8 w-8 p-0 flex items-center justify-center relative",
        day_button: cn(
          buttonVariants({ variant: "ghost" }),
          "h-8 w-8 p-0 font-normal transition-all hover:bg-primary/10 hover:text-primary rounded-full text-xs"
        ),
        range_start: "day-range-start",
        range_end: "day-range-end",
        selected:
          "bg-primary text-primary-foreground hover:bg-primary hover:text-primary-foreground focus:bg-primary focus:text-primary-foreground rounded-full shadow-sm scale-110",
        today: "bg-accent text-accent-foreground font-bold",
        outside:
          "day-outside text-muted-foreground opacity-30 aria-selected:bg-accent/50 aria-selected:text-muted-foreground aria-selected:opacity-30",
        disabled: "text-muted-foreground opacity-20 pointer-events-none",
        range_middle:
          "aria-selected:bg-accent aria-selected:text-accent-foreground",
        hidden: "invisible",
        ...classNames,
      }}
      components={{
        Chevron: ({ ...props }) => {
            if (props.orientation === 'left') return <ChevronLeft className="h-4 w-4" />
            return <ChevronRight className="h-4 w-4" />
        }
      }}
      {...props}
    />
  )
}
Calendar.displayName = "Calendar"

export { Calendar }
