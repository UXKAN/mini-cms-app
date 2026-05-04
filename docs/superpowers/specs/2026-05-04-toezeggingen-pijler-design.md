# Spec: Toezeggingen-pijler + omschrijving-veld (Ronde 2)

**Versie:** 2026-05-04
**Vervult:** `mvp-scope.md` → "Toezeggingen CRUD" + "Omschrijving-veld overal" + decision 2026-05-04 ("Toezeggingen-pijler toont gemengde lijst") + decision 2026-05-04 ("Veldnaamgeving Omschrijving")
**Vervangt stub:** `src/app/toezeggingen/page.tsx`

---

## Doel

Een werkende `/toezeggingen`-pagina waarop de penningmeester ziet welk toegezegd geld nog niet binnen is, ongeacht de bron. Tegelijkertijd wordt het "doel/omschrijving"-veld op alle drie de plekken (donaties, toezeggingen, gift-formulier) consistent gemaakt onder de UI-naam **"Omschrijving"**.

In één zin: *één gemengde lijst van pledges + onbetaalde ANBI-akten, met een matching-knop die een binnenkomende betaling als donation registreert.*

**Bewust uit deze spec:**
- Sponsors-CRUD (eigen latere ronde).
- Automatische reminders (cron) — handmatige `mailto:`-knop volstaat voor MVP, decision 2026-04-27.
- Bulk-acties (mass-reminder, bulk-import van toezeggingen).
- Excel-import/-export voor toezeggingen — komt in latere ronde.
- Goud als donatievorm — verschoven naar SaaS-fase per decision 2026-05-04.

---

## 4 kernkeuzes

1. **Eén gemengde lijst.** Pledges en onbetaalde gift_agreements staan in dezelfde tabel met type-badge. Geen tabs.
2. **CRUD alleen voor pledges.** Gift_agreements komen via `/gift` binnen — niet handmatig aanpasbaar buiten matching.
3. **Matching genereert donation.** "→ Markeer als betaald"-knop opent dialog, maakt `donation`-rij aan en update bron-status. Omschrijving wordt meegekopieerd.
4. **`donations.notes` blijft de DB-kolom**, UI-label wordt "Omschrijving" overal. Geen extra kolom voor publiek vs intern.

---

## Database — migratie 012

Nieuwe kolom op `gift_agreements`:

```sql
-- 012_gift_agreements_purpose.sql
alter table public.gift_agreements
  add column if not exists purpose text;
```

Geen CHECK-constraint, vrij tekstveld. Nullable — bestaande rijen krijgen NULL, geen backfill nodig.

Geen aanpassing aan `pledges` (heeft al `purpose` + `notes`) of `donations` (heeft al `notes`).

---

## Datamodel: hoe gegevens stromen

```
/gift formulier — eenmalige
   ├── + voldaan      → gift_agreements (+ purpose) + donations (+ notes)
   └── + niet voldaan → gift_agreements (+ purpose, payment_status='unpaid')
                          ↓ zichtbaar op /toezeggingen
                          ↓ "→ Markeer als betaald" klik
                          ↓ creëert donations + zet payment_status='paid'

/toezeggingen pagina
   ├── pledges (mondeling/email/event) → CRUD volledig
   └── gift_agreements (unpaid eenmalige) → alleen view + matching
                          ↓ "→ Markeer als betaald" klik
                          ↓ zelfde flow

/donaties pagina
   └── tabel-kolom "Omschrijving" leest uit donations.notes
```

---

## Type-aanpassingen — `src/app/lib/types.ts`

```ts
export type GiftAgreement = {
  // ... bestaande velden ...
  purpose: string | null;  // nieuw
};
```

Geen wijzigingen aan `Donation`, `Pledge` types — die hebben al hun veld.

---

## Gift-form (`/gift`) — wijzigingen

### `src/app/lib/giftAgreement.ts`
- Nieuwe Zod-veld in schema: `purpose: z.string().trim().max(500).optional()`
- Conditioneel: alleen relevant bij `type === 'eenmalige'`. Periodieke laat het leeg.

