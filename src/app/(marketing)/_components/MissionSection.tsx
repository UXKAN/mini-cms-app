import Image from "next/image";
import type { MarketingContent } from "../_content/types";
import { GeoPattern } from "./ornaments/GeoPattern";
import { Reveal } from "./Reveal";

type Props = {
  content: MarketingContent["mission"];
};

export function MissionSection({ content }: Props) {
  return (
    <section className="mx-auto mt-28 max-w-6xl px-6">
      <Reveal>
        <div className="grid items-center gap-10 lg:grid-cols-2 lg:gap-16">
          <div className="relative mx-auto w-full max-w-md">
            <div
              aria-hidden="true"
              className="absolute -bottom-8 -start-8 h-44 w-44 text-primary opacity-[0.08]"
            >
              <GeoPattern id="mission" className="h-full w-full" />
            </div>
            {/* Mihrab-boogvorm, zelfde vormtaal als de ArchChip-iconen. */}
            <div
              className="relative aspect-[4/5] overflow-hidden rounded-t-full rounded-b-3xl border bg-accent-light/40"
              style={{ boxShadow: "var(--shadow-lg)" }}
            >
              <Image
                src="/images/gemeenschap.jpg"
                alt={content.imageAlt}
                fill
                className="object-cover"
                sizes="(min-width: 1024px) 28rem, 90vw"
              />
            </div>
          </div>

          <div>
            <p className="text-[11px] font-semibold uppercase tracking-widest text-accent-dark">
              {content.eyebrow}
            </p>
            <h2 className="mt-3 text-balance text-3xl font-semibold leading-tight tracking-tight text-foreground sm:text-4xl">
              {content.title}
            </h2>
            <p className="mt-5 text-lg leading-relaxed text-muted-foreground">
              {content.body}
            </p>
          </div>
        </div>
      </Reveal>
    </section>
  );
}
