# Beslissingenlog

Een chronologische lijst van belangrijke product- en architectuurkeuzes. **Doel:** voorkomt dat dezelfde discussie steeds opnieuw gevoerd wordt en geeft toekomstige sessies (en jezelf over 3 maanden) context over het *waarom*.

**Format per entry:**
```
## YYYY-MM-DD — [Titel]
- **Beslissing:** wat we kiezen
- **Waarom:** de redenering
- **Herzieningstrigger:** wanneer deze keuze terug op tafel mag
```

---

## 2026-04-27 — A → C zonder B-tussenstap

- **Beslissing:** Eerst eigen moskee compleet bouwen (fase A), daarna direct naar publieke SaaS (fase C). Geen B-tussenstap met 2-3 bevriende moskeeën.
- **Waarom:** Eigen moskee is realistisch testterrein. B voegt complexiteit toe (handmatig accounts beheren) zonder de scope-keuzes voor SaaS te beantwoorden.
- **Herzieningstrigger:** Als andere moskeeën spontaan willen meekijken vóór de SaaS-sprong klaar is.

## 2026-04-27 — C-ready code in fase A

- **Beslissing:** Elke nieuwe tabel krijgt `organization_id`. Elke query filtert op de huidige moskee, ook al is er er nu maar één. Geen RLS-policies actief, geen onboarding, geen Stripe — maar geen hardcoded "Nieuwe Moskee".
- **Waarom:** Bij A → C zonder tussenstap is anders een grote refactor nodig (data migreren, code herschrijven). 10% extra denkwerk per feature nu, voorkomt weken pijn later.
- **Herzieningstrigger:** Als blijkt dat het toch single-tenant blijft (onwaarschijnlijk).

## 2026-04-27 — Werkritme full-time

- **Beslissing:** Project wordt full-time (6-8 uur/dag) gebouwd tot MVP klaar.
- **Waarom:** Bepaalt tempo-aannames (~2-3 weken voor MVP-bouw, ~4-5 weken naar eerste betalende moskee).
- **Herzieningstrigger:** Bij verandering van levenssituatie / werk.

## 2026-04-27 — Markdown-docs in repo, geen Notion/Trello

- **Beslissing:** Productvisie, scope, roadmap, beslissingen en ideeën in `docs/product/` als markdown. Geen Notion-wiki, geen Trello-bord, geen Linear-project.
- **Waarom:** Claude Code leest markdown direct (context per sessie). Versionering met code. Geen sync-problemen. Voor één developer + één AI-collega is een tweede tool overhead.
- **Herzieningstrigger:** Als niet-tech mensen (bestuursleden, eerste klanten) ook moeten meelezen → dan eventueel mirror naar Notion.

## 2026-04-27 — Form builder en AI-hulp uit MVP

- **Beslissing:** Geen form builder *(zelf formulieren ontwerpen)* en geen AI-hulp in MVP.
- **Waarom:** Beide hebben volledig open scope (een form builder kan een eigen product worden; AI kan álles betekenen). Eerst basis solide.
- **Herzieningstrigger:** AI-hulp komt op LATER-roadmap met regel "smalle scope wanneer het zover is" (bijv. "genereer ANBI-jaarrapport"). Form builder pas overwegen als meerdere moskeeën erom vragen.

## 2026-04-27 — Cashgeld-formulier IN MVP

- **Beslissing:** Cashgeld-/kwitantie-formulier voor vrijwilliger op telefoon is must-have voor MVP. Vrijwilliger vult bedrag, donateur (optioneel), doel, evt. foto van papieren kwitantie. PDF naar donateur, record in `donations`-tabel.
- **Waarom:** Unieke pijler, geen concurrent heeft dit. Lost een kernprobleem van moskeeën op (cash dat verdwijnt) en is sterk verkoopargument richting SaaS-fase.
- **Herzieningstrigger:** Als eerste maand gebruik laat zien dat het te weinig gebruikt wordt.

## 2026-04-27 — Toezegging-reminders handmatig in MVP

