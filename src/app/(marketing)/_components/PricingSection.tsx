import { CircleCheck, Gift } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import type { MarketingContent } from "../_content/types";
import { SectionHeading } from "./SectionHeading";
import { Reveal } from "./Reveal";

type Props = {
  content: MarketingContent["pricing"];
};

export function PricingSection({ content }: Props) {
  return (
    <section id="prijzen" className="mx-auto mt-28 max-w-6xl scroll-mt-28 px-6">
      <SectionHeading
        eyebrow={content.eyebrow}
        title={content.title}
        intro={content.intro}
      />

      <div className="mt-12 grid items-stretch gap-5 lg:grid-cols-3">
        {content.tiers.map((tier, i) => (
          <Reveal key={tier.name} delay={i * 100} className="h-full min-w-0">
            <div
              className={cn(
                "mk-lift relative flex h-full flex-col rounded-3xl border bg-card p-7",
                tier.highlighted &&
                  "border-[color:var(--primary)] bg-accent-light/25",
              )}
              style={{
                boxShadow: tier.highlighted
                  ? "var(--shadow-lg)"
                  : "var(--shadow)",
              }}
            >
              {tier.badge && (
                <span className="absolute -top-3 left-1/2 -translate-x-1/2 whitespace-nowrap rounded-full bg-primary px-3.5 py-1 text-[11px] font-semibold text-primary-foreground">
                  {tier.badge}
                </span>
              )}

              <h3 className="text-balance text-lg font-semibold text-foreground">
                {tier.name}
              </h3>
              <p className="mt-1 min-h-[2.5rem] text-sm leading-snug text-muted-foreground">
                {tier.audience}
              </p>

              <p className="mt-5 flex items-baseline gap-1.5">
                <span className="text-4xl font-semibold tracking-tight text-foreground">
                  {tier.price}
                </span>
                <span className="text-sm text-muted-foreground">
                  {tier.period}
                </span>
              </p>
              <p className="mt-1.5 text-[13px] text-accent-dark">
                {tier.yearly}
              </p>

              <ul className="mt-6 flex-1 space-y-2.5 border-t pt-6">
                {tier.features.map((feature) => (
                  <li
                    key={feature}
                    className="flex gap-2 text-sm leading-relaxed text-muted-foreground"
                  >
                    <CircleCheck
                      aria-hidden="true"
                      className="mt-0.5 h-4 w-4 shrink-0 text-accent-dark"
                      strokeWidth={2}
                    />
                    <span>{feature}</span>
                  </li>
                ))}
              </ul>

              <Button
                asChild
                variant={tier.highlighted ? "default" : "outline"}
                className="mt-8 w-full rounded-full"
              >
                <a href="#demo">{tier.cta}</a>
              </Button>
            </div>
          </Reveal>
        ))}
      </div>

      {/* TODO(owner): dit introductieaanbod verwijderen zodra de
          introductieperiode voorbij is (ook in _content/nl.ts). */}
      <Reveal>
        <div
          className="mt-6 flex flex-col items-center gap-3 rounded-2xl border border-[color:var(--primary)]/25 bg-accent-light/30 px-6 py-5 text-center sm:flex-row sm:text-start"
          style={{ boxShadow: "var(--shadow)" }}
        >
          <span
            aria-hidden="true"
            className="grid h-10 w-10 shrink-0 place-items-center rounded-full bg-primary text-primary-foreground"
          >
            <Gift className="h-5 w-5" strokeWidth={2} />
          </span>
          <p className="text-sm leading-relaxed text-foreground">
            <span className="font-semibold">{content.promo.title}: </span>
            {content.promo.body}
          </p>
        </div>
      </Reveal>

      <p className="mx-auto mt-8 max-w-2xl text-center text-sm leading-relaxed text-muted-foreground">
        {content.footnote}
      </p>
    </section>
  );
}
