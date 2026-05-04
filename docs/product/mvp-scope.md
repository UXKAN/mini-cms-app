# MVP-scope

**Doel van dit document:** in één oogopslag zien wat WEL en wat NIET in de eerste echte release zit. Als iets hier niet in staat, bouwen we het niet vóór de SaaS-sprong. Discussie? → herzie eerst dit document.

**Definitie van "MVP klaar":**
> De Nieuwe Moskee gebruikt alle onderstaande pijlers minimaal 1 maand zonder workarounds (geen Excel naast, geen briefjes naast, geen WhatsApp-lijstjes naast).

---

## ✅ WEL in MVP

### Kern (deels al af)
- **Members CRUD** — leden aanmaken, bekijken, aanpassen, verwijderen
- **Donations CRUD** — donaties registreren met bedrag, datum, donateur, doel
- **Dashboard met echte cijfers** — leden-aantal, donaties van deze maand/jaar, openstaande toezeggingen, recente activiteit. Vervangt de huidige placeholder-cards.

### Twee nieuwe pijlers (vervangen huidige placeholder-pagina's)
- **Toezeggingen CRUD** — bedrag, donateur, omschrijving, deadline, status (open / partial / paid / cancelled). Knop "stuur reminder" op detail-page (handmatig). Toont **gemengde lijst** van `pledges` (mondeling/email/event) én onbetaalde `gift_agreements` (eenmalige ANBI-akten waarvoor het geld nog niet binnen is) — type-badge maakt onderscheid. Matching naar `donations` via "→ Markeer als betaald".
- **Ondernemers / sponsors CRUD** — bedrijfsnaam, contactpersoon, sponsorbedrag-historie per jaar, status (actief / inactief).
- **Omschrijving-veld overal** — in `/donaties`, `/toezeggingen` en `/gift` (eenmalige) dezelfde label "Omschrijving". Bij /gift eenmalige + voldaan: omschrijving landt in zowel `gift_agreements.purpose` als `donations.notes`.

*(Evenementen CRUD + interne registraties verschoven naar SaaS-fase op 2026-05-03 — zie `decisions.md`.)*

### Financiële I/O
- **Excel-import** voor leden, donaties, toezeggingen (uitbouwen van bestaande imports-flow)
- **Excel-export** voor leden, donaties, toezeggingen
- **ANBI-jaaroverzicht** — exporteer alle donaties van een jaar in ANBI-conform formaat
- **ANBI-donatieformulier (digitaal)** — **fullscreen modal in dashboard** ("Formulier"-knop), eenmalig + periodiek, met handtekening en juridische akkoord-checkbox. Eerste versie: opslag in `gift_agreements` + bevestigingsmail aan gever (Resend). **Mail naar penningmeester, PDF-generatie en share-pattern (publieke link / organisatie-restricties / rechten) volgen later** (SaaS-fase). Standalone route `/gift` blijft voorlopig bestaan voor backward compatibility.

*(Cashgeld-formulier / kwitantie verschoven naar SaaS-fase op 2026-05-03 — zie `decisions.md`. Cash registreren blijft mogelijk via `/donaties` CRUD met `method='cash'`.)*

### Operationeel
- **Member detail page** — bewerken, donatie-historie van die persoon
- **Password reset** (open punt uit Phase 1B)
- **Basis-rapportages** — donaties per maand, toezeggingen-status, ledengroei
- **Transactionele e-mail** — gift-bevestiging aan gever (eerste implementatie via Resend), password-reset, donatiebevestiging, toezegging-reminder

### Architectureel onzichtbaar (geen UI, wel in DB)
- **`organization_id` op elke nieuwe tabel** — multi-tenant-ready *(voorbereid voor meerdere moskeeën in één app, nog niet geactiveerd)*
- **`role` veld op `organization_members`** — admin / bestuur / commissielid. Code respecteert het, maar UI is voor MVP nog niet gedifferentieerd: iedereen die ingelogd is, kan alles.

---

## ❌ NIET in MVP (expliciet uitgesloten, met reden)

| Item | Waarom uitgesloten | Wanneer wel? |
|---|---|---|
| **Form builder** (eigen formulieren ontwerpen) | Te open scope, kan zelf een product worden | Misschien LATER, na SaaS-sprong |
| **AI-hulp** (chatbot, auto-rapportage, etc.) | Te open scope, eerst basis solide | LATER, met **smalle** scope |
| **Stripe / Pay.nl** (online betalingen) | Hoort bij SaaS-sprong, niet bij admin-tool | SaaS-fase |
| **Goud als donatievorm** (gram + EUR-equivalent) | Verschoven 2026-05-04; vereist gram-kolom + ANBI-koers + jaaroverzicht-aanpassing. Workaround: `method='other'` + omschrijving | SaaS-fase |
| **Cashgeld-formulier** (mobile-first) | Verschoven 2026-05-03; cash via `/donaties` CRUD volstaat voor MVP | SaaS-fase |
| **Evenementen + registraties** | Verschoven 2026-05-03; geen interactie met kernpijlers | SaaS-fase |
| **Public-link `/gift`** met share-pattern | Onderdeel gift-modal-feature; permissie-systeem is SaaS-werk | SaaS-fase |
| **Signup / publieke onboarding** | Eerst eigen moskee, dan publiek | SaaS-fase |
| **Audit log** (wie deed wat wanneer) | Nice voor SaaS, niet voor één moskee | SaaS-fase |
| **AVG-export-knoppen voor leden** ("alles over mij") | Niet juridisch verplicht voor één moskee, wel voor SaaS | SaaS-fase |
| **Geavanceerd rollen-/permissies-UI** | DB ondersteunt het, UI komt later | SaaS-fase |
| **Automatische reminders (cron)** | Cron-setup + testen + rate-limiting = risico | NEXT, na MVP |
| **Native mobiele app voor leden** | Heel ander product, eigen team-werk | Geen plan |
| **Publieke event-ticketing** (Eventbrite-stijl) | Andere markt, andere UX | Geen plan |
| **Boekhouding / accounting** | Moneybird-werk; wij exporteren ernaartoe | Geen plan |
| **Gebedstijden / Quran / kalender** | Voor leden-apps, niet bestuur-tool | Geen plan |

---

## Open technische beslissingen (later, in spec-fase)

Niet voor scope-niveau, wel iets om te onthouden:

- **E-mail-provider:** Resend / Postmark / Supabase Auth — kiezen vóór we e-mail-feature bouwen
- **Handtekening-library:** voor ANBI-formulier (signature_pad / react-signature-canvas) — testen op risk vóór we 'm in critical path zetten
- **PDF-generatie:** server-side (puppeteer/react-pdf) of client-side — vóór ANBI + cashgeld-feature

Deze komen elk in een eigen `docs/superpowers/specs/` bestand.

---

## Hoe dit document gebruikt wordt

- Bij elk nieuw idee: "staat dit in WEL of NEE?" Niet allebei, niet "later toevoegen aan WEL".
- Bij scope-discussie: dit document wint. Wijzigen mag, maar bewust en met datum in `decisions.md`.
- Bij elke spec in `docs/superpowers/specs/`: verwijst expliciet naar welke MVP-scope-regel het invult.
