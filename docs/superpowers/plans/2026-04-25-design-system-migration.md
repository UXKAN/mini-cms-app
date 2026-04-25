# Design System Migration (shadcn/ui + Tailwind v4) Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Migrate the mosque CRM app to shadcn/ui + Tailwind v4, matching the Claude Design prototype visually with zero functionality changes.

**Architecture:** Tailwind v4 already installed. shadcn/ui initialised on top via manual `components.json` + CLI `add` commands. Existing CSS vars (`--bg`, `--accent`, etc.) are preserved; shadcn vars (`--primary`, `--background`, etc.) are added alongside. Modal.tsx deleted; all call sites updated to shadcn Dialog. AppShell rebuilt to match prototype sidebar.

**Tech Stack:** Next.js 16 App Router · Tailwind v4 (`@import "tailwindcss"`) · shadcn/ui · lucide-react · DM Serif Display + DM Sans (already in `layout.tsx` — no changes needed there)

---

## File Map

| Action | Path |
|--------|------|
| Create | `src/lib/utils.ts` |
| Create | `components.json` |
| Create | `src/components/ui/` (10 files via CLI) |
| Create | `src/app/ondernemers/page.tsx` |
| Create | `src/app/toezeggingen/page.tsx` |
| Create | `src/app/evenementen/page.tsx` |
| Modify | `src/app/globals.css` |
| Modify | `src/app/components/AppShell.tsx` |
| Modify | `src/app/login/page.tsx` |
| Modify | `src/app/members/page.tsx` |
| Modify | `src/app/donations/page.tsx` |
| Modify | `src/app/dashboard/page.tsx` |
| Delete | `src/app/components/Modal.tsx` |

---

## Task 1: Install dependencies + scaffolding

**Files:**
- Modify: `package.json` (via npm install)
- Create: `src/lib/utils.ts`
- Create: `components.json`

- [ ] **Step 1: Install npm deps**

```bash
cd /Users/uxkan/Desktop/mini-cms-app
npm install class-variance-authority clsx tailwind-merge lucide-react
```

Expected: packages added to `dependencies` in package.json, no errors.

- [ ] **Step 2: Create `src/lib/utils.ts`**

```ts
import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}
```

- [ ] **Step 3: Create `components.json` in project root**

```json
{
  "$schema": "https://ui.shadcn.com/schema.json",
  "style": "default",
  "rsc": true,
  "tsx": true,
  "tailwind": {
    "config": "",
    "css": "src/app/globals.css",
    "baseColor": "neutral",
    "cssVariables": true,
    "prefix": ""
  },
  "aliases": {
    "components": "@/components",
    "utils": "@/lib/utils",
    "ui": "@/components/ui",
    "lib": "@/lib",
    "hooks": "@/hooks"
  },
  "iconLibrary": "lucide"
}
```

- [ ] **Step 4: Verify TypeScript path alias works**

The existing `tsconfig.json` already has `"@/*": ["./src/*"]`, so `@/lib/utils` resolves to `src/lib/utils.ts` and `@/components/ui/button` resolves to `src/components/ui/button.tsx`. No tsconfig change needed.

- [ ] **Step 5: Commit**

```bash
git add src/lib/utils.ts components.json package.json package-lock.json
git commit -m "feat: install shadcn deps and scaffolding"
```

---

## Task 2: Update globals.css with shadcn token bridge

**Files:**
- Modify: `src/app/globals.css`

The existing `:root` vars (`--bg`, `--accent`, `--surface`, etc.) MUST be preserved — existing pages still reference them. Add the shadcn-required vars and a `@theme inline` block so Tailwind v4 utility classes (`bg-primary`, `text-muted-foreground`, etc.) map to the CSS vars.

- [ ] **Step 1: Replace `src/app/globals.css` with the full updated content**

```css
@import "tailwindcss";

/* Maps CSS vars → Tailwind v4 utility classes */
@theme inline {
  --color-background: var(--background);
  --color-foreground: var(--foreground);
  --color-card: var(--card);
  --color-card-foreground: var(--card-foreground);
  --color-popover: var(--popover);
  --color-popover-foreground: var(--popover-foreground);
  --color-primary: var(--primary);
  --color-primary-foreground: var(--primary-foreground);
  --color-secondary: var(--secondary);
  --color-secondary-foreground: var(--secondary-foreground);
  --color-muted: var(--muted);
  --color-muted-foreground: var(--muted-foreground);
  --color-accent: var(--accent);
  --color-accent-foreground: var(--accent-foreground);
  --color-destructive: var(--destructive);
  --color-destructive-foreground: var(--destructive-foreground);
  --color-border: var(--border);
  --color-input: var(--input);
  --color-ring: var(--ring);
}

:root {
  color-scheme: light;

  /* ── Existing app vars (do not remove – used by imports, onboarding pages) ── */
  --bg: oklch(0.968 0.007 75);
  --surface: oklch(0.995 0.003 75);
  --border: oklch(0.89 0.009 75);
  --border-focus: oklch(0.52 0.13 165);
  --ink: oklch(0.18 0.02 65);
  --ink-muted: oklch(0.48 0.015 65);
  --ink-subtle: oklch(0.68 0.01 65);
  --accent: oklch(0.52 0.13 165);
  --accent-light: oklch(0.94 0.04 165);
  --accent-dark: oklch(0.40 0.13 165);
  --error: oklch(0.55 0.18 25);
  --error-light: oklch(0.95 0.04 25);
  --success: oklch(0.55 0.15 150);
  --success-light: oklch(0.94 0.04 150);
  --warn: oklch(0.65 0.15 80);
  --warn-light: oklch(0.95 0.05 80);
  --radius: 10px;
  --radius-sm: 7px;
  --shadow: 0 1px 3px oklch(0.18 0.02 65 / 0.05), 0 3px 10px oklch(0.18 0.02 65 / 0.05);
  --shadow-lg: 0 4px 16px oklch(0.18 0.02 65 / 0.1), 0 16px 48px oklch(0.18 0.02 65 / 0.1);

  /* ── shadcn compatibility vars ── */
  --background: oklch(0.968 0.007 75);
  --foreground: oklch(0.18 0.02 65);
  --card: oklch(0.995 0.003 75);
  --card-foreground: oklch(0.18 0.02 65);
  --popover: oklch(0.995 0.003 75);
  --popover-foreground: oklch(0.18 0.02 65);
  --primary: oklch(0.52 0.13 165);
  --primary-foreground: oklch(0.99 0.002 75);
  --secondary: oklch(0.94 0.005 75);
  --secondary-foreground: oklch(0.18 0.02 65);
  --muted: oklch(0.94 0.005 75);
  --muted-foreground: oklch(0.48 0.015 65);
  --accent-foreground: oklch(0.40 0.13 165);
  --destructive: oklch(0.55 0.18 25);
  --destructive-foreground: oklch(0.99 0.002 75);
  --input: oklch(0.89 0.009 75);
  --ring: oklch(0.52 0.13 165);
  /* Note: --border, --radius, --accent already defined above */
}

* {
  box-sizing: border-box;
  margin: 0;
  padding: 0;
  -webkit-tap-highlight-color: transparent;
}

html,
body {
  min-height: 100%;
  background: var(--bg);
  color: var(--ink);
}

body {
  font-family: var(--font-sans), system-ui, sans-serif;
  -webkit-font-smoothing: antialiased;
  line-height: 1.5;
}

::placeholder {
  color: var(--ink-subtle);
}

::-webkit-scrollbar {
  width: 6px;
  height: 6px;
}
::-webkit-scrollbar-track {
  background: transparent;
}
::-webkit-scrollbar-thumb {
  background: var(--border);
  border-radius: 99px;
}

input,
button {
  font-family: inherit;
}

input:focus {
  outline: none;
  border-color: var(--border-focus);
}

@keyframes modalFadeIn {
  from { opacity: 0; }
  to { opacity: 1; }
}

@keyframes modalSlideIn {
  from { opacity: 0; transform: translateY(-8px); }
  to { opacity: 1; transform: translateY(0); }
}
```

