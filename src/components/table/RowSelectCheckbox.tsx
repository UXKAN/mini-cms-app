"use client";

import { Checkbox } from "@/components/ui/checkbox";

type Props = {
  checked: boolean;
  indeterminate?: boolean;
  onChange: (checked: boolean) => void;
  ariaLabel: string;
};

export function RowSelectCheckbox({
  checked,
  indeterminate = false,
  onChange,
  ariaLabel,
}: Props) {
  return (
    <Checkbox
      checked={indeterminate ? "indeterminate" : checked}
      onCheckedChange={(v) => onChange(v === true)}
      aria-label={ariaLabel}
    />
  );
}
