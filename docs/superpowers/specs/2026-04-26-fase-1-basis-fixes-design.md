# Design: Fase 1 — Basis bugs + styling fixes

**Date:** 2026-04-26
**Status:** Pending user approval
**Branch:** `frontend/design`
**Parent context:** Eerste van drie fases. Fase 2 (polish) en Fase 3 (nieuwe features) komen later.

---

## Doel

De zichtbare bugs en styling-inconsistenties oplossen zodat de basis "af" voelt voordat we aan polish of nieuwe features beginnen. Alle waarden komen uit de standalone (`/Users/uxkan/Downloads/Dashboard.standalone.html`) — geen giswerk.

---

## Scope

8 concrete fixes. Allemaal klein. Geen nieuwe features, geen architecturale wijzigingen.

---

## Fix 1.1 — Action button gap in tabellen

**Probleem:** "BewerkenVerwijderen" loopt aan elkaar in donations- én members-tabel (geen spatie).

**Oplossing:** Wrap de twee buttons in een flex container met `gap: 8px`.

```tsx
<TableCell className="text-right whitespace-nowrap">
  <div style={{ display: "flex", gap: 8, justifyContent: "flex-end" }}>
    <Button variant="ghost" size="sm" onClick={...}>Bewerken</Button>
    <Button variant="ghost" size="sm" className="text-destructive..." onClick={...}>Verwijderen</Button>
  </div>
</TableCell>
```

**Bestanden:** `src/app/donations/page.tsx`, `src/app/members/page.tsx`

---

## Fix 1.2 — Verwijder achter een ⋯ menu

**Probleem:** Destructieve actie staat naast Bewerken — gevaarlijk per ongeluk klikken.

**Oplossing:** Maak een nieuw component `src/components/crm/RowActions.tsx` met een ⋯ knop die een dropdown opent. Bewerken bovenaan, Verwijderen onderaan met rode tekst.

```tsx
<RowActions
  onEdit={() => openEdit(item)}
  onDelete={() => handleDelete(item.id)}
/>
```

Gebruik `@/components/ui/dropdown-menu` (shadcn) als base. Padding/typografie volgt huisstijl.

**Bestanden:** Nieuw `src/components/crm/RowActions.tsx`, gebruikt in `donations/page.tsx`, `members/page.tsx`

---

## Fix 1.3 — Form input borders 1.5px + focus shadow

**Probleem:** Inputs gebruiken nu shadcn default (1px border, geen focus shadow). Standalone gebruikt 1.5px met groene focus glow.

**Oplossing:** Override de shadcn Input styling globaal in `globals.css`:

```css
input[type="text"], input[type="email"], input[type="number"],
input[type="tel"], input[type="date"], textarea, select {
  border-width: 1.5px;
  border-color: var(--border);
}

input:focus, textarea:focus, select:focus {
  outline: none;
  border-color: var(--accent);
  box-shadow: 0 0 0 3px oklch(0.52 0.13 165 / 0.1);
}
```

**Bestanden:** `src/app/globals.css`

---

## Fix 1.4 — Modal padding conform standalone

**Probleem:** shadcn Dialog gebruikt symmetrische padding. Standalone gebruikt `22px 24px 28px` (top/sides/bottom).

**Oplossing:** Override DialogContent styling. Pas `src/components/ui/dialog.tsx` aan zodat content padding `22px 24px 28px` is. Header/title behouden hun typografie maar krijgen geen extra padding-bottom.

**Bestanden:** `src/components/ui/dialog.tsx`

---

## Fix 1.5 — Form label typografie

**Probleem:** Labels zijn nu `text-xs text-muted-foreground` (Tailwind). Standalone gebruikt `13px / weight 500 / var(--ink-muted) / margin-bottom 6px`. Required-asterisk in accent groen.

**Oplossing:** Maak een nieuw component `src/components/crm/FormLabel.tsx`:

```tsx
<FormLabel required>Bedrag (EUR)</FormLabel>
// renders: <label style={{fontSize:13, fontWeight:500, color:"var(--ink-muted)", marginBottom:6, display:"block"}}>
//   Bedrag (EUR) <span style={{color:"var(--accent)"}}>*</span>
// </label>
```

Gebruik in donaties form en leden form. Vervangt huidige `<Label className="text-xs text-muted-foreground">`.

**Bestanden:** Nieuw `src/components/crm/FormLabel.tsx`, gebruikt in `donations/page.tsx`, `members/page.tsx`

