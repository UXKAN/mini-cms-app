import { Lock } from "lucide-react";
import { cn } from "@/lib/utils";

type Props = {
  url: string;
  label: string;
  children: React.ReactNode;
  className?: string;
};

/**
 * Gestileerd browservenster rond een mockup. De inhoud is fictief en puur
 * illustratief: één Nederlands aria-label beschrijft het geheel, de
 * binnenkant is verborgen voor screenreaders.
 */
export function BrowserFrame({ url, label, children, className }: Props) {
  return (
    <div
      role="img"
      aria-label={label}
      className={cn(
        "overflow-hidden rounded-[22px] border bg-card",
        className,
      )}
      style={{ boxShadow: "var(--shadow-lg)" }}
    >
      <div
        aria-hidden="true"
        className="relative flex items-center gap-1.5 border-b bg-background/70 px-4 py-2.5"
      >
        <span className="h-2.5 w-2.5 rounded-full bg-border" />
        <span className="h-2.5 w-2.5 rounded-full bg-border" />
        <span className="h-2.5 w-2.5 rounded-full bg-border" />
        <span className="absolute inset-x-0 mx-auto flex w-fit items-center gap-1 rounded-full border bg-card px-3.5 py-1 text-[11px] leading-none text-muted-foreground">
          <Lock className="h-2.5 w-2.5" strokeWidth={2.2} />
          {url}
        </span>
      </div>
      <div aria-hidden="true">{children}</div>
    </div>
  );
}
