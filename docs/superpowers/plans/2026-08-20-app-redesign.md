# App-redesign (soft SaaS) — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** De bestaande app-schermen (dashboard, leden, donaties, toezeggingen, dialogs, login) omzetten naar het goedgekeurde soft-SaaS-ontwerp uit `docs/superpowers/specs/2026-08-20-app-redesign-design.md`.

**Architecture:** Fundament eerst: tokens in `globals.css` → shell + PageHeader → gedeelde componenten → per scherm verfijnen. Alle kleuren lopen via de bestaande shadcn-tokennamen, dus de restyle van een token verkleurt de hele app tegelijk.

**Tech Stack:** Next.js 16 App Router, React 19, Tailwind v4, shadcn/ui, lucide-react, sonner (nieuw).

**Scope-relatie (mvp-scope.md):** geen nieuwe features; dit herstijlt bestaande MVP-WEL-onderdelen (ledenadministratie, donatieregistratie, toezeggingen, dashboard). Buiten scope: `imports/[id]`, `onboarding` (oude CSS-vars, CLAUDE.md-uitzondering), `/updates`, dark mode.

**Testaanpak:** dit project heeft geen unit-test-infra; conform CLAUDE.md is de verificatie per taak: `npm run build` groen + visuele controle in de browser (dev-server `next-dev`, poort 3000). Elke taak eindigt met een commit zodat elke stap terugdraaibaar is. Waar mogelijk staat exact wat je in de browser moet zien.

**Werkwijze per taak:** lees eerst het genoemde bestand volledig; de codeblokken hieronder zijn de doelstaat van de relevante fragmenten, geen blinde find-replace.

---

### Task 0: Branch, merge frontend/design, werkende basis

**Files:** geen inhoudelijke wijzigingen; git + npm.

- [ ] **Step 1: Branch aanmaken vanaf huidige HEAD**

```bash
git checkout -b feat/app-redesign
```

- [ ] **Step 2: frontend/design mergen** (5 commits modal-polish; spec-voorwaarde)

```bash
git merge frontend/design --no-edit
```

Verwacht: clean merge (raakt vooral `dialog.tsx`/modal-gebruikers en globals-reset). Bij conflicten: los op in het voordeel van frontend/design (dat werk is bewust behouden), behalve in `docs/` (huidige branch wint).

- [ ] **Step 3: Dependencies + build**

```bash
npm install && npm run build
```

Verwacht: build groen, route-lijst geprint.

- [ ] **Step 4: Commit (alleen als de merge een merge-commit opleverde is dit al gebeurd)**

```bash
git log --oneline -3
```

> **Uitgevoerd als cherry-pick (2026-08-20):** `frontend/design` bleek een verouderde april-branch (51 commits, verlaten CRM-spoor). In plaats van een merge zijn alleen de 4 relevante modal-commits gecherry-pickt (d817a8e, fb988db, fd251ea, 305df30); `536c01f` werd leeg en is geskipt. Reviews: spec ✅, kwaliteit approve met twee vervolg-punten die in Task 1 en 5 zijn opgenomen.

---

### Task 1: Designtokens + typografie (globals.css)

**Files:**
- Modify: `src/app/globals.css:41-96` (tokenblok)

- [ ] **Step 1: Tokenwaarden vervangen.** Het blok `:root { ... }` regels 41-77 wordt (aliassen op 88-96 en het `@layer base`-blok ONGEMOEID laten — die voeden `imports/[id]` en `onboarding`):

