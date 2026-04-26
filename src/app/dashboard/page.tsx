"use client";

import { useState } from "react";
import {
  ResponsiveContainer,
  LineChart,
  Line,
  Tooltip,
  XAxis,
} from "recharts";
import { ChevronLeft, ChevronRight, TrendingDown, TrendingUp } from "lucide-react";
import AppShell from "../components/AppShell";
import { Card, SectionLabel, Badge } from "@/components/crm";
import {
  donors,
  events,
  promises,
  donationsForMonth,
  totalForMonth,
  memberCount,
  monthlyRecurring,
  businessCount,
  eur,
} from "../lib/mockData";

const MONTHS_NL = ["Jan","Feb","Mrt","Apr","Mei","Jun","Jul","Aug","Sep","Okt","Nov","Dec"];
const MONTHS_FULL = [
  "Januari","Februari","Maart","April","Mei","Juni",
  "Juli","Augustus","September","Oktober","November","December",
];

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

function Delta({ pct }: { pct: number }) {
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

// ── Widget 1: Totale donaties ─────────────────────────────────────────────────
function TotalDonationsWidget() {
  const now = new Date();
  const [viewMonth, setViewMonth] = useState(now.getMonth());
  const [viewYear, setViewYear] = useState(now.getFullYear());

  const curTotal = totalForMonth(viewYear, viewMonth + 1);
  const prevM = viewMonth === 0 ? 11 : viewMonth - 1;
  const prevY = viewMonth === 0 ? viewYear - 1 : viewYear;
  const prevTotal = totalForMonth(prevY, prevM + 1);
  const growth = prevTotal > 0 ? ((curTotal - prevTotal) / prevTotal) * 100 : 0;

  // Cumulative chart data per day in selected month
  const daysInMonth = new Date(viewYear, viewMonth + 1, 0).getDate();
  const dayTotals = new Array(daysInMonth).fill(0);
  donationsForMonth(viewYear, viewMonth + 1).forEach((d) => {
    const day = Number(d.date.split("-")[2]);
    dayTotals[day - 1] += d.amount;
  });
  let cum = 0;
  const chartData = dayTotals.map((amt, i) => {
    cum += amt;
    return { label: String(i + 1), amount: cum };
  });

  // YTD total
  let ytdTotal = 0;
  for (let m = 1; m <= now.getMonth() + 1; m++) {
    ytdTotal += totalForMonth(now.getFullYear(), m);
  }

  const prev = () => {
    if (viewMonth === 0) { setViewMonth(11); setViewYear((y) => y - 1); }
    else setViewMonth((m) => m - 1);
  };
  const next = () => {
    const nextM = viewMonth === 11 ? 0 : viewMonth + 1;
    const nextY = viewMonth === 11 ? viewYear + 1 : viewYear;
    if (nextY > now.getFullYear() || (nextY === now.getFullYear() && nextM > now.getMonth())) return;
    if (viewMonth === 11) { setViewMonth(0); setViewYear((y) => y + 1); }
    else setViewMonth((m) => m + 1);
  };
  const isCurrentMonth = viewYear === now.getFullYear() && viewMonth === now.getMonth();

  const allZero = dayTotals.every((v) => v === 0);

  return (
    <Card style={{ gridColumn: "1 / span 2" }}>
      <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", marginBottom: 16, flexWrap: "wrap", gap: 10 }}>
        <div>
          <SectionLabel>Totale donaties</SectionLabel>
          <div style={{ display: "flex", alignItems: "center", gap: 12, flexWrap: "wrap" }}>
            <StatNum value={eur(curTotal)} size={36} />
            {prevTotal > 0 && <Delta pct={growth} />}
          </div>
          {prevTotal > 0 && (
            <div style={{ fontSize: 12, color: "var(--ink-muted)", marginTop: 4 }}>
              vs. vorige maand ({eur(prevTotal)})
            </div>
          )}
        </div>
        <div style={{ textAlign: "right" }}>
          <SectionLabel>Jaar tot nu</SectionLabel>
          <StatNum value={eur(ytdTotal)} size={22} />
          <div style={{ fontSize: 12, color: "var(--ink-muted)", marginTop: 2 }}>
            Jan – {MONTHS_NL[now.getMonth()]} {now.getFullYear()}
          </div>
        </div>
      </div>

      <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 14 }}>
        <button
          onClick={prev}
          style={{ background: "none", border: "1px solid var(--border)", borderRadius: "var(--radius-sm)", padding: "4px 8px", cursor: "pointer", display: "flex", alignItems: "center" }}
        >
          <ChevronLeft size={14} color="var(--ink-muted)" />
        </button>
        <span style={{ fontSize: 13, fontWeight: 600, color: "var(--ink)", minWidth: 120, textAlign: "center" }}>
          {MONTHS_FULL[viewMonth]} {viewYear}
        </span>
        <button
          onClick={next}
          disabled={isCurrentMonth}
          style={{ background: "none", border: "1px solid var(--border)", borderRadius: "var(--radius-sm)", padding: "4px 8px", cursor: isCurrentMonth ? "not-allowed" : "pointer", display: "flex", alignItems: "center", opacity: isCurrentMonth ? 0.3 : 1 }}
        >
          <ChevronRight size={14} color="var(--ink-muted)" />
        </button>
      </div>

      {allZero ? (
        <div style={{ height: 52, display: "flex", alignItems: "center", justifyContent: "center" }}>
          <span style={{ fontSize: 12, color: "var(--ink-subtle)" }}>Geen data</span>
        </div>
      ) : (
        <div style={{ height: 52 }}>
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={chartData} margin={{ top: 2, right: 2, bottom: 0, left: 2 }}>
              <XAxis dataKey="label" tick={{ fontSize: 10, fill: "var(--ink-subtle)" }} tickLine={false} axisLine={false} interval={4} />
              <Tooltip
                formatter={(v) => [eur(Number(v ?? 0)), "Cumulatief"]}
                contentStyle={{ fontSize: 12, border: "1px solid var(--border)", borderRadius: 8, background: "var(--surface)", color: "var(--ink)", boxShadow: "var(--shadow)" }}
              />
              <Line type="monotone" dataKey="amount" stroke="var(--accent)" strokeWidth={2} dot={false} activeDot={{ r: 4, fill: "var(--accent)" }} />
            </LineChart>
          </ResponsiveContainer>
        </div>
      )}
    </Card>
  );
}

