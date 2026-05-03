-- Run once in the Supabase SQL editor.
-- Vervangt de open authenticated-SELECT-policy op gift_agreements door een
-- org-scoped policy, gebruikmakend van public.is_org_member() uit migration 003.
-- Voorbereiding op multi-tenant SaaS-sprong (zie decisions.md 2026-05-01).

drop policy if exists "authenticated users can read gift agreements"
  on public.gift_agreements;

drop policy if exists "gift_agreements_select_org"
  on public.gift_agreements;

create policy "gift_agreements_select_org"
  on public.gift_agreements for select
  to authenticated
  using (
    organization_id is not null
    and public.is_org_member(organization_id)
  );
