"use client";

import { useCallback, useEffect, useState } from "react";
import { supabase } from "../lib/supabase";
import { useAuth } from "../lib/useAuth";
import MemberImporter from "../components/MemberImporter";
import { useOrg } from "../lib/orgContext";
import type { Member, MemberStatus } from "../lib/types";
import { Button } from "@/components/ui/button";
import AppShell from "../components/AppShell";
import { PageLayout, EmptyState, Badge, Card, FormLabel, RowActions, Select, SectionLabel } from "@/components/crm";
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
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { AlertTriangle } from "lucide-react";
import { donors as mockDonors, eur } from "../lib/mockData";

const STATUS_OPTIONS: { value: MemberStatus; label: string }[] = [
  { value: "active", label: "Actief" },
  { value: "inactive", label: "Inactief" },
  { value: "prospect", label: "Prospect" },
  { value: "cancelled", label: "Opgezegd" },
];

type ModalMode = "closed" | "add" | "edit" | "import";

const tabStyle = (active: boolean): React.CSSProperties => ({
  padding: "8px 18px",
  border: "none",
  borderBottom: active ? "2px solid var(--accent)" : "2px solid transparent",
  background: "transparent",
  fontFamily: "var(--font-sans)",
  fontSize: 14,
  fontWeight: active ? 600 : 400,
  color: active ? "var(--accent)" : "var(--ink-muted)",
  cursor: "pointer",
  transition: "all 0.15s",
});

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
  const [tab, setTab] = useState<"leden" | "gezinnen">("leden");

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

  // Gezinnen — group by last name (mock data, since Supabase doesn't track families yet)
  const allMockLeden = mockDonors.filter((d) => d.type === "particulier");
  const getLast = (naam: string): string => naam.trim().split(/\s+/).pop() ?? "";
  const gezinMap: Record<string, typeof allMockLeden> = {};
  allMockLeden.forEach((d) => {
    const last = getLast(d.naam);
    if (!gezinMap[last]) gezinMap[last] = [];
    gezinMap[last].push(d);
  });
  const gezinnen = Object.entries(gezinMap)
    .filter(([, leden]) => leden.length >= 2)
    .map(([naam, leden]) => ({
      naam,
      leden,
      aantalLeden: leden.length,
      totaalPerMaand: leden.reduce((s, d) => s + d.bedrag_maand, 0),
      gemPerPersoon: Math.round(leden.reduce((s, d) => s + d.bedrag_maand, 0) / leden.length),
    }))
    .sort((a, b) => b.aantalLeden - a.aantalLeden || b.totaalPerMaand - a.totaalPerMaand);
  const lowAlertCount = gezinnen.filter((g) => g.gemPerPersoon < 15).length;

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

      {/* Tabs */}
      <div style={{ display: "flex", borderBottom: "1px solid var(--border)", marginBottom: 16, gap: 4 }}>
        <button
          onClick={() => setTab("leden")}
          style={tabStyle(tab === "leden")}
        >
          Alle leden ({members.length})
        </button>
        <button
          onClick={() => setTab("gezinnen")}
          style={tabStyle(tab === "gezinnen")}
        >
          Gezinnen ({gezinnen.length})
          {lowAlertCount > 0 && (
            <span style={{
              marginLeft: 8,
              display: "inline-flex",
              alignItems: "center",
              justifyContent: "center",
              width: 18,
              height: 18,
              borderRadius: "50%",
              background: "oklch(0.60 0.14 55)",
              color: "white",
              fontSize: 10,
              fontWeight: 700,
            }}>
              {lowAlertCount}
            </span>
          )}
        </button>
      </div>

      {tab === "leden" && (
        <>
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
                        <RowActions
                          onEdit={() => openEdit(m)}
                          onDelete={() => handleDelete(m.id)}
                        />
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </>
      )}

      {tab === "gezinnen" && (
        <GezinnenView gezinnen={gezinnen} />
      )}

      {/* Add / Edit dialog */}
      <Dialog
        open={modalMode === "add" || modalMode === "edit"}
        onOpenChange={(open) => { if (!open) closeModal(); }}
      >
        <DialogContent size="lg">
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
        <DialogContent size="xl">
          <DialogHeader>
            <DialogTitle>
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

// AppShell provides the sidebar + OrgContext. PageLayout is inside MembersInner.
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
      <div style={{ display: "flex", flexDirection: "column", gap: 24 }}>
        {/* 1. Naam */}
        <div>
          <SectionLabel mb={12}>Naam</SectionLabel>
          <div className="grid grid-cols-2 gap-4">
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
          </div>
        </div>

        {/* 2. Contactgegevens */}
        <div>
          <SectionLabel mb={12}>Contactgegevens</SectionLabel>
          <div className="grid grid-cols-2 gap-4">
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
          </div>
        </div>

        {/* 3. Adres */}
        <div>
          <SectionLabel mb={12}>Adres</SectionLabel>
          <div className="grid grid-cols-2 gap-4">
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
          </div>
        </div>

        {/* 4. Lidmaatschap */}
        <div>
          <SectionLabel mb={12}>Lidmaatschap</SectionLabel>
          <div className="grid grid-cols-2 gap-4">
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
            <div className="col-span-2">
              <FormLabel>Status</FormLabel>
              <Select
                value={status}
                onChange={(e) => setStatus(e.target.value as MemberStatus)}
              >
                {STATUS_OPTIONS.map((o) => (
                  <option key={o.value} value={o.value}>
                    {o.label}
                  </option>
                ))}
              </Select>
            </div>
          </div>
        </div>

        {/* 5. Notities */}
        <div>
          <SectionLabel mb={12}>Notities</SectionLabel>
          <div className="grid grid-cols-2 gap-4">
            <Input
              placeholder="Notities"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              className={`${inputCls} col-span-2`}
            />
          </div>
        </div>
      </div>

      {formError && (
        <div
          className="p-3 rounded-[7px] mt-4 text-sm"
          style={{ background: "var(--error-light)", color: "var(--error)" }}
        >
          {formError}
        </div>
      )}

      <DialogFooter>
        <Button type="button" variant="outline" onClick={onCancel} disabled={saving}>
          Annuleren
        </Button>
        <Button type="submit" disabled={saving} variant="modalPrimary">
          {saving ? "Opslaan..." : initial ? "Opslaan" : "Toevoegen"}
        </Button>
      </DialogFooter>
    </form>
  );
}

