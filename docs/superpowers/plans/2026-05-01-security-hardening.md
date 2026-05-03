# Plan: Security-hardening sprint

> Spec: [`docs/superpowers/specs/2026-05-01-security-hardening-design.md`](../specs/2026-05-01-security-hardening-design.md)
>
> Volgorde uit spec: R1 → R2 → R6 → R7 → R3. Elke stap eindigt met `npm run build` groen + handmatige browser-check op de geraakte flow vóór we de volgende stap beginnen. Geen merge tot alle 5 groen zijn.

---

## File map

| Actie | Pad | In stap |
|---|---|---|
| Nieuw | `supabase/migrations/006_gift_agreements_rls_org_scope.sql` | R1 |
| Edit | `src/app/gift/actions.ts` | R2 |
| Nieuw | `.env.example` | R6 |
| Edit | `docs/product/integrations.md` | R6 |
| Edit | locatie van logout (lokaliseren in stap R7) | R7 |
| Nieuw | `middleware.ts` (projectroot) | R3 |
| Nieuw | `src/app/lib/supabase-server.ts` | R3 |
| Edit | `package.json` (+`@supabase/ssr`) | R3 |
| Edit | `docs/product/decisions.md` | na laatste stap |

---

## Stap R1 — `gift_agreements` SELECT-policy org-scoped

**Files:**
- Nieuw: `supabase/migrations/006_gift_agreements_rls_org_scope.sql`

- [ ] **R1.1** — Pre-check in Supabase Studio: `select count(*), count(organization_id) from public.gift_agreements;` om te weten hoeveel huidige rijen `organization_id is null` hebben. Resultaat noteren in eindrapport van deze stap. (Geen actie nodig op null-rijen — policy filtert ze straks weg; gebruiker zelf opruimen indien gewenst.)

- [ ] **R1.2** — Schrijf migration met de volgende inhoud:

```sql
-- Run once in the Supabase SQL editor.
-- Vervangt de open authenticated-SELECT-policy op gift_agreements door een
-- org-scoped policy, gebruikmakend van public.is_org_member() uit migration 003.
-- Voorbereiding op multi-tenant SaaS-sprong (zie decisions.md 2026-05-01).

drop policy if exists "authenticated users can read gift agreements"
  on public.gift_agreements;

drop policy if exists "gift_agreements_select_org"
  on public.gift_agreements;

create policy "gift_agreements_select_org"
  on public.gift_agreements for select
  to authenticated
  using (
    organization_id is not null
    and public.is_org_member(organization_id)
  );
```

- [ ] **R1.3** — Run migration in Supabase Studio (SQL editor → paste → Run). Controleer onder Authentication → Policies → `gift_agreements`: alleen 2 policies zichtbaar — `anon can submit a gift agreement` (insert) en `gift_agreements_select_org` (select).

- [ ] **R1.4** — Verifieer met test-account. Als er nu maar één org is: log in, doe `select * from gift_agreements` → moet bestaande rijen (met huidige `GIFT_ORGANIZATION_ID`) tonen. Zonder eigen `is_org_member`-resultaat → 0 rijen. (Voor multi-org-test moet gebruiker handmatig een 2e org + 2e auth-user opzetten — dit bevestigen we tijdens de SaaS-sprong, niet hier.)

- [ ] **R1.5** — `npm run build` lokaal → groen. (Migration raakt geen TS-code, build moet groen blijven.)

- [ ] **R1.6** — Stop hier en vraag akkoord vóór doorgaan naar R2.

---

## Stap R2 — `GIFT_ORGANIZATION_ID` verplicht

**Files:**
- Edit: `src/app/gift/actions.ts`

- [ ] **R2.1** — Open [src/app/gift/actions.ts](../../../src/app/gift/actions.ts), regel 38-49.

- [ ] **R2.2** — Vervang dit blok:

  ```ts
  const supabase = createClient(url, anonKey);
  const organizationId = process.env.GIFT_ORGANIZATION_ID || null;
  ```

  door:

  ```ts
  const supabase = createClient(url, anonKey);
  const organizationId = process.env.GIFT_ORGANIZATION_ID;
  if (!organizationId) {
    return {
      success: false,
      error: "Server is niet correct geconfigureerd. Neem contact op.",
    };
  }
  ```

  En verwijder het `|| null`-pad zodat de insert (regel 49) altijd een geldig UUID krijgt.

- [ ] **R2.3** — `npm run build` lokaal → groen.

