import AppShell from "../components/AppShell";
import { PageHeader } from "../components/PageHeader";
import { Briefcase } from "lucide-react";

export default function OndernemersPage() {
  return (
    <AppShell>
      <PageHeader title="Ondernemers" subtitle="Binnenkort beschikbaar" />
      <div className="max-w-md rounded-lg bg-card p-8 text-center shadow-[var(--shadow)]">
        <div className="mx-auto mb-3 grid h-12 w-12 place-items-center rounded-full bg-[var(--accent-light)] text-primary">
          <Briefcase size={20} />
        </div>
        <p className="text-[15px] font-bold text-foreground">Komt binnenkort</p>
        <p className="mt-1 text-sm text-muted-foreground">
          Houd straks bij welke ondernemers uw organisatie steunen.
        </p>
      </div>
    </AppShell>
  );
}
