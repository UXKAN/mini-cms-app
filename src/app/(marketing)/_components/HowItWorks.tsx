import { Check, FileSpreadsheet, UserPlus } from "lucide-react";
import type { MarketingContent } from "../_content/types";
import { SectionHeading } from "./SectionHeading";
import { Reveal } from "./Reveal";

type Props = {
  content: MarketingContent["howItWorks"];
};

function StepVisual({ step }: { step: number }) {
  if (step === 0) {
    return (
      <div className="flex h-full flex-col justify-center gap-2 p-4">
        <div className="flex items-center gap-2">
          <span className="grid h-7 w-7 place-items-center rounded-full bg-accent-light text-accent-dark">
            <UserPlus className="h-3.5 w-3.5" strokeWidth={2} />
          </span>
          <div className="h-2 w-24 rounded-full bg-muted" />
        </div>
        <div className="h-2 w-32 rounded-full bg-muted" />
        <div className="mt-1 h-6 w-24 rounded-full bg-primary/90" />
      </div>
    );
  }
  if (step === 1) {
    return (
      <div className="flex h-full flex-col justify-center gap-2.5 p-4">
        <div className="flex items-center gap-2 text-[10px] font-medium text-foreground">
          <FileSpreadsheet className="h-4 w-4 text-accent-dark" strokeWidth={2} />
          ledenlijst-2026.xlsx
        </div>
        <div className="h-1.5 overflow-hidden rounded-full bg-muted">
          <div className="h-full w-[70%] rounded-full bg-primary" />
        </div>
        <p className="text-[9px] text-muted-foreground">
          22 rijen gevonden · kolommen gekoppeld
        </p>
      </div>
    );
  }
  return (
    <div className="flex h-full flex-col justify-center gap-2.5 p-4">
      <div className="flex -space-x-1.5">
        {["AY", "FD", "SB"].map((initials) => (
          <span
            key={initials}
            className="grid h-7 w-7 place-items-center rounded-full border-2 border-card bg-accent-light text-[8px] font-bold text-accent-dark"
          >
            {initials}
          </span>
        ))}
      </div>
      <p className="flex items-center gap-1 text-[9px] text-muted-foreground">
        <Check className="h-3 w-3 text-[var(--success)]" strokeWidth={2.5} />
        Donatie geregistreerd door commissielid
      </p>
    </div>
  );
}

export function HowItWorks({ content }: Props) {
  return (
    <section
      id="hoe-het-werkt"
      className="mt-28 scroll-mt-28 border-y bg-card/70 py-20"
    >
      <div className="mx-auto max-w-6xl px-6">
        <SectionHeading
          eyebrow={content.eyebrow}
          title={content.title}
          intro={content.intro}
        />
        <ol role="list" className="mt-14 grid list-none gap-5 md:grid-cols-3">
          {content.steps.map((step, i) => (
            <li key={step.title} className="h-full">
              <Reveal delay={i * 100} className="h-full">
                <div
                  className="mk-lift flex h-full flex-col rounded-2xl border bg-card p-6"
                  style={{ boxShadow: "var(--shadow)" }}
                >
                  <div
                    aria-hidden="true"
                    className="h-28 overflow-hidden rounded-xl border bg-background"
                  >
                    <StepVisual step={i} />
                  </div>
                  <div className="mt-5 flex items-start gap-3">
                    <span
                      aria-hidden="true"
                      className="inline-flex h-9 w-9 shrink-0 items-end justify-center rounded-t-full rounded-b-[6px] bg-accent-light pb-1.5 text-sm font-bold text-accent-dark"
                    >
                      {i + 1}
                    </span>
                    <div>
                      <h3 className="text-balance text-lg font-semibold tracking-tight text-foreground">
                        {step.title}
                      </h3>
                      <p className="mt-1.5 text-sm leading-relaxed text-muted-foreground">
                        {step.body}
                      </p>
                    </div>
                  </div>
                </div>
              </Reveal>
            </li>
          ))}
        </ol>
      </div>
    </section>
  );
}