- [ ] **R2.4** — Browser-check op `/gift`:
  - Met `GIFT_ORGANIZATION_ID` gezet (lokaal in `.env.local`): formulier doorlopen, submission slaagt, rij in DB heeft `organization_id` ingevuld.
  - Tijdelijk env-var leeghalen + dev-server herstarten: formulier indienen → toast met `"Server is niet correct geconfigureerd"`, geen rij in DB.
  - Env-var terug erin zetten.

- [ ] **R2.5** — Stop hier en vraag akkoord vóór doorgaan naar R6.

---

## Stap R6 — `.env.example` + sync `integrations.md`

**Files:**
- Nieuw: `.env.example`
- Edit: `docs/product/integrations.md`

- [ ] **R6.1** — `grep -rn "process\.env\." src/` om te bevestigen welke keys daadwerkelijk in code gebruikt worden. Vergelijk met `integrations.md` Vercel-tabel.

- [ ] **R6.2** — Maak `.env.example` met alleen keys, geen waarden:

  ```
  NEXT_PUBLIC_SUPABASE_URL=
  NEXT_PUBLIC_SUPABASE_ANON_KEY=
  GIFT_ORGANIZATION_ID=
  RESEND_API_KEY=
  GIFT_FROM_EMAIL=
  ```

  (Volgorde matcht `integrations.md`. Geen comments — `integrations.md` is de echte documentatie.)

- [ ] **R6.3** — Voeg in `integrations.md` (sectie *Vercel — hosting*, onder de env-tabel) een verwijzing toe: `> **Lokaal opzetten:** kopieer `.env.example` naar `.env.local` en vul waarden in.`

- [ ] **R6.4** — Verifieer: `cat .env.example` → exact bovenstaande 5 regels. `git status` toont alleen de twee bestanden als gewijzigd.

- [ ] **R6.5** — Stop hier en vraag akkoord vóór doorgaan naar R7.

---

## Stap R7 — Echte logout

**Files:**
- Edit: locatie van logout (te lokaliseren)

- [ ] **R7.1** — Lokaliseer de logout-handler:

  ```bash
  grep -rn "window.location.href" src/app/
  grep -rn "/login" src/app/components/
  ```

  Verwacht in `AppShell.tsx`, `useAuth.ts`, of een header-component.

- [ ] **R7.2** — Vervang de redirect-only regel:

  ```ts
  // voor
  window.location.href = "/login";

  // na
  await supabase.auth.signOut();
  window.location.href = "/login";
  ```

  Of als de component `useRouter` gebruikt: `router.replace("/login")`. `signOut()` ruimt de cookies + localStorage op; de redirect zorgt voor harde reset.

- [ ] **R7.3** — `npm run build` → groen.

- [ ] **R7.4** — Browser-check:
  - Inloggen, in DevTools → Application → Cookies kijken: `sb-…-auth-token` cookies aanwezig.
  - Logout-knop klikken: na redirect zijn die cookies weg.
  - Refresh `/dashboard`: weer `useAuth()` redirect naar `/login` (en straks na R3: server-side redirect).

- [ ] **R7.5** — Stop hier en vraag akkoord vóór doorgaan naar R3.

---

## Stap R3 — `middleware.ts` met `@supabase/ssr`

**Files:**
- Edit: `package.json` (+`@supabase/ssr`)
- Nieuw: `src/app/lib/supabase-server.ts`
- Nieuw: `middleware.ts`

- [ ] **R3.1** — Installeer dependency:

  ```bash
  npm install @supabase/ssr
  ```

- [ ] **R3.2** — Maak `src/app/lib/supabase-server.ts`:

  ```ts
  import { createServerClient } from "@supabase/ssr";
  import { cookies } from "next/headers";

  export async function createSupabaseServerClient() {
    const cookieStore = await cookies();
    return createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      {
        cookies: {
          getAll: () => cookieStore.getAll(),
          setAll: (entries) => {
            for (const { name, value, options } of entries) {
              cookieStore.set(name, value, options);
            }
          },
        },
      }
    );
  }
  ```

  (Helper voor toekomstige server-componenten — middleware krijgt zijn eigen client-config in stap R3.3.)

