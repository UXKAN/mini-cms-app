import { Check, ChevronDown, Search } from "lucide-react";
import { cn } from "@/lib/utils";
import { mockMembers } from "./mockData";

function StatusBadge({ status }: { status: string }) {
  const active = status === "Actief";
  return (
    <span
      className={cn(
        "rounded-full px-2 py-0.5 text-[8px] font-semibold",
        active
          ? "bg-[var(--success-light)] text-[var(--success)]"
          : "bg-muted text-muted-foreground",
      )}
    >
      {status}
    </span>
  );
}

export function MockLedenTable() {
  return (
    <div className="w-[640px] bg-background p-5 text-start">
      <div className="flex items-center justify-between gap-3">
        <div className="flex flex-1 items-center gap-1.5 rounded-[8px] border bg-card px-2.5 py-1.5 text-[9px] text-muted-foreground">
          <Search className="h-3 w-3" strokeWidth={2} />
          Zoek op naam of e-mail…
        </div>
        <div className="flex items-center gap-1 rounded-[8px] border bg-card px-2.5 py-1.5 text-[9px] font-medium text-foreground">
          Toon: Actieve leden
          <ChevronDown className="h-3 w-3 text-muted-foreground" strokeWidth={2} />
        </div>
        <div className="rounded-[8px] bg-primary px-2.5 py-1.5 text-[9px] font-semibold text-primary-foreground">
          + Nieuw lid
        </div>
      </div>

      <div
        className="mt-3 overflow-hidden rounded-[10px] border bg-card"
        style={{ boxShadow: "var(--shadow)" }}
      >
        <div className="grid grid-cols-[24px_1.6fr_0.9fr_0.9fr_0.9fr] items-center gap-2 border-b bg-background/60 px-3 py-2 text-[8px] font-semibold uppercase tracking-widest text-muted-foreground">
          <span />
          <span>Naam</span>
          <span>Type</span>
          <span>Status</span>
          <span className="text-end">Bedrag p/m</span>
        </div>
        {mockMembers.map((member, i) => (
          <div
            key={member.name}
            className={cn(
              "grid grid-cols-[24px_1.6fr_0.9fr_0.9fr_0.9fr] items-center gap-2 px-3 py-2.5",
              i > 0 && "border-t",
              i === 1 && "bg-accent-light/40",
            )}
          >
            <span
              className={cn(
                "grid h-3 w-3 place-items-center rounded-[4px] border",
                i === 1 ? "border-primary bg-primary" : "bg-card",
              )}
            >
              {i === 1 && (
                <Check
                  className="h-2 w-2 text-primary-foreground"
                  strokeWidth={3}
                />
              )}
            </span>
            <span className="text-[10px] font-medium text-foreground">
              {member.name}
            </span>
            <span>
              <span
                className={cn(
                  "rounded-full px-2 py-0.5 text-[8px] font-semibold",
                  member.type === "Lid"
                    ? "bg-accent-light text-accent-dark"
                    : "border bg-card text-foreground",
                )}
              >
                {member.type}
              </span>
            </span>
            <span>
              <StatusBadge status={member.status} />
            </span>
            <span className="text-end text-[10px] font-medium text-foreground">
              {member.amount}
            </span>
          </div>
        ))}
      </div>

      <div className="mt-2.5 flex items-center justify-between text-[8px] text-muted-foreground">
        <span>342 leden &amp; donateurs</span>
        <span className="flex items-center gap-1 rounded-[7px] border bg-card px-2 py-1 font-medium text-foreground">
          1 geselecteerd · Exporteer
        </span>
      </div>
    </div>
  );
}
