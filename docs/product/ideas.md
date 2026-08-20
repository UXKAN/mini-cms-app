# Ideeën — brain dump

**Regel:** alles op deze lijst is een idee, geen requirement. Niets uit dit bestand wordt gebouwd zonder eerst een spec in `docs/superpowers/specs/`. Bij toevoegen aan MVP: verschuif naar `mvp-scope.md` mét reden in `decisions.md`.

**Format:** één regel per idee. Optioneel: `[bron: gesprek YYYY-MM-DD]` of `[trigger: ...]` om context te bewaren.

---

## Open ideeën

_(nog leeg — voeg toe wanneer je iets bedenkt dat je niet wil verliezen)_

---

- DialogBody adopteren in lange dialogs zodat sluitknop/footer vast blijven staan bij scrollen (component bestaat al)
- Rauwe <select>-elementen in dialogs vervangen door shadcn Select in redesign-stijl (toolbar is al om)
- Gedeelde tabelstijl-constanten (COL_HEAD/CELL/PILL) naar één module i.p.v. vijf kopieën
- StatCard trend-prop zodat het dashboard geen eigen featured-kaart hoeft na te bouwen
- Gift-flow (GiftForm/ThankYou/GiftFormDialog) meenemen in soft-SaaS-stijl of bewust serif houden als donateursgezicht; incl. amber-blok in ThankYou naar warn-tokens
- /members/import-route opruimen (onbereikbaar; import leeft in dialog) en /updates-pagina herstijlen of verwijderen
- toast.error-dekking breder trekken (nu alleen delete-paden); overlay/schaduw-oklch-literals naar --overlay/--shadow-primary tokens

## Verplaatst naar MVP

_(als een idee hier verschijnt, dan staat het ook in `mvp-scope.md` en `decisions.md`)_

---

## Verplaatst naar LATER (`roadmap.md`)

_(geparkeerd voor na MVP / na SaaS-sprong)_

---

## Bewust afgewezen

_(zodat we ze niet steeds opnieuw bedenken)_
