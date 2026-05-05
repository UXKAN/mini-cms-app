import { Card, CardContent } from "@/components/ui/card";

type StatCardProps = {
  label: string;
  value: string;
  hint?: string;
};

export function StatCard({ label, value, hint }: StatCardProps) {
  return (
    <Card>
      <CardContent className="p-5">
        <p className="text-muted-foreground text-xs uppercase tracking-wider">
          {label}
        </p>
        <p className="font-serif text-3xl font-normal text-foreground mt-1">
          {value}
        </p>
        {hint && (
          <p className="text-muted-foreground text-xs mt-1">{hint}</p>
        )}
      </CardContent>
    </Card>
  );
}
