import * as React from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { DayPicker } from "react-day-picker";

import { cn } from "@/lib/utils";
import { buttonVariants } from "@/components/ui/button";
import { isHoliday, isSunday, isSecondSaturday, getHolidayName } from "@/lib/indianHolidays";

export type CalendarProps = React.ComponentProps<typeof DayPicker>;

function Calendar({ className, classNames, showOutsideDays = true, modifiers, modifiersClassNames, ...props }: CalendarProps) {
  // Combine user modifiers with holiday modifiers
  const combinedModifiers = {
    ...modifiers,
    holiday: (date: Date) => isHoliday(date),
    sunday: (date: Date) => isSunday(date),
    secondSaturday: (date: Date) => isSecondSaturday(date),
  };

  const combinedModifiersClassNames = {
    ...modifiersClassNames,
    holiday: "text-destructive font-bold",
    sunday: "text-destructive font-medium",
    secondSaturday: "text-destructive font-medium",
  };

  return (
    <DayPicker
      showOutsideDays={showOutsideDays}
      className={cn("p-4 pointer-events-auto", className)}
      classNames={{
        months: "flex flex-col sm:flex-row space-y-4 sm:space-x-4 sm:space-y-0",
        month: "space-y-6",
        caption: "flex justify-center pt-1 relative items-center mb-2",
        caption_label: "text-base font-semibold text-foreground",
        nav: "space-x-1 flex items-center",
        nav_button: cn(
          buttonVariants({ variant: "outline" }),
          "h-8 w-8 bg-transparent p-0 opacity-60 hover:opacity-100 hover:bg-accent transition-all",
        ),
        nav_button_previous: "absolute left-1",
        nav_button_next: "absolute right-1",
        table: "w-full border-collapse",
        head_row: "flex",
        head_cell: "text-muted-foreground rounded-md w-11 font-semibold text-xs uppercase tracking-wide",
        row: "flex w-full mt-1",
        cell: cn(
          "relative h-11 w-11 text-center p-0",
          "focus-within:relative focus-within:z-20",
          "[&:has([aria-selected])]:bg-primary/10 [&:has([aria-selected])]:rounded-lg",
          "[&:has([aria-selected].day-range-end)]:rounded-r-lg",
          "[&:has([aria-selected].day-outside)]:bg-accent/50",
          "first:[&:has([aria-selected])]:rounded-l-lg last:[&:has([aria-selected])]:rounded-r-lg"
        ),
        day: cn(
          buttonVariants({ variant: "ghost" }),
          "h-10 w-10 p-0 font-medium text-base aria-selected:opacity-100 rounded-lg transition-all hover:bg-accent/80"
        ),
        day_range_end: "day-range-end",
        day_selected:
          "bg-primary text-primary-foreground hover:bg-primary hover:text-primary-foreground focus:bg-primary focus:text-primary-foreground shadow-sm",
        day_today: "bg-accent text-accent-foreground font-bold ring-2 ring-primary/20",
        day_outside:
          "day-outside text-muted-foreground/40 aria-selected:bg-accent/50 aria-selected:text-muted-foreground aria-selected:opacity-30",
        day_disabled: "text-muted-foreground opacity-40",
        day_range_middle: "aria-selected:bg-accent aria-selected:text-accent-foreground",
        day_hidden: "invisible",
        ...classNames,
      }}
      modifiers={combinedModifiers}
      modifiersClassNames={combinedModifiersClassNames}
      components={{
        IconLeft: ({ ..._props }) => <ChevronLeft className="h-5 w-5" />,
        IconRight: ({ ..._props }) => <ChevronRight className="h-5 w-5" />,
        DayContent: ({ date }) => {
          const holidayName = getHolidayName(date);
          const is2ndSat = isSecondSaturday(date);
          const tooltipText = holidayName || (is2ndSat ? '2nd Saturday' : undefined);
          return (
            <span title={tooltipText} className="text-[15px]">
              {date.getDate()}
            </span>
          );
        },
      }}
      {...props}
    />
  );
}
Calendar.displayName = "Calendar";

export { Calendar };
