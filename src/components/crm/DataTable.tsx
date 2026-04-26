"use client";

import { useMemo, useState } from "react";

export type DataTableColumn<T> = {
  key: string;
  label: string;
  /** Default true. Set false to disable click-to-sort. */
  sortable?: boolean;
  /** Custom renderer for the cell. Defaults to (row as Record<string, unknown>)[key]. */
  render?: (row: T) => React.ReactNode;
  /** Custom value getter for sorting. Defaults to (row as Record<string, unknown>)[key]. */
  sortValue?: (row: T) => string | number | Date | null | undefined;
  /** If true, allow text wrapping in this column. Default: nowrap. */
  wrap?: boolean;
  /** Optional explicit width (e.g. "120px", "20%"). */
  width?: string;
  /** Text alignment. Default: left. */
  align?: "left" | "right" | "center";
};

type DataTableProps<T> = {
  columns: DataTableColumn<T>[];
  rows: T[];
  onRowClick?: (row: T) => void;
  defaultSort?: { key: string; dir: "asc" | "desc" } | null;
  /** Text shown when rows is empty after filtering. */
  emptyMessage?: string;
  /** Optional rowKey getter — defaults to (row as { id: string }).id. */
  rowKey?: (row: T, index: number) => string;
};

export function DataTable<T>({
  columns,
  rows,
  onRowClick,
  defaultSort = null,
  emptyMessage = "Geen resultaten gevonden",
  rowKey,
}: DataTableProps<T>) {
  const [sortKey, setSortKey] = useState<string | null>(defaultSort?.key ?? null);
  const [sortDir, setSortDir] = useState<"asc" | "desc">(defaultSort?.dir ?? "asc");

  const toggleSort = (col: DataTableColumn<T>) => {
    if (col.sortable === false) return;
    if (sortKey === col.key) {
      setSortDir((d) => (d === "asc" ? "desc" : "asc"));
    } else {
      setSortKey(col.key);
      const sample = col.sortValue
        ? col.sortValue(rows[0] as T)
        : (rows[0] as unknown as Record<string, unknown>)?.[col.key];
      setSortDir(typeof sample === "number" ? "desc" : "asc");
    }
  };

  const sortedRows = useMemo(() => {
    if (!sortKey) return rows;
    const col = columns.find((c) => c.key === sortKey);
    if (!col) return rows;
    const getVal = (row: T): string | number => {
      const raw = col.sortValue
        ? col.sortValue(row)
        : (row as unknown as Record<string, unknown>)[sortKey];
      if (raw == null) return "";
      if (typeof raw === "string") return raw.toLowerCase();
      if (raw instanceof Date) return raw.getTime();
      return raw as number;
    };
    return [...rows].sort((a, b) => {
      const va = getVal(a);
      const vb = getVal(b);
      if (va < vb) return sortDir === "asc" ? -1 : 1;
      if (va > vb) return sortDir === "asc" ? 1 : -1;
      return 0;
    });
  }, [rows, sortKey, sortDir, columns]);

  const getKey = (row: T, i: number): string => {
    if (rowKey) return rowKey(row, i);
    const id = (row as unknown as { id?: string | number }).id;
    return id != null ? String(id) : String(i);
  };

  return (
    <div style={{ overflowX: "auto" }}>
      <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 13 }}>
        <thead>
          <tr style={{ borderBottom: "2px solid var(--border)" }}>
            {columns.map((c) => {
              const sortable = c.sortable !== false;
              const isActive = sortKey === c.key;
              return (
                <th
                  key={c.key}
                  onClick={sortable ? () => toggleSort(c) : undefined}
                  style={{
                    padding: "10px 14px",
                    textAlign: c.align ?? "left",
                    fontWeight: 600,
                    color: isActive ? "var(--accent-dark)" : "var(--ink-muted)",
                    fontSize: 11,
                    letterSpacing: "0.05em",
                    textTransform: "uppercase",
                    whiteSpace: "nowrap",
                    cursor: sortable ? "pointer" : "default",
                    userSelect: "none",
                    transition: "color 0.15s",
                    width: c.width,
                  }}
                  onMouseEnter={(e) => {
                    if (sortable && !isActive)
                      (e.currentTarget as HTMLTableCellElement).style.color = "var(--ink)";
                  }}
                  onMouseLeave={(e) => {
                    if (sortable && !isActive)
                      (e.currentTarget as HTMLTableCellElement).style.color = "var(--ink-muted)";
                  }}
                >
                  {c.label}
                  {sortable && (
                    <span
                      style={{
                        marginLeft: 6,
                        fontSize: 10,
                        opacity: isActive ? 1 : 0.35,
                        color: isActive ? "var(--accent)" : "var(--ink-subtle)",
                      }}
                    >
                      {isActive ? (sortDir === "asc" ? "▲" : "▼") : "↕"}
                    </span>
                  )}
                </th>
              );
            })}
          </tr>
        </thead>
        <tbody>
          {sortedRows.map((row, ri) => (
            <tr
              key={getKey(row, ri)}
              onClick={() => onRowClick?.(row)}
              style={{
                borderBottom: "1px solid var(--border)",
                cursor: onRowClick ? "pointer" : "default",
                transition: "background 0.1s",
              }}
              onMouseEnter={(e) => {
                if (onRowClick)
                  (e.currentTarget as HTMLTableRowElement).style.background = "var(--accent-light)";
              }}
              onMouseLeave={(e) => {
                (e.currentTarget as HTMLTableRowElement).style.background = "transparent";
              }}
            >
              {columns.map((c) => (
                <td
                  key={c.key}
                  style={{
                    padding: "11px 14px",
                    color: "var(--ink)",
                    whiteSpace: c.wrap ? "normal" : "nowrap",
                    textAlign: c.align ?? "left",
                  }}
                >
                  {c.render
                    ? c.render(row)
                    : ((row as unknown as Record<string, unknown>)[c.key] as React.ReactNode)}
                </td>
              ))}
            </tr>
          ))}
          {sortedRows.length === 0 && (
            <tr>
              <td
                colSpan={columns.length}
                style={{ padding: 32, textAlign: "center", color: "var(--ink-subtle)" }}
              >
                {emptyMessage}
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
}