```css
  --background: oklch(1 0 0);
  --foreground: oklch(0.22 0.015 170);
  --card: oklch(1 0 0);
  --card-foreground: oklch(0.22 0.015 170);
  --popover: oklch(1 0 0);
  --popover-foreground: oklch(0.22 0.015 170);
  --primary: oklch(0.52 0.13 165);
  --primary-foreground: oklch(0.99 0.002 75);
  --secondary: oklch(0.975 0.004 165);
  --secondary-foreground: oklch(0.22 0.015 170);
  --muted: oklch(0.975 0.004 165);
  --muted-foreground: oklch(0.47 0.012 170);
  --accent-foreground: oklch(0.40 0.13 165);
  --destructive: oklch(0.55 0.14 40);
  --destructive-foreground: oklch(0.99 0.002 75);
  --border: oklch(0.93 0.006 165);
  --input: oklch(0.975 0.004 165);
  --ring: oklch(0.52 0.13 165);
  --ring-offset: oklch(1 0 0);
  --selected: #007F56;

  /* Status-tokens */
  --success: oklch(0.55 0.15 150);
  --success-light: oklch(0.962 0.013 165);
  --warn: oklch(0.58 0.1 75);
  --warn-light: oklch(0.965 0.025 85);
  --error-light: oklch(0.96 0.02 30);

  /* Brand-accent tints */
  --accent-light: oklch(0.962 0.013 165);
  --accent-dark: oklch(0.40 0.13 165);

  /* Soft-SaaS oppervlakken */
  --surface-zone: oklch(0.975 0.004 165);

  /* Layout/elevation */
  --radius: 10px;
  --radius-sm: 7px;
  --radius-lg: 14px;
  --shadow: 0 1px 4px oklch(0.22 0.015 170 / 0.08);
  --shadow-lg: 0 4px 14px oklch(0.22 0.015 170 / 0.12);
```

- [ ] **Step 2: Token-opruiming uit Task 0-review.** Verwijder `--color-surface: var(--surface)` uit het `@theme inline`-blok (dood duplicaat van `--color-card`; het enige gebruik, `bg-surface` in `dialog.tsx`, wordt in Task 5 `bg-card`). Laat de legacy `--surface`-alias in `:root` staan (imports/onboarding).

- [ ] **Step 3: Build + visuele smoketest**

```bash
npm run build
```

Browser (`/login`): achtergrond wit i.p.v. crème, knop merkgroen. Alles nog leesbaar; borders lichter. NB: `bg-surface` in dialog.tsx verwijst na deze taak tijdelijk nergens meer naar als de @theme-regel weg is — zet in deze taak dialog.tsx alvast op `bg-card` (één woord) zodat de build groen blijft; de volledige dialog-restyle volgt in Task 5.

- [ ] **Step 3: Contrastcheck.** In de browserconsole van een willekeurige pagina: muted-tekst op wit moet AA halen. `getComputedStyle`-check of visueel: secundaire tekst duidelijk leesbaar. Zo niet: `--muted-foreground` donkerder maken (L −0.02) en herbouwen.

- [ ] **Step 4: Commit**

```bash
git add src/app/globals.css && git commit -m "feat(redesign): soft-SaaS tokens — wit oppervlak, zone/tint-groen, radius-lg, zachte schaduwen"
```

> **Bewuste keuze (Task 1-review):** `--radius-lg: 14px` in de unlayered `:root` overschrijft Tailwinds eigen `rounded-lg` (voorheen 8px) app-breed — zelfde mechanisme als het bestaande `--radius`-patroon. Geaccepteerd als feature: `rounded-lg` is vanaf nu dé idiomatische kaart-afronding (14px); gebruik in Tasks 4-11 `rounded-lg` waar het plan `rounded-[14px]` zegt. Task 12 controleert visueel de vier niet-geplande meelifters (gift-flow selectable-cards, alert-dialog, PublicHeader, ThankYou). NB: Tailwinds `shadow`/`shadow-lg`-utilities verwijzen NIET naar onze `--shadow`-tokens; voor de zachte schaduwen altijd `shadow-[var(--shadow)]`/`shadow-[var(--shadow-lg)]` gebruiken.

---

### Task 2: sonner-toasts

**Files:**
- Modify: `package.json` (dependency), `src/app/layout.tsx` (Toaster mount)

- [ ] **Step 1: Installeren**

```bash
npm install sonner
```

- [ ] **Step 2: Toaster mounten.** In `src/app/layout.tsx` binnen `<body>` (na `{children}`):

```tsx
import { Toaster } from "sonner";
// ...
<Toaster position="top-right" richColors closeButton />
```

- [ ] **Step 3: Build + commit**

```bash
npm run build && git add package.json package-lock.json src/app/layout.tsx && git commit -m "feat(redesign): sonner-toaster voor microfeedback"
```

