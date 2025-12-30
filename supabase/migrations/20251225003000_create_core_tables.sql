create table if not exists public.children (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  label text not null,
  birth_year_month date,
  due_year_month date,
  note text
);

create table if not exists public.income_streams (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  label text not null,
  take_home_monthly numeric(12, 2) not null,
  bonus_months integer[] not null default '{}',
  bonus_amount numeric(12, 2) not null,
  change_year_month date,
  bonus_amount_after numeric(12, 2),
  raise_rate numeric(12, 4) not null default 0.01,
  start_year_month date not null,
  end_year_month date
);

create table if not exists public.expenses (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  label text not null,
  amount_monthly numeric(12, 2) not null,
  inflation_rate numeric(12, 4) not null default 0.0,
  category text not null,
  start_year_month date not null,
  end_year_month date
);

create table if not exists public.rentals (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  rent_monthly numeric(12, 2) not null,
  start_year_month date not null,
  end_year_month date
);

create table if not exists public.assets (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  cash_balance numeric(12, 2) not null,
  investment_balance numeric(12, 2) not null,
  return_rate numeric(12, 4) not null default 0.03
);

create table if not exists public.mortgages (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  principal numeric(12, 2) not null,
  annual_rate numeric(12, 4) not null default 0.015,
  years integer not null,
  start_year_month date not null,
  building_price numeric(12, 2) not null,
  land_price numeric(12, 2) not null,
  down_payment numeric(12, 2) not null
);

create table if not exists public.life_events (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  label text not null,
  amount numeric(12, 2) not null,
  year_month date not null,
  repeat_interval_years integer,
  stop_after_age integer,
  stop_after_occurrences integer,
  category text not null,
  auto_toggle_key text,
  building_price numeric(12, 2),
  land_price numeric(12, 2),
  down_payment numeric(12, 2)
);
