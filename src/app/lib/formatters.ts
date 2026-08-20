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

// Lokale datum als YYYY-MM-DD. Bewust géén toISOString(): die converteert naar
// UTC en verschuift in Nederland (UTC+1/+2) alles vóór 01:00/02:00 een dag terug.
export function toLocalISODate(d: Date): string {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
}

// Voor server-code (Vercel draait in UTC): "vandaag" vanuit Nederlands
// perspectief, onafhankelijk van de proces-tijdzone.
export function todayIsoAmsterdam(now: Date = new Date()): string {
  return new Intl.DateTimeFormat("en-CA", {
    timeZone: "Europe/Amsterdam",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).format(now);
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

export function initials(m: {
  first_name?: string | null;
  last_name?: string | null;
  name?: string | null;
}): string {
  const first = m.first_name?.trim();
  const last = m.last_name?.trim();
  if (first || last) {
    return `${first?.[0] ?? ""}${last?.[0] ?? ""}`.toUpperCase();
  }
  const parts = (m.name ?? "").trim().split(/\s+/).filter(Boolean);
  if (parts.length === 0) return "?";
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
  return `${parts[0][0]}${parts[parts.length - 1][0]}`.toUpperCase();
}
