"use client";

import { useEffect, useRef } from "react";
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
  const ref = useRef<React.ElementRef<typeof Checkbox>>(null);

  useEffect(() => {
    if (ref.current) {
      ref.current.setAttribute(
        "aria-checked",
        indeterminate ? "mixed" : checked ? "true" : "false"
      );
    }
  }, [checked, indeterminate]);

  return (
    <Checkbox
      ref={ref}
      checked={indeterminate ? "indeterminate" : checked}
      onCheckedChange={(v) => onChange(v === true)}
      aria-label={ariaLabel}
    />
  );
}
