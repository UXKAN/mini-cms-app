"use client";

import AppShell from "../components/AppShell";
import { PageLayout, EmptyState } from "@/components/crm";

export default function OndernemersPage() {
  return (
    <AppShell>
      <PageLayout title="Ondernemers" subtitle="Zakelijke donateurs en sponsoren.">
        <EmptyState
          title="Ondernemers module"
          description="Hier komen straks je zakelijke donateurs en sponsoren."
        />
      </PageLayout>
    </AppShell>
  );
}
