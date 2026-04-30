# CLAUDE.md — werkinstructies voor Claude Code

Dit bestand wordt elke sessie automatisch geladen. Lees het volledig voordat je iets doet.

---

## Wat is dit project?

Een Nederlandse SaaS voor moskee-administratie, met in de basis leden, donaties en toezeggingen. Later mogelijk uitgebreid met ondernemers, evenementen en ANBI-gerelateerde functies. Solo project, full-time gebouwd door een **product/UX-Designer** met Claude Code als AI-collega.

**Verplichte leesvolgorde voor context:**
1. [`docs/product/vision.md`](docs/product/vision.md) — wie/waarom/wat-niet
2. [`docs/product/mvp-scope.md`](docs/product/mvp-scope.md) — exacte WEL/NEE-lijst voor v1
3. [`docs/product/roadmap.md`](docs/product/roadmap.md) — Now/Next/Later
4. [`docs/product/decisions.md`](docs/product/decisions.md) — waarom we eerdere keuzes maakten

Bij "waarom"-vragen van de gebruiker: kijk eerst in `decisions.md`.

---

## Werkregels (niet-onderhandelbaar)

1. **Stel eerst vragen als scope, datamodel, UX-flow** of technische aanpak onduidelijk is. Geen aannames over grote keuzes. Bij kleine, duidelijke wijzigingen mag je een kort plan geven en daarna uitvoeren na bevestiging.
2. **Leg techniek uit tussen haakjes.** Voorbeeld: "We zetten een RLS-policy *(database-regel die zorgt dat moskee X moskee Y's data niet ziet)* op de toezeggingen-tabel."
3. **Geen nieuwe features of structurele wijzigingen zonder spec**. Kleine bugfixes, copy changes en UI-polish hebben geen aparte spec nodig, maar wel een korte uitleg vooraf.
4. **Geen scope uitbreiding zonder discussie.** Als iets niet in `mvp-scope.md` staat, bouw het niet. Bij twijfel: vraag eerst, log de keuze in `decisions.md`.
5. **Ideeën gaan naar `docs/product/ideas.md`**, niet direct in code. Eén regel per idee, brain dump.
6. **Werk in fases per feature:** brainstorm → spec → plan → code → test → review. Niet mengen.
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
- **Verifieer voor je "klaar" zegt:** `npm run build` moet groen zijn, en bij UI-werk moet je het in de browser hebben gezien. Gebruik daarnaast npm run lint of npm run typecheck als deze scripts beschikbaar zijn in package.json.

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

## Manier van samenwerken
De gebruiker is product/UX-gedreven en gebruikt Claude Code als technische AI-collega.

Werk niet als simpele code-uitvoerder. Denk actief mee, maar neem geen grote product- of scopebeslissingen zonder overleg.

Bij elke taak:
1. Lees eerst de relevante context.
2. Vat kort samen wat je begrijpt.
3. Geef een klein plan.
4. Wacht op akkoord voordat je code wijzigt, behalve bij expliciete kleine tekst- of stylingaanpassingen.
5. Werk in kleine stappen.
6. Controleer met build/lint waar relevant.
7. Sluit af met wat is aangepast, welke bestanden geraakt zijn en wat de gebruiker handmatig moet testen.

---

## Externe services en integraties

Voor Vercel, Supabase, Resend, Cloud86 (DNS) en alle externe services die we later toevoegen (bijv. Stripe), is Claude **proactief** verantwoordelijk. De gebruiker hoeft niet handmatig uit te zoeken welke stappen nodig zijn.

**Bij integratie-werk:**

1. **Identificeer wat nodig is.** Welke account, welke API-keys, welke env vars, welke DNS-records, welke webhooks. Vraag het zo nodig aan de gebruiker, maar weet eerst wat er ontbreekt.
2. **Controleer huidige instellingen** als er iets misgaat. Vraag logs op, lees env vars uit, check dashboards. Niet aannemen dat het wel goed staat — verifieer.
3. **Pas projectbestanden zelf aan** waar dat kan: env-var-namen documenteren in `docs/product/integrations.md`, code-paden aanpassen, configuratie via CLI.
4. **Geef duidelijke commands** voor stappen die de gebruiker zelf moet doen (browser-login, secret-paste in dashboard, DNS-record bij domeinprovider).
5. **Verifieer end-to-end:** env vars set → redeploy → log-check. Niet "klaar" zeggen op basis van het feit dat een command slaagde.
6. **Geen secrets in de codebase of in markdown.** Alleen variabele-namen + waar ze ingesteld moeten zijn. Waarden blijven in dashboards en `.env.local`.
7. **Bij twijfel of bij destructieve acties** (DNS-wijziging, env var rm, redeploy met breaking change): leg eerst uit wat je gaat doen, vraag bevestiging, dan pas uitvoeren.

**Documentatie:** Welke env-vars per service nodig zijn en waar ze ingesteld moeten staan, hoort in [`docs/product/integrations.md`](docs/product/integrations.md). Lees dat bestand voor je aan integratie-werk begint.

**CLI-toegang voor Claude (huidige stand):**
- **Vercel:** `npx vercel@52.2.1` (project gelinkt in `.vercel/`, ingelogd als `uxkan`). Pin op v52 — v53.0.1 is broken op npm.
- **Supabase:** geen CLI-toegang — dashboard-instructies geven aan de gebruiker.
- **Resend:** geen CLI-toegang — dashboard-instructies geven.
- **Cloud86 (DNS):** geen toegang — gebruiker doet handmatig in [my.cloud86.io](https://my.cloud86.io).

---

## Nieuwe sessies en context

Bij een nieuwe Claude Code sessie:
1. Lees dit bestand volledig.
2. Volg de verplichte leesvolgorde.
3. Lees alleen specs/plans die relevant zijn voor de huidige taak.
4. Vraag de gebruiker om de huidige taak in één zin te bevestigen als de context onduidelijk is.

Lees niet automatisch alle oude specs en plans. Dat geeft te veel ruis.

---

## UX en designregels

- Houd gebruikers zoveel mogelijk in context.
- Gebruik dialogs/modals voor acties vanuit het dashboard wanneer dat logisch is.
- Lege staten moeten altijd uitleg geven én een duidelijke volgende actie tonen.
- Vermijd losse paginawissels voor kleine taken.
- Houd dashboardpagina’s rustig, overzichtelijk en Nederlands.
- Gebruik bestaande shadcn-componenten en projecttokens.
- Bij UI-werk: controleer spacing, alignment, hiërarchie, responsive gedrag en lege staten.

---

Maak onderscheid tussen:
- Feature: eerst spec en plan
- Bugfix: korte analyse en fix
- UI-polish: korte uitleg en kleine wijziging
- Idee: alleen vastleggen in ideas.md, niet bouwen

---

## Bij twijfel

- Niet zeker over scope? → `mvp-scope.md`
- Niet zeker waarom iets zo is? → `decisions.md`
- Nieuwe gedachte van gebruiker? → eerst naar `ideas.md`, niet bouwen
- Iets dat niet past in een bestaand bestand? → vragen aan de gebruiker
