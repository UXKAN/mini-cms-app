"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { ChevronLeft, ChevronRight, TrendingDown, TrendingUp } from "lucide-react";
import {
  ResponsiveContainer,
  LineChart,
  Line,
  Tooltip,
  XAxis,
} from "recharts";
import { supabase } from "../lib/supabase";
import { useAuth } from "../lib/useAuth";
import AppShell from "../components/AppShell";
import type { Member } from "../lib/types";

/* ─── helpers ─────────────────────────────────────── */

function displayName(m: Member): string {
  const combined = [m.first_name, m.last_name].filter(Boolean).join(" ").trim();
  return combined || m.name || "—";
}

function eur(n: number) {
  return n.toLocaleString("nl-NL", {
    style: "currency", currency: "EUR",
    minimumFractionDigits: 0, maximumFractionDigits: 0,
  });
}

const MONTHS_FULL = [
  "Januari","Februari","Maart","April","Mei","Juni",
  "Juli","Augustus","September","Oktober","November","December",
];
const MONTHS_SHORT = ["jan","feb","mrt","apr","mei","jun","jul","aug","sep","okt","nov","dec"];

/* ─── shared card wrapper ─────────────────────────── */

function Card({
  children,
  style,
}: {
  children: React.ReactNode;
  style?: React.CSSProperties;
}) {
  return (
    <div style={{
      background: "var(--surface)",
      border: "1px solid var(--border)",
      borderRadius: "var(--radius)",
      boxShadow: "var(--shadow)",
      padding: "22px 24px",
      ...style,
    }}>
      {children}
    </div>
  );
}

/* ─── shared label style ──────────────────────────── */

const labelStyle: React.CSSProperties = {
  fontSize: 11,
  fontWeight: 700,
  color: "var(--ink-subtle)",
  letterSpacing: "0.06em",
  textTransform: "uppercase",
  marginBottom: 8,
};

/* ─── stat number ─────────────────────────────────── */

function StatNum({ value, size = 30 }: { value: string; size?: number }) {
  return (
    <span style={{
      fontFamily: "var(--font-serif)",
      fontSize: size,
      fontWeight: 400,
      color: "var(--ink)",
      lineHeight: 1,
    }}>
      {value}
    </span>
  );
}

/* ─── delta badge ─────────────────────────────────── */

function Delta({ pct }: { pct: number | null }) {
  if (pct === null) return null;
  const up = pct >= 0;
  return (
    <span style={{
      display: "inline-flex", alignItems: "center", gap: 3,
      fontSize: 12, fontWeight: 600,
      padding: "3px 8px",
      borderRadius: 6,
      background: up ? "var(--success-light)" : "var(--error-light)",
      color: up ? "var(--success)" : "var(--error)",
    }}>
      {up ? <TrendingUp size={12} /> : <TrendingDown size={12} />}
      {Math.abs(pct).toFixed(1)}%
    </span>
  );
}

/* ─── sparkline chart ─────────────────────────────── */

interface ChartPoint { label: string; amount: number }

