# Bekende issues / openstaande polish

Lichte issues die we **bewust later** oppakken. Geen blockers voor MVP-fase A.
Bij elk item: korte beschrijving, ernst, en wanneer we het oppakken.

---

## 2026-05-05 — Mobiele weergave van het hele dashboard werkt niet goed

- **Symptoom:** De admin-pagina's (`/dashboard`, `/leden`, `/donaties`,
  `/toezeggingen`, `/members/[id]`) zijn niet getest of geoptimaliseerd voor
  mobiele schermen. Verwachte issues:
  - Sidebar (AppShell, vaste 220px breed) kan op smalle schermen botsen met
    de main-content. Geen hamburger-menu of slide-out variant.
  - Tabel-views (members, donations, toezeggingen) lopen waarschijnlijk uit
    de viewport — geen responsive table-pattern of horizontal-scroll wrapper.
  - Dashboard-grid `grid-cols-1 sm:grid-cols-3` valt wel terug naar één kolom,
    maar de chart-card met `flex-wrap` en absolute positionering kan
    overlappen.
  - Form-dialogs (DonationForm, MemberForm, PledgeFormDialog) gebruiken vaste
    `max-w-[640px]` zonder mobiel-specifieke padding-correcties.
- **Wat is wel mobiel-getest:** alleen de gift-formulier-modal
  (`GiftFormDialog`) na refactor 2026-05-05. Daarbinnen werkt scrollen +
  fullscreen overlay correct.
- **Ernst:** medium. Bestuur gebruikt nu vooral desktop. Maar voor het
  cashgeld-formulier (later, SaaS) is mobiel een eis.
- **Aanpak later:** eigen ronde met hamburger-sidebar, responsive tables
  (overflow-x-auto + sticky-first-column), en mobiel-doortest van alle
  admin-routes. Geschat: 1-2 dagen werk.
- **Trigger om op te pakken:** vóór SaaS-launch, of als een bestuurslid
  signaleert dat ze de app op telefoon willen gebruiken.

---

## Hoe dit document gebruikt wordt

- Items hier zijn **erkend en bewust uitgesteld**. Niet vergeten — wel
  gepland voor later.
- Bij elke nieuwe ronde: scan dit document op items die eindelijk in scope
  passen.
- Items die opgelost zijn → verwijderen of doorhalen met datum + commit.
