# Productvisie

## Wat is dit?

Eén centrale plek voor het bestuur van een ANBI-moskee om leden, donaties, toezeggingen, ondernemers/sponsors en evenementen bij te houden. Geen boekhouding, geen website, geen ledenapp — een **administratie-tool voor het bestuur**, gebouwd rond de financiële realiteit van een moskee.

## Voor wie?

Het product is gebouwd voor de **bestuurslaag van een moskee** — geen single-user product, wel single-product. Drie natuurlijke rollen, met overlappend gebruik:

- **Penningmeester (hoofdadmin, financieel)**
  Donaties, toezeggingen, ANBI-jaaroverzichten, import/export. In SaaS-fase ook Stripe / Pay.nl-koppelingen voor automatische betalingen.

- **Bestuurslid / secretaris (operationeel)**
  Leden registreren, evenementen aanmaken, dashboard bekijken voor overzicht. Cashgeld vastleggen via formulier/kwitantie.

- **Commissielid (specifieke taken)**
  Toezeggingen toevoegen en bijwerken, openstaande toezeggingen nalopen, herinneringen sturen.

**MVP:** rollen bestaan in het datamodel maar zijn nog niet UI-zichtbaar — iedereen die ingelogd is kan alles. **SaaS-fase:** rollen + permissies krijgen een echte UI.

## Welk probleem lossen we op?

Een moskee leeft in een specifieke financiële realiteit waar geen bestaande tool goed bij past:

1. **Geld komt vaak in cash binnen** — bij vrijdaggebed, evenementen, Ramadan. Vrijwilligers ontvangen het, schrijven het op een briefje, briefje raakt kwijt → ANBI-risico, geld ongedocumenteerd.
2. **Beloften zijn mondeling** — leden zeggen toezeggingen toe ("ik geef €500 voor de nieuwe gevel"), niemand belt ze na, geld komt nooit binnen. Direct verlies.
3. **Leden zijn geen klanten, maar wel administratie** — ledenadministratie zonder verkoop-context. Een normale CRM (HubSpot, Pipedrive) past niet.
4. **ANBI-status vraagt jaarlijks bewijs** — donatie-overzichten, donatiebewijzen, jaarrapportage. Nu in Excel of op papier — kost dagen per jaar.

Het bestuur jongleert vandaag tussen Moneybird (boekhouding), Excel (leden/toezeggingen), WhatsApp (afstemming) en papieren briefjes (cashgeld). **Wij vervangen dat door één plek.**

## Wat dit NIET is (definitief)

Deze categorieën bouwen we expliciet niet — niet uit luiheid, maar omdat andere tools het beter doen of het scope onzinnig vergroot:

- **Geen boekhouding** — Moneybird/Exact doet dat. Wij exporteren ernaartoe.
- **Geen publieke website / CMS** — WordPress doet dat.
- **Geen publieke event-ticketing** — Eventbrite doet dat. Wij doen wel **interne** registraties (eigen leden voor eigen evenementen).
- **Geen gebedstijden / Quran / islamitische kalender** — apps voor leden, niet voor bestuur. Dit is een admin-tool.
- **Geen e-mail-marketing / nieuwsbrieven** — Mailchimp doet dat. Wij sturen alleen **transactionele mail** (donatiebevestiging, password-reset, toezegging-reminder).
- **Geen multi-vestiging onder één account** — één moskee = één account. Een organisatie met meerdere moskeeën krijgt meerdere accounts.
- **Geen mobiele app voor leden** — alleen responsive web voor bestuur.

## AI-hulp: bewust uitgesteld

Op de roadmap onder LATER, met één regel: **smalle scope wanneer het zover is**. Geen algemene chatbot, maar concrete features met een duidelijk doel — bijvoorbeeld "genereer ANBI-jaarrapport uit donaties van dit jaar" of "categoriseer importbestand automatisch". Pas overwegen na de SaaS-sprong.

## Eindstaat (waar we naartoe werken)

> Een penningmeester van een willekeurige Nederlandse moskee meldt zich aan, importeert haar leden en donaties uit Excel, en heeft binnen 30 minuten een werkend overzicht. Cashgeld bij het volgende vrijdaggebed wordt door een vrijwilliger via een telefoon vastgelegd. Toezeggingen die over hun datum heen zijn krijgen automatisch een reminder. Eind van het jaar genereert ze het ANBI-jaaroverzicht in twee klikken.

Alles in dit product wordt aan dat scenario getoetst.
