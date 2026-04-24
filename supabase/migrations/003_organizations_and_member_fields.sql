-- Run this once in the Supabase SQL editor.
-- Phase 1 of the CRM refocus: per-organization tenancy + extended member fields
-- + import audit tables. Safe to re-run; guarded with `if not exists` and
-- idempotent backfill.

-- ---------------------------------------------------------------------------
-- 1. Organizations + admins
-- ---------------------------------------------------------------------------

create table if not exists public.organizations (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  rsin text,
  created_at timestamptz not null default now()
);

create table if not exists public.organization_members (
  org_id uuid not null references public.organizations(id) on delete cascade,
  user_id uuid not null references auth.users(id) on delete cascade,
  role text not null default 'owner' check (role in ('owner','admin')),
  created_at timestamptz not null default now(),
  primary key (org_id, user_id)
);

create index if not exists organization_members_user_id_idx
  on public.organization_members(user_id);

-- Helper: is the current auth user a member of the given org?
create or replace function public.is_org_member(target_org uuid)
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1 from public.organization_members
    where org_id = target_org and user_id = auth.uid()
  );
$$;

-- ---------------------------------------------------------------------------
-- 2. Extend `members` with org_id + full field set
-- ---------------------------------------------------------------------------

alter table public.members add column if not exists org_id uuid references public.organizations(id) on delete cascade;
alter table public.members add column if not exists first_name text;
alter table public.members add column if not exists last_name text;
alter table public.members add column if not exists address text;
alter table public.members add column if not exists postcode text;
alter table public.members add column if not exists city text;
alter table public.members add column if not exists iban text;
alter table public.members add column if not exists membership_type text;
alter table public.members add column if not exists monthly_amount numeric(10,2);
alter table public.members add column if not exists start_date date;
alter table public.members add column if not exists status text default 'active';
alter table public.members add column if not exists last_import_id uuid;

do $$
begin
  if not exists (
    select 1 from pg_constraint
    where conname = 'members_status_check'
  ) then
    alter table public.members
      add constraint members_status_check
      check (status in ('active','inactive','prospect','cancelled'));
  end if;
end $$;

create index if not exists members_org_id_idx on public.members(org_id);
create index if not exists members_iban_idx on public.members(iban);
create index if not exists members_email_idx on public.members(email);
create index if not exists members_last_import_id_idx on public.members(last_import_id);

-- ---------------------------------------------------------------------------
-- 3. Extend `donations` with org_id
-- ---------------------------------------------------------------------------

alter table public.donations add column if not exists org_id uuid references public.organizations(id) on delete cascade;
create index if not exists donations_org_id_idx on public.donations(org_id);

-- ---------------------------------------------------------------------------
-- 4. `imports` and `import_rows` audit tables
-- ---------------------------------------------------------------------------

create table if not exists public.imports (
  id uuid primary key default gen_random_uuid(),
  org_id uuid not null references public.organizations(id) on delete cascade,
  user_id uuid not null references auth.users(id) on delete set null,
  entity_type text not null check (entity_type in ('members','payments')),
  source text not null default 'csv',
  file_name text,
  row_count int not null default 0,
  inserted_count int not null default 0,
  updated_count int not null default 0,
  skipped_count int not null default 0,
  error_count int not null default 0,
  status text not null default 'pending' check (status in ('pending','committed','rolled_back')),
  created_at timestamptz not null default now(),
  committed_at timestamptz
);

create index if not exists imports_org_id_created_at_idx on public.imports(org_id, created_at desc);

-- Add the FK on members.last_import_id now that `imports` exists.
do $$
begin
  if not exists (
    select 1 from pg_constraint
    where conname = 'members_last_import_id_fkey'
  ) then
    alter table public.members
      add constraint members_last_import_id_fkey
      foreign key (last_import_id) references public.imports(id) on delete set null;
  end if;
end $$;

create table if not exists public.import_rows (
  id uuid primary key default gen_random_uuid(),
  import_id uuid not null references public.imports(id) on delete cascade,
  row_number int not null,
  raw jsonb not null,
  mapped jsonb,
  action text not null check (action in ('insert','update','skip','error')),
  target_id uuid,
  reason text,
  created_at timestamptz not null default now()
);

create index if not exists import_rows_import_id_idx on public.import_rows(import_id);

-- ---------------------------------------------------------------------------
-- 5. Backfill: give every existing auth user a private org and stamp rows
-- ---------------------------------------------------------------------------

do $$
declare
  r record;
  new_org_id uuid;
begin
  for r in
    select distinct user_id from public.members where org_id is null
    union
    select distinct user_id from public.donations where org_id is null
  loop
    -- If this user is already in an org, reuse the first one.
    select om.org_id into new_org_id
    from public.organization_members om
    where om.user_id = r.user_id
    order by om.created_at asc
    limit 1;

    if new_org_id is null then
      insert into public.organizations (name) values ('Mijn organisatie')
        returning id into new_org_id;
      insert into public.organization_members (org_id, user_id, role)
        values (new_org_id, r.user_id, 'owner');
    end if;

    update public.members
      set org_id = new_org_id
      where user_id = r.user_id and org_id is null;
    update public.donations
      set org_id = new_org_id
      where user_id = r.user_id and org_id is null;
  end loop;
end $$;

-- ---------------------------------------------------------------------------
-- 6. Rewrite RLS: scope by org membership instead of raw user_id
-- ---------------------------------------------------------------------------

