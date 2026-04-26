"use client";

import { useCallback, useEffect, useState } from "react";
import { supabase } from "../lib/supabase";
import { useAuth } from "../lib/useAuth";
import MemberImporter from "../components/MemberImporter";
import { useOrg } from "../lib/orgContext";
import type { Member, MemberStatus } from "../lib/types";
import { Button } from "@/components/ui/button";
import { PageLayout, EmptyState, Badge } from "@/components/crm";
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

const STATUS_OPTIONS: { value: MemberStatus; label: string }[] = [
  { value: "active", label: "Actief" },
  { value: "inactive", label: "Inactief" },
  { value: "prospect", label: "Prospect" },
  { value: "cancelled", label: "Opgezegd" },
];

type ModalMode = "closed" | "add" | "edit" | "import";

function displayName(m: Member): string {
  const combined = [m.first_name, m.last_name].filter(Boolean).join(" ").trim();
  return combined || m.name || "—";
}

function MembersInner() {
  const { user } = useAuth();
  const org = useOrg();

  const [members, setMembers] = useState<Member[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [modalMode, setModalMode] = useState<ModalMode>("closed");
  const [editing, setEditing] = useState<Member | null>(null);

  const fetchMembers = useCallback(async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from("members")
      .select("*")
      .eq("org_id", org.id)
      .order("created_at", { ascending: false });
    if (error) setError(error.message);
    else setMembers((data ?? []) as Member[]);
    setLoading(false);
  }, [org.id]);

  useEffect(() => {
    if (user) fetchMembers();
  }, [user, fetchMembers]);

  const openAdd = () => { setEditing(null); setModalMode("add"); };
  const openEdit = (m: Member) => { setEditing(m); setModalMode("edit"); };
  const openImport = () => { setEditing(null); setModalMode("import"); };
  const closeModal = () => { setModalMode("closed"); setEditing(null); };

  const handleDelete = async (id: string) => {
    if (!confirm("Weet je zeker dat je dit lid wilt verwijderen?")) return;
    const { error } = await supabase.from("members").delete().eq("id", id);
    if (error) setError(error.message);
    else await fetchMembers();
  };

  return (
    <PageLayout
      title="Leden"
      subtitle="Beheer je leden en contactpersonen."
      action={
        members.length > 0 ? (
          <div style={{ display: "flex", gap: 8 }}>
            <Button variant="outline" onClick={openImport}>Leden importeren</Button>
            <Button onClick={openAdd}>Lid toevoegen</Button>
          </div>
        ) : undefined
      }
    >
      {/* error banner */}
      {error && (
        <div
          className="p-3 rounded-[7px] mb-4 text-sm"
          style={{ background: "var(--error-light)", color: "var(--error)" }}
        >
          {error}
        </div>
      )}

      {/* loading */}
      {loading ? (
        <p className="text-muted-foreground">Leden laden...</p>
      ) : members.length === 0 ? (
        <EmptyState
          title="Nog geen leden"
          description="Voeg er één toe of importeer uit Excel of CSV."
          action={
            <div style={{ display: "flex", gap: 8, justifyContent: "center" }}>
              <Button onClick={openAdd}>Lid toevoegen</Button>
              <Button variant="outline" onClick={openImport}>Leden importeren</Button>
            </div>
          }
        />
      ) : (
        <div
          className="rounded-[10px] border border-border overflow-hidden"
          style={{ background: "var(--surface)" }}
        >
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Naam</TableHead>
                <TableHead>E-mail</TableHead>
                <TableHead>Telefoon</TableHead>
                <TableHead>Woonplaats</TableHead>
                <TableHead>Type</TableHead>
                <TableHead>Bedrag</TableHead>
                <TableHead>Status</TableHead>
                <TableHead />
              </TableRow>
            </TableHeader>
            <TableBody>
              {members.map((m) => (
                <TableRow key={m.id}>
                  <TableCell className="font-medium">{displayName(m)}</TableCell>
                  <TableCell>{m.email ?? "—"}</TableCell>
                  <TableCell>{m.phone ?? "—"}</TableCell>
                  <TableCell>{m.city ?? "—"}</TableCell>
                  <TableCell>{m.membership_type ?? "—"}</TableCell>
                  <TableCell>
                    {m.monthly_amount != null
                      ? `€ ${m.monthly_amount.toFixed(2)}`
                      : "—"}
                  </TableCell>
                  <TableCell>
                    {m.status === "active"    && <Badge variant="actief">Actief</Badge>}
                    {m.status === "inactive"  && <Badge variant="inactief">Inactief</Badge>}
                    {m.status === "prospect"  && <Badge variant="prospect">Prospect</Badge>}
                    {m.status === "cancelled" && <Badge variant="opgezegd">Opgezegd</Badge>}
                  </TableCell>
                  <TableCell className="text-right whitespace-nowrap">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => openEdit(m)}
                    >
                      Bewerken
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="text-destructive hover:text-destructive"
                      onClick={() => handleDelete(m.id)}
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
    </PageLayout>
  );
}

export default function MembersPage() {
  return <MembersInner />;
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
