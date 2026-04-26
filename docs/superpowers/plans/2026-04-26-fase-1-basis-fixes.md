# Fase 1 — Basis bugs + styling fixes Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Los 8 zichtbare bugs en styling-inconsistenties op zodat de basis "af" voelt — exacte waarden uit de standalone, twee nieuwe huisstijl-componenten (`RowActions`, `FormLabel`), zonder nieuwe features.

**Architecture:** Drie soorten wijzigingen: (1) CSS tokens en utilities in `globals.css`, (2) twee nieuwe componenten in `src/components/crm/`, (3) page files (donations, members, login) en één shadcn primitive (dialog) bijwerken om de nieuwe componenten en styling te gebruiken.

**Tech Stack:** Next.js 16 App Router · React 19 · TypeScript · CSS custom properties · shadcn/ui (dialog, button) · DM Sans + DM Serif Display

---

## File Map

| Actie | Bestand | Doel |
|---|---|---|
| Modify | `src/app/globals.css` | Input borders 1.5px + focus glow, `.crm-button-modal-primary` utility |
| Modify | `src/components/ui/dialog.tsx` | Modal padding `22px 24px 28px` |
| Create | `src/components/crm/FormLabel.tsx` | Standalone-conform label + required asterisk |
| Create | `src/components/crm/RowActions.tsx` | ⋯ menu met Edit/Delete |
| Modify | `src/components/crm/index.ts` | Exports voor FormLabel + RowActions |
| Modify | `src/app/donations/page.tsx` | Action gap, RowActions, FormLabel, stat cards always, button shadow |
| Modify | `src/app/members/page.tsx` | Action gap, RowActions, FormLabel, button shadow |
| Modify | `src/app/login/page.tsx` | max-width 400px ipv max-w-sm |

---

## Task 1: Globals CSS — input styling + button shadow utility

Twee globale CSS aanvullingen die door alle pages gebruikt worden.

**Files:**
- Modify: `src/app/globals.css`

- [ ] **Step 1: Open `src/app/globals.css` en lokaliseer het einde van het bestand**

Lees eerst het hele bestand zodat je weet waar je toevoegt. Zoek de laatste regel (na alle `:root` blocks en bestaande styles).

- [ ] **Step 2: Voeg deze regels toe onderaan het bestand**

```css
/* ─── Form inputs (Fase 1.3) ──────────────────────── */
/* 1.5px borders + groene focus glow conform standalone */
.crm-input,
input[type="text"]:not([class*="shadcn"]),
input[type="email"]:not([class*="shadcn"]),
input[type="number"]:not([class*="shadcn"]),
input[type="tel"]:not([class*="shadcn"]),
input[type="date"]:not([class*="shadcn"]),
input[type="password"]:not([class*="shadcn"]),
textarea:not([class*="shadcn"]),
select:not([class*="shadcn"]) {
  border-width: 1.5px !important;
  border-color: var(--border) !important;
  transition: border-color 0.15s, box-shadow 0.15s;
}

.crm-input:focus,
input:focus,
textarea:focus,
select:focus {
  outline: none !important;
  border-color: var(--accent) !important;
  box-shadow: 0 0 0 3px oklch(0.52 0.13 165 / 0.1) !important;
}

/* ─── Modal primary button shadow (Fase 1.6) ──────── */
.crm-button-modal-primary {
  box-shadow: 0 4px 16px oklch(0.52 0.13 165 / 0.3);
}

.crm-button-modal-primary:hover {
  box-shadow: 0 6px 20px oklch(0.52 0.13 165 / 0.4);
}
```

- [ ] **Step 3: Verifieer TypeScript en dev server**

```bash
cd /Users/uxkan/Desktop/mini-cms-app && npx tsc --noEmit
```

Expected: geen errors (CSS wijzigingen raken TS niet, maar we checken voor de zekerheid).

- [ ] **Step 4: Commit**

```bash
git add src/app/globals.css
git commit -m "[1.3 + 1.6] add 1.5px input borders, focus glow, modal button shadow utility"
```

---

## Task 2: Dialog padding — `22px 24px 28px`

Pas de shadcn Dialog primitive aan zodat alle modals automatisch de juiste padding krijgen.

**Files:**
- Modify: `src/components/ui/dialog.tsx`

- [ ] **Step 1: Open `src/components/ui/dialog.tsx`**

