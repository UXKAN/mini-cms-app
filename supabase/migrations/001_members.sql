-- Run this once in the Supabase SQL editor.
-- Creates the `members` table with Row Level Security so each user
-- only sees and edits their own rows.

create table if not exists public.members (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  name text not null,
  email text,
  phone text,
  notes text,
  created_at timestamptz not null default now()
);

create index if not exists members_user_id_idx on public.members(user_id);

alter table public.members enable row level security;

create policy "members_select_own"
  on public.members for select
  using (auth.uid() = user_id);

create policy "members_insert_own"
  on public.members for insert
  with check (auth.uid() = user_id);

create policy "members_update_own"
  on public.members for update
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

create policy "members_delete_own"
  on public.members for delete
  using (auth.uid() = user_id);
