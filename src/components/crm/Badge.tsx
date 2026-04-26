type BadgeVariant = "actief" | "inactief" | "prospect" | "opgezegd" | "accent";

const VARIANT_STYLES: Record<BadgeVariant, { background: string; color: string }> = {
  actief:   { background: "var(--accent-light)", color: "var(--accent-dark)" },
  // "accent" is a semantic alias for non-status highlights (e.g. tag: "Ondernemer")
  accent:   { background: "var(--accent-light)", color: "var(--accent-dark)" },
  inactief: { background: "var(--neutral-light)", color: "var(--ink-muted)" },
  prospect: { background: "var(--warn-light)",   color: "var(--warn)" },
  opgezegd: { background: "var(--error-light)",  color: "var(--error)" },
};

type BadgeProps = {
  variant: BadgeVariant;
  children: React.ReactNode;
};

export function Badge({ variant, children }: BadgeProps) {
  const { background, color } = VARIANT_STYLES[variant];
  return (
    <span
      style={{
        display: "inline-block",
        fontSize: 11,
        fontWeight: 600,
        padding: "3px 9px",
        borderRadius: 99,
        background,
        color,
        whiteSpace: "nowrap",
      }}
    >
      {children}
    </span>
  );
}
