import {
  Banknote,
  Check,
  CircleCheck,
  CreditCard,
  Landmark,
  Link2,
  QrCode,
  RefreshCw,
  Sparkles,
  TrendingUp,
} from "lucide-react";
import { cn } from "@/lib/utils";
import type { FeatureItem, MarketingContent } from "../_content/types";
import { featureIcons, type FeatureIconName } from "./featureIcons";
import { ArchChip } from "./ornaments/ArchChip";
import { GeoPattern } from "./ornaments/GeoPattern";
import { MockupScaler } from "./MockupScaler";
import { Reveal } from "./Reveal";
import { MockLedenTable } from "./mockups/MockLedenTable";
import { MockImport } from "./mockups/MockImport";
import { smoothLine } from "./mockups/MockDashboard";
import {
  mockAutomation,
  mockChartPoints,
  mockDashboardStats,
  mockDonations,
  mockPledges,
} from "./mockups/mockData";

type Props = {
  content: MarketingContent["features"];
};

function byId(items: FeatureItem[], id: string) {
  const item = items.find((i) => i.id === id);
  if (!item) throw new Error(`Feature-item "${id}" ontbreekt in nl.ts`);
  return item;
}

function TagBadge({ children }: { children: React.ReactNode }) {
  return (
    <span className="mt-6 self-start rounded-full border bg-card px-3 py-1 text-[11px] font-medium text-muted-foreground">
      {children}
    </span>
  );
}

function CardHeader({ item }: { item: FeatureItem }) {
  const Icon = featureIcons[item.icon as FeatureIconName];
  return (
    <>
      <ArchChip className="h-11 w-11 pb-2">
        <Icon className="h-[18px] w-[18px]" strokeWidth={2} />
      </ArchChip>
      <h3 className="mt-4 text-balance text-xl font-semibold leading-snug tracking-tight text-foreground">
        {item.title}
      </h3>
      <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
        {item.body}
      </p>
    </>
  );
}

function MockEmbed({
  label,
  width,
  children,
}: {
  label: string;
  width: number;
  children: React.ReactNode;
}) {
  return (
    <div
      role="img"
      aria-label={label}
      className="min-w-0 overflow-hidden rounded-xl border bg-card"
      style={{ boxShadow: "var(--shadow)" }}
    >
      <div aria-hidden="true">
        <MockupScaler designWidth={width}>{children}</MockupScaler>
      </div>
    </div>
  );
}

const donationIcons: Record<string, typeof Landmark> = {
  Bank: Landmark,
  Contant: Banknote,
  Online: CreditCard,
};

function DonatiesVisual({ label }: { label: string }) {
  return (
    <div
      role="img"
      aria-label={label}
      className="rounded-xl border bg-card p-3"
      style={{ boxShadow: "var(--shadow)" }}
    >
      <div aria-hidden="true">
        {mockDonations.slice(0, 3).map((donation, i) => {
          const Icon = donationIcons[donation.method] ?? Landmark;
          return (
            <div
              key={`${donation.name}-${i}`}
              className={cn(
                "flex items-center gap-2 py-2",
                i > 0 && "border-t",
              )}
            >
              <span className="grid h-7 w-7 shrink-0 place-items-center rounded-full bg-accent-light text-accent-dark">
                <Icon className="h-3.5 w-3.5" strokeWidth={2} />
              </span>
              <span
                className={cn(
                  "min-w-0 flex-1 truncate text-[13px]",
                  donation.name === "Anoniem"
                    ? "italic text-muted-foreground"
                    : "font-medium text-foreground",
                )}
              >
                {donation.name}
              </span>
              <span className="font-serif text-[14px] text-foreground">
                {donation.amount}
              </span>
            </div>
          );
        })}
        <div className="mt-2 flex items-center justify-between border-t pt-2.5">
          <span className="text-[11px] text-muted-foreground">Maandtotaal</span>
          <span className="rounded-full bg-accent-light px-2.5 py-0.5 font-serif text-[13px] text-accent-dark">
            € 3.150
          </span>
        </div>
      </div>
    </div>
  );
}

