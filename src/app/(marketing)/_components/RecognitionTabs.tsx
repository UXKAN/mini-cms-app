"use client";

import { useRef, useState } from "react";
import {
  ArrowRight,
  FileSpreadsheet,
  HandCoins,
  MessagesSquare,
  ReceiptText,
} from "lucide-react";
import { cn } from "@/lib/utils";
import type { MarketingContent } from "../_content/types";
import { MockTelefoonDonatie } from "./mockups/MockTelefoonDonatie";
import { mockMembers, mockPledges } from "./mockups/mockData";

type Recognition = MarketingContent["recognition"];
type Scenario = Recognition["scenarios"][number];

const tabIcons = {
  "file-spreadsheet": FileSpreadsheet,
  "hand-coins": HandCoins,
  "messages-square": MessagesSquare,
} as const;

function ChaosChip({ scenario }: { scenario: Scenario }) {
  if (scenario.visual === "leden") {
    return (
      <span className="inline-flex max-w-full items-center gap-2 rounded-lg border bg-background px-3 py-2">
        <FileSpreadsheet
          className="h-4 w-4 shrink-0 text-muted-foreground"
          strokeWidth={2}
          aria-hidden="true"
        />
        <span className="truncate text-[13px] font-medium text-foreground">
          {scenario.chip}
        </span>
      </span>
    );
  }
  if (scenario.visual === "telefoon") {
    return (
      <span className="inline-flex max-w-full items-center gap-2 rounded-lg border border-dashed border-[color:var(--warn)]/50 bg-[var(--warn-light)]/50 px-3 py-2">
        <ReceiptText
          className="h-4 w-4 shrink-0 text-muted-foreground"
          strokeWidth={2}
          aria-hidden="true"
        />
        <span className="truncate text-[13px] font-medium text-foreground">
          {scenario.chip}
        </span>
      </span>
    );
  }
  return (
    <span className="inline-block max-w-full rounded-2xl rounded-es-md bg-muted px-3.5 py-2 text-[13px] leading-snug text-foreground">
      {scenario.chip}
    </span>
  );
}

function LedenMini() {
  return (
    <div
      aria-hidden="true"
      className="w-full max-w-[300px] rounded-xl border bg-card p-3.5"
      style={{ boxShadow: "var(--shadow)" }}
    >
      <div className="flex items-center justify-between">
        <p className="text-[10px] font-semibold uppercase tracking-widest text-muted-foreground">
          Ledenlijst
        </p>
        <span className="rounded-full bg-[var(--success-light)] px-2 py-0.5 text-[10px] font-semibold text-[var(--success)]">
          Actueel
        </span>
      </div>
      <div className="mt-2">
        {mockMembers.slice(0, 3).map((member, i) => (
          <div
            key={member.name}
            className={cn("flex items-center gap-2 py-2", i > 0 && "border-t")}
          >
            <span className="grid h-6 w-6 shrink-0 place-items-center rounded-full bg-accent-light text-[9px] font-bold text-accent-dark">
              {member.name.split(" ").map((part) => part[0]).slice(0, 2).join("")}
            </span>
            <span className="min-w-0 flex-1 truncate text-[12px] font-medium text-foreground">
              {member.name}
            </span>
            <span className="text-[12px] text-muted-foreground">
              {member.amount}
            </span>
          </div>
        ))}
      </div>
      <p className="mt-1.5 border-t pt-2 text-[10px] text-muted-foreground">
        342 leden &amp; donateurs · één versie
      </p>
    </div>
  );
}

