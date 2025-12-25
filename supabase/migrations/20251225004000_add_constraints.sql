alter table public.children
  add constraint children_birth_year_month_month_start
    check (birth_year_month is null or date_part('day', birth_year_month) = 1),
  add constraint children_due_year_month_month_start
    check (due_year_month is null or date_part('day', due_year_month) = 1),
  add constraint children_birth_or_due_required
    check (birth_year_month is not null or due_year_month is not null);

alter table public.income_streams
  add constraint income_streams_change_year_month_month_start
    check (change_year_month is null or date_part('day', change_year_month) = 1),
  add constraint income_streams_start_year_month_month_start
    check (date_part('day', start_year_month) = 1),
  add constraint income_streams_end_year_month_month_start
    check (end_year_month is null or date_part('day', end_year_month) = 1),
  add constraint income_streams_take_home_non_negative
    check (take_home_monthly >= 0),
  add constraint income_streams_bonus_amount_non_negative
    check (bonus_amount >= 0),
  add constraint income_streams_bonus_amount_after_non_negative
    check (bonus_amount_after is null or bonus_amount_after >= 0);

alter table public.expenses
  add constraint expenses_start_year_month_month_start
    check (date_part('day', start_year_month) = 1),
  add constraint expenses_end_year_month_month_start
    check (end_year_month is null or date_part('day', end_year_month) = 1),
  add constraint expenses_amount_monthly_non_negative
    check (amount_monthly >= 0);

alter table public.rentals
  add constraint rentals_start_year_month_month_start
    check (date_part('day', start_year_month) = 1),
  add constraint rentals_end_year_month_month_start
    check (end_year_month is null or date_part('day', end_year_month) = 1),
  add constraint rentals_rent_monthly_non_negative
    check (rent_monthly >= 0);

alter table public.assets
  add constraint assets_cash_balance_non_negative
    check (cash_balance >= 0),
  add constraint assets_investment_balance_non_negative
    check (investment_balance >= 0);

alter table public.mortgages
  add constraint mortgages_start_year_month_month_start
    check (date_part('day', start_year_month) = 1),
  add constraint mortgages_principal_non_negative
    check (principal >= 0),
  add constraint mortgages_building_price_non_negative
    check (building_price >= 0),
  add constraint mortgages_land_price_non_negative
    check (land_price >= 0),
  add constraint mortgages_down_payment_non_negative
    check (down_payment >= 0),
  add constraint mortgages_years_positive
    check (years > 0);

alter table public.life_events
  add constraint life_events_year_month_month_start
    check (date_part('day', year_month) = 1),
  add constraint life_events_amount_non_negative
    check (amount >= 0),
  add constraint life_events_repeat_interval_years_positive
    check (repeat_interval_years is null or repeat_interval_years > 0);
