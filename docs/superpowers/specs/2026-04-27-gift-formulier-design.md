# Spec: Standalone publiek gift-formulier `/gift`

**Vervult:** `mvp-scope.md` → "ANBI-donatieformulier (digitaal)" + "Cashgeld-formulier" (deelt `SignaturePad`).
**Beslissingen waarop deze spec rust:** `decisions.md` 2026-04-27 entries over standalone formulier-flow, Resend, react-signature-canvas, Bolt-vrij-interpreteren.

---

## Doel

Een publieke route `/gift` waar bezoekers (zonder account) een ANBI-conforme overeenkomst voor eenmalige of periodieke gift kunnen invullen, digitaal ondertekenen, en versturen. Inzending wordt opgeslagen in Supabase. Gever ontvangt een bevestigingsmail met referentienummer + samenvatting.

**Bewust uit deze spec:**
- Mail naar penningmeester (volgt in NEXT)
- PDF-generatie van overeenkomst (volgt in NEXT)
- Dashboard-integratie (volgt na MVP)
- Honeypot/spam-preventie (volgt indien spam optreedt)

---

## Bron en referentie

Visuele referentie: `Overeenkomst Periodieke Gift.html` (Bolt.new-export, lokaal). Bekeken via preview-browser. Vrij geïnterpreteerd met jullie shadcn + Tailwind-tokens.

---

## Route en navigatie

- URL: **`/gift`**
- Publiek toegankelijk (geen middleware, geen login)
- Niet zichtbaar in `AppShell.tsx` sidebar (sidebar is alleen voor admin-routes)
- Eigen layout (geen sidebar, geen admin-header) — minimale header met alleen logo + moskee-naam

---

## Pagina-opbouw (single page, scrollable, 5 secties)

### Header (publiek)
- Shield-logo (zelfde uit `AppShell`) + "Nieuwe Moskee Enschede" + subtitle "HDV Selimiye / HDV Anadolu · ANBI"
- Geen email/uitlog-knop (verschilt van Bolt — publieke route heeft geen ingelogd-context)