Lees het bestand. De `DialogContent` forwardRef component bevat een lange className met `p-6`. Die moeten we vervangen.

- [ ] **Step 2: Vervang `p-6` in DialogContent**

In de className van `DialogContent` (regel ~41), zoek `p-6` en vervang door `pt-[22px] pr-6 pb-7 pl-6`. De volledige className wordt:

```tsx
"fixed left-[50%] top-[50%] z-50 grid w-full max-w-lg translate-x-[-50%] translate-y-[-50%] gap-4 border bg-background pt-[22px] pr-6 pb-7 pl-6 shadow-lg duration-200 data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95 data-[state=closed]:slide-out-to-left-1/2 data-[state=closed]:slide-out-to-top-[48%] data-[state=open]:slide-in-from-left-1/2 data-[state=open]:slide-in-from-top-[48%] sm:rounded-lg"
```

(`pb-7` = 28px in Tailwind, `pt-[22px]` = exact 22px arbitrary)

- [ ] **Step 3: Verifieer TypeScript**

```bash
cd /Users/uxkan/Desktop/mini-cms-app && npx tsc --noEmit
```

Expected: geen errors.

- [ ] **Step 4: Commit**

```bash
git add src/components/ui/dialog.tsx
git commit -m "[1.4] modal padding 22px top, 28px bottom (asymmetric per standalone)"
```

---

## Task 3: FormLabel component

Standalone-conform label met required asterisk.

**Files:**
- Create: `src/components/crm/FormLabel.tsx`

- [ ] **Step 1: Maak `src/components/crm/FormLabel.tsx`**

```tsx
type FormLabelProps = {
  children: React.ReactNode;
  required?: boolean;
  htmlFor?: string;
};

export function FormLabel({ children, required, htmlFor }: FormLabelProps) {
  return (
    <label
      htmlFor={htmlFor}
      style={{
        display: "block",
        fontSize: 13,
        fontWeight: 500,
        color: "var(--ink-muted)",
        marginBottom: 6,
      }}
    >
      {children}
      {required && (
        <span style={{ color: "var(--accent)", marginLeft: 2 }}>*</span>
      )}
    </label>
  );
}
```

- [ ] **Step 2: Verifieer TypeScript**

```bash
cd /Users/uxkan/Desktop/mini-cms-app && npx tsc --noEmit
```

Expected: geen errors.

- [ ] **Step 3: Commit**

```bash
git add src/components/crm/FormLabel.tsx
git commit -m "[1.5] add FormLabel CRM component with required asterisk"
```

---

## Task 4: RowActions component

⋯ menu met Bewerken + Verwijderen — destructieve actie verstopt.

**Files:**
- Create: `src/components/crm/RowActions.tsx`

- [ ] **Step 1: Maak `src/components/crm/RowActions.tsx`**

```tsx
"use client";

import { useEffect, useRef, useState } from "react";
import { MoreHorizontal } from "lucide-react";

type RowActionsProps = {
  onEdit: () => void;
  onDelete: () => void;
  editLabel?: string;
  deleteLabel?: string;
};

export function RowActions({
  onEdit,
  onDelete,
  editLabel = "Bewerken",
  deleteLabel = "Verwijderen",
}: RowActionsProps) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    const handleClick = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, [open]);

  return (
    <div ref={ref} style={{ position: "relative", display: "inline-block" }}>
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        aria-label="Acties"
        style={{
          display: "inline-flex",
          alignItems: "center",
          justifyContent: "center",
          width: 30,
          height: 30,
          borderRadius: "var(--radius-sm)",
          border: "none",
          background: open ? "var(--neutral-light)" : "transparent",
          cursor: "pointer",
          color: "var(--ink-muted)",
          transition: "background 0.15s",
        }}
        onMouseEnter={(e) => {
          if (!open) e.currentTarget.style.background = "var(--neutral-light)";
        }}
        onMouseLeave={(e) => {
          if (!open) e.currentTarget.style.background = "transparent";
        }}
      >
        <MoreHorizontal size={16} />
      </button>

      {open && (
        <div
          style={{
            position: "absolute",
            top: "calc(100% + 4px)",
            right: 0,
            minWidth: 160,
            background: "var(--surface)",
            border: "1px solid var(--border)",
            borderRadius: "var(--radius)",
            boxShadow: "var(--shadow-lg)",
            padding: 4,
            zIndex: 50,
          }}
        >
          <button
            type="button"
            onClick={() => {
              setOpen(false);
              onEdit();
            }}
            style={{
              display: "block",
              width: "100%",
              padding: "8px 12px",
              border: "none",
              background: "transparent",
              borderRadius: "var(--radius-sm)",
              fontSize: 13,
              color: "var(--ink)",
              textAlign: "left",
              cursor: "pointer",
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.background = "var(--neutral-light)";
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.background = "transparent";
            }}
          >
            {editLabel}
          </button>
          <button
            type="button"
            onClick={() => {
              setOpen(false);
              onDelete();
            }}
            style={{
              display: "block",
              width: "100%",
              padding: "8px 12px",
              border: "none",
              background: "transparent",
              borderRadius: "var(--radius-sm)",
              fontSize: 13,
              color: "var(--error)",
              textAlign: "left",
              cursor: "pointer",
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.background = "var(--error-light)";
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.background = "transparent";
            }}
          >
            {deleteLabel}
          </button>
        </div>
      )}
    </div>
  );
}
```

