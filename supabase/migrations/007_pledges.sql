-- Run once in the Supabase SQL editor.
-- Maakt de `pledges` tabel voor mondelinge / e-mail / na-evenement toezeggingen.
-- Aparte tabel naast `gift_agreements`: pledges hebben geen handtekening of
-- ANBI-velden, gift_agreements wel. Beide zijn beloftes; donations is de
-- enige bron voor "ontvangen geld" (zie spec 2026-05-02-datamodel-design.md).

create table if not exists public.pledges (
  id uuid primary key default gen_random_uuid(),
  org_id uuid not null references public.organizations(id) on delete cascade,
  member_id uuid references public.members(id) on delete set null,

  amount numeric(10,2) not null check (amount > 0),
  purpose text,
  pledged_at date,
  deadline date,

  status text not null default 'open'
    check (status in ('open','partial','paid','cancelled')),
  source text
    check (source is null or source in ('verbal','email','event','form','other')),
  notes text,

  created_at timestamptz not null default now()
);

create index if not exists pledges_org_id_idx on public.pledges(org_id);
create index if not exists pledges_member_id_idx on public.pledges(member_id);
create index if not exists pledges_status_idx on public.pledges(status);

alter table public.pledges enable row level security;

drop policy if exists "pledges_select_org" on public.pledges;
drop policy if exists "pledges_insert_org" on public.pledges;
drop policy if exists "pledges_update_org" on public.pledges;
drop policy if exists "pledges_delete_org" on public.pledges;

create policy "pledges_select_org" on public.pledges for select
  using (public.is_org_member(org_id));
create policy "pledges_insert_org" on public.pledges for insert
  with check (public.is_org_member(org_id));
create policy "pledges_update_org" on public.pledges for update
  using (public.is_org_member(org_id))
  with check (public.is_org_member(org_id));
create policy "pledges_delete_org" on public.pledges for delete
  using (public.is_org_member(org_id));
