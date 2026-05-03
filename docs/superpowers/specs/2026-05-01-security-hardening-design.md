# Spec: Security-hardening sprint (SaaS-ready)

**Vervult:**
- `mvp-scope.md` → "Architectureel onzichtbaar (geen UI, wel in DB) → `organization_id` op elke nieuwe tabel — multi-tenant-ready" (regel 36-37)
- `roadmap.md` → LATER · SaaS-sprong · "Multi-tenant **activeren** — RLS-policies aanzetten op alle tabellen, end-to-end testen dat moskee X moskee Y's data niet ziet" (regel 50). Deze spec doet de hardening **vóór** de SaaS-sprong, defensief.

**Beslissingen waarop deze spec rust:**
- `decisions.md` 2026-04-27 — *C-ready code in fase A* (elke nieuwe tabel `organization_id`, elke query filtert op huidige moskee).
- `decisions.md` 2026-04-29 — *Moskee-info hardcoded tot SaaS-sprong*. Voorwaarde: "geen tweede moskee mag het systeem testen vóór de SaaS-sprong" — deze spec maakt dat veilig zelfs áls dat per ongeluk gebeurt.
- `decisions.md` 2026-05-01 (deze spec dwingt een nieuwe entry af, zie sectie *Te documenteren in decisions.md*).

**Bron:** Audit-rapport `~/.claude/plans/ik-wil-dat-je-foamy-hedgehog.md` (2026-05-01) — punten R1, R2, R3, R6, R7.

---

## Doel

Vijf concrete hardenings doorvoeren zodat het systeem multi-tenant-veilig en sessie-correct is **vóór** een tweede moskee aansluit. Elk item is op zichzelf klein; samen verleggen ze de drempel van "single-tenant prototype" naar "SaaS-ready basis".

In één zin: *zonder UI-wijziging gaat de app van "RLS-vertrouwen op blind geluk" naar "RLS-vertrouwen op expliciete contracten".*

**Bewust uit deze spec:**
- Rollen-UI (`board`/`committee`) → blijft LATER, `decisions.md` 2026-04-27 *Rolmodel*.
- Stripe / signup-flow / onboarding → SaaS-sprong, `mvp-scope.md`.
- Echte audit log → SaaS-sprong, `roadmap.md` LATER.
- Rate limiting `/gift` (R5) en security-headers (R4) → in deze spec niet meegenomen, krijgen losse polish-PR's na deze sprint.
- `tsc --noEmit`-script (T8) en `loading.tsx`/`error.tsx` (T9) → losse polish na deze sprint.

---

## Onderdelen (R1 t/m R7 mapping)

### R1 — `gift_agreements` SELECT-policy org-scoped

**Probleem:** Migration 004 declareert `using(true)` voor authenticated SELECT. Elke ingelogde user kan alle gift-rijen van alle organisaties lezen (NAW + IBAN + handtekening-PNG + geboortedatum).

**Oplossing:** Nieuwe migration `006_gift_agreements_rls_org_scope.sql` die:
1. De huidige `using(true)`-policy droppt en vervangt door:
   ```sql
   using (organization_id is not null and public.is_org_member(organization_id))
   ```
   Hergebruikt `is_org_member()` uit migration 003 (zelfde patroon als members/donations).
2. **Geen** UPDATE/DELETE-policies toevoegt → die operaties blijven impliciet geblokkeerd voor authenticated users tot er een admin-UI bestaat. (Anon kan al niet wijzigen, alleen inserten met `akkoord_overeenkomst = true`.)
3. Een `analyze`-stap voor verifiëring: `select count(*) from public.gift_agreements where organization_id is null` → moet 0 zijn vóór NOT-NULL afgedwongen wordt. Voor MVP staan we toe dat NOT NULL **niet** wordt gezet — de policy filtert null al weg. (NOT NULL pas in SaaS-sprong als deel van moskee-info-sweep.)

