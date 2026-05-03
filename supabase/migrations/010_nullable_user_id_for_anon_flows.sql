-- Run once in the Supabase SQL editor.
-- Maakt user_id nullable op members en donations zodat anon/server-side
-- inserts (bv. uit /gift formulier via service-role key) mogelijk zijn
-- zonder een fake "system" user_id te hoeven gebruiken.
--
-- RLS-policies in migration 003 zijn al puur org-gebaseerd (is_org_member),
-- niet user_id-gebaseerd, dus deze wijziging breekt geen bestaande policies.
-- De FK-referentie naar auth.users(id) blijft staan (nullable FK is geldig).

alter table public.members
  alter column user_id drop not null;

alter table public.donations
  alter column user_id drop not null;