- [ ] **Step 2: Commit**

```bash
git add src/app/globals.css
git commit -m "feat: add shadcn CSS vars and @theme inline bridge to globals.css"
```

---

## Task 3: Install shadcn components via CLI

**Files:**
- Create: `src/components/ui/button.tsx`, `input.tsx`, `select.tsx`, `card.tsx`, `badge.tsx`, `dialog.tsx`, `table.tsx`, `separator.tsx`, `avatar.tsx`, `label.tsx`

- [ ] **Step 1: Run shadcn add for all required components**

```bash
cd /Users/uxkan/Desktop/mini-cms-app
npx shadcn@latest add button input select card badge dialog table separator avatar label --overwrite
```

When prompted "Would you like to proceed?" answer `y`.

Expected: `src/components/ui/` directory created with component files. The CLI may also patch `globals.css` — that's fine, but verify afterward that the existing vars are still present (see Step 2).

- [ ] **Step 2: Verify globals.css still contains existing vars**

Check that `--bg`, `--accent`, `--surface`, `--ink` are still in `:root`. If the CLI overwrote globals.css with its own `:root` block, restore the full content from Task 2.

```bash
grep -c "\-\-bg:" src/app/globals.css
```

Expected output: `1`. If `0`, restore globals.css from Task 2.

- [ ] **Step 3: Verify TypeScript compiles**

```bash
npx tsc --noEmit
```

Expected: no errors.

- [ ] **Step 4: Commit**

```bash
git add src/components/ src/app/globals.css
git commit -m "feat: add shadcn/ui component primitives"
```

---

## Task 4: Rebuild AppShell.tsx

**Files:**
- Modify: `src/app/components/AppShell.tsx`

Full rebuild to match prototype: 6 nav items, green shield logo, "Nieuwe donatie" CTA, user info + logout at bottom.

- [ ] **Step 1: Replace `src/app/components/AppShell.tsx` with:**

```tsx
"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Shield,
  LayoutDashboard,
  Users,
  Briefcase,
  Heart,
  FileCheck,
  Calendar,
  LogOut,
} from "lucide-react";
import { supabase } from "../lib/supabase";
import { useAuth } from "../lib/useAuth";
import { useCurrentOrg } from "../lib/org";
import { OrgContext } from "../lib/orgContext";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";

const nav = [
  { href: "/dashboard", label: "Dashboard", Icon: LayoutDashboard },
  { href: "/members", label: "Leden", Icon: Users },
  { href: "/ondernemers", label: "Ondernemers", Icon: Briefcase },
  { href: "/donations", label: "Donaties", Icon: Heart },
  { href: "/toezeggingen", label: "Toezeggingen", Icon: FileCheck },
  { href: "/evenementen", label: "Evenementen", Icon: Calendar },
];

export default function AppShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const { user, loading: authLoading } = useAuth();
  const { org, loading: orgLoading } = useCurrentOrg(user);

  const handleLogout = async () => {
    await supabase.auth.signOut();
    window.location.href = "/login";
  };

  if (authLoading || orgLoading || !user) {
    return <main className="p-10 text-muted-foreground">Laden...</main>;
  }

  if (!org) return null;

  const userLabel =
    (user.user_metadata?.full_name as string | undefined) ??
    user.email?.split("@")[0] ??
    "Gebruiker";
  const initial = (user.email ?? "?").charAt(0).toUpperCase();

  return (
    <OrgContext.Provider value={org}>
      <div className="flex min-h-screen">
        {/* ── Sidebar ── */}
        <aside className="w-[220px] bg-card border-r border-border flex flex-col sticky top-0 h-screen shrink-0">
          {/* Logo */}
          <div className="px-4 pt-6 pb-4">
            <div className="flex items-center gap-2.5">
              <Shield size={20} className="text-primary shrink-0" />
              <div>
                <div className="font-sans text-[13px] font-bold text-foreground leading-tight">
                  Nieuwe Moskee
                </div>
                <div className="text-[9px] text-muted-foreground tracking-widest uppercase mt-0.5">
                  ANBI Dashboard
                </div>
              </div>
            </div>
          </div>

          {/* Nieuwe donatie CTA */}
          <div className="px-3 pb-3">
            <Button
              className="w-full text-sm"
              size="sm"
              onClick={() => {}}
            >
              + Nieuwe donatie
            </Button>
          </div>

          <Separator />

          {/* Nav */}
          <nav className="flex-1 px-2 py-2 flex flex-col gap-0.5 overflow-y-auto">
            {nav.map(({ href, label, Icon }) => {
              const active =
                pathname === href || pathname.startsWith(href + "/");
              return (
                <Link
                  key={href}
                  href={href}
                  className={[
                    "flex items-center gap-2.5 px-3 py-2.5 rounded-[7px] text-[13px] font-medium transition-colors no-underline",
                    active
                      ? "bg-[var(--accent-light)] text-[var(--accent-dark)]"
                      : "text-foreground hover:bg-background",
                  ].join(" ")}
                >
                  <Icon
                    size={14}
                    className={
                      active ? "text-[var(--accent-dark)]" : "text-muted-foreground"
                    }
                  />
                  {label}
                </Link>
              );
            })}
          </nav>

          {/* User section */}
          <Separator />
          <div className="px-3 py-3 flex flex-col gap-2">
            <div className="flex items-center gap-2 px-1">
              <Avatar className="h-7 w-7 shrink-0">
                <AvatarFallback className="text-[11px] bg-[var(--accent-light)] text-[var(--accent-dark)]">
                  {initial}
                </AvatarFallback>
              </Avatar>
              <div className="min-w-0">
                <div className="text-[12px] font-medium text-foreground truncate">
                  {userLabel}
                </div>
                <div className="text-[10px] text-muted-foreground truncate">
                  {user.email}
                </div>
              </div>
            </div>
            <Button
              variant="ghost"
              size="sm"
              className="w-full justify-start text-muted-foreground gap-2 text-[12px] h-8"
              onClick={handleLogout}
            >
              <LogOut size={12} />
              Uitloggen
            </Button>
          </div>
        </aside>

        {/* ── Main content ── */}
        <main className="flex-1 px-12 py-10">{children}</main>
      </div>
    </OrgContext.Provider>
  );
}
```

