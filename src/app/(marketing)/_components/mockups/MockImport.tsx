import { ArrowRight, Check, FileSpreadsheet } from "lucide-react";
import { cn } from "@/lib/utils";
import { mockImport } from "./mockData";

const countStyles: Record<string, string> = {
  success: "bg-[var(--success-light)] text-[var(--success)]",
  accent: "bg-accent-light text-accent-dark",
  muted: "bg-muted text-muted-foreground",
};

export function MockImport() {
  return (
    <div className="w-[640px] bg-background p-5 text-start">
      <div className="flex items-center gap-2">
        {mockImport.steps.map((step, i) => (
          <div key={step} className="flex flex-1 items-center gap-2">
            <span
              className={cn(
                "grid h-5 w-5 shrink-0 place-items-center rounded-full text-[8px] font-bold",
                i < mockImport.activeStep &&
                  "bg-[var(--success-light)] text-[var(--success)]",
                i === mockImport.activeStep &&
                  "bg-primary text-primary-foreground",
                i > mockImport.activeStep &&
                  "border bg-card text-muted-foreground",
              )}
            >
              {i < mockImport.activeStep ? (
                <Check className="h-2.5 w-2.5" strokeWidth={3} />
              ) : (
                i + 1
              )}
            </span>
            <span
              className={cn(
                "text-[9px] font-medium",
                i === mockImport.activeStep
                  ? "text-foreground"
                  : "text-muted-foreground",
              )}
            >
              {step}
            </span>
            {i < mockImport.steps.length - 1 && (
              <span className="h-px flex-1 bg-border" />
            )}
          </div>
        ))}
      </div>

      <div
        className="mt-3 rounded-[10px] border bg-card p-3.5"
        style={{ boxShadow: "var(--shadow)" }}
      >
        <div className="flex items-center gap-1.5 text-[9px] font-medium text-foreground">
          <FileSpreadsheet className="h-3.5 w-3.5 text-accent-dark" strokeWidth={2} />
          ledenlijst-2026.xlsx
          <span className="text-muted-foreground">· 22 rijen gevonden</span>
        </div>
        <div className="mt-2.5 space-y-1.5">
          {mockImport.mappings.map((mapping) => (
            <div key={mapping.column} className="flex items-center gap-2">
              <span className="flex-1 rounded-[7px] border bg-background px-2.5 py-1.5 text-[9px] text-foreground">
                {mapping.column}
              </span>
              <ArrowRight
                className="h-3 w-3 shrink-0 text-muted-foreground"
                strokeWidth={2}
              />
              <span className="flex-1 rounded-[7px] border border-[color:var(--accent-dark)]/30 bg-accent-light/40 px-2.5 py-1.5 text-[9px] font-medium text-accent-dark">
                {mapping.field}
              </span>
            </div>
          ))}
        </div>
      </div>

      <div className="mt-2.5 flex items-center justify-between">
        <div className="flex items-center gap-1.5">
          {mockImport.counts.map((count) => (
            <span
              key={count.label}
              className={cn(
                "rounded-full px-2 py-0.5 text-[8px] font-semibold",
                countStyles[count.tone],
              )}
            >
              {count.label}
            </span>
          ))}
        </div>
        <span className="rounded-[8px] bg-primary px-2.5 py-1.5 text-[9px] font-semibold text-primary-foreground">
          Controleren &amp; importeren
        </span>
      </div>
    </div>
  );
}
