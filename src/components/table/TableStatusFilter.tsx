"use client";

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

export type StatusOption = { value: string; label: string };

type Props = {
  value: string;
  onChange: (v: string) => void;
  options: StatusOption[];
  labelPrefix?: string;
  className?: string;
};

export function TableStatusFilter({
  value,
  onChange,
  options,
  labelPrefix = "Status",
  className = "",
}: Props) {
  const current = options.find((o) => o.value === value);
  return (
    <Select value={value} onValueChange={onChange}>
      <SelectTrigger className={`w-auto min-w-[180px] ${className}`}>
        <SelectValue
          placeholder={labelPrefix}
          aria-label={`${labelPrefix}: ${current?.label ?? "alle"}`}
        >
          <span className="text-muted-foreground">{labelPrefix}: </span>
          <span>{current?.label ?? "Alle"}</span>
        </SelectValue>
      </SelectTrigger>
      <SelectContent>
        {options.map((o) => (
          <SelectItem key={o.value} value={o.value}>
            {o.label}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}
