# Sync Worktree to Main Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Get all built features (members, donations, CSV import, AppShell, organizations) committed and merged into main so GitHub and Vercel are up to date.

**Architecture:** Two-phase operation. Phase 1: commit all uncommitted work in the worktree branch. Phase 2: squash-merge the worktree branch into main and push.

**Tech Stack:** Git, Next.js (App Router), Supabase, Vercel (auto-deploys from main)

---

## Context

The worktree branch `claude/optimistic-shaw-41c85e` has 4 committed changes AND a large number of uncommitted/untracked files. Everything must be committed to the branch first before merging into main.

**Uncommitted modified files in worktree:**
- `package.json`, `package-lock.json`
- `src/app/components/AppShell.tsx`
- `src/app/dashboard/page.tsx`
- `src/app/donations/page.tsx`
- `src/app/globals.css`
- `src/app/lib/types.ts`
- `src/app/members/import/page.tsx`
- `src/app/members/page.tsx`

**Untracked new files in worktree:**
- `src/app/components/ImportStepper.tsx`
- `src/app/components/MemberImporter.tsx`
- `src/app/components/Modal.tsx`
- `src/app/imports/` (directory)
- `src/app/lib/importMapping.ts`
- `src/app/lib/importMatching.ts`
- `src/app/lib/org.ts`
- `src/app/lib/orgContext.ts`
- `src/app/onboarding/` (directory)
- `supabase/migrations/003_organizations_and_member_fields.sql`

**Do NOT commit:**
- `designs/` — old prototype files
- `public/formulier.html` — old prototype file

---

## Task 1: Commit all uncommitted work in the worktree

**Working directory:** `/Users/uxkan/Desktop/mini-cms-app/.claude/worktrees/optimistic-shaw-41c85e`

- [ ] **Step 1: Verify you are in the worktree and on the right branch**

```bash
cd /Users/uxkan/Desktop/mini-cms-app/.claude/worktrees/optimistic-shaw-41c85e
git status
```

Expected: `On branch claude/optimistic-shaw-41c85e` with the modified and untracked files listed above.

- [ ] **Step 2: Stage all the modified source files**

```bash
git add package.json package-lock.json
git add src/app/components/AppShell.tsx
git add src/app/dashboard/page.tsx
git add src/app/donations/page.tsx
git add src/app/globals.css
git add src/app/lib/types.ts
git add src/app/members/import/page.tsx
git add src/app/members/page.tsx
```

- [ ] **Step 3: Stage all the new files and directories**

```bash
git add src/app/components/ImportStepper.tsx
git add src/app/components/MemberImporter.tsx
git add src/app/components/Modal.tsx
git add src/app/imports/
git add src/app/lib/importMapping.ts
git add src/app/lib/importMatching.ts
git add src/app/lib/org.ts
git add src/app/lib/orgContext.ts
git add src/app/onboarding/
git add supabase/migrations/003_organizations_and_member_fields.sql
```

- [ ] **Step 4: Verify staged files — confirm designs/ and formulier.html are NOT staged**

```bash
git status
```

Expected: All the files above are under "Changes to be committed". `designs/` and `public/formulier.html` should still appear under "Untracked files" — that's correct, leave them there.

- [ ] **Step 5: Commit**

```bash
git commit -m "complete import flow, organizations, onboarding, and modal components"
```

Expected: commit succeeds, working tree is clean (apart from the intentionally untracked files).

---

## Task 2: Squash-merge into main

**Working directory:** `/Users/uxkan/Desktop/mini-cms-app` (the main worktree, NOT the sub-worktree)

- [ ] **Step 1: Confirm you are on main**

```bash
cd /Users/uxkan/Desktop/mini-cms-app
git status
```

Expected: `On branch main`, clean working tree.

- [ ] **Step 2: Squash-merge the worktree branch**

```bash
git merge --squash claude/optimistic-shaw-41c85e
```

Expected: output ends with `Squash commit -- not updating HEAD`. Git stages all the changes from the worktree branch but does not create a commit yet.

- [ ] **Step 3: Confirm the spec file is still present (safety check)**

```bash
ls docs/superpowers/specs/
```

Expected: `2026-04-25-sync-worktree-to-main-design.md` is listed. The squash should not touch it since it was added to main after the merge base. If it is missing from the staged tree, restore it with `git checkout HEAD -- docs/superpowers/specs/2026-04-25-sync-worktree-to-main-design.md`.

- [ ] **Step 4: Verify staged files look correct**

```bash
git diff --cached --name-status
```

Expected: A mix of `A` (added) and `M` (modified) for all the new pages, components, and lib files. The spec file should NOT appear as deleted.

- [ ] **Step 5: Commit the squash**

```bash
git commit -m "build out members, donations, imports, and live dashboard"
```

Expected: commit succeeds.

- [ ] **Step 6: Check the log**

```bash
git log --oneline -6
```

Expected: your new single commit at the top, followed by the spec commit, followed by the older main commits.

---

## Task 3: Push and verify deployment

- [ ] **Step 1: Push to GitHub**

```bash
git push origin main
```

Expected: push succeeds, no errors.

- [ ] **Step 2: Open Vercel dashboard and watch the deployment**

Go to your Vercel project. A new deployment should trigger automatically within ~30 seconds of the push. Wait for it to show "Ready".

- [ ] **Step 3: Open the live URL and verify**

Visit the production URL. Check:
- Login page loads
- After login, dashboard page loads (not an iframe — real Next.js page)
- `/members` page loads and shows the members table (or empty state)
- `/donations` page loads and shows the donations table (or empty state)

- [ ] **Step 4: Done**

All features are now live on main, GitHub, and Vercel.
