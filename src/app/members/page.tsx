"use client";

import { useCallback, useEffect, useState } from "react";
import { supabase } from "../lib/supabase";
import { useAuth } from "../lib/useAuth";
import AppShell from "../components/AppShell";
import Modal from "../components/Modal";
import MemberImporter from "../components/MemberImporter";
import { useOrg } from "../lib/orgContext";
import type { Member, MemberStatus } from "../lib/types";

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

  const openAdd = () => {
    setEditing(null);
    setModalMode("add");
  };

  const openEdit = (m: Member) => {
    setEditing(m);
    setModalMode("edit");
  };

  const openImport = () => {
    setEditing(null);
    setModalMode("import");
  };

  const closeModal = () => {
    setModalMode("closed");
    setEditing(null);
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Weet je zeker dat je dit lid wilt verwijderen?")) return;
    const { error } = await supabase.from("members").delete().eq("id", id);
    if (error) setError(error.message);
    else await fetchMembers();
  };

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
            Leden
          </h1>
          <p style={{ color: "var(--ink-muted)", fontSize: 14, marginTop: 4 }}>
            Beheer je leden en contactpersonen.
          </p>
        </div>
        {members.length > 0 && (
          <div style={{ display: "flex", gap: 8 }}>
            <button onClick={openImport} style={ghostBtn}>
              Leden importeren
            </button>
            <button onClick={openAdd} style={primaryBtn}>
              Lid toevoegen
            </button>
          </div>
        )}
      </div>

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
        <p style={{ color: "var(--ink-muted)" }}>Leden laden...</p>
      ) : members.length === 0 ? (
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
            Nog geen leden
          </h2>
          <p style={{ color: "var(--ink-muted)", fontSize: 14, marginBottom: 24 }}>
            Voeg er één toe of importeer uit Excel of CSV.
          </p>
          <div style={{ display: "inline-flex", gap: 8 }}>
            <button onClick={openAdd} style={primaryBtn}>
              Lid toevoegen
            </button>
            <button onClick={openImport} style={ghostBtn}>
              Leden importeren
            </button>
          </div>
        </div>
      ) : (
        <div style={{ ...cardStyle, padding: 0, overflow: "hidden" }}>
          <table style={{ width: "100%", borderCollapse: "collapse" }}>
            <thead>
              <tr>
                <th style={thStyle}>Naam</th>
                <th style={thStyle}>E-mail</th>
                <th style={thStyle}>Telefoon</th>
                <th style={thStyle}>Woonplaats</th>
                <th style={thStyle}>Type</th>
                <th style={thStyle}>Bedrag</th>
                <th style={thStyle}>Status</th>
                <th style={thStyle}></th>
              </tr>
            </thead>
            <tbody>
              {members.map((m) => (
                <tr key={m.id} style={{ borderTop: "1px solid var(--border)" }}>
                  <td style={{ ...tdStyle, fontWeight: 500 }}>{displayName(m)}</td>
                  <td style={tdStyle}>{m.email ?? "—"}</td>
                  <td style={tdStyle}>{m.phone ?? "—"}</td>
                  <td style={tdStyle}>{m.city ?? "—"}</td>
                  <td style={tdStyle}>{m.membership_type ?? "—"}</td>
                  <td style={tdStyle}>
                    {m.monthly_amount != null ? `€ ${m.monthly_amount.toFixed(2)}` : "—"}
                  </td>
                  <td style={tdStyle}>
                    <StatusChip status={m.status} />
                  </td>
                  <td style={{ ...tdStyle, textAlign: "right", whiteSpace: "nowrap" }}>
                    <button onClick={() => openEdit(m)} style={rowBtn}>
                      Bewerken
                    </button>{" "}
                    <button
                      onClick={() => handleDelete(m.id)}
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
        open={modalMode === "add" || modalMode === "edit"}
        onClose={closeModal}
        title={modalMode === "edit" ? "Lid bewerken" : "Nieuw lid"}
        width={640}
      >
        <MemberForm
          initial={editing}
          onSaved={async () => {
            closeModal();
            await fetchMembers();
          }}
          onCancel={closeModal}
        />
      </Modal>

      <Modal
        open={modalMode === "import"}
        onClose={closeModal}
        title="Leden importeren"
        width={960}
      >
        <MemberImporter
          showReportLink={false}
          onDone={async () => {
            closeModal();
            await fetchMembers();
          }}
        />
      </Modal>
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
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;
    const hasName = firstName.trim() || lastName.trim();
    if (!hasName) {
      setError("Vul minimaal een voornaam of achternaam in.");
      return;
    }
    setSaving(true);
    setError(null);

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
      setError(error.message);
      setSaving(false);
    } else {
      setSaving(false);
      await onSaved();
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      <div style={formGrid}>
        <input
          placeholder="Voornaam *"
          value={firstName}
          onChange={(e) => setFirstName(e.target.value)}
          style={inputStyle}
        />
        <input
          placeholder="Achternaam"
          value={lastName}
          onChange={(e) => setLastName(e.target.value)}
          style={inputStyle}
        />
        <input
          type="email"
          placeholder="E-mail"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          style={inputStyle}
        />
        <input
          placeholder="Telefoon"
          value={phone}
          onChange={(e) => setPhone(e.target.value)}
          style={inputStyle}
        />
        <input
          placeholder="Adres"
          value={address}
          onChange={(e) => setAddress(e.target.value)}
          style={{ ...inputStyle, gridColumn: "span 2" }}
        />
        <input
          placeholder="Postcode"
          value={postcode}
          onChange={(e) => setPostcode(e.target.value)}
          style={inputStyle}
        />
        <input
          placeholder="Woonplaats"
          value={city}
          onChange={(e) => setCity(e.target.value)}
          style={inputStyle}
        />
        <input
          placeholder="IBAN"
          value={iban}
          onChange={(e) => setIban(e.target.value)}
          style={inputStyle}
        />
        <input
          placeholder="Lidmaatschapstype"
          value={membershipType}
          onChange={(e) => setMembershipType(e.target.value)}
          style={inputStyle}
        />
        <input
          type="number"
          step="0.01"
          min="0"
          placeholder="Maandbedrag"
          value={monthlyAmount}
          onChange={(e) => setMonthlyAmount(e.target.value)}
          style={inputStyle}
        />
        <input
          type="date"
          placeholder="Startdatum"
          value={startDate}
          onChange={(e) => setStartDate(e.target.value)}
          style={inputStyle}
        />
        <select
          value={status}
          onChange={(e) => setStatus(e.target.value as MemberStatus)}
          style={inputStyle}
        >
          {STATUS_OPTIONS.map((o) => (
            <option key={o.value} value={o.value}>
              {o.label}
            </option>
          ))}
        </select>
        <input
          placeholder="Notities"
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
          style={{ ...inputStyle, gridColumn: "span 2" }}
        />
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

function StatusChip({ status }: { status: MemberStatus }) {
  const map: Record<MemberStatus, { label: string; bg: string; color: string }> = {
    active: { label: "Actief", bg: "var(--success-light)", color: "var(--success)" },
    inactive: { label: "Inactief", bg: "var(--bg)", color: "var(--ink-muted)" },
    prospect: { label: "Prospect", bg: "var(--warn-light)", color: "var(--warn)" },
    cancelled: { label: "Opgezegd", bg: "var(--error-light)", color: "var(--error)" },
  };
  const s = map[status] ?? map.active;
  return (
    <span
      style={{
        padding: "3px 10px",
        borderRadius: 4,
        background: s.bg,
        color: s.color,
        fontSize: 12,
        fontWeight: 600,
      }}
    >
      {s.label}
    </span>
  );
}

const formGrid: React.CSSProperties = {
  display: "grid",
  gridTemplateColumns: "1fr 1fr",
  gap: 12,
};

const inputStyle: React.CSSProperties = {
  padding: "11px 12px",
  fontSize: 14,
  border: "1px solid var(--border)",
  borderRadius: "var(--radius-sm)",
  background: "var(--bg)",
  color: "var(--ink)",
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
