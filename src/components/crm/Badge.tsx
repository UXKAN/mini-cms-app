type BadgeVariant =
  | "actief"
  | "inactief"
  | "prospect"
  | "opgezegd"
  | "accent"
  | "warning"
  | "error"
  | "grey"
  | "blue";

const VARIANT_STYLES: Record<BadgeVariant, { background: string; color: string }> = {
  actief:   { background: "var(--accent-light)", color: "var(--accent-dark)" },
  // "accent" is a semantic alias for non-status highlights (e.g. tag: "Ondernemer")
  accent:   { background: "var(--accent-light)", color: "var(--accent-dark)" },
  inactief: { background: "var(--neutral-light)", color: "var(--ink-muted)" },
  prospect: { background: "var(--warn-light)",   color: "var(--warn)" },
  opgezegd: { background: "var(--error-light)",  color: "var(--error)" },
  // Extra varianten uit het design (dashboard_components.jsx)
  warning:  { background: "oklch(0.96 0.04 55)",  color: "oklch(0.60 0.14 55)" },
  error:    { background: "var(--error-light)",  color: "var(--error)" },
  grey:     { background: "oklch(0.93 0 0)",      color: "oklch(0.45 0 0)" },
  blue:     { background: "oklch(0.93 0.04 240)", color: "oklch(0.35 0.1 240)" },
};

type BadgeProps = {
  variant: BadgeVariant;
  children: React.ReactNode;
  size?: "sm" | "md";
};

export function Badge({ variant, children, size = "sm" }: BadgeProps) {
  const { background, color } = VARIANT_STYLES[variant];
  return (
    <span
      style={{
        display: "inline-block",
        fontSize: size === "sm" ? 11 : 12,
        fontWeight: 600,
        padding: size === "sm" ? "3px 9px" : "4px 12px",
        borderRadius: 99,
        background,
        color,
        whiteSpace: "nowrap",
        letterSpacing: "0.02em",
      }}
    >
      {children}
    </span>
  );
}