- [ ] **Step 2: Verifieer TypeScript**

```bash
cd /Users/uxkan/Desktop/mini-cms-app && npx tsc --noEmit
```

Expected: geen errors.

- [ ] **Step 3: Commit**

```bash
git add src/components/crm/RowActions.tsx
git commit -m "[1.2] add RowActions component with hidden destructive delete action"
```

---

## Task 5: Update CRM barrel export

Voeg de nieuwe componenten toe aan `index.ts`.

**Files:**
- Modify: `src/components/crm/index.ts`

- [ ] **Step 1: Open `src/components/crm/index.ts`**

Het bestand exporteert nu: Card, SectionLabel, PageHeader, StatCard, Badge, EmptyState, PageLayout.

- [ ] **Step 2: Voeg twee exports toe**

Voeg deze regels onderaan toe:

```ts
export { FormLabel } from "./FormLabel";
export { RowActions } from "./RowActions";
```

- [ ] **Step 3: Verifieer TypeScript**

```bash
cd /Users/uxkan/Desktop/mini-cms-app && npx tsc --noEmit
```

Expected: geen errors.

- [ ] **Step 4: Commit**

```bash
git add src/components/crm/index.ts
git commit -m "[1.2 + 1.5] export FormLabel and RowActions from CRM library"
```

---

## Task 6: Update Donaties pagina

Combineert: action gap (1.1), RowActions (1.2), FormLabel (1.5), modal button shadow (1.6), stat cards always visible (1.7).

**Files:**
- Modify: `src/app/donations/page.tsx`

- [ ] **Step 1: Voeg imports toe**

In `src/app/donations/page.tsx`, vind deze import:

```tsx
import { PageLayout, StatCard, EmptyState } from "@/components/crm";
```

Vervang door:

```tsx
import { PageLayout, StatCard, EmptyState, FormLabel, RowActions } from "@/components/crm";
```

- [ ] **Step 2: Stat cards altijd zichtbaar (Fix 1.7)**

Vind het block:

```tsx
{donations.length > 0 && (
  <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(160px, 1fr))", gap: 16, marginBottom: 20 }}>
    <StatCard label="Totaal dit jaar" value={formatEuro(yearTotal)} />
    <StatCard label="Totaal (alles)"  value={formatEuro(total)} />
    <StatCard label="Aantal donaties" value={String(donations.length)} />
  </div>
)}
```

Vervang door (verwijder de `{donations.length > 0 && (...)} `wrap):

```tsx
<div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(160px, 1fr))", gap: 16, marginBottom: 20 }}>
  <StatCard label="Totaal dit jaar" value={formatEuro(yearTotal)} />
  <StatCard label="Totaal (alles)"  value={formatEuro(total)} />
  <StatCard label="Aantal donaties" value={String(donations.length)} />
</div>
```

- [ ] **Step 3: Vervang action buttons in tabel met RowActions (Fix 1.1 + 1.2)**

Vind de TableCell met de action buttons:

```tsx
<TableCell className="text-right whitespace-nowrap">
  <Button variant="ghost" size="sm" onClick={() => openEdit(d)}>
    Bewerken
  </Button>
  <Button
    variant="ghost"
    size="sm"
    className="text-destructive hover:text-destructive"
    onClick={() => handleDelete(d.id)}
  >
    Verwijderen
  </Button>
</TableCell>
```

