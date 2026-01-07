import type {
  SimulationAsset,
  SimulationChild,
  SimulationExpense,
  SimulationIncomeStream,
  SimulationLifeEvent,
  SimulationMortgage,
  SimulationProfile,
  SimulationRental,
  SimulationSettings,
} from "@/shared/domain/simulation";
import { YearMonth } from "@/shared/domain/value-objects/YearMonth";
import type { Tables } from "@/types/supabase";

export const toSimulationProfile = (profile: Tables<"profiles">): SimulationProfile => ({
  birth_year: profile.birth_year,
  birth_month: profile.birth_month,
  spouse_birth_year: profile.spouse_birth_year,
  spouse_birth_month: profile.spouse_birth_month,
  pension_start_age: profile.pension_start_age,
});

export const toSimulationSettings = (
  settings: Tables<"simulation_settings">,
): SimulationSettings => ({
  start_offset_months: settings.start_offset_months,
  end_age: settings.end_age,
  pension_amount_single: settings.pension_amount_single,
  pension_amount_spouse: settings.pension_amount_spouse,
  mortgage_transaction_cost_rate: settings.mortgage_transaction_cost_rate,
  real_estate_tax_rate: settings.real_estate_tax_rate,
  real_estate_evaluation_rate: settings.real_estate_evaluation_rate,
});

export const toSimulationChild = (child: Tables<"children">): SimulationChild => ({
  birth_year_month: child.birth_year_month
    ? YearMonth.toYearMonthStringFromInput(child.birth_year_month)
    : null,
  due_year_month: child.due_year_month
    ? YearMonth.toYearMonthStringFromInput(child.due_year_month)
    : null,
});

export const toSimulationIncomeStream = (
  stream: Tables<"income_streams">,
): SimulationIncomeStream => ({
  take_home_monthly: stream.take_home_monthly,
  bonus_months: stream.bonus_months ?? [],
  bonus_amount: stream.bonus_amount,
  change_year_month: stream.change_year_month
    ? YearMonth.toYearMonthStringFromInput(stream.change_year_month)
    : null,
  bonus_amount_after: stream.bonus_amount_after,
  raise_rate: stream.raise_rate,
  start_year_month: YearMonth.toYearMonthStringFromInput(stream.start_year_month),
  end_year_month: stream.end_year_month
    ? YearMonth.toYearMonthStringFromInput(stream.end_year_month)
    : null,
});

export const toSimulationExpense = (expense: Tables<"expenses">): SimulationExpense => ({
  amount_monthly: expense.amount_monthly,
  inflation_rate: expense.inflation_rate,
  category: expense.category,
  start_year_month: YearMonth.toYearMonthStringFromInput(expense.start_year_month),
  end_year_month: expense.end_year_month
    ? YearMonth.toYearMonthStringFromInput(expense.end_year_month)
    : null,
});

export const toSimulationRental = (rental: Tables<"rentals">): SimulationRental => ({
  id: rental.id,
  rent_monthly: rental.rent_monthly,
  start_year_month: YearMonth.toYearMonthStringFromInput(rental.start_year_month),
  end_year_month: rental.end_year_month
    ? YearMonth.toYearMonthStringFromInput(rental.end_year_month)
    : null,
});

export const toSimulationAsset = (asset: Tables<"assets">): SimulationAsset => ({
  cash_balance: asset.cash_balance,
  investment_balance: asset.investment_balance,
  return_rate: asset.return_rate,
});

export const toSimulationMortgage = (mortgage: Tables<"mortgages">): SimulationMortgage => ({
  principal: mortgage.principal,
  annual_rate: mortgage.annual_rate,
  years: mortgage.years,
  start_year_month: YearMonth.toYearMonthStringFromInput(mortgage.start_year_month),
  building_price: mortgage.building_price,
  land_price: mortgage.land_price,
  down_payment: mortgage.down_payment,
});

export const toSimulationLifeEvent = (event: Tables<"life_events">): SimulationLifeEvent => ({
  amount: event.amount,
  year_month: YearMonth.toYearMonthStringFromInput(event.year_month),
  repeat_interval_years: event.repeat_interval_years,
  stop_after_age: event.stop_after_age,
  stop_after_occurrences: event.stop_after_occurrences,
  category: event.category,
  auto_toggle_key: event.auto_toggle_key,
  building_price: event.building_price,
  land_price: event.land_price,
  down_payment: event.down_payment,
});
