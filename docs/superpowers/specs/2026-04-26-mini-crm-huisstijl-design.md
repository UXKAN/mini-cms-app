# Design: Mini CRM Huisstijl Component Library

**Date:** 2026-04-26
**Status:** Pending user approval
**Branch:** frontend/design

---

## Doel

Eén gedeeld component library zodat elke pagina — bestaand én toekomstig — automatisch de juiste styling krijgt zonder dat iemand handmatig padding, kleuren of font sizes hoeft op te zoeken.

De huisstijl is gebaseerd op de exacte waarden uit `Dashboard-standalone.html` (het goedgekeurde prototype).

---

## Architectuur

Drie lagen die samenwerken:

```
globals.css              ← CSS tokens (kleuren, spacing, radius, shadow)
src/components/crm/      ← React componenten die de tokens gebruiken
HUISSTIJL.md             ← Documentatie: wat bestaat er, hoe gebruik je het
```

**Principe:** tokens in CSS, structuur in React, nooit hardcoded waarden in page files.

---

## Laag 1 — CSS Tokens (`globals.css`)

Alle design waarden staan al correct in `:root`. Geen wijzigingen nodig.

| Token | Waarde | Gebruik |
|---|---|---|
| `--bg` | `oklch(0.968 0.007 75)` | Pagina achtergrond |
| `--surface` | `oklch(0.995 0.003 75)` | Card achtergrond |
| `--border` | `oklch(0.89 0.009 75)` | Alle randen |
| `--ink` | `oklch(0.18 0.02 65)` | Primaire tekst |
| `--ink-muted` | `oklch(0.48 0.015 65)` | Secondaire tekst |
| `--ink-subtle` | `oklch(0.68 0.01 65)` | Labels, placeholders |
| `--accent` | `oklch(0.52 0.13 165)` | Groen — primaire actie |
| `--accent-light` | `oklch(0.94 0.04 165)` | Groene achtergrond (hover, badge) |
| `--accent-dark` | `oklch(0.40 0.13 165)` | Donkergroen (actieve nav, links) |
| `--radius` | `10px` | Card border radius |
| `--radius-sm` | `7px` | Button, nav item radius |
| `--shadow` | `0 1px 3px … 0 3px 10px …` | Card schaduw |
| `--font-serif` | `DM Serif Display` | Paginatitels, grote getallen |
| `--font-sans` | `DM Sans` | Alles overig |
| `--sidebar-w` | `220px` | Sidebar breedte |

**Spacing systeem** (consistent te gebruiken):

| Naam | Waarde | Gebruik |
|---|---|---|
| Card padding | `22px 24px` | Standaard card inhoud |
| Page padding | `32px` | Main content gebied |
| Sidebar logo area | `20px 18px 16px` | Padding boven separator |
| Nav item | `9px 10px` | Elke nav link |
| Section gap | `16px` | Grid gap tussen cards |

---

## Verhouding tot bestaande shadcn componenten

`src/components/ui/` bevat shadcn primitieven (button, input, dialog, table, avatar). Die blijven intact — ze worden intern gebruikt door dialogs en forms.

`src/components/crm/` zijn app-niveau componenten die de CSS tokens direct gebruiken. Ze vervangen de shadcn `Card` en `Badge` voor gebruik in pagina's. Importeer altijd vanuit `@/components/crm`, nooit vanuit `@/components/ui/card` of `@/components/ui/badge` in page files.

```
@/components/ui/    ← shadcn primitieven (button, input, dialog, table)
@/components/crm/   ← huisstijl componenten (Card, Badge, PageHeader, ...)
```

---

## Laag 2 — React Componenten (`src/components/crm/`)

### Bestandsstructuur

```
src/components/crm/
  index.ts          ← exporteert alles (1 import voor de hele library)
  Card.tsx
  PageHeader.tsx
  StatCard.tsx
  SectionLabel.tsx
  Badge.tsx
  EmptyState.tsx
  PageLayout.tsx
```

---

### `Card`

Basis container. Gebruikt door alle pagina's.

```tsx
<Card>inhoud</Card>
<Card style={{ gridColumn: "1 / span 2" }}>volle breedte</Card>
```

**Styling:** `background: var(--surface)`, `border: 1px solid var(--border)`, `border-radius: var(--radius)`, `box-shadow: var(--shadow)`, `padding: 22px 24px`.

**Props:**
- `children` — inhoud
- `style?` — extra inline stijlen (bijv. gridColumn voor 2-brede kaarten)
- `onClick?` — maakt de kaart klikbaar met hover effect

---

### `PageHeader`

Paginatitel + optionele ondertitel. Bovenaan elke pagina.

```tsx
<PageHeader title="Leden" subtitle="Beheer je leden en contactpersonen." />
<PageHeader title="Dashboard" subtitle={`Overzicht · ${today}`} />
```

**Styling:** titel = `font-serif 28px weight-400`, ondertitel = `13px ink-muted`, margin-bottom `24px`.

**Props:**
- `title` — string (verplicht)
- `subtitle?` — string

---

### `StatCard`

Label + groot getal + optionele ondertekst. Voor dashboard widgets en statistieken.

