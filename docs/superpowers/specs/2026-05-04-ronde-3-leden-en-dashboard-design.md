# Spec: Ronde 3 — Leden uitbreiden met donateurs + dashboard-completering

**Versie:** 2026-05-04
**Vervult:** decision 2026-05-04 ("Donateurs ook als members-rij") + dashboard-secties 2 + 4 uit `~/.claude/plans/ik-ben-eerlijk-gezegd-purring-newt.md` ronde 3-advies.

---

## Doel

Twee dingen tegelijk oplossen:

1. **Periodieke schenkers zonder lidmaatschap zichtbaar maken** in `/leden` (Filosofie 1: donateur = ook een member-rij met `membership_type='donateur'`).
2. **Dashboard-cijfers compleet maken** voor periodieke giften: hoeveel verwacht per maand, wie heeft deze maand nog niet betaald, hoeveel donaties zijn nog niet gekoppeld.

In één zin: *iedereen die regelmatig geld stort komt op /leden, en het dashboard toont eindelijk de €67/maand die we nu missen.*

**Bewust uit deze spec:**
- Bulk-acties op leden (handmatig nog).
- Excel-export van leden — komt in latere ronde.
- ALV-stemrecht / formele lidmaatschap-administratie.
- Periodieke gift-akten als aparte route — afgewezen, optie C uit eerdere keuze.

---

## 4 wijzigingen

### 1. `/gift/actions.ts` — donateur-flow

Op dit moment wordt bij `wants_membership=false` géén member aangemaakt. Wijziging:

```ts
// Pseudocode
if (data.type === "periodieke") {
  const membershipType = data.wants_membership === "yes" ? "lid" : "donateur";

  // Lookup-or-create member (zoals bestaande logica al doet voor wants_membership=true)
  const memberId = await lookupOrCreateMember({
    email: data.schenker_email,
    membership_type: membershipType,
    // ... rest van schenker-data
  });

  // Koppel gift_agreement aan member
  await update("gift_agreements", { member_id: memberId }, { id });
}
```

**Bestaande duplicate-email check uit Ronde 1** wordt hergebruikt. Bij hergebruik van een bestaande member: `membership_type` **niet overschrijven** (al bestaat de member als 'lid', dan blijft hij 'lid' ook al doet hij nu een tweede akte als 'donateur'). De gedragsregel: "lid trumpt donateur".

### 2. Data-fix — retroactief members aanmaken

Voor bestaande periodieke gift_agreements zonder member-koppeling: maak een member aan met de juiste membership_type, koppel `gift_agreements.member_id`. Eenmalig script (geen migratie — alleen data, geen schema).

Specifiek in productie:
- Erik de Vries (€20/mnd, lid=nee) → nieuwe member, `membership_type='donateur'`
- Ali Ozkan #2 (€23/mnd, lid=nee) → koppelen aan Ali's bestaande member (wants_membership=true), geen nieuwe member

### 3. `/leden`-pagina uitbreiden

Wijzigingen:
- Subtitel onder kop: "Leden en donateurs"
- **Filter-bar** boven tabel: `[Alle] [Lid] [Donateur]` — knop-stijl, telt aantal per type
- Nieuwe kolom **"Type"** met badge:
  - `lid` → groene badge "Lid"
  - `donateur` → blauwe badge "Donateur"
  - andere waarden (`erelid`, `vrijwilliger`) → grijze badge met label
  - `null` → grijze badge "—"
- Bestaande kolom "Bedrag" → blijft, maar nu **gederiveerd**:
  - Als de member een actieve periodieke gift_agreement heeft (`type='periodieke' AND agreement_status='signed'`): toon `bedrag_per_maand` uit die akte
  - Anders: toon `members.monthly_amount`
  - In tabel: tooltip of kleine label dat zegt "via akte" als afkomstig van gift_agreement
- Klikbaar: rij → `/leden/[id]` (member detail-page)