- [ ] **Step 2: Verify TypeScript**

```bash
npx tsc --noEmit
```

Expected: no errors.

- [ ] **Step 3: Commit**

```bash
git add src/app/components/AppShell.tsx
git commit -m "feat: rebuild AppShell with 6 nav items, logo, CTA, user section"
```

---

## Task 5: Rebuild login/page.tsx

**Files:**
- Modify: `src/app/login/page.tsx`

Match prototype: centered card, lock icon, DM Serif heading, show/hide password, error state with icon, animated entrance. Remove signup button.

- [ ] **Step 1: Replace `src/app/login/page.tsx` with:**

```tsx
"use client";

import { useEffect, useState } from "react";
import { Shield, Lock, Eye, EyeOff, AlertCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { supabase } from "../lib/supabase";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) {
      setError(error.message);
      setLoading(false);
      return;
    }
    window.location.href = "/dashboard";
  };

  return (
    <div className="min-h-screen bg-background flex flex-col">
      {/* Top logo bar */}
      <header className="h-14 flex items-center px-8 border-b border-border shrink-0">
        <div className="flex items-center gap-2">
          <Shield size={18} className="text-primary" />
          <span className="font-sans text-[13px] font-bold text-foreground">
            Nieuwe Moskee
          </span>
        </div>
      </header>

      {/* Centered form */}
      <main className="flex-1 flex items-center justify-center p-6">
        <div
          className="w-full max-w-sm"
          style={{
            opacity: mounted ? 1 : 0,
            transform: mounted ? "translateY(0)" : "translateY(-10px)",
            transition: "opacity 0.3s ease, transform 0.3s ease",
          }}
        >
          {/* Lock icon circle */}
          <div className="flex justify-center mb-6">
            <div
              className="w-14 h-14 rounded-full flex items-center justify-center"
              style={{ background: "var(--accent-light)" }}
            >
              <Lock size={22} className="text-primary" />
            </div>
          </div>

          <Card className="shadow-lg">
            <CardContent className="p-6">
              <h1 className="font-serif text-2xl font-normal text-foreground text-center mb-6">
                Inloggen
              </h1>

              <form onSubmit={handleLogin} className="flex flex-col gap-3">
                <Input
                  type="email"
                  placeholder="E-mailadres"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  autoComplete="email"
                />

                <div className="relative">
                  <Input
                    type={showPassword ? "text" : "password"}
                    placeholder="Wachtwoord"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    autoComplete="current-password"
                    className="pr-10"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                    tabIndex={-1}
                    aria-label={showPassword ? "Verberg wachtwoord" : "Toon wachtwoord"}
                  >
                    {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                  </button>
                </div>

                {error && (
                  <div
                    className="flex items-center gap-2 p-3 rounded-[7px] text-sm"
                    style={{
                      background: "var(--error-light)",
                      color: "var(--error)",
                    }}
                  >
                    <AlertCircle size={14} className="shrink-0" />
                    <span>{error}</span>
                  </div>
                )}

                <Button type="submit" className="w-full mt-1" disabled={loading}>
                  {loading ? "Bezig..." : "Inloggen"}
                </Button>
              </form>
            </CardContent>
          </Card>
        </div>
      </main>

      {/* Footer */}
      <footer className="h-10 flex items-center justify-center border-t border-border shrink-0">
        <p className="text-[11px] text-muted-foreground">
          Nieuwe Moskee · ANBI Dashboard
        </p>
      </footer>
    </div>
  );
}
```

- [ ] **Step 2: Verify TypeScript**

```bash
npx tsc --noEmit
```

Expected: no errors.

- [ ] **Step 3: Commit**

```bash
git add src/app/login/page.tsx
git commit -m "feat: rebuild login page to match prototype design"
```

---

## Task 6: Restyle members/page.tsx

**Files:**
- Modify: `src/app/members/page.tsx`

Replace: inline `<table>` → shadcn Table, `StatusChip` → shadcn Badge, `<button style={...}>` → shadcn Button, `<Modal>` → shadcn Dialog. All Supabase logic and state unchanged.

- [ ] **Step 1: Replace `src/app/members/page.tsx` with:**

