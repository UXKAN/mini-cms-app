import {
  Bell,
  FileCheck,
  Heart,
  LayoutDashboard,
  Shield,
  TrendingUp,
  Users,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { mockChartPoints, mockDashboardStats, mockMosque } from "./mockData";

const CHART_W = 560;
const CHART_H = 140;

function chartCoords() {
  const n = mockChartPoints.length;
  return mockChartPoints.map((p, i) => ({
    x: (i / (n - 1)) * CHART_W,
    y: CHART_H - 8 - (p / 100) * (CHART_H - 24),
  }));
}

export function smoothLine(points: { x: number; y: number }[]) {
  if (points.length < 2) return "";
  let d = `M${points[0].x.toFixed(1)} ${points[0].y.toFixed(1)}`;
  for (let i = 1; i < points.length; i++) {
    const prev = points[i - 1];
    const curr = points[i];
    const cx = ((prev.x + curr.x) / 2).toFixed(1);
    d += ` C${cx} ${prev.y.toFixed(1)}, ${cx} ${curr.y.toFixed(1)}, ${curr.x.toFixed(1)} ${curr.y.toFixed(1)}`;
  }
  return d;
}

const navItems = [
  { icon: LayoutDashboard, label: "Dashboard", active: true },
  { icon: Users, label: "Leden", active: false },
  { icon: Heart, label: "Donaties", active: false },
  { icon: FileCheck, label: "Toezeggingen", active: false },
];

const tabs = ["Donaties", "Leden", "Toezeggingen"];
const ranges = ["1M", "6M", "1J"];

export function MockDashboard({ id = "hero" }: { id?: string }) {
  const gradientId = `mockdash-grad-${id}`;
  const coords = chartCoords();
  const line = smoothLine(coords);
  return (
    <div className="flex w-[760px] bg-background text-start">
      <aside className="w-[150px] shrink-0 border-e bg-card p-3">
        <div className="flex items-center gap-2 px-1">
          <Shield className="h-4 w-4 text-primary" strokeWidth={2.2} />
          <div>
            <p className="text-[10px] font-bold leading-tight text-foreground">
              {mockMosque}
            </p>
            <p className="text-[7px] font-semibold uppercase tracking-widest text-muted-foreground">
              ANBI-dashboard
            </p>
          </div>
        </div>
        <div className="mt-3 rounded-[7px] bg-primary px-2 py-1.5 text-center text-[9px] font-semibold text-primary-foreground">
          + Nieuwe donatie
        </div>
        <ul className="mt-3 space-y-0.5">
          {navItems.map((item) => (
            <li
              key={item.label}
              className={cn(
                "flex items-center gap-2 rounded-[7px] px-2 py-1.5 text-[10px] font-medium",
                item.active
                  ? "bg-accent-light text-accent-dark"
                  : "text-foreground",
              )}
            >
              <item.icon className="h-3 w-3" strokeWidth={2} />
              {item.label}
            </li>
          ))}
        </ul>
      </aside>

      <div className="min-w-0 flex-1 p-5">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="grid h-7 w-7 place-items-center rounded-full bg-accent-light text-[9px] font-bold text-accent-dark">
              AN
            </span>
            <div>
              <p className="text-[8px] leading-tight text-muted-foreground">
                Welkom terug
              </p>
              <p className="text-[11px] font-semibold leading-tight text-foreground">
                {mockMosque}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="rounded-[7px] bg-primary px-2.5 py-1.5 text-[9px] font-semibold text-primary-foreground">
              + Nieuwe donatie
            </span>
            <span className="rounded-[7px] border bg-card px-2.5 py-1.5 text-[9px] font-medium text-foreground">
              Rapport
            </span>
            <span className="grid h-[26px] w-[26px] place-items-center rounded-full border bg-card text-foreground">
              <Bell className="h-3 w-3" strokeWidth={2} />
            </span>
          </div>
        </div>

        <div
          className="mt-3 rounded-[12px] border bg-card p-4"
          style={{ boxShadow: "var(--shadow)" }}
        >
          <div className="flex items-start justify-between gap-4">
            <div>
              <p className="text-[8px] font-semibold uppercase tracking-widest text-muted-foreground">
                Totale donaties
              </p>
              <div className="mt-1 flex items-center gap-2">
                <span className="font-serif text-[26px] leading-none text-foreground">
                  {mockDashboardStats.monthTotal}
                </span>
                <span className="flex items-center gap-0.5 rounded-md bg-[var(--success-light)] px-1.5 py-0.5 text-[9px] font-semibold text-[var(--success)]">
                  <TrendingUp className="h-2.5 w-2.5" strokeWidth={2.5} />
                  {mockDashboardStats.monthTrend}
                </span>
              </div>
              <p className="mt-1 text-[8px] text-muted-foreground">
                {mockDashboardStats.monthCompare}
              </p>
            </div>
            <div className="text-end">
              <p className="text-[8px] font-semibold uppercase tracking-widest text-muted-foreground">
                Dit jaar
              </p>
              <p className="mt-1 font-serif text-[18px] leading-none text-foreground">
                {mockDashboardStats.yearTotal}
              </p>
              <p className="mt-1 text-[8px] text-muted-foreground">
                {mockDashboardStats.yearLabel}
              </p>
            </div>
          </div>

          <div className="mt-3 flex items-center justify-between">
            <div className="flex items-center gap-1">
              {tabs.map((tab, i) => (
                <span
                  key={tab}
                  className={cn(
                    "rounded-full px-2.5 py-1 text-[9px] font-medium",
                    i === 0
                      ? "bg-accent-light text-accent-dark"
                      : "text-muted-foreground",
                  )}
                >
                  {tab}
                </span>
              ))}
            </div>
            <div className="flex items-center gap-1">
              {ranges.map((range, i) => (
                <span
                  key={range}
                  className={cn(
                    "rounded-md px-2 py-1 text-[8px] font-semibold",
                    i === 0
                      ? "bg-foreground text-background"
                      : "text-muted-foreground",
                  )}
                >
                  {range}
                </span>
              ))}
            </div>
          </div>

          <svg
            viewBox={`0 0 ${CHART_W} ${CHART_H}`}
            className="mt-2 h-auto w-full"
            xmlns="http://www.w3.org/2000/svg"
          >
            <defs>
              <linearGradient id={gradientId} x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="var(--primary)" stopOpacity="0.22" />
                <stop offset="100%" stopColor="var(--primary)" stopOpacity="0" />
              </linearGradient>
            </defs>
            {[0.28, 0.55, 0.82].map((f) => (
              <line
                key={f}
                x1="0"
                x2={CHART_W}
                y1={CHART_H * f}
                y2={CHART_H * f}
                stroke="var(--border)"
                strokeWidth="1"
                strokeDasharray="3 5"
              />
            ))}
            <path
              d={`${line} L${CHART_W} ${CHART_H} L0 ${CHART_H} Z`}
              fill={`url(#${gradientId})`}
            />
            <path
              d={line}
              fill="none"
              stroke="var(--primary)"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
            <circle
              cx={coords[coords.length - 1].x - 4}
              cy={coords[coords.length - 1].y + 1}
              r="3.5"
              fill="var(--primary)"
              stroke="var(--card)"
              strokeWidth="1.5"
            />
          </svg>
        </div>

        <div className="mt-3 grid grid-cols-3 gap-3">
          {mockDashboardStats.cards.map((card) => (
            <div
              key={card.label}
              className="rounded-[10px] border bg-card p-3"
              style={{ boxShadow: "var(--shadow)" }}
            >
              <p className="text-[7.5px] font-semibold uppercase tracking-widest text-muted-foreground">
                {card.label}
              </p>
              <p className="mt-1.5 font-serif text-[17px] leading-none text-foreground">
                {card.value}
              </p>
              <p className="mt-1 text-[8px] text-muted-foreground">{card.hint}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
