import { PageLayout, EmptyState } from "@/components/crm";

export default function ToezeggingenPage() {
  return (
    <PageLayout title="Toezeggingen" subtitle="Openstaande en voldane toezeggingen.">
      <EmptyState
        title="Toezeggingen module"
        description="Hier komen straks je openstaande toezeggingen en betalingsafspraken."
      />
    </PageLayout>
  );
}
