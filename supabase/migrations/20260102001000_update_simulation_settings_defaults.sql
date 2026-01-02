alter table public.simulation_settings
  alter column start_offset_months set default 0,
  alter column end_age set default 100,
  alter column pension_amount_single set default 65000,
  alter column pension_amount_spouse set default 130000,
  alter column mortgage_transaction_cost_rate set default 1.03,
  alter column real_estate_tax_rate set default 0.014,
  alter column real_estate_evaluation_rate set default 0.7;
