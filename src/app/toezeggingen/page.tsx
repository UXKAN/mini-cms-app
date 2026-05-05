"use client";

import { useCallback, useEffect, useState } from "react";
import { supabase } from "../lib/supabase";
import { useAuth } from "../lib/useAuth";
import AppShell from "../components/AppShell";
import { useOrg } from "../lib/orgContext";
import type {
  DonationMethod,
  Member,
  Pledge,
  PledgeSource,
  PledgeStatus,
} from "../lib/types";
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
import { Badge } from "@/components/ui/badge";
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
import { fmtDate, fmtEuro } from "../lib/formatters";
import { HandshakeIcon, Trash2, Download, Eye, Pencil, CheckCircle, Mail } from "lucide-react";

/* ─── helpers ─────────────────────────────────────── */

const todayIso = () => new Date().toISOString().slice(0, 10);

function memberLabel(
  m: Pick<Member, "name" | "first_name" | "last_name"> | null | undefined
): string {
  if (!m) return "Anoniem";
  const combined = [m.first_name, m.last_name].filter(Boolean).join(" ").trim();
  return combined || m.name || "Anoniem";
}

const PLEDGE_SOURCE_LABELS: Record<PledgeSource, string> = {
  verbal: "Mondeling",
  email: "E-mail",
  event: "Na evenement",
  form: "Via formulier",
  other: "Overig",
};

const PLEDGE_STATUS_LABELS: Record<PledgeStatus, string> = {
  open: "Open",
  partial: "Deels betaald",
  paid: "Voldaan",
  cancelled: "Geannuleerd",
};

const STATUS_COLORS: Record<string, string> = {
  open: "bg-amber-100 text-amber-900",
  partial: "bg-blue-100 text-blue-900",
  paid: "bg-emerald-100 text-emerald-900",
  cancelled: "bg-stone-200 text-stone-700",
  unpaid: "bg-amber-100 text-amber-900",
};

/* ─── status dropdown options ─────────────────────── */

const STATUS_OPTIONS = [
  { value: "all", label: "Alle toezeggingen" },
  { value: "open", label: "Open" },
  { value: "partial", label: "Deels betaald" },
  { value: "paid", label: "Voldaan" },
  { value: "cancelled", label: "Geannuleerd" },
];

/* ─── normalized row-type ─────────────────────────── */

type SourceType = "pledge" | "gift_agreement";

type GiftAgreementSlim = {
  id: string;
  schenker_naam: string;
  schenker_email: string;
  bedrag_eenmalig: number | null;
  purpose: string | null;
  akkoord_at: string | null;
  payment_status: "unpaid" | "partial" | "paid" | null;
  member_id: string | null;
  member: Pick<Member, "id" | "name" | "first_name" | "last_name"> | null;
};

type PledgeFull = Pledge & {
  member: Pick<Member, "id" | "name" | "first_name" | "last_name" | "email"> | null;
};

type ToezeggingRow = {
  type: SourceType;
  id: string;
  amount: number;
  description: string | null;
  pledged_at: string | null;
  deadline: string | null;
  /* normalized status — pledge uses status directly; gift_agreement maps payment_status */
  status: string;
  source_label: string;
  member_id: string | null;
  member_name: string;
  member_email: string | null;
  raw: PledgeFull | GiftAgreementSlim;
};

/* Maps gift_agreement payment_status → pledge-status vocabulary */
function normalizeStatus(
  type: SourceType,
  rawStatus: string
): string {
  if (type === "pledge") return rawStatus;
  // gift_agreement: unpaid → open, partial → partial, paid → paid
  if (rawStatus === "unpaid") return "open";
  return rawStatus; // "partial" and "paid" are identical
}

/* ─── modal state ─────────────────────────────────── */

type ModalMode = "closed" | "add_pledge" | "edit_pledge" | "match_payment";

/* ─── main page ───────────────────────────────────── */

export default function ToezeggingenPage() {
  return (
    <AppShell>
      <ToezeggingenInner />
    </AppShell>
  );
}

