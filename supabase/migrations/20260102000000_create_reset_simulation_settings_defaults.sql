create or replace function public.reset_simulation_settings_defaults()
returns public.simulation_settings
language plpgsql
security definer
set search_path = public
as $$
declare
  updated_row public.simulation_settings;
begin
  update public.simulation_settings
  set
    start_offset_months = default,
    end_age = default,
    mortgage_transaction_cost_rate = default,
    real_estate_tax_rate = default,
    real_estate_evaluation_rate = default,
    updated_at = now()
  where user_id = auth.uid()
  returning * into updated_row;

  if updated_row is null then
    raise exception 'simulation_settings not found';
  end if;

  return updated_row;
end;
$$;