function ToezeggingenVisual({ label }: { label: string }) {
  return (
    <div
      role="img"
      aria-label={label}
      className="rounded-xl border bg-card p-3.5"
      style={{ boxShadow: "var(--shadow)" }}
    >
      <div aria-hidden="true" className="space-y-3.5">
        {mockPledges.map((pledge) => {
          const pct = Math.round((pledge.paid / pledge.total) * 100);
          return (
            <div key={pledge.name}>
              <div className="flex items-center justify-between gap-2">
                <span className="truncate text-[13px] font-medium text-foreground">
                  {pledge.name}
                </span>
                <span className="whitespace-nowrap text-[11px] text-muted-foreground">
                  € {pledge.paid} van € {pledge.total}
                </span>
              </div>
              <div className="mt-1.5 h-2 overflow-hidden rounded-full bg-muted">
                <div
                  className="mk-bar h-full rounded-full bg-primary"
                  style={{ width: `${pct}%` }}
                />
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

function GiftVisual({ label }: { label: string }) {
  return (
    <div
      role="img"
      aria-label={label}
      className="rounded-xl border bg-card p-3.5"
      style={{ boxShadow: "var(--shadow)" }}
    >
      <div aria-hidden="true">
        <div className="grid grid-cols-2 gap-2">
          <div className="relative rounded-lg border-2 border-primary bg-accent-light/50 px-2.5 py-2">
            <CircleCheck
              className="absolute end-2 top-2 h-3.5 w-3.5 text-accent-dark"
              strokeWidth={2.2}
            />
            <p className="text-[12px] font-semibold text-foreground">
              Periodiek
            </p>
            <p className="text-[10px] text-muted-foreground">€ 25 / maand</p>
          </div>
          <div className="rounded-lg border bg-card px-2.5 py-2">
            <p className="text-[12px] font-semibold text-foreground">
              Eenmalig
            </p>
            <p className="text-[10px] text-muted-foreground">Vrij bedrag</p>
          </div>
        </div>
        <div className="mt-2.5 rounded-lg border border-dashed bg-card px-3 py-1.5">
          <svg
            viewBox="0 0 240 34"
            className="h-8 w-full"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              d="M14 26 C 26 6, 34 6, 40 19 C 45 28, 52 28, 58 17 C 64 7, 70 10, 74 20 C 78 28, 84 26, 92 19 C 104 9, 112 22, 126 20 C 142 18, 148 10, 164 15 C 176 19, 188 17, 200 14"
              fill="none"
              stroke="var(--foreground)"
              strokeWidth="1.6"
              strokeLinecap="round"
            />
          </svg>
        </div>
        <div className="mt-2.5 rounded-lg bg-primary px-3 py-2 text-center text-[12px] font-semibold text-primary-foreground">
          Onderteken &amp; verstuur
        </div>
      </div>
    </div>
  );
}

const RAPPORT_W = 320;
const RAPPORT_H = 96;

function RapportVisual({ label }: { label: string }) {
  const n = mockChartPoints.length;
  const line = smoothLine(
    mockChartPoints.map((p, i) => ({
      x: (i / (n - 1)) * RAPPORT_W,
      y: RAPPORT_H - 6 - (p / 100) * (RAPPORT_H - 18),
    })),
  );
  return (
    <div
      role="img"
      aria-label={label}
      className="rounded-xl border bg-card p-3.5"
      style={{ boxShadow: "var(--shadow)" }}
    >
      <div aria-hidden="true">
        <p className="text-[10px] font-semibold uppercase tracking-widest text-muted-foreground">
          Deze maand
        </p>
        <div className="mt-1 flex items-center gap-2">
          <span className="font-serif text-[24px] leading-none text-foreground">
            {mockDashboardStats.monthTotal}
          </span>
          <span className="flex items-center gap-0.5 rounded-md bg-[var(--success-light)] px-1.5 py-0.5 text-[11px] font-semibold text-[var(--success)]">
            <TrendingUp className="h-3 w-3" strokeWidth={2.5} />
            {mockDashboardStats.monthTrend}
          </span>
        </div>
        <svg
          viewBox={`0 0 ${RAPPORT_W} ${RAPPORT_H}`}
          className="mt-2 h-auto w-full"
          xmlns="http://www.w3.org/2000/svg"
        >
          <defs>
            <linearGradient id="rapport-grad" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="var(--primary)" stopOpacity="0.2" />
              <stop offset="100%" stopColor="var(--primary)" stopOpacity="0" />
            </linearGradient>
          </defs>
          <path
            className="mk-fill"
            d={`${line} L${RAPPORT_W} ${RAPPORT_H} L0 ${RAPPORT_H} Z`}
            fill="url(#rapport-grad)"
          />
          <path
            className="mk-draw"
            d={line}
            fill="none"
            stroke="var(--primary)"
            strokeWidth="2"
            strokeLinecap="round"
          />
        </svg>
      </div>
    </div>
  );
}

const automationChipIcons = [Link2, QrCode, RefreshCw, Landmark] as const;

function AutomationVisual({ label }: { label: string }) {
  return (
    <div
      role="img"
      aria-label={label}
      className="flex h-full min-w-0 flex-col rounded-xl border bg-card p-5"
      style={{ boxShadow: "var(--shadow)" }}
    >
      <div aria-hidden="true" className="flex h-full min-h-0 flex-col">
        <p className="text-[10px] font-semibold uppercase tracking-widest text-muted-foreground">
          Binnengekomen betalingen
        </p>
        <div className="mt-2.5 space-y-2.5">
          {mockAutomation.transactions.map((tx) => (
            <div key={tx.desc} className="rounded-lg border bg-background px-3 py-2.5">
              <div className="flex items-center justify-between gap-2">
                <span className="min-w-0 truncate text-[13px] font-medium text-foreground">
                  {tx.desc}
                </span>
                <span className="whitespace-nowrap font-serif text-[14px] text-foreground">
                  {tx.amount}
                </span>
              </div>
              <span className="mt-1.5 inline-flex items-center gap-1 rounded-full bg-[var(--success-light)] px-2 py-0.5 text-[11px] font-semibold text-[var(--success)]">
                <Check className="h-3 w-3" strokeWidth={3} />
                {tx.match}
              </span>
            </div>
          ))}
        </div>

        <div className="mt-5 flex-1 border-t pt-4">
          <div className="flex items-center gap-1.5">
            <span className="grid h-6 w-6 place-items-center rounded-full bg-accent-light text-accent-dark">
              <Sparkles className="h-3.5 w-3.5" strokeWidth={2.2} />
            </span>
            <p className="text-[13px] font-semibold text-foreground">
              Vraag het Mosqon
            </p>
          </div>
          <p className="ms-auto mt-3 w-fit max-w-[90%] rounded-2xl rounded-ee-md bg-muted px-3.5 py-2 text-[13px] leading-snug text-foreground">
            {mockAutomation.assistant.question}
          </p>
          <p className="mt-2 w-fit max-w-[95%] rounded-2xl rounded-es-md bg-accent-light/60 px-3.5 py-2 text-[13px] leading-relaxed text-foreground">
            {mockAutomation.assistant.answer}
          </p>
        </div>

        <div className="mt-4 flex flex-wrap gap-1.5 border-t pt-3.5">
          {mockAutomation.chips.map((chip, i) => {
            const Icon = automationChipIcons[i] ?? CreditCard;
            return (
              <span
                key={chip}
                className="flex items-center gap-1.5 rounded-full border bg-background px-2.5 py-1 text-[11px] font-medium text-foreground"
              >
                <Icon className="h-3.5 w-3.5 text-accent-dark" strokeWidth={2} />
                {chip}
              </span>
            );
          })}
        </div>
      </div>
    </div>
  );
}

function BentoCard({
  item,
  className,
  visual,
}: {
  item: FeatureItem;
  className?: string;
  visual: React.ReactNode;
}) {
  return (
    <article
      className={cn(
        "mk-lift flex h-full flex-col rounded-3xl border p-6",
        className,
      )}
      style={{ boxShadow: "var(--shadow)" }}
    >
      <CardHeader item={item} />
      <div className="mt-5 flex-1">{visual}</div>
      <TagBadge>{item.tag}</TagBadge>
    </article>
  );
}

function AiPanel({ item }: { item: FeatureItem }) {
  return (
    <article
      className="relative overflow-hidden rounded-3xl border border-[color:var(--primary)]/25 bg-gradient-to-br from-accent-light/70 via-card to-[var(--success-light)]/40 p-6 sm:p-10"
      style={{ boxShadow: "var(--shadow-lg)" }}
    >
      <div
        aria-hidden="true"
        className="absolute inset-0 text-primary opacity-[0.04]"
      >
        <GeoPattern id="ai" className="h-full w-full" />
      </div>
      <div className="relative grid gap-8 lg:grid-cols-2 lg:items-stretch lg:gap-12">
        <div>
          <span className="inline-flex items-center gap-1.5 rounded-full bg-primary px-3.5 py-1.5 text-xs font-semibold text-primary-foreground">
            <Sparkles className="h-3.5 w-3.5" strokeWidth={2.2} aria-hidden="true" />
            Mosqon AI
          </span>
          <h3 className="mt-4 text-balance text-2xl font-semibold leading-snug tracking-tight text-foreground sm:text-3xl">
            {item.title}
          </h3>
          <p className="mt-3 leading-relaxed text-muted-foreground">
            {item.body}
          </p>
          {item.bullets && (
            <div className="mt-6 grid gap-6 sm:grid-cols-2">
              {item.bullets.map((group) => (
                <div key={group.heading ?? group.items[0]}>
                  {group.heading && (
                    <p className="text-[11px] font-semibold uppercase tracking-widest text-accent-dark">
                      {group.heading}
                    </p>
                  )}
                  <ul className="mt-2.5 space-y-2.5">
                    {group.items.map((bullet) => (
                      <li
                        key={bullet}
                        className="flex gap-2 text-sm leading-relaxed text-muted-foreground"
                      >
                        <CircleCheck
                          aria-hidden="true"
                          className="mt-0.5 h-4 w-4 shrink-0 text-accent-dark"
                          strokeWidth={2}
                        />
                        <span>{bullet}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>
          )}
        </div>
        <AutomationVisual label={item.mockAlt} />
      </div>
    </article>
  );
}

export function FeatureBento({ content }: Props) {
  const leden = byId(content.items, "leden");
  const donaties = byId(content.items, "donaties");
  const toezeggingen = byId(content.items, "toezeggingen");
  const anbi = byId(content.items, "anbi");
  const slim = byId(content.items, "slim");
  const importItem = byId(content.items, "import");
  const dashboard = byId(content.items, "dashboard");

  return (
    <div className="mt-16 grid gap-5 lg:grid-cols-6">
      <Reveal className="h-full min-w-0 lg:col-span-4">
        <BentoCard
          item={leden}
          className="bg-card"
          visual={
            <MockEmbed label={leden.mockAlt} width={640}>
              <MockLedenTable />
            </MockEmbed>
          }
        />
      </Reveal>

      <Reveal delay={75} className="h-full min-w-0 lg:col-span-2">
        <BentoCard
          item={donaties}
          className="bg-accent-light/30"
          visual={<DonatiesVisual label={donaties.mockAlt} />}
        />
      </Reveal>

      <Reveal className="h-full min-w-0 lg:col-span-3">
        <BentoCard
          item={toezeggingen}
          className="bg-card"
          visual={<ToezeggingenVisual label={toezeggingen.mockAlt} />}
        />
      </Reveal>

      <Reveal delay={75} className="h-full min-w-0 lg:col-span-3">
        <BentoCard
          item={anbi}
          className="bg-[var(--warn-light)]/40"
          visual={<GiftVisual label={anbi.mockAlt} />}
        />
      </Reveal>

      <Reveal className="min-w-0 lg:col-span-6">
        <AiPanel item={slim} />
      </Reveal>

      <Reveal className="h-full min-w-0 lg:col-span-4">
        <BentoCard
          item={importItem}
          className="bg-[var(--success-light)]/35"
          visual={
            <MockEmbed label={importItem.mockAlt} width={640}>
              <MockImport />
            </MockEmbed>
          }
        />
      </Reveal>

      <Reveal delay={75} className="h-full min-w-0 lg:col-span-2">
        <BentoCard
          item={dashboard}
          className="bg-card"
          visual={<RapportVisual label={dashboard.mockAlt} />}
        />
      </Reveal>

      <div className="grid gap-5 sm:grid-cols-3 lg:col-span-6">
        {content.more.items.map((item, i) => {
          const Icon = featureIcons[item.icon as FeatureIconName];
          return (
            <Reveal key={item.title} delay={i * 75} className="h-full min-w-0">
              <article
                className="mk-lift flex h-full flex-col rounded-3xl border bg-card p-6"
                style={{ boxShadow: "var(--shadow)" }}
              >
                <ArchChip className="h-11 w-11 pb-2">
                  <Icon className="h-[18px] w-[18px]" strokeWidth={2} />
                </ArchChip>
                <h3 className="mt-4 text-balance text-base font-semibold text-foreground">
                  {item.title}
                </h3>
                <p className="mt-1.5 text-sm leading-relaxed text-muted-foreground">
                  {item.body}
                </p>
              </article>
            </Reveal>
          );
        })}
      </div>
    </div>
  );
}
