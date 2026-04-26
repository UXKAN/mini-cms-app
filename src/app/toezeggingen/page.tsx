"use client";

import { useState } from "react";
import {
  PageLayout,
  Card,
  Badge,
  SearchInput,
  DataTable,
  FormLabel,
  SectionLabel,
  Select,
  type DataTableColumn,
} from "@/components/crm";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import AppShell from "../components/AppShell";
import { promises as mockPromises, eur, type Promise } from "@/app/lib/mockData";

// ── Types ────────────────────────────────────────────────────────────────────

type NewPromise = {
  naam: string;
  bedrag: string;
  type: "cash" | "online" | "goud";
  wanneer: "week" | "maand" | "jaar";
  datum: string;
};

const EMPTY_FORM: NewPromise = {
  naam: "",
  bedrag: "",
  type: "cash",
  wanneer: "week",
  datum: "",
};

// ── Badge helpers ─────────────────────────────────────────────────────────────

function typeBadge(type: Promise["type"]) {
  const map: Record<Promise["type"], { variant: "grey" | "blue" | "warning"; label: string }> = {
    cash:   { variant: "grey",    label: "Cash" },
    online: { variant: "blue",    label: "Online" },
    goud:   { variant: "warning", label: "Goud" },
  };
  const { variant, label } = map[type];
  return <Badge variant={variant}>{label}</Badge>;
}

function wanneerBadge(wanneer: Promise["wanneer"]) {
  const map: Record<Promise["wanneer"], { variant: "warning" | "blue" | "grey"; label: string }> = {
    week:  { variant: "warning", label: "Deze week" },
    maand: { variant: "blue",    label: "Deze maand" },
    jaar:  { variant: "grey",    label: "Dit jaar" },
  };
  const { variant, label } = map[wanneer];
  return <Badge variant={variant}>{label}</Badge>;
}

function statusBadge(status: Promise["status"]) {
  if (status === "voldaan") return <Badge variant="actief">Voldaan</Badge>;
  return <Badge variant="warning">Open</Badge>;
}

// ── Columns ───────────────────────────────────────────────────────────────────

function buildColumns(
  onMarkDone: (naam: string) => void
): DataTableColumn<Promise>[] {
  return [
    {
      key: "naam",
      label: "Naam",
      sortable: true,
      render: (row) => (
        <span style={{ fontWeight: 600, color: "var(--ink)" }}>{row.naam}</span>
      ),
      sortValue: (row) => row.naam,
    },
    {
      key: "bedrag",
      label: "Bedrag",
      sortable: true,
      render: (row) => (
        <span style={{ fontWeight: 700, color: "var(--accent-dark)" }}>
          {eur(row.bedrag)}
        </span>
      ),
      sortValue: (row) => row.bedrag,
    },
    {
      key: "type",
      label: "Type",
      sortable: false,
      render: (row) => typeBadge(row.type),
    },
    {
      key: "wanneer",
      label: "Wanneer",
      sortable: false,
      render: (row) => wanneerBadge(row.wanneer),
    },
    {
      key: "datum",
      label: "Datum",
      sortable: true,
      render: (row) => (
        <span style={{ fontFamily: "monospace", fontSize: 12, color: "var(--ink-muted)" }}>
          {new Date(row.datum).toLocaleDateString("nl-NL")}
        </span>
      ),
      sortValue: (row) => row.datum,
    },
    {
      key: "status",
      label: "Status",
      sortable: false,
      render: (row) =>
        row.status === "open" ? (
          <Button
            size="sm"
            variant="secondary"
            onClick={() => onMarkDone(row.naam)}
          >
            Markeer voldaan
          </Button>
        ) : (
          statusBadge(row.status)
        ),
    },
  ];
}

// ── Inner component ───────────────────────────────────────────────────────────