---

## Fix 1.6 — Submit button shadow in modals

**Probleem:** Primary button in modal heeft geen shadow. Standalone gebruikt `box-shadow: 0 4px 16px oklch(0.52 0.13 165 / 0.3)`.

**Oplossing:** Voeg een variant toe aan de shadcn Button — `size="modal-primary"` of een nieuwe className. Of: voeg style direct toe aan de submit Button in donaties/leden forms.

**Voorstel:** Voeg een `crm-button-modal` utility class toe in `globals.css`:

```css
.crm-button-modal-primary {
  box-shadow: 0 4px 16px oklch(0.52 0.13 165 / 0.3);
}
```

Pas op modal submit buttons toe via `className="crm-button-modal-primary"`.

**Bestanden:** `src/app/globals.css`, `src/app/donations/page.tsx`, `src/app/members/page.tsx`

---

## Fix 1.7 — Donaties stat cards altijd zichtbaar

**Probleem:** Stat cards (Totaal dit jaar / Totaal alles / Aantal) worden alleen getoond als `donations.length > 0`. Bij lege staat zie je niks.

**Oplossing:** Verwijder de conditional. Toon altijd, met "€ 0,00" / "0" als waarde.

```tsx
// Was: {donations.length > 0 && ( <div>...stat cards...</div> )}
// Wordt: altijd zichtbaar
<div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(160px, 1fr))", gap: 16, marginBottom: 20 }}>
  <StatCard label="Totaal dit jaar" value={formatEuro(yearTotal)} />
  <StatCard label="Totaal (alles)"  value={formatEuro(total)} />
  <StatCard label="Aantal donaties" value={String(donations.length)} />
</div>
```

**Bestanden:** `src/app/donations/page.tsx`

---

## Fix 1.8 — Login pagina max-width 400px

**Probleem:** Login form gebruikt `max-w-sm` (384px). Standalone gebruikt 400px.

**Oplossing:** Vervang `max-w-sm` door inline `style={{ maxWidth: 400 }}` of een nieuwe Tailwind utility.

**Bestanden:** `src/app/login/page.tsx`

---

## Verhouding tot andere fases

**Fase 2 (later):** Tabel hover states, empty state polish, skeleton loading, toast notifications, eigen confirm dialog, form validation feedback, mobile responsive check.

**Fase 3 (later, alleen na expliciete goedkeuring):** Zoekbalk + filters, lid detail drawer, Excel export, dashboard quick actions, Stripe/iDEAL, ondernemers/toezeggingen modules, multi-org SaaS, Periodieke Gift Overeenkomst form.

---

## Nieuwe bestanden

| Bestand | Doel |
|---|---|
| `src/components/crm/RowActions.tsx` | ⋯ menu met Edit/Delete acties |
| `src/components/crm/FormLabel.tsx` | Standalone-conform label met required-asterisk |

## Aangepaste bestanden

| Bestand | Wijziging |
|---|---|
| `src/app/globals.css` | Input borders 1.5px + focus shadow, .crm-button-modal-primary class |
| `src/components/ui/dialog.tsx` | Modal padding 22px 24px 28px |
| `src/app/donations/page.tsx` | RowActions, FormLabel, stat cards altijd zichtbaar, modal submit shadow |
| `src/app/members/page.tsx` | RowActions, FormLabel, modal submit shadow |
| `src/app/login/page.tsx` | max-width 400px |

## Geen wijziging

- CRM library (Card, SectionLabel, etc.) — die zijn al goed
- AppShell / sidebar — geen wijziging in Fase 1
- Dashboard — geen wijziging in Fase 1 (later quick-actions als nieuwe feature)

---

## Verificatie

Na implementatie controleren:

1. ✅ Action buttons in donaties + members hebben 8px gap
2. ✅ Verwijderen zit achter een ⋯ menu (alleen één kliklocatie)
3. ✅ Form inputs hebben 1.5px borders en groene focus glow
4. ✅ Modal padding is asymmetrisch (22px boven, 28px onder)
5. ✅ Form labels zijn 13px/500 met groene * voor required
6. ✅ Modal primary button heeft shadow `0 4px 16px ...accent...0.3`
7. ✅ Donaties stat cards zichtbaar bij 0 donaties (toont € 0,00)
8. ✅ Login form is 400px breed (centered)
9. ✅ `npm run build` slaagt zonder fouten
10. ✅ Visuele check: dashboard, members, donations, login pagina's
