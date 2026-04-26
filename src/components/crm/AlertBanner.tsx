type AlertTone = "success" | "error" | "info" | "warning";

const TONE_STYLES: Record<AlertTone, { background: string; color: string }> = {
  success: { background: "var(--success-light)", color: "var(--success)" },
  error:   { background: "var(--error-light)",   color: "var(--error)" },
  warning: { background: "var(--warn-light)",    color: "var(--warn)" },
  // info uses neutral palette
  info:    { background: "var(--neutral-light)", color: "var(--ink-muted)" },
};

type AlertBannerProps = {
  tone: AlertTone;
  children: React.ReactNode;
  /** Optional inline style overrides (e.g. marginBottom for layout). */
  style?: React.CSSProperties;
};

/**
 * Tone-based banner for inline alerts inside forms / modals / pages.
 *
 * Replaces the inline `<div style={{ ...alert, background, color }}>`
 * patterns that previously lived in MemberImporter and other places.
 */
export function AlertBanner({ tone, children, style }: AlertBannerProps) {
  const { background, color } = TONE_STYLES[tone];
  return (
    <div
      role="alert"
      style={{
        padding: "12px 14px",
        borderRadius: "var(--radius-sm)",
        fontSize: 14,
        background,
        color,
        ...style,
      }}
    >
      {children}
    </div>
  );
}
