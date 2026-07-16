import Link from "next/link";
import { MosqonLogo } from "@/components/MosqonLogo";
import { Button } from "@/components/ui/button";
import type { MarketingContent } from "../_content/types";

type Props = {
  content: MarketingContent["nav"];
};

export function MarketingHeader({ content }: Props) {
  return (
    <header className="sticky top-3 z-50 px-4 sm:top-4 sm:px-6">
      <div
        className="mx-auto flex max-w-5xl items-center justify-between gap-3 rounded-full border bg-card py-2 ps-5 pe-2"
        style={{ boxShadow: "var(--shadow)" }}
      >
        <Link
          href="/"
          className="flex items-center rounded-full py-1 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
        >
          <MosqonLogo className="h-6 w-auto text-foreground" />
        </Link>

        <nav aria-label={content.ariaLabel} className="hidden lg:block">
          <ul className="flex items-center gap-1">
            {content.links.map((link) => (
              <li key={link.href}>
                <a
                  href={link.href}
                  className="rounded-full px-3.5 py-2 text-[13px] font-medium text-foreground transition-colors hover:bg-accent-light hover:text-accent-dark focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                >
                  {link.label}
                </a>
              </li>
            ))}
          </ul>
        </nav>

        <div className="flex items-center gap-1.5">
          <Button
            asChild
            variant="ghost"
            className="hidden rounded-full text-[13px] sm:inline-flex"
          >
            <Link href="/login">{content.login}</Link>
          </Button>
          <Button asChild className="rounded-full text-[13px]">
            <Link href="/#demo">{content.cta}</Link>
          </Button>
        </div>
      </div>
    </header>
  );
}
