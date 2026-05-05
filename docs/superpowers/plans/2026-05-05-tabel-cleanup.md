# Tabel-cleanup Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Drie tabel-pagina's (`/leden`, `/donaties`, `/toezeggingen`) krijgen één consistente CRUD-experience: gedeelde toolbar (zoek, status, filter, export, primary action), selectie + lichte bulk (delete + export), 3-dots row-acties, nette confirm-dialog en consistente empty/loading/zero-states.

**Architecture:** Hybride — gedeelde `useTableState`-hook voor state-logica + losse UI-componenten in `src/components/table/`. Pagina's blijven hun eigen `<Table>` met `<TableRow>`s renderen voor max kolom-controle. Geen `@tanstack/react-table`, geen `<DataTable>`-wrapper.

**Tech Stack:** Next.js 16 App Router, React 19, TypeScript, Tailwind v4, shadcn/ui (4 nieuwe componenten te installeren: `checkbox`, `dropdown-menu`, `popover`, `alert-dialog`), `lucide-react`.

**Spec:** [`docs/superpowers/specs/2026-05-05-tabel-cleanup-design.md`](../specs/2026-05-05-tabel-cleanup-design.md)

**Project-conventies (uit [`CLAUDE.md`](../../../CLAUDE.md)):**
- UI is Nederlands. Geen comments die code beschrijven, alleen het *waarom* bij niet-evidente keuzes.
- Multi-tenant-ready: alle queries filteren op `org.id` (al zo gedaan in bestaande pagina's, niet veranderen).
- Verificatie per taak: `npm run build` groen + (bij UI) `npm run lint` + preview verify.
- **Commits alleen op verzoek van gebruiker.** Stappen "klaar voor commit?" zijn checkpoints, geen autocommits.
- shadcn-componenten gebruiken; geen eigen `Modal` of custom buttons.

---

## Fase 0 — Voorbereiding

### Taak 0.1: Branch + decisions.md-entry

**Files:**
- Create: branch `feat/tabel-cleanup` (of werknaam naar keuze)
- Modify: `docs/product/decisions.md`

- [ ] **Step 1: Maak werkende branch aan**

```bash
git checkout -b feat/tabel-cleanup
```

- [ ] **Step 2: Voeg decisions.md-entry toe**

Open [`docs/product/decisions.md`](../../product/decisions.md) en voeg onderaan toe:

```markdown
## 2026-05-05 — Lichte bulk-acties (delete + export) in MVP

- **Beslissing:** Tabel-cleanup voegt selectie + bulk-bar toe op `/leden`, `/donaties`, `/toezeggingen` met enkel "Verwijder selectie" en "Exporteer selectie". Bulk-status-mutaties expliciet uitgesloten. Hard delete blijft, met extra waarschuwingslaag (checkbox-bevestiging) op financiële records (`donations`, `gift_agreements`).
- **Waarom:** Zelfde UX-investering die anders bij Post-SaaS zou plaatsvinden ([roadmap.md regel 77](roadmap.md)), maar zonder de risicovolle status-mass-mutaties. Gift_agreement-rijen op `/toezeggingen` zijn niet selecteerbaar — voorkomt per ongeluk delete van ANBI-akten. Soft delete blijft uit MVP — ANBI-akten bewaren via niet-selecteerbaar maken volstaat voor het concrete risico.
- **Scope:** alleen die drie pagina's; `/ondernemers` en `/evenementen` (placeholders) krijgen het patroon pas bij echte bouw.
- **Herzieningstrigger:** Bij Post-SaaS / multi-org wanneer mass-status of mass-email gevraagd wordt, of als de moskee in MVP signaleert dat soft delete echt nodig is.
```

- [ ] **Step 3: Commit-checkpoint (vraag gebruiker)**

Toon `git status` + `git diff docs/product/decisions.md`, vraag of gebruiker wil committen met message `docs(decisions): tabel-cleanup MVP-beslissingen vastleggen`.

---

## Fase 1 — Shared utilities & primitives

### Taak 1.1: shadcn-componenten installeren

**Files:**
- Create: `src/components/ui/checkbox.tsx`
- Create: `src/components/ui/dropdown-menu.tsx`
- Create: `src/components/ui/popover.tsx`
- Create: `src/components/ui/alert-dialog.tsx`

- [ ] **Step 1: Installeer alle 4 componenten in één call**

Run:
```bash
npx shadcn@latest add checkbox dropdown-menu popover alert-dialog
```

shadcn vraagt mogelijk om `npm install` voor `@radix-ui/react-checkbox`, `@radix-ui/react-dropdown-menu`, `@radix-ui/react-popover`, `@radix-ui/react-alert-dialog` — accepteer.

- [ ] **Step 2: Verifieer dat de 4 bestanden zijn aangemaakt**

```bash
ls src/components/ui/checkbox.tsx src/components/ui/dropdown-menu.tsx src/components/ui/popover.tsx src/components/ui/alert-dialog.tsx
```

Verwacht: alle 4 paden gelist, geen "no such file".

- [ ] **Step 3: Build-check**

```bash
npm run build
```

Verwacht: groen. Als error op de nieuwe componenten: lees de error en herinstalleer de specifieke component met `--overwrite`.

- [ ] **Step 4: Commit-checkpoint**

Toon git status, vraag commit `chore(ui): add shadcn checkbox, dropdown-menu, popover, alert-dialog`.

### Taak 1.2: `formatters.ts` — gedeelde helpers

**Files:**
- Create: `src/app/lib/formatters.ts`

- [ ] **Step 1: Schrijf het bestand**

```typescript
import type { Member } from "./types";

export function fmtEuro(n: number | null | undefined): string {
  if (n == null) return "—";
  return new Intl.NumberFormat("nl-NL", {
    style: "currency",
    currency: "EUR",
    minimumFractionDigits: 2,
  }).format(n);
}

export function fmtDate(iso: string | null | undefined): string {
  if (!iso) return "—";
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return iso;
  return d.toLocaleDateString("nl-NL", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
}

export function fmtDateShort(iso: string | null | undefined): string {
  if (!iso) return "";
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return iso;
  return d.toLocaleDateString("nl-NL", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  });
}

export function displayName(
  m: Pick<Member, "name" | "first_name" | "last_name"> | null | undefined
): string {
  if (!m) return "—";
  const combined = [m.first_name, m.last_name].filter(Boolean).join(" ").trim();
  return combined || m.name || "—";
}

export type StatusBadgeTone =
  | "neutral"
  | "success"
  | "info"
  | "warn"
  | "destructive"
  | "muted";

export const STATUS_BADGE_CLASS: Record<StatusBadgeTone, string> = {
  neutral: "bg-stone-100 text-stone-900 hover:bg-stone-100",
  success: "bg-emerald-100 text-emerald-900 hover:bg-emerald-100",
  info: "bg-sky-100 text-sky-900 hover:bg-sky-100",
  warn: "bg-amber-100 text-amber-900 hover:bg-amber-100",
  destructive: "bg-rose-100 text-rose-900 hover:bg-rose-100",
  muted: "bg-stone-200 text-stone-700 hover:bg-stone-200",
};
```

- [ ] **Step 2: Build-check**

```bash
npm run build
```

Verwacht: groen.

### Taak 1.3: `exportCsv.ts` — CSV-download utility

**Files:**
- Create: `src/app/lib/exportCsv.ts`

- [ ] **Step 1: Schrijf het bestand**

```typescript
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
```

> Semicolon (`;`) als delimiter want NL-Excel verwacht dat (komma is decimaal).

- [ ] **Step 2: Build-check**

```bash
npm run build
```

Verwacht: groen.

### Taak 1.4: `useTableState.ts` — de hook

**Files:**
- Create: `src/app/lib/useTableState.ts`

- [ ] **Step 1: Schrijf het bestand**

```typescript
"use client";

import { useEffect, useMemo, useRef, useState } from "react";

export type Period = {
  preset: "all" | "this-month" | "this-quarter" | "this-year" | "custom";
  from?: string;
  to?: string;
};

export type UseTableStateInput<T> = {
  items: T[];
  rowKey: (item: T) => string;
  searchFields: (item: T) => string;
  statusOf?: (item: T) => string | null;
  dateOf?: (item: T) => string | null;
  isSelectable?: (item: T) => boolean;
};

export type UseTableStateReturn<T> = {
  search: string;
  searchInput: string;
  setSearchInput: (v: string) => void;
  clearSearch: () => void;
  statusFilter: string;
  setStatusFilter: (v: string) => void;
  period: Period;
  setPeriod: (p: Period) => void;
  selectedKeys: Set<string>;
  toggleRow: (key: string) => void;
  toggleAllVisible: () => void;
  clearSelection: () => void;
  isAllVisibleSelected: boolean;
  isSomeVisibleSelected: boolean;
  filteredItems: T[];
  isFilteredEmpty: boolean;
  isEmpty: boolean;
  resetFilters: () => void;
};

const DEFAULT_PERIOD: Period = { preset: "all" };

function periodToRange(p: Period): { from: string | null; to: string | null } {
  const now = new Date();
  const y = now.getFullYear();
  const m = now.getMonth();
  const iso = (d: Date) => d.toISOString().slice(0, 10);

  switch (p.preset) {
    case "all":
      return { from: null, to: null };
    case "this-month": {
      return { from: iso(new Date(y, m, 1)), to: iso(new Date(y, m + 1, 0)) };
    }
    case "this-quarter": {
      const qStart = Math.floor(m / 3) * 3;
      return { from: iso(new Date(y, qStart, 1)), to: iso(new Date(y, qStart + 3, 0)) };
    }
    case "this-year":
      return { from: `${y}-01-01`, to: `${y}-12-31` };
    case "custom":
      return { from: p.from ?? null, to: p.to ?? null };
  }
}

export function useTableState<T>(input: UseTableStateInput<T>): UseTableStateReturn<T> {
  const { items, rowKey, searchFields, statusOf, dateOf, isSelectable } = input;

  const [searchInput, setSearchInput] = useState("");
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [period, setPeriod] = useState<Period>(DEFAULT_PERIOD);
  const [selectedKeys, setSelectedKeys] = useState<Set<string>>(new Set());

  useEffect(() => {
    const t = setTimeout(() => setSearch(searchInput.trim().toLowerCase()), 250);
    return () => clearTimeout(t);
  }, [searchInput]);

  const lastFilterSig = useRef("");
  useEffect(() => {
    const sig = `${search}|${statusFilter}|${period.preset}|${period.from ?? ""}|${period.to ?? ""}`;
    if (lastFilterSig.current && lastFilterSig.current !== sig) {
      setSelectedKeys(new Set());
    }
    lastFilterSig.current = sig;
  }, [search, statusFilter, period]);

  const filteredItems = useMemo(() => {
    const range = periodToRange(period);

    return items.filter((item) => {
      if (search) {
        const hay = searchFields(item).toLowerCase();
        if (!hay.includes(search)) return false;
      }
      if (statusFilter !== "all" && statusOf) {
        const s = statusOf(item);
        if (s !== statusFilter) return false;
      }
      if (period.preset !== "all" && dateOf) {
        const d = dateOf(item);
        if (!d) return false;
        if (range.from && d < range.from) return false;
        if (range.to && d > range.to) return false;
      }
      return true;
    });
  }, [items, search, statusFilter, period, searchFields, statusOf, dateOf]);

  const visibleSelectableKeys = useMemo(() => {
    return filteredItems
      .filter((item) => (isSelectable ? isSelectable(item) : true))
      .map((item) => rowKey(item));
  }, [filteredItems, isSelectable, rowKey]);

  const isAllVisibleSelected =
    visibleSelectableKeys.length > 0 &&
    visibleSelectableKeys.every((k) => selectedKeys.has(k));

  const isSomeVisibleSelected =
    !isAllVisibleSelected &&
    visibleSelectableKeys.some((k) => selectedKeys.has(k));

  const toggleRow = (key: string) => {
    setSelectedKeys((prev) => {
      const next = new Set(prev);
      if (next.has(key)) next.delete(key);
      else next.add(key);
      return next;
    });
  };

  const toggleAllVisible = () => {
    setSelectedKeys((prev) => {
      const next = new Set(prev);
      if (isAllVisibleSelected) {
        visibleSelectableKeys.forEach((k) => next.delete(k));
      } else {
        visibleSelectableKeys.forEach((k) => next.add(k));
      }
      return next;
    });
  };

  const clearSelection = () => setSelectedKeys(new Set());
  const clearSearch = () => {
    setSearchInput("");
    setSearch("");
  };
  const resetFilters = () => {
    clearSearch();
    setStatusFilter("all");
    setPeriod(DEFAULT_PERIOD);
  };

  return {
    search,
    searchInput,
    setSearchInput,
    clearSearch,
    statusFilter,
    setStatusFilter,
    period,
    setPeriod,
    selectedKeys,
    toggleRow,
    toggleAllVisible,
    clearSelection,
    isAllVisibleSelected,
    isSomeVisibleSelected,
    filteredItems,
    isFilteredEmpty: items.length > 0 && filteredItems.length === 0,
    isEmpty: items.length === 0,
    resetFilters,
  };
}
```

- [ ] **Step 2: Build-check**

```bash
npm run build && npm run lint
```

Verwacht: beide groen.

- [ ] **Step 3: Commit-checkpoint**

Toon diff, vraag commit `feat(table): add shared formatters, exportCsv util, useTableState hook`.

### Taak 1.5: `StatCard.tsx` — extract bestaande inline definitie

**Files:**
- Create: `src/components/table/StatCard.tsx`

- [ ] **Step 1: Lees referentie**

Bekijk de bestaande inline `StatCard` definities in [`src/app/donations/page.tsx`](../../../src/app/donations/page.tsx) (gebruikt in regel ~115 area; zoek `function StatCard`) en [`src/app/toezeggingen/page.tsx`](../../../src/app/toezeggingen/page.tsx) — wij willen visueel hetzelfde resultaat.

- [ ] **Step 2: Schrijf het component**

```tsx
import { Card, CardContent } from "@/components/ui/card";

type StatCardProps = {
  label: string;
  value: string;
  hint?: string;
};

export function StatCard({ label, value, hint }: StatCardProps) {
  return (
    <Card>
      <CardContent className="p-5">
        <p className="text-muted-foreground text-xs uppercase tracking-wider">
          {label}
        </p>
        <p className="font-serif text-3xl font-normal text-foreground mt-1">
          {value}
        </p>
        {hint && (
          <p className="text-muted-foreground text-xs mt-1">{hint}</p>
        )}
      </CardContent>
    </Card>
  );
}
```

> Pas de exacte typografie aan tot wat de bestaande `/donaties`-StatCard heeft als visueel verschil zichtbaar wordt. Verifieer met preview voordat je doorgaat.

- [ ] **Step 3: Preview-check**

Open de preview op `/donaties` (oude inline StatCard nog actief) — noteer kleuren/spacing. Daarna check je in Fase 3 dat de nieuwe `StatCard` identiek oogt.

---

## Fase 2 — Table UI bouwstenen

### Taak 2.1: `TableSearch.tsx`

**Files:**
- Create: `src/components/table/TableSearch.tsx`

- [ ] **Step 1: Schrijf het component**

```tsx
"use client";

import { Search, X } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

type Props = {
  value: string;
  onChange: (v: string) => void;
  placeholder?: string;
  className?: string;
};

export function TableSearch({
  value,
  onChange,
  placeholder = "Zoeken…",
  className = "",
}: Props) {
  const handleKey = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Escape" && value) {
      onChange("");
      e.currentTarget.blur();
    }
  };

  return (
    <div className={`relative ${className}`}>
      <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground pointer-events-none" />
      <Input
        type="search"
        role="searchbox"
        aria-label="Zoeken in tabel"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        onKeyDown={handleKey}
        placeholder={placeholder}
        className="pl-9 pr-8"
      />
      {value && (
        <Button
          type="button"
          variant="ghost"
          size="icon"
          aria-label="Wis zoekterm"
          onClick={() => onChange("")}
          className="absolute right-1 top-1/2 -translate-y-1/2 h-7 w-7"
        >
          <X className="h-3.5 w-3.5" />
        </Button>
      )}
    </div>
  );
}
```

- [ ] **Step 2: Build-check**

```bash
npm run build
```

Verwacht: groen.

### Taak 2.2: `TableStatusFilter.tsx`

**Files:**
- Create: `src/components/table/TableStatusFilter.tsx`

- [ ] **Step 1: Schrijf het component**

```tsx
"use client";

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

export type StatusOption = { value: string; label: string };

type Props = {
  value: string;
  onChange: (v: string) => void;
  options: StatusOption[];
  labelPrefix?: string;
  className?: string;
};

export function TableStatusFilter({
  value,
  onChange,
  options,
  labelPrefix = "Status",
  className = "",
}: Props) {
  const current = options.find((o) => o.value === value);
  return (
    <Select value={value} onValueChange={onChange}>
      <SelectTrigger className={`w-auto min-w-[180px] ${className}`}>
        <SelectValue
          placeholder={labelPrefix}
          aria-label={`${labelPrefix}: ${current?.label ?? "alle"}`}
        >
          <span className="text-muted-foreground">{labelPrefix}: </span>
          <span>{current?.label ?? "Alle"}</span>
        </SelectValue>
      </SelectTrigger>
      <SelectContent>
        {options.map((o) => (
          <SelectItem key={o.value} value={o.value}>
            {o.label}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}
```

- [ ] **Step 2: Build-check**

```bash
npm run build
```

### Taak 2.3: `TableFilterButton.tsx` — periode-popover + chip-rij

**Files:**
- Create: `src/components/table/TableFilterButton.tsx`

- [ ] **Step 1: Schrijf het component**

```tsx
"use client";

import { Filter, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import type { Period } from "@/app/lib/useTableState";

type Props = {
  period: Period;
  onChange: (p: Period) => void;
};

const PRESETS: { value: Period["preset"]; label: string }[] = [
  { value: "all", label: "Alles" },
  { value: "this-month", label: "Deze maand" },
  { value: "this-quarter", label: "Dit kwartaal" },
  { value: "this-year", label: "Dit jaar" },
];

function periodLabel(p: Period): string | null {
  if (p.preset === "all") return null;
  if (p.preset === "this-month") return "Deze maand";
  if (p.preset === "this-quarter") return "Dit kwartaal";
  if (p.preset === "this-year") return "Dit jaar";
  if (p.preset === "custom") {
    if (p.from && p.to) return `${p.from} – ${p.to}`;
    if (p.from) return `vanaf ${p.from}`;
    if (p.to) return `tot ${p.to}`;
    return "Aangepast";
  }
  return null;
}

export function TableFilterButton({ period, onChange }: Props) {
  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button variant="outline" size="sm" aria-label="Filters openen">
          <Filter className="h-4 w-4 mr-2" />
          Filter
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-72" align="end">
        <div className="space-y-4">
          <div>
            <Label className="text-xs uppercase tracking-wider text-muted-foreground">
              Periode
            </Label>
            <div className="grid grid-cols-2 gap-2 mt-2">
              {PRESETS.map((p) => (
                <Button
                  key={p.value}
                  size="sm"
                  variant={period.preset === p.value ? "default" : "outline"}
                  onClick={() => onChange({ preset: p.value })}
                >
                  {p.label}
                </Button>
              ))}
            </div>
          </div>

          <div>
            <Label className="text-xs uppercase tracking-wider text-muted-foreground">
              Aangepast
            </Label>
            <div className="grid grid-cols-2 gap-2 mt-2">
              <Input
                type="date"
                value={period.preset === "custom" ? (period.from ?? "") : ""}
                onChange={(e) =>
                  onChange({
                    preset: "custom",
                    from: e.target.value,
                    to: period.preset === "custom" ? period.to : undefined,
                  })
                }
                aria-label="Vanaf datum"
              />
              <Input
                type="date"
                value={period.preset === "custom" ? (period.to ?? "") : ""}
                onChange={(e) =>
                  onChange({
                    preset: "custom",
                    from: period.preset === "custom" ? period.from : undefined,
                    to: e.target.value,
                  })
                }
                aria-label="Tot datum"
              />
            </div>
          </div>
        </div>
      </PopoverContent>
    </Popover>
  );
}

type ChipsProps = {
  period: Period;
  onClear: () => void;
};

export function ActiveFilterChips({ period, onClear }: ChipsProps) {
  const label = periodLabel(period);
  if (!label) return null;
  return (
    <div className="flex gap-2 mb-3">
      <span className="inline-flex items-center gap-1.5 rounded-full bg-stone-100 text-stone-900 px-3 py-1 text-xs">
        Periode: {label}
        <button
          type="button"
          onClick={onClear}
          aria-label="Wis periode-filter"
          className="hover:text-stone-700"
        >
          <X className="h-3 w-3" />
        </button>
      </span>
    </div>
  );
}
```

- [ ] **Step 2: Build-check**

```bash
npm run build
```

### Taak 2.4: `TableToolbar.tsx`

**Files:**
- Create: `src/components/table/TableToolbar.tsx`

- [ ] **Step 1: Schrijf het component**

```tsx
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
```

- [ ] **Step 2: Build-check**

```bash
npm run build
```

### Taak 2.5: `RowActionsMenu.tsx`

**Files:**
- Create: `src/components/table/RowActionsMenu.tsx`

- [ ] **Step 1: Schrijf het component**

```tsx
"use client";

import { MoreHorizontal } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import type { ReactNode } from "react";

export type RowAction = {
  label: string;
  icon?: ReactNode;
  onClick: () => void;
  destructive?: boolean;
  separatorBefore?: boolean;
  disabled?: boolean;
};

type Props = {
  actions: RowAction[];
  ariaLabel?: string;
};

export function RowActionsMenu({ actions, ariaLabel = "Acties" }: Props) {
  if (actions.length === 0) return null;
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant="ghost"
          size="icon"
          className="h-8 w-8"
          aria-label={ariaLabel}
        >
          <MoreHorizontal className="h-4 w-4" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-48">
        {actions.map((a, i) => (
          <div key={`${a.label}-${i}`}>
            {a.separatorBefore && <DropdownMenuSeparator />}
            <DropdownMenuItem
              onClick={a.onClick}
              disabled={a.disabled}
              className={
                a.destructive
                  ? "text-destructive focus:text-destructive"
                  : undefined
              }
            >
              {a.icon && <span className="mr-2">{a.icon}</span>}
              {a.label}
            </DropdownMenuItem>
          </div>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
```

- [ ] **Step 2: Build-check**

```bash
npm run build
```

### Taak 2.6: `RowSelectCheckbox.tsx`

**Files:**
- Create: `src/components/table/RowSelectCheckbox.tsx`

- [ ] **Step 1: Schrijf het component**

```tsx
"use client";

import { useEffect, useRef } from "react";
import { Checkbox } from "@/components/ui/checkbox";

type Props = {
  checked: boolean;
  indeterminate?: boolean;
  onChange: (checked: boolean) => void;
  ariaLabel: string;
};

export function RowSelectCheckbox({
  checked,
  indeterminate = false,
  onChange,
  ariaLabel,
}: Props) {
  const ref = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    if (ref.current) {
      ref.current.setAttribute(
        "aria-checked",
        indeterminate ? "mixed" : checked ? "true" : "false"
      );
    }
  }, [checked, indeterminate]);

  return (
    <Checkbox
      ref={ref}
      checked={indeterminate ? "indeterminate" : checked}
      onCheckedChange={(v) => onChange(v === true)}
      aria-label={ariaLabel}
    />
  );
}
```

> Als shadcn `Checkbox` géén `ref`-prop accepteert in deze versie, vervang door directe `<input type="checkbox">` met de Tailwind classes uit `Checkbox` of gebruik `forwardRef`. Verifier eerst door `Checkbox` te lezen na shadcn-add.

- [ ] **Step 2: Build-check**

```bash
npm run build
```

Als build faalt op `ref`: open `src/components/ui/checkbox.tsx`, kijk of de root component al `forwardRef` gebruikt; zo niet, wrap hem of gebruik directe `<input>`. Houd het component klein.

### Taak 2.7: `TableBulkBar.tsx`

**Files:**
- Create: `src/components/table/TableBulkBar.tsx`

- [ ] **Step 1: Schrijf het component**

```tsx
"use client";

import type { ReactNode } from "react";
import { Button } from "@/components/ui/button";
import { X } from "lucide-react";

export type BulkAction = {
  label: string;
  icon?: ReactNode;
  onClick: () => void;
  destructive?: boolean;
  disabled?: boolean;
  disabledReason?: string;
};

type Props = {
  count: number;
  actions: BulkAction[];
  onClear: () => void;
};

export function TableBulkBar({ count, actions, onClear }: Props) {
  if (count === 0) return null;
  return (
    <div
      role="region"
      aria-label={`Bulk-acties voor ${count} geselecteerde rijen`}
      className="fixed bottom-4 left-1/2 -translate-x-1/2 z-30 bg-foreground text-background rounded-full shadow-lg px-3 py-2 flex items-center gap-3 min-w-[280px] max-w-[90vw]"
    >
      <span className="text-sm font-medium pl-2 whitespace-nowrap">
        {count} geselecteerd
      </span>
      <div className="flex gap-1 flex-wrap">
        {actions.map((a) => (
          <Button
            key={a.label}
            variant="ghost"
            size="sm"
            onClick={a.onClick}
            disabled={a.disabled}
            title={a.disabled ? a.disabledReason : undefined}
            className={
              a.destructive
                ? "text-rose-300 hover:text-rose-200 hover:bg-white/10"
                : "text-background hover:bg-white/10"
            }
          >
            {a.icon && <span className="mr-1.5">{a.icon}</span>}
            {a.label}
          </Button>
        ))}
      </div>
      <Button
        variant="ghost"
        size="icon"
        aria-label="Selectie opheffen"
        onClick={onClear}
        className="h-8 w-8 text-background/70 hover:bg-white/10 ml-auto"
      >
        <X className="h-4 w-4" />
      </Button>
    </div>
  );
}
```

- [ ] **Step 2: Build-check**

```bash
npm run build
```

### Taak 2.8: `LoadingState.tsx`

**Files:**
- Create: `src/components/table/LoadingState.tsx`

- [ ] **Step 1: Schrijf het component**

```tsx
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
```

- [ ] **Step 2: Build-check**

```bash
npm run build
```

### Taak 2.9: `EmptyState.tsx`

**Files:**
- Create: `src/components/table/EmptyState.tsx`

- [ ] **Step 1: Schrijf het component**

```tsx
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
```

- [ ] **Step 2: Build-check**

```bash
npm run build
```

### Taak 2.10: `ZeroResults.tsx`

**Files:**
- Create: `src/components/table/ZeroResults.tsx`

- [ ] **Step 1: Schrijf het component**

```tsx
import { Button } from "@/components/ui/button";

type Props = {
  onClearFilters: () => void;
};

export function ZeroResults({ onClearFilters }: Props) {
  return (
    <div className="text-center py-12">
      <p className="text-muted-foreground text-sm">Geen resultaten gevonden</p>
      <Button
        variant="link"
        size="sm"
        onClick={onClearFilters}
        className="mt-1"
      >
        Wis filters
      </Button>
    </div>
  );
}
```

- [ ] **Step 2: Build-check**

```bash
npm run build
```

### Taak 2.11: `ConfirmDeleteDialog.tsx`

**Files:**
- Create: `src/components/table/ConfirmDeleteDialog.tsx`

- [ ] **Step 1: Schrijf het component**

```tsx
"use client";

import { useEffect, useState } from "react";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { AlertTriangle } from "lucide-react";

type Props = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onConfirm: () => Promise<void> | void;
  mode: "standard" | "financial";
  title: string;
  description: string;
};

export function ConfirmDeleteDialog({
  open,
  onOpenChange,
  onConfirm,
  mode,
  title,
  description,
}: Props) {
  const [understood, setUnderstood] = useState(false);
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    if (!open) {
      setUnderstood(false);
      setBusy(false);
    }
  }, [open]);

  const canConfirm = mode === "standard" || understood;

  const handleConfirm = async () => {
    setBusy(true);
    try {
      await onConfirm();
      onOpenChange(false);
    } finally {
      setBusy(false);
    }
  };

  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>{title}</AlertDialogTitle>
          <AlertDialogDescription>{description}</AlertDialogDescription>
        </AlertDialogHeader>

        {mode === "financial" && (
          <div className="rounded-md border border-rose-200 bg-rose-50 p-3 text-sm text-rose-900">
            <div className="flex gap-2">
              <AlertTriangle className="h-4 w-4 mt-0.5 shrink-0" />
              <div>
                <p className="font-medium">Dit zijn ANBI-bewijzen.</p>
                <p className="mt-1">
                  Verwijderen kan niet ongedaan worden gemaakt en raakt de jaaroverzichten.
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2 mt-3">
              <Checkbox
                id="understand-financial"
                checked={understood}
                onCheckedChange={(v) => setUnderstood(v === true)}
              />
              <Label
                htmlFor="understand-financial"
                className="text-sm cursor-pointer"
              >
                Ik begrijp het en wil doorgaan
              </Label>
            </div>
          </div>
        )}

        <AlertDialogFooter>
          <AlertDialogCancel disabled={busy}>Annuleer</AlertDialogCancel>
          <AlertDialogAction
            disabled={!canConfirm || busy}
            onClick={(e) => {
              e.preventDefault();
              if (canConfirm && !busy) handleConfirm();
            }}
            className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
          >
            {busy ? "Bezig…" : "Verwijder"}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
```

- [ ] **Step 2: Build-check**

```bash
npm run build && npm run lint
```

Verwacht: beide groen.

- [ ] **Step 3: Commit-checkpoint**

Vraag commit `feat(table): add table UI primitives (toolbar, search, filter, bulk-bar, row-actions, states, confirm-dialog)`.

---

## Fase 3 — Pagina-migraties

> Voor elke pagina-migratie: open de pagina, verwijder inline state-blokken, vervang door hook + componenten. Behoud alle bestaande Supabase-queries en business-logica ongewijzigd. Volg dezelfde structuur per pagina.

### Taak 3.1: `/leden`-migratie

**Files:**
- Modify: `src/app/members/page.tsx`

- [ ] **Step 1: Lees de huidige pagina volledig**

```bash
wc -l src/app/members/page.tsx
```

Lees: hele bestand (588 LOC). Identificeer secties:
- State-blok bovenin (members, agreementAmounts, loading, modalMode, editing, typeFilter)
- `fetchMembers` callback
- `handleDelete` (browser `confirm()` — vervang)
- Render: header → typeFilter-bar → tabel → modal

- [ ] **Step 2: Voeg imports toe**

Bovenin het bestand, na bestaande imports:

```tsx
import { useTableState } from "../lib/useTableState";
import { TableToolbar } from "@/components/table/TableToolbar";
import { TableSearch } from "@/components/table/TableSearch";
import { TableStatusFilter } from "@/components/table/TableStatusFilter";
import { TableFilterButton, ActiveFilterChips } from "@/components/table/TableFilterButton";
import { TableBulkBar } from "@/components/table/TableBulkBar";
import { RowActionsMenu } from "@/components/table/RowActionsMenu";
import { RowSelectCheckbox } from "@/components/table/RowSelectCheckbox";
import { ConfirmDeleteDialog } from "@/components/table/ConfirmDeleteDialog";
import { EmptyState } from "@/components/table/EmptyState";
import { ZeroResults } from "@/components/table/ZeroResults";
import { TableLoadingState } from "@/components/table/LoadingState";
import { StatCard } from "@/components/table/StatCard";
import { exportCsv } from "../lib/exportCsv";
import { fmtDate, fmtEuro, displayName } from "../lib/formatters";
import { Users, Trash2, Download, Eye, Pencil } from "lucide-react";
```

> Verwijder de bestaande imports/definities die nu uit `formatters.ts` komen (lokale `displayName`, `fmtEuro` etc.) zodra je verderop het component refactoort.

- [ ] **Step 3: Definieer status-opties + helper**

Boven de `MembersInner`-functie:

```tsx
const STATUS_DROPDOWN_OPTIONS = [
  { value: "all", label: "Alle leden & donateurs" },
  { value: "lid-active", label: "Lid · actief" },
  { value: "lid-inactive", label: "Lid · inactief" },
  { value: "donateur-active", label: "Donateur · actief" },
  { value: "donateur-inactive", label: "Donateur · inactief" },
  { value: "prospect", label: "Prospect" },
  { value: "cancelled", label: "Opgezegd" },
];

function memberStatusKey(m: Member): string {
  if (m.status === "prospect") return "prospect";
  if (m.status === "cancelled") return "cancelled";
  const type = m.membership_type === "lid" ? "lid" : "donateur";
  const status = m.status === "active" ? "active" : "inactive";
  return `${type}-${status}`;
}
```

- [ ] **Step 4: Vervang bestaande state met `useTableState`**

In `MembersInner`, vervang de oude `typeFilter`-useState door:

```tsx
const t = useTableState<Member>({
  items: members,
  rowKey: (m) => m.id,
  searchFields: (m) => [m.first_name, m.last_name, m.name, m.email].filter(Boolean).join(" "),
  statusOf: memberStatusKey,
  dateOf: (m) => m.created_at,
});

const [confirmState, setConfirmState] = useState<
  { mode: "single"; id: string; name: string } | { mode: "bulk"; ids: string[] } | null
>(null);
```

- [ ] **Step 5: Vervang `handleDelete` door dialog-flow**

Verwijder de browser `confirm()`. Voeg toe:

```tsx
const askDeleteSingle = (m: Member) => {
  setConfirmState({ mode: "single", id: m.id, name: displayName(m) });
};

const askDeleteBulk = () => {
  const ids = Array.from(t.selectedKeys);
  if (ids.length === 0) return;
  setConfirmState({ mode: "bulk", ids });
};

const performDelete = async () => {
  if (!confirmState) return;
  const ids = confirmState.mode === "single" ? [confirmState.id] : confirmState.ids;
  const { error } = await supabase.from("members").delete().in("id", ids);
  if (error) {
    setError(error.message);
    return;
  }
  t.clearSelection();
  setConfirmState(null);
  await fetchMembers();
};
```

- [ ] **Step 6: Schrijf de export-handler**

```tsx
const handleExport = (rows: Member[]) => {
  exportCsv(`leden-${new Date().toISOString().slice(0, 10)}`, rows, [
    { key: "name", label: "Naam", get: (m) => displayName(m) },
    { key: "type", label: "Type", get: (m) => m.membership_type ?? "" },
    { key: "status", label: "Status", get: (m) => m.status },
    { key: "email", label: "E-mail", get: (m) => m.email ?? "" },
    { key: "phone", label: "Telefoon", get: (m) => m.phone ?? "" },
    { key: "monthly", label: "Bedrag/maand", get: (m) =>
      m.monthly_amount ?? agreementAmounts.get(m.id) ?? "" },
    { key: "created_at", label: "Aangemaakt", get: (m) => m.created_at },
  ]);
};
```

- [ ] **Step 7: Vervang de header + filter-bar render**

Verwijder de oude type-filter-buttons rij. Vervang de header-render door:

```tsx
<div className="flex justify-between items-end mb-7 gap-4 flex-wrap">
  <div>
    <h1 className="font-serif text-4xl font-normal text-foreground">Leden</h1>
    <p className="text-muted-foreground text-sm mt-1">
      Beheer leden en donateurs van de moskee.
    </p>
  </div>
</div>

{!t.isEmpty && (
  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
    <StatCard label="Totaal leden & donateurs" value={String(members.length)} />
    <StatCard
      label="Actieve periodieke giften"
      value={String(members.filter((m) => agreementAmounts.has(m.id)).length)}
    />
    <StatCard
      label="Nieuwe leden deze maand"
      value={String(
        members.filter((m) => {
          const d = new Date(m.created_at);
          const now = new Date();
          return (
            d.getFullYear() === now.getFullYear() &&
            d.getMonth() === now.getMonth()
          );
        }).length
      )}
    />
  </div>
)}

<TableToolbar
  left={
    <TableSearch
      value={t.searchInput}
      onChange={t.setSearchInput}
      placeholder="Zoek op naam of e-mail…"
    />
  }
  right={
    <>
      <TableStatusFilter
        labelPrefix="Toon"
        value={t.statusFilter}
        onChange={t.setStatusFilter}
        options={STATUS_DROPDOWN_OPTIONS}
      />
      <TableFilterButton period={t.period} onChange={t.setPeriod} />
      <Button
        variant="outline"
        size="sm"
        onClick={() => handleExport(t.filteredItems)}
        disabled={t.filteredItems.length === 0}
      >
        <Download className="h-4 w-4 mr-2" />
        Export
      </Button>
      <Button onClick={openAdd}>Nieuw lid</Button>
    </>
  }
/>

<ActiveFilterChips period={t.period} onClear={() => t.setPeriod({ preset: "all" })} />
```

- [ ] **Step 8: Vervang de tabel-render**

```tsx
{loading ? (
  <TableLoadingState columns={7} />
) : t.isEmpty ? (
  <EmptyState
    icon={<Users className="h-6 w-6" />}
    title="Nog geen leden"
    description="Voeg leden toe of importeer ze uit Excel."
    actions={
      <>
        <Button onClick={openAdd}>Nieuw lid</Button>
        <Button variant="outline" onClick={() => setModalMode("import")}>
          Importeren
        </Button>
      </>
    }
  />
) : t.isFilteredEmpty ? (
  <ZeroResults onClearFilters={t.resetFilters} />
) : (
  <Table>
    <TableHeader>
      <TableRow>
        <TableHead className="w-10">
          <RowSelectCheckbox
            checked={t.isAllVisibleSelected}
            indeterminate={t.isSomeVisibleSelected}
            onChange={t.toggleAllVisible}
            ariaLabel={`Selecteer alle ${t.filteredItems.length} zichtbare leden`}
          />
        </TableHead>
        <TableHead>Naam</TableHead>
        <TableHead>Type</TableHead>
        <TableHead>Status</TableHead>
        <TableHead>E-mail</TableHead>
        <TableHead className="text-right">Bedrag/maand</TableHead>
        <TableHead>Aangemaakt</TableHead>
        <TableHead className="w-10"></TableHead>
      </TableRow>
    </TableHeader>
    <TableBody>
      {t.filteredItems.map((m) => (
        <TableRow key={m.id} data-state={t.selectedKeys.has(m.id) ? "selected" : undefined}>
          <TableCell>
            <RowSelectCheckbox
              checked={t.selectedKeys.has(m.id)}
              onChange={() => t.toggleRow(m.id)}
              ariaLabel={`Selecteer ${displayName(m)}`}
            />
          </TableCell>
          <TableCell>
            <Link href={`/members/${m.id}`} className="font-medium hover:underline">
              {displayName(m)}
            </Link>
          </TableCell>
          <TableCell><MembershipTypeBadge type={m.membership_type} /></TableCell>
          <TableCell><StatusBadge status={m.status} /></TableCell>
          <TableCell>{m.email ?? "—"}</TableCell>
          <TableCell className="text-right">
            {fmtEuro(m.monthly_amount ?? agreementAmounts.get(m.id) ?? null)}
          </TableCell>
          <TableCell>{fmtDate(m.created_at)}</TableCell>
          <TableCell>
            <RowActionsMenu
              actions={[
                { label: "Bekijken", icon: <Eye className="h-4 w-4" />, onClick: () => router.push(`/members/${m.id}`) },
                { label: "Bewerken", icon: <Pencil className="h-4 w-4" />, onClick: () => openEdit(m) },
                { label: "Verwijderen", icon: <Trash2 className="h-4 w-4" />, destructive: true, onClick: () => askDeleteSingle(m), separatorBefore: true },
              ]}
            />
          </TableCell>
        </TableRow>
      ))}
    </TableBody>
  </Table>
)}

<TableBulkBar
  count={t.selectedKeys.size}
  onClear={t.clearSelection}
  actions={[
    {
      label: `Exporteer ${t.selectedKeys.size}`,
      icon: <Download className="h-4 w-4" />,
      onClick: () => handleExport(members.filter((m) => t.selectedKeys.has(m.id))),
    },
    {
      label: `Verwijder ${t.selectedKeys.size}`,
      icon: <Trash2 className="h-4 w-4" />,
      destructive: true,
      onClick: askDeleteBulk,
    },
  ]}
/>

<ConfirmDeleteDialog
  open={confirmState !== null}
  onOpenChange={(o) => !o && setConfirmState(null)}
  mode="standard"
  title={
    confirmState?.mode === "single"
      ? `Lid verwijderen?`
      : `${confirmState?.ids.length ?? 0} leden verwijderen?`
  }
  description={
    confirmState?.mode === "single"
      ? `${confirmState.name} wordt permanent verwijderd.`
      : "Geselecteerde leden worden permanent verwijderd."
  }
  onConfirm={performDelete}
/>
```

> Voeg `useRouter` toe als import bovenin als die nog niet aanwezig is: `import { useRouter } from "next/navigation"; const router = useRouter();` binnen `MembersInner`.

- [ ] **Step 9: Build + lint**

```bash
npm run build && npm run lint
```

Verwacht: beide groen. Fix import-issues, dode-vars (oude `typeFilter`-variabelen), type-mismatches.

- [ ] **Step 10: Preview verify**

Start dev server (preview-tools):
- Open `/leden` zonder data → empty state met 2 knoppen.
- Voeg een lid toe via modal → tabel verschijnt met 3 stat-cards.
- Tik in zoek → debounced filter werkt, ESC reset.
- Open Toon-dropdown → 7 opties, filter werkt.
- Open Filter-popover → kies "Deze maand" → chip verschijnt onder toolbar, X reset.
- Klik checkbox in header → alle rijen geselecteerd, bulk-bar verschijnt onderaan met "Exporteer X" + "Verwijder X" + close.
- Klik Verwijder X → ConfirmDeleteDialog (standard, geen rode banner) verschijnt.
- Klik 3-dots → 3 acties (Bekijken / Bewerken / Verwijderen) met Verwijderen rood + separator.
- Test op mobile-resize (< 640px): toolbar stack, tabel horizontaal scrollbaar, bulk-bar blijft bereikbaar.
- Triggertest: typ iets onzinnigs in zoek → ZeroResults met "Wis filters"-link.

- [ ] **Step 11: Commit-checkpoint**

Vraag commit `feat(leden): table-cleanup met toolbar, selectie, bulk-acties en stat-cards`.

### Taak 3.2: `/donaties`-migratie

**Files:**
- Modify: `src/app/donations/page.tsx`

- [ ] **Step 1: Lees huidige pagina (386 LOC)**

Identificeer: state, fetchAll, handleDelete (`confirm()` weer), tabel-render, modal.

- [ ] **Step 2: Imports + types**

Voeg dezelfde imports toe als bij `/leden` (zelfde lijst). Verwijder de bestaande inline `StatCard`-functie zodra je hem verderop vervangt.

- [ ] **Step 3: Methode-opties**

```tsx
const METHOD_OPTIONS = [
  { value: "all", label: "Alle methodes" },
  { value: "bank", label: "Bank" },
  { value: "online", label: "Online" },
  { value: "cash", label: "Contant" },
  { value: "other", label: "Overig" },
];
```

- [ ] **Step 4: Hook + delete-state**

Vervang state-blok in `DonationsInner`:

```tsx
const t = useTableState<DonationWithMember>({
  items: donations,
  rowKey: (d) => d.id,
  searchFields: (d) => {
    const name = d.member ? displayName(d.member) : (d.gift_agreement?.schenker_naam ?? "");
    return `${name} ${d.notes ?? ""} ${d.amount}`;
  },
  statusOf: (d) => d.method,
  dateOf: (d) => d.donated_at,
});

const [confirmState, setConfirmState] = useState<
  { mode: "single"; id: string; label: string } | { mode: "bulk"; ids: string[] } | null
>(null);

const askDeleteSingle = (d: DonationWithMember) => {
  const name = d.member ? displayName(d.member) : (d.gift_agreement?.schenker_naam ?? "Anoniem");
  setConfirmState({ mode: "single", id: d.id, label: `${fmtEuro(Number(d.amount))} van ${name}` });
};

const askDeleteBulk = () => {
  const ids = Array.from(t.selectedKeys);
  if (ids.length === 0) return;
  setConfirmState({ mode: "bulk", ids });
};

const performDelete = async () => {
  if (!confirmState) return;
  const ids = confirmState.mode === "single" ? [confirmState.id] : confirmState.ids;
  const { error } = await supabase.from("donations").delete().in("id", ids);
  if (error) {
    setError(error.message);
    return;
  }
  t.clearSelection();
  setConfirmState(null);
  await fetchAll();
};

const METHOD_LABEL_LOWER = METHOD_LABELS;

const handleExport = (rows: DonationWithMember[]) => {
  exportCsv(`donaties-${new Date().toISOString().slice(0, 10)}`, rows, [
    { key: "donated_at", label: "Datum", get: (d) => d.donated_at },
    { key: "donor", label: "Donateur", get: (d) =>
      d.member ? displayName(d.member) : (d.gift_agreement?.schenker_naam ?? "Anoniem") },
    { key: "amount", label: "Bedrag", get: (d) => Number(d.amount).toFixed(2).replace(".", ",") },
    { key: "method", label: "Methode", get: (d) => METHOD_LABEL_LOWER[d.method] },
    { key: "notes", label: "Omschrijving", get: (d) => d.notes ?? "" },
  ]);
};
```

- [ ] **Step 5: Vervang header + toolbar + tabel-render**

Identieke structuur als `/leden`, met:
- Toolbar status-options = `METHOD_OPTIONS`, label-prefix = `"Methode"`.
- 3-dots actions per rij: Bewerken + Verwijderen (financial mode).
- Bulk-bar met Exporteer + Verwijder (financial mode).
- ConfirmDeleteDialog mode = `"financial"`.
- Empty state: title `"Nog geen donaties"`, primary action "Donatie toevoegen".

```tsx
<ConfirmDeleteDialog
  open={confirmState !== null}
  onOpenChange={(o) => !o && setConfirmState(null)}
  mode="financial"
  title={
    confirmState?.mode === "single"
      ? "Donatie verwijderen?"
      : `${confirmState?.ids.length ?? 0} donaties verwijderen?`
  }
  description={
    confirmState?.mode === "single"
      ? `Donatie ${confirmState.label} wordt permanent verwijderd.`
      : "Geselecteerde donaties worden permanent verwijderd."
  }
  onConfirm={performDelete}
/>
```

- [ ] **Step 6: Build + lint**

```bash
npm run build && npm run lint
```

- [ ] **Step 7: Preview verify**

- Open `/donaties` met data → 3 stat-cards (ongewijzigd).
- Toolbar: zoek werkt op naam/omschrijving/bedrag, methode-dropdown filtert.
- Filter-popover periode op `donated_at`.
- Bulk delete: ConfirmDeleteDialog toont **rode banner met checkbox** — knop blijft disabled tot checkbox aan.
- Idem 3-dots delete per rij.

- [ ] **Step 8: Commit-checkpoint**

Vraag commit `feat(donaties): table-cleanup met toolbar, selectie, bulk-acties en financial confirm`.

### Taak 3.3: `/toezeggingen`-migratie

**Files:**
- Modify: `src/app/toezeggingen/page.tsx`

> Deze pagina is de meest complexe (869 LOC) door de gemixte lijst (pledges + gift_agreements). Volg dezelfde structuur, met deze afwijkingen:

- [ ] **Step 1: Lees huidige pagina volledig**

Identificeer:
- `ToezeggingRow` genormaliseerde type (regels ~109-140)
- Status-opties (`PLEDGE_STATUS_LABELS`)
- Markeer-als-betaald flow
- handleDelete (alleen pledges)

- [ ] **Step 2: Imports + helpers**

Voeg dezelfde imports toe. Definieer:

```tsx
const STATUS_OPTIONS = [
  { value: "all", label: "Alle toezeggingen" },
  { value: "open", label: "Open" },
  { value: "partial", label: "Deels betaald" },
  { value: "paid", label: "Voldaan" },
  { value: "cancelled", label: "Geannuleerd" },
];

function rowStatusKey(row: ToezeggingRow): string {
  // Pledges: open|partial|paid|cancelled. Gift_agreements payment_status: unpaid|partial|paid → mappen.
  if (row.type === "gift_agreement") {
    if (row.status === "unpaid") return "open";
    return row.status; // 'partial' | 'paid'
  }
  return row.status;
}

function rowDateKey(row: ToezeggingRow): string | null {
  return row.pledged_at;  // dit veld bevat al de genormaliseerde datum (pledged_at of akkoord_at)
}
```

- [ ] **Step 3: Hook met `isSelectable`**

```tsx
const t = useTableState<ToezeggingRow>({
  items: rows,
  rowKey: (r) => `${r.type}:${r.id}`,
  searchFields: (r) =>
    `${r.member_name} ${r.member_email ?? ""} ${r.description ?? ""} ${r.amount}`,
  statusOf: rowStatusKey,
  dateOf: rowDateKey,
  isSelectable: (r) => r.type === "pledge",
});

const [confirmState, setConfirmState] = useState<
  { mode: "single"; id: string; label: string } | { mode: "bulk"; ids: string[] } | null
>(null);
```

- [ ] **Step 4: Delete-flow + export**

```tsx
const askDeleteSinglePledge = (r: ToezeggingRow) => {
  if (r.type !== "pledge") return;
  setConfirmState({ mode: "single", id: r.id, label: `${fmtEuro(r.amount)} van ${r.member_name}` });
};

const askDeleteBulk = () => {
  const ids = Array.from(t.selectedKeys)
    .filter((k) => k.startsWith("pledge:"))
    .map((k) => k.slice("pledge:".length));
  if (ids.length === 0) return;
  setConfirmState({ mode: "bulk", ids });
};

const performDelete = async () => {
  if (!confirmState) return;
  const ids = confirmState.mode === "single" ? [confirmState.id] : confirmState.ids;
  const { error } = await supabase.from("pledges").delete().in("id", ids);
  if (error) {
    setError(error.message);
    return;
  }
  t.clearSelection();
  setConfirmState(null);
  await fetchAll();
};

const handleExport = (rowsToExport: ToezeggingRow[]) => {
  exportCsv(`toezeggingen-${new Date().toISOString().slice(0, 10)}`, rowsToExport, [
    { key: "type", label: "Type", get: (r) => r.source_label },
    { key: "donor", label: "Donateur", get: (r) => r.member_name },
    { key: "amount", label: "Bedrag", get: (r) => Number(r.amount).toFixed(2).replace(".", ",") },
    { key: "description", label: "Omschrijving", get: (r) => r.description ?? "" },
    { key: "pledged_at", label: "Toegezegd op", get: (r) => r.pledged_at ?? "" },
    { key: "deadline", label: "Deadline", get: (r) => r.deadline ?? "" },
    { key: "status", label: "Status", get: (r) => r.status },
  ]);
};
```

- [ ] **Step 5: Vervang header + toolbar + tabel**

- Stat-cards: hergebruik bestaande 3 cards via `<StatCard>`.
- Toolbar: status-dropdown `STATUS_OPTIONS`, period-filter, export, primary "Toezegging toevoegen".
- Tabel: header-checkbox + rij-checkbox alleen voor `r.type === "pledge"`. Voor gift_agreement-rijen render een lege `<TableCell />`.
- 3-dots acties dynamisch per type:

```tsx
const rowActions = (r: ToezeggingRow): RowAction[] => {
  if (r.type === "pledge") {
    return [
      { label: "Bekijken", icon: <Eye className="h-4 w-4" />, onClick: () => openView(r) },
      { label: "Bewerken", icon: <Pencil className="h-4 w-4" />, onClick: () => openEdit(r) },
      { label: "Markeer als betaald", icon: <Check className="h-4 w-4" />, onClick: () => openMatchModal(r) },
      { label: "Verwijderen", icon: <Trash2 className="h-4 w-4" />, destructive: true, separatorBefore: true, onClick: () => askDeleteSinglePledge(r) },
    ];
  }
  return [
    { label: "Bekijken", icon: <Eye className="h-4 w-4" />, onClick: () => openView(r) },
    { label: "Markeer als betaald", icon: <Check className="h-4 w-4" />, onClick: () => openMatchModal(r) },
  ];
};
```

> Importeer `Check` uit `lucide-react`. Behoud `openView` / `openEdit` / `openMatchModal` zoals nu in de pagina aanwezig.

```tsx
<TableCell>
  {r.type === "pledge" ? (
    <RowSelectCheckbox
      checked={t.selectedKeys.has(`pledge:${r.id}`)}
      onChange={() => t.toggleRow(`pledge:${r.id}`)}
      ariaLabel={`Selecteer toezegging ${r.member_name}`}
    />
  ) : null}
</TableCell>
```

- ConfirmDeleteDialog mode = `"financial"`.

- [ ] **Step 6: Build + lint**

```bash
npm run build && npm run lint
```

- [ ] **Step 7: Preview verify**

- Open `/toezeggingen` met gemixte data → tabel toont pledges én gift_agreements met type-badge.
- Header-checkbox: aanvinken selecteert ALLEEN pledge-rijen (gift_agreement-rijen blijven leeg). Bulk-bar toont `count` = aantal pledges.
- Klik checkbox naast gift_agreement-rij: cel is leeg, niets gebeurt.
- Klik 3-dots op pledge: 4 acties incl. Verwijderen (rood, separator).
- Klik 3-dots op gift_agreement: alleen Bekijken + Markeer als betaald (geen edit/delete).
- Bulk delete: financial confirm. Test annuleer + bevestig.
- Hoofd-Export-knop op gemixte data: levert CSV met alle gefilterde rijen incl. type-kolom.

- [ ] **Step 8: Commit-checkpoint**

Vraag commit `feat(toezeggingen): table-cleanup met dynamische rij-acties en mixed selectie`.

---

## Fase 4 — End-to-end verificatie

### Taak 4.1: Volledige build + lint

- [ ] **Step 1: Run build + lint**

```bash
npm run build && npm run lint
```

Verwacht: beide groen. Fix laatste issues.

### Taak 4.2: Cross-page smoke test in preview

- [ ] **Step 1: Start dev server**

Gebruik preview-tools — start server, navigeer naar elk van de 3 pagina's.

- [ ] **Step 2: Doorloop checklist per pagina**

Voor `/leden`, `/donaties`, `/toezeggingen`, verifieer:
1. Stat-cards correct.
2. Zoek werkt + ESC clear.
3. Status/methode-dropdown filtert.
4. Filter-popover periode-presets werken; chip onder toolbar; X reset.
5. Selectie checkboxes werken (en op /toezeggingen alleen pledges).
6. Bulk-bar verschijnt en toont juiste acties.
7. Bulk export downloadt CSV met juiste kolommen.
8. Bulk delete toont juiste confirm-mode (standard op /leden, financial op /donaties + /toezeggingen).
9. 3-dots menu per rij toont juiste acties.
10. Mobile-resize (sm: 640px, md: 768px) werkt.
11. ZeroResults state triggerbaar via random zoekterm.
12. EmptyState (alleen testbaar als pagina leeg is — bv. via DB-truc of nieuwe org).

### Taak 4.3: Console + network check

- [ ] **Step 1: Open DevTools console op elk van de 3 pagina's**

Verifieer: geen errors, geen warnings over keys/refs/aria.

- [ ] **Step 2: Check network calls**

Verifieer: geen extra fetches per filter-wijziging (alle filtering is client-side); selectie verandert geen network calls.

### Taak 4.4: Final commit-checkpoint

- [ ] **Step 1: Toon git log + status**

```bash
git log --oneline main..HEAD
git status
```

- [ ] **Step 2: Vraag gebruiker of branch klaar is voor merge**

Toon de full diff-sumamry; vraag of er nog losse polish-items zijn vóór merge naar main.

---

## Self-Review Notes

**Spec coverage check:**
- ✅ §2 scope: 3 pagina's afgedekt in Fase 3.
- ✅ §3.1 bestandsstructuur: alle bestanden in Fase 1+2.
- ✅ §3.2 hook-signatuur: Taak 1.4.
- ✅ §3.3 alle componenten: Taken 2.1–2.11 + 1.5.
- ✅ §4.1–4.3 per-pagina invulling: Taken 3.1–3.3.
- ✅ §5 states: Taken 2.8–2.10 + smoke test 4.2 stap 11.
- ✅ §6 mobile: smoke test 4.2 stap 10.
- ✅ §7 a11y: ingebouwd in componenten + aria-labels overal.
- ✅ §8 export-formaat: Taak 1.3 + handlers in Taken 3.x.
- ✅ §9 out-of-scope: niet in plan = niet bouwen.
- ✅ §10 decisions.md-entry: Taak 0.1.

**Type-consistentie check:**
- `Period`-type gedefinieerd in Taak 1.4, geïmporteerd in Taak 2.3. ✅
- `RowAction`-type in Taak 2.5; in Taak 3.3 gebruikt. ✅
- `BulkAction`-type in Taak 2.7; in Taken 3.x gebruikt. ✅
- `CsvColumn`-type in Taak 1.3; in Taken 3.x gebruikt. ✅
- `useTableState` returnt `clearSearch + resetFilters` (gebruikt in `ZeroResults` flow). ✅
- `RowSelectCheckbox` ref-handling met escape-pad in Taak 2.6 indien shadcn ref niet doorgeeft.

**Open punt om te onthouden:**
- shadcn `Checkbox` v1 ondersteunt mogelijk geen direct `ref` — Taak 2.6 stap 2 heeft fallback-instructie. Verifieer bij implementatie.
- Bestaande inline `StatCard` in `donations/page.tsx` en `toezeggingen/page.tsx` moet verwijderd zodra de nieuwe import werkt — dit is impliciet in Taak 3.x stap "vervang header"; expliciet checken bij build.
