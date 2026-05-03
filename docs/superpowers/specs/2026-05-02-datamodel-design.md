# Spec: Datamodel v2 — formulier-naar-dashboard zonder dubbele telling

**Versie:** v2 (2026-05-02). Vervangt v1.
**Vervult:** `roadmap.md` → NEXT punt 1 — "Datamodel-spec voor 3 nieuwe pijlers + relaties".
**Beslissingen waarop deze spec rust:**
- `decisions.md` 2026-04-27 — *C-ready code in fase A* (multi-tenant via `organization_id`).
- `decisions.md` 2026-04-27 — *Cashgeld-formulier IN MVP*.
- `decisions.md` 2026-04-29 — *Moskee-info hardcoded tot SaaS-sprong*.
- `decisions.md` 2026-05-02 — */gift tijdelijk achter login tegen spam*.
- Plan: `~/.claude/plans/ik-wil-dat-je-foamy-hedgehog.md` — datamodel v2 (deze spec).

---

## Doel

Eén consistent datamodel voor de pijlers **leden, donaties, toezeggingen, ANBI-overeenkomsten en imports** — multi-tenant by default, met expliciete matching-relaties tussen toezeggingen en de daadwerkelijke betalingen die binnenkomen. Dashboard mag bedragen niet dubbel tellen.

In één zin: *een formulier-inzending is niet automatisch ontvangen geld. `donations` is de enige bron voor "ontvangen", `pledges`/`gift_agreements` zijn beloftes.*

**Bewust uit deze spec:**
- `sponsors` (ondernemers) — eigen spec na deze.
- `events` + `event_registrations` — eigen spec.
- Concrete bank-import-flow (MT940-parsing, dedup-regels) — separate spec.
- Stripe-integratie — SaaS-fase.
- Cron-reminders — LATER.
- `bedrag_in_letters` — bewust weggelaten voor MVP (cijfer-bedrag volstaat juridisch).
- `pledges`-CRUD-UI — alleen tabel + RLS, UI volgt in roadmap-pijler 2.

---

## 3 kernregels

1. **`donations` = enige bron voor "ontvangen geld".** Pledges en gift_agreements zijn beloftes, geen geld.
2. **Een formulier-submit kan meerdere rijen creëren in één transactie.** Eenmalige + voldaan = `gift_agreement` + `donation` tegelijk. Periodieke + wil-lid-zijn = `gift_agreement` + `member` tegelijk.
3. **Status leeft op twee assen.** Een `gift_agreement` heeft een eigen levenscyclus (`agreement_status`: signed/lapsed/withdrawn/completed) los van betaalstatus (`payment_status`: alleen voor eenmalige).

---

## Beslissingen verankerd in deze spec

| # | Beslissing | Rationale |
|---|---|---|
| A | `pledges`-tabel + RLS in deze ronde, geen UI | Schema vooruit; UI in roadmap-pijler 2. |
| B | `agreement_status` apart van `payment_status` | Eenmalige kan voldaan zijn terwijl overeenkomst nog geldig is. Periodieke heeft alleen `agreement_status`. |
| C | Geen `bedrag_in_letters` voor MVP | UX-fricitie te hoog, juridische rust met cijfers + bevestigingsmail volstaat. |
| D | 1 mail-template met conditionele alinea's | 4 inhoudvarianten, 1 fysieke template. |
| E | Eerst datamodel, dan security-sprint R6/R7/R3 | Formulier-flow stabiliseren vóór routing/middleware-werk. |

---

## Twee belangrijke design-keuzes vooraf

### Cash-flow vs gift-flow vs bank-flow

| Bron | Tabel | Status |
|---|---|---|
| `/gift` formulier (ANBI eenmalig, voldaan=ja) | `gift_agreements` + `donations` (gekoppeld) | Akte + bewijs van ontvangst tegelijk |
| `/gift` formulier (ANBI eenmalig, voldaan=nee) | `gift_agreements` alleen | Akte; geld komt later via bankimport |
| `/gift` formulier (ANBI periodiek) | `gift_agreements` + (optioneel) `members` | Akte; maandelijkse betalingen komen later als donations |
| Cash bij vrijdaggebed (separate flow, MVP later) | `donations` (method=`cash`) + signature | Direct geld binnen, vrijwilliger registreert |
| Bank-import (MT940) | `donations` (method=`bank`) | Direct geld binnen, geïmporteerd |

