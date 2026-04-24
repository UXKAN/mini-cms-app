"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { supabase } from "../lib/supabase";
import { useAuth } from "../lib/useAuth";
import AppShell from "../components/AppShell";
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

  if (authLoading) return <LoadingShell />;

  return (
    <AppShell>
      <header style={{ marginBottom: 36 }}>
        <h1 style={{ fontFamily: "var(--font-serif), Georgia, serif", fontSize: 36, fontWeight: 400, color: "var(--ink)" }}>
          Dashboard
        </h1>
        <p style={{ color: "var(--ink-muted)", fontSize: 14, marginTop: 4 }}>
          Welkom terug{user?.email ? `, ${user.email}` : ""}.
        </p>
      </header>

      <section
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))",
          gap: 16,
          marginBottom: 32,
        }}
      >
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

      <section style={cardStyle}>
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            marginBottom: 20,
          }}
        >
          <div>
            <div style={labelStyle}>Recent toegevoegd</div>
            <h2 style={{ fontFamily: "var(--font-serif), Georgia, serif", fontSize: 22, fontWeight: 400, marginTop: 4 }}>
              Laatste leden
            </h2>
          </div>
          <Link
            href="/members"
            style={{
              fontSize: 13,
              color: "var(--accent-dark)",
              textDecoration: "none",
              fontWeight: 500,
            }}
          >
            Alle leden →
          </Link>
        </div>

        {dataLoading ? (
          <p style={{ color: "var(--ink-muted)", padding: "20px 0" }}>Laden...</p>
        ) : recent.length === 0 ? (
          <div style={{ padding: "32px 0", textAlign: "center" }}>
            <p style={{ marginBottom: 14, color: "var(--ink-muted)" }}>Nog geen leden.</p>
            <Link href="/members" style={primaryBtn}>
              Voeg je eerste lid toe
            </Link>
          </div>
        ) : (
          <ul style={{ listStyle: "none" }}>
            {recent.map((m, i) => (
              <li
                key={m.id}
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                  padding: "14px 0",
                  borderTop: i === 0 ? "none" : "1px solid var(--border)",
                }}
              >
                <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                  <Avatar name={displayName(m)} />
                  <div>
                    <div style={{ fontWeight: 500, color: "var(--ink)" }}>{displayName(m)}</div>
                    <div style={{ fontSize: 13, color: "var(--ink-muted)" }}>
                      {m.email ?? "—"}
                    </div>
                  </div>
                </div>
                <div style={{ fontSize: 13, color: "var(--ink-subtle)" }}>
                  {new Date(m.created_at).toLocaleDateString("nl-NL")}
                </div>
              </li>
            ))}
          </ul>
        )}
      </section>
    </AppShell>
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

function LoadingShell() {
  return (
    <main style={{ padding: 40, color: "var(--ink-muted)" }}>Laden...</main>
  );
}

function StatCard({ label, value, hint }: { label: string; value: string; hint?: string }) {
  return (
    <div style={cardStyle}>
      <div style={labelStyle}>{label}</div>
      <div
        style={{
          fontFamily: "var(--font-serif), Georgia, serif",
          fontSize: 40,
          fontWeight: 400,
          color: "var(--ink)",
          marginTop: 4,
          lineHeight: 1.1,
        }}
      >
        {value}
      </div>
      {hint && (
        <div style={{ fontSize: 12, color: "var(--ink-subtle)", marginTop: 6 }}>{hint}</div>
      )}
    </div>
  );
}

function Avatar({ name }: { name: string }) {
  const initial = name.trim().charAt(0).toUpperCase() || "?";
  return (
    <div
      style={{
        width: 36,
        height: 36,
        borderRadius: "50%",
        background: "var(--accent-light)",
        color: "var(--accent-dark)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        fontWeight: 600,
        fontSize: 14,
      }}
    >
      {initial}
    </div>
  );
}

const cardStyle: React.CSSProperties = {
  background: "var(--surface)",
  border: "1px solid var(--border)",
  borderRadius: "var(--radius)",
  padding: 24,
  boxShadow: "var(--shadow)",
};

const labelStyle: React.CSSProperties = {
  fontSize: 11,
  fontWeight: 700,
  color: "var(--ink-subtle)",
  letterSpacing: "0.06em",
  textTransform: "uppercase",
};

const primaryBtn: React.CSSProperties = {
  display: "inline-block",
  padding: "10px 18px",
  background: "var(--accent)",
  color: "#fff",
  borderRadius: "var(--radius-sm)",
  textDecoration: "none",
  fontSize: 14,
  fontWeight: 500,
  border: "none",
  cursor: "pointer",
};
