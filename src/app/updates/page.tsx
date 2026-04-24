export default function UpdatesPage() {
  const done = [
    "Beveiligde login via Supabase",
    "Dashboard alleen zichtbaar na login",
    "Prototype dashboard geïntegreerd",
    "App live op Vercel",
  ];

  const working = [
    "Dashboard koppelen aan echte data",
    "Leden en donateurs opslaan in database",
    "Formulieren koppelen aan backend",
  ];

  const alpha = [
    "Inloggen",
    "Dashboard overzicht",
    "Leden bekijken",
    "Basis donatie flow",
  ];

  const later = [
    "Stripe koppeling",
    "Excel import / export",
    "Meerdere organisaties als SaaS",
    "Beheerrollen",
  ];

  return (
    <main style={{ maxWidth: 860, margin: "60px auto", padding: 24, fontFamily: "Arial, sans-serif" }}>
      <h1 style={{ fontSize: 56, fontWeight: 800, marginBottom: 12 }}>Mini CRM – voortgang</h1>

      <p style={{ fontSize: 22, color: "#777", marginBottom: 48 }}>
        Live ontwikkeling en roadmap. Dit is een work in progress.
      </p>

      <Section title="Huidige status">
        <div style={{ display: "inline-flex", gap: 8, alignItems: "center", padding: "10px 14px", border: "1px solid #2f7d32", borderRadius: 8, color: "#78d878", fontWeight: 700 }}>
          <span>●</span> V1 Alpha – in ontwikkeling
        </div>
      </Section>

      <Section title="Wat werkt nu">
        <List items={done} icon="✓" color="#67d36f" />
      </Section>

      <Section title="Waar we nu aan werken">
        <List items={working} icon="◌" color="#f3c623" />
      </Section>

      <Section title="V1 Alpha bevat">
        <List items={alpha} icon="•" color="#3b82f6" />
      </Section>

      <Section title="Later">
        <List items={later} icon="•" color="#888" />
      </Section>

      <section style={{ marginTop: 48, padding: 28, border: "1px solid #333", borderRadius: 14, background: "#151515" }}>
        <h2 style={{ fontSize: 26, fontWeight: 800, marginBottom: 12 }}>
          Hoe kunnen externe mensen hierbij?
        </h2>
        <p style={{ fontSize: 18, color: "#ccc", lineHeight: 1.5 }}>
          Deze pagina is publiek via de Vercel link. Deel gewoon de URL van deze pagina:
          <br />
          <strong>/updates</strong>
        </p>
      </section>
    </main>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section style={{ marginBottom: 44 }}>
      <h2 style={{ fontSize: 30, fontWeight: 800, marginBottom: 16 }}>{title}</h2>
      {children}
    </section>
  );
}

function List({ items, icon, color }: { items: string[]; icon: string; color: string }) {
  return (
    <ul style={{ listStyle: "none", padding: 0, margin: 0, display: "grid", gap: 12 }}>
      {items.map((item) => (
        <li key={item} style={{ display: "flex", gap: 14, alignItems: "center", fontSize: 22 }}>
          <span style={{ color, fontWeight: 800, width: 24 }}>{icon}</span>
          <span>{item}</span>
        </li>
      ))}
    </ul>
  );
}