Gebruiksregel voor latere taken: na elke geslaagde schrijfactie `toast.success("...")` in het Nederlands (bijv. "Donatie opgeslagen"); bestaande inline succes-patronen mogen blijven waar ze al duidelijk zijn.

---

### Task 3: PageHeader-component (nieuw)

**Files:**
- Create: `src/app/components/PageHeader.tsx`

- [ ] **Step 1: Component schrijven** (volledig bestand):

```tsx
type PageHeaderProps = {
  title: string;
  subtitle?: string;
  children?: React.ReactNode; // contextacties, rechts
};

export function PageHeader({ title, subtitle, children }: PageHeaderProps) {
  return (
    <div className="mb-8 flex flex-wrap items-center justify-between gap-4">
      <div>
        <h1 className="text-xl font-bold tracking-[-0.02em] text-foreground">
          {title}
        </h1>
        {subtitle && (
          <p className="mt-0.5 text-sm text-muted-foreground">{subtitle}</p>
        )}
      </div>
      {children && <div className="flex items-center gap-2">{children}</div>}
    </div>
  );
}
```

- [ ] **Step 2: Build + commit**

```bash
npm run build && git add src/app/components/PageHeader.tsx && git commit -m "feat(redesign): gedeeld PageHeader-component"
```

(Aansluiten per pagina gebeurt in Task 7-11.)

---

### Task 4: AppShell v2 — sidebar, org-naam, Binnenkort-groep, mobiel

**Files:**
- Modify: `src/app/components/AppShell.tsx` (volledige sidebar-JSX + mobiele drawer)

- [ ] **Step 1: Nav-data splitsen** (bovenin bestand, vervangt huidige `nav`-array):

```tsx
const nav = [
  { href: "/dashboard", label: "Dashboard", Icon: LayoutDashboard },
  { href: "/members", label: "Leden", Icon: Users },
  { href: "/donations", label: "Donaties", Icon: Heart },
  { href: "/toezeggingen", label: "Toezeggingen", Icon: FileCheck },
];

const navSoon = [
  { href: "/ondernemers", label: "Ondernemers", Icon: Briefcase },
  { href: "/evenementen", label: "Evenementen", Icon: Calendar },
];
```

- [ ] **Step 2: Sidebar-JSX vervangen.** Doelstaat van de `<aside>` (huidige regels 63-151), plus mobiele drawer-state:

```tsx
const [mobileNavOpen, setMobileNavOpen] = useState(false);

const navItem = (
  { href, label, Icon }: (typeof nav)[number],
  { soon = false } = {},
) => {
  const active = pathname === href || pathname.startsWith(href + "/");
  return (
    <Link
      key={href}
      href={href}
      onClick={() => setMobileNavOpen(false)}
      className={[
        "flex items-center gap-2.5 rounded-[10px] px-3 py-2.5 text-[13px] font-medium no-underline transition-colors",
        active
          ? "bg-card text-primary shadow-[var(--shadow)]"
          : soon
            ? "text-muted-foreground/60 hover:bg-[var(--accent-light)]"
            : "text-foreground hover:bg-[var(--accent-light)]",
      ].join(" ")}
    >
      <Icon size={15} className={active ? "text-primary" : "text-muted-foreground"} />
      {label}
    </Link>
  );
};

const sidebarInner = (
  <>
    <div className="px-4 pb-4 pt-6">
      <div className="flex items-center gap-2.5">
        <div className="grid h-8 w-8 shrink-0 place-items-center rounded-[8px] bg-primary text-[13px] font-bold text-primary-foreground">
          {org.name.charAt(0).toUpperCase()}
        </div>
        <div className="min-w-0">
          <div className="truncate text-[13px] font-bold leading-tight text-foreground">
            {org.name}
          </div>
          <div className="mt-0.5 text-[9px] uppercase tracking-widest text-muted-foreground">
            Mosqon
          </div>
        </div>
      </div>
    </div>
    <div className="px-3 pb-3">
      <Button className="w-full rounded-[10px] shadow-[0_2px_6px_oklch(0.52_0.13_165/0.25)]" onClick={() => setGiftFormOpen(true)}>
        + Nieuwe donatie
      </Button>
    </div>
    <nav className="flex flex-1 flex-col gap-0.5 overflow-y-auto px-2 py-2">
      {nav.map((item) => navItem(item))}
      <div className="mt-4 px-3 pb-1 text-[9px] font-semibold uppercase tracking-widest text-muted-foreground/70">
        Binnenkort
      </div>
      {navSoon.map((item) => navItem(item, { soon: true }))}
    </nav>
    <div className="flex flex-col gap-2 px-3 py-3">
      {/* user-blok en uitlog-knop: bestaande JSX behouden */}
    </div>
  </>
);
```

