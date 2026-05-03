# Review-followup — 9 items uit code-review 2026-05-03

**Bron:** code-reviewer-agent rapport over commits `34c062e..10bf306` (datamodel v2, gift form, theme playground, DOB input). Werkt allemaal in productie; deze items zijn geen blockers maar wel echte verbeteringen.

**Status:** geparkeerd — pakken op in een volgende sessie. De 3 hoog-prio items het eerst, daarna middel/laag indien zinvol.

---

## Hoog-prio (echte productie-bugs)

### 1. Member zonder gift_agreement-koppeling bij UPDATE-faal

**File:** [src/app/gift/actions.ts:170-179](../../../src/app/gift/actions.ts)

**Probleem:** als `members.insert` lukt maar de daaropvolgende `gift_agreements.update({ member_id })` faalt, blijft de gift_agreement met `wants_membership=true` zonder `member_id`. Stille inconsistentie. Geen sideWarning naar gebruiker.

**Fix:** voeg een `sideWarnings.push(...)` toe in de catch van `updateError`. Idealiter: rollback de net aangemaakte member, of gebruik een echte transactie (zie #4).

### 2. Geen duplicate-email check vóór `members.insert`

**File:** [src/app/gift/actions.ts:142-181](../../../src/app/gift/actions.ts)

**Probleem:** schenker die formulier 2× indrukt of al lid is krijgt twee member-rijen met dezelfde email. Geen unique constraint op `members.email`.

**Fix:**
```ts
const { data: existing } = await supabase
  .from("members")
  .select("id")
  .eq("org_id", organizationId)
  .ilike("email", data.schenker_email)
  .maybeSingle();

const memberId = existing?.id ?? (await insertNew()).id;
await supabase.from("gift_agreements").update({ member_id: memberId }).eq("id", id);
```

Optioneel ook DB-side: `create unique index members_org_email_unique on members(org_id, lower(email)) where status != 'cancelled';`.

### 3. `paid_at` server-now ipv schenker-opgegeven datum

**File:** [src/app/gift/actions.ts:92](../../../src/app/gift/actions.ts)

**Probleem:** `paid_at: isPaid ? new Date().toISOString() : null` — server-tijd. Maar de gekoppelde donation gebruikt wel `data.payment_date` (`actions.ts:120`). Mismatch tussen `gift_agreements.paid_at` en `donations.donated_at` voor dezelfde betaling.

**Fix:** `paid_at: isPaid && data.payment_date ? new Date(data.payment_date + "T12:00:00Z").toISOString() : null`.

---

## Middel-prio (architectuur)

### 4. 3 losse inserts ipv één transactie

**File:** [src/app/gift/actions.ts:71-181](../../../src/app/gift/actions.ts)

**Probleem:** spec datamodel-v2 belooft expliciet "één transactie" voor de submit-actie. Implementatie is 3 losse `.insert()`-calls. Faalkans laag (ms-window), maar niet conform spec.

**Fix:** schrijf een Postgres-functie `submit_gift_agreement(p_form jsonb, p_org_id uuid)` met `security definer`, die alle 3 inserts in een echte transactie doet. Roep aan vanuit `actions.ts` via `supabase.rpc(...)`.

### 5. Cross-org FK-koppeling zonder constraint

**File:** [supabase/migrations/008_donations_matching_columns.sql](../../../supabase/migrations/008_donations_matching_columns.sql)

**Probleem:** `donations.pledge_id` en `donations.gift_agreement_id` zijn plain FK's. Service-role kan een donation van org A koppelen aan een gift_agreement van org B → stille data-corruptie.

**Fix:** Postgres trigger op `donations` insert/update:
```sql
create or replace function donations_match_org_check() returns trigger ...
  -- check donations.org_id = (select org_id from pledges where id = NEW.pledge_id)
  -- en idem voor gift_agreement_id
```

### 6. DOB paste-handler crashet op ISO-input

**File:** [src/components/ui/date-of-birth-input.tsx:71-75](../../../src/components/ui/date-of-birth-input.tsx)

**Probleem:** plak `2020-12-10` (ISO-format) → wordt `20201210` na digit-strip → `20/20/1210`. Verwarrend voor gebruiker.

**Fix:** in `handlePaste` eerst proberen ISO-pattern (`YYYY-MM-DD`) te detecteren en direct converteren. Daarna pas algemene digit-strip-fallback.

---

## Laag-prio (polish)

### 7. `donations.user_id` audit-trail trigger

**File:** [supabase/migrations/010_nullable_user_id_for_anon_flows.sql](../../../supabase/migrations/010_nullable_user_id_for_anon_flows.sql)

Trigger toevoegen die `user_id = auth.uid()` zet wanneer NULL bij authenticated insert. Service-role flow blijft NULL (auth.uid() is null daar).

### 8. Theme playground client-bundle uit productie

**File:** [src/app/theme-playground/](../../../src/app/theme-playground/)

`PlaygroundClient.tsx` (~700 regels client-JS) wordt nu meegebouwd in productie-bundle, ook al is de route 404. Niet bereikbaar maar wel gewicht.

**Fix:** dynamic import achter `NODE_ENV`-guard, of route weglaten via `next.config` rewrite.

### 9. Decision voor cross-org FK

Voeg entry toe aan [docs/product/decisions.md](../../product/decisions.md) over de keuze om cross-org FK-constraint *niet* nu af te dwingen, met herzieningstrigger = onboarden van moskee 2.

---

## Hoe te beginnen volgende sessie

Eén optie: zeg "fix de 3 hoog-prio review-items". Ik:
1. Lees dit document
2. Pas `actions.ts` aan voor #1, #2, #3
3. Build + browser-test
4. Eén commit `fix(gift): review followup #1-3 (hoog-prio)`
5. Jij pusht

Andere optie: pak alleen #2 (de duplicate-check) want die is gebruikersgericht, schuif #1 en #3 nog op.

Ander pad — eerst Pledges-CRUD-UI of security-sprint R6/R7/R3 — heeft voorrang als je liever zichtbaar resultaat hebt boven cleanup.
