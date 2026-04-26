# Mini CRM Huisstijl Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Maak een gedeelde component library in `src/components/crm/` zodat alle pagina's automatisch de juiste huisstijl krijgen — consistente padding, kleuren en typografie gebaseerd op de exacte waarden uit het goedgekeurde prototype.

**Architecture:** Drie lagen: (1) CSS tokens staan al correct in `globals.css`, geen wijzigingen nodig. (2) React componenten in `src/components/crm/` gebruiken die tokens direct via inline styles. (3) Alle bestaande page files worden bijgewerkt om de nieuwe componenten te importeren vanuit `@/components/crm`.

**Tech Stack:** Next.js 16 App Router · React 19 · TypeScript · CSS custom properties (oklch) · DM Serif Display + DM Sans fonts

---

## File Map

| Actie | Bestand |
|---|---|
| Create | `src/components/crm/Card.tsx` |
| Create | `src/components/crm/SectionLabel.tsx` |
| Create | `src/components/crm/PageHeader.tsx` |
| Create | `src/components/crm/StatCard.tsx` |
| Create | `src/components/crm/Badge.tsx` |
| Create | `src/components/crm/EmptyState.tsx` |
| Create | `src/components/crm/PageLayout.tsx` |
| Create | `src/components/crm/index.ts` |
| Modify | `src/app/dashboard/page.tsx` |
| Modify | `src/app/members/page.tsx` |
| Modify | `src/app/donations/page.tsx` |
| Modify | `src/app/ondernemers/page.tsx` |
| Modify | `src/app/toezeggingen/page.tsx` |
| Modify | `src/app/evenementen/page.tsx` |
| Create | `HUISSTIJL.md` |

---

## Task 1: Card + SectionLabel (de basis)

Deze twee componenten worden door alle andere gebruikt, dus ze komen eerst.

**Files:**
- Create: `src/components/crm/Card.tsx`
- Create: `src/components/crm/SectionLabel.tsx`

- [ ] **Step 1: Maak `src/components/crm/Card.tsx`**

```tsx
type CardProps = {
  children: React.ReactNode;
  style?: React.CSSProperties;
  onClick?: () => void;
};

export function Card({ children, style, onClick }: CardProps) {
  const isClickable = !!onClick;
  return (
    <div
      onClick={onClick}
      style={{
        background: "var(--surface)",
        border: "1px solid var(--border)",
        borderRadius: "var(--radius)",
        boxShadow: "var(--shadow)",
        padding: "22px 24px",
        cursor: isClickable ? "pointer" : undefined,
        transition: isClickable ? "box-shadow 0.15s" : undefined,
        ...style,
      }}
      onMouseEnter={isClickable ? (e) => {
        (e.currentTarget as HTMLDivElement).style.boxShadow = "var(--shadow-lg)";
      } : undefined}
      onMouseLeave={isClickable ? (e) => {
        (e.currentTarget as HTMLDivElement).style.boxShadow = "var(--shadow)";
      } : undefined}
    >
      {children}
    </div>
  );
}
```

- [ ] **Step 2: Maak `src/components/crm/SectionLabel.tsx`**

```tsx
type SectionLabelProps = {
  children: React.ReactNode;
  mb?: number;
};

export function SectionLabel({ children, mb = 8 }: SectionLabelProps) {
  return (
    <div
      style={{
        fontSize: 11,
        fontWeight: 700,
        color: "var(--ink-subtle)",
        letterSpacing: "0.06em",
        textTransform: "uppercase",
        marginBottom: mb,
      }}
    >
      {children}
    </div>
  );
}
```

- [ ] **Step 3: Verifieer TypeScript**

```bash
cd /Users/uxkan/Desktop/mini-cms-app && npx tsc --noEmit
```

Verwacht: geen fouten.

- [ ] **Step 4: Commit**

```bash
git add src/components/crm/Card.tsx src/components/crm/SectionLabel.tsx
git commit -m "feat: add Card and SectionLabel CRM components"
```

---

## Task 2: PageHeader + StatCard

**Files:**
- Create: `src/components/crm/PageHeader.tsx`
- Create: `src/components/crm/StatCard.tsx`

- [ ] **Step 1: Maak `src/components/crm/PageHeader.tsx`**

