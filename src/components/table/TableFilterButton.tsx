"use client";

import { Filter, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import type { Period } from "@/app/lib/useTableState";

type Props = {
  period: Period;
  onChange: (p: Period) => void;
};

const PRESETS: { value: Period["preset"]; label: string }[] = [
  { value: "all", label: "Alles" },
  { value: "this-month", label: "Deze maand" },
  { value: "this-quarter", label: "Dit kwartaal" },
  { value: "this-year", label: "Dit jaar" },
];

function periodLabel(p: Period): string | null {
  if (p.preset === "all") return null;
  if (p.preset === "this-month") return "Deze maand";
  if (p.preset === "this-quarter") return "Dit kwartaal";
  if (p.preset === "this-year") return "Dit jaar";
  if (p.preset === "custom") {
    if (p.from && p.to) return `${p.from} – ${p.to}`;
    if (p.from) return `vanaf ${p.from}`;
    if (p.to) return `tot ${p.to}`;
    return "Aangepast";
  }
  return null;
}

export function TableFilterButton({ period, onChange }: Props) {
  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button variant="outline" aria-label="Filters openen">
          <Filter className="h-4 w-4 mr-2" />
          Filter
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-72" align="end">
        <div className="space-y-4">
          <div>
            <Label className="text-xs uppercase tracking-wider text-muted-foreground">
              Periode
            </Label>
            <div className="grid grid-cols-2 gap-2 mt-2">
              {PRESETS.map((p) => (
                <Button
                  key={p.value}
                  size="sm"
                  variant={period.preset === p.value ? "default" : "outline"}
                  onClick={() => onChange({ preset: p.value })}
                >
                  {p.label}
                </Button>
              ))}
            </div>
          </div>

          <div>
            <Label className="text-xs uppercase tracking-wider text-muted-foreground">
              Aangepast
            </Label>
            <div className="grid grid-cols-2 gap-2 mt-2">
              <Input
                type="date"
                value={period.preset === "custom" ? (period.from ?? "") : ""}
                onChange={(e) =>
                  onChange({
                    preset: "custom",
                    from: e.target.value,
                    to: period.preset === "custom" ? period.to : undefined,
                  })
                }
                aria-label="Vanaf datum"
              />
              <Input
                type="date"
                value={period.preset === "custom" ? (period.to ?? "") : ""}
                onChange={(e) =>
                  onChange({
                    preset: "custom",
                    from: period.preset === "custom" ? period.from : undefined,
                    to: e.target.value,
                  })
                }
                aria-label="Tot datum"
              />
            </div>
          </div>
        </div>
      </PopoverContent>
    </Popover>
  );
}

type ChipsProps = {
  period: Period;
  onClear: () => void;
};

export function ActiveFilterChips({ period, onClear }: ChipsProps) {
  const label = periodLabel(period);
  if (!label) return null;
  return (
    <div className="flex gap-2 mb-3">
      <span className="inline-flex items-center gap-1.5 rounded-full bg-stone-100 text-stone-900 px-3 py-1 text-xs">
        Periode: {label}
        <button
          type="button"
          onClick={onClear}
          aria-label="Wis periode-filter"
          className="hover:text-stone-700"
        >
          <X className="h-3 w-3" />
        </button>
      </span>
    </div>
  );
}