**SaaS-ready argument:** dit is exact de policy die we straks bij multi-tenant-activatie zouden schrijven; door nu te doen valt 'm in de SaaS-sprong als "✅ al klaar" af.

### R2 — `GIFT_ORGANIZATION_ID` verplicht in server action

**Probleem:** [src/app/gift/actions.ts:39](../../../src/app/gift/actions.ts) doet `process.env.GIFT_ORGANIZATION_ID || null` → bij gemiste env komen rijen binnen met `organization_id = null` en, na R1, totaal onzichtbaar voor admins.

**Oplossing:**
- Lees env-var; als leeg → return `{ success: false, error: "Server is niet correct geconfigureerd. Neem contact op." }` (zelfde tone als bestaande Supabase-misconfig-melding).
- Optionele extra: valideer dat het een UUID is met `z.string().uuid()` (vroege fail).
- Verwijder `|| null` uit insert-payload.

### R3 — `middleware.ts` met `@supabase/ssr`

**Probleem:** Geen server-side session refresh. Beschermde pagina's zijn alleen client-side via `useAuth()` afgevangen → flash van content; verlopen JWT vereist handmatig opnieuw inloggen.

**Oplossing:**
- Nieuw dependency: `@supabase/ssr` (vervangt deels gebruik van plain `@supabase/supabase-js` in server-context).
- Nieuw `middleware.ts` in projectroot (Next.js conventie):
  - Cookie-aware Supabase-client (`createServerClient`).
  - Refresh sessie elke request.
  - Routes-config (`matcher`):
    - **Beschermd** (redirect naar `/login` als geen sessie): `/dashboard`, `/members`, `/donations`, `/imports`, `/onboarding`.
    - **Publiek** (geen redirect): `/login`, `/gift`, `/gift/*`, `/`, `/api/*`, statische assets.
  - Bij geldige sessie en pad `/login` → redirect naar `/dashboard` (kleine quality-of-life).
- `src/app/lib/supabase.ts` blijft de browser-client. Voor server-componenten en future server actions: nieuwe helper `src/app/lib/supabase-server.ts` die `createServerClient` uit `@supabase/ssr` exporteert.

**Niet in deze stap:** server-componenten van bestaande client-pagina's *omschrijven*. Middleware doet enkel session-refresh + route-guard; pagina's blijven zoals ze zijn.

### R6 — `.env.example` aanmaken

**Probleem:** Nieuwe dev (of de gebruiker zelf na maandenlange pauze) weet niet welke env-vars nodig zijn zonder `integrations.md` te lezen.

**Oplossing:** Bestand `.env.example` in repo-root, geen waarden, alleen keys, gesynchroniseerd met `docs/product/integrations.md` Vercel-tabel:

```
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
GIFT_ORGANIZATION_ID=
RESEND_API_KEY=
GIFT_FROM_EMAIL=
```

`integrations.md` krijgt een verwijzing naar `.env.example`.

### R7 — Echte logout via `supabase.auth.signOut()`

**Probleem:** logout gebeurt via `window.location.href = "/login"` (locatie nog te bevestigen in plan-fase, vermoedelijk in `AppShell` of `useAuth`). Sessie-cookie blijft achter → tabs raken out-of-sync, en met R3-middleware actief zou de user direct teruggestuurd worden naar `/dashboard`.

**Oplossing:**
- `await supabase.auth.signOut()` (clears local + remote session).
- Daarna `router.replace("/login")` of `window.location.href = "/login"` voor harde refresh.

---

## Volgorde

R1 als eerste, daarna R2 (samen "gift hardening" — dezelfde feature, kleine commit). R6 erna (puur docs, lage risico). Daarna R7 (lokale code-fix). R3 als laatste (raakt elke beschermde route, vereist nieuw dependency, meeste regressie-risico).

```
1. R1 — migration 006 (RLS gift_agreements)
2. R2 — verplichte GIFT_ORGANIZATION_ID-check in gift/actions.ts
3. R6 — .env.example + sync integrations.md
4. R7 — supabase.auth.signOut() op logout
5. R3 — middleware.ts + @supabase/ssr installatie
```

