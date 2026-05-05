export type CsvColumn<T> = {
  key: string;
  label: string;
  get: (item: T) => string | number | null | undefined;
};

function escapeCsvCell(value: string | number | null | undefined): string {
  if (value == null) return "";
  const str = String(value);
  if (/[",\n;]/.test(str)) {
    return `"${str.replace(/"/g, '""')}"`;
  }
  return str;
}

export function exportCsv<T>(
  filename: string,
  rows: T[],
  columns: CsvColumn<T>[]
): void {
  const header = columns.map((c) => escapeCsvCell(c.label)).join(";");
  const body = rows
    .map((row) =>
      columns.map((c) => escapeCsvCell(c.get(row))).join(";")
    )
    .join("\n");

  const csv = `${header}\n${body}`;
  const bom = "﻿";
  const blob = new Blob([bom + csv], { type: "text/csv;charset=utf-8;" });

  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = filename.endsWith(".csv") ? filename : `${filename}.csv`;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}
