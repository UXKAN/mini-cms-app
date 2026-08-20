"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import {
  AlertCircle,
  ChevronLeft,
  ChevronRight,
  TrendingDown,
  TrendingUp,
  Unlink,
} from "lucide-react";
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  CartesianGrid,
  Tooltip,
  XAxis,
} from "recharts";
import { supabase } from "../lib/supabase";
import { useOrg } from "../lib/orgContext";
import { toLocalISODate } from "../lib/formatters";
import { remainingAmount } from "../lib/payments";
import { fetchPaidByKey } from "../lib/matchedDonations";
import AppShell from "../components/AppShell";
import { PageHeader } from "../components/PageHeader";
import { StatCard } from "@/components/table/StatCard";
import { Button } from "@/components/ui/button";

/* ─── helpers ─────────────────────────────────────── */

function formatEuro(n: number, decimals = 0) {
  return n.toLocaleString("nl-NL", {
    style: "currency",
    currency: "EUR",
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
  });
}

const NL_MONTHS = [
  "januari","februari","maart","april","mei","juni",
  "juli","augustus","september","oktober","november","december",
];

function nlMonthLabel(date: Date) {
  const m = NL_MONTHS[date.getMonth()];
  return `${m.charAt(0).toUpperCase()}${m.slice(1)} ${date.getFullYear()}`;
}

const PANEL_LABEL =
  "text-[10px] font-semibold uppercase tracking-[0.12em] text-muted-foreground";
const PANEL =
  "rounded-lg bg-card p-5 shadow-[var(--shadow)]";
const METRIC_VALUE =
  "text-[26px] font-bold leading-none tracking-[-0.02em] text-foreground";

/* ─── types ────────────────────────────────────────── */

interface ChartPoint { label: string; amount: number }
interface TopDonor { id: string; name: string; type: string; amount: number }

/* ─── building blocks ──────────────────────────────── */

function Metric({ value, label }: { value: string; label: string }) {
  return (
    <div>
      <p className={METRIC_VALUE}>{value}</p>
      <p className="mt-1.5 text-xs text-muted-foreground">{label}</p>
    </div>
  );
}

function TaskCard({
  icon,
  title,
  hint,
  href,
}: {
  icon: React.ReactNode;
  title: string;
  hint: string;
  href: string;
}) {
  return (
    <div className="flex items-center gap-3 rounded-lg bg-card p-4 shadow-[var(--shadow)]">
      <div className="grid h-9 w-9 shrink-0 place-items-center rounded-full bg-[var(--warn-light)] text-[var(--warn)]">
        {icon}
      </div>
      <div className="min-w-0 flex-1">
        <p className="text-sm font-bold text-foreground">{title}</p>
        <p className="text-xs text-muted-foreground">{hint}</p>
      </div>
      <Button variant="secondary" size="sm" asChild>
        <Link href={href} aria-label={`Bekijk: ${title}`}>
          Bekijk
        </Link>
      </Button>
    </div>
  );
}

/* ─── main page ────────────────────────────────────── */

export default function DashboardPage() {
  return (
    <AppShell>
      <DashboardInner />
    </AppShell>
  );
}

