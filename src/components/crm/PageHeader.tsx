type PageHeaderProps = {
  title: string;
  subtitle?: string;
};

export function PageHeader({ title, subtitle }: PageHeaderProps) {
  return (
    <div style={{ marginBottom: 24 }}>
      <h1
        style={{
          fontFamily: "var(--font-serif)",
          fontSize: 28,
          fontWeight: 400,
          color: "var(--ink)",
          lineHeight: 1.2,
        }}
      >
        {title}
      </h1>
      {subtitle && (
        <p style={{ fontSize: 13, color: "var(--ink-muted)", marginTop: 4 }}>
          {subtitle}
        </p>
      )}
    </div>
  );
}
