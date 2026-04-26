"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import Papa from "papaparse";
import * as XLSX from "xlsx";
import { supabase } from "../lib/supabase";
import { useAuth } from "../lib/useAuth";
import { useOrg } from "../lib/orgContext";
import {
  MEMBER_FIELD_DEFS,
  applyMapping,
  buildTemplateCsv,
  detectMapping,
  hasIdentity,
  type MappedMemberRow,
  type MappingTarget,
} from "../lib/importMapping";
import {
  computeFillDiff,
  findMatch,
  loadLookupIndex,
  type MemberMatch,
} from "../lib/importMatching";
import {
  CountBadge,
  ImportStepper,
  StatusPill,
  importPageStyles as S,
  type StepKey,
} from "./ImportStepper";
import { Card, Select, AlertBanner } from "@/components/crm";
import { Button, buttonVariants } from "@/components/ui/button";

type ParsedFile = {
  fileName: string;
  headers: string[];
  rows: Record<string, unknown>[];
};

type PreviewRow = {
  rowNumber: number;
  raw: Record<string, unknown>;
  mapped: MappedMemberRow;
  action: "insert" | "update" | "skip" | "error";
  reason: string | null;
  match: MemberMatch;
  diff: Partial<MappedMemberRow> | null;
};

type Props = {
  onDone?: (importId: string) => void;
  showReportLink?: boolean;
};