function DashboardInner() {
  const org = useOrg();

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

  // Toezeggingen state
  const [toezeggingenCount, setToezeggingenCount] = useState<number | null>(null);
  const [toezeggingenTotal, setToezeggingenTotal] = useState<number | null>(null);

  // Periodieke giften state
  const [periodiekeCount, setPeriodiekeCount] = useState<number | null>(null);
  const [periodiekeTotal, setPeriodiekeTotal] = useState<number | null>(null);
  const [unpaidThisMonthCount, setUnpaidThisMonthCount] = useState<number | null>(null);
  const [unpaidThisMonthTotal, setUnpaidThisMonthTotal] = useState<number | null>(null);

  // Niet-gematcht state
  const [unmatchedCount, setUnmatchedCount] = useState<number | null>(null);

  // Loading
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [org.id, chartMonth]);

  async function load() {
    setLoading(true);

    const year = chartMonth.getFullYear();
    const month = chartMonth.getMonth();

    // Current month range
    const monthStart = toLocalISODate(new Date(year, month, 1));
    const monthEnd = toLocalISODate(new Date(year, month + 1, 0));
    // Prev month range
    const prevStart = toLocalISODate(new Date(year, month - 1, 1));
    const prevEnd = toLocalISODate(new Date(year, month, 0));
    // Year range
    const yearStart = `${year}-01-01`;

    const [
      { data: monthDons },
      { data: prevDons },
      { data: yearDons },
      { count: memCount },
      { data: allMembers },
      { data: openPledges },
      { data: unpaidAgreements },
      { data: periodiekeAkten },
      { data: monthDonsLinked },
      { count: unmatched },
      matched,
    ] = await Promise.all([
      supabase.from("donations").select("amount, donated_at")
        .eq("org_id", org.id)
        .gte("donated_at", monthStart).lte("donated_at", monthEnd),
      supabase.from("donations").select("amount")
        .eq("org_id", org.id)
        .gte("donated_at", prevStart).lte("donated_at", prevEnd),
      supabase.from("donations").select("amount")
        .eq("org_id", org.id)
        .gte("donated_at", yearStart),
      supabase.from("members").select("*", { count: "exact", head: true })
        .eq("org_id", org.id).eq("status", "active"),
      supabase.from("members").select("id, name, first_name, last_name, monthly_amount, membership_type, status")
        .eq("org_id", org.id).eq("status", "active"),
      supabase.from("pledges").select("id, amount")
        .eq("org_id", org.id).in("status", ["open", "partial"]),
      supabase.from("gift_agreements").select("id, bedrag_eenmalig")
        .eq("organization_id", org.id)
        .eq("type", "eenmalige").in("payment_status", ["unpaid", "partial"]),
      supabase.from("gift_agreements").select("id, member_id, bedrag_per_maand")
        .eq("organization_id", org.id)
        .eq("type", "periodieke").eq("agreement_status", "signed"),
      supabase.from("donations").select("gift_agreement_id")
        .eq("org_id", org.id)
        .gte("donated_at", monthStart).lte("donated_at", monthEnd)
        .not("gift_agreement_id", "is", null),
      supabase.from("donations").select("*", { count: "exact", head: true })
        .eq("org_id", org.id)
        .is("pledge_id", null).is("gift_agreement_id", null).is("member_id", null),
      fetchPaidByKey(org.id),
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

    // Aggregeer akte-bedragen per member (kan meerdere akten per persoon zijn)
    const akteBedragPerMember = new Map<string, number>();
    (periodiekeAkten ?? []).forEach((a) => {
      if (!a.member_id) return;
      const cur = akteBedragPerMember.get(a.member_id) ?? 0;
      akteBedragPerMember.set(a.member_id, cur + Number(a.bedrag_per_maand ?? 0));
    });

    // Recurring per member: max(akte-bedrag, monthly_amount). Voorkomt dubbele telling.
    const memberAmounts = new Map<string, number>();
    (allMembers ?? []).forEach((m) => {
      const fromAkte = akteBedragPerMember.get(m.id) ?? 0;
      const fromMember = Number(m.monthly_amount ?? 0);
      memberAmounts.set(m.id, fromAkte > 0 ? fromAkte : fromMember);
    });

    const recurring = Array.from(memberAmounts.values()).reduce(
      (s, v) => s + v,
      0
    );
    setMonthlyRecurring(recurring);

    // Top 5: members met hoogste recurring bedrag (uit beide bronnen)
    const donors: TopDonor[] = (allMembers ?? [])
      .map((m) => ({
        id: m.id,
        name:
          [m.first_name, m.last_name].filter(Boolean).join(" ").trim() ||
          m.name ||
          "—",
        type: m.membership_type ?? "Lid",
        amount: memberAmounts.get(m.id) ?? 0,
      }))
      .filter((d) => d.amount > 0)
      .sort((a, b) => b.amount - a.amount)
      .slice(0, 5);
    setTopDonors(donors);

    // Restbedragen (deelbetalingen afgetrokken), consistent met /toezeggingen.
    // Bij een fout valt dit terug op de vólle bedragen — een gedeeltelijk
    // opgehaalde map zou een cijfer tonen dat niet vol en niet correct is.
    const paidByKey = matched.error
      ? new Map<string, number>()
      : matched.paidByKey;
    const pledgeTotal = (openPledges ?? []).reduce(
      (s, p) =>
        s +
        remainingAmount(
          Number(p.amount ?? 0),
          paidByKey.get(`pledge:${p.id}`) ?? 0
        ),
      0
    );
    const agreementTotal = (unpaidAgreements ?? []).reduce(
      (s, a) =>
        s +
        remainingAmount(
          Number(a.bedrag_eenmalig ?? 0),
          paidByKey.get(`gift_agreement:${a.id}`) ?? 0
        ),
      0
    );
    setToezeggingenCount(
      (openPledges?.length ?? 0) + (unpaidAgreements?.length ?? 0)
    );
    setToezeggingenTotal(pledgeTotal + agreementTotal);

    // Periodieke verwacht/maand: som van actieve periodieke akten
    const periodiekeCnt = periodiekeAkten?.length ?? 0;
    const periodiekeTot = (periodiekeAkten ?? []).reduce(
      (s, a) => s + Number(a.bedrag_per_maand ?? 0),
      0
    );
    setPeriodiekeCount(periodiekeCnt);
    setPeriodiekeTotal(periodiekeTot);

    // Niet-betaald deze maand: periodieke akten zonder donation in lopende maand
    const paidIds = new Set(
      (monthDonsLinked ?? [])
        .map((d) => d.gift_agreement_id)
        .filter((x): x is string => Boolean(x))
    );
    const unpaidThisMonth = (periodiekeAkten ?? []).filter(
      (a) => !paidIds.has(a.id)
    );
    setUnpaidThisMonthCount(unpaidThisMonth.length);
    setUnpaidThisMonthTotal(
      unpaidThisMonth.reduce(
        (s, a) => s + Number(a.bedrag_per_maand ?? 0),
        0
      )
    );

    // Niet-gematcht donaties (geen pledge, gift_agreement of member gekoppeld)
    setUnmatchedCount(unmatched ?? 0);

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

  const today = new Date().toLocaleDateString("nl-NL", {
    weekday: "long", year: "numeric", month: "long", day: "numeric",
  });

  const selectedMonth = nlMonthLabel(chartMonth);
  const yearRange = `Jan – ${nlMonthLabel(new Date())}`;

  const unpaidCount = unpaidThisMonthCount ?? 0;
  const unmatchedTasks = unmatchedCount ?? 0;
  const hasTasks = unpaidCount > 0 || unmatchedTasks > 0;

  return (
    <>
      <PageHeader title="Dashboard" subtitle={`Overzicht · ${today}`} />

      {/* ── Statgrid ── */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <div className="rounded-lg bg-[var(--accent-light)] p-5">
          <p className={PANEL_LABEL}>Totale donaties</p>
          <div className="mt-1 flex flex-wrap items-center gap-2">
            <span className="text-[26px] font-bold leading-none tracking-[-0.02em] text-primary">
              {loading ? "…" : formatEuro(monthTotal)}
            </span>
            {!loading && pctChange !== null && (
              <span
                className={[
                  "inline-flex items-center gap-1 rounded-full bg-card px-2 py-0.5 text-[11px] font-semibold",
                  trending ? "text-[var(--success)]" : "text-destructive",
                ].join(" ")}
              >
                {trending ? <TrendingUp size={11} /> : <TrendingDown size={11} />}
                {Math.abs(pctChange).toFixed(1)}%
              </span>
            )}
          </div>
          <p className="mt-1.5 text-xs text-muted-foreground">
            {selectedMonth}
            {!loading && prevMonthTotal > 0 && ` · vs. vorige maand ${formatEuro(prevMonthTotal)}`}
          </p>
        </div>

        <StatCard
          label="Jaar tot nu"
          value={loading ? "…" : formatEuro(yearTotal)}
          hint={yearRange}
        />

        <StatCard
          label="Periodiek verwacht / maand"
          value={loading ? "…" : formatEuro(periodiekeTotal ?? 0)}
          hint={`${periodiekeCount ?? 0} actieve ${periodiekeCount === 1 ? "akte" : "akten"}`}
        />

        <StatCard
          label="Niet betaald deze maand"
          tone="warn"
          value={loading ? "…" : formatEuro(unpaidThisMonthTotal ?? 0)}
          hint={`${unpaidCount} ${unpaidCount === 1 ? "akte" : "akten"} zonder ontvangen donatie`}
        />
      </div>

      {/* ── Grafiekkaart ── */}
      <div className={`mt-4 ${PANEL}`}>
        <div className="flex flex-wrap items-center justify-between gap-3">
          <p className={PANEL_LABEL}>Donaties per dag (cumulatief)</p>
          <div className="flex items-center gap-1">
            <Button
              variant="ghost"
              size="icon"
              aria-label="Vorige maand"
              onClick={prevMonth}
              className="h-8 w-8 text-muted-foreground"
            >
              <ChevronLeft />
            </Button>
            <span className="min-w-[110px] text-center text-sm font-medium text-foreground">
              {selectedMonth}
            </span>
            <Button
              variant="ghost"
              size="icon"
              aria-label="Volgende maand"
              onClick={nextMonth}
              disabled={isCurrentMonth}
              className="h-8 w-8 text-muted-foreground"
            >
              <ChevronRight />
            </Button>
          </div>
        </div>

        <div className="mt-5 h-[160px]">
          {chartData.length > 0 ? (
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={chartData} margin={{ top: 4, right: 4, bottom: 0, left: 4 }}>
                <CartesianGrid stroke="var(--border)" vertical={false} />
                <XAxis
                  dataKey="label"
                  tick={{ fontSize: 10, fill: "var(--muted-foreground)" }}
                  tickLine={false}
                  axisLine={false}
                  interval={4}
                />
                <Tooltip
                  formatter={(v) => [formatEuro(Number(v ?? 0)), "Cumulatief"]}
                  contentStyle={{
                    fontSize: 12,
                    border: "1px solid var(--border)",
                    borderRadius: "var(--radius)",
                    background: "var(--card)",
                    color: "var(--foreground)",
                    boxShadow: "var(--shadow-lg)",
                  }}
                />
                <Area
                  type="monotone"
                  dataKey="amount"
                  stroke="var(--primary)"
                  strokeWidth={2}
                  fill="var(--primary)"
                  fillOpacity={0.12}
                  dot={false}
                  activeDot={{ r: 4, fill: "var(--primary)" }}
                />
              </AreaChart>
            </ResponsiveContainer>
          ) : (
            <div className="flex h-full items-center justify-center text-sm text-muted-foreground">
              Geen donaties in deze maand
            </div>
          )}
        </div>
      </div>

      {/* ── Taakkaarten ── */}
      {!loading && hasTasks && (
        <div className="mt-4 grid gap-4 sm:grid-cols-2">
          {unpaidCount > 0 && (
            <TaskCard
              icon={<AlertCircle size={16} />}
              title={`${unpaidCount} ${unpaidCount === 1 ? "akte" : "akten"} niet betaald · ${formatEuro(unpaidThisMonthTotal ?? 0)}`}
              hint="Bekijk wie er nog openstaat"
              href="/toezeggingen"
            />
          )}
          {unmatchedTasks > 0 && (
            <TaskCard
              icon={<Unlink size={16} />}
              title={`${unmatchedTasks} ${unmatchedTasks === 1 ? "donatie" : "donaties"} zonder koppeling`}
              hint="Bekijk welke donaties nog los staan"
              href="/donations"
            />
          )}
        </div>
      )}

      {/* ── Leden + toezeggingen ── */}
      <div className="mt-4 grid gap-4 lg:grid-cols-2">
        <div className={PANEL}>
          <p className={PANEL_LABEL}>Leden &amp; donateurs</p>
          <div className="mt-4 flex flex-wrap gap-10">
            <Metric
              value={loading ? "…" : String(memberCount ?? 0)}
              label="actieve leden"
            />
            <Metric
              value={loading ? "…" : formatEuro(monthlyRecurring ?? 0)}
              label="per maand terugkerend"
            />
          </div>

          {topDonors.length > 0 && (
            <>
              <p className={`mt-6 ${PANEL_LABEL}`}>Top 5</p>
              <ul className="mt-2 divide-y divide-border">
                {topDonors.map((d, i) => (
                  <li key={d.id} className="flex items-center justify-between gap-3 py-2.5">
                    <div className="flex min-w-0 items-center gap-2.5">
                      <span className="grid h-6 w-6 shrink-0 place-items-center rounded-full bg-[var(--accent-light)] text-[11px] font-bold text-[var(--accent-dark)]">
                        {i + 1}
                      </span>
                      <span className="truncate text-sm font-medium text-foreground">
                        {d.name}
                      </span>
                      {d.type && (
                        <span className="shrink-0 rounded-full bg-[var(--accent-light)] px-2 py-0.5 text-[11px] font-medium capitalize text-[var(--accent-dark)]">
                          {d.type}
                        </span>
                      )}
                    </div>
                    <span className="shrink-0 text-sm font-semibold text-foreground">
                      {formatEuro(d.amount)}
                    </span>
                  </li>
                ))}
              </ul>
            </>
          )}

          {topDonors.length === 0 && !loading && (
            <div className="mt-5">
              <p className="text-sm text-muted-foreground">
                Nog geen leden met maandbedrag.
              </p>
              <Button variant="secondary" size="sm" asChild className="mt-3">
                <Link href="/members">Voeg leden toe</Link>
              </Button>
            </div>
          )}
        </div>

        <div className={PANEL}>
          <p className={PANEL_LABEL}>Openstaande toezeggingen</p>
          {toezeggingenCount === 0 ? (
            <div className="mt-5">
              <p className="text-sm text-muted-foreground">
                Geen openstaande toezeggingen.
              </p>
              <Button variant="secondary" size="sm" asChild className="mt-3">
                <Link href="/toezeggingen">Nieuwe toezegging registreren</Link>
              </Button>
            </div>
          ) : (
            <>
              <div className="mt-4 flex flex-wrap gap-10">
                <Metric
                  value={loading ? "…" : String(toezeggingenCount ?? 0)}
                  label="stuks open"
                />
                <Metric
                  value={loading ? "…" : formatEuro(toezeggingenTotal ?? 0)}
                  label="totaal verwacht"
                />
              </div>
              <Button variant="secondary" size="sm" asChild className="mt-5">
                <Link href="/toezeggingen">Bekijk alle</Link>
              </Button>
            </>
          )}
        </div>
      </div>
    </>
  );
}
