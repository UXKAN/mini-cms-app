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

1. **Datamodel-spec** voor 2 nieuwe pijlers + relaties (was eerst NOW, nu hier — gift-flow ging voor)
   → tabellen voor `pledges` (toezeggingen), `sponsors` (ondernemers). Plus relaties (lid ↔ donatie, lid ↔ toezegging). Plus `organization_id` op alles.
   *(Events-tabellen zijn op 2026-05-03 verschoven naar SaaS-fase; `cash_receipts` vervalt — handtekening + foto blijven kolommen op `donations`.)*
2. **Toezeggingen CRUD** + status (open/partial/paid/cancelled) + handmatige reminder-knop — *template van members-page*. Gemengde lijst: pledges + onbetaalde gift_agreements. Matching-actie ("Markeer als betaald") creëert donation. Omschrijving-veld zichtbaar.
3. **Ondernemers / sponsors CRUD** + sponsorbedrag-historie
4. **Gift-modal-pivot** — "Formulier"-knop in dashboard opent fullscreen modal; standalone route blijft. Eerst eigen UX-spec.
5. **ANBI-formulier uitbreiden** — mail naar penningmeester per inzending + PDF-bijlage (volgt op gift-flow MVP)
6. **Excel import** uitbouwen naar nieuwe entiteiten
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
- **Goud als donatievorm** — verschoven van MVP-discussie op 2026-05-04; nieuwe `method='gold'` waarde, `donations.amount_grams numeric` kolom, gram-input in /gift én /donaties CRUD, EUR-koers-keuze voor ANBI-jaaroverzicht
- **Cashgeld-formulier** (mobile-first, vrijwilliger op telefoon) — verschoven van MVP op 2026-05-03; hergebruikt `SignaturePad` uit gift-flow, schrijft naar `donations` met `method='cash'`
- **`/evenementen` + interne registraties** — verschoven van MVP op 2026-05-03; tabellen `events` en `event_registrations`, CRUD + leden-koppeling
- **Gift-modal share-pattern** — publieke link genereren, organisatie-/domein-restricties, rechten view/fill/manage
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

#### Site-beloftes, nog in te plannen (bron: marketingsite 2026-07)

De marketingsite *(branch `claude/admiring-grothendieck-ac213e`)* toont bewust de volledige visie. Deze beloftes stonden nog nergens in de planning en zijn hier vastgelegd zodat de roadmap dekt wat de site zegt (zie `decisions.md` 2026-07-16):

- **Mollie-koppeling** *(Hoe-het-werkt stap 3)* — naast Stripe en Pay.nl
- **Boekhoudprogramma-kóppeling** *(Hoe-het-werkt stap 3)* — verder dan de huidige "wij exporteren ernaartoe"-lijn; scope bepalen vóór bouwen
- **Bankkoppeling: afschriften automatisch inlezen** *(prijstabel tier 3)* — datamodel heeft alleen een MT940-dedup-index
- **Automatische betaal-matching** *(prijstabel tier 3 + Functies)* — matching-kolommen bestaan (migratie 008), de automatiek nog niet; matching is nu handmatig "Markeer als betaald"
- **Automatische incasso voor periodieke giften** *(prijstabel tier 3)*
- **iDEAL-betaallinks per toezegging/contributie** *(prijstabel tier 3)* — concretisering van de Pay.nl-integratie
- **Eenmalige veilige vrijwilligerslinks** met inzicht wie wat ophaalde *(Hoe-het-werkt stap 5)* — raakt aan cashgeld-formulier + share-pattern, maar eenmalige links + attributie is eigen werk
- **Turkse en Arabische versie** *(FAQ + footer: "in voorbereiding")* — i18n-aanpak nog volledig te bepalen
- **Contributie-beheer** *(Compleet-tier)* — meer dan het huidige maandbedrag-veld op leden: inning, status, herinneringen

*Timing-mismatches, al wél gepland maar de site belooft ze eerder of breder: rollen & rechten-UI (site: Compleet-tier; planning: Post-SaaS), Mosqon AI als algemene vraagbaak (planning: LATER, smalle scope), automatische reminders (tier 3; planning: Post-SaaS cron), evenementen (Compleet-tier; planning: SaaS-fase), publieke /gift-flow (site suggereert publiek; staat bewust achter login, decision 2026-05-02). Bewust níét opgenomen: collecte-QR en publiek cijfers delen/casten op schermen.*

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