export default function MemberImporter({ onDone, showReportLink = true }: Props) {
  const { user } = useAuth();
  const org = useOrg();

  const [step, setStep] = useState<StepKey>("upload");
  const [parsed, setParsed] = useState<ParsedFile | null>(null);
  const [mapping, setMapping] = useState<Record<string, MappingTarget>>({});
  const [preview, setPreview] = useState<PreviewRow[]>([]);
  const [parseError, setParseError] = useState<string | null>(null);
  const [mapError, setMapError] = useState<string | null>(null);
  const [importing, setImporting] = useState(false);
  const [importError, setImportError] = useState<string | null>(null);
  const [committedImportId, setCommittedImportId] = useState<string | null>(null);
  const [loadingPreview, setLoadingPreview] = useState(false);

  const reset = () => {
    setStep("upload");
    setParsed(null);
    setMapping({});
    setPreview([]);
    setParseError(null);
    setMapError(null);
    setImportError(null);
    setCommittedImportId(null);
  };

  const handleFile = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setParseError(null);
    setCommittedImportId(null);

    try {
      const { headers, rows } = await parseFile(file);
      if (headers.length === 0 || rows.length === 0) {
        setParseError("Geen rijen gevonden. Controleer of het bestand een header-rij heeft.");
        return;
      }
      const detected = detectMapping(headers);
      setParsed({ fileName: file.name, headers, rows });
      setMapping(detected);
      setStep("map");
    } catch (err: unknown) {
      setParseError(err instanceof Error ? err.message : "Kon bestand niet lezen");
    }
    e.target.value = "";
  };

  const downloadTemplate = () => {
    const blob = new Blob([buildTemplateCsv()], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "leden-template.csv";
    a.click();
    URL.revokeObjectURL(url);
  };

  const proceedToPreview = async () => {
    if (!parsed) return;
    const targets = new Set(Object.values(mapping));
    const hasFirstLast = targets.has("first_name") && targets.has("last_name");
    if (!hasFirstLast && !targets.has("name") && !targets.has("email")) {
      setMapError(
        "Koppel minimaal één identificatie-kolom: voornaam+achternaam, volledige naam, of e-mail."
      );
      return;
    }
    setMapError(null);
    setLoadingPreview(true);

    try {
      const index = await loadLookupIndex(org.id);

      const inFileEmails = new Set<string>();
      const inFileIbans = new Set<string>();

      const result: PreviewRow[] = parsed.rows.map((raw, i) => {
        const rowNumber = i + 2;
        const mapped = applyMapping(raw, mapping);

        if (!hasIdentity(mapped)) {
          return {
            rowNumber,
            raw,
            mapped,
            action: "error",
            reason: "Geen identificatie (naam, e-mail of IBAN)",
            match: { member: null, reason: null },
            diff: null,
          };
        }

        const emailKey = mapped.email?.toLowerCase() ?? null;
        const ibanKey = mapped.iban ?? null;
        let inFileDup = false;
        if (emailKey) {
          if (inFileEmails.has(emailKey)) inFileDup = true;
          else inFileEmails.add(emailKey);
        }
        if (ibanKey) {
          if (inFileIbans.has(ibanKey)) inFileDup = true;
          else inFileIbans.add(ibanKey);
        }

        const match = findMatch(index, mapped);
        if (match.member) {
          const diff = computeFillDiff(match.member, mapped);
          const hasFill = Object.keys(diff).length > 0;
          return {
            rowNumber,
            raw,
            mapped,
            action: hasFill ? "update" : "skip",
            reason: inFileDup
              ? "Duplicaat binnen bestand"
              : match.reason === "email"
                ? "Gevonden via e-mail"
                : match.reason === "iban"
                  ? "Gevonden via IBAN"
                  : "Gevonden via naam + postcode",
            match,
            diff: hasFill ? diff : null,
          };
        }

        if (inFileDup) {
          return {
            rowNumber,
            raw,
            mapped,
            action: "skip",
            reason: "Duplicaat binnen bestand",
            match,
            diff: null,
          };
        }

        return {
          rowNumber,
          raw,
          mapped,
          action: "insert",
          reason: null,
          match,
          diff: null,
        };
      });

      setPreview(result);
      setStep("preview");
    } catch (err: unknown) {
      setMapError(err instanceof Error ? err.message : "Kon bestaande leden niet laden");
    } finally {
      setLoadingPreview(false);
    }
  };

  const counts = useMemo(() => {
    const c = { insert: 0, update: 0, skip: 0, error: 0 };
    for (const r of preview) c[r.action] += 1;
    return c;
  }, [preview]);

  const commit = async () => {
    if (!user || !parsed) return;
    setImporting(true);
    setImportError(null);

    try {
      const { data: importRow, error: importErr } = await supabase
        .from("imports")
        .insert({
          org_id: org.id,
          user_id: user.id,
          entity_type: "members",
          source: "csv",
          file_name: parsed.fileName,
          row_count: preview.length,
          status: "pending",
        })
        .select()
        .single();
      if (importErr || !importRow) throw importErr ?? new Error("Kon import niet starten");

      const importId = importRow.id as string;

      const toInsert = preview.filter((r) => r.action === "insert");
      let insertedIds: string[] = [];
      if (toInsert.length > 0) {
        const payload = toInsert.map((r) => ({
          ...r.mapped,
          user_id: user.id,
          org_id: org.id,
          last_import_id: importId,
          status: r.mapped.status ?? "active",
        }));
        const { data, error } = await supabase
          .from("members")
          .insert(payload)
          .select("id");
        if (error) throw error;
        insertedIds = (data ?? []).map((d: { id: string }) => d.id);
      }

      const toUpdate = preview.filter((r) => r.action === "update");
      for (const r of toUpdate) {
        if (!r.match.member || !r.diff) continue;
        const { error } = await supabase
          .from("members")
          .update({ ...r.diff, last_import_id: importId })
          .eq("id", r.match.member.id);
        if (error) throw error;
      }

      const rowsPayload = preview.map((r) => {
        let targetId: string | null = null;
        if (r.action === "insert") {
          targetId = insertedIds[toInsert.indexOf(r)] ?? null;
        } else if (r.action === "update" || r.action === "skip") {
          targetId = r.match.member?.id ?? null;
        }
        return {
          import_id: importId,
          row_number: r.rowNumber,
          raw: r.raw,
          mapped: r.mapped,
          action: r.action,
          target_id: targetId,
          reason: r.reason,
        };
      });
      for (let i = 0; i < rowsPayload.length; i += 500) {
        const chunk = rowsPayload.slice(i, i + 500);
        const { error } = await supabase.from("import_rows").insert(chunk);
        if (error) throw error;
      }

      await supabase
        .from("imports")
        .update({
          inserted_count: counts.insert,
          updated_count: counts.update,
          skipped_count: counts.skip,
          error_count: counts.error,
          status: "committed",
          committed_at: new Date().toISOString(),
        })
        .eq("id", importId);

      setCommittedImportId(importId);
      setPreview([]);
      setParsed(null);
      setMapping({});
      setStep("upload");
      onDone?.(importId);
    } catch (err: unknown) {
      setImportError(err instanceof Error ? err.message : "Import mislukt");
    } finally {
      setImporting(false);
    }
  };

  const canCommit = counts.insert + counts.update > 0;

  return (
    <>
      <ImportStepper
        active={step}
        onJump={(s) => {
          if (s === "upload") setStep("upload");
          if (s === "map" && parsed) setStep("map");
          if (s === "preview" && preview.length > 0) setStep("preview");
        }}
      />

      {committedImportId && (
        <AlertBanner tone="success">
          Import voltooid.{" "}
          {showReportLink && (
            <Link
              href={`/imports/${committedImportId}`}
              style={{ color: "var(--success)", fontWeight: 600, textDecoration: "underline" }}
            >
              Bekijk rapport
            </Link>
          )}
        </AlertBanner>
      )}

      {step === "upload" && (
        <UploadStep
          onFile={handleFile}
          onTemplate={downloadTemplate}
          error={parseError}
        />
      )}

      {step === "map" && parsed && (
        <MapStep
          parsed={parsed}
          mapping={mapping}
          onMappingChange={setMapping}
          onBack={reset}
          onContinue={proceedToPreview}
          loading={loadingPreview}
          error={mapError}
        />
      )}

      {step === "preview" && (
        <PreviewStep
          rows={preview}
          counts={counts}
          canCommit={canCommit}
          onBack={() => setStep("map")}
          onCommit={commit}
          importing={importing}
          error={importError}
        />
      )}
    </>
  );
}

