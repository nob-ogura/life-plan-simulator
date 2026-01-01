import { getCurrentYearMonth } from "@/lib/year-month";
import { type SimulationInput, simulateLifePlan } from "@/shared/domain/simulation";
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