function ToezeggingenInner() {
  const [q, setQ] = useState("");
  const [addOpen, setAddOpen] = useState(false);
  const [form, setForm] = useState<NewPromise>(EMPTY_FORM);

  // Derived stats from mock data
  const openTotal = mockPromises
    .filter((p) => p.status === "open")
    .reduce((s, p) => s + p.bedrag, 0);
  const weekCount = mockPromises.filter(
    (p) => p.wanneer === "week" && p.status === "open"
  ).length;
  const maandCount = mockPromises.filter(
    (p) => p.wanneer === "maand" && p.status === "open"
  ).length;
  const openCount = mockPromises.filter((p) => p.status === "open").length;

  const filtered = mockPromises.filter((p) =>
    p.naam.toLowerCase().includes(q.toLowerCase())
  );

  const handleMarkDone = (naam: string) => {
    alert(`Markeer als voldaan: ${naam}`);
  };

  const handleSave = () => {
    alert(
      `Toezegging toegevoegd:\n` +
        `Naam: ${form.naam}\n` +
        `Bedrag: € ${form.bedrag}\n` +
        `Type: ${form.type}\n` +
        `Wanneer: ${form.wanneer}\n` +
        `Datum: ${form.datum}`
    );
    setAddOpen(false);
    setForm(EMPTY_FORM);
  };

  const handleCancel = () => {
    setAddOpen(false);
    setForm(EMPTY_FORM);
  };

  const columns = buildColumns(handleMarkDone);

  return (
    <PageLayout
      title="Toezeggingen"
      subtitle={`${openCount} openstaande toezeggingen`}
      action={
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <SearchInput
            value={q}
            onChange={setQ}
            placeholder="Zoek op naam…"
            width={200}
          />
          <Button onClick={() => setAddOpen(true)}>+ Toezegging toevoegen</Button>
        </div>
      }
    >
      {/* ── 3 Stat Cards ──────────────────────────────────────────────────── */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(3, 1fr)",
          gap: 16,
          marginBottom: 20,
        }}
      >
        {/* Openstaand */}
        <Card
          padding="compact"
          style={{
            borderLeft: "3px solid var(--warn)",
          }}
        >
          <SectionLabel mb={4}>Openstaand</SectionLabel>
          <div
            style={{
              fontFamily: "var(--font-serif)",
              fontSize: 30,
              fontWeight: 400,
              color: openTotal > 5000 ? "var(--warn)" : "var(--ink)",
              marginTop: 4,
            }}
          >
            {eur(openTotal)}
          </div>
        </Card>

        {/* Deze week */}
        <Card
          padding="compact"
          style={{
            borderLeft: "3px solid var(--accent)",
          }}
        >
          <SectionLabel mb={4}>Deze week</SectionLabel>
          <div
            style={{
              fontFamily: "var(--font-serif)",
              fontSize: 30,
              fontWeight: 400,
              color: "var(--accent-dark)",
              marginTop: 4,
            }}
          >
            {weekCount}
          </div>
        </Card>

        {/* Deze maand */}
        <Card
          padding="compact"
          style={{
            borderLeft: "3px solid oklch(0.35 0.1 240)",
          }}
        >
          <SectionLabel mb={4}>Deze maand</SectionLabel>
          <div
            style={{
              fontFamily: "var(--font-serif)",
              fontSize: 30,
              fontWeight: 400,
              color: "oklch(0.35 0.1 240)",
              marginTop: 4,
            }}
          >
            {maandCount}
          </div>
        </Card>
      </div>

      {/* ── DataTable ─────────────────────────────────────────────────────── */}
      <Card style={{ padding: 0 }}>
        <DataTable<Promise>
          columns={columns}
          rows={filtered}
          defaultSort={{ key: "datum", dir: "asc" }}
          emptyMessage="Geen toezeggingen gevonden"
        />
      </Card>

      {/* ── Add Modal ─────────────────────────────────────────────────────── */}
      <Dialog
        open={addOpen}
        onOpenChange={(open) => !open && handleCancel()}
      >
        <DialogContent size="md">
          <DialogHeader>
            <DialogTitle>
              Toezegging toevoegen
            </DialogTitle>
          </DialogHeader>

          <div style={{ display: "flex", flexDirection: "column", gap: 16, marginTop: 4 }}>
            {/* Naam */}
            <div>
              <FormLabel required htmlFor="tz-naam">
                Naam
              </FormLabel>
              <Input
                id="tz-naam"
                type="text"
                value={form.naam}
                onChange={(e) => setForm((f) => ({ ...f, naam: e.target.value }))}
                placeholder="Volledige naam"
                className="h-10 text-sm"
              />
            </div>

            {/* Bedrag */}
            <div>
              <FormLabel required htmlFor="tz-bedrag">
                Bedrag (€)
              </FormLabel>
              <Input
                id="tz-bedrag"
                type="number"
                min="0"
                step="1"
                value={form.bedrag}
                onChange={(e) => setForm((f) => ({ ...f, bedrag: e.target.value }))}
                placeholder="bv. 500"
                className="h-10 text-sm"
              />
            </div>

            {/* Type */}
            <div>
              <FormLabel htmlFor="tz-type">Type</FormLabel>
              <Select
                id="tz-type"
                value={form.type}
                onChange={(e) =>
                  setForm((f) => ({
                    ...f,
                    type: e.target.value as NewPromise["type"],
                  }))
                }
              >
                <option value="cash">Cash</option>
                <option value="online">Online</option>
                <option value="goud">Goud</option>
              </Select>
            </div>

            {/* Wanneer */}
            <div>
              <FormLabel htmlFor="tz-wanneer">Wanneer</FormLabel>
              <Select
                id="tz-wanneer"
                value={form.wanneer}
                onChange={(e) =>
                  setForm((f) => ({
                    ...f,
                    wanneer: e.target.value as NewPromise["wanneer"],
                  }))
                }
              >
                <option value="week">Deze week</option>
                <option value="maand">Deze maand</option>
                <option value="jaar">Dit jaar</option>
              </Select>
            </div>

            {/* Verwachte datum */}
            <div>
              <FormLabel htmlFor="tz-datum">Verwachte datum</FormLabel>
              <Input
                id="tz-datum"
                type="date"
                value={form.datum}
                onChange={(e) => setForm((f) => ({ ...f, datum: e.target.value }))}
                className="h-10 text-sm"
              />
            </div>

            {/* Buttons */}
            <div style={{ display: "flex", gap: 8, justifyContent: "flex-end", marginTop: 4 }}>
              <Button type="button" variant="outline" onClick={handleCancel}>
                Annuleren
              </Button>
              <Button
                type="button"
                onClick={handleSave}
                disabled={!form.naam || !form.bedrag}
                variant="modalPrimary"
              >
                Toezegging toevoegen
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </PageLayout>
  );
}

// ── Page export ───────────────────────────────────────────────────────────────

export default function ToezeggingenPage() {
  return (
    <AppShell>
      <ToezeggingenInner />
    </AppShell>
  );
}