```tsx
type PageHeaderProps = {
  title: string;
  subtitle?: string;
};

export function PageHeader({ title, subtitle }: PageHeaderProps) {
  return (
    <div style={{ marginBottom: 24 }}>
      <h1
        style={{
          fontFamily: "var(--font-serif)",
          fontSize: 28,
          fontWeight: 400,
          color: "var(--ink)",
          lineHeight: 1.2,
        }}
      >
        {title}
      </h1>
      {subtitle && (
        <p style={{ fontSize: 13, color: "var(--ink-muted)", marginTop: 4 }}>
          {subtitle}
        </p>
      )}
    </div>
  );
}
```

- [ ] **Step 2: Maak `src/components/crm/StatCard.tsx`**

```tsx
import { Card } from "./Card";
import { SectionLabel } from "./SectionLabel";

type StatCardProps = {
  label: string;
  value: string;
  hint?: string;
  style?: React.CSSProperties;
};

export function StatCard({ label, value, hint, style }: StatCardProps) {
  return (
    <Card style={style}>
      <SectionLabel>{label}</SectionLabel>
      <div
        style={{
          fontFamily: "var(--font-serif)",
          fontSize: 30,
          fontWeight: 400,
          color: "var(--ink)",
          lineHeight: 1,
          marginTop: 4,
        }}
      >
        {value}
      </div>
      {hint && (
        <div style={{ fontSize: 12, color: "var(--ink-muted)", marginTop: 6 }}>
          {hint}
        </div>
      )}
    </Card>
  );
}
```

- [ ] **Step 3: Verifieer TypeScript**

```bash
npx tsc --noEmit
```

Verwacht: geen fouten.

- [ ] **Step 4: Commit**

```bash
git add src/components/crm/PageHeader.tsx src/components/crm/StatCard.tsx
git commit -m "feat: add PageHeader and StatCard CRM components"
```

---

## Task 3: Badge + EmptyState

**Files:**
- Create: `src/components/crm/Badge.tsx`
- Create: `src/components/crm/EmptyState.tsx`

- [ ] **Step 1: Maak `src/components/crm/Badge.tsx`**

```tsx
type BadgeVariant = "actief" | "inactief" | "prospect" | "opgezegd" | "accent";

const VARIANT_STYLES: Record<BadgeVariant, { background: string; color: string }> = {
  actief:   { background: "var(--accent-light)", color: "var(--accent-dark)" },
  accent:   { background: "var(--accent-light)", color: "var(--accent-dark)" },
  inactief: { background: "oklch(0.94 0.005 75)", color: "var(--ink-muted)" },
  prospect: { background: "var(--warn-light)",   color: "var(--warn)" },
  opgezegd: { background: "var(--error-light)",  color: "var(--error)" },
};

type BadgeProps = {
  variant: BadgeVariant;
  children: React.ReactNode;
};

export function Badge({ variant, children }: BadgeProps) {
  const { background, color } = VARIANT_STYLES[variant];
  return (
    <span
      style={{
        display: "inline-block",
        fontSize: 11,
        fontWeight: 600,
        padding: "3px 9px",
        borderRadius: 99,
        background,
        color,
        whiteSpace: "nowrap",
      }}
    >
      {children}
    </span>
  );
}
```

- [ ] **Step 2: Maak `src/components/crm/EmptyState.tsx`**

```tsx
import { Card } from "./Card";

type EmptyStateProps = {
  title: string;
  description?: string;
  action?: React.ReactNode;
};

export function EmptyState({ title, description, action }: EmptyStateProps) {
  return (
    <Card style={{ textAlign: "center", padding: "48px 24px" }}>
      <h2
        style={{
          fontFamily: "var(--font-serif)",
          fontSize: 22,
          fontWeight: 400,
          color: "var(--ink)",
          marginBottom: 8,
        }}
      >
        {title}
      </h2>
      {description && (
        <p style={{ fontSize: 14, color: "var(--ink-muted)", marginBottom: 20 }}>
          {description}
        </p>
      )}
      {action && <div>{action}</div>}
    </Card>
  );
}
```

- [ ] **Step 3: Verifieer TypeScript**

```bash
npx tsc --noEmit
```

Verwacht: geen fouten.

- [ ] **Step 4: Commit**

```bash
git add src/components/crm/Badge.tsx src/components/crm/EmptyState.tsx
git commit -m "feat: add Badge and EmptyState CRM components"
```

---

## Task 4: PageLayout + index.ts