Vervang door:

```tsx
<TableCell className="text-right whitespace-nowrap">
  <RowActions
    onEdit={() => openEdit(d)}
    onDelete={() => handleDelete(d.id)}
  />
</TableCell>
```

- [ ] **Step 4: Vervang Label-componenten in DonationForm met FormLabel (Fix 1.5)**

In de `DonationForm` functie (onderaan het bestand), vind elk `<Label className="text-xs text-muted-foreground">...</Label>` en vervang door `<FormLabel required={...}>...</FormLabel>`.

**Bedrag:**
```tsx
<Label className="text-xs text-muted-foreground">Bedrag (EUR) *</Label>
```
Vervang door:
```tsx
<FormLabel required>Bedrag (EUR)</FormLabel>
```

**Datum:**
```tsx
<Label className="text-xs text-muted-foreground">Datum *</Label>
```
Vervang door:
```tsx
<FormLabel required>Datum</FormLabel>
```

**Methode:**
```tsx
<Label className="text-xs text-muted-foreground">Methode</Label>
```
Vervang door:
```tsx
<FormLabel>Methode</FormLabel>
```

**Lid:**
```tsx
<Label className="text-xs text-muted-foreground">Lid (optioneel)</Label>
```
Vervang door:
```tsx
<FormLabel>Lid (optioneel)</FormLabel>
```

**Notities:**
```tsx
<Label className="text-xs text-muted-foreground">Notities</Label>
```
Vervang door:
```tsx
<FormLabel>Notities</FormLabel>
```

Verwijder de import voor `Label` als die nergens anders meer gebruikt wordt:

```tsx
// Verwijder als ongebruikt:
import { Label } from "@/components/ui/label";
```

- [ ] **Step 5: Voeg modal button shadow toe (Fix 1.6)**

Vind de submit Button in DonationForm:

```tsx
<Button type="submit" disabled={saving}>
  {saving ? "Opslaan..." : initial ? "Opslaan" : "Toevoegen"}
</Button>
```

Vervang door:

```tsx
<Button type="submit" disabled={saving} className="crm-button-modal-primary">
  {saving ? "Opslaan..." : initial ? "Opslaan" : "Toevoegen"}
</Button>
```

- [ ] **Step 6: Verifieer TypeScript**

```bash
cd /Users/uxkan/Desktop/mini-cms-app && npx tsc --noEmit
```

Expected: geen errors.

- [ ] **Step 7: Commit**

```bash
git add src/app/donations/page.tsx
git commit -m "[1.1 + 1.2 + 1.5 + 1.6 + 1.7] donations page: RowActions, FormLabel, stat cards always, button shadow"
```

---

## Task 7: Update Leden pagina

Combineert: action gap (1.1), RowActions (1.2), FormLabel (1.5), modal button shadow (1.6).

**Files:**
- Modify: `src/app/members/page.tsx`

- [ ] **Step 1: Voeg imports toe**

Vind:

```tsx
import { PageLayout, EmptyState, Badge } from "@/components/crm";
```

Vervang door:

```tsx
import { PageLayout, EmptyState, Badge, FormLabel, RowActions } from "@/components/crm";
```

- [ ] **Step 2: Vervang action buttons in tabel met RowActions (Fix 1.1 + 1.2)**

Vind de TableCell met de actions in de members tabel:

```tsx
<TableCell className="text-right whitespace-nowrap">
  <Button variant="ghost" size="sm" onClick={() => openEdit(m)}>
    Bewerken
  </Button>
  <Button
    variant="ghost"
    size="sm"
    className="text-destructive hover:text-destructive"
    onClick={() => handleDelete(m.id)}
  >
    Verwijderen
  </Button>
</TableCell>
```

Vervang door:

```tsx
<TableCell className="text-right whitespace-nowrap">
  <RowActions
    onEdit={() => openEdit(m)}
    onDelete={() => handleDelete(m.id)}
  />
</TableCell>
```

- [ ] **Step 3: Vervang het Status `<Label>` in MemberForm met FormLabel (Fix 1.5)**

In de `MemberForm` functie (onderaan), vind:

```tsx
<Label className="text-xs text-muted-foreground">Status</Label>
```

Vervang door:

```tsx
<FormLabel>Status</FormLabel>
```