### Hero
- Heading: "Overeenkomst" (zwart, DM Serif Display) + "Periodieke Gift" (groen #1a8c6e, DM Serif Display)
- *Note:* heading-tekst kan dynamisch zijn na keuze type gift in stap 2 — maar voor MVP eerst statisch "Periodieke Gift" tonen, na keuze update naar "Eenmalige Gift" indien dat type gekozen is.
- Subtitel: "Dit formulier legt een bindende schenkingsovereenkomst vast. Na ondertekening ontvangt u een bevestiging per e-mail met uw referentienummer."
- *Note:* Bolt zegt "PDF-kopie" — wij zeggen voor MVP **niet** PDF, alleen samenvatting. Aanpassen.

### Sectie 1 — Gegevens schenker
| Veld | Type | Verplicht | Validatie |
|---|---|---|---|
| Voor- en achternaam | text | ✓ | min 2 tekens |
| Geboortedatum | date | ✓ | < vandaag, > 1900-01-01 |
| Telefoonnummer | tel | ✓ | basis NL/internationaal patroon |
| Adres | text | ✓ | min 5 tekens |
| Postcode en woonplaats | text | ✓ | min 7 tekens |
| Land | select | ✓ | NL / B / D / TR / MA / Anders. Default: NL |
| E-mailadres | email | ✓ | valid email pattern |

### Sectie 2 — Type gift
- Radio: **Periodieke gift** (default, met badge "Min. 5 jaar — aftrekbaar voor de inkomstenbelasting")
- Radio: **Eenmalige gift** (met badge "Eenmalige bijdrage")

**Conditioneel:**
- Periodieke → toon: "Bedrag per maand (€)" + "Startdatum"
- Eenmalig → toon: "Bedrag (€)"

| Veld | Type | Verplicht (cond.) | Validatie |
|---|---|---|---|
| Bedrag per maand | number | als periodiek | > 0 |
| Startdatum | date | als periodiek | ≥ vandaag |
| Bedrag | number | als eenmalig | > 0 |

### Sectie 3 — Overeenkomsttekst + akkoord

**Tekst (conditioneel op type):**

*Voor periodiek:*
> "Ik verklaar hierbij dat ik een periodieke gift doe aan HDV Selimiye / HDV Anadolu ten behoeve van de Nieuwe Moskee Enschede. Ik verbind mij om dit bedrag gedurende minimaal vijf (5) jaar te schenken, in gelijke periodieke termijnen. Deze gift eindigt uiterlijk bij het overlijden van de schenker. Deze overeenkomst geldt als schriftelijke vastlegging van een periodieke gift zoals bedoeld voor ANBI-instellingen."

*Voor eenmalig:*
> "Ik verklaar hierbij dat ik een eenmalige gift doe aan HDV Selimiye / HDV Anadolu ten behoeve van de Nieuwe Moskee Enschede. Deze overeenkomst dient als bevestiging van mijn donatie."

**Verplicht:** checkbox "Ik ga akkoord met deze overeenkomst"

### Sectie 4 — Betaalgegevens
| Veld | Type | Verplicht | Validatie |
|---|---|---|---|
| IBAN | text | ✓ | basis IBAN-pattern (kan via `iban-ts` library of regex). Voor MVP: lengtecheck + auto-uppercase + spaties strip |
| Naam rekeninghouder | text | ✓ | min 2 tekens |

### Sectie 5 — Digitale ondertekening
| Veld | Type | Verplicht | Validatie |
|---|---|---|---|
| Plaats | text | ✓ | min 2 tekens |
| Datum | date | ✓ | default: vandaag |
| Volledige naam | text | ✓ | min 2 tekens (mag verschillen van schenker, voor partner-ondertekening) |
| Handtekening | canvas | ✓ | niet-leeg (`react-signature-canvas isEmpty()` check) |

Knop "Wissen" naast handtekening om opnieuw te tekenen.

### Submit-blok
- Footer-card: "HDV Selimiye / HDV Anadolu" + "RSIN: 805141200" + "NL33 ABNA 0550 1441 96" (rekeningnummer organisatie)
- Knop full-width groen: "Overeenkomst ondertekenen en indienen →"
- Sub-tekst onder knop: "Na het indienen ontvangt u een bevestiging per e-mail."

### Bedankt-scherm (na succesvolle submit)
- Vervangt het hele formulier
- Iconen: groen vinkje
- Heading: "Bedankt voor uw gift"
- Tekst: "Uw gift-overeenkomst is geregistreerd. Uw referentienummer is: **`#ABC123`**. Bewaar dit nummer. U ontvangt binnen enkele minuten een bevestigingsmail op `<email>`."
- Knop: "Nieuw formulier invullen" (reset state, terug naar stap 1)

---

## Datamodel

### Migratie: `supabase/migrations/004_gift_agreements.sql`

```sql
create table if not exists public.gift_agreements (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid references public.organizations(id) on delete cascade,
  reference_code text generated always as (upper(substring(id::text from 1 for 6))) stored,

  type text not null check (type in ('periodieke', 'eenmalige')),

  schenker_naam text not null,
  schenker_geboortedatum date not null,
  schenker_telefoon text not null,
  schenker_adres text not null,
  schenker_postcode_woonplaats text not null,
  schenker_land text not null,
  schenker_email text not null,

  bedrag_per_maand numeric(10,2) check (bedrag_per_maand is null or bedrag_per_maand > 0),
  startdatum date,
  bedrag_eenmalig numeric(10,2) check (bedrag_eenmalig is null or bedrag_eenmalig > 0),

  akkoord_overeenkomst boolean not null default false,
  akkoord_at timestamptz,

  iban text not null,
  rekeninghouder text not null,

  ondertekening_plaats text not null,
  ondertekening_datum date not null,
  ondertekening_naam text not null,
  ondertekening_handtekening_png text not null,

  created_at timestamptz not null default now()
);

create index gift_agreements_organization_id_idx on public.gift_agreements(organization_id);
create index gift_agreements_created_at_idx on public.gift_agreements(created_at desc);
create index gift_agreements_email_idx on public.gift_agreements(schenker_email);

alter table public.gift_agreements enable row level security;

create policy "anyone can submit a gift agreement"
  on public.gift_agreements for insert
  to anon, authenticated
  with check (akkoord_overeenkomst = true);

create policy "authenticated users can read gift agreements"
  on public.gift_agreements for select
  to authenticated
  using (true);
```

**Toelichtingen voor vibe coder:**
- `reference_code` is automatisch eerste 6 tekens van id, hoofdletters → "A1B2C3" *(generated column = automatisch berekend bij insert)*
- `with check (akkoord_overeenkomst = true)` → publieke INSERT alleen als checkbox aangevinkt is
- Alleen ingelogde users (penningmeester via Supabase Studio) kunnen SELECT-en — publieke bezoeker kan na submit niets meer terugzien
- `organization_id` is voorbereid voor multi-tenant maar voor MVP hardcoded op de bestaande "Nieuwe Moskee" record

---

## File-structuur

```
src/app/gift/
├── page.tsx                  # server component, render <GiftForm /> + minimale header
├── GiftForm.tsx              # client component met alle 5 stappen
├── ThankYou.tsx              # bedankt-scherm na succesvolle submit
├── actions.ts                # Next.js Server Action voor submit + Resend
└── _components/
    ├── PublicHeader.tsx      # logo + moskee-naam, geen sidebar
    └── OrgFooterCard.tsx     # RSIN + IBAN-block onderaan

src/components/
└── SignaturePad.tsx          # herbruikbare canvas-wrapper rond react-signature-canvas

src/lib/
├── giftAgreement.ts          # types + Zod-schema + insert helper
└── supabaseClient.ts         # nakijken of bestaat, anders nieuw (browser + server clients)

supabase/migrations/
└── 004_gift_agreements.sql   # zie boven

env vars (in .env.local, NIET committen):
- NEXT_PUBLIC_SUPABASE_URL (bestaat al)
- NEXT_PUBLIC_SUPABASE_ANON_KEY (bestaat al)
- RESEND_API_KEY (nieuw, alleen server-side)
- GIFT_FROM_EMAIL (nieuw, bv. "gift@nieuwemoskee.nl")
```

---

## Validatie en submit-flow

1. **Client-side:** Zod-schema valideert alle velden bij elke wijziging. Submit-knop disabled tot alle verplichte velden + checkbox + handtekening voldoen.
2. **Server-side (in `actions.ts`):** zelfde Zod-schema valideert opnieuw (verdediging tegen omzeiling).
3. **Insert:** Server Action voegt record toe via Supabase service-role of anon-client (anon werkt door RLS-policy).
4. **Mail:** Resend stuurt bevestigingsmail met:
   - Subject: `"Bevestiging gift-overeenkomst — referentie #ABC123"`
   - Body (HTML): dankwoord + samenvatting van alle ingevulde velden + referentienummer + "Bewaar deze mail."
   - From: `GIFT_FROM_EMAIL`
   - To: `schenker_email`
5. **Response naar client:** referentienummer → toon `<ThankYou />`.

**Foutafhandeling:**
- Insert-fout → toast "Er ging iets mis bij het opslaan. Probeer het opnieuw of neem contact op." (error gelogd in console)
- Mail-fout NA succesvolle insert → record blijft, toon waarschuwing "Inzending opgeslagen, maar bevestigingsmail kon niet verstuurd worden. Bewaar uw referentienummer."

---

## Dependencies om toe te voegen

```json
{
  "react-signature-canvas": "^1.0.6",
  "zod": "^3.23.8",
  "resend": "^4.0.0"
}
```

`@types/react-signature-canvas` als dev-dep.

---

## Verificatie

**Stap A klaar:**
- Bezoek `/gift` lokaal → formulier rendert in 5 secties
- Type gift wisselen → bedrag-velden + overeenkomsttekst veranderen
- Handtekening kan getekend en gewist worden, ook op mobiel viewport (preview-browser resize naar mobile)
- Submit zonder velden → submit-knop disabled
- Submit met alle velden → bedankt-scherm met fake referentienummer
- `npm run build` is groen

**Stap B klaar:**
- Migratie `004_gift_agreements.sql` toegepast (handmatig in Supabase SQL editor)
- Submit op `/gift` → record verschijnt in Supabase Studio → tabel `gift_agreements`
- Bedankt-scherm toont referentienummer dat klopt met `reference_code` in DB
- RLS-test: anon kan INSERT, anon kan NIET SELECT; authenticated kan beide

**Stap C klaar:**
- Resend account aangemaakt door gebruiker, API-key in `.env.local`
- Submit met eigen e-mail → mail komt binnen op echte mailbox
- Mail bevat alle ingevulde velden + referentienummer in onderwerp én body

---

## Out-of-scope (expliciet)

| Item | Wanneer wel |
|---|---|
| Mail naar penningmeester per inzending | NEXT — direct na MVP gift-flow |
| PDF-generatie + bijlage in mails | NEXT — direct na mail-naar-penningmeester |
| Honeypot tegen spam | Indien spam optreedt na publiek live |
| Rate-limiting per IP | Indien nodig (Vercel Edge Middleware) |
| Captcha | Pas als rate-limiting onvoldoende blijkt |
| Dashboard-view voor penningmeester | Na MVP-pijlers (toezeggingen/ondernemers/evenementen) |
| Wijzigen of intrekken van een overeenkomst door gever | Dit is een juridisch ondertekend document — bij correctie volledig nieuwe inzending |
| Partner-ondertekening (mede-schenker) | LATER — Bolt heeft het ook niet expliciet, maar ANBI-officieel kent het wel |
| BSN als veld | Bewust niet — BSN-vraag is gevoelig en niet vereist voor schenkingsovereenkomst (wel voor BD-aangifte zelf, daar zorgt schenker voor) |
