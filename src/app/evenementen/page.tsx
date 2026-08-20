import AppShell from "../components/AppShell";
import { PageHeader } from "../components/PageHeader";
import { Calendar } from "lucide-react";

export default function EvenementenPage() {
  return (
    <AppShell>
      <PageHeader title="Evenementen" subtitle="Binnenkort beschikbaar" />
      <div className="max-w-md rounded-lg bg-card p-8 text-center shadow-[var(--shadow)]">
        <div className="mx-auto mb-3 grid h-12 w-12 place-items-center rounded-full bg-[var(--accent-light)] text-primary">
          <Calendar size={20} />
        </div>
        <p className="text-[15px] font-bold text-foreground">Komt binnenkort</p>
        <p className="mt-1 text-sm text-muted-foreground">
          Organiseer straks iftars en open dagen met interne inschrijvingen.
        </p>
      </div>
    </AppShell>
  );
}