```tsx
"use client";

import { useCallback, useEffect, useState } from "react";
import { supabase } from "../lib/supabase";
import { useAuth } from "../lib/useAuth";
import AppShell from "../components/AppShell";
import MemberImporter from "../components/MemberImporter";
import { useOrg } from "../lib/orgContext";
import type { Member, MemberStatus } from "../lib/types";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

const STATUS_OPTIONS: { value: MemberStatus; label: string }[] = [
  { value: "active", label: "Actief" },
  { value: "inactive", label: "Inactief" },
  { value: "prospect", label: "Prospect" },
  { value: "cancelled", label: "Opgezegd" },
];

type ModalMode = "closed" | "add" | "edit" | "import";

function displayName(m: Member): string {
  const combined = [m.first_name, m.last_name].filter(Boolean).join(" ").trim();
  return combined || m.name || "—";
}

function StatusBadge({ status }: { status: MemberStatus }) {
  if (status === "active") return <Badge>Actief</Badge>;
  if (status === "inactive") return <Badge variant="secondary">Inactief</Badge>;
  if (status === "cancelled") return <Badge variant="destructive">Opgezegd</Badge>;
  return (
    <Badge
      variant="outline"
      style={{ borderColor: "var(--warn)", color: "var(--warn)" }}
    >
      Prospect
    </Badge>
  );
}

function MembersInner() {
  const { user } = useAuth();
  const org = useOrg();

  const [members, setMembers] = useState<Member[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [modalMode, setModalMode] = useState<ModalMode>("closed");
  const [editing, setEditing] = useState<Member | null>(null);

  const fetchMembers = useCallback(async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from("members")
      .select("*")
      .eq("org_id", org.id)
      .order("created_at", { ascending: false });
    if (error) setError(error.message);
    else setMembers((data ?? []) as Member[]);
    setLoading(false);
  }, [org.id]);

  useEffect(() => {
    if (user) fetchMembers();
  }, [user, fetchMembers]);

  const openAdd = () => { setEditing(null); setModalMode("add"); };
  const openEdit = (m: Member) => { setEditing(m); setModalMode("edit"); };
  const openImport = () => { setEditing(null); setModalMode("import"); };
  const closeModal = () => { setModalMode("closed"); setEditing(null); };

  const handleDelete = async (id: string) => {
    if (!confirm("Weet je zeker dat je dit lid wilt verwijderen?")) return;
    const { error } = await supabase.from("members").delete().eq("id", id);
    if (error) setError(error.message);
    else await fetchMembers();
  };

  return (
    <>
      <div className="flex justify-between items-end mb-7 gap-4 flex-wrap">
        <div>
          <h1 className="font-serif text-4xl font-normal text-foreground">Leden</h1>
          <p className="text-muted-foreground text-sm mt-1">
            Beheer je leden en contactpersonen.
          </p>
        </div>
        {members.length > 0 && (
          <div className="flex gap-2">
            <Button variant="outline" onClick={openImport}>
              Leden importeren
            </Button>
            <Button onClick={openAdd}>Lid toevoegen</Button>
          </div>
        )}
      </div>

      {error && (
        <div
          className="p-3 rounded-[7px] mb-4 text-sm"
          style={{ background: "var(--error-light)", color: "var(--error)" }}
        >
          {error}
        </div>
      )}

      {loading ? (
        <p className="text-muted-foreground">Leden laden...</p>
      ) : members.length === 0 ? (
        <div
          className="rounded-[10px] border border-border p-14 text-center"
          style={{ background: "var(--surface)" }}
        >
          <h2 className="font-serif text-2xl font-normal text-foreground mb-2">
            Nog geen leden
          </h2>
          <p className="text-muted-foreground text-sm mb-6">
            Voeg er één toe of importeer uit Excel of CSV.
          </p>
          <div className="flex justify-center gap-2">
            <Button onClick={openAdd}>Lid toevoegen</Button>
            <Button variant="outline" onClick={openImport}>
              Leden importeren
            </Button>
          </div>
        </div>
      ) : (
        <div
          className="rounded-[10px] border border-border overflow-hidden"
          style={{ background: "var(--surface)" }}
        >
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Naam</TableHead>
                <TableHead>E-mail</TableHead>
                <TableHead>Telefoon</TableHead>
                <TableHead>Woonplaats</TableHead>
                <TableHead>Type</TableHead>
                <TableHead>Bedrag</TableHead>
                <TableHead>Status</TableHead>
                <TableHead />
              </TableRow>
            </TableHeader>
            <TableBody>
              {members.map((m) => (
                <TableRow key={m.id}>
                  <TableCell className="font-medium">{displayName(m)}</TableCell>
                  <TableCell>{m.email ?? "—"}</TableCell>
                  <TableCell>{m.phone ?? "—"}</TableCell>
                  <TableCell>{m.city ?? "—"}</TableCell>
                  <TableCell>{m.membership_type ?? "—"}</TableCell>
                  <TableCell>
                    {m.monthly_amount != null
                      ? `€ ${m.monthly_amount.toFixed(2)}`
                      : "—"}
                  </TableCell>
                  <TableCell>
                    <StatusBadge status={m.status} />
                  </TableCell>
                  <TableCell className="text-right whitespace-nowrap">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => openEdit(m)}
                    >
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
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      )}

      {/* Add / Edit dialog */}
      <Dialog
        open={modalMode === "add" || modalMode === "edit"}
        onOpenChange={(open) => { if (!open) closeModal(); }}
      >
        <DialogContent className="max-w-[640px] max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="font-serif font-normal text-xl">
              {modalMode === "edit" ? "Lid bewerken" : "Nieuw lid"}
            </DialogTitle>
          </DialogHeader>
          <MemberForm
            initial={editing}
            onSaved={async () => { closeModal(); await fetchMembers(); }}
            onCancel={closeModal}
          />
        </DialogContent>
      </Dialog>

      {/* Import dialog */}
      <Dialog
        open={modalMode === "import"}
        onOpenChange={(open) => { if (!open) closeModal(); }}
      >
        <DialogContent className="max-w-[960px] max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="font-serif font-normal text-xl">
              Leden importeren
            </DialogTitle>
          </DialogHeader>
          <MemberImporter
            showReportLink={false}
            onDone={async () => { closeModal(); await fetchMembers(); }}
          />
        </DialogContent>
      </Dialog>
    </>
  );
}

export default function MembersPage() {
  return (
    <AppShell>
      <MembersInner />
    </AppShell>
  );
}

function MemberForm({
  initial,
  onSaved,
  onCancel,
}: {
  initial: Member | null;
  onSaved: () => void | Promise<void>;
  onCancel: () => void;
}) {
  const { user } = useAuth();
  const org = useOrg();

  const [firstName, setFirstName] = useState(initial?.first_name ?? "");
  const [lastName, setLastName] = useState(
    initial?.last_name ?? (initial?.first_name ? "" : initial?.name ?? "")
  );
  const [email, setEmail] = useState(initial?.email ?? "");
  const [phone, setPhone] = useState(initial?.phone ?? "");
  const [address, setAddress] = useState(initial?.address ?? "");
  const [postcode, setPostcode] = useState(initial?.postcode ?? "");
  const [city, setCity] = useState(initial?.city ?? "");
  const [iban, setIban] = useState(initial?.iban ?? "");
  const [membershipType, setMembershipType] = useState(initial?.membership_type ?? "");
  const [monthlyAmount, setMonthlyAmount] = useState(
    initial?.monthly_amount != null ? String(initial.monthly_amount) : ""
  );
  const [startDate, setStartDate] = useState(initial?.start_date ?? "");
  const [status, setStatus] = useState<MemberStatus>(initial?.status ?? "active");
  const [notes, setNotes] = useState(initial?.notes ?? "");
  const [saving, setSaving] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;
    const hasName = firstName.trim() || lastName.trim();
    if (!hasName) {
      setFormError("Vul minimaal een voornaam of achternaam in.");
      return;
    }
    setSaving(true);
    setFormError(null);

    const payload = {
      first_name: firstName.trim() || null,
      last_name: lastName.trim() || null,
      name: [firstName.trim(), lastName.trim()].filter(Boolean).join(" ") || null,
      email: email.trim() || null,
      phone: phone.trim() || null,
      address: address.trim() || null,
      postcode: postcode.trim() || null,
      city: city.trim() || null,
      iban: iban.trim().replace(/\s+/g, "").toUpperCase() || null,
      membership_type: membershipType.trim() || null,
      monthly_amount: monthlyAmount.trim() ? Number(monthlyAmount) : null,
      start_date: startDate || null,
      status,
      notes: notes.trim() || null,
    };

    const { error } = initial
      ? await supabase.from("members").update(payload).eq("id", initial.id)
      : await supabase
          .from("members")
          .insert({ ...payload, user_id: user.id, org_id: org.id });

    if (error) {
      setFormError(error.message);
      setSaving(false);
    } else {
      setSaving(false);
      await onSaved();
    }
  };

  const inputCls = "h-10 text-sm";

  return (
    <form onSubmit={handleSubmit}>
      <div className="grid grid-cols-2 gap-3">
        <Input
          placeholder="Voornaam *"
          value={firstName}
          onChange={(e) => setFirstName(e.target.value)}
          className={inputCls}
        />
        <Input
          placeholder="Achternaam"
          value={lastName}
          onChange={(e) => setLastName(e.target.value)}
          className={inputCls}
        />
        <Input
          type="email"
          placeholder="E-mail"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className={inputCls}
        />
        <Input
          placeholder="Telefoon"
          value={phone}
          onChange={(e) => setPhone(e.target.value)}
          className={inputCls}
        />
        <Input
          placeholder="Adres"
          value={address}
          onChange={(e) => setAddress(e.target.value)}
          className={`${inputCls} col-span-2`}
        />
        <Input
          placeholder="Postcode"
          value={postcode}
          onChange={(e) => setPostcode(e.target.value)}
          className={inputCls}
        />
        <Input
          placeholder="Woonplaats"
          value={city}
          onChange={(e) => setCity(e.target.value)}
          className={inputCls}
        />
        <Input
          placeholder="IBAN"
          value={iban}
          onChange={(e) => setIban(e.target.value)}
          className={inputCls}
        />
        <Input
          placeholder="Lidmaatschapstype"
          value={membershipType}
          onChange={(e) => setMembershipType(e.target.value)}
          className={inputCls}
        />
        <Input
          type="number"
          step="0.01"
          min="0"
          placeholder="Maandbedrag"
          value={monthlyAmount}
          onChange={(e) => setMonthlyAmount(e.target.value)}
          className={inputCls}
        />
        <Input
          type="date"
          value={startDate}
          onChange={(e) => setStartDate(e.target.value)}
          className={inputCls}
        />
        <div className="flex flex-col gap-1.5">
          <Label className="text-xs text-muted-foreground">Status</Label>
          <select
            value={status}
            onChange={(e) => setStatus(e.target.value as MemberStatus)}
            className="h-10 rounded-md border border-border bg-background px-3 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-ring"
          >
            {STATUS_OPTIONS.map((o) => (
              <option key={o.value} value={o.value}>
                {o.label}
              </option>
            ))}
          </select>
        </div>
        <Input
          placeholder="Notities"
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
          className={`${inputCls} col-span-2`}
        />
      </div>

      {formError && (
        <div
          className="p-3 rounded-[7px] mt-4 text-sm"
          style={{ background: "var(--error-light)", color: "var(--error)" }}
        >
          {formError}
        </div>
      )}

      <div className="flex gap-2 mt-5 justify-end">
        <Button type="button" variant="outline" onClick={onCancel} disabled={saving}>
          Annuleren
        </Button>
        <Button type="submit" disabled={saving}>
          {saving ? "Opslaan..." : initial ? "Opslaan" : "Toevoegen"}
        </Button>
      </div>
    </form>
  );
}
```