// ── Widget 2: Maandelijkse leden ──────────────────────────────────────────────
function MonthlyMembersWidget() {
  const top5 = [...donors]
    .filter((d) => d.actief)
    .sort((a, b) => b.bedrag_maand - a.bedrag_maand)
    .slice(0, 5);

  return (
    <Card>
      <SectionLabel>Maandelijkse leden</SectionLabel>
      <div style={{ display: "flex", gap: 28, marginBottom: 16 }}>
        <div>
          <StatNum value={String(memberCount())} />
          <div style={{ fontSize: 12, color: "var(--ink-muted)", marginTop: 2 }}>actieve leden</div>
        </div>
        <div>
          <StatNum value={eur(monthlyRecurring())} />
          <div style={{ fontSize: 12, color: "var(--ink-muted)", marginTop: 2 }}>per maand terugkerend</div>
        </div>
      </div>

      <div style={{ borderTop: "1px solid var(--border)", paddingTop: 12 }}>
        <SectionLabel mb={8}>Top 5</SectionLabel>
        {top5.map((d, i) => (
          <div
            key={d.id}
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              padding: "6px 0",
              borderBottom: i < top5.length - 1 ? "1px solid var(--border)" : "none",
            }}
          >
            <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
              <div
                style={{
                  width: 24,
                  height: 24,
                  borderRadius: "50%",
                  background: "var(--accent-light)",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  fontSize: 10,
                  fontWeight: 700,
                  color: "var(--accent-dark)",
                  flexShrink: 0,
                }}
              >
                {i + 1}
              </div>
              <span style={{ fontSize: 13, color: "var(--ink)", fontWeight: 500 }}>{d.naam}</span>
              {d.type === "ondernemer" && <Badge variant="blue">Ondernemer</Badge>}
            </div>
            <span style={{ fontSize: 13, fontWeight: 700, color: "var(--accent-dark)" }}>
              {eur(d.bedrag_maand)}
            </span>
          </div>
        ))}
      </div>
    </Card>
  );
}

// ── Widget 3: Ondernemers ─────────────────────────────────────────────────────
function BusinessDonorsWidget() {
  const bizz = donors.filter((d) => d.type === "ondernemer" && d.actief);
  const totalBiz = bizz.reduce((s, d) => s + d.bedrag_maand, 0);
  const top3 = bizz.slice(0, 3);

  return (
    <Card>
      <SectionLabel>Ondernemers</SectionLabel>
      <div style={{ display: "flex", gap: 28, marginBottom: 16 }}>
        <div>
          <StatNum value={String(businessCount())} />
          <div style={{ fontSize: 12, color: "var(--ink-muted)", marginTop: 2 }}>zakelijke donors</div>
        </div>
        <div>
          <StatNum value={eur(totalBiz)} />
          <div style={{ fontSize: 12, color: "var(--ink-muted)", marginTop: 2 }}>per maand</div>
        </div>
      </div>

      <div style={{ borderTop: "1px solid var(--border)", paddingTop: 12 }}>
        {top3.map((d, i) => (
          <div
            key={d.id}
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              padding: "6px 0",
              borderBottom: i < top3.length - 1 ? "1px solid var(--border)" : "none",
            }}
          >
            <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
              <Badge variant="blue">Ondernemer</Badge>
              <span style={{ fontSize: 13, fontWeight: 500, color: "var(--ink)" }}>{d.naam}</span>
            </div>
            <span style={{ fontSize: 13, fontWeight: 700, color: "var(--accent-dark)" }}>
              {eur(d.bedrag_maand)}
            </span>
          </div>
        ))}
      </div>
    </Card>
  );
}

