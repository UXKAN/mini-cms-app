# Spec: Gift-modal-pivot — "Formulier"-knop in dashboard (Ronde 4 MVP-deel)

**Versie:** 2026-05-05
**Vervult:** decision 2026-05-04 ("/gift wordt fullscreen modal in dashboard met share-pattern") — *MVP-deel only*. Share-pattern (publieke link, organisatie-/domein-restricties, view/fill/manage rechten) blijft op SaaS-fase parkeren.

---

## Doel

De penningmeester / admin kan vanuit `/dashboard` direct het ANBI-gift-formulier openen zonder naar de standalone `/gift`-route te navigeren. Bedoeld voor situaties zoals: schenker tekent ter plekke in moskee, admin vult het formulier in op zijn iPad. De standalone `/gift`-route blijft bestaan voor backward compatibility (en wordt later in SaaS-fase de basis voor de share-link-flow).

In één zin: *één knop op dashboard, opent overlay met het bestaande formulier, sluit weer met behoud van bevestigings-scherm.*

**Bewust uit deze spec:**
- Share-link genereren met permissies (SaaS-fase).
- Organisatie-/domein-restricties (SaaS-fase).
- Knop op andere admin-pagina's dan `/dashboard` — komt eventueel later.
- Refactor van /gift route naar exclusief modal-flow — die route blijft live.

---

## 3 keuzes

1. **Dialog-grootte:** `max-w-3xl max-h-[90vh] overflow-y-auto`. Ruim zat voor het 5-stap formulier; gebruiker scrollt binnen modal. Niet letterlijk 100% fullscreen — dat geeft een minder herkenbaar UX-patroon en maakt sluiten lastiger. Op mobiel valt 'm vanzelf naar single-column en vult bijna alle ruimte.

2. **Knop-locatie:** in de dashboard-header, naast / onder de "Overzicht · {datum}"-tekst. Eén grote primary-knop "+ Formulier invullen". Niet in AppShell-topbar (die is voor navigatie) en niet in zijbar.

3. **Bevestigings-scherm in modal:** ThankYou rendert binnen de modal. Twee knoppen onderaan: "Nieuw formulier invullen" (reset state, blijft in modal) + "Sluiten" (sluit modal, terug naar dashboard). Sluit-X bovenaan modal blijft ook werken (shadcn-default).

---

## Component-wijzigingen

### `src/app/gift/ThankYou.tsx`
Nieuwe optionele prop `onClose?: () => void`. Als die er is, toon een tweede knop "Sluiten" naast "Nieuw formulier invullen". Anders alleen de bestaande knop. Bestaande `onReset` blijft zoals het is.

### `src/app/gift/GiftForm.tsx`
Nieuwe optionele prop `onClose?: () => void`. Doorgegeven aan `ThankYou`. Geen verdere gedragsverandering — als `onClose` niet gegeven is (op `/gift`-route) is gedrag identiek aan nu.

### `src/app/dashboard/_components/GiftFormDialog.tsx` (nieuw)
Wrapper die GiftForm in een shadcn Dialog rendert. Props: `open`, `onOpenChange`. Geeft `onClose` mee aan GiftForm zodat de modal sluit na "Sluiten"-klik.

### `src/app/dashboard/page.tsx`
- Nieuwe state: `formulierOpen: boolean`
- Nieuwe knop in header: "+ Formulier invullen", primary stijl, opent modal
- Render `<GiftFormDialog open={formulierOpen} onOpenChange={setFormulierOpen} />`

---

## Bestanden

| # | Actie | Pad |
|---|---|---|
| 1 | Edit | `src/app/gift/ThankYou.tsx` (onClose prop) |
| 2 | Edit | `src/app/gift/GiftForm.tsx` (onClose prop, doorgeven aan ThankYou) |
| 3 | Nieuw | `src/app/dashboard/_components/GiftFormDialog.tsx` |
| 4 | Edit | `src/app/dashboard/page.tsx` (knop + state + dialog-render) |

---

## Verificatie

Manuele test (na deploy):
1. Op `/dashboard` → klik "Formulier invullen" → modal opent met formulier.
2. Vul formulier in (eenmalig + voldaan met testbedrag) → submit → ThankYou verschijnt **binnen modal**.
3. Klik "Sluiten" → modal sluit, dashboard refresht (idealiter widget-cijfers ververst).
4. Standalone `/gift`-route nog steeds bereikbaar en functioneel — geen Sluiten-knop op ThankYou daar (alleen "Nieuw formulier invullen").

Geen DB-test nodig: data-flow is identiek aan bestaande gift-form-submit, alleen de UI-locatie verandert.
