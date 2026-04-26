import { Card } from "./Card";

type EmptyStateProps = {
  title: string;
  description?: string;
  action?: React.ReactNode;
};

export function EmptyState({ title, description, action }: EmptyStateProps) {
  return (
    <Card style={{ textAlign: "center", padding: "48px 24px" }}>
      <h2
        style={{
          fontFamily: "var(--font-serif)",
          fontSize: 22,
          fontWeight: 400,
          color: "var(--ink)",
          marginBottom: 8,
        }}
      >
        {title}
      </h2>
      {description && (
        <p style={{ fontSize: 14, color: "var(--ink-muted)", marginBottom: 20 }}>
          {description}
        </p>
      )}
      {action && <div>{action}</div>}
    </Card>
  );
}
