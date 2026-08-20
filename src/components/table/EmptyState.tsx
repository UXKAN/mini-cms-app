import type { ReactNode } from "react";

type Props = {
  icon?: ReactNode;
  title: string;
  description?: string;
  actions?: ReactNode;
};

export function EmptyState({ icon, title, description, actions }: Props) {
  return (
    <div className="rounded-lg border border-dashed border-border bg-muted px-6 py-16 text-center">
      {icon && (
        <div className="mx-auto mb-4 h-12 w-12 rounded-full bg-[var(--accent-light)] text-primary grid place-items-center">
          {icon}
        </div>
      )}
      <h3 className="text-[15px] font-bold text-foreground">{title}</h3>
      {description && (
        <p className="text-muted-foreground text-sm mt-2 max-w-md mx-auto">
          {description}
        </p>
      )}
      {actions && <div className="mt-5 flex justify-center gap-2 flex-wrap">{actions}</div>}
    </div>
  );
}
