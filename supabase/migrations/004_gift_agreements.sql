-- Run once in the Supabase SQL editor.
-- Creates the `gift_agreements` table for public ANBI gift submissions
-- via the standalone /gift route.
--
-- Public bezoekers (anon) kunnen records aanmaken; alleen ingelogde
-- gebruikers (penningmeester via Supabase Studio) kunnen ze lezen.

create extension if not exists pgcrypto;

create table if not exists public.gift_agreements (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid references public.organizations(id) on delete set null,
  reference_code text generated always as (upper(substring(id::text from 1 for 6))) stored,

  type text not null check (type in ('periodieke', 'eenmalige')),

  schenker_naam text not null,
  schenker_geboortedatum date not null,
  schenker_telefoon text not null,
  schenker_adres text not null,
  schenker_postcode_woonplaats text not null,
  schenker_land text not null,
  schenker_email text not null,

  bedrag_per_maand numeric(10,2) check (bedrag_per_maand is null or bedrag_per_maand > 0),
  startdatum date,
  bedrag_eenmalig numeric(10,2) check (bedrag_eenmalig is null or bedrag_eenmalig > 0),

  akkoord_overeenkomst boolean not null default false,
  akkoord_at timestamptz,

  iban text not null,
  rekeninghouder text not null,

  ondertekening_plaats text not null,
  ondertekening_datum date not null,
  ondertekening_naam text not null,
  ondertekening_handtekening_png text not null,

  created_at timestamptz not null default now()
);

create index if not exists gift_agreements_organization_id_idx
  on public.gift_agreements(organization_id);
create index if not exists gift_agreements_created_at_idx
  on public.gift_agreements(created_at desc);
create index if not exists gift_agreements_email_idx
  on public.gift_agreements(schenker_email);
create index if not exists gift_agreements_reference_code_idx
  on public.gift_agreements(reference_code);

alter table public.gift_agreements enable row level security;

drop policy if exists "anon can submit a gift agreement" on public.gift_agreements;
create policy "anon can submit a gift agreement"
  on public.gift_agreements for insert
  to anon, authenticated
  with check (akkoord_overeenkomst = true);

drop policy if exists "authenticated users can read gift agreements" on public.gift_agreements;
create policy "authenticated users can read gift agreements"
  on public.gift_agreements for select
  to authenticated
  using (true);