function UploadStep({
  onFile,
  onTemplate,
  error,
}: {
  onFile: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onTemplate: () => void;
  error: string | null;
}) {
  return (
    <>
      <Card>
        <div style={{ display: "flex", alignItems: "center", gap: 12, flexWrap: "wrap" }}>
          <label className={buttonVariants({ variant: "default" })} style={{ cursor: "pointer" }}>
            CSV- of Excel-bestand kiezen
            <input
              type="file"
              accept=".csv,text/csv,.xlsx,.xls,application/vnd.openxmlformats-officedocument.spreadsheetml.sheet,application/vnd.ms-excel"
              onChange={onFile}
              style={{ display: "none" }}
            />
          </label>
          <Button variant="outline" onClick={onTemplate}>
            Template downloaden
          </Button>
        </div>
        <p style={{ marginTop: 14, fontSize: 13, color: "var(--ink-muted)" }}>
          Ondersteunde kolommen: voornaam, achternaam, e-mail, telefoon, adres, postcode, woonplaats, IBAN, lidmaatschapstype, maandbedrag, startdatum, status, notities.
          Een &quot;naam&quot;-kolom (volledige naam) werkt ook.
        </p>
      </Card>

      {error && (
        <AlertBanner tone="error">
          {error}
        </AlertBanner>
      )}
    </>
  );
}

