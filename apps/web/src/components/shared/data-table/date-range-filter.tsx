import type { DateRange } from "react-day-picker";
import { Button, buttonVariants } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { cn } from "@/lib/utils";

interface DateRangeFilterProps {
  value: DateRange | undefined;
  onChange: (value: DateRange | undefined) => void;
}

export function DateRangeFilter({ value, onChange }: DateRangeFilterProps) {
  const hasValue = value?.from;

  return (
    <div className="flex items-center gap-1">
      <Popover>
        <PopoverTrigger
          render={
            <Button
              className={cn(
                "relative w-55 justify-start gap-1 font-normal",
                !hasValue && "text-muted-foreground"
              )}
              variant="outline"
            >
              <span className="i-hugeicons-calendar-03 mr-1 size-4" />
              {value?.from
                ? value.to
                  ? `${value.from.toLocaleDateString()} - ${value.to.toLocaleDateString()}`
                  : value.from.toLocaleDateString()
                : "Pick a date range"}

              {hasValue && (
                <span
                  className={cn(
                    buttonVariants({ size: "icon-xs", variant: "ghost" }),
                    "-translate-y-1/2 absolute top-1/2 right-1 ml-auto"
                  )}
                  onClick={(e) => {
                    e.stopPropagation();
                    onChange(undefined);
                  }}
                >
                  <span className="i-hugeicons-cancel-01 size-3.5" />
                </span>
              )}
            </Button>
          }
        />
        <PopoverContent align="start" className="w-auto">
          <Calendar
            className="p-0"
            mode="range"
            numberOfMonths={2}
            onSelect={onChange}
            selected={value}
          />
        </PopoverContent>
      </Popover>
    </div>
  );
}

export type { DateRange } from "react-day-picker";
