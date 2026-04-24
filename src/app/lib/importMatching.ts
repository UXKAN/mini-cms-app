import { supabase } from "./supabase";
import type { Member } from "./types";
import type { MappedMemberRow } from "./importMapping";

export type MatchReason = "email" | "iban" | "name_postcode" | null;

export type MemberMatch = {
  member: Member | null;
  reason: MatchReason;
};

type LookupIndex = {
  byEmail: Map<string, Member>;
  byIban: Map<string, Member>;
  byNamePostcode: Map<string, Member>;
};

function normName(s: string | null | undefined): string {
  return (s ?? "").trim().toLowerCase();
}

function normIban(s: string | null | undefined): string {
  return (s ?? "").replace(/\s+/g, "").toUpperCase();
}

export async function loadLookupIndex(orgId: string): Promise<LookupIndex> {
  const { data, error } = await supabase
    .from("members")
    .select("*")
    .eq("org_id", orgId);
  if (error) throw error;
  const members = (data ?? []) as Member[];

  const byEmail = new Map<string, Member>();
  const byIban = new Map<string, Member>();
  const byNamePostcode = new Map<string, Member>();

  for (const m of members) {
    if (m.email) byEmail.set(m.email.trim().toLowerCase(), m);
    if (m.iban) byIban.set(normIban(m.iban), m);
    const first = normName(m.first_name);
    const last = normName(m.last_name);
    const pc = normName(m.postcode);
    if ((first || last) && pc) {
      byNamePostcode.set(`${first}|${last}|${pc}`, m);
    }
  }

  return { byEmail, byIban, byNamePostcode };
}

export function findMatch(index: LookupIndex, row: MappedMemberRow): MemberMatch {
  if (row.email) {
    const hit = index.byEmail.get(row.email.trim().toLowerCase());
    if (hit) return { member: hit, reason: "email" };
  }
  if (row.iban) {
    const hit = index.byIban.get(normIban(row.iban));
    if (hit) return { member: hit, reason: "iban" };
  }
  if ((row.first_name || row.last_name) && row.postcode) {
    const key = `${normName(row.first_name)}|${normName(row.last_name)}|${normName(row.postcode)}`;
    const hit = index.byNamePostcode.get(key);
    if (hit) return { member: hit, reason: "name_postcode" };
  }
  return { member: null, reason: null };
}

/**
 * Compute the fill-empty diff: keys from `incoming` that the existing member
 * does not yet have a non-empty value for. Never overwrites populated fields.
 */
export function computeFillDiff(
  existing: Member,
  incoming: MappedMemberRow
): Partial<MappedMemberRow> {
  const diff: Partial<MappedMemberRow> = {};
  const keys: (keyof MappedMemberRow)[] = [
    "first_name",
    "last_name",
    "name",
    "email",
    "phone",
    "address",
    "postcode",
    "city",
    "iban",
    "membership_type",
    "monthly_amount",
    "start_date",
    "status",
    "notes",
  ];
  for (const k of keys) {
    const incomingVal = incoming[k];
    if (incomingVal == null || incomingVal === "") continue;
    const existingVal = (existing as unknown as Record<string, unknown>)[k];
    const existingEmpty = existingVal == null || existingVal === "";
    if (existingEmpty) {
      (diff as Record<string, unknown>)[k] = incomingVal;
    }
  }
  return diff;
}
