import { cn } from "@/lib/utils";

type Props = {
  children: React.ReactNode;
  className?: string;
};

/**
 * Icoon-houder in spitsboogvorm (mihrab-boog): rond aan de bovenzijde,
 * recht aan de onderzijde. Subtiele islamitische knipoog i.p.v. een cirkel.
 */
export function ArchChip({ children, className }: Props) {
  return (
    <span
      aria-hidden="true"
      className={cn(
        "inline-flex h-12 w-12 items-end justify-center pb-2.5",
        "bg-accent-light text-accent-dark",
        "rounded-t-full rounded-b-[7px]",
        className,
      )}
    >
      {children}
    </span>
  );
}
