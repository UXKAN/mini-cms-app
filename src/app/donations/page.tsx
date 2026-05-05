"use client";

import { useCallback, useEffect, useState } from "react";
import { supabase } from "../lib/supabase";
import { useAuth } from "../lib/useAuth";
import AppShell from "../components/AppShell";
import { useOrg } from "../lib/orgContext";
import type { DonationMethod, DonationWithMember, Member } from "../lib/types";
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
import { fmtDate, fmtEuro, displayName } from "../lib/formatters";
import { HandCoins, Trash2, Download, Pencil } from "lucide-react";

const METHOD_LABELS: Record<DonationMethod, string> = {
  cash: "Contant",
  bank: "Bank",
  online: "Online",
  other: "Overig",
};

const METHOD_OPTIONS = [
  { value: "all", label: "Alle methodes" },
  { value: "bank", label: "Bank" },
  { value: "online", label: "Online" },
  { value: "cash", label: "Contant" },
  { value: "other", label: "Overig" },
];

const todayIso = () => new Date().toISOString().slice(0, 10);

type ModalMode = "closed" | "add" | "edit";

function DonationsInner() {
  const { user } = useAuth();
  const org = useOrg();

  const [donations, setDonations] = useState<DonationWithMember[]>([]);
  const [members, setMembers] = useState<Member[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [modalMode, setModalMode] = useState<ModalMode>("closed");
  const [editing, setEditing] = useState<DonationWithMember | null>(null);

  const t = useTableState<DonationWithMember>({
    items: donations,
    rowKey: (d) => d.id,
    searchFields: (d) => {
      const name = d.member
        ? displayName(d.member)
        : (d.gift_agreement?.schenker_naam ?? "");
      return `${name} ${d.notes ?? ""} ${d.amount}`;
    },
    statusOf: (d) => d.method,
    dateOf: (d) => d.donated_at,
  });

  const [confirmState, setConfirmState] = useState<
    | { mode: "single"; id: string; label: string }
    | { mode: "bulk"; ids: string[] }
    | null
  >(null);

  const fetchAll = useCallback(async () => {
    setLoading(true);
    const [donRes, memRes] = await Promise.all([
      supabase
        .from("donations")
        .select(
          "*, member:members(id, name, first_name, last_name), gift_agreement:gift_agreements(id, schenker_naam)"
        )
        .eq("org_id", org.id)
        .order("donated_at", { ascending: false }),
      supabase
        .from("members")
        .select("id, name, first_name, last_name")
        .eq("org_id", org.id)
        .order("last_name", { nullsFirst: false })
        .order("name"),
    ]);
    if (donRes.error) setError(donRes.error.message);
    else setDonations((donRes.data ?? []) as DonationWithMember[]);
    if (!memRes.error) setMembers((memRes.data ?? []) as Member[]);
    setLoading(false);
  }, [org.id]);

  useEffect(() => { if (user) fetchAll(); }, [user, fetchAll]);

  const openAdd = () => { setEditing(null); setModalMode("add"); };
  const openEdit = (d: DonationWithMember) => { setEditing(d); setModalMode("edit"); };
  const closeModal = () => { setModalMode("closed"); setEditing(null); };

  const askDeleteSingle = (d: DonationWithMember) => {
    const name = d.member
      ? displayName(d.member)
      : (d.gift_agreement?.schenker_naam ?? "Anoniem");
    setConfirmState({
      mode: "single",
      id: d.id,
      label: `${fmtEuro(Number(d.amount))} van ${name}`,
    });
  };

  const askDeleteBulk = () => {
    const ids = Array.from(t.selectedKeys);
    if (ids.length === 0) return;
    setConfirmState({ mode: "bulk", ids });
  };

  const performDelete = async () => {
    if (!confirmState) return;
    const ids =
      confirmState.mode === "single" ? [confirmState.id] : confirmState.ids;
    const { error: delError } = await supabase
      .from("donations")
      .delete()
      .in("id", ids);
    if (delError) {
      setError(delError.message);
      return;
    }
    t.clearSelection();
    setConfirmState(null);
    await fetchAll();
  };

  const handleExport = (rows: DonationWithMember[]) => {
    exportCsv(`donaties-${new Date().toISOString().slice(0, 10)}`, rows, [
      { key: "donated_at", label: "Datum", get: (d) => d.donated_at },
      {
        key: "donor",
        label: "Donateur",
        get: (d) =>
          d.member
            ? displayName(d.member)
            : (d.gift_agreement?.schenker_naam ?? "Anoniem"),
      },
      {
        key: "amount",
        label: "Bedrag",
        get: (d) => Number(d.amount).toFixed(2).replace(".", ","),
      },
      { key: "method", label: "Methode", get: (d) => METHOD_LABELS[d.method] },
      { key: "notes", label: "Omschrijving", get: (d) => d.notes ?? "" },
    ]);
  };

  const yearStart = new Date(new Date().getFullYear(), 0, 1)
    .toISOString()
    .slice(0, 10);
  const yearTotal = donations
    .filter((d) => d.donated_at >= yearStart)
    .reduce((sum, d) => sum + Number(d.amount), 0);
  const total = donations.reduce((sum, d) => sum + Number(d.amount), 0);

  return (
    <>
      <div className="flex justify-between items-end mb-7 gap-4 flex-wrap">
        <div>
          <h1 className="font-serif text-4xl font-normal text-foreground">
            Donaties
          </h1>
          <p className="text-muted-foreground text-sm mt-1">
            Registreer donaties en koppel ze optioneel aan een lid.
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
          <StatCard label="Totaal dit jaar" value={fmtEuro(yearTotal)} />
          <StatCard label="Totaal (alles)" value={fmtEuro(total)} />
          <StatCard label="Aantal donaties" value={String(donations.length)} />
        </div>
      )}

      <TableToolbar
        left={
          <TableSearch
            value={t.searchInput}
            onChange={t.setSearchInput}
            placeholder="Zoek op naam, omschrijving of bedrag…"
          />
        }
        right={
          <>
            <TableStatusFilter
              labelPrefix="Methode"
              value={t.statusFilter}
              onChange={t.setStatusFilter}
              options={METHOD_OPTIONS}
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
            <Button onClick={openAdd}>Donatie toevoegen</Button>
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
          icon={<HandCoins className="h-6 w-6" />}
          title="Nog geen donaties"
          description="Registreer de eerste donatie via de knop hieronder."
          actions={<Button onClick={openAdd}>Donatie toevoegen</Button>}
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
                    ariaLabel={`Selecteer alle ${t.filteredItems.length} zichtbare donaties`}
                  />
                </TableHead>
                <TableHead>Datum</TableHead>
                <TableHead>Donateur</TableHead>
                <TableHead>Bedrag</TableHead>
                <TableHead>Methode</TableHead>
                <TableHead>Omschrijving</TableHead>
                <TableHead className="w-10" />
              </TableRow>
            </TableHeader>
            <TableBody>
              {t.filteredItems.map((d) => (
                <TableRow
                  key={d.id}
                  data-state={t.selectedKeys.has(d.id) ? "selected" : undefined}
                >
                  <TableCell>
                    <RowSelectCheckbox
                      checked={t.selectedKeys.has(d.id)}
                      onChange={() => t.toggleRow(d.id)}
                      ariaLabel={`Selecteer donatie van ${
                        d.member
                          ? displayName(d.member)
                          : (d.gift_agreement?.schenker_naam ?? "Anoniem")
                      }`}
                    />
                  </TableCell>
                  <TableCell>{fmtDate(d.donated_at)}</TableCell>
                  <TableCell>
                    {d.member ? (
                      displayName(d.member)
                    ) : d.gift_agreement?.schenker_naam ? (
                      d.gift_agreement.schenker_naam
                    ) : (
                      <span className="text-muted-foreground italic">
                        Anoniem
                      </span>
                    )}
                  </TableCell>
                  <TableCell className="font-semibold">
                    {fmtEuro(Number(d.amount))}
                  </TableCell>
                  <TableCell>{METHOD_LABELS[d.method]}</TableCell>
                  <TableCell className="text-muted-foreground">
                    {d.notes ?? "—"}
                  </TableCell>
                  <TableCell>
                    <RowActionsMenu
                      actions={[
                        {
                          label: "Bewerken",
                          icon: <Pencil className="h-4 w-4" />,
                          onClick: () => openEdit(d),
                        },
                        {
                          label: "Verwijderen",
                          icon: <Trash2 className="h-4 w-4" />,
                          destructive: true,
                          separatorBefore: true,
                          onClick: () => askDeleteSingle(d),
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
              handleExport(
                donations.filter((d) => t.selectedKeys.has(d.id))
              ),
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
        mode="financial"
        title={
          confirmState?.mode === "single"
            ? "Donatie verwijderen?"
            : `${confirmState?.mode === "bulk" ? confirmState.ids.length : 0} donaties verwijderen?`
        }
        description={
          confirmState?.mode === "single"
            ? `Donatie ${confirmState.label} wordt permanent verwijderd.`
            : "Geselecteerde donaties worden permanent verwijderd."
        }
        onConfirm={performDelete}
      />

      <Dialog
        open={modalMode !== "closed"}
        onOpenChange={(open) => { if (!open) closeModal(); }}
      >
        <DialogContent className="max-w-[520px]">
          <DialogHeader>
            <DialogTitle className="font-serif font-normal text-xl">
              {modalMode === "edit" ? "Donatie bewerken" : "Nieuwe donatie"}
            </DialogTitle>
          </DialogHeader>
          <DonationForm
            initial={editing}
            members={members}
            onSaved={async () => { closeModal(); await fetchAll(); }}
            onCancel={closeModal}
          />
        </DialogContent>
      </Dialog>
    </>
  );
}

export default function DonationsPage() {
  return (
    <AppShell>
      <DonationsInner />
    </AppShell>
  );
}

function DonationForm({
  initial,
  members,
  onSaved,
  onCancel,
}: {
  initial: DonationWithMember | null;
  members: Member[];
  onSaved: () => void | Promise<void>;
  onCancel: () => void;
}) {
  const { user } = useAuth();
  const org = useOrg();

  const [amount, setAmount] = useState(initial ? String(initial.amount) : "");
  const [method, setMethod] = useState<DonationMethod>(initial?.method ?? "bank");
  const [donatedAt, setDonatedAt] = useState(initial?.donated_at ?? todayIso());
  const [memberId, setMemberId] = useState<string>(initial?.member_id ?? "");
  const [notes, setNotes] = useState(initial?.notes ?? "");
  const [saving, setSaving] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;
    const amt = parseFloat(amount.replace(",", "."));
    if (!amt || amt <= 0) { setFormError("Vul een geldig bedrag in."); return; }
    setSaving(true);
    setFormError(null);

    const payload = {
      amount: amt,
      method,
      donated_at: donatedAt,
      member_id: memberId || null,
      notes: notes.trim() || null,
    };

    const { error } = initial
      ? await supabase.from("donations").update(payload).eq("id", initial.id)
      : await supabase
          .from("donations")
          .insert({ ...payload, user_id: user.id, org_id: org.id });

    if (error) { setFormError(error.message); setSaving(false); }
    else { setSaving(false); await onSaved(); }
  };

  const selectCls =
    "h-10 rounded-md border border-border bg-background px-3 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-ring w-full";

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-4">
      <div className="grid grid-cols-2 gap-3">
        <div className="flex flex-col gap-1.5">
          <Label className="text-xs text-muted-foreground">Bedrag (EUR) *</Label>
          <Input
            type="number"
            step="0.01"
            min="0"
            placeholder="bv. 25.00"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            required
            className="h-10 text-sm"
          />
        </div>
        <div className="flex flex-col gap-1.5">
          <Label className="text-xs text-muted-foreground">Datum *</Label>
          <Input
            type="date"
            value={donatedAt}
            onChange={(e) => setDonatedAt(e.target.value)}
            required
            className="h-10 text-sm"
          />
        </div>
        <div className="flex flex-col gap-1.5">
          <Label className="text-xs text-muted-foreground">Methode</Label>
          <select
            value={method}
            onChange={(e) => setMethod(e.target.value as DonationMethod)}
            className={selectCls}
          >
            {(Object.keys(METHOD_LABELS) as DonationMethod[]).map((m) => (
              <option key={m} value={m}>{METHOD_LABELS[m]}</option>
            ))}
          </select>
        </div>
        <div className="flex flex-col gap-1.5">
          <Label className="text-xs text-muted-foreground">Donateur (optioneel)</Label>
          <select
            value={memberId}
            onChange={(e) => setMemberId(e.target.value)}
            className={selectCls}
          >
            <option value="">— anoniem —</option>
            {members.map((m) => (
              <option key={m.id} value={m.id}>{displayName(m)}</option>
            ))}
          </select>
        </div>
        <div className="flex flex-col gap-1.5 col-span-2">
          <Label className="text-xs text-muted-foreground">Omschrijving</Label>
          <Input
            placeholder="Bijvoorbeeld: Ramadan-fonds, gevel-renovatie, vrije bestemming"
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            className="h-10 text-sm"
          />
        </div>
      </div>

      {formError && (
        <div
          className="p-3 rounded-[7px] text-sm"
          style={{ background: "var(--error-light)", color: "var(--error)" }}
        >
          {formError}
        </div>
      )}

      <div className="flex gap-2 justify-end">
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
