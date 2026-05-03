-- Run once in the Supabase SQL editor.
-- Voegt matching-kolommen toe aan `donations` zodat een betaling kan
-- verwijzen naar de oorspronkelijke belofte (pledge of gift_agreement),
-- en zodat MT940/Stripe-imports kunnen dedup'en op external_ref.
--
-- Alle nieuwe kolommen zijn nullable — bestaande rijen blijven werken.

alter table public.donations
  add column if not exists pledge_id uuid
    references public.pledges(id) on delete set null;

alter table public.donations
  add column if not exists gift_agreement_id uuid
    references public.gift_agreements(id) on delete set null;

alter table public.donations
  add column if not exists signature_png text;

alter table public.donations
  add column if not exists receipt_photo_url text;

alter table public.donations
  add column if not exists source text
    check (source is null or source in ('manual','csv','mt940','stripe','gift_form','cash_form'));

alter table public.donations
  add column if not exists external_ref text;

create index if not exists donations_pledge_id_idx
  on public.donations(pledge_id);
create index if not exists donations_gift_agreement_id_idx
  on public.donations(gift_agreement_id);
create index if not exists donations_source_idx
  on public.donations(source);

-- Partial unique index voor MT940/Stripe-dedup: dezelfde transactie
-- (org_id + source + external_ref) mag maar 1x voorkomen.
-- WHERE-clause maakt 'm partial: bestaande rijen zonder external_ref vallen erbuiten.
create unique index if not exists donations_external_ref_unique
  on public.donations(org_id, source, external_ref)
  where external_ref is not null;