### Pledges naast gift_agreements

- **`gift_agreements`** = juridische ANBI-akte met handtekening, vaste velden, schenker-snapshot.
- **`pledges`** = generieke toezegging, ook mondeling/e-mail/na evenement, geen handtekening verplicht.

Aparte tabellen omdat de juridische verschillen groot zijn (handtekening, ANBI-velden, IBAN-machtiging).

### Cash-handtekening blijft in `donations`

Geen aparte `cash_receipts`-tabel. `donations.signature_png` is optioneel veld. Voorkomt dubbele tabel + dashboard hoeft maar één bron te lezen.

---

## DBML — kopieer naar [dbdiagram.io](https://dbdiagram.io)

```dbml
// Mosqon datamodel v2 — MVP-kern
// Multi-tenant by default. Alles heeft organization_id.
// Matching tussen pledges/gift_agreements <-> donations via optionele FK.

Project mosqon {
  database_type: 'PostgreSQL'
  Note: 'MVP-kern: leden, donaties, toezeggingen, ANBI-akten, imports'
}

// =========================================================================
// Multi-tenant
// =========================================================================

Table organizations {
  id uuid [pk]
  name text [not null]
  rsin text
  legal_name text [note: 'na SaaS-sweep']
  iban text [note: 'na SaaS-sweep']
  contact_email text [note: 'na SaaS-sweep']
  created_at timestamptz
}

Table organization_members {
  org_id uuid [not null]
  user_id uuid [not null, note: 'auth.users.id']
  role text [not null, note: 'owner / admin / board / committee']
  created_at timestamptz

  indexes {
    (org_id, user_id) [pk]
    user_id
  }
}

Ref: organization_members.org_id > organizations.id

// =========================================================================
// Mensen — leden, schenkers, of beide
// =========================================================================

Table members {
  id uuid [pk]
  org_id uuid [not null]
  user_id uuid [note: 'wie registreerde']

  first_name text
  last_name text
  name text [note: 'fallback, oude import-rijen']
  email text
  phone text
  address text
  postcode text
  city text

  iban text
  membership_type text
  monthly_amount numeric [note: 'NULL als bedrag via periodieke gift_agreement loopt — voorkomt dubbele telling']
  start_date date
  status text [not null, note: 'active / inactive / prospect / cancelled']

  notes text
  last_import_id uuid
  created_at timestamptz
}

Ref: members.org_id > organizations.id
Ref: members.last_import_id > imports.id

// =========================================================================
// Donaties — alle bronnen samen (cash, bank, online, manual)
// =========================================================================

Table donations {
  id uuid [pk]
  org_id uuid [not null]
  user_id uuid [note: 'wie registreerde']
  member_id uuid [note: 'optioneel — anoniem mag']

  amount numeric [not null]
  method text [not null, note: 'cash / bank / online / other']
  donated_at date [not null]
  notes text

  // Matching: 0 of 1 van de twee actief
  pledge_id uuid [note: 'lost een mondelinge toezegging in']
  gift_agreement_id uuid [note: 'lost een ANBI-akte in']

  // Cash-specifiek
  signature_png text [note: 'alleen bij method=cash']
  receipt_photo_url text [note: 'optioneel — papieren kwitantie']

  // Audit
  source text [note: 'manual / csv / mt940 / stripe / gift_form']
  external_ref text [note: 'bv. MT940-transactie-id of Stripe-payment-id, voor dedup']
  last_import_id uuid

  created_at timestamptz

  indexes {
    (org_id, source, external_ref) [unique, note: 'partial: WHERE external_ref IS NOT NULL — voor MT940-dedup']
  }
}

Ref: donations.org_id > organizations.id
Ref: donations.member_id > members.id
Ref: donations.pledge_id > pledges.id
Ref: donations.gift_agreement_id > gift_agreements.id
Ref: donations.last_import_id > imports.id

// =========================================================================
// Toezeggingen — generiek (mondeling, e-mail, na evenement)
// =========================================================================

Table pledges {
  id uuid [pk]
  org_id uuid [not null]
  member_id uuid [note: 'optioneel — anonieme belofte mag']

  amount numeric [not null]
  purpose text [note: 'doel: nieuwe gevel / Ramadan / vrije bestemming']
  pledged_at date
  deadline date

  status text [not null, note: 'open / partial / paid / cancelled']
  source text [note: 'verbal / email / event / form']
  notes text

  created_at timestamptz
}

Ref: pledges.org_id > organizations.id
Ref: pledges.member_id > members.id

// =========================================================================
// ANBI-overeenkomsten — juridische akte met handtekening
// =========================================================================

Table gift_agreements {
  id uuid [pk]
  org_id uuid [not null, note: 'NOT NULL afgedwongen na SaaS-sprong-sweep']
  reference_code text [note: 'eerste 6 chars van id, voor schenker']
  member_id uuid [note: 'optioneel — gevuld bij wants_membership=true']

  type text [not null, note: 'periodieke | eenmalige']

  // Schenker (snapshot, los van members — schenker hoeft geen lid te zijn)
  schenker_naam text [not null]
  schenker_geboortedatum date [not null]
  schenker_telefoon text [not null]
  schenker_adres text [not null]
  schenker_postcode text
  schenker_woonplaats text
  schenker_land text [not null]
  schenker_email text [not null]

  // Bedrag
  bedrag_per_maand numeric [note: 'alleen bij type=periodieke']
  startdatum date [note: 'alleen bij type=periodieke']
  bedrag_eenmalig numeric [note: 'alleen bij type=eenmalige']

  // Eenmalige-specifiek (NEW v2)
  payment_method_intent text [note: 'cash | bank | online — alleen eenmalige']
  payment_status text [note: 'unpaid | partial | paid — alleen eenmalige']
  paid_at timestamptz [note: 'alleen als payment_status=paid']

  // Periodieke-specifiek (NEW v2)
  wants_membership boolean [note: 'alleen bij type=periodieke']

  // Akkoord + ondertekening
  akkoord_overeenkomst boolean [not null]
  akkoord_at timestamptz
  iban text [not null]
  rekeninghouder text [not null]
  ondertekening_plaats text [not null]
  ondertekening_datum date [not null]
  ondertekening_naam text [not null]
  ondertekening_handtekening_png text [not null]

  // Cyclus van de overeenkomst zelf, los van betalingen (NEW v2)
  agreement_status text [note: 'signed | lapsed | withdrawn | completed']
  created_at timestamptz
}

Ref: gift_agreements.org_id > organizations.id
Ref: gift_agreements.member_id > members.id

// =========================================================================
// Imports — audit trail voor Excel / MT940 / Stripe / manual
// =========================================================================

Table imports {
  id uuid [pk]
  org_id uuid [not null]
  user_id uuid [not null]

  entity_type text [not null, note: 'members / donations / pledges']
  source text [not null, note: 'csv / mt940 / stripe / manual']
  file_name text

  row_count int
  inserted_count int
  updated_count int
  skipped_count int
  error_count int

  status text [not null, note: 'pending / committed / rolled_back']
  created_at timestamptz
  committed_at timestamptz
}

Table import_rows {
  id uuid [pk]
  import_id uuid [not null]
  row_number int [not null]
  raw json [not null]
  mapped json
  action text [not null, note: 'insert / update / skip / error']
  target_id uuid
  reason text
  created_at timestamptz
}

Ref: imports.org_id > organizations.id
Ref: import_rows.import_id > imports.id
```

