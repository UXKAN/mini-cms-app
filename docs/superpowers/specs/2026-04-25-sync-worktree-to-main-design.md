# Design: Sync worktree to main

**Date:** 2026-04-25  
**Status:** Approved

## Goal

Squash-merge the `claude/optimistic-shaw-41c85e` worktree branch into `main` as a single clean commit, push to GitHub, and let Vercel auto-deploy.

## Context

All work so far (members CRUD, donations, CSV import, AppShell layout, organizations, onboarding, live dashboard) lives in the worktree branch and has never been merged to main. The production Supabase database already has all required tables applied (`members`, `donations`, `imports`, `import_rows`, `organizations`, `organization_members`), so no migration step is needed.

## Steps

1. Switch to `main` branch
2. Run `git merge --squash claude/optimistic-shaw-41c85e`
3. Commit with message: `"build out members, donations, imports, and live dashboard"`
4. Push to `origin/main`
5. Wait for Vercel to deploy (~1-2 min)
6. Verify the live URL loads correctly

## What lands on main

- Members page with full CRUD (add, edit, delete, status chips)
- Donations page with stats (yearly total, all-time, count)
- CSV import flow with staging and commit/rollback
- AppShell layout with sidebar navigation
- Organizations and onboarding pages
- Live dashboard (replaces the old iframe prototype)
- All lib files: types, supabase client, auth hook, org context

## What stays untouched

- The worktree branch `claude/optimistic-shaw-41c85e` is kept as a backup
- No force pushes, no history rewrites on remote

## Verification

After Vercel deploys: open the live URL, log in, confirm the dashboard, members, and donations pages load with real data from Supabase.
