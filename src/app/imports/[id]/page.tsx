"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { supabase } from "../../lib/supabase";
import AppShell from "../../components/AppShell";
import { useOrg } from "../../lib/orgContext";
import { StatusPill, importPageStyles as S } from "../../components/ImportStepper";
import type { ImportRecord, ImportRow } from "../../lib/types";

function ImportDetailInner() {
  const params = useParams<{ id: string }>();
  const importId = params?.id;
  const org = useOrg();

  const [record, setRecord] = useState<ImportRecord | null>(null);
  const [rows, setRows] = useState<ImportRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!importId) return;
    let active = true;
    (async () => {
      setLoading(true);
      const [recRes, rowsRes] = await Promise.all([
        supabase
          .from("imports")
          .select("*")
          .eq("id", importId)
          .eq("org_id", org.id)
          .maybeSingle(),
        supabase
          .from("import_rows")
          .select("*")
          .eq("import_id", importId)
          .order("row_number", { ascending: true }),
      ]);
      if (!active) return;
      if (recRes.error) setError(recRes.error.message);
      else setRecord((recRes.data as ImportRecord | null) ?? null);
      if (rowsRes.error) setError(rowsRes.error.message);
      else setRows((rowsRes.data ?? []) as ImportRow[]);
      setLoading(false);
    })();
    return () => {
      active = false;
    };
  }, [importId, org.id]);

  return (
    <>
      <Link
        href="/members"
        style={{ fontSize: 13, color: "var(--ink-muted)", textDecoration: "none" }}
      >
        ← Terug naar leden
      </Link>
      <h1
        style={{
          fontFamily: "var(--font-serif), Georgia, serif",
          fontSize: 32,
          fontWeight: 400,
          marginTop: 8,
          color: "var(--ink)",
        }}
      >
        Import-rapport
      </h1>

      {loading && <p style={{ color: "var(--ink-muted)", marginTop: 12 }}>Laden...</p>}

      {error && (
        <div style={{ ...S.alert, background: "var(--error-light)", color: "var(--error)", marginTop: 16 }}>
          {error}
        </div>
      )}

      {!loading && !record && !error && (
        <p style={{ color: "var(--ink-muted)", marginTop: 12 }}>
          Geen import gevonden met dit ID (of geen toegang).
        </p>
      )}

      {record && (
        <>
          <div style={{ ...S.card, marginTop: 16 }}>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(140px, 1fr))", gap: 16 }}>
              <Stat label="Bestand" value={record.file_name ?? "—"} />
              <Stat label="Bron" value={record.source} />
              <Stat label="Rijen" value={String(record.row_count)} />
              <Stat label="Nieuw" value={String(record.inserted_count)} />
              <Stat label="Bijgewerkt" value={String(record.updated_count)} />
              <Stat label="Overgeslagen" value={String(record.skipped_count)} />
              <Stat label="Fouten" value={String(record.error_count)} />
              <Stat label="Status" value={record.status} />
            </div>
            <div style={{ marginTop: 10, fontSize: 12, color: "var(--ink-subtle)" }}>
              Aangemaakt: {new Date(record.created_at).toLocaleString("nl-NL")}
              {record.committed_at
                ? ` · Voltooid: ${new Date(record.committed_at).toLocaleString("nl-NL")}`
                : ""}
            </div>
          </div>

          <div style={{ ...S.card, padding: 0, overflow: "hidden" }}>
            <table style={{ width: "100%", borderCollapse: "collapse" }}>
              <thead>
                <tr>
                  <th style={S.th}>Rij</th>
                  <th style={S.th}>Actie</th>
                  <th style={S.th}>Reden</th>
                  <th style={S.th}>Doel-ID</th>
                </tr>
              </thead>
              <tbody>
                {rows.map((r) => (
                  <tr key={r.id} style={{ borderTop: "1px solid var(--border)" }}>
                    <td style={{ ...S.td, color: "var(--ink-subtle)" }}>{r.row_number}</td>
                    <td style={S.td}>
                      <StatusPill tone={r.action === "insert" ? "new" : r.action}>
                        {actionLabel(r.action)}
                      </StatusPill>
                    </td>
                    <td style={{ ...S.td, color: "var(--ink-muted)" }}>{r.reason ?? "—"}</td>
                    <td style={{ ...S.td, color: "var(--ink-subtle)", fontSize: 12 }}>
                      {r.target_id ?? "—"}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </>
      )}
    </>
  );
}

export default function ImportDetailPage() {
  return (
    <AppShell>
      <ImportDetailInner />
    </AppShell>
  );
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div>
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
      <div style={{ fontSize: 16, color: "var(--ink)", marginTop: 4, fontWeight: 500 }}>
        {value}
      </div>
    </div>
  );
}

function actionLabel(a: string): string {
  switch (a) {
    case "insert":
      return "Nieuw";
    case "update":
      return "Bijgewerkt";
    case "skip":
      return "Overgeslagen";
    case "error":
      return "Fout";
    default:
      return a;
  }
}
