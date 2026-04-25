"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { supabase } from "../lib/supabase";
import { useAuth } from "../lib/useAuth";
import AppShell from "../components/AppShell";
import { Card, CardContent } from "@/components/ui/card";
import type { Member } from "../lib/types";

function displayName(m: Member): string {
  const combined = [m.first_name, m.last_name].filter(Boolean).join(" ").trim();
  return combined || m.name || "—";
}

export default function DashboardPage() {
  const { user, loading: authLoading } = useAuth();
  const [total, setTotal] = useState<number | null>(null);
  const [addedThisMonth, setAddedThisMonth] = useState<number | null>(null);
  const [recent, setRecent] = useState<Member[]>([]);
  const [donationYearTotal, setDonationYearTotal] = useState<number | null>(null);
  const [donationMonthTotal, setDonationMonthTotal] = useState<number | null>(null);
  const [dataLoading, setDataLoading] = useState(true);

  useEffect(() => {
    if (!user) return;
    const load = async () => {
      setDataLoading(true);
      const now = new Date();
      const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);
      const yearStart = new Date(now.getFullYear(), 0, 1);
      const monthStartIso = monthStart.toISOString().slice(0, 10);
      const yearStartIso = yearStart.toISOString().slice(0, 10);

      const [
        { count: totalCount },
        { count: monthCount },
        { data: recentRows },
        { data: yearDonations },
        { data: monthDonations },
      ] = await Promise.all([
        supabase.from("members").select("*", { count: "exact", head: true }),
        supabase
          .from("members")
          .select("*", { count: "exact", head: true })
          .gte("created_at", monthStart.toISOString()),
        supabase
          .from("members")
          .select("*")
          .order("created_at", { ascending: false })
          .limit(5),
        supabase.from("donations").select("amount").gte("donated_at", yearStartIso),
        supabase.from("donations").select("amount").gte("donated_at", monthStartIso),
      ]);

      setTotal(totalCount ?? 0);
      setAddedThisMonth(monthCount ?? 0);
      setRecent((recentRows ?? []) as Member[]);
      setDonationYearTotal(
        (yearDonations ?? []).reduce((s, d) => s + Number(d.amount), 0)
      );
      setDonationMonthTotal(
        (monthDonations ?? []).reduce((s, d) => s + Number(d.amount), 0)
      );
      setDataLoading(false);
    };
    load();
  }, [user]);

  if (authLoading) {
    return <main className="p-10 text-muted-foreground">Laden...</main>;
  }

  const today = new Date().toLocaleDateString("nl-NL", {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
  });

  return (
    <AppShell>
      <header className="mb-9">
        <h1 className="font-serif text-4xl font-normal text-foreground">Dashboard</h1>
        <p className="text-muted-foreground text-sm mt-1 capitalize">{today}</p>
      </header>

      {/* Stat cards */}
      <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 mb-8">
        <StatCard
          label="Totaal leden"
          value={dataLoading ? "…" : String(total ?? 0)}
        />
        <StatCard
          label="Toegevoegd deze maand"
          value={dataLoading ? "…" : String(addedThisMonth ?? 0)}
        />
        <StatCard
          label="Donaties dit jaar"
          value={dataLoading ? "…" : formatEuro(donationYearTotal ?? 0)}
          hint={
            dataLoading
              ? undefined
              : `${formatEuro(donationMonthTotal ?? 0)} deze maand`
          }
        />
      </section>

      {/* Recent members */}
      <Card>
        <CardContent className="p-6">
          <div className="flex justify-between items-center mb-5">
            <div>
              <div className="text-[11px] font-bold text-muted-foreground tracking-widest uppercase">
                Recent toegevoegd
              </div>
              <h2 className="font-serif text-2xl font-normal text-foreground mt-1">
                Laatste leden
              </h2>
            </div>
            <Link
              href="/members"
              className="text-[13px] font-medium no-underline"
              style={{ color: "var(--accent-dark)" }}
            >
              Alle leden →
            </Link>
          </div>

          {dataLoading ? (
            <p className="text-muted-foreground py-5">Laden...</p>
          ) : recent.length === 0 ? (
            <div className="py-8 text-center">
              <p className="text-muted-foreground mb-4">Nog geen leden.</p>
              <Link
                href="/members"
                className="inline-block px-4 py-2 rounded-[7px] text-sm font-medium text-white no-underline"
                style={{ background: "var(--accent)" }}
              >
                Voeg je eerste lid toe
              </Link>
            </div>
          ) : (
            <ul className="list-none">
              {recent.map((m, i) => (
                <li
                  key={m.id}
                  className={`flex justify-between items-center py-3.5 ${
                    i === 0 ? "" : "border-t border-border"
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <MemberAvatar name={displayName(m)} />
                    <div>
                      <div className="font-medium text-sm text-foreground">
                        {displayName(m)}
                      </div>
                      <div className="text-[13px] text-muted-foreground">
                        {m.email ?? "—"}
                      </div>
                    </div>
                  </div>
                  <div className="text-[13px] text-muted-foreground">
                    {new Date(m.created_at).toLocaleDateString("nl-NL")}
                  </div>
                </li>
              ))}
            </ul>
          )}
        </CardContent>
      </Card>
    </AppShell>
  );
}

function StatCard({
  label,
  value,
  hint,
}: {
  label: string;
  value: string;
  hint?: string;
}) {
  return (
    <Card>
      <CardContent className="p-6">
        <div className="text-[11px] font-bold text-muted-foreground tracking-widest uppercase">
          {label}
        </div>
        <div className="font-serif text-[40px] font-normal text-foreground mt-1 leading-none">
          {value}
        </div>
        {hint && (
          <div className="text-[12px] text-muted-foreground mt-1.5">{hint}</div>
        )}
      </CardContent>
    </Card>
  );
}

function MemberAvatar({ name }: { name: string }) {
  const initial = name.trim().charAt(0).toUpperCase() || "?";
  return (
    <div
      className="w-9 h-9 rounded-full flex items-center justify-center font-semibold text-sm shrink-0"
      style={{
        background: "var(--accent-light)",
        color: "var(--accent-dark)",
      }}
    >
      {initial}
    </div>
  );
}

function formatEuro(n: number) {
  return n.toLocaleString("nl-NL", {
    style: "currency",
    currency: "EUR",
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  });
}