De members form heeft verder placeholders ipv labels op de inputs, dus alleen Status heeft een Label. Verwijder de Label import als ongebruikt:

```tsx
// Verwijder als ongebruikt:
import { Label } from "@/components/ui/label";
```

- [ ] **Step 4: Voeg modal button shadow toe (Fix 1.6)**

Vind de submit Button in MemberForm:

```tsx
<Button type="submit" disabled={saving}>
  {saving ? "Opslaan..." : initial ? "Opslaan" : "Toevoegen"}
</Button>
```

Vervang door:

```tsx
<Button type="submit" disabled={saving} className="crm-button-modal-primary">
  {saving ? "Opslaan..." : initial ? "Opslaan" : "Toevoegen"}
</Button>
```

- [ ] **Step 5: Verifieer TypeScript**

```bash
cd /Users/uxkan/Desktop/mini-cms-app && npx tsc --noEmit
```

Expected: geen errors.

- [ ] **Step 6: Commit**

```bash
git add src/app/members/page.tsx
git commit -m "[1.1 + 1.2 + 1.5 + 1.6] members page: RowActions, FormLabel, button shadow"
```

---

## Task 8: Update Login pagina

Fix 1.8: max-width 384px → 400px.

**Files:**
- Modify: `src/app/login/page.tsx`

- [ ] **Step 1: Open `src/app/login/page.tsx` en vind regel 50**

Zoek naar `max-w-sm`:

```tsx
className="w-full max-w-sm"
```

- [ ] **Step 2: Vervang door inline maxWidth 400px**

Verander naar:

```tsx
className="w-full"
style={{ maxWidth: 400 }}
```

(Behoud overige className en style props die er al staan — alleen `max-w-sm` weghalen en de inline style toevoegen.)

- [ ] **Step 3: Verifieer TypeScript**

```bash
cd /Users/uxkan/Desktop/mini-cms-app && npx tsc --noEmit
```

Expected: geen errors.

- [ ] **Step 4: Commit**

```bash
git add src/app/login/page.tsx
git commit -m "[1.8] login form max-width 400px (was 384px) per standalone"
```

---

## Task 9: Finale build + visuele verificatie

- [ ] **Step 1: Volledige productie build**

```bash
cd /Users/uxkan/Desktop/mini-cms-app && npm run build
```

Expected: build slaagt, geen TypeScript fouten, geen compile errors.

- [ ] **Step 2: Start dev server (als niet al draait)**

```bash
cd /Users/uxkan/Desktop/mini-cms-app && npm run dev
```

(Of gebruik bestaande server op port 3000.)

- [ ] **Step 3: Verifieer visueel — open elke pagina en check de 8 fixes**

Open in browser:

- `http://localhost:3000/login` → form is 400px breed (centered)
- `http://localhost:3000/donations` → stat cards zichtbaar zonder donaties (toont € 0,00); klik op rij actie → ⋯ menu opent met Bewerken + rode Verwijderen
- `http://localhost:3000/donations` → klik "Donatie toevoegen" → modal heeft asymmetrische padding (22 boven, 28 onder); inputs hebben 1.5px borders met groene focus glow; labels zijn 13px met groene * voor required; submit button heeft drop shadow
- `http://localhost:3000/members` → idem voor RowActions, FormLabel (alleen Status), modal button shadow

- [ ] **Step 4: Final commit (alleen als er extra fixes nodig waren)**

```bash
# Als alles werkt zonder extra fixes:
echo "Fase 1 compleet — geen extra commits nodig"

# Als er fixes nodig waren:
git add -A
git commit -m "[fase 1] final visual fixes after verification"
```

---

## Notes voor de implementer

- **Branch:** Werk op `frontend/design`. Niet pushen naar `main` zonder gebruiker-goedkeuring.
- **Geen scope creep:** Geen mobile responsive werk, geen toast notifications, geen empty state polish — die zijn voor Fase 2.
- **Geen nieuwe features:** Geen zoekbalken, geen filters, geen Periodieke Gift form — die zijn voor Fase 3.
- **Tests:** Geen unit tests in deze fase — UI componenten hebben geen logic die testbaar is. Visuele verificatie in Task 9 is voldoende.
- **Commits:** Elke task = één commit met `[<fase.fix>]` prefix in de message zodat de gebruiker direct ziet welke fix gedaan is.
