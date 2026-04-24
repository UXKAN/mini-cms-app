import type { MemberStatus } from "./types";

export type MemberCrmField =
  | "first_name"
  | "last_name"
  | "name"
  | "email"
  | "phone"
  | "address"
  | "postcode"
  | "city"
  | "iban"
  | "membership_type"
  | "monthly_amount"
  | "start_date"
  | "status"
  | "notes";

export type MappingTarget = MemberCrmField | "ignore";

export type FieldDef = {
  key: MemberCrmField;
  label: string;
  aliases: string[];
};

export const MEMBER_FIELD_DEFS: FieldDef[] = [
  { key: "first_name", label: "Voornaam", aliases: ["voornaam", "firstname", "first name", "given name"] },
  { key: "last_name", label: "Achternaam", aliases: ["achternaam", "lastname", "last name", "surname", "family name"] },
  { key: "name", label: "Volledige naam", aliases: ["naam", "full name", "volledige naam", "name"] },
  { key: "email", label: "E-mail", aliases: ["email", "e-mail", "emailadres", "mail"] },
  { key: "phone", label: "Telefoon", aliases: ["telefoon", "telefoonnummer", "phone", "mobile", "mobiel", "gsm", "tel"] },
  { key: "address", label: "Adres", aliases: ["adres", "address", "straat", "street", "straatnaam"] },
  { key: "postcode", label: "Postcode", aliases: ["postcode", "zip", "zipcode", "postal code"] },
  { key: "city", label: "Woonplaats", aliases: ["woonplaats", "stad", "city", "plaats"] },
  { key: "iban", label: "IBAN", aliases: ["iban", "rekening", "rekeningnummer", "bank account", "account"] },
  { key: "membership_type", label: "Lidmaatschapstype", aliases: ["lidmaatschap", "type", "membership", "membership type", "lidmaatschapstype"] },
  { key: "monthly_amount", label: "Maandbedrag", aliases: ["bedrag", "maandbedrag", "amount", "monthly", "contributie"] },
  { key: "start_date", label: "Startdatum", aliases: ["startdatum", "start date", "sinds", "lid sinds", "begin"] },
  { key: "status", label: "Status", aliases: ["status", "actief", "active"] },
  { key: "notes", label: "Notities", aliases: ["notities", "notes", "opmerkingen", "opmerking", "remarks"] },
];

export function normalizeHeader(h: string): string {
  return h
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/[\s_\-.]+/g, " ")
    .trim();
}

export function detectMapping(headers: string[]): Record<string, MappingTarget> {
  const used = new Set<MemberCrmField>();
  const mapping: Record<string, MappingTarget> = {};

  for (const h of headers) {
    const normalized = normalizeHeader(h);
    let match: MemberCrmField | null = null;
    for (const def of MEMBER_FIELD_DEFS) {
      if (used.has(def.key)) continue;
      if (def.aliases.some((a) => normalizeHeader(a) === normalized)) {
        match = def.key;
        break;
      }
    }
    if (match) {
      mapping[h] = match;
      used.add(match);
    } else {
      mapping[h] = "ignore";
    }
  }

  return mapping;
}

export type MappedMemberRow = {
  first_name: string | null;
  last_name: string | null;
  name: string | null;
  email: string | null;
  phone: string | null;
  address: string | null;
  postcode: string | null;
  city: string | null;
  iban: string | null;
  membership_type: string | null;
  monthly_amount: number | null;
  start_date: string | null;
  status: MemberStatus | null;
  notes: string | null;
};

function toText(v: unknown): string | null {
  if (v == null) return null;
  const s = String(v).trim();
  return s === "" ? null : s;
}

function toAmount(v: unknown): number | null {
  const s = toText(v);
  if (!s) return null;
  // Handle Dutch comma decimals: "12,50" → 12.50; keep existing dots.
  const cleaned = s.replace(/[^\d,.-]/g, "").replace(/\.(?=\d{3}(\D|$))/g, "").replace(",", ".");
  const n = Number(cleaned);
  return Number.isFinite(n) ? n : null;
}

