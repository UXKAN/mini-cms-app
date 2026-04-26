"use client";

import { useState } from "react";
import AppShell from "../components/AppShell";
import {
  PageLayout,
  Card,
  Badge,
  SearchInput,
  DataTable,
  FormLabel,
  SectionLabel,
  type DataTableColumn,
} from "@/components/crm";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { donors, eur, type Donor } from "@/app/lib/mockData";

// ── Root export ───────────────────────────────────────────────────────────────

export default function OndernemersPage() {
  return (
    <AppShell>
      <OndernemersInner />
    </AppShell>
  );
}

// ── Inner (hooks live here so AppShell provides OrgContext) ───────────────────

type NewOndernemer = {
  naam: string;
  email: string;
  tel: string;
  adres: string;
  postcode_plaats: string;
  iban: string;
  bedrag_maand: string;
  tags: string;
  spaarpot: boolean;
};

const EMPTY_NEW: NewOndernemer = {
  naam: "",
  email: "",
  tel: "",
  adres: "",
  postcode_plaats: "",
  iban: "",
  bedrag_maand: "",
  tags: "",
  spaarpot: false,
};

function StatRow({ label, value }: { label: string; value: React.ReactNode }) {
  return (
    <div
      style={{
        display: "flex",
        justifyContent: "space-between",
        padding: "8px 0",
        borderBottom: "1px solid var(--border)",
      }}
    >
      <span style={{ fontSize: 13, color: "var(--ink-muted)" }}>{label}</span>
      <span style={{ fontSize: 13, fontWeight: 600, color: "var(--ink)" }}>
        {value}
      </span>
    </div>
  );
}

