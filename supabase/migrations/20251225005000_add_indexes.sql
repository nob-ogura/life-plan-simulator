create index if not exists idx_children_user_id
  on public.children using btree (user_id);

create index if not exists idx_income_streams_user_id
  on public.income_streams using btree (user_id);

create index if not exists idx_expenses_user_id
  on public.expenses using btree (user_id);

create index if not exists idx_rentals_user_id
  on public.rentals using btree (user_id);

create index if not exists idx_assets_user_id
  on public.assets using btree (user_id);

create index if not exists idx_mortgages_user_id
  on public.mortgages using btree (user_id);

create index if not exists idx_life_events_user_id
  on public.life_events using btree (user_id);

create index if not exists idx_life_events_year_month
  on public.life_events using btree (year_month);