function toDate(v: unknown): string | null {
  const s = toText(v);
  if (!s) return null;
  // ISO yyyy-mm-dd passes through.
  if (/^\d{4}-\d{2}-\d{2}$/.test(s)) return s;
  // Dutch dd-mm-yyyy or dd/mm/yyyy.
  const dm = s.match(/^(\d{1,2})[\/\-.](\d{1,2})[\/\-.](\d{2,4})$/);
  if (dm) {
    const [, d, m, y] = dm;
    const yyyy = y.length === 2 ? `20${y}` : y;
    return `${yyyy}-${m.padStart(2, "0")}-${d.padStart(2, "0")}`;
  }
  // Excel serial date (number of days since 1899-12-30).
  const asNum = Number(s);
  if (Number.isFinite(asNum) && asNum > 25000 && asNum < 60000) {
    const epoch = new Date(Date.UTC(1899, 11, 30));
    epoch.setUTCDate(epoch.getUTCDate() + Math.floor(asNum));
    return epoch.toISOString().slice(0, 10);
  }
  const parsed = new Date(s);
  if (!Number.isNaN(parsed.getTime())) return parsed.toISOString().slice(0, 10);
  return null;
}

function toIban(v: unknown): string | null {
  const s = toText(v);
  if (!s) return null;
  return s.replace(/\s+/g, "").toUpperCase();
}

const STATUS_SYNONYMS: Record<string, MemberStatus> = {
  actief: "active",
  active: "active",
  ja: "active",
  yes: "active",
  inactief: "inactive",
  inactive: "inactive",
  prospect: "prospect",
  lead: "prospect",
  opgezegd: "cancelled",
  cancelled: "cancelled",
  canceled: "cancelled",
  gestopt: "cancelled",
};

function toStatus(v: unknown): MemberStatus | null {
  const s = toText(v);
  if (!s) return null;
  return STATUS_SYNONYMS[s.toLowerCase()] ?? null;
}

export function applyMapping(
  row: Record<string, unknown>,
  mapping: Record<string, MappingTarget>
): MappedMemberRow {
  const out: MappedMemberRow = {
    first_name: null,
    last_name: null,
    name: null,
    email: null,
    phone: null,
    address: null,
    postcode: null,
    city: null,
    iban: null,
    membership_type: null,
    monthly_amount: null,
    start_date: null,
    status: null,
    notes: null,
  };

  for (const [sourceHeader, target] of Object.entries(mapping)) {
    if (target === "ignore") continue;
    const raw = row[sourceHeader];
    switch (target) {
      case "monthly_amount":
        out.monthly_amount = toAmount(raw);
        break;
      case "start_date":
        out.start_date = toDate(raw);
        break;
      case "iban":
        out.iban = toIban(raw);
        break;
      case "email": {
        const s = toText(raw);
        out.email = s ? s.toLowerCase() : null;
        break;
      }
      case "status":
        out.status = toStatus(raw);
        break;
      default:
        out[target] = toText(raw);
        break;
    }
  }

  // If a split first/last is present but no combined name, synthesize it for
  // the legacy `name` column so the data still renders in old UIs.
  if (!out.name && (out.first_name || out.last_name)) {
    out.name = [out.first_name, out.last_name].filter(Boolean).join(" ").trim() || null;
  }

  return out;
}

export function hasIdentity(m: MappedMemberRow): boolean {
  return Boolean(
    (m.first_name && m.last_name) || m.name || m.email || m.iban
  );
}

export function buildTemplateCsv(): string {
  const headers = MEMBER_FIELD_DEFS.map((d) => d.key).join(",");
  const example1 = [
    "Jan",
    "Jansen",
    "Jan Jansen",
    "jan@example.com",
    "0612345678",
    "Hoofdstraat 1",
    "7511AB",
    "Enschede",
    "NL00BANK0123456789",
    "Regulier",
    "15.00",
    "2023-01-01",
    "active",
    "Bestuurslid",
  ].join(",");
  const example2 = [
    "Fatima",
    "Ali",
    "",
    "fatima@example.com",
    "",
    "",
    "",
    "",
    "",
    "Jeugdlid",
    "7.50",
    "",
    "active",
    "",
  ].join(",");
  return `${headers}\n${example1}\n${example2}\n`;
}
