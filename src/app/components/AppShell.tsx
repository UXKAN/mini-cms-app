"use client";

import Link from "next/link";
import { useState } from "react";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  Users,
  Briefcase,
  Heart,
  FileCheck,
  Calendar,
  LogOut,
  Menu,
} from "lucide-react";
import { supabase } from "../lib/supabase";
import { useAuth } from "../lib/useAuth";
import { useCurrentOrg } from "../lib/org";
import { OrgContext } from "../lib/orgContext";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { GiftFormDialog } from "./GiftFormDialog";
import { LoadErrorState } from "./LoadErrorState";

const nav = [
  { href: "/dashboard", label: "Dashboard", Icon: LayoutDashboard },
  { href: "/members", label: "Leden", Icon: Users },
  { href: "/donations", label: "Donaties", Icon: Heart },
  { href: "/toezeggingen", label: "Toezeggingen", Icon: FileCheck },
];

const navSoon = [
  { href: "/ondernemers", label: "Ondernemers", Icon: Briefcase },
  { href: "/evenementen", label: "Evenementen", Icon: Calendar },
];

export default function AppShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const { user, loading: authLoading, error: authError, retry: retryAuth } = useAuth();
  const { org, loading: orgLoading, error: orgError, retry: retryOrg } = useCurrentOrg(user);
  const [giftFormOpen, setGiftFormOpen] = useState(false);
  const [mobileNavOpen, setMobileNavOpen] = useState(false);

  const handleLogout = async () => {
    await supabase.auth.signOut();
    window.location.href = "/login";
  };

  if (authError || orgError) {
    return <LoadErrorState onRetry={authError ? retryAuth : retryOrg} />;
  }

  if (authLoading || orgLoading || !user) {
    return <main className="p-10 text-muted-foreground">Laden...</main>;
  }

  if (!org) return null;

  const userLabel =
    (user.user_metadata?.full_name as string | undefined) ??
    user.email?.split("@")[0] ??
    "Gebruiker";
  const initial = (user.email ?? "?").charAt(0).toUpperCase();

  const navItem = (
    { href, label, Icon }: (typeof nav)[number],
    { soon = false } = {},
  ) => {
    const active = pathname === href || pathname.startsWith(href + "/");
    return (
      <Link
        key={href}
        href={href}
        onClick={() => setMobileNavOpen(false)}
        className={[
          "flex items-center gap-2.5 rounded-[10px] px-3 py-2.5 text-[13px] font-medium no-underline transition-colors",
          active
            ? "bg-card text-primary shadow-[var(--shadow)]"
            : soon
              ? "text-muted-foreground/60 hover:bg-[var(--accent-light)]"
              : "text-foreground hover:bg-[var(--accent-light)]",
        ].join(" ")}
      >
        <Icon size={15} className={active ? "text-primary" : "text-muted-foreground"} />
        {label}
      </Link>
    );
  };

  const sidebarInner = (
    <>
      <div className="px-4 pb-4 pt-6">
        <div className="flex items-center gap-2.5">
          <div className="grid h-8 w-8 shrink-0 place-items-center rounded-[8px] bg-primary text-[13px] font-bold text-primary-foreground">
            {org.name.charAt(0).toUpperCase()}
          </div>
          <div className="min-w-0">
            <div className="truncate text-[13px] font-bold leading-tight text-foreground">
              {org.name}
            </div>
            <div className="mt-0.5 text-[9px] uppercase tracking-widest text-muted-foreground">
              Mosqon
            </div>
          </div>
        </div>
      </div>

      <div className="px-3 pb-3">
        <Button
          className="w-full rounded-[10px] shadow-[0_2px_6px_oklch(0.52_0.13_165/0.25)]"
          onClick={() => {
            setMobileNavOpen(false);
            setGiftFormOpen(true);
          }}
        >
          + Nieuwe donatie
        </Button>
      </div>

      <nav className="flex flex-1 flex-col gap-0.5 overflow-y-auto px-2 py-2">
        {nav.map((item) => navItem(item))}
        <div className="mt-4 px-3 pb-1 text-[9px] font-semibold uppercase tracking-widest text-muted-foreground/70">
          Binnenkort
        </div>
        {navSoon.map((item) => navItem(item, { soon: true }))}
      </nav>

      <div className="flex flex-col gap-2 px-3 py-3">
        <div className="flex items-center gap-2 px-1">
          <Avatar className="h-7 w-7 shrink-0">
            <AvatarFallback className="bg-[var(--accent-light)] text-[11px] text-[var(--accent-dark)]">
              {initial}
            </AvatarFallback>
          </Avatar>
          <div className="min-w-0">
            <div className="truncate text-[12px] font-medium text-foreground">
              {userLabel}
            </div>
            <div className="truncate text-[10px] text-muted-foreground">
              {user.email}
            </div>
          </div>
        </div>
        <Button
          variant="ghost"
          size="sm"
          className="h-8 w-full justify-start gap-2 rounded-[10px] text-[12px] text-muted-foreground hover:bg-[var(--accent-light)] hover:text-[var(--accent-dark)]"
          onClick={handleLogout}
        >
          <LogOut size={12} />
          Uitloggen
        </Button>
      </div>
    </>
  );

  return (
    <OrgContext.Provider value={org}>
      <div className="flex min-h-screen">
        {/* ── Sidebar (desktop) ── */}
        <aside className="sticky top-0 hidden h-screen w-[224px] shrink-0 flex-col bg-[var(--surface-zone)] md:flex">
          {sidebarInner}
        </aside>

        <div className="flex min-w-0 flex-1 flex-col">
          {/* ── Mobiel: topbalk ── */}
          <header className="sticky top-0 z-40 flex h-14 items-center gap-3 bg-background/95 px-4 backdrop-blur md:hidden">
            <button
              aria-label="Menu openen"
              onClick={() => setMobileNavOpen(true)}
              className="grid h-10 w-10 place-items-center rounded-[10px] bg-[var(--surface-zone)] text-foreground"
            >
              <Menu size={18} />
            </button>
            <div className="min-w-0 flex-1 truncate text-[15px] font-bold text-foreground">
              {org.name}
            </div>
            <Button size="sm" className="rounded-[10px]" onClick={() => setGiftFormOpen(true)}>
              + Donatie
            </Button>
          </header>

          {/* ── Mobiel: drawer ── */}
          {mobileNavOpen && (
            <div className="fixed inset-0 z-50 md:hidden">
              <div
                className="absolute inset-0 bg-[oklch(0.22_0.015_170/0.35)]"
                onClick={() => setMobileNavOpen(false)}
              />
              <aside className="absolute inset-y-0 left-0 flex w-[264px] flex-col bg-[var(--surface-zone)] shadow-[var(--shadow-lg)]">
                {sidebarInner}
              </aside>
            </div>
          )}

          {/* ── Main content ── */}
          <main className="min-w-0 flex-1 px-5 py-6 md:px-14 md:py-10">{children}</main>
        </div>
      </div>

      <GiftFormDialog open={giftFormOpen} onOpenChange={setGiftFormOpen} />
    </OrgContext.Provider>
  );
}