- **Beslissing:** Reminder-functie is een knop op de toezegging-detail-page ("Stuur reminder"). Geen automatisering via cron in MVP.
- **Waarom:** Cron-jobs op Vercel zijn extra setup, testen en rate-limiting (~3-4 dagen werk + risico). Een knop is ~1 dag werk en geeft penningmeester juist controle ("ik wil niet dat iemand twee keer dezelfde dag een mail krijgt").
- **Herzieningstrigger:** Automatische reminders staan op LATER-roadmap, na MVP.

## 2026-04-27 — Rolmodel: 3 rollen, alleen in DB voor MVP

- **Beslissing:** Rollen `admin` (penningmeester), `board` (bestuur/secretaris), `committee` (commissielid) op `organization_members`. **MVP:** alleen het DB-veld bestaat, code respecteert het, maar UI is voor iedereen hetzelfde — iedereen die ingelogd is kan alles. **SaaS-fase:** echte permissies + UI per rol.
- **Waarom:** Drie rollen kwamen natuurlijk uit het gesprek met de gebruiker. Volledig rolmodel in MVP zou ~1 week extra kosten zonder dat de eigen moskee er nog last van heeft.
- **Herzieningstrigger:** Als bij een eerste betalende moskee blijkt dat ze het wél nodig hebben vóór de SaaS-fase volledig staat.

## 2026-04-27 — Standalone publieke formulier-flow vóór dashboard-integratie

- **Beslissing:** ANBI-donatieformulier wordt eerst gebouwd als standalone publieke route `/gift` (zonder auth), pas later geïntegreerd in het admin-dashboard. Cashgeld-formulier krijgt later dezelfde aanpak.
- **Waarom:** Eerst snel een werkbare flow waar de moskee iets mee kan, in plaats van te wachten op het complete dashboard. Penningmeester gebruikt voor MVP de Supabase Studio-tabel om inzendingen te bekijken; geen apart dashboard nodig.
- **Herzieningstrigger:** Wanneer dashboard ver genoeg is om een "Inzendingen"-view toe te voegen — dan wordt de route geïntegreerd (UI hetzelfde, route blijft bestaan).

## 2026-04-27 — Resend voor transactionele e-mail

- **Beslissing:** `resend` wordt de e-mail-provider voor MVP transactionele mail (gift-bevestiging, password-reset, toezegging-reminder).
- **Waarom:** Moderne API, gratis tier (3000 mails/maand) ruim voldoende voor MVP, simpele Next.js Server Action integratie. Alternatieven (Postmark, SendGrid) zijn duurder; Supabase Auth-mails dekken alleen auth-flow.
- **Herzieningstrigger:** Bij volume > 3000/maand (LATER) of als deliverability-issues opduiken.

## 2026-04-27 — react-signature-canvas voor handtekening

- **Beslissing:** `react-signature-canvas` library voor digitale handtekening (gift-flow + later cashgeld-flow).
- **Waarom:** Beproefd, klein (~200KB), ondersteunt touch native (essentieel voor mobiel cashgeld-formulier), simpel API. Eigen canvas-implementatie kostte meer tijd zonder voordeel.
- **Herzieningstrigger:** Als blijkt dat output-PNG niet voldoet aan ANBI-eisen of slecht renderd in PDF (M4).

## 2026-04-27 — Bolt-design vrij interpreteren met shadcn

- **Beslissing:** Het Bolt.new-mockup van het gift-formulier dient als inspiratie voor structuur (5 stappen) en sfeer (cream + groen). De implementatie gebruikt jullie bestaande shadcn-componenten en Tailwind-tokens, niet een pixel-perfect kopie.
- **Waarom:** Past automatisch in het rest-systeem, makkelijker later te integreren in dashboard, geen drift van design system.
- **Herzieningstrigger:** Geen — designsysteem moet één bron van waarheid hebben.

## 2026-04-29 — Moskee-info hardcoded tot SaaS-sprong, dan in één sweep dynamisch maken

