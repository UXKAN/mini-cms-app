# Mini CRM Huisstijl

Gedeelde component library voor alle pagina's. Importeer altijd vanuit `@/components/crm`.

```tsx
import { Card, PageHeader, StatCard, SectionLabel, Badge, EmptyState, PageLayout } from "@/components/crm";
```

---

## Componenten

### PageLayout
Gebruik voor elke pagina. Bevat PageHeader + optionele actieknop rechts. Wikkel je pagina altijd ook in `<AppShell>` voor de sidebar en navigatiecontext.

```tsx
// In de default export van de pagina:
export default function MijnPage() {
  return (
    <AppShell>
      <MijnPageInner />
    </AppShell>
  );
}

// In de inner component:
function MijnPageInner() {
  return (
    <PageLayout title="Leden" subtitle="Beheer je leden." action={<Button>Toevoegen</Button>}>
      {/* inhoud */}
    </PageLayout>
  );
}
```

### Card
Basis witte kaart met schaduw. Padding 22px 24px.

```tsx
<Card>inhoud</Card>
<Card style={{ gridColumn: "1 / span 2" }}>volle breedte in grid</Card>
<Card onClick={() => navigate("/donaties")}>klikbare kaart</Card>
```

### StatCard
Label + groot getal + optionele hint. Altijd in een Card.

```tsx
<StatCard label="Totaal leden" value="110" hint="actieve leden" />
```

### SectionLabel
Uppercase label boven een sectie. 11px, grijs, letterSpacing.

```tsx
<SectionLabel>Top 5</SectionLabel>
<SectionLabel mb={12}>Maandoverzicht</SectionLabel>
```

### Badge
Gekleurde statuspil. Vijf varianten.

```tsx
<Badge variant="actief">Actief</Badge>
<Badge variant="inactief">Inactief</Badge>
<Badge variant="prospect">Prospect</Badge>
<Badge variant="opgezegd">Opgezegd</Badge>
<Badge variant="accent">Ondernemer</Badge>
```

### EmptyState
Lege toestand voor lijsten zonder data.

```tsx
<EmptyState
  title="Nog geen leden"
  description="Voeg er één toe of importeer uit Excel."
  action={<Button onClick={openAdd}>Lid toevoegen</Button>}
/>
```

### PageHeader
Alleen nodig als je geen PageLayout gebruikt (bijv. dashboard).

```tsx
<PageHeader title="Dashboard" subtitle="Overzicht · zaterdag 26 april 2026" />
```

---

## Nieuw component toevoegen

1. Maak `src/components/crm/MijnComponent.tsx`
2. Gebruik alleen `var(--...)` tokens — geen hardcoded kleuren of pixels
3. Exporteer in `src/components/crm/index.ts`
4. Documenteer hier met een codevoorbeeld

## Design tokens (snel overzicht)

| Token | Gebruik |
|---|---|
| `var(--surface)` | Card achtergrond |
| `var(--bg)` | Pagina achtergrond |
| `var(--border)` | Randen |
| `var(--ink)` | Primaire tekst |
| `var(--ink-muted)` | Secondaire tekst |
| `var(--ink-subtle)` | Labels, placeholders |
| `var(--accent)` | Groen — primaire actie |
| `var(--accent-light)` | Lichte groene achtergrond |
| `var(--accent-dark)` | Donkergroen — links, actieve nav |
| `var(--neutral-light)` | Neutrale badge achtergrond (inactief) |
| `var(--radius)` | 10px — card radius |
| `var(--radius-sm)` | 7px — button, nav radius |
| `var(--shadow)` | Standaard card schaduw |
| `var(--font-serif)` | DM Serif Display — titels, grote getallen |
| `var(--font-sans)` | DM Sans — alles overig |
