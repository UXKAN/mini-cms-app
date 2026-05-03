"use client";

import { cn } from "@/lib/utils";

type Props = {
  selected: boolean;
  onClick: () => void;
  title: string;
  description?: string;
  /** "lg" = primaire keuze (grotere padding, dikkere border) — bv. type-keuze in een formulier.
   *  "sm" = secundaire keuze (compacter) — bv. radio-style sub-keuzes. */
  size?: "sm" | "lg";
  hasError?: boolean;
  disabled?: boolean;
  className?: string;
};

export function SelectableCard({
  selected,
  onClick,
  title,
  description,
  size = "sm",
  hasError,
  disabled,
  className,
}: Props) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      aria-pressed={selected}
      data-error={hasError && !selected}
      className={cn(
        "rounded-lg text-left transition w-full",
        size === "lg" ? "p-4" : "p-3",
        // Border-dikte: lg altijd 2px; sm krijgt 2px wanneer selected zodat de
        // actieve-staat consistent uitspringt (gelijk aan lg).
        size === "lg" || selected ? "border-2" : "border",
        selected
          ? "border-accent-dark bg-accent-light"
          : hasError
            ? "border-destructive/50 bg-background"
            : "border-border hover:border-primary/50 bg-background",
        disabled && "opacity-50 cursor-not-allowed",
        className
      )}
    >
      <div className={cn(size === "lg" ? "font-medium" : "font-medium text-sm")}>
        {title}
      </div>
      {description && (
        <div className="text-xs text-muted-foreground mt-0.5">{description}</div>
      )}
    </button>
  );
}