`<aside>` desktop: `hidden md:flex w-[224px] flex-col sticky top-0 h-screen shrink-0 bg-[var(--surface-zone)]` — géén border-right meer (inline style verwijderen). `Separator`-imports/gebruik in de sidebar vervallen.

- [ ] **Step 3: Mobiele topbalk + drawer.** Vóór `<main>`:

```tsx
{/* Mobiel: topbalk */}
<header className="sticky top-0 z-40 flex h-14 items-center gap-3 bg-background/95 px-4 backdrop-blur md:hidden">
  <button
    aria-label="Menu openen"
    onClick={() => setMobileNavOpen(true)}
    className="grid h-10 w-10 place-items-center rounded-[10px] bg-[var(--surface-zone)] text-foreground"
  >
    <Menu size={18} />
  </button>
  <div className="min-w-0 flex-1 truncate text-[15px] font-bold text-foreground">
    {org.name}
  </div>
  <Button size="sm" className="rounded-[10px]" onClick={() => setGiftFormOpen(true)}>
    + Donatie
  </Button>
</header>

{/* Mobiel: drawer */}
{mobileNavOpen && (
  <div className="fixed inset-0 z-50 md:hidden">
    <div
      className="absolute inset-0 bg-[oklch(0.22_0.015_170/0.35)]"
      onClick={() => setMobileNavOpen(false)}
    />
    <aside className="absolute inset-y-0 left-0 flex w-[264px] flex-col bg-[var(--surface-zone)] shadow-[var(--shadow-lg)]">
      {sidebarInner}
    </aside>
  </div>
)}
```

`Menu` toevoegen aan de lucide-import. `<main>` wordt `flex-1 min-w-0 px-5 py-6 md:px-14 md:py-10`.

- [ ] **Step 4: Build + browsercheck**

```bash
npm run build
```

Browser ingelogd op `/dashboard`: sidebar op zone-tint zonder border, echte org-naam bovenin, actief item wit met schaduw, Binnenkort-groep gedimd. Viewport 375px: topbalk + drawer werkt, focus zichtbaar.

- [ ] **Step 5: Commit**

```bash
git add src/app/components/AppShell.tsx && git commit -m "feat(redesign): AppShell v2 — zone-sidebar, org-naam, Binnenkort-groep, mobiele drawer"
```

---

### Task 5: Button-, input- en dialogstijl (ui-basis)

**Files:**
- Modify: `src/components/ui/button.tsx:7-34`
- Modify: `src/components/ui/input.tsx`
- Modify: `src/components/ui/dialog.tsx`
- Modify: `src/components/ui/label.tsx` (alleen als caps-stijl daar hoort)

- [ ] **Step 1: Button-varianten.** In `buttonVariants` (bestand eerst lezen; frontend/design-merge kan hover-states hebben aangepast):
  - basis: `rounded-md` → `rounded-[10px]`
  - `default`: `bg-primary text-primary-foreground shadow-[0_2px_6px_oklch(0.52_0.13_165/0.25)] hover:bg-primary/90`
  - `secondary`: `bg-[var(--surface-zone)] text-foreground hover:bg-[var(--accent-light)]`
  - `outline`: `border border-input bg-card hover:bg-[var(--surface-zone)]` (blijft voor randgevallen; secundair is de standaard zonder border)
  - sizes: `default: "h-10 px-4 py-2"` (is al 40px — zo laten), `sm: "h-9 rounded-[10px] px-3"`, `icon: "h-10 w-10"`.

- [ ] **Step 2: Input.** Doelklassen voor het input-element:

```
h-10 w-full rounded-[10px] bg-[var(--surface-zone)] px-3.5 text-sm text-foreground placeholder:text-muted-foreground border-0 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring
```

