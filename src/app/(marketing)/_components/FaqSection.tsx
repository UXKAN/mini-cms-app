import { ChevronDown, MessageCircle } from "lucide-react";
import type { MarketingContent } from "../_content/types";
import { Reveal } from "./Reveal";

type Props = {
  content: MarketingContent["faq"];
  whatsapp: MarketingContent["demo"]["whatsapp"];
};

export function FaqSection({ content, whatsapp }: Props) {
  const whatsappHref = whatsapp.enabled
    ? `https://wa.me/${whatsapp.number}?text=${encodeURIComponent(whatsapp.message)}`
    : null;
  return (
    <section id="faq" className="mx-auto mt-28 max-w-6xl scroll-mt-28 px-6">
      <div className="grid gap-10 lg:grid-cols-[1fr_1.5fr] lg:gap-16">
        <div>
          <p className="text-[11px] font-semibold uppercase tracking-widest text-accent-dark">
            {content.eyebrow}
          </p>
          <h2 className="mt-3 text-balance text-3xl font-semibold leading-tight tracking-tight text-foreground sm:text-4xl">
            {content.title}
          </h2>
          <p className="mt-4 leading-relaxed text-muted-foreground">
            {content.intro}
          </p>
          <div
            className="mt-8 rounded-2xl border bg-card p-6"
            style={{ boxShadow: "var(--shadow)" }}
          >
            <h3 className="text-base font-semibold text-foreground">
              {content.contactHeading}
            </h3>
            <p className="mt-1.5 text-sm leading-relaxed text-muted-foreground">
              {content.contactBody}
            </p>
            <a
              href={`mailto:${content.contactEmail}`}
              className="mk-link mt-4 inline-block rounded-sm text-sm font-medium text-accent-dark focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
            >
              {content.contactEmail}
            </a>
            {whatsappHref && (
              <p className="mt-2.5 flex items-center gap-1.5 text-sm">
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
                  {whatsapp.linkText}
                </a>
              </p>
            )}
          </div>
        </div>

        <Reveal>
          <div className="space-y-3">
            {content.items.map((item) => (
              <details
                key={item.q}
                className="group rounded-2xl border bg-card px-6"
                style={{ boxShadow: "var(--shadow)" }}
              >
                <summary className="flex cursor-pointer list-none items-center justify-between gap-4 rounded-2xl py-4 text-start text-base font-medium text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring [&::-webkit-details-marker]:hidden">
                  {item.q}
                  <ChevronDown
                    aria-hidden="true"
                    className="h-4 w-4 shrink-0 text-muted-foreground transition-transform group-open:rotate-180 motion-reduce:transition-none"
                    strokeWidth={2}
                  />
                </summary>
                <p className="pb-5 text-sm leading-relaxed text-muted-foreground">
                  {item.a}
                </p>
              </details>
            ))}
          </div>
        </Reveal>
      </div>
    </section>
  );
}
