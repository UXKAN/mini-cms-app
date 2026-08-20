import { cn } from "@/lib/utils";

type StatCardProps = {
  label: string;
  value: string;
  hint?: string;
  featured?: boolean;
  tone?: "default" | "warn";
};

export function StatCard({ label, value, hint, featured, tone = "default" }: StatCardProps) {
  return (
    <div
      className={cn(
        "rounded-lg p-5",
        featured ? "bg-[var(--accent-light)]" : "bg-card shadow-[var(--shadow)]",
      )}
    >
      <p className="text-[10px] font-semibold uppercase tracking-[0.12em] text-muted-foreground">
        {label}
      </p>
      <p
        className={cn(
          "mt-1 text-[26px] font-bold leading-none tracking-[-0.02em]",
          featured ? "text-primary" : tone === "warn" ? "text-[var(--warn)]" : "text-foreground",
        )}
      >
        {value}
      </p>
      {hint && <p className="mt-1.5 text-xs text-muted-foreground">{hint}</p>}
    </div>
  );
}