**Files:**
- Create: `src/components/crm/PageLayout.tsx`
- Create: `src/components/crm/index.ts`

- [ ] **Step 1: Maak `src/components/crm/PageLayout.tsx`**

```tsx
import AppShell from "@/app/components/AppShell";
import { PageHeader } from "./PageHeader";

type PageLayoutProps = {
  title: string;
  subtitle?: string;
  action?: React.ReactNode;
  children: React.ReactNode;
};

export function PageLayout({ title, subtitle, action, children }: PageLayoutProps) {
  return (
    <AppShell>
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "flex-end",
          gap: 16,
          flexWrap: "wrap",
          marginBottom: 0,
        }}
      >
        <PageHeader title={title} subtitle={subtitle} />
        {action && <div style={{ paddingBottom: 24 }}>{action}</div>}
      </div>
      {children}
    </AppShell>
  );
}
```

- [ ] **Step 2: Maak `src/components/crm/index.ts`**

```ts
export { Card } from "./Card";
export { SectionLabel } from "./SectionLabel";
export { PageHeader } from "./PageHeader";
export { StatCard } from "./StatCard";
export { Badge } from "./Badge";
export { EmptyState } from "./EmptyState";
export { PageLayout } from "./PageLayout";
```

- [ ] **Step 3: Verifieer TypeScript én controleer alle exports**

```bash
npx tsc --noEmit
```

Verwacht: geen fouten.

- [ ] **Step 4: Commit**

```bash
git add src/components/crm/PageLayout.tsx src/components/crm/index.ts
git commit -m "feat: add PageLayout and barrel export for CRM component library"
```

---

## Task 5: Dashboard bijwerken

Vervang de inline `Card` component in `dashboard/page.tsx` met imports uit `@/components/crm`.

**Files:**
- Modify: `src/app/dashboard/page.tsx`

- [ ] **Step 1: Vervang de inline Card definitie door import**

Verwijder in `dashboard/page.tsx` de lokale `Card` functie (regels die beginnen met `function Card(`). Voeg bovenaan toe:

```tsx
import { Card, SectionLabel } from "@/components/crm";
```

- [ ] **Step 2: Vervang ook de labelStyle object**

Verwijder het `const labelStyle` object én alle `style={labelStyle}` referenties. Vervang elke `<div style={labelStyle}>...</div>` door:

```tsx
<SectionLabel>...</SectionLabel>
```

- [ ] **Step 3: Verifieer TypeScript**

```bash
npx tsc --noEmit
```

Verwacht: geen fouten.

- [ ] **Step 4: Verifieer visueel**

Open `http://localhost:3000/dashboard`. Dashboard moet er identiek uitzien als voor deze wijziging.

- [ ] **Step 5: Commit**

```bash
git add src/app/dashboard/page.tsx
git commit -m "refactor: dashboard uses CRM Card and SectionLabel components"
```

---

## Task 6: Leden pagina bijwerken

**Files:**
- Modify: `src/app/members/page.tsx`

- [ ] **Step 1: Vervang imports bovenaan `members/page.tsx`**

Verwijder:
```tsx
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
```

Voeg toe:
```tsx
import { PageLayout, EmptyState, Badge } from "@/components/crm";
```

- [ ] **Step 2: Vervang de lege toestand**

Zoek het blok dat de lege toestand toont (het `<div className="rounded-[10px] border...">` blok) en vervang het door:

```tsx
<EmptyState
  title="Nog geen leden"
  description="Voeg er één toe of importeer uit Excel of CSV."
  action={
    <div style={{ display: "flex", gap: 8, justifyContent: "center" }}>
      <Button onClick={openAdd}>Lid toevoegen</Button>
      <Button variant="outline" onClick={openImport}>Leden importeren</Button>
    </div>
  }
/>
```

- [ ] **Step 3: Vervang de StatusBadge functie**

Verwijder de bestaande `StatusBadge` component. Vervang alle aanroepen:

```tsx
// Was: <StatusBadge status={m.status} />
// Wordt:
{m.status === "active"    && <Badge variant="actief">Actief</Badge>}
{m.status === "inactive"  && <Badge variant="inactief">Inactief</Badge>}
{m.status === "prospect"  && <Badge variant="prospect">Prospect</Badge>}
{m.status === "cancelled" && <Badge variant="opgezegd">Opgezegd</Badge>}
```

