# Roadmap

Geen datums, alleen volgorde. Drie kolommen: wat doen we **nu**, wat is **daarna** aan de beurt, wat parkeren we voor **later**.

**Bewerkregel:** items verschuiven alleen tussen kolommen na een bewuste keuze. Bij twijfel → discussie in `decisions.md` documenteren.

---

## 🔨 NOW (deze paar dagen)

Focus is gewijzigd op 2026-04-27: eerst een werkende publieke formulier-flow, dan pas datamodel-spec voor andere pijlers (zie `decisions.md`).

- [ ] **Standalone publiek `/gift`-formulier** (ANBI-overeenkomst, eenmalig + periodiek)
  → spec: `docs/superpowers/specs/2026-04-27-gift-formulier-design.md`
  → 3 sub-stappen:
    1. **Stap A:** Form werkend lokaal (5 stappen, handtekening-canvas, conditionele logica eenmalig/periodiek). ~1 dag.
    2. **Stap B:** Supabase-opslag in nieuwe tabel `gift_agreements` met publieke INSERT-policy. Bedankt-scherm met referentienummer. ~0.5 dag.
    3. **Stap C:** Resend-integratie — bevestigings-mail naar gever met samenvatting + referentienummer. ~0.5-1 dag.
  → **Niet in deze stap:** mail naar penningmeester, PDF-generatie, dashboard-integratie (volgen later).

---

## ⏭️ NEXT (MVP-bouw, ~2-3 weken full-time)

In deze volgorde — elk onderdeel krijgt eigen brainstorm → spec → plan → code-cyclus:

1. **Datamodel-spec** voor 3 nieuwe pijlers + relaties (was eerst NOW, nu hier — gift-flow ging voor)
   → tabellen voor `pledges` (toezeggingen), `sponsors` (ondernemers), `events`, `event_registrations`, `cash_receipts`. Plus relaties (lid ↔ donatie, lid ↔ toezegging, lid ↔ evenement-registratie). Plus `organization_id` op alles.
2. **Toezeggingen CRUD** + status (open/betaald/vervallen) + handmatige reminder-knop — *template van members-page*
3. **Ondernemers / sponsors CRUD** + sponsorbedrag-historie
4. **Evenementen CRUD** + interne registraties (welk lid komt)
5. **Cashgeld-formulier** voor vrijwilliger op telefoon — publieke route, hergebruikt `SignaturePad` component uit gift-flow
6. **ANBI-formulier uitbreiden** — mail naar penningmeester per inzending + PDF-bijlage (volgt op gift-flow MVP)
7. **Excel import** uitbouwen naar nieuwe entiteiten
7. **Excel export** voor leden, donaties, toezeggingen, ANBI-jaaroverzicht
8. **Member detail page** + donatie-historie per persoon
9. **Password reset** (Supabase Auth recovery flow)
10. **Dashboard met echte cijfers** (vervangt placeholder-cards)
11. **Basis-rapportages** — donaties per maand, toezeggingen-status, ledengroei
12. **Transactionele e-mail** — donatiebevestiging, password-reset, toezegging-reminder
13. **Bug-buffer + polish** — ~30% van totale tijd

**Definitie van "MVP klaar":** Nieuwe Moskee gebruikt alle pijlers ≥1 maand zonder workarounds.

---

## 📦 LATER (na MVP)

### SaaS-sprong (~1-2 weken, direct na MVP)
- Multi-tenant **activeren** — RLS-policies aanzetten op alle tabellen, end-to-end testen dat moskee X moskee Y's data niet ziet
- Signup-flow + onboarding *(eerste keer inloggen → moskee-naam, basis-instellingen, eerste import)*
- Stripe-integratie voor abonnementen
- Pay.nl-integratie voor iDEAL-donaties
- AVG-verwerkersovereenkomst (juridisch, niet code)
- **Moskee-info dynamisch maken (sweep)** — momenteel hardcoded in `giftAgreementEmail.ts`, `GiftForm.tsx` (overeenkomsttekst), `OrgFooterCard.tsx`. In één pass vervangen door lookups op `organizations`-rij van de inzending. Concrete subtaken:
  - Migratie 005: `organizations` uitbreiden met `legal_name`, `rsin`, `iban`, `contact_email` (allemaal `text`, NOT NULL met sensible defaults voor bestaande rijen)
  - `actions.ts` haalt `organizations`-rij op via `organization_id` voor de gever-mail
  - Mail-template krijgt `org` als parameter; vervang hardcoded "Nieuwe Moskee Enschede", "HDV Selimiye / HDV Anadolu", "805141200", "NL33 ABNA 0550 1441 96", "financien@enschedecamii.nl"
  - Gift-pagina (`overeenkomstTekst()` in `giftAgreement.ts`) gebruikt `org.legal_name` en `org.name`
  - `OrgFooterCard.tsx` accepteert `org` als prop ipv hardcoded waardes
  - `GIFT_FROM_EMAIL` dynamisch: `${org.name} <gift@m.mosqon.com>` met `Reply-To: org.contact_email`
- Wachtwoord-resetmail-deliverability (DNS, SPF, DKIM, DMARC) op `m.mosqon.com`
- Eerste betalende moskee onboarden + support-kanaal opzetten

### Post-SaaS (geparkeerd, niet vergeten)
- Audit log (wie deed wat, wanneer) — wordt verplicht zodra meerdere moskeeën erop zitten
- AVG-export-knoppen voor leden ("alles over mij")
- Geavanceerd rollen-/permissies-UI
- Automatische reminders via cron (vervangt handmatige knop)
- AI-hulp met **smalle scope** — bijv. "genereer ANBI-jaarrapport", "auto-categoriseer importbestand"
- Form builder *(eigen formulieren ontwerpen)* — alleen als meerdere moskeeën hierom vragen
- Geavanceerde rapportages / dashboards
- Bulk-acties (mass e-mail naar leden, bulk-update toezeggingen)
- Mobile-first redesign voor cashgeld-flow op telefoon

### Definitief NIET (zie `vision.md` en `mvp-scope.md`)
- Boekhouding / accounting
- Publieke website / CMS
- Publieke event-ticketing
- Gebedstijden / Quran / islamitische kalender
- E-mail marketing / nieuwsbrieven
- Multi-vestiging onder één account
- Native mobiele app voor leden
