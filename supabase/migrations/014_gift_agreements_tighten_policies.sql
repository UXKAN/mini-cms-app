-- Run once in the Supabase SQL editor.
-- Twee policy-fixes uit de code/security-review van 2026-07-02:
--
-- 1. De anon-INSERT-policy uit migration 004 was een achterdeurtje: iedereen
--    met de publieke anon key kon via PostgREST direct rijen inserten in
--    gift_agreements (met willekeurige organization_id, zonder Zod-validatie).
--    De echte flow loopt via de server action met de service-role key
--    (src/app/gift/actions.ts), die RLS sowieso bypasst — de policy is dus
--    overbodig en alleen maar risico.
--
-- 2. gift_agreements had wél SELECT- en INSERT-policies maar géén
--    UPDATE-policy. De betaal-matching in /toezeggingen doet een client-side
--    update van payment_status/paid_at; zonder policy matcht die 0 rijen en
--    geeft PostgREST géén error — de akte bleef stil "openstaand".

drop policy if exists "anon can submit a gift agreement"
  on public.gift_agreements;

drop policy if exists "gift_agreements_update_org"
  on public.gift_agreements;

create policy "gift_agreements_update_org"
  on public.gift_agreements for update
  to authenticated
  using (
    organization_id is not null
    and public.is_org_member(organization_id)
  )
  with check (
    organization_id is not null
    and public.is_org_member(organization_id)
  );
