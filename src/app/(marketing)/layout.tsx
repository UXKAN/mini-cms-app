import type { Metadata } from "next";
import "./marketing.css";
import { MarketingHeader } from "./_components/MarketingHeader";
import { MarketingFooter } from "./_components/MarketingFooter";
import { HashScroll } from "./_components/HashScroll";
import { nl } from "./_content/nl";

export const metadata: Metadata = {
  metadataBase: new URL(
    process.env.NEXT_PUBLIC_SITE_URL ?? "https://mosqon.com",
  ),
  title: {
    absolute: nl.meta.title,
    template: "%s · Mosqon",
  },
  description: nl.meta.description,
  openGraph: {
    type: "website",
    locale: "nl_NL",
    siteName: "Mosqon",
    title: nl.meta.title,
    description: nl.meta.description,
  },
  twitter: {
    card: "summary_large_image",
  },
};

export default function MarketingLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <div data-marketing-root className="min-h-screen bg-background">
      <HashScroll />
      <a
        href="#inhoud"
        className="sr-only focus:not-sr-only focus:fixed focus:start-4 focus:top-4 focus:z-[100] focus:rounded-md focus:border focus:bg-card focus:px-4 focus:py-2 focus:text-sm focus:font-medium focus:text-foreground"
      >
        {nl.nav.skipLink}
      </a>
      <MarketingHeader content={nl.nav} />
      <main id="inhoud">{children}</main>
      <MarketingFooter
        content={nl.footer}
        navLinks={nl.nav.links}
        contactEmail={nl.demo.email}
      />
    </div>
  );
}
