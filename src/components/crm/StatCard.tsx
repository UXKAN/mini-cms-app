import { Card } from "./Card";
import { SectionLabel } from "./SectionLabel";

type StatCardProps = {
  label: string;
  value: string;
  hint?: string;
  style?: React.CSSProperties;
};

export function StatCard({ label, value, hint, style }: StatCardProps) {
  return (
    <Card style={style}>
      <SectionLabel>{label}</SectionLabel>
      <div
        style={{
          fontFamily: "var(--font-serif)",
          fontSize: 30,
          fontWeight: 400,
          color: "var(--ink)",
          lineHeight: 1,
          marginTop: 4,
        }}
      >
        {value}
      </div>
      {hint && (
        <div style={{ fontSize: 12, color: "var(--ink-muted)", marginTop: 6 }}>
          {hint}
        </div>
      )}
    </Card>
  );
}
