create table if not exists public.profiles (
  user_id uuid primary key references auth.users(id) on delete cascade,
  birth_year integer,
  birth_month integer check (birth_month between 1 and 12),
  spouse_birth_year integer,
  spouse_birth_month integer check (spouse_birth_month between 1 and 12),
  pension_start_age integer not null default 65,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.simulation_settings (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  start_offset_months integer not null default 0,
  end_age integer not null default 100,
  pension_amount_single numeric(12, 2) not null default 65000,
  pension_amount_spouse numeric(12, 2) not null default 130000,
  mortgage_transaction_cost_rate numeric(12, 4) not null default 1.03,
  real_estate_tax_rate numeric(12, 4) not null default 0.014,
  real_estate_evaluation_rate numeric(12, 4) not null default 0.7,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (user_id)
);
