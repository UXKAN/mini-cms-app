# Integraties — env vars en setup

Praktische referentie van wat per externe service nodig is voor dit project. **Geen secrets in dit bestand** — alleen variabele-namen, formats en waar ze ingesteld moeten staan. Waarden blijven in dashboards en `.env.local`.

Zie [`CLAUDE.md`](../../CLAUDE.md) sectie "Externe services en integraties" voor de werkafspraken hieromheen.

---

## Vercel — hosting

**Doel:** Next.js productie + preview deploys. Productie op `app.mosqon.com`.

**Toegang voor Claude:** ✅ via `npx vercel@52.2.1` (project gelinkt in `.vercel/`, ingelogd als `uxkan`).

**Veelgebruikte commands:**
```bash
npx vercel@52.2.1 env ls                            # alle env vars + scopes
npx vercel@52.2.1 logs --no-follow --since 10m -x   # laatste 10 min logs, expanded
npx vercel@52.2.1 redeploy <url> --target production
npx vercel@52.2.1 env add <NAME> production --value "..." --yes
```

**Env vars (alle Production + Preview tenzij anders):**

| Naam | Doel | Bron |
|---|---|---|
| `NEXT_PUBLIC_SUPABASE_URL` | Supabase REST endpoint | Supabase → Project Settings → API |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Supabase anon (public) key | Supabase → Project Settings → API |
| `RESEND_API_KEY` | Resend API key voor mail | Resend → API Keys |
| `GIFT_FROM_EMAIL` | From-adres voor gift-bevestigingen, format: `Naam <gift@m.mosqon.com>` | handmatig samengesteld |
| `GIFT_ORGANIZATION_ID` | UUID van de moskee in `organizations` tabel (optioneel, voor multi-tenant) | Supabase Studio → tabel `organizations` |

**Custom domains gekoppeld aan project `mini-cms-app`:**
- `app.mosqon.com` (production) — CNAME bij Cloud86 → `cname.vercel-dns.com`
- `mini-cms-app.vercel.app` (Vercel default)

**Bekende beperkingen:**
- CLI v52: "all preview branches" via `vercel env add ... preview --yes` werkt niet in non-interactive mode. Workaround: specifieke branch opgeven (`preview <branch>`) of via dashboard "All Preview Branches" toggle.
- CLI v53.0.1 is broken op npm registry — pin altijd op `vercel@52.2.1`.

---

## Supabase — database, auth, storage

**Doel:** Postgres-database, authenticatie (e-mail + wachtwoord), file storage.

**Toegang voor Claude:** ❌ geen CLI in deze sessie — dashboard-instructies geven.

**Belangrijke configuratie (Authentication → URL Configuration):**

| Setting | Waarde |
|---|---|
| Site URL | `https://app.mosqon.com` |
| Redirect URLs | `https://app.mosqon.com/**` + `https://mini-cms-app.vercel.app/**` + `http://localhost:3000/**` |

**API keys (Project Settings → API):**
- `anon` (public) key → in env var `NEXT_PUBLIC_SUPABASE_ANON_KEY`. Mag in browser-bundles staan (RLS beschermt data).
- `service_role` key → NIET gebruikt in MVP. Bypassed RLS. Alleen voor server-side admin-acties als die ooit nodig zijn.

**Tabellen:** zie `supabase/migrations/`. Elke tabel heeft `organization_id` voor multi-tenant. Bestaande tabellen: `members`, `donations`, `imports`, `import_rows`, `organizations`, `organization_members`, `gift_agreements`.

---

## Resend — transactionele e-mail

**Doel:** Gift-bevestiging nu, later donatie-bevestiging, password-reset, toezegging-reminder.

**Toegang voor Claude:** ❌ geen CLI — dashboard-instructies.

**Belangrijke configuratie:**

| Setting | Waarde / locatie |
|---|---|
| Verified domain | `m.mosqon.com` (Resend → Domains → ✅ Verified) |
| API key | scope minimaal "Sending access" (Resend → API Keys) |
| From-email | `Naam <gift@m.mosqon.com>` — gebruikt in `GIFT_FROM_EMAIL` env var |

**Belangrijke regels:**
- From-domein achter de `@` MOET een verified domain in Resend zijn — anders 422 "domain not verified"
- Format MOET `email@example.com` of `Naam <email@example.com>` zijn — anders 422 "invalid from field"
- API key fout = 401 "API key is invalid". Check via `vercel logs` op `[gift] mail error`.

---

## Cloud86 — DNS + mailbox

**Doel:** DNS voor `mosqon.com` + mailbox voor `dmarc@mosqon.com`.

**Toegang voor Claude:** ❌ geen — gebruiker handmatig via [my.cloud86.io](https://my.cloud86.io) (DirectAdmin).

**DNS records op `mosqon.com`:**

| Type | Name | Doel |
|---|---|---|
| `CNAME` | `app` | Verwijst `app.mosqon.com` naar Vercel (`cname.vercel-dns.com`) |
| `TXT` | `_dmarc` | DMARC-policy voor mail-authenticatie (huidig: `p=none`, zie `decisions.md` 2026-05-01) |
| (SPF/DKIM op `m.mosqon.com`) | door Resend ingesteld | Resend domain-verification |

**Mailboxen:**
- `dmarc@mosqon.com` — alias naar admin, voor DMARC-rapporten

---

## Wanneer een nieuwe service erbij komt

Stappen om consistent te blijven:

1. **Documenteer hier eerst** een nieuwe sectie: doel, toegang voor Claude, env vars, dashboard-config, DNS-records.
2. **Voeg env-var-namen toe aan Vercel** (Production + Preview) via CLI of dashboard.
3. **Voeg lokaal toe aan `.env.local`** voor dev (niet committen — `.env.local` staat in `.gitignore`).
4. **Log een entry in `decisions.md`** als de keuze impact heeft op architectuur of werkafspraken (bijv. "we gebruiken Stripe i.p.v. Mollie").
5. **Werk eventueel `CLAUDE.md` bij** als de nieuwe service nieuwe CLI-tools introduceert die Claude moet kennen.
