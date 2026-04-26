"use client";

import AppShell from "../components/AppShell";
import { PageLayout, EmptyState } from "@/components/crm";

export default function EvenementenPage() {
  return (
    <AppShell>
      <PageLayout title="Evenementen" subtitle="Aankomende en afgelopen evenementen.">
        <EmptyState
          title="Evenementen module"
          description="Hier komen straks je geplande en afgelopen evenementen."
        />
      </PageLayout>
    </AppShell>
  );
}
