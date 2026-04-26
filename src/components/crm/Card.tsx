type CardPadding = "default" | "compact" | "none";

const PADDING_VALUES: Record<CardPadding, string> = {
  default: "22px 24px",
  compact: "16px 20px",
  none: "0",
};

type CardProps = {
  children: React.ReactNode;
  style?: React.CSSProperties;
  onClick?: () => void;
  /**
   * Spacing scale.
   * - "default" (22×24) for content cards (the standard)
   * - "compact" (16×20) for stat tiles or dense mini-cards
   * - "none" (0) when wrapping a DataTable that owns its own padding
   */
  padding?: CardPadding;
};

export function Card({
  children,
  style,
  onClick,
  padding = "default",
}: CardProps) {
  const isClickable = !!onClick;
  return (
    <div
      onClick={onClick}
      style={{
        background: "var(--surface)",
        border: "1px solid var(--border)",
        borderRadius: "var(--radius)",
        boxShadow: "var(--shadow)",
        padding: PADDING_VALUES[padding],
        cursor: isClickable ? "pointer" : undefined,
        transition: isClickable ? "box-shadow 0.15s" : undefined,
        ...style,
      }}
      onMouseEnter={isClickable ? (e) => {
        (e.currentTarget as HTMLDivElement).style.boxShadow = "var(--shadow-lg)";
      } : undefined}
      onMouseLeave={isClickable ? (e) => {
        (e.currentTarget as HTMLDivElement).style.boxShadow = "var(--shadow)";
      } : undefined}
    >
      {children}
    </div>
  );
}