### `src/app/gift/GiftForm.tsx`
- In stap "Type gift" → tak `eenmalige` → nieuwe input "Omschrijving (optioneel)" met placeholder "Bijvoorbeeld: Ramadan-fonds, gevel-renovatie, vrije bestemming"
- Textarea met `rows={2}`, max 500 chars

### `src/app/gift/actions.ts`
- `purpose: data.purpose ?? null` in gift_agreements insert
- Bij `isPaid && data.payment_method && data.bedrag_eenmalig` (de donation-insert): `notes: data.purpose ? \`${data.purpose} (#${referenceCode})\` : \`Via ANBI-formulier #${referenceCode}\``
  - Logica: als schenker een omschrijving gaf, gebruik die; anders fallback naar referentienummer.

### `src/app/lib/giftAgreementEmail.ts`
- Optionele "Omschrijving" regel toevoegen aan e-mail-summary, alleen bij eenmalige met `purpose` ingevuld.

---

## `/donaties` — label-rename

In `src/app/donations/page.tsx`:
- Tabel-header "Notities" → **"Omschrijving"**
- Form-label "Notities" → **"Omschrijving"**
- Placeholder behoud: "Omschrijving, doel, etc." → kan blijven of korten naar "Bijvoorbeeld: Ramadan-fonds, gevel-renovatie"
- Geen wijziging in `notes`-state, kolom-mapping of payload — alleen UI-tekst.

---

## `/toezeggingen` — nieuwe pagina

### Route: `src/app/toezeggingen/page.tsx`

Component-structuur (vergelijkbaar met `/donations/page.tsx`):
- AppShell wrapper
- Header met titel + "+ Nieuwe toezegging"-knop (alleen voor pledges)
- Stat-cards: "Aantal openstaand", "Totaal openstaand bedrag", "Verloopt < 30 dagen"
- Filterbalk: status (open/partial/all) + type-filter (alle/mondeling/ANBI)
- Tabel met kolommen:
  - **Type** (badge: "Mondeling" / "E-mail" / "Event" / "ANBI-akte")
  - **Datum** (mix van `pledged_at` of `akkoord_at`)
  - **Bedrag**
  - **Persoon** (member.name of schenker_naam, klikbaar → member detail)
  - **Omschrijving** (purpose, truncate na 60 chars)
  - **Deadline** (alleen pledges; "—" voor gift_agreements)
  - **Status** (badge gekleurd: open/partial/paid/cancelled)
  - **Acties** (3-dots menu: Bewerken / Markeer als betaald / Stuur reminder / Verwijderen)

### Data-laden

Twee Supabase-queries parallel via `Promise.all`:

```ts
const [{ data: pledges }, { data: agreements }] = await Promise.all([
  supabase.from("pledges")
    .select("*, member:members(id, name, first_name, last_name, email)")
    .eq("org_id", orgId)
    .in("status", ["open", "partial"])
    .order("pledged_at", { ascending: false }),
  supabase.from("gift_agreements")
    .select("id, schenker_naam, schenker_email, bedrag_eenmalig, purpose, akkoord_at, payment_status, member_id, member:members(id, name, first_name, last_name)")
    .eq("organization_id", orgId)
    .eq("type", "eenmalige")
    .in("payment_status", ["unpaid", "partial"])
    .order("akkoord_at", { ascending: false }),
]);
```

Vervolgens beide arrays normaliseren naar één `ToezeggingRow`-type en sorteren op datum.

### Add/Edit/Delete dialog (alleen pledges)

Velden:
- Bedrag (number, required, > 0)
- Persoon (lid-picker met search, optioneel — anonieme toezegging mag)
- Omschrijving (text, optional)
- Pledged-at (date, default vandaag)
- Deadline (date, optional)
- Source (select: verbal / email / event / form / other)
- Status (alleen bij edit)
- Notes (intern — kleine textarea)

### "→ Markeer als betaald" dialog (beide bronnen)

Velden gevuld op basis van bron:
- **Bedrag** (pre-filled van pledge.amount of gift_agreement.bedrag_eenmalig, editable)
- **Methode** (cash / bank / online / other; default 'bank')
- **Datum** (default vandaag, editable)
- **Omschrijving** (pre-filled van purpose, editable)
- **Lid** (pre-filled van member_id als bekend)

