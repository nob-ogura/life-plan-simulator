import { getCurrentYearMonth, toRequiredYearMonth, toYearMonth } from "@/lib/year-month";
import {
  type SimulationAsset,
  type SimulationChild,
  type SimulationExpense,
  type SimulationIncomeStream,
  type SimulationInput,
  type SimulationLifeEvent,
  type SimulationMortgage,
  type SimulationProfile,
  type SimulationRental,
  type SimulationSettings,
  simulateLifePlan,
} from "@/shared/domain/simulation";
import type { Tables } from "@/types/supabase";

import type { GetDashboardSimulationResponse } from "./response";

export type GetDashboardSimulationQuery = { userId: string };

type DashboardSimulationInputs = {
  profile: Tables<"profiles"> | null;
  simulationSettings: Tables<"simulation_settings"> | null;
  children: Array<Tables<"children">>;
  incomeStreams: Array<Tables<"income_streams">>;
  expenses: Array<Tables<"expenses">>;
  rentals: Array<Tables<"rentals">>;
  assets: Array<Tables<"assets">>;
  mortgages: Array<Tables<"mortgages">>;
  lifeEvents: Array<Tables<"life_events">>;
};

export type GetDashboardSimulationRepository = {
  fetch: (query: GetDashboardSimulationQuery) => Promise<DashboardSimulationInputs>;
};

const toSimulationProfile = (profile: Tables<"profiles">): SimulationProfile => ({
  birth_year: profile.birth_year,
  birth_month: profile.birth_month,
  spouse_birth_year: profile.spouse_birth_year,
  spouse_birth_month: profile.spouse_birth_month,
  pension_start_age: profile.pension_start_age,
});

const toSimulationSettings = (settings: Tables<"simulation_settings">): SimulationSettings => ({
  start_offset_months: settings.start_offset_months,
  end_age: settings.end_age,
  pension_amount_single: settings.pension_amount_single,
  pension_amount_spouse: settings.pension_amount_spouse,
  mortgage_transaction_cost_rate: settings.mortgage_transaction_cost_rate,
  real_estate_tax_rate: settings.real_estate_tax_rate,
  real_estate_evaluation_rate: settings.real_estate_evaluation_rate,
});

const toSimulationChild = (child: Tables<"children">): SimulationChild => ({
  birth_year_month: toYearMonth(child.birth_year_month),
  due_year_month: toYearMonth(child.due_year_month),
});

const toSimulationIncomeStream = (stream: Tables<"income_streams">): SimulationIncomeStream => ({
  take_home_monthly: stream.take_home_monthly,
  bonus_months: stream.bonus_months ?? [],
  bonus_amount: stream.bonus_amount,
  change_year_month: toYearMonth(stream.change_year_month),
  bonus_amount_after: stream.bonus_amount_after,
  raise_rate: stream.raise_rate,
  start_year_month: toRequiredYearMonth(stream.start_year_month),
  end_year_month: toYearMonth(stream.end_year_month),
});

const toSimulationExpense = (expense: Tables<"expenses">): SimulationExpense => ({
  amount_monthly: expense.amount_monthly,
  inflation_rate: expense.inflation_rate,
  category: expense.category,
  start_year_month: toRequiredYearMonth(expense.start_year_month),
  end_year_month: toYearMonth(expense.end_year_month),
});

const toSimulationRental = (rental: Tables<"rentals">): SimulationRental => ({
  id: rental.id,
  rent_monthly: rental.rent_monthly,
  start_year_month: toRequiredYearMonth(rental.start_year_month),
  end_year_month: toYearMonth(rental.end_year_month),
});

const toSimulationAsset = (asset: Tables<"assets">): SimulationAsset => ({
  cash_balance: asset.cash_balance,
  investment_balance: asset.investment_balance,
  return_rate: asset.return_rate,
});

const toSimulationMortgage = (mortgage: Tables<"mortgages">): SimulationMortgage => ({
  principal: mortgage.principal,
  annual_rate: mortgage.annual_rate,
  years: mortgage.years,
  start_year_month: toRequiredYearMonth(mortgage.start_year_month),
  building_price: mortgage.building_price,
  land_price: mortgage.land_price,
  down_payment: mortgage.down_payment,
});

const toSimulationLifeEvent = (event: Tables<"life_events">): SimulationLifeEvent => ({
  amount: event.amount,
  year_month: toRequiredYearMonth(event.year_month),
  repeat_interval_years: event.repeat_interval_years,
  stop_after_occurrences: event.stop_after_occurrences,
  category: event.category,
  auto_toggle_key: event.auto_toggle_key,
  building_price: event.building_price,
  land_price: event.land_price,
  down_payment: event.down_payment,
});

const hasRequiredProfile = (profile: Tables<"profiles"> | null): profile is Tables<"profiles"> =>
  Boolean(profile && profile.birth_year != null && profile.birth_month != null);

const buildSimulationInput = (
  data: DashboardSimulationInputs,
  currentYearMonth: string,
): SimulationInput | null => {
  if (!hasRequiredProfile(data.profile) || data.simulationSettings == null) {
    return null;
  }

  return {
    currentYearMonth,
    profiles: toSimulationProfile(data.profile),
    simulationSettings: toSimulationSettings(data.simulationSettings),
    children: data.children.map(toSimulationChild),
    incomeStreams: data.incomeStreams.map(toSimulationIncomeStream),
    expenses: data.expenses.map(toSimulationExpense),
    rentals: data.rentals.map(toSimulationRental),
    assets: data.assets.map(toSimulationAsset),
    mortgages: data.mortgages.map(toSimulationMortgage),
    lifeEvents: data.lifeEvents.map(toSimulationLifeEvent),
  };
};

export class GetDashboardSimulationQueryHandler {
  constructor(private readonly repository: GetDashboardSimulationRepository) {}

  async execute(query: GetDashboardSimulationQuery): Promise<GetDashboardSimulationResponse> {
    const data = await this.repository.fetch(query);
    const currentYearMonth = getCurrentYearMonth();
    const input = buildSimulationInput(data, currentYearMonth);
    if (!input) {
      return { result: null };
    }

    const result = simulateLifePlan(input);
    return { result };
  }
}
