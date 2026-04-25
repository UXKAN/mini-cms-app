import AppShell from "../components/AppShell";
import { Card, CardContent } from "@/components/ui/card";

export default function OndernemersPage() {
  return (
    <AppShell>
      <h1 className="font-serif text-4xl font-normal text-foreground mb-8">
        Ondernemers
      </h1>
      <Card className="max-w-md">
        <CardContent className="p-8 text-center">
          <p className="text-muted-foreground">Komt binnenkort</p>
        </CardContent>
      </Card>
    </AppShell>
  );
}