Submit-actie:
1. Insert in `donations` met juiste FK (`pledge_id` of `gift_agreement_id`), `member_id`, `amount`, `method`, `donated_at`, `notes`
2. Update bron-status:
   - Pledge: `status = 'paid'` (of `'partial'` als `amount < pledge.amount`)
   - Gift_agreement: `payment_status = 'paid'` + `paid_at = donated_at`
3. Refresh tabel

### "Stuur reminder"-knop

Genereert `mailto:` link met:
- `to`: member.email of schenker_email
- `subject`: "Herinnering toezegging — Nieuwe Moskee Enschede"
- `body`: pre-filled tekst met bedrag + datum + omschrijving + dankwoord

Geen Resend, geen template-engine — gewoon openen in default mail-client. Penningmeester past aan en verzendt zelf.

### Verwijderen

Alleen pledges. Confirmation dialog. Gift_agreements kunnen niet verwijderd worden vanuit `/toezeggingen` (komen via /gift binnen, dat is bron-of-truth).

---

## Dashboard-widget

In `src/app/dashboard/page.tsx`: vervang de stub-card "Toezeggingen — Komt binnenkort" door een echte card:

- Titel: "Openstaande toezeggingen"
- Hoofdgetal: totaal € (som van pledges.amount + gift_agreements.bedrag_eenmalig waar status open/partial of unpaid/partial)
- Subtekst: aantal stuks + "X verlopen" (deadline gepasseerd)
- "→ Bekijk alle"-link naar `/toezeggingen`

Eén query op pledges + één op gift_agreements, beide in `Promise.all` met de bestaande dashboard-loads.

---

## Bestanden die deze spec raakt (volgorde van uitvoer)

| # | Actie | Pad |
|---|---|---|
| 1 | Nieuw | `supabase/migrations/012_gift_agreements_purpose.sql` |
| 2 | Edit | `src/app/lib/types.ts` (GiftAgreement.purpose) |
| 3 | Edit | `src/app/lib/giftAgreement.ts` (Zod purpose-veld) |
| 4 | Edit | `src/app/gift/GiftForm.tsx` (input bij eenmalige) |
| 5 | Edit | `src/app/gift/actions.ts` (purpose meegeven aan inserts) |
| 6 | Edit | `src/app/lib/giftAgreementEmail.ts` (omschrijving in mail) |
| 7 | Edit | `src/app/donations/page.tsx` (label "Notities" → "Omschrijving") |
| 8 | Vervang | `src/app/toezeggingen/page.tsx` (volledige nieuwe pagina) |
| 9 | Edit | `src/app/dashboard/page.tsx` (toezeggingen-widget) |

Tussen elke stap (of aan het eind): `npm run build` groen.

---

## Verificatie

End-to-end test (handmatig of via direct DB-script zoals Ronde 1):

1. **Pledge CRUD:** maak pledge aan via /toezeggingen, bewerk hem, verwijder hem.
2. **Gift-form eenmalige + voldaan:** vul /gift in met omschrijving "Ramadan", betaalstatus voldaan. Verifieer:
   - `gift_agreements.purpose = 'Ramadan'`
   - `donations.notes` bevat 'Ramadan' + referentienummer
   - Donatie zichtbaar op /donaties met kolom "Omschrijving" gevuld
3. **Gift-form eenmalige + niet voldaan:** zelfde maar betaalstatus niet voldaan. Verifieer:
   - `gift_agreements.purpose` = ingevulde tekst
   - Toezegging zichtbaar op /toezeggingen met badge "ANBI-akte"
   - Geen donation aangemaakt
4. **Matching:** open de unpaid gift_agreement op /toezeggingen, klik "Markeer als betaald", vul dialog in, submit. Verifieer:
   - `donations`-rij bestaat met `gift_agreement_id` set
   - `gift_agreements.payment_status='paid'`, `paid_at` gezet
   - Toezegging verdwijnt uit /toezeggingen
   - Donation zichtbaar op /donaties
5. **Dashboard:** toezeggingen-widget toont juiste totalen.
6. **Reminder:** klik "Stuur reminder" — opent default mail-app met pre-filled tekst.