- [ ] **Step 4: Vervang de AppShell wrapper door PageLayout**

Vervang:
```tsx
export default function MembersPage() {
  return (
    <AppShell>
      <MembersInner />
    </AppShell>
  );
}
```

Door:
```tsx
export default function MembersPage() {
  return <MembersInner />;
}
```

En in `MembersInner`, vervang de bovenste `<div className="flex justify-between...">` header sectie plus de `AppShell` wrapper zodat de hele pagina teruggeeft:

```tsx
return (
  <PageLayout
    title="Leden"
    subtitle="Beheer je leden en contactpersonen."
    action={
      members.length > 0 ? (
        <div style={{ display: "flex", gap: 8 }}>
          <Button variant="outline" onClick={openImport}>Leden importeren</Button>
          <Button onClick={openAdd}>Lid toevoegen</Button>
        </div>
      ) : undefined
    }
  >
    {/* rest van de inhoud */}
  </PageLayout>
);
```

- [ ] **Step 5: Verifieer TypeScript**

```bash
npx tsc --noEmit
```

Verwacht: geen fouten.

- [ ] **Step 6: Verifieer visueel**

Open `http://localhost:3000/members`. Pagina moet laden, tabel en badges moeten correct zijn.

- [ ] **Step 7: Commit**

```bash
git add src/app/members/page.tsx
git commit -m "refactor: members page uses PageLayout, EmptyState, Badge from CRM library"
```

---

## Task 7: Donaties pagina bijwerken

**Files:**
- Modify: `src/app/donations/page.tsx`

- [ ] **Step 1: Vervang imports**

Verwijder:
```tsx
import { Card, CardContent } from "@/components/ui/card";
```

Voeg toe:
```tsx
import { PageLayout, StatCard, EmptyState } from "@/components/crm";
```

- [ ] **Step 2: Vervang de stat cards sectie**

Zoek het blok met de drie stat cards (`<div className="grid grid-cols-1 sm:grid-cols-3...">`). Vervang het door:

```tsx
{donations.length > 0 && (
  <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 16, marginBottom: 20 }}>
    <StatCard label="Totaal dit jaar" value={formatEuro(yearTotal)} />
    <StatCard label="Totaal (alles)"  value={formatEuro(total)} />
    <StatCard label="Aantal donaties" value={String(donations.length)} />
  </div>
)}
```

- [ ] **Step 3: Vervang de lege toestand**

Zoek het lege toestand blok en vervang door:

```tsx
<EmptyState
  title="Nog geen donaties"
  description="Registreer je eerste donatie en koppel deze optioneel aan een lid."
  action={<Button onClick={openAdd}>Donatie toevoegen</Button>}
/>
```

- [ ] **Step 4: Vervang AppShell wrapper door PageLayout**

Vervang:
```tsx
export default function DonationsPage() {
  return (
    <AppShell>
      <DonationsInner />
    </AppShell>
  );
}
```

Door:
```tsx
export default function DonationsPage() {
  return <DonationsInner />;
}
```

En wrap `DonationsInner` zijn return in:
```tsx
return (
  <PageLayout
    title="Donaties"
    subtitle="Registreer donaties en koppel ze optioneel aan een lid."
    action={donations.length > 0 ? <Button onClick={openAdd}>Donatie toevoegen</Button> : undefined}
  >
    {/* inhoud */}
  </PageLayout>
);
```

- [ ] **Step 5: Verwijder de lokale StatCard functie**

Onderaan `donations/page.tsx` staat een lokale `function StatCard(...)`. Verwijder die volledig — we gebruiken nu de gedeelde versie.

- [ ] **Step 6: Verifieer TypeScript**

```bash
npx tsc --noEmit
```

Verwacht: geen fouten.

- [ ] **Step 7: Commit**

```bash
git add src/app/donations/page.tsx
git commit -m "refactor: donations page uses PageLayout, StatCard, EmptyState from CRM library"
```

---

## Task 8: Placeholder pagina's bijwerken

**Files:**
- Modify: `src/app/ondernemers/page.tsx`
- Modify: `src/app/toezeggingen/page.tsx`
- Modify: `src/app/evenementen/page.tsx`

- [ ] **Step 1: Vervang `ondernemers/page.tsx`**

