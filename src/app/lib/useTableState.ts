"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { toLocalISODate } from "./formatters";

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

export function periodToRange(
  p: Period,
  now: Date = new Date()
): { from: string | null; to: string | null } {
  const y = now.getFullYear();
  const m = now.getMonth();
  const iso = toLocalISODate;

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
