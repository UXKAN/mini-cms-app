type Props = {
  rows?: number;
  columns?: number;
};

export function TableLoadingState({ rows = 6, columns = 5 }: Props) {
  return (
    <div role="status" aria-label="Bezig met laden" className="space-y-3 py-2">
      {Array.from({ length: rows }).map((_, r) => (
        <div key={r} className="flex items-center gap-3">
          {Array.from({ length: columns }).map((__, c) =>
            c === 0 ? (
              <div
                key={c}
                className="h-8 w-8 shrink-0 rounded-full bg-[var(--surface-zone)] motion-safe:animate-pulse"
              />
            ) : (
              <div
                key={c}
                className="h-3 flex-1 rounded-full bg-[var(--surface-zone)] motion-safe:animate-pulse"
                style={{ maxWidth: `${Math.max(20, 70 - r * 4)}%` }}
              />
            ),
          )}
        </div>
      ))}
    </div>
  );
}
