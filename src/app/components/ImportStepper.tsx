"use client";

import type React from "react";

export type StepKey = "upload" | "map" | "preview";

const STEP_ORDER: StepKey[] = ["upload", "map", "preview"];
const STEP_LABELS: Record<StepKey, string> = {
  upload: "1. Bestand kiezen",
  map: "2. Kolommen koppelen",
  preview: "3. Controleren & importeren",
};

export function ImportStepper({
  active,
  onJump,
}: {
  active: StepKey;
  onJump?: (step: StepKey) => void;
}) {
  const activeIndex = STEP_ORDER.indexOf(active);

  return (
    <div
      style={{
        display: "flex",
        gap: 8,
        marginBottom: 24,
      }}
    >
      {STEP_ORDER.map((s, i) => {
        const isActive = s === active;
        const isDone = i < activeIndex;
        const clickable = onJump && (isDone || isActive);
        return (
          <button
            key={s}
            type="button"
            disabled={!clickable}
            onClick={() => clickable && onJump?.(s)}
            style={{
              flex: 1,
              padding: "10px 14px",
              fontSize: 13,
              fontWeight: 500,
              textAlign: "left",
              borderRadius: "var(--radius-sm)",
              border: `1px solid ${isActive ? "var(--accent)" : "var(--border)"}`,
              background: isActive ? "var(--accent-light)" : "var(--surface)",
              color: isActive ? "var(--accent-dark)" : isDone ? "var(--ink)" : "var(--ink-subtle)",
              cursor: clickable ? "pointer" : "default",
              opacity: isActive || isDone ? 1 : 0.7,
            }}
          >
            {STEP_LABELS[s]}
          </button>
        );
      })}
    </div>
  );
}

export const importPageStyles = {
  card: {
    padding: 20,
    border: "1px solid var(--border)",
    borderRadius: "var(--radius)",
    marginBottom: 16,
    background: "var(--surface)",
    boxShadow: "var(--shadow)",
  } as React.CSSProperties,
  alert: {
    padding: 14,
    borderRadius: "var(--radius-sm)",
    marginBottom: 16,
    fontSize: 14,
  } as React.CSSProperties,
  primaryBtn: {
    padding: "10px 18px",
    fontSize: 14,
    fontWeight: 500,
    border: "none",
    borderRadius: "var(--radius-sm)",
    background: "var(--accent)",
    color: "#fff",
    cursor: "pointer",
  } as React.CSSProperties,
  ghostBtn: {
    padding: "10px 18px",
    fontSize: 14,
    fontWeight: 500,
    border: "1px solid var(--border)",
    borderRadius: "var(--radius-sm)",
    background: "transparent",
    color: "var(--ink)",
    cursor: "pointer",
  } as React.CSSProperties,
  th: {
    textAlign: "left",
    padding: "12px 14px",
    fontSize: 11,
    fontWeight: 700,
    color: "var(--ink-subtle)",
    letterSpacing: "0.06em",
    textTransform: "uppercase",
    background: "var(--bg)",
  } as React.CSSProperties,
  td: {
    padding: "12px 14px",
    fontSize: 14,
    color: "var(--ink)",
    verticalAlign: "top",
  } as React.CSSProperties,
  select: {
    padding: "8px 10px",
    fontSize: 13,
    border: "1px solid var(--border)",
    borderRadius: "var(--radius-sm)",
    background: "var(--bg)",
    color: "var(--ink)",
    minWidth: 180,
  } as React.CSSProperties,
};

export function StatusPill({
  tone,
  children,
}: {
  tone: "new" | "update" | "skip" | "error";
  children: React.ReactNode;
}) {
  const map: Record<string, { bg: string; color: string }> = {
    new: { bg: "var(--success-light)", color: "var(--success)" },
    update: { bg: "var(--accent-light)", color: "var(--accent-dark)" },
    skip: { bg: "var(--warn-light)", color: "var(--warn)" },
    error: { bg: "var(--error-light)", color: "var(--error)" },
  };
  const s = map[tone];
  return (
    <span
      style={{
        padding: "3px 10px",
        borderRadius: 4,
        background: s.bg,
        color: s.color,
        fontSize: 12,
        fontWeight: 600,
      }}
    >
      {children}
    </span>
  );
}

export function CountBadge({
  label,
  color,
  bg,
}: {
  label: string;
  color: string;
  bg: string;
}) {
  return (
    <span
      style={{
        padding: "6px 12px",
        borderRadius: 999,
        background: bg,
        color,
        fontSize: 12,
        fontWeight: 600,
      }}
    >
      {label}
    </span>
  );
}
