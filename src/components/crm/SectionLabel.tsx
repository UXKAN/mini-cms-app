type SectionLabelProps = {
  children: React.ReactNode;
  mb?: number;
};

export function SectionLabel({ children, mb = 8 }: SectionLabelProps) {
  return (
    <div
      style={{
        fontSize: 11,
        fontWeight: 700,
        color: "var(--ink-subtle)",
        letterSpacing: "0.06em",
        textTransform: "uppercase",
        marginBottom: mb,
      }}
    >
      {children}
    </div>
  );
}
