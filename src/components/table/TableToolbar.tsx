type Props = {
  left: React.ReactNode;
  right: React.ReactNode;
};

export function TableToolbar({ left, right }: Props) {
  return (
    <div className="flex flex-col sm:flex-row gap-3 sm:items-center sm:justify-between mb-3">
      <div className="flex-1 max-w-sm">{left}</div>
      <div className="flex flex-wrap gap-2 sm:flex-nowrap">{right}</div>
    </div>
  );
}
