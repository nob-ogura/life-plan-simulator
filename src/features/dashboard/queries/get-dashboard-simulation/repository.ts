import type { SupabaseClient } from "@supabase/supabase-js";

import { scopeByUserId } from "@/features/inputs/shared/infrastructure/user-owned-supabase";
import {
  throwIfSupabaseError,
  unwrapSupabaseData,
} from "@/shared/cross-cutting/infrastructure/supabase-result";
import type { Database } from "@/types/supabase";

import type { GetDashboardSimulationQuery, GetDashboardSimulationRepository } from "./handler";

export class SupabaseGetDashboardSimulationRepository implements GetDashboardSimulationRepository {
  constructor(private readonly client: SupabaseClient<Database>) {}

  async fetch(query: GetDashboardSimulationQuery) {
    const { userId } = query;

    const assetsPromise = scopeByUserId(this.client.from("assets").select(), userId).order("id", {
      ascending: true,
    });
    const childrenPromise = scopeByUserId(this.client.from("children").select(), userId).order(
      "id",
      { ascending: true },
    );
    const expensesPromise = scopeByUserId(this.client.from("expenses").select(), userId).order(
      "id",
      { ascending: true },
    );
    const incomeStreamsPromise = scopeByUserId(
      this.client.from("income_streams").select(),
      userId,
    ).order("id", { ascending: true });
    const lifeEventsPromise = scopeByUserId(this.client.from("life_events").select(), userId).order(
      "id",
      { ascending: true },
    );
    const mortgagesPromise = scopeByUserId(this.client.from("mortgages").select(), userId).order(
      "id",
      { ascending: true },
    );
    const rentalsPromise = scopeByUserId(this.client.from("rentals").select(), userId).order("id", {
      ascending: true,
    });
    const profilePromise = scopeByUserId(
      this.client.from("profiles").select(),
      userId,
    ).maybeSingle();
    const settingsPromise = scopeByUserId(this.client.from("simulation_settings").select(), userId)
      .order("created_at", { ascending: false })
      .limit(1)
      .maybeSingle();

    const [
      assetsResult,
      childrenResult,
      expensesResult,
      incomeStreamsResult,
      lifeEventsResult,
      mortgagesResult,
      rentalsResult,
      profileResult,
      settingsResult,
    ] = await Promise.all([
      assetsPromise,
      childrenPromise,
      expensesPromise,
      incomeStreamsPromise,
      lifeEventsPromise,
      mortgagesPromise,
      rentalsPromise,
      profilePromise,
      settingsPromise,
    ]);

    const assets = unwrapSupabaseData(assetsResult.data, assetsResult.error);
    const children = unwrapSupabaseData(childrenResult.data, childrenResult.error);
    const expenses = unwrapSupabaseData(expensesResult.data, expensesResult.error);
    const incomeStreams = unwrapSupabaseData(incomeStreamsResult.data, incomeStreamsResult.error);
    const lifeEvents = unwrapSupabaseData(lifeEventsResult.data, lifeEventsResult.error);
    const mortgages = unwrapSupabaseData(mortgagesResult.data, mortgagesResult.error);
    const rentals = unwrapSupabaseData(rentalsResult.data, rentalsResult.error);

    throwIfSupabaseError(profileResult.error);
    throwIfSupabaseError(settingsResult.error);

    return {
      assets,
      children,
      expenses,
      incomeStreams,
      lifeEvents,
      mortgages,
      rentals,
      profile: profileResult.data ?? null,
      simulationSettings: settingsResult.data ?? null,
    };
  }
}
