"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { supabase } from "../lib/supabase";
import { useAuth } from "../lib/useAuth";
import { useCurrentOrg } from "../lib/org";
import { OrgContext } from "../lib/orgContext";

const nav = [
  { href: "/dashboard", label: "Dashboard", icon: "M3 9l9-7 9 7v11a2 2 0 01-2 2H5a2 2 0 01-2-2z" },
  { href: "/members", label: "Leden", icon: "M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2 M9 11a4 4 0 100-8 4 4 0 000 8z" },
  { href: "/donations", label: "Donaties", icon: "M12 2v20 M17 5H9.5a3.5 3.5 0 000 7h5a3.5 3.5 0 010 7H6" },
];

export default function AppShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const { user, loading: authLoading } = useAuth();
  const { org, loading: orgLoading } = useCurrentOrg(user);

  const handleLogout = async () => {
    await supabase.auth.signOut();
    window.location.href = "/login";
  };

  if (authLoading || orgLoading || !user) {
    return <main style={{ padding: 40 }}>Laden...</main>;
  }

  if (!org) {
    return null;
  }

  return (
    <OrgContext.Provider value={org}>
    <div style={{ display: "flex", minHeight: "100vh" }}>
      <aside
        style={{
          width: 220,
          background: "var(--surface)",
          borderRight: "1px solid var(--border)",
          padding: "28px 16px",
          display: "flex",
          flexDirection: "column",
          gap: 4,
          position: "sticky",
          top: 0,
          height: "100vh",
        }}
      >
        <div style={{ padding: "0 10px 28px" }}>
          <div
            style={{
              fontFamily: "var(--font-serif), Georgia, serif",
              fontSize: 22,
              color: "var(--ink)",
              lineHeight: 1.1,
            }}
          >
            Mini CRM
          </div>
          <div
            style={{
              fontSize: 11,
              color: "var(--ink-subtle)",
              marginTop: 4,
              letterSpacing: "0.04em",
              textTransform: "uppercase",
            }}
          >
            ANBI Dashboard
          </div>
        </div>

        {nav.map((item) => {
          const active = pathname === item.href || pathname.startsWith(item.href + "/");
          return (
            <Link
              key={item.href}
              href={item.href}
              style={{
                display: "flex",
                alignItems: "center",
                gap: 10,
                padding: "10px 12px",
                borderRadius: "var(--radius-sm)",
                textDecoration: "none",
                color: active ? "var(--accent-dark)" : "var(--ink)",
                background: active ? "var(--accent-light)" : "transparent",
                fontSize: 14,
                fontWeight: active ? 600 : 500,
                transition: "background 120ms ease",
              }}
            >
              <svg
                width={16}
                height={16}
                viewBox="0 0 24 24"
                fill="none"
                stroke={active ? "var(--accent-dark)" : "var(--ink-muted)"}
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                {item.icon.split(" M").map((d, i) => (
                  <path key={i} d={i === 0 ? d : "M" + d} />
                ))}
              </svg>
              {item.label}
            </Link>
          );
        })}

        <div style={{ marginTop: "auto" }}>
          <button
            onClick={handleLogout}
            style={{
              width: "100%",
              padding: "10px 12px",
              fontSize: 13,
              color: "var(--ink-muted)",
              border: "1px solid var(--border)",
              borderRadius: "var(--radius-sm)",
              background: "transparent",
              cursor: "pointer",
              textAlign: "left",
            }}
          >
            Uitloggen
          </button>
        </div>
      </aside>

      <main style={{ flex: 1, padding: "40px 48px" }}>{children}</main>
    </div>
    </OrgContext.Provider>
  );
}