function Sparkline({ data }: { data: ChartPoint[] }) {
  if (data.every(d => d.amount === 0)) {
    return (
      <div style={{ height: 52, display: "flex", alignItems: "center", justifyContent: "center" }}>
        <span style={{ fontSize: 12, color: "var(--ink-subtle)" }}>Geen data</span>
      </div>
    );
  }
  return (
    <div style={{ height: 52 }}>
      <ResponsiveContainer width="100%" height="100%">
        <LineChart data={data} margin={{ top: 2, right: 2, bottom: 0, left: 2 }}>
          <XAxis
            dataKey="label"
            tick={{ fontSize: 10, fill: "var(--ink-subtle)" }}
            tickLine={false}
            axisLine={false}
            interval={4}
          />
          <Tooltip
            formatter={(v) => [eur(Number(v ?? 0)), "Cumulatief"]}
            contentStyle={{
              fontSize: 12,
              border: "1px solid var(--border)",
              borderRadius: 8,
              background: "var(--surface)",
              color: "var(--ink)",
              boxShadow: "var(--shadow)",
            }}
          />
          <Line
            type="monotone"
            dataKey="amount"
            stroke="var(--accent)"
            strokeWidth={2}
            dot={false}
            activeDot={{ r: 4, fill: "var(--accent)" }}
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}

/* ─── page ────────────────────────────────────────── */

export default function DashboardPage() {
  const { user, loading: authLoading } = useAuth();
  const now = new Date();

  const [chartMonth, setChartMonth] = useState(now.getMonth());
  const [chartYear, setChartYear] = useState(now.getFullYear());
  const [chartData, setChartData] = useState<ChartPoint[]>([]);
  const [monthTotal, setMonthTotal] = useState(0);
  const [prevMonthTotal, setPrevMonthTotal] = useState(0);
  const [yearTotal, setYearTotal] = useState(0);
  const [memberCount, setMemberCount] = useState<number | null>(null);
  const [monthlyRecurring, setMonthlyRecurring] = useState<number | null>(null);
  const [topDonors, setTopDonors] = useState<Member[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) return;
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user, chartMonth, chartYear]);

  async function load() {
    setLoading(true);
    const monthStart = new Date(chartYear, chartMonth, 1).toISOString().slice(0, 10);
    const monthEnd   = new Date(chartYear, chartMonth + 1, 0).toISOString().slice(0, 10);
    const prevM = chartMonth === 0 ? 11 : chartMonth - 1;
    const prevY = chartMonth === 0 ? chartYear - 1 : chartYear;
    const prevStart = new Date(prevY, prevM, 1).toISOString().slice(0, 10);
    const prevEnd   = new Date(prevY, prevM + 1, 0).toISOString().slice(0, 10);
    const yearStart = new Date(now.getFullYear(), 0, 1).toISOString().slice(0, 10);

    const [monthDons, prevDons, yearDons, memCount, members] = await Promise.all([
      supabase.from("donations").select("amount, donated_at").gte("donated_at", monthStart).lte("donated_at", monthEnd),
      supabase.from("donations").select("amount").gte("donated_at", prevStart).lte("donated_at", prevEnd),
      supabase.from("donations").select("amount").gte("donated_at", yearStart),
      supabase.from("members").select("*", { count: "exact", head: true }),
      supabase.from("members").select("id, name, first_name, last_name, monthly_amount, membership_type")
        .not("monthly_amount", "is", null).order("monthly_amount", { ascending: false }).limit(5),
    ]);

    const daysInMonth = new Date(chartYear, chartMonth + 1, 0).getDate();
    const byDay = new Array(daysInMonth).fill(0);
    (monthDons.data ?? []).forEach((d) => {
      byDay[new Date(d.donated_at).getDate() - 1] += Number(d.amount);
    });
    let cum = 0;
    setChartData(byDay.map((amt, i) => { cum += amt; return { label: String(i + 1), amount: cum }; }));

    const mTotal = (monthDons.data ?? []).reduce((s, d) => s + Number(d.amount), 0);
    const pTotal = (prevDons.data ?? []).reduce((s, d) => s + Number(d.amount), 0);
    const yTotal = (yearDons.data ?? []).reduce((s, d) => s + Number(d.amount), 0);
    setMonthTotal(mTotal);
    setPrevMonthTotal(pTotal);
    setYearTotal(yTotal);
    setMemberCount(memCount.count ?? 0);
    setMonthlyRecurring((members.data ?? []).reduce((s, m) => s + Number(m.monthly_amount ?? 0), 0));
    setTopDonors((members.data ?? []) as Member[]);
    setLoading(false);
  }

  const prevMonth = () => {
    if (chartMonth === 0) { setChartMonth(11); setChartYear(y => y - 1); }
    else setChartMonth(m => m - 1);
  };
  const nextMonth = () => {
    const nextM = chartMonth === 11 ? 0 : chartMonth + 1;
    const nextY = chartMonth === 11 ? chartYear + 1 : chartYear;
    if (nextY > now.getFullYear() || (nextY === now.getFullYear() && nextM > now.getMonth())) return;
    if (chartMonth === 11) { setChartMonth(0); setChartYear(y => y + 1); } else setChartMonth(m => m + 1);
  };
  const isCurrentMonth = chartYear === now.getFullYear() && chartMonth === now.getMonth();
  const pctChange = prevMonthTotal > 0 ? ((monthTotal - prevMonthTotal) / prevMonthTotal) * 100 : null;

  if (authLoading) return null;

  const today = new Date().toLocaleDateString("nl-NL", {
    weekday: "long", year: "numeric", month: "long", day: "numeric",
  });

  return (
    <AppShell>
      {/* Header */}
      <div style={{ marginBottom: 24 }}>
        <h1 style={{ fontFamily: "var(--font-serif)", fontSize: 28, fontWeight: 400, color: "var(--ink)" }}>
          Dashboard
        </h1>
        <p style={{ fontSize: 13, color: "var(--ink-muted)", marginTop: 4 }}>
          Overzicht · {today}
        </p>
      </div>

      {/* Grid — exact 2-col like design, gap 16px */}
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>

        {/* ── 1. Totale donaties (spans full width) ── */}
        <Card style={{ gridColumn: "1 / span 2" }}>
          <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", marginBottom: 16, flexWrap: "wrap", gap: 10 }}>
            {/* Left */}
            <div>
              <div style={labelStyle}>Totale donaties</div>
              <div style={{ display: "flex", alignItems: "center", gap: 12, flexWrap: "wrap" }}>
                <StatNum value={loading ? "…" : eur(monthTotal)} size={36} />
                <Delta pct={pctChange} />
              </div>
              {prevMonthTotal > 0 && (
                <div style={{ fontSize: 12, color: "var(--ink-muted)", marginTop: 4 }}>
                  vs. vorige maand ({eur(prevMonthTotal)})
                </div>
              )}
            </div>
            {/* Right: year total */}
            <div style={{ textAlign: "right" }}>
              <div style={labelStyle}>Jaar tot nu</div>
              <StatNum value={loading ? "…" : eur(yearTotal)} size={22} />
              <div style={{ fontSize: 12, color: "var(--ink-muted)", marginTop: 2 }}>
                Jan – {MONTHS_SHORT[now.getMonth()]} {now.getFullYear()}
              </div>
            </div>
          </div>

          {/* Month nav */}
          <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 14 }}>
            <button onClick={prevMonth} style={{ background: "none", border: "1px solid var(--border)", borderRadius: "var(--radius-sm)", padding: "4px 8px", cursor: "pointer", display: "flex", alignItems: "center" }}>
              <ChevronLeft size={14} color="var(--ink-muted)" />
            </button>
            <span style={{ fontSize: 13, fontWeight: 600, color: "var(--ink)", minWidth: 120, textAlign: "center" }}>
              {MONTHS_FULL[chartMonth]} {chartYear}
            </span>
            <button onClick={nextMonth} disabled={isCurrentMonth} style={{ background: "none", border: "1px solid var(--border)", borderRadius: "var(--radius-sm)", padding: "4px 8px", cursor: "pointer", display: "flex", alignItems: "center", opacity: isCurrentMonth ? 0.3 : 1 }}>
              <ChevronRight size={14} color="var(--ink-muted)" />
            </button>
          </div>

          <Sparkline data={chartData} />
        </Card>

        {/* ── 2. Maandelijkse leden ── */}
        <Card>
          <div style={labelStyle}>Maandelijkse leden</div>
          <div style={{ display: "flex", gap: 28, marginBottom: 16 }}>
            <div>
              <StatNum value={loading ? "…" : String(memberCount ?? 0)} size={30} />
              <div style={{ fontSize: 12, color: "var(--ink-muted)", marginTop: 2 }}>actieve leden</div>
            </div>
            <div>
              <StatNum value={loading ? "…" : eur(monthlyRecurring ?? 0)} size={30} />
              <div style={{ fontSize: 12, color: "var(--ink-muted)", marginTop: 2 }}>per maand terugkerend</div>
            </div>
          </div>

          {topDonors.length > 0 ? (
            <div style={{ borderTop: "1px solid var(--border)", paddingTop: 12 }}>
              <div style={{ ...labelStyle, marginBottom: 8 }}>Top 5</div>
              {topDonors.map((m, i) => (
                <div key={m.id} style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "6px 0", borderBottom: i < topDonors.length - 1 ? "1px solid var(--border)" : "none" }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                    <div style={{ width: 24, height: 24, borderRadius: "50%", background: "var(--accent-light)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 10, fontWeight: 700, color: "var(--accent-dark)", flexShrink: 0 }}>
                      {i + 1}
                    </div>
                    <span style={{ fontSize: 13, color: "var(--ink)", fontWeight: 500 }}>{displayName(m)}</span>
                    {m.membership_type && m.membership_type !== "lid" && (
                      <span style={{ fontSize: 11, padding: "2px 7px", borderRadius: 99, background: "var(--accent-light)", color: "var(--accent-dark)", fontWeight: 600 }}>
                        {m.membership_type}
                      </span>
                    )}
                  </div>
                  <span style={{ fontSize: 13, fontWeight: 700, color: "var(--accent-dark)" }}>
                    {eur(Number(m.monthly_amount ?? 0))}
                  </span>
                </div>
              ))}
            </div>
          ) : (
            <div style={{ paddingTop: 12, borderTop: "1px solid var(--border)" }}>
              <p style={{ fontSize: 13, color: "var(--ink-subtle)" }}>
                Nog geen leden met maandbedrag.{" "}
                <Link href="/members" style={{ color: "var(--accent-dark)" }}>Voeg leden toe →</Link>
              </p>
            </div>
          )}
        </Card>

        {/* ── 3. Ondernemers ── */}
        <Card>
          <div style={labelStyle}>Ondernemers</div>
          <div style={{ padding: "20px 0", textAlign: "center" }}>
            <p style={{ fontSize: 13, color: "var(--ink-subtle)" }}>Module komt binnenkort.</p>
            <Link href="/ondernemers" style={{ fontSize: 13, color: "var(--accent-dark)", marginTop: 8, display: "inline-block" }}>
              Bekijk ondernemers →
            </Link>
          </div>
        </Card>

        {/* ── 4. Aankomende evenementen ── */}
        <Card>
          <div style={labelStyle}>Aankomende evenementen</div>
          <div style={{ padding: "20px 0", textAlign: "center" }}>
            <p style={{ fontSize: 13, color: "var(--ink-subtle)" }}>Module komt binnenkort.</p>
            <Link href="/evenementen" style={{ fontSize: 13, color: "var(--accent-dark)", marginTop: 8, display: "inline-block" }}>
              Bekijk evenementen →
            </Link>
          </div>
        </Card>

        {/* ── 5. Toezeggingen ── */}
        <Card>
          <div style={labelStyle}>Toezeggingen</div>
          <div style={{ padding: "20px 0", textAlign: "center" }}>
            <p style={{ fontSize: 13, color: "var(--ink-subtle)" }}>Module komt binnenkort.</p>
            <Link href="/toezeggingen" style={{ fontSize: 13, color: "var(--accent-dark)", marginTop: 8, display: "inline-block" }}>
              Bekijk toezeggingen →
            </Link>
          </div>
        </Card>

      </div>
    </AppShell>
  );
}
