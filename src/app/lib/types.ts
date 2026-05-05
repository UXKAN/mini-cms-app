export type MemberStatus = "active" | "inactive" | "prospect" | "cancelled";

export type Member = {
  id: string;
  user_id: string;
  org_id: string;
  name: string | null;
  first_name: string | null;
  last_name: string | null;
  email: string | null;
  phone: string | null;
  address: string | null;
  postcode: string | null;
  city: string | null;
  iban: string | null;
  membership_type: string | null;
  monthly_amount: number | null;
  start_date: string | null;
  status: MemberStatus;
  notes: string | null;
  last_import_id: string | null;
  created_at: string;
};

export type Organization = {
  id: string;
  name: string;
  rsin: string | null;
  created_at: string;
};

export type OrganizationMember = {
  org_id: string;
  user_id: string;
  role: "owner" | "admin";
  created_at: string;
};

export type ImportEntityType = "members" | "donations" | "pledges";
export type ImportStatus = "pending" | "committed" | "rolled_back";
export type ImportRowAction = "insert" | "update" | "skip" | "error";

export type ImportRecord = {
  id: string;
  org_id: string;
  user_id: string;
  entity_type: ImportEntityType;
  source: string;
  file_name: string | null;
  row_count: number;
  inserted_count: number;
  updated_count: number;
  skipped_count: number;
  error_count: number;
  status: ImportStatus;
  created_at: string;
  committed_at: string | null;
};

export type ImportRow = {
  id: string;
  import_id: string;
  row_number: number;
  raw: Record<string, unknown>;
  mapped: Record<string, unknown> | null;
  action: ImportRowAction;
  target_id: string | null;
  reason: string | null;
  created_at: string;
};

export type DonationMethod = "cash" | "bank" | "online" | "other";
export type DonationSource =
  | "manual"
  | "csv"
  | "mt940"
  | "stripe"
  | "gift_form"
  | "cash_form";

export type Donation = {
  id: string;
  user_id: string;
  org_id: string;
  member_id: string | null;
  amount: number;
  currency: string;
  method: DonationMethod;
  donated_at: string; // YYYY-MM-DD
  notes: string | null;
  pledge_id: string | null;
  gift_agreement_id: string | null;
  signature_png: string | null;
  receipt_photo_url: string | null;
  source: DonationSource | null;
  external_ref: string | null;
  created_at: string;
};

export type DonationWithMember = Donation & {
  member: {
    id: string;
    name: string | null;
    first_name: string | null;
    last_name: string | null;
  } | null;
  gift_agreement: {
    id: string;
    schenker_naam: string;
  } | null;
};

export type PledgeStatus = "open" | "partial" | "paid" | "cancelled";
export type PledgeSource = "verbal" | "email" | "event" | "form" | "other";

export type Pledge = {
  id: string;
  org_id: string;
  member_id: string | null;
  amount: number;
  purpose: string | null;
  pledged_at: string | null;
  deadline: string | null;
  status: PledgeStatus;
  source: PledgeSource | null;
  notes: string | null;
  created_at: string;
};

export type GiftAgreementType = "periodieke" | "eenmalige";
export type GiftAgreementPaymentMethod = "cash" | "bank" | "online";
export type GiftAgreementPaymentStatus = "unpaid" | "partial" | "paid";
export type GiftAgreementStatus =
  | "signed"
  | "lapsed"
  | "withdrawn"
  | "completed";

export type GiftAgreement = {
  id: string;
  org_id: string | null;
  reference_code: string;
  member_id: string | null;
  type: GiftAgreementType;

  schenker_naam: string;
  schenker_geboortedatum: string;
  schenker_telefoon: string;
  schenker_adres: string;
  schenker_postcode: string | null;
  schenker_woonplaats: string | null;
  schenker_land: string;
  schenker_email: string;

  bedrag_per_maand: number | null;
  startdatum: string | null;
  bedrag_eenmalig: number | null;

  payment_method_intent: GiftAgreementPaymentMethod | null;
  payment_status: GiftAgreementPaymentStatus | null;
  paid_at: string | null;

  wants_membership: boolean | null;

  akkoord_overeenkomst: boolean;
  akkoord_at: string | null;
  iban: string;
  rekeninghouder: string;
  ondertekening_plaats: string;
  ondertekening_datum: string;
  ondertekening_naam: string;
  ondertekening_handtekening_png: string;

  agreement_status: GiftAgreementStatus;
  purpose: string | null;
  created_at: string;
};
