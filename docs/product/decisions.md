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

## 2026-05-01 — Claude beheert externe integraties actief

- **Beslissing:** Claude is proactief verantwoordelijk voor het koppelen, controleren en uitvoeren van taken rondom externe tools (Vercel, Supabase, Resend, Cloud86, en toekomstige services). De gebruiker hoeft niet zelf uit te zoeken welke stappen nodig zijn — Claude geeft commands en instructies waar nodig en voert zelf uit waar er CLI-toegang is.
- **Waarom:** Externe-service-setup en debugging kost veel tijd als de gebruiker handmatig moet schakelen tussen dashboards. Tijdens Vercel/Resend-setup op deze dag bleek dat Claude met directe CLI-toegang veel sneller debugt (logs ophalen, env vars verifiëren, redeploys triggeren). Dit voorkomt screenshot-foutopsporing-loops.
- **Concrete werkafspraken:** Zie sectie "Externe services en integraties" in `CLAUDE.md`. Praktische env-var- en config-referentie staat in `docs/product/integrations.md`.
- **Veiligheid:** Geen secrets/keys in markdown of repo. Alleen variabele-namen + waar ze ingesteld moeten staan. Bij destructieve acties (DNS, env var rm, redeploy) eerst korte uitleg + bevestiging vragen voordat Claude uitvoert.
- **Herzieningstrigger:** Als Claude te autonoom wijzigingen doorvoert die niet gewenst zijn, of juist te terughoudend is ondanks beschikbare CLI-toegang. Beide kunnen leiden tot scherpere afspraken.

## 2026-05-03 — Datamodel v2 + service-role voor gift-formulier-transacties

- **Beslissing:** Datamodel uitgebreid voor formulier-naar-dashboard-flow zonder dubbele telling. Spec: `docs/superpowers/specs/2026-05-02-datamodel-design.md` v2. Concreet:
  - Nieuwe tabel `pledges` (mondelinge toezeggingen, alleen schema in deze ronde, UI later).
  - `donations` krijgt matching-kolommen (`pledge_id`, `gift_agreement_id`, `signature_png`, `receipt_photo_url`, `source`, `external_ref`) + partial unique index voor MT940/Stripe-dedup.
  - `gift_agreements` krijgt `payment_method_intent` / `payment_status` / `paid_at` (eenmalige), `wants_membership` (periodieke), `agreement_status` (overeenkomst-cyclus, los van betaalstatus), `member_id` (FK naar members).
  - `members.user_id` en `donations.user_id` gemaakt nullable — anon-flow vanuit `/gift` heeft geen verantwoordelijke user.
  - Bedrag-in-letters bewust **weggelaten**: cijfer + bevestigingsmail volstaat juridisch voor MVP.
  - **`SUPABASE_SERVICE_ROLE_KEY` toegevoegd** — gebruikt in `src/app/gift/actions.ts` voor de transactie-inserts (gift_agreement + optioneel donation + optioneel member). Bypassed RLS, alleen server-side.
- **Waarom:** Zonder deze structuur zou het dashboard ofwel onmogelijk te tellen zijn, ofwel bedragen dubbel tellen (lid + periodieke gift). Service-role gekozen boven `@supabase/ssr` vroeg-trekken: snelste pad naar werkende flow, refactor naar cookie-aware client kan later in R3 (middleware-sprint).
- **Veiligheid:** Service-role staat alleen in `.env.local` en op Vercel server-env, nooit in client-bundle. Input van `/gift`-formulier wordt door Zod gevalideerd (inclusief `akkoord = true`) vóór er iets wordt geschreven.
- **Herzieningstrigger:** Wanneer middleware-sprint (R3) wordt afgerond — dan kunnen de inserts ook via authenticated server-client met cookies. Service-role-pad blijft alleen voor specifieke admin-acties die expliciet RLS moeten bypassen.

## 2026-05-04 — Goud als donatievorm verschuift naar SaaS-fase

- **Beslissing:** Goud (gewichtsbedrag in gram) als alternatieve donatievorm naast cash/bank/online wordt **niet** in MVP gebouwd. Verplaatst naar SaaS-sprong-lijst. Geen `method='gold'` CHECK-uitbreiding, geen `amount_grams`-kolom, geen UI-keuze.
- **Waarom:** Goud is feitelijk een tweede valuta met eigen ANBI-overwegingen (waardering in EUR-equivalent, datum-koers, registratie voor jaaroverzicht). Een nette implementatie vereist datamodel-keuzes (gram vs EUR, hoe in dashboard tellen, hoe in ANBI-export) die de toezeggingen-pijler-scope opblazen. Voor MVP-fase A is registratie via `method='other'` met omschrijving als beschrijvende tekst voldoende — niet ideaal maar werkbaar.
- **Vereist later:** migratie nieuwe `method='gold'` waarde + `amount_grams numeric` kolom + UI-keuze in gift-form en donaties-CRUD + ANBI-jaaroverzicht-aanpassing voor goud-rijen.
- **Herzieningstrigger:** Bij SaaS-sprong of als Nieuwe Moskee in MVP-fase signaleert dat goud-donaties zo regelmatig binnenkomen dat workaround via `method='other'` administratief onhoudbaar is.

