"use client";

import { useEffect, useRef, useState } from "react";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";

type Props = {
  /** ISO `YYYY-MM-DD` of leeg. */
  value: string;
  /** Geeft ISO terug zodra de waarde compleet en geldig is, anders `""`. */
  onChange: (iso: string) => void;
  hasError?: boolean;
  autoComplete?: string;
  className?: string;
  id?: string;
};

/* ─── format helpers ─── */

function isoToDisplay(iso: string): string {
  const m = /^(\d{4})-(\d{2})-(\d{2})$/.exec(iso);
  if (!m) return "";
  return `${m[3]}/${m[2]}/${m[1]}`;
}

/** Reformatteert ruwe input naar `dd/mm/jjjj`. Strips non-digits, voegt slashes toe. */
function formatDisplay(raw: string): string {
  const digits = raw.replace(/\D/g, "").slice(0, 8);
  if (digits.length <= 2) return digits;
  if (digits.length <= 4) return `${digits.slice(0, 2)}/${digits.slice(2)}`;
  return `${digits.slice(0, 2)}/${digits.slice(2, 4)}/${digits.slice(4)}`;
}

/** dd/mm/jjjj → ISO. Returnt `""` als niet exact compleet. */
function displayToIso(display: string): string {
  const m = /^(\d{2})\/(\d{2})\/(\d{4})$/.exec(display);
  if (!m) return "";
  return `${m[3]}-${m[2]}-${m[1]}`;
}

export function DateOfBirthInput({
  value,
  onChange,
  hasError,
  autoComplete = "bday",
  className,
  id,
}: Props) {
  const [display, setDisplay] = useState(() => isoToDisplay(value));
  const last = useRef(value);

  // Externe value-wijziging (bv. form reset) → display synchroniseren.
  useEffect(() => {
    if (value !== last.current) {
      last.current = value;
      setDisplay(isoToDisplay(value));
    }
  }, [value]);

  function commit(next: string) {
    setDisplay(next);
    const iso = displayToIso(next);
    last.current = iso;
    onChange(iso);
  }

  function handleChange(e: React.ChangeEvent<HTMLInputElement>) {
    commit(formatDisplay(e.target.value));
  }

  function handlePaste(e: React.ClipboardEvent<HTMLInputElement>) {
    e.preventDefault();
    const text = e.clipboardData.getData("text");
    commit(formatDisplay(text));
  }

  return (
    <Input
      id={id}
      type="text"
      inputMode="numeric"
      autoComplete={autoComplete}
      value={display}
      onChange={handleChange}
      onPaste={handlePaste}
      placeholder="dd/mm/jjjj"
      maxLength={10}
      data-error={hasError}
      className={cn("font-sans", className)}
    />
  );
}
