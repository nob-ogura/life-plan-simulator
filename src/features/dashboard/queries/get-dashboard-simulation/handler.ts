import {
  type SimulationInput,
  type SimulationInputDomain,
  simulateLifePlan,
} from "@/shared/domain/simulation";
import { YearMonth } from "@/shared/domain/value-objects/YearMonth";
import type { Tables } from "@/types/supabase";

import {
  toSimulationAsset,
  toSimulationChild,
  toSimulationExpense,
  toSimulationIncomeStream,
  toSimulationLifeEvent,
  toSimulationMortgage,
  toSimulationProfile,
  toSimulationRental,
  toSimulationSettings,
} from "./mapper";
import type {
  DashboardSimulationMonthlyResult,
  DashboardSimulationResult,
  GetDashboardSimulationResponse,
} from "./response";

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

const hasRequiredProfile = (profile: Tables<"profiles"> | null): profile is Tables<"profiles"> =>
  Boolean(profile && profile.birth_year != null && profile.birth_month != null);

const buildSimulationInput = (
  data: DashboardSimulationInputs,
  currentYearMonth: YearMonth,
): SimulationInputDomain | null => {
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

const toYearMonthString = (value: YearMonth | null): string | null =>
  value ? value.toString() : null;

const toSimulationInputDto = (input: SimulationInputDomain): SimulationInput => ({
  currentYearMonth: input.currentYearMonth.toString(),
  profiles: input.profiles,
  simulationSettings: input.simulationSettings,
  children: input.children.map((child) => ({
    birth_year_month: toYearMonthString(child.birth_year_month),
    due_year_month: toYearMonthString(child.due_year_month),
  })),
  incomeStreams: input.incomeStreams.map((stream) => ({
    ...stream,
    change_year_month: toYearMonthString(stream.change_year_month),
    start_year_month: stream.start_year_month.toString(),
    end_year_month: toYearMonthString(stream.end_year_month),
  })),
  expenses: input.expenses.map((expense) => ({
    ...expense,
    start_year_month: expense.start_year_month.toString(),
    end_year_month: toYearMonthString(expense.end_year_month),
  })),
  rentals: input.rentals.map((rental) => ({
    ...rental,
    start_year_month: rental.start_year_month.toString(),
    end_year_month: toYearMonthString(rental.end_year_month),
  })),
  assets: input.assets,
  mortgages: input.mortgages.map((mortgage) => ({
    ...mortgage,
    start_year_month: mortgage.start_year_month.toString(),
  })),
  lifeEvents: input.lifeEvents.map((event) => ({
    ...event,
    year_month: event.year_month.toString(),
  })),
});

export class GetDashboardSimulationQueryHandler {
  constructor(private readonly repository: GetDashboardSimulationRepository) {}

  async execute(query: GetDashboardSimulationQuery): Promise<GetDashboardSimulationResponse> {
    const data = await this.repository.fetch(query);
    const currentYearMonth = YearMonth.now();
    const input = buildSimulationInput(data, currentYearMonth);
    if (!input) {
      return { result: null };
    }

    const result = simulateLifePlan(toSimulationInputDto(input));
    return { result: toDashboardSimulationResult(result) };
  }
}

const toDashboardSimulationResult = (
  result: ReturnType<typeof simulateLifePlan>,
): DashboardSimulationResult => ({
  depletionYearMonth: result.depletionYearMonth,
  months: result.months.map<DashboardSimulationMonthlyResult>((month) => ({
    yearMonth: month.yearMonth,
    age: month.age,
    spouseAge: month.spouseAge,
    totalIncome: month.totalIncome.toNumber(),
    totalExpense: month.totalExpense.toNumber(),
    eventAmount: month.eventAmount.toNumber(),
    netCashflow: month.netCashflow.toNumber(),
    cashBalance: month.cashBalance.toNumber(),
    investmentBalance: month.investmentBalance.toNumber(),
    totalBalance: month.totalBalance.toNumber(),
  })),
});