## 2026-05-04 — Toezeggingen-pijler toont gemengde lijst (pledges + onbetaalde gift_agreements)

- **Beslissing:** De `/toezeggingen`-pagina toont **één gemengde lijst** met twee bronnen:
  1. `pledges`-rijen (mondelinge / e-mail / na-evenement-toezeggingen) met `status` IN ('open', 'partial')
  2. `gift_agreements`-rijen waar `type='eenmalige'` AND `payment_status` IN ('unpaid', 'partial') — dit zijn ondertekende ANBI-akten waarvoor het geld nog niet binnen is
  Een type-badge per rij ("Mondeling" / "ANBI-akte") maakt het visueel onderscheid. CRUD (add/edit/delete) is alleen mogelijk voor `pledges`; ANBI-akten komen via `/gift` binnen en worden niet handmatig aangemaakt of verwijderd. Beide brontypen kunnen via een "→ Markeer als betaald"-knop een `donation`-rij genereren met de juiste FK (`pledge_id` of `gift_agreement_id`).
- **Waarom:** Vanuit de penningmeester-blik is "wat is er aan geld toegezegd dat nog niet binnen is" één vraag, ongeacht of het mondeling of via ANBI-akte was. Twee aparte tabs zou kunstmatige scheiding zijn op basis van datamodel-detail dat de gebruiker niet hoeft te kennen. Eén lijst met badge schaalt goed tot honderden rijen.
- **Implicatie:** Sortering op datum is een mix van `pledged_at` (pledges) en `akkoord_at` (gift_agreements) — gebruiken we als gemeenschappelijk "toegezegd-op"-veld in de UI.
- **Herzieningstrigger:** Als gebruikers signaleren dat ze de twee bronnen écht apart willen zien, of als kolom-vereisten zo verschillend worden dat één tabel onhandig is.

## 2026-05-04 — Veldnaamgeving "Omschrijving" voor publiek doel-veld

- **Beslissing:** Het tekstveld voor "wat is dit voor donatie / toezegging" heet in de UI **"Omschrijving"** en wordt overal hetzelfde gelabeld (`/donaties` CRUD, `/toezeggingen` CRUD, `/gift`-formulier voor eenmalige). DB-namen blijven ongewijzigd (`donations.notes`, `pledges.purpose`, nieuwe `gift_agreements.purpose`). Eén veld per entiteit — geen aparte "publiek" + "intern"-velden.
- **Waarom:** Status-check 2026-05-04 wees uit dat het bestaande "Notities"-label op `/donaties` met placeholder "Omschrijving, doel, etc." al in praktijk als omschrijvingsveld werd gebruikt. Eén consistente term voorkomt verwarring; rename in UI is goedkoper dan extra DB-kolom + dubbele invoer. Pledges had al een aparte `purpose`-kolom; voor `gift_agreements` komt er een vergelijkbare `purpose`-kolom bij (migratie 012).
- **Implicatie:** Bij eenmalige donatie via `/gift` schrijft de actie de omschrijving zowel naar `gift_agreements.purpose` (akte-record) als — bij `payment_status='paid'` — naar `donations.notes` (de bijhorende donation). Bij latere matching van een onbetaalde akte wordt de purpose meegekopieerd naar de nieuwe donation.
- **Herzieningstrigger:** Als blijkt dat penningmeester én publieke schenker écht andere informatie kwijt willen in dezelfde tabel — dan komt er een tweede veld bij.

## 2026-05-03 — Cashgeld-formulier verschuift naar SaaS-fase

- **Beslissing:** Cashgeld-/kwitantie-formulier (mobile-first, vrijwilliger op telefoon) wordt verplaatst van MVP naar SaaS-fase. Voor MVP blijft cash registreren mogelijk via `/donaties` CRUD met `method='cash'`. Geen aparte publieke route, geen eigen mobile-flow. De bestaande `donations.signature_png` en `donations.receipt_photo_url` kolommen blijven staan voor wanneer de feature er wel komt.
- **Waarom:** Status-check op 2026-05-03 liet zien dat de feature waardevol is (unieke pijler) maar geen blokker voor MVP-fase A — de eigen moskee kan cash ook registreren via de admin-CRUD. Verschuiven verkleint de MVP-scope met ~3-5 dagen werk; focus blijft bij toezeggingen-UI, member detail en gift-modal-pivot.
- **Vervangt:** decision 2026-04-27 — Cashgeld-formulier IN MVP.
- **Herzieningstrigger:** Bij voorbereiding SaaS-fase, of als de eigen moskee in MVP signaleert dat handmatige donaties-CRUD niet volstaat voor cash.