function OndernemersInner() {
  const [q, setQ] = useState("");
  const [selected, setSelected] = useState<Donor | null>(null);
  const [addOpen, setAddOpen] = useState(false);
  const [newO, setNewO] = useState<NewOndernemer>(EMPTY_NEW);

  const ondernemers = donors.filter(
    (d) =>
      d.type === "ondernemer" &&
      (d.naam.toLowerCase().includes(q.toLowerCase()) ||
        d.email.toLowerCase().includes(q.toLowerCase()))
  );

  const columns: DataTableColumn<Donor>[] = [
    {
      key: "naam",
      label: "Bedrijfsnaam",
      sortable: true,
      sortValue: (row) => row.naam,
      render: (row) => (
        <span style={{ fontWeight: 600 }}>{row.naam}</span>
      ),
    },
    {
      key: "type",
      label: "Type",
      sortable: false,
      render: () => <Badge variant="blue">Ondernemer</Badge>,
    },
    {
      key: "email",
      label: "E-mail",
      sortable: true,
      sortValue: (row) => row.email,
      render: (row) => row.email,
    },
    {
      key: "tel",
      label: "Telefoon",
      sortable: false,
      render: (row) => row.tel,
    },
    {
      key: "bedrag_maand",
      label: "Per maand",
      sortable: true,
      sortValue: (row) => row.bedrag_maand,
      render: (row) => (
        <span
          style={{ fontWeight: 600, color: "var(--accent-dark)" }}
        >
          {eur(row.bedrag_maand)}
        </span>
      ),
    },
    {
      key: "tags",
      label: "Sponsor",
      sortable: false,
      render: (row) => (
        <div style={{ display: "flex", gap: 4, flexWrap: "wrap" }}>
          {(row.tags ?? []).map((t) => (
            <Badge key={t} variant="grey">
              {t}
            </Badge>
          ))}
        </div>
      ),
    },
    {
      key: "spaarpot",
      label: "Spaarpot",
      sortable: false,
      render: (row) =>
        row.spaarpot ? (
          <Badge variant="accent">&#10003; Spaarpot</Badge>
        ) : (
          <Badge variant="grey">Geen spaarpot</Badge>
        ),
    },
  ];

  function handleSave() {
    alert(
      `Ondernemer opgeslagen:\n` +
        `Naam: ${newO.naam}\n` +
        `E-mail: ${newO.email}\n` +
        `Bedrag/maand: €${newO.bedrag_maand}\n` +
        `Spaarpot: ${newO.spaarpot ? "Ja" : "Nee"}`
    );
    setAddOpen(false);
    setNewO(EMPTY_NEW);
  }

  return (
    <PageLayout
      title="Ondernemers"
      subtitle={`${ondernemers.length} zakelijke donors`}
      action={
        <div className="flex gap-2">
          <SearchInput
            value={q}
            onChange={setQ}
            placeholder="Zoek op naam…"
          />
          <Button onClick={() => setAddOpen(true)}>
            + Ondernemer toevoegen
          </Button>
        </div>
      }
    >
      {/* ── DataTable card ─────────────────────────────────────────────── */}
      <Card style={{ padding: 0 }}>
        <DataTable<Donor>
          columns={columns}
          rows={ondernemers}
          defaultSort={{ key: "naam", dir: "asc" }}
          onRowClick={(row) => setSelected(row)}
        />
      </Card>

      {/* ── Detail modal ───────────────────────────────────────────────── */}
      <Dialog open={!!selected} onOpenChange={(open) => { if (!open) setSelected(null); }}>
        <DialogContent size="md">
          <DialogHeader>
            <DialogTitle>
              {selected?.naam ?? ""}
            </DialogTitle>
          </DialogHeader>

          {selected && (
            <div>
              {/* Badge row */}
              <div
                style={{
                  display: "flex",
                  gap: 8,
                  flexWrap: "wrap",
                  marginBottom: 16,
                }}
              >
                <Badge variant="blue" size="md">
                  Ondernemer
                </Badge>
                {selected.spaarpot && (
                  <Badge variant="accent" size="md">
                    &#10003; Spaarpot
                  </Badge>
                )}
              </div>

              {/* Stat rows */}
              <StatRow label="E-mail" value={selected.email} />
              <StatRow label="Telefoon" value={selected.tel} />
              <StatRow label="Adres" value={selected.adres} />
              <StatRow
                label="Woonplaats"
                value={selected.postcode_plaats}
              />
              <StatRow label="IBAN" value={selected.iban} />
              <StatRow
                label="Bedrag/maand"
                value={eur(selected.bedrag_maand)}
              />
              <StatRow
                label="Donateur sinds"
                value={selected.startdatum}
              />
              <StatRow
                label="Spaarpot"
                value={selected.spaarpot ? "Ja" : "Nee"}
              />

              {/* Sponsor / projecten tags */}
              {(selected.tags ?? []).length > 0 && (
                <div style={{ marginTop: 16 }}>
                  <p
                    style={{
                      fontSize: 11,
                      fontWeight: 600,
                      color: "var(--ink-muted)",
                      letterSpacing: "0.07em",
                      textTransform: "uppercase",
                      marginBottom: 8,
                    }}
                  >
                    Sponsor / Projecten
                  </p>
                  <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
                    {(selected.tags ?? []).map((t) => (
                      <Badge key={t} variant="accent">
                        {t}
                      </Badge>
                    ))}
                  </div>
                </div>
              )}

            </div>
          )}

          <DialogFooter>
            <Button
              variant="secondary"
              onClick={() => setSelected(null)}
            >
              Sluiten
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* ── Add modal ──────────────────────────────────────────────────── */}
      <Dialog open={addOpen} onOpenChange={(open) => { if (!open) { setAddOpen(false); setNewO(EMPTY_NEW); } }}>
        <DialogContent size="md">
          <DialogHeader>
            <DialogTitle>
              Ondernemer toevoegen
            </DialogTitle>
          </DialogHeader>

          <div style={{ display: "flex", flexDirection: "column", gap: 24 }}>

            {/* Group 1 — Bedrijfsgegevens */}
            <div>
              <SectionLabel mb={12}>Bedrijfsgegevens</SectionLabel>
              <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
                <div>
                  <FormLabel>Bedrijfsnaam</FormLabel>
                  <Input
                    value={newO.naam}
                    onChange={(e) =>
                      setNewO((prev) => ({ ...prev, naam: e.target.value }))
                    }
                  />
                </div>
                <div>
                  <FormLabel>E-mail</FormLabel>
                  <Input
                    type="email"
                    value={newO.email}
                    onChange={(e) =>
                      setNewO((prev) => ({ ...prev, email: e.target.value }))
                    }
                  />
                </div>
                <div>
                  <FormLabel>Telefoon</FormLabel>
                  <Input
                    value={newO.tel}
                    onChange={(e) =>
                      setNewO((prev) => ({ ...prev, tel: e.target.value }))
                    }
                  />
                </div>
              </div>
            </div>

            {/* Group 2 — Adres */}
            <div>
              <SectionLabel mb={12}>Adres</SectionLabel>
              <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
                <div>
                  <FormLabel>Adres</FormLabel>
                  <Input
                    value={newO.adres}
                    onChange={(e) =>
                      setNewO((prev) => ({ ...prev, adres: e.target.value }))
                    }
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <FormLabel>Postcode</FormLabel>
                    <Input
                      value={newO.postcode_plaats.split(" ")[0] ?? ""}
                      onChange={(e) =>
                        setNewO((prev) => ({
                          ...prev,
                          postcode_plaats:
                            e.target.value +
                            " " +
                            (prev.postcode_plaats.split(" ").slice(1).join(" ") ?? ""),
                        }))
                      }
                    />
                  </div>
                  <div>
                    <FormLabel>Woonplaats</FormLabel>
                    <Input
                      value={newO.postcode_plaats.split(" ").slice(1).join(" ")}
                      onChange={(e) =>
                        setNewO((prev) => ({
                          ...prev,
                          postcode_plaats:
                            (prev.postcode_plaats.split(" ")[0] ?? "") +
                            " " +
                            e.target.value,
                        }))
                      }
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* Group 3 — Betaling */}
            <div>
              <SectionLabel mb={12}>Betaling</SectionLabel>
              <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
                <div>
                  <FormLabel>IBAN</FormLabel>
                  <Input
                    value={newO.iban}
                    onChange={(e) =>
                      setNewO((prev) => ({ ...prev, iban: e.target.value }))
                    }
                  />
                </div>
                <div>
                  <FormLabel>Bedrag per maand (€)</FormLabel>
                  <Input
                    type="number"
                    value={newO.bedrag_maand}
                    onChange={(e) =>
                      setNewO((prev) => ({ ...prev, bedrag_maand: e.target.value }))
                    }
                  />
                </div>
              </div>
            </div>

            {/* Group 4 — Sponsoring */}
            <div>
              <SectionLabel mb={12}>Sponsoring</SectionLabel>
              <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
                {/* Sponsor / Projecten */}
                <div>
                  <FormLabel>Sponsor / Projecten</FormLabel>
                  <Input
                    value={newO.tags}
                    placeholder="Ramadan, Bouw, Evenementen"
                    onChange={(e) =>
                      setNewO((prev) => ({ ...prev, tags: e.target.value }))
                    }
                  />
                  <p
                    style={{
                      fontSize: 11,
                      color: "var(--ink-subtle)",
                      marginTop: 4,
                    }}
                  >
                    Meerdere labels scheiden met komma&apos;s
                  </p>
                </div>

                {/* Spaarpot radio cards */}
                <div>
                  <FormLabel>Spaarpot</FormLabel>
                  <div style={{ display: "flex", gap: 10 }}>
                    {([true, false] as const).map((val) => {
                      const active = newO.spaarpot === val;
                      return (
                        <label
                          key={String(val)}
                          style={{
                            display: "flex",
                            alignItems: "center",
                            gap: 8,
                            padding: "9px 16px",
                            border: `1.5px solid ${
                              active ? "var(--accent)" : "var(--border)"
                            }`,
                            borderRadius: "var(--radius-sm)",
                            background: active
                              ? "var(--accent-light)"
                              : "var(--surface)",
                            cursor: "pointer",
                            transition: "all 0.15s",
                            flex: 1,
                            justifyContent: "center",
                          }}
                        >
                          {/* Custom radio dot */}
                          <div
                            style={{
                              width: 15,
                              height: 15,
                              borderRadius: "50%",
                              border: `2px solid ${
                                active ? "var(--accent)" : "var(--border)"
                              }`,
                              background: active ? "var(--accent)" : "transparent",
                              display: "flex",
                              alignItems: "center",
                              justifyContent: "center",
                              flexShrink: 0,
                            }}
                          >
                            {active && (
                              <div
                                style={{
                                  width: 5,
                                  height: 5,
                                  borderRadius: "50%",
                                  background: "white",
                                }}
                              />
                            )}
                          </div>
                          <span
                            style={{
                              fontSize: 13,
                              fontWeight: 500,
                              color: "var(--ink)",
                            }}
                          >
                            {val ? "Ja — heeft spaarpot" : "Nee — geen spaarpot"}
                          </span>
                          <input
                            type="radio"
                            name="spaarpot"
                            checked={active}
                            onChange={() =>
                              setNewO((prev) => ({ ...prev, spaarpot: val }))
                            }
                            style={{ display: "none" }}
                          />
                        </label>
                      );
                    })}
                  </div>
                </div>
              </div>
            </div>

          </div>

          <DialogFooter>
            <Button
              variant="modalPrimary"
              onClick={handleSave}
            >
              Ondernemer toevoegen
            </Button>
            <Button
              variant="outline"
              onClick={() => {
                setAddOpen(false);
                setNewO(EMPTY_NEW);
              }}
            >
              Annuleren
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </PageLayout>
  );
}
