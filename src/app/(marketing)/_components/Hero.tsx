import { ArrowUpRight, Sparkles, Users } from "lucide-react";
import { Button } from "@/components/ui/button";
import type { MarketingContent } from "../_content/types";
import { GeoPattern } from "./ornaments/GeoPattern";
import { MockupScaler } from "./MockupScaler";
import { BrowserFrame } from "./mockups/BrowserFrame";
import { MockDashboard, smoothLine } from "./mockups/MockDashboard";
import { mockFloatingCards } from "./mockups/mockData";

type Props = {
  content: MarketingContent["hero"];
};

function sparkPath() {
  const points = mockFloatingCards.matching.spark;
  const max = Math.max(...points);
  const coords = points.map((p, i) => ({
    x: (i / (points.length - 1)) * 160,
    y: 26 - (p / max) * 22,
  }));
  return smoothLine(coords);
}

export function Hero({ content }: Props) {
  const spark = sparkPath();
  return (
    <section id="top" className="relative overflow-hidden">
      <div
        aria-hidden="true"
        className="absolute inset-x-0 top-0 h-[580px] bg-gradient-to-b from-accent-light/70 via-accent-light/25 to-transparent"
      />
      <div
        aria-hidden="true"
        className="absolute inset-x-0 top-0 h-[580px] text-primary opacity-[0.05]"
      >
        <GeoPattern id="hero" fade="bottom" className="h-full w-full" />
      </div>

      <div className="relative mx-auto max-w-6xl px-6 pb-8 pt-14 text-center sm:pt-20">
        <p className="text-[11px] font-semibold uppercase tracking-widest text-accent-dark">
          {content.eyebrow}
        </p>
        <h1 className="mx-auto mt-4 max-w-3xl text-balance text-4xl font-semibold leading-[1.08] tracking-tight text-foreground sm:text-5xl lg:text-[56px]">
          {content.title}
        </h1>
        <p className="mx-auto mt-5 max-w-2xl text-base leading-relaxed text-muted-foreground sm:text-lg">
          {content.subtitle}
        </p>

        <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
          <Button asChild size="lg" className="rounded-full px-7">
            <a href="#demo">{content.ctaPrimary}</a>
          </Button>
          <Button
            asChild
            size="lg"
            variant="outline"
            className="rounded-full bg-card/60 px-7"
          >
            <a href="#functies">{content.ctaSecondary}</a>
          </Button>
        </div>

        <div className="mt-12 sm:mt-16">
          <MockupScaler designWidth={880} className="mx-auto max-w-[880px]">
            <div className="relative w-[880px] px-[60px] pb-10 pt-3 text-start">
              <BrowserFrame
                url="app.mosqon.com/dashboard"
                label={content.mockAlt}
              >
                <MockDashboard />
              </BrowserFrame>

              <div
                aria-hidden="true"
                className="absolute end-0 top-12 w-[180px] rounded-2xl border bg-card p-4"
                style={{ boxShadow: "var(--shadow-lg)" }}
              >
                <span className="grid h-8 w-8 place-items-center rounded-full bg-accent-light text-accent-dark">
                  <Users className="h-4 w-4" strokeWidth={2} />
                </span>
                <p className="mt-2.5 text-[9px] font-semibold uppercase tracking-widest text-muted-foreground">
                  {mockFloatingCards.members.label}
                </p>
                <p className="mt-1 font-serif text-[26px] leading-none text-foreground">
                  {mockFloatingCards.members.value}
                </p>
                <p className="mt-1.5 flex items-center gap-0.5 text-[10px] font-semibold text-[var(--success)]">
                  {mockFloatingCards.members.trend}
                  <ArrowUpRight className="h-3 w-3" strokeWidth={2.5} />
                </p>
              </div>

              <div
                aria-hidden="true"
                className="absolute bottom-0 start-0 w-[200px] rounded-2xl border bg-card p-4"
                style={{ boxShadow: "var(--shadow-lg)" }}
              >
                <div className="flex items-center gap-1.5">
                  <span className="grid h-6 w-6 shrink-0 place-items-center rounded-full bg-accent-light text-accent-dark">
                    <Sparkles className="h-3 w-3" strokeWidth={2} />
                  </span>
                  <p className="text-[10px] font-semibold text-foreground">
                    {mockFloatingCards.matching.label}
                  </p>
                </div>
                <p className="mt-2 font-serif text-[22px] leading-none text-foreground">
                  {mockFloatingCards.matching.value}
                </p>
                <p className="mt-1 text-[9px] text-muted-foreground">
                  {mockFloatingCards.matching.hint}
                </p>
                <svg
                  viewBox="0 0 160 28"
                  className="mt-2 h-7 w-full"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <defs>
                    <linearGradient id="spark-grad" x1="0" y1="0" x2="0" y2="1">
                      <stop
                        offset="0%"
                        stopColor="var(--primary)"
                        stopOpacity="0.25"
                      />
                      <stop
                        offset="100%"
                        stopColor="var(--primary)"
                        stopOpacity="0"
                      />
                    </linearGradient>
                  </defs>
                  <path d={`${spark} L160 28 L0 28 Z`} fill="url(#spark-grad)" />
                  <path
                    d={spark}
                    fill="none"
                    stroke="var(--primary)"
                    strokeWidth="2"
                    strokeLinecap="round"
                  />
                </svg>
              </div>
            </div>
          </MockupScaler>
        </div>
      </div>
    </section>
  );
}
