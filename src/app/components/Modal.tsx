"use client";

import { useEffect } from "react";

type ModalProps = {
  open: boolean;
  onClose: () => void;
  title: string;
  width?: number;
  children: React.ReactNode;
};

export default function Modal({ open, onClose, title, width = 560, children }: ModalProps) {
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    document.addEventListener("keydown", onKey);
    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = prevOverflow;
    };
  }, [open, onClose]);

  if (!open) return null;

  return (
    <div
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
      style={{
        position: "fixed",
        inset: 0,
        background: "rgba(0, 0, 0, 0.45)",
        backdropFilter: "blur(2px)",
        WebkitBackdropFilter: "blur(2px)",
        zIndex: 1000,
        display: "flex",
        alignItems: "flex-start",
        justifyContent: "center",
        padding: "40px 16px",
        overflowY: "auto",
        animation: "modalFadeIn 0.15s ease",
      }}
    >
      <div
        style={{
          background: "var(--surface)",
          borderRadius: "var(--radius)",
          boxShadow: "var(--shadow-lg)",
          width: "100%",
          maxWidth: width,
          maxHeight: "calc(100vh - 80px)",
          display: "flex",
          flexDirection: "column",
          animation: "modalSlideIn 0.2s ease",
        }}
      >
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            padding: "18px 24px",
            borderBottom: "1px solid var(--border)",
            flexShrink: 0,
          }}
        >
          <h2
            style={{
              fontFamily: "var(--font-serif), Georgia, serif",
              fontSize: 20,
              fontWeight: 400,
              color: "var(--ink)",
            }}
          >
            {title}
          </h2>
          <button
            onClick={onClose}
            aria-label="Sluiten"
            style={{
              background: "none",
              border: "none",
              cursor: "pointer",
              color: "var(--ink-muted)",
              padding: 4,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <svg
              width="18"
              height="18"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <line x1="18" y1="6" x2="6" y2="18" />
              <line x1="6" y1="6" x2="18" y2="18" />
            </svg>
          </button>
        </div>
        <div style={{ padding: 24, overflowY: "auto" }}>{children}</div>
      </div>
    </div>
  );
}