- [ ] **Step 3: Dialog.** In `dialog.tsx`: overlay → `bg-[oklch(0.22_0.015_170/0.35)]`; content → `rounded-[16px] bg-card shadow-[var(--shadow-lg)] border-0`. Titel `text-lg font-bold tracking-tight`, description `text-sm text-muted-foreground`.
  **Scroll-fix uit Task 0-review:** verplaats `max-h`/`overflow-y-auto` van `DialogContent` naar een binnenwrapper om de body-children, zodat de sluitknop (absolute top-4 right-4) en `DialogFooter` vast blijven staan bij lange dialogs. Structuur: content = `flex max-h-[calc(100vh-4rem)] flex-col`, binnenwrapper = `flex-1 overflow-y-auto` rond alles behalve header/footer/close. Controleer daarna dat de twee dialogs op `members/page.tsx` met eigen `max-h-[90vh] overflow-y-auto`-overrides nog kloppen; haal die overrides weg als de basis nu volstaat (één bron van waarheid).

- [ ] **Step 4: Build + browsercheck.** Dialog "+ Nieuwe donatie" openen: wit vlak radius 16 op dim, inputs op zone-tint, knopvolgorde intact, mobiel (375px) vult de dialog vrijwel het scherm (bestaand gedrag uit merge).

- [ ] **Step 5: Commit**

```bash
git add src/components/ui && git commit -m "feat(redesign): ui-basis — knoppen 10px-radius, inputs op zone-tint, dialog 16px + dim"
```

---

### Task 6: Table-primitives + states

**Files:**
- Modify: `src/components/table/StatCard.tsx` (volledig hieronder)
- Modify: `src/components/table/TableToolbar.tsx`, `TableSearch.tsx`, `TableFilterButton.tsx`, `TableStatusFilter.tsx`, `TableBulkBar.tsx`, `RowActionsMenu.tsx`
- Modify: `src/components/table/EmptyState.tsx`, `LoadingState.tsx`, `ZeroResults.tsx`
- Modify: `src/app/components/LoadErrorState.tsx`

- [ ] **Step 1: StatCard vervangen** (volledig bestand; `featured` = de ene tintkaart per pagina, `tone="warn"` voor terracotta):

```tsx
import { cn } from "@/lib/utils";

type StatCardProps = {
  label: string;
  value: string;
  hint?: string;
  featured?: boolean;
  tone?: "default" | "warn";
};

export function StatCard({ label, value, hint, featured, tone = "default" }: StatCardProps) {
  return (
    <div
      className={cn(
        "rounded-[14px] p-5",
        featured ? "bg-[var(--accent-light)]" : "bg-card shadow-[var(--shadow)]",
      )}
    >
      <p className="text-[10px] font-semibold uppercase tracking-[0.12em] text-muted-foreground">
        {label}
      </p>
      <p
        className={cn(
          "mt-1 text-[26px] font-bold leading-none tracking-[-0.02em]",
          featured ? "text-primary" : tone === "warn" ? "text-[var(--warn)]" : "text-foreground",
        )}
      >
        {value}
      </p>
      {hint && <p className="mt-1.5 text-xs text-muted-foreground">{hint}</p>}
    </div>
  );
}
```

- [ ] **Step 2: Toolbar-familie.** Per bestand lezen en omzetten (alles al 40px hoog uit de eerdere fix):
  - zoekveld/filters: achtergrond `bg-[var(--surface-zone)]`, `rounded-[10px]`, geen borders;
  - primaire actie ongewijzigd (Button default);
  - `RowActionsMenu`-trigger: `h-10 w-10 rounded-[10px]` + bestaand `aria-label` controleren, anders toevoegen;
  - `TableBulkBar`: `bg-card shadow-[var(--shadow-lg)] rounded-[14px]`.

- [ ] **Step 3: States.**
  - `EmptyState`: icoon in `h-12 w-12 rounded-full bg-[var(--accent-light)] text-primary grid place-items-center`, titel `text-[15px] font-bold`, uitleg `text-sm text-muted-foreground`, daaronder de actie-Button. Bestaande props behouden.
  - `LoadingState`: vervang tekst door skeletonrijen:

