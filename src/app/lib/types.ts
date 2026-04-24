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

export type ImportEntityType = "members" | "payments";
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
  created_at: string;
};

export type DonationWithMember = Donation & {
  member: {
    id: string;
    name: string | null;
    first_name: string | null;
    last_name: string | null;
  } | null;
};
