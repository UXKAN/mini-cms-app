"use client";

import { useCallback, useEffect, useState } from "react";
import { supabase } from "../lib/supabase";
import { useAuth } from "../lib/useAuth";
import AppShell from "../components/AppShell";
import Modal from "../components/Modal";
import { useOrg } from "../lib/orgContext";
import type { DonationMethod, DonationWithMember, Member } from "../lib/types";

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

  useEffect(() => {
    if (user) fetchAll();
  }, [user, fetchAll]);

  const openAdd = () => {
    setEditing(null);
    setModalMode("add");
  };

  const openEdit = (d: DonationWithMember) => {
    setEditing(d);
    setModalMode("edit");
  };

  const closeModal = () => {
    setModalMode("closed");
    setEditing(null);
  };

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
    <>
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "flex-end",
          marginBottom: 28,
          gap: 16,
          flexWrap: "wrap",
        }}
      >
        <div>
          <h1
            style={{
              fontFamily: "var(--font-serif), Georgia, serif",
              fontSize: 36,
              fontWeight: 400,
              color: "var(--ink)",
            }}
          >
            Donaties
          </h1>
          <p style={{ color: "var(--ink-muted)", fontSize: 14, marginTop: 4 }}>
            Registreer donaties en koppel ze optioneel aan een lid.
          </p>
        </div>
        {donations.length > 0 && (
          <button onClick={openAdd} style={primaryBtn}>
            Donatie toevoegen
          </button>
        )}
      </div>

      {donations.length > 0 && (
        <section
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))",
            gap: 16,
            marginBottom: 24,
          }}
        >
          <StatCard label="Totaal dit jaar" value={formatEuro(yearTotal)} />
          <StatCard label="Totaal (alles)" value={formatEuro(total)} />
          <StatCard label="Aantal donaties" value={String(donations.length)} />
        </section>
      )}

      {error && (
        <div
          style={{
            padding: 14,
            background: "var(--error-light)",
            color: "var(--error)",
            borderRadius: "var(--radius-sm)",
            marginBottom: 16,
            fontSize: 14,
          }}
        >
          {error}
        </div>
      )}

      {loading ? (
        <p style={{ color: "var(--ink-muted)" }}>Donaties laden...</p>
      ) : donations.length === 0 ? (
        <div style={{ ...cardStyle, textAlign: "center", padding: "56px 24px" }}>
          <h2
            style={{
              fontFamily: "var(--font-serif), Georgia, serif",
              fontSize: 22,
              fontWeight: 400,
              color: "var(--ink)",
              marginBottom: 8,
            }}
          >
            Nog geen donaties
          </h2>
          <p style={{ color: "var(--ink-muted)", fontSize: 14, marginBottom: 24 }}>
            Registreer je eerste donatie en koppel deze optioneel aan een lid.
          </p>
          <button onClick={openAdd} style={primaryBtn}>
            Donatie toevoegen
          </button>
        </div>
      ) : (
        <div style={{ ...cardStyle, padding: 0, overflow: "hidden" }}>
          <table style={{ width: "100%", borderCollapse: "collapse" }}>
            <thead>
              <tr>
                <th style={thStyle}>Datum</th>
                <th style={thStyle}>Bedrag</th>
                <th style={thStyle}>Methode</th>
                <th style={thStyle}>Lid</th>
                <th style={thStyle}>Notities</th>
                <th style={thStyle}></th>
              </tr>
            </thead>
            <tbody>
              {donations.map((d) => (
                <tr key={d.id} style={{ borderTop: "1px solid var(--border)" }}>
                  <td style={tdStyle}>
                    {new Date(d.donated_at).toLocaleDateString("nl-NL")}
                  </td>
                  <td style={{ ...tdStyle, fontWeight: 600 }}>
                    {formatEuro(Number(d.amount))}
                  </td>
                  <td style={tdStyle}>{METHOD_LABELS[d.method]}</td>
                  <td style={tdStyle}>
                    {d.member ? memberLabel(d.member) : (
                      <span style={{ color: "var(--ink-subtle)", fontStyle: "italic" }}>
                        Anoniem
                      </span>
                    )}
                  </td>
                  <td style={{ ...tdStyle, color: "var(--ink-muted)" }}>
                    {d.notes ?? "—"}
                  </td>
                  <td style={{ ...tdStyle, textAlign: "right", whiteSpace: "nowrap" }}>
                    <button onClick={() => openEdit(d)} style={rowBtn}>
                      Bewerken
                    </button>{" "}
                    <button
                      onClick={() => handleDelete(d.id)}
                      style={{ ...rowBtn, color: "var(--error)" }}
                    >
                      Verwijderen
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      <Modal
        open={modalMode !== "closed"}
        onClose={closeModal}
        title={modalMode === "edit" ? "Donatie bewerken" : "Nieuwe donatie"}
      >
        <DonationForm
          initial={editing}
          members={members}
          onSaved={async () => {
            closeModal();
            await fetchAll();
          }}
          onCancel={closeModal}
        />
      </Modal>
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
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;
    const amt = parseFloat(amount.replace(",", "."));
    if (!amt || amt <= 0) {
      setError("Vul een geldig bedrag in.");
      return;
    }
    setSaving(true);
    setError(null);

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

    if (error) {
      setError(error.message);
      setSaving(false);
    } else {
      setSaving(false);
      await onSaved();
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
        <label style={fieldLabel}>
          Bedrag (EUR) *
          <input
            type="number"
            step="0.01"
            min="0"
            placeholder="bv. 25.00"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            style={inputStyle}
            required
          />
        </label>
        <label style={fieldLabel}>
          Datum *
          <input
            type="date"
            value={donatedAt}
            onChange={(e) => setDonatedAt(e.target.value)}
            style={inputStyle}
            required
          />
        </label>
        <label style={fieldLabel}>
          Methode
          <select
            value={method}
            onChange={(e) => setMethod(e.target.value as DonationMethod)}
            style={inputStyle}
          >
            {(Object.keys(METHOD_LABELS) as DonationMethod[]).map((m) => (
              <option key={m} value={m}>
                {METHOD_LABELS[m]}
              </option>
            ))}
          </select>
        </label>
        <label style={fieldLabel}>
          Lid (optioneel)
          <select
            value={memberId}
            onChange={(e) => setMemberId(e.target.value)}
            style={inputStyle}
          >
            <option value="">— anoniem —</option>
            {members.map((m) => (
              <option key={m.id} value={m.id}>
                {memberLabel(m)}
              </option>
            ))}
          </select>
        </label>
        <label style={{ ...fieldLabel, gridColumn: "1 / -1" }}>
          Notities
          <input
            placeholder="Omschrijving, doel, etc."
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            style={inputStyle}
          />
        </label>
      </div>

      {error && (
        <div
          style={{
            padding: 12,
            background: "var(--error-light)",
            color: "var(--error)",
            borderRadius: "var(--radius-sm)",
            marginTop: 16,
            fontSize: 14,
          }}
        >
          {error}
        </div>
      )}

      <div style={{ display: "flex", gap: 8, marginTop: 20, justifyContent: "flex-end" }}>
        <button type="button" onClick={onCancel} style={ghostBtn} disabled={saving}>
          Annuleren
        </button>
        <button type="submit" disabled={saving} style={primaryBtn}>
          {saving ? "Opslaan..." : initial ? "Opslaan" : "Toevoegen"}
        </button>
      </div>
    </form>
  );
}

function StatCard({ label, value }: { label: string; value: string }) {
  return (
    <div style={cardStyle}>
      <div
        style={{
          fontSize: 11,
          fontWeight: 700,
          color: "var(--ink-subtle)",
          letterSpacing: "0.06em",
          textTransform: "uppercase",
        }}
      >
        {label}
      </div>
      <div
        style={{
          fontFamily: "var(--font-serif), Georgia, serif",
          fontSize: 32,
          fontWeight: 400,
          color: "var(--ink)",
          marginTop: 6,
          lineHeight: 1.1,
        }}
      >
        {value}
      </div>
    </div>
  );
}

function formatEuro(n: number) {
  return n.toLocaleString("nl-NL", {
    style: "currency",
    currency: "EUR",
    minimumFractionDigits: 2,
  });
}

const inputStyle: React.CSSProperties = {
  padding: "11px 12px",
  fontSize: 14,
  border: "1px solid var(--border)",
  borderRadius: "var(--radius-sm)",
  background: "var(--bg)",
  color: "var(--ink)",
  width: "100%",
};

const fieldLabel: React.CSSProperties = {
  display: "flex",
  flexDirection: "column",
  gap: 6,
  fontSize: 12,
  color: "var(--ink-muted)",
  fontWeight: 500,
};

const cardStyle: React.CSSProperties = {
  padding: 24,
  border: "1px solid var(--border)",
  borderRadius: "var(--radius)",
  marginBottom: 24,
  background: "var(--surface)",
  boxShadow: "var(--shadow)",
};

const primaryBtn: React.CSSProperties = {
  padding: "10px 18px",
  fontSize: 14,
  fontWeight: 500,
  border: "none",
  borderRadius: "var(--radius-sm)",
  background: "var(--accent)",
  color: "#fff",
  cursor: "pointer",
};

const ghostBtn: React.CSSProperties = {
  padding: "10px 18px",
  fontSize: 14,
  fontWeight: 500,
  border: "1px solid var(--border)",
  borderRadius: "var(--radius-sm)",
  background: "transparent",
  color: "var(--ink)",
  cursor: "pointer",
};

const rowBtn: React.CSSProperties = {
  padding: "6px 12px",
  fontSize: 13,
  fontWeight: 500,
  border: "1px solid var(--border)",
  borderRadius: "var(--radius-sm)",
  background: "transparent",
  color: "var(--ink)",
  cursor: "pointer",
};

const thStyle: React.CSSProperties = {
  textAlign: "left",
  padding: "14px 16px",
  fontSize: 11,
  fontWeight: 700,
  color: "var(--ink-subtle)",
  letterSpacing: "0.06em",
  textTransform: "uppercase",
  background: "var(--bg)",
};

const tdStyle: React.CSSProperties = {
  padding: "14px 16px",
  fontSize: 14,
  color: "var(--ink)",
};
