-- Run once in the Supabase SQL editor.
-- Splits gift_agreements.schenker_postcode_woonplaats into two separate
-- columns so each maps to a distinct browser autofill token
-- (postal-code + address-level2).
--
-- Old column blijft voorlopig staan (nullable) voor data-preservering.
-- Drop het pas nadat je in Supabase Studio hebt gecontroleerd dat de
-- backfill goed is gegaan voor de bestaande rijen:
--
--   alter table public.gift_agreements drop column schenker_postcode_woonplaats;

alter table public.gift_agreements
  add column if not exists schenker_postcode text,
  add column if not exists schenker_woonplaats text;

-- Best-effort backfill: NL postcode is 4 cijfers + spatie (optioneel) + 2 letters.
-- Voor andere formaten valt 'woonplaats' terug op de hele oude waarde.
update public.gift_agreements
set
  schenker_postcode = nullif(trim((regexp_match(schenker_postcode_woonplaats, '\d{4}\s?[A-Za-z]{2}'))[1]), ''),
  schenker_woonplaats = nullif(trim(regexp_replace(schenker_postcode_woonplaats, '^\s*\d{4}\s?[A-Za-z]{2}\s*', '', 'i')), '')
where schenker_postcode_woonplaats is not null
  and (schenker_postcode is null or schenker_woonplaats is null);

-- Old column nullable maken zodat nieuwe inserts 'm kunnen overslaan.
alter table public.gift_agreements
  alter column schenker_postcode_woonplaats drop not null;
