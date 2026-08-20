"use client";

import { MoreHorizontal } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import type { ReactNode } from "react";

export type RowAction = {
  label: string;
  icon?: ReactNode;
  onClick: () => void;
  destructive?: boolean;
  separatorBefore?: boolean;
  disabled?: boolean;
};

type Props = {
  actions: RowAction[];
  ariaLabel?: string;
};

export function RowActionsMenu({ actions, ariaLabel = "Acties" }: Props) {
  if (actions.length === 0) return null;
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant="ghost"
          size="icon"
          className="h-10 w-10 rounded-[10px]"
          aria-label={ariaLabel}
        >
          <MoreHorizontal className="h-4 w-4" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-48">
        {actions.map((a, i) => (
          <div key={`${a.label}-${i}`}>
            {a.separatorBefore && <DropdownMenuSeparator />}
            <DropdownMenuItem
              onClick={a.onClick}
              disabled={a.disabled}
              className={
                a.destructive
                  ? "text-destructive focus:text-destructive"
                  : undefined
              }
            >
              {a.icon && <span className="mr-2">{a.icon}</span>}
              {a.label}
            </DropdownMenuItem>
          </div>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