- [ ] **Step 2: Verify TypeScript**

```bash
npx tsc --noEmit
```

Expected: no errors.

- [ ] **Step 3: Commit**

```bash
git add src/app/members/page.tsx
git commit -m "feat: restyle members page with shadcn Table, Badge, Button, Dialog"
```

---

## Task 7: Restyle donations/page.tsx

**Files:**
- Modify: `src/app/donations/page.tsx`

Same treatment as members: shadcn Card for stat cards, Table for list, Button for actions, Dialog replaces Modal.

- [ ] **Step 1: Replace `src/app/donations/page.tsx` with:**

```tsx
"use client";

import { useCallback, useEffect, useState } from "react";
import { supabase } from "../lib/supabase";
import { useAuth } from "../lib/useAuth";
import AppShell from "../components/AppShell";
import { useOrg } from "../lib/orgContext";
import type { DonationMethod, DonationWithMember, Member } from "../lib/types";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

const METHOD_LABELS: Record<DonationMethod, string> = {
  cash: "Contant",
  bank: "Bank",
  online: "Online",
  other: "Overig",
};

const todayIso = () => new Date().toISOString().slice(0, 10);

function memberLabel(m: Pick<Member, "name" | "first_name" | "last_name">): string {
  const combined = [m.first_name, m.last_name].filter(Boolean).join(" ").trim();
  return combined || m.name || "—";
}

type ModalMode = "closed" | "add" | "edit";

function DonationsInner() {
  const { user } = useAuth();
  const org = useOrg();

  const [donations, setDonations] = useState<DonationWithMember[]>([]);
  const [members, setMembers] = useState<Member[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [modalMode, setModalMode] = useState<ModalMode>("closed");
  const [editing, setEditing] = useState<DonationWithMember | null>(null);

  const fetchAll = useCallback(async () => {
    setLoading(true);
    const [donRes, memRes] = await Promise.all([
      supabase
        .from("donations")
        .select("*, member:members(id, name, first_name, last_name)")
        .eq("org_id", org.id)
        .order("donated_at", { ascending: false }),
      supabase
        .from("members")
        .select("id, name, first_name, last_name")
        .eq("org_id", org.id)
        .order("last_name", { nullsFirst: false })
        .order("name"),
    ]);
    if (donRes.error) setError(donRes.error.message);
    else setDonations((donRes.data ?? []) as DonationWithMember[]);
    if (!memRes.error) setMembers((memRes.data ?? []) as Member[]);
    setLoading(false);
  }, [org.id]);

  useEffect(() => { if (user) fetchAll(); }, [user, fetchAll]);

  const openAdd = () => { setEditing(null); setModalMode("add"); };
  const openEdit = (d: DonationWithMember) => { setEditing(d); setModalMode("edit"); };
  const closeModal = () => { setModalMode("closed"); setEditing(null); };

  const handleDelete = async (id: string) => {
    if (!confirm("Donatie verwijderen?")) return;
    const { error } = await supabase.from("donations").delete().eq("id", id);
    if (error) setError(error.message);
    else await fetchAll();
  };

  const total = donations.reduce((sum, d) => sum + Number(d.amount), 0);
  const yearStart = new Date(new Date().getFullYear(), 0, 1).toISOString().slice(0, 10);
  const yearTotal = donations
    .filter((d) => d.donated_at >= yearStart)
    .reduce((sum, d) => sum + Number(d.amount), 0);

  return (
    <>
      <div className="flex justify-between items-end mb-7 gap-4 flex-wrap">
        <div>
          <h1 className="font-serif text-4xl font-normal text-foreground">Donaties</h1>
          <p className="text-muted-foreground text-sm mt-1">
            Registreer donaties en koppel ze optioneel aan een lid.
          </p>
        </div>
        {donations.length > 0 && (
          <Button onClick={openAdd}>Donatie toevoegen</Button>
        )}
      </div>

      {donations.length > 0 && (
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
          <StatCard label="Totaal dit jaar" value={formatEuro(yearTotal)} />
          <StatCard label="Totaal (alles)" value={formatEuro(total)} />
          <StatCard label="Aantal donaties" value={String(donations.length)} />
        </div>
      )}

      {error && (
        <div
          className="p-3 rounded-[7px] mb-4 text-sm"
          style={{ background: "var(--error-light)", color: "var(--error)" }}
        >
          {error}
        </div>
      )}

      {loading ? (
        <p className="text-muted-foreground">Donaties laden...</p>
      ) : donations.length === 0 ? (
        <div
          className="rounded-[10px] border border-border p-14 text-center"
          style={{ background: "var(--surface)" }}
        >
          <h2 className="font-serif text-2xl font-normal text-foreground mb-2">
            Nog geen donaties
          </h2>
          <p className="text-muted-foreground text-sm mb-6">
            Registreer je eerste donatie en koppel deze optioneel aan een lid.
          </p>
          <Button onClick={openAdd}>Donatie toevoegen</Button>
        </div>
      ) : (
        <div
          className="rounded-[10px] border border-border overflow-hidden"
          style={{ background: "var(--surface)" }}
        >
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Datum</TableHead>
                <TableHead>Bedrag</TableHead>
                <TableHead>Methode</TableHead>
                <TableHead>Lid</TableHead>
                <TableHead>Notities</TableHead>
                <TableHead />
              </TableRow>
            </TableHeader>
            <TableBody>
              {donations.map((d) => (
                <TableRow key={d.id}>
                  <TableCell>
                    {new Date(d.donated_at).toLocaleDateString("nl-NL")}
                  </TableCell>
                  <TableCell className="font-semibold">
                    {formatEuro(Number(d.amount))}
                  </TableCell>
                  <TableCell>{METHOD_LABELS[d.method]}</TableCell>
                  <TableCell>
                    {d.member ? (
                      memberLabel(d.member)
                    ) : (
                      <span className="text-muted-foreground italic">Anoniem</span>
                    )}
                  </TableCell>
                  <TableCell className="text-muted-foreground">
                    {d.notes ?? "—"}
                  </TableCell>
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
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      )}

      <Dialog
        open={modalMode !== "closed"}
        onOpenChange={(open) => { if (!open) closeModal(); }}
      >
        <DialogContent className="max-w-[520px]">
          <DialogHeader>
            <DialogTitle className="font-serif font-normal text-xl">
              {modalMode === "edit" ? "Donatie bewerken" : "Nieuwe donatie"}
            </DialogTitle>
          </DialogHeader>
          <DonationForm
            initial={editing}
            members={members}
            onSaved={async () => { closeModal(); await fetchAll(); }}
            onCancel={closeModal}
          />
        </DialogContent>
      </Dialog>
    </>
  );
}

export default function DonationsPage() {
  return (
    <AppShell>
      <DonationsInner />
    </AppShell>
  );
}

function DonationForm({
  initial,
  members,
  onSaved,
  onCancel,
}: {
  initial: DonationWithMember | null;
  members: Member[];
  onSaved: () => void | Promise<void>;
  onCancel: () => void;
}) {
  const { user } = useAuth();
  const org = useOrg();

  const [amount, setAmount] = useState(initial ? String(initial.amount) : "");
  const [method, setMethod] = useState<DonationMethod>(initial?.method ?? "bank");
  const [donatedAt, setDonatedAt] = useState(initial?.donated_at ?? todayIso());
  const [memberId, setMemberId] = useState<string>(initial?.member_id ?? "");
  const [notes, setNotes] = useState(initial?.notes ?? "");
  const [saving, setSaving] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;
    const amt = parseFloat(amount.replace(",", "."));
    if (!amt || amt <= 0) { setFormError("Vul een geldig bedrag in."); return; }
    setSaving(true);
    setFormError(null);

    const payload = {
      amount: amt,
      method,
      donated_at: donatedAt,
      member_id: memberId || null,
      notes: notes.trim() || null,
    };

    const { error } = initial
      ? await supabase.from("donations").update(payload).eq("id", initial.id)
      : await supabase
          .from("donations")
          .insert({ ...payload, user_id: user.id, org_id: org.id });

    if (error) { setFormError(error.message); setSaving(false); }
    else { setSaving(false); await onSaved(); }
  };

  const selectCls =
    "h-10 rounded-md border border-border bg-background px-3 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-ring w-full";

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-4">
      <div className="grid grid-cols-2 gap-3">
        <div className="flex flex-col gap-1.5">
          <Label className="text-xs text-muted-foreground">Bedrag (EUR) *</Label>
          <Input
            type="number"
            step="0.01"
            min="0"
            placeholder="bv. 25.00"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            required
            className="h-10 text-sm"
          />
        </div>
        <div className="flex flex-col gap-1.5">
          <Label className="text-xs text-muted-foreground">Datum *</Label>
          <Input
            type="date"
            value={donatedAt}
            onChange={(e) => setDonatedAt(e.target.value)}
            required
            className="h-10 text-sm"
          />
        </div>
        <div className="flex flex-col gap-1.5">
          <Label className="text-xs text-muted-foreground">Methode</Label>
          <select
            value={method}
            onChange={(e) => setMethod(e.target.value as DonationMethod)}
            className={selectCls}
          >
            {(Object.keys(METHOD_LABELS) as DonationMethod[]).map((m) => (
              <option key={m} value={m}>{METHOD_LABELS[m]}</option>
            ))}
          </select>
        </div>
        <div className="flex flex-col gap-1.5">
          <Label className="text-xs text-muted-foreground">Lid (optioneel)</Label>
          <select
            value={memberId}
            onChange={(e) => setMemberId(e.target.value)}
            className={selectCls}
          >
            <option value="">— anoniem —</option>
            {members.map((m) => (
              <option key={m.id} value={m.id}>{memberLabel(m)}</option>
            ))}
          </select>
        </div>
        <div className="flex flex-col gap-1.5 col-span-2">
          <Label className="text-xs text-muted-foreground">Notities</Label>
          <Input
            placeholder="Omschrijving, doel, etc."
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            className="h-10 text-sm"
          />
        </div>
      </div>

      {formError && (
        <div
          className="p-3 rounded-[7px] text-sm"
          style={{ background: "var(--error-light)", color: "var(--error)" }}
        >
          {formError}
        </div>
      )}

      <div className="flex gap-2 justify-end">
        <Button type="button" variant="outline" onClick={onCancel} disabled={saving}>
          Annuleren
        </Button>
        <Button type="submit" disabled={saving}>
          {saving ? "Opslaan..." : initial ? "Opslaan" : "Toevoegen"}
        </Button>
      </div>
    </form>
  );
}

function StatCard({ label, value }: { label: string; value: string }) {
  return (
    <Card>
      <CardContent className="p-6">
        <div className="text-[11px] font-bold text-muted-foreground tracking-widest uppercase">
          {label}
        </div>
        <div className="font-serif text-[32px] font-normal text-foreground mt-1 leading-none">
          {value}
        </div>
      </CardContent>
    </Card>
  );
}

function formatEuro(n: number) {
  return n.toLocaleString("nl-NL", {
    style: "currency",
    currency: "EUR",
    minimumFractionDigits: 2,
  });
}
```

