"use client";

import { useState } from "react";
import { format, isValid, parse } from "date-fns";
import { nl } from "date-fns/locale";
import { Calendar as CalendarIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { cn } from "@/lib/utils";

type Props = {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  hasError?: boolean;
  yearSelector?: boolean;
};

export function DatePicker({
  value,
  onChange,
  placeholder = "Kies een datum",
  hasError = false,
  yearSelector = false,
}: Props) {
  const [open, setOpen] = useState(false);

  const parsed = value ? parse(value, "yyyy-MM-dd", new Date()) : undefined;
  const date = parsed && isValid(parsed) ? parsed : undefined;

  const handleSelect = (d: Date | undefined) => {
    if (d) {
      onChange(format(d, "yyyy-MM-dd"));
      setOpen(false);
    } else {
      onChange("");
    }
  };

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          type="button"
          variant="outline"
          data-error={hasError || undefined}
          className={cn(
            "w-full justify-start text-left font-normal h-9 pl-3",
            !date && "text-muted-foreground",
            hasError && "border-destructive"
          )}
        >
          <CalendarIcon className="mr-2 h-4 w-4 shrink-0 text-muted-foreground" />
          <span className="truncate">
            {date
              ? format(date, "d MMMM yyyy", { locale: nl })
              : placeholder}
          </span>
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-auto p-0" align="start">
        <Calendar
          mode="single"
          selected={date}
          onSelect={handleSelect}
          locale={nl}
          captionLayout={yearSelector ? "dropdown" : "label"}
          startMonth={yearSelector ? new Date(1900, 0) : undefined}
          endMonth={yearSelector ? new Date() : undefined}
          defaultMonth={date}
          disabled={yearSelector ? { after: new Date() } : undefined}
        />
      </PopoverContent>
    </Popover>
  );
}
