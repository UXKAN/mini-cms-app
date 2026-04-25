"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  Users,
  Briefcase,
  Heart,
  FileCheck,
  Calendar,
  LogOut,
  Plus,
} from "lucide-react";
import { supabase } from "../lib/supabase";
import { useAuth } from "../lib/useAuth";
import { useCurrentOrg } from "../lib/org";
import { OrgContext } from "../lib/orgContext";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";

const nav = [
  { href: "/dashboard",    label: "Dashboard",    Icon: LayoutDashboard },
  { href: "/members",      label: "Leden",        Icon: Users },
  { href: "/ondernemers",  label: "Ondernemers",  Icon: Briefcase },
  { href: "/donations",    label: "Donaties",     Icon: Heart },
  { href: "/toezeggingen", label: "Toezeggingen", Icon: FileCheck },
  { href: "/evenementen",  label: "Evenementen",  Icon: Calendar },
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
    return <main style={{ padding: 40, color: "var(--ink-muted)" }}>Laden...</main>;
  }

  if (!org) return null;

  const userLabel =
    (user.user_metadata?.full_name as string | undefined) ??
    user.email?.split("@")[0] ??
    "Gebruiker";
  const initial = (user.email ?? "?").charAt(0).toUpperCase();

  return (
    <OrgContext.Provider value={org}>
      <div style={{ display: "flex", minHeight: "100vh" }}>

        {/* ── Sidebar ── */}
        <aside style={{
          width: "var(--sidebar-w, 220px)",
          minHeight: "100vh",
          background: "var(--surface)",
          borderRight: "1px solid var(--border)",
          display: "flex",
          flexDirection: "column",
          flexShrink: 0,
          position: "sticky",
          top: 0,
          height: "100vh",
          overflowY: "auto",
        }}>

          {/* Logo */}
          <div style={{ padding: "20px 18px 16px", borderBottom: "1px solid var(--border)" }}>
            <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
              {/* Green square logo */}
              <div style={{
                width: 30, height: 30,
                borderRadius: 8,
                background: "var(--accent)",
                display: "flex", alignItems: "center", justifyContent: "center",
                flexShrink: 0,
              }}>
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5" strokeLinecap="round">
                  <path d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z"/>
                </svg>
              </div>
              <div>
                <div style={{ fontSize: 12, fontWeight: 700, color: "var(--ink)", lineHeight: 1.2 }}>
                  {org.name ?? "Nieuwe Moskee"}
                </div>
                <div style={{ fontSize: 10, color: "var(--ink-subtle)", letterSpacing: "0.05em" }}>
                  ANBI Dashboard
                </div>
              </div>
            </div>
          </div>

          {/* Nieuwe donatie CTA */}
          <div style={{ padding: "14px 12px 10px" }}>
            <button
              onClick={() => {}}
              style={{
                width: "100%",
                padding: "10px 12px",
                background: "var(--accent)",
                color: "white",
                border: "none",
                borderRadius: "var(--radius-sm)",
                fontFamily: "var(--font-sans)",
                fontSize: 13,
                fontWeight: 700,
                cursor: "pointer",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                gap: 8,
                boxShadow: "0 2px 8px oklch(0.52 0.13 165 / 0.28)",
              }}
            >
              <Plus size={15} color="white" />
              Nieuwe donatie
            </button>
          </div>

          {/* Divider */}
          <div style={{ height: 1, background: "var(--border)", margin: "0 12px" }} />

          {/* Nav */}
          <nav style={{ flex: 1, padding: "4px 8px", display: "flex", flexDirection: "column" }}>
            {nav.map(({ href, label, Icon }) => {
              const active = pathname === href || pathname.startsWith(href + "/");
              return (
                <Link
                  key={href}
                  href={href}
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: 10,
                    padding: "9px 10px",
                    borderRadius: "var(--radius-sm)",
                    fontSize: 13,
                    fontWeight: active ? 600 : 400,
                    color: active ? "var(--accent-dark)" : "var(--ink)",
                    background: active ? "var(--accent-light)" : "transparent",
                    textDecoration: "none",
                    transition: "background 0.12s, color 0.12s",
                    cursor: "pointer",
                  }}
                >
                  <Icon
                    size={15}
                    color={active ? "var(--accent-dark)" : "var(--ink-muted)"}
                    style={{ flexShrink: 0 }}
                  />
                  {label}
                </Link>
              );
            })}
          </nav>

          {/* Divider */}
          <div style={{ height: 1, background: "var(--border)", margin: "0 12px" }} />

          {/* User section */}
          <div style={{ padding: "12px 12px 14px" }}>
            <div style={{ display: "flex", alignItems: "center", gap: 9, padding: "4px 2px", marginBottom: 4 }}>
              <Avatar style={{ width: 28, height: 28, flexShrink: 0 }}>
                <AvatarFallback style={{
                  fontSize: 11, fontWeight: 600,
                  background: "var(--accent-light)",
                  color: "var(--accent-dark)",
                }}>
                  {initial}
                </AvatarFallback>
              </Avatar>
              <div style={{ minWidth: 0 }}>
                <div style={{ fontSize: 12, fontWeight: 600, color: "var(--ink)", lineHeight: 1.3, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                  {userLabel}
                </div>
                <div style={{ fontSize: 11, color: "var(--ink-muted)", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                  {user.email}
                </div>
              </div>
            </div>
            <button
              onClick={handleLogout}
              style={{
                width: "100%",
                display: "flex", alignItems: "center", gap: 8,
                padding: "7px 8px",
                background: "transparent",
                border: "none",
                borderRadius: "var(--radius-sm)",
                fontSize: 12,
                color: "var(--ink-muted)",
                cursor: "pointer",
                fontFamily: "var(--font-sans)",
                transition: "background 0.12s, color 0.12s",
              }}
              onMouseEnter={e => {
                e.currentTarget.style.background = "var(--accent-light)";
                e.currentTarget.style.color = "var(--accent-dark)";
              }}
              onMouseLeave={e => {
                e.currentTarget.style.background = "transparent";
                e.currentTarget.style.color = "var(--ink-muted)";
              }}
            >
              <LogOut size={13} />
              Uitloggen
            </button>
          </div>
        </aside>

        {/* ── Main content ── */}
        <main style={{ flex: 1, padding: 32, overflowY: "auto", minWidth: 0 }}>
          {children}
        </main>

      </div>
    </OrgContext.Provider>
  );
}