Query wordt iets zwaarder — JOIN op gift_agreements voor het bedrag. Geen probleem voor MVP-volume.

### 4. Member detail-page — `/leden/[id]/page.tsx`

Nieuwe route. Toont:
- Persoonsgegevens (read-only voor MVP, edit-modal hergebruikt van /leden)
- Lijst van periodieke gift-akten van deze member (uit `gift_agreements WHERE member_id=X AND type='periodieke'`)
- Lijst van eenmalige akten (`type='eenmalige'`)
- Donatie-historie (`donations WHERE member_id=X`) — gesorteerd op datum, met methode + bedrag + omschrijving
- Stat-cards: totaal ontvangen (lifetime), aantal donaties, langste streak (skip voor MVP — alleen totalen)
- Acties: "Bewerken" → opent zelfde dialog als op /leden, "Toevoegen donatie" → opent donations-dialog met member pre-filled

### 5. Dashboard-widgets

**Bestaande widget "Maandelijkse leden":** correctie. Nu telt het `members.monthly_amount` (= 0 in productie). Wordt:
- "Actieve leden" = aantal `members WHERE status='active'` (alle types)
- "Per maand terugkerend" = `members.monthly_amount`-totaal **+** `gift_agreements.bedrag_per_maand`-totaal voor actieve periodieke akten
- Geen dubbele telling: members met een actieve periodieke akte → bedrag uit akte, niet uit member

**Nieuwe widget "Periodieke verwacht/maand":**
- `SUM(bedrag_per_maand) FROM gift_agreements WHERE type='periodieke' AND agreement_status='signed' AND organization_id=...`
- Aantal stuks
- Klikbaar → /leden filter=Donateur+Lid (alle types)

**Nieuwe widget "Niet-betaald deze maand":**
- Periodieke akten waar deze maand (`donated_at` in lopende maand) nog géén donation voor binnen is met `gift_agreement_id` matched
- Aantal + totaal € verwacht maar niet ontvangen
- Klikbaar → toezeggingen-pagina met filter (of aparte view)

**Nieuwe widget "Niet-gematcht":**
- `COUNT(donations) WHERE pledge_id IS NULL AND gift_agreement_id IS NULL AND member_id IS NULL AND organization_id=...`
- Klikbaar → /donaties met filter (later)

---

## Bestanden die deze spec raakt

| # | Actie | Pad |
|---|---|---|
| 1 | Edit | `src/app/gift/actions.ts` (donateur-flow) |
| 2 | Run + Cleanup | data-fix script (eenmalig, niet committen) |
| 3 | Edit | `src/app/members/page.tsx` (filter, Type-kolom, bedrag-derive) |
| 4 | Nieuw | `src/app/members/[id]/page.tsx` (member detail) |
| 5 | Edit | `src/app/dashboard/page.tsx` (widgets + correctie recurring) |
| 6 | Edit | `src/app/lib/types.ts` (geen verplicht, MembershipType type kan toegevoegd) |

Tussen of aan einde: `npm run build` groen + `npm run lint` geen nieuwe issues.

---

## Verificatie

DB-test script (zoals Ronde 1 + 2):

1. Periodieke gift submit met wants_membership=false → maakt member met `membership_type='donateur'` + koppelt gift_agreement.member_id
2. Periodieke gift submit met wants_membership=true → maakt member met `membership_type='lid'`
3. Tweede submit met `wants_membership=false` voor email die al lid is → hergebruikt member, `membership_type` blijft 'lid' (niet downgraded)
4. Dashboard query "Periodieke verwacht/maand" geeft €67 (productie-stand)
5. Dashboard query "Niet-betaald deze maand" geeft correct aantal voor lopende maand
6. /leden filter "Donateur" geeft alle members met `membership_type='donateur'`

Browser-test (handmatig na deploy):
- /leden toont alle types met juiste badges
- Member detail-page klikbaar vanaf /leden
- Dashboard widgets tonen verwachte waarden
