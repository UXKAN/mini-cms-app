-- 011_imports_entity_type_align_with_spec.sql
--
-- Doel: lijn `imports.entity_type` uit met datamodel-spec v2 (`docs/superpowers/specs/2026-05-02-datamodel-design.md`).
-- Was: ('members','payments') — 'payments' was een legacy-waarde die nooit door de code is geset.
-- Wordt: ('members','donations','pledges').
--
-- Veiligheid: `imports`-tabel is leeg op productie (geverifieerd 2026-05-04 via
-- `select entity_type, count(*) from public.imports group by entity_type;` → 0 rijen).
-- Geen data-migratie nodig.

alter table public.imports
  drop constraint if exists imports_entity_type_check;

alter table public.imports
  add constraint imports_entity_type_check
  check (entity_type in ('members','donations','pledges'));