- [ ] **R3.3** — Maak `middleware.ts` in projectroot volgens [Supabase SSR-recept voor Next.js App Router](https://supabase.com/docs/guides/auth/server-side/nextjs):

  ```ts
  import { createServerClient } from "@supabase/ssr";
  import { NextResponse, type NextRequest } from "next/server";

  const PROTECTED_PREFIXES = [
    "/dashboard",
    "/members",
    "/donations",
    "/imports",
    "/onboarding",
  ];

  export async function middleware(request: NextRequest) {
    let response = NextResponse.next({ request });

    const supabase = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      {
        cookies: {
          getAll: () => request.cookies.getAll(),
          setAll: (entries) => {
            for (const { name, value } of entries) {
              request.cookies.set(name, value);
            }
            response = NextResponse.next({ request });
            for (const { name, value, options } of entries) {
              response.cookies.set(name, value, options);
            }
          },
        },
      }
    );

    const { data: { user } } = await supabase.auth.getUser();

    const path = request.nextUrl.pathname;
    const isProtected = PROTECTED_PREFIXES.some((p) => path === p || path.startsWith(`${p}/`));

    if (isProtected && !user) {
      const url = request.nextUrl.clone();
      url.pathname = "/login";
      return NextResponse.redirect(url);
    }

    return response;
  }

  export const config = {
    matcher: [
      "/((?!api|_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
    ],
  };
  ```

  > **Let op:** matcher sluit `/api` en statische assets uit. `/gift`, `/login`, `/` lopen wel door middleware (voor session-refresh) maar zijn niet in `PROTECTED_PREFIXES`.

- [ ] **R3.4** — `npm run build` → groen. Eventuele TS-fouten (bv. cookie-API verschillen tussen Next 15 en 16) ter plekke oplossen — referentie: actuele [@supabase/ssr-docs](https://supabase.com/docs/guides/auth/server-side/nextjs).

- [ ] **R3.5** — Browser-check:
  - Uitgelogd: `/dashboard` → 307 redirect naar `/login`, geen flash.
  - Uitgelogd: `/gift` → 200, formulier laadt.
  - Uitgelogd: `/login` → 200.
  - Ingelogd: `/dashboard` → 200, geen redirect.
  - Ingelogd in tab A → tab B logt uit → tab A op refresh: middleware-redirect naar `/login` (nu dat session weg is).

- [ ] **R3.6** — Stop hier; rapporteer alle 5 stappen samen + noteer of `useAuth()`-hook in pages nog meerwaarde heeft (mogelijk redundant na R3, maar opruimen is aparte polish-taak).

---

## Stap "afronden" — `decisions.md` entry

- [ ] **A.1** — Voeg in `docs/product/decisions.md` de entry uit de spec sectie *Te documenteren in decisions.md* toe (datum 2026-05-01, beslissing/waarom/herzieningstrigger).

- [ ] **A.2** — Toon `git status` + `git diff` aan de gebruiker. Vraag of er gecommit + gepusht moet worden (per CLAUDE.md werkregel: nooit committen tenzij gevraagd).

---

## Risico's en mitigations

| Risico | Mitigation |
|---|---|
| Migration 006 breekt huidige Supabase Studio-zicht voor de gebruiker (admin-account is geen `organization_member`) | Stap R1.4 controleert dit vóór we doorgaan. Mocht het breken: gebruiker handmatig toevoegen aan `organization_members` van zijn eigen org. |
| `@supabase/ssr` API verschilt tussen Next 15 en 16 | Stap R3.4 vangt build-fouten op, oplossen via actuele docs. Bij blokkade: middleware tijdelijk uit-zetten en stap R3 later doen — eerst R1+R2 erin krijgen, die staan apart. |
| Logout-handler op meerdere plekken | Stap R7.1 grep'et eerst; alle vindplaatsen krijgen dezelfde behandeling. |
| `npm run build` faalt om andere reden (bv. recente Next-versie issue) | Stop op die stap; eerst build-fout oplossen vóór de spec verdergaat. Niet doorpushen. |
| Multi-org test echt nodig vóór SaaS-sprong | Spec accepteert single-org-verificatie nu; volledige multi-org-acceptatie hoort bij SaaS-sprong (`roadmap.md`). |

---

## Done-criterium

- 5 commits (één per R-stap) of één gebundelde commit met duidelijk message — keuze aan gebruiker.
- `npm run build` + `npm run lint` groen.
- Bovenstaande verificaties handmatig doorlopen, screenshot/log van elke stap als bijlage.
- `decisions.md`-entry toegevoegd.
- Geen wijzigingen aan `members`/`donations`/`dashboard`-pagina's.
