# Design: Design System Migration (shadcn/ui + Tailwind v4)

**Date:** 2026-04-25  
**Status:** Approved

## Goal

Migrate the mosque CRM app to shadcn/ui + Tailwind v4, matching the visual design from the Claude Design prototype exactly. No functionality changes — pure visual layer migration.

## Reference

Design source: `dashboard-handoff.zip` — Claude Design prototype with full component specs, color tokens, fonts, sidebar, and page layouts.

---

## Architecture

Three clean layers:

- `src/components/ui/` — shadcn primitives owned by the project (Button, Input, Select, Card, Badge, Dialog, Table, Separator, Avatar)
- `src/app/components/` — app-level components (AppShell rebuilt to match prototype)
- `src/app/[page]/` — individual pages using the components above

Tailwind v4 is already installed. shadcn/ui gets initialized on top of it. The existing `Modal.tsx` is replaced by shadcn Dialog. The existing `AppShell.tsx` is fully rebuilt.

---

## Theme Configuration

shadcn theme variables configured to match the prototype 1:1:

| Token | Value |
|---|---|
| `--primary` | `oklch(0.52 0.13 165)` — green accent |
| `--primary-foreground` | white |
| `--background` | `oklch(0.968 0.007 75)` — warm beige |
| `--card` | `oklch(0.995 0.003 75)` — surface white |
| `--border` | `oklch(0.89 0.009 75)` |
| `--muted-foreground` | `oklch(0.48 0.015 65)` |
| `--destructive` | `oklch(0.55 0.18 25)` — error red |
| `--font-serif` | DM Serif Display (via `next/font/google`) |
| `--font-sans` | DM Sans (via `next/font/google`) |
| `--radius` | `10px` |

**Changing fonts later:** edit one line in `src/app/layout.tsx`. The whole app updates.

---

## shadcn Components to Install

Only what is needed now:

- **Button** — variants: default (primary), secondary, ghost, destructive
- **Input** — with focus ring (`ring-primary/10`) and error state
- **Select** — with custom chevron arrow
- **Card** — with CardHeader, CardContent, CardTitle
- **Badge** — variants: default, secondary, destructive, outline
- **Dialog** — replaces existing `Modal.tsx` (the old file is deleted; all call sites updated to use shadcn Dialog directly)
- **Table** — TableHeader, TableBody, TableRow, TableHead, TableCell
- **Separator** — for sidebar dividers
- **Avatar** — for user section in sidebar

---

## AppShell & Sidebar

Rebuilt to exactly match the prototype:

- **Logo area** — green shield icon (SVG) + "Nieuwe Moskee" bold / "ANBI Dashboard" subtle text
- **"Nieuwe donatie" CTA** — full-width primary Button at top of nav section (wired to donation form in a future phase)
- **6 nav items** — Dashboard, Leden, Ondernemers, Donaties, Toezeggingen, Evenementen
  - Active: accent-light background, accent-colored icon, bold label
  - Inactive: transparent background, muted icon
  - The `onNewDonatie` prop is a no-op placeholder for now
- **User section** at bottom — displays user name + email from Supabase auth, ghost uitloggen button
- **Sticky** — `position: sticky; height: 100vh` so sidebar stays fixed while content scrolls
- **Width:** 220px

---

## Pages

### Login page
Rebuilt to match prototype:
- Centered card with `shadow-lg`
- Logo bar at top (icon + org name)
- Lock icon in accent-light circle above form
- DM Serif Display heading "Inloggen"
- Email + password inputs (FocusInput pattern: border changes color on focus/error)
- Show/hide password toggle
- Error message with icon
- Animated entrance (`opacity` + `translateY` on mount)
- Footer bar with org details

### Dashboard page
- Serif heading "Dashboard" + today's date subtitle
- Placeholder stat cards (4 cards in a 2-col grid) — real widgets come in a later phase

### Leden page
- shadcn Table replaces inline `<table>`
- shadcn Badge for status chips (Actief = green, Inactief = grey, Prospect = yellow, Opgezegd = red)
- shadcn Button for "Lid toevoegen" and "Leden importeren"
- shadcn Dialog replaces custom Modal for add/edit form
- Empty state card unchanged in structure, restyled

### Donaties page
- Same treatment as Leden
- Stat cards at top use shadcn Card
- shadcn Table for donations list
- shadcn Dialog for add/edit form

### Placeholder pages (3 new files)
`src/app/ondernemers/page.tsx`, `src/app/toezeggingen/page.tsx`, `src/app/evenementen/page.tsx` — each shows:
- Page title in DM Serif Display
- Centered "Komt binnenkort" message in a Card
- No further functionality

---

## What Does NOT Change

- Supabase queries — no data layer changes
- Routing — same Next.js App Router pages
- Auth flow — same Supabase auth
- Import/export logic
- CSV import flow
- Organizations / onboarding

---

## Verification

After implementation, check:
1. `npm run build` passes with no TypeScript errors
2. Login page matches prototype visually
3. Sidebar shows all 6 items; active state highlights correctly
4. Members and donations tables render with correct Badge colors
5. Add/edit modals open and close correctly via shadcn Dialog
6. Placeholder pages show "Komt binnenkort"
7. Fonts load correctly (DM Serif Display in headings, DM Sans in body)