function ToezeggingenMini() {
  return (
    <div
      aria-hidden="true"
      className="w-full max-w-[300px] rounded-xl border bg-card p-3.5"
      style={{ boxShadow: "var(--shadow)" }}
    >
      <p className="text-[10px] font-semibold uppercase tracking-widest text-muted-foreground">
        Toezeggingen
      </p>
      <div className="mt-2.5 space-y-3">
        {mockPledges.map((pledge) => {
          const pct = Math.round((pledge.paid / pledge.total) * 100);
          return (
            <div key={pledge.name}>
              <div className="flex items-center justify-between gap-2">
                <span className="truncate text-[12px] font-medium text-foreground">
                  {pledge.name}
                </span>
                <span className="whitespace-nowrap text-[10px] text-muted-foreground">
                  € {pledge.paid} van € {pledge.total}
                </span>
              </div>
              <div className="mt-1 h-1.5 overflow-hidden rounded-full bg-muted">
                <div
                  className="h-full rounded-full bg-primary"
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

function ScenarioVisual({
  scenario,
  phone,
}: {
  scenario: Scenario;
  phone: Recognition["phone"];
}) {
  return (
    <div
      role="img"
      aria-label={scenario.visualAria}
      className="flex min-w-0 items-center justify-center rounded-xl bg-accent-light/30 px-5 py-7"
    >
      {scenario.visual === "telefoon" ? (
        <MockTelefoonDonatie content={phone} />
      ) : scenario.visual === "leden" ? (
        <LedenMini />
      ) : (
        <ToezeggingenMini />
      )}
    </div>
  );
}

function GhostCard({ scenario, side }: { scenario: Scenario; side: "start" | "end" }) {
  return (
    <div
      aria-hidden="true"
      className={cn(
        "pointer-events-none absolute top-1/2 hidden w-72 -translate-y-1/2 opacity-25 xl:block",
        side === "start"
          ? "start-0 -translate-x-[58%]"
          : "end-0 translate-x-[58%]",
      )}
    >
      <div className="rounded-2xl border bg-card p-6" style={{ boxShadow: "var(--shadow)" }}>
        <p className="truncate text-base font-semibold text-foreground">
          {scenario.title}
        </p>
        <div className="mt-3 space-y-2">
          <div className="h-2.5 w-full rounded-full bg-muted" />
          <div className="h-2.5 w-4/5 rounded-full bg-muted" />
          <div className="h-2.5 w-3/5 rounded-full bg-muted" />
        </div>
        <div className="mt-5 h-8 w-24 rounded-full bg-muted" />
      </div>
    </div>
  );
}

type Props = {
  content: Recognition;
};

export function RecognitionTabs({ content }: Props) {
  const [active, setActive] = useState(0);
  const tabRefs = useRef<(HTMLButtonElement | null)[]>([]);
  const count = content.scenarios.length;
  const scenario = content.scenarios[active];
  const prev = content.scenarios[(active + count - 1) % count];
  const next = content.scenarios[(active + 1) % count];

  const focusTab = (index: number) => {
    setActive(index);
    tabRefs.current[index]?.focus();
  };

  const handleKeyDown = (event: React.KeyboardEvent) => {
    if (event.key === "ArrowRight") focusTab((active + 1) % count);
    else if (event.key === "ArrowLeft") focusTab((active + count - 1) % count);
    else if (event.key === "Home") focusTab(0);
    else if (event.key === "End") focusTab(count - 1);
    else return;
    event.preventDefault();
  };

  return (
    <div className="mt-10">
      <div
        role="tablist"
        aria-label={content.eyebrow}
        onKeyDown={handleKeyDown}
        className="flex flex-wrap items-center justify-center gap-x-2 gap-y-1 border-b"
      >
        {content.scenarios.map((item, i) => {
          const Icon = tabIcons[item.icon];
          const selected = i === active;
          return (
            <button
              key={item.id}
              ref={(el) => {
                tabRefs.current[i] = el;
              }}
              role="tab"
              id={`herken-tab-${item.id}`}
              aria-selected={selected}
              aria-controls={`herken-paneel-${item.id}`}
              tabIndex={selected ? 0 : -1}
              onClick={() => setActive(i)}
              className={cn(
                "-mb-px flex min-h-[44px] items-center gap-2 border-b-2 px-4 py-2.5 text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring motion-reduce:transition-none",
                selected
                  ? "border-[color:var(--primary)] text-foreground"
                  : "border-transparent text-muted-foreground hover:text-foreground",
              )}
            >
              <Icon className="h-4 w-4" strokeWidth={2} aria-hidden="true" />
              {item.tabLabel}
            </button>
          );
        })}
      </div>

      <div className="relative mt-10 overflow-x-clip">
        <GhostCard scenario={prev} side="start" />
        <GhostCard scenario={next} side="end" />

        <div
          key={scenario.id}
          role="tabpanel"
          id={`herken-paneel-${scenario.id}`}
          aria-labelledby={`herken-tab-${scenario.id}`}
          className="mk-panel-in relative mx-auto max-w-4xl rounded-3xl border bg-card p-7 sm:p-10"
          style={{ boxShadow: "var(--shadow-lg)" }}
        >
          <div className="grid items-center gap-8 lg:min-h-[300px] lg:grid-cols-[1.1fr_1fr] lg:gap-12">
            <div className="min-w-0">
              <ChaosChip scenario={scenario} />
              <h3 className="mt-4 text-balance text-2xl font-semibold leading-snug tracking-tight text-foreground">
                {scenario.title}
              </h3>
              <p className="mt-3 leading-relaxed text-muted-foreground">
                {scenario.body}
              </p>
              <a
                href="#functies"
                className="mk-link mt-5 inline-flex items-center gap-1.5 rounded-sm text-sm font-medium text-accent-dark focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
              >
                {content.linkLabel}
                <ArrowRight className="h-4 w-4" strokeWidth={2} aria-hidden="true" />
              </a>
            </div>
            <ScenarioVisual scenario={scenario} phone={content.phone} />
          </div>
        </div>
      </div>
    </div>
  );
}
