import { cn } from "@/lib/utils";

type Props = {
  eyebrow: string;
  title: string;
  intro?: string;
  className?: string;
};

export function SectionHeading({ eyebrow, title, intro, className }: Props) {
  return (
    <div className={cn("mx-auto max-w-2xl text-center", className)}>
      <p className="text-[11px] font-semibold uppercase tracking-widest text-accent-dark">
        {eyebrow}
      </p>
      <h2 className="mt-3 text-balance text-3xl font-semibold leading-tight tracking-tight text-foreground sm:text-4xl">
        {title}
      </h2>
      {intro && (
        <p className="mt-4 text-base leading-relaxed text-muted-foreground">
          {intro}
        </p>
      )}
    </div>
  );
}
