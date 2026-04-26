"use client";

import { Search } from "lucide-react";

type SearchInputProps = {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  width?: number | string;
};

export function SearchInput({
  value,
  onChange,
  placeholder = "Zoeken…",
  width = 220,
}: SearchInputProps) {
  return (
    <div style={{ position: "relative", display: "inline-flex", alignItems: "center" }}>
      <Search
        size={14}
        strokeWidth={2}
        style={{
          position: "absolute",
          left: 11,
          color: "var(--ink-subtle)",
          pointerEvents: "none",
        }}
      />
      <input
        type="text"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        style={{
          padding: "8px 12px 8px 34px",
          border: "1.5px solid var(--border)",
          borderRadius: "var(--radius-sm)",
          fontFamily: "var(--font-sans)",
          fontSize: 13,
          background: "var(--surface)",
          color: "var(--ink)",
          outline: "none",
          width,
          transition: "border-color 0.15s, box-shadow 0.15s",
        }}
        onFocus={(e) => {
          e.currentTarget.style.borderColor = "var(--accent)";
          e.currentTarget.style.boxShadow = "0 0 0 3px oklch(0.52 0.13 165 / 0.1)";
        }}
        onBlur={(e) => {
          e.currentTarget.style.borderColor = "var(--border)";
          e.currentTarget.style.boxShadow = "none";
        }}
      />
    </div>
  );
}
