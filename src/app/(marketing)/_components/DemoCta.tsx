import { CalendarDays, CircleCheck, MessageCircle } from "lucide-react";
import type { MarketingContent } from "../_content/types";
import { GeoPattern } from "./ornaments/GeoPattern";
import { DemoForm } from "./DemoForm";
import { ShareButton } from "./ShareButton";
import { Reveal } from "./Reveal";

type Props = {
  content: MarketingContent["demo"];
};

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? "https://mosqon.com";

export function DemoCta({ content }: Props) {
  const whatsappHref = content.whatsapp.enabled
    ? `https://wa.me/${content.whatsapp.number}?text=${encodeURIComponent(content.whatsapp.message)}`
    : null;

  return (
    <section id="demo" className="relative mt-28 scroll-mt-28 overflow-hidden">
      <div
        aria-hidden="true"
        className="absolute inset-x-0 bottom-0 h-full bg-gradient-to-b from-transparent via-accent-light/30 to-accent-light/70"
      />
      <div
        aria-hidden="true"
        className="absolute inset-x-0 bottom-0 h-full text-primary opacity-[0.05]"
      >
        <GeoPattern id="demo" fade="top" className="h-full w-full" />
      </div>

      <div className="relative mx-auto max-w-6xl px-6 py-20">
        <Reveal>
          <div
            className="rounded-3xl border bg-card p-8 sm:p-12"
            style={{ boxShadow: "var(--shadow-lg)" }}
          >
            <div className="grid gap-10 lg:grid-cols-2 lg:gap-14">
              <div>
                <p className="text-[11px] font-semibold uppercase tracking-widest text-accent-dark">
                  {content.eyebrow}
                </p>
                <h2 className="mt-3 text-balance text-3xl font-semibold leading-tight tracking-tight text-foreground sm:text-4xl">
                  {content.title}
                </h2>
                <p className="mt-4 leading-relaxed text-muted-foreground">
                  {content.body}
                </p>

                <ul className="mt-6 space-y-2.5">
                  {content.expectations.map((expectation) => (
                    <li
                      key={expectation}
                      className="flex gap-2 text-sm leading-relaxed text-muted-foreground"
                    >
                      <CircleCheck
                        aria-hidden="true"
                        className="mt-0.5 h-4 w-4 shrink-0 text-accent-dark"
                        strokeWidth={2}
                      />
                      <span>{expectation}</span>
                    </li>
                  ))}
                </ul>

                {/* TODO(owner): Calendly-embed hier plaatsen zodra het account
                    is gekoppeld; deze placeholder-kaart dan vervangen. */}
                <div className="mt-7 flex items-center gap-3 rounded-2xl border border-dashed p-5 text-sm text-muted-foreground">
                  <CalendarDays
                    aria-hidden="true"
                    className="h-5 w-5 shrink-0 text-accent-dark"
                    strokeWidth={2}
                  />
                  {content.calendlyPlaceholder}
                </div>

                <p className="mt-5 text-sm text-muted-foreground">
                  {content.mailNote}{" "}
                  <a
                    href={`mailto:${content.email}`}
                    className="mk-link rounded-sm font-medium text-accent-dark focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                  >
                    {content.email}
                  </a>
                </p>
                {whatsappHref && (
                  <p className="mt-2 flex items-center gap-1.5 text-sm text-muted-foreground">
                    <MessageCircle
                      aria-hidden="true"
                      className="h-4 w-4 shrink-0 text-accent-dark"
                      strokeWidth={2}
                    />
                    <a
                      href={whatsappHref}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="mk-link rounded-sm font-medium text-accent-dark focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                    >
                      {content.whatsapp.linkText}
                    </a>
                  </p>
                )}

                <div className="mt-7 border-t pt-6">
                  <p className="text-sm leading-relaxed text-muted-foreground">
                    {content.share.prompt}
                  </p>
                  <div className="mt-3">
                    <ShareButton
                      label={content.share.buttonLabel}
                      title={content.share.title}
                      text={content.share.text}
                      url={`${siteUrl}/`}
                    />
                  </div>
                </div>
              </div>
              <DemoForm content={content.form} email={content.email} />
            </div>
          </div>
        </Reveal>
      </div>
    </section>
  );
}
