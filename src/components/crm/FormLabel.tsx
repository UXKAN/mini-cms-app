type FormLabelProps = {
  children: React.ReactNode;
  required?: boolean;
  htmlFor?: string;
};

export function FormLabel({ children, required, htmlFor }: FormLabelProps) {
  return (
    <label
      htmlFor={htmlFor}
      style={{
        display: "block",
        fontSize: 13,
        fontWeight: 500,
        color: "var(--ink-muted)",
        marginBottom: 6,
      }}
    >
      {children}
      {required && (
        <span style={{ color: "var(--accent)", marginLeft: 2 }}>*</span>
      )}
    </label>
  );
}
