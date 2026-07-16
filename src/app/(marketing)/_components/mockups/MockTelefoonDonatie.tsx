"use client";

import { useEffect, useRef, useState } from "react";
import { Check } from "lucide-react";
import type { MarketingContent } from "../../_content/types";

type Props = {
  content: MarketingContent["recognition"]["phone"];
};

/**
 * Speelbaar telefoonframe: één tik op "Opslaan" toont hoe snel een contante
 * donatie is vastgelegd. Fictieve gegevens; de knop is echt bedienbaar.
 */
export function MockTelefoonDonatie({ content }: Props) {
  const [saved, setSaved] = useState(false);
  const timer = useRef<number | undefined>(undefined);

  useEffect(() => () => window.clearTimeout(timer.current), []);

  const handleSave = () => {
    setSaved(true);
    window.clearTimeout(timer.current);
    timer.current = window.setTimeout(() => setSaved(false), 2200);
  };

  return (
    <div
      role="group"
      aria-label={content.aria}
      className="relative mx-auto w-[220px] rounded-[2rem] border-[5px] border-foreground/80 bg-card px-4 pb-5 pt-8"
      style={{ boxShadow: "var(--shadow-lg)" }}
    >
      <span
        aria-hidden="true"
        className="absolute left-1/2 top-2.5 h-1.5 w-14 -translate-x-1/2 rounded-full bg-foreground/15"
      />

      <p className="text-[10px] font-semibold uppercase tracking-widest text-muted-foreground">
        {content.appTitle}
      </p>
      <p className="mt-2 font-serif text-[30px] leading-none text-foreground">
        {content.amount}
      </p>
      <div className="mt-3 flex flex-wrap gap-1.5">
        <span className="rounded-full bg-accent-light px-2.5 py-1 text-[11px] font-semibold text-accent-dark">
          {content.method}
        </span>
        <span className="rounded-full border bg-background px-2.5 py-1 text-[11px] font-medium text-muted-foreground">
          {content.donor}
        </span>
      </div>

      <button
        type="button"
        onClick={handleSave}
        className="mt-5 flex min-h-[44px] w-full items-center justify-center gap-1.5 rounded-xl bg-primary text-sm font-semibold text-primary-foreground transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 motion-reduce:transition-none"
      >
        {saved ? (
          <>
            <Check className="h-4 w-4" strokeWidth={2.5} aria-hidden="true" />
            {content.saved}
          </>
        ) : (
          content.save
        )}
      </button>
      <span aria-live="polite" className="sr-only">
        {saved ? content.saved : ""}
      </span>
    </div>
  );
}
