"use client";

import Link from "next/link";
import { useCallback, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "../lib/supabase";
import { useAuth } from "../lib/useAuth";
import AppShell from "../components/AppShell";
import MemberImporter from "../components/MemberImporter";
import { useOrg } from "../lib/orgContext";
import type { Member, MemberStatus } from "../lib/types";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
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
import { fmtDate, fmtEuro, displayName } from "../lib/formatters";
import { Users, Trash2, Download, Eye, Pencil } from "lucide-react";

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

function StatusBadge({ status }: { status: MemberStatus }) {
  if (status === "active") return <Badge>Actief</Badge>;
  if (status === "inactive") return <Badge variant="secondary">Inactief</Badge>;
  if (status === "cancelled") return <Badge variant="destructive">Opgezegd</Badge>;
  return (
    <Badge
      variant="outline"
      style={{ borderColor: "var(--warn)", color: "var(--warn)" }}
    >
      Prospect
    </Badge>
  );
}

function MembershipTypeBadge({ type }: { type: string | null }) {
  if (!type) return <span className="text-muted-foreground text-sm">—</span>;
  if (type === "lid")
    return (
      <Badge className="bg-emerald-100 text-emerald-900 hover:bg-emerald-100">
        Lid
      </Badge>
    );
  if (type === "donateur")
    return (
      <Badge className="bg-sky-100 text-sky-900 hover:bg-sky-100">
        Donateur
      </Badge>
    );
  return <Badge variant="secondary">{type}</Badge>;
}

function MembersInner() {
  const { user } = useAuth();
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
    if (user) fetchMembers();
  }, [user, fetchMembers]);

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
      return;
    }
    t.clearSelection();
    setConfirmState(null);
    await fetchMembers();
  };

  const handleExport = (rows: Member[]) => {
    exportCsv(`leden-${new Date().toISOString().slice(0, 10)}`, rows, [
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
      <div className="flex justify-between items-end mb-7 gap-4 flex-wrap">
        <div>
          <h1 className="font-serif text-4xl font-normal text-foreground">Leden</h1>
          <p className="text-muted-foreground text-sm mt-1">
            Beheer leden en donateurs van de moskee.
          </p>
        </div>
      </div>

      {error && (
        <div
          className="p-3 rounded-[7px] mb-4 text-sm"
          style={{ background: "var(--error-light)", color: "var(--error)" }}
        >
          {error}
        </div>
      )}

      {!t.isEmpty && (
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
          <StatCard
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

      <ActiveFilterChips
        period={t.period}
        onClear={() => t.setPeriod({ preset: "all" })}
      />

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
        <div
          className="rounded-[10px] border border-border overflow-hidden"
          style={{ background: "var(--surface)" }}
        >
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
                <TableHead className="w-10" />
              </TableRow>
            </TableHeader>
            <TableBody>
              {t.filteredItems.map((m) => (
                <TableRow
                  key={m.id}
                  data-state={t.selectedKeys.has(m.id) ? "selected" : undefined}
                >
                  <TableCell>
                    <RowSelectCheckbox
                      checked={t.selectedKeys.has(m.id)}
                      onChange={() => t.toggleRow(m.id)}
                      ariaLabel={`Selecteer ${displayName(m)}`}
                    />
                  </TableCell>
                  <TableCell className="font-medium">
                    <Link href={`/members/${m.id}`} className="hover:underline">
                      {displayName(m)}
                    </Link>
                  </TableCell>
                  <TableCell>
                    <MembershipTypeBadge type={m.membership_type} />
                  </TableCell>
                  <TableCell>
                    <StatusBadge status={m.status} />
                  </TableCell>
                  <TableCell>{m.email ?? "—"}</TableCell>
                  <TableCell className="text-right">
                    {fmtEuro(
                      m.monthly_amount != null
                        ? m.monthly_amount
                        : (agreementAmounts.get(m.id) ?? null)
                    )}
                  </TableCell>
                  <TableCell>{fmtDate(m.created_at)}</TableCell>
                  <TableCell>
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
        <DialogContent className="max-w-[640px] max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="font-serif font-normal text-xl">
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
        <DialogContent className="max-w-[960px] max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="font-serif font-normal text-xl">
              Leden importeren
            </DialogTitle>
          </DialogHeader>
          <MemberImporter
            showReportLink={false}
            onDone={async () => { closeModal(); await fetchMembers(); }}
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
        <div
          className="p-3 rounded-[7px] mt-4 text-sm"
          style={{ background: "var(--error-light)", color: "var(--error)" }}
        >
          {formError}
        </div>
      )}

      <div className="flex gap-2 mt-5 justify-end">
        <Button type="button" variant="outline" onClick={onCancel} disabled={saving}>
          Annuleren
        </Button>
        <Button type="submit" disabled={saving}>
          {saving ? "Opslaan..." : initial ? "Opslaan" : "Toevoegen"}
        </Button>
      </div>
    </form>
  );
}