function GezinnenView({ gezinnen }: { gezinnen: Array<{
  naam: string;
  leden: Array<{ id: string; naam: string; tel: string; email: string; bedrag_maand: number }>;
  aantalLeden: number;
  totaalPerMaand: number;
  gemPerPersoon: number;
}> }) {
  const lowAlertCount = gezinnen.filter((g) => g.gemPerPersoon < 15).length;

  return (
    <div>
      {/* Alert summary */}
      {lowAlertCount > 0 && (
        <div style={{
          padding: "14px 18px",
          background: "oklch(0.96 0.04 55)",
          border: "1px solid oklch(0.60 0.14 55 / 0.3)",
          borderRadius: "var(--radius-sm)",
          marginBottom: 16,
          display: "flex",
          alignItems: "flex-start",
          gap: 12,
        }}>
          <AlertTriangle size={18} color="oklch(0.60 0.14 55)" style={{ flexShrink: 0, marginTop: 1 }} />
          <div>
            <div style={{ fontSize: 13, fontWeight: 700, color: "oklch(0.40 0.12 55)", marginBottom: 2 }}>
              {lowAlertCount} gezinnen betalen minder dan €15/persoon
            </div>
            <div style={{ fontSize: 12, color: "oklch(0.50 0.10 55)" }}>
              Overweeg om deze gezinnen te benaderen over het verhogen van hun lidmaatschapsbijdrage.
            </div>
          </div>
        </div>
      )}

      <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
        {gezinnen.map((g) => {
          const lowAlert = g.gemPerPersoon < 15;
          return (
            <Card key={g.naam} style={{ padding: "18px 20px", borderLeft: `3px solid ${lowAlert ? "oklch(0.60 0.14 55)" : "var(--accent)"}` }}>
              <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", flexWrap: "wrap", gap: 12 }}>
                <div>
                  <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 8, flexWrap: "wrap" }}>
                    <span style={{ fontFamily: "var(--font-serif)", fontSize: 18, fontWeight: 400 }}>
                      Familie {g.naam}
                    </span>
                    <Badge variant="grey">{g.aantalLeden} leden</Badge>
                    {lowAlert && (
                      <span style={{
                        display: "inline-flex",
                        alignItems: "center",
                        gap: 5,
                        padding: "3px 10px",
                        borderRadius: 100,
                        background: "oklch(0.96 0.04 55)",
                        color: "oklch(0.60 0.14 55)",
                        fontSize: 11,
                        fontWeight: 700,
                      }}>
                        ⚠ Benaderen
                      </span>
                    )}
                  </div>
                  <div style={{ display: "flex", gap: 20, flexWrap: "wrap" }}>
                    <div>
                      <span style={{ fontSize: 11, color: "var(--ink-subtle)", display: "block", marginBottom: 1 }}>
                        Totaal/maand
                      </span>
                      <span style={{
                        fontSize: 18,
                        fontWeight: 700,
                        color: lowAlert ? "oklch(0.60 0.14 55)" : "var(--accent-dark)",
                        fontFamily: "var(--font-serif)",
                      }}>
                        {eur(g.totaalPerMaand)}
                      </span>
                    </div>
                    <div>
                      <span style={{ fontSize: 11, color: "var(--ink-subtle)", display: "block", marginBottom: 1 }}>
                        Gemiddeld/persoon
                      </span>
                      <span style={{
                        fontSize: 18,
                        fontWeight: 700,
                        color: lowAlert ? "oklch(0.60 0.14 55)" : "var(--ink)",
                        fontFamily: "var(--font-serif)",
                      }}>
                        {eur(g.gemPerPersoon)}
                      </span>
                    </div>
                  </div>
                </div>
                <div style={{ fontSize: 12, color: "var(--ink-muted)", textAlign: "right" }}>
                  {g.leden.map((l) => (
                    <div key={l.id} style={{ marginBottom: 2 }}>
                      {l.naam} — <strong style={{ color: "var(--ink)" }}>{eur(l.bedrag_maand)}/mnd</strong>
                    </div>
                  ))}
                </div>
              </div>
              {lowAlert && (
                <div style={{
                  marginTop: 12,
                  paddingTop: 12,
                  borderTop: "1px solid var(--border)",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                  flexWrap: "wrap",
                  gap: 8,
                }}>
                  <span style={{ fontSize: 12, color: "oklch(0.50 0.10 55)" }}>
                    Gemiddeld bijdrage van {eur(g.gemPerPersoon)}/persoon — onder de aanbevolen €15/maand
                  </span>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() =>
                      alert(
                        `Neem contact op met familie ${g.naam}:\n` +
                        g.leden.map((l) => `• ${l.naam} (${l.tel || l.email})`).join("\n")
                      )
                    }
                  >
                    Contact opnemen
                  </Button>
                </div>
              )}
            </Card>
          );
        })}
      </div>
    </div>
  );
}
