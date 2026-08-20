# App-redesign: soft SaaS · design-spec

**Datum:** 2026-08-20
**Status:** ontwerp goedgekeurd in brainstorm (5 secties, visual companion), wacht op spec-review
**Scope-relatie:** geen nieuwe features; herontwerp van bestaande MVP-schermen (dashboard, leden, donaties, toezeggingen, dialogs, login). Valt onder UI/UX-verbetering van bestaand MVP-werk, geen `mvp-scope.md`-uitbreiding.

---

## 1. Doel en richting

De app oogt gedateerd op vier fronten (visuele stijl, shell/navigatie, interactiepatronen, states) en moet moderner en UX-proof. Gekozen richting: **soft SaaS** *(Notion/Mercury-gevoel: veel wit, zachte groentinten als vlakken in plaats van borders, grote radius, vriendelijke toon)*, **volledig DM Sans** (DM Serif verdwijnt uit de app en blijft exclusief voor de marketingsite) en **ruime, rustige tabellen**.

**Aanpak: fundament eerst.** Tokens en shell eerst, dan gedeelde componenten, dan per scherm verfijnen. Zo verschiet de hele app in één keer van kleur en blijft alles onderweg consistent.

**Voorwaarde vooraf:** branch `frontend/design` (5 commits modal-polish: witte dialog, overflow-fixes, Tailwind v4 padding-reset-fix) eerst mergen in de werkbranch; het redesign bouwt daarop voort.

## 2. Visuele taal (designtokens)

Alle waarden landen in `src/app/globals.css` op de bestaande shadcn-tokennamen; componenten blijven `bg-card`, `text-muted-foreground` enz. gebruiken. Richtwaarden (hex; bij implementatie omgezet naar oklch conform bestaande notatie):

| Rol | Waarde | Gebruik |
|---|---|---|
| Pagina | `#ffffff` | `--background`: paginavlak, wit |
| Zone | `#f6f8f7` | nieuw token `--surface-zone`: sidebar, inputs, secundaire knoppen |
| Tint | `#eef6f1` | `--accent-light` (nieuwe waarde): status-pills, actieve/hover-states, uitgelichte statcard |
| Primair | `#0c8a5f`-lijn | `--primary` blijft merkgroen (huidige waarde behouden voor merkcontinuïteit) |
| Tekst | `#17211d` | `--foreground`: groenzwart |
| Muted | `#5b6660` | `--muted-foreground` (AA-contrast op wit) |
| Fout-tint | `#fdf0ee` / terracotta `#b4552e` | zachte fout/waarschuwing-vlakken; geen alarm-rood voor bedragen |
| Warn-tint | `#fdf6e8` / `#a3862e` | "open/niet betaald"-signalen |

- **Diepte:** borders verdwijnen grotendeels; vlakken onderscheiden zich door tint + zachte schaduw. Rustend `0 1px 4px rgba(23,33,29,.08)`, actief/hover/dialog `0 4px 14px rgba(23,33,29,.12)` (in `--shadow`/`--shadow-lg`).
- **Radius:** kaarten 14px, inputs/knoppen 10px (`--radius` blijft 10px; kaarten via `rounded-[14px]`-token of `--radius-lg`), status-pills volledig rond.
- **Typografie (DM Sans overal):** paginatitel 20/700 (letterspacing −0.4), statcijfers 26/700 (−0.6), basistekst en tabelcellen **13/400** (bewust iets groter voor oudere bestuursleden), secundair 11/400, kolomkoppen 9/600 caps met letterspacing.
- Het huidige crème (`#f5f1ea`-familie) verdwijnt uit de app.
- **Niet aanraken:** de oude vars `--bg`, `--accent`, `--surface` in `globals.css` blijven bestaan voor `imports/[id]` en `onboarding` (CLAUDE.md-uitzondering) tot die pagina's apart gemigreerd worden.

## 3. Shell & navigatie

- **Sidebar** (±220px) op zone-tint, geen border-right. Bovenin de **echte organisatienaam** uit `useCurrentOrg` + Mosqon-merkje (vervangt hardcoded "Nieuwe Moskee"). Daaronder "+ Nieuwe donatie" als primaire knop (opent bestaande gift-/donatie-modal).
- **Nav-items:** radius 10px; actief = wit vlak + zachte schaduw + merkgroen icoon/tekst; hover = tint. Volgorde: Dashboard, Leden, Donaties, Toezeggingen.
- **"Binnenkort"-groep:** Ondernemers en Evenementen verhuizen naar een gedimde groep onderaan de nav (caps-kopje "Binnenkort"), klikbaar naar hun bestaande placeholder-pagina's. Geen dode hoofditems tussen de werkende pagina's.
- **Onderaan:** gebruiker (avatar-initiaal + naam) en uitloggen.
- **Vaste paginakop** voor elke pagina: links titel (20/700) + subregel (bijv. periode of aantallen), rechts contextacties. Vervangt de per-pagina koppen.
- **Mobiel (<768px):** sidebar wordt off-canvas paneel; slanke topbalk met hamburger, paginatitel en primaire actie. (Bestaat nu niet.)

## 4. Gedeelde componenten

