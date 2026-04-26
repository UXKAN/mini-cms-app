"use client";

import { useState } from "react";
import { PageLayout, Card, Badge, SectionLabel, FormLabel } from "@/components/crm";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import AppShell from "../components/AppShell";
import { events, type AppEvent } from "@/app/lib/mockData";

export default function EvenementenPage() {
  return (
    <AppShell>
      <EvenementenInner />
    </AppShell>
  );
}

function EvenementenInner() {
  const [addOpen, setAddOpen] = useState(false);
  const [newEv, setNewEv] = useState({
    titel: "",
    datum: "",
    type: "algemeen" as AppEvent["type"],
    beschrijving: "",
  });

  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const upcoming = events
    .filter((e) => new Date(e.datum) >= today)
    .sort((a, b) => a.datum.localeCompare(b.datum));

  const past = events
    .filter((e) => new Date(e.datum) < today)
    .sort((a, b) => b.datum.localeCompare(a.datum));

  function handleSave() {
    if (!newEv.titel || !newEv.datum) {
      alert("Vul Titel en Datum in.");
      return;
    }
    alert(`Evenement "${newEv.titel}" opgeslagen (demo — geen persistentie).`);
    setAddOpen(false);
    setNewEv({ titel: "", datum: "", type: "algemeen", beschrijving: "" });
  }

  function handleClose() {
    setAddOpen(false);
    setNewEv({ titel: "", datum: "", type: "algemeen", beschrijving: "" });
  }

  return (
    <PageLayout
      title="Evenementen"
      subtitle={`${events.length} evenementen gepland`}
      action={
        <Button
          className="crm-button-modal-primary"
          onClick={() => setAddOpen(true)}
        >
          + Evenement toevoegen
        </Button>
      }
    >
      {upcoming.length > 0 && (
        <>
          <SectionLabel mb={12}>Aankomend ({upcoming.length})</SectionLabel>
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))",
              gap: 14,
              marginBottom: 28,
            }}
          >
            {upcoming.map((ev) => (
              <EventCard key={ev.id} ev={ev} />
            ))}
          </div>
        </>
      )}

      {past.length > 0 && (
        <>
          <SectionLabel mb={12}>Afgelopen ({past.length})</SectionLabel>
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))",
              gap: 14,
            }}
          >
            {past.map((ev) => (
              <EventCard key={ev.id} ev={ev} past />
            ))}
          </div>
        </>
      )}

      {/* Add modal */}
      <Dialog open={addOpen} onOpenChange={(open) => { if (!open) handleClose(); }}>
        <DialogContent style={{ maxWidth: 440 }}>
          <DialogHeader>
            <DialogTitle>Evenement toevoegen</DialogTitle>
          </DialogHeader>

          <div style={{ display: "flex", flexDirection: "column", gap: 14, paddingTop: 4 }}>
            {/* Titel */}
            <div>
              <FormLabel>Titel</FormLabel>
              <Input
                required
                value={newEv.titel}
                onChange={(e) => setNewEv((p) => ({ ...p, titel: e.target.value }))}
                placeholder="Naam van het evenement"
              />
            </div>

            {/* Datum */}
            <div>
              <FormLabel>Datum</FormLabel>
              <Input
                type="date"
                required
                value={newEv.datum}
                onChange={(e) => setNewEv((p) => ({ ...p, datum: e.target.value }))}
              />
            </div>

            {/* Type */}
            <div>
              <FormLabel>Type</FormLabel>
              <select
                value={newEv.type}
                onChange={(e) =>
                  setNewEv((p) => ({ ...p, type: e.target.value as AppEvent["type"] }))
                }
                style={{
                  width: "100%",
                  padding: "9px 12px",
                  border: "1.5px solid var(--border)",
                  borderRadius: "var(--radius-sm)",
                  fontFamily: "var(--font-sans)",
                  fontSize: 14,
                  background: "var(--surface)",
                  color: "var(--ink)",
                  outline: "none",
                  cursor: "pointer",
                }}
              >
                <option value="religieus">Religieus</option>
                <option value="fundraising">Fundraising</option>
                <option value="algemeen">Algemeen</option>
              </select>
            </div>

            {/* Beschrijving */}
            <div>
              <FormLabel>Beschrijving</FormLabel>
              <textarea
                value={newEv.beschrijving}
                onChange={(e) => setNewEv((p) => ({ ...p, beschrijving: e.target.value }))}
                rows={3}
                placeholder="Korte omschrijving van het evenement"
                style={{
                  width: "100%",
                  padding: "9px 12px",
                  border: "1.5px solid var(--border)",
                  borderRadius: "var(--radius-sm)",
                  fontFamily: "var(--font-sans)",
                  fontSize: 14,
                  background: "var(--surface)",
                  color: "var(--ink)",
                  outline: "none",
                  resize: "vertical",
                }}
              />
            </div>

            {/* Buttons */}
            <div style={{ display: "flex", gap: 10, paddingTop: 4 }}>
              <Button className="crm-button-modal-primary" onClick={handleSave}>
                Evenement toevoegen
              </Button>
              <Button variant="outline" onClick={handleClose}>
                Annuleren
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </PageLayout>
  );
}

function EventCard({
  ev,
  past,
  onClick,
}: {
  ev: AppEvent;
  past?: boolean;
  onClick?: () => void;
}) {
  const date = new Date(ev.datum);
  const day = date.getDate();
  const monthShort = [
    "jan", "feb", "mrt", "apr", "mei", "jun",
    "jul", "aug", "sep", "okt", "nov", "dec",
  ][date.getMonth()];

  const colorMap = {
    religieus: "accent",
    fundraising: "warning",
    algemeen: "grey",
  } as const;

  const typeLabels = {
    religieus: "Religieus",
    fundraising: "Fundraising",
    algemeen: "Algemeen",
  } as const;

  return (
    <Card onClick={onClick} style={{ padding: 16, opacity: past ? 0.7 : 1 }}>
      <div style={{ display: "flex", gap: 14 }}>
        {/* Left: big day number in serif, small month */}
        <div
          style={{
            flexShrink: 0,
            width: 56,
            height: 56,
            background: past ? "var(--neutral-light)" : "var(--accent-light)",
            borderRadius: "var(--radius-sm)",
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <div
            style={{
              fontFamily: "var(--font-serif)",
              fontSize: 24,
              fontWeight: 400,
              color: past ? "var(--ink-muted)" : "var(--accent-dark)",
              lineHeight: 1,
            }}
          >
            {day}
          </div>
          <div
            style={{
              fontSize: 10,
              fontWeight: 700,
              color: past ? "var(--ink-subtle)" : "var(--accent-dark)",
              textTransform: "uppercase",
              letterSpacing: "0.05em",
              marginTop: 2,
            }}
          >
            {monthShort}
          </div>
        </div>

        <div style={{ flex: 1, minWidth: 0 }}>
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: 8,
              marginBottom: 4,
              flexWrap: "wrap",
            }}
          >
            <span
              style={{
                fontFamily: "var(--font-serif)",
                fontSize: 16,
                fontWeight: 400,
                color: "var(--ink)",
              }}
            >
              {ev.titel}
            </span>
            <Badge variant={colorMap[ev.type]}>{typeLabels[ev.type]}</Badge>
          </div>
          <p style={{ fontSize: 12, color: "var(--ink-muted)", lineHeight: 1.5 }}>
            {ev.beschrijving}
          </p>
        </div>
      </div>
    </Card>
  );
}
