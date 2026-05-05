import { Button } from "@/components/ui/button";

type Props = {
  onClearFilters: () => void;
};

export function ZeroResults({ onClearFilters }: Props) {
  return (
    <div className="text-center py-12">
      <p className="text-muted-foreground text-sm">Geen resultaten gevonden</p>
      <Button
        variant="link"
        size="sm"
        onClick={onClearFilters}
        className="mt-1"
      >
        Wis filters
      </Button>
    </div>
  );
}