- [ ] **Step 2: Verify TypeScript**

```bash
npx tsc --noEmit
```

Expected: no errors.

- [ ] **Step 3: Commit**

```bash
git add src/app/donations/page.tsx
git commit -m "feat: restyle donations page with shadcn Card, Table, Button, Dialog"
```

---

## Task 8: Restyle dashboard/page.tsx

**Files:**
- Modify: `src/app/dashboard/page.tsx`

Replace inline `cardStyle` objects with shadcn `<Card>`. All data fetching logic is unchanged.

- [ ] **Step 1: Replace `src/app/dashboard/page.tsx` with:**

```tsx
"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { supabase } from "../lib/supabase";
import { useAuth } from "../lib/useAuth";
import AppShell from "../components/AppShell";
import { Card, CardContent } from "@/components/ui/card";
import type { Member } from "../lib/types";

function displayName(m: Member): string {
  const combined = [m.first_name, m.last_name].filter(Boolean).join(" ").trim();
  return combined || m.name || "—";
}

export default function DashboardPage() {
  const { user, loading: authLoading } = useAuth();
  const [total, setTotal] = useState<number | null>(null);
  const [addedThisMonth, setAddedThisMonth] = useState<number | null>(null);
  const [recent, setRecent] = useState<Member[]>([]);
  const [donationYearTotal, setDonationYearTotal] = useState<number | null>(null);
  const [donationMonthTotal, setDonationMonthTotal] = useState<number | null>(null);
  const [dataLoading, setDataLoading] = useState(true);

  useEffect(() => {
    if (!user) return;
    const load = async () => {
      setDataLoading(true);
      const now = new Date();
      const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);
      const yearStart = new Date(now.getFullYear(), 0, 1);
      const monthStartIso = monthStart.toISOString().slice(0, 10);
      const yearStartIso = yearStart.toISOString().slice(0, 10);

      const [
        { count: totalCount },
        { count: monthCount },
        { data: recentRows },
        { data: yearDonations },
        { data: monthDonations },
      ] = await Promise.all([
        supabase.from("members").select("*", { count: "exact", head: true }),
        supabase
          .from("members")
          .select("*", { count: "exact", head: true })
          .gte("created_at", monthStart.toISOString()),
        supabase
          .from("members")
          .select("*")
          .order("created_at", { ascending: false })
          .limit(5),
        supabase.from("donations").select("amount").gte("donated_at", yearStartIso),
        supabase.from("donations").select("amount").gte("donated_at", monthStartIso),
      ]);

      setTotal(totalCount ?? 0);
      setAddedThisMonth(monthCount ?? 0);
      setRecent((recentRows ?? []) as Member[]);
      setDonationYearTotal(
        (yearDonations ?? []).reduce((s, d) => s + Number(d.amount), 0)
      );
      setDonationMonthTotal(
        (monthDonations ?? []).reduce((s, d) => s + Number(d.amount), 0)
      );
      setDataLoading(false);
    };
    load();
  }, [user]);

  if (authLoading) {
    return <main className="p-10 text-muted-foreground">Laden...</main>;
  }

  const today = new Date().toLocaleDateString("nl-NL", {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
  });

  return (
    <AppShell>
      <header className="mb-9">
        <h1 className="font-serif text-4xl font-normal text-foreground">Dashboard</h1>
        <p className="text-muted-foreground text-sm mt-1 capitalize">{today}</p>
      </header>

      {/* Stat cards */}
      <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 mb-8">
        <StatCard
          label="Totaal leden"
          value={dataLoading ? "…" : String(total ?? 0)}
        />
        <StatCard
          label="Toegevoegd deze maand"
          value={dataLoading ? "…" : String(addedThisMonth ?? 0)}
        />
        <StatCard
          label="Donaties dit jaar"
          value={dataLoading ? "…" : formatEuro(donationYearTotal ?? 0)}
          hint={
            dataLoading
              ? undefined
              : `${formatEuro(donationMonthTotal ?? 0)} deze maand`
          }
        />
      </section>

      {/* Recent members */}
      <Card>
        <CardContent className="p-6">
          <div className="flex justify-between items-center mb-5">
            <div>
              <div className="text-[11px] font-bold text-muted-foreground tracking-widest uppercase">
                Recent toegevoegd
              </div>
              <h2 className="font-serif text-2xl font-normal text-foreground mt-1">
                Laatste leden
              </h2>
            </div>
            <Link
              href="/members"
              className="text-[13px] font-medium no-underline"
              style={{ color: "var(--accent-dark)" }}
            >
              Alle leden →
            </Link>
          </div>

          {dataLoading ? (
            <p className="text-muted-foreground py-5">Laden...</p>
          ) : recent.length === 0 ? (
            <div className="py-8 text-center">
              <p className="text-muted-foreground mb-4">Nog geen leden.</p>
              <Link
                href="/members"
                className="inline-block px-4 py-2 rounded-[7px] text-sm font-medium text-white no-underline"
                style={{ background: "var(--accent)" }}
              >
                Voeg je eerste lid toe
              </Link>
            </div>
          ) : (
            <ul className="list-none">
              {recent.map((m, i) => (
                <li
                  key={m.id}
                  className={`flex justify-between items-center py-3.5 ${
                    i === 0 ? "" : "border-t border-border"
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <MemberAvatar name={displayName(m)} />
                    <div>
                      <div className="font-medium text-sm text-foreground">
                        {displayName(m)}
                      </div>
                      <div className="text-[13px] text-muted-foreground">
                        {m.email ?? "—"}
                      </div>
                    </div>
                  </div>
                  <div className="text-[13px] text-muted-foreground">
                    {new Date(m.created_at).toLocaleDateString("nl-NL")}
                  </div>
                </li>
              ))}
            </ul>
          )}
        </CardContent>
      </Card>
    </AppShell>
  );
}

