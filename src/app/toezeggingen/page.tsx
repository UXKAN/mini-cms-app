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
import { Card, CardContent } from "@/components/ui/card";
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

/* ─── helpers ─────────────────────────────────────── */

const todayIso = () => new Date().toISOString().slice(0, 10);

function fmtEuro(n: number): string {
  return new Intl.NumberFormat("nl-NL", {
    style: "currency",
    currency: "EUR",
    minimumFractionDigits: 2,
  }).format(n);
}

function fmtDate(iso: string | null): string {
  if (!iso) return "—";
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return iso;
  return d.toLocaleDateString("nl-NL", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
}

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
  status: string;
  source_label: string;
  member_id: string | null;
  member_name: string;
  member_email: string | null;
  raw: PledgeFull | GiftAgreementSlim;
};

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
      status: g.payment_status ?? "unpaid",
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

  const handleDeletePledge = async (id: string) => {
    if (!confirm("Toezegging verwijderen?")) return;
    const { error } = await supabase.from("pledges").delete().eq("id", id);
    if (error) setError(error.message);
    else await fetchAll();
  };

  const sendReminderMailto = (row: ToezeggingRow) => {
    const email = row.member_email;
    if (!email) {
      alert("Geen e-mailadres bekend voor deze toezegging.");
      return;
    }
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
    window.location.href = `mailto:${email}?subject=${subject}&body=${body}`;
  };

  const totalOpen = rows.reduce((s, r) => s + r.amount, 0);
  const today = todayIso();
  const overdueCount = rows.filter(
    (r) => r.deadline && r.deadline < today
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
        <Button onClick={openAddPledge}>+ Nieuwe toezegging</Button>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
        <Card>
          <CardContent className="p-5">
            <div className="text-xs uppercase tracking-wider text-muted-foreground mb-1">
              Aantal openstaand
            </div>
            <div className="font-serif text-3xl">{rows.length}</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-5">
            <div className="text-xs uppercase tracking-wider text-muted-foreground mb-1">
              Totaal openstaand
            </div>
            <div className="font-serif text-3xl">{fmtEuro(totalOpen)}</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-5">
            <div className="text-xs uppercase tracking-wider text-muted-foreground mb-1">
              Verlopen
            </div>
            <div className="font-serif text-3xl">{overdueCount}</div>
          </CardContent>
        </Card>
      </div>

      {error && (
        <Card className="mb-4 border-destructive">
          <CardContent className="p-4 text-sm text-destructive">
            {error}
          </CardContent>
        </Card>
      )}

      <Card>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Type</TableHead>
                <TableHead>Datum</TableHead>
                <TableHead className="text-right">Bedrag</TableHead>
                <TableHead>Persoon</TableHead>
                <TableHead>Omschrijving</TableHead>
                <TableHead>Deadline</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Acties</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {loading && (
                <TableRow>
                  <TableCell colSpan={8} className="text-center py-8 text-muted-foreground">
                    Laden…
                  </TableCell>
                </TableRow>
              )}
              {!loading && rows.length === 0 && (
                <TableRow>
                  <TableCell colSpan={8} className="text-center py-12">
                    <p className="text-muted-foreground mb-3">
                      Nog geen openstaande toezeggingen.
                    </p>
                    <Button variant="outline" onClick={openAddPledge}>
                      + Eerste toezegging registreren
                    </Button>
                  </TableCell>
                </TableRow>
              )}
              {!loading &&
                rows.map((r) => (
                  <TableRow key={`${r.type}-${r.id}`}>
                    <TableCell>
                      <Badge variant="secondary" className="font-normal">
                        {r.source_label}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-sm">
                      {fmtDate(r.pledged_at)}
                    </TableCell>
                    <TableCell className="text-right font-medium">
                      {fmtEuro(r.amount)}
                    </TableCell>
                    <TableCell className="text-sm">{r.member_name}</TableCell>
                    <TableCell className="text-sm text-muted-foreground max-w-[240px] truncate">
                      {r.description ?? "—"}
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
                        {r.type === "pledge"
                          ? PLEDGE_STATUS_LABELS[r.status as PledgeStatus] ?? r.status
                          : r.status === "unpaid"
                            ? "Onbetaald"
                            : r.status === "partial"
                              ? "Deels betaald"
                              : r.status}
                      </span>
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-1">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => openMatchPayment(r)}
                        >
                          Markeer betaald
                        </Button>
                        {r.member_email && (
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => sendReminderMailto(r)}
                          >
                            Reminder
                          </Button>
                        )}
                        {r.type === "pledge" && (
                          <>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => openEditPledge(r)}
                            >
                              Bewerken
                            </Button>
                            <Button
                              variant="ghost"
                              size="sm"
                              className="text-destructive hover:text-destructive"
                              onClick={() => handleDeletePledge(r.id)}
                            >
                              Verwijderen
                            </Button>
                          </>
                        )}
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

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
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const amountNum = Number(amount);
    if (!amountNum || amountNum <= 0) {
      setError("Vul een geldig bedrag in (groter dan 0).");
      return;
    }
    setSaving(true);
    setError(null);

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
      setError(opError.message);
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

          {error && (
            <p className="text-sm text-destructive">{error}</p>
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
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const amountNum = Number(amount);
    if (!amountNum || amountNum <= 0) {
      setError("Vul een geldig bedrag in.");
      return;
    }
    setSaving(true);
    setError(null);

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
      setError(donationError.message);
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
        setError(`Donatie geregistreerd, maar status-update faalde: ${updError.message}`);
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
        setError(`Donatie geregistreerd, maar status-update faalde: ${updError.message}`);
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

          {error && <p className="text-sm text-destructive">{error}</p>}

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