```tsx
export function LoadingState({ rows = 6 }: { rows?: number }) {
  return (
    <div aria-label="Bezig met laden" role="status" className="space-y-3 p-5">
      {Array.from({ length: rows }).map((_, i) => (
        <div key={i} className="flex items-center gap-3">
          <div className="h-8 w-8 shrink-0 rounded-full bg-[var(--surface-zone)] motion-safe:animate-pulse" />
          <div className="h-3 rounded-full bg-[var(--surface-zone)] motion-safe:animate-pulse" style={{ width: `${70 - i * 6}%` }} />
        </div>
      ))}
    </div>
  );
}
```

  - `ZeroResults` en `LoadErrorState`: zelfde toon; LoadErrorState houdt "Opnieuw"-knop (secondary), icoon op `bg-[var(--error-light)]`.

- [ ] **Step 4: Build + browsercheck.** Leden-pagina: toolbar op tint, statcards nieuw (nog zonder featured-prop — komt per pagina), lege staat forceren via zoekterm zonder resultaat (ZeroResults), netwerk offline → foutstaat.

- [ ] **Step 5: Commit**

```bash
git add src/components/table src/app/components/LoadErrorState.tsx && git commit -m "feat(redesign): table-primitives en states in soft-SaaS-stijl, skeleton-loading"
```

---

### Task 7: Dashboard

**Files:**
- Modify: `src/app/dashboard/page.tsx`

- [ ] **Step 1: PageHeader aansluiten** boven de statgrid; bestaande losse kop/welkomstblok vervangen door:

```tsx
<PageHeader title="Dashboard" subtitle={`${maandLabel} · alles actueel`}>
  <Button variant="secondary" onClick={/* bestaande export/rapport-actie indien aanwezig */}>Rapport</Button>
  <Button onClick={() => setGiftFormOpen(true)}>+ Nieuwe donatie</Button>
</PageHeader>
```

(Exacte acties overnemen van wat er nu in de kop staat; niets nieuws verzinnen.)

- [ ] **Step 2: Statgrid.** "Totale donaties (maand)" krijgt `featured`; "Niet betaald deze maand" krijgt `tone="warn"`; overige StatCards default. Grid: `grid gap-4 sm:grid-cols-2 lg:grid-cols-4`.

- [ ] **Step 3: Grafiekkaart.** Wrapper van de Recharts-grafiek: `rounded-[14px] bg-card p-5 shadow-[var(--shadow)]`; lijn/area-kleur `var(--primary)` met fill-opacity ~0.12; gridlijnen `var(--border)`.

- [ ] **Step 4: Taakkaarten.** De blokken "Niet betaald" en "Ongematchte donaties" worden kaarten met actieknop; patroon:

```tsx
<div className="flex items-center gap-3 rounded-[14px] bg-card p-4 shadow-[var(--shadow)]">
  <div className="grid h-9 w-9 shrink-0 place-items-center rounded-full bg-[var(--warn-light)] text-[var(--warn)]">
    <AlertCircle size={16} />
  </div>
  <div className="min-w-0 flex-1">
    <p className="text-sm font-bold text-foreground">3 akten niet betaald · € 240</p>
    <p className="text-xs text-muted-foreground">Bekijk wie er nog openstaat</p>
  </div>
  <Button variant="secondary" size="sm" asChild>
    <Link href="/toezeggingen?filter=onbetaald">Bekijk</Link>
  </Button>
</div>
```

(Link-doelen: de bestaande filterroutes gebruiken; als er geen queryparam-filter bestaat, link naar de kale lijstpagina.)

- [ ] **Step 5: Placeholderblokken verwijderen.** De twee inline blokken "Ondernemer module komt binnenkort" (±r.541) en "Evenementen module komt binnenkort" (±r.563) volledig weghalen; de Binnenkort-groep in de nav dekt dit.

- [ ] **Step 6: Build + browsercheck** (desktop + 375px; grafiek herschaalt, taakkaarten klikken door).

- [ ] **Step 7: Commit**

```bash
git add src/app/dashboard/page.tsx && git commit -m "feat(redesign): dashboard — featured statcard, grafiekkaart, taakkaarten, placeholders weg"
```

---

### Task 8: Leden + ledendetail

