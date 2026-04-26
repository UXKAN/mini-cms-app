type CardProps = {
  children: React.ReactNode;
  style?: React.CSSProperties;
  onClick?: () => void;
};

export function Card({ children, style, onClick }: CardProps) {
  const isClickable = !!onClick;
  return (
    <div
      onClick={onClick}
      style={{
        background: "var(--surface)",
        border: "1px solid var(--border)",
        borderRadius: "var(--radius)",
        boxShadow: "var(--shadow)",
        padding: "22px 24px",
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
