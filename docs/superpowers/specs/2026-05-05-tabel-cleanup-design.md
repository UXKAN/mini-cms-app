# Tabel-cleanup — generieke CRUD-experience

**Datum:** 2026-05-05
**Status:** spec, akkoord op design (sectie 1 + 2). Implementatieplan volgt.
**Vult MVP-scope:** indirect — polish van bestaande pijlers `Members CRUD`, `Donations CRUD`, `Toezeggingen CRUD` (regels 13-14 + 18 in [`docs/product/mvp-scope.md`](../../product/mvp-scope.md)). Voegt **lichte bulk-acties** toe (delete + export); dit verlegt deels regel 77 van [`docs/product/roadmap.md`](../../product/roadmap.md) (bulk-acties = Post-SaaS). Bij implementatie volgt een korte `decisions.md`-entry.

---

## 1. Doel

Alle tabel-pagina's één consistente CRUD-experience geven met gedeelde toolbar, selectie, bulk-bar, 3-dots row-acties, nette confirm-dialog en consistente lege/laad/zero-states. Geen verschuivingen in datamodel of business-logica — puur UX-architectuur.

## 2. Scope

**In scope (3 pagina's):**
- [`/leden`](../../../src/app/members/page.tsx)
- [`/donaties`](../../../src/app/donations/page.tsx)
- [`/toezeggingen`](../../../src/app/toezeggingen/page.tsx)

**Buiten scope (placeholders, niet bewerkt):**
- `/ondernemers` — pagina is 17 LOC placeholder; krijgt het patroon pas bij echte bouw (roadmap NEXT step 3).
- `/evenementen` — verschoven naar SaaS-fase ([decisions.md 2026-05-03](../../product/decisions.md)).
- "Periodieke giften" — geen aparte route; periodieke schenkers staan in `/leden` per [decisions.md 2026-05-04](../../product/decisions.md).

**Vastgelegde keuzes:**

| Keuze | Beslissing |
|---|---|
| Bulk-acties scope | Lichte bulk: alleen **delete** + **export**. Bulk-status-mutaties expliciet uitgesloten. |
| Delete-strategie | Hard delete; soft delete blijft uit MVP. Confirm-dialog krijgt extra waarschuwingslaag op financiële records (donaties + gift_agreements). |
| Filter-button | Eén werkend filter (periode) + chip-bar UX; andere filters volgen later. |
| Architectuur | Hybride: gedeelde `useTableState`-hook + losse UI-componenten. Geen `<DataTable>`-wrapper, geen `@tanstack/react-table`. |
| Selectie-scope | Alleen zichtbare/gefilterde rijen. Selectie wordt gecleared bij filter/zoek-wijziging. |
| Export-formaat | CSV in deze ronde (UTF-8 BOM voor Excel-compat). Echte Excel-export = roadmap NEXT step 7, aparte feature. |
| URL-sync filters | Niet in deze ronde. |
| Sorteer-headers / pagineren | Niet in deze ronde. |

## 3. Architectuur

### 3.1 Bestandsstructuur

```
src/components/
  ui/
    checkbox.tsx              ← shadcn add (nieuw)
    dropdown-menu.tsx         ← shadcn add (nieuw)
    popover.tsx               ← shadcn add (nieuw)
    alert-dialog.tsx          ← shadcn add (nieuw)
  table/
    TableToolbar.tsx
    TableSearch.tsx
    TableStatusFilter.tsx
    TableFilterButton.tsx     # popover met period-presets + custom range
    TableBulkBar.tsx          # sticky bottom bij selectie
    RowActionsMenu.tsx        # 3-dots dropdown
    RowSelectCheckbox.tsx     # checkbox + indeterminate header
    EmptyState.tsx            # geen data ooit
    ZeroResults.tsx           # filter geeft 0
    LoadingState.tsx          # skeleton-rijen
    ConfirmDeleteDialog.tsx   # AlertDialog standard / financial / bulk
    StatCard.tsx              # extract van bestaande inline definitie

src/app/lib/
  useTableState.ts            # de hook
  exportCsv.ts                # CSV-download utility
  formatters.ts               # gedeelde fmtEuro / fmtDate / displayName / status-badge map
```

Bestaande pagina's blijven hun eigen render houden (kolommen verschillen sterk per entiteit). Ze krijgen de hook geïmporteerd voor state, en de UI-componenten ervangen het inline-toolbar-blok, de checkbox-kolom, de bulk-bar en de delete-flow.

### 3.2 Hook-signatuur

```ts
// src/app/lib/useTableState.ts

type Period = {
  preset: 'all' | 'this-month' | 'this-quarter' | 'this-year' | 'custom';
  from?: string;  // ISO date
  to?: string;    // ISO date
};

type UseTableStateInput<T> = {
  items: T[];
  rowKey: (item: T) => string;
  searchFields: (item: T) => string;          // concatenated zoekstring
  statusOf?: (item: T) => string | null;       // null = altijd zichtbaar bij 'all'
  dateOf?: (item: T) => string | null;         // ISO date voor period-filter
  isSelectable?: (item: T) => boolean;         // default: true; gebruikt op /toezeggingen
};

type UseTableStateReturn<T> = {
  // zoek
  search: string;                              // debounced 250ms
  searchInput: string;                         // direct binding voor input
  setSearchInput: (v: string) => void;
  clearSearch: () => void;
  // status
  statusFilter: string;                        // 'all' | <key>
  setStatusFilter: (v: string) => void;
  // periode
  period: Period;
  setPeriod: (p: Period) => void;
  // selectie
  selectedKeys: Set<string>;
  toggleRow: (key: string) => void;
  toggleAllVisible: () => void;
  clearSelection: () => void;
  isAllVisibleSelected: boolean;               // true als alle zichtbare-en-selectable rijen aan
  isSomeVisibleSelected: boolean;              // voor indeterminate header
  // resultaat
  filteredItems: T[];
  isFilteredEmpty: boolean;                    // items > 0 maar filter geeft 0
  isEmpty: boolean;                            // items.length === 0
};
```

**Gedragingen:**
- Debounce zoekveld op 250ms (intern useEffect).
- Selectie wordt automatisch gecleared zodra `search`, `statusFilter`, of `period` wijzigt — voorkomt dat onzichtbare rijen meegebulkt worden.
- `toggleAllVisible` selecteert/deselecteert alle items in `filteredItems` waar `isSelectable(item) === true`.
- Items zonder `isSelectable` (default true) gedragen zich gewoon.
- `isAllVisibleSelected` rekent met selectable-only count; rijen die niet selectable zijn tellen niet mee.
- **Null-date handling:** items waarvoor `dateOf(item)` `null` returnt worden weggefilterd zodra `period.preset !== 'all'`. Bij `preset === 'all'` blijven ze zichtbaar. Voorkomt dat een pledge zonder `pledged_at` "verdwijnt" wanneer er geen filter actief is, maar ook dat hij ten onrechte meetelt in een specifieke periode-selectie.

### 3.3 Componenten — kerngedrag

**TableToolbar** — flex-row container.
- Layout: `<TableSearch />` links · `<TableStatusFilter /> + <TableFilterButton /> + ExportButton + PrimaryAction>` rechts.
- Mobile (< sm): vertical stack, primary action onderaan full-width, status/filter/export horizontaal scrollbaar.

**TableSearch** — `<Input>` met `<Search>`-icon (lucide).
- ESC clears en blur.
- `placeholder` per pagina via prop.
- `aria-label="Zoeken in tabel"`.

**TableStatusFilter** — shadcn `<Select>`.
- Props: `options: { value, label }[]`, `value`, `onChange`.
- Render-label: prefix `"Status: "` (of pagina-specifiek prefix als `labelPrefix`-prop).

**TableFilterButton** — `<Button variant="outline" size="sm">` + `<Filter>`-icon, opent `<Popover>`.
- Inhoud: 4 preset-knoppen (`Alles · Deze maand · Dit kwartaal · Dit jaar`) + "Aangepast" sectie met twee `<Input type="date">` voor `from` / `to`.
- Boven de tabel verschijnt een **chip-rij** met active filters (alleen periode in MVP) — bv. *"Periode: 2026-Q1 ✕"*. Klik op X reset het filter.
- Default `preset = 'all'`; geen chip zichtbaar.

**TableBulkBar** — sticky `bottom-4 left-1/2 -translate-x-1/2`, `bg-foreground text-background` rounded-pill, padding + drop-shadow.
- Toont `"X geselecteerd"` + `<Button variant="ghost">`-acties + "Annuleer" (= `clearSelection`).
- Verdwijnt bij `selectedKeys.size === 0` (transition-opacity, 200ms).
- `role="region"` met `aria-label="Bulk-acties voor X geselecteerde rijen"`.
- Acties via prop `actions: { label, icon, onClick, destructive?, disabled?, disabledReason? }[]`.

**RowActionsMenu** — `<DropdownMenu>` met `<MoreHorizontal>`-icon trigger.
- Trigger: `<Button variant="ghost" size="icon" className="h-8 w-8">`.
- `align="end"` (opent links van trigger op mobile).
- Acties via prop `actions: { label, icon?, onClick, destructive? }[]`.
- Destructive items: `text-destructive focus:text-destructive`.

**RowSelectCheckbox** — wrapper rond shadcn `<Checkbox>`.
- Header-versie: ondersteunt indeterminate (check via `aria-checked="mixed"`).
- Aria-label: `"Selecteer rij"` of `"Selecteer alle X zichtbare rijen"` (header).

**ConfirmDeleteDialog** — `<AlertDialog>` met variant.
- Props:
  ```ts
  type Props = {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    onConfirm: () => Promise<void> | void;
    mode: 'standard' | 'financial';
    title: string;          // bv. "Lid verwijderen?" of "8 donaties verwijderen?"
    description: string;    // gevulde context
    itemCount?: number;     // voor bulk
  };
  ```
- `mode='financial'`: rode banner met tekst *"Dit zijn ANBI-bewijzen. Verwijderen kan niet ongedaan worden gemaakt."* + extra `<Checkbox>` *"Ik begrijp dit"* die de "Verwijder"-knop disabled houdt tot aangevinkt.
- Confirm-knop: `variant="destructive"`, label `"Verwijder"` of `"Verwijder X items"`.
- Tijdens `onConfirm`: knop disabled + spinner.

**EmptyState / ZeroResults / LoadingState** — pure presentation:
- `EmptyState` — grote card, lucide-icon, titel, omschrijving, primaire action(s).
- `ZeroResults` — kleine boodschap binnen tabelgebied, `"Geen resultaten gevonden"` + secundaire link "Wis filters" (callt `clearSearch + setStatusFilter('all') + setPeriod({preset:'all'})`).
- `LoadingState` — 5 skeleton-rijen in tabel-vorm met grijze `<div>`-blokken.

**StatCard** — extract van bestaande inline definitie.
- Props: `label: string`, `value: string`, `tone?: 'default' | 'muted'`.

## 4. Per-pagina invulling

### 4.1 `/leden`

**Stat-cards (3, boven de toolbar):**
1. **Totaal leden & donateurs** — `members.length`
2. **Actieve periodieke giften** — `members` waar `agreementAmounts.has(member.id)` (al berekend in huidige fetch)
3. **Nieuwe leden deze maand** — count waar `created_at >= startVanDezeMaand`

**Toolbar:**
- `searchFields` = `[first_name, last_name, name, email].join(' ')`
- Status-dropdown (gecombineerde "Toon"-dropdown), 7 opties:
  - `all` — Alle leden & donateurs
  - `lid-active` — Lid · actief
  - `lid-inactive` — Lid · inactief
  - `donateur-active` — Donateur · actief
  - `donateur-inactive` — Donateur · inactief
  - `prospect` — Prospect
  - `cancelled` — Opgezegd

  De `statusOf`-callback returnt een gecombineerde key:
  ```ts
  (m) => {
    if (m.status === 'prospect') return 'prospect';
    if (m.status === 'cancelled') return 'cancelled';
    const type = m.membership_type === 'lid' ? 'lid' : 'donateur';
    const status = m.status === 'active' ? 'active' : 'inactive';
    return `${type}-${status}`;
  }
  ```
- `dateOf` = `m.created_at`
- Primair: "Nieuw lid"

**Kolommen:**
`☐ | Naam | Type | Status | E-mail | Bedrag/maand | Aangemaakt | ⋯`

**Rijen-acties:**
- Bekijken → `/members/[id]`
- Bewerken → opent bestaande edit-Dialog
- Verwijderen → `ConfirmDeleteDialog` mode `'standard'`

**Bulk-acties:**
- "Exporteer X leden" — CSV
- "Verwijder X leden" — `ConfirmDeleteDialog` mode `'standard'`, bulk-modus

### 4.2 `/donaties`

**Stat-cards blijven 3:** `Totaal dit jaar` · `Totaal (alles)` · `Aantal donaties` (ongewijzigd, via `<StatCard>`).

**Toolbar:**
- `searchFields` = donateur-naam (member of `gift_agreement.schenker_naam`) + `notes` + `amount.toString()`
- Methode-dropdown: `Alle methodes` (default) · Bank · Online · Contant · Overig
- `statusOf` = `d.method`
- `dateOf` = `d.donated_at`
- Primair: "Donatie toevoegen"

**Kolommen:**
`☐ | Datum | Donateur | Bedrag | Methode | Omschrijving | ⋯`

**Rijen-acties:**
- Bewerken
- Verwijderen → `ConfirmDeleteDialog` mode `'financial'`

**Bulk-acties:**
- "Exporteer X donaties" — CSV
- "Verwijder X donaties" — `ConfirmDeleteDialog` mode `'financial'`, bulk + checkbox-confirm

### 4.3 `/toezeggingen`

**Stat-cards blijven 3** (huidige set hergebruikt via `<StatCard>`).

**Toolbar:**
- `searchFields` = donateur-naam + omschrijving + bedrag + e-mail (voor anoniem)
- Status-dropdown: `Alle toezeggingen` (default) · Open · Deels betaald · Voldaan · Geannuleerd
- `statusOf` = genormaliseerd:
  - Pledge: `pledge.status` (`open` / `partial` / `paid` / `cancelled`)
  - Gift_agreement: gemapt naar pledge-status via `payment_status` (`unpaid` → `open`, `partial` → `partial`, `paid` → `paid`)
- `dateOf` = `pledge.pledged_at` of `gift_agreement.akkoord_at`
- `isSelectable` = `(row) => row.type === 'pledge'`  ← **gift_agreement-rijen krijgen geen checkbox**
- Primair: "Toezegging toevoegen"

**Kolommen:**
`☐* | Type-badge | Donateur | Bedrag | Omschrijving | Toegezegd op | Deadline | Status | ⋯`

`*` Voor gift_agreement-rijen wordt de checkbox-cel leeg gerenderd (geen disabled checkbox; gewoon weglaten — voorkomt verwarring).

**Rijen-acties — dynamisch per type:**
- Pledge: Bekijken · Bewerken · Markeer als betaald · Verwijderen (`'financial'`)
- Gift_agreement: Bekijken · Markeer als betaald (geen edit/delete, conform [decisions.md 2026-05-04](../../product/decisions.md))

**Bulk-acties:**
- "Exporteer X toezeggingen" — CSV (alleen pledges, want alleen die zijn selecteerbaar)
- "Verwijder X toezeggingen" — `ConfirmDeleteDialog` mode `'financial'`, bulk

> Voor "exporteer alle toezeggingen incl. gift_agreements" gebruikt de gebruiker de hoofd-Export-knop (rechts in toolbar) — die werkt op `filteredItems` wanneer er geen selectie is.

## 5. States — overal consistent

| State | Wanneer | UI |
|---|---|---|
| **LoadingState** | initial fetch / refetch | 5 skeleton-rijen |
| **EmptyState** | `items.length === 0` | grote card, icon, copy + primary action(s) |
| **ZeroResults** | `items.length > 0` && filtered = 0 | kleine boodschap binnen tabelgebied + "Wis filters" link |
| **Error** | fetch error | rode banner boven tabel met retry-knop |

**Empty-state copy (NL):**
- /leden: *"Nog geen leden. Voeg leden toe of importeer ze uit Excel."* — knoppen "Nieuw lid" + "Importeren"
- /donaties: *"Nog geen donaties. Registreer de eerste donatie via de knop hieronder."* — "Donatie toevoegen"
- /toezeggingen: *"Nog geen toezeggingen. Open toezeggingen kun je hier bijhouden."* — "Toezegging toevoegen"

## 6. Mobile / responsive

- **Toolbar** < `sm` (640px): vertical stack — zoek bovenaan, filter-rij eronder horizontaal scrollbaar, primary action full-width onderaan.
- **Tabel** < `md` (768px): horizontaal scrollbaar in `overflow-x-auto`. Geen sticky-kolom in MVP.
- **Bulk-bar** sticky bottom blijft sticky op mobile, `min-w-[280px]`, `max-w-[90vw]`.
- **RowActionsMenu** dropdown `align="end"`.

## 7. Toegankelijkheid

- Alle interactieve elementen via shadcn → toetsenbord + screen-reader uit de doos.
- Header-checkbox indeterminate via `aria-checked="mixed"`.
- TableSearch: ESC clears en blurt.
- TableBulkBar: `role="region"` + descriptive aria-label.
- ConfirmDeleteDialog focus-trap via shadcn AlertDialog.

## 8. Export-formaat

Eén utility:
```ts
exportCsv(filename: string, rows: Record<string, unknown>[], columns: { key, label }[]): void
```
- UTF-8 met BOM voor Excel-compat.
- Datums in NL-formaat (`dd-mm-jjjj`).
- Bedragen met komma als decimaal.
- Triggert browser-download via Blob + anchor.
- Gebruik: bij selectie exporteer `selectedItems`; anders `filteredItems`.

Per pagina kolomdefinitie in een module-constante (geen runtime-config). Bv.:
```ts
// /leden export columns
[
  { key: 'name', label: 'Naam', get: (m) => displayName(m) },
  { key: 'email', label: 'E-mail', get: (m) => m.email ?? '' },
  ...
]
```

## 9. Out-of-scope (expliciet)

- URL-sync van filters/zoek
- Server-side filtering / sorteren / pagineren
- Excel-formaat export (CSV nu, `.xlsx` is roadmap NEXT step 7)
- Bulk-status-mutaties ("Markeer als voldaan" in bulk; per rij wel)
- "Select all across pages" (we paginalen niet)
- Soft delete
- Kolom-zichtbaarheid / sorteer-headers
- `/ondernemers`, `/evenementen`, "Periodieke giften" (geen aparte route)

## 10. Beslissingenlog-entry (te schrijven bij implementatie)

Bij start van implementatie wordt deze entry aan [`docs/product/decisions.md`](../../product/decisions.md) toegevoegd:

> **2026-05-05 — Lichte bulk-acties (delete + export) in MVP**
>
> Beslissing: tabel-cleanup voegt selectie + bulk-bar toe op `/leden`, `/donaties`, `/toezeggingen` met enkel "Verwijder selectie" en "Exporteer selectie". Bulk-status-mutaties expliciet uitgesloten.
>
> Waarom: zelfde UX-investering die anders bij Post-SaaS zou plaatsvinden (roadmap regel 77), maar zonder de risicovolle status-mass-mutaties. Gift_agreement-rijen op `/toezeggingen` zijn niet selecteerbaar — voorkomt per ongeluk delete van ANBI-akten.
>
> Herzieningstrigger: bij Post-SaaS / multi-org wanneer mass-status of mass-email gevraagd wordt.

## 11. Implementatie-volgorde (suggestie voor plan)

Niet bindend — komt in implementatieplan tot leven:

1. shadcn-componenten installeren (`checkbox`, `dropdown-menu`, `popover`, `alert-dialog`)
2. Gedeelde primitives: `formatters.ts`, `exportCsv.ts`, `useTableState.ts`, `StatCard.tsx`
3. UI-bouwstenen: `TableToolbar`, `TableSearch`, `TableStatusFilter`, `TableFilterButton`, `RowActionsMenu`, `RowSelectCheckbox`, `LoadingState`, `EmptyState`, `ZeroResults`, `ConfirmDeleteDialog`, `TableBulkBar`
4. `/leden` migreren (kleinste page, krijgt nieuwe stat-cards)
5. `/donaties` migreren (financial mode op delete)
6. `/toezeggingen` migreren (gemixte selectie + dynamische rijen-acties)
7. `decisions.md`-entry schrijven
8. Build + lint + manual smoke test op alle drie pagina's (incl. mobile resize)