function StatCard({
  label,
  value,
  hint,
}: {
  label: string;
  value: string;
  hint?: string;
}) {
  return (
    <Card>
      <CardContent className="p-6">
        <div className="text-[11px] font-bold text-muted-foreground tracking-widest uppercase">
          {label}
        </div>
        <div className="font-serif text-[40px] font-normal text-foreground mt-1 leading-none">
          {value}
        </div>
        {hint && (
          <div className="text-[12px] text-muted-foreground mt-1.5">{hint}</div>
        )}
      </CardContent>
    </Card>
  );
}

function MemberAvatar({ name }: { name: string }) {
  const initial = name.trim().charAt(0).toUpperCase() || "?";
  return (
    <div
      className="w-9 h-9 rounded-full flex items-center justify-center font-semibold text-sm shrink-0"
      style={{
        background: "var(--accent-light)",
        color: "var(--accent-dark)",
      }}
    >
      {initial}
    </div>
  );
}

function formatEuro(n: number) {
  return n.toLocaleString("nl-NL", {
    style: "currency",
    currency: "EUR",
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  });
}
```

- [ ] **Step 2: Verify TypeScript**

```bash
npx tsc --noEmit
```

Expected: no errors.

- [ ] **Step 3: Commit**

```bash
git add src/app/dashboard/page.tsx
git commit -m "feat: restyle dashboard with shadcn Card components"
```

---

## Task 9: Add 3 placeholder pages

**Files:**
- Create: `src/app/ondernemers/page.tsx`
- Create: `src/app/toezeggingen/page.tsx`
- Create: `src/app/evenementen/page.tsx`

Each shows a DM Serif title and a "Komt binnenkort" Card. Use AppShell.

- [ ] **Step 1: Create `src/app/ondernemers/page.tsx`**

```tsx
import AppShell from "../components/AppShell";
import { Card, CardContent } from "@/components/ui/card";