- **Beslissing:** In de gift-flow (mail-template, overeenkomsttekst, footer-card) blijven moskee-specifieke velden hardcoded tot de SaaS-sprong. Dat zijn: moskee-naam ("Nieuwe Moskee Enschede"), juridische naam ("HDV Selimiye / HDV Anadolu"), RSIN (`805141200`), IBAN (`NL33 ABNA 0550 1441 96`), en contact-e-mail (`financien@enschedecamii.nl`). Tijdens de SaaS-sprong worden ze in één pass vervangen door lookups op de `organizations`-rij van de inzending — concrete subtaken in `roadmap.md`.
- **Waarom:** Voor MVP-fase A (één moskee) voegt het toe complexiteit zonder waarde. Bouwen van DB-driven configuratie is een eenmalige, lineaire klus die past in de SaaS-sprong (~halve dag werk). Incrementeel maken zou meer werk zijn.
- **Voorwaarde:** geen tweede moskee mag het systeem testen vóór de SaaS-sprong. Als dat toch gewenst is → eerst sweep doen.
- **Herzieningstrigger:** Als een tweede moskee plotseling in MVP wil meedraaien, of als de hardcoded waarden in code te veel plekken raken om nog overzichtelijk te beheren.

## 2026-04-29 — SaaS heet Mosqon, drie domeinen geregistreerd

- **Beslissing:** SaaS-product heeft de naam **Mosqon**. Drie domeinen geregistreerd: `mosqon.com` (primary), `mosqon.nl` en `mosqon.io` (allebei 301-redirect naar `mosqon.com`).
- **Waarom:** `.com` is internationaal default en bouwt één SEO-reputatie op. `.nl` opvangen voor NL-doelgroep die instinctief `.nl` typt. `.io` voor brand-bescherming, geen aparte site nodig.
- **Herzieningstrigger:** Als blijkt dat NL-doelgroep `.nl` als hoofd-domein verwacht (bijv. door zoekopdrachten / vertrouwen) → switchen primary naar `mosqon.nl`.

## 2026-04-29 — Centraal sender-domein voor SaaS-fase (Pad A)

- **Beslissing:** In SaaS-fase versturen we alle transactionele mails (gift-bevestiging, donatiebevestiging, password-reset, toezegging-reminder) vanuit één centraal subdomein **`notificatie.mosqon.com`** op het Mosqon-domein, niet vanuit per-moskee geverifieerde domeinen. Format: `Nieuwe Moskee Enschede <gift@notificatie.mosqon.com>` met `Reply-To` op het e-mailadres van de moskee zelf, zodat antwoorden bij de penningmeester aankomen.
- **Waarom:** Eén DNS-setup voor alle klanten, één e-mailreputatie om op te bouwen (en alle nieuwe moskeeën profiteren ervan), geen onboarding-friction — een vrijwilliger hoeft geen DNS-records te configureren. Per-moskee verified domains (Pad B) geeft sterkere branding maar vereist een onboarding-flow voor domain-verification, en `Reply-To` dekt 90% van de "het lijkt echt van de moskee"-behoefte.
- **MVP-implicatie:** Subdomein `notificatie.mosqon.com` is **al door de gebruiker aangemaakt** in DNS. Resterende stap: domein bij Resend verifiëren (DNS records voor SPF/DKIM/DMARC). Daarna kan `GIFT_FROM_EMAIL` direct switchen van `onboarding@resend.dev` naar `gift@notificatie.mosqon.com` — geen wachten op SaaS-sprong nodig.
- **Herzieningstrigger:** Als een ANBI-moskee om compliance-overwegingen vereist dat mails vanaf hun eigen domein komen (zeldzaam), kan voor die moskee Pad B aangezet worden zonder de standaard te wijzigen.

## 2026-04-27 — Niet-doelen vastgelegd

- **Beslissing:** Volgende categorieën zijn definitief geen doel: boekhouding, publieke website/CMS, publieke event-ticketing, gebedstijden/Quran-features, e-mail-marketing, multi-vestiging-per-account, native mobiele app voor leden.
- **Waarom:** Andere tools doen dit beter. Scope-discipline.
- **Herzieningstrigger:** Geen — deze blijven uit. Zie `vision.md` voor de volledige redenering.
