type Props = {
  rows?: number;
  columns?: number;
};

export function TableLoadingState({ rows = 5, columns = 5 }: Props) {
  return (
    <div role="status" aria-label="Bezig met laden" className="space-y-2 py-2">
      {Array.from({ length: rows }).map((_, r) => (
        <div key={r} className="flex gap-3">
          {Array.from({ length: columns }).map((__, c) => (
            <div
              key={c}
              className="h-4 bg-stone-200 rounded animate-pulse"
              style={{ flex: c === 0 ? "0 0 24px" : 1 }}
            />
          ))}
        </div>
      ))}
    </div>
  );
}
