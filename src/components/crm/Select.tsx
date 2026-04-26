"use client";

import { forwardRef } from "react";

type SelectProps = React.SelectHTMLAttributes<HTMLSelectElement>;

/**
 * CRM-styled native <select>.
 *
 * Replaces the inline selectStyle/selectCls patterns scattered across pages.
 * Visual styling (1.5px border, focus glow) comes from the global selector
 * `select:not([class*="shadcn"])` in globals.css — keep this in sync if those
 * rules ever change.
 */
export const Select = forwardRef<HTMLSelectElement, SelectProps>(
  function Select({ style, children, ...props }, ref) {
    return (
      <select
        ref={ref}
        style={{
          width: "100%",
          padding: "9px 12px",
          borderRadius: "var(--radius-sm)",
          fontFamily: "var(--font-sans)",
          fontSize: 14,
          background: "var(--surface)",
          color: "var(--ink)",
          outline: "none",
          // border + focus glow handled by globals.css
          ...style,
        }}
        {...props}
      >
        {children}
      </select>
    );
  }
);