---

## Formulier-flow per scenario

| Scenario | gift_agreement | donation | member |
|---|---|---|---|
| Eenmalige + cash + voldaan | ✓ (type=eenmalige, payment_status=paid) | ✓ (method=cash, signature_png, gift_agreement_id) | — |
| Eenmalige + bank + voldaan | ✓ | ✓ (method=bank, gift_agreement_id) | — |
| Eenmalige + bank + niet voldaan | ✓ (payment_status=unpaid) | — (komt later via MT940-import) | — |
| Eenmalige + cash + niet voldaan | ✓ (payment_status=unpaid) | — (komt later via cash-formulier) | — |
| Periodieke + lid | ✓ (type=periodieke, wants_membership=true) | — (maandelijks via bank/cash) | ✓ (status=active, monthly_amount=NULL) |
| Periodieke + geen lid | ✓ (wants_membership=false) | — | — |

---

## Submit-actie pseudo-code

```ts
async function submitGiftAgreement(form) {
  // 1. Altijd
  const giftAgreement = await insert("gift_agreements", {
    org_id, type: form.type,
    ...form.schenker, ...form.bedrag,
    payment_method_intent: form.type === "eenmalige" ? form.payment_method : null,
    payment_status: form.type === "eenmalige" ? form.payment_status : null,
    paid_at: form.payment_status === "paid" ? new Date() : null,
    wants_membership: form.type === "periodieke" ? form.wants_membership : null,
    agreement_status: "signed",
    akkoord_overeenkomst: form.akkoord, akkoord_at: new Date(),
    iban: form.iban, rekeninghouder: form.rekeninghouder,
    ondertekening_*: form.ondertekening_*,
  });

  // 2. Eenmalige + voldaan → donation
  if (form.type === "eenmalige" && form.payment_status === "paid") {
    await insert("donations", {
      org_id, member_id: null,
      amount: form.bedrag_eenmalig,
      method: form.payment_method,
      donated_at: form.payment_date,
      gift_agreement_id: giftAgreement.id,
      signature_png: form.payment_method === "cash" ? form.handtekening : null,
      source: "gift_form",
    });
  }

  // 3. Periodieke + lid → member
  if (form.type === "periodieke" && form.wants_membership) {
    const member = await insert("members", {
      org_id,
      first_name: parseFirstName(form.schenker_naam),
      last_name: parseLastName(form.schenker_naam),
      email: form.schenker_email,
      phone: form.schenker_telefoon,
      iban: form.iban,
      status: "active",
      monthly_amount: null, // bedrag staat al in gift_agreement
    });
    await update("gift_agreements", { member_id: member.id }, { id: giftAgreement.id });
  }

  return { success: true, referenceCode, scenario: ... };
}
```

