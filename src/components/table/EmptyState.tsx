import type { ReactNode } from "react";

type Props = {
  icon?: ReactNode;
  title: string;
  description?: string;
  actions?: ReactNode;
};

export function EmptyState({ icon, title, description, actions }: Props) {
  return (
    <div className="rounded-lg border border-dashed border-stone-300 bg-stone-50 px-6 py-16 text-center">
      {icon && (
        <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-stone-100 text-stone-600">
          {icon}
        </div>
      )}
      <h3 className="font-serif text-2xl text-foreground">{title}</h3>
      {description && (
        <p className="text-muted-foreground text-sm mt-2 max-w-md mx-auto">
          {description}
        </p>
      )}
      {actions && <div className="mt-5 flex justify-center gap-2 flex-wrap">{actions}</div>}
    </div>
  );
}