function ToezeggingenInner() {
  const { user } = useAuth();
  const org = useOrg();

  const [rows, setRows] = useState<ToezeggingRow[]>([]);
  const [members, setMembers] = useState<Member[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [modalMode, setModalMode] = useState<ModalMode>("closed");
  const [activeRow, setActiveRow] = useState<ToezeggingRow | null>(null);

  /* confirmState uses prefixed keys: "pledge:<id>" */
  const [confirmState, setConfirmState] = useState<
    | { mode: "single"; id: string; label: string }
    | { mode: "bulk"; ids: string[] }
    | null
  >(null);

  const t = useTableState<ToezeggingRow>({
    items: rows,
    rowKey: (r) => `${r.type}:${r.id}`,
    searchFields: (r) =>
      [r.member_name, r.member_email ?? "", r.description ?? "", String(r.amount)]
        .join(" "),
    statusOf: (r) => r.status,
    dateOf: (r) => r.pledged_at,
    isSelectable: (r) => r.type === "pledge",
  });

  const fetchAll = useCallback(async () => {
    setLoading(true);
    setError(null);
    const [pledgesRes, agreementsRes, membersRes] = await Promise.all([
      supabase
        .from("pledges")
        .select(
          "*, member:members(id, name, first_name, last_name, email)"
        )
        .eq("org_id", org.id)
        .in("status", ["open", "partial"])
        .order("pledged_at", { ascending: false, nullsFirst: false }),
      supabase
        .from("gift_agreements")
        .select(
          "id, schenker_naam, schenker_email, bedrag_eenmalig, purpose, akkoord_at, payment_status, member_id, member:members(id, name, first_name, last_name)"
        )
        .eq("organization_id", org.id)
        .eq("type", "eenmalige")
        .in("payment_status", ["unpaid", "partial"])
        .order("akkoord_at", { ascending: false, nullsFirst: false }),
      supabase
        .from("members")
        .select("id, name, first_name, last_name, email")
        .eq("org_id", org.id)
        .order("last_name", { nullsFirst: false })
        .order("name"),
    ]);

    if (pledgesRes.error) {
      setError(pledgesRes.error.message);
      setLoading(false);
      return;
    }
    if (agreementsRes.error) {
      setError(agreementsRes.error.message);
      setLoading(false);
      return;
    }

    const pledgeRows: ToezeggingRow[] = (
      (pledgesRes.data ?? []) as PledgeFull[]
    ).map((p) => ({
      type: "pledge",
      id: p.id,
      amount: Number(p.amount),
      description: p.purpose ?? p.notes ?? null,
      pledged_at: p.pledged_at,
      deadline: p.deadline,
      status: p.status,
      source_label: p.source
        ? PLEDGE_SOURCE_LABELS[p.source]
        : "Mondeling",
      member_id: p.member_id,
      member_name: memberLabel(p.member),
      member_email: p.member?.email ?? null,
      raw: p,
    }));

    const agreementRows: ToezeggingRow[] = (
      (agreementsRes.data ?? []) as unknown as GiftAgreementSlim[]
    ).map((g) => ({
      type: "gift_agreement",
      id: g.id,
      amount: Number(g.bedrag_eenmalig ?? 0),
      description: g.purpose,
      pledged_at: g.akkoord_at ? g.akkoord_at.slice(0, 10) : null,
      deadline: null,
      status: normalizeStatus("gift_agreement", g.payment_status ?? "unpaid"),
      source_label: "ANBI-akte",
      member_id: g.member_id,
      member_name: g.member ? memberLabel(g.member) : g.schenker_naam,
      member_email: g.member ? null : g.schenker_email,
      raw: g,
    }));

    const all = [...pledgeRows, ...agreementRows].sort((a, b) => {
      const da = a.pledged_at ?? "";
      const db = b.pledged_at ?? "";
      return db.localeCompare(da);
    });

    setRows(all);
    if (!membersRes.error) setMembers((membersRes.data ?? []) as Member[]);
    setLoading(false);
  }, [org.id]);

  useEffect(() => {
    if (user) fetchAll();
  }, [user, fetchAll]);

  const openAddPledge = () => {
    setActiveRow(null);
    setModalMode("add_pledge");
  };
  const openEditPledge = (row: ToezeggingRow) => {
    if (row.type !== "pledge") return;
    setActiveRow(row);
    setModalMode("edit_pledge");
  };
  const openMatchPayment = (row: ToezeggingRow) => {
    setActiveRow(row);
    setModalMode("match_payment");
  };
  const closeModal = () => {
    setModalMode("closed");
    setActiveRow(null);
  };

  const sendReminderMailto = (row: ToezeggingRow) => {
    const email = row.member_email;
    if (!email) return;
    const subject = encodeURIComponent(
      "Herinnering toezegging — Nieuwe Moskee Enschede"
    );
    const lines = [
      `Beste ${row.member_name},`,
      ``,
      `Hierbij een vriendelijke herinnering aan uw toezegging van ${fmtEuro(
        row.amount
      )}${row.description ? ` voor ${row.description}` : ""}${
        row.pledged_at ? `, gedaan op ${fmtDate(row.pledged_at)}` : ""
      }.`,
      ``,
      `Wij zien uw bijdrage graag tegemoet.`,
      ``,
      `Met vriendelijke groet,`,
      `Bestuur Nieuwe Moskee Enschede`,
    ];
    const body = encodeURIComponent(lines.join("\n"));
    window.location.assign(`mailto:${email}?subject=${subject}&body=${body}`);
  };

  const askDeleteSingle = (row: ToezeggingRow) => {
    if (row.type !== "pledge") return;
    setConfirmState({
      mode: "single",
      id: row.id,
      label: `${fmtEuro(row.amount)} van ${row.member_name}`,
    });
  };

  const askDeleteBulk = () => {
    /* selectedKeys are "pledge:<id>" — extract pledge ids only */
    const pledgeIds = Array.from(t.selectedKeys)
      .filter((k) => k.startsWith("pledge:"))
      .map((k) => k.slice("pledge:".length));
    if (pledgeIds.length === 0) return;
    setConfirmState({ mode: "bulk", ids: pledgeIds });
  };

  const performDelete = async () => {
    if (!confirmState) return;
    const ids =
      confirmState.mode === "single" ? [confirmState.id] : confirmState.ids;
    const { error: delError } = await supabase
      .from("pledges")
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

  const handleExport = (exportRows: ToezeggingRow[]) => {
    exportCsv(`toezeggingen-${new Date().toISOString().slice(0, 10)}`, exportRows, [
      { key: "type", label: "Type", get: (r) => r.source_label },
      { key: "donor", label: "Donateur", get: (r) => r.member_name },
      {
        key: "amount",
        label: "Bedrag",
        get: (r) => r.amount.toFixed(2).replace(".", ","),
      },
      { key: "description", label: "Omschrijving", get: (r) => r.description ?? "" },
      { key: "pledged_at", label: "Toegezegd op", get: (r) => r.pledged_at ?? "" },
      { key: "deadline", label: "Deadline", get: (r) => r.deadline ?? "" },
      { key: "status", label: "Status", get: (r) => PLEDGE_STATUS_LABELS[r.status as PledgeStatus] ?? r.status },
    ]);
  };

  /* stat-card metrics — always computed from full rows array */
  const totalOpen = rows.reduce((s, r) => s + r.amount, 0);
  const today = todayIso();
  const overdueCount = rows.filter(
    (r) => r.deadline && r.deadline < today
  ).length;

  /* selected pledge count (for bulk-bar label) */
  const selectedPledgeCount = Array.from(t.selectedKeys).filter((k) =>
    k.startsWith("pledge:")
  ).length;

  return (
    <>
      <div className="flex justify-between items-end mb-7 gap-4 flex-wrap">
        <div>
          <h1 className="font-serif text-4xl font-normal text-foreground">
            Toezeggingen
          </h1>
          <p className="text-muted-foreground text-sm mt-1">
            Mondelinge toezeggingen en ondertekende ANBI-akten waarvoor het
            geld nog niet binnen is.
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
          <StatCard label="Aantal openstaand" value={String(rows.length)} />
          <StatCard label="Totaal openstaand" value={fmtEuro(totalOpen)} />
          <StatCard label="Verlopen" value={String(overdueCount)} />
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
              labelPrefix="Status"
              value={t.statusFilter}
              onChange={t.setStatusFilter}
              options={STATUS_OPTIONS}
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
            <Button onClick={openAddPledge}>Toezegging toevoegen</Button>
          </>
        }
      />

      <ActiveFilterChips
        period={t.period}
        onClear={() => t.setPeriod({ preset: "all" })}
      />

      {loading ? (
        <TableLoadingState columns={9} />
      ) : t.isEmpty ? (
        <EmptyState
          icon={<HandshakeIcon className="h-6 w-6" />}
          title="Nog geen toezeggingen"
          description="Open toezeggingen kun je hier bijhouden."
          actions={<Button onClick={openAddPledge}>Toezegging toevoegen</Button>}
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
                {/* Header checkbox — only selectable rows (pledges) count */}
                <TableHead className="w-10">
                  <RowSelectCheckbox
                    checked={t.isAllVisibleSelected}
                    indeterminate={t.isSomeVisibleSelected}
                    onChange={t.toggleAllVisible}
                    ariaLabel={`Selecteer alle zichtbare toezeggingen`}
                  />
                </TableHead>
                <TableHead>Type</TableHead>
                <TableHead>Persoon</TableHead>
                <TableHead className="text-right">Bedrag</TableHead>
                <TableHead>Omschrijving</TableHead>
                <TableHead>Toegezegd op</TableHead>
                <TableHead>Deadline</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="w-10" />
              </TableRow>
            </TableHeader>
            <TableBody>
              {t.filteredItems.map((r) => {
                const rowKey = `${r.type}:${r.id}`;
                const isPledge = r.type === "pledge";
                return (
                  <TableRow
                    key={rowKey}
                    data-state={t.selectedKeys.has(rowKey) ? "selected" : undefined}
                  >
                    {/* Checkbox column: empty cell for gift_agreement rows */}
                    {isPledge ? (
                      <TableCell>
                        <RowSelectCheckbox
                          checked={t.selectedKeys.has(rowKey)}
                          onChange={() => t.toggleRow(rowKey)}
                          ariaLabel={`Selecteer toezegging van ${r.member_name}`}
                        />
                      </TableCell>
                    ) : (
                      <TableCell />
                    )}

                    <TableCell>
                      <Badge variant="secondary" className="font-normal">
                        {r.source_label}
                      </Badge>
                    </TableCell>

                    <TableCell className="text-sm">{r.member_name}</TableCell>

                    <TableCell className="text-right font-medium">
                      {fmtEuro(r.amount)}
                    </TableCell>

                    <TableCell className="text-sm text-muted-foreground max-w-[240px] truncate">
                      {r.description ?? "—"}
                    </TableCell>

                    <TableCell className="text-sm">
                      {fmtDate(r.pledged_at)}
                    </TableCell>

                    <TableCell className="text-sm">
                      {fmtDate(r.deadline)}
                    </TableCell>

                    <TableCell>
                      <span
                        className={`inline-flex px-2 py-0.5 rounded-md text-xs font-medium ${
                          STATUS_COLORS[r.status] ?? "bg-stone-100 text-stone-700"
                        }`}
                      >
                        {PLEDGE_STATUS_LABELS[r.status as PledgeStatus] ?? r.status}
                      </span>
                    </TableCell>

                    <TableCell>
                      <RowActionsMenu
                        ariaLabel={`Acties voor toezegging van ${r.member_name}`}
                        actions={
                          isPledge
                            ? [
                                {
                                  label: "Bekijken",
                                  icon: <Eye className="h-4 w-4" />,
                                  onClick: () => openMatchPayment(r),
                                },
                                {
                                  label: "Bewerken",
                                  icon: <Pencil className="h-4 w-4" />,
                                  onClick: () => openEditPledge(r),
                                },
                                {
                                  label: "Markeer als betaald",
                                  icon: <CheckCircle className="h-4 w-4" />,
                                  onClick: () => openMatchPayment(r),
                                },
                                ...(r.member_email
                                  ? [
                                      {
                                        label: "Stuur reminder",
                                        icon: <Mail className="h-4 w-4" />,
                                        onClick: () => sendReminderMailto(r),
                                      },
                                    ]
                                  : []),
                                {
                                  label: "Verwijderen",
                                  icon: <Trash2 className="h-4 w-4" />,
                                  destructive: true,
                                  separatorBefore: true,
                                  onClick: () => askDeleteSingle(r),
                                },
                              ]
                            : /* gift_agreement: Bekijken + Markeer als betaald (+ optioneel reminder) */
                              [
                                {
                                  label: "Bekijken",
                                  icon: <Eye className="h-4 w-4" />,
                                  onClick: () => openMatchPayment(r),
                                },
                                {
                                  label: "Markeer als betaald",
                                  icon: <CheckCircle className="h-4 w-4" />,
                                  onClick: () => openMatchPayment(r),
                                },
                                ...(r.member_email
                                  ? [
                                      {
                                        label: "Stuur reminder",
                                        icon: <Mail className="h-4 w-4" />,
                                        onClick: () => sendReminderMailto(r),
                                      },
                                    ]
                                  : []),
                              ]
                        }
                      />
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </div>
      )}

      <TableBulkBar
        count={selectedPledgeCount}
        onClear={t.clearSelection}
        actions={[
          {
            label: `Exporteer ${selectedPledgeCount}`,
            icon: <Download className="h-4 w-4" />,
            onClick: () => {
              const pledgeIds = new Set(
                Array.from(t.selectedKeys)
                  .filter((k) => k.startsWith("pledge:"))
                  .map((k) => k.slice("pledge:".length))
              );
              handleExport(rows.filter((r) => r.type === "pledge" && pledgeIds.has(r.id)));
            },
          },
          {
            label: `Verwijder ${selectedPledgeCount}`,
            icon: <Trash2 className="h-4 w-4" />,
            destructive: true,
            onClick: askDeleteBulk,
          },
        ]}
      />

      <ConfirmDeleteDialog
        open={confirmState !== null}
        onOpenChange={(open) => { if (!open) setConfirmState(null); }}
        onConfirm={performDelete}
        mode="financial"
        title={
          confirmState?.mode === "bulk"
            ? `${confirmState.ids.length} toezeggingen verwijderen?`
            : "Toezegging verwijderen?"
        }
        description={
          confirmState?.mode === "single"
            ? `Je staat op het punt "${confirmState.label}" definitief te verwijderen.`
            : confirmState?.mode === "bulk"
              ? `Je staat op het punt ${confirmState.ids.length} toezeggingen definitief te verwijderen.`
              : ""
        }
      />

      {(modalMode === "add_pledge" || modalMode === "edit_pledge") && (
        <PledgeFormDialog
          mode={modalMode}
          existing={
            modalMode === "edit_pledge" && activeRow?.type === "pledge"
              ? (activeRow.raw as PledgeFull)
              : null
          }
          orgId={org.id}
          members={members}
          onClose={closeModal}
          onSaved={async () => {
            closeModal();
            await fetchAll();
          }}
        />
      )}

      {modalMode === "match_payment" && activeRow && (
        <MatchPaymentDialog
          row={activeRow}
          orgId={org.id}
          members={members}
          onClose={closeModal}
          onMatched={async () => {
            closeModal();
            await fetchAll();
          }}
        />
      )}
    </>
  );
}

/* ─── Pledge add/edit dialog ──────────────────────── */

function PledgeFormDialog({
  mode,
  existing,
  orgId,
  members,
  onClose,
  onSaved,
}: {
  mode: "add_pledge" | "edit_pledge";
  existing: PledgeFull | null;
  orgId: string;
  members: Member[];
  onClose: () => void;
  onSaved: () => void;
}) {
  const [amount, setAmount] = useState(existing?.amount?.toString() ?? "");
  const [purpose, setPurpose] = useState(existing?.purpose ?? "");
  const [pledgedAt, setPledgedAt] = useState(
    existing?.pledged_at ?? todayIso()
  );
  const [deadline, setDeadline] = useState(existing?.deadline ?? "");
  const [source, setSource] = useState<PledgeSource>(
    existing?.source ?? "verbal"
  );
  const [memberId, setMemberId] = useState(existing?.member_id ?? "");
  const [status, setStatus] = useState<PledgeStatus>(
    existing?.status ?? "open"
  );
  const [notes, setNotes] = useState(existing?.notes ?? "");
  const [saving, setSaving] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const amountNum = Number(amount);
    if (!amountNum || amountNum <= 0) {
      setFormError("Vul een geldig bedrag in (groter dan 0).");
      return;
    }
    setSaving(true);
    setFormError(null);

    const payload = {
      org_id: orgId,
      amount: amountNum,
      purpose: purpose.trim() || null,
      pledged_at: pledgedAt || null,
      deadline: deadline || null,
      source,
      member_id: memberId || null,
      status,
      notes: notes.trim() || null,
    };

    const op =
      mode === "add_pledge"
        ? supabase.from("pledges").insert(payload)
        : supabase.from("pledges").update(payload).eq("id", existing!.id);
    const { error: opError } = await op;
    setSaving(false);
    if (opError) {
      setFormError(opError.message);
      return;
    }
    onSaved();
  };

  return (
    <Dialog open onOpenChange={onClose}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle>
            {mode === "add_pledge" ? "Nieuwe toezegging" : "Toezegging bewerken"}
          </DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-3">
            <div className="flex flex-col gap-1.5">
              <Label className="text-xs text-muted-foreground">Bedrag (€)</Label>
              <Input
                type="number"
                inputMode="decimal"
                step="0.01"
                min="0"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                required
                className="h-10 text-sm"
              />
            </div>
            <div className="flex flex-col gap-1.5">
              <Label className="text-xs text-muted-foreground">Datum toezegging</Label>
              <Input
                type="date"
                value={pledgedAt}
                onChange={(e) => setPledgedAt(e.target.value)}
                className="h-10 text-sm"
              />
            </div>
            <div className="flex flex-col gap-1.5 col-span-2">
              <Label className="text-xs text-muted-foreground">Persoon (optioneel)</Label>
              <select
                value={memberId}
                onChange={(e) => setMemberId(e.target.value)}
                className="h-10 px-3 text-sm rounded-md border border-input bg-transparent"
              >
                <option value="">— Anoniem —</option>
                {members.map((m) => (
                  <option key={m.id} value={m.id}>
                    {memberLabel(m)}
                  </option>
                ))}
              </select>
            </div>
            <div className="flex flex-col gap-1.5 col-span-2">
              <Label className="text-xs text-muted-foreground">Omschrijving</Label>
              <Input
                value={purpose}
                onChange={(e) => setPurpose(e.target.value)}
                placeholder="Bijvoorbeeld: Ramadan-fonds, gevel-renovatie"
                className="h-10 text-sm"
              />
            </div>
            <div className="flex flex-col gap-1.5">
              <Label className="text-xs text-muted-foreground">Deadline (optioneel)</Label>
              <Input
                type="date"
                value={deadline}
                onChange={(e) => setDeadline(e.target.value)}
                className="h-10 text-sm"
              />
            </div>
            <div className="flex flex-col gap-1.5">
              <Label className="text-xs text-muted-foreground">Bron</Label>
              <select
                value={source}
                onChange={(e) => setSource(e.target.value as PledgeSource)}
                className="h-10 px-3 text-sm rounded-md border border-input bg-transparent"
              >
                <option value="verbal">Mondeling</option>
                <option value="email">E-mail</option>
                <option value="event">Na evenement</option>
                <option value="form">Via formulier</option>
                <option value="other">Overig</option>
              </select>
            </div>
            {mode === "edit_pledge" && (
              <div className="flex flex-col gap-1.5 col-span-2">
                <Label className="text-xs text-muted-foreground">Status</Label>
                <select
                  value={status}
                  onChange={(e) => setStatus(e.target.value as PledgeStatus)}
                  className="h-10 px-3 text-sm rounded-md border border-input bg-transparent"
                >
                  <option value="open">Open</option>
                  <option value="partial">Deels betaald</option>
                  <option value="paid">Voldaan</option>
                  <option value="cancelled">Geannuleerd</option>
                </select>
              </div>
            )}
            <div className="flex flex-col gap-1.5 col-span-2">
              <Label className="text-xs text-muted-foreground">Interne notities (optioneel)</Label>
              <Input
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="Niet zichtbaar voor schenker"
                className="h-10 text-sm"
              />
            </div>
          </div>

          {formError && (
            <p className="text-sm text-destructive">{formError}</p>
          )}

          <div className="flex justify-end gap-2">
            <Button type="button" variant="outline" onClick={onClose}>
              Annuleren
            </Button>
            <Button type="submit" disabled={saving}>
              {saving ? "Opslaan…" : "Opslaan"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}

/* ─── Match payment dialog ────────────────────────── */

function MatchPaymentDialog({
  row,
  orgId,
  members,
  onClose,
  onMatched,
}: {
  row: ToezeggingRow;
  orgId: string;
  members: Member[];
  onClose: () => void;
  onMatched: () => void;
}) {
  const [amount, setAmount] = useState(row.amount.toString());
  const [method, setMethod] = useState<DonationMethod>("bank");
  const [donatedAt, setDonatedAt] = useState(todayIso());
  const [description, setDescription] = useState(row.description ?? "");
  const [memberId, setMemberId] = useState(row.member_id ?? "");
  const [saving, setSaving] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const amountNum = Number(amount);
    if (!amountNum || amountNum <= 0) {
      setFormError("Vul een geldig bedrag in.");
      return;
    }
    setSaving(true);
    setFormError(null);

    const donationPayload: Record<string, unknown> = {
      org_id: orgId,
      member_id: memberId || null,
      amount: amountNum,
      method,
      donated_at: donatedAt,
      notes: description.trim() || null,
      source: "manual",
    };
    if (row.type === "pledge") {
      donationPayload.pledge_id = row.id;
    } else {
      donationPayload.gift_agreement_id = row.id;
    }

    const { error: donationError } = await supabase
      .from("donations")
      .insert(donationPayload);
    if (donationError) {
      setSaving(false);
      setFormError(donationError.message);
      return;
    }

    const fullyPaid = amountNum >= row.amount;
    if (row.type === "pledge") {
      const { error: updError } = await supabase
        .from("pledges")
        .update({ status: fullyPaid ? "paid" : "partial" })
        .eq("id", row.id);
      if (updError) {
        setSaving(false);
        setFormError(`Donatie geregistreerd, maar status-update faalde: ${updError.message}`);
        return;
      }
    } else {
      const { error: updError } = await supabase
        .from("gift_agreements")
        .update({
          payment_status: fullyPaid ? "paid" : "partial",
          paid_at: fullyPaid
            ? new Date(donatedAt + "T12:00:00Z").toISOString()
            : null,
        })
        .eq("id", row.id);
      if (updError) {
        setSaving(false);
        setFormError(`Donatie geregistreerd, maar status-update faalde: ${updError.message}`);
        return;
      }
    }

    setSaving(false);
    onMatched();
  };

  return (
    <Dialog open onOpenChange={onClose}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle>Markeer als betaald</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <p className="text-sm text-muted-foreground">
            Registreer een binnengekomen betaling voor deze {row.source_label.toLowerCase()}.
            Er wordt een donatie aangemaakt en de toezegging wordt automatisch op{" "}
            <strong>voldaan</strong> gezet (of <strong>deels betaald</strong> als
            het bedrag lager is dan de toezegging).
          </p>

          <div className="grid grid-cols-2 gap-3">
            <div className="flex flex-col gap-1.5">
              <Label className="text-xs text-muted-foreground">Bedrag (€)</Label>
              <Input
                type="number"
                inputMode="decimal"
                step="0.01"
                min="0"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                required
                className="h-10 text-sm"
              />
            </div>
            <div className="flex flex-col gap-1.5">
              <Label className="text-xs text-muted-foreground">Methode</Label>
              <select
                value={method}
                onChange={(e) => setMethod(e.target.value as DonationMethod)}
                className="h-10 px-3 text-sm rounded-md border border-input bg-transparent"
              >
                <option value="bank">Bank</option>
                <option value="cash">Contant</option>
                <option value="online">Online</option>
                <option value="other">Overig</option>
              </select>
            </div>
            <div className="flex flex-col gap-1.5 col-span-2">
              <Label className="text-xs text-muted-foreground">Datum betaling</Label>
              <Input
                type="date"
                value={donatedAt}
                onChange={(e) => setDonatedAt(e.target.value)}
                className="h-10 text-sm"
              />
            </div>
            <div className="flex flex-col gap-1.5 col-span-2">
              <Label className="text-xs text-muted-foreground">Persoon (optioneel)</Label>
              <select
                value={memberId}
                onChange={(e) => setMemberId(e.target.value)}
                className="h-10 px-3 text-sm rounded-md border border-input bg-transparent"
              >
                <option value="">— Anoniem —</option>
                {members.map((m) => (
                  <option key={m.id} value={m.id}>
                    {memberLabel(m)}
                  </option>
                ))}
              </select>
            </div>
            <div className="flex flex-col gap-1.5 col-span-2">
              <Label className="text-xs text-muted-foreground">Omschrijving</Label>
              <Input
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                className="h-10 text-sm"
              />
            </div>
          </div>

          {formError && <p className="text-sm text-destructive">{formError}</p>}

          <div className="flex justify-end gap-2">
            <Button type="button" variant="outline" onClick={onClose}>
              Annuleren
            </Button>
            <Button type="submit" disabled={saving}>
              {saving ? "Verwerken…" : "Donatie registreren"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
