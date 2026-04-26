"use client";

import { useCallback, useEffect, useState } from "react";
import { supabase } from "../lib/supabase";
import { useAuth } from "../lib/useAuth";
import { useOrg } from "../lib/orgContext";
import type { DonationMethod, DonationWithMember, Member } from "../lib/types";
import { Button } from "@/components/ui/button";
import AppShell from "../components/AppShell";
import { PageLayout, StatCard, EmptyState } from "@/components/crm";
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

const METHOD_LABELS: Record<DonationMethod, string> = {
  cash: "Contant",
  bank: "Bank",
  online: "Online",
  other: "Overig",
};

const todayIso = () => new Date().toISOString().slice(0, 10);

function memberLabel(m: Pick<Member, "name" | "first_name" | "last_name">): string {
  const combined = [m.first_name, m.last_name].filter(Boolean).join(" ").trim();
  return combined || m.name || "—";
}

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

  const fetchAll = useCallback(async () => {
    setLoading(true);
    const [donRes, memRes] = await Promise.all([
      supabase
        .from("donations")
        .select("*, member:members(id, name, first_name, last_name)")
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

  const handleDelete = async (id: string) => {
    if (!confirm("Donatie verwijderen?")) return;
    const { error } = await supabase.from("donations").delete().eq("id", id);
    if (error) setError(error.message);
    else await fetchAll();
  };

  const total = donations.reduce((sum, d) => sum + Number(d.amount), 0);
  const yearStart = new Date(new Date().getFullYear(), 0, 1).toISOString().slice(0, 10);
  const yearTotal = donations
    .filter((d) => d.donated_at >= yearStart)
    .reduce((sum, d) => sum + Number(d.amount), 0);

  return (
    <PageLayout
      title="Donaties"
      subtitle="Registreer donaties en koppel ze optioneel aan een lid."
      action={donations.length > 0 ? <Button onClick={openAdd}>Donatie toevoegen</Button> : undefined}
    >
      {/* stat cards */}
      {donations.length > 0 && (
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(160px, 1fr))", gap: 16, marginBottom: 20 }}>
          <StatCard label="Totaal dit jaar" value={formatEuro(yearTotal)} />
          <StatCard label="Totaal (alles)"  value={formatEuro(total)} />
          <StatCard label="Aantal donaties" value={String(donations.length)} />
        </div>
      )}

      {error && (
        <div
          className="p-3 rounded-[7px] mb-4 text-sm"
          style={{ background: "var(--error-light)", color: "var(--error)" }}
        >
          {error}
        </div>
      )}

      {loading ? (
        <p className="text-muted-foreground">Donaties laden...</p>
      ) : donations.length === 0 ? (
        <EmptyState
          title="Nog geen donaties"
          description="Registreer je eerste donatie en koppel deze optioneel aan een lid."
          action={<Button onClick={openAdd}>Donatie toevoegen</Button>}
        />
      ) : (
        <div
          className="rounded-[10px] border border-border overflow-hidden"
          style={{ background: "var(--surface)" }}
        >
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Datum</TableHead>
                <TableHead>Bedrag</TableHead>
                <TableHead>Methode</TableHead>
                <TableHead>Lid</TableHead>
                <TableHead>Notities</TableHead>
                <TableHead />
              </TableRow>
            </TableHeader>
            <TableBody>
              {donations.map((d) => (
                <TableRow key={d.id}>
                  <TableCell>
                    {new Date(d.donated_at).toLocaleDateString("nl-NL")}
                  </TableCell>
                  <TableCell className="font-semibold">
                    {formatEuro(Number(d.amount))}
                  </TableCell>
                  <TableCell>{METHOD_LABELS[d.method]}</TableCell>
                  <TableCell>
                    {d.member ? (
                      memberLabel(d.member)
                    ) : (
                      <span className="text-muted-foreground italic">Anoniem</span>
                    )}
                  </TableCell>
                  <TableCell className="text-muted-foreground">
                    {d.notes ?? "—"}
                  </TableCell>
                  <TableCell className="text-right whitespace-nowrap">
                    <Button variant="ghost" size="sm" onClick={() => openEdit(d)}>
                      Bewerken
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="text-destructive hover:text-destructive"
                      onClick={() => handleDelete(d.id)}
                    >
                      Verwijderen
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      )}

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
    </PageLayout>
  );
}

// AppShell provides the sidebar + OrgContext. PageLayout is inside DonationsInner.
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
          <Label className="text-xs text-muted-foreground">Lid (optioneel)</Label>
          <select
            value={memberId}
            onChange={(e) => setMemberId(e.target.value)}
            className={selectCls}
          >
            <option value="">— anoniem —</option>
            {members.map((m) => (
              <option key={m.id} value={m.id}>{memberLabel(m)}</option>
            ))}
          </select>
        </div>
        <div className="flex flex-col gap-1.5 col-span-2">
          <Label className="text-xs text-muted-foreground">Notities</Label>
          <Input
            placeholder="Omschrijving, doel, etc."
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

function formatEuro(n: number) {
  return n.toLocaleString("nl-NL", {
    style: "currency",
    currency: "EUR",
    minimumFractionDigits: 2,
  });
}
