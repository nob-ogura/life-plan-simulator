begin;

drop index if exists public.idx_mortgages_user_id_target_rental_id;

alter table public.mortgages
  drop column if exists target_rental_id;

alter table public.life_events
  drop column if exists target_rental_id;

commit;