---

## Dashboard-tellingen (geen dubbele telling)

| Widget | Bron + voorwaarde |
|---|---|
| Ontvangen deze maand | `SUM(donations.amount)` waar `donated_at` in maand |
| Openstaande toezeggingen | `SUM(gift_agreements.bedrag_eenmalig)` waar `payment_status != 'paid'` + `SUM(pledges.amount)` waar `status='open'` |
| Periodieke verwacht / maand | `SUM(gift_agreements.bedrag_per_maand)` waar `type='periodieke' AND agreement_status='active'` |
| Ledenbijdragen verwacht / maand | `SUM(members.monthly_amount)` waar `status='active' AND id NOT IN (SELECT member_id FROM gift_agreements WHERE type='periodieke' AND agreement_status='active' AND member_id IS NOT NULL)` |
| Nog te matchen betalingen | `COUNT(donations)` waar `pledge_id IS NULL AND gift_agreement_id IS NULL AND member_id IS NULL` |
| Niet betaald deze maand (periodieke) | `COUNT(gift_agreements)` waar `type='periodieke' AND agreement_status='active' AND id NOT IN (SELECT gift_agreement_id FROM donations WHERE donated_at IN [maand])` |

Implementatie als helpers in `src/app/lib/dashboard-queries.ts` (later — eerst datamodel solide).

---

## Bestanden die deze spec straks raakt (volgorde van uitvoer)

| # | Actie | Pad |
|---|---|---|
| 1 | Edit | deze spec (klaar) |
| 2 | Nieuw | `supabase/migrations/007_pledges.sql` |
| 3 | Nieuw | `supabase/migrations/008_donations_matching_columns.sql` |
| 4 | Nieuw | `supabase/migrations/009_gift_agreements_payment_membership.sql` |
| 5 | Edit | `src/app/lib/types.ts` |
| 6 | Edit | `src/app/lib/giftAgreement.ts` (Zod-schema) |
| 7 | Edit | `src/app/gift/GiftForm.tsx` |
| 8 | Edit | `src/app/gift/actions.ts` (transactie-logica) |
| 9 | Edit | `src/app/gift/ThankYou.tsx` + email-template |
| 10 | Edit | `docs/product/decisions.md` |
| later | Nieuw | `src/app/lib/dashboard-queries.ts` |

Tussen elke stap: `npm run build` groen + handmatige browser-test.
