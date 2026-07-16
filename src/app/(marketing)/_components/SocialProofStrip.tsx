import { CircleCheck } from "lucide-react";
import type { MarketingContent } from "../_content/types";

type Props = {
  content: MarketingContent["socialProof"];
};

export function SocialProofStrip({ content }: Props) {
  return (
    <section aria-label={content.ariaLabel} className="border-y bg-card/70">
      <div className="mx-auto grid max-w-6xl gap-4 px-6 py-8 sm:grid-cols-3">
        {content.claims.map((claim) => (
          <p
            key={claim}
            className="flex items-center justify-center gap-2.5 text-center text-sm font-medium text-foreground"
          >
            <CircleCheck
              aria-hidden="true"
              className="h-4 w-4 shrink-0 text-accent-dark"
              strokeWidth={2}
            />
            {claim}
          </p>
        ))}
      </div>
      {/* TODO(owner): zodra er echte moskee-logo's/aantallen zijn:
          showLogos aanzetten in _content/nl.ts en hier een logostrook renderen. */}
    </section>
  );
}
