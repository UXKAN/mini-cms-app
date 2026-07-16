import Link from "next/link";
import { MosqonLogo } from "@/components/MosqonLogo";
import type { MarketingContent } from "../_content/types";

type Props = {
  content: MarketingContent["footer"];
  navLinks: MarketingContent["nav"]["links"];
  contactEmail: string;
};

export function MarketingFooter({ content, navLinks, contactEmail }: Props) {
  const linkClass =
    "mk-link text-sm text-background/80 hover:text-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-background/60 rounded-sm";

  return (
    <footer className="mt-24 bg-foreground text-background">
      <div className="mx-auto grid max-w-6xl gap-10 px-6 py-14 sm:grid-cols-2 lg:grid-cols-4">
        <div>
          <MosqonLogo className="h-6 w-auto text-background" />
          <p className="mt-3 text-sm text-background/80">{content.tagline}</p>
          <p className="mt-2 text-xs text-background/60">
            {content.languagesNote}
          </p>
        </div>

        <nav aria-label={content.productHeading}>
          <h2 className="text-[11px] font-semibold uppercase tracking-widest text-background/60">
            {content.productHeading}
          </h2>
          <ul className="mt-4 space-y-2.5">
            {navLinks.map((link) => (
              <li key={link.href}>
                <a href={link.href} className={linkClass}>
                  {link.label}
                </a>
              </li>
            ))}
          </ul>
        </nav>

        <nav aria-label={content.legalHeading}>
          <h2 className="text-[11px] font-semibold uppercase tracking-widest text-background/60">
            {content.legalHeading}
          </h2>
          <ul className="mt-4 space-y-2.5">
            {content.legalLinks.map((link) => (
              <li key={link.href}>
                <Link href={link.href} className={linkClass}>
                  {link.label}
                </Link>
              </li>
            ))}
          </ul>
        </nav>

        <div>
          <h2 className="text-[11px] font-semibold uppercase tracking-widest text-background/60">
            {content.contactHeading}
          </h2>
          <p className="mt-4">
            <a href={`mailto:${contactEmail}`} className={linkClass}>
              {contactEmail}
            </a>
          </p>
        </div>
      </div>

      <div className="border-t border-background/15">
        <p className="mx-auto max-w-6xl px-6 py-6 text-xs text-background/60">
          {content.copyright}
        </p>
      </div>
    </footer>
  );
}