**Files:**
- Modify: `src/app/members/page.tsx`
- Modify: `src/app/members/[id]/page.tsx`

- [ ] **Step 1: Lijstpagina.** PageHeader ("Leden", subtitel "‹n› leden & donateurs"); tabelwrapper `rounded-[14px] bg-card shadow-[var(--shadow)]`; rijhoogte ruim (`py-3.5`); naamcel:

```tsx
<div className="flex items-center gap-3">
  <span className="grid h-8 w-8 shrink-0 place-items-center rounded-full bg-[var(--accent-light)] text-[11px] font-bold text-primary">
    {initialen(member)}
  </span>
  <div className="min-w-0">
    <div className="truncate text-[13px] font-semibold text-foreground">{member.name}</div>
    <div className="truncate text-xs text-muted-foreground">{member.email ?? "geen e-mail"}</div>
  </div>
</div>
```

Status-badges: bestaande `bg-emerald-100 text-emerald-900`-classes vervangen door pills `rounded-full bg-[var(--accent-light)] px-2.5 py-0.5 text-xs font-semibold text-primary` (actief) en `bg-[var(--surface-zone)] text-muted-foreground` (inactief). Kolomkoppen: `text-[10px] font-semibold uppercase tracking-[0.12em] text-muted-foreground`. Bedragen: rechts, `font-semibold`. Mobiel: kolommen Type/e-mailsubregel verbergen met `hidden sm:table-cell`; naam/status/bedrag blijven.

- [ ] **Step 2: Detailpagina.** Kop met avatar (zoals naamcel maar `h-12 w-12 text-sm`), naam `text-xl font-bold`, status-pill ernaast; daaronder StatCards (grid 2-3 kolommen) en historie in `rounded-[14px] bg-card shadow-[var(--shadow)]`-kaarten. `font-serif`-restanten vervangen door `font-bold tracking-[-0.02em]`.

- [ ] **Step 3: Build + browsercheck** (lijst desktop/mobiel, detail, lege zoekresultaten).

- [ ] **Step 4: Commit**

```bash
git add src/app/members && git commit -m "feat(redesign): ledenlijst met avatars en pills, detailkop, ruime rijen"
```

---

### Task 9: Donaties

**Files:**
- Modify: `src/app/donations/page.tsx`

- [ ] **Step 1: PageHeader + tabelwrapper** zoals Task 8. Methode-kolom wordt chip:

```tsx
const methodeChip: Record<string, { label: string; Icon: LucideIcon }> = {
  cash: { label: "Contant", Icon: HandCoins },
  bank: { label: "Bank", Icon: Landmark },
  online: { label: "Online", Icon: Globe },
};
// in de cel:
<span className="inline-flex items-center gap-1.5 rounded-full bg-[var(--surface-zone)] px-2.5 py-0.5 text-xs font-semibold text-muted-foreground">
  <Icon size={12} /> {label}
</span>
```

(Exacte method-keys uit `src/app/lib/types.ts` aanhouden; ontbrekende methodes vallen terug op de ruwe string zonder icoon.) Bedragen rechts in `font-semibold text-primary`.

- [ ] **Step 2: Toast na opslaan.** In de submit-handler van de donatie-dialog: `toast.success("Donatie opgeslagen")`; submit-knop krijgt `disabled={saving}` + spinnertekst "Opslaan…" (bestaande saving-state gebruiken; als die ontbreekt, toevoegen).

- [ ] **Step 3: Build + browsercheck** (chips kloppen per methode; dubbelklik op opslaan maakt géén tweede donatie).

- [ ] **Step 4: Commit**

```bash
git add src/app/donations/page.tsx && git commit -m "feat(redesign): donaties — methode-chips, groene bedragen, toast + laadstatus"
```

---

### Task 10: Toezeggingen

**Files:**
- Modify: `src/app/toezeggingen/page.tsx`

- [ ] **Step 1: PageHeader + tabelwrapper** zoals Task 8.

- [ ] **Step 2: Voortgang + status.** Per rij (pledge of onbetaalde akte):

