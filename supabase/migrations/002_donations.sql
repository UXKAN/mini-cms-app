-- Run this once in the Supabase SQL editor.
-- Creates the `donations` table with Row Level Security so each user
-- only sees and edits their own donations. Optionally linked to a member.

create table if not exists public.donations (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  member_id uuid references public.members(id) on delete set null,
  amount numeric(10,2) not null check (amount >= 0),
  currency text not null default 'EUR',
  method text not null default 'bank' check (method in ('cash','bank','online','other')),
  donated_at date not null default (now() at time zone 'utc')::date,
  notes text,
  created_at timestamptz not null default now()
);

create index if not exists donations_user_id_idx on public.donations(user_id);
create index if not exists donations_member_id_idx on public.donations(member_id);
create index if not exists donations_donated_at_idx on public.donations(donated_at desc);

alter table public.donations enable row level security;

create policy "donations_select_own"
  on public.donations for select
  using (auth.uid() = user_id);

create policy "donations_insert_own"
  on public.donations for insert
  with check (auth.uid() = user_id);

create policy "donations_update_own"
  on public.donations for update
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

create policy "donations_delete_own"
  on public.donations for delete
  using (auth.uid() = user_id);
