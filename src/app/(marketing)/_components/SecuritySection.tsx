import {
  Database,
  Download,
  Lock,
  Mail,
  Shield,
  ShieldCheck,
} from "lucide-react";
import type { MarketingContent } from "../_content/types";
import { SectionHeading } from "./SectionHeading";
import { ArchChip } from "./ornaments/ArchChip";
import { Reveal } from "./Reveal";

type Props = {
  content: MarketingContent["security"];
};

const cardIcons = [Shield, Lock, Mail, Download];

export function SecuritySection({ content }: Props) {
  const gatedCards = [
    { ...content.gated.euRegion, icon: Database },
    { ...content.gated.avg, icon: ShieldCheck },
  ].filter((card) => card.enabled);

  return (
    <section id="veiligheid" className="mx-auto mt-28 max-w-6xl scroll-mt-28 px-6">
      <SectionHeading
        eyebrow={content.eyebrow}
        title={content.title}
        intro={content.intro}
      />
      <div className="mt-14 grid gap-5 sm:grid-cols-2">
        {content.cards.map((card, i) => {
          const Icon = cardIcons[i] ?? Shield;
          return (
            <Reveal key={card.title} delay={i * 75} className="h-full">
              <div
                className="mk-lift flex h-full gap-4 rounded-2xl border bg-card p-6"
                style={{ boxShadow: "var(--shadow)" }}
              >
                <ArchChip className="h-11 w-11 shrink-0 pb-2">
                  <Icon className="h-[18px] w-[18px]" strokeWidth={2} />
                </ArchChip>
                <div>
                  <h3 className="text-base font-semibold text-foreground">
                    {card.title}
                  </h3>
                  <p className="mt-1.5 text-sm leading-relaxed text-muted-foreground">
                    {card.body}
                  </p>
                </div>
              </div>
            </Reveal>
          );
        })}
        {gatedCards.map((card) => (
          <Reveal key={card.title} className="h-full">
            <div
              className="mk-lift flex h-full gap-4 rounded-2xl border bg-card p-6"
              style={{ boxShadow: "var(--shadow)" }}
            >
              <ArchChip className="h-11 w-11 shrink-0 pb-2">
                <card.icon className="h-[18px] w-[18px]" strokeWidth={2} />
              </ArchChip>
              <div>
                <h3 className="text-base font-semibold text-foreground">
                  {card.title}
                </h3>
                <p className="mt-1.5 text-sm leading-relaxed text-muted-foreground">
                  {card.body}
                </p>
              </div>
            </div>
          </Reveal>
        ))}
      </div>
    </section>
  );
}