export default function OndernemersPage() {
  return (
    <AppShell>
      <h1 className="font-serif text-4xl font-normal text-foreground mb-8">
        Ondernemers
      </h1>
      <Card className="max-w-md">
        <CardContent className="p-8 text-center">
          <p className="text-muted-foreground">Komt binnenkort</p>
        </CardContent>
      </Card>
    </AppShell>
  );
}
```

- [ ] **Step 2: Create `src/app/toezeggingen/page.tsx`**

```tsx
import AppShell from "../components/AppShell";
import { Card, CardContent } from "@/components/ui/card";

export default function ToezeggingenPage() {
  return (
    <AppShell>
      <h1 className="font-serif text-4xl font-normal text-foreground mb-8">
        Toezeggingen
      </h1>
      <Card className="max-w-md">
        <CardContent className="p-8 text-center">
          <p className="text-muted-foreground">Komt binnenkort</p>
        </CardContent>
      </Card>
    </AppShell>
  );
}
```

- [ ] **Step 3: Create `src/app/evenementen/page.tsx`**

```tsx
import AppShell from "../components/AppShell";
import { Card, CardContent } from "@/components/ui/card";

export default function EvenementenPage() {
  return (
    <AppShell>
      <h1 className="font-serif text-4xl font-normal text-foreground mb-8">
        Evenementen
      </h1>
      <Card className="max-w-md">
        <CardContent className="p-8 text-center">
          <p className="text-muted-foreground">Komt binnenkort</p>
        </CardContent>
      </Card>
    </AppShell>
  );
}
```

- [ ] **Step 4: Verify TypeScript**

```bash
npx tsc --noEmit
```

Expected: no errors.

- [ ] **Step 5: Commit**

```bash
git add src/app/ondernemers/ src/app/toezeggingen/ src/app/evenementen/
git commit -m "feat: add placeholder pages for ondernemers, toezeggingen, evenementen"
```

---

## Task 10: Delete Modal.tsx + final build verification

**Files:**
- Delete: `src/app/components/Modal.tsx`

Modal.tsx is no longer imported anywhere (members/page.tsx and donations/page.tsx were both updated in Tasks 6 and 7 to use shadcn Dialog instead). This task verifies that and deletes the file.

- [ ] **Step 1: Confirm no remaining imports of Modal**

```bash
grep -r "from.*Modal" src/app/
```

Expected output: empty (no matches). If any file still imports Modal, update it to use shadcn Dialog before proceeding.

- [ ] **Step 2: Delete Modal.tsx**

```bash
rm src/app/components/Modal.tsx
```

- [ ] **Step 3: Run full production build**

```bash
npm run build
```

Expected: build completes with no TypeScript errors or compilation failures. Ignore any ESLint warnings — only TypeScript/compilation errors are a blocker.

- [ ] **Step 4: Verify checklist**

After build passes, confirm:
1. ✅ `npm run build` passes with no TypeScript errors
2. ✅ Login page: centered card, lock icon, DM Serif "Inloggen" heading, show/hide password toggle
3. ✅ Sidebar: shows all 6 nav items; active item has green accent background
4. ✅ Members table: shadcn Table renders with Badge status chips (green/grey/yellow/red)
5. ✅ Donations table: stat Cards at top, Table for list
6. ✅ Add/edit modals open and close correctly via shadcn Dialog
7. ✅ Placeholder pages at /ondernemers, /toezeggingen, /evenementen show "Komt binnenkort"
8. ✅ DM Serif Display renders in headings, DM Sans in body text

- [ ] **Step 5: Final commit**

```bash
git add -A
git commit -m "feat: delete Modal.tsx after migrating all call sites to shadcn Dialog"
```