```tsx
<div className="flex items-center gap-2.5">
  <div className="h-1.5 flex-1 overflow-hidden rounded-full bg-[var(--accent-light)]">
    <div
      className="h-full rounded-full bg-primary"
      style={{ width: `${Math.min(100, (paid / total) * 100)}%` }}
    />
  </div>
  <span className="whitespace-nowrap text-xs font-semibold text-muted-foreground">
    € {fmt(paid)} / € {fmt(total)}
  </span>
</div>
```

Status-pills: Betaald `bg-[var(--accent-light)] text-primary`, Deels betaald idem met andere tekst, Open `bg-[var(--warn-light)] text-[var(--warn)]`. Bestaande statuslogica (deelbetalingen) niet wijzigen — alleen presentatie.

- [ ] **Step 3: Rij-acties.** "Markeer als betaald" als eerste item in het ⋯-menu; na succes `toast.success("Gemarkeerd als betaald")`.

- [ ] **Step 4: Build + browsercheck** (deelbetaling toont correcte balkbreedte; gift-agreement-rijen blijven niet-selecteerbaar zoals decision 2026-05-05 eist).

- [ ] **Step 5: Commit**

```bash
git add src/app/toezeggingen/page.tsx && git commit -m "feat(redesign): toezeggingen — voortgangsbalken, status-pills, toast"
```

---

### Task 11: Login

**Files:**
- Modify: `src/app/login/page.tsx`

- [ ] **Step 1: Restyle.** Pagina op `bg-[var(--surface-zone)]`; kaart `w-full max-w-sm rounded-[16px] bg-card p-8 shadow-[var(--shadow)]`; kop sans `text-xl font-bold` (serif weg); inputs/knop via de ui-basis (Task 5); foutmelding op `bg-[var(--error-light)] rounded-[10px] p-3 text-sm`.

- [ ] **Step 2: Build + browsercheck + commit**

```bash
npm run build && git add src/app/login/page.tsx && git commit -m "feat(redesign): login in soft-SaaS-stijl"
```

---

### Task 12: Eindverificatie

- [ ] **Step 1: Volledige runthrough** op dev-server: dashboard → leden → lid-detail → donaties (nieuwe donatie incl. toast) → toezeggingen (markeer betaald) → uitloggen → login. Op 1280px én 375px. Geen console-errors.
- [ ] **Step 2: States forceren:** lege organisatie-view (zoekterm zonder hits), offline-fout, laad-skeletons (netwerk throttlen).
- [ ] **Step 2b: Restjes uit reviews:** `ConfirmDeleteDialog.tsx` heeft nog hardcoded `rose-*`-kleuren → omzetten naar destructive/error-tokens. `/login` heeft nog paginatitel "Mini CRM" in de metadata → "Mosqon". Vier `rounded-lg`-meelifters visueel checken (gift selectable-cards, alert-dialog, PublicHeader, ThankYou).

- [ ] **Step 3: Serif-restjescheck:**

```bash
grep -rn "font-serif" src/app src/components --include="*.tsx" | grep -v "(marketing)"
```

Verwacht: geen treffers buiten bewust-buiten-scope bestanden (imports/onboarding/updates).

- [ ] **Step 4: Screenshots** van dashboard, leden en toezeggingen (desktop + mobiel) voor de gebruiker; `git status` + samenvattende diff tonen. Push doet de gebruiker zelf.

---

## Zelfreview (uitgevoerd bij schrijven)

- **Spec-dekking:** §2 tokens→Task 1; §3 shell→Task 4; §4 componenten→Tasks 2/3/5/6; §5 per scherm→Tasks 7-11; §6 UX-regels→verweven (mobiel T4/7-11, aria/reduced-motion T4/6, toasts T2/9/10, consistentie T5/6) + eindcheck T12; §7 volgorde→taakvolgorde. Dialogs incl. gift-modal: gedekt via Task 5 (dialog.tsx restyle werkt door in GiftFormDialog); geen aparte gift-taak nodig.
- **Placeholders:** geen TBD's; waar de executor bestaande logica moet overnemen staat dat expliciet ("bestaande acties overnemen", "statuslogica niet wijzigen").
- **Consistentie:** tokennamen (`--surface-zone`, `--radius-lg`, `--warn`) matchen tussen Task 1 en gebruik in Tasks 4-11; StatCard-props (`featured`, `tone`) uit Task 6 matchen gebruik in Task 7.
