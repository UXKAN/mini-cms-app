import { Card } from "@/components/ui/card";

export function OrgFooterCard() {
  return (
    <Card className="p-5 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
      <div>
        <div className="font-sans font-semibold text-foreground">
          HDV Selimiye / HDV Anadolu
        </div>
        <div className="text-sm text-muted-foreground">RSIN: 805141200</div>
      </div>
      <div className="font-mono text-sm text-foreground tracking-wide">
        NL33 ABNA 0550 1441 96
      </div>
    </Card>
  );
}
