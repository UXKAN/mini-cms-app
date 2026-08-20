"use client";

import Link from "next/link";
import { useCallback, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "../lib/supabase";
import { useAuth } from "../lib/useAuth";
import AppShell from "../components/AppShell";
import MemberImporter from "../components/MemberImporter";
import { PageHeader } from "../components/PageHeader";
import { useOrg } from "../lib/orgContext";
import type { Member, MemberStatus } from "../lib/types";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
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
import { fmtDate, fmtEuro, displayName, initials, toLocalISODate } from "../lib/formatters";
import { Users, Trash2, Download, Eye, Pencil } from "lucide-react";
import { toast } from "sonner";

const STATUS_OPTIONS: { value: MemberStatus; label: string }[] = [
  { value: "active", label: "Actief" },
  { value: "inactive", label: "Inactief" },
  { value: "prospect", label: "Prospect" },
  { value: "cancelled", label: "Opgezegd" },
];

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

type ModalMode = "closed" | "add" | "edit" | "import";

const COL_HEAD =
  "text-[10px] font-semibold uppercase tracking-[0.12em] text-muted-foreground";
const CELL = "px-4 py-3.5";
const PILL =
  "inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold";

const STATUS_PILL: Record<MemberStatus, { label: string; tone: string }> = {
  active: { label: "Actief", tone: "bg-[var(--accent-light)] text-primary" },
  inactive: {
    label: "Inactief",
    tone: "bg-[var(--surface-zone)] text-muted-foreground",
  },
  prospect: {
    label: "Prospect",
    tone: "bg-[var(--warn-light)] text-[var(--warn)]",
  },
  cancelled: {
    label: "Opgezegd",
    tone: "bg-[var(--error-light)] text-destructive",
  },
};

function StatusPill({ status }: { status: MemberStatus }) {
  const { label, tone } = STATUS_PILL[status];
  return <span className={`${PILL} ${tone}`}>{label}</span>;
}

function MembershipTypeChip({ type }: { type: string | null }) {
  if (!type) return <span className="text-sm text-muted-foreground">—</span>;
  const label =
    type === "lid" ? "Lid" : type === "donateur" ? "Donateur" : type;
  return (
    <span className={`${PILL} bg-[var(--surface-zone)] text-muted-foreground`}>
      {label}
    </span>
  );
}

function MembersInner() {
  const org = useOrg();
  const router = useRouter();

  const [members, setMembers] = useState<Member[]>([]);
  const [agreementAmounts, setAgreementAmounts] = useState<Map<string, number>>(
    new Map()
  );
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [modalMode, setModalMode] = useState<ModalMode>("closed");
  const [editing, setEditing] = useState<Member | null>(null);

  const t = useTableState<Member>({
    items: members,
    rowKey: (m) => m.id,
    searchFields: (m) =>
      [m.first_name, m.last_name, m.name, m.email].filter(Boolean).join(" "),
    statusOf: memberStatusKey,
    dateOf: (m) => m.created_at,
  });

  const [confirmState, setConfirmState] = useState<
    | { mode: "single"; id: string; name: string }
    | { mode: "bulk"; ids: string[] }
    | null
  >(null);

  const fetchMembers = useCallback(async () => {
    setLoading(true);
    setError(null);
    const [memRes, giftRes] = await Promise.all([
      supabase
        .from("members")
        .select("*")
        .eq("org_id", org.id)
        .order("created_at", { ascending: false }),
      supabase
        .from("gift_agreements")
        .select("member_id, bedrag_per_maand, agreement_status")
        .eq("organization_id", org.id)
        .eq("type", "periodieke")
        .eq("agreement_status", "signed")
        .not("member_id", "is", null),
    ]);
    if (memRes.error) {
      setError(memRes.error.message);
      setLoading(false);
      return;
    }
    setMembers((memRes.data ?? []) as Member[]);

    // Aggregeer bedrag_per_maand per member (bv. iemand met 2 actieve akten)
    const map = new Map<string, number>();
    (giftRes.data ?? []).forEach((g) => {
      if (!g.member_id) return;
      const cur = map.get(g.member_id) ?? 0;
      map.set(g.member_id, cur + Number(g.bedrag_per_maand ?? 0));
    });
    setAgreementAmounts(map);

    setLoading(false);
  }, [org.id]);

  useEffect(() => {
    fetchMembers();
  }, [fetchMembers]);

  const openAdd = () => { setEditing(null); setModalMode("add"); };
  const openEdit = (m: Member) => { setEditing(m); setModalMode("edit"); };
  const closeModal = () => { setModalMode("closed"); setEditing(null); };

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
    const { error: delError } = await supabase.from("members").delete().in("id", ids);
    if (delError) {
      setError(delError.message);
      return false;
    }
    t.clearSelection();
    setConfirmState(null);
    toast.success(
      ids.length === 1 ? "Lid verwijderd" : `${ids.length} leden verwijderd`
    );
    await fetchMembers();
  };

  const handleExport = (rows: Member[]) => {
    exportCsv(`leden-${toLocalISODate(new Date())}`, rows, [
      { key: "name", label: "Naam", get: (m) => displayName(m) },
      { key: "type", label: "Type", get: (m) => m.membership_type ?? "" },
      { key: "status", label: "Status", get: (m) => m.status },
      { key: "email", label: "E-mail", get: (m) => m.email ?? "" },
      { key: "phone", label: "Telefoon", get: (m) => m.phone ?? "" },
      {
        key: "monthly",
        label: "Bedrag/maand",
        get: (m) => m.monthly_amount ?? agreementAmounts.get(m.id) ?? "",
      },
      { key: "created_at", label: "Aangemaakt", get: (m) => m.created_at },
    ]);
  };

  return (
    <>
      <PageHeader
        title="Leden"
        subtitle={loading ? "Laden…" : `${members.length} leden & donateurs`}
      >
        <Button onClick={openAdd}>Nieuw lid</Button>
      </PageHeader>

      {error && (
        <div className="mb-4 rounded-[10px] bg-[var(--error-light)] p-3 text-sm text-destructive">
          {error}
        </div>
      )}

      {!t.isEmpty && (
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
          <StatCard
            featured
            label="Totaal leden & donateurs"
            value={String(members.length)}
          />
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
              onClick={() => handleExport(t.filteredItems)}
              disabled={t.filteredItems.length === 0}
            >
              <Download className="h-4 w-4 mr-2" />
              Export
            </Button>
          </>
        }
      />

      <ActiveFilterChips
        period={t.period}
        onClear={() => t.setPeriod({ preset: "all" })}
      />

      {loading ? (
        <TableLoadingState columns={6} />
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
        <div className="overflow-hidden rounded-lg bg-card shadow-[var(--shadow)]">
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
                <TableHead className={COL_HEAD}>Naam</TableHead>
                <TableHead className={`${COL_HEAD} hidden sm:table-cell`}>
                  Type
                </TableHead>
                <TableHead className={COL_HEAD}>Status</TableHead>
                <TableHead className={`${COL_HEAD} text-right`}>
                  Bedrag/maand
                </TableHead>
                <TableHead className={`${COL_HEAD} hidden md:table-cell`}>
                  Aangemaakt
                </TableHead>
                <TableHead className="w-10" />
              </TableRow>
            </TableHeader>
            <TableBody>
              {t.filteredItems.map((m) => (
                <TableRow
                  key={m.id}
                  data-state={t.selectedKeys.has(m.id) ? "selected" : undefined}
                >
                  <TableCell className={CELL}>
                    <RowSelectCheckbox
                      checked={t.selectedKeys.has(m.id)}
                      onChange={() => t.toggleRow(m.id)}
                      ariaLabel={`Selecteer ${displayName(m)}`}
                    />
                  </TableCell>
                  <TableCell className={CELL}>
                    <div className="flex items-center gap-3">
                      <span
                        aria-hidden="true"
                        className="grid h-8 w-8 shrink-0 place-items-center rounded-full bg-[var(--accent-light)] text-[11px] font-bold text-primary"
                      >
                        {initials(m)}
                      </span>
                      <div className="min-w-0">
                        <Link
                          href={`/members/${m.id}`}
                          className="block truncate text-[13px] font-semibold text-foreground hover:underline"
                        >
                          {displayName(m)}
                        </Link>
                        <div className="truncate text-xs text-muted-foreground">
                          {m.email ?? "geen e-mail"}
                        </div>
                      </div>
                    </div>
                  </TableCell>
                  <TableCell className={`${CELL} hidden sm:table-cell`}>
                    <MembershipTypeChip type={m.membership_type} />
                  </TableCell>
                  <TableCell className={CELL}>
                    <StatusPill status={m.status} />
                  </TableCell>
                  <TableCell className={`${CELL} text-right font-semibold`}>
                    {fmtEuro(
                      m.monthly_amount != null
                        ? m.monthly_amount
                        : (agreementAmounts.get(m.id) ?? null)
                    )}
                  </TableCell>
                  <TableCell
                    className={`${CELL} hidden md:table-cell text-muted-foreground`}
                  >
                    {fmtDate(m.created_at)}
                  </TableCell>
                  <TableCell className={CELL}>
                    <RowActionsMenu
                      actions={[
                        {
                          label: "Bekijken",
                          icon: <Eye className="h-4 w-4" />,
                          onClick: () => router.push(`/members/${m.id}`),
                        },
                        {
                          label: "Bewerken",
                          icon: <Pencil className="h-4 w-4" />,
                          onClick: () => openEdit(m),
                        },
                        {
                          label: "Verwijderen",
                          icon: <Trash2 className="h-4 w-4" />,
                          destructive: true,
                          separatorBefore: true,
                          onClick: () => askDeleteSingle(m),
                        },
                      ]}
                    />
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      )}

      <TableBulkBar
        count={t.selectedKeys.size}
        onClear={t.clearSelection}
        actions={[
          {
            label: `Exporteer ${t.selectedKeys.size}`,
            icon: <Download className="h-4 w-4" />,
            onClick: () =>
              handleExport(members.filter((m) => t.selectedKeys.has(m.id))),
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
            ? "Lid verwijderen?"
            : `${confirmState?.mode === "bulk" ? confirmState.ids.length : 0} leden verwijderen?`
        }
        description={
          confirmState?.mode === "single"
            ? `${confirmState.name} wordt permanent verwijderd.`
            : "Geselecteerde leden worden permanent verwijderd."
        }
        onConfirm={performDelete}
      />

      {/* Add / Edit dialog */}
      <Dialog
        open={modalMode === "add" || modalMode === "edit"}
        onOpenChange={(open) => { if (!open) closeModal(); }}
      >
        <DialogContent className="max-w-[640px]">
          <DialogHeader>
            <DialogTitle>
              {modalMode === "edit" ? "Lid bewerken" : "Nieuw lid"}
            </DialogTitle>
          </DialogHeader>
          <MemberForm
            initial={editing}
            onSaved={async () => { closeModal(); await fetchMembers(); }}
            onCancel={closeModal}
          />
        </DialogContent>
      </Dialog>

      {/* Import dialog */}
      <Dialog
        open={modalMode === "import"}
        onOpenChange={(open) => { if (!open) closeModal(); }}
      >
        <DialogContent className="max-w-[960px]">
          <DialogHeader>
            <DialogTitle>Leden importeren</DialogTitle>
          </DialogHeader>
          <MemberImporter
            showReportLink={false}
            onDone={async () => {
              closeModal();
              toast.success("Import afgerond");
              await fetchMembers();
            }}
          />
        </DialogContent>
      </Dialog>
    </>
  );
}

export default function MembersPage() {
  return (
    <AppShell>
      <MembersInner />
    </AppShell>
  );
}

function MemberForm({
  initial,
  onSaved,
  onCancel,
}: {
  initial: Member | null;
  onSaved: () => void | Promise<void>;
  onCancel: () => void;
}) {
  const { user } = useAuth();
  const org = useOrg();

  const [firstName, setFirstName] = useState(initial?.first_name ?? "");
  const [lastName, setLastName] = useState(
    initial?.last_name ?? (initial?.first_name ? "" : initial?.name ?? "")
  );
  const [email, setEmail] = useState(initial?.email ?? "");
  const [phone, setPhone] = useState(initial?.phone ?? "");
  const [address, setAddress] = useState(initial?.address ?? "");
  const [postcode, setPostcode] = useState(initial?.postcode ?? "");
  const [city, setCity] = useState(initial?.city ?? "");
  const [iban, setIban] = useState(initial?.iban ?? "");
  const [membershipType, setMembershipType] = useState(initial?.membership_type ?? "");
  const [monthlyAmount, setMonthlyAmount] = useState(
    initial?.monthly_amount != null ? String(initial.monthly_amount) : ""
  );
  const [startDate, setStartDate] = useState(initial?.start_date ?? "");
  const [status, setStatus] = useState<MemberStatus>(initial?.status ?? "active");
  const [notes, setNotes] = useState(initial?.notes ?? "");
  const [saving, setSaving] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;
    const hasName = firstName.trim() || lastName.trim();
    if (!hasName) {
      setFormError("Vul minimaal een voornaam of achternaam in.");
      return;
    }
    setSaving(true);
    setFormError(null);

    const payload = {
      first_name: firstName.trim() || null,
      last_name: lastName.trim() || null,
      name: [firstName.trim(), lastName.trim()].filter(Boolean).join(" ") || null,
      email: email.trim() || null,
      phone: phone.trim() || null,
      address: address.trim() || null,
      postcode: postcode.trim() || null,
      city: city.trim() || null,
      iban: iban.trim().replace(/\s+/g, "").toUpperCase() || null,
      membership_type: membershipType.trim() || null,
      monthly_amount: monthlyAmount.trim() ? Number(monthlyAmount) : null,
      start_date: startDate || null,
      status,
      notes: notes.trim() || null,
    };

    const { error } = initial
      ? await supabase.from("members").update(payload).eq("id", initial.id)
      : await supabase
          .from("members")
          .insert({ ...payload, user_id: user.id, org_id: org.id });

    if (error) {
      setFormError(error.message);
      setSaving(false);
    } else {
      setSaving(false);
      toast.success(initial ? "Lid opgeslagen" : "Lid toegevoegd");
      await onSaved();
    }
  };

  const inputCls = "h-10 text-sm";

  return (
    <form onSubmit={handleSubmit}>
      <div className="grid grid-cols-2 gap-3">
        <Input
          placeholder="Voornaam *"
          value={firstName}
          onChange={(e) => setFirstName(e.target.value)}
          className={inputCls}
        />
        <Input
          placeholder="Achternaam"
          value={lastName}
          onChange={(e) => setLastName(e.target.value)}
          className={inputCls}
        />
        <Input
          type="email"
          placeholder="E-mail"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className={inputCls}
        />
        <Input
          placeholder="Telefoon"
          value={phone}
          onChange={(e) => setPhone(e.target.value)}
          className={inputCls}
        />
        <Input
          placeholder="Adres"
          value={address}
          onChange={(e) => setAddress(e.target.value)}
          className={`${inputCls} col-span-2`}
        />
        <Input
          placeholder="Postcode"
          value={postcode}
          onChange={(e) => setPostcode(e.target.value)}
          className={inputCls}
        />
        <Input
          placeholder="Woonplaats"
          value={city}
          onChange={(e) => setCity(e.target.value)}
          className={inputCls}
        />
        <Input
          placeholder="IBAN"
          value={iban}
          onChange={(e) => setIban(e.target.value)}
          className={inputCls}
        />
        <Input
          placeholder="Lidmaatschapstype"
          value={membershipType}
          onChange={(e) => setMembershipType(e.target.value)}
          className={inputCls}
        />
        <Input
          type="number"
          step="0.01"
          min="0"
          placeholder="Maandbedrag"
          value={monthlyAmount}
          onChange={(e) => setMonthlyAmount(e.target.value)}
          className={inputCls}
        />
        <Input
          type="date"
          value={startDate}
          onChange={(e) => setStartDate(e.target.value)}
          className={inputCls}
        />
        <div className="flex flex-col gap-1.5">
          <Label className="text-xs text-muted-foreground">Status</Label>
          <select
            value={status}
            onChange={(e) => setStatus(e.target.value as MemberStatus)}
            className="h-10 rounded-md border border-border bg-background px-3 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-ring"
          >
            {STATUS_OPTIONS.map((o) => (
              <option key={o.value} value={o.value}>
                {o.label}
              </option>
            ))}
          </select>
        </div>
        <Input
          placeholder="Notities"
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
          className={`${inputCls} col-span-2`}
        />
      </div>

      {formError && (
        <div className="mt-4 rounded-[10px] bg-[var(--error-light)] p-3 text-sm text-destructive">
          {formError}
        </div>
      )}

      <div className="flex gap-2 mt-5 justify-end">
        <Button type="button" variant="outline" onClick={onCancel} disabled={saving}>
          Annuleren
        </Button>
        <Button type="submit" disabled={saving}>
          {saving ? "Opslaan…" : initial ? "Opslaan" : "Toevoegen"}
        </Button>
      </div>
    </form>
  );
}
