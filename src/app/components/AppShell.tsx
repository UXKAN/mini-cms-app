"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Shield,
  LayoutDashboard,
  Users,
  Briefcase,
  Heart,
  FileCheck,
  Calendar,
  LogOut,
} from "lucide-react";
import { supabase } from "../lib/supabase";
import { useAuth } from "../lib/useAuth";
import { useCurrentOrg } from "../lib/org";
import { OrgContext } from "../lib/orgContext";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";

const nav = [
  { href: "/dashboard", label: "Dashboard", Icon: LayoutDashboard },
  { href: "/members", label: "Leden", Icon: Users },
  { href: "/ondernemers", label: "Ondernemers", Icon: Briefcase },
  { href: "/donations", label: "Donaties", Icon: Heart },
  { href: "/toezeggingen", label: "Toezeggingen", Icon: FileCheck },
  { href: "/evenementen", label: "Evenementen", Icon: Calendar },
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
    return <main className="p-10 text-muted-foreground">Laden...</main>;
  }

  if (!org) return null;

  const userLabel =
    (user.user_metadata?.full_name as string | undefined) ??
    user.email?.split("@")[0] ??
    "Gebruiker";
  const initial = (user.email ?? "?").charAt(0).toUpperCase();

  return (
    <OrgContext.Provider value={org}>
      <div className="flex min-h-screen">
        {/* ── Sidebar ── */}
        <aside className="w-[220px] bg-card border-r border-border flex flex-col sticky top-0 h-screen shrink-0">
          {/* Logo */}
          <div className="px-4 pt-6 pb-4">
            <div className="flex items-center gap-2.5">
              <Shield size={20} className="text-primary shrink-0" />
              <div>
                <div className="font-sans text-[13px] font-bold text-foreground leading-tight">
                  Nieuwe Moskee
                </div>
                <div className="text-[9px] text-muted-foreground tracking-widest uppercase mt-0.5">
                  ANBI Dashboard
                </div>
              </div>
            </div>
          </div>

          {/* Nieuwe donatie CTA */}
          <div className="px-3 pb-3">
            <Button
              className="w-full text-sm"
              size="sm"
              onClick={() => {}}
            >
              + Nieuwe donatie
            </Button>
          </div>

          <Separator />

          {/* Nav */}
          <nav className="flex-1 px-2 py-2 flex flex-col gap-0.5 overflow-y-auto">
            {nav.map(({ href, label, Icon }) => {
              const active =
                pathname === href || pathname.startsWith(href + "/");
              return (
                <Link
                  key={href}
                  href={href}
                  className={[
                    "flex items-center gap-2.5 px-3 py-2.5 rounded-[7px] text-[13px] font-medium transition-colors no-underline",
                    active
                      ? "bg-[var(--accent-light)] text-[var(--accent-dark)]"
                      : "text-foreground hover:bg-background",
                  ].join(" ")}
                >
                  <Icon
                    size={14}
                    className={
                      active ? "text-[var(--accent-dark)]" : "text-muted-foreground"
                    }
                  />
                  {label}
                </Link>
              );
            })}
          </nav>

          {/* User section */}
          <Separator />
          <div className="px-3 py-3 flex flex-col gap-2">
            <div className="flex items-center gap-2 px-1">
              <Avatar className="h-7 w-7 shrink-0">
                <AvatarFallback className="text-[11px] bg-[var(--accent-light)] text-[var(--accent-dark)]">
                  {initial}
                </AvatarFallback>
              </Avatar>
              <div className="min-w-0">
                <div className="text-[12px] font-medium text-foreground truncate">
                  {userLabel}
                </div>
                <div className="text-[10px] text-muted-foreground truncate">
                  {user.email}
                </div>
              </div>
            </div>
            <Button
              variant="ghost"
              size="sm"
              className="w-full justify-start text-muted-foreground gap-2 text-[12px] h-8 hover:bg-[var(--accent-light)] hover:text-[var(--accent-dark)]"
              onClick={handleLogout}
            >
              <LogOut size={12} />
              Uitloggen
            </Button>
          </div>
        </aside>

        {/* ── Main content ── */}
        <main className="flex-1 px-12 py-10">{children}</main>
      </div>
    </OrgContext.Provider>
  );
}
