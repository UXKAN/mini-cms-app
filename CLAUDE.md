# CLAUDE.md — werkinstructies voor Claude Code

Dit bestand wordt elke sessie automatisch geladen. Lees het volledig voordat je iets doet.

---

## Wat is dit project?

Een Nederlandse SaaS voor moskee-administratie (leden, donaties, toezeggingen, ondernemers, evenementen, ANBI). Solo project, full-time gebouwd door een **vibe coder** met Claude Code als AI-collega.

**Verplichte leesvolgorde voor context:**
1. [`docs/product/vision.md`](docs/product/vision.md) — wie/waarom/wat-niet
2. [`docs/product/mvp-scope.md`](docs/product/mvp-scope.md) — exacte WEL/NEE-lijst voor v1
3. [`docs/product/roadmap.md`](docs/product/roadmap.md) — Now/Next/Later
4. [`docs/product/decisions.md`](docs/product/decisions.md) — waarom we eerdere keuzes maakten

Bij "waarom"-vragen van de gebruiker: kijk eerst in `decisions.md`.

---

## Werkregels (niet-onderhandelbaar)

1. **Stel altijd eerst vragen voordat je bouwt.** Geen aannames over scope, datamodel of UX. Vibe coder = jij bent de tech-expert, hij bedenkt het product. Help hem helder krijgen wat hij wil voor je code schrijft.
2. **Leg techniek uit tussen haakjes.** Voorbeeld: "We zetten een RLS-policy *(database-regel die zorgt dat moskee X moskee Y's data niet ziet)* op de toezeggingen-tabel."
3. **Geen nieuwe features zonder spec.** Iedere nieuwe feature/pijler krijgt eerst een spec-document in `docs/superpowers/specs/`. Geen direct doorlopen van idee → code.
4. **Geen scope uitbreiding zonder discussie.** Als iets niet in `mvp-scope.md` staat, bouw het niet. Bij twijfel: vraag eerst, log de keuze in `decisions.md`.
5. **Ideeën gaan naar `docs/product/ideas.md`**, niet direct in code. Eén regel per idee, brain dump.
6. **Werk in fases per feature:** brainstorm → spec → plan → code. Niet mengen.
7. **Voor elke beslissing met blijvend effect:** schrijf één entry in `decisions.md` met datum, waarom, en herzieningstrigger.

---

## Tech stack (huidige stand)

- **Next.js 16.2.4** (App Router) + React 19 + TypeScript
- **Tailwind v4** (`@import "tailwindcss"` syntax — NIET de v3 PostCSS-config)
- **shadcn/ui** components: Button, Input, Select, Card, Badge, Dialog, Table, Separator, Avatar, Label
- **lucide-react** v1.11.0 voor icons
- **DM Serif Display + DM Sans** via `next/font/google` in `layout.tsx`
- **Supabase** voor auth + database + storage
- **Vercel** deployment
- **`src/lib/utils.ts`** — shadcn `cn()` utility

Database (Supabase, in `supabase/migrations/`):
- `001_members.sql`, `002_donations.sql`, `003_organizations_and_member_fields.sql`
- Bestaande tabellen: `members`, `donations`, `imports`, `import_rows`, `organizations`, `organization_members`

---

## Code-conventies

- **UI is Nederlands.** Alle labels, buttons, foutmeldingen in het Nederlands.
- **shadcn-componenten gebruiken**, geen eigen `Modal` of custom buttons (de oude `Modal.tsx` is verwijderd, gebruik `Dialog`).
- **Multi-tenant-ready code:** elke nieuwe tabel krijgt `organization_id`. Elke query filtert op de huidige moskee, ook al is die hardcoded. Geen "Nieuwe Moskee" string in code.
- **Rollen:** `admin` / `board` / `committee` op `organization_members`. Code mag het uitlezen, maar UI-permissies komen pas in SaaS-fase. Voor MVP: iedereen ingelogd kan alles.
- **Geen comments** die de code beschrijven (de namen doen dat). Alleen comments voor het *waarom* bij niet-evidente keuzes.
- **Verifieer voor je "klaar" zegt:** `npm run build` moet groen zijn, en bij UI-werk moet je het in de browser hebben gezien.

---

## CSS-uitzonderingen (niet aanraken)

`imports/[id]/page.tsx` en `onboarding/page.tsx` gebruiken nog oude CSS-variabelen: `var(--bg)`, `var(--accent)`, `var(--surface)`. Deze vars zijn **bewust bewaard** in `globals.css`. Niet verwijderen tot deze pagina's gemigreerd zijn naar shadcn/Tailwind-tokens.

---

## Wanneer wel/niet committen

- **Nooit committen tenzij de gebruiker erom vraagt.** Toon altijd eerst `git status` en `git diff` en vraag bevestiging.
- **Push naar remote** vereist gebruiker zelf (SSH key niet in Claude Code-sessie). Je kunt commits voorbereiden, push laat je aan hem.

---

## Specs en plans (voor implementatie)

- **Specs** (wat we gaan bouwen): `docs/superpowers/specs/YYYY-MM-DD-<onderwerp>-design.md`
- **Plans** (in welke stappen): `docs/superpowers/plans/YYYY-MM-DD-<onderwerp>.md`

Bij elk plan: verwijs naar de regel in `mvp-scope.md` die dit invult. Geen orphaned plans.

---

## Bij twijfel

- Niet zeker over scope? → `mvp-scope.md`
- Niet zeker waarom iets zo is? → `decisions.md`
- Nieuwe gedachte van gebruiker? → eerst naar `ideas.md`, niet bouwen
- Iets dat niet past in een bestaand bestand? → vragen aan de gebruiker
