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
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import type { Member } from "../lib/types";

/* ─── helpers ─────────────────────────────────────── */

function displayName(m: Member): string {
  const combined = [m.first_name, m.last_name].filter(Boolean).join(" ").trim();
  return combined || m.name || "—";
}

function formatEuro(n: number, decimals = 0) {
  return n.toLocaleString("nl-NL", {
    style: "currency",
    currency: "EUR",
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
  });
}

function monthLabel(date: Date) {
  return date.toLocaleDateString("nl-NL", { month: "short" });
}

const NL_MONTHS = [
  "januari","februari","maart","april","mei","juni",
  "juli","augustus","september","oktober","november","december",
];

/* ─── types ────────────────────────────────────────── */

interface ChartPoint { label: string; amount: number }
interface TopDonor { id: string; name: string; type: string; amount: number }

/* ─── main page ────────────────────────────────────── */

export default function DashboardPage() {
  const { user, loading: authLoading } = useAuth();

  // Chart state
  const [chartMonth, setChartMonth] = useState(new Date());
  const [chartData, setChartData] = useState<ChartPoint[]>([]);
  const [monthTotal, setMonthTotal] = useState(0);
  const [prevMonthTotal, setPrevMonthTotal] = useState(0);
  const [yearTotal, setYearTotal] = useState(0);

  // Members state
  const [memberCount, setMemberCount] = useState<number | null>(null);
  const [monthlyRecurring, setMonthlyRecurring] = useState<number | null>(null);
  const [topDonors, setTopDonors] = useState<TopDonor[]>([]);

  // Loading
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) return;
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user, chartMonth]);

  async function load() {
    setLoading(true);

    const year = chartMonth.getFullYear();
    const month = chartMonth.getMonth();

    // Current month range
    const monthStart = new Date(year, month, 1).toISOString().slice(0, 10);
    const monthEnd = new Date(year, month + 1, 0).toISOString().slice(0, 10);
    // Prev month range
    const prevStart = new Date(year, month - 1, 1).toISOString().slice(0, 10);
    const prevEnd = new Date(year, month, 0).toISOString().slice(0, 10);
    // Year range
    const yearStart = new Date(year, 0, 1).toISOString().slice(0, 10);

    const [
      { data: monthDons },
      { data: prevDons },
      { data: yearDons },
      { count: memCount },
      { data: members },
    ] = await Promise.all([
      supabase.from("donations").select("amount, donated_at")
        .gte("donated_at", monthStart).lte("donated_at", monthEnd),
      supabase.from("donations").select("amount")
        .gte("donated_at", prevStart).lte("donated_at", prevEnd),
      supabase.from("donations").select("amount")
        .gte("donated_at", yearStart),
      supabase.from("members").select("*", { count: "exact", head: true }),
      supabase.from("members").select("id, name, first_name, last_name, monthly_amount, membership_type")
        .not("monthly_amount", "is", null).order("monthly_amount", { ascending: false }).limit(5),
    ]);

    // Chart: group by day
    const daysInMonth = new Date(year, month + 1, 0).getDate();
    const byDay = new Array(daysInMonth).fill(0);
    (monthDons ?? []).forEach((d) => {
      const day = new Date(d.donated_at).getDate();
      byDay[day - 1] += Number(d.amount);
    });
    // Build cumulative daily chart
    let cumulative = 0;
    const points: ChartPoint[] = byDay.map((amt, i) => {
      cumulative += amt;
      return { label: String(i + 1), amount: cumulative };
    });
    setChartData(points);

    const mTotal = (monthDons ?? []).reduce((s, d) => s + Number(d.amount), 0);
    const pTotal = (prevDons ?? []).reduce((s, d) => s + Number(d.amount), 0);
    const yTotal = (yearDons ?? []).reduce((s, d) => s + Number(d.amount), 0);
    setMonthTotal(mTotal);
    setPrevMonthTotal(pTotal);
    setYearTotal(yTotal);

    setMemberCount(memCount ?? 0);
    const recurring = (members ?? []).reduce((s, m) => s + Number(m.monthly_amount ?? 0), 0);
    setMonthlyRecurring(recurring);

    const donors: TopDonor[] = (members ?? []).map((m) => ({
      id: m.id,
      name: [m.first_name, m.last_name].filter(Boolean).join(" ").trim() || m.name || "—",
      type: m.membership_type ?? "Lid",
      amount: Number(m.monthly_amount ?? 0),
    }));
    setTopDonors(donors);

    setLoading(false);
  }

  const prevMonth = () => setChartMonth((d) => new Date(d.getFullYear(), d.getMonth() - 1, 1));
  const nextMonth = () => setChartMonth((d) => new Date(d.getFullYear(), d.getMonth() + 1, 1));
  const isCurrentMonth = chartMonth.getFullYear() === new Date().getFullYear()
    && chartMonth.getMonth() === new Date().getMonth();

  const pctChange = prevMonthTotal > 0
    ? ((monthTotal - prevMonthTotal) / prevMonthTotal) * 100
    : null;
  const trending = pctChange !== null && pctChange >= 0;

  if (authLoading) {
    return <main className="p-10" style={{ color: "var(--ink-muted)" }}>Laden...</main>;
  }

  const today = new Date().toLocaleDateString("nl-NL", {
    weekday: "long", year: "numeric", month: "long", day: "numeric",
  });

  return (
    <AppShell>
      {/* Header */}
      <header className="mb-8">
        <h1 className="font-serif text-[40px] font-normal leading-tight" style={{ color: "var(--ink)" }}>
          Dashboard
        </h1>
        <p className="text-sm mt-1 capitalize" style={{ color: "var(--ink-muted)" }}>
          Overzicht · {today}
        </p>
      </header>

      {/* ── Row 1: Donation chart ── */}
      <Card className="mb-5">
        <CardContent className="p-7">
          <div className="flex items-start justify-between flex-wrap gap-6">
            {/* Left: total + change */}
            <div>
              <div className="text-[11px] font-semibold tracking-widest uppercase mb-2" style={{ color: "var(--ink-muted)" }}>
                Totale donaties
              </div>
              <div className="flex items-center gap-3">
                <span className="font-serif text-[42px] leading-none" style={{ color: "var(--ink)" }}>
                  {loading ? "…" : formatEuro(monthTotal)}
                </span>
                {pctChange !== null && (
                  <span
                    className="inline-flex items-center gap-1 text-[13px] font-semibold px-2 py-1 rounded-md"
                    style={{
                      background: trending ? "var(--success-light)" : "var(--error-light)",
                      color: trending ? "var(--success)" : "var(--error)",
                    }}
                  >
                    {trending ? <TrendingUp size={13} /> : <TrendingDown size={13} />}
                    {Math.abs(pctChange).toFixed(1)}%
                  </span>
                )}
              </div>
              {prevMonthTotal > 0 && (
                <p className="text-sm mt-1" style={{ color: "var(--ink-muted)" }}>
                  vs. vorige maand ({formatEuro(prevMonthTotal)})
                </p>
              )}

              {/* Month navigation */}
              <div className="flex items-center gap-2 mt-5">
                <button
                  onClick={prevMonth}
                  className="w-7 h-7 rounded-md flex items-center justify-center transition-colors"
                  style={{ border: "1px solid var(--border)", color: "var(--ink-muted)" }}
                >
                  <ChevronLeft size={14} />
                </button>
                <span className="text-sm font-medium px-2" style={{ color: "var(--ink)", minWidth: 110, textAlign: "center" }}>
                  {NL_MONTHS[chartMonth.getMonth()].charAt(0).toUpperCase() + NL_MONTHS[chartMonth.getMonth()].slice(1)}{" "}
                  {chartMonth.getFullYear()}
                </span>
                <button
                  onClick={nextMonth}
                  disabled={isCurrentMonth}
                  className="w-7 h-7 rounded-md flex items-center justify-center transition-colors disabled:opacity-30"
                  style={{ border: "1px solid var(--border)", color: "var(--ink-muted)" }}
                >
                  <ChevronRight size={14} />
                </button>
              </div>
            </div>

            {/* Right: year total */}
            <div className="text-right">
              <div className="text-[11px] font-semibold tracking-widest uppercase mb-2" style={{ color: "var(--ink-muted)" }}>
                Jaar tot nu
              </div>
              <div className="font-serif text-[32px] leading-none" style={{ color: "var(--ink)" }}>
                {loading ? "…" : formatEuro(yearTotal)}
              </div>
              <p className="text-sm mt-1" style={{ color: "var(--ink-muted)" }}>
                Jan – {NL_MONTHS[new Date().getMonth()].charAt(0).toUpperCase() + NL_MONTHS[new Date().getMonth()].slice(1)}{" "}
                {new Date().getFullYear()}
              </p>
            </div>
          </div>

          {/* Chart */}
          <div className="mt-7 h-[120px]">
            {chartData.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={chartData} margin={{ top: 4, right: 4, bottom: 0, left: 4 }}>
                  <XAxis
                    dataKey="label"
                    tick={{ fontSize: 10, fill: "var(--ink-subtle)" }}
                    tickLine={false}
                    axisLine={false}
                    interval={4}
                  />
                  <Tooltip
                    formatter={(v) => [formatEuro(Number(v ?? 0)), "Cumulatief"]}
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
            ) : (
              <div className="h-full flex items-center justify-center text-sm" style={{ color: "var(--ink-subtle)" }}>
                Geen donaties in deze maand
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* ── Row 2: Leden + Ondernemers ── */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5 mb-5">
        {/* Maandelijkse Leden */}
        <Card>
          <CardContent className="p-7">
            <div className="text-[11px] font-semibold tracking-widest uppercase mb-5" style={{ color: "var(--ink-muted)" }}>
              Maandelijkse leden
            </div>
            <div className="flex gap-10 mb-6">
              <div>
                <div className="font-serif text-[38px] leading-none" style={{ color: "var(--ink)" }}>
                  {loading ? "…" : (memberCount ?? 0)}
                </div>
                <div className="text-[13px] mt-1" style={{ color: "var(--ink-muted)" }}>actieve leden</div>
              </div>
              <div>
                <div className="font-serif text-[38px] leading-none" style={{ color: "var(--ink)" }}>
                  {loading ? "…" : formatEuro(monthlyRecurring ?? 0)}
                </div>
                <div className="text-[13px] mt-1" style={{ color: "var(--ink-muted)" }}>per maand terugkerend</div>
              </div>
            </div>

            {topDonors.length > 0 && (
              <>
                <div className="text-[11px] font-semibold tracking-widest uppercase mb-3" style={{ color: "var(--ink-muted)" }}>
                  Top 5
                </div>
                <div className="border-t" style={{ borderColor: "var(--border)" }} />
                {topDonors.map((d, i) => (
                  <div
                    key={d.id}
                    className="flex items-center justify-between py-3"
                    style={{ borderBottom: i < topDonors.length - 1 ? "1px solid var(--border)" : "none" }}
                  >
                    <div className="flex items-center gap-3">
                      <span
                        className="w-6 h-6 rounded-full flex items-center justify-center text-[11px] font-bold shrink-0"
                        style={{ background: "var(--accent-light)", color: "var(--accent-dark)" }}
                      >
                        {i + 1}
                      </span>
                      <span className="text-sm font-medium" style={{ color: "var(--ink)" }}>{d.name}</span>
                      {d.type && d.type !== "Lid" && (
                        <span
                          className="text-[11px] px-2 py-0.5 rounded-full font-medium"
                          style={{ background: "var(--accent-light)", color: "var(--accent-dark)" }}
                        >
                          {d.type}
                        </span>
                      )}
                    </div>
                    <span className="text-sm font-semibold" style={{ color: "var(--ink)" }}>
                      {formatEuro(d.amount)}
                    </span>
                  </div>
                ))}
              </>
            )}

            {topDonors.length === 0 && !loading && (
              <p className="text-sm py-4" style={{ color: "var(--ink-subtle)" }}>
                Nog geen leden met maandbedrag.{" "}
                <Link href="/members" style={{ color: "var(--accent-dark)" }}>Voeg leden toe →</Link>
              </p>
            )}
          </CardContent>
        </Card>

        {/* Ondernemers */}
        <Card>
          <CardContent className="p-7">
            <div className="text-[11px] font-semibold tracking-widest uppercase mb-5" style={{ color: "var(--ink-muted)" }}>
              Ondernemers
            </div>
            <div className="py-8 text-center">
              <p className="text-sm" style={{ color: "var(--ink-subtle)" }}>Ondernemer module komt binnenkort.</p>
              <Link
                href="/ondernemers"
                className="inline-block mt-3 text-sm font-medium"
                style={{ color: "var(--accent-dark)" }}
              >
                Bekijk ondernemers →
              </Link>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* ── Row 3: Evenementen + Toezeggingen ── */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        {/* Aankomende evenementen */}
        <Card>
          <CardContent className="p-7">
            <div className="text-[11px] font-semibold tracking-widest uppercase mb-5" style={{ color: "var(--ink-muted)" }}>
              Aankomende evenementen
            </div>
            <div className="py-8 text-center">
              <p className="text-sm" style={{ color: "var(--ink-subtle)" }}>Evenementen module komt binnenkort.</p>
              <Link
                href="/evenementen"
                className="inline-block mt-3 text-sm font-medium"
                style={{ color: "var(--accent-dark)" }}
              >
                Bekijk evenementen →
              </Link>
            </div>
          </CardContent>
        </Card>

        {/* Toezeggingen */}
        <Card>
          <CardContent className="p-7">
            <div className="text-[11px] font-semibold tracking-widest uppercase mb-5" style={{ color: "var(--ink-muted)" }}>
              Toezeggingen
            </div>
            <div className="py-8 text-center">
              <p className="text-sm" style={{ color: "var(--ink-subtle)" }}>Toezeggingen module komt binnenkort.</p>
              <Link
                href="/toezeggingen"
                className="inline-block mt-3 text-sm font-medium"
                style={{ color: "var(--accent-dark)" }}
              >
                Bekijk toezeggingen →
              </Link>
            </div>
          </CardContent>
        </Card>
      </div>
    </AppShell>
  );
}
