-- Run this once in the Supabase SQL editor.
-- Phase 2 of the CRM build-out: backing tables for the design's new pages.
--   - events       → Evenementen page
--   - promises     → Toezeggingen page
--   - members.tags + members.spaarpot + members.donor_type
--                  → Ondernemers page (business donor specifics)
-- Safe to re-run; guarded with `if not exists` and `do $$ ... $$`.

-- ---------------------------------------------------------------------------
-- 1. members: add donor type, sponsor tags, spaarpot toggle
-- ---------------------------------------------------------------------------

alter table public.members
  add column if not exists donor_type text not null default 'particulier';

do $$
begin
  if not exists (
    select 1 from pg_constraint
    where conname = 'members_donor_type_check'
  ) then
    alter table public.members
      add constraint members_donor_type_check
      check (donor_type in ('particulier','ondernemer'));
  end if;
end $$;

-- Sponsor / project labels for ondernemers (e.g. ['Ramadan','Bouw']).
alter table public.members
  add column if not exists tags text[] not null default '{}';

-- Whether the ondernemer keeps a "spaarpot" with us.
alter table public.members
  add column if not exists spaarpot boolean not null default false;

create index if not exists members_donor_type_idx on public.members(donor_type);

-- ---------------------------------------------------------------------------
-- 2. events table — Evenementen page
-- ---------------------------------------------------------------------------

create table if not exists public.events (
  id uuid primary key default gen_random_uuid(),
  org_id uuid not null references public.organizations(id) on delete cascade,
  user_id uuid references auth.users(id) on delete set null,
  titel text not null,
  datum date not null,
  type text not null default 'algemeen' check (type in ('religieus','fundraising','algemeen')),
  beschrijving text,
  created_at timestamptz not null default now()
);

create index if not exists events_org_id_datum_idx on public.events(org_id, datum);

alter table public.events enable row level security;

drop policy if exists "events_select_org" on public.events;
drop policy if exists "events_insert_org" on public.events;
drop policy if exists "events_update_org" on public.events;
drop policy if exists "events_delete_org" on public.events;

create policy "events_select_org" on public.events for select
  using (public.is_org_member(org_id));
create policy "events_insert_org" on public.events for insert
  with check (public.is_org_member(org_id));
create policy "events_update_org" on public.events for update
  using (public.is_org_member(org_id))
  with check (public.is_org_member(org_id));
create policy "events_delete_org" on public.events for delete
  using (public.is_org_member(org_id));

-- ---------------------------------------------------------------------------
-- 3. promises table — Toezeggingen page
-- ---------------------------------------------------------------------------

create table if not exists public.promises (
  id uuid primary key default gen_random_uuid(),
  org_id uuid not null references public.organizations(id) on delete cascade,
  user_id uuid references auth.users(id) on delete set null,
  member_id uuid references public.members(id) on delete set null,
  -- naam mag los staan: een toezegging kan ook van een niet-lid zijn
  naam text not null,
  bedrag numeric(10,2) not null,
  type text not null default 'cash' check (type in ('cash','online','goud')),
  wanneer text not null default 'maand' check (wanneer in ('week','maand','jaar')),
  datum date,
  status text not null default 'open' check (status in ('open','voldaan')),
  notes text,
  created_at timestamptz not null default now(),
  voldaan_at timestamptz
);

create index if not exists promises_org_id_status_idx on public.promises(org_id, status);
create index if not exists promises_org_id_datum_idx on public.promises(org_id, datum);
create index if not exists promises_member_id_idx on public.promises(member_id);

alter table public.promises enable row level security;

drop policy if exists "promises_select_org" on public.promises;
drop policy if exists "promises_insert_org" on public.promises;
drop policy if exists "promises_update_org" on public.promises;
drop policy if exists "promises_delete_org" on public.promises;

create policy "promises_select_org" on public.promises for select
  using (public.is_org_member(org_id));
create policy "promises_insert_org" on public.promises for insert
  with check (public.is_org_member(org_id));
create policy "promises_update_org" on public.promises for update
  using (public.is_org_member(org_id))
  with check (public.is_org_member(org_id));
create policy "promises_delete_org" on public.promises for delete
  using (public.is_org_member(org_id));