```tsx
<StatCard label="Totaal leden" value="110" hint="actieve leden" />
<StatCard label="Donaties dit jaar" value="€ 25.936" />
```

**Styling:** label = `SectionLabel`, waarde = `font-serif 30px`, hint = `12px ink-muted`. Alles in een `Card`.

**Props:**
- `label` — string
- `value` — string
- `hint?` — string onder het getal

---

### `SectionLabel`

Uppercase label boven secties. Consistent 11px overal.

```tsx
<SectionLabel>Maandelijkse leden</SectionLabel>
<SectionLabel>Top 5</SectionLabel>
```

**Styling:** `11px`, `font-weight: 700`, `color: var(--ink-subtle)`, `letter-spacing: 0.06em`, `text-transform: uppercase`, `margin-bottom: 8px`.

**Props:**
- `children` — string
- `mb?` — margin-bottom override (default 8px)

---

### `Badge`

Status chips voor leden, donaties, tags.

```tsx
<Badge variant="actief">Actief</Badge>
<Badge variant="inactief">Inactief</Badge>
<Badge variant="prospect">Prospect</Badge>
<Badge variant="opgezegd">Opgezegd</Badge>
<Badge variant="accent">Ondernemer</Badge>
```

**Varianten:**

| Variant | Achtergrond | Tekstkleur |
|---|---|---|
| `actief` | `--accent-light` | `--accent-dark` |
| `inactief` | `--muted` | `--ink-muted` |
| `prospect` | `--warn-light` | `--warn` |
| `opgezegd` | `--error-light` | `--error` |
| `accent` | `--accent-light` | `--accent-dark` |

**Styling:** `11px`, `font-weight: 600`, `padding: 3px 9px`, `border-radius: 99px`.

**Props:**
- `variant` — een van de vijf varianten
- `children` — label tekst

---

### `EmptyState`

Gecentreerde lege toestand voor lijsten zonder data.

```tsx
<EmptyState
  title="Nog geen leden"
  description="Voeg er één toe of importeer uit Excel of CSV."
  action={<Button onClick={openAdd}>Lid toevoegen</Button>}
/>
```

**Styling:** `Card` wrapper, `text-align: center`, `padding: 48px 24px`, titel = `font-serif 22px`, beschrijving = `14px ink-muted`.

**Props:**
- `title` — string
- `description?` — string
- `action?` — ReactNode (knop of link)

---

### `PageLayout`

Standaard pagina-opzet: header links, actie-knop rechts.

```tsx
<PageLayout
  title="Leden"
  subtitle="Beheer je leden en contactpersonen."
  action={<Button onClick={openAdd}>Lid toevoegen</Button>}
>
  {/* pagina inhoud */}
</PageLayout>
```

**Structuur:**
```
<AppShell>
  <div>  ← flex row, justify-between
    <PageHeader title subtitle />
    {action}
  </div>
  {children}
</AppShell>
```

**Props:**
- `title` — string
- `subtitle?` — string
- `action?` — ReactNode (knop rechts)
- `children` — pagina inhoud

---

## Laag 3 — Workflow voor nieuwe features

Afgesproken aanpak (**D: Mix**):

| Situatie | Aanpak |
|---|---|
| Standaard nieuwe pagina (lijst, tabel, stats) | Beschrijf het → ik bouw met huisstijl componenten |
| Speciaal nieuw component (chart, wizard, form) | Jij schetst of ik toon visuele opties → jij kiest → ik bouw |
| Iteratie op bestaande pagina | Zeg wat niet klopt → ik pas aan |

**Nieuwe componenten toevoegen:** altijd in `src/components/crm/`, altijd met `var(--...)` tokens, nooit hardcoded waarden. Daarna documenteren in `HUISSTIJL.md`.

---

## Bestaande pagina's updaten

Na de implementatie worden deze pagina's herschreven om de nieuwe componenten te gebruiken:

| Pagina | Huidige situatie | Na implementatie |
|---|---|---|
| `dashboard/page.tsx` | Inline Card component | `Card`, `StatCard`, `SectionLabel` |
| `members/page.tsx` | Eigen structuur | `PageLayout`, `EmptyState`, `Badge` |
| `donations/page.tsx` | Eigen structuur | `PageLayout`, `StatCard`, `EmptyState` |
| `ondernemers/page.tsx` | Placeholder | `PageLayout`, `EmptyState` |
| `toezeggingen/page.tsx` | Placeholder | `PageLayout`, `EmptyState` |
| `evenementen/page.tsx` | Placeholder | `PageLayout`, `EmptyState` |

---

## Verificatie

Na implementatie controleren:

1. ✅ Alle componenten exporteren via `src/components/crm/index.ts`
2. ✅ Geen hardcoded kleuren of pixels in component files — alleen `var(--...)` tokens
3. ✅ Dashboard ziet er hetzelfde uit als nu (componenten zijn drop-in vervanging)
4. ✅ Leden pagina gebruikt `PageLayout` + `EmptyState` + `Badge`
5. ✅ Donaties pagina gebruikt `PageLayout` + `StatCard`
6. ✅ TypeScript compileert zonder fouten (`npm run build`)
7. ✅ `HUISSTIJL.md` beschrijft elk component met een codevoorbeeld