function MapStep({
  parsed,
  mapping,
  onMappingChange,
  onBack,
  onContinue,
  loading,
  error,
}: {
  parsed: ParsedFile;
  mapping: Record<string, MappingTarget>;
  onMappingChange: (m: Record<string, MappingTarget>) => void;
  onBack: () => void;
  onContinue: () => void;
  loading: boolean;
  error: string | null;
}) {
  const firstSampleRow = parsed.rows[0] ?? {};

  const setColumn = (source: string, target: MappingTarget) => {
    const next = { ...mapping };
    if (target !== "ignore") {
      for (const [k, v] of Object.entries(next)) {
        if (v === target && k !== source) next[k] = "ignore";
      }
    }
    next[source] = target;
    onMappingChange(next);
  };

  return (
    <>
      <Card>
        <div style={{ fontSize: 13, color: "var(--ink-muted)", marginBottom: 14 }}>
          Bestand: <strong>{parsed.fileName}</strong> · {parsed.rows.length} rijen
        </div>
        <table style={{ width: "100%", borderCollapse: "collapse" }}>
          <thead>
            <tr>
              <th style={S.th}>Kolom in bestand</th>
              <th style={S.th}>Voorbeeldwaarde</th>
              <th style={S.th}>CRM-veld</th>
            </tr>
          </thead>
          <tbody>
            {parsed.headers.map((h) => {
              const sample = firstSampleRow[h];
              const target = mapping[h] ?? "ignore";
              return (
                <tr key={h} style={{ borderTop: "1px solid var(--border)" }}>
                  <td style={{ ...S.td, fontWeight: 500 }}>{h}</td>
                  <td style={{ ...S.td, color: "var(--ink-muted)" }}>
                    {sample == null || sample === "" ? "—" : String(sample)}
                  </td>
                  <td style={S.td}>
                    <Select
                      value={target}
                      onChange={(e) => setColumn(h, e.target.value as MappingTarget)}
                    >
                      <option value="ignore">— negeren —</option>
                      {MEMBER_FIELD_DEFS.map((f) => (
                        <option key={f.key} value={f.key}>
                          {f.label}
                        </option>
                      ))}
                    </Select>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </Card>

      {error && (
        <AlertBanner tone="error">
          {error}
        </AlertBanner>
      )}

      <div style={{ display: "flex", gap: 8 }}>
        <Button onClick={onContinue} disabled={loading}>
          {loading ? "Controleren..." : "Doorgaan naar voorbeeld"}
        </Button>
        <Button variant="outline" onClick={onBack} disabled={loading}>
          Ander bestand
        </Button>
      </div>
    </>
  );
}

function PreviewStep({
  rows,
  counts,
  canCommit,
  onBack,
  onCommit,
  importing,
  error,
}: {
  rows: PreviewRow[];
  counts: { insert: number; update: number; skip: number; error: number };
  canCommit: boolean;
  onBack: () => void;
  onCommit: () => void;
  importing: boolean;
  error: string | null;
}) {
  return (
    <>
      <div style={{ display: "flex", gap: 10, marginBottom: 16, flexWrap: "wrap" }}>
        <CountBadge label={`${counts.insert} nieuw`} color="var(--success)" bg="var(--success-light)" />
        <CountBadge label={`${counts.update} bijwerken`} color="var(--accent-dark)" bg="var(--accent-light)" />
        <CountBadge label={`${counts.skip} overgeslagen`} color="var(--warn)" bg="var(--warn-light)" />
        <CountBadge label={`${counts.error} fout`} color="var(--error)" bg="var(--error-light)" />
      </div>

      <Card padding="none" style={{ overflow: "hidden" }}>
        <table style={{ width: "100%", borderCollapse: "collapse" }}>
          <thead>
            <tr>
              <th style={S.th}>Rij</th>
              <th style={S.th}>Status</th>
              <th style={S.th}>Naam</th>
              <th style={S.th}>E-mail</th>
              <th style={S.th}>IBAN</th>
              <th style={S.th}>Bijzonderheden</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((r) => (
              <tr key={r.rowNumber} style={{ borderTop: "1px solid var(--border)" }}>
                <td style={{ ...S.td, color: "var(--ink-subtle)" }}>{r.rowNumber}</td>
                <td style={S.td}>
                  <StatusPill tone={r.action === "insert" ? "new" : r.action}>
                    {labelFor(r.action)}
                  </StatusPill>
                </td>
                <td style={{ ...S.td, fontWeight: 500 }}>
                  {rowDisplayName(r.mapped) || <em style={{ color: "var(--ink-subtle)" }}>ontbreekt</em>}
                </td>
                <td style={S.td}>{r.mapped.email ?? "—"}</td>
                <td style={S.td}>{r.mapped.iban ?? "—"}</td>
                <td style={{ ...S.td, color: "var(--ink-muted)", fontSize: 13 }}>
                  {r.reason ?? (r.action === "update" && r.diff ? `Vult ${Object.keys(r.diff).length} veld(en)` : "")}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </Card>

      {error && (
        <AlertBanner tone="error" style={{ marginTop: 12 }}>
          {error}
        </AlertBanner>
      )}

      <div style={{ display: "flex", gap: 8, marginTop: 16 }}>
        <Button
          onClick={onCommit}
          disabled={importing || !canCommit}
        >
          {importing
            ? "Importeren..."
            : `Importeer ${counts.insert} nieuw, werk ${counts.update} bij`}
        </Button>
        <Button variant="outline" onClick={onBack} disabled={importing}>
          Terug naar koppeling
        </Button>
      </div>
    </>
  );
}

function labelFor(action: PreviewRow["action"]): string {
  switch (action) {
    case "insert":
      return "Nieuw";
    case "update":
      return "Bijwerken";
    case "skip":
      return "Overslaan";
    case "error":
      return "Fout";
  }
}

function rowDisplayName(m: MappedMemberRow): string {
  const combined = [m.first_name, m.last_name].filter(Boolean).join(" ").trim();
  return combined || m.name || m.email || m.iban || "";
}

async function parseFile(file: File): Promise<{ headers: string[]; rows: Record<string, unknown>[] }> {
  const name = file.name.toLowerCase();
  if (name.endsWith(".xlsx") || name.endsWith(".xls")) {
    const buf = await file.arrayBuffer();
    const workbook = XLSX.read(buf, { type: "array" });
    const sheetName = workbook.SheetNames[0];
    if (!sheetName) throw new Error("Werkblad niet gevonden");
    const sheet = workbook.Sheets[sheetName];
    const json = XLSX.utils.sheet_to_json<Record<string, unknown>>(sheet, {
      defval: "",
      raw: false,
      blankrows: false,
    });
    const headers = Object.keys(json[0] ?? {});
    return { headers, rows: json };
  }

  return await new Promise((resolve, reject) => {
    Papa.parse<Record<string, unknown>>(file, {
      header: true,
      skipEmptyLines: true,
      complete: (result) => {
        const headers = result.meta.fields ?? [];
        resolve({ headers, rows: result.data });
      },
      error: (err) => reject(err),
    });
  });
}
