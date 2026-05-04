-- 012_gift_agreements_purpose.sql
--
-- Doel: voeg `purpose`-kolom toe aan `gift_agreements` voor het "Omschrijving"-veld
-- dat schenkers bij eenmalige donaties via /gift kunnen invullen.
-- Spec: docs/superpowers/specs/2026-05-04-toezeggingen-pijler-design.md
--
-- Nullable, geen CHECK-constraint, vrij tekstveld. Bestaande rijen krijgen NULL.

alter table public.gift_agreements
  add column if not exists purpose text;