Tussen elke stap: `npm run build` groen + handmatige browser-check op de geraakte flow.

---

## Verificatie per stap (acceptatiecriteria)

| Stap | Verificatie |
|---|---|
| R1 | In Supabase Studio twee org-rijen aanmaken (`Org A`, `Org B`). Test-user A van Org A submit een gift; test-user B van Org B logt in en doet `select * from gift_agreements` → moet **0 rijen** geven. RLS-policy zichtbaar in Studio onder `gift_agreements > Policies`. |
| R2 | Op preview-deploy `GIFT_ORGANIZATION_ID` tijdelijk leeg → formulier indienen toont `"Server is niet correct geconfigureerd"`-toast, geen rij in DB. Met env terug erin → submission werkt zoals vandaag. |
| R6 | `.env.example` bevat exact de 5 keys uit `integrations.md` Vercel-tabel; `grep -r "process.env\." src/` toont geen extra keys. |
| R7 | Logout in tab A → in tab B refresh → automatisch redirect naar `/login`. `document.cookie` toont geen `sb-`-cookies meer voor het Supabase-project. |
| R3 | Uitgelogd `/dashboard` openen → 307 redirect naar `/login` zonder flash van protected content. Verlopen sessie (cookie expiry handmatig op verleden zetten) → middleware refresht binnen één request, geen logout. `/gift` blijft 200 zonder auth. |

End-to-end na alle stappen: `npm run build` + `npm run lint` groen. Handmatig: leden + donaties + gift-flow alle CRUD doorgelopen, geen regressies.

---

## Te documenteren in `decisions.md` (na uitvoer)

```
## 2026-05-01 — Security-hardening vóór SaaS-sprong

- **Beslissing:** gift_agreements SELECT-policy nu al org-scoped (via is_org_member),
  GIFT_ORGANIZATION_ID verplicht, middleware met @supabase/ssr ingevoerd, echte
  signOut() op logout. Niet wachten tot SaaS-sprong.
- **Waarom:** Defensief tegen onverhoeds aansluiten van een tweede moskee
  (decision 2026-04-29 stelt dat als voorwaarde, deze spec haalt de voorwaarde
  weg). RLS, middleware en env-check zijn klein, geïsoleerd en zouden bij
  SaaS-sprong tóch geschreven worden — vroeger doen voorkomt haastfouten.
- **Herzieningstrigger:** als de fix dev-flow breekt (gebruiker ziet eigen
  moskee niet meer in Supabase Studio met persoonlijke account) of als de
  middleware onverwachte redirects veroorzaakt op publieke routes.
```

---

## Bestanden geraakt (overzicht)

| Actie | Pad |
|---|---|
| Nieuw | `supabase/migrations/006_gift_agreements_rls_org_scope.sql` |
| Edit | `src/app/gift/actions.ts` |
| Nieuw | `.env.example` |
| Edit | `docs/product/integrations.md` |
| Edit | locatie van logout (te lokaliseren in plan-fase, vermoedelijk `src/app/components/AppShell.tsx` of `src/app/lib/useAuth.ts`) |
| Nieuw | `middleware.ts` (projectroot) |
| Nieuw | `src/app/lib/supabase-server.ts` |
| Edit | `package.json` (+`@supabase/ssr`) |
| Edit | `docs/product/decisions.md` (één entry) |

---

## Bewust niet in deze spec

- Geen wijziging in bestaande client-pages (`members`, `donations`, `dashboard`) — die werken zoals ze werken; org-filtering staat al goed (members/donations) of is een aparte polish-taak (dashboard, T1).
- Geen rate limiting / captcha op `/gift` (R5) — losse polish.
- Geen security-headers in `next.config.ts` (R4) — losse polish.
- Geen Pino-logger of error-mapping (T3, T6) — losse polish.

Polish-items zijn los te plannen na deze sprint.