alter table public.organizations enable row level security;
alter table public.organization_members enable row level security;
alter table public.imports enable row level security;
alter table public.import_rows enable row level security;

-- Drop old per-user policies on members + donations (they still exist from 001/002).
drop policy if exists "members_select_own" on public.members;
drop policy if exists "members_insert_own" on public.members;
drop policy if exists "members_update_own" on public.members;
drop policy if exists "members_delete_own" on public.members;

drop policy if exists "donations_select_own" on public.donations;
drop policy if exists "donations_insert_own" on public.donations;
drop policy if exists "donations_update_own" on public.donations;
drop policy if exists "donations_delete_own" on public.donations;

-- Drop any prior versions of the new policies so re-running is safe.
drop policy if exists "members_select_org" on public.members;
drop policy if exists "members_insert_org" on public.members;
drop policy if exists "members_update_org" on public.members;
drop policy if exists "members_delete_org" on public.members;

drop policy if exists "donations_select_org" on public.donations;
drop policy if exists "donations_insert_org" on public.donations;
drop policy if exists "donations_update_org" on public.donations;
drop policy if exists "donations_delete_org" on public.donations;

drop policy if exists "orgs_select_member" on public.organizations;
drop policy if exists "orgs_insert_self" on public.organizations;
drop policy if exists "orgs_update_member" on public.organizations;

drop policy if exists "org_members_select_own_rows" on public.organization_members;
drop policy if exists "org_members_insert_bootstrap" on public.organization_members;
drop policy if exists "org_members_delete_self" on public.organization_members;

drop policy if exists "imports_select_org" on public.imports;
drop policy if exists "imports_insert_org" on public.imports;
drop policy if exists "imports_update_org" on public.imports;
drop policy if exists "imports_delete_org" on public.imports;

drop policy if exists "import_rows_select_via_import" on public.import_rows;
drop policy if exists "import_rows_insert_via_import" on public.import_rows;
drop policy if exists "import_rows_delete_via_import" on public.import_rows;

-- members: scoped by org membership.
create policy "members_select_org" on public.members for select
  using (public.is_org_member(org_id));
create policy "members_insert_org" on public.members for insert
  with check (public.is_org_member(org_id));
create policy "members_update_org" on public.members for update
  using (public.is_org_member(org_id))
  with check (public.is_org_member(org_id));
create policy "members_delete_org" on public.members for delete
  using (public.is_org_member(org_id));

-- donations: same pattern.
create policy "donations_select_org" on public.donations for select
  using (public.is_org_member(org_id));
create policy "donations_insert_org" on public.donations for insert
  with check (public.is_org_member(org_id));
create policy "donations_update_org" on public.donations for update
  using (public.is_org_member(org_id))
  with check (public.is_org_member(org_id));
create policy "donations_delete_org" on public.donations for delete
  using (public.is_org_member(org_id));

-- organizations: visible to members, anyone can create one (becomes their org
-- on first login), only members can update.
create policy "orgs_select_member" on public.organizations for select
  using (public.is_org_member(id));
create policy "orgs_insert_self" on public.organizations for insert
  with check (auth.uid() is not null);
create policy "orgs_update_member" on public.organizations for update
  using (public.is_org_member(id))
  with check (public.is_org_member(id));

-- organization_members: a user sees their own memberships. Insert allowed when
-- the actor is either claiming the org (no existing members yet) or is already
-- a member of it (invite flow).
create policy "org_members_select_own_rows" on public.organization_members for select
  using (user_id = auth.uid() or public.is_org_member(org_id));
create policy "org_members_insert_bootstrap" on public.organization_members for insert
  with check (
    user_id = auth.uid()
    and (
      not exists (select 1 from public.organization_members where org_id = organization_members.org_id)
      or public.is_org_member(org_id)
    )
  );
create policy "org_members_delete_self" on public.organization_members for delete
  using (user_id = auth.uid());

-- imports: scoped by org.
create policy "imports_select_org" on public.imports for select
  using (public.is_org_member(org_id));
create policy "imports_insert_org" on public.imports for insert
  with check (public.is_org_member(org_id) and user_id = auth.uid());
create policy "imports_update_org" on public.imports for update
  using (public.is_org_member(org_id))
  with check (public.is_org_member(org_id));
create policy "imports_delete_org" on public.imports for delete
  using (public.is_org_member(org_id));

-- import_rows: scoped via their parent import.
create policy "import_rows_select_via_import" on public.import_rows for select
  using (exists (
    select 1 from public.imports i
    where i.id = import_rows.import_id and public.is_org_member(i.org_id)
  ));
create policy "import_rows_insert_via_import" on public.import_rows for insert
  with check (exists (
    select 1 from public.imports i
    where i.id = import_rows.import_id and public.is_org_member(i.org_id)
  ));
create policy "import_rows_delete_via_import" on public.import_rows for delete
  using (exists (
    select 1 from public.imports i
    where i.id = import_rows.import_id and public.is_org_member(i.org_id)
  ));

-- ---------------------------------------------------------------------------
-- 7. Now that every row has an org_id, enforce NOT NULL.
-- ---------------------------------------------------------------------------

do $$
begin
  if exists (select 1 from public.members where org_id is null) then
    raise notice 'members.org_id still has nulls; skipping NOT NULL enforcement';
  else
    alter table public.members alter column org_id set not null;
  end if;

  if exists (select 1 from public.donations where org_id is null) then
    raise notice 'donations.org_id still has nulls; skipping NOT NULL enforcement';
  else
    alter table public.donations alter column org_id set not null;
  end if;
end $$;