```tsx
import { PageLayout, EmptyState } from "@/components/crm";

export default function OndernemersPage() {
  return (
    <PageLayout title="Ondernemers" subtitle="Zakelijke donateurs en sponsoren.">
      <EmptyState
        title="Ondernemers module"
        description="Hier komen straks je zakelijke donateurs en sponsoren."
      />
    </PageLayout>
  );
}
```

- [ ] **Step 2: Vervang `toezeggingen/page.tsx`**

```tsx
import { PageLayout, EmptyState } from "@/components/crm";

export default function ToezeggingenPage() {
  return (
    <PageLayout title="Toezeggingen" subtitle="Openstaande en voldane toezeggingen.">
      <EmptyState
        title="Toezeggingen module"
        description="Hier komen straks je openstaande toezeggingen en betalingsafspraken."
      />
    </PageLayout>
  );
}
```

- [ ] **Step 3: Vervang `evenementen/page.tsx`**

```tsx
import { PageLayout, EmptyState } from "@/components/crm";

export default function EvenementenPage() {
  return (
    <PageLayout title="Evenementen" subtitle="Aankomende en afgelopen evenementen.">
      <EmptyState
        title="Evenementen module"
        description="Hier komen straks je geplande en afgelopen evenementen."
      />
    </PageLayout>
  );
}
```

- [ ] **Step 4: Verifieer TypeScript**

```bash
npx tsc --noEmit
```

Verwacht: geen fouten.

- [ ] **Step 5: Commit**

```bash
git add src/app/ondernemers/page.tsx src/app/toezeggingen/page.tsx src/app/evenementen/page.tsx
git commit -m "refactor: placeholder pages use PageLayout and EmptyState from CRM library"
```

---

## Task 9: HUISSTIJL.md documentatie

**Files:**
- Create: `HUISSTIJL.md` (in project root)

- [ ] **Step 1: Maak `HUISSTIJL.md`**

```markdown
# Mini CRM Huisstijl

Gedeelde component library voor alle pagina's. Importeer altijd vanuit `@/components/crm`.

```tsx
import { Card, PageHeader, StatCard, SectionLabel, Badge, EmptyState, PageLayout } from "@/components/crm";
```

---

## Componenten

### PageLayout
Gebruik voor elke pagina. Bevat AppShell + PageHeader + optionele actieknop rechts.

```tsx
<PageLayout title="Leden" subtitle="Beheer je leden." action={<Button>Toevoegen</Button>}>
  {/* inhoud */}
</PageLayout>
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
| `var(--radius)` | 10px — card radius |
| `var(--radius-sm)` | 7px — button, nav radius |
| `var(--shadow)` | Standaard card schaduw |
| `var(--font-serif)` | DM Serif Display — titels, grote getallen |
| `var(--font-sans)` | DM Sans — alles overig |
```

- [ ] **Step 2: Verifieer dat het bestand bestaat**

```bash
ls HUISSTIJL.md
```

Verwacht: bestand aanwezig.

- [ ] **Step 3: Commit**

```bash
git add HUISSTIJL.md
git commit -m "docs: add HUISSTIJL.md component library reference"
```

---

## Task 10: Finale build verificatie

- [ ] **Step 1: Volledige productie build**

```bash
npm run build
```

Verwacht: build slaagt, geen TypeScript fouten, geen compile errors.

- [ ] **Step 2: Controleer alle 7 checks uit de spec**

- [ ] Alle componenten exporteren via `src/components/crm/index.ts`
- [ ] Geen hardcoded kleuren/pixels in `src/components/crm/` — alleen `var(--...)` tokens
- [ ] Dashboard ziet er identiek uit als vóór deze wijzigingen
- [ ] Leden pagina: `PageLayout` + `EmptyState` + `Badge` in gebruik
- [ ] Donaties pagina: `PageLayout` + `StatCard` in gebruik
- [ ] Ondernemers/Toezeggingen/Evenementen: `PageLayout` + `EmptyState` in gebruik
- [ ] `HUISSTIJL.md` beschrijft elk component met codevoorbeeld

- [ ] **Step 3: Final commit**

```bash
git add -A
git commit -m "feat: complete mini-crm huisstijl component library

7 shared components (Card, SectionLabel, PageHeader, StatCard, Badge,
EmptyState, PageLayout) in src/components/crm/. All existing pages
refactored to use the library. HUISSTIJL.md documents usage.

Co-Authored-By: Claude Sonnet 4.6 <noreply@anthropic.com>"
```