- **Knoppen:** 40px hoog, radius 10px (bestaande toolbar-standaard wordt overal doorgetrokken). Primair merkgroen met subtiele groene schaduw; secundair zone-tint zonder border. **Pills (volledig rond) zijn exclusief voor statussen, nooit voor acties.** Iconknoppen minimaal 40×40 met aria-label.
- **StatCard:** per pagina één uitgelichte kaart op tint (belangrijkste cijfer, waarde in merkgroen), overige wit met schaduw. Waarschuwingscijfers in terracotta. Caps-label 8-9px, waarde 26/700, hint-regel 11px.
- **Tabel (ruime variant):** rijhoogte ±52px; naamkolom met avatar-initiaal in tintcirkel + subregel (e-mail); status als pill; bedragen rechts uitgelijnd, vet; rij-acties achter ⋯-menu (`RowActionsMenu`); kolomkoppen caps 9/600. Toolbar erboven: zoekveld en filters op zone-tint, primaire actie rechts, alles 40px. Bestaande primitives in `src/components/table/` worden gerestyled, niet vervangen.
- **Dialogs:** wit vlak radius 16 op dim (`rgba(23,33,29,.35)`), diepe schaduw; inputs op zone-tint met caps-labels; korte keuzes (zoals betaalmethode) als aanklikbare segmenten in plaats van dropdown; knoppen rechtsonder (annuleer secundair links van primair). Geldt ook voor `GiftFormDialog` en de confirm-dialogs. Op mobiel full-screen sheet.
- **States (overal identiek patroon):**
  - *Leeg:* icoon in tintcirkel + titel + één zin uitleg + primaire vervolgactie (`EmptyState`).
  - *Laden:* skeleton-balkjes met shimmer in plaats van "Laden..."-tekst (`LoadingState`); shimmer uit bij `prefers-reduced-motion`.
  - *Fout:* rustige melding (fout-tint icoon) + "Opnieuw"-knop (`LoadErrorState`).
- **Formulieren:** inputs 40px op zone-tint, focusring merkgroen, labels caps 9/600.

## 5. Per scherm

| Scherm | Wijzigingen |
|---|---|
| **Dashboard** | Nieuwe kopbalk; statgrid met één tintkaart (totale donaties deze maand); grafiek in witte kaart met zachte groene vulling; "Niet betaald" en "Ongematchte donaties" worden taakkaarten met actieknop (klik → gefilterde lijst); de twee inline "module komt binnenkort"-blokken vervallen (Binnenkort-groep in nav vangt dit af). |
| **Leden** | Nieuwe tabel + toolbar; detailpagina krijgt kop met avatar/naam/status, daaronder statcards en historie in kaarten. |
| **Donaties** | Zelfde tabelpatroon; methode als icoon-chip (contant/bank/online); "+ Nieuwe donatie" overal dezelfde primaire knop. |
| **Toezeggingen** | Zelfde patroon; voortgangsbalken op tint-track met merkgroene vulling en bedrag-notatie ("€ 300 / € 500"); status-pills (Open/Deels betaald/Betaald); "Markeer als betaald" als eerste rij-actie. Grootste pagina: eigen stap in het plan. |
| **Dialogs** | Alle dialogs over op sectie-4-dialogstijl, incl. gift-modal. |
| **Login** | Wit kaartje op zone-achtergrond, Mosqon-merk, 40px inputs/knop, sans-kop. |

**Buiten scope:** `imports/[id]`, `onboarding` (oude CSS-vars, aparte migratie later), `/updates`-pagina, dark mode.

## 6. UX-regels (gelden op elk scherm)

1. **Responsive:** ≥768px vaste sidebar; daaronder drawer + topbalk. Tabellen tonen op mobiel alleen kernkolommen (naam, status, bedrag); nooit horizontale scroll.
2. **Toegankelijkheid:** contrast AA; zichtbare merkgroene focusring; touch targets ≥40px; aria-labels op icon-knoppen; kleur nooit enige betekenisdrager (pills altijd met tekst); `prefers-reduced-motion` gerespecteerd.
3. **Microfeedback:** elke schrijfactie → korte toast-bevestiging via **sonner** (de shadcn-standaard; lichtgewicht, respecteert reduced-motion); submit-knoppen met laadstatus (spinner + disabled, voorkomt dubbele donaties); destructieve acties houden confirm-dialog + checkbox-bevestiging op financiële records.
4. **Consistentie:** pills = status, knoppen = actie; één primaire groene actie per scherm; bedragen/datums NL-formaat (€ 1.234,56 · 16 juli 2026); lege staten altijd met vervolgactie.

## 7. Technische aanpak (samenvatting voor het plan)

1. Merge `frontend/design` → werkbranch.
2. Tokens in `globals.css` (nieuwe waarden op bestaande namen + `--surface-zone`; oude `--bg`/`--accent`/`--surface` laten staan) + typografie-schaal.
3. Shell: `AppShell.tsx` (sidebar, org-naam, Binnenkort-groep, mobiel paneel) + nieuw gedeeld `PageHeader`-component.
4. Gedeelde componenten restylen: `src/components/table/*`, dialogs (`components/ui/dialog` + gebruikers), knop-varianten, states, toast-mechanisme (sonner).
5. Per scherm: dashboard → leden (+detail) → donaties → toezeggingen → login.
6. Verificatie per fase: `npm run build` groen + browsercontrole (desktop/mobiel, lege/laad/foutstaten geforceerd).

## 8. Openstaand

- NU-reconstructies in de brainstorm zijn op code gebaseerd; zodra de eigenaar weer kan inloggen (wachtwoord-reset via Supabase-dashboard) de echte schermen naast het ontwerp leggen als eindcontrole.
