"use client";

import Link from "next/link";
import AppShell from "../../components/AppShell";
import MemberImporter from "../../components/MemberImporter";

export default function MembersImportPage() {
  return (
    <AppShell>
      <Link
        href="/members"
        style={{
          fontSize: 13,
          color: "var(--ink-muted)",
          textDecoration: "none",
        }}
      >
        ← Terug naar leden
      </Link>
      <h1
        style={{
          fontFamily: "var(--font-serif), Georgia, serif",
          fontSize: 36,
          fontWeight: 400,
          marginTop: 8,
          color: "var(--ink)",
        }}
      >
        Leden importeren
      </h1>
      <p style={{ color: "var(--ink-muted)", fontSize: 14, marginTop: 4, marginBottom: 24 }}>
        Upload een Excel- of CSV-bestand. Kolommen worden automatisch herkend; je kunt de koppeling voor elke kolom nog aanpassen voordat je importeert.
      </p>

      <MemberImporter />
    </AppShell>
  );
}
