-- Run once in the Supabase SQL editor.
-- Voegt aan `gift_agreements` toe:
--   * payment_method_intent / payment_status / paid_at  (alleen relevant voor type=eenmalige)
--   * wants_membership                                  (alleen relevant voor type=periodieke)
--   * agreement_status                                  (cyclus van de overeenkomst zelf)
--   * member_id                                         (gevuld bij periodieke + wants_membership=true)
--
-- Bestaande rijen krijgen agreement_status = 'signed'. Andere nieuwe kolommen
-- blijven NULL voor bestaande rijen — backwards compatible.

alter table public.gift_agreements
  add column if not exists payment_method_intent text
    check (payment_method_intent is null
        or payment_method_intent in ('cash','bank','online'));

alter table public.gift_agreements
  add column if not exists payment_status text
    check (payment_status is null
        or payment_status in ('unpaid','partial','paid'));

alter table public.gift_agreements
  add column if not exists paid_at timestamptz;

alter table public.gift_agreements
  add column if not exists wants_membership boolean;

alter table public.gift_agreements
  add column if not exists agreement_status text
    default 'signed'
    check (agreement_status in ('signed','lapsed','withdrawn','completed'));

alter table public.gift_agreements
  add column if not exists member_id uuid
    references public.members(id) on delete set null;

-- Backfill bestaande rijen: agreement_status = 'signed' (defensief, default doet dit al).
update public.gift_agreements
  set agreement_status = 'signed'
  where agreement_status is null;

create index if not exists gift_agreements_member_id_idx
  on public.gift_agreements(member_id);
create index if not exists gift_agreements_agreement_status_idx
  on public.gift_agreements(agreement_status);
create index if not exists gift_agreements_payment_status_idx
  on public.gift_agreements(payment_status);