// ── Widget 4: Aankomende evenementen ──────────────────────────────────────────
function EventsWidget() {
  const today = new Date().toISOString().split("T")[0];
  const upcoming = [...events]
    .filter((e) => e.datum >= today)
    .sort((a, b) => a.datum.localeCompare(b.datum))
    .slice(0, 4);

  const colorMap = {
    religieus: "actief" as const,
    fundraising: "warning" as const,
    algemeen: "grey" as const,
  };

  return (
    <Card>
      <SectionLabel>Aankomende evenementen</SectionLabel>
      {upcoming.length === 0 && (
        <p style={{ fontSize: 13, color: "var(--ink-muted)" }}>Geen aankomende evenementen.</p>
      )}
      {upcoming.map((ev, i) => {
        const monthIdx = Number(ev.datum.split("-")[1]) - 1;
        const day = ev.datum.split("-")[2];
        return (
          <div
            key={ev.id}
            style={{
              display: "flex",
              gap: 14,
              padding: "8px 0",
              borderBottom: i < upcoming.length - 1 ? "1px solid var(--border)" : "none",
              alignItems: "flex-start",
            }}
          >
            <div style={{ width: 36, textAlign: "center", flexShrink: 0 }}>
              <div
                style={{
                  fontSize: 9,
                  fontWeight: 700,
                  color: "var(--ink-subtle)",
                  textTransform: "uppercase",
                  letterSpacing: "0.05em",
                }}
              >
                {MONTHS_NL[monthIdx]}
              </div>
              <div
                style={{
                  fontFamily: "var(--font-serif)",
                  fontSize: 22,
                  lineHeight: 1,
                  color: "var(--ink)",
                }}
              >
                {day}
              </div>
            </div>
            <div style={{ flex: 1 }}>
              <div style={{ fontSize: 13, fontWeight: 600, color: "var(--ink)", marginBottom: 4 }}>
                {ev.titel}
              </div>
              <Badge variant={colorMap[ev.type]}>{ev.type}</Badge>
            </div>
          </div>
        );
      })}
    </Card>
  );
}

// ── Widget 5: Toezeggingen ────────────────────────────────────────────────────
function PromisesWidget() {
  const open = promises.filter((p) => p.status === "open");
  const week = open.filter((p) => p.wanneer === "week");
  const month = open.filter((p) => p.wanneer === "maand");
  const later = open.filter((p) => p.wanneer === "jaar");
  const totalOpen = open.reduce((s, p) => s + p.bedrag, 0);

  const rows = [
    { label: "Deze week", items: week, color: "var(--error)", bg: "var(--error-light)" },
    { label: "Deze maand", items: month, color: "oklch(0.60 0.14 55)", bg: "oklch(0.96 0.04 55)" },
    { label: "Later", items: later, color: "var(--ink-subtle)", bg: "var(--bg)" },
  ];

  return (
    <Card>
      <SectionLabel>Toezeggingen</SectionLabel>
      <StatNum value={eur(totalOpen)} />
      <div style={{ fontSize: 12, color: "var(--ink-muted)", marginTop: 2, marginBottom: 16 }}>
        totaal openstaand
      </div>

      <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
        {rows.map((row) => (
          <div
            key={row.label}
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              padding: "8px 12px",
              borderRadius: "var(--radius-sm)",
              background: row.bg,
            }}
          >
            <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
              <div
                style={{
                  width: 8,
                  height: 8,
                  borderRadius: "50%",
                  background: row.color,
                  flexShrink: 0,
                }}
              />
              <span style={{ fontSize: 13, color: "var(--ink)" }}>{row.label}</span>
            </div>
            <div style={{ display: "flex", gap: 14, alignItems: "center" }}>
              <span style={{ fontSize: 12, color: "var(--ink-muted)" }}>
                {row.items.length} toezeggingen
              </span>
              <span style={{ fontSize: 13, fontWeight: 700, color: row.color }}>
                {eur(row.items.reduce((s, p) => s + p.bedrag, 0))}
              </span>
            </div>
          </div>
        ))}
      </div>
    </Card>
  );
}

// ── Page ──────────────────────────────────────────────────────────────────────
export default function DashboardPage() {
  const today = new Date().toLocaleDateString("nl-NL", {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
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

      {/* Grid — 2 cols, gap 16; TotalDonations spans full width */}
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
        <TotalDonationsWidget />
        <MonthlyMembersWidget />
        <BusinessDonorsWidget />
        <EventsWidget />
        <PromisesWidget />
      </div>
    </AppShell>
  );
}
