-- 013_gift_agreements_iban_optional.sql
--
-- Doel: iban + rekeninghouder optioneel maken op gift_agreements omdat bij
-- scenario "eenmalig + contant" geen IBAN-machtiging nodig is. De gebruiker
-- (schenker) kiest voor cash, dan vervalt sectie 4 (Betaalgegevens) in het /gift
-- formulier.
--
-- Was: iban text not null, rekeninghouder text not null.
-- Wordt: beide nullable. Bestaande rijen behouden hun waarde.

alter table public.gift_agreements
  alter column iban drop not null;

alter table public.gift_agreements
  alter column rekeninghouder drop not null;
