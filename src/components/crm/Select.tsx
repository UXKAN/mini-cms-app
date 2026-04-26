"use client";

import { forwardRef } from "react";

type SelectProps = React.SelectHTMLAttributes<HTMLSelectElement>;

/**
 * CRM-styled native <select>.
 *
 * Replaces the inline selectStyle/selectCls patterns scattered across pages.
 * Uses the `crm-input` className to opt into the 1.5px border + green focus
 * glow defined in globals.css.
 */
export const Select = forwardRef<HTMLSelectElement, SelectProps>(
  function Select({ style, className, children, ...props }, ref) {
    return (
      <select
        ref={ref}
        className={`crm-input ${className ?? ""}`.trim()}
        style={{
          width: "100%",
          padding: "9px 12px",
          borderRadius: "var(--radius-sm)",
          fontFamily: "var(--font-sans)",
          fontSize: 14,
          // Use --background (warm) so the select stands out from --surface
          // modals/cards. Same approach as shadcn Input.
          background: "var(--background)",
          color: "var(--ink)",
          outline: "none",
          ...style,
        }}
        {...props}
      >
        {children}
      </select>
    );
  }
);
