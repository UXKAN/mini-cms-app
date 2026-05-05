"use client";

import type { ReactNode } from "react";
import { Button } from "@/components/ui/button";
import { X } from "lucide-react";

export type BulkAction = {
  label: string;
  icon?: ReactNode;
  onClick: () => void;
  destructive?: boolean;
  disabled?: boolean;
  disabledReason?: string;
};

type Props = {
  count: number;
  actions: BulkAction[];
  onClear: () => void;
};

export function TableBulkBar({ count, actions, onClear }: Props) {
  if (count === 0) return null;
  return (
    <div
      role="region"
      aria-label={`Bulk-acties voor ${count} geselecteerde rijen`}
      className="fixed bottom-4 left-1/2 -translate-x-1/2 z-30 bg-foreground text-background rounded-full shadow-lg px-3 py-2 flex items-center gap-3 min-w-[280px] max-w-[90vw]"
    >
      <span className="text-sm font-medium pl-2 whitespace-nowrap">
        {count} geselecteerd
      </span>
      <div className="flex gap-1 flex-wrap">
        {actions.map((a) => (
          <Button
            key={a.label}
            variant="ghost"
            size="sm"
            onClick={a.onClick}
            disabled={a.disabled}
            title={a.disabled ? a.disabledReason : undefined}
            className={
              a.destructive
                ? "text-rose-300 hover:text-rose-200 hover:bg-white/10"
                : "text-background hover:bg-white/10"
            }
          >
            {a.icon && <span className="mr-1.5">{a.icon}</span>}
            {a.label}
          </Button>
        ))}
      </div>
      <Button
        variant="ghost"
        size="icon"
        aria-label="Selectie opheffen"
        onClick={onClear}
        className="h-8 w-8 text-background/70 hover:bg-white/10 ml-auto"
      >
        <X className="h-4 w-4" />
      </Button>
    </div>
  );
}