## 2026-05-03 — /evenementen verschuift naar SaaS-fase

- **Beslissing:** `/evenementen` (CRUD + interne registraties) wordt verplaatst van MVP naar SaaS-fase. Geen `events`- of `event_registrations`-tabellen in MVP, geen route, geen UI. De lege placeholder-card op het dashboard mag blijven tot de pagina daadwerkelijk gebouwd wordt.
- **Waarom:** Status-check op 2026-05-03 liet zien dat evenementen geen interactie hebben met de drie hoofdpijlers (leden, donaties, toezeggingen) en geen invloed op dashboard-tellingen. Verschuiven verkleint de MVP-scope zonder de kernfunctionaliteit aan te tasten.
- **Vervangt:** entry "Evenementen CRUD + interne registraties" in `mvp-scope.md` WEL-lijst.
- **Herzieningstrigger:** Bij SaaS-fase, of als de eigen moskee in MVP signaleert dat ze evenement-registraties echt willen gebruiken.

## 2026-05-03 — /gift wordt fullscreen modal in dashboard met share-pattern

- **Beslissing:** Het ANBI-donatieformulier krijgt een nieuwe vorm: een **fullscreen modal binnen het dashboard**, geopend via een "Formulier"-knop. Binnen de modal kan de gebruiker het formulier beheren én delen via een **Figma-stijl share-pattern** (openbare link, of toegang beperkt tot organisatie of specifiek e-maildomein). Latere uitbreiding: rechten view/fill/manage.
  - **MVP-scope:** modal-trigger + bestaand formulier-werk. Standalone route `/gift` blijft voorlopig bestaan voor backward compatibility, maar de modal-flow wordt de hoofdingang.
  - **SaaS-fase:** share-link genereren, organisatie-/domein-restricties, rechten view/fill/manage. Public-link is dus géén MVP-feature meer.
- **Waarom:** Status-check op 2026-05-03 leverde een UX-shift op: het formulier wordt een dashboard-feature in plaats van een aparte route. Dat past bij hoe het bestuur het formulier intern wil delen met commissieleden, bestuurders of vrijwilligers zonder volledige dashboard-toegang. Het Figma-share-pattern geeft fijnmazige controle zonder een compleet rollen-/permissies-systeem te bouwen.
- **Vervangt deels:** decision 2026-04-27 — Standalone publieke formulier-flow vóór dashboard-integratie. Standalone route blijft, maar is niet meer de hoofdflow.
- **Vervangt deels:** decision 2026-05-02 — /gift tijdelijk achter login. Login-gating blijft relevant voor de standalone route; modal is per definitie ingelogd.
- **Voorvereiste:** eigen UX-spec voor modal + share-pattern voordat er gebouwd wordt.
- **Herzieningstrigger:** Bij oplevering UX-spec, of als gebruikersfeedback laat zien dat een standalone publieke link alsnog gewenst is.

## 2026-05-02 — /gift tijdelijk achter login tegen spam

- **Beslissing:** De publieke route `/gift` staat in MVP achter `useAuth()` — alleen ingelogde users kunnen het formulier zien — om bot-spam tegen te houden zolang er geen rate limiting / captcha is. Dit wijkt af van de oorspronkelijke spec (`2026-04-27-gift-formulier-design.md`) en `mvp-scope.md` ("publieke standalone route /gift"); die spec geldt pas weer als de spam-bescherming staat.
- **Waarom:** Zonder rate limiting kan een bot oneindig rijen inserten via de anon-INSERT-policy op `gift_agreements`. Login-gating is een goedkope tijdelijke spam-shield tot R5 (rate limiting / captcha op /gift) is ingebouwd. Voor MVP-fase A (één moskee, intern bestuur logt in) heeft niemand een account-bezwaar; het formulier wordt nu alleen door bestuursleden gebruikt om mee te oefenen.
- **Herzieningstrigger:** Zodra rate limiting + (optioneel) captcha op /gift staat — dan kan `useAuth` weg en wordt /gift weer publiek per spec. Ook als een echte schenker zonder account het moet kunnen invullen vóór de spam-bescherming klaar is.

## 2026-04-27 — Niet-doelen vastgelegd

- **Beslissing:** Volgende categorieën zijn definitief geen doel: boekhouding, publieke website/CMS, publieke event-ticketing, gebedstijden/Quran-features, e-mail-marketing, multi-vestiging-per-account, native mobiele app voor leden.
- **Waarom:** Andere tools doen dit beter. Scope-discipline.
- **Herzieningstrigger:** Geen — deze blijven uit. Zie `vision.md` voor de volledige redenering.
