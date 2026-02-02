import * as React from "react";
import {
  Button,
  type ButtonProps,
  buttonVariants,
} from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { cn } from "@/lib/utils";

type DatePickerProps = Omit<ButtonProps, "value" | "onChange"> & {
  value: Date | undefined;
  onChange: (value: Date | undefined) => void;
  placeholder?: string;
};

export function DatePicker({
  value,
  onChange,
  placeholder = "Select date",
  className,
  ...props
}: DatePickerProps) {
  const [open, setOpen] = React.useState(false);

  const hasValue = !!value;

  return (
    <Popover onOpenChange={setOpen} open={open}>
      <PopoverTrigger
        render={
          <Button
            className={cn(
              "relative w-48 justify-start gap-1 font-normal",
              !hasValue && "text-muted-foreground",
              className
            )}
            variant="outline"
            {...props}
          >
            <span className="i-hugeicons-calendar-03 mr-1 size-4" />
            {value ? value.toLocaleDateString() : placeholder}

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
      <PopoverContent align="start" className="w-auto overflow-hidden p-0">
        <Calendar
          captionLayout="dropdown"
          mode="single"
          onSelect={(date) => {
            onChange(date);
            setOpen(false);
          }}
          selected={value}
        />
      </PopoverContent>
    </Popover>
  );
}